import {
  ISSUE_PREFIX_MAP,
  IssueLinkType,
  IssueStatus,
  JiraIssue,
  JiraIssueLink,
  JiraIssueType,
  LinkedIssue,
} from '../lib/define';
import { JiraService } from './jira.service';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

type TransitData = {
  [IssueStatus.ToBeHandled]: JiraIssue[];
  [IssueStatus.InProgress]: JiraIssue[];
  [IssueStatus.InReview]: JiraIssue[];
  [IssueStatus.Resolved]: JiraIssue[];
};

type ChangeSpec = {
  notInStatusList: IssueStatus[];
  inStatusList: IssueStatus[];
};

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
};

@Injectable({
  providedIn: 'root',
})
export class JiraStoryService {
  constructor(private jiraService: JiraService) {}

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
    );
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
    });
    return data;
  }

  private needChangeToStatus(issue: JiraIssue): IssueStatus | null {
    if (!issue.issueLinks) {
      return null;
    }

    const _subTaskFilter = (link: JiraIssueLink) =>
      link.type.name === IssueLinkType.Blocks &&
      !!link.inwardIssue &&
      this.isSubTaskSummary(link.inwardIssue.fields.summary);

    const _getStatusList = (links: JiraIssueLink[]) =>
      links.filter(_subTaskFilter).map((l) => this.getStatus(l.inwardIssue!));

    const _findTargetStatus = (checkStatusList: IssueStatus[], links: JiraIssueLink[]) => {
      const targetStatus = checkStatusList.filter((status) => {
        // @ts-ignore
        const spec = CHANGE_SPEC_MAP[status];
        const statusList = _getStatusList(links);
        return this.isMeetChangeSpec(statusList, spec);
      });
      return targetStatus.length > 0 ? targetStatus[0] : null;
    };

    // open => to be handled / in progress / in review / resolved
    if (issue.status === IssueStatus.Open) {
      const checkStatusList = [
        IssueStatus.ToBeHandled,
        IssueStatus.InProgress,
        IssueStatus.InReview,
        IssueStatus.Resolved,
      ];
      return _findTargetStatus(checkStatusList, issue.issueLinks!);
    }

    // to be handled => in progress / in review / resolved
    if (issue.status === IssueStatus.ToBeHandled) {
      const checkStatusList = [IssueStatus.InProgress, IssueStatus.InReview, IssueStatus.Resolved];
      return _findTargetStatus(checkStatusList, issue.issueLinks!);
    }

    // in progress => in review / resolved
    if (issue.status === IssueStatus.InProgress) {
      const checkStatusList = [IssueStatus.InReview, IssueStatus.Resolved];
      return _findTargetStatus(checkStatusList, issue.issueLinks!);
    }

    // in review => resolved
    if (issue.status === IssueStatus.InReview) {
      const checkStatusList = [IssueStatus.Resolved];
      return _findTargetStatus(checkStatusList, issue.issueLinks!);
    }

    return null;
  }

  private isSubTaskSummary(summary: string): boolean {
    return Object.values(ISSUE_PREFIX_MAP)
      .map((k) => summary.startsWith(k))
      .some((ret) => ret);
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
