import { getAssetUrl } from '../../lib/define';
import { JiraUser } from '../../lib/jira-define';
import { DashboardGSheetService } from '../../services/dashboard-gsheet.service';
import { JiraAppRequestWatchService } from '../../services/jira-app-request-watch.service';
import { JiraService } from '../../services/jira.service';
import { UrlWatchService } from '../../services/url-watch-service';
import { Component } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { filter, merge, Subject, switchMap, combineLatest } from 'rxjs';

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
  workloadMap: { [id: string]: number } = {};
  planPointsMap: { [id: string]: number } = {};
  unassignedPoints = 0;
  totalPoints = 0;
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

  getRemainBudgetPoints(workload: number, plan: number | undefined): string {
    if (plan !== undefined) {
      return `${Math.round((plan - workload) * 10) / 10}`;
    }
    return '-';
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
            this.dashboardGSheetSvc.getUserPlanPointsMapBySprint(this.sprintId, triggerBy === TriggerBy.Api),
          ]);
        }),
      )
      .subscribe(([issues, planPointsMap]) => {
        const userMap: { [id: string]: JiraUser } = {};
        const workloadMap: { [id: string]: number } = {};
        let unassignedPoints = 0;

        const _ensureUserInMap = (user: JiraUser) => {
          if (!(user.accountId in userMap)) {
            userMap[user.accountId] = user;
          }
          if (!(user.accountId in workloadMap)) {
            workloadMap[user.accountId] = 0;
          }
        };

        issues.forEach((issue) => {
          if (issue.assignee && issue.storyPoint) {
            _ensureUserInMap(issue.assignee);
            workloadMap[issue.assignee.accountId] += issue.storyPoint;
          } else if (issue.storyPoint) {
            unassignedPoints += issue.storyPoint;
          }
        });

        this.userMap = userMap;
        this.workloadMap = workloadMap;
        this.planPointsMap = planPointsMap;
        this.unassignedPoints = unassignedPoints;
        this.totalPoints = unassignedPoints + Object.values(workloadMap).reduce((acc, pts) => acc + pts, 0);
        this.totalBudget = Object.values(planPointsMap).reduce((acc, pts) => acc + pts, 0);

        this.userIds = Object.keys(this.userMap);

        this.isCalculating = false;
      });
  }
}
