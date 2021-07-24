import {browser} from 'webextension-polyfill-ts';
import {querySelectorAllDeep} from 'query-selector-shadow-dom';

/**
 * Class to localize UI.
 * @url http://stackoverflow.com/questions/25467009/internationalization-of-html-pages-for-my-google-chrome-extension
 */
 export class Localize {
  constructor() {
    const els: HTMLElement[] = querySelectorAllDeep('[data-localize]:not(input)');
    const inputEls = <HTMLInputElement[]>querySelectorAllDeep('input[data-localize]');

    for (let elem of Array.from(els)) {
      this.replaceInnerHTML_(elem, this.getI18nId_(elem));
    }
    for (let elem of Array.from(inputEls)) {
      this.replaceValue_(elem, this.getI18nId_(elem));
    }
  }

  /** Retrieves localization id string from "data-localize" property. */
  private getI18nId_(elem: Element): string {
    return elem.getAttribute('data-localize')?.toString() || '';
  }

  /** Returns localized string defined in _locales/<...>. */
  private getI18nString_(content: string) {
    return content.replace(/__MSG_(.+)_/g, (_match, $1) => {
      return $1
        ? browser.i18n.getMessage($1)
        : '';
    });
  }

  /** Replaces innerHTML with localized string defined in _locales/<...>. */
  private replaceInnerHTML_(elem: HTMLElement, content: string) {
    elem.innerHTML = this.getI18nString_(content);
  }

  /** Replaces value with localized string defined in _locales/<...>. */
  private replaceValue_(elem: HTMLInputElement, content: string) {
    elem.value = this.getI18nString_(content);
  }
}
