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
  isShowRightPanel = false;
  isShowTopLeftPanel = false;

  @ViewChild('topPanel') topPanel: ElementRef;
  @ViewChild('bottomPanel') bottomPanel: ElementRef;
  @ViewChild('leftPanel') leftPanel: ElementRef;
  @ViewChild('rightPanel') rightPanel: ElementRef;
  @ViewChild('topLeftPanel') topLeftPanel: ElementRef;

  getSwitchTopBtnText(panelShowStatus: boolean): string {
    return panelShowStatus ? '▲' : '▼';
  }

  getSwitchLeftBtnText(panelShowStatus: boolean): string {
    return panelShowStatus ? '◀' : '▶';
  }

  getSwitchRightBtnText(panelShowStatus: boolean): string {
    return panelShowStatus ? '▶' : '◀';
  }

  get topPanelPlace(): any {
    const left = `calc(50% - ${this.topPanel?.nativeElement.offsetWidth / 2}px)`;
    if (this.isShowTopPanel) {
      return { top: '0', left };
    } else {
      return { top: `${-this.topPanel?.nativeElement.offsetHeight - 6 || -1000}px`, left };
    }
  }

  get bottomPanelPlace(): any {
    const left = `calc(50% - ${this.bottomPanel?.nativeElement.offsetWidth / 2}px)`;
    return { bottom: '0', left };
  }

  get topLeftPanelPlace(): any {
    if (this.isShowTopLeftPanel) {
      return { top: '0', left: '0' };
    } else {
      return { top: `${-this.topLeftPanel?.nativeElement.offsetHeight || -1000}px`, left: '0' };
    }
  }

  get leftPanelPlace(): any {
    const top = `calc(50% - ${this.leftPanel?.nativeElement.offsetHeight / 2}px)`;
    if (this.isShowLeftPanel) {
      return { left: '0', top };
    } else {
      return { left: `${-this.leftPanel?.nativeElement.offsetWidth || -1000}px`, top };
    }
  }

  get rightPanelPlace(): any {
    const top = `calc(50% - ${this.rightPanel?.nativeElement.offsetHeight / 2}px)`;
    if (this.isShowRightPanel) {
      return { right: '0', top };
    } else {
      return { right: `${-this.rightPanel?.nativeElement.offsetWidth || -1000}px`, top };
    }
  }

  onClickTopSwitchBtn(): void {
    this.isShowTopPanel = !this.isShowTopPanel;
  }

  onClickTopLeftSwitchBtn(): void {
    this.isShowTopLeftPanel = !this.isShowTopLeftPanel;
  }

  onClickLeftSwitchBtn(): void {
    this.isShowLeftPanel = !this.isShowLeftPanel;
  }

  onClickRightSwitchBtn(): void {
    this.isShowRightPanel = !this.isShowRightPanel;
  }
}
