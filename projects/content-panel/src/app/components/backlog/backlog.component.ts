import { JiraIssue, JiraSprint } from '../../lib/define';
import { getUrlBoardId, getUrlProjectKey } from '../../lib/utils';
import { ConfigService } from '../../services/config.service';
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
  projectKey: string | null = null;
  wantBrowseIssueKey = '';

  private lastBoardId: number | null = null;
  private destroy$ = new Subject<void>();

  get enableSortBtn(): boolean {
    return !this.isSorting && !!this.sprintId;
  }

  constructor(
    private jiraService: JiraService,
    private issueSortService: JiraIssueSortService,
    private urlWatchService: UrlWatchService,
    private configService: ConfigService,
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

  onClickBrowseIssueBtn(): void {
    this.configService.loadByKeys<{ jiraDomain: string }>(['jiraDomain']).subscribe((cfg) => {
      if (!cfg.jiraDomain) {
        console.error('Please set jira domain first');
        return;
      }
      const key = this.cleanIssueKey(this.wantBrowseIssueKey);
      if (!key) {
        console.error('Not key format');
        return;
      }
      const url = `https://${cfg.jiraDomain}.atlassian.net/browse/${key}`;
      window.open(url, '_blank')?.focus();
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

    this.projectKey = getUrlProjectKey();
  }

  private cleanIssueKey(key: string): string | null {
    let ret: string | null = null;

    if (key.match(/[a-zA-Z]+[0-9]+/)) {
      // fts1234
      const prefix = key.match(/[a-zA-Z]+/)![0];
      const code = key.replace(prefix, '');
      ret = `${prefix}-${code}`.toUpperCase();
    } else if (key.match(/[a-zA-Z]+-[0-9]+/)) {
      // fts-1234
      ret = key.toUpperCase();
    } else if (this.projectKey && key.match(/^[0-9]+/)) {
      ret = `${this.projectKey}-${key}`;
    }
    return ret;
  }
}
