import { JiraSprint } from '../../define/jira-type';
import { getUrlBoardId } from '../../lib/url-utils';
import { JiraStoryService } from '../../services/jira-story.service';
import { JiraService } from '../../services/jira.service';
import { UrlWatchService } from '../../services/url-watch-service';
import { Component } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'story-transit',
  templateUrl: './story-transit.component.html',
  styleUrls: ['./story-transit.component.sass'],
})
export class StoryTransitComponent {
  sprint: JiraSprint | null = null;
  needTransitResult = '';

  private destroy$ = new Subject<void>();

  constructor(
    private jiraService: JiraService,
    private storyService: JiraStoryService,
    private urlWatchService: UrlWatchService,
  ) {
    this.urlWatchService.urlChange$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.reset();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
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

  private reset(): void {
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
}
