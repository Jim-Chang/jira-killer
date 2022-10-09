import {LOG_PREFIX} from "./define";
import * as $ from "jquery";
import {jiraService} from "./jira-service";
import {IssueSortService} from "./issue-sort-service";

export class JiraSprintBacklogComponent {
  jqEle: JQuery;
  private btnJqEle: JQuery;

  private sprintId: string;
  private isSorting = false;

  constructor(jqEle: JQuery) {
    this.jqEle = jqEle
    this.sprintId = this.jqEle.attr('data-sprint-id') as string;
    this.insertSortButton();
  }

  private insertSortButton(): void {
    const btnEle = $('<button>排好啦</button>');
    btnEle.on('click', () => this.onClickSortButton());
    this.jqEle.prepend(btnEle);
    this.btnJqEle = btnEle;
  }

  private async onClickSortButton(): Promise<void> {
    if (this.isSorting) {
      return;
    }

    this.isSorting = true;
    this.btnJqEle.html('正在排');

    const issues = await jiraService.getIssuesBySprint(this.sprintId);
    if (issues) {
      const sortSvc = new IssueSortService(issues);
      const ret = await sortSvc.doSort();
      if (ret) {
        this.btnJqEle.html('排好了，重刷');
        window.location.reload();
      } else {
        this.btnJqEle.html('排壞了');
      }
    } else {
      this.btnJqEle.html('沒東西可以排');
    }

    this.isSorting = false;
  }
}
