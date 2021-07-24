import {BUTTER_BAR_CSS} from './_defs';

import {browser} from 'webextension-polyfill-ts';
import {delay} from './utils';

const DELAY_MS = 3000;

/** Class to create butter bar within notes. */
export class ButterBar {
  private butterBarEl = <HTMLElement>document.querySelector(`.${BUTTER_BAR_CSS}`);

  constructor() {
    this.attach_();
  }

  /** Attaches event listeners. */
  private attach_() {
    window.addEventListener('notes:error', this.errorHandler_.bind(this));
    window.addEventListener('notes:success', this.successHandler_.bind(this));
  }

  /** Sets message of butter bar to given string. */
  private setMessage_(message: string): Promise<any> {
    this.butterBarEl.innerText = message;
    this.butterBarEl.classList.remove(`${BUTTER_BAR_CSS}--hidden`);

    return delay(DELAY_MS)
    .then(() => {
      this.butterBarEl.classList.add(`${BUTTER_BAR_CSS}--hidden`);

      return delay(DELAY_MS / 4);
    })
    .then(() => {
      this.butterBarEl.innerText = '';
    });
  }

  /** Sets error message of butter bar. */
  private errorHandler_() {
    this.setMessage_(browser.i18n.getMessage('errorMsgGeneric'));
  }

  /** Sets success message of butter bar. */
  private successHandler_() {
    this.setMessage_(browser.i18n.getMessage('successMsgGeneric'));
  }
}
