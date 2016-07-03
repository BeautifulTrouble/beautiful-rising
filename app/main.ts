
// Bootstrap the Angular app. General purpose exports belong in utilities.
import { bootstrap } from '@angular/platform-browser-dynamic';
import { enableProdMode } from '@angular/core';

import { AppComponent } from './components';

// Import all the providers and make them global
import { ROUTER_PROVIDERS } from '@angular/router-deprecated';
import { HTTP_PROVIDERS } from '@angular/http';
import { BrowserDomAdapter } from '@angular/platform-browser/src/browser/browser_adapter';
import { Title } from '@angular/platform-browser/src/browser/title';
import { ContentService, ClientStorageService, ModuleSavingService, OutsideAngularService, CachedHttpService } from './services';


if (process.env.ENV === 'production') {
    enableProdMode();
}

bootstrap(AppComponent, [
    ROUTER_PROVIDERS,
    HTTP_PROVIDERS,
    Title,
    BrowserDomAdapter,

    ContentService,
    ClientStorageService,
    ModuleSavingService,
    OutsideAngularService,
    CachedHttpService,
]);

