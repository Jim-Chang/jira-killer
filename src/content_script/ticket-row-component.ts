import * as $ from "jquery";

enum TicketType {
  FETask,
  BETask,
  Task,
  QATask,
}

const PREFIX_MAP: {[key: string]: string} = {
  [TicketType.FETask]: 'RD<FE> - ',
  [TicketType.BETask]: 'RD<BE> - ',
  [TicketType.Task]: 'RD - ',
  [TicketType.QATask]: 'QA - ',
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
          <option value="0">Frontend Task</option>
          <option value="1">Backend Task</option>
          <option value="2">Task</option>
          <option value="3">QA Task</option>
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

  private onPointChange(): void {
    this.point = this.point < 0 ? 0 : this.point;
  }

  private onClickSaveBtn(): void {
    console.log('on click save');
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

  private get type(): TicketType {
    return this.typeSelect.val() as TicketType;
  }

  private set type(t: TicketType) {
    this.typeSelect.val(t);
  }

  private get summary(): string {
    return this.summaryInput.val() as string;
  }

  private set summary(s: string) {
    this.summaryInput.val(s);
  }

  private get point(): number {
    return this.pointInput.val() as number;
  }

  private set point(p: number) {
    this.pointInput.val(p);
  }
}
