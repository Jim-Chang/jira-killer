import { Component, OnInit } from '@angular/core';
import {JiraService} from "../../services/jira.service";
import {EMPTY, expand, filter, map, Observable, of, repeat, Subject, switchMap, take, takeWhile} from "rxjs";
import {JiraIssue, JiraSprint} from "../../lib/define";
import {getUrlBoardId} from "../../lib/utils";
import {JiraIssueSortService} from "../../services/jira-issue-sort.service";

@Component({
  selector: 'sort-backlog-issue',
  templateUrl: './sort-backlog-issue.component.html',
  styleUrls: ['./sort-backlog-issue.component.sass']
})
export class SortBacklogIssueComponent implements OnInit {

  sprints$$ = new Subject<JiraSprint[]>();
  sortBtntext = 'Sort';
  isSorting = false;

  sprintId: number;

  get enableSortBtn(): boolean {
    return !this.isSorting && !!this.sprintId;
  }

  constructor(private jiraService: JiraService, private issueSortService: JiraIssueSortService) {

  }

  ngOnInit(): void {
    const boardId = getUrlBoardId();
    if (boardId) {
      this.jiraService.getAllSprint(boardId).subscribe((sps) => {
        this.sprints$$.next(sps);
      });
    }
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

}
