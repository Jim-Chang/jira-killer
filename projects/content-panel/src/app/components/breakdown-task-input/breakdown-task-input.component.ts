import {Component, Input, OnInit} from '@angular/core';
import {CustomIssueType, JiraIssueType} from "../../lib/define";


const PREFIX_MAP: {[key: string]: string} = {
  [CustomIssueType.FETask]: 'RD<FE> - ',
  [CustomIssueType.BETask]: 'RD<BE> - ',
  [JiraIssueType.Task]: 'RD<INT> - ',
  [JiraIssueType.Test]: 'QA - ',
};

@Component({
  selector: 'breakdown-task-input',
  templateUrl: './breakdown-task-input.component.html',
  styleUrls: ['./breakdown-task-input.component.sass']
})
export class BreakdownTaskInputComponent implements OnInit {
  @Input() parentSummary = '';

  JiraIssueType = JiraIssueType;
  CustomIssueType = CustomIssueType;

  issueType: JiraIssueType | CustomIssueType;
  summary = '';
  storyPoint: number | null = null;

  private isSaving = false;
  private created = false;

  constructor() { }

  ngOnInit(): void {
    this.summary = this.parentSummary;
  }

  canSave(): boolean {
    return !!this.summary && !!this.issueType && (!this.isSaving || !this.created);
  }

  onChangeStoryPoint(): void {
    if (this.storyPoint && this.storyPoint < 0) {
      this.storyPoint = 0;
    }
  }

  onChangeIssueType(): void {
    const prefix = PREFIX_MAP[this.issueType];
    this.summary = `${prefix}${this.parentSummary}`;
  }

  onClickSaveBtn(): void {
    console.log(this.issueType, this.summary, this.storyPoint);
    this.isSaving = true;
  }



}
