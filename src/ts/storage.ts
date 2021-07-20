/**
 * @fileoverview Wrapper classes for storage APIs.
 * @url https://developers.chrome.com/extensions/storage
 * @url https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API#localStorage
 */

import * as Browser from 'webextension-polyfill-ts';
import LZString from 'lz-string';

export interface StorageObject {
  [key: string]: any;
}

/** Wrapper class for Chrome Storage Sync API. */
export class Storage {
  protected static service_ = Browser.browser.storage.sync;

  /** Saves a key value pair into given storage service. */
  protected static set_(service: Browser.Storage.StorageArea, key: string,
      value: any): Promise<any> {
    return service.set({
      [key]: value,
    })
    .then(() => {
      return {[key]: value };
    })
    .catch(err => `Storage.set: error saving value ${err}`);
  }

  /** Retrieves a value from given storage service based on key. */
  protected static get_(service: Browser.Storage.StorageArea, key: string | null)
      : Promise<any> {
    return service.get([key])
    .then(result => result[key!])
    .catch(err => `Storage.get: error getting value ${err}`);
  }

  /** Removes a value from given storage servce based on key(s). */
  protected static remove_(service: Browser.Storage.StorageArea,
      keys: string | string[]): Promise<void> {
    return service.remove(keys)
    .then(() => {
      console.log(`Storage.remove: ${keys} removed`);
    })
    .catch(err => {
      console.log(`Storage.remove: error removing key ${err}`);
    });
  }

  /** Saves a value in Chrome sync storage under given key. */
  static set(key: string, value: any): Promise<any> {
    return this.set_(Storage.service_, key, value);
  }

  /**
   * Saves a value into chunks in Chrome sync storage under given key.
   * @url https://stackoverflow.com/questions/67353979/algorithm-to-break-down-item-for-chrome-storage-sync/67429150#67429150
   */
  static setChunks(key: string, value: any): Promise<void> {
    const str = LZString.compressToUTF16(JSON.stringify(value));
    const len = (Storage.service_.QUOTA_BYTES_PER_ITEM / 4) - key.length - 4;
    const numChunks = Math.ceil(str.length / len);
    const data: any = {};
    data[`${key}#`] = numChunks;

    for (let i = 0; i < numChunks; i++) {
      data[key + i] = str.substr(i * len, len);
    }

    return Storage.service_.set(data)
    .then(() => this.getAll())
    .then(result => {
      const dataKeys = Object.keys(data);
      let keys = Object.keys(result);
      keys = keys.filter(k => k.includes(key))
                 .filter(val => !dataKeys.includes(val));

      return this.remove(keys);
    })
    .catch(err => {
      console.log(`Storage.setChunks: error storing chunks ${err}`);
    });
  }

  /** Retrieves a value from Chrome sync storage based on key. */
  static get(key: string): Promise<any> {
    return this.get_(Storage.service_, key);
  }

  /**
   * Retrieves a value as chunks from Chrome sync storage based on key.
   * @url https://stackoverflow.com/questions/67353979/algorithm-to-break-down-item-for-chrome-storage-sync/67429150#67429150
   */
  static getChunks(key: string): Promise<string> {
    let numChunks: number;
    const keyNum = `${key}#`;

    return Storage.service_.get(keyNum)
    .then(data => {
      numChunks = data[keyNum];
      const keys = [];
      for (let i = 0; i < numChunks; i++) {
        keys[i] = key + i;
      }

      return keys;
    })
    .then(keys => Storage.service_.get(keys))
    .then(data => {
      const chunks = [];
      for (let i = 0; i < numChunks; i++) {
        chunks.push(data[key + i] || '');
      }

      return JSON.parse(LZString.decompressFromUTF16(chunks.join('')) || '');
    })
    .catch(err => {
      console.log(`Storage.getChunks: error retrieving chunks ${err}`);
    });
  }

  /** Retrieves all values from Chrome sync storage. */
  static getAll(): Promise<any> {
    return Browser.browser.storage.sync.get(null);
  }

  /** Removes a value from Chrome sync storage based on key(s). */
  static remove(keys: string | string[]): Promise<void> {
    return this.remove_(Storage.service_, keys);
  }

  /** Removes all stored values from Chrome (or local) Storage. */
  static removeAll(): Promise<void> {
    return Storage.service_.clear();
  }
}

/** Wrapper class for Chrome Storage Local API. */
export class StorageLocal extends Storage {
  service_ = Browser.browser.storage.local;

  /** Saves a value in Chrome local storage under given key. */
  static set(key: string, value: any): Promise<any> {
    return this.set_(StorageLocal.service_, key, value);
  }

  /** Retrieves a value from Chrome local storage based on key. */
  static get(key: string): Promise<any> {
    return this.get_(StorageLocal.service_, key);
  }

  /** Retrieves all values from Chrome sync storage. */
  static getAll(): Promise<any> {
    return Browser.browser.storage.local.get(null);
  }

  /** Removes a value from Chrome sync storage based on key(s). */
  static remove(keys: string | string[]): Promise<void> {
    return this.remove_(StorageLocal.service_, keys);
  }

  /** Removes all stored values from Chrome (or local) Storage. */
  static removeAll(): Promise<void> {
    return StorageLocal.service_.clear();
  }
}
