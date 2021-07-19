/**
 * @fileoverview Wrapper class for Chrome Tabs and TabGroups API.
 * @url https://developers.chrome.com/extensions/tabs
 * @url https://developers.chrome.com/extensions/tabGroups
 */

type TabCallback = (tab?: chrome.tabs.Tab) => any;

export class Tabs {
  /**
   * Creates tab.
   * @url
   */
  static create(options: chrome.tabs.CreateProperties, callback?: TabCallback)
      : Promise<chrome.tabs.Tab> {
    return new Promise((resolve, reject) => {
      chrome.tabs.create(options, (tab: chrome.tabs.Tab) => {
        if (chrome.runtime.lastError) {
          reject(`'Tabs.create ${chrome.runtime.lastError}`);
        }
        if (tab) {
          if (callback) {
            callback(tab);
          }
          resolve(tab);
        } else {
          reject('Tabs.create tab not created');
        }
      });
    });
  }

  /** Creates multiple tabs. */
  static createMultiple(options: chrome.tabs.CreateProperties[])
      : Promise<chrome.tabs.Tab[]> {
    const createTabs: Promise<chrome.tabs.Tab>[] = [];
    // const tabIds: number[] = [];
    options.forEach(option => {
      createTabs.push(Tabs.create(option));
    });

    return Promise.all(createTabs)
    .then(result => {
      return result;
    });
  }

  /** Creates tab group from array of tab ID. */
  static group(tabIds: number[], _options?: chrome.tabGroups.UpdateProperties) {
    const groupCreatePromise: Promise<number> = new Promise((resolve, reject) => {
      chrome.tabs.group({
        tabIds,
      }, (groupId: number) => {
        if (groupId) {
          resolve(groupId);
        } else {
          reject('Tabs.group tab group not created');
        }
      });
    });

    return groupCreatePromise
    .then((groupId: number) => {
      // TODO (frederickk): Update to Manifest V3.
      // chrome.tabGroups.update(groupId, options, (group: chrome.tabGroups.TabGroup) => {
      //   return group;
      // });
      return groupId;
    });

  }

}
