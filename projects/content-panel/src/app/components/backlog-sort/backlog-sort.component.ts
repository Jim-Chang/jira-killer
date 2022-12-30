import { JiraIssueSortService } from '../../services/jira-issue-sort.service';
import { JiraService } from '../../services/jira.service';
import { Component } from '@angular/core';
import { switchMap } from 'rxjs';

@Component({
  selector: 'backlog-sort',
  templateUrl: './backlog-sort.component.html',
  styleUrls: ['./backlog-sort.component.sass'],
})
export class BacklogSortComponent {
  sortBtnText = 'Sort';
  isSorting = false;

  sprintId = 0;

  get enableSortBtn(): boolean {
    return !this.isSorting && !!this.sprintId;
  }

  constructor(private jiraService: JiraService, private issueSortService: JiraIssueSortService) {}

  onClickSortBtn(): void {
    this.isSorting = true;
    this.sortBtnText = 'Sorting';

    this.jiraService
      .getIssuesBySprint(this.sprintId)
      .pipe(switchMap((issues) => this.issueSortService.doSort(issues)))
      .subscribe((ret) => {
        this.isSorting = false;
        this.sortBtnText = ret ? 'Finish' : 'Fail';
      });
  }
}
