// Define all site components here.

import {Component, Input, Output, OnInit, EventEmitter} from '@angular/core';
import {HTTP_PROVIDERS} from '@angular/http';

import {CapitalizePipe, SVGIconComponent} from './utilities';
import {ContentService, ClientStorageService, ModuleSavingService, LocalStorage} from './services';

/* 
 * component tree:
 * ===============
 * beautiful-rising (header/footer)
 *      header??
 *      menu??
 *
 *      search
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
                        <svg-icon (click)="viewStyle='grid'" [class.selected]="viewStyle == 'grid'" src="/assets/icons/grid.svg"></svg-icon>
                    </div>
                    <div class="col-xs-6">
                        <svg-icon (click)="viewStyle='list'" [class.selected]="viewStyle == 'list'" src="/assets/icons/list.svg"></svg-icon>
                    </div>
                </div>
                <h3>Sort By</h3>
                <div class="row border-top border-bottom sort-by">
                    <div class="col-xs-6 clickable" (click)="sortKey='title'"
                        [class.selected]="sortKey == 'title'">Alphabetical</div>
                    <div class="col-xs-6 clickable" (click)="sortKey='timestamp'"
                        [class.selected]="sortKey == 'timestamp'">Newest</div>
                </div>
                <h3>Tags</h3>
                <div class="row border-top tag-list">
                    <span *ngFor="let tag of _.keys(modulesByTag).sort(); let last=last">
                        <span class="clickable" (click)="setTag(tag)" [class.selected]="sortTag == tag">{{ tag }}</span><span *ngIf="!last"> / </span>
                    </span>
                </div>
            </div>
            <div class="gallery-list col-md-9">
                <div *ngIf="viewStyle == 'grid'">
                    <div class="col-md-4 gallery-module-grid" *ngFor="let module of filterModules()" (click)="moduleSelect.next(module)">

                        <!-- Rethink the structure of this whole section -->

                        <div class="make-it-square"></div>
                        <div class="module-image" [ngStyle]="{'background-image': 'url(/assets/images/' + module.image + ')'}"></div>
                        <div class="module-overlay"></div>
                        <div class="module-content">
                            <div class="module-hide-on-hover">
                                <div (mouseenter)="crazyHover($event,0,1,0.75)" (mouseleave)="crazyHover($event,1,0,0.5)">
                                    <div [ngClass]="['module-type', module.type]">{{ module.type }}</div>
                                    <div class="module-title">{{ module.title }}</div>
                                </div>
                                <div class="module-save" (click)="savingService.toggleSaved(module)" [ngSwitch]="savingService.isSaved(module)">
                                    <svg-icon class="ignore-click" *ngSwitchWhen="true" src="/assets/icons/-_tileandmodule.svg"></svg-icon>
                                    <svg-icon class="ignore-click" *ngSwitchWhen="false" src="/assets/icons/+_tileandmodule.svg"></svg-icon>
                                </div>
                            </div>
                            <div [ngClass]="['module-snapshot', module.type]" [innerHTML]="module.snapshot"></div>
                        </div>
                    </div>
                </div>
                <div *ngIf="viewStyle == 'list'">
                    <div class="col-md-1"></div>
                    <div class="col-md-11">
                        <div class="row">
                        <div class="gallery-module-list col-sm-6" *ngFor="let module of filterModules()" (click)="moduleSelect.next(module)">
                            <div class="module-content">
                                <div class="module-type-accent"></div>
                                <div [ngClass]="['module-type', module.type]">{{ module.type }}</div>
                                <div class="module-title">{{ module.title }}</div>
                                <div class="module-snapshot" [innerHTML]="module.snapshot"></div>
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
    @Input() modulesByTag;
    @Input() modules;
    @Output() moduleSelect = new EventEmitter();

    _ = _;
    sortKey;
    viewStyle;

    constructor(
        private savingService: ModuleSavingService) { 
    }
    ngOnInit() {
        this.sortKey = this.sortKey || 'title';
        this.viewStyle = this.viewStyle || 'grid';
    }
    setTag(tag) { 
        this.sortTag = this.sortTag == tag ? null : tag; 
    }
    filterModules() {
        // TODO: search
        var modules = this.modules;
        if (this.sortTag) {
            modules = this.modulesByTag[this.sortTag];
        }
        modules = _.sortBy(modules, this.sortKey);
        if (this.sortKey === 'timestamp') {
            modules = _.reverse(modules);
        }
        return modules;
    }
    crazyHover($event,a,b,c) {
        // TODO: think of some other way to structure the html/css!
        // Hover state covers up save button, so jump through some hoops
        var parent = event.target.parentElement
        parent.style.opacity = a;
        parent.nextElementSibling.style.opacity = b;
        parent.parentElement.previousElementSibling.style.opacity = c;
    }
}

@Component({
    selector: 'detail',
    template: `
        <br><button (click)="clear.next()">Gallery</button>
        <h1>{{ module.title }}</h1>
        {{ module.type }}<br>
        {{ module.authors }}<br>
        <img src="/assets/images/{{ module.image }}"><br>
        <div [innerHTML]="module['image-caption']"></div>
        <div [innerHTML]="module.snapshot"></div>
        <h1>Full write up</h1><hr>
        <div *ngIf="module['full-write-up']" [innerHTML]="module['full-write-up']"></div>
        <h1>Why it worked</h1><hr>
        <div *ngIf="module['why-it-worked']" [innerHTML]="module['why-it-worked']"></div>
        <h1>Why it failed</h1><hr>
        <div *ngIf="module['why-it-failed']" [innerHTML]="module['why-it-failed']"></div>
        <h1>Related Theories</h1><hr>
        <div *ngIf="module.theories">{{ module.theories }}</div>
        <h1>Related Tactics</h1><hr>
        <div *ngIf="module.tactics">{{ module.tactics }}</div>
        <h1>Related Principles</h1><hr>
        <div *ngIf="module.principles">{{ module.principles }}</div>
    `,
    styles: []
})
export class DetailComponent {
    @Input() module;
    @Input() modules;
    @Output() clear = new EventEmitter();
    _ = _;
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
    _ = _;
    //@LocalStorage() seenPopup;
    seenPopup;
}


@Component({
    selector: 'beautiful-rising',
    template: `
        <div [ngStyle]="{'direction': language==='ar' ? 'rtl' : 'ltr'}">
            <div class="language-selection">
                <span *ngFor="let lang of languages"
                      (click)="language=lang"
                      [class.selected]="language===lang" 
                      [class.disabled]="offlineMode">{{ lang|uppercase }}</span>
            </div>
            <modal></modal>
            <detail *ngIf="currentModule" 
                    [module]="currentModule"
                    [modules]="modules"
                    (clear)="currentModule = null"></detail>
            <gallery *ngIf="!currentModule" 
                     [modules]="modules" 
                     [modulesByTag]="modulesByTag"
                     (moduleSelect)="currentModule = $event"></gallery>
        </div>
    `,
    directives: [
        ModalComponent,
        GalleryComponent,
        DetailComponent
    ],
    providers: [
        HTTP_PROVIDERS,
        ContentService,
        ClientStorageService,
        ModuleSavingService
    ],
    pipes: [CapitalizePipe]
})
export class AppComponent implements OnInit {
    _ = _;
    currentModule;
    languages = ['ar','es','en'];
    @LocalStorage() _language;
    @LocalStorage() offlineMode;

    constructor(
        private contentService: ContentService,
        private storageService: ClientStorageService) {
    }
    ngOnInit() {
        var userLanguage = this._language || (navigator.languages || ['en'])[0].slice(0,2);
        this.language = _.includes(this.languages, userLanguage) ? userLanguage : 'en'; 
        this.getContent();
    }
    get language() { return this._language }
    set language(language) {
        // Implicitly fetch all content whenever the language is changed
        if (this._language !== language && !this.offlineMode) {
            this._language = language;
            this.getContent();
        }
    }

    @LocalStorage() config;
    @LocalStorage() content;
    @LocalStorage() contentByType;
    @LocalStorage() contentBySlug;
    @LocalStorage() pagesBySlug;
    @LocalStorage() peopleBySlug;
    @LocalStorage() moduleTypes;
    @LocalStorage() modulesByType;
    @LocalStorage() modules;            // useful
    @LocalStorage() modulesBySlug;
    getContent() {
        this.contentService.getContent(this._language)
            .subscribe(content => {
                //console.log('getting content');
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
                this.modulesBySlug = _.keyBy(this.modules, 'slug');
                // Collect all tags
                this.modulesByTag = {};
                for (let module of this.modules) {
                    for (let tag of module['tags'] || []) {
                        this.modulesByTag[tag] = this.modulesByTag[tag] || [];
                        this.modulesByTag[tag].push(module);
                    }
                }
            });
    }
}

