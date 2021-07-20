import {FORM_CSS, MENU_CSS} from './_defs';

import {browser} from 'webextension-polyfill-ts';
import {slugify} from './utils';

/** Class to create menu items within menu. */
export class MenuItem {
  /** Instantiates menu item and appends to DOM. */
  static initItem(parent: HTMLElement, category: string, title: string,
    url: string, bookmarkId: string) {
    const categoryId = slugify(category);
    const menuTitle = <HTMLElement>document.querySelector(`#${categoryId}`);
    let menuContainer: HTMLElement;

    if (menuTitle) {
      menuContainer = <HTMLElement>menuTitle.parentElement?.parentElement;
    } else {
      menuContainer = <HTMLElement>MenuItem.createCategory(
          bookmarkId, categoryId, category);
      parent.appendChild(menuContainer);
    }

    const entryId = slugify(title);
    const entry = MenuItem.createItem(entryId, title, url);
    menuContainer?.appendChild(entry);
  }

  /**
   * Creates category and header DOM elements.
   * @param bookmarkId  numberic ID of bookmark folder
   * @param categoryId  ID for category title header.
   */
  static createCategory(bookmarkId: string, categoryId: string, title: string)
      : HTMLElement {
    const menuTitle = document.createElement('div');
    menuTitle.id = categoryId;
    menuTitle.className = `${MENU_CSS}__title`;
    menuTitle.innerText = title;

    const menuHeader = document.createElement('li');
    menuHeader.className = `${MENU_CSS}__header`;
    menuHeader.appendChild(menuTitle);
    menuHeader.appendChild(MenuItem.createEditTools(title, bookmarkId));

    const menuContainer = document.createElement('ul');
    menuContainer.className = `${MENU_CSS}__divider`;
    menuContainer.appendChild(menuHeader);

    return menuContainer;
  }

  /** Creates container and edit tool buttons. */
  static createEditTools(title: string, bookmarkId: string): HTMLElement {
    const container = document.createElement('div');
    container.classList.add(`${MENU_CSS}__edit-container`);

    [{
      name: 'add',
      icon: 'add',
      title: browser.i18n.getMessage('menuAdd'),
    }, {
      name: 'edit',
      icon: 'edit',
      title: browser.i18n.getMessage('menuEdit'),
    }, {
      name: 'note',
      icon: 'receipt',
      title: browser.i18n.getMessage('menuNote'),
    }, {
      name: 'organize',
      icon: 'bookmark',
      title: browser.i18n.getMessage('menuOrganize'),
    }, {
      name: 'open-tabs',
      icon: 'tab',
      title: browser.i18n.getMessage('menuOpenTabs'),
    }].forEach(param => {
      let item = document.createElement('a');
      item.classList.add(
        `${MENU_CSS}__edit-item`,
        `${MENU_CSS}__${param.name}`,
        'material-icons'
      );
      item.innerText = param.icon;
      item.title = param.title;
      item.dataset.bookmarkId = bookmarkId;
      item.dataset.notesId = slugify(title);
      item.dataset.notesTitle = title;

      container.appendChild(item);
    });

    return container;
  }

  /** Creates MenuItem DOM elements. */
  static createItem(id: string, title: string, url: string): HTMLLIElement {
    const removeItemCheckbox = document.createElement('input');
    removeItemCheckbox.type = 'checkbox';
    removeItemCheckbox.name = id;
    removeItemCheckbox.classList.add(
      `${MENU_CSS}__checkbox`,
      `${FORM_CSS}__input`,
      `${FORM_CSS}__checkbox`,
      `${FORM_CSS}__checkbox--remove`,
      `${FORM_CSS}--hidden`, // hidden initially
    );

    const label = document.createElement('label');
    label.setAttribute('for', id);
    label.innerText = title;

    const li = document.createElement('li');
    li.id = id;
    li.className = `${MENU_CSS}__item`;
    li.dataset['href'] = url;
    li.appendChild(removeItemCheckbox);
    li.appendChild(label);

    return li;
  }
}
