import * as $ from 'jquery';

function initBlackTheme() {
  chrome.storage.sync.get('jiraInBlack', (cfg) => {
    if (cfg.jiraInBlack) {
      $('html').attr('jira-in-black', '');
    }
  });
}

function initPanelNgApp() {
  window.addEventListener('DOMContentLoaded', () => {
    // set data for angular panel app
    $(
      `<jira-killer-id id="jiraKillerId" data-runtime-id="${
        chrome.runtime.id
      }" data-asset-root-url="${chrome.runtime.getURL('content-panel/assets/')}"></jira-killer-id>`,
    ).appendTo(document.body);

    // prepare source link of angular panel app
    const runtime = chrome.runtime.getURL('content-panel/runtime.js');
    const polyfills = chrome.runtime.getURL('content-panel/polyfills.js');
    const vendor = chrome.runtime.getURL('content-panel/vendor.js');
    const main = chrome.runtime.getURL('content-panel/main.js');

    let ngSrcHtml = '';
    [runtime, polyfills, vendor, main].forEach((url) => (ngSrcHtml += `<script src="${url}" type="module"></script>`));
    $(ngSrcHtml).appendTo(document.head);
  });
}

function initMessageListener() {
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    // if target of message which is from background.js is web page,
    // use postMessage api of window to send message to panel app
    if (request.target === 'webPage') {
      window.postMessage({ event: request.event });
    }
  });
}

(() => {
  initBlackTheme();
  initPanelNgApp();
  initMessageListener();
})();
