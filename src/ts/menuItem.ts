import {slugify} from './utils';

const CSS_PREFIX = 'menu__';

export class MenuItem {
  /**
   * Creates category and header DOM elements.
   * @param bookmarkId  numberic ID of bookmark folder
   * @param categoryId  ID for category title header.
   */
  static createCategory(bookmarkId: string, categoryId: string, title: string)
      : HTMLElement | undefined {
    if (categoryId && title) {
      const menuTitle = document.createElement('div');
      menuTitle.id = categoryId;
      menuTitle.className = `${CSS_PREFIX}title`;
      menuTitle.innerText = title;

      const menuHeader = document.createElement('li');
      menuHeader.className = `${CSS_PREFIX}header`;
      menuHeader.appendChild(menuTitle);
      menuHeader.appendChild(MenuItem.createEditTools(title, bookmarkId));

      const menuContainer = document.createElement('ul');
      menuContainer.className = `${CSS_PREFIX}divider`;
      menuContainer.appendChild(menuHeader);

      return menuContainer;
    } else {
      return;
    }
  }

  /** Creates user category edit tools DOM elements. */
  static createEditTools(title: string, bookmarkId: string): HTMLElement {
    const add = document.createElement('a');
    add.className = `${CSS_PREFIX}add material-icons`;
    add.innerText = 'add';
    add.title = 'Add item to group';
    add.dataset.bookmarkId = bookmarkId;

    const edit = document.createElement('a');
    edit.className = `${CSS_PREFIX}edit material-icons`;
    edit.innerText = 'edit';
    edit.title = 'Remove item from group';
    edit.dataset.bookmarkId = bookmarkId;

    const note = document.createElement('a');
    note.className = `${CSS_PREFIX}note material-icons`;
    note.innerText = 'receipt';
    note.title = 'Add/edit notes';
    note.dataset.bookmarkId = bookmarkId;
    note.dataset.notesId = slugify(title);

    const organize = document.createElement('a');
    organize.className = `${CSS_PREFIX}organize material-icons`;
    organize.innerText = 'bookmark';
    organize.title = 'Organize within Chrome bookmarks';
    organize.dataset.bookmarkId = bookmarkId;

    const openTabs = document.createElement('a');
    openTabs.className = `${CSS_PREFIX}open-tabs material-icons`;
    openTabs.innerText = 'tab';
    openTabs.title = 'Open bookmarks in tab group';
    openTabs.dataset.bookmarkId = bookmarkId;
    openTabs.dataset.title = title;

    const container = document.createElement('div');
    container.className = `${CSS_PREFIX}edit-container`;
    container.appendChild(add);
    container.appendChild(edit);
    container.appendChild(note);
    container.appendChild(organize);
    container.appendChild(openTabs);

    return container;
  }

  /** Creates MenuItem DOM elements. */
  static createEntry(id: string, title: string, url: string): HTMLLIElement {
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.name = id;
    checkbox.className = `${CSS_PREFIX}checkbox`;

    const label = document.createElement('label');
    label.setAttribute('for', id);
    label.innerText = title;

    const li = document.createElement('li');
    li.id = id;
    li.className = `${CSS_PREFIX}item`;
    li.dataset['href'] = url;
    li.appendChild(checkbox);
    li.appendChild(label);

    return li;
  }

  /** Adds entry to DOM. */
  static addEntry(parent: HTMLElement, category: string, title: string,
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
    const entry = MenuItem.createEntry(entryId, title, url);
    menuContainer?.appendChild(entry);
  }
}
