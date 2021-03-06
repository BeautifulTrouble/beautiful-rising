
import { Component, isDevMode } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';

import { ContentService, ClientStorageService, LocalStorage } from './services';


@Component({
    selector: 'beautiful-rising',
    template: `
        <div class="background" [ngClass]="contentService.language" [ngStyle]="{'direction': contentService.language == 'ar' ? 'rtl' : 'ltr'}">
            <modal></modal>
            <navbar></navbar>
            <tools (offsetchanged)="toolsOffset = $event"></tools>
            <div class="content-area" [style.right.px]="toolsOffset">
                <router-outlet></router-outlet>
                <div *ngIf="textBySlug" class="container">
                    <div class="row">
                        <div class="footer">
                            <div class="hr"></div>
                            <div class="col-md-8 col-md-offset-2">
                                <img src="/assets/img/Creative_Commons.svg">
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
    contentService;
    @LocalStorage() language;
    right = 0;
    toolsOffset;
    textBySlug;

    constructor(
        private router: Router,
        private clientStorageService: ClientStorageService,
        contentService: ContentService) {
        this.contentService = contentService; 
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

        // Detect and set the language
        this.language = this.language || (navigator['languages'] || ['en'])[0].slice(0,2);
        if (this.language != 'en' && this.language != 'es') {
            this.language = 'en';
        }
        this.contentService.setLanguage(this.language);

        // Get the content
        this.contentService.injectContent(this);
    }
}

