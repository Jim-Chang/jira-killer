import {Component, Input, OnInit} from '@angular/core';
import {CustomIssueType, ISSUE_PREFIX_MAP, JiraIssueType} from "../../lib/define";
import {JiraService} from "../../services/jira.service";
import {switchMap} from "rxjs";

@Component({
  selector: 'breakdown-task-input',
  templateUrl: './breakdown-task-input.component.html',
  styleUrls: ['./breakdown-task-input.component.sass']
})
export class BreakdownTaskInputComponent implements OnInit {
  @Input() parentIssueKey: string;
  @Input() parentSummary: string;

  JiraIssueType = JiraIssueType;
  CustomIssueType = CustomIssueType;

  issueType: JiraIssueType | CustomIssueType;
  summary = '';
  storyPoint: number | null = null;

  issueKey: string;

  private isSaving = false;
  private created = false;

  get saveBtnText(): string {
    return this.isSaving ? 'Saving' : 'Save';
  }

  get issueUrl(): string {
    if (this.issueKey) {
      return this.jiraService.getIssueUrl(this.issueKey);
    }
    return ''
  }

  constructor(private jiraService: JiraService) { }

  ngOnInit(): void {
    this.summary = this.parentSummary;
  }

  canSave(): boolean {
    return !!this.summary && !!this.issueType && !this.isSaving && !this.created;
  }

  onChangeStoryPoint(): void {
    if (this.storyPoint && this.storyPoint < 0) {
      this.storyPoint = 0;
    }
  }

  onChangeIssueType(): void {
    const prefix = ISSUE_PREFIX_MAP[this.issueType];
    this.summary = `${prefix}${this.parentSummary}`;
  }

  onClickSaveBtn(): void {
    console.log(this.issueType, this.summary, this.storyPoint);
    this.isSaving = true;

    this.jiraService.getIssue(this.parentIssueKey).pipe(
      switchMap((issue) => this.jiraService.createIssue(issue, this.summary, this.issueType, this.storyPoint)),
      switchMap((key) => {
        this.issueKey = key;
        return this.jiraService.blockIssue(this.issueKey, this.parentIssueKey);
      })
    ).subscribe(() => {
      this.isSaving = false;
      this.created = true;
    });
  }



}
