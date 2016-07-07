
// Bootstrap the Angular app. General purpose exports belong in utilities.
import { bootstrap } from '@angular/platform-browser-dynamic';
import { enableProdMode } from '@angular/core';

// Import all the providers and make them globally available
import { HTTP_PROVIDERS } from '@angular/http';
import { Title } from '@angular/platform-browser';

import { AppComponent, APP_ROUTER_PROVIDERS } from './components';
import { ContentService, ClientStorageService, ModuleSavingService, OutsideAngularService, CachedHttpService, MarkdownService } from './services';


if (process.env.ENV === 'production') {
    enableProdMode();
}

bootstrap(AppComponent, [
    HTTP_PROVIDERS,
    Title,

    APP_ROUTER_PROVIDERS,
    MarkdownService,
    ContentService,
    ClientStorageService,
    ModuleSavingService,
    OutsideAngularService,
    CachedHttpService,
]);

