import * as $ from "jquery";

const runtime = chrome.runtime.getURL('content-panel/runtime.js');
const polyfills = chrome.runtime.getURL('content-panel/polyfills.js');
const vendor = chrome.runtime.getURL('content-panel/vendor.js');
const main = chrome.runtime.getURL('content-panel/main.js');

let ngSrcHtml = '';
[runtime, polyfills, vendor, main].forEach((url) => ngSrcHtml += `<script src="${url}" type="module"></script>`);
$(ngSrcHtml).appendTo(document.head);
