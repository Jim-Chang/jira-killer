import './content_script';
import * as $ from "jquery";
import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { environment } from './environments/environment';
import {ContentToolComponent} from "./content_script/content-tool.component";
import {LOG_PREFIX} from "./content_script/define";




if (environment.production) {
  enableProdMode();
}

platformBrowserDynamic().bootstrapModule(ContentToolComponent)
  .catch(err => console.error(err));

$('body').append('<jira-killer></jira-killer>');
console.log(LOG_PREFIX, 'insert jira killer');
