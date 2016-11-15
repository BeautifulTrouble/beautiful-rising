
import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { ContentService } from './services';


@Component({
    selector: 'contribute',
    template: `
        <div *ngIf="textBySlug" addSectionToRoute="/contribute" thresholdElement="#fixed-nav" thresholdOffset="10" class="container page contribute">
            <div class="row">
                <div class="col-xs-12 page-heading">
                    <h3 class="heading">{{ textBySlug.contribute.misc.heading }}</h3>
                </div>
                <section name="how-it-works" class="how-it-works">
                    <div class="col-xs-12">
                        <h4 class="heading">{{ textBySlug.contribute.misc.subheading }}</h4>
                        <div [innerMarkdown]="textBySlug.contribute.misc.introduction"></div>
                        <h4 class="instructions-heading">{{ textBySlug.contribute.misc['instructions-heading'] }}</h4>
                        <div [innerMarkdown]="textBySlug.contribute.misc.instructions"></div>
                        <div class="bar-center"></div>
                    </div>
                    <div class="col-xs-12">
                        <h4 class="heading">{{ textBySlug.contribute.misc.prompt }}</h4>
                    </div>
                    <div class="clickable types" *ngFor="let each of types; let first=first" (click)="activeType = each[0]">
                        <div [ngClass]="first ? 'col-xs-6 col-sm-4 col-md-2 col-md-offset-1' : 'col-xs-6 col-sm-4 col-md-2'">
                            <h3>{{ textBySlug.ui.types[each[1]] }}</h3>
                            <svg-inline class="tworows pattern" src="/assets/patterns/2rows/{{ each[0] }}.svg"></svg-inline>
                            <div class="visible-md visible-lg">
                                <div [class.active]="activeType == each[0]" class="description">
                                    <div [innerHTML]="textBySlug.ui.definitions[each[0] + '-short']"></div>
                                    <div class="links"><a href="{{ textBySlug.ui.forms[each[0]] }}" target="_blank">{{ textBySlug.ui.module.form }}</a></div>
                                </div>
                            </div>
                            <div class="visible-xs visible-sm">
                                <div class="description active">
                                    <div [innerHTML]="textBySlug.ui.definitions[each[0] + '-short']"></div>
                                    <div class="links"><a href="{{ textBySlug.ui.forms[each[0]] }}" target="_blank">{{ textBySlug.ui.module.form }}</a></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    `
})
export class ContributeComponent {
    activeType = 'story';
    textBySlug;
    types = [['story', 'stories'], 
             ['tactic', 'tactics'], 
             ['principle', 'principles'], 
             ['theory', 'theories'], 
             ['methodology', 'methodologies']];

    constructor(
        private router: Router,
        private contentService: ContentService) {
    }
    ngOnInit() {
        this.contentService.injectContent(this);
    }
}

