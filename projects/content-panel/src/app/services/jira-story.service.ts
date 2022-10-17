import {Injectable} from "@angular/core";
import {JiraService} from "./jira.service";
import {
  ISSUE_PREFIX_MAP,
  IssueLinkType,
  IssueStatus,
  JiraIssue,
  JiraIssueLink,
  JiraIssueType,
  LinkedIssue
} from "../lib/define";
import {map, Observable} from "rxjs";

type TransitData = {
  [IssueStatus.ToBeHandled]: JiraIssue[];
  [IssueStatus.InProgress]: JiraIssue[];
  [IssueStatus.InReview]: JiraIssue[];
  [IssueStatus.Resolved]: JiraIssue[];
}

type ChangeSpec = {
  notInStatusList: IssueStatus[],
  inStatusList: IssueStatus[],
}

const CHANGE_SPEC_MAP = {
  [IssueStatus.ToBeHandled]: {
    notInStatusList: [] as IssueStatus[],
    inStatusList: [IssueStatus.ToBeHandled],
  },
  [IssueStatus.InProgress]: {
    notInStatusList: [],
    inStatusList: [IssueStatus.InProgress],
  },
  [IssueStatus.InReview]: {
    notInStatusList: [IssueStatus.Open, IssueStatus.ToBeHandled, IssueStatus.InProgress],
    inStatusList: [IssueStatus.InReview],
  },
  [IssueStatus.Resolved]: {
    notInStatusList: [IssueStatus.Open, IssueStatus.ToBeHandled, IssueStatus.InProgress, IssueStatus.InReview],
    inStatusList: [IssueStatus.Resolved],
  },
}

@Injectable({
  providedIn: 'root',
})
export class JiraStoryService {

  constructor(private jiraService: JiraService) {
  }

  doTransitStoryStatus$(sprintId: number): Observable<TransitData> {
    return this.jiraService.getIssuesBySprint(sprintId, [JiraIssueType.Story]).pipe(
      map((issues) => this.transitIssueToNewStatus(issues)),
      // switchMap((transitData) => {
      //   console.log('transit data', transitData);
      //   const reqs$ = Object.entries(transitData).map(([status, issues]) => (
      //     issues.map((issue) => this.jiraService.transitIssue(issue.key, status as IssueStatus))
      //   )).reduce((prev, curr) => [...prev, ...curr], []);
      //   return combineLatest(reqs$);
      // }),
      // map((ret) => console.log('transit api result', ret))
    )
  }

  private transitIssueToNewStatus(issues: JiraIssue[]): TransitData {
    const data: TransitData = {
      [IssueStatus.ToBeHandled]: [],
      [IssueStatus.InProgress]: [],
      [IssueStatus.InReview]: [],
      [IssueStatus.Resolved]: [],
    };
    issues.forEach((issue) => {
      const newStatus = this.needChangeToStatus(issue);
      if (newStatus === IssueStatus.ToBeHandled) {
        data[IssueStatus.ToBeHandled].push(issue);
      } else if (newStatus === IssueStatus.InProgress) {
        data[IssueStatus.InProgress].push(issue);
      } else if (newStatus === IssueStatus.InReview) {
        data[IssueStatus.InReview].push(issue);
      } else if (newStatus === IssueStatus.Resolved) {
        data[IssueStatus.Resolved].push(issue);
      }
    })
    return data;
  }

  private needChangeToStatus(issue: JiraIssue): IssueStatus | null {
    if (!issue.issueLinks) {
      return null;
    }

    const _subTaskFilter = (link: JiraIssueLink) => link.type.name === IssueLinkType.Blocks && !!link.inwardIssue && this.isSubTaskSummary(link.inwardIssue.fields.summary);
    const _getStatusList = (links: JiraIssueLink[]) => (
      links
        .filter(_subTaskFilter)
        .map((l) => this.getStatus(l.inwardIssue!))
    );

    // open => to be handled
    if (issue.status === IssueStatus.Open) {
      const spec = CHANGE_SPEC_MAP[IssueStatus.ToBeHandled];
      const statusList = _getStatusList(issue.issueLinks);
      return this.isMeetChangeSpec(statusList, spec) ? IssueStatus.ToBeHandled : null;
    }

    // to be handled => in progress
    if (issue.status === IssueStatus.ToBeHandled) {
      const spec = CHANGE_SPEC_MAP[IssueStatus.InProgress];
      const statusList = _getStatusList(issue.issueLinks);
      return this.isMeetChangeSpec(statusList, spec) ? IssueStatus.InProgress : null;
    }

    // in progress => in review
    if (issue.status === IssueStatus.InProgress) {
      const spec = CHANGE_SPEC_MAP[IssueStatus.InReview];
      const statusList = _getStatusList(issue.issueLinks);
      return this.isMeetChangeSpec(statusList, spec) ? IssueStatus.InReview : null;
    }

    // in review => resolved
    if (issue.status === IssueStatus.InReview) {
      const spec = CHANGE_SPEC_MAP[IssueStatus.Resolved];
      const statusList = _getStatusList(issue.issueLinks);
      return this.isMeetChangeSpec(statusList, spec) ? IssueStatus.Resolved : null;
    }

    return null;
  }

  private isSubTaskSummary(summary: string): boolean {
    return Object.values(ISSUE_PREFIX_MAP).map((k) => summary.startsWith(k)).some((ret) => ret);
  }

  private isMeetChangeSpec(statusList: IssueStatus[], spec: ChangeSpec): boolean {
    const hasShouldNotInStatus = statusList.filter((s) => spec.notInStatusList.includes(s)).length > 0;
    const hasShouldInStatus = statusList.filter((s) => spec.inStatusList.includes(s)).length > 0;
    return !hasShouldNotInStatus && hasShouldInStatus;
  }

  private getStatus(linkedIssue: LinkedIssue): IssueStatus {
    return linkedIssue.fields.status.name;
  }

}
