
import { Component, isDevMode } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';

import { ContentService, ClientStorageService, LocalStorage } from './services';


@Component({
    selector: 'beautiful-rising',
    template: `
        <div class="background" data-background="true" [ngStyle]="{'direction': contentService.language==='ar' ? 'rtl' : 'ltr'}">
            <modal></modal>
            <div id="fixed-nav" class="fixed-container-wrapper">
                <div class="container" data-background="true">
                    <div class="language-selection">
                        <span *ngFor="let lang of languages" (click)="language=lang" [class.selected]="language===lang">{{ lang|uppercase }}</span>
                    </div>
                    <menu [textBySlug]="textBySlug"></menu>
                    <a [routerLink]="['']"><img class="logo" src="/assets/icons/logo-en.png"></a>
                </div>
            </div>
            <tools (offsetchanged)="toolsOffset = $event"></tools>
            <div class="content-area" [style.right.px]="toolsOffset">
                <router-outlet></router-outlet>
                <div *ngIf="textBySlug" class="container">
                    <div class="row">
                        <div class="footer">
                            <div class="hr"></div>
                            <div class="col-md-8 col-md-offset-2">
                                <img src="/assets/icons/Creative_Commons.svg">
                                <div [innerMarkdown]="textBySlug.ui.footer"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `
})
export class AppComponent {
    //@LocalStorage() language;
    language = 'en';
    right = 0;

    constructor(
        private router: Router,
        private clientStorageService: ClientStorageService,
        private contentService: ContentService) {
    }
    ngOnInit() {
        // Send pageviews to Google Analytics
        if (!isDevMode()) {
            this.router.events.subscribe(event => {
                if (event instanceof NavigationEnd) {
                    ga('set', 'page', event.url);
                    ga('send', 'pageview');
                }
            });
        }
        // Attempt to guess and the language
        //this.language = this.language || (navigator.languages || ['en'])[0].slice(0,2);
        this.contentService.language = this.language;
        // Get the content
        this.contentService.injectContent(this);
    }
}

