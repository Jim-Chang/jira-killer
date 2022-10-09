export const LOG_PREFIX = '[Jira Killer]';

export const DATA_TEST_ID = 'data-test-id';
export const ISSUE_DETAIL_VIEW_ID = 'issue.views.issue-details.issue-layout.issue-layout';
export const ISSUE_SUMMARY_H1_ID = 'issue.views.issue-base.foundation.summary.heading';
export const ISSUE_DESC_DIV_ID = 'issue.views.field.rich-text.description';


export const JIRA_FIELD = {
  EPIC: 'customfield_10006',
  TEAM: 'customfield_10401',
  SPRINT: 'customfield_10004',
  STORY_POINT: 'customfield_10002',
};

export enum JiraIssueType {
  Epic = 'Epic',
  Story = 'Story',
  Task = 'Task',
  Bug = 'Bug',
  Test = 'Test',
}


export enum CustomIssueType {
  FETask = 'RD Frontend',
  BETask = 'RD Backend',
}

export type IssueType = JiraIssueType | CustomIssueType;

export type JiraIssue = {
  id: string;
  key: string;
  summary: string;
  issueType: string;
  projKey: string;
  epicKey: string | null;
  teamId: string | null;
  sprintId: number | null;
}
