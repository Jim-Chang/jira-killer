import { NEED_BUG_REVIEW } from '../../define/label';
import { JqlBuilder } from '../../lib/jql-builder';
import { JiraIssueSortService } from '../../services/jira-issue-sort.service';
import { JiraService } from '../../services/jira.service';
import { Component } from '@angular/core';
import { combineLatest, of, switchMap } from 'rxjs';

@Component({
  selector: 'backlog-maintenance',
  templateUrl: './backlog-maintenance.component.html',
  styleUrls: ['./backlog-maintenance.component.sass'],
})
export class BacklogMaintenanceComponent {
  isSorting = false;
  isCopyVer = false;
  isSetAllBugReviewed = false;

  sprintId = 0;

  get enableSortBtn(): boolean {
    return !this.isSorting && !!this.sprintId;
  }

  get enableCopyVerBtn(): boolean {
    return !this.isCopyVer && !!this.sprintId;
  }

  get enableSetAllBugReviewed(): boolean {
    return !this.isSetAllBugReviewed && !!this.sprintId;
  }

  constructor(private jiraService: JiraService, private issueSortService: JiraIssueSortService) {}

  onClickSortBtn(): void {
    this.isSorting = true;

    this.jiraService
      .getIssuesBySprint(this.sprintId)
      .pipe(switchMap((issues) => this.issueSortService.doSort(issues)))
      .subscribe((ret) => (this.isSorting = false));
  }

  onClickCopyVerBtn(): void {
    this.isCopyVer = true;

    this.jiraService
      .getIssuesBySprint(this.sprintId)
      .pipe(
        switchMap((issues) => {
          const subtaskUpates$ = issues
            .filter((issue) => issue.subtasks.length > 0)
            .map((issue) =>
              issue.subtasks.map((subtask) => this.jiraService.updateFixVersionOfIssue(subtask.key, issue.fixVersions)),
            )
            .reduce((acc$, updates$) => [...acc$, ...updates$]);
          return combineLatest(subtaskUpates$);
        }),
      )
      .subscribe(() => (this.isCopyVer = false));
  }

  onClickSetAllBugReviewedBtn(): void {
    this.isSetAllBugReviewed = true;

    const jqlBuilder = new JqlBuilder();
    jqlBuilder.filterLabels([NEED_BUG_REVIEW]);

    this.jiraService
      .getIssuesBySprint(this.sprintId, jqlBuilder.build())
      .pipe(
        switchMap((issues) => {
          if (issues.length > 0) {
            const reqs$ = issues.map((issue) => this.jiraService.removeLabelOfIssue(issue.key, NEED_BUG_REVIEW));
            return combineLatest(reqs$);
          }
          return of(null);
        }),
      )
      .subscribe(() => (this.isSetAllBugReviewed = false));
  }
}
