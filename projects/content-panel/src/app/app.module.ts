import {Injector, NgModule} from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import {createCustomElement} from "@angular/elements";
import { BreakdownTaskComponent } from './components/breakdown-task/breakdown-task.component';
import { BreakdownTaskInputComponent } from './components/breakdown-task-input/breakdown-task-input.component';
import {FormsModule} from "@angular/forms";
import {HttpClientModule} from "@angular/common/http";
import {setExtensionId} from "./lib/define";

@NgModule({
  declarations: [
    AppComponent,
    BreakdownTaskComponent,
    BreakdownTaskInputComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
  ],
  providers: [],
  entryComponents: [
    AppComponent,
  ],
})
export class AppModule {
  private JIRA_KILLER = 'jira-killer';

  constructor(private injector: Injector) { }

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
