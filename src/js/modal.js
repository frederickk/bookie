const {checkValidURL, checkValueError} = require('utils');
// const dashboard = require('dashboard');
const storage = require('storage');
const bookmarks = require('bookmarks');


class Modal {
  constructor() {
    /** @private */
    this.menu_ = document.querySelector('#menu__container');

    /** @private */
    this.modal_ = document.querySelector('#modal');

    /** @private */
    this.category_ = document.querySelector('#category');

    /** @private */
    this.title_ = document.querySelector('#display-title');

    /** @private */
    this.url_ = document.querySelector('#url');

    /** @private */
    this.buttonAdd_ = document.querySelector('#add');

    /** @private */
    this.buttonCancel_ = document.querySelector('#cancel');

    this.attach_();
  }

  /** 
   * Clears form inputs.
   * @private
   */
  clearForm_() {
    this.category_.value = '';
    this.title_.value = '';
    this.url_.value = '';
  }

  /**
   * Creates bookmark entry.
   * @param {String} id 
   * @param {String} title
   * @param {String} url
   */
  createBookmarkEntry_(id, title, url) {
    bookmarks.create({
      'parentId': id,
      'title': title,
      'url': url,
    });        

    // storage.set(entryId, {
    //   'category': this.category_.value,
    //   'title': this.title_.value,
    //   'url': this.url_.value,
    //   'id': entryId,
    //   'categoryId': categoryId,
    // });
  }

  /**
   * Attach event listeners
   * @private
   */
  attach_() {
    this.buttonAdd_.addEventListener('click', () => {
      this.addHandler_();
    });

    document.body.addEventListener('keyup', (event) => {
      event.preventDefault();
      if (event.keyCode === 13) {
        this.buttonAdd_.click();
      }    
    });

    this.buttonCancel_.addEventListener('click', () => {
      this.closeHandler_();
    });

    this.modal_.addEventListener('click', () => {
      this.closeHandler_();
    });

    document.querySelector('.modal .card').addEventListener(
      'click', (event) => {
      event.stopPropagation();
      return;
    });
  }

  /** @private */
  addHandler_() {
    if (checkValueError(this.category_, 'text--error')) {
      return;
    }
    if (checkValueError(this.title_, 'text--error')) {
      return;
    }
    if (checkValueError(this.url_, 'text--error')) {
      if (!checkValidURL(this.url_.value)) {
        return;
      }
    }

    const category = this.category_.value;
    const title = this.title_.value;
    const url = this.url_.value;

    bookmarks.search({
      'title': category,
    }, (entries) => {
      if (entries.length <= 0) {
        storage.get('__bookmarkId__', (item) => {
          bookmarks.create({
            'parentId': item,
            'title': category,
          }, (result) => {
            this.createBookmarkEntry_(result.id, title, url);
          });
       });

      } else {
        this.createBookmarkEntry_(entries[0].id, title, url);
      }
    });  

    // dashboard.addEntry(
    //   this.menu_, 
    //   category,
    //   title,
    //   url
    // );

    this.closeHandler_();

    // Force page to refresh to re-trigger event attachments.
    document.location.reload();
  }

  /** @private */
  closeHandler_() {
    this.clearForm_();
    this.modal_.classList.remove('modal--active');
  }

}


module.exports = Modal;
