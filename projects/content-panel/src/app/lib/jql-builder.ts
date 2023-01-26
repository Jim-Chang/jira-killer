import { IssueType } from '../define/issue-type';

export class JqlBuilder {
  private issueTypes: IssueType[] = [];
  private labels: string[] = [];

  filterIssueTypes(issueTypes: IssueType[]): void {
    this.issueTypes = issueTypes;
  }

  filterLabels(labels: string[]): void {
    this.labels = labels;
  }

  build(): string | null {
    const issueTypesJql = this.issueTypes.length > 0 ? `issuetype in (${this.issueTypes.join(',')})` : null;
    const labelsJql = this.labels.length > 0 ? `labels in (${this.labels.join(',')})` : null;
    if (issueTypesJql && labelsJql) {
      return `${issueTypesJql} and ${labelsJql}`;
    }
    return issueTypesJql ?? labelsJql;
  }
}
