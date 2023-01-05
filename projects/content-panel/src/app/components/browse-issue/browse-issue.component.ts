import { getUrlProjectKey } from '../../lib/url-utils';
import { ConfigService } from '../../services/config.service';
import { UrlWatchService } from '../../services/url-watch-service';
import { Component } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'browse-issue',
  templateUrl: './browse-issue.component.html',
  styleUrls: ['./browse-issue.component.sass'],
})
export class BrowseIssueComponent {
  projectKey: string | null = null;
  wantBrowseIssueKey = '';

  private destroy$ = new Subject<void>();

  constructor(private configService: ConfigService, private urlWatchService: UrlWatchService) {
    this.urlWatchService.urlChange$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.reset();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
  }

  onClickBrowseIssueBtn(): void {
    this.configService.loadByKeys<{ jiraDomain: string }>(['jiraDomain']).subscribe((cfg) => {
      if (!cfg.jiraDomain) {
        console.error('Please set jira domain first');
        return;
      }
      const key = this.cleanIssueKey(this.wantBrowseIssueKey);
      if (!key) {
        console.error('Not key format');
        return;
      }
      const url = `https://${cfg.jiraDomain}.atlassian.net/browse/${key}`;
      window.open(url, '_blank')?.focus();
    });
  }

  private reset(): void {
    this.projectKey = getUrlProjectKey();
  }

  private cleanIssueKey(key: string): string | null {
    let ret: string | null = null;

    if (key.match(/[a-zA-Z]+[0-9]+/)) {
      // fts1234
      const prefix = key.match(/[a-zA-Z]+/)![0];
      const code = key.replace(prefix, '');
      ret = `${prefix}-${code}`.toUpperCase();
    } else if (key.match(/[a-zA-Z]+-[0-9]+/)) {
      // fts-1234
      ret = key.toUpperCase();
    } else if (this.projectKey && key.match(/^[0-9]+/)) {
      ret = `${this.projectKey}-${key}`;
    }
    return ret;
  }
}
