import { Component } from '@angular/core';

@Component({
  selector: 'left-panel',
  templateUrl: './left-panel.component.html',
  styleUrls: ['./left-panel.component.sass'],
})
export class LeftPanelComponent {
  isShowPoker = true;
  isShowNote = false;

  constructor() {}

  onClickLeftPanelTabBtn(tab: string): void {
    if (tab === 'poker') {
      this.isShowPoker = true;
      this.isShowNote = false;
    } else if (tab === 'note') {
      this.isShowPoker = false;
      this.isShowNote = true;
    }
  }
}
