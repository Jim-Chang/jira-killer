export function getUrlSelectedIssueId(): string | null {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  return urlParams.get('selectedIssue');
}

export function getUrlBoardId(): number | null {
  const reg =  /\/boards\/[0-9]*/;
  // https://xxx.atlassian.net/jira/software/c/projects/xxx/boards/91/backlog?issueLimit=100
  const match = window.location.href.match(reg);
  if (match) {
    // ['', 'boards', '91']
    const id = match[0].split('/')[2];
    return parseInt(id);
  }
  return null;
}
