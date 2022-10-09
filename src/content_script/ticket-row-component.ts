import * as $ from "jquery";
import {jiraService} from "./jira-service";
import {getUrlSelectedIssueId} from "./utils";
import {CustomIssueType, IssueType, JiraIssueType, LOG_PREFIX} from "./define";



const PREFIX_MAP: {[key: string]: string} = {
  [CustomIssueType.FETask]: 'RD<FE> - ',
  [CustomIssueType.BETask]: 'RD<BE> - ',
  [JiraIssueType.Task]: 'RD - ',
  [JiraIssueType.Test]: 'QA - ',
};

export class TicketRowComponent {
  uid: number;
  jqEle: JQuery;

  private parentSummary: string;

  constructor(uid: number, parentSummary: string) {
    this.initView();
    this.initEventHandler();

    this.uid = uid;
    this.parentSummary = parentSummary;
    this.summary = this.parentSummary;
  }

  private initView(): void {
    this.jqEle = $(`
      <div data-uid="${this.uid}">
        <select name="type">
          <option disabled selected value>Select Ticket Type</option>
          <option value="${CustomIssueType.FETask}">Frontend Task</option>
          <option value="${CustomIssueType.BETask}">Backend Task</option>
          <option value="${JiraIssueType.Task}">Task</option>
          <option value="${JiraIssueType.Test}">QA Test</option>
        </select>
        <input name="summary" type="text">
        <input name="story_point" type="number">
        <button>Save</button>
      </div>
    `);
  }

  private initEventHandler(): void {
    this.typeSelect.on('change', () => this.onTypeChange());
    this.pointInput.on('change', () => this.onPointChange());
    this.saveBtn.on('click', () => this.onClickSaveBtn());
  }

  private onTypeChange(): void {
    const prefix = PREFIX_MAP[this.type];
    this.summary = `${prefix}${this.parentSummary}`;
  }

  private isCanSave(): boolean {
    return !!this.summary && !!this.type && !!this.point;
  }

  private onPointChange(): void {
    this.point = this.point < 0 ? 0 : this.point;
  }

  private async onClickSaveBtn(): Promise<void> {
    if (!this.isCanSave()) {
      console.log(LOG_PREFIX, 'Please Check Input Data');
      return;
    }

    // get selected issue id
    const selectedIssueId = getUrlSelectedIssueId();
    if (!selectedIssueId) {
      console.error(LOG_PREFIX, 'can not get selected issue id from url');
      return;
    }

    // get selected issue data
    const selectedIssue = await jiraService.getIssue(selectedIssueId);
    if (!selectedIssue) {
      console.error(LOG_PREFIX, 'can not get selected issue data');
      return;
    }
    console.log(LOG_PREFIX, 'selected issue', selectedIssue);

    // creat new issue
    const issueId = await jiraService.createIssue(selectedIssue, this.summary, this.type, this.point);
    if (!issueId) {
      console.error(LOG_PREFIX, 'created issue fail')
      return ;
    }
    console.log(LOG_PREFIX, 'created issue id', issueId);

    // block selected issue by new issue
    const blockRet = await jiraService.blockIssue(issueId, selectedIssue.key);
    if (blockRet) {
      console.log(LOG_PREFIX, 'block issue success');
    } else {
      console.error(LOG_PREFIX, 'block issue fail');
    }
  }

  private get typeSelect(): JQuery {
    return this.jqEle.find('select');
  }

  private get summaryInput(): JQuery {
    return this.jqEle.find('input[name="summary"]');
  }

  private get pointInput(): JQuery {
    return this.jqEle.find('input[name="story_point"]');
  }

  private get saveBtn(): JQuery {
    return this.jqEle.find('button');
  }

  private get type(): IssueType {
    return this.typeSelect.val() as IssueType;
  }

  private set type(t: IssueType) {
    this.typeSelect.val(t);
  }

  private get summary(): string {
    return this.summaryInput.val() as string;
  }

  private set summary(s: string) {
    this.summaryInput.val(s);
  }

  private get point(): number {
    return parseInt(this.pointInput.val() as string);
  }

  private set point(p: number) {
    this.pointInput.val(p);
  }
}
