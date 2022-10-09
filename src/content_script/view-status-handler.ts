import {getJiraJqEle, getUrlSelectedIssueId, insertAfterIssueDesc} from "./utils";
import {ISSUE_DETAIL_VIEW_ID, LOG_PREFIX} from "./define";
import {QuickTicketComponent} from "./quick-ticket-component";

export class ViewStatusHandler {
  private openIssueDetailView = false;
  private lastOpenIssueKey: string | null = null;
  private observer: MutationObserver;
  private qtComponent: QuickTicketComponent | null = null;

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
    const issueKey = getUrlSelectedIssueId();
    if (this.openIssueDetailView === status && this.lastOpenIssueKey === issueKey) {
      return;
    }
    this.openIssueDetailView = status;
    if (status) {
      this.onOpenIssueDetailView();
      this.lastOpenIssueKey = issueKey
    } else {
      this.onCloseIssueDetailView();
      this.lastOpenIssueKey = null;
    }
  }

  private onOpenIssueDetailView(): void {
    if (this.qtComponent) {
      this.qtComponent.jqEle.remove();
      this.qtComponent = null;
    }
    this.qtComponent = new QuickTicketComponent();
    insertAfterIssueDesc(this.qtComponent.jqEle);
  }

  private onCloseIssueDetailView(): void {
    console.log('onCloseIssueDetailView');
    if (this.qtComponent) {
      this.qtComponent.jqEle.remove();
      this.qtComponent = null;
    }
  }

}

function isOpenIssueDetailView(): boolean {
  return getJiraJqEle('div', ISSUE_DETAIL_VIEW_ID).length > 0;
}


