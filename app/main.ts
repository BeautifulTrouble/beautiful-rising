
// Bootstrap the Angular app.
import { enableProdMode } from '@angular/core';
import { bootstrap } from '@angular/platform-browser-dynamic';

// Import all the providers and make them globally available
import { HTTP_PROVIDERS } from '@angular/http';
import { Title } from '@angular/platform-browser';

import { Angulartics2 } from 'angulartics2';

import { AppComponent, APP_ROUTER_PROVIDERS } from './components';
import { ContentService, ClientStorageService, ModuleSavingService, OutsideAngularService, CachedHttpService, MarkdownService } from './services';


if (process.env.ENV === 'production') {
    enableProdMode();
}

bootstrap(AppComponent, [
    HTTP_PROVIDERS,
    Title,

    Angulartics2,

    APP_ROUTER_PROVIDERS,
    MarkdownService,
    ContentService,
    ClientStorageService,
    ModuleSavingService,
    OutsideAngularService,
    CachedHttpService,
]);

