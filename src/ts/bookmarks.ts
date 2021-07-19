/**
 * @fileoverview Wrapper class for Chrome Bookmarks API.
 * @url https://developers.chrome.com/extensions/bookmarks
 */

type TreeNodesCallback = (tree?: chrome.bookmarks.BookmarkTreeNode[]) => any;
type TreeNodeCallback = (tree?: chrome.bookmarks.BookmarkTreeNode) => any;

export class Bookmarks {
  /**
   * Creates bookmark entry.
   * @url https://developers.chrome.com/extensions/bookmarks#method-create
   */
  static create(
      bookmark: chrome.bookmarks.BookmarkCreateArg,
      callback?: TreeNodeCallback): Promise<chrome.bookmarks.BookmarkTreeNode> {
    // return chrome.bookmarks.create(bookmark, callback);
    return new Promise((resolve, reject) => {
      chrome.bookmarks.create(bookmark, (tree) => {
        if (chrome.runtime.lastError) {
          reject(`'Bookmarks.create ${chrome.runtime.lastError}`);
        }
        if (tree) {
          if (callback) {
            callback(tree);
          }
          resolve(tree);
        } else {
          reject('Bookmarks.create bookmark not created');
        }
      });
    });
  }

  /**
   * Retrieve tree of user's bookmarks from a specific ID.
   * @url https://developers.chrome.com/extensions/bookmarks#method-getSubTree
   */
  static get(id: string, callback?: TreeNodesCallback)
      : Promise<chrome.bookmarks.BookmarkTreeNode[]> {
    return new Promise((resolve, reject) => {
      chrome.bookmarks.getSubTree(id, result => {
        if (chrome.runtime.lastError) {
          reject(`'Bookmarks.get ${chrome.runtime.lastError}`);
        }
        if (result) {
          if (callback) {
            callback(result);
          }
          resolve(result);
        } else {
          reject('Bookmarks.get no results found');
        }
      });
    });
  }

  /**
   * Retrieves entire tree of a user's bookmarks.
   * @url https://developers.chrome.com/extensions/bookmarks#method-getTree
   */
  static getAll(callback?: TreeNodesCallback)
      : Promise<chrome.bookmarks.BookmarkTreeNode[] | undefined> {
    return new Promise((resolve, reject) => {
      chrome.bookmarks.getTree(result => {
        if (chrome.runtime.lastError) {
          reject(`'Bookmarks.getAll ${chrome.runtime.lastError}`);
        }
        if (result) {
          if (callback) {
            callback(result[0].children);
          }
          resolve(result[0].children);
        } else {
          reject('Bookmarks.getAll no results found');
        }
      });
    });
  }

  /**
   * Removes bookmark entry.
   * @url https://developers.chrome.com/extensions/bookmarks#method-remove
   */
  static remove(title?: string): Promise<any> {
    const removePromise = new Promise((resolve, reject) => {
      if (title) {
        chrome.bookmarks.remove(title, () => {
          if (chrome.runtime.lastError) {
            reject(`'Bookmarks.remove ${chrome.runtime.lastError}`);
          } else {
            resolve(title);
          }
        });
      } else {
        reject('Bookmarks.remove invalid title or ID');
      }
    });

    // return removePromise.then((_id) => {
    // }).catch((str) => {
    //   chrome.bookmarks.search({
    //     'title': str,
    //   }, (result) => {
    //     if (result.length != 0) {
    //       chrome.bookmarks.remove(result[0].id);
    //     }
    //   });
    // });

    return removePromise
    .then(id => Bookmarks.search({
      title: id,
    }))
    .then(result => {
      if (result.length != 0) {
        chrome.bookmarks.remove(result[0].id);
      }
    });
  }

  /**
   * Searches user's bookmarks based on String or Object query.
   * @url https://developers.chrome.com/extensions/bookmarks#method-search
   */
  static search(query: any, callback?: TreeNodesCallback)
      : Promise<chrome.bookmarks.BookmarkTreeNode[]> {
    return new Promise((resolve, reject) => {
      chrome.bookmarks.search(query, (result) => {
        if (result) {
          if (callback) {
            callback(result);
          }
          resolve(result);
        } else {
          reject('Bookmarks.search no results found');
        }
      });
    });
  }
}
