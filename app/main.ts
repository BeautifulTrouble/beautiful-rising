// Bootstrap the Angular app. General purpose exports belong in utilities.

import {bootstrap} from '@angular/platform-browser-dynamic';
import {enableProdMode} from '@angular/core';

import {AppComponent} from './components';

if (process.env.ENV === 'production') {
    enableProdMode();
}

bootstrap(AppComponent, []);

