import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.sass'],
})
export class AppComponent {
  title = 'content-panel';
  isShowTopPanel = false;
  isShowLeftPanel = false;

  get switchTopBtnText(): string {
    return this.isShowTopPanel ? '▲' : '▼';
  }

  get switchLeftBtnText(): string {
    return this.isShowLeftPanel ? '◀' : '▶';
  }

  ngOnInit(): void {
    console.log('init app component');
  }

  onClickTopSwitchBtn(): void {
    this.isShowTopPanel = !this.isShowTopPanel;
  }

  onClickLeftSwitchBtn(): void {
    this.isShowLeftPanel = !this.isShowLeftPanel;
  }
}
