// {
//   "access_token": "ya29.GlsqBxylv4MIuaVMH17bdjs0XSm2me0wOtUxcScmkIRHSSg5XnWYE1EpcwNLlVXaE0lBXDwGOSiB2j2sqXPe5G5LnOu9hLkhx9wJIqEF2guGQAvt843dcwXxuuxX",
//   "expires_in": 3600,
//   "refresh_token": "1/djksSPrUj80n0cUSv9TW9xJCA-gSEK_zK2Ucgywun77eww2jC7gJaOYAGMFfsLfE",
//   "scope": "https://www.googleapis.com/auth/chromewebstore",
//   "token_type": "Bearer"
// }%  

const webStore = require('chrome-webstore-upload')({
  extensionId: 'ecnglinljpjkbgmdpeiglonddahpbkeb',
  clientId: '431639040992-5f4hrbqfskt01osptvuggu8jupjin57v.apps.googleusercontent.com',
  clientSecret: 'Dl92q3vPGuNoEA5FO9Xdk1K6',
  refreshToken: '1/djksSPrUj80n0cUSv9TW9xJCA-gSEK_zK2Ucgywun77eww2jC7gJaOYAGMFfsLfE',
});

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

