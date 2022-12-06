import { CustomIssueType, JiraIssue, JiraIssueType, LOG_PREFIX } from '../lib/define';
import { JiraService } from './jira.service';
import { Injectable } from '@angular/core';
import { combineLatest, forkJoin, map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class JiraIssueSortService {
  constructor(private jiraService: JiraService) {}

  doSort(issues: JiraIssue[]): Observable<boolean> {
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
          (link) => link.type.name === 'Blocks' && link.outwardIssue?.fields.issuetype.name === 'Story',
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

    console.log(LOG_PREFIX, 'storyTasksKeyMap', storyTasksKeyMap);

    return combineLatest(
      Object.entries(storyTasksKeyMap).map(([storyKey, taskKeys]) => {
        return this.jiraService.rankIssueAfter(taskKeys, storyKey);
      }),
    ).pipe(map((rets) => rets.every((r) => r)));
  }
}
