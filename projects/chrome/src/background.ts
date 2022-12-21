// message with angular panel app
chrome.runtime.onMessageExternal.addListener((request, sender, sendResponse) => {
  console.log('sender', sender);

  if (request.chromeApi === 'storage.sync.get') {
    chrome.storage.sync.get(request.data.keys, (items) => {
      console.log('storage', items);
      sendResponse(items);
    });
  }
});

// watch jira call set assignee api
chrome.webRequest.onCompleted.addListener(
  (details) => {
    console.log('catch jira web reqeust of set assignee', details);

    // send message to active tab content script
    (async () => {
      const tab = await getActiveTab();
      await chrome.tabs.sendMessage(tab.id, { target: 'webPage', event: 'jiraAppSetAssignee' });
    })();
  },
  { urls: ['https://*.atlassian.net/rest/api/*/issue/*/assignee*'] },
);

// watch jira call set story point api
chrome.webRequest.onCompleted.addListener(
  (details) => {
    console.log('catch jira web reqeust of set story point', details);

    // send message to active tab content script
    (async () => {
      const tab = await getActiveTab();
      await chrome.tabs.sendMessage(tab.id, { target: 'webPage', event: 'jiraAppSetStoryPoint' });
    })();
  },
  { urls: ['https://*.atlassian.net/secure/AjaxIssueAction.jspa*'] },
);

async function getActiveTab(): Promise<chrome.tabs.Tab> {
  const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
  return tab;
}
