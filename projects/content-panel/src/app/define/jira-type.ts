import { IssueLinkType } from './base';
import { IssueStatus } from './issue-status';
import { IssueType } from './issue-type';

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
  fields: {
    summary: string;
    issuetype: {
      name: IssueType;
    };
    project: {
      key: string;
    };
    status: {
      name: IssueStatus;
    };
    assignee: JiraUser;
    subtasks: JiraIssue[];

    issuelinks?: JiraIssueLink[];
    [key: string]: any;
  };
  changelog?: {
    histories: JiraChangelogHistory[];
  };
};

export type JiraLinkedIssue = {
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
  outwardIssue?: JiraLinkedIssue;
  inwardIssue?: JiraLinkedIssue;
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
  items: JiraChangelogItem[];
};

export type JiraChangelogItem = {
  field: string;
  fromString: string;
  toString: string;
};
