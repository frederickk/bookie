/**
 * @fileoverview Wrapper class for Chrome Bookmarks API.
 * @url https://developers.chrome.com/extensions/bookmarks
 */

class Bookmarks {
  /**
   * Retrieve tree of user's bookmarks from a specific ID.
   * @url https://developers.chrome.com/extensions/bookmarks#method-getSubTree
   * @param {String} id
   * @param {Function} callback
   */
  static get(id, callback = () => {}) {
    return chrome.bookmarks.getSubTree(id, (result) => {
      callback(result);
      return result;
    });
  }

  /**
   * Retrieves entire tree of a user's bookmarks.
   * @url https://developers.chrome.com/extensions/bookmarks#method-getTree
   * @param {Function} callback
   */
  static getAll(callback = () => {}) {
    return chrome.bookmarks.getTree((result) => {
      callback(result[0].children);
      return result[0].children;
    });
  }

  /**
   * Searchs user's bookmarks based on String or Object query.
   * @url https://developers.chrome.com/extensions/bookmarks#method-search
   * @param {String|Object} obj
   * @param {Function} callback
   */
  static search(obj, callback = () => {}) {
    return chrome.bookmarks.search(obj, (result) => {
      callback(result);
      return result;
    });
  }

  /**
   * Creates bookmark entry.
   * @url https://developers.chrome.com/extensions/bookmarks#method-create
   * @param {Object} obj
   * @param {Function} callback
   */
  static create(obj, callback = () => {}) {
    return chrome.bookmarks.create(obj, callback);
  }

  /**
   * Removes bookmark entry.
   * @url https://developers.chrome.com/extensions/bookmarks#method-remove
   * @param {String} str  ID or title of bookmark to remove.
   */
  static remove(str) {
    const removePromise = new Promise((resolve, reject) => {
      try {
        chrome.bookmarks.remove(str, () => {
          if (chrome.runtime.lastError) {
            reject(str);
          } else {
            resolve(str);
          }
        });
      } catch (err) {
        reject(str);
      }
    });

    removePromise.then((id) => {
    }).catch((str_) => {
      chrome.bookmarks.search({
        'title': str_,
      }, (result) => {
        if (result.length != 0) {
          chrome.bookmarks.remove(result[0].id);
        }
      });
    });
  }
}


module.exports = Bookmarks;
