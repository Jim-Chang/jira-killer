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

type StoryNowStatus =
  | IssueStatus.Open
  | IssueStatus.ToBeHandled
  | IssueStatus.InProgress
  | IssueStatus.InReview
  | IssueStatus.Resolved
  | IssueStatus.ReadyForVerification;

type StoryNextStatus =
  | IssueStatus.ToBeHandled
  | IssueStatus.InProgress
  | IssueStatus.InReview
  | IssueStatus.Resolved
  | IssueStatus.ReadyForVerification
  | IssueStatus.Closed;

type TransitData = { [s in StoryNextStatus]: JiraIssue[] };

type SubtaskStatusSpec = {
  notInStatusList: IssueStatus[];
  inStatusList: IssueStatus[];
};

// Story task in status should check which status it will transit to.
const CHECK_NEXT_STATUS_MAP: { [s in StoryNowStatus]: StoryNextStatus[] } = {
  [IssueStatus.Open]: [
    IssueStatus.ToBeHandled,
    IssueStatus.InProgress,
    IssueStatus.InReview,
    IssueStatus.Resolved,
    IssueStatus.ReadyForVerification,
    IssueStatus.Closed,
  ],
  [IssueStatus.ToBeHandled]: [
    IssueStatus.InProgress,
    IssueStatus.InReview,
    IssueStatus.Resolved,
    IssueStatus.ReadyForVerification,
    IssueStatus.Closed,
  ],
  [IssueStatus.InProgress]: [
    IssueStatus.InReview,
    IssueStatus.Resolved,
    IssueStatus.ReadyForVerification,
    IssueStatus.Closed,
  ],
  [IssueStatus.InReview]: [IssueStatus.Resolved, IssueStatus.ReadyForVerification, IssueStatus.Closed],
  [IssueStatus.Resolved]: [IssueStatus.ReadyForVerification, IssueStatus.Closed],
  [IssueStatus.ReadyForVerification]: [IssueStatus.Closed],
};

// If story task want to transit to new status spec -> sub-task should not in status and in status
const SUBTASK_STATUS_SPEC_MAP: { [s in StoryNextStatus]: SubtaskStatusSpec } = {
  [IssueStatus.ToBeHandled]: {
    notInStatusList: [],
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
  [IssueStatus.ReadyForVerification]: {
    notInStatusList: [
      IssueStatus.Open,
      IssueStatus.ToBeHandled,
      IssueStatus.InProgress,
      IssueStatus.InReview,
      IssueStatus.Resolved,
    ],
    inStatusList: [IssueStatus.ReadyForVerification],
  },
  [IssueStatus.Closed]: {
    notInStatusList: [
      IssueStatus.Open,
      IssueStatus.ToBeHandled,
      IssueStatus.InProgress,
      IssueStatus.InReview,
      IssueStatus.Resolved,
      IssueStatus.ReadyForVerification,
    ],
    inStatusList: [IssueStatus.Closed],
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
      [IssueStatus.ReadyForVerification]: [],
      [IssueStatus.Closed]: [],
    };
    issues.forEach((issue) => {
      const newStatus = this.needChangeToStatus(issue);
      if (!!newStatus) {
        // @ts-ignore
        data[newStatus].push(issue);
      }
    });
    return data;
  }

  private needChangeToStatus(issue: JiraIssue): IssueStatus | null {
    if (!issue.issueLinks) {
      return null;
    }
    if (!Object.keys(CHECK_NEXT_STATUS_MAP).includes(issue.status)) {
      return null;
    }
    // @ts-ignore
    const checkStatusList = CHECK_NEXT_STATUS_MAP[issue.status];
    return findTargetStatus(checkStatusList, issue.issueLinks!);
  }
}

function getStatusList(links: JiraIssueLink[]): IssueStatus[] {
  const _subTaskFilter = (link: JiraIssueLink) =>
    link.type.name === IssueLinkType.Blocks && !!link.inwardIssue && isSubTaskSummary(link.inwardIssue.fields.summary);

  return links.filter(_subTaskFilter).map((l) => getIssueStatus(l.inwardIssue!));
}

function findTargetStatus(checkStatusList: IssueStatus[], links: JiraIssueLink[]): IssueStatus | null {
  const targetStatus = checkStatusList.filter((status) => {
    // @ts-ignore
    const spec = SUBTASK_STATUS_SPEC_MAP[status];
    const statusList = getStatusList(links);
    return isMeetSubTaskStatusSpec(statusList, spec);
  });
  return targetStatus.length > 0 ? targetStatus[0] : null;
}

function isSubTaskSummary(summary: string): boolean {
  return Object.values(ISSUE_PREFIX_MAP)
    .map((k) => summary.startsWith(k))
    .some((ret) => ret);
}

function isMeetSubTaskStatusSpec(statusList: IssueStatus[], spec: SubtaskStatusSpec): boolean {
  const hasShouldNotInStatus = statusList.filter((s) => spec.notInStatusList.includes(s)).length > 0;
  const hasShouldInStatus = statusList.filter((s) => spec.inStatusList.includes(s)).length > 0;
  return !hasShouldNotInStatus && hasShouldInStatus;
}

function getIssueStatus(linkedIssue: LinkedIssue): IssueStatus {
  return linkedIssue.fields.status.name;
}
