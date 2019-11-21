const {getUrlParams, slugify, download} = require('utils');
const bookmarks = require('bookmarks');
const md = require('markdown-it')({
  breaks: true,
  quotes: '“”‘’',
  typographer: true,
});
const mdEmoji = require('markdown-it-emoji');
const mdFootnote = require('markdown-it-footnote');
const mdIns = require('markdown-it-ins');
const mdMark = require('markdown-it-mark');
const mdSub = require('markdown-it-sub');
const mdSup = require('markdown-it-sup');
const storage = require('storage');



class Notes {
  constructor() {
    /** @private */
    this.notes_ = document.querySelector('#notes__container');

    /** @private */
    this.notesItem_ = document.querySelector('.notes__item');

    /** @private */
    this.markdown_ = document.querySelector('.notes__content-markdown');

    /** @private */
    this.html_ = document.querySelector('.notes__content-html');

    /** @private */
    this.titleSelect_ = document.querySelector('.notes__title-select');

    /** @private */
    this.saveContainer_ = document.querySelector('.notes__save-container');

    /** @private */
    this.saveButton_ = document.querySelector('#save');

    /** @private */
    this.exportButton_ = document.querySelector('#export');

    /** @private */
    this.bookmarkId_ = getUrlParams()['bookmarkId'];

    /** @private */
    this.categoryTitle_;

    this.init_();
    this.update_();
    this.attach_();
  }

  /**
   * @private
   */
  init_() {
    md.use(mdEmoji);
    md.use(mdMark);
    md.use(mdFootnote);
    md.use(mdSub);
    md.use(mdSup);
    md.use(mdIns);

    // https://github.com/markdown-it/markdown-it/blob/master/docs/architecture.md#renderer
    let defaultRender = md.renderer.rules.link_open || function(tokens, idx, options, env, self) {
      return self.renderToken(tokens, idx, options);
    };

    md.renderer.rules.link_open = (tokens, idx, options, env, self) => {
      const aIndex = tokens[idx].attrIndex('target');

      if (aIndex < 0) {
        tokens[idx].attrPush(['target', '_blank']);
      } else {
        tokens[idx].attrs[aIndex][1] = '_blank';
      }

      return defaultRender(tokens, idx, options, env, self);
    };

    if (this.bookmarkId_) {
      bookmarks.get(this.bookmarkId_, (items) => {
        this.categoryTitle_ = items[0].title;

        const titleDiv = document.querySelector('.notes__title');
        titleDiv.id = slugify(this.categoryTitle_);

        storage.get('__bookmarkId__', (result) => {
          bookmarks.get(result, (items) => {
            items.forEach((entries) => {
              entries.children.forEach((entryList) => {
                const option = document.createElement('option');
                option.value = entryList.id;
                option.innerText = entryList.title.toUpperCase();
                if (entryList.title == this.categoryTitle_) {
                  option.selected = true;
                }
                this.titleSelect_.appendChild(option);
              });
            });
          });
        });
      });
    }
  }

  /**
   * @private
   */
  update_() {
    if (this.bookmarkId_) {
      if (this.markdown_.value === '') {
        storage.get(`__notes-${this.bookmarkId_}__`, (result) => {
          this.markdown_.value = result;
          this.render_(this.markdown_.value);
        });
      } else {
        storage.set(`__notes-${this.bookmarkId_}__`, this.markdown_.value);
      }
    }

    this.render_(this.markdown_.value);
  }

  /**
   * @private
   * @param   {String}  str  Markdown content as string.
   */
  render_(str = '') {
    if (str) {
      this.html_.innerHTML = md.render(str || '');

      document.querySelectorAll('a').forEach((item) => {
        item.addEventListener('click', this.aClickHandler_.bind(this));
      });
    }
  }

  /**
   * @private
   */
  attach_() {
    this.titleSelect_.addEventListener('change',
      this.titleSelectChangeHandler_.bind(this));


    this.markdown_.addEventListener('click',
      this.markdownClickHandler_.bind(this));

    this.markdown_.addEventListener('keydown',
      this.markdownKeydownHandler_.bind(this));

    this.markdown_.addEventListener('keyup',
      this.markdownKeyupHandler_.bind(this));


    this.html_.addEventListener('click',
      this.htmlClickHandler_.bind(this));


    this.saveButton_.addEventListener('click', () => {
      if (window.confirm('Sure you want to save changes?')) {
        this.markdownBlurHandler_();
      }
    });

    this.exportButton_.addEventListener('click',
      this.exportClickHandler_.bind(this));
  }

  /**
   * @private
   * Prevents toggling into Markdown view when link is clicked.
   */
  aClickHandler_() {
    event.stopPropagation();

    return;
  }

  /** @private */
  titleSelectChangeHandler_() {
    const id = this.titleSelect_.options[this.titleSelect_.selectedIndex].value;
    window.location.search = `?bookmarkId=${id}`;
  }

  /**
   * @private
   * Reveals container of HTML content and hides Mardown container.
   */
  markdownBlurHandler_() {
    this.update_();

    this.html_.classList.remove('notes__content--hidden');
    this.markdown_.classList.add('notes__content--hidden');

    this.saveContainer_.classList.add('notes__content--hidden');
  }

  /**
   * @private
   * @param {HTMLEvent} event
   */
  markdownClickHandler_(event) {
    this.notes_.removeEventListener('click', this.markdownBlurHandler_, true);

    event.stopPropagation();

    return;
  }

  /** @private */
  markdownKeydownHandler_(event) {
    if (event.keyCode === 9) {
      event.preventDefault();
      document.execCommand('insertHTML', false, '&#009');
    }
  }

  /** @private */
  markdownKeyupHandler_(event) {
    if (event.keyCode === 9) {
      event.preventDefault();
    }
  }

  /**
   * @private
   * Hides container of HTML content and reveals Mardown container.
   * @param {HTMLEvent} event
   */
  htmlClickHandler_(event) {
    this.html_.classList.add('notes__content--hidden');
    this.markdown_.classList.remove('notes__content--hidden');
    this.markdown_.focus();

    this.saveContainer_.classList.remove('notes__content--hidden');

    this.notes_.addEventListener('click', this.markdownBlurHandler_.bind(this));

    event.stopPropagation();

    return;
  }

  /** @private */
  // TODO (frederickk): Export of RTF is not implemented because I'm too lazy
  // to care at the moment.
  exportClickHandler_(event) {
    this.saveButton_.click();

    event.preventDefault();

    download(
      this.markdown_.value,
      `${slugify(this.categoryTitle_)}-bookie.md`,
      'text/markdown'
    );
    // download(
    //   htmlToRtf.convertHtmlToRtf(this.html_.innerHTML),
    //   `${this.bookmarkId_}-bookie.rtf`,
    //   'application/rtf'
    // );

    return;
  }

}


module.exports = Notes;


new Notes();
