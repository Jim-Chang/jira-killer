import * as moment from 'moment';

let EXTENSION_ID = '';
let ASSET_ROOT_URL = '';

export function setExtensionId(id: string): void {
  EXTENSION_ID = id;
}

export function getExtensionId(): string {
  return EXTENSION_ID;
}

export function setAssetRootUrl(url: string): void {
  ASSET_ROOT_URL = url;
}

export function getAssetUrl(path: string): string {
  return `${ASSET_ROOT_URL}${path}`;
}

export const LOG_PREFIX = '[Jira Killer]';

export enum JiraIssueType {
  Epic = 'Epic',
  Story = 'Story',
  Task = 'Task',
  Bug = 'Bug',
  Test = 'Test',
  Improvement = 'Improvement',
  Subtask = 'Sub-task',
}

export enum CustomIssueType {
  FETask = 'RD Frontend',
  BETask = 'RD Backend',
}

export type IssueType = JiraIssueType | CustomIssueType;

export enum IssueLinkType {
  Blocks = 'Blocks',
}

export const ISSUE_PREFIX_MAP: { [key: string]: string } = {
  [CustomIssueType.FETask]: 'RD<FE> - ',
  [CustomIssueType.BETask]: 'RD<BE> - ',
  [JiraIssueType.Task]: 'RD - ',
  [JiraIssueType.Test]: 'QA - ',
};

export enum IssueStatus {
  Open = 'Open',
  ToBeHandled = 'To be Handled',
  InProgress = 'In Progress',
  InReview = 'In Review',
  Resolved = 'Resolved',
  ReadyForVerification = 'Ready for Verification',
  Done = 'Done',
  Closed = 'Closed',
}

export const ISSUE_STATUS_LIST = Object.values(IssueStatus);

export type IssueStatusChangeDate = {
  key: string;
  storyPoint: number | null;
  changeDateMap: {
    [status in IssueStatus]: moment.Moment | null;
  };
};

export type JiraUser = {
  accountId: string;
  displayName: string;
  avatarUrls: {
    '16x16': string;
    '24x24': string;
    '32x32': string;
    '48x48': string;
  };
};

export type JiraIssue = {
  id: string;
  key: string;
  summary: string;
  issueType: string;
  projKey: string;
  epicKey: string | null;
  teamId: string | null;
  sprintId: number | null;
  status: IssueStatus;
  issueLinks?: JiraIssueLink[];
  storyPoint: number | null;
  assignee: JiraUser | null;
};

export type LinkedIssue = {
  key: string;
  fields: {
    summary: string;
    issuetype: {
      name: IssueType;
    };
    status: {
      name: IssueStatus;
    };
  };
};

export type JiraIssueLink = {
  type: {
    name: IssueLinkType;
  };
  outwardIssue?: LinkedIssue;
  inwardIssue?: LinkedIssue;
};

export type JiraSprint = {
  id: number;
  self: string;
  state: string;
  name: string;
  goal: string;
  startDate?: string;
  endDate?: string;
  completeDate?: string;
  originBoardId?: number;
};

export type JiraChangelogHistory = {
  id: string;
  created: string;
  items: {
    field: string;
    fromString: string;
    toString: string;
  }[];
};

export type BurnUpChartData = {
  totalPoints: number;
  [IssueStatus.InReview]: number[];
  [IssueStatus.ReadyForVerification]: number[];
  [IssueStatus.Closed]: number[];
};
