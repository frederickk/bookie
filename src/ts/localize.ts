import {browser} from 'webextension-polyfill-ts';
import {querySelectorAllDeep} from 'query-selector-shadow-dom';

/**
 * Class to localize UI.
 * @url http://stackoverflow.com/questions/25467009/internationalization-of-html-pages-for-my-google-chrome-extension
 */
 export class Localize {
  constructor() {
    const elems: HTMLElement[] = querySelectorAllDeep('[data-localize]');

    for (let elem of Array.from(elems)) {
      const content = elem.getAttribute('data-localize')?.toString() || '';
      this.replaceI18n_(elem, content);
    }
  }

  /** Replaces strings with localized copy defined in _locales/<...>. */
  private replaceI18n_(elem: HTMLElement, content: string) {
    const msg = content.replace(/__MSG_(.+)_/g, (_match, $1) => {
      return $1
        ? browser.i18n.getMessage($1)
        : '';
    });

    if (msg !== content && msg !== '') {
      elem.innerHTML = msg;
    }
  }
}
