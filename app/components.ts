// Define all site components here.

import {Component, Input, Output, OnInit, EventEmitter} from '@angular/core';
import {BrowserDomAdapter} from '@angular/platform-browser/src/browser_common';
import {HTTP_PROVIDERS} from '@angular/http';

import {CapitalizePipe, SVGIconComponent} from './utilities';
import {ContentService, ClientStorageService, ModuleSavingService, LocalStorage} from './services';

import ElasticLunr from 'elasticlunr';
import MarkdownIt from 'markdown-it';
import markdownitFootnote from 'markdown-it-footnote';


/* 
 * component tree:
 * ===============
 * beautiful-rising (header/footer)
 *      header??
 *      menu??
 *
 *      search x
 *      modal
 *      sharebar
 *      gallery
 */

@Component({
    selector: 'gallery',
    template: `
        <div class="row">
            <div class="gallery-sort col-md-3">
                <h3>View As</h3>
                <div class="row border-top border-bottom view-as">
                    <div class="col-xs-6">
                        <svg-inline (click)="viewStyle='grid'" [class.selected]="!query && viewStyle == 'grid'" src="/assets/icons/grid.svg"></svg-inline>
                    </div>
                    <div class="col-xs-6">
                        <svg-inline (click)="viewStyle='list'" [class.selected]="query || viewStyle == 'list'" src="/assets/icons/list.svg"></svg-inline>
                    </div>
                </div>
                <h3>Sort By</h3>
                <div class="row border-top border-bottom sort-by">
                    <div (click)="sortKey='title'" [class.selected]="sortKey == 'title'" class="col-xs-6 clickable">Alphabetical</div>
                    <div (click)="sortKey='timestamp'" [class.selected]="sortKey == 'timestamp'" class="col-xs-6 clickable">Newest</div>
                </div>
                <h3>Tags</h3>
                <div class="row border-top tag-list">
                    <span *ngFor="let tag of tags; let last=last">
                        <span (click)="toggleTag(tag)" [class.selected]="!query && sortTag == tag" class="clickable">{{ tag }}</span><span *ngIf="!last"> / </span>
                    </span>
                </div>
            </div>
            <div class="gallery-list col-md-9">
                <div *ngIf="!query && viewStyle == 'grid'" class="row">
                    <div *ngFor="let module of sortModules()" (click)="moduleSelect.next(module)" class="col-md-4 gallery-module-grid">
                        <!-- Rethink the structure of this whole section -->

                        <div class="make-it-square"></div>
                        <div class="module-image" [ngStyle]="{'background-image': 'url(' + config['asset-path'] + '/' + module.image + ')'}"></div>
                        <div class="module-overlay"></div>
                        <div class="module-content">
                            <div class="module-hide-on-hover">
                                <div (mouseenter)="crazyHover($event,0,1,0.75)" (mouseleave)="crazyHover($event,1,0,0.5)">
                                    <div [ngClass]="['module-type', module.type]">{{ module.type }}</div>
                                    <div class="module-title">{{ module.title }}</div>
                                </div>
                                <div (click)="savingService.toggleSaved(module)" [ngSwitch]="savingService.isSaved(module)" class="module-save">
                                    <svg-inline *ngSwitchWhen="true" src="/assets/icons/-_tileandmodule.svg"></svg-inline>
                                    <svg-inline *ngSwitchWhen="false" src="/assets/icons/+_tileandmodule.svg"></svg-inline>
                                </div>
                            </div>
                            <div [ngClass]="['module-snapshot', module.type]" [innerHTML]="module.snapshot"></div>
                        </div>
                        
                        <!-- ... -->
                    </div>
                </div>
                <div *ngIf="query || viewStyle == 'list'">
                    <div class="col-md-1"></div>
                    <div class="col-md-11">
                        <div class="row">
                            <div *ngIf="query" class="gallery-search-info gray col-sm-12">
                                <span (click)="clearSearch()" class="gallery-search-clear clickable"><span class="gallery-search-icon">&#9746;</span> Clear</span>
                                <span>Search Results for "{{ query }}" ({{ modulesFiltered.length }} results found)</span>
                            </div>
                            <div *ngFor="let module of sortModules()" (click)="moduleSelect.next(module)" class="gallery-module-list col-sm-6">
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
    `,
    directives: [
        SVGIconComponent
    ],
    styles: []
})
export class GalleryComponent implements OnInit {
    @Input() config;
    @Input() modules;
    @Input() modulesByTag;
    @Input() modulesBySlug;
    @Input() modulesFiltered;
    @Input() query;
    @Input() tags;
    @Output() moduleSelect = new EventEmitter();
    @Output() search = new EventEmitter();
    _ = _;
    @LocalStorage() sortKey;
    @LocalStorage() viewStyle;

    constructor(
        private dom: BrowserDomAdapter,
        private savingService: ModuleSavingService) { 
    }
    ngOnInit() {
        this.sortKey = this.sortKey || 'timestamp';
        this.viewStyle = this.viewStyle || 'grid';
    }
    clearSearch() {
        this.sortTag = null;
        this.search.next('');
    }
    toggleTag(tag) { 
        if (this.query) this.clearSearch();
        this.sortTag = this.sortTag == tag ? null : tag; 
    }
    sortModules() {
        var modules = this.modulesFiltered;
        if (this.query) return modules;
        if (this.sortTag) modules = this.modulesByTag[this.sortTag];
        modules = _.sortBy(modules, this.sortKey);
        if (this.sortKey === 'timestamp') modules = _.reverse(modules);
        return modules;
    }
    crazyHover($event,a,b,c) {
        // TODO: think of some other way to structure the html/css!
        // Hover state covers up save button, so jump through some hoops
        var parent = $event.target.parentElement
        parent.style.opacity = a;
        parent.nextElementSibling.style.opacity = b;
        parent.parentElement.previousElementSibling.style.opacity = c;
    }
}

@Component({
    selector: 'detail',
    template: `
        <div [ngClass]="['row', 'type-' + module.type]">
            <div class="col-sm-12">
                <div class="module-image" [ngStyle]="{'background-image': 'url(' + config['asset-path'] + '/' + module.image + ')'}">
                    <div class="overlay"></div>
                    <div class="module-header">
                        <div [ngClass]="['module-type', module.type]">{{ module.type }}</div>
                        <div class="module-title">{{ module.title }}</div>
                        <div (click)="savingService.toggleSaved(module)" [ngSwitch]="savingService.isSaved(module)" class="module-save clickable">
                            <div *ngSwitchWhen="true"><svg-inline src="/assets/icons/-_tileandmodule.svg"></svg-inline>Remove this module from your tools</div>
                            <div *ngSwitchWhen="false"><svg-inline src="/assets/icons/+_tileandmodule.svg"></svg-inline>Save this module</div>
                        </div><br>
                        <div class="module-share clickable"><svg-inline src="/assets/icons/share_in_module.svg"></svg-inline>Share this module</div>
                    </div>
                    <div class="module-image-caption" [innerHTML]="module['image-caption']"></div>
                </div>
            </div>
        </div>
        <div [ngClass]="['row', 'type-' + module.type]">
            <div class="col-xs-6 col-md-2 left-side">
                <h3 class="border-bottom bigger">Contributed by</h3>
                <div *ngFor="let author of authors">
                    <img *ngIf="author.image" class="contributor-image" src="{{ config['asset-path'] }}/{{ author.image }}">
                    <h4>{{ author.title }}</h4>
                    <p *ngIf="author.bio" [innerHTML]="author.bio"></p>
                    <p *ngIf="!author.bio && author['team-bio']" [innerHTML]="author['team-bio']"></p>
                </div>
                <div *ngIf="!authors.length">
                    <img class="contributor-image" src="/assets/icons/anon.png">
                    <h4>It could be you</h4>
                </div>
                <div *ngIf="module.tags">
                    <h3 class="border-bottom">Tags</h3>
                    <span *ngFor="let tag of module.tags; let last=last">
                        <span (click)="toggleTag(tag)" class="clickable">{{ tag }}</span><span *ngIf="!last"> / </span>
                    </span>
                </div>
            </div>
            <div class="hidden-xs hidden-sm col-md-1 spacer">&nbsp;</div>
            <div class="col-md-5 content">
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
                        <div *ngFor="let epigraph of epigraphs" class="epigraphs">
                            <div class="epigraph">{{ epigraph[0] }}</div>
                            <div class="attribution">&mdash;{{ epigraph[1] }}</div>
                        </div>
                        <div *ngIf="!gallery" [innerHTML]="module['full-write-up']">
                        </div>
                        <div *ngIf="gallery">
                            gallery
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
                    <div *ngFor="let type of [['key-tactics', 'tactic', 'tactics'], 
                                              ['key-principles', 'principle', 'principles'], 
                                              ['key-theories', 'theory', 'theories']]">
                        <div *ngIf="module[type[0]]">
                            <div *ngFor="let each of getKeyModules(type[0]); let first=first; let last=last;">
                                <div *ngIf="first && last" [ngClass]="['module-type', type[1]]">key {{ type[1] }}</div><!-- first && last meaning length == 1 -->
                                <div *ngIf="first && !last" [ngClass]="['module-type', type[1]]">key {{ type[2] }}</div><!-- first && !last meaning length > 1 -->
                                <h3>{{ each[0] }}</h3><p [innerHTML]="each[1]"></p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-md-4 right-side">
                <div *ngIf="module['potential-risks']" (click)="riskCollapsed = !riskCollapsed" [ngClass]="{'risks':true, 'clickable': module['potential-risks-short']}">
                    <div class="heading">
                        <svg-inline src="/assets/icons/pr.svg" [ngClass]="'type-' + module.type"></svg-inline>
                        <h3 class="bigger">Potential risks</h3>
                        <svg-inline *ngIf="module['potential-risks-short']" [ngClass]="{'arrow':true, 'selected':!riskCollapsed}" src="/assets/icons/arrow.svg"></svg-inline>
                    </div>
                    <div *ngIf="riskCollapsed && module['potential-risks-short']" [innerHTML]="module['potential-risks-short']"></div>
                    <div *ngIf="riskCollapsed && !module['potential-risks-short']" [innerHTML]="module['potential-risks']"></div>
                    <div *ngIf="!riskCollapsed" [innerHTML]="module['potential-risks']"></div>
                </div>
                <div *ngIf="tactics.length || principles.length || theories.length" class="related">
                    <h3 class="bigger">Related Modules</h3>
                    <div *ngIf="tactics.length">
                        <h3 class="indent">Tactics</h3>
                        <ul><li *ngFor="let m of tactics"><span class="tactic clickable">{{ m.title }}</span></li></ul>
                    </div>
                    <div *ngIf="principles.length">
                        <h3 class="indent">Principles</h3>
                        <ul><li *ngFor="let m of principles"><span class="principle clickable">{{ m.title }}</span></li></ul>
                    </div>
                    <div *ngIf="theories.length">
                        <h3 class="indent">Theories</h3>
                        <ul><li *ngFor="let m of theories"><span class="theory clickable">{{ m.title }}</span></li></ul>
                    </div>
                </div>
            </div>
        </div>
    `,
    directives: [
        SVGIconComponent
    ],
    styles: []
})
export class DetailComponent implements OnInit {
    @Input() config;
    @Input() module;
    @Input() modulesBySlug;
    @Input() peopleBySlug;
    _ = _;

    constructor(
        private savingService: ModuleSavingService) { 
    }
    ngOnInit() {
        // HACK: Fix a few accidental snapshots
        if (/In a page .500 words. or less/.test(this.module['full-write-up'])) delete this.module['full-write-up'];

        this.collapsed = true;
        this.riskCollapsed = true;
        this.authors = _.filter(_.map((this.module.authors || []).sort(), (author) => this.peopleBySlug[author]));
        this.snapshot = this.authors.length == 0 || (!this.module['full-write-up'] && !this.module['short-write-up'])
        this.gallery = !this.module['full-write-up'] && this.module['short-write-up']
        this.epigraphs = _.map(this.module.epigraphs || [], (text) => text.split(/\s+[—]([^\s].+)/, 2));
        this.tactics = this.getRelatedModules('tactics');
        this.principles = this.getRelatedModules('principles');
        this.theories = this.getRelatedModules('theories');
    }
    getKeyModules(type) { // Returns [['title','text'], ['title','text'], ...] for the given 'key-whatever' type
        return _.map(this.module[type], (text) => [text.split(/\s+[-]\s+/, 1)[0], text.replace(/^.+\s+[-]\s+/, '')]);
    }
    getRelatedModules(type) {
        return _.filter(_.map(this.module[type] || [], (slug) => this.modulesBySlug[slug]));
    }
}


@Component({
    selector: 'modal',
    template: `
        <div *ngIf="!seenPopup" class="modal-window row" style="border: 2px dotted gray; padding: 20px;">
            <h1>Popup Window</h1>
            <h4>(it won't look like this)</h4>
            <button (click)="seenPopup = true">I've seen it</button>
        </div>
    `,
    styles: []
})
export class ModalComponent {
    @Input() config;
    _ = _;
    //@LocalStorage() seenPopup;
    seenPopup;
}


@Component({
    selector: 'search',
    template: `
        <div class="row">
            <input [(ngModel)]="query" (ngModelChange)="search.next($event)" id="search-box" 
                placeholder="Search for keywords, ex: legislation, state repression, etc..." autofocus>
        </div>
    `
})
export class SearchComponent {
    @Input() query;
    @Output() search = new EventEmitter();
}


@Component({
    selector: 'menu',
    template: `
        <div (click)="visible = !visible" class="hamburger-menu-icon clickable">
            <svg-inline src="/assets/icons/hamburger.svg"></svg-inline>
            <h4>Menu</h4>
        </div>
        <div *ngIf="visible" class="hamburger-menu">
            <div class="overlay"></div>
            <h1 (click)="visible = !visible">x</h1>
        </div>
    `,
    directives: [
        SVGIconComponent
    ]
})
export class MenuComponent {
}


@Component({
    selector: 'tools',
    template: `
        <div *ngIf="opened" class="sidebar">
            <div *ngIf="visible == 'news-feed'">
                <div class="border-bottom">
                    <svg-inline (click)="newsTab = 'twitter'" [class.selected]="newsTab == 'twitter'" class="sidebar-icon clickable" src="/assets/icons/Twitter.svg"></svg-inline>
                    <svg-inline (click)="newsTab = 'facebook'" [class.selected]="newsTab == 'facebook'" class="sidebar-icon clickable" src="/assets/icons/facebook.svg"></svg-inline>
                </div>
                <div class="news-feed">
                    <h2>Coming soon: Trending posts from Twitter and Facebook</h2>
                </div>
            </div>
            <div *ngIf="visible == 'my-tools'">
                <div class="border-bottom">
                    <svg-inline (click)="toolTab = 'pdf'" [class.selected]="toolTab == 'pdf'" class="sidebar-icon clickable fix-icon" src="/assets/icons/PDF.svg"></svg-inline>
                    <svg-inline (click)="toolTab = 'email'" [class.selected]="toolTab == 'email'" class="sidebar-icon clickable" src="/assets/icons/Email.svg"></svg-inline>
                </div>
                <div class="downloaders">
                    <div *ngIf="toolTab == 'pdf'"><h2>Coming Soon: Download a PDF of these modules</h2></div>
                    <div *ngIf="toolTab == 'email'"><h2>Coming Soon: Have these modules emailed to you</h2></div>
                </div>
                <div *ngIf="!getSavedModules().length" class="information">
                    <p>You can save your go-to modules here, so that next time you access the toolbox you don’t need to go searching for them all over again!</p>
                    <p>Click on the <svg-inline src="/assets/icons/+_tileandmodule.svg"></svg-inline> of a module to save it here. You don’t need to login, we’ll remember the next time you visit the site from the same device and keep your modules in store.</p>
                </div>
                <div *ngFor="let module of getSavedModules(); let first = first" class="saved-module" [ngClass]="{'first': first}">
                    <div class="module-title">{{ module.title }}</div>
                    <div class="module-snapshot" [innerHTML]="module.snapshot"></div>
                    <div class="row">
                        <div (click)="savingService.toggleSaved(module)" class="col-sm-6 module-unsave clickable"><svg-inline src="/assets/icons/Remove.svg"></svg-inline> Remove</div>
                        <div (click)="window.alert('Coming soon')" class="col-sm-6 module-share clickable"><svg-inline src="/assets/icons/Share_not_in_module.svg"></svg-inline> Share</div>
                    </div>
                </div>
            </div>
        </div>
        <div class="tools" [class.opened]="opened">
            <svg-inline class="clickable tools-toggle" (click)="toggleTools()" src="/assets/icons/arrow.svg"></svg-inline>
            <div class="clickable news-feed-icon" [class.selected]="opened && visible == 'news-feed'" (click)="selectTool('news-feed')">
                <svg-inline src="/assets/icons/News_Feed.svg"></svg-inline>
                <div class="tool-text">News feed</div>
            </div>
            <div class="clickable my-tools-icon" [class.selected]="opened && visible == 'my-tools'" (click)="selectTool('my-tools')">
                <svg-inline src="/assets/icons/My_tools.svg"></svg-inline>
                <div class="tool-text">My tools</div>
            </div>
        </div>
    `,
    directives: [
        SVGIconComponent
    ]
})
export class ToolsComponent {
    @Input() modulesBySlug;
    @Output() open = new EventEmitter();
    @Output() close = new EventEmitter();
    _ = _;
    opened = false;
    visible = 'my-tools';
    newsTab = 'twitter';
    toolTab = 'pdf';

    constructor(
        private savingService: ModuleSavingService) { 
    }
    toggleTools() {
        (this.opened ? this.close : this.open).next()
        this.opened = !this.opened;
    }
    selectTool(tool) {
        if (!(this.opened && tool != this.visible)) this.toggleTools();
        this.visible = tool;
    }
    getSavedModules() {
        return _.filter(_.map(this.savingService.savedModules.sort(), (slug) => this.modulesBySlug[slug]));
    }
}


@Component({
    selector: 'beautiful-rising',
    template: `
        <div [ngStyle]="{'direction': language==='ar' ? 'rtl' : 'ltr'}">
            <div class="language-selection">
                <span *ngFor="let lang of languages"
                    (click)="language=lang"
                    [class.selected]="language===lang">{{ lang|uppercase }}</span>
            </div>
            <!-- <modal></modal> -->
            <menu></menu>
            <img (click)="currentModule = null" class="logo" src="/assets/icons/logo.png">
            <div class="contentarea" (window:resize)="setToolsOffset()" [ngStyle]="{'right': opened ? toolsOffset : '0'}">
                <tools (open)="opened = true" (close)="opened = false"
                    [modulesBySlug]="modulesBySlug"></tools>
                <search *ngIf="!currentModule" [query]="query" (search)="doSearch($event)"></search>
                <detail *ngIf="currentModule" 
                    [config]="config"
                    [module]="currentModule"
                    [modulesBySlug]="modulesBySlug"
                    [peopleBySlug]="peopleBySlug"></detail>
                <gallery *ngIf="!currentModule"
                    [config]="config"
                    [modules]="modules" 
                    [modulesByTag]="modulesByTag"
                    [modulesBySlug]="modulesBySlug"
                    [modulesFiltered]="modulesFiltered" 
                    [query]="query"
                    [tags]="tags"
                    (moduleSelect)="currentModule = $event"
                    (search)="doSearch($event)"></gallery>
                <div class="footer row">
                    <div class="col-md-2"></div>
                    <div class="col-md-8">
                        <img src="/assets/icons/Creative_Commons.svg">
                        <p>Beautiful Rising by Beautiful Rising, various authors is licensed under a Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported License. Permissions beyond the scope of this license may be available at beautifulrising.org.</p>
                    </div>
                    <div class="col-md-2"></div>
                </div>
            </div>
        </div>
    `,
    directives: [
        ModalComponent,
        MenuComponent,
        ToolsComponent,
        SearchComponent,
        GalleryComponent,
        DetailComponent
    ],
    providers: [
        HTTP_PROVIDERS,
        BrowserDomAdapter,
        ContentService,
        ClientStorageService,
        ModuleSavingService,
    ],
    pipes: [CapitalizePipe]
})
export class AppComponent implements OnInit {
    _ = _;
    currentModule;
    modulesFiltered;
    offset = '0';
    opened = false;
    languages = ['ar','es','en'];
    @LocalStorage() _language;

    constructor(
        private dom: BrowserDomAdapter,
        private contentService: ContentService,
        private storageService: ClientStorageService) {
        this.doSearch = _.throttle(this.doSearch, 100);
        this.setToolsOffset = _.throttle(this.setToolsOffset, 100);
    }
    ngOnInit() {
        var userLanguage = this._language || (navigator.languages || ['en'])[0].slice(0,2);
        this.language = _.includes(this.languages, userLanguage) ? userLanguage : 'en'; 
        this.getContent();
        this.setToolsOffset();
    }
    get language() { return this._language }
    set language(language) {
        // Implicitly fetch all content whenever the language is changed
        if (this._language !== language) {
            this._language = language;
            this.getContent();
        }
    }
    doSearch(query) {
        this.query = query;
        if (query) {
            var results = this.index.search(query, {boolean: /\s/.test(query) ? 'AND' : 'OR', expand: true});
            this.modulesFiltered = _.map(results, obj => this.modulesBySlug[obj.ref]);
        } else {
            this.modulesFiltered = this.modules;
        }
    }
    setToolsOffset() {
        // Calculate how much to shift the contentarea when the tools panel is expanded
        var toolsRect = this.dom.query('.tools').getBoundingClientRect();
        var currentOffset = getComputedStyle(this.dom.query('.contentarea')).right.slice(0,-2);
        var spaceToRight = document.documentElement.clientWidth - (toolsRect.left + toolsRect.width) - currentOffset;
        this.toolsOffset = Math.max(265 - spaceToRight, 0);
    }

    config;
    content;
    contentByType;
    contentBySlug;
    pagesBySlug;
    peopleBySlug;
    moduleTypes;
    modulesByType;
    modules;
    modulesBySlug;
    getContent() {
        this.contentService.getContent(this._language, content => {
            this.config = _.find(content, {'type': 'config', 'slug': 'api'});
            this.content = content;
            // Bundle content into types
            this.contentByType = _.groupBy(content, 'type');
            // Mappings by slug are useful for grabbing related content
            this.contentBySlug = _.keyBy(content, 'slug');
            this.pagesBySlug = _.keyBy(this.contentByType.page, 'slug');
            this.peopleBySlug = _.keyBy(this.contentByType.person, 'slug');
            // Prepare a few useful representations of modules
            this.moduleTypes = _.map(this.config['types-modules'], t => t.one);
            this.modulesByType = _.pick(this.contentByType, this.moduleTypes);
            this.modules = _.flatten(_.values(this.modulesByType));
            this.modulesFiltered = this.modules;
            this.modulesBySlug = _.keyBy(this.modules, 'slug');
            // Collect all tags
            this.modulesByTag = {};
            for (let module of this.modules) {
                for (let tag of module['tags'] || []) {
                    this.modulesByTag[tag] = this.modulesByTag[tag] || [];
                    this.modulesByTag[tag].push(module);
                }
            }
            this.tags = _.keys(this.modulesByTag).sort();
            // Prepare truncated version of potential-risks before rendering as markdown
            this.config.markdown.push('potential-risks-short');
            for (let module of this.modules) {
                if (module['potential-risks'] && module['potential-risks'].length > 470) {
                    module['potential-risks-short'] = _.truncate(module['potential-risks'], {length: 470, separator: /\s+ /});
                }
            }
            // Render markdown
            var md = new MarkdownIt().use(markdownitFootnote);
            for (let collection of [this.contentByType.person, this.modules]) {
                for (let module of collection) {
                    for (let field of this.config.markdown) {
                        if (module[field]) {
                            module[field] = module[field] instanceof Array
                                ? module[field] = module[field].forEach(i => md.render(i))
                                : module[field] = md.render(module[field]);
                        }
                    }
                }
            }
            // Insert pull-quotes

            // Prepare search engine
            this.index = ElasticLunr();
            this.config.search.forEach(field => this.index.addField(field));
            this.index.setRef('slug');
            this.modules.forEach(module => this.index.addDoc(module));
            
            //this.currentModule = this.modulesBySlug['jail-solidarity'];
            //this.currentModule = this.modulesBySlug['fail-forward'];
            this.currentModule = this.modulesBySlug['sign-language-sit-in'];
        });
    }
}

