import { Issue } from '../../define/base';
import { IssueStatus } from '../../define/issue-status';
import { JiraUser } from '../../define/jira-type';
import { getUrlSelectedIssueId, isShowJiraIssueDetailModel } from '../../lib/url-utils';
import { ConfigService } from '../../services/config.service';
import { JiraService } from '../../services/jira.service';
import { UrlWatchService } from '../../services/url-watch-service';
import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { combineLatest, map, of, Subject, switchMap, takeUntil } from 'rxjs';

@Component({
  selector: 'subtask-list',
  templateUrl: './subtask-list.component.html',
  styleUrls: ['./subtask-list.component.sass'],
})
export class SubtaskListComponent {
  @ViewChild('subtaskList') subtaskList: ElementRef;

  subtasks: Issue[] = [];
  isShow = false;

  private DEFAULT_HEIGHT = 60;
  private maxHeight = this.DEFAULT_HEIGHT;

  private destroy$ = new Subject<void>();

  constructor(
    private urlWatchService: UrlWatchService,
    private jiraSerivce: JiraService,
    private configService: ConfigService,
  ) {
    this.urlWatchService.urlChange$
      .pipe(
        takeUntil(this.destroy$),
        switchMap(() => {
          const issueId = getUrlSelectedIssueId();
          if (!!issueId && isShowJiraIssueDetailModel()) {
            return this.jiraSerivce.getIssue(issueId);
          }
          return of(null);
        }),
      )
      .subscribe((issue) => {
        if (issue) {
          this.renderSubtask(issue);
        } else {
          this.reset();
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
  }

  get containerHeight(): any {
    return { maxHeight: `${this.maxHeight}px` };
  }

  onScrollSubtask($event: any): void {
    const eleMaxHeight = this.subtaskList.nativeElement.offsetHeight;
    const eleMinHeight = this.DEFAULT_HEIGHT;

    this.maxHeight += $event.deltaY / 2;
    this.maxHeight = this.maxHeight > eleMaxHeight ? eleMaxHeight : this.maxHeight;
    this.maxHeight = this.maxHeight < eleMinHeight ? eleMinHeight : this.maxHeight;
  }

  getAssigneeAvatarUrl(assignee: JiraUser | null): string {
    return assignee?.avatarUrls['32x32'] ?? '';
  }

  getStatusColor(status: IssueStatus): string {
    const colorMap: { [key in IssueStatus]: string } = {
      [IssueStatus.Open]: 'gray',
      [IssueStatus.ToBeHandled]: 'gray',
      [IssueStatus.InProgress]: 'blue',
      [IssueStatus.InReview]: 'blue',
      [IssueStatus.Resolved]: 'purple',
      [IssueStatus.ReadyForVerification]: 'purple',
      [IssueStatus.Done]: 'green',
      [IssueStatus.Closed]: 'green',
    };
    return colorMap[status];
  }

  onClickSubtask(issue: Issue): void {
    this.configService.loadByKeys<{ jiraDomain: string }>(['jiraDomain']).subscribe((cfg) => {
      if (!cfg.jiraDomain) {
        console.error('Please set jira domain first');
        return;
      }
      const url = `https://${cfg.jiraDomain}.atlassian.net/browse/${issue.key}`;
      window.open(url, '_blank')?.focus();
    });
  }

  private renderSubtask(issue: Issue): void {
    const subtasks$ = issue.subtasks.map((jIssue) => this.jiraSerivce.getIssue(jIssue.key));
    combineLatest(subtasks$).subscribe((issues) => {
      this.subtasks = issues;
      this.isShow = true;
      this.maxHeight = this.DEFAULT_HEIGHT;
    });
  }

  private reset(): void {
    this.subtasks = [];
    this.maxHeight = 0;
    this.isShow = false;
  }
}
