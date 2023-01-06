import { ISSUE_STATUS_LIST, IssueStatusChangeLog, Issue } from '../define/base';
import { IssueStatus } from '../define/issue-status';
import { IssueType, JiraIssueType } from '../define/issue-type';
import {
  JiraChangelogHistory,
  JiraChangelogItem,
  JiraFixVersion,
  JiraIssue,
  JiraIssueLink,
  JiraSprint,
} from '../define/jira-type';
import { ConfigService } from './config.service';
import { JiraFieldService } from './jira-field.service';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import * as moment from 'moment';
import { EMPTY, expand, map, Observable, ReplaySubject, switchMap } from 'rxjs';

type Config = { jiraDomain: string; email: string; apiToken: string };

@Injectable({
  providedIn: 'root',
})
export class JiraService {
  MAX_RESULTS = 100;
  private CONFIG_KEYS = ['jiraDomain', 'email', 'apiToken'];

  private config: Config;
  private _authHeader: { [key: string]: string };
  private ready = new ReplaySubject<void>(1);

  constructor(private http: HttpClient, private configService: ConfigService, private fieldService: JiraFieldService) {
    this.configService.loadByKeys<Config>(this.CONFIG_KEYS).subscribe((cfg) => {
      this.config = cfg;
      this.ready.next();
    });
  }

  private get headers(): { [key: string]: string } {
    if (!this._authHeader) {
      const auth = window.btoa(`${this.config.email}:${this.config.apiToken}`);
      this._authHeader = {
        Authorization: `Basic ${auth}`,
      };
    }
    return this._authHeader;
  }

  private get baseURL(): string {
    return `https://${this.config.jiraDomain}.atlassian.net`;
  }

  getAllSprint(boardId: number, withClosed = false, maxResults = this.MAX_RESULTS): Observable<JiraSprint[]> {
    const state = withClosed ? 'active,future,close' : 'active,future';
    return this.ready.pipe(
      switchMap(() =>
        this.http.get<any>(`${this.baseURL}/rest/agile/1.0/board/${boardId}/sprint`, {
          headers: this.headers,
          params: { state, maxResults },
        }),
      ),
      map((ret) =>
        (ret.values as JiraSprint[]).filter((sp) => (!!sp.originBoardId ? sp.originBoardId === boardId : true)),
      ),
    );
  }

  getIssueUrl(issueKey: string): string {
    return `https://${this.config.jiraDomain}.atlassian.net/browse/${issueKey}`;
  }

  getIssue(key: string): Observable<Issue> {
    return this.ready.pipe(
      switchMap(() => this.http.get<JiraIssue>(`${this.baseURL}/rest/api/2/issue/${key}`, { headers: this.headers })),
      map((ret: JiraIssue) => {
        console.log('get issue', ret);
        const issue = this.bulidIssueFromJiraIssue(ret);
        console.log('clean issue', issue);
        return issue;
      }),
    );
  }

  getIssuesBySprint(sprintId: number, issueTypes: IssueType[] = []): Observable<Issue[]> {
    const params: any = { startAt: 0, maxResults: this.MAX_RESULTS };

    if (issueTypes.length > 0) {
      params.jql = `issuetype in (${issueTypes.join(',')})`;
    }

    const url = `${this.baseURL}/rest/agile/1.0/sprint/${sprintId}/issue`;
    let allIssues: Issue[] = [];

    return this.ready.pipe(
      switchMap(() => this.http.get<any>(url, { headers: this.headers, params })),
      expand((issues) => {
        if (issues.length > 0) {
          allIssues = [...allIssues, ...issues];
          params.startAt = allIssues.length;
          return this.http.get<any>(url, { headers: this.headers, params });
        }
        return EMPTY;
      }),
      map((ret) => {
        return ret.issues.map((issue: any) => this.bulidIssueFromJiraIssue(issue));
      }),
    );
  }

  getIssueStatusChangeLogsBySprint(sprintId: number, issueTypes: IssueType[] = []): Observable<IssueStatusChangeLog[]> {
    const params: any = { startAt: 0, maxResults: this.MAX_RESULTS, expand: 'changelog' };

    if (issueTypes.length > 0) {
      params.jql = `issuetype in (${issueTypes.join(',')})`;
    }

    const url = `${this.baseURL}/rest/agile/1.0/sprint/${sprintId}/issue`;
    let allIssues: Issue[] = [];

    const _isStatusChangelog = (item: JiraChangelogItem) => item.field === 'status';

    const _genStatusLogMap = (changeHistories: JiraChangelogHistory[]) => {
      const map: { [status in IssueStatus]: moment.Moment | null } = {} as any;
      ISSUE_STATUS_LIST.forEach((status) => (map[status] = null));

      changeHistories.forEach((h) => {
        if (h.items.length > 0) {
          // only take first item now
          const item = h.items[0];
          const toStatus = item.toString as IssueStatus;
          // if one status appear twice or above, will take last created time.
          if (_isStatusChangelog(item) && ISSUE_STATUS_LIST.includes(toStatus)) {
            map[toStatus] = moment(h.created);
          }
        }
      });
      return map;
    };

    return this.ready.pipe(
      switchMap(() => this.http.get<any>(url, { headers: this.headers, params })),
      expand((issues) => {
        if (issues.length > 0) {
          allIssues = [...allIssues, ...issues];
          params.startAt = allIssues.length;
          return this.http.get<any>(url, { headers: this.headers, params });
        }
        return EMPTY;
      }),
      map((ret) => {
        return ret.issues.map((_issue: any) => {
          let issue = _issue as JiraIssue;
          // let histories sort asc of create date
          const changeHistories = issue.changelog!.histories.reverse();
          return {
            key: issue.key,
            storyPoint: issue.fields[this.fieldService.storyPointField] ?? null,
            statusLogMap: _genStatusLogMap(changeHistories),
          };
        });
      }),
    );
  }

  createIssue(
    fieldSource: Issue,
    summary: string,
    issueType: IssueType,
    storyPoint: number | null,
  ): Observable<string> {
    console.log('create issue');
    const data = this.buildCreateIssueData(
      fieldSource.projKey,
      summary,
      issueType,
      storyPoint,
      fieldSource.epicKey,
      fieldSource.sprintId,
      fieldSource.teamId,
    );
    return this.ready.pipe(
      switchMap(() => this.http.post<any>(`${this.baseURL}/rest/api/2/issue/`, data, { headers: this.headers })),
      map((ret) => ret.key),
    );
  }

  createSubtask(fieldSource: Issue, summary: string, storyPoint: number | null): Observable<string> {
    console.log('create subtask');
    const data = this.buildCreateSubtaskData(
      fieldSource.projKey,
      fieldSource.key,
      summary,
      storyPoint,
      fieldSource.teamId,
    );
    return this.ready.pipe(
      switchMap(() => this.http.post<any>(`${this.baseURL}/rest/api/2/issue/`, data, { headers: this.headers })),
      map((ret) => ret.key),
    );
  }

  blockIssue(fromKey: string, toKey: string): Observable<boolean> {
    console.log('block issue');
    const data = this.buildBlockIssueData(fromKey, toKey);
    return this.ready.pipe(
      switchMap(() => this.http.post<any>(`${this.baseURL}/rest/api/2/issueLink`, data, { headers: this.headers })),
      map(() => true),
    );
  }

  transitIssue(key: string, status: IssueStatus): Observable<void> {
    console.log('transit issue');
    const data = {
      transition: {
        name: status,
      },
    };
    return this.ready.pipe(
      switchMap(() =>
        this.http.post<any>(`${this.baseURL}/rest/api/2/issue/${key}/transitions`, data, { headers: this.headers }),
      ),
      map((ret) => console.log(ret)),
    );
  }

  rankIssueAfter(issueKeys: string[], afterIssueKey: string): Observable<boolean> {
    const data = {
      rankAfterIssue: afterIssueKey,
      rankCustomFieldId: 10009,
      issues: issueKeys,
    };
    return this.ready.pipe(
      switchMap(() => this.http.put<any>(`${this.baseURL}/rest/agile/1.0/issue/rank`, data, { headers: this.headers })),
      map(() => true),
    );
  }

  updateFixVersionOfIssue(key: string, fixVersions: JiraFixVersion[]): Observable<void> {
    console.log('updateFixVersionOfIssue');
    const data = {
      fields: {
        fixVersions,
      },
    };
    return this.ready.pipe(
      switchMap(() => this.http.put<any>(`${this.baseURL}/rest/api/2/issue/${key}`, data, { headers: this.headers })),
    );
  }

  private buildCreateIssueData(
    projKey: string,
    summary: string,
    issueType: IssueType,
    storyPoint: number | null,
    epicKey: string | null,
    sprintId: number | null,
    teamId: string | null,
  ): any {
    const data: any = {
      fields: {
        project: {
          key: projKey,
        },
        assignee: null,
        summary: summary,
        description: '',
        issuetype: {
          name: issueType,
        },
      },
    };
    if (epicKey) {
      data.fields[this.fieldService.epicField] = epicKey;
    }
    if (sprintId) {
      data.fields[this.fieldService.sprintField] = sprintId;
    }
    if (teamId) {
      data.fields[this.fieldService.teamField] = teamId;
    }
    if (storyPoint) {
      data.fields[this.fieldService.storyPointField] = storyPoint;
    }
    return data;
  }

  private buildCreateSubtaskData(
    projKey: string,
    parentKey: string,
    summary: string,
    storyPoint: number | null,
    teamId: string | null,
  ): any {
    const data: any = {
      fields: {
        project: {
          key: projKey,
        },
        parent: {
          key: parentKey,
        },
        assignee: null,
        summary: summary,
        description: '',
        issuetype: {
          name: JiraIssueType.Subtask,
        },
      },
    };
    if (teamId) {
      data.fields[this.fieldService.teamField] = teamId;
    }
    if (storyPoint) {
      data.fields[this.fieldService.storyPointField] = storyPoint;
    }
    return data;
  }

  private buildBlockIssueData(fromKey: string, toKey: string): any {
    return {
      type: {
        name: 'Blocks',
      },
      inwardIssue: {
        key: fromKey,
      },
      outwardIssue: {
        key: toKey,
      },
    };
  }

  private bulidIssueFromJiraIssue(jiraIssue: JiraIssue): Issue {
    let sprints = jiraIssue.fields[this.fieldService.sprintField] ?? [];
    sprints = sprints.filter((s: JiraSprint) => s.state !== 'closed');
    return {
      id: jiraIssue.id,
      key: jiraIssue.key,
      summary: jiraIssue.fields.summary,
      issueType: jiraIssue.fields.issuetype.name,
      projKey: jiraIssue.fields.project.key,
      epicKey: jiraIssue.fields[this.fieldService.epicField] ?? null,
      teamId: jiraIssue.fields[this.fieldService.teamField]?.id ?? null,
      sprintId: sprints.length > 0 ? sprints[0].id : null,
      issueLinks: jiraIssue.fields.issuelinks,
      status: jiraIssue.fields.status.name,
      storyPoint: jiraIssue.fields[this.fieldService.storyPointField] ?? null,
      assignee: jiraIssue.fields.assignee,
      subtasks: jiraIssue.fields.subtasks,
      fixVersions: jiraIssue.fields.fixVersions,
    };
  }
}
