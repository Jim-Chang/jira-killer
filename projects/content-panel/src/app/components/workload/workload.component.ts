import { getAssetUrl, JiraUser } from '../../lib/define';
import { JiraService } from '../../services/jira.service';
import { UrlWatchService } from '../../services/url-watch-service';
import { Component } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

@Component({
  selector: 'workload',
  templateUrl: './workload.component.html',
  styleUrls: ['./workload.component.sass'],
})
export class WorkloadComponent {
  sprintId = 0;
  userIds: string[] = [];
  userMap: { [id: string]: JiraUser } = {};
  workloadMap: { [id: string]: number } = {};
  unassignedPoints = 0;

  private isCalculating = false;

  get enableCalBtn(): boolean {
    return !this.isCalculating && !!this.sprintId;
  }

  constructor(
    private urlWatchService: UrlWatchService,
    private jiraService: JiraService,
    private sanitizer: DomSanitizer,
  ) {}

  onClickCalculate(): void {
    this.isCalculating = true;

    this.jiraService.getIssuesBySprint(this.sprintId).subscribe((issues) => {
      const userMap: { [id: string]: JiraUser } = {};
      const workloadMap: { [id: string]: number } = {};
      let unassignedPoints = 0;

      const _ensureUserInMap = (user: JiraUser) => {
        if (!(user.accountId in userMap)) {
          userMap[user.accountId] = user;
        }
        if (!(user.accountId in workloadMap)) {
          workloadMap[user.accountId] = 0;
        }
      };

      issues.forEach((issue) => {
        if (issue.assignee && issue.storyPoint) {
          _ensureUserInMap(issue.assignee);
          workloadMap[issue.assignee.accountId] += issue.storyPoint;
        } else if (issue.storyPoint) {
          unassignedPoints += issue.storyPoint;
        }
      });

      this.userMap = userMap;
      this.workloadMap = workloadMap;
      this.unassignedPoints = unassignedPoints;
      this.userIds = Object.keys(this.userMap);

      this.isCalculating = false;
    });
  }

  getImgUrl(filename: string): SafeUrl {
    return this.sanitizer.bypassSecurityTrustUrl(getAssetUrl(`img/${filename}`));
  }
}
