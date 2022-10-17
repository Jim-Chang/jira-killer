import { JiraIssue, JiraSprint } from '../../lib/define';
import { getUrlBoardId } from '../../lib/utils';
import { JiraIssueSortService } from '../../services/jira-issue-sort.service';
import { JiraService } from '../../services/jira.service';
import { UrlWatchService } from '../../services/url-watch-service';
import { Component, OnInit } from '@angular/core';
import {
  EMPTY,
  expand,
  filter,
  map,
  Observable,
  of,
  repeat,
  Subject,
  switchMap,
  take,
  takeUntil,
  takeWhile,
} from 'rxjs';

@Component({
  selector: 'backlog',
  templateUrl: './backlog.component.html',
  styleUrls: ['./backlog.component.sass'],
})
export class BacklogComponent {
  sprints$ = new Subject<JiraSprint[]>();
  sortBtnText = 'Sort';
  isSorting = false;

  sprintId = 0;

  private lastBoardId: number | null = null;
  private destroy$ = new Subject<void>();

  get enableSortBtn(): boolean {
    return !this.isSorting && !!this.sprintId;
  }

  constructor(
    private jiraService: JiraService,
    private issueSortService: JiraIssueSortService,
    private urlWatchService: UrlWatchService,
  ) {
    this.urlWatchService.urlChange$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.reset();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
  }

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

  private reset(): void {
    const _clearSpOpt = () => {
      this.sprints$.next([]);
      this.sprintId = 0;
    };

    const boardId = getUrlBoardId();

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
