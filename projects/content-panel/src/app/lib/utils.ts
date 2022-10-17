export function getUrlSelectedIssueId(): string | null {
  // case 1: has query param of selectedIssue
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  const selectedIssueKey = urlParams.get('selectedIssue');
  if (selectedIssueKey) {
    return selectedIssueKey;
  }

  // case 2: browse issue
  // https://xxxx.atlassian.net/browse/xxx-1234
  const browseIssueReg = /\/browse\/[a-zA-Z]*-[0-9]*/;
  const match = window.location.href.match(browseIssueReg);
  if (match) {
    // ['', 'browse', 'TEST-256']
    return match[0].split('/')[2];
  }

  return null;
}

export function getUrlBoardId(): number | null {
  const reg = /\/boards\/[0-9]*/;
  // https://xxx.atlassian.net/jira/software/c/projects/xxx/boards/91/backlog?issueLimit=100
  const match = window.location.href.match(reg);
  if (match) {
    // ['', 'boards', '91']
    const id = match[0].split('/')[2];
    return parseInt(id);
  }
  return null;
}
