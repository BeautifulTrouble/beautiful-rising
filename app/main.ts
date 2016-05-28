// Bootstrap the Angular app. General purpose exports belong in utilities.

import {enableProdMode} from '@angular/core';
import {bootstrap} from '@angular/platform-browser-dynamic';
import {AppComponent} from './components';

import 'rxjs/Rx';
import 'lodash';

//enableProdMode();
bootstrap(AppComponent);

