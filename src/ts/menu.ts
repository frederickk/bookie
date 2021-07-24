import {APP_NAME, APP_ID, FORM_CSS, MENU_CSS, MODAL_CSS, MAX_WINDOW_WIDTH} from './_defs';

import {Bookmarks} from './bookmarks';
import {MenuItem} from './menuItem';
import {removeElement} from './utils';
import {Storage} from './storage';
import {Tabs} from './tabs';
import * as Browser from 'webextension-polyfill-ts';

/** Class to build menu within action popup. */
export class Menu {
  private menuEl_ = <HTMLElement>document.querySelector(
      `#${MENU_CSS}__container`);

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
      'title': `${APP_NAME}`,
    })
    .then(result => {
      this.bookmarkFolderId_ = result[0].id;
      // Is this a terrible idea?
      Storage.set(`__${APP_ID}__`, this.bookmarkFolderId_);
      this.populate_();
    }, () => {
      window.alert(`🤷‍♀️ Uh-oh it seems there's no "${APP_NAME}" folder to be found.`);
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
      entries: Browser.Bookmarks.BookmarkTreeNode[], bookmarkId: string) {
    entries.forEach((item) => {
      if(!item.title.startsWith('!')) {
        MenuItem.initItem(
          this.menuEl_,
          category,
          item.title,
          item.url || '',
          bookmarkId
        );
      }
    });
  }

  /** Retrieves remove checkbox elements. */
  private getBookmarkRemoveCheckboxes_(
      parent: Document | HTMLElement = document)
      : NodeListOf<HTMLInputElement> {
    return parent?.querySelectorAll(`.${MENU_CSS}__checkbox`);
  }

  /** Attaches event listeners. */
  private attach_() {
    this.menuEls_ = document.querySelectorAll(`.${MENU_CSS}__item`);
    this.addEls_ = document.querySelectorAll(`.${MENU_CSS}__add`);
    this.editEls_ = document.querySelectorAll(`.${MENU_CSS}__edit`);
    this.noteEls_ = document.querySelectorAll(`.${MENU_CSS}__note`);
    this.organizeEls_ = document.querySelectorAll(`.${MENU_CSS}__organize`);
    this.openTabsEls_ = document.querySelectorAll(`.${MENU_CSS}__open-tabs`);

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
        this.hideBookmarkRemoveCheckboxes_.bind(this));

    const removeCheckboxes = this.getBookmarkRemoveCheckboxes_();
    removeCheckboxes.forEach((checkbox) => {
      checkbox.addEventListener('click',
        this.bookmarkRemoveHandler_.bind(this));
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
        `.${MENU_CSS}__title`);
    if (titleEl?.textContent) {
      categoryInputEl.value = titleEl.textContent.trim();
    }

    Browser.browser.tabs.query({
      currentWindow: true,
      active: true,
    })
    .then(tabs => {
      const tab = tabs[0];

      if (tab.title && tab.url) {
        displayTitleInputEl.value = tab.title;
        urlInputEl.value = tab.url;
      }
    });

    document.querySelector(`#${MODAL_CSS}`)?.classList.toggle(`${MODAL_CSS}--active`);
    event.stopPropagation();

    return;
  }

  /** Triggers edit state of menu item. */
  private editButtonClickHandler_(event: Event) {
    const target = <HTMLElement>event.target;
    const parent = target.parentElement?.parentElement?.parentElement;

    const removeCheckboxes = this.getBookmarkRemoveCheckboxes_(parent!);
    removeCheckboxes.forEach((checkbox) => {
      checkbox.classList.toggle(`${FORM_CSS}--hidden`);
    });

    event.stopPropagation();

    return;
  }

  /** Opens notes window. */
  private noteButtonClickHandler_(event: Event) {
    const target = <HTMLElement>event.target;
    const id = target.dataset.bookmarkId;

    Storage.get('__windowId__')
    // TODO (frederickk): This could be cleaner, perhaps instead of closing
    // whatever window is open, just change the URL of the app tab.
    .then(result => Browser.browser.windows.remove(parseInt(result?.toString())))
    .catch(() => Browser.browser.windows.create({
      focused: true,
      left: MAX_WINDOW_WIDTH + 100,
      top: 0,
      type: 'popup',
      url: `notes.html?bookmarkId=${id}`,
      width: MAX_WINDOW_WIDTH - 100,
    }))
    .then(window => {
      Storage.set('__windowId__', window?.id);
      Storage.set('__windowSessionId__', window?.sessionId);
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
      .then((entries: Browser.Bookmarks.BookmarkTreeNode[]) => {
        const tabPropUrls: Browser.Tabs.CreateCreatePropertiesType[] = [];
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
        tabs.forEach((tab: Browser.Tabs.Tab) => {
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

  /** Hides bookmark remove checkboxes. */
  private hideBookmarkRemoveCheckboxes_() {
    const removeCheckboxes = this.getBookmarkRemoveCheckboxes_();
    removeCheckboxes.forEach((checkbox) => {
      checkbox.classList.add(`${FORM_CSS}--hidden`);
    });
  }

  /** Removes bookmark and removes corresponding menu item. */
  private bookmarkRemoveHandler_(event: Event) {
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
