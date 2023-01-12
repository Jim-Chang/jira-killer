import { getExtensionId } from '../define/base';
import { Injectable, NgZone } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ConfigService {
  constructor(private zone: NgZone) {}

  loadByKeys<T>(keys: string[]): Observable<T> {
    return new Observable<any>((subscriber) => {
      const EXTENSION_ID = getExtensionId();

      chrome.runtime.sendMessage(EXTENSION_ID, { chromeApi: 'storage.sync.get', data: { keys } }, (items) => {
        this.zone.run(() => {
          subscriber.next(items);
          subscriber.complete();
        });
      });
    });
  }
}
