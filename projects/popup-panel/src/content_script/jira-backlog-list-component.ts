import {JiraSprintSortButtonComponent} from "./jira-sprint-sort-button-component";

export class JiraBacklogListComponent {
  jqEle: JQuery;
  sprintBacklogs: JiraSprintSortButtonComponent[] = [];

  constructor(jqEle: JQuery) {
    this.jqEle = jqEle
  }

  initSprintBacklogs(): void {
    const spEles = this.jqEle.find('div.ghx-backlog-container[data-sprint-id]')
    spEles.each((i) => {
      this.sprintBacklogs.push(new JiraSprintSortButtonComponent(spEles.eq(i)));
    })
  }
}
