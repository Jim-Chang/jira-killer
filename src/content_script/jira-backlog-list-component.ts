import {JiraSprintBacklogComponent} from "./jira-sprint-backlog-component";

export class JiraBacklogListComponent {
  jqEle: JQuery;
  sprintBacklogs: JiraSprintBacklogComponent[] = [];

  constructor(jqEle: JQuery) {
    this.jqEle = jqEle
  }

  initSprintBacklogs(): void {
    const spEles = this.jqEle.find('div.js-sprint-header[data-sprint-id]')
    spEles.each((i) => {
      this.sprintBacklogs.push(new JiraSprintBacklogComponent(spEles.eq(i)));
    })
  }
}
