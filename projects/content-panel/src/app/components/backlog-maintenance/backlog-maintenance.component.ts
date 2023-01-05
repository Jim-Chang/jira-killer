import { JiraIssueSortService } from '../../services/jira-issue-sort.service';
import { JiraService } from '../../services/jira.service';
import { Component } from '@angular/core';
import { combineLatest, switchMap } from 'rxjs';

@Component({
  selector: 'backlog-maintenance',
  templateUrl: './backlog-maintenance.component.html',
  styleUrls: ['./backlog-maintenance.component.sass'],
})
export class BacklogMaintenanceComponent {
  isSorting = false;
  isCopyVer = false;

  sprintId = 0;

  get enableSortBtn(): boolean {
    return !this.isSorting && !!this.sprintId;
  }

  get enableCopyVerBtn(): boolean {
    return !this.isCopyVer && !!this.sprintId;
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
}
