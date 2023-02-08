import { ConfigService } from '../service/config-service';
import { Component, NgZone } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.sass'],
})
export class AppComponent {
  jiraDomain: string;

  email: string;
  apiToken: string;

  teamFieldId: string;
  sprintFieldId: string;
  epicFieldId: string;
  storyPointFieldId: string;

  pokerGameId: string;
  dashboardGSheetUrl: string;
  meetingNoteGDocId: string;
  jiraInBlack: boolean;
  breakdownBySubtask: boolean;

  isSaving = false;
  msg = '';

  constructor(private zone: NgZone, private configService: ConfigService) {}

  ngOnInit(): void {
    this.configService.load().subscribe((config) => {
      this.jiraDomain = config.jiraDomain;
      this.email = config.email;
      this.apiToken = config.apiToken;
      this.teamFieldId = config.teamFieldId;
      this.sprintFieldId = config.sprintFieldId;
      this.epicFieldId = config.epicFieldId;
      this.storyPointFieldId = config.storyPointFieldId;
      this.pokerGameId = config.pokerGameId;
      this.meetingNoteGDocId = config.meetingNoteGDocId;
      this.dashboardGSheetUrl = config.dashboardGSheetUrl;
      this.jiraInBlack = config.jiraInBlack;
      this.breakdownBySubtask = config.breakdownBySubtask;
    });
  }

  onConfigChange(): void {
    const config = {
      jiraDomain: this.jiraDomain,
      email: this.email,
      apiToken: this.apiToken,
      teamFieldId: this.teamFieldId,
      sprintFieldId: this.sprintFieldId,
      epicFieldId: this.epicFieldId,
      storyPointFieldId: this.storyPointFieldId,
      pokerGameId: this.pokerGameId,
      meetingNoteGDocId: this.meetingNoteGDocId,
      dashboardGSheetUrl: this.dashboardGSheetUrl,
      jiraInBlack: this.jiraInBlack,
      breakdownBySubtask: this.breakdownBySubtask,
    };
    this.isSaving = true;
    this.configService.save(config).subscribe();
  }
}
