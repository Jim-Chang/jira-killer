import { ConfigService } from './config.service';
import { Injectable } from '@angular/core';

type Config = {
  teamFieldId: string;
  sprintFieldId: string;
  epicFieldId: string;
  storyPointFieldId: string;
};

@Injectable({
  providedIn: 'root',
})
export class JiraFieldService {
  CONFIG_KEYS = ['teamFieldId', 'sprintFieldId', 'epicFieldId', 'storyPointFieldId'];

  private config: Config;

  private preifx = 'customfield_';

  constructor(private configService: ConfigService) {
    this.configService.loadByKeys<Config>(this.CONFIG_KEYS).subscribe((cfg) => (this.config = cfg));
  }

  get teamField(): string {
    return `${this.preifx}${this.config.teamFieldId}`;
  }

  get sprintField(): string {
    return `${this.preifx}${this.config.sprintFieldId}`;
  }

  get epicField(): string {
    return `${this.preifx}${this.config.epicFieldId}`;
  }

  get storyPointField(): string {
    return `${this.preifx}${this.config.storyPointFieldId}`;
  }
}
