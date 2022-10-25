import { Component, ElementRef, ViewChild } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.sass'],
})
export class AppComponent {
  title = 'content-panel';
  isShowTopPanel = false;
  isShowLeftPanel = false;

  @ViewChild('topPanel') topPanel: ElementRef;
  @ViewChild('leftPanel') leftPanel: ElementRef;

  get switchTopBtnText(): string {
    return this.isShowTopPanel ? '▲' : '▼';
  }

  get switchLeftBtnText(): string {
    return this.isShowLeftPanel ? '◀' : '▶';
  }

  get topPanelPlace(): any {
    const left = `calc(50% - ${this.topPanel?.nativeElement.offsetWidth / 2}px)`;
    if (this.isShowTopPanel) {
      return { top: '0', left };
    } else {
      return { top: `${-this.topPanel?.nativeElement.offsetHeight ?? -1000}px`, left };
    }
  }

  get leftPanelPlace(): any {
    const top = `calc(50% - ${this.leftPanel?.nativeElement.offsetHeight / 2}px)`;
    if (this.isShowLeftPanel) {
      return { left: '0', top };
    } else {
      return { left: `${-this.leftPanel?.nativeElement.offsetWidth ?? -1000}px`, top };
    }
  }

  onClickTopSwitchBtn(): void {
    this.isShowTopPanel = !this.isShowTopPanel;
  }

  onClickLeftSwitchBtn(): void {
    this.isShowLeftPanel = !this.isShowLeftPanel;
  }
}
