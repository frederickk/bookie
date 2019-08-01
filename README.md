![Bookie icon](./assets/icon-16.png) 

# Bookie 

### Bookie is a [Chrome Extension](https://chrome.google.com/webstore/detail/bookie/bfjfkconjpndkfkjinlahajgnlkbdkgp) that makes a currated set of bookmarks accesible within the Chrome menubar.


![Bookie menu](./assets/screenshot-00.png)

The bookmarks within Bookie are simply Chrome bookmarks stored in a folder called "Bookie". You can manage the entries for Bookie within the menu itself (via edit and add options) or simply through the native Chrome bookmarks UI.

![Bookie menu](./assets/screenshot-03.png)


---
## Installation

**Chrome Store**

1. Visit [Chrome store](https://chrome.google.com/webstore/detail/bookie/bfjfkconjpndkfkjinlahajgnlkbdkgp)
2. Et voilà!

**Developer**

1. Select ```Extensions``` under the ```Tools``` menu or go to [chrome://extensions](chrome://extensions).
2. Ensure that the ```Developer mode``` checkbox in the top right-hand corner is checked.
3. Click ```Load unpacked extension...``` to pop up a file-selection dialog.
4. Navigate to the ```/src``` directory of this repo or drag and drop the ```/src``` directory onto the opened [chrome://extensions](chrome://extensions) tab.


---
## Build

| Command | Description |
|-|-|
| `$ npm run dev`   | Spin up Webpack watch task and development server ([0.0.0.0:1112](http://0.0.0.0:1112)) |
| `$ npm run build` | Compile (and uglify) necessary files into .zip (Chrome) and .zip (Firefox) |
| `$ npm run build:chrome` | Compile (and uglify) necessary files into .zip only for Chrome |
| `$ npm run build:firefox` | Compile (and uglify) necessary files into .zip only for Firefox |

