import {browser} from 'webextension-polyfill-ts';

/** Name of the app. */
export const APP_NAME = browser.i18n.getMessage('extName');

/** Identifier for app's bookmark folder key in storage. */
export const APP_ID = `${APP_NAME.toLowerCase()}Id`;

/** Prefix identifier for app's notes' key in storage. */
export const APP_NOTES_ID = `${APP_NAME.toLowerCase()}-notes`;

/** Class prefix for butter bar. */
export const BUTTER_BAR_CSS = 'butter-bar';

/** Class prefix for form elements. */
export const FORM_CSS = 'form';

/** Class prefix for menu elements. */
export const MENU_CSS = 'menu';

/** Class prefix for modal elements. */
export const MODAL_CSS = 'modal';

/** Class prefix for notes elements. */
export const NOTES_CSS = 'notes';
