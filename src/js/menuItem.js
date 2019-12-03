const {slugify} = require('utils');


class MenuItem {
  /**
   * Creates category and header DOM elements.
   * @param {String} bookmarkId  numberic ID of bookmark folder
   * @param {String} categoryId  ID for category title header.
   * @param {String} title
   */
  static createCategory(bookmarkId, categoryId, title) {
    if (categoryId && title) {
      const menuTitle = document.createElement('div');
      menuTitle.id = categoryId;
      menuTitle.className = 'menu__title';
      menuTitle.innerText = title;

      const menuHeader = document.createElement('li');
      menuHeader.className = 'menu__header';
      menuHeader.appendChild(menuTitle);
      menuHeader.appendChild(MenuItem.createEditTools(bookmarkId));

      const menuContainer = document.createElement('ul');
      menuContainer.className = 'menu__divider';
      menuContainer.appendChild(menuHeader);

      return menuContainer;
    } else {

      return;
    }
  }

  /**
   * Creates user category edit tools DOM elements.
   * @param {String} bookmarkId  numberic ID of bookmark folder
   */
  static createEditTools(bookmarkId) {
    const add = document.createElement('a');
    add.className = 'menu__add material-icons';
    add.innerText = 'add';
    add.title = 'Add item to group';
    add.dataset.bookmarkId = bookmarkId;

    const edit = document.createElement('a');
    edit.className = 'menu__edit material-icons';
    edit.innerText = 'edit';
    edit.title = 'Remove item from group';
    edit.dataset.bookmarkId = bookmarkId;

    const note = document.createElement('a');
    note.className = 'menu__note material-icons';
    note.innerText = 'receipt'; // 'library_books';
    note.title = 'Add/edit notes';
    note.dataset.bookmarkId = bookmarkId;

    const organize = document.createElement('a');
    organize.className = 'menu__organize material-icons';
    organize.innerText = 'bookmark';
    organize.title = 'Organize within Chrome bookmarks';
    organize.dataset.bookmarkId = bookmarkId;

    const container = document.createElement('div');
    container.className = 'menu__edit-container';
    container.appendChild(add);
    container.appendChild(edit);
    container.appendChild(note);
    container.appendChild(organize);

    return container;
  }

  /**
   * Creates MenuItem DOM elements.
   * @param {String} id  ID for checkbox entry.
   */
  static createEntry(id, title, url) {
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.name = id;
    checkbox.className = 'menu__checkbox';

    const label = document.createElement('label');
    label.setAttribute('for', id);
    label.innerText = title;

    const li = document.createElement('li');
    li.id = id;
    li.className = 'menu__item';
    li.dataset['href'] = url;
    li.appendChild(checkbox);
    li.appendChild(label);

    return li;
  }

  /**
   * Adds entry to DOM
   * @param {HTMLElement} parent.
   * @param {String} category
   * @param {String} title
   * @param {String} url
   * @param {String} bookmarkId
   */
  static addEntry(parent, category, title, url, bookmarkId) {
    const categoryId = slugify(category);
    const menuTitle = document.querySelector(`#${categoryId}`);
    let menuContainer;

    if (menuTitle) {
      menuContainer = menuTitle.parentElement.parentElement;
    } else {
      menuContainer = MenuItem.createCategory(
          bookmarkId, categoryId, category);
      parent.appendChild(menuContainer);
    }

    const entryId = slugify(title);
    const entry = MenuItem.createEntry(entryId, title, url);
    menuContainer.appendChild(entry);
  }

}


module.exports = MenuItem;
