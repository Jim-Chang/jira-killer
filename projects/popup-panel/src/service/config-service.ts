import { Injectable, NgZone } from '@angular/core';
import { Observable } from 'rxjs';

export type Config = {
  jiraDomain: string;
  email: string;
  apiToken: string;
  teamFieldId: string;
  sprintFieldId: string;
  epicFieldId: string;
  storyPointFieldId: string;
  pokerGameId: string;
  meetingNoteGDocId: string;
  dashboardGSheetUrl: string;
  jiraInBlack: boolean;
  breakdownBySubtask: boolean;
};

export const CONFIG_KEYS = [
  'jiraDomain',
  'email',
  'apiToken',
  'teamFieldId',
  'sprintFieldId',
  'epicFieldId',
  'storyPointFieldId',
  'pokerGameId',
  'meetingNoteGDocId',
  'dashboardGSheetUrl',
  'jiraInBlack',
  'breakdownBySubtask',
];

@Injectable({
  providedIn: 'root',
})
export class ConfigService {
  constructor(private zone: NgZone) {}

  save(config: Config): Observable<void> {
    return new Observable<void>((subscriber) => {
      chrome.storage.sync.set(config, () => {
        this.zone.run(() => {
          subscriber.next();
          subscriber.complete();
        });
      });
    });
  }

  load(): Observable<Config> {
    return new Observable<Config>((subscriber) => {
      chrome.storage.sync.get(CONFIG_KEYS, (items) => {
        this.zone.run(() => {
          subscriber.next(items as Config);
          subscriber.complete();
        });
      });
    });
  }
}
