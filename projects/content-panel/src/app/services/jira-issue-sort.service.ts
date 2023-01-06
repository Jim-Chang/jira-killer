import { Issue, LOG_PREFIX } from '../define/base';
import { CustomIssueType, JiraIssueType } from '../define/issue-type';
import { JiraService } from './jira.service';
import { Injectable } from '@angular/core';
import { combineLatest, map, Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class JiraIssueSortService {
  constructor(private jiraService: JiraService) {}

  doSort(issues: Issue[]): Observable<boolean> {
    const shouldSortTypes: string[] = [
      JiraIssueType.Task,
      JiraIssueType.Bug,
      JiraIssueType.Test,
      CustomIssueType.BETask,
      CustomIssueType.FETask,
    ];
    const storyTasksKeyMap: { [key: string]: string[] } = {};

    issues.forEach((issue) => {
      if (shouldSortTypes.includes(issue.issueType) && (issue.issueLinks?.length ?? 0) > 0) {
        // only looks first block issue
        const blockIssueLink = issue.issueLinks!.find(
          (link) =>
            link.type.name === 'Blocks' &&
            [JiraIssueType.Story, JiraIssueType.Improvement].includes(
              link.outwardIssue?.fields.issuetype.name as JiraIssueType,
            ),
        );
        if (blockIssueLink && blockIssueLink.outwardIssue) {
          const blockIssueKey = blockIssueLink.outwardIssue.key;
          if (!(blockIssueKey in storyTasksKeyMap)) {
            storyTasksKeyMap[blockIssueKey] = [];
          }
          storyTasksKeyMap[blockIssueKey].push(issue.key);
        }
      }
    });

    console.log(LOG_PREFIX, 'JiraIssueSortService: storyTasksKeyMap', storyTasksKeyMap);

    // if is empty, don't need sort
    if (Object.keys(storyTasksKeyMap).length === 0) {
      return of(true);
    }

    return combineLatest(
      Object.entries(storyTasksKeyMap).map(([storyKey, taskKeys]) => {
        return this.jiraService.rankIssueAfter(taskKeys, storyKey);
      }),
    ).pipe(map((rets) => rets.every((r) => r)));
  }
}
