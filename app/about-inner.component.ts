
import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';


@Component({
    selector: 'about-inner',
    template: `
        <div class="row">
            <div class="col-xs-12">
                <div *ngIf="textBySlug" [accordion]="useAccordion" class="about" [class.accordion]="useAccordion">
                    <section class="whats-inside" name="whats-inside">
                        <h4 accordionToggle class="heading" [class.clickable]="useAccordion">
                            {{ textBySlug.about.misc['whats-inside'] }}
                            <svg-inline src="/assets/img/arrow.svg"></svg-inline>
                        </h4>
                        <div class="content">
                            <div class="row">
                                <div class="col-md-6 col-md-offset-3" [innerMarkdown]="textBySlug.about['whats-inside'].introduction"></div>
                                <div class="col-xs-12">
                                    <div *ngFor="let each of types; let first=first">
                                        <div [routerLink]="['/type', each[0]]" class="clickable">
                                            <div *ngIf="first" class="type-representation expanded first">
                                                <div class="col-xs-3 col-xs-offset-3">
                                                    <h3>{{ textBySlug.ui.types[each[1]] }}</h3>
                                                    <svg-inline class="tworows pattern" src="/assets/patterns/2rows/{{ each[0] }}.svg"></svg-inline>
                                                </div>
                                                <div class="col-xs-3"><p class="definition" [innerHTML]="textBySlug.ui.definitions[each[0] + '-short']"></p></div>
                                                <div class="clearfix"></div>
                                            </div>
                                            <div *ngIf="!first" class="type-representation expanded">
                                                <div class="col-xs-3">
                                                    <h3>{{ textBySlug.ui.types[each[1]] }}</h3>
                                                    <svg-inline class="tworows pattern" src="/assets/patterns/2rows/{{ each[0] }}.svg"></svg-inline>
                                                    <p class="definition" [innerHTML]="textBySlug.ui.definitions[each[0] + '-short']"></p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                    <section class="process" name="process">
                        <h4 accordionToggle class="heading" [class.clickable]="useAccordion">
                            {{ textBySlug.about.misc.process }}
                            <svg-inline src="/assets/img/arrow.svg"></svg-inline>
                        </h4>
                        <div class="content">
                            <div *ngFor="let item of textBySlug.about.process" [ngSwitch]="item.type">
                                <div *ngSwitchCase="'steps'" class="row">
                                    <div *ngFor="let step of item.value; let first=first; let last=last" class="col-sm-6 col-md-3 steps">
                                        <div class="step-circle" [class.first]="first" [class.last]="last">
                                            <svg-inline src="{{ config['asset-path'] + '/' + step.image }}"></svg-inline>
                                        </div>
                                        <h3>{{ step.title }}</h3>
                                        <div class="description" [innerMarkdown]="step.description"></div>
                                    </div>
                                </div>
                                <h4 *ngSwitchCase="'subheading'" class="subheading">{{ item.value }}</h4>
                                <div *ngSwitchCase="'workshops'" class="row">
                                    <div *ngFor="let workshop of textBySlug['workshop-participants'].groups; let index=index">
                                        <div [class.col-md-offset-3]="index == 4" class="col-sm-6 col-md-3 workshop-list">
                                            <div class="img-wrapper"><img src="/assets/img/{{ workshop.name }}.png"></div>
                                            <h3 class="overline">{{ item.value[workshop.name] }}</h3>
                                            <ul><li *ngFor="let participant of workshop.participants">{{ participant }}</li></ul>
                                        </div>
                                        <div *ngIf="index && index % 2" class="clearfix visible-sm"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                    <section class="values" name="values">
                        <h4 accordionToggle class="heading" [class.clickable]="useAccordion">
                            {{ textBySlug.about.misc.values }}
                            <svg-inline src="/assets/img/arrow.svg"></svg-inline>
                        </h4>
                        <div class="content">
                            <div *ngFor="let item of textBySlug.about.values" [ngSwitch]="item.type">
                                <div *ngSwitchCase="'values'">
                                    <div *ngFor="let value of item.value; let index=index">
                                        <h3>{{ index+1 }}</h3>
                                        <h4 class="overline">{{ value.title }}</h4>
                                        <div [innerMarkdown]="value.description"></div>
                                    </div>
                                </div>
                                <h4 *ngSwitchCase="'disclaimer'" class="disclaimer">{{ item.value }}</h4>
                                <div *ngSwitchCase="'disclaimer-text'" [innerMarkdown]="item.value" class="disclaimer-text"></div>
                            </div>
                        </div>
                    </section>
                    <section class="advisory-network" name="advisory-network">
                        <h4 accordionToggle class="heading" [class.clickable]="useAccordion">
                            {{ textBySlug.about.misc['advisory-network'] }}
                            <svg-inline src="/assets/img/arrow.svg"></svg-inline>
                        </h4>
                        <div class="content">
                            <div class="row">
                                <div class="col-md-4 col-md-offset-8" [innerMarkdown]="textBySlug.about['advisory-network'].introduction"></div>
                            </div>
                            <div class="row network-members">
                                <div *ngFor="let member of textBySlug.about['network-members']" class="col-xs-12 col-sm-6 col-md-4 person">
                                    <div *ngIf="peopleBySlug[member]">
                                        <div class="person-image" [style.background-image]="'url('+config['asset-path']+'/small-'+peopleBySlug[member].image+')'"></div>
                                        <h4>{{ peopleBySlug[member].title }}</h4>
                                        <h5 *ngIf="peopleBySlug[member]['team-title']" class="team-title">{{ peopleBySlug[member]['team-title'] }}</h5>
                                        <div *ngIf="peopleBySlug[member]['team-bio']" [innerMarkdown]="peopleBySlug[member]['team-bio']" class="team-bio"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                    <section class="team" name="team">
                        <h4 accordionToggle class="heading" [class.clickable]="useAccordion">
                            {{ textBySlug.about.misc.team }}
                            <svg-inline src="/assets/img/arrow.svg"></svg-inline>
                        </h4>
                        <div class="content">
                            <div class="row team-members">
                                <div *ngFor="let member of textBySlug.about['team-members']" class="col-xs-12 col-sm-6 col-md-4 person">
                                    <div *ngIf="peopleBySlug[member]">
                                        <div class="person-image" [style.background-image]="'url('+config['asset-path']+'/small-'+peopleBySlug[member].image+')'"></div>
                                        <h4>{{ peopleBySlug[member].title }}</h4>
                                        <h5 *ngIf="peopleBySlug[member]['team-title']" class="team-title">{{ peopleBySlug[member]['team-title'] }}</h5>
                                        <div *ngIf="peopleBySlug[member]['team-bio']" [innerMarkdown]="peopleBySlug[member]['team-bio']" class="team-bio"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                    <section class="beautiful-trouble-and-action-aid" name="beautiful-trouble-and-action-aid">
                        <h4 accordionToggle class="heading" [class.clickable]="useAccordion">
                            {{ textBySlug.about.misc['beautiful-trouble-and-action-aid'] }}
                            <svg-inline src="/assets/img/arrow.svg"></svg-inline>
                        </h4>
                        <div class="content">
                            <div class="row">
                                <div class="col-md-4 col-md-offset-4">
                                    <div [innerMarkdown]="textBySlug.about['beautiful-trouble-and-action-aid'].introduction" class="introduction"></div>
                                </div>
                                <div class="col-md-6">
                                    <div [innerMarkdown]="textBySlug.about['beautiful-trouble-and-action-aid'].bt" class="blurb"></div>
                                    <a href="http://beautifultrouble.org/" target="_blank"><img src="/assets/img/bt-logo.png"></a>
                                </div>
                                <div class="col-md-6">
                                    <div [innerMarkdown]="textBySlug.about['beautiful-trouble-and-action-aid'].aa" class="blurb"></div>
                                    <a href="http://actionaid.org/" target="_blank"><img src="/assets/img/aa-logo.png"></a>
                                </div>
                            </div>
                        </div>
                    </section>
                    <section class="partners" name="partners">
                        <h4 accordionToggle class="heading" [class.clickable]="useAccordion">
                            {{ textBySlug.about.misc.partners }}
                            <svg-inline src="/assets/img/arrow.svg"></svg-inline>
                        </h4>
                        <div class="content">
                            <div class="row">
                                <div *ngFor="let partner of textBySlug.about['network-partners']" class="col-xs-12 col-sm-4">
                                    <div class="partner">
                                        <a *ngIf="partner.link" href="{{ partner.link }}" target="_blank">
                                            <div class="partner-logo" [style.background-image]="'url(' + config['asset-path'] + '/small-' + partner.logo + ')'"></div>
                                        </a>
                                        <div *ngIf="!partner.link" class="img-wrapper">
                                            <div class="partner-logo" [style.background-image]="'url(' + config['asset-path'] + '/small-' + partner.logo + ')'"></div>
                                        </div>
                                        <a *ngIf="partner.link" href="{{ partner.link }}" target="_blank">
                                            <h5 class="overline">{{ partner.name }}</h5>
                                        </a>
                                        <h5 *ngIf="!partner.link" class="overline">{{ partner.name }}</h5>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                    <section class="faq" name="faq">
                        <h4 accordionToggle class="heading" [class.clickable]="useAccordion">
                            {{ textBySlug.about.misc.faq }}
                            <svg-inline src="/assets/img/arrow.svg"></svg-inline>
                        </h4>
                        <div class="content">
                            <div *ngFor="let qa of textBySlug.about.questions" class="question">
                                <h4 class="overline">{{ qa.question }}</h4>
                                <div [innerMarkdown]="qa.answer"></div>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    `
})
export class AboutInnerComponent {
    @Input() config;
    @Input() peopleBySlug;
    @Input() textBySlug;
    @Input() useAccordion;
    types = [['story', 'stories'], 
             ['tactic', 'tactics'], 
             ['principle', 'principles'], 
             ['theory', 'theories'], 
             ['methodology', 'methodologies']];
    constructor(private router: Router) { }
}

