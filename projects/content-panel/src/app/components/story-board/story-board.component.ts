import { JiraSprint } from '../../lib/define';
import { getUrlBoardId } from '../../lib/utils';
import { JiraStoryService } from '../../services/jira-story.service';
import { JiraService } from '../../services/jira.service';
import { Component } from '@angular/core';

@Component({
  selector: 'story-board',
  templateUrl: './story-board.component.html',
  styleUrls: ['./story-board.component.sass'],
})
export class StoryBoardComponent {
  sprint: JiraSprint | null = null;
  needTransitResult = '';

  constructor(private jiraService: JiraService, private storyService: JiraStoryService) {}

  ngOnInit(): void {
    const boardId = getUrlBoardId();
    if (boardId) {
      this.jiraService.getAllSprint(boardId).subscribe((sps) => {
        const activeSp = sps.find((sp) => sp.state === 'active');
        if (activeSp) {
          this.sprint = activeSp;
        }
      });
    }
  }

  onClickTransitStoryStatusBtn(): void {
    if (this.sprint) {
      this.storyService.doTransitStoryStatus$(this.sprint.id).subscribe((data) => {
        this.needTransitResult = '';
        Object.entries(data).forEach(([status, issues]) => {
          this.needTransitResult += `-> ${status}: ${issues.map((issue) => issue.key).join(',')}<br> `;
        });
      });
    }
  }
}
