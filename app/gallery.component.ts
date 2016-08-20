
import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Title } from '@angular/platform-browser';

import _ = require('lodash');
import ElasticLunr = require('elasticlunr');

import { ContentService, ModuleSavingService, LocalStorage } from './services';
import { template } from './utilities';


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
    `
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
}
