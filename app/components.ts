// Define all site components here.

import { Component, Input, Output, Inject, EventEmitter, ElementRef, ViewChild, NgZone, isDevMode } from '@angular/core';
import { Router, ActivatedRoute, provideRouter, ROUTER_DIRECTIVES, NavigationEnd } from '@angular/router';
import { Title, DomSanitizationService } from '@angular/platform-browser';

import { APP_DIRECTIVES } from './directives';
import { CapitalizePipe, NotagsPipe, TrimPipe, plainString, noTags, slugify } from './utilities';
import { ContentService, ClientStorageService, ModuleSavingService, LocalStorage, SessionStorage } from './services';

import '../styles.scss';
import _ = require('lodash');


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
        <div class="container page" addSectionToRoute="/about" thresholdElement="#fixed-nav">
            <div class="row">
                <div *ngIf="textBySlug" class="page-heading">
                    <h3>{{ textBySlug.about.misc.heading }}</h3>
                    <p>{{ textBySlug.about.heading.introduction }}</p>
                </div>
                <about-inner [config]="config" [textBySlug]="textBySlug" [peopleBySlug]="peopleBySlug" [useAccordion]="false"></about-inner>
            </div>
        </div>
    `,
    directives: [ AboutInnerComponent, APP_DIRECTIVES, ROUTER_DIRECTIVES ]
})
export class AboutComponent {
    constructor(private contentService: ContentService) { }
    ngOnInit() { this.contentService.injectContent(this); }
}


@Component({
    selector: 'modal',
    template: `
        <div class="fixed-container-wrapper"
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
                            <img class="logo" src="/assets/icons/logo-reverse.png">
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
    directives: [ AboutInnerComponent, APP_DIRECTIVES, ROUTER_DIRECTIVES ]
})
export class ModalComponent {
    // Uncomment this when we're ready to have the modal *really* show up only once. 
    // Maybe set a timestamp value each time the site is visited and re-show if some time has passed?
    //@LocalStorage() dismissedExplicitly;
    dismissedExplicitly;
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
        <div *ngIf="textBySlug" addSectionToRoute="/platforms" thresholdElement="#fixed-nav" class="container page platforms">
            <div class="row">
                <div class="col-xs-12 page-heading">
                    <h3 class="heading">{{ textBySlug.platforms.misc.heading }}</h3>
                </div>
                <section *ngFor="let p of ['chatbot', 'game', 'pdf']" id="{{ p }}">
                    <div class="col-md-1"><svg-inline src="/assets/icons/{{ p }}.svg"></svg-inline></div>
                    <div class="col-md-4">
                        <h3 class="overline title">{{ textBySlug.platforms[p].title }}</h3> 
                        <h4>{{ textBySlug.platforms[p].introduction }}</h4>
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
                </section>
            </div>
        </div>
    `,
    directives: [
        APP_DIRECTIVES,
        ROUTER_DIRECTIVES
    ]
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
    directives: [
        APP_DIRECTIVES,
        ROUTER_DIRECTIVES
    ]
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
        <div *ngIf="textBySlug" addSectionToRoute="/contribute" thresholdElement="#fixed-nav" class="container page contribute">
            <div class="row">
                <div class="col-xs-12 page-heading">
                    <h3 class="heading">{{ textBySlug.contribute.misc.heading }}</h3>
                </div>
                <section id="how-it-works">
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
                        <div [ngClass]="first ? 'col-xs-2 col-md-offset-1' : 'col-xs-2'">
                            <h3>{{ textBySlug.ui.types[each[1]] }}</h3>
                            <svg-inline class="2rows pattern" src="/assets/patterns/2rows/{{ each[0] }}.svg"></svg-inline>
                            <div class="description" [class.active]="activeType == each[0]">
                                <div [innerHTML]="textBySlug.ui.definitions[each[0] + '-short']"></div>
                                <div class="links">Go to form</div>
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
        <div class="row">

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
                                        <div *ngIf="first" class="type-representation first" [class.expanded]="expanded">
                                            <div [ngClass]="[expanded ? 'col-xs-3 col-xs-offset-3' : 'col-xs-2 col-xs-offset-1']">
                                                <h3>{{ each[1] }}</h3>
                                                <svg-inline class="2rows pattern" src="/assets/patterns/2rows/{{ each[0] }}.svg"></svg-inline>
                                            </div>
                                            <div *ngIf="expanded" class="col-xs-3"><p class="definition" [innerHTML]="textBySlug.ui.definitions[each[0] + '-short']"></p></div>
                                            <div *ngIf="expanded" class="clearfix"></div>
                                        </div>
                                        <div *ngIf="!first" class="type-representation" [class.expanded]="expanded">
                                            <div [ngClass]="[expanded ? 'col-xs-3' : 'col-xs-2']">
                                                <h3>{{ each[1] }}</h3>
                                                <svg-inline class="2rows pattern" src="/assets/patterns/2rows/{{ each[0] }}.svg"></svg-inline>
                                                <p *ngIf="expanded" class="definition" [innerHTML]="textBySlug.ui.definitions[each[0] + '-short']"></p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div *ngIf="type">
                        <div class="row">
                            <div *ngIf="expanded">
                                <div class="col-md-2 type-list">
                                    <div class="expanded type-link clickable">
                                        <div [routerLink]="['/']">All</div>
                                    </div>
                                    <div *ngFor="let each of types" [routerLink]="['/type', each[0]]" class="expanded type-link clickable">
                                        <div [class.selected]="each[0] == type">{{ each[1] }}</div>
                                    </div>
                                </div>
                                <div class="col-md-4 type-pattern">
                                    <div *ngFor="let each of types" class="expanded">
                                        <div *ngIf="each[0] == type">
                                            <h3>{{ each[1] }}</h3>
                                            <svg-inline class="pattern" src="/assets/patterns/3rows/{{ each[0] }}.svg"></svg-inline>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-md-6 type-description">
                                    <p [innerHtml]="textBySlug.ui.definitions[type]"></p>
                                    <div *ngIf="type == 'story'" class="regions">
                                        <h3>Region</h3>
                                        <span *ngFor="let each of ['africa','latin-america-and-the-caribbean','north-america','asia','europe','middle-east','oceania']">
                                            <svg-inline [routerLink]="['/type/story', each]" [ngClass]="{clickable:true, selected:region==each}" src="/assets/icons/{{ each }}.svg"></svg-inline>
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div *ngIf="!expanded">
                                <div class="col-md-12 type-list">
                                    <span class="type-link clickable">
                                        <div [routerLink]="['/']">All</div>
                                    </span>
                                    <span *ngFor="let each of types" [routerLink]="['/type', each[0]]" class="type-link clickable">
                                        <div *ngIf="each[0] != type">{{ each[1] }}</div>
                                        <h3 *ngIf="each[0] == type" class="selected">{{ each[1] }}</h3>
                                        <svg-inline *ngIf="each[0] == type" class="pattern" src="/assets/patterns/1row/{{ each[0] }}.svg"></svg-inline>
                                    </span>
                                    <div *ngIf="type == 'story'" class="regions">
                                        <span *ngFor="let each of ['africa','latin-america-and-the-caribbean','north-america','asia','europe','middle-east','oceania']">
                                            <svg-inline [routerLink]="['/type/story', each]" [ngClass]="{clickable:true, selected:region==each}" src="/assets/icons/{{ each }}.svg"></svg-inline>
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <svg-inline *ngIf="!expanded || overrideExpanded" (click)="expanded = overrideExpanded = !expanded" 
                     [ngClass]="{arrow:true, clickable:true, selected:expanded}" src="/assets/icons/arrow.svg"></svg-inline>
                </div>
            </div>
        </div>
    `,
    directives: [
        APP_DIRECTIVES,
        ROUTER_DIRECTIVES
    ],
})
export class ModuleTypeComponent {
    @Input() type;
    @Input() region;
    @Input() textBySlug;
    @Output() resized = new EventEmitter();
    expanded = true;
    types = [['story', 'stories'], 
             ['tactic', 'tactics'], 
             ['principle', 'principles'], 
             ['theory', 'theories'], 
             ['methodology', 'methodologies']];
    typeMap = _.fromPairs(this.types);

    constructor(private router: Router) { }
    setExpanded() {
        if (document.body.scrollTop == 0) {
            this.expanded = true;
            this.overrideExpanded = false;
        } else if (!this.overrideExpanded) {
            this.expanded = false;
        }
    }
}


@Component({
    selector: 'gallery',
    template: `
        <div class="fixed-container-wrapper">
            <div class="container">
                <div class="row">
                    <input [(ngModel)]="query" (ngModelChange)="filterModules()" class="search-box" 
                     placeholder="Search for keywords, ex: legislation, state repression, etc..." autofocus>
                </div>
                <module-types (resized)="marginTop = $event" [region]="region" [type]="type" [textBySlug]="textBySlug"></module-types>
            </div>
        </div>
        <div class="container">
            <div class="row gallery" [style.margin-top.px]="marginTop">
                <div [style.position]="sortPosition" class="gallery-sort col-md-3">
                <div class="gallery-sort-container">
                    <h3>View As</h3>
                    <div class="row border-top border-bottom view-as">
                        <div class="col-xs-6">
                            <svg-inline (click)="viewStyle='grid'" [class.selected]="viewStyle == 'grid'" class="clickable" src="/assets/icons/grid.svg"></svg-inline>
                        </div>
                        <div class="col-xs-6">
                            <svg-inline (click)="viewStyle='list'" [class.selected]="viewStyle == 'list'" class="clickable" src="/assets/icons/list.svg"></svg-inline>
                        </div>
                    </div>
                    <h3>Sort By</h3>
                    <div class="row border-top border-bottom sort-by">
                        <div (click)="sortModules('title')" [class.selected]="sortKey == 'title'" class="col-xs-6 clickable">Alphabetical</div>
                        <div (click)="sortModules('timestamp')" [class.selected]="sortKey == 'timestamp'" class="col-xs-6 clickable">Newest</div>
                    </div>
                    <h3>Tags</h3>
                    <div class="row border-top">
                        <span *ngFor="let each of tags; let last=last">
                            <a *ngIf="tag != each" [routerLink]="['/tag', each]" routerLinkActive="selected" class="tag">{{ tagsBySlug[each] }}</a>
                            <a *ngIf="tag == each" [routerLink]="['/']" routerLinkActive="selected" class="tag">{{ tagsBySlug[each] }}</a>
                            <strong *ngIf="!last"> / </strong>
                        </span>
                    </div>
                    <div *ngIf="tag" class="gallery-info gray">
                        <span [routerLink]="['/']" class="gallery-clear clickable"><span class="icon">&#9746;</span> Clear Selection</span>
                    </div>
                </div>
                </div>
                <div *ngIf="selectedModules" class="gallery-list col-md-9">

                    <div class="row">
                        <div class="col-sm-12">
                            <div *ngIf="query" class="col-md-11 col-md-offset-1 gallery-info gray">
                                <span (click)="query = ''; filterModules()" class="gallery-clear clickable"><span class="icon">&#9746;</span> Clear</span>
                                <span>Search Results for "{{ query }}" ({{ selectedModules.length }} results found)</span>
                            </div>
                        </div>
                    </div>

                    <div lazyBackgroundImages *ngIf="viewStyle == 'grid'" class="row">
                        <div *ngFor="let module of selectedModules" (click)="router.navigate(['/module', module.slug])" class="col-sm-6 col-md-4 gallery-module-grid">
                            <!-- Rethink the structure of this whole section -->

                            <div class="make-it-square"></div>
                            <div *ngIf="module.image" [attr.data-lazy-background]="config['asset-path'] +'/'+ module.image" class="module-image"></div>
                            <div class="module-overlay"></div>

                            <div class="module-content clickable">
                                <div class="module-hide-on-hover">
                                    <svg-inline *ngIf="module.region" src="/assets/icons/{{ module.region }}.svg" class="region-icon"></svg-inline>
                                    <div class="offset" [style.justify-content]="['center','flex-start','flex-end'][module.timestamp%3]">
                                        <!--<div (mouseenter)="crazyHover($event,0,1,0.75)" (mouseleave)="crazyHover($event,1,0,0.5)">-->
                                        <div>
                                            <div [ngClass]="['module-type', module.type]">{{ module.type }}</div>
                                            <div [class.story]="module.type == 'story'" class="module-title">{{ module.title }}</div>
                                        </div>
                                        <div (click)="savingService.toggleSaved(module); $event.stopPropagation()" [ngSwitch]="savingService.isSaved(module)" class="module-save">
                                            <svg-inline *ngSwitchCase="true" src="/assets/icons/-_tileandmodule.svg"></svg-inline>
                                            <svg-inline *ngSwitchCase="false" src="/assets/icons/+_tileandmodule.svg"></svg-inline>
                                        </div>
                                    </div>

                                </div>
                                <div [ngClass]="['module-snapshot', module.type]" [innerHTML]="module.snapshot"></div>
                            </div>
                            
                            <!-- ... -->
                        </div>
                    </div>
                    <div *ngIf="viewStyle == 'list'">
                        <div class="row">
                            <div class="col-md-11 col-md-offset-1">
                                <div *ngFor="let module of selectedModules" (click)="router.navigate(['/module', module.slug])" class="gallery-module-list col-sm-6">
                                    <div class="module-content clickable">
                                        <div class="module-type-accent"></div>
                                        <div [ngClass]="['module-type', module.type]">{{ module.type }}</div>
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
    directives: [
        APP_DIRECTIVES,
        ROUTER_DIRECTIVES,
        ModuleTypeComponent,
    ],
    styles: []
})
export class GalleryComponent {
    @LocalStorage() sortKey;
    @LocalStorage() viewStyle;
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
        // Detect the blank (as opposed to null) query
        if (!this.query && this.query !== null) {
            history.replaceState(null, null, '');
            this.query = null;
            //this.router.navigate(['/']);
        }
        if (this.query) {
            history.replaceState(null, null, '/search/' + this.query);
            this.viewStyle = 'list';
            // Allow queries like "authors!andrew-boyd" which search a specific field
            var prefix = this.query.split(/\s*!\s*/)[0];
            var query = this.query.replace(/[^@]+!\s*/, '');
            var config = { bool: /\s/.test(query) ? 'AND' : 'OR', expand: true };
            if (prefix != query && _.includes(this.config.search, prefix)) {
                config.fields = {}; config.fields[prefix] = {boost: 5};
            }
            this.selectedModules = _.map(this.index.search(query, config), obj => this.modulesBySlug[obj.ref]);
        } else if (this.type) {
            this.selectedModules = this.modulesByType[this.type] || [];
            if (this.region) {
                this.selectedModules = _.filter(this.selectedModules, m => m.region == this.region);
                if (!this.selectedModules.length) setTimeout(() => this.router.navigate(['/type', this.type]), 1000);
            }
        } else if (this.tag) {
            this.selectedModules = this.modulesByTag[this.tag];
        } else {
            this.selectedModules = this.modules;
        }
        this.sortModules();
    }
    sortModules(key) {
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
                            <div *ngIf="snapshot" [ngClass]="['pattern', 'pattern-snapshot', module.type]" 
                                [ngStyle]="{'background-image': 'url(/assets/patterns/snapshotoverlay/'+module.type+'.svg)'}"></div>
                            <div class="module-header">
                                <div *ngIf="module.type == 'story'" class="story-extra">
                                    <p *ngIf="module.where || module.when">{{ module.where }} {{ module.when }}</p>
                                    <svg-inline *ngIf="module.region" src="/assets/icons/{{ module.region }}.svg" class="region-icon"></svg-inline>
                                </div>
                                <div [ngClass]="['module-type', module.type]">{{ module.type }}</div>
                                <div class="module-title">{{ module.title }}</div>
                                <div (click)="savingService.toggleSaved(module)" [ngSwitch]="savingService.isSaved(module)" class="module-save clickable">
                                    <div *ngSwitchCase="true"><svg-inline src="/assets/icons/-_tileandmodule.svg"></svg-inline>Remove this module from your tools</div>
                                    <div *ngSwitchCase="false"><svg-inline src="/assets/icons/+_tileandmodule.svg"></svg-inline>Save this module</div>
                                </div><br>
                                <div class="module-share clickable"><svg-inline src="/assets/icons/share_in_module.svg"></svg-inline>Share this module</div>
                            </div>
                            <div class="module-image-caption" [innerHTML]="module['image-caption']"></div>
                        </div>
                    </div>
                </div>
            </div><!-- .container -->

            <div class="container">
                <div [ngClass]="['row', 'type-' + module.type]">

                    <div class="hidden-xs hidden-sm col-md-3 col-lg-2 column-a"><!-- large -->
                        <h3 class="border-bottom bigger">Contributed by</h3>
                        <div *ngFor="let author of authors" >
                            <a [routerLink]="['/search', 'authors!' + author.slug]">
                                <div class="contributor-image" [ngStyle]="{'background-image': author.image ? 'url('+config['asset-path']+'/'+author.image+')' : ''}"></div>
                                <h4>{{ author.title }}</h4>
                            </a>
                            <p *ngIf="author.bio" [innerHTML]="author.bio"></p>
                        </div>
                        <div *ngIf="!authors.length">
                            <img class="contributor-image" src="/assets/icons/anon.png">
                            <h4>It could be you</h4>
                        </div>
                        <div *ngIf="module.tags">
                            <h3 class="border-bottom">Tags</h3>
                            <span *ngFor="let tag of module.tags; let last=last">
                                <a [routerLink]="['/tag', slugify(tag)]" class="tag">{{ tag }}</a><strong *ngIf="!last"> / </strong>
                            </span>
                        </div>
                    </div>

                    <div class="hidden-md hidden-lg"><!-- small -->
                        <div class="col-xs-12 column-a">
                            <h3 class="border-bottom bigger">Contributed by</h3>
                        </div>
                        <div *ngFor="let author of authors">
                            <div class="col-xs-12 col-sm-4 column-a">
                                <a [routerLink]="['/search', 'authors!' + author.slug]">
                                    <div class="contributor-image" [ngStyle]="{'background-image': author.image ? 'url('+config['asset-path']+'/'+author.image+')' : ''}"></div>
                                </a>
                            </div>
                            <div class="col-xs-12 col-sm-8 column-a">
                                <a [routerLink]="['/search', 'authors!' + author.slug]">
                                    <h4>{{ author.title }}</h4>
                                </a>
                                <p *ngIf="author.bio" [innerHTML]="author.bio"></p>
                            </div>
                            <div class="clearfix"></div>
                            <div class="col-xs-12 hr"></div>
                        </div>
                        <div *ngFor="let author of authors">
                            <div *ngIf="!authors.length">
                                <img class="contributor-image" src="/assets/icons/anon.png">
                                <h4>It could be you</h4>
                            </div>
                        </div>
                    </div>

                    <div class="col-xs-12 col-md-5 col-lg-offset-1 content">
                        <div *ngIf="snapshot">
                            <p [innerHTML]="module.snapshot"></p>
                            <p><strong>Hey, this isn't written yet but people like you are likely using it in all kinds of ways. Do you have insights to share on how to use this theory? Go ahead and share them through the form below...</strong></p>
                            <div class="row">
                                <div *ngIf="module['bt-link']" class="col-sm-6"><a href="{{ module['bt-link'] }}" target="_blank"><h4>See &rdquo;{{ module.title }}&ldquo; in <em>Beautiful Trouble</em></h4></a></div>
                            </div>
                        </div>
                        <div *ngIf="!snapshot">
                            <div *ngIf="collapsed">
                                <div class="short-write-up" [innerHTML]="module['short-write-up']"></div>
                                <h5 *ngIf="!gallery" (click)="collapsed = false">Read more</h5>
                            </div>
                            <div *ngIf="!collapsed">
                                <div *ngFor="let epigraph of module.epigraphs" class="epigraphs">
                                    <div class="epigraph" [innerHTML]="epigraph[0]"></div>
                                    <div class="attribution" [innerHTML]="epigraph[1]"></div>
                                </div>
                                <div *ngIf="!gallery" [innerHTML]="module['full-write-up']">
                                </div>
                                <h5 (click)="collapsed = true">Read less</h5>
                            </div>
                            <div *ngIf="module['why-it-worked']" class="why">
                                <h4>Why it worked</h4>
                                <p [innerHTML]="module['why-it-worked']"></p>
                            </div>
                            <div *ngIf="module['why-it-failed']" class="why">
                                <h4>Why it failed</h4>
                                <p [innerHTML]="module['why-it-failed']"></p>
                            </div>
                        </div>
                        <div *ngFor="let type of [['key-tactics', 'tactic', 'tactics'],
                                                  ['key-principles', 'principle', 'principles'],
                                                  ['key-theories', 'theory', 'theories'],
                                                  ['key-methodologies', 'methodology', 'methodologies']]">
                            <div *ngIf="module[type[0]]">
                                <div *ngFor="let each of module[type[0]]; let first=first; let last=last;">
                                    <div *ngIf="first && last" [ngClass]="['module-type', type[1]]">key {{ type[1] }}</div><!-- singular -->
                                    <div *ngIf="first && !last" [ngClass]="['module-type', type[1]]">key {{ type[2] }}</div><!-- plural -->
                                    <h3 [innerHTML]="each[0]"></h3><div [innerHTML]="each[1]"></div>
                                </div>
                            </div>
                        </div>
                        <div *ngIf="module['learn-more']" class="learn-more">
                            <div *ngFor="let learn of module['learn-more']; let first=first;">
                                <h4 *ngIf="first">Learn more</h4>
                                <p>
                                    <a target="_blank" href="{{ learn.link | notags | trim }}">{{ learn.title | notags | trim }}</a>
                                    <span *ngIf="plainString(learn.source)"> / {{ learn.source | notags }}</span><span *ngIf="plainString(learn.year)">, {{ learn.year | notags }}</span>
                                </p>
                            </div>
                        </div>
                    </div>
                    <div class="col-xs-12 col-md-4 column-b">
                        <div *ngIf="module['potential-risks']" (click)="riskCollapsed = !riskCollapsed" [ngClass]="{risks:true, clickable:module['potential-risks-short']}">
                            <div class="heading">
                                <svg-inline src="/assets/icons/pr.svg" [ngClass]="'type-' + module.type"></svg-inline>
                                <h3 class="bigger">Potential risks</h3>
                                <svg-inline *ngIf="module['potential-risks-short']" [ngClass]="{arrow:true, selected:!riskCollapsed}" src="/assets/icons/arrow.svg"></svg-inline>
                            </div>
                            <div *ngIf="riskCollapsed && module['potential-risks-short']" [innerHTML]="module['potential-risks-short']"></div>
                            <div *ngIf="riskCollapsed && !module['potential-risks-short']" [innerHTML]="module['potential-risks']"></div>
                            <div *ngIf="!riskCollapsed" [innerHTML]="module['potential-risks']"></div>
                        </div>
                        <div *ngIf="tactics.length || principles.length || theories.length || methodologies.length">
                            <h3 class="bigger related">Related Modules</h3>
                            <div class="related">
                                <div *ngIf="tactics.length">
                                    <h3 class="indent">Tactics</h3>
                                    <ul><li *ngFor="let m of tactics">
                                        <a [routerLink]="['/module', m.slug]" class="tactic">{{ m.title }}</a>
                                    </li></ul>
                                </div>
                                <div *ngIf="principles.length">
                                    <h3 class="indent">Principles</h3>
                                    <ul><li *ngFor="let m of principles">
                                        <a [routerLink]="['/module', m.slug]" class="principle">{{ m.title }}</a>
                                    </li></ul>
                                </div>
                                <div *ngIf="theories.length">
                                    <h3 class="indent">Theories</h3>
                                    <ul><li *ngFor="let m of theories">
                                        <a [routerLink]="['/module', m.slug]" class="theory">{{ m.title }}</a>
                                    </li></ul>
                                </div>
                                <div *ngIf="methodologies.length">
                                    <h3 class="indent">Methodologies</h3>
                                    <ul><li *ngFor="let m of methodologies">
                                        <a [routerLink]="['/module', m.slug]" class="methodology">{{ m.title }}</a>
                                    </li></ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div><!-- .container -->

            <a target="_blank" class="edit-link" href="{{ module.document_link }}">edit</a>
        </div>
    `,
    directives: [
        APP_DIRECTIVES,
        ROUTER_DIRECTIVES
    ],
    pipes: [
        NotagsPipe, 
        TrimPipe
    ],
    styles: []
})
export class DetailComponent {
    _ = _;
    slugify = slugify;
    plainString = plainString;
    module;
    patternTypes;

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

                // HACK: Fix a few accidental snapshots
                if (/In a page .500 words. or less/.test(this.module['full-write-up'])) delete this.module['full-write-up'];

                this.authors = this.getRelated('authors', this.peopleBySlug);
                this.stories = this.getRelated('stories', this.modulesBySlug);
                this.tactics = this.getRelated('tactics', this.modulesBySlug);
                this.theories = this.getRelated('theories', this.modulesBySlug);
                this.principles = this.getRelated('principles', this.modulesBySlug);
                this.methodologies = this.getRelated('methodologies', this.modulesBySlug);

                this.snapshot = !!(this.authors.length == 0 || (!this.module['full-write-up'] && !this.module['short-write-up']))
                this.gallery = !!(!this.module['full-write-up'] && this.module['short-write-up'])

                // Compose the module's pattern
                var types = {'tactics':'tactic', 'principles':'principle', 'theories':'theory', 'methodologies':'methodology'};
                var otherTypes = _.pull(_.keys(types), this.module.type);
                this.patternTypes = _.filter(_.map(otherTypes, each => this.module[`key-${each}`] ? types[each] : null));

                // Adjust the UI
                this.title.setTitle(this.module['title']);
                window.scrollTo(0,0);

                console.log(this.module);
            });
        });
    }
    ngAfterViewChecked() {
        // HACK: Ensure fragment links don't reload the page
        var links = this.el.nativeElement.querySelectorAll('a[href^="#"]');
        if (links.length) _.map(links, el => el.setAttribute('href', location.pathname + el.hash));

        // HACK: Prevent module links rendered from markdown from reloading the page
        var links = this.el.nativeElement.querySelectorAll('a[href^="/module"]');
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
        <div *ngIf="visible">
            <div (click)="visible = false" class="overlay" [class.visible]="visible"></div>
            <div class="menu-outer">
                <div class="menu">
                    <div #menu class="menu-inner">
                        <div class="menu-top"></div>
                        <div (window:scroll)="onScroll()" class="menu-scroll">
                            <div class="menu-section">
                                <!-- wait for https://github.com/angular/angular/pull/9792 to add routerLinkActive -->
                                <h3 class="clickable" (click)="nav(['/about'])">About</h3>
                                <p class="clickable" (click)="nav(['/about', 'whats-inside'])">The Toolbox</p>
                                <p class="clickable" (click)="nav(['/about', 'process'])">Our Process</p>
                                <p class="clickable" (click)="nav(['/about', 'values'])">Our Values</p>
                                <p class="clickable" (click)="nav(['/about', 'advisory-network'])">Our Advisory Network</p>
                                <p class="clickable" (click)="nav(['/about', 'team'])">Our Team</p>
                                <p class="clickable" (click)="nav(['/about', 'beautiful-trouble-and-action-aid'])">Beautiful Trouble + AA</p>
                                <p class="clickable" (click)="nav(['/about', 'partners'])">Partners</p>
                                <p class="clickable" (click)="nav(['/about', 'faq'])">FAQ</p>
                            </div>
                            <div class="menu-section">
                                <h3 class="clickable" (click)="nav(['/platforms'])">Platforms</h3>
                                <em>Explore other ways to access the toolbox</em>
                                <p class="clickable" (click)="nav(['/platforms', 'chatbot'])">Chat Bot</p>
                                <p class="clickable" (click)="nav(['/platforms', 'game'])">Game</p>
                                <p class="clickable" (click)="nav(['/platforms', 'pdf'])">PDF</p>
                            </div>
                            <div class="menu-section">
                                <h3 class="clickable" (click)="nav(['/contribute'])">Contribute</h3>
                                <p class="clickable" (click)="nav(['/contribute', 'how-it-works'])">How does it work?</p>
                            </div>
                            <div class="menu-section">
                                <h3 class="clickable" (click)="nav(['/resources'])">Training + Resources</h3>
                                <p class="clickable" (click)="nav(['/resources', 'training'])">Request a Training</p>
                                <p class="clickable" (click)="nav(['/resources', 'other'])">Other Resources</p>
                            </div>
                            <div class="menu-section">
                                <h3>Contact Us</h3>
                                <p></p>
                                <a href="{{ textBySlug.ui.misc['twitter-link'] }}" target="_blank" style="color: white"><svg-inline src="/assets/icons/Twitter.svg"></svg-inline></a>
                                <a href="{{ textBySlug.ui.misc['facebook-link'] }}" target="_blank" style="color: white"><svg-inline src="/assets/icons/facebook.svg"></svg-inline></a>
                                <p class="subscribe-note">Subscribe to our newsletter</p>
                                <div class="wrapper">
                                    <input placeholder="{{ textBySlug.ui.misc['placeholder-email'] }}">
                                    <span class="submit clickable">Submit</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `,
    directives: [
        APP_DIRECTIVES,
        ROUTER_DIRECTIVES
    ]
})
export class MenuComponent {
    @ViewChild('menu') menu;
    @Input() textBySlug;
    visible = false;
    lastScrollTop = 0;

    constructor(private router: Router) { }
    nav(linkParam) {
        this.visible = false;
        this.router.navigate(linkParam);
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
        <!-- new stuff 
        <div *ngIf="bottom" class="navbar-fixed-bottom" [class.opened]="opened">
            <div class="container">
                <div (click)="toggle()" class="row tool-toggle">
                    <div class="col-xs-6 clickable icon" [class.selected]="opened && visible == 'news-feed'" 
                     (click)="selectTool('news-feed'); $event.stopPropagation()">
        -->


        <!--
        <div *ngIf="bottom" class="navbar-fixed-bottom" [class.opened]="opened">
            <div class="container">
                <div class="row">
                    <div (click)="toggleOpened()" class="tools" [class.opened]="opened">
                        <div class="col-xs-6 clickable icon" [class.selected]="opened && visible == 'news-feed'" 
                         (click)="selectTool('news-feed'); $event.stopPropagation()">
                            <svg-inline src="/assets/icons/News_Feed.svg"></svg-inline><div class="tool-text">News feed</div>
                        </div>
                        <div class="col-xs-6 clickable icon" [class.selected]="opened && visible == 'my-tools'" 
                         (click)="selectTool('my-tools'); $event.stopPropagation()">
                            <svg-inline src="/assets/icons/My_tools.svg"></svg-inline><div class="tool-text">My tools</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div *ngIf="opened" class="sidebar">
            <div *ngIf="visible == 'news-feed'">
                <div class="top-buttons border-bottom">
                    <svg-inline (click)="newsTab = 'twitter'" [class.selected]="newsTab == 'twitter'" class="sidebar-icon clickable" src="/assets/icons/Twitter.svg"></svg-inline>
                    <svg-inline (click)="newsTab = 'facebook'" [class.selected]="newsTab == 'facebook'" class="sidebar-icon clickable" src="/assets/icons/facebook.svg"></svg-inline>
                </div>
                <div class="scrollable">
                    <div class="information">
                        <h2>Coming soon: Trending posts from Twitter and Facebook</h2>
                    </div>
                    <div class="news-post">
                    </div>
                </div>
            </div>
            <div *ngIf="visible == 'my-tools'">
                <div class="top-buttons border-bottom">
                    <svg-inline (click)="toolTab = 'pdf'" [class.selected]="toolTab == 'pdf'" class="sidebar-icon clickable" src="/assets/icons/pdf.svg"></svg-inline>
                    <svg-inline (click)="toolTab = 'email'" [class.selected]="toolTab == 'email'" class="sidebar-icon clickable" src="/assets/icons/email.svg"></svg-inline>
                </div>
                <div class="scrollable">
                    <div class="downloaders">
                        <div *ngIf="toolTab == 'pdf'"><h2>Coming Soon: Download a PDF of these modules</h2></div>
                        <div *ngIf="toolTab == 'email'"><h2>Coming Soon: Have these modules emailed to you</h2></div>
                    </div>
                    <div *ngIf="!getSavedModules().length" class="information">
                        <p>You can save your go-to modules here, so that next time you access the toolbox you don’t need to go searching for them all over again!</p>
                        <p>Click on the <svg-inline src="/assets/icons/+_tileandmodule.svg"></svg-inline> of a module to save it here. You don’t need to login, we’ll remember the next time you visit the site from the same device and keep your modules in store.</p>
                    </div>
                    <div *ngFor="let module of getSavedModules(); let first = first" class="saved-module" [ngClass]="{first: first}">
                        <div (click)="router.navigate(['/module', module.slug]); toggleOpened()" class="module-title clickable">{{ module.title }}</div>
                        <div class="module-snapshot" [innerHTML]="module.snapshot"></div>
                        <div class="row">
                            <div (click)="savingService.toggleSaved(module)" class="col-sm-6 module-unsave clickable"><svg-inline src="/assets/icons/Remove.svg"></svg-inline> Remove</div>
                            <div class="col-sm-6 module-share clickable"><svg-inline src="/assets/icons/Share_not_in_module.svg"></svg-inline> Share</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        -->
    `,
    directives: [
        APP_DIRECTIVES,
        ROUTER_DIRECTIVES
    ]
})
export class ToolsComponent {
    @Input() modulesBySlug;
    @Input() opened;
    @Output() open = new EventEmitter();
    @Output() close = new EventEmitter();
    _ = _;
    visible = 'my-tools';
    newsTab = 'twitter';
    toolTab = 'pdf';

    bottom = true;

    constructor(
        private router: Router,
        private savingService: ModuleSavingService) { 
    }
    toggleOpened() {
        this.opened ? this.close.next() : this.open.next();
        this.opened = !this.opened;
    }
    selectTool(tool) {
        if (!(this.opened && tool != this.visible)) this.toggleOpened();
        this.visible = tool;
    }
    getSavedModules() {
        return _.filter(_.map(this.savingService.savedModules.sort(), (slug) => this.modulesBySlug[slug]));
    }
}


@Component({
    selector: 'beautiful-rising',
    template: `
            <div class="background" data-background="true" (click)="closeToolsOnBackgroundClick($event)" 
             [ngStyle]="{'direction': contentService.language==='ar' ? 'rtl' : 'ltr'}">
                <modal></modal>
                <div id="fixed-nav" class="fixed-container-wrapper">
                    <div class="container" data-background="true">
                        <div class="language-selection">
                            <span *ngFor="let lang of languages" (click)="language=lang" [class.selected]="language===lang">{{ lang|uppercase }}</span>
                        </div>
                        <menu [textBySlug]="textBySlug"></menu>
                        <a [routerLink]="['']">
                            <img class="logo" src="/assets/icons/logo.png">
                        </a>
                    </div><!-- .container -->
                </div>
                <tools class="bottom" [modulesBySlug]="modulesBySlug" [opened]="toolsOpened" 
                 (open)="toolsOpened = true" (close)="toolsOpened = false"></tools>
                <div class="content-area" (window:resize)="setToolsOffset()" [ngStyle]="{'right': toolsOpened ? toolsOffset : '0'}">
                    <router-outlet></router-outlet>
                    <div class="container">
                        <div class="row">
                            <div class="footer">
                                <div class="col-md-8 col-md-offset-2">
                                    <img src="/assets/icons/Creative_Commons.svg">
                                    <p>Beautiful Rising by Beautiful Rising, various authors is licensed under a Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported License. Permissions beyond the scope of this license may be available at beautifulrising.org.</p>
                                </div>
                            </div>
                        </div>
                    </div><!-- .container -->
                </div>
            </div>
    `,
    directives: [
        APP_DIRECTIVES,
        ROUTER_DIRECTIVES,
        ModalComponent,
        MenuComponent,
        ToolsComponent,
    ]
})
export class AppComponent {
    @LocalStorage() language;
    toolsOpened = false;

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
        this.language = this.language || (navigator.languages || ['en'])[0].slice(0,2);
        this.contentService.language = this.language;
        // Get the content
        this.contentService.injectContent(this);
        this.setToolsOffset = _.throttle(this.setToolsOffset, 100);
        this.setToolsOffset();
    }
    setToolsOffset() {
        return;
        // Calculate how much to shift the content-area when the tools panel is expanded
        var toolsRect = document.body.querySelector('.tools').getBoundingClientRect();
        var currentOffset = parseInt(getComputedStyle(document.body.querySelector('.content-area')).right);
        var spaceToRight = document.documentElement.clientWidth - (toolsRect.left + toolsRect.width) - currentOffset;
        this.toolsOffset = Math.max(265 - spaceToRight, 0);
    }
    closeToolsOnBackgroundClick(event) {
        if (event.target.dataset && event.target.dataset.background) this.toolsOpened = false;
    }
}


export const APP_ROUTER_PROVIDERS = [provideRouter([
    {path: '',                      component: GalleryComponent},
    {path: 'search/:query',         component: GalleryComponent},
    {path: 'tag/:tag',              component: GalleryComponent},
    {path: 'type/:type',            component: GalleryComponent},
    {path: 'type/story/:region',    component: GalleryComponent},

    {path: 'module/:slug',          component: DetailComponent},

    //{path: 'about', pathMatch: 'full', redirectTo: '/about/beautiful-rising'},
    {path: 'about',                 component: AboutComponent},
    {path: 'about/:section',        component: AboutComponent},
    {path: 'platforms',             component: PlatformsComponent},
    {path: 'platforms/:section',    component: PlatformsComponent},
    {path: 'resources',             component: ResourcesComponent},
    {path: 'resources/:section',    component: ResourcesComponent},
    {path: 'contribute',            component: ContributeComponent},
    {path: 'contribute/:section',   component: ContributeComponent},
])];


