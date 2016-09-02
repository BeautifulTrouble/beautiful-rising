
import { NgModule, enableProdMode } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule, JsonpModule } from '@angular/http';
import { BrowserModule, Title } from '@angular/platform-browser';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { RouterModule } from '@angular/router';

import { ReCaptchaComponent } from 'angular2-recaptcha/angular2-recaptcha';

import { APP_DIRECTIVES } from './directives';
import { APP_SERVICES } from './services';
import { APP_PIPES } from './utilities';
import { AboutComponent } from './about.component';
import { AboutInnerComponent } from './about-inner.component';
import { AppComponent } from './app.component';
import { ContributeComponent } from './contribute.component';
import { DetailComponent } from './detail.component';
import { GalleryComponent } from './gallery.component';
import { NavbarComponent } from './navbar.component';
import { ModalComponent } from './modal.component';
import { ModuleTypeComponent } from './module-types.component';
import { PlatformsComponent } from './platforms.component';
import { ResourcesComponent } from './resources.component';
import { ToolsComponent } from './tools.component';

import '../styles.scss';


// Define routes
const appRoutes = [
    {path: '',                      component: GalleryComponent},
    {path: 'search/:query',         component: GalleryComponent},
    {path: 'tag/:tag',              component: GalleryComponent},
    {path: 'type/:type',            component: GalleryComponent},
    {path: 'type/story/:region',    component: GalleryComponent},

    {path: 'module',                redirectTo: 'tool', pathMatch: 'prefix'},
    {path: 'tool/:slug',            component: DetailComponent},

    {path: 'about',                 component: AboutComponent},
    {path: 'about/:section',        component: AboutComponent},
    {path: 'platforms',             component: PlatformsComponent},
    {path: 'platforms/:section',    component: PlatformsComponent},
    {path: 'resources',             component: ResourcesComponent},
    {path: 'resources/:section',    component: ResourcesComponent},
    {path: 'contribute',            component: ContributeComponent},
    {path: 'contribute/:section',   component: ContributeComponent}
];


// Create the app module
@NgModule({
    bootstrap: [ AppComponent ],
    imports: [
        BrowserModule,
        FormsModule,
        HttpModule,
        JsonpModule,
        RouterModule.forRoot(appRoutes),
    ],
    declarations: [
        ReCaptchaComponent, 

        APP_DIRECTIVES,
        APP_PIPES,
        AboutComponent,
        AboutInnerComponent,
        AppComponent,
        ContributeComponent,
        DetailComponent,
        GalleryComponent,
        NavbarComponent,
        ModalComponent,
        ModuleTypeComponent,
        PlatformsComponent,
        ResourcesComponent,
        ToolsComponent,
    ],
    providers: [
        APP_SERVICES,
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

