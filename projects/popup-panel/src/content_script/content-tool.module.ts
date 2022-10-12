import {Injector, NgModule} from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import {FormsModule} from "@angular/forms";
import {ContentToolComponent} from "./content-tool.component";
import {createCustomElement} from "@angular/elements";
import {LOG_PREFIX} from "./define";

@NgModule({
  declarations: [
    ContentToolComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
  ],
  providers: [],
  bootstrap: []
})
export class ContentToolModule {
  constructor(private injector: Injector) { }

  ngDoBootstrap(): void {
    const applicationWrapper = createCustomElement(ContentToolComponent, { injector: this.injector });
    customElements.define('jira-killer', applicationWrapper);
    console.log(LOG_PREFIX, 'ContentModule');
  }
}
