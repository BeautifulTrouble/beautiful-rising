
import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { ContentService } from './services';


@Component({
    selector: 'platforms',
    template: `
        <div *ngIf="textBySlug" addSectionToRoute="/platforms" thresholdElement="#fixed-nav" thresholdOffset="10" class="container page platforms">
            <div class="row">
                <div class="col-xs-12">
                    <div class="page-heading">
                        <h3 class="heading">{{ textBySlug.platforms.misc.heading }}</h3>
                    </div>
                    <section *ngFor="let p of ['chatbot', 'game', 'pdf']" class="{{ p }}" name="{{ p }}">
                        <div class="row">
                            <div class="col-md-1"><svg-inline src="/assets/icons/{{ p }}.svg"></svg-inline></div>
                            <div class="col-md-4 platform">
                                <h3 class="overline title">{{ textBySlug.platforms[p].title }}</h3> 
                                <h4 class="subheading">{{ textBySlug.platforms[p].introduction }}</h4>
                                <div class="what">
                                    <h4>{{ textBySlug.platforms.misc.what }}</h4>
                                    <div [innerMarkdown]="textBySlug.platforms[p].what"></div>
                                </div>
                                <div class="how">
                                    <h4>{{ textBySlug.platforms.misc.how }}</h4>
                                    <div [innerMarkdown]="textBySlug.platforms[p].how"></div>
                                </div>
                                <div class="links" [innerMarkdown]="textBySlug.platforms[p].get"></div>
                            </div>
                            <div class="col-md-7 platform-image" [ngStyle]="{'background-image': 'url(/' + textBySlug.platforms[p].image + ')'}"></div>
                            <div class="clearfix"></div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    `
})
export class PlatformsComponent {
    constructor(
        private router: Router,
        private contentService: ContentService) {
    }
    ngOnInit() {
        this.contentService.injectContent(this);
    }
}

