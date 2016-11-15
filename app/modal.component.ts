
import { Component } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';

import { ContentService, LocalStorage } from './services';


@Component({
    selector: 'modal',
    template: `
        <div class="hidden-xs fixed-container-wrapper"
         *ngIf="textBySlug && !(dismissedExplicitly || dismissedImplicitly)"
         #wrapper
         [style.margin-right.px]="-50" 
         [style.right.px]="50 - (wrapper.offsetWidth - wrapper.clientWidth)"
         (click)="dismissedImplicitly = true">
            <div class="container">
                <div (click)="$event.stopPropagation()" class="inner row">
                    <div class="upper row">
                        <div class="banner"></div>
                        <div class="col-md-5">
                            <img [ngClass]="['logo', language]" src="/assets/img/logo-reverse-{{ language }}.png">
                            <h3>{{ textBySlug.about.modal.welcome }}</h3>
                            <p>{{ textBySlug.about.modal.introduction }}</p>
                        </div>
                    </div>
                    <div class="lower row">
                        <div class="col-xs-12">
                            <about-inner [config]="config" [textBySlug]="textBySlug" [peopleBySlug]="peopleBySlug" [useAccordion]="true"></about-inner>
                        </div>
                    </div>
                    <img (click)="dismissedExplicitly = true" class="clickable close-icon" src="/assets/img/close.png">
                    <div (click)="dismissedExplicitly = true" [routerLink]="['/']" class="clickable dismiss"><p>{{ textBySlug.about.modal.dismiss }}</p></div>
                </div>
            </div>
        </div>
    `
})
export class ModalComponent {
    @LocalStorage() dismissedExplicitly;
    dismissedImplicitly;
    textBySlug;

    constructor(
        private router: Router,
        private contentService: ContentService) { 
    }
    ngOnInit() { 
        var firstNav = true;
        var sub = this.router.events.subscribe(event => {
            if (event instanceof NavigationEnd) {
                // XXX: Bug: on certain pages, navigation events are triggered by scrolling
                if (firstNav) return firstNav = false;
                this.dismissedImplicitly = true;
                sub.unsubscribe();
            }
        });
        this.contentService.injectContent(this); 
    }
}

