import {getJiraJqEle, insertAfterIssueDesc} from "./utils";
import {ISSUE_DETAIL_VIEW_ID} from "./define";
import {QuickTicketComponent} from "./quick-ticket-component";

export class ViewStatusHandler {
  private openIssueDetailView = false;
  private observer: MutationObserver;

  constructor() {
    this.observer = new MutationObserver((mutations) => {
      this.handle();
    });
    this.observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  handle(): void {
    this.handleIssueDetailViewChange();
  }

  private handleIssueDetailViewChange(): void {
    const status = isOpenIssueDetailView();
    if (this.openIssueDetailView == status) {
      return;
    }
    this.openIssueDetailView = status;
    if (status) {
      onOpenIssueDetailView();
    } else {
      onCloseIssueDetailView();
    }
  }

}

function isOpenIssueDetailView(): boolean {
  return getJiraJqEle('div', ISSUE_DETAIL_VIEW_ID).length > 0;
}

function onOpenIssueDetailView(): void {
  const qtComponent = new QuickTicketComponent();
  insertAfterIssueDesc(qtComponent.jqEle);
}

function onCloseIssueDetailView(): void {
  console.log('onCloseIssueDetailView');
}
