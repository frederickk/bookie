const {slugify} = require('utils');


class Dashboard {
  /**
   * Creates category and header DOM elements. 
   * @param {String} title
   * @param {String} id  ID for category title header.
   */
  static createCategory(id, title) {
    if (id && title) {
      const menuTitle = document.createElement('li');
      menuTitle.id = id;
      menuTitle.className = 'menu__title';
      menuTitle.innerText = title;
      
      const menuHeader = document.createElement('li');
      menuHeader.className = 'menu__header';
      menuHeader.appendChild(menuTitle);
      menuHeader.appendChild(Dashboard.createEditTools());

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
   */
  static createEditTools() {
    const edit = document.createElement('a');
    edit.className = 'menu__edit material-icons';
    edit.innerText = 'edit';

    const add = document.createElement('a');
    add.className = 'menu__add material-icons';
    add.innerText = 'add';

    const container = document.createElement('div');
    container.className = 'menu__edit-container';
    container.appendChild(edit);
    container.appendChild(add);

    return container;
  }

  /** 
   * Creates dashboard item DOM elements.
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
   */
  static addEntry(parent, category, title, url) {
    const categoryId = slugify(category);
    const menuTitle = document.querySelector(`#${categoryId}`);
    let menuContainer;

    if (menuTitle) {
      menuContainer = menuTitle.parentElement.parentElement;
    } else {
      menuContainer = Dashboard.createCategory(categoryId, category);
      parent.appendChild(menuContainer);
    }

    const entryId = slugify(title);
    const entry = Dashboard.createEntry(entryId, title, url);
    menuContainer.appendChild(entry);

  }
}


module.exports = Dashboard;
