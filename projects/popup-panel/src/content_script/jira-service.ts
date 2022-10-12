import axios, {AxiosInstance} from "axios";
import {IssueType, JIRA_FIELD, JiraIssue, JiraIssueType, LOG_PREFIX} from "./define";
import {loadConfig} from "./utils";

function buildCreateIssueData(projKey: string, summary: string, issueType: IssueType, storyPoint: number | null, epicKey: string | null, sprintId: number | null, teamId: string | null): any {
  const data: any = {
      'fields': {
         'project':
         {
            'key': projKey
         },
         'assignee': null,
         'summary': summary,
         'description': '',
         'issuetype': {
            'name': issueType
         }
      }
    }
    if (epicKey) {
      data.fields[JIRA_FIELD.EPIC] = epicKey;
    }
    if (sprintId) {
      data.fields[JIRA_FIELD.SPRINT] = sprintId;
    }
    if(teamId) {
      data.fields[JIRA_FIELD.TEAM] = teamId;
    }
    if(storyPoint) {
      data.fields[JIRA_FIELD.STORY_POINT] = storyPoint;
    }
    return data;
}

function buildBlockIssueData(fromKey: string, toKey: string): any {
  return {
      'type': {
          'name': 'Blocks'
      },
      'inwardIssue': {
          'key': fromKey,
      },
      'outwardIssue': {
          'key': toKey,
      }
  };
}

export class JiraService {
  MAX_RESULTS = 100;
  private config: {jiraDomain: string, email: string, apiToken: string};
  private _authHeader: {[key: string]: string};

  constructor() {
    loadConfig(['jiraDomain', 'email', 'apiToken']).then((config) => {
      this.config = config;
    });
  }

  private get authHeader(): {[key: string]: string} {
    if (!this._authHeader) {
      const auth = window.btoa(`${this.config.email}:${this.config.apiToken}`);
      this._authHeader = {
        'Authorization': `Basic ${auth}`
      };
    }
    return this._authHeader;
  }

  getIssueUrl(issueKey: string): string {
    return `https://${this.config.jiraDomain}.atlassian.net/browse/${issueKey}`;
  }

  async getFields(): Promise<void> {
    const ret = await this.client.get('/rest/api/2/field');
    console.log('fields', ret);
  }

  async getIssue(key: string): Promise<JiraIssue | null> {
    try {
      const ret = await this.client.get(`/rest/api/2/issue/${key}`);
      console.log(LOG_PREFIX, 'get issue', ret);

      let sprints = ret.data.fields[JIRA_FIELD.SPRINT] ?? [];
      sprints = sprints.filter((s: any) => s.state !== 'closed');

      return {
        id: ret.data.id,
        key: ret.data.key,
        summary: ret.data.fields.summary,
        issueType: ret.data.fields.issuetype.name,
        projKey: ret.data.fields.project.key,
        epicKey: ret.data.fields[JIRA_FIELD.EPIC] ?? null,
        teamId: ret.data.fields[JIRA_FIELD.TEAM]?.id ?? null,
        sprintId: sprints.length > 0 ? sprints[0].id : null,
      }
    } catch (e) {
      return null;
    }
  }

  async createIssue(fieldSource: JiraIssue, summary: string, issueType: IssueType, storyPoint: number | null): Promise<string | null> {
    console.log(LOG_PREFIX, 'create issue');
    const data = buildCreateIssueData(fieldSource.projKey, summary, issueType, storyPoint, fieldSource.epicKey, fieldSource.sprintId, fieldSource.teamId);

    try {
      const ret = await this.client.post('/rest/api/2/issue/', data);
      console.log(LOG_PREFIX, 'create ret', ret);
      return ret.data.key;
    } catch (e) {
      return null;
    }
  }

  async blockIssue(fromKey: string, toKey: string): Promise<boolean> {
    console.log(LOG_PREFIX, 'block issue');
    const data = buildBlockIssueData(fromKey, toKey);
    try {
      await this.client.post('/rest/api/2/issueLink', data);
      return true;
    } catch (e) {
      return false;
    }
  }

  async getIssuesBySprint(sprintId: string, startAt = 0, maxResults = this.MAX_RESULTS): Promise<JiraIssue[] | null> {
    try {
      const ret = await this.client.get(`/rest/agile/1.0/sprint/${sprintId}/issue`, { params: {startAt, maxResults}});
      const issues = ret.data.issues.map((issue: any) => {
        return {
          id: issue.id,
          key: issue.key,
          summary: issue.fields.summary,
          issueType: issue.fields.issuetype.name,
          projKey: issue.fields.project.key,
          epicKey: issue.fields[JIRA_FIELD.EPIC] ?? null,
          teamId: issue.fields[JIRA_FIELD.TEAM]?.id ?? null,
          sprintId: issue.fields[JIRA_FIELD.SPRINT]?.length > 0 ? issue.fields[JIRA_FIELD.SPRINT][0].id : null,
          issueLinks: issue.fields.issuelinks,
        }
      });
      return issues;

    } catch (e) {
      console.error(e);
      return null;
    }
  }

  async rankIssueAfter(issueKeys: string[], afterIssueKey: string): Promise<boolean> {
    try {
      const data = {
        'rankAfterIssue': afterIssueKey,
        'rankCustomFieldId': 10009,
        'issues': issueKeys,
      };
      await this.client.put('/rest/agile/1.0/issue/rank', data);
      return true;
    } catch (e) {
      console.error('rankIssueAfter', 'afterIssueKey', afterIssueKey, 'issueKeys', issueKeys);
      return false;
    }
  }

  private get client(): AxiosInstance {
    return axios.create({
      baseURL: `https://${this.config.jiraDomain}.atlassian.net`,
      headers: this.authHeader,
    });
  }
}


export const jiraService = new JiraService();
