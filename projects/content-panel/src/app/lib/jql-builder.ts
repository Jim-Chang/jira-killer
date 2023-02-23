import { IssueType } from '../define/issue-type';

export class JqlBuilder {
  private issueTypes: IssueType[] = [];
  private labels: string[] = [];
  private notInLabels: string[] = [];

  filterIssueTypes(issueTypes: IssueType[]): void {
    this.issueTypes = issueTypes;
  }

  filterLabels(labels: string[]): void {
    this.labels = labels;
  }

  filterNotInLabels(labels: string[]): void {
    this.notInLabels = labels;
  }

  build(): string | null {
    const issueTypesJql = this.issueTypes.length > 0 ? `issuetype in (${this.issueTypes.join(',')})` : null;
    const labelsJql = this.labels.length > 0 ? `labels in (${this.labels.join(',')})` : null;
    const notInLabelsJql = this.notInLabels.length > 0 ? `labels not in (${this.notInLabels.join(',')})` : null;

    const jqls = [issueTypesJql, labelsJql, notInLabelsJql];
    return jqls.filter((j) => j).join(' and ');
  }
}
