chrome.runtime.onMessageExternal.addListener((request, sender, sendResponse) => {
  console.log('sender', sender);

  if (request.chromeApi === 'storage.sync.get') {
    chrome.storage.sync.get(request.data.keys, (items) => {
      console.log('storage', items);
      sendResponse(items);
    });
  }
});
