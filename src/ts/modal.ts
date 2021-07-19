import {checkValidURL, checkValueError} from './utils';
import {Storage} from './storage';
import {Bookmarks} from './bookmarks';

export class Modal {
  private modalEl_ = <HTMLElement>document.querySelector('#modal');
  private readonly categoryInputEl_ =
    <HTMLInputElement>document.querySelector('#category');
  private readonly titleInputEl_ =
    <HTMLInputElement>document.querySelector('#display-title');
  private readonly urlInputEl_ =
    <HTMLInputElement>document.querySelector('#url');
  private buttonAdd_ = <HTMLInputElement>document.querySelector('#add');
  private buttonCancel_ = <HTMLInputElement>document.querySelector('#cancel');

  constructor() {
    this.attach_();
  }

  /** Clears form inputs. */
  private clearForm_() {
    this.categoryInputEl_.value = '';
    this.titleInputEl_.value = '';
    this.urlInputEl_.value = '';
  }

  /** Creates bookmark entry. */
  private createBookmarkEntry_(parentId: string, title: string, url: string)
      : Promise<chrome.bookmarks.BookmarkTreeNode> {
    return Bookmarks.create({
      parentId,
      title,
      url,
    });
  }

  /** Attaches event listeners. */
  private attach_() {
    const card = <HTMLElement>document.querySelector('.modal .card');

    document.body.addEventListener('keyup',
      this.bodyKeyPressHandler_.bind(this));
    this.buttonAdd_.addEventListener('click',
      this.addUserBookmarkHandler_.bind(this));
    this.buttonCancel_.addEventListener('click',
      this.closeModalHandler_.bind(this));
    this.modalEl_.addEventListener('click', this.closeModalHandler_.bind(this));
    card.addEventListener('click', this.ignoreEventHandler_);
  }

  /** Triggers add event when user presses 'Enter' key. */
  private bodyKeyPressHandler_(event: KeyboardEvent) {
    event.preventDefault();

    if (event.key === 'Enter') {
      this.buttonAdd_.click();
    }
  }

  /** Checks for flagged input errors. */
  private checkForErrors_() {
    return new Promise<void>((resolve, reject) => {
      if (checkValueError(this.categoryInputEl_, 'text--error')) {
        reject();
      }
      if (checkValueError(this.titleInputEl_, 'text--error')) {
        reject();
      }
      if (checkValueError(this.urlInputEl_, 'text--error')) {
        if (!checkValidURL(this.urlInputEl_.value)) {
          reject();
        }
      }

      resolve();
    });
  }

  /** Creates new bookmark entry from user input. */
  private addUserBookmarkHandler_() {
    const category = this.categoryInputEl_.value;
    const title = this.titleInputEl_.value;
    const url = this.urlInputEl_.value;

    this.checkForErrors_()
    .catch(() => {
      throw new Error('Input errors found');
    })
    .then(() => Bookmarks.search({
      'title': category,
    }))
    .then(entries => {
      if (entries) {
        this.createBookmarkEntry_(entries[0].id, title, url);
      }
    })
    .catch(() => Storage.get('__bookieId__'))
    .then(item => Bookmarks.create({
      'parentId': item?.toString(),
      'title': category,
    }))
    .then(result => {
      if (result) {
        this.createBookmarkEntry_(result.id, title, url);
        this.closeModalHandler_();
        // Force page to refresh to re-trigger event attachments.
        document.location.reload();
      }
    });

    // Bookmarks.search({
    //   'title': category,
    // }, (entries) => {
    //   if (entries) {
    //     this.createBookmarkEntry_(entries[0].id, title, url);
    //   } else {
    //     Storage.get('__bookieId__', (item?: string | number) => {
    //       Bookmarks.create({
    //         'parentId': item?.toString(),
    //         'title': category,
    //       }, (result) => {
    //         if (result) {
    //           this.createBookmarkEntry_(result.id, title, url);
    //         }
    //       });
    //     });
    //   }
    // });

    // this.closeModalHandler_();

    // // Force page to refresh to re-trigger event attachments.
    // document.location.reload();
  }

  /** Stops propagation of event and ignores event. */
  private ignoreEventHandler_(event: Event) {
    event.stopPropagation();

    return;
  }

  /** Closes modal and clears form inputs. */
  private closeModalHandler_() {
    this.clearForm_();
    this.modalEl_.classList.remove('modal--active');
  }
}
