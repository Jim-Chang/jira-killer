import {CustomIssueType, JiraIssue, JiraIssueType, LOG_PREFIX} from "./define";
import {jiraService} from "./jira-service";

export class IssueSortService {
  private issues: JiraIssue[] = [];
  private storyTasksKeyMap: {[key: string]: string[]} = {};

  constructor(issues: JiraIssue[]) {
    this.issues = issues;
  }

  async doSort(): Promise<boolean> {
    const shouldSortTypes: string[] = [JiraIssueType.Task, JiraIssueType.Bug, JiraIssueType.Test, CustomIssueType.BETask, CustomIssueType.FETask];

    this.issues.forEach((issue) => {
      if (shouldSortTypes.includes(issue.issueType) && (issue.issueLinks?.length ?? 0) > 0) {
        // only looks first block issue
        const blockIssueLink = issue.issueLinks!.find((link) => link.type.name === 'Blocks' && link.outwardIssue?.fields.issuetype.name === 'Story');
        if (blockIssueLink) {
          const blockIssueKey = blockIssueLink.outwardIssue.key;
          if (!(blockIssueKey in this.storyTasksKeyMap)) {
            this.storyTasksKeyMap[blockIssueKey] = [];
          }
          this.storyTasksKeyMap[blockIssueKey].push(issue.key);
        }
      }
    });

    console.log(LOG_PREFIX, 'storyTasksKeyMap', this.storyTasksKeyMap);

    const rets = await Promise.all(Object.entries(this.storyTasksKeyMap).map(([storyKey, taskKeys]) => {
      return jiraService.rankIssueAfter(taskKeys, storyKey);
    }))
    console.log(LOG_PREFIX, 'sort result', rets);
    return rets.every((r) => r);
  }
}
