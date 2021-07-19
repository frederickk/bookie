import {removeElement, toggleMultiple} from './utils';
import {Bookmarks} from './bookmarks';
import {MenuItem} from './menuItem';
import {Storage} from './storage';
import {Tabs} from './tabs';

const CSS_PREFIX = 'menu__';

export class Menu {
  private menuEl_ = <HTMLElement>document.querySelector(
      `#${CSS_PREFIX}container`);

  private menuEls_?: NodeListOf<HTMLElement>;
  private editEls_?: NodeListOf<HTMLElement>;
  private addEls_?: NodeListOf<HTMLElement>;
  private noteEls_?: NodeListOf<HTMLElement>;
  private organizeEls_?: NodeListOf<HTMLElement>;
  private openTabsEls_?: NodeListOf<HTMLElement>;

  private bookmarkFolderId_!: string;

  constructor() {
    this.init_();
  }

  private init_() {
    Bookmarks.search({
      'title': 'Bookie',
    })
    .then(result => {
      this.bookmarkFolderId_ = result[0].id;
      // Is this a terrible idea?
      Storage.set(`__bookieId__`, this.bookmarkFolderId_);
      this.populate_();
    }, () => {
      window.alert(`🤷‍♀️ Uh-oh it seems there's no "Bookie" folder to be found.`);
    });
  }

  /** Populates menu with bookmark entries. */
  private populate_() {
    Bookmarks.get(this.bookmarkFolderId_, (items) => {
      items?.forEach((entries) => {
        entries.children?.forEach((entryList) => {
          if (!entryList.title.startsWith('!')) {
            this.append_(
              entryList.title,
              entryList.children || [],
              entryList.id
            );
          }
        });
      });

      this.attach_();
    });
  }

  /** Appends menu item to menu. */
  private append_(category: string,
      entries: chrome.bookmarks.BookmarkTreeNode[], bookmarkId: string) {
    entries.forEach((item) => {
      if(!item.title.startsWith('!')) {
        MenuItem.addEntry(
          this.menuEl_,
          category,
          item.title,
          item.url || '',
          bookmarkId
        );
      }
    });
  }

  /** Retrieves delete checkbox elements. */
  private getBookmarkDeleteCheckboxes_(
      parent: Document | HTMLElement = document)
      : NodeListOf<HTMLInputElement> {
    return parent?.querySelectorAll(`.${CSS_PREFIX}checkbox`);
  }

  /** Attaches event listeners. */
  private attach_() {
    this.menuEls_ = document.querySelectorAll(`.${CSS_PREFIX}item`);
    this.addEls_ = document.querySelectorAll(`.${CSS_PREFIX}add`);
    this.editEls_ = document.querySelectorAll(`.${CSS_PREFIX}edit`);
    this.noteEls_ = document.querySelectorAll(`.${CSS_PREFIX}note`);
    this.organizeEls_ = document.querySelectorAll(`.${CSS_PREFIX}organize`);
    this.openTabsEls_ = document.querySelectorAll(`.${CSS_PREFIX}open-tabs`);

    this.menuEls_.forEach((item) => {
      item.addEventListener('click', this.menuClickHandler_.bind(this));
    });
    this.addEls_.forEach((item) => {
      item.addEventListener('click', this.addButtonClickHandler_.bind(this));
    });
    this.editEls_.forEach((item) => {
      item.addEventListener('click', this.editButtonClickHandler_.bind(this));
    });
    this.noteEls_.forEach((item) => {
      item.addEventListener('click', this.noteButtonClickHandler_.bind(this));
    });
    this.organizeEls_.forEach((item) => {
      item.addEventListener('click',
        this.organizeButtonClickHandler_.bind(this));
    });
    this.openTabsEls_.forEach((item) => {
      item.addEventListener('click',
        this.openTabsButtonClickHandler_.bind(this));
    });

    document.body.addEventListener('click',
        this.hideBookmarkDeleteCheckboxes_.bind(this));

    const deleteCheckboxes = this.getBookmarkDeleteCheckboxes_();
    deleteCheckboxes.forEach((checkbox) => {
      checkbox.addEventListener('click',
        this.bookmarkDeleteHandler_.bind(this));
    });
  }

  /** Opens URL defined within menu items 'data-href' property. */
  private menuClickHandler_(event: Event) {
    const target = <HTMLElement>event.target;
    window.open(target.dataset['href'], '_blank');
  }

  /** Triggers modal to add active tab as bookmark. */
  private addButtonClickHandler_(event: Event) {
    const target = <HTMLElement>event.target;
    const categoryInputEl =
        <HTMLInputElement>document.querySelector('#category');
    const displayTitleInputEl =
        <HTMLInputElement>document.querySelector('#display-title');
    const urlInputEl = <HTMLInputElement>document.querySelector('#url');

    const titleEl = target.parentNode?.parentNode?.querySelector(
        `.${CSS_PREFIX}title`);
    if (titleEl?.textContent) {
      categoryInputEl.value = titleEl.textContent.trim();
    }

    chrome.tabs.query({
      currentWindow: true,
      active: true,
    }, (tabs) => {
      const tab = tabs[0];

      if (tab.title && tab.url) {
        displayTitleInputEl.value = tab.title;
        urlInputEl.value = tab.url;
      }
    });

    document.querySelector('#modal')?.classList.toggle('modal--active');
    event.stopPropagation();

    return;
  }

  /** Triggers edit state of menu item. */
  private editButtonClickHandler_(event: Event) {
    const target = <HTMLElement>event.target;
    const parent = target.parentElement?.parentElement?.parentElement;

    const deleteCheckboxes = this.getBookmarkDeleteCheckboxes_(parent!);
    deleteCheckboxes.forEach((checkbox) => {
      toggleMultiple(checkbox,
        `form__input checkbox checkbox--delete ${CSS_PREFIX}checkbox--visible`);
    });

    event.stopPropagation();

    return;
  }

  /** Opens notes window. */
  private noteButtonClickHandler_(event: Event) {
    const target = <HTMLElement>event.target;
    const id = target.dataset.bookmarkId;

    Storage.get('__windowId__', (result) => {
      // TODO (frederickk): This could be cleaner, perhaps instead of closing
      // whatever window is open, just change the URL of the Bookie tab.
      if (result) {
        chrome.windows.remove(parseInt(result.toString()));
      }

      chrome.windows.create({
        focused: true,
        left: window.screen.width / 2,
        top: 0,
        type: 'popup',
        url: `notes.html?bookmarkId=${id}`,
        width: window.screen.width / 2,
      }, (window) => {
        Storage.set('__windowId__', window?.id);
        Storage.set('__windowSessionId__', window?.sessionId);
      });
    });

    event.stopPropagation();

    return;
  }

  /** Opens Chrome native Bookmarks manager. */
  private organizeButtonClickHandler_(event: Event) {
    const target = <HTMLElement>event.target;
    const id = target.dataset.bookmarkId;

    Tabs.create({
      url: `chrome://bookmarks/?id=${id}`,
      active: true,
    });

    event.stopPropagation();

    return;
  }

  /** Opens all bookmarks within category as tab group. */
  private openTabsButtonClickHandler_(event: Event) {
    const target = <HTMLElement>event.target;
    const id = target.dataset.bookmarkId;

    if (id) {
      Bookmarks.get(id)
      .then((entries: chrome.bookmarks.BookmarkTreeNode[]) => {
        const tabPropUrls: chrome.tabs.CreateProperties[] = [];
        entries[0].children?.forEach(entry => {
          tabPropUrls.push({
            url: entry.url,
          });
        });

        return tabPropUrls;
      })
      .then(urls => Tabs.createMultiple(urls))
      .then(tabs => {
        const tabIds: number[] = [];
        tabs.forEach((tab: chrome.tabs.Tab) => {
          if (tab.id) {
            tabIds.push(tab.id);
          }
        });

        return tabIds;
      })
      .then(ids => Tabs.group(ids, {
        // TODO (frederickk): Update to Manifest V3.
        collapsed: true,
        title: target.dataset.title,
      }));
    }
  }

  /** Hides bookmark delete checkboxes. */
  private hideBookmarkDeleteCheckboxes_() {
    const deleteCheckboxes = this.getBookmarkDeleteCheckboxes_();
    deleteCheckboxes.forEach((checkbox) => {
      checkbox.classList.remove(
        'form__input',
        'checkbox',
        'checkbox--delete',
        `${CSS_PREFIX}checkbox--visible`
      );
    });
  }

  /** Deletes bookmark and removes corresponding menu item. */
  private bookmarkDeleteHandler_(event: Event) {
    const target = <HTMLInputElement>event.target;
    const parent = <HTMLElement>target.parentElement!;
    const grandParent = <HTMLElement>parent?.parentNode!;

    if (target.checked === true) {
      const label = parent?.querySelector('label');
      Bookmarks.remove(label?.innerText);
      removeElement(parent);
    }
    if (grandParent.childElementCount <= 1) {
      removeElement(grandParent);
    }

    event.stopPropagation();

    return;
  }
}
