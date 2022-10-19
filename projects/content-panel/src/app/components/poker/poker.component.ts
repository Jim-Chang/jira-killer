import { ConfigService } from '../../services/config.service';
import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'poker',
  templateUrl: './poker.component.html',
  styleUrls: ['./poker.component.sass'],
})
export class PokerComponent {
  private baseUrl = 'https://planningpokeronline.com/';
  url = '';
  safeUrl: SafeResourceUrl;

  isCopied = false;

  constructor(private sanitizer: DomSanitizer, private configService: ConfigService) {
    this.configService.loadByKeys<{ pokerGameId: string }>(['pokerGameId']).subscribe((cfg) => {
      if (cfg.pokerGameId) {
        this.url = this.baseUrl + cfg.pokerGameId;
        this.safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.url);
      }
    });
  }

  onClickUrl(): void {
    this.isCopied = false;
    navigator.clipboard.writeText(this.url).then(() => (this.isCopied = true));
  }
}
