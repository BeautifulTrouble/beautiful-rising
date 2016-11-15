import { enableProdMode } from '@angular/core';
//import { platformBrowser } from '@angular/platform-browser';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

//import { AppModuleNgFactory } from '../aot/app/app.module.ngFactory';
import { AppModule } from './app.module';


// Set the mode
if (process.env.ENV === 'production') {
    enableProdMode();
}

// Bootstrap the Angular app
const platform = platformBrowserDynamic();
platform.bootstrapModule(AppModule);
//platformBrowser().bootstrapModule(AppModuleNgFactory);

