export enum JiraIssueType {
  Epic = 'Epic',
  Story = 'Story',
  Task = 'Task',
  Bug = 'Bug',
  Test = 'Test',
  Improvement = 'Improvement',
  Survey = 'Survey',
  FETask = 'RD Frontend',
  BETask = 'RD Backend',
}

export enum JiraSubtaskIssueType {
  Subtask = 'Sub-task',
  SubTestExecution = 'Sub Test Execution',
}

export type IssueType = JiraIssueType | JiraSubtaskIssueType;
