import * as $ from "jquery";
import {TicketRowComponent} from "./ticket-row-component";
import {getIssueSummary} from "./utils";


export class QuickTicketComponent {
  jqEle: JQuery;
  private ticketRowComponents: TicketRowComponent[] = [];

  constructor() {
    this.initView();
    this.initEventHandler();
  }

  private initView(): void {
    this.jqEle = $(`
        <div>
            <div data-name="ticket-rows"></div>
            <div>
                <button data-name="add-ticket-row-btn">Add Ticket</button>
            </div>
        </div>
    `);
  }

  private initEventHandler(): void {
    this.addRowBtn.on('click', () => this.onClickAddBtn());
  }

  private onClickAddBtn(): void {
    const uid = this.ticketRowComponents.length + 1;
    const row = new TicketRowComponent(uid, getIssueSummary());
    this.ticketRowComponents.push(row);
    this.ticketRows.append(row.jqEle);
  }

  private get ticketRows(): JQuery {
    return this.jqEle.find('div[data-name="ticket-rows"]');
  }

  private get addRowBtn(): JQuery {
    return this.jqEle.find('button[data-name="add-ticket-row-btn"]');
  }

}
