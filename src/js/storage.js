/**
 * @fileoverview Wrapper class for Chrome Storage and LocalStorage API.
 * @url https://developers.chrome.com/extensions/storage
 * @url https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API#localStorage
 */

class Storage {
  /**
   * Saves a value in Chrome Storage identified key.
   * @param {String} key 
   * @param {Object} obj 
   */
  static set(key, obj) {
    if (!key || !obj) {
      console.log('Error: No value specified');
      return;
    }

    try {
      chrome.storage.sync.set({
        [key]: obj
      }, () => {
        console.log(`${key} with ${obj} value saved`);
      });    
    } catch(err) {
      window.localStorage.setItem(key, JSON.stringify(obj));
    }
  }

  /**
   * Retrieves a value from Chrome Storage based on key.
   * @param {String} key 
   */
  static get(key, callback = () => {}) {
    try {
      return chrome.storage.sync.get([key], (result) => {
        console.log(`Value currently is ${result[key]}`);
        callback(result[key]);
        return result[key];
      });    
    } catch(err) {
      return JSON.parse(window.localStorage.getItem(key));
    }
  }

  /**
   * Retrieves all values from Chrome Storage.
   * @param {Function} callback 
   */
  static getAll(callback) {
    try {
      return chrome.storage.sync.get(null, (result) => {
        callback(result);
        return result;
      });    
    } catch(err) {
      let archive = [];

      // TODO (frederickk): Create a LocalStorage implmentation to access all.
      for (var key in localstorage) {
        console.log(key);
      }      
      // items.forEach((key) => {
    //     archive.push({
    //       [key]: Storage.get(key),
    //     });
      // });

      return archive;      
    }
  }

  /**
   * Removes a value from Chrome Storage based on key.
   * @param {String} key 
   */
  static remove(key) {
    try {
      chrome.storage.sync.remove((key) => {
        console.log(`${key} removed`);
      });
    } catch(err) {
      window.localStorage.removeItem(key);      
    }
  }

  /**
   * Removes all stored values from Chrome Storage.
   */
  static removeAll() {
    try {
      chrome.storage.sync.clear();
    } catch(err) {
      window.localStorage.clear();
    }
  }

}


module.exports = Storage;
