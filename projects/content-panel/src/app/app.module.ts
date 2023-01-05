import { AppComponent } from './app.component';
import { BacklogMaintenanceComponent } from './components/backlog-maintenance/backlog-maintenance.component';
import { BreakdownTaskInputComponent } from './components/breakdown-task-input/breakdown-task-input.component';
import { BreakdownTaskComponent } from './components/breakdown-task/breakdown-task.component';
import { BrowseIssueComponent } from './components/browse-issue/browse-issue.component';
import { ChartComponent } from './components/chart/chart.component';
import { PokerComponent } from './components/poker/poker.component';
import { SprintSelectorComponent } from './components/sprint-selector/sprint-selector.component';
import { StoryTransitComponent } from './components/story-transit/story-transit.component';
import { WorkloadComponent } from './components/workload/workload.component';
import { setAssetRootUrl, setExtensionId } from './define/base';
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
    BacklogMaintenanceComponent,
    StoryTransitComponent,
    PokerComponent,
    WorkloadComponent,
    SprintSelectorComponent,
    ChartComponent,
    BrowseIssueComponent,
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
    setExtensionId(idEle!.getAttribute('data-runtime-id') as string);
    setAssetRootUrl(idEle!.getAttribute('data-asset-root-url') as string);
    idEle!.remove();

    const applicationWrapper = createCustomElement(AppComponent, { injector: this.injector });
    customElements.define(this.JIRA_KILLER, applicationWrapper);

    const ele = document.createElement(this.JIRA_KILLER);
    document.body.append(ele);

    console.log('Content bootstrap finish');
  }
}
