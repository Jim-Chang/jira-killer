import { AppComponent } from './app.component';
import { BacklogComponent } from './components/backlog/backlog.component';
import { BreakdownTaskInputComponent } from './components/breakdown-task-input/breakdown-task-input.component';
import { BreakdownTaskComponent } from './components/breakdown-task/breakdown-task.component';
import { PokerComponent } from './components/poker/poker.component';
import { StoryBoardComponent } from './components/story-board/story-board.component';
import { setExtensionId } from './lib/define';
import { HttpClientModule } from '@angular/common/http';
import { Injector, NgModule } from '@angular/core';
import { createCustomElement } from '@angular/elements';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';

@NgModule({
  declarations: [
    AppComponent,
    BreakdownTaskComponent,
    BreakdownTaskInputComponent,
    BacklogComponent,
    StoryBoardComponent,
    PokerComponent,
  ],
  imports: [BrowserModule, FormsModule, HttpClientModule],
  providers: [],
  entryComponents: [AppComponent],
})
export class AppModule {
  private JIRA_KILLER = 'jira-killer';

  constructor(private injector: Injector) {}

  ngDoBootstrap(): void {
    const idEle = document.getElementById('jiraKillerId');
    setExtensionId(idEle!.getAttribute('data') as string);
    idEle!.remove();

    const applicationWrapper = createCustomElement(AppComponent, { injector: this.injector });
    customElements.define(this.JIRA_KILLER, applicationWrapper);

    const ele = document.createElement(this.JIRA_KILLER);
    document.body.append(ele);

    console.log('Content bootstrap finish');
  }
}
