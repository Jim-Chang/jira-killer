import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.sass']
})
export class AppComponent {
  title = 'content-panel';
  isShowPanel = false;

  get switchBtnText(): string {
    return this.isShowPanel ? '▲' : '▼';
  }

  ngOnInit(): void {
    console.log('init app component');
  }

  onClickSwitchBtn(): void {
    this.isShowPanel = !this.isShowPanel;
  }
}
