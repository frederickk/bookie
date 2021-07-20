/**
 * @fileoverview Wrapper class for Chrome Tabs and TabGroups API.
 * @url https://developers.chrome.com/extensions/tabs
 * @url https://developers.chrome.com/extensions/tabGroups
 */

import * as Browser from 'webextension-polyfill-ts';

export class Tabs {
  /**
   * Creates tab.
   * @url https://developers.chrome.com/extensions/tabs#method-create
   */
  static create(options: Browser.Tabs.CreateCreatePropertiesType)
      : Promise<any> {
    return Browser.browser.tabs.create(options)
    .catch(err => {
      console.log(`Tabs.create error ${err}`);
    });
  }

  /** Creates multiple tabs. */
  static createMultiple(options: Browser.Tabs.CreateCreatePropertiesType[])
      : Promise<any> {
    const createTabs: Promise<chrome.tabs.Tab>[] = [];
    // const tabIds: number[] = [];
    options.forEach(option => {
      createTabs.push(Tabs.create(option));
    });

    return Promise.all(createTabs)
    .catch(err => {
      console.log(`Tabs.createMultiple error ${err}`);
    })
  }

  /**
   * Creates tab group from array of tab ID.
   * @url https://developers.chrome.com/extensions/tabs#method-group
   * @url https://developers.chrome.com/extensions/tabGroups#method-update
   */
  static group(tabIds: number[], _options?: chrome.tabGroups.UpdateProperties)
      : Promise<any> {
    return new Promise((resolve, reject) => {
      chrome.tabs.group({
        tabIds,
      }, (groupId: number) => {
        if (groupId) {
          resolve(groupId);
        } else {
          reject('Tabs.group tab group not created');
        }
      });
    })
    .then((groupId) => {
      // TODO (frederickk): Update to Manifest V3.
      // chrome.tabGroups.update(groupId, options, (group: chrome.tabGroups.TabGroup) => {
      //   return group;
      // });
      return groupId;
    })
    .catch(err => {
      console.log(`Tabs.group error ${err}`);
    });
  }
}
