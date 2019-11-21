const {removeElement, toggleMultiple} = require('utils');
const dashboard = require('dashboard');
const storage = require('storage');
const bookmarks = require('bookmarks');



class Menu {
  constructor() {
    /** @private */
    this.menu_ = document.querySelector('#menu__container');

    /** @private */
    this.menuItems_;

    /** @private */
    this.editItems_;

    /** @private */
    this.addItems_;

    /** @private */
    this.noteItems_;

    /** @private */
    this.organizeItems_;

    /** @private */
    this.bookmarkFolderId_;

    this.init_();
  }

  /**
   * @private
   */
  init_() {
    bookmarks.search({
      'title': 'Bookie'
    }, (result) => {
      if (result.length <= 0) {
        bookmarks.create({
          'parentId': '1', // 1 = Bookmarks Toolbar
          'title': 'Bookie',
        }, (obj) => {
          this.bookmarkFolderId_ = obj.id;
        });
      } else {
        this.bookmarkFolderId_ = result[0].id;
      }

      storage.set('__bookmarkId__', this.bookmarkFolderId_);

      this.populate_();
    });
  }

  /**
   * @private
   */
  populate_() {
    bookmarks.get(this.bookmarkFolderId_, (items) => {
      items.forEach((entries) => {
        entries.children.forEach((entryList) => {
          this.append_(entryList.title, entryList.children, entryList.id);
        });
      });

      // TODO (frederickk): Implement Async/Await.
      this.attach_();
    });
  }

  /**
   * @private
   * @param {String} title
   * @param {Array} entries
   * @param {String} bookmarkId
   */
  append_(category, entries, bookmarkId) {
    entries.forEach((item) => {
      dashboard.addEntry(
        this.menu_,
        category,
        item.title,
        item.url,
        bookmarkId
      );
    });
  }

  /**
   * Attach event listeners
   * @private
   */
  attach_() {
    this.menuItems_ = document.querySelectorAll('.menu__item');
    this.editItems_ = document.querySelectorAll('.menu__edit');
    this.addItems_ = document.querySelectorAll('.menu__add');
    this.noteItems_ = document.querySelectorAll('.menu__note');
    this.organizeItems_ = document.querySelectorAll('.menu__organize');

    this.menuItems_.forEach((item) => {
      item.addEventListener('click', () => {
        this.clickHandler_(item);
      });
    });

    this.editItems_.forEach((item) => {
      item.addEventListener('click', (event) => {
        this.editClickHandler_(item);
      });
    });

    this.addItems_.forEach((item) => {
      item.addEventListener('click', (event) => {
        this.addClickHandler_(item);
      });
    });

    this.noteItems_.forEach((item) => {
      item.addEventListener('click', (event) => {
        this.noteClickHandler_(item);
      });
    });

    this.organizeItems_.forEach((item) => {
      item.addEventListener('click', (event) => {
        this.organizeClickHandler_(item);
      });
    });

    document.body.addEventListener('click',() => {
      const checkboxes = document.querySelectorAll('.menu__checkbox');
      checkboxes.forEach((checkbox) => {
        checkbox.classList.remove('form__input', 'checkbox', 'checkbox--delete', 'menu__checkbox--visible');
      });
    });

    document.querySelectorAll('.menu__checkbox').forEach((item) => {
      item.addEventListener('click', () => {
        const parent = item.parentElement;
        const grandParent = parent.parentNode;

        if (item.checked === true) {
          bookmarks.remove(parent.querySelector('label').innerText);
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

  /**
   * @private
   * @param {HTMLElement} item
   */
  clickHandler_(item) {
    window.open(item.dataset['href'], '_blank');
  }

  /** @private */
  editClickHandler_(item) {
    const parent = item.parentElement.parentElement.parentElement;
    const checkboxes = parent.querySelectorAll('.menu__checkbox');
    checkboxes.forEach((checkbox) => {
      toggleMultiple(checkbox, 'form__input checkbox checkbox--delete menu__checkbox--visible');
    });
    event.stopPropagation();

    return;
  }

  /** @private */
  addClickHandler_(item) {
    const categoryInput = document.querySelector('#category');
    const displayTitleInput = document.querySelector('#display-title');
    const urlInput = document.querySelector('#url');

    categoryInput.value = item.parentNode.parentNode
      .querySelector('.menu__title').textContent.trim();

    chrome.tabs.query({
      currentWindow: true,
      active: true
    }, (tabs) => {
      displayTitleInput.value = tabs[0].title;
      urlInput.value = tabs[0].url;
    });

    document.querySelector('#modal').classList.toggle('modal--active');
    event.stopPropagation();

    return;
  }

  /** @private */
  noteClickHandler_(item) {
    const bookmarkId = item.dataset.bookmarkId;

    chrome.tabs.create({
      url: `notes.html?bookmarkId=${bookmarkId}`,
      active: true,
    });

    event.stopPropagation();

    return;
  }

  /** @private */
  organizeClickHandler_(item) {
    const bookmarkId = item.dataset.bookmarkId;

    chrome.tabs.create({
      url: `chrome://bookmarks/?id=${bookmarkId}`,
      active: true,
    });

    event.stopPropagation();

    return;
  }

}


module.exports = Menu;
