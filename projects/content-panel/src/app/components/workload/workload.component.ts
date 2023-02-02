import { getAssetUrl } from '../../define/base';
import { IssueStatus } from '../../define/issue-status';
import { JiraUser } from '../../define/jira-type';
import { DashboardGSheetService } from '../../services/dashboard-gsheet.service';
import { JiraAppRequestWatchService } from '../../services/jira-app-request-watch.service';
import { JiraService } from '../../services/jira.service';
import { UrlWatchService } from '../../services/url-watch-service';
import { Component } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { filter, merge, Subject, switchMap, combineLatest, catchError, of } from 'rxjs';

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

  isShowRemainBudgetPoints(): boolean {
    return this.dashboardGSheetSvc.isSetGSheetUrl();
  }

  isOverBudgetPoints(workload: number, plan: number | undefined): boolean {
    if (plan !== undefined) {
      return workload > plan;
    }
    return false;
  }

  onClickCalculate(): void {
    this.doCalculate$.next(TriggerBy.User);
  }

  getImgUrl(filename: string): SafeUrl {
    return this.sanitizer.bypassSecurityTrustUrl(getAssetUrl(`img/${filename}`));
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

        issues.forEach((issue) => {
          if (issue.assignee && issue.storyPoint) {
            const assignee = issue.assignee;
            const storyPoint = issue.storyPoint;

            _ensureUserInMap(assignee);

            planPointsMap[assignee.accountId] += storyPoint;
            if (issue.status !== IssueStatus.Closed) {
              undonePointsMap[assignee.accountId] += storyPoint;
            }
          } else if (issue.storyPoint) {
            unassignedPoints += issue.storyPoint;
          }
        });

        this.userMap = userMap;
        this.planPointsMap = planPointsMap;
        this.undonePointsMap = undonePointsMap;
        this.budgetPointsMap = budgetPointsMap;
        this.unassignedPoints = unassignedPoints;

        this.totalPlanPoints = unassignedPoints + Object.values(planPointsMap).reduce((acc, pts) => acc + pts, 0);
        this.totalUndonePoints = unassignedPoints + Object.values(undonePointsMap).reduce((acc, pts) => acc + pts, 0);
        this.totalBudget = Object.values(budgetPointsMap).reduce((acc, pts) => acc + pts, 0);

        this.userIds = Object.keys(this.userMap);

        this.isCalculating = false;
      });
  }
}
