import * as $ from 'jquery';

chrome.storage.sync.get('jiraInBlack', (cfg) => {
  if (!cfg.jiraInBlack) {
    $('html').attr('jira-not-in-black', '');
  }
});

$(
  `<jira-killer-id id="jiraKillerId" data-runtime-id="${
    chrome.runtime.id
  }" data-asset-root-url="${chrome.runtime.getURL('content-panel/assets/')}"></jira-killer-id>`,
).appendTo(document.body);

const runtime = chrome.runtime.getURL('content-panel/runtime.js');
const polyfills = chrome.runtime.getURL('content-panel/polyfills.js');
const vendor = chrome.runtime.getURL('content-panel/vendor.js');
const main = chrome.runtime.getURL('content-panel/main.js');

let ngSrcHtml = '';
[runtime, polyfills, vendor, main].forEach((url) => (ngSrcHtml += `<script src="${url}" type="module"></script>`));
$(ngSrcHtml).appendTo(document.head);
