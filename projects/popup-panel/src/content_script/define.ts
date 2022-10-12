import {loadConfig} from "./utils";

export const LOG_PREFIX = '[Jira Killer]';

export const BACKLOG_LIST_ID = 'ghx-backlog';

export const DATA_TEST_ID = 'data-test-id';
export const ISSUE_DETAIL_VIEW_ID = 'issue.views.issue-details.issue-layout.issue-layout';
export const ISSUE_SUMMARY_H1_ID = 'issue.views.issue-base.foundation.summary.heading';
export const ISSUE_DESC_DIV_ID = 'issue.views.field.rich-text.description';


class JiraField {
  private config: {
    teamFieldId: string;
    sprintFieldId: string;
    epicFieldId: string;
    storyPointFieldId: string;
  };

  private preifx = 'customfield_';

  constructor() {
    loadConfig(['teamFieldId', 'sprintFieldId', 'epicFieldId', 'storyPointFieldId']).then((config) => {
      this.config = config;
    });
  }

  get TEAM(): string {
    return `${this.preifx}${this.config.teamFieldId}`;
  }

  get SPRINT(): string {
    return `${this.preifx}${this.config.sprintFieldId}`;
  }

  get EPIC(): string {
    return `${this.preifx}${this.config.epicFieldId}`;
  }

  get STORY_POINT(): string {
    return `${this.preifx}${this.config.storyPointFieldId}`;
  }
}

export const JIRA_FIELD = new JiraField();

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
  issueLinks?: JiraIssueLink[];
}

export type JiraIssueLink = {
  type: {
    name: string;
  },
  outwardIssue: {
    key: string;
    fields: {
      issuetype: {
        name: string;
      }
    }
  },
}
