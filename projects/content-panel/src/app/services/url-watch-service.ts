import {Injectable, NgZone} from "@angular/core";
import {Subject} from "rxjs";


@Injectable({
  providedIn: 'root',
})
export class UrlWatchService {

  private observer: MutationObserver;
  private oldHref = '';

  private urlChange$$ = new Subject<void>();
  urlChange$ = this.urlChange$$.asObservable();

  constructor(private zone: NgZone) {
    this.observer = new MutationObserver((mutations) => {
      this.zone.run(() => this.handle());
    });
    this.observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  private handle(): void {
    const href = window.location.href;
    if (href !== this.oldHref) {
      this.oldHref = href;
      this.urlChange$$.next();
    }
  }
}
