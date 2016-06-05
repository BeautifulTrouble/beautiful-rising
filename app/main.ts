// Bootstrap the Angular app. General purpose exports belong in utilities.

import {enableProdMode} from '@angular/core';
import {bootstrap} from '@angular/platform-browser-dynamic';
import {AppComponent} from './components';
import {config} from './config';

import 'rxjs/Rx';
import 'lodash';

if (config.production) {
    enableProdMode();
}
bootstrap(AppComponent);

