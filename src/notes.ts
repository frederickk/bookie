import {getUrlParams, slugify, download} from './ts/utils';
import {Bookmarks} from './ts/bookmarks';
import {MardownHelper} from './ts/markdownHelper';
import {MDCSelect} from '@material/select';
import {Storage} from './ts/storage';
import {stripHtml} from 'string-strip-html';
import toMarkdown from 'to-markdown';

export class Notes {
  private bookmarkId_ = getUrlParams()['bookmarkId'];
  private md_ = new MardownHelper();

  private notesContainerEl_ = <HTMLElement>document.querySelector('#notes__container');
  private notesItemEl_ = <HTMLElement>document.querySelector('.notes__item');
  private markdownEl_ = <HTMLInputElement>document.querySelector('.notes__content--markdown');
  private htmlEl_ = <HTMLElement>document.querySelector('.notes__content--html');
  private saveContainerEl_ = <HTMLElement>document.querySelector('.notes__save-container');

  private categorySelect_!: MDCSelect;
  private saveButton_ = <HTMLInputElement>document.querySelector('#save');
  private exportButton_ = <HTMLInputElement>document.querySelector('#export');
  // private notesId_ = getUrlParams()['notesId'];

  private categoryTitle_: string = '';
  private shiftPressed_ = false;

  constructor() {
    this.init_();
    this.attach_();
  }

  /** Loads and renders markdown content and populate UI. */
  private init_() {
    this.updateRenderedNote_();

    if (this.bookmarkId_) {
      this.notesItemEl_.dataset.bookmarkId = this.bookmarkId_;

      Bookmarks.get(this.bookmarkId_)
      .then(items => this.setCategoryTitle_(items[0].title))
      .then(() => Storage.get('__bookieId__'))
      .then(result => Bookmarks.get(result))
      .then(bookmarks => this.populateCategorySelect_(bookmarks))
      .then(() => this.initCategorySelect_())
      .then(() => this.updateRenderedNote_());
    }
  }

  /** Initializes selector for changing views, based on category (folder). */
  private initCategorySelect_() {
    // TODO (frederickk): titleSelect_ "has" to be initialized after the
    // menu list is popuplated. Perhaps this is because I'm using vanilla
    // JS or more likely because I don't know what I'm doing.
    this.categorySelect_ = new MDCSelect(
      <HTMLElement>document.querySelector('.notes__select'));

    this.categorySelect_.listen('MDCSelect:change',
      this.categorySelectChangeHandler_.bind(this));
  }

  /** Sets title of current category (folder) and displays within UI. */
  private setCategoryTitle_(title: string) {
    this.categoryTitle_ = title;

    const titleDiv = <HTMLElement>document.querySelector('.notes__header');
    titleDiv.id = slugify(this.categoryTitle_);
  }

  /** Creates list element for category (folder) select. */
  private createCategoryListElement_(title: string, bookmarkId: string)
      : HTMLLIElement {
    const content = document.createElement('span');
    content.classList.add('mdc-list-item__text');
    content.innerText = title;

    const el = document.createElement('li');
    el.classList.add('mdc-list-item');
    el.setAttribute('role', 'option');
    el.appendChild(content);

    if (title === this.categoryTitle_) {
      const selectedTextLabelEl = <HTMLSpanElement>document.querySelector(
        '.mdc-select__selected-text');
      selectedTextLabelEl.innerText = title;
      el.classList.add('mdc-list-item--selected');
      el.setAttribute('aria-checked', 'true');
      document.title = `Bookie — ${title}`;
    }

    if (bookmarkId) {
      el.dataset.value = bookmarkId;
    }

    return el;
  }

  /** Populates category (folder) select with bookmark entries. */
  private populateCategorySelect_(items: chrome.bookmarks.BookmarkTreeNode[]) {
    const selectList = document.querySelector('ul.mdc-list');

    items.forEach((entries) => {
      entries.children?.forEach((entryList) => {
        // '!' prefix is how end-users can keep a category (folder) from
        // appearting within Bookie's UI.
        if (!entryList.title.startsWith('!')) {
          const option = this.createCategoryListElement_(
            entryList.title, entryList.id
          );
          selectList?.appendChild(option);
        }
      });
    });
  }

  /** Retrieves markdown content from storage. */
  private loadSavedNote_(id: string): Promise<void> {
    return Storage.get(`__bookie-notes-${id}__`)
    .then(result => {
      console.log(`__bookie-notes-${id}__`, result);
      this.markdownEl_.value = result?.toString();
      this.renderMarkdownToHtml_(this.markdownEl_.value);
    });
  }

  /** Updates HTML view with latest markdown content. */
  private updateRenderedNote_() {
    if (this.bookmarkId_) {
      const option = <HTMLOptionElement>document.querySelector(
        `[data-value='${this.bookmarkId_}']`);
      const noteId = slugify(option?.innerText);
      const noteAsMarkdown = this.markdownEl_.value.trim();

      console.log('updateRenderedNote_()', noteId);
      if (noteAsMarkdown === '' ||
          noteAsMarkdown === 'undefined' ||
          noteAsMarkdown === undefined) {
        this.loadSavedNote_(noteId);
      } else {
        Storage.set(`__bookie-notes-${noteId}__`, noteAsMarkdown);
      }
    }

    this.renderMarkdownToHtml_(this.markdownEl_.value);
  }

  /** Renders markdown string as HTML into HTML container. */
  private renderMarkdownToHtml_(str = ' ') {
    this.htmlEl_.innerHTML = this.md_.render(str);
  }

  /** Returns HTML string as markdown. */
  private renderHTMLToMarkdown_(html = ' '): string {
    return stripHtml(toMarkdown(html, {
      gfm: true, // GitHub Flavored Markdown
    })).result;
  }

  /** Attaches event listeners. */
  private attach_() {
    window.addEventListener('keydown',
        this.windowKeydownHandler_.bind(this));
    window.addEventListener('keyup',
        this.windowKeyupHandler_.bind(this));

    this.markdownEl_.addEventListener('keydown',
        this.markdownKeydownHandler_.bind(this));
    this.markdownEl_.addEventListener('keyup',
        this.markdownKeyupHandler_.bind(this));
    this.markdownEl_.addEventListener('click',
        this.markdownClickHandler_.bind(this));
    this.markdownEl_.addEventListener('blur',
        this.markdownBlurHandler_.bind(this));
    this.markdownEl_.addEventListener('paste',
        this.pasteHandler_.bind(this));

    this.htmlEl_.addEventListener('click',
        this.htmlClickHandler_.bind(this));

    this.saveButton_?.addEventListener('click',
        this.markdownBlurHandler_.bind(this));
    this.exportButton_?.addEventListener('click',
        this.exportClickHandler_.bind(this));

  }

  /**
   * Changes notes view to selected bookmark category (folder).
   * @listens window~event:click
   */
  private categorySelectChangeHandler_() {
    const bookmarkId = this.categorySelect_.value;
    window.location.search = `?bookmarkId=${bookmarkId}`;
  }

  /**
   * Handles keypresses globally.
   * @listens window~event:keydown
   */
   private windowKeydownHandler_(event: KeyboardEvent) {
    if (event.shiftKey) {
      this.shiftPressed_ = true;
    }
  }

  /**
   * Handles release of keyps globally.
   * @listens window~event:keyup
   */
   private windowKeyupHandler_() {
    this.shiftPressed_ = false;
  }

  /**
   * Handles keypresses within markdown editor/preview.
   * @listens markdownEl~event:keydown
   */
  private markdownKeydownHandler_(event: KeyboardEvent) {
    if (event.key === 'Tab') {
      event.preventDefault();
      document.execCommand('insertHTML', false, '&#009');
    } else if (event.key === 'Enter' && event.metaKey) {
      this.markdownBlurHandler_();
    }
  }

  /**
   * Handles release of keys within markdown editor/preview.
   * @listens markdownEl~event:keyup
   */
  private markdownKeyupHandler_(event: KeyboardEvent) {
    if (event.key === 'Tab') {
      event.preventDefault();
    }
  }

  /**
   * Handles mousepress within markdown editor/preview.
   * @listens markdownEl~event:click
   */
  private markdownClickHandler_(event: Event) {
    this.notesContainerEl_.removeEventListener('click', this.markdownBlurHandler_, true);
    event.stopPropagation();
  }

  /**
   * Reveals container of HTML content and hides Mardown container.
   * @listens markdownEl~event:blur
   */
  private markdownBlurHandler_() {
    this.updateRenderedNote_();
    this.htmlEl_.classList.remove('notes__content--hidden');
    this.markdownEl_.classList.add('notes__content--hidden');
    this.saveContainerEl_.classList?.add('notes__content--hidden');
  }

  /** Handles paste data, transforming captured HTML into markdown. */
  private pasteDataHandler_(data: DataTransferItemList) {
    // let str = paste.getData('text');
    let markdown = '';

    Array.from(data).forEach((item: DataTransferItem) =>  {
      if (item.type.includes('html')) {
        item.getAsString((html: string) => {
          markdown = this.renderHTMLToMarkdown_(html);
          // document.execCommand('insertText', false, markdown);
        });

        return;
      }
    });

    document.execCommand('insertText', false, markdown);
  }

  /**
   * Handles paste event within markdown editor/preview.
   * @listens markdownEl~event:paste
   */
  private pasteHandler_(event: ClipboardEvent) {
    const paste: DataTransfer = (event.clipboardData || (<any>window).clipboardData);
    event.preventDefault();

    this.pasteDataHandler_(paste.items);

    return false;
  }

  /**
   * Hides container of HTML content and reveals Mardown container.
   * @listens htmlEl~event:click
   */
  private htmlClickHandler_(event: Event) {
    if (this.shiftPressed_) {
      this.htmlEl_.classList.add('notes__content--hidden');
      this.markdownEl_.classList.remove('notes__content--hidden');
      this.markdownEl_.focus();
      this.saveContainerEl_.classList?.remove('notes__content--hidden');

      this.notesContainerEl_.addEventListener('click', this.markdownBlurHandler_.bind(this));
    }

    // TODO (frederickk): MDCSelect doesn't close when HTML clicked, because
    // click event isn't propogated. Removing this line prevents the reveal
    // of the markdown textarea 🤔.
    event.stopPropagation();

    return;
  }

  /**
   * Exports current markdown as file.
   * @listens exportButton~event:click
   */
  private exportClickHandler_(event: Event) {
    this.saveButton_.click();
    event.preventDefault();

    download(
      this.markdownEl_.value,
      `${slugify(this.categoryTitle_)}-bookie.md`,
      'text/markdown'
    );

    // TODO (frederickk): Export of RTF is not implemented because I'm too lazy
    // to care at the moment.
    // download(
    //   htmlToRtf.convertHtmlToRtf(this.html_.innerHTML),
    //   `${this.bookmarkId_}-bookie.rtf`,
    //   'application/rtf'
    // );

    return;
  }
}

new Notes();