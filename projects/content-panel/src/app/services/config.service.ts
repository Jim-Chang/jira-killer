import {Injectable, NgZone} from "@angular/core";
import {Observable} from "rxjs";
import {getExtensionId} from "../lib/define";


@Injectable({
  providedIn: 'root',
})
export class ConfigService {

  constructor(private zone: NgZone) {
  }

  loadByKeys<T>(keys: string[]): Observable<T> {
    return new Observable<any>((subscriber) => {
      const EXTENSION_ID = getExtensionId();
      console.log('send message', EXTENSION_ID);

      chrome.runtime.sendMessage(EXTENSION_ID, { chromeApi: 'storage.sync.get', data: {keys} }, (items) => {
        console.log('get response', items);
        this.zone.run(() => {
          subscriber.next(items);
          subscriber.complete();
        });
      });

    })
  }

}
