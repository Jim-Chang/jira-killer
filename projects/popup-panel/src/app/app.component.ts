import {Component, NgZone} from '@angular/core';
import {Config, ConfigService} from "../service/config-service";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.sass']
})
export class AppComponent {
  jiraDomain: string;

  email: string;
  apiToken: string;

  teamFieldId: string;
  sprintFieldId: string;
  epicFieldId: string;
  storyPointFieldId: string;

  isSaving = false;

  constructor(private zone: NgZone, private configService: ConfigService) {
  }

  ngOnInit(): void {
    this.configService.load().subscribe((config) => {
      this.jiraDomain = config.jiraDomain;
      this.email = config.email;
      this.apiToken = config.apiToken;
      this.teamFieldId = config.teamFieldId;
      this.sprintFieldId = config.sprintFieldId;
      this.epicFieldId = config.epicFieldId;
      this.storyPointFieldId = config.storyPointFieldId;
    });
  }

  get saveBtnText(): string {
    return this.isSaving ? 'Saving...' : 'Save';
  }

  onClickSaveBtn(): void {
    const config = {
      jiraDomain: this.jiraDomain,
      email: this.email,
      apiToken: this.apiToken,
      teamFieldId: this.teamFieldId,
      sprintFieldId: this.sprintFieldId,
      epicFieldId: this.epicFieldId,
      storyPointFieldId: this.storyPointFieldId,
    };
    this.isSaving = true;
    this.configService.save(config).subscribe(() => this.isSaving = false);
  }
}
