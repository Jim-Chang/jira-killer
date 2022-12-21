import { HostListener, Injectable, NgZone } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class JiraAppRequestWatchService {
  private calledSetAssignee$$ = new Subject<void>();
  private calledSetStoryPoint$$ = new Subject<void>();

  get calledSetAssignee$(): Observable<void> {
    return this.calledSetAssignee$$.asObservable();
  }

  get calledSetStoryPoint$(): Observable<void> {
    return this.calledSetStoryPoint$$.asObservable();
  }

  constructor(private zone: NgZone) {
    this.handle();
  }

  private handle(): void {
    window.addEventListener('message', (event) => {
      if (event.source !== window) {
        console.log('this event source is not self, pass it', event);
        return;
      }
      this.zone.run(() => this.dispatchEvent(event.data));
    });
  }

  private dispatchEvent(data: { event: string }): void {
    const eventSubjectMap: { [key: string]: Subject<void> } = {
      jiraAppSetAssignee: this.calledSetAssignee$$,
      jiraAppSetStoryPoint: this.calledSetStoryPoint$$,
    };
    eventSubjectMap[data.event]?.next();
  }
}
