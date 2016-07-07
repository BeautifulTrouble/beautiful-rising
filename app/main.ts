
// Bootstrap the Angular app. General purpose exports belong in utilities.
import { bootstrap } from '@angular/platform-browser-dynamic';
import { enableProdMode } from '@angular/core';
import { AppComponent } from './components';

// Import all the providers and make them globally available
import { HTTP_PROVIDERS } from '@angular/http';
import { BrowserDomAdapter } from '@angular/platform-browser/src/browser/browser_adapter';
import { Title } from '@angular/platform-browser/src/browser/title';

import { APP_ROUTER_PROVIDERS } from './components';
import { ContentService, ClientStorageService, ModuleSavingService, OutsideAngularService, CachedHttpService, MarkdownService } from './services';

if (process.env.ENV === 'production') {
    enableProdMode();
}

bootstrap(AppComponent, [
    HTTP_PROVIDERS,
    BrowserDomAdapter,
    Title,

    APP_ROUTER_PROVIDERS,
    MarkdownService,
    ContentService,
    ClientStorageService,
    ModuleSavingService,
    OutsideAngularService,
    CachedHttpService,
]);

