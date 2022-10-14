import { Component, OnInit } from '@angular/core';
import {JiraService} from "../../services/jira.service";
import {EMPTY, expand, filter, map, Observable, of, repeat, Subject, switchMap, take, takeUntil, takeWhile} from "rxjs";
import {JiraIssue, JiraSprint} from "../../lib/define";
import {getUrlBoardId} from "../../lib/utils";
import {JiraIssueSortService} from "../../services/jira-issue-sort.service";
import {UrlWatchService} from "../../services/url-watch-service";

@Component({
  selector: 'sort-backlog-issue',
  templateUrl: './sort-backlog-issue.component.html',
  styleUrls: ['./sort-backlog-issue.component.sass']
})
export class SortBacklogIssueComponent {

  sprints$ = new Subject<JiraSprint[]>();
  sortBtntext = 'Sort';
  isSorting = false;

  sprintId = 0;

  private lastBoardId: number | null = null;
  private destroy$ = new Subject<void>();

  get enableSortBtn(): boolean {
    return !this.isSorting && !!this.sprintId;
  }

  constructor(private jiraService: JiraService, private issueSortService: JiraIssueSortService, private urlWatchService: UrlWatchService) {
    this.urlWatchService.urlChange$.pipe(
      takeUntil(this.destroy$),
    )
    .subscribe(() => {
      this.reset();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
  }

  onClickSortBtn(): void {
    this.isSorting = true;
    this.sortBtntext = 'Sorting';
    let allIssues: JiraIssue[] = [];

    this.jiraService.getIssuesBySprint(this.sprintId).pipe(
      expand((issues) => {
        if (issues.length > 0) {
          allIssues = [...allIssues, ...issues];
          return this.jiraService.getIssuesBySprint(this.sprintId, allIssues.length);
        }
        return EMPTY;
      }),
      switchMap(() => this.issueSortService.doSort(allIssues)),
    ).subscribe((ret) => {
      this.isSorting = false;
      this.sortBtntext = ret ? 'Finish' : 'Fail';
    });

  }

  private reset(): void {
    const _clearSpOpt = () => {
      this.sprints$.next([]);
      this.sprintId = 0
    };

    const boardId = getUrlBoardId();
    console.log('board id', boardId);
    if (boardId) {
      if (boardId !== this.lastBoardId) {
        _clearSpOpt();

        this.jiraService.getAllSprint(boardId).subscribe((sps) => {
          this.sprints$.next(sps);
        });
      }
    } else {
      _clearSpOpt();
    }
    this.lastBoardId = boardId;
  }

}
