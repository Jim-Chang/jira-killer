import {Injector, NgModule} from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import {createCustomElement} from "@angular/elements";


@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule
  ],
  providers: [],
  entryComponents: [
    AppComponent,
  ],
})
export class AppModule {
  constructor(private injector: Injector) { }

  ngDoBootstrap(): void {
    const applicationWrapper = createCustomElement(AppComponent, { injector: this.injector });
    customElements.define('jira-killer', applicationWrapper);
    console.log('Content bootstrap');
  }
}
