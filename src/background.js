const bookmarks = require('bookmarks');
const storage = require('storage');


chrome.runtime.onInstalled.addListener(() => {
  let bookmarkFolderId_;

  // See if 'Bookie' bookmark folder exists, if not create it.
  bookmarks.search({
    'title': 'Bookie',
  }, (result) => {
    if (result.length <= 0) {
      bookmarks.create({
        'parentId': '1', // 1 = Bookmarks Toolbar
        'title': 'Bookie',
      }, (obj) => {
        bookmarkFolderId_ = obj.id;
      });
      bookmarks.create({
        'parentId': bookmarkFolderId_,
        'title': '!Hidden',
      });
    } else {
      bookmarkFolderId_ = result[0].id;
    }

    chrome.tabs.create({
      active: true,
      url: './intro.html',
    });

    chrome.tabs.create({
      active: false,
      url: `chrome://bookmarks/?id=${bookmarkFolderId_}`,
    });

    storage.set('__bookmarkId__', bookmarkFolderId_);
  });
});
