
import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { ContentService } from './services';


@Component({
    selector: 'resources',
    template: `
        <div *ngIf="textBySlug" addSectionToRoute="/resources" thresholdElement="#fixed-nav" thresholdOffset="10" class="container page resources">
            <div class="row">
                <div class="col-xs-12 page-heading">
                    <h3 class="heading">{{ textBySlug.ui.menu['training-and-resources'] }}</h3>
                </div>
                <section name="training" class="training">
                    <div class="col-md-6 select">
                        <div class="inner">
                            <h3 class="bigger">{{ textBySlug.trouble.heading }}</h3>
                            <p>{{ textBySlug.trouble.lead }}</p>
                            <div *ngFor="let each of textBySlug.trouble.content; let index=index">
                                <h4 (click)="troubleIndex = index" [class.selected]="troubleIndex == index" class="clickable">{{ each.heading }}</h4>
                                <p *ngIf="troubleIndex == index" class="visible-xs visible-sm" [innerMarkdown]="textBySlug.trouble.content[troubleIndex].text"></p>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-6 detail">
                        <img src="{{ textBySlug.trouble.image }}">
                        <div class="row">
                            <div class="col-md-8">
                                <p class="visible-md visible-lg" [innerMarkdown]="textBySlug.trouble.content[troubleIndex].text"></p>
                            </div>
                        </div>
                    </div>
                </section>
                <section name="other" class="other">
                    <div class="row">
                        <div class="col-xs-12">
                        <div class="hr"></div>
                        </div>
                    </div>
                    <div class="col-md-12 resources">
                        <h3 class="bigger">{{ textBySlug.resources.heading }}</h3>
                        <div *ngFor="let type of textBySlug.resources.all" class="resource-type">
                            <h4 class="overline">{{ type.name }}</h4>
                            <div class="row">
                                <div class="col-md-11 col-md-offset-1">
                                    <div *ngFor="let resource of type.resources" class="col-md-4 resource">
                                        <a href="{{ resource.link }}" target="_blank">{{ resource.title }}</a>
                                        <p [innerMarkdown]="resource.description"></p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    `
})
export class ResourcesComponent {
    troubleIndex = 0;
    constructor(
        private router: Router,
        private contentService: ContentService) {
    }
    ngOnInit() {
        this.contentService.injectContent(this);
    }
}


