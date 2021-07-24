import {APP_NAME, APP_ID, APP_NOTES_ID} from './ts/_defs';

import {download, slugify} from './ts/utils';
import {Bookmarks} from './ts/bookmarks';
import {Storage, StorageLocal} from './ts/storage';
import * as Browser from 'webextension-polyfill-ts';

let bookmarkFolderId_: string;

/** Fires when app is installed. */
Browser.browser.runtime.onInstalled.addListener(installHandler.bind(this));

/** Fires whenever a bookmark is created. */
Browser.browser.bookmarks.onCreated.addListener((id, bookmark) => {
  // TODO (frederickk): Investigate why these are still being saved into
  // sync storage.
  StorageLocal.set(`__${APP_NAME.toLowerCase()}-${id}__`, bookmark);
});

/** Fires whenever any bookmark is removed. */
Browser.browser.bookmarks.onRemoved.addListener((id, _removeInfo) => {
  let title = '';

  StorageLocal.get(`__${APP_NAME.toLowerCase()}-${id}__`)
  .then(result => {
      title = result;

      return StorageLocal.get(`__${APP_NOTES_ID}-${slugify(title)}__`)
  })
  .then(content => {
    download(
      content.toString(), // content,
      `${slugify(title)}-${APP_NAME.toLowerCase()}.md`,
      'text/markdown'
    );
  })
  .then(() => StorageLocal.remove(`__${APP_NAME.toLowerCase()}-${id}__`));
});

/** Fires whenever any bookmarks info has changed. */
Browser.browser.bookmarks.onChanged.addListener(bookmarkUpdateHandler.bind(this));

/** Fires whenever any bookmark is moved. */
Browser.browser.bookmarks.onMoved.addListener(bookmarkUpdateHandler.bind(this));

/**
 * Fires whenever any bookmark's child is moved.
 * TODO (frederickk): Does this event not exist on all Webkit plaforms?
 */
chrome.bookmarks.onChildrenReordered.addListener(
    bookmarkUpdateHandler.bind(this));

/** Determines if app's bookmark folder exists, if not one is created. */
function installHandler() {
  Bookmarks.search({
    'title': APP_NAME,
  })
  .then(result => {
    if (result) {
      bookmarkFolderId_ = result[0].id;
    }
  }, () => console.log(`No valid ${APP_NAME} folder ID found`))
  .then(ready)
  .catch(() => Bookmarks.create({
    'parentId': '1', // 1 = Bookmarks Toolbar
    'title': APP_NAME,
  }))
  .then(item => {
    if (item) {
      bookmarkFolderId_ = item.id;
    }
  }, () => console.log(`${APP_NAME} folder not created 🤷‍♀️`))
  .then(() => Bookmarks.create({
    'parentId': bookmarkFolderId_,
    'title': '!Hidden',
  }))
  .then(ready);
}

/** Completes install process and app is ready to use.  */
function ready() {
  Storage.set(`__${APP_ID}__`, bookmarkFolderId_);
  saveAllFoundBookmarks();
  spawnInstalledTabs();
}

/** Iterate through all bookmarks and create save ID in storage. */
function saveAllFoundBookmarks() {
  Bookmarks.getAll((result) => {
    result?.forEach((child) => {
      bookmarkToStorage(child);
    });
  });
}

/** Spawn new tab with app intro and help; and Chrome built-in bookmark manager */
function spawnInstalledTabs() {
  Browser.browser.tabs.create({
    active: true,
    url: './intro.html',
  });
  Browser.browser.tabs.create({
    active: false,
    // TODO (frederickk): Need to make this URL pattern browser agnostic.
    url: `chrome://bookmarks/?id=${bookmarkFolderId_}`,
  });
}

/**
 * Transfers contents of previous bookmark data to new bookmark data.
 * @param  id    ID of changed bookmark.
 * @param  info  Object with info updated (title or URL).
 */
function bookmarkUpdateHandler(id: string | number, info: any) {
  const titleNew = info.title;

  // Retrieve bookmark data from Chrome storage.
  StorageLocal.get(`__${APP_NAME.toLowerCase()}-${id}__`)
  .then(result => {
    const titleOriginal = result;//.title;

    if (titleNew && titleNew !== titleOriginal) {
      return titleOriginal;
    } else {
      throw Error(`${APP_NAME} Error: Unable to update ${titleOriginal} information`);
    }
  })
  // Notes are stored in Chrome storage by their slugified title,
  // retrieve notes content based on original title.
  .then(titleOriginal => StorageLocal.get(
    `__${APP_NOTES_ID}-${slugify(titleOriginal)}__`)
  )
  // Create new storage data with new (changed) title, but with the
  // same content as the original.
  .then(resultOriginal => StorageLocal.set(
    `__${APP_NOTES_ID}-${slugify(titleNew)}__`, resultOriginal)
  );
}

/** [bookmarkToStorage description] */
function bookmarkToStorage(node: Browser.Bookmarks.BookmarkTreeNode) {
  node.children?.forEach((child) => {
    StorageLocal.set(`__${APP_NAME.toLowerCase()}-${child.id}__`, child);

    bookmarkToNote(child);

    if (child.children) {
      bookmarkToStorage(child);
    }
  });
}

/** [bookmarkToNote description] */
function bookmarkToNote(node: Browser.Bookmarks.BookmarkTreeNode) {
  const title = node.title;

  StorageLocal.get(`__${APP_NOTES_ID}-${slugify(title)}__`)
  .then(result => {
    if (result === undefined || result === null || result === '') {
      throw Error(`Existing note for "${title}" not found`);
    }
  })
  .catch(() => StorageLocal.set(
    `__${APP_NOTES_ID}-${slugify(title)}__`, `# ${title}`)
  );
}
