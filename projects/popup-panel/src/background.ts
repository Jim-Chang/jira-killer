

chrome.runtime.onInstalled.addListener(() => {
  console.log('on install');
  // chrome.webNavigation.onCompleted.addListener(() => {
  //   chrome.tabs.query({ active: true, currentWindow: true }, ([{ id }]) => {
  //     if (id) {
  //       chrome.action.disable(id);
  //     }
  //   });
  // }, { url: [{ hostContains: 'google.com' }] });
});
