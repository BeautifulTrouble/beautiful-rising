// Define all site components here.

import { Component, Input, Output, Inject, EventEmitter, ElementRef, ViewChild, isDevMode } from '@angular/core';
import { Router, ActivatedRoute, provideRouter, ROUTER_DIRECTIVES, NavigationEnd } from '@angular/router';
import { Title, DomSanitizationService } from '@angular/platform-browser';

import { APP_DIRECTIVES } from './directives';
import { APP_PIPES, plainString, slugify, template } from './utilities';
import { ContentService, ClientStorageService, ModuleSavingService, LocalStorage, SessionStorage } from './services';

import '../styles.scss';
import _ = require('lodash');
import ElasticLunr = require('elasticlunr');


@Component({
    selector: 'about-inner',
    template: require('../templates/about_inner.html'),
    directives: [ APP_DIRECTIVES, ROUTER_DIRECTIVES ]
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
    `,
    directives: [ APP_DIRECTIVES, ROUTER_DIRECTIVES, AboutInnerComponent ]
})
export class AboutComponent {
    constructor(private contentService: ContentService) { }
    ngOnInit() { this.contentService.injectContent(this); }
}


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
                            <img class="logo" src="/assets/icons/logo-reverse-en.png">
                            <h3>{{ textBySlug.about.modal.welcome }}</h3>
                            <p>{{ textBySlug.about.modal.introduction }}</p>
                        </div>
                    </div>
                    <div class="lower row">
                        <div class="col-xs-12">
                            <about-inner [config]="config" [textBySlug]="textBySlug" [peopleBySlug]="peopleBySlug" [useAccordion]="true"></about-inner>
                        </div>
                    </div>
                    <img (click)="dismissedExplicitly = true" class="clickable close-icon" src="/assets/icons/close.png">
                    <div (click)="dismissedExplicitly = true" [routerLink]="['/']" class="clickable dismiss"><p>{{ textBySlug.about.modal.dismiss }}</p></div>
                </div>
            </div>
        </div>
    `,
    directives: [ APP_DIRECTIVES, ROUTER_DIRECTIVES, AboutInnerComponent ]
})
export class ModalComponent {
    @LocalStorage() dismissedExplicitly;
    dismissedImplicitly;
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
                            <div class="col-md-7 platform-image" [style.background-image]="sanitizer.bypassSecurityTrustStyle('url(/' + textBySlug.platforms[p].image + ')')"></div>
                            <div class="clearfix"></div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    `,
    directives: [ APP_DIRECTIVES, ROUTER_DIRECTIVES ]
})
export class PlatformsComponent {
    constructor(
        private router: Router,
        private sanitizer: DomSanitizationService,
        private contentService: ContentService) {
    }
    ngOnInit() {
        this.contentService.injectContent(this);
    }
}


@Component({
    selector: 'resources',
    template: require('../templates/resources.html'),
    directives: [ APP_DIRECTIVES, ROUTER_DIRECTIVES ]
})
export class ResourcesComponent {
    constructor(
        private router: Router,
        private contentService: ContentService) {
    }
    ngOnInit() {
        this.contentService.injectContent(this, content => this.text = content.textBySlug['other-resources']);
    }
}


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
    `,
    directives: [ APP_DIRECTIVES, ROUTER_DIRECTIVES ]
})
export class ContributeComponent {
    activeType = 'story';
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


@Component({
    selector: 'module-types',
    template: `
                <div heightPolling="100ms" (heightChanged)="resized.next($event)"
                 (window:scroll)="setExpanded()" [ngClass]="['module-types', expanded ? 'expanded' : 'collapsed']">

                    <div *ngIf="!textBySlug" class="loader-wrapper">
                        <div class="loader"></div>
                    </div>
                    <div *ngIf="textBySlug">
                        <div *ngIf="!type">
                            <div [ngClass]="['col-xs-12', expanded ? 'col-md-10 col-md-offset-1' : 'col-md-12']">
                                <div class="row">
                                    <div *ngFor="let each of types; let first=first">
                                        <div [routerLink]="['/type', each[0]]" class="clickable">

                                            <!-- larger -->
                                            <div *ngIf="first" class="hidden-xs type-representation first" [class.expanded]="expanded">
                                                <div [ngClass]="[expanded ? 'col-xs-6 col-sm-3 col-sm-offset-3' : 'col-xs-2 col-xs-offset-1']">
                                                    <h3>{{ each[1] }}</h3>
                                                    <svg-inline class="tworows pattern" src="/assets/patterns/2rows/{{ each[0] }}.svg"></svg-inline>
                                                </div>
                                                <div *ngIf="expanded" class="col-xs-6 col-sm-3"><p class="definition" [innerHTML]="textBySlug.ui.definitions[each[0] + '-short']"></p></div>
                                                <div *ngIf="expanded" class="clearfix"></div>
                                            </div>
                                            <div *ngIf="!first" class="hidden-xs type-representation" [class.expanded]="expanded">
                                                <div [ngClass]="[expanded ? 'col-sm-3' : 'col-sm-2']">
                                                    <h3>{{ each[1] }}</h3>
                                                    <svg-inline class="tworows pattern" src="/assets/patterns/2rows/{{ each[0] }}.svg"></svg-inline>
                                                    <p *ngIf="expanded" class="definition" [innerHTML]="textBySlug.ui.definitions[each[0] + '-short']"></p>
                                                </div>
                                            </div>

                                            <!-- smaller -->
                                            <div class="visible-xs type-representation" [class.expanded]="expanded" [class.clearfix]="true">
                                                <div [ngClass]="[expanded ? 'col-xs-5 col-xs-offset-1' : 'col-xs-5 col-xs-offset-1']">
                                                    <h3>{{ each[1] }}</h3>
                                                    <svg-inline *ngIf="expanded" class="tworows pattern" src="/assets/patterns/2rows/{{ each[0] }}.svg"></svg-inline>
                                                </div>
                                                <div [ngClass]="[expanded ? 'col-xs-5' : 'col-xs-4']">
                                                    <p *ngIf="expanded" class="definition" [innerHTML]="textBySlug.ui.definitions[each[0] + '-short']"></p>
                                                    <svg-inline *ngIf="!expanded" class="onerow pattern" src="/assets/patterns/1row/{{ each[0] }}.svg"></svg-inline>
                                                </div>
                                            </div>

                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div *ngIf="type">
                            <div *ngIf="expanded">
                                <div class="col-sm-3 col-md-2 type-list">
                                    <a class="expanded type-link" [routerLink]="['/']">All</a>
                                    <a *ngFor="let each of types" [routerLink]="['/type', each[0]]" [class.selected]="each[0] == type" class="expanded type-link">{{ each[1] }}</a>
                                </div>
                                <div class="hidden-xs col-sm-2 col-md-3 col-lg-4 type-pattern">
                                    <div *ngFor="let each of types" class="expanded">
                                        <div *ngIf="each[0] == type">
                                            <h3>{{ each[1] }}</h3>
                                            <svg-inline class="pattern" src="/assets/patterns/3rows/{{ each[0] }}.svg"></svg-inline>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-xs-12 col-sm-7 col-md-7 col-lg-6 type-description">
                                    <div [innerHtml]="textBySlug.ui.definitions[type]"></div>
                                    <div *ngIf="type == 'story'" class="expanded regions">
                                        <h3>Region</h3>
                                        <span *ngFor="let each of ['africa','latin-america-and-the-caribbean','north-america','asia','europe','middle-east','oceania']">
                                            <svg-inline *ngIf="region == each" [routerLink]="['/type/story']" [ngClass]="regionHasModules(each) ? 'clickable' : 'disabled'" class="selected" src="/assets/icons/{{ each }}.svg"></svg-inline>
                                            <svg-inline *ngIf="region != each" [routerLink]="['/type/story', each]" [ngClass]="regionHasModules(each) ? 'clickable' : 'disabled'" src="/assets/icons/{{ each }}.svg"></svg-inline>
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div *ngIf="!expanded">
                                <div class="col-md-12 type-list">
                                    <a [routerLink]="['/']" class="type-link">All</a>
                                    <a *ngFor="let each of types" class="type-link"
                                     [routerLink]="['/type', each[0]]" [class.selected]="each[0] == type" [class.h3]="each[0] == type">{{ each[1] }}</a>
                                    <div *ngIf="type == 'story'" class="regions">
                                        <span *ngFor="let each of ['africa','latin-america-and-the-caribbean','north-america','asia','europe','middle-east','oceania']">
                                            <svg-inline *ngIf="region == each" [routerLink]="['/type/story']" [ngClass]="regionHasModules(each) ? 'clickable' : 'disabled'" class="selected" src="/assets/icons/{{ each }}.svg"></svg-inline>
                                            <svg-inline *ngIf="region != each" [routerLink]="['/type/story', each]" [ngClass]="regionHasModules(each) ? 'clickable' : 'disabled'" src="/assets/icons/{{ each }}.svg"></svg-inline>
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <svg-inline *ngIf="!expanded || overrideExpanded" (click)="expanded = overrideExpanded = !expanded" 
                         class="hidden-xs arrow clickable" [class.selected]="expanded" src="/assets/icons/arrow.svg"></svg-inline>
                    </div>
                </div>
    `,
    directives: [ APP_DIRECTIVES, ROUTER_DIRECTIVES ]
})
export class ModuleTypeComponent {
    @Input() type;
    @Input() region;
    @Input() textBySlug;
    @Input() modulesByRegion;
    @Output() resized = new EventEmitter();
    expanded = true;
    types = [['story', 'stories'], 
             ['tactic', 'tactics'], 
             ['principle', 'principles'], 
             ['theory', 'theories'], 
             ['methodology', 'methodologies']];
    typeMap = _.fromPairs(this.types);

    constructor(private router: Router) { }
    ngAfterContentInit() { 
        this.setExpanded();
    }
    setExpanded() {
        if (pageYOffset == 0) {
            this.expanded = true;
            this.overrideExpanded = false;
        } else if (!this.overrideExpanded) {
            this.expanded = false;
        }
    }
    regionHasModules(region) {
        return _.some(this.modulesByRegion[region] || [], m => !/SNAPSHOT/.test(m.document_title));
    }
}


@Component({
    selector: 'gallery',
    template: `
        <div *ngIf="type" class="fixed-container-wrapper pattern-container-wrapper">
            <div class="container">
                <div class="row">
                    <div class="col-md-4 outside-pattern">
                        <svg-inline class="pattern" src="/assets/patterns/3rows/{{ type }}.svg"></svg-inline>
                    </div>
                </div>
            </div>
        </div>
        <div class="fixed-container-wrapper">
            <div class="container">
                <div class="row">
                    <div class="col-xs-12">
                        <input [(ngModel)]="query" (ngModelChange)="filterModules()" class="search-box visible-xs visible-sm" 
                         placeholder="{{ textBySlug && textBySlug.ui.list['search-text'] }}">
                        <input [(ngModel)]="query" (ngModelChange)="filterModules()" class="search-box visible-md visible-lg" 
                         placeholder="{{ textBySlug && textBySlug.ui.list['search-text'] }}" autofocus>
                        <module-types (resized)="marginTop = $event" [region]="region" [type]="type" [textBySlug]="textBySlug" [modulesByRegion]="modulesByRegion"></module-types>
                    </div>
                </div>
            </div>
        </div>
        <div *ngIf="textBySlug" class="container">
            <div class="row gallery" [style.margin-top.px]="marginTop">
                <div class="gallery-sort visible-md visible-lg col-md-3">
                    <h3>{{ textBySlug.ui.list.view }}</h3>
                    <div class="border-top border-bottom view-as">
                        <div class="row">
                            <div class="col-xs-6">
                                <svg-inline (click)="viewStyle='grid'" [class.selected]="viewStyle == 'grid'" class="clickable" src="/assets/icons/grid.svg"></svg-inline>
                            </div>
                            <div class="col-xs-6">
                                <svg-inline (click)="viewStyle='list'" [class.selected]="viewStyle == 'list'" class="clickable" src="/assets/icons/list.svg"></svg-inline>
                            </div>
                        </div>
                    </div>
                    <h3>{{ textBySlug.ui.list.sort }}</h3>
                    <div class="border-top border-bottom sort-by">
                        <div class="row">
                            <div (click)="sortModules('title')" [class.selected]="sortKey == 'title'" class="col-xs-6 clickable">{{ textBySlug.ui.list.alphabetical }}</div>
                            <div (click)="sortModules('timestamp')" [class.selected]="sortKey == 'timestamp'" class="col-xs-6 clickable">{{ textBySlug.ui.list.newest }}</div>
                        </div>
                    </div>
                    <h3>{{ textBySlug.ui.list.tags }}</h3>
                    <div class="border-top">
                        <span *ngFor="let each of tags; let last=last">
                            <a *ngIf="tag != each" [routerLink]="['/tag', each]" class="tag">{{ tagsBySlug[each] }}</a>
                            <a *ngIf="tag == each" [routerLink]="['/']" class="tag selected">{{ tagsBySlug[each] }}</a>
                            <strong *ngIf="!last"> / </strong>
                        </span>
                    </div>
                    <div *ngIf="tag" class="gallery-info gray">
                        <span [routerLink]="['/']" class="gallery-clear clickable"><span class="icon">&#9746;</span> {{ textBySlug.ui.list['tags-clear'] }}</span>
                    </div>
                </div>
                <div class="gallery-sort clearfix visible-xs visible-sm col-xs-12">
                    <h3>{{ textBySlug.ui.list.view }}</h3>
                    <span class="view-as">
                        <svg-inline (click)="viewStyle='grid'" [class.selected]="viewStyle == 'grid'" class="clickable" src="/assets/icons/grid.svg"></svg-inline>
                        <svg-inline (click)="viewStyle='list'" [class.selected]="viewStyle == 'list'" class="clickable" src="/assets/icons/list.svg"></svg-inline>
                    </span>
                    <h3>{{ textBySlug.ui.list.sort }}</h3>
                    <span class="sort-by">
                        <span (click)="sortModules('title')" [class.selected]="sortKey == 'title'" class="clickable">{{ textBySlug.ui.list.alphabetical }}</span>
                        <span (click)="sortModules('timestamp')" [class.selected]="sortKey == 'timestamp'" class="clickable">{{ textBySlug.ui.list.newest }}</span>
                    </span>
                </div>
                <div *ngIf="selectedModules" class="gallery-list col-xs-12 col-md-9">

                    <div *ngIf="query" class="row">
                        <div class="col-sm-12">
                            <div class="col-md-11 col-md-offset-1 gallery-info gray">
                                <span (click)="query = ''; filterModules()" class="gallery-clear clickable"><span class="icon">&#9746;</span> {{ textBySlug.ui.list['search-clear'] }}</span>
                                <span>{{ textBySlug.ui.list.results | template:{query: query, count: selectedModules.length} }}</span>
                            </div>
                        </div>
                    </div>

                    <div lazyBackgroundGroup *ngIf="viewStyle == 'grid'" class="row">
                        <div class="gallery-module-grid-wrapper">
                            <div *ngFor="let module of selectedModules" (click)="router.navigate(['/tool', module.slug])" class="col-xs-6 col-sm-4 gallery-module-grid">
                                <div class="make-it-square"></div>
                                <div *ngIf="module.image" [lazyBackground]="config['asset-path'] +'/medium-'+ module.image" class="module-image"></div>
                                <div class="module-overlay"></div>

                                <div class="module-content clickable">
                                    <div class="module-content-inner">
                                        <svg-inline *ngIf="module.region" src="/assets/icons/{{ module.region }}.svg" class="region-icon"></svg-inline>
                                        <div class="offset" [style.justify-content]="['center','flex-start','flex-end'][module.timestamp%3]">
                                            <div [ngClass]="['module-type', module.type]">{{ textBySlug.ui.types[module.type] }}</div>
                                            <div [class.story]="module.type == 'story'" class="module-title">{{ module.title }}</div>
                                            <div (click)="savingService.toggleSaved(module); $event.stopPropagation()" [ngSwitch]="savingService.isSaved(module)" class="module-save">
                                                <svg-inline *ngSwitchCase="true" src="/assets/icons/-_tileandmodule.svg"></svg-inline>
                                                <svg-inline *ngSwitchCase="false" src="/assets/icons/+_tileandmodule.svg"></svg-inline>
                                            </div>
                                        </div>
                                    </div>
                                    <div [ngClass]="['module-snapshot', module.type]" [innerHTML]="module.snapshot"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div *ngIf="viewStyle == 'list'">
                        <div class="row">
                            <div class="col-md-11 col-md-offset-1">
                                <div *ngFor="let module of selectedModules" (click)="router.navigate(['/tool', module.slug])" class="gallery-module-list col-sm-6">
                                    <div class="module-content clickable">
                                        <div class="module-type-accent"></div>
                                        <div [ngClass]="['module-type', module.type]">{{ textBySlug.ui.types[module.type] }}</div>
                                        <div class="module-title">{{ module.title }}</div>
                                        <div [innerHTML]="module.snapshot" class="module-snapshot"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `,
    directives: [ APP_DIRECTIVES, ROUTER_DIRECTIVES, ModuleTypeComponent ],
    pipes: [ APP_PIPES ]
})
export class GalleryComponent {
    @LocalStorage() sortKey;
    @LocalStorage() viewStyle;
    template = template;
    textBySlug;
    marginTop = 0;

    constructor(
        private title: Title,
        private router: Router,
        private route: ActivatedRoute,
        private contentService: ContentService,
        private savingService: ModuleSavingService) { 
    }
    ngOnInit() {
        this.sortKey = this.sortKey || 'timestamp';
        this.viewStyle = this.viewStyle || 'grid';
        this.type = this.tag = this.query = this.region = null;

        this.contentService.injectContent(this, (content) => {
            this.title.setTitle(content.textBySlug.ui.misc['site-title']);
            if (!this.sub) {
                this.sub = this.route.params.subscribe((params) => {
                    if (params.type) this.type = params.type;
                    else if (params.tag) this.tag = params.tag;
                    else if (params.query) this.query = decodeURIComponent(params.query);
                    else if (params.region) {
                        this.type = 'story'
                        this.region = params.region;
                    }
                    this.filterModules();
                });
            }
        });
    }
    ngAfterViewInit() {
        //window.scrollTo(0, 5);
    }
    ngOnDestroy() {
        this.sub && this.sub.unsubscribe();
    }
    filterModules() {
        if (!this.ready) return;

        var filterOutSnapshots = true;
        // Detect the blank (as opposed to null) query
        if (!this.query && this.query !== null) {
            history.replaceState(null, null, '');
            this.query = null;
            //this.router.navigate(['/']);
        }
        if (this.query) {
            filterOutSnapshots = false;
            history.replaceState(null, null, '/search/' + this.query);
            this.type = this.tag = null;
            this.viewStyle = 'list';
            // Allow queries like "authors!andrew-boyd" which search a specific field
            var prefix = this.query.split(/\s*!\s*/)[0];
            var query = this.query.replace(/[^@]+!\s*/, '');
            var config = { bool: /\s/.test(query) ? 'AND' : 'OR', expand: true };
            if (prefix != query && _.includes(this.config.search, prefix)) {
                config.fields = {}; config.fields[prefix] = {boost: 5};
            }
            if (!this.index) {
                ElasticLunr.tokenizer.setSeperator(/[-\s]+/);
                this.index = ElasticLunr();
                this.index.setRef('slug');
                this.config.search.forEach(field => this.index.addField(field));
                this.modules.forEach(module => this.index.addDoc(module)); 
            }
            this.selectedModules = _.map(this.index.search(query, config), obj => this.modulesBySlug[obj.ref]);
        } else if (this.type) {
            this.selectedModules = this.modulesByType[this.type] || [];
            if (this.region) {
                this.selectedModules = _.filter(this.selectedModules, m => m.region == this.region);
                if (!this.selectedModules.length) setTimeout(() => this.router.navigate(['/type', this.type]), 1000);
            }
        } else if (this.tag) {
            filterOutSnapshots = false;
            this.selectedModules = this.modulesByTag[this.tag];
        } else {
            this.selectedModules = this.modules;
        }
        if (filterOutSnapshots) this.selectedModules = _.filter(this.selectedModules, m => !/SNAPSHOT/.test(m.document_title));
        this.sortModules();
    }
    sortModules(key) {
        // Mutates selectedModules, which is what is directly displayed
        if (key) this.sortKey = key;
        this.selectedModules = _.orderBy(this.selectedModules, this.sortKey, this.sortKey == 'timestamp' ? 'desc' : 'asc');
    }
    crazyHover($event,a,b,c) {
        return;
        // TODO: think of some other way to structure the html/css!
        // Hover state covers up save button, so jump through some hoops
        var parent = $event.target.parentElement;
        parent.style.opacity = a;
        parent.nextElementSibling.style.opacity = b;
        parent.parentElement.previousElementSibling.style.opacity = c;
    }
}


@Component({
    selector: 'detail',
    template: `
        <div *ngIf="module">
            <div class="container">
                <div [ngClass]="['row', 'type-' + module.type]">
                    <div class="col-sm-12">
                        <div class="module-image" [ngStyle]="{'background-image': module.image ? 'url('+config['asset-path']+'/'+module.image+')' : ''}">
                            <div class="overlay"></div>
                            <div *ngIf="!snapshot" [ngClass]="['pattern', module.type]">
                                <div *ngIf="module.type != 'story'">
                                    <svg-inline *ngIf="!patternTypes.length" src="/assets/patterns/3rows/{{ module.type }}.svg"></svg-inline>
                                    <svg-inline *ngIf="patternTypes.length" src="/assets/patterns/3rowsoverlay/{{ module.type }}.svg"></svg-inline>
                                </div>
                                <svg-inline *ngFor="let type of patternTypes" src="/assets/patterns/3rowsoverlay/{{ type }}.svg"></svg-inline>
                            </div>
                            <div *ngIf="snapshot" 
                                [ngClass]="['pattern', 'pattern-snapshot', module.type]" 
                                [ngStyle]="{'background-image': 'url(/assets/patterns/snapshotoverlay/'+module.type+'.svg)'}"></div>
                            <div class="module-header">
                                <div *ngIf="module.type == 'story'" class="story-extra">
                                    <p *ngIf="module.where || module.when">{{ module.where }} {{ module.when }}</p>
                                    <svg-inline *ngIf="module.region" src="/assets/icons/{{ module.region }}.svg" class="region-icon"></svg-inline>
                                </div>
                                <div [routerLink]="['/type', module.type]" [ngClass]="['module-type', 'clickable', module.type]">{{ textBySlug.ui.types[module.type] }}</div>
                                <div class="module-title">{{ module.title }}</div>
                                <div (click)="savingService.toggleSaved(module)" [ngSwitch]="savingService.isSaved(module)" class="module-save clickable">
                                    <div *ngSwitchCase="true"><svg-inline src="/assets/icons/-_tileandmodule.svg"></svg-inline>{{ textBySlug.ui.module.remove }}</div>
                                    <div *ngSwitchCase="false"><svg-inline src="/assets/icons/+_tileandmodule.svg"></svg-inline>{{ textBySlug.ui.module.save }}</div>
                                </div><br>
                                <div class="module-share clickable">
                                    <svg-inline src="/assets/icons/share_in_module.svg"></svg-inline>{{ textBySlug.ui.module.share }}
                                </div>
                            </div>
                            <div class="hidden-xs module-image-caption" [innerHTML]="module['image-caption']"></div>
                        </div>
                    </div>
                </div>
            </div><!-- .container -->

            <div class="container">
                <div [ngClass]="['row', 'type-' + module.type]">

                    <div class="hidden-xs hidden-sm col-md-3 col-lg-2 column-a"><!-- large -->
                        <h3 class="border-bottom bigger contributed-by">{{ textBySlug.ui.module['contributed-by'] }}</h3>
                        <div *ngFor="let author of authors" >
                            <a [routerLink]="['/search', 'authors!' + author.slug]">
                                <div class="contributor-image" 
                                    [ngStyle]="{'background-image': author.image ? 'url('+config['asset-path']+'/small-'+author.image+')' : 'url(/assets/icons/anon.png)'}"></div>
                                <div class="contributor-name">
                                    <h4 class="first">{{ author.firstname }}</h4>
                                    <h4 class="last">{{ author.lastname }}</h4>
                                </div>
                            </a>
                            <div class="contributor-bio" *ngIf="author.bio" [innerHTML]="author.bio"></div>
                        </div>
                        <div *ngIf="!authors.length">
                            <div class="contributor-image" style="background-image: url('/assets/icons/anon.png')"></div>
                            <div class="contributor-name">
                                <div class="anon">
                                    <svg-inline class="your-arrow" src="/assets/icons/yourarrow.svg"></svg-inline>
                                    <h4 class="first">{{ textBySlug.ui.module['no-name'] }}</h4> 
                                </div>
                            </div>
                        </div>
                        <div *ngIf="module.tags">
                            <h3 class="border-bottom">{{ textBySlug.ui.module.tags }}</h3>
                            <span *ngFor="let tag of module.tags; let last=last">
                                <a [routerLink]="['/tag', slugify(tag)]" class="tag">{{ tag }}</a><strong *ngIf="!last"> / </strong>
                            </span>
                        </div>
                        <h3 class="border-bottom">{{ textBySlug.ui.module.training }}</h3>
                        <div [innerMarkdown]="template(textBySlug.ui.module['training-request'], {form: textBySlug.ui.forms.training})"></div>
                    </div>

                    <div class="hidden-md hidden-lg column-a"><!-- small -->
                        <div class="col-xs-12">
                            <h3 class="border-bottom bigger contributed-by">{{ textBySlug.ui.module['contributed-by'] }}</h3>
                        </div>
                        <div *ngFor="let author of authors">
                            <div class="col-xs-12 col-sm-4">
                                <a [routerLink]="['/search', 'authors!' + author.slug]">
                                    <div class="contributor-image" 
                                        [ngStyle]="{'background-image': author.image ? 'url('+config['asset-path']+'/small-'+author.image+')' : 'url(/assets/icons/anon.png)'}"></div>
                                </a>
                            </div>
                            <div class="col-xs-12 col-sm-8">
                                <a [routerLink]="['/search', 'authors!' + author.slug]">
                                    <div class="contributor-name">
                                        <h4>{{ author.title }}</h4>
                                    </div>
                                </a>
                                <p *ngIf="author.bio" [innerHTML]="author.bio"></p>
                            </div>
                            <div class="clearfix"></div>
                            <div class="hr"></div>
                        </div>
                        <div *ngIf="!authors.length">
                            <div class="col-xs-12 col-sm-4">
                                <div class="contributor-image" style="background-image: url('/assets/icons/anon.png')"></div>
                            </div>
                            <div class="col-xs-12 col-sm-8">
                                <div class="contributor-name">
                                    <div class="anon">
                                        <svg-inline class="your-arrow" src="/assets/icons/yourarrow.svg"></svg-inline>
                                        <h4 class="first">{{ textBySlug.ui.module['no-name'] }}</h4> 
                                    </div>
                                </div>
                            </div>
                            <div class="clearfix"></div>
                            <div class="hr"></div>
                        </div>
                    </div>

                    <div class="col-xs-12 col-sm-8 col-sm-offset-4 col-md-5 col-md-offset-0 col-lg-offset-1 content">
                        <div *ngIf="snapshot">
                            <p [innerHTML]="module.snapshot"></p>
                            <p><strong>{{ textBySlug.ui.module.snapshot | template: {type: textBySlug.ui.types[module.type].toLowerCase()} }}</strong></p>
                            <div class="row contribute-message">
                                <div class="col-xs-6">
                                    <a href="{{ textBySlug.ui.forms[module.type] }}" target="_blank"><h4>{{ textBySlug.ui.module.form }}</h4></a>
                                </div>
                                <div *ngIf="module['bt-link']" class="col-xs-6">
                                    <a href="{{ module['bt-link'] }}" target="_blank"><h4>{{ textBySlug.ui.module.bt | template: {title: module.title} }}</h4></a>
                                </div>
                            </div>
                        </div>
                        <div *ngIf="!snapshot">
                            <div *ngIf="collapsed">
                                <div class="short-write-up" [innerHTML]="module['short-write-up']"></div>
                                <h5 *ngIf="!gallery" class="button" (click)="collapsed = false">{{ textBySlug.ui.module['read-more'] }}</h5>
                                <div *ngIf="gallery" class="contribute-message">
                                    <strong [innerMarkdown]="template(textBySlug.ui.module.gallery, {form: textBySlug.ui.forms[module.type]})"></strong>
                                </div>
                            </div>
                            <div *ngIf="!collapsed">
                                <div *ngFor="let epigraph of module.epigraphs" class="epigraphs">
                                    <div class="epigraph" [innerHTML]="epigraph[0]"></div>
                                    <div class="attribution" [innerHTML]="epigraph[1]"></div>
                                </div>
                                <div *ngIf="!gallery" [innerHTML]="module['full-write-up']"></div>
                                <h5 class="button" (click)="collapsed = true">{{ textBySlug.ui.module['read-less'] }}</h5>
                            </div>
                            <div *ngIf="module['how-to-use']" class="how-to-use">
                                <h4>{{ textBySlug.ui.module['how-to-use'] }}</h4>
                                <div [innerMarkdown]="module['how-to-use']"></div>
                            </div>
                            <div *ngIf="module['why-it-worked']" class="why-worked-or-failed">
                                <h4>{{ textBySlug.ui.module['why-it-worked'] }}</h4>
                                <p [innerHTML]="module['why-it-worked']"></p>
                            </div>
                            <div *ngIf="module['why-it-failed']" class="why-worked-or-failed">
                                <h4>{{ textBySlug.ui.module['why-it-failed'] }}</h4>
                                <p [innerHTML]="module['why-it-failed']"></p>
                            </div>
                        </div>
                        <div *ngFor="let type of [['key-tactics', 'key-tactic', 'tactic'],
                                                  ['key-principles', 'key-principle', 'principle'],
                                                  ['key-theories', 'key-theory', 'theory'],
                                                  ['key-methodologies', 'key-methodology', 'methodology']]">
                            <div *ngFor="let each of module[type[0]]; let first=first; let last=last;">
                                <div *ngIf="first && last" [ngClass]="['module-type', 'key-heading', type[2]]">{{ textBySlug.ui.module[type[1]] }}</div><!-- singular -->
                                <div *ngIf="first && !last" [ngClass]="['module-type', 'key-heading', type[2]]">{{ textBySlug.ui.module[type[0]] }}</div><!-- plural -->
                                <h3 [innerHTML]="each[0]"></h3><div [innerHTML]="each[1]"></div>
                            </div>
                        </div>
                        <div *ngIf="module['learn-more']" class="learn-more">
                            <div *ngFor="let learn of module['learn-more']; let first=first;">
                                <h4 *ngIf="first">{{ textBySlug.ui.module['learn-more'] }}</h4>
                                <p>
                                    <a target="_blank" href="{{ learn.link | notags | trim }}">{{ learn.title | notags | trim }}</a>
                                    <span *ngIf="plainString(learn.source)"> / {{ learn.source | notags }}</span><span *ngIf="plainString(learn.year)">, {{ learn.year | notags }}</span>
                                </p>
                            </div>
                        </div>

                        <div *ngIf="(module['real-world-examples'] || []).length" class="examples hidden-sm">
                            <div (click)="examplesCollapsed = !examplesCollapsed" class="heading clickable">
                                <svg-inline src="/assets/icons/RWE_{{ module.type }}.svg"></svg-inline>
                                <h3 class="bigger after-arrow" [class.selected]="!examplesCollapsed">{{ textBySlug.ui.module['real-world'] | template:{title: module.title } }}</h3>
                            </div>
                            <div *ngIf="!examplesCollapsed" class="example-wrapper">
                                <div class="example" *ngFor="let example of module['real-world-examples']; let index=index;">
                                    <div class="caption-wrapper" [class.staggered]="!(index%2)">
                                        <div class="caption">
                                            <a target="_blank" href="{{ example.link }}"><h5>{{ example.title }}</h5></a>
                                            <div class="description" [innerMarkdown]="example.description"></div>
                                        </div>
                                    </div>
                                    <div *ngIf="!module.image" class="image"></div>
                                    <div *ngIf="module.image" class="image" 
                                        [class.staggered]="!(index%2)" [class.shifted]="!(index%3)" 
                                        [ngStyle]="{'background-image': 'url(/assets/patterns/snapshotoverlay/' + module.type +'.svg), url('+ config['asset-path'] +'/'+ module.image +')'}"></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="col-sm-12 visible-sm"><!-- small only full width content -->
                        <div *ngIf="(module['real-world-examples'] || []).length" class="examples">
                            <div (click)="examplesCollapsed = !examplesCollapsed" class="heading clickable">
                                <svg-inline src="/assets/icons/RWE_{{ module.type }}.svg"></svg-inline>
                                <h3 class="bigger after-arrow" [class.selected]="!examplesCollapsed">{{ textBySlug.ui.module['real-world'] | template:{title: module.title } }}</h3>
                            </div>
                            <div *ngIf="!examplesCollapsed" class="example-wrapper">
                                <div class="example" *ngFor="let example of module['real-world-examples']; let index=index;">
                                    <div class="caption-wrapper" [class.staggered]="!(index%2)">
                                        <div class="caption">
                                            <a target="_blank" href="{{ example.link }}"><h5>{{ example.title }}</h5></a>
                                            <div class="description" [innerMarkdown]="example.description"></div>
                                        </div>
                                    </div>
                                    <div *ngIf="!module.image" class="image"></div>
                                    <div *ngIf="module.image" class="image" 
                                        [class.staggered]="!(index%2)" [class.shifted]="!(index%3)" 
                                        [ngStyle]="{'background-image': 'url(/assets/patterns/snapshotoverlay/' + module.type +'.svg), url('+ config['asset-path'] +'/'+ module.image +')'}"></div>
                                </div>
                            </div>
                        </div>
                        <div *ngIf="module['potential-risks']" (click)="riskCollapsed = !riskCollapsed" class="risks" [class.clickable]="module['potential-risks-short']">
                            <div class="heading">
                                <svg-inline src="/assets/icons/pr.svg" [ngClass]="'type-' + module.type"></svg-inline>
                                <h3 class="bigger">{{ textBySlug.ui.module['potential-risks'] }}</h3>
                                <svg-inline *ngIf="module['potential-risks-short']" class="arrow" [class.selected]="!riskCollapsed" src="/assets/icons/arrow.svg"></svg-inline>
                            </div>
                            <div *ngIf="riskCollapsed && module['potential-risks-short']" [innerHTML]="module['potential-risks-short']"></div>
                            <div *ngIf="riskCollapsed && !module['potential-risks-short']" [innerHTML]="module['potential-risks']"></div>
                            <div *ngIf="!riskCollapsed" [innerHTML]="module['potential-risks']"></div>
                        </div>
                    </div>

                    <div class="col-xs-12 col-sm-6 col-md-4 column-b">
                        <div *ngIf="module['potential-risks']" (click)="riskCollapsed = !riskCollapsed" class="risks hidden-sm" [class.clickable]="module['potential-risks-short']">
                            <div class="heading">
                                <svg-inline src="/assets/icons/pr.svg" [ngClass]="'type-' + module.type"></svg-inline>
                                <h3 class="bigger">{{ textBySlug.ui.module['potential-risks'] }}</h3>
                                <svg-inline *ngIf="module['potential-risks-short']" class="arrow" [class.selected]="!riskCollapsed" src="/assets/icons/arrow.svg"></svg-inline>
                            </div>
                            <div *ngIf="riskCollapsed && module['potential-risks-short']" [innerHTML]="module['potential-risks-short']"></div>
                            <div *ngIf="riskCollapsed && !module['potential-risks-short']" [innerHTML]="module['potential-risks']"></div>
                            <div *ngIf="!riskCollapsed" [innerHTML]="module['potential-risks']"></div>
                        </div>
                        <div *ngIf="tactics.length || principles.length || theories.length || methodologies.length || stories.length">
                            <h3 class="bigger related">{{ textBySlug.ui.module['related-modules'] }}</h3>
                            <div class="related">
                                <div *ngIf="tactics.length">
                                    <h3 class="indent">{{ textBySlug.ui.types.tactics }}</h3>
                                    <ul><li *ngFor="let m of tactics">
                                        <a [routerLink]="['/tool', m.slug]" class="tactic">{{ m.title }}</a>
                                    </li></ul>
                                </div>
                                <div *ngIf="principles.length">
                                    <h3 class="indent">{{ textBySlug.ui.types.principles }}</h3>
                                    <ul><li *ngFor="let m of principles">
                                        <a [routerLink]="['/tool', m.slug]" class="principle">{{ m.title }}</a>
                                    </li></ul>
                                </div>
                                <div *ngIf="theories.length">
                                    <h3 class="indent">{{ textBySlug.ui.types.theories }}</h3>
                                    <ul><li *ngFor="let m of theories">
                                        <a [routerLink]="['/tool', m.slug]" class="theory">{{ m.title }}</a>
                                    </li></ul>
                                </div>
                                <div *ngIf="methodologies.length">
                                    <h3 class="indent">{{ textBySlug.ui.types.methodologies }}</h3>
                                    <ul><li *ngFor="let m of methodologies">
                                        <a [routerLink]="['/tool', m.slug]" class="methodology">{{ m.title }}</a>
                                    </li></ul>
                                </div>
                                <div *ngIf="stories.length">
                                    <h3 class="indent">{{ textBySlug.ui.types.stories }}</h3>
                                    <ul><li *ngFor="let m of stories">
                                        <a [routerLink]="['/tool', m.slug]" class="story">{{ m.title }}</a>
                                    </li></ul>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="col-xs-12 col-sm-4 col-sm-offset-1 col-md-4 col-md-offset-0 column-b visible-xs visible-sm">
                        <div *ngIf="module.tags">
                            <h3 class="border-bottom">{{ textBySlug.ui.module.tags }}</h3>
                            <span *ngFor="let tag of module.tags; let last=last">
                                <a [routerLink]="['/tag', slugify(tag)]" class="tag">{{ tag }}</a><strong *ngIf="!last"> / </strong>
                            </span>
                        </div>
                        <h3 class="border-bottom">{{ textBySlug.ui.module.training }}</h3>
                        <div [innerMarkdown]="template(textBySlug.ui.module['training-request'], {form: textBySlug.ui.forms.training})"></div>
                    </div>
                </div>
            </div><!-- .container -->

            <a target="_blank" class="edit-link" href="{{ module.document_link }}">edit</a>
        </div>
    `,
    directives: [ APP_DIRECTIVES, ROUTER_DIRECTIVES ],
    pipes: [ APP_PIPES ]
})
export class DetailComponent {
    _ = _;
    slugify = slugify;
    template = template;
    plainString = plainString;

    constructor(
        private el: ElementRef,
        private title: Title,
        private router: Router,
        private route: ActivatedRoute,
        private contentService: ContentService,
        private savingService: ModuleSavingService) { 
    }
    ngOnInit() {
        this.contentService.injectContent(this, () => {
            this.sub = this.route.params.subscribe((params) => {
                this.module = this.modulesBySlug[params.slug];
                if (!this.module) {
                    this.router.navigate(['/search', 'slug!' + params.slug]);
                    return;
                }
                this.collapsed = true;
                this.riskCollapsed = true;
                this.examplesCollapsed = true;

                this.authors = this.getRelated('authors', this.peopleBySlug);
                this.stories = this.getRelated('stories', this.modulesBySlug);
                this.tactics = this.getRelated('tactics', this.modulesBySlug);
                this.theories = this.getRelated('theories', this.modulesBySlug);
                this.principles = this.getRelated('principles', this.modulesBySlug);
                this.methodologies = this.getRelated('methodologies', this.modulesBySlug);

                // Attempt to split author name into first and last (this assignment syntax is called destructuring)
                this.authors.forEach(author => [, author.firstname, author.lastname] = author.title.split(/^([^\s]+)\s+/))

                this.snapshot = /SNAPSHOT/.test(this.module.document_title);
                this.gallery = /GALLERY/.test(this.module.document_title);

                // Compose the module's pattern
                var types = {'tactics':'tactic', 'principles':'principle', 'theories':'theory', 'methodologies':'methodology'};
                var otherTypes = _.pull(_.keys(types), this.module.type);
                this.patternTypes = _.filter(_.map(otherTypes, each => this.module[`key-${each}`] ? types[each] : null));

                // Adjust the UI
                this.title.setTitle(this.module['title']);
                window.scrollTo(0,0);

                isDevMode() && console.log(this.module);
            });
        });
    }
    ngAfterViewChecked() {
        // HACK: Ensure fragment links don't reload the page
        var links = this.el.nativeElement.querySelectorAll('a[href^="#"]');
        if (links.length) _.map(links, el => el.setAttribute('href', location.pathname + el.hash));

        // HACK: Prevent module links rendered from markdown from reloading the page
        var links = this.el.nativeElement.querySelectorAll('a[href^="/tool"]');
        if (links.length) {
            _.map(links, el => {
                if (el.hash) return; // Don't rewrite links with fragment ids
                var elClone = el.cloneNode(true);
                el.parentNode.replaceChild(elClone, el);
                elClone.addEventListener('click', e => {
                    e.preventDefault();
                    this.router.navigateByUrl(el.getAttribute('href'));
                });
            });
        }
    }
    ngOnDestroy() {
        this.sub && this.sub.unsubscribe();
    }
    getRelated(type, fromCollection) {
        return _.filter(_.map((this.module[type] || []).sort(), (slug) => fromCollection[slug]));
    }
}


@Component({
    selector: 'menu',
    template: `
        <div (click)="visible = !visible" class="menu-toggle clickable">
            <img [class.visible]="visible" class="close-icon" src="/assets/icons/close.png">
            <svg-inline class="open-icon" src="/assets/icons/hamburger.svg"></svg-inline>
            <h4>Menu</h4>
        </div>
        <div *ngIf="textBySlug && visible">
            <div (click)="visible = !visible" class="overlay" [class.visible]="visible"></div>
            <div class="menu-outer">
                <div class="menu">
                    <div #menu class="menu-inner">
                        <div class="menu-top"></div>
                        <div (window:scroll)="onScroll()" class="menu-scroll">
                            <div class="menu-section">
                                <!-- wait for https://github.com/angular/angular/pull/9792 to add routerLinkActive -->
                                <h3 class="clickable" (click)="nav(['/about'])">{{ textBySlug.ui.menu.about }}</h3>
                                <p class="clickable" (click)="nav(['/about', 'whats-inside'])">{{ textBySlug.ui.menu['whats-inside'] }}</p>
                                <p class="clickable" (click)="nav(['/about', 'process'])">{{ textBySlug.ui.menu.process }}</p>
                                <p class="clickable" (click)="nav(['/about', 'values'])">{{ textBySlug.ui.menu.values }}</p>
                                <p class="clickable" (click)="nav(['/about', 'advisory-network'])">{{ textBySlug.ui.menu['advisory-network'] }}</p>
                                <p class="clickable" (click)="nav(['/about', 'team'])">{{ textBySlug.ui.menu.team }}</p>
                                <p class="clickable" (click)="nav(['/about', 'beautiful-trouble-and-action-aid'])">{{ textBySlug.ui.menu['beautiful-trouble-and-action-aid'] }}</p>
                                <p class="clickable" (click)="nav(['/about', 'partners'])">{{ textBySlug.ui.menu.partners }}</p>
                                <p class="clickable" (click)="nav(['/about', 'faq'])">{{ textBySlug.ui.menu.faq }}</p>
                            </div>
                            <div class="menu-section">
                                <h3 class="clickable" (click)="nav(['/platforms'])">{{ textBySlug.ui.menu.platforms }}</h3>
                                <em>{{ textBySlug.ui.menu.explore }}</em>
                                <p class="clickable" (click)="nav(['/platforms', 'chatbot'])">{{ textBySlug.ui.menu.chatbot }}</p>
                                <p class="clickable" (click)="nav(['/platforms', 'game'])">{{ textBySlug.ui.menu.game }}</p>
                                <p class="clickable" (click)="nav(['/platforms', 'pdf'])">{{ textBySlug.ui.menu.pdf }}</p>
                            </div>
                            <div class="menu-section">
                                <h3 class="clickable" (click)="nav(['/contribute'])">{{ textBySlug.ui.menu.contribute }}</h3>
                                <p class="clickable" (click)="nav(['/contribute', 'how-it-works'])">{{ textBySlug.ui.menu['how-it-works'] }}</p>
                            </div>
                            <!--
                            <div class="menu-section">
                                <h3 class="clickable" (click)="nav(['/resources'])">{{ textBySlug.ui.menu['training-and-resources'] }}</h3>
                                <p class="clickable" (click)="nav(['/resources', 'training'])">{{ textBySlug.ui.menu.training }}</p>
                                <p class="clickable" (click)="nav(['/resources', 'other'])">{{ textBySlug.ui.menu.other }}</p>
                            </div>
                            -->
                            <div class="menu-section">
                                <h3>{{ textBySlug.ui.menu['contact-us'] }}</h3>
                                <a class="email" href="mailto:{{ textBySlug.ui.misc['contact-email'] }}">{{ textBySlug.ui.misc['contact-email'] }}</a>
                                <a href="{{ textBySlug.ui.misc['twitter-link'] }}" target="_blank" style="color: white"><svg-inline src="/assets/icons/Twitter.svg"></svg-inline></a>
                                <a href="{{ textBySlug.ui.misc['facebook-link'] }}" target="_blank" style="color: white"><svg-inline src="/assets/icons/facebook.svg"></svg-inline></a>

                                <!--
                                <p class="subscribe-note">Subscribe to our newsletter</p>
                                <div class="form-wrapper">
                                    <input placeholder="{{ textBySlug.ui.misc['placeholder-email'] }}">
                                    <span class="submit clickable">{{ textBySlug.ui.menu.submit }}</span>
                                </div>
                                -->
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `,
    directives: [ APP_DIRECTIVES, ROUTER_DIRECTIVES ]
})
export class MenuComponent {
    @ViewChild('menu') menu;
    @Input() textBySlug;
    visible = false;
    lastScrollTop = 0;

    constructor(private router: Router) { }
    nav(linkParam) {
        this.router.navigate(linkParam);
        this.visible = false;
    }
    onScroll() {
        var scrollTop = document.body.scrollTop;
        if (scrollTop != this.lastScrollTop) {
            this.menu.nativeElement.scrollTop = this.menu.nativeElement.scrollTop + (scrollTop - this.lastScrollTop);
            this.lastScrollTop = scrollTop;
        }
    }
}


@Component({
    selector: 'tools',
    template: `
        <div class="container visible-md visible-lg">
            <div *ngIf="textBySlug">
                <div #master class="master col-xs-12 col-md-5 col-lg-4" [style.margin-left.px]="marginLeft" (mouseenter)="!isOpen && slide()" (mouseleave)="!isOpen && unslide()">
                    <div #iconPanel class="col-md-3 icon-panel" (click)="isOpen ? close() : open()">
                        <div class="arrow" [class.active]="isOpen">
                            <div class="button"><svg-inline src="/assets/icons/arrow.svg"></svg-inline></div>
                        </div>
                        <div (click)="activate('news'); $event.stopPropagation()" class="news-icon" [class.active]="isOpen && active == 'news'">
                            <div class="button">
                                <svg-inline src="/assets/icons/News_Feed.svg"></svg-inline>
                                <div class="title">{{ textBySlug.ui.sidebar.news }}</div>
                            </div>
                        </div>
                        <div (click)="activate('tools'); $event.stopPropagation()" class="tools-icon" [class.active]="isOpen && active == 'tools'">
                            <div class="button">
                                <svg-inline src="/assets/icons/My_tools.svg"></svg-inline>
                                <div class="title">{{ textBySlug.ui.sidebar.tools }}</div>
                            </div>
                        </div>
                    </div>
                    <div *ngIf="isOpen" class="col-md-9 tab-panel">
                        <div class="row">
                            <div class="col-md-12 tabs">
                                <div *ngIf="active == 'news'" class="row">
                                    <div class="col-md-6 tab twitter-tab">
                                        <div (click)="newsTab = 'twitter'" [class.active]="newsTab == 'twitter'" class="button">
                                            <svg-inline src="/assets/icons/Twitter.svg"></svg-inline></div>
                                    </div>
                                    <div class="col-md-6 tab facebook-tab">
                                        <div (click)="newsTab = 'facebook'" [class.active]="newsTab == 'facebook'" class="button">
                                            <svg-inline src="/assets/icons/facebook.svg"></svg-inline></div>
                                    </div>
                                </div>
                                <div *ngIf="active == 'tools'" class="row">
                                    <div class="col-md-6 tab pdf-tab">
                                        <div (click)="toolsTab = toolsTab == 'pdf' ? null : 'pdf'" [class.active]="toolsTab == 'pdf'" class="button">
                                            <svg-inline src="/assets/icons/pdf.svg"></svg-inline></div>
                                    </div>
                                    <div class="col-md-6 tab email-tab">
                                        <div (click)="toolsTab = toolsTab == 'email' ? null : 'email'" [class.active]="toolsTab == 'email'" class="button">
                                            <svg-inline src="/assets/icons/email.svg"></svg-inline></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div *ngIf="isOpen" class="col-md-9 main-panel">
                        <div class="row">
                            <div class="col-md-12 content">
                                <div *ngIf="active == 'news'" class="row">
                                    <div class="col-md-12 presto">
                                        <p class="heading">{{ textBySlug.ui.sidebar['news-intro'] }}</p>
                                        <p class="subheading">{{ textBySlug.ui.sidebar['news-invite'] }}</p>
                                        <div class="form"></div>
                                    </div>
                                    <div class="col-md-12 news-item">
                                    </div>
                                </div>
                                <div *ngIf="active == 'tools'" class="row">
                                    <div *ngIf="toolsTab == 'pdf'" class="col-md-12 pdf"><h3>Coming Soon: Download a PDF of these modules</h3></div>
                                    <div *ngIf="toolsTab == 'email'" class="col-md-12 pdf"><h3>Coming Soon: Have these modules emailed to you</h3></div>
                                    <div *ngIf="!getSavedModules().length" class="col-md-12 presto">
                                        <p class="heading">{{ textBySlug.ui.sidebar['tools-intro'] }}</p>
                                        <div (click)="addThisModule()" class="subheading" 
                                            [innerMarkdown]="template(textBySlug.ui.sidebar['tools-invite'], {icon: iconHTML})"></div>
                                    </div>
                                    <div *ngFor="let module of getSavedModules(); let first=first" class="col-md-12 tool" [class.first]="first">
                                        <div (click)="router.navigate(['/tool', module.slug]); close()" class="module-title clickable" [ngClass]="module.type">{{ module.title }}</div>
                                        <div class="module-snapshot" [innerHTML]="module.snapshot"></div>
                                        <div class="row">
                                            <div (click)="savingService.toggleSaved(module)" class="col-sm-6 module-unsave clickable">
                                                <svg-inline src="/assets/icons/Remove.svg"></svg-inline>
                                                <span>{{ textBySlug.ui.sidebar.remove }}</span>
                                            </div>
                                            <div class="col-sm-6 module-share clickable">
                                                <svg-inline src="/assets/icons/Share_not_in_module.svg"></svg-inline> 
                                                <span>{{ textBySlug.ui.sidebar.share }}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `,
    directives: [ APP_DIRECTIVES, ROUTER_DIRECTIVES ],
    pipes: [ APP_PIPES ]
})
export class ToolsComponent {
    @Output() offsetchanged = new EventEmitter();
    @ViewChild('master') master;
    @ViewChild('iconPanel') iconPanel;
    template = template;
    _ = _;

    isOpen = false;
    active = 'tools';
    newsTab = 'twitter';
    toolsTab = null;
    iconHTML = '<img src="/assets/icons/+_intext.svg" width="25px" class="clickable">';
    marginLeft = 0;

    constructor(
        private router: Router,
        private savingService: ModuleSavingService,
        private contentService: ContentService) {
    }
    ngOnInit() {
        this.contentService.injectContent(this);
    }
    open() {
        this.isOpen = true;
        if (this.master) {
            var rect = this.master.nativeElement.getBoundingClientRect();
            var diff = Math.abs(innerWidth - rect.right) - this.marginLeft;
            this.marginLeft = -diff;
            this.offsetchanged.next(diff);
        }
    }
    close() {
        this.isOpen = false;
        this.toolsTab = null;
        this.marginLeft = 0;
        this.offsetchanged.next(0);
    }
    slide() {
        if (this.iconPanel) {
            var rect = this.iconPanel.nativeElement.getBoundingClientRect();
            if (rect.right <= innerWidth) return;
            this.marginLeft = -rect.width;
            this.offsetchanged.next(rect.width);
        }
    }
    unslide() {
        this.marginLeft = 0;
        this.offsetchanged.next(0);
    }
    activate(which) {
        if (which == this.active && this.isOpen) this.close();
        else if (which == this.active) this.open();
        else if (!this.isOpen) this.open();
        this.active = which;
    }
    addThisModule() {
        var match = this.router.url.match(/^\/tool\/([^/]+)/);
        if (match) this.savingService.toggleSaved({slug: match[1]});
    }
    getSavedModules() {
        return _.filter(_.map(this.savingService.savedModules.sort(), (slug) => this.modulesBySlug[slug]));
    }
}


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
                </div><!-- .container -->
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
                </div><!-- .container -->
            </div>
        </div>
    `,
    directives: [ APP_DIRECTIVES, ROUTER_DIRECTIVES, ModalComponent, MenuComponent, ToolsComponent ]
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


export const APP_ROUTER_PROVIDERS = [provideRouter([
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
    {path: 'contribute/:section',   component: ContributeComponent},
])];


