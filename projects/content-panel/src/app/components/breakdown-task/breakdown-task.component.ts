import { Component, OnInit } from '@angular/core';
import {getUrlSelectedIssueId} from "../../lib/utils";
import {JiraService} from "../../services/jira.service";
import {JiraIssue} from "../../lib/define";

@Component({
  selector: 'breakdown-task',
  templateUrl: './breakdown-task.component.html',
  styleUrls: ['./breakdown-task.component.sass']
})
export class BreakdownTaskComponent implements OnInit {
  taskRowCount = 0;
  selectedIssue: JiraIssue;

  constructor(private jiraService: JiraService) { }

  ngOnInit(): void {
    const issueId = getUrlSelectedIssueId();
    if (issueId) {
      this.jiraService.getIssue(issueId).subscribe((issue) => this.selectedIssue = issue);
    }
  }

  onClickAddTaskBtn(): void {
    this.taskRowCount ++;
  }

}
