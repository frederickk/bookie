const {getUrlParams, slugify, download} = require('utils');
const bookmarks = require('bookmarks');
const md = require('markdown-it')({
  breaks: true,
  quotes: '“”‘’',
  typographer: true,
});
const mdContainer = require('markdown-it-container');
const mdDeflist = require('markdown-it-deflist');
const mdEmoji = require('markdown-it-emoji');
const mdFootnote = require('markdown-it-footnote');
const mdIns = require('markdown-it-ins');
const mdMark = require('markdown-it-mark');
const mdSub = require('markdown-it-sub');
const mdSup = require('markdown-it-sup');
const storage = require('storage');
const stripHtml = require('string-strip-html');
const toMarkdown = require('to-markdown');

const {MDCSelect} = require('@material/select');


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
    this.titleSelect_;

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
    md.use(mdContainer);
    md.use(mdDeflist);
    md.use(mdEmoji);
    md.use(mdFootnote);
    md.use(mdIns);
    md.use(mdMark);
    md.use(mdSub);
    md.use(mdSup);

    // Custom Markdown tags
    [
      'doc',    // ::: doc
      'docs',   // ::: docs
      'file',   // ::: file
      'film',   // ::: film
      'image',  // ::: image
      'pdf',    // ::: pdf
      'slide',  // ::: slide
      'slides', // ::: slides
      'sketch', // ::: sketch
      'sheet',  // ::: sheet
      'sheets', // ::: sheets
      'video',  // ::: video
      'zip',    // ::: zip
    ].forEach((item) => {
      const re = new RegExp(`^${item}\\s+(.*)$`, 'gi');

      md.use(mdContainer, item, {
        validate: (params) => {
          return params.trim().match(re);
        },
        render: (tokens, idx) => {
          const m = tokens[idx].info.trim().match(re);
          if (tokens[idx].nesting === 1) {
            m[0] = m[0].replace(item, '').trim();
            return `<span class="notes__icon notes__icon--${item}"></span>${md.render(m[0])}\n`;
          } else {
            return '\n';
          }
        },
      });
    });

    // https://github.com/markdown-it/markdown-it/blob/master/docs/architecture.md#renderer
    const defaultRender = md.renderer.rules.link_open
        || function(tokens, idx, options, env, self) {
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

        const selectList = document.querySelector('ul.mdc-list');

        storage.get('__bookmarkId__', (result) => {
          bookmarks.get(result, (items) => {
            items.forEach((entries) => {
              entries.children.forEach((entryList) => {
                if (!entryList.title.startsWith('!')) {
                  const option = document.createElement('li');
                  option.innerText = entryList.title;
                  option.classList.add('mdc-list-item');

                  if (entryList.title == this.categoryTitle_) {
                    document.title = `Bookie — ${entryList.title}`;

                    document.querySelector('.mdc-select__selected-text')
                        .innerText = entryList.title;
                    option.classList.add('mdc-list-item--selected');
                    option.setAttribute('aria-checked', true);
                  } else {
                    option.dataset.value = entryList.id;
                  }

                  selectList.appendChild(option);
                }
              });
            });

            // TODO (frederickk): titleSelect_ "has" to be initialized after the
            // menu list is popuplated. Perhaps this is because I'm using vanilla
            // JS or more likely because I don't know what I'm doing.
            this.titleSelect_ =
                new MDCSelect(document.querySelector('.notes__select'));

            this.titleSelect_.listen('MDCSelect:change',
                this.titleSelectChangeHandler_.bind(this));
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
  render_(str = ' ') {
    if (str) {
      this.html_.innerHTML = md.render(str || ' ');

      document.querySelectorAll('a').forEach((item) => {
        item.addEventListener('click', this.aClickHandler_.bind(this));
      });
    }
  }

  /**
   * @private
   */
  attach_() {
    this.markdown_.addEventListener('blur',
        this.markdownBlurHandler_.bind(this));

    this.markdown_.addEventListener('click',
        this.markdownClickHandler_.bind(this));

    this.markdown_.addEventListener('keydown',
        this.markdownKeydownHandler_.bind(this));

    this.markdown_.addEventListener('keyup',
        this.markdownKeyupHandler_.bind(this));


    this.html_.addEventListener('click',
        this.htmlClickHandler_.bind(this));

    try {
      this.saveButton_.addEventListener('click', () => {
        this.markdownBlurHandler_();
      });
    } catch (err) {}

    try {
      this.exportButton_.addEventListener('click',
          this.exportClickHandler_.bind(this));
    } catch (err) {}

    this.markdown_.addEventListener('copy',
        this.copyHandler_.bind(this));

    this.markdown_.addEventListener('paste',
        this.pasteHandler_.bind(this));
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
    const id = this.titleSelect_.value;
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

    try {
      this.saveContainer_.classList.add('notes__content--hidden');
    } catch (err) {}
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
    } else if (event.keyCode === 13 && event.metaKey) {
      this.markdownBlurHandler_();
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

    try {
      this.saveContainer_.classList.remove('notes__content--hidden');
    } catch (err) {}

    this.notes_.addEventListener('click', this.markdownBlurHandler_.bind(this));

    // TODO (frederickk): MDCSelect doesn't close when HTML clicked, because
    // click event isn't propogated. Removing this line prevents the reveal
    // of the markdown textarea 🤔.
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

  /** @private */
  copyHandler_(event) {
    const selection = document.getSelection();
    const richtext = md.render(selection.toString());

    event.clipboardData.setData('text/html', richtext);
    event.preventDefault();
  }

  /** @private */
  pasteHandler_(event) {
    const paste = (event.clipboardData || window.clipboardData);

    event.preventDefault();

    let text = paste.getData('text');
    for (let i = 0; i < paste.items.length; i++) {
      const item = paste.items[i];

      if (item.type.includes('html')) {
        item.getAsString((s) => {
          text = stripHtml(toMarkdown(s, {
            gfm: true,
          }));
          document.execCommand('insertText', false, text);
        });

        return;
      }
    }

    document.execCommand('insertText', false, text);
    return false;
  }

}


module.exports = Notes;


new Notes();
