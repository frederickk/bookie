/**
 * @fileoverview Wrapper class for Chrome Storage and LocalStorage API.
 * @url https://developers.chrome.com/extensions/storage
 * @url https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API#localStorage
 */

type ResultCallback = (result?: StorageObject) => any;
type SetResultCallback = (key: string, result?: StorageObject) => any;

export interface StorageObject {
  [key: string]: any;
}

const CHROME_STORAGE_AREA = chrome.storage.sync;
const WINDOW_STORAGE_AREA = window.localStorage;

export class Storage {
  /** Returns all items saved in local storage. */
  private static windowGetAll_(callback?: ResultCallback): StorageObject {
    let items: StorageObject = {};
    for (let key in WINDOW_STORAGE_AREA) {
      items[key] = WINDOW_STORAGE_AREA.getItem(key);
    }

    if (callback) {
      callback(items);
    }

    return items;
  }

  /** Removes item(s) with given key(s) from Chrome storage. */
  private static chromeRemove_(keys: string | string[]) {
    CHROME_STORAGE_AREA.remove(keys, () => {
      console.log(`${keys} removed`);
    });
  }

  /** Removes item(s) with given key(s) from local storage. */
  private static windowRemove_(keys: string | string[]) {
    if (keys.length) {
      Array.from(keys).forEach((key: string) => {
        WINDOW_STORAGE_AREA.removeItem(key);
      });
    } else {
      WINDOW_STORAGE_AREA.removeItem(<string>keys);
    }
  }
 
  /** Saves a value in Chrome (or local) storage under given key. */
  static set(key: string, item: any, callback?: SetResultCallback)
      : Promise<any[]> {
    return new Promise((resolve, reject) => {
      if (key && item) {
        CHROME_STORAGE_AREA.set({
          [key]: item,
        }, () => {
          if (callback) {
            callback(key, item);
          }
          resolve([key, item]);
        });
      } else {
        reject('Error (chrome.storage): No value specified');
      }
    });

    // if (key && item) {
    //   try {
    //     CHROME_STORAGE_AREA.set({
    //       [key]: item,
    //     }, () => {
    //       if (callback) {
    //         callback(key, item);
    //       }
    //     });
    //   } catch (err) {
    //     WINDOW_STORAGE_AREA.setItem(key, JSON.stringify(item));
    //   }
    // } else {
    //   console.warn('Error (chrome.storage): No value specified');

    //   return;
    // }
  }

  /** Retrieves a value from Chrome (or local) storage based on key. */
  static get(key: string, callback?: (result: number | string) => any)
      : Promise<any> {
    const getPromise = new Promise((resolve, reject) => {
      CHROME_STORAGE_AREA.get([key], result => {
        if (chrome.runtime.lastError) {
          reject(key);
        }
        if (result) {
          if (callback) {
            callback(result[key]);
          }
          resolve(result[key]);
        } else {
          reject(key);
        }
      });
    });

    return getPromise
    .catch(key => {
      return JSON.parse(WINDOW_STORAGE_AREA.getItem(key) || '');
    });

    // try {
    //   return CHROME_STORAGE_AREA.get([key], result => {
    //     if (callback) {
    //       callback(result[key]);
    //     }
    //
    //     return result[key];
    //   });
    // } catch (err) {
    //   return JSON.parse(WINDOW_STORAGE_AREA.getItem(key) || '');
    // }
  }

  /** Retrieves all values from Chrome (or local) storage. */
  static getAll(callback?: ResultCallback) {
    try {
      return CHROME_STORAGE_AREA.get(null, result => {
        if (callback) {
          callback(result);
        }

        return result;
      });
    } catch (err) {
      Storage.windowGetAll_(callback);
    }
  }

  /** Removes a value from Chrome (or local) storage based on key(s). */
  static remove(keys: string | string[]) {
    try {
      Storage.chromeRemove_(keys);
    } catch (err) {
      console.warn(`Error (chrome.storage): Could not remove '${keys}'`, err);
      Storage.windowRemove_(keys);
    }
  }

  /** Removes all stored values from Chrome (or local) Storage. */
  static removeAll() {
    try {
      CHROME_STORAGE_AREA.clear();
    } catch (err) {
      WINDOW_STORAGE_AREA.clear();
    }
  }
}
