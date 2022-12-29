import { JiraSprint } from '../../lib/define';
import { getUrlBoardId } from '../../lib/utils';
import { JiraService } from '../../services/jira.service';
import { UrlWatchService } from '../../services/url-watch-service';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'sprint-selector',
  templateUrl: './sprint-selector.component.html',
  styleUrls: ['./sprint-selector.component.sass'],
})
export class SprintSelectorComponent {
  @Input() sprintId = 0;
  @Input() sprint: JiraSprint;
  @Output() sprintIdChange = new EventEmitter<number>();
  @Output() sprintChange = new EventEmitter<JiraSprint>();

  sprints$ = new Subject<JiraSprint[]>();
  private lastBoardId: number | null = null;
  private sprintIdMap: { [id: number]: JiraSprint } = {};

  private destroy$ = new Subject<void>();

  constructor(private jiraService: JiraService, private urlWatchService: UrlWatchService) {
    this.urlWatchService.urlChange$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.reset();
    });

    this.sprints$.subscribe((sps) => {
      this.sprintIdMap = {};
      sps.forEach((sp) => (this.sprintIdMap[sp.id] = sp));
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
  }

  onSelectChange(): void {
    this.sprintIdChange.emit(this.sprintId);
    this.sprintChange.emit(this.sprintIdMap[this.sprintId]);
  }

  private reset(): void {
    const _clearSpOpt = () => {
      this.sprints$.next([]);
      this.sprintId = 0;
      this.sprintIdChange.emit(0);
    };

    const boardId = getUrlBoardId();

    if (boardId) {
      if (boardId !== this.lastBoardId) {
        _clearSpOpt();

        this.jiraService.getAllSprint(boardId).subscribe((sps) => {
          this.sprints$.next(sps);
        });
      }
    } else {
      _clearSpOpt();
    }
    this.lastBoardId = boardId;
  }
}
