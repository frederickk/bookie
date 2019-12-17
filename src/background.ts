import {download, slugify} from './ts/utils';
import {Bookmarks} from './ts/bookmarks';
import {Storage} from './ts/storage';

const APP_NAME = 'Bookie';

let bookmarkFolderId_: string;

/** Fires when Bookie is installed. */
chrome.runtime.onInstalled.addListener(installHandler.bind(this));

/** Fires whenever a bookmark is created. */
chrome.bookmarks.onCreated.addListener((id, bookmark) => {
  Storage.set(`__${APP_NAME.toLowerCase()}-${id}__`, bookmark);
});

/** Fires whenever any bookmark is removed. */
chrome.bookmarks.onRemoved.addListener((id, _removeInfo) => {
  Storage.get(`__${APP_NAME.toLowerCase()}-${id}__`, (title) => { //bookmark) => {
    // const title = bookmark.title;
    if (title) {
      Storage.get(`__${APP_NAME.toLowerCase()}-notes-${slugify(title)}__`, (result) => {
        download(
          result.toString(),
          `${slugify(title)}-${APP_NAME.toLowerCase()}.md`,
          'text/markdown'
        );
      });
    }
  });

});

/** Fires whenever any bookmarks info has changed. */
chrome.bookmarks.onChanged.addListener(bookmarkUpdateHandler.bind(this));

/** Fires whenever any bookmark is moved. */
chrome.bookmarks.onMoved.addListener(bookmarkUpdateHandler.bind(this));

/** Fires whenever any bookmark's child is moved. */
chrome.bookmarks.onChildrenReordered.addListener(
    bookmarkUpdateHandler.bind(this));

/** Determines if 'Bookie' bookmark folder exists, if not one is created. */
function installHandler() {
  Bookmarks.search({
    'title': APP_NAME,
  })
  .then(result => {
    if (result) {
      bookmarkFolderId_ = result[0].id;
    } else {
      throw Error('No valid Bookie folder ID found');
    }
  })
  .then(ready)
  .catch(() => Bookmarks.create({
    'parentId': '1', // 1 = Bookmarks Toolbar
    'title': APP_NAME,
  }))
  .then(item => {
    if (item) {
      bookmarkFolderId_ = item.id;
    } else {
      throw Error('Bookie folder not created 🤷‍♀️');
    }
  })
  .then(() => Bookmarks.create({
    'parentId': bookmarkFolderId_,
    'title': '!Hidden',
  }))
  .then(ready);
}

/** Completes install process and Bookie is ready to use.  */
function ready() {
  Storage.set(`__${APP_NAME.toLowerCase()}Id__`, bookmarkFolderId_);
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

/** Spawn new tab with Bookie intro and help; and Chrome built-in bookmark manager */
function spawnInstalledTabs() {
  chrome.tabs.create({
    active: true,
    url: './intro.html',
  });
  chrome.tabs.create({
    active: false,
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
  Storage.get(`__${APP_NAME.toLowerCase()}-${id}__`)
  .then(result => {
    const titleOriginal = result;//.title;

    if (titleNew && titleNew !== titleOriginal) {
      return titleOriginal;
    } else {
      throw Error(`Bookie Error: Unable to update ${titleOriginal} Bookie information`);
    }
  })
  // Notes are stored in Chrome storage by their slugified title,
  // retrieve notes content based on original title.
  .then(titleOriginal => Storage.get(
    `__${APP_NAME.toLowerCase()}-notes-${slugify(titleOriginal)}__`)
  )
  // Create new storage data with new (changed) title, but with the
  // same content as the original.
  .then(resultOriginal => Storage.set(
    `__${APP_NAME.toLowerCase()}-notes-${slugify(titleNew)}__`, resultOriginal)
  );

  // // Retrieve bookmark data from Chrome storage.
  // Storage.get(`__${APP_NAME.toLowerCase()}-${id}__`, (result) => {
  //   const titleOriginal = result;//.title;

  //   if (titleNew && titleNew !== titleOriginal) {
  //     // Notes are stored in Chrome storage by their slugified title,
  //     // retrieve notes content based on original title.
  //     Storage.get(`__${APP_NAME.toLowerCase()}-notes-${slugify(titleOriginal)}__`, (resultOriginal) => {
  //       if (resultOriginal) {
  //         // Create new storage data with new (changed) title, but with the
  //         // same content as the original.
  //         Storage.set(`__${APP_NAME.toLowerCase()}-notes-${slugify(titleNew)}__`, resultOriginal);
  //       }
  //     });
  //   } else {
  //     console.error(`Bookie Error: Unable to update ${titleOriginal} Bookie information`);
  //   }
  // });
}

/**
 * [bookmarkToStorage description]
 * @param  node  chrome.bookmarks entry item.
 */
function bookmarkToStorage(node: chrome.bookmarks.BookmarkTreeNode) {
  node.children?.forEach((child) => {
    Storage.set(`__${APP_NAME.toLowerCase()}-${child.id}__`, child);

    bookmarkToNote(child);

    if (child.children) {
      bookmarkToStorage(child);
    }
  });
}

/**
 * [bookmarkToNote description]
 * @param  node  chrome.bookmarks entry item.
 */
function bookmarkToNote(node: chrome.bookmarks.BookmarkTreeNode) {
  const title = node.title;

  Storage.get(`__${APP_NAME.toLowerCase()}-notes-${slugify(title)}__`)
  .then(result => {
    if (result === undefined || result === null || result === '') {
      throw Error(`Existing note for "${title}" not found`);
    }
  })
  .catch(() => Storage.set(
    `__${APP_NAME.toLowerCase()}-notes-${slugify(title)}__`, `# ${title}`)
  );

  // Storage.get(`__${APP_NAME.toLowerCase()}-notes-${slugify(title)}__`, (result) => {
  //   if (result === undefined || result === null || result === '') {
  //     Storage.set(`__${APP_NAME.toLowerCase()}-notes-${slugify(title)}__`,
  //         `# ${title}`);
  //   }
  // });
}
