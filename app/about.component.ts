
import { Component } from '@angular/core';

import { ContentService } from './services';


@Component({
    selector: 'about',
    template: `
        <div *ngIf="textBySlug" class="container page" addSectionToRoute="/about" thresholdElement="#fixed-nav" thresholdOffset="10">
            <div class="row page-heading">
                <div class="col-xs-12">
                    <h3>{{ textBySlug.about.misc.heading }}</h3>
                    <p>{{ textBySlug.about.heading.introduction }}</p>
                </div>
            </div>
            <about-inner [config]="config" [textBySlug]="textBySlug" [peopleBySlug]="peopleBySlug" [useAccordion]="false"></about-inner>
        </div>
    `
})
export class AboutComponent {
    constructor(private contentService: ContentService) { }
    ngOnInit() { this.contentService.injectContent(this); }
}

