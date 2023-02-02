import { getAssetUrl, Issue, ISSUE_PREFIX_MAP } from '../../define/base';
import { IssueStatus } from '../../define/issue-status';
import { CustomIssueType, IssueType, JiraIssueType } from '../../define/issue-type';
import { JiraUser } from '../../define/jira-type';
import { DashboardGSheetService } from '../../services/dashboard-gsheet.service';
import { JiraAppRequestWatchService } from '../../services/jira-app-request-watch.service';
import { JiraService } from '../../services/jira.service';
import { UrlWatchService } from '../../services/url-watch-service';
import { Component } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { catchError, combineLatest, filter, merge, of, Subject, switchMap } from 'rxjs';

enum TriggerBy {
  User,
  Api,
}

@Component({
  selector: 'workload',
  templateUrl: './workload.component.html',
  styleUrls: ['./workload.component.sass'],
})
export class WorkloadComponent {
  sprintId = 0;
  userIds: string[] = [];

  userMap: { [id: string]: JiraUser } = {};

  planPointsMap: { [id: string]: number } = {};
  undonePointsMap: { [id: string]: number } = {};
  budgetPointsMap: { [id: string]: number } = {};

  unassignedPoints = 0;
  totalPlanPoints = 0;
  totalUndonePoints = 0;
  totalBudget = 0;

  feTotalUndonePoints = 0;
  beTotalUndonePoints = 0;
  otherTaskTotalUndonePoints = 0;
  qaTotalUndonePoints = 0;

  private isCalculating = false;
  private doCalculate$ = new Subject<TriggerBy>();

  get enableCalBtn(): boolean {
    return !this.isCalculating && !!this.sprintId;
  }

  get enableSelector(): boolean {
    return !this.isCalculating;
  }

  constructor(
    private urlWatchService: UrlWatchService,
    private jiraService: JiraService,
    private jiraAppReqWatchSvc: JiraAppRequestWatchService,
    private dashboardGSheetSvc: DashboardGSheetService,
    private sanitizer: DomSanitizer,
  ) {
    this.initDoCalculateHandler();

    merge(this.jiraAppReqWatchSvc.calledSetAssignee$, this.jiraAppReqWatchSvc.calledSetStoryPoint$)
      .pipe(filter(() => !!this.sprintId))
      .subscribe(() => this.doCalculate$.next(TriggerBy.Api));
  }

  isShowBudgetPoints(): boolean {
    return this.dashboardGSheetSvc.isSetGSheetUrl();
  }

  isOverBudgetPoints(workload: number, plan: number | undefined): boolean {
    if (plan !== undefined) {
      return workload > plan;
    }
    return false;
  }

  getBudgetPoints(userId: string): number | string {
    return this.budgetPointsMap[userId] ?? '-';
  }

  onClickCalculate(): void {
    this.doCalculate$.next(TriggerBy.User);
  }

  getImgUrl(filename: string): SafeUrl {
    return this.sanitizer.bypassSecurityTrustUrl(getAssetUrl(`img/${filename}`));
  }

  private getRealTaskIssueType(issue: Issue): IssueType {
    if (issue.issueType === JiraIssueType.Subtask) {
      if (issue.summary.startsWith(ISSUE_PREFIX_MAP[CustomIssueType.FETask])) {
        return CustomIssueType.FETask;
      } else if (issue.summary.startsWith(ISSUE_PREFIX_MAP[CustomIssueType.BETask])) {
        return CustomIssueType.BETask;
      }
      return JiraIssueType.Task;
    }

    return issue.issueType as IssueType;
  }

  private initDoCalculateHandler(): void {
    this.doCalculate$
      .pipe(
        switchMap((triggerBy) => {
          this.isCalculating = true;
          return combineLatest([
            this.jiraService.getIssuesBySprint(this.sprintId),
            this.dashboardGSheetSvc.getUserBudgetPointsMapBySprint(this.sprintId, triggerBy === TriggerBy.Api).pipe(
              catchError(() => {
                console.info('getUserBudgetPointsMapBySprint fail, pass calculate budget ');
                return of({});
              }),
            ),
          ]);
        }),
      )
      .subscribe(([issues, budgetPointsMap]) => {
        const userMap: { [id: string]: JiraUser } = {};
        const planPointsMap: { [id: string]: number } = {};
        const undonePointsMap: { [id: string]: number } = {};
        let unassignedPoints = 0;
        let feTotalUndonePoints = 0;
        let beTotalUndonePoints = 0;
        let qaTotalUndonePoints = 0;
        let otherTaskTotalUndonePoints = 0;

        const _ensureUserInMap = (user: JiraUser) => {
          if (!(user.accountId in userMap)) {
            userMap[user.accountId] = user;
          }
          if (!(user.accountId in planPointsMap)) {
            planPointsMap[user.accountId] = 0;
          }
          if (!(user.accountId in undonePointsMap)) {
            undonePointsMap[user.accountId] = 0;
          }
        };

        issues
          .filter((issue) => !!issue.storyPoint)
          .forEach((issue) => {
            const storyPoint = issue.storyPoint as number;

            if (issue.assignee) {
              const assignee = issue.assignee;
              _ensureUserInMap(assignee);

              planPointsMap[assignee.accountId] += storyPoint;
              if (issue.status !== IssueStatus.Closed) {
                undonePointsMap[assignee.accountId] += storyPoint;
              }
            } else {
              unassignedPoints += storyPoint;
            }

            if (issue.status !== IssueStatus.Closed) {
              const type = this.getRealTaskIssueType(issue);
              if (type === CustomIssueType.FETask) {
                feTotalUndonePoints += storyPoint;
              } else if (type === CustomIssueType.BETask) {
                beTotalUndonePoints += storyPoint;
              } else if (type === JiraIssueType.Test || type === JiraIssueType.SubTestExecution) {
                qaTotalUndonePoints += storyPoint;
              } else {
                otherTaskTotalUndonePoints += storyPoint;
              }
            }
          });

        this.userMap = userMap;
        this.planPointsMap = planPointsMap;
        this.undonePointsMap = undonePointsMap;
        this.budgetPointsMap = budgetPointsMap;
        this.unassignedPoints = unassignedPoints;
        this.feTotalUndonePoints = feTotalUndonePoints;
        this.beTotalUndonePoints = beTotalUndonePoints;
        this.qaTotalUndonePoints = qaTotalUndonePoints;
        this.otherTaskTotalUndonePoints = otherTaskTotalUndonePoints;

        this.totalPlanPoints = unassignedPoints + Object.values(planPointsMap).reduce((acc, pts) => acc + pts, 0);
        this.totalUndonePoints = unassignedPoints + Object.values(undonePointsMap).reduce((acc, pts) => acc + pts, 0);
        this.totalBudget = Object.values(budgetPointsMap).reduce((acc, pts) => acc + pts, 0);

        this.userIds = Object.keys(this.userMap);

        this.isCalculating = false;
      });
  }
}
