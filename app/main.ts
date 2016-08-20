
import { NgModule, enableProdMode } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HTTP_PROVIDERS } from '@angular/http';
import { BrowserModule, Title } from '@angular/platform-browser';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { RouterModule } from '@angular/router';

import { APP_COMPONENTS, AppComponent, appRoutes } from './components';
import { APP_DIRECTIVES } from './directives';
import { APP_SERVICES } from './services';
import { APP_PIPES } from './utilities';


// Create the app module
@NgModule({
    bootstrap: [ AppComponent ],
    imports: [
        BrowserModule,
        FormsModule,
        RouterModule.forRoot(appRoutes),
    ],
    declarations: [
        APP_COMPONENTS,
        APP_DIRECTIVES,
        APP_PIPES,
    ],
    providers: [
        APP_SERVICES,
        HTTP_PROVIDERS,
        Title,
    ]
})
class AppModule {}


// Set the mode
if (process.env.ENV === 'production') {
    enableProdMode();
}


// Bootstrap the Angular app
platformBrowserDynamic().bootstrapModule(AppModule);

