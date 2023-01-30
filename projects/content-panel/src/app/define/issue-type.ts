export enum JiraIssueType {
  Epic = 'Epic',
  Story = 'Story',
  Task = 'Task',
  Bug = 'Bug',
  Test = 'Test',
  Improvement = 'Improvement',
  Subtask = 'Sub-task',
  SubTestExecution = 'Sub Test Execution',
}

export enum CustomIssueType {
  FETask = 'RD Frontend',
  BETask = 'RD Backend',
}

export type IssueType = JiraIssueType | CustomIssueType;
export type SubtaskIssueType = JiraIssueType.Subtask | JiraIssueType.SubTestExecution;
