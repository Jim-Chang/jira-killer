import { Component, OnInit } from '@angular/core';
import {getUrlSelectedIssueId} from "../../lib/utils";
import {JiraService} from "../../services/jira.service";

@Component({
  selector: 'breakdown-task',
  templateUrl: './breakdown-task.component.html',
  styleUrls: ['./breakdown-task.component.sass']
})
export class BreakdownTaskComponent implements OnInit {
  taskRowCount = 0;
  selectedIssueSummary = '';

  constructor(private jiraService: JiraService) { }

  ngOnInit(): void {
    const issueId = getUrlSelectedIssueId();
    if (issueId) {
      this.jiraService.getIssue(issueId).subscribe((issue) => this.selectedIssueSummary = issue.summary);
    }
  }

  onClickAddTaskBtn(): void {
    this.taskRowCount ++;
  }

}
