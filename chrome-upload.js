const webStore = require('chrome-webstore-upload')(/* credentials.json */);

const fs = require('fs');
const archive = fs.createReadStream('./bookie-chrome.zip');
const target = 'default';
const token = '';

webStore.uploadExisting(archive).then(res => {
  console.log(res);
  // Response is a Resource Representation
  // https://developer.chrome.com/webstore/webstore_api/items#resource
})

webStore.publish(target).then(res => {
  console.log(res);
  // Response is documented here:
  // https://developer.chrome.com/webstore/webstore_api/items/publish
});

