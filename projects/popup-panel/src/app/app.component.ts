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
  jiraInBlack: boolean;

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
      this.jiraInBlack = config.jiraInBlack;
    });
  }

  get saveBtnText(): string {
    return this.isSaving ? 'Saving...' : 'Save';
  }

  onClickSaveBtn(): void {
    this.msg = '';
    const config = {
      jiraDomain: this.jiraDomain,
      email: this.email,
      apiToken: this.apiToken,
      teamFieldId: this.teamFieldId,
      sprintFieldId: this.sprintFieldId,
      epicFieldId: this.epicFieldId,
      storyPointFieldId: this.storyPointFieldId,
      pokerGameId: this.pokerGameId,
      jiraInBlack: this.jiraInBlack,
    };
    this.isSaving = true;
    this.configService.save(config).subscribe(() => {
      this.isSaving = false;
      this.msg = 'OK!';
    });
  }
}
