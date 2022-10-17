import { JiraIssue } from '../../lib/define';
import { getUrlSelectedIssueId } from '../../lib/utils';
import { JiraService } from '../../services/jira.service';
import { UrlWatchService } from '../../services/url-watch-service';
import { Component, OnInit } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'breakdown-task',
  templateUrl: './breakdown-task.component.html',
  styleUrls: ['./breakdown-task.component.sass'],
})
export class BreakdownTaskComponent {
  taskRowCount = 0;
  selectedIssue: JiraIssue;

  private destroy$ = new Subject<void>();

  constructor(private jiraService: JiraService, private urlWatchService: UrlWatchService) {
    this.urlWatchService.urlChange$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.reset();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
  }

  onClickAddTaskBtn(): void {
    this.taskRowCount++;
  }

  private reset(): void {
    this.taskRowCount = 0;
    const issueId = getUrlSelectedIssueId();
    if (issueId) {
      this.jiraService.getIssue(issueId).subscribe((issue) => (this.selectedIssue = issue));
    }
  }
}
