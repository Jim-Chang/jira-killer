import axios, {AxiosInstance} from "axios";
import {IssueType, JIRA_FIELD, JiraIssue, JiraIssueType, LOG_PREFIX} from "./define";
import {from} from "rxjs";

function getJiraDomain(): string {
  return 'hardcoretech';
}

function getJiraEmail(): string {
  return 'jim.chang@hardcoretech.co';
}

function getJiraApiToken(): string {
  return 'rX15poCv5WGAzQ1fGj8Y4942';
}

function getJiraAuthHeader(): {[key: string]: string} {
  const email = getJiraEmail();
  const apiToken = getJiraApiToken();
  const auth = window.btoa(`${email}:${apiToken}`);
  return {
    'Authorization': `Basic ${auth}`
  };
}

function buildCreateIssueData(projKey: string, summary: string, issueType: IssueType, storyPoint: number, epicKey: string | null, sprintId: number | null, teamId: string | null): any {
  const data: any = {
      'fields': {
         'project':
         {
            'key': projKey
         },
         'summary': summary,
         'description': '',
         'issuetype': {
            'name': issueType
         },
        [JIRA_FIELD.STORY_POINT]: storyPoint,
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

  async getFields(): Promise<void> {
    const ret = await this.client.get('/rest/api/2/field');
    console.log('fields', ret);
  }

  async getIssue(key: string): Promise<JiraIssue | null> {
    try {
      const ret = await this.client.get(`/rest/api/2/issue/${key}`);
      console.log(LOG_PREFIX, 'get issue', ret);

      return {
        id: ret.data.id,
        key: ret.data.key,
        summary: ret.data.fields.summary,
        issueType: ret.data.fields.issuetype.name,
        projKey: ret.data.fields.project.key,
        epicKey: ret.data.fields[JIRA_FIELD.EPIC] ?? null,
        teamId: ret.data.fields[JIRA_FIELD.TEAM]?.id ?? null,
        sprintId: ret.data.fields[JIRA_FIELD.SPRINT]?.length > 0 ? ret.data.fields[JIRA_FIELD.SPRINT][0].id : null,
      }
    } catch (e) {
      return null;
    }
  }

  async createIssue(fieldSource: JiraIssue, summary: string, issueType: IssueType, storyPoint: number): Promise<string | null> {
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
      const ret = await this.client.post('/rest/api/2/issueLink', data);
      console.log(LOG_PREFIX, 'block ret', ret);
      return true;
    } catch (e) {
      return false;
    }
  }

  private get client(): AxiosInstance {
    const domain = getJiraDomain();
    const headers = getJiraAuthHeader();
    return axios.create({
      baseURL: `https://${domain}.atlassian.net`,
      headers: headers,
    });
  }
}


export const jiraService = new JiraService();
