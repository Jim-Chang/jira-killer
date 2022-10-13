import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {ConfigService} from "./config.service";
import {map, Observable, ReplaySubject, switchMap} from "rxjs";
import {JiraIssue} from "../lib/define";
import {JiraFieldService} from "./jira-field.service";

type Config = {jiraDomain: string, email: string, apiToken: string};

@Injectable({
  providedIn: 'root',
})
export class JiraService {
  CONFIG_KEYS = ['jiraDomain', 'email', 'apiToken'];

  private config: Config;
  private _authHeader: {[key: string]: string};
  private ready = new ReplaySubject<void>(1);

  constructor(private http: HttpClient, private configService: ConfigService, private fieldService: JiraFieldService) {
    this.configService.loadByKeys<Config>(this.CONFIG_KEYS).subscribe((cfg) => {
      this.config = cfg;
      this.ready.next();
    })
  }

  private get headers(): {[key: string]: string} {
    if (!this._authHeader) {
      const auth = window.btoa(`${this.config.email}:${this.config.apiToken}`);
      this._authHeader = {
        'Authorization': `Basic ${auth}`
      };
    }
    return this._authHeader;
  }

  private get baseURL(): string {
    return `https://${this.config.jiraDomain}.atlassian.net`;
  }

  getIssue(key: string): Observable<JiraIssue> {
    return this.ready.pipe(
      switchMap(() => this.http.get<any>(`${this.baseURL}//rest/api/2/issue/${key}`, {headers: this.headers})),
      map((ret: any) => {
        console.log('get issue', ret);

        let sprints = ret.fields[this.fieldService.sprintField] ?? [];
        sprints = sprints.filter((s: any) => s.state !== 'closed');

        const issue: JiraIssue = {
          id: ret.id,
          key: ret.key,
          summary: ret.fields.summary,
          issueType: ret.fields.issuetype.name,
          projKey: ret.fields.project.key,
          epicKey: ret.fields[this.fieldService.epicField] ?? null,
          teamId: ret.fields[this.fieldService.teamField]?.id ?? null,
          sprintId: sprints.length > 0 ? sprints[0].id : null,
        };
        return issue;
      })
    );
  }


}
