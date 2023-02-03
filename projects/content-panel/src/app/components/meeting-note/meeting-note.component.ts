import { ConfigService } from '../../services/config.service';
import { Component, Input, SimpleChanges } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'meeting-note',
  templateUrl: './meeting-note.component.html',
  styleUrls: ['./meeting-note.component.sass'],
})
export class MeetingNoteComponent {
  @Input() shouldLazyLoad = false;

  url = '';
  safeUrl: SafeResourceUrl;
  isCopied = false;
  docId = '';

  private baseUrl = 'https://docs.google.com/document/d/';
  private lazyLoaded = false;

  constructor(private sanitizer: DomSanitizer, private configService: ConfigService) {
    this.configService.loadByKeys<{ meetingNoteGDocId: string }>(['meetingNoteGDocId']).subscribe((cfg) => {
      if (cfg.meetingNoteGDocId) {
        this.docId = cfg.meetingNoteGDocId;
        this.url = this.baseUrl + this.docId;
      }
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if ('shouldLazyLoad' in changes && this.shouldLazyLoad && !this.lazyLoaded && this.docId) {
      this.lazyLoaded = true;
      this.safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.url);
    }
  }

  onClickUrl(): void {
    this.isCopied = false;
    navigator.clipboard.writeText(this.url).then(() => (this.isCopied = true));
  }
}
