import { environment } from '../../../environments/environment';
import { Directive, HostListener, Input } from '@angular/core';
import mixpanel from 'mixpanel-browser';
import { debounce, debounceTime, Subject } from 'rxjs';

@Directive({
  selector: '[mpTrack]',
})
export class MpTrackDirective {
  @Input('mpTriggerEvent') triggerEvent: string[] | string;
  @Input('mpEventName') eventName: string;
  @Input('mpEventData') eventData: { [key: string]: any };

  private event$ = new Subject<void>();

  constructor() {
    mixpanel.init(environment.mixpanelToken, { debug: !environment.production });

    this.event$.pipe(debounceTime(500)).subscribe(() => this.send());
  }

  @HostListener('click')
  onClick() {
    if (this.isValidEvent('click')) {
      this.send();
    }
  }

  @HostListener('keyup.enter')
  onKeyupEnter() {
    if (this.isValidEvent('keyup.enter')) {
      this.send();
    }
  }

  @HostListener('wheel')
  onWheel() {
    if (this.isValidEvent('wheel')) {
      this.debounceSend();
    }
  }

  private isValidEvent(eventName: string): boolean {
    if (Array.isArray(this.triggerEvent) && !this.triggerEvent.includes(eventName)) {
      return false;
    } else if (this.triggerEvent !== eventName) {
      return false;
    }
    return true;
  }

  private send(): void {
    mixpanel.track(this.eventName, this.eventData);
  }

  private debounceSend(): void {
    this.event$.next();
  }
}
