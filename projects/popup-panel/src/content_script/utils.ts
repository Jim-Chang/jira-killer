import {BACKLOG_LIST_ID, DATA_TEST_ID, ISSUE_DESC_DIV_ID, ISSUE_SUMMARY_H1_ID} from "./define";
import * as $ from "jquery";

export function getBacklogList(): JQuery {
  return $(`div[id="${BACKLOG_LIST_ID}"`);
}

export function getJiraJqEle(tag: string, testId: string): JQuery {
  return $(`${tag}[${DATA_TEST_ID}="${testId}"]`);
}

export function getIssueSummary(): string {
  return getJiraJqEle('h1', ISSUE_SUMMARY_H1_ID).html();
}

export function getUrlSelectedIssueId(): string | null {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  return urlParams.get('selectedIssue');
}

export function insertAfterIssueDesc(ele: string | JQuery): void {
  getJiraJqEle('div', ISSUE_DESC_DIV_ID).parent().after(ele);
}

export function loadConfig(keys: string[]): Promise<any> {
  return new Promise<any>((resolve) => {
    chrome.storage.sync.get(keys, (items) => {
      resolve(items);
    });
  });
}


