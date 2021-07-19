import {removeElement, toggleMultiple} from './utils';
import {Bookmarks} from './bookmarks';
import {MenuItem} from './menuItem';
import {Storage} from './storage';

const CSS_PREFIX = 'menu__';

export class Menu {
  private menu_ = <HTMLElement>document.querySelector(`#${CSS_PREFIX}container`);
  private menuItems_?: NodeListOf<HTMLElement>;
  private editItems_?: NodeListOf<HTMLElement>;
  private addItems_?: NodeListOf<HTMLElement>;
  private noteItems_?: NodeListOf<HTMLElement>;
  private organizeItems_?: NodeListOf<HTMLElement>;
  private bookmarkFolderId_!: string;

  constructor() {
    this.init_();
  }

  private init_() {
    Bookmarks.search({
      'title': 'Bookie',
    }, (result) => {
      if (result) {
        this.bookmarkFolderId_ = result[0].id;
        this.populate_();
      } else {
        window.alert(
          `Error: Uh-oh it seems there's no "Bookie" folder to be found.`);
      }
    });
  }

  /** Populates menu with bookmark entries. */
  private populate_() {
    Bookmarks.get(this.bookmarkFolderId_, (items) => {
      items?.forEach((entries) => {
        entries.children?.forEach((entryList) => {
          if (!entryList.title.startsWith('!')) {
            this.append_(entryList.title, entryList.children || [], entryList.id);
          }
        });
      });

      this.attach_();
    });
  }

  /** Appends menu item to menu. */
  private append_(category: string, entries: chrome.bookmarks.BookmarkTreeNode[], bookmarkId: string) {
    entries.forEach((item) => {
      MenuItem.addEntry(
          this.menu_,
          category,
          item.title,
          item.url || '',
          bookmarkId
      );
    });
  }

  /** Attaches event listeners. */
  private attach_() {
    this.menuItems_ = document.querySelectorAll(`.${CSS_PREFIX}item`);
    this.editItems_ = document.querySelectorAll(`.${CSS_PREFIX}edit`);
    this.addItems_ = document.querySelectorAll(`.${CSS_PREFIX}add`);
    this.noteItems_ = document.querySelectorAll(`.${CSS_PREFIX}note`);
    this.organizeItems_ = document.querySelectorAll(`.${CSS_PREFIX}organize`);

    const checkboxes = <NodeListOf<HTMLInputElement>>document.querySelectorAll(`.${CSS_PREFIX}checkbox`);

    this.menuItems_.forEach((item) => {
      item.addEventListener('click', () => {
        this.clickHandler_(item);
      });
    });

    this.editItems_.forEach((item) => {
      item.addEventListener('click', (event: Event) => {
        this.editClickHandler_(event, item);
      });
    });

    this.addItems_.forEach((item) => {
      item.addEventListener('click', (event: Event) => {
        this.addClickHandler_(event, item);
      });
    });

    this.noteItems_.forEach((item) => {
      item.addEventListener('click', (event: Event) => {
        this.noteClickHandler_(event, item);
      });
    });

    this.organizeItems_.forEach((item) => {
      item.addEventListener('click', (event: Event) => {
        this.organizeClickHandler_(event, item);
      });
    });

    document.body.addEventListener('click', () => {
      const checkboxes = <NodeListOf<HTMLInputElement>>document.querySelectorAll(`.${CSS_PREFIX}checkbox`);

      checkboxes.forEach((checkbox) => {
        checkbox.classList.remove(
            'form__input', 'checkbox', 'checkbox--delete',
            `${CSS_PREFIX}checkbox--visible`);
      });
    });

    checkboxes.forEach((item) => {
      item.addEventListener('click', (event: Event) => {
        const parent = <HTMLElement>item.parentElement!;
        const grandParent = <HTMLElement>parent?.parentNode!;

        if (item.checked === true) {
          const label = parent?.querySelector('label');

          Bookmarks.remove(label?.innerText);
          removeElement(parent);
        }
        if (grandParent.childElementCount <= 1) {
          removeElement(grandParent);
        }

        event.stopPropagation();

        return;
      });
    });
  }

  /** Opens URL defined within menu items 'data-href' property. */
  private clickHandler_(item: HTMLElement) {
    window.open(item.dataset['href'], '_blank');
  }

  /** Triggers edit state of menu item. */
  private editClickHandler_(event: Event, item: HTMLElement) {
    const parent = item.parentElement?.parentElement?.parentElement;
    const checkboxes = <NodeListOf<HTMLInputElement>>parent?.querySelectorAll(`.${CSS_PREFIX}checkbox`);

    checkboxes.forEach((checkbox) => {
      toggleMultiple(checkbox,
          `form__input checkbox checkbox--delete ${CSS_PREFIX}checkbox--visible`);
    });

    event.stopPropagation();

    return;
  }

  /** Triggers modal to add active tab as bookmark. */
  private addClickHandler_(event: Event, item: HTMLElement) {
    const categoryInput = <HTMLInputElement>document.querySelector('#category');
    const displayTitleInput = <HTMLInputElement>document.querySelector('#display-title');
    const urlInput = <HTMLInputElement>document.querySelector('#url');

    const titleEl = item.parentNode?.parentNode?.querySelector(`.${CSS_PREFIX}title`);
    if (titleEl?.textContent) {
      categoryInput.value = titleEl.textContent.trim();
    }

    chrome.tabs.query({
      currentWindow: true,
      active: true,
    }, (tabs) => {
      const tab = tabs[0];

      if (tab.title && tab.url) {
        displayTitleInput.value = tab.title;
        urlInput.value = tab.url;
      }
    });

    document.querySelector('#modal')?.classList.toggle('modal--active');
    event.stopPropagation();

    return;
  }

  private noteClickHandler_(event: Event, item: HTMLElement) {
    const bookmarkId = item.dataset.bookmarkId;

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
        url: `notes.html?bookmarkId=${bookmarkId}`,
        width: window.screen.width / 2,
      }, (window) => {
        Storage.set('__windowId__', window?.id);
        Storage.set('__windowSessionId__', window?.sessionId);
      });
    });

    event.stopPropagation();

    return;
  }

  private organizeClickHandler_(event: Event, item: HTMLElement) {
    const bookmarkId = item.dataset.bookmarkId;

    chrome.tabs.create({
      url: `chrome://bookmarks/?id=${bookmarkId}`,
      active: true,
    });

    event.stopPropagation();

    return;
  }
}
