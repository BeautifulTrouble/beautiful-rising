
import { Component, ViewChild, EventEmitter, Output } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';

import _ = require('lodash');

import { ContentService, ModuleSavingService } from './services';
import { template } from './utilities';


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
                                        <div (click)="toolsTab = toolsTab == 'pdf' ? null : 'pdf'; scrollTo(0)" 
                                            [class.active]="toolsTab == 'pdf'" class="button">
                                            <svg-inline src="/assets/icons/pdf.svg"></svg-inline></div>
                                    </div>
                                    <div class="col-md-6 tab email-tab">
                                        <div (click)="toolsTab = toolsTab == 'email' ? null : 'email'; scrollTo(0)" 
                                            [class.active]="toolsTab == 'email'" class="button">
                                            <svg-inline src="/assets/icons/email.svg"></svg-inline></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div #mainPanel *ngIf="isOpen" class="col-md-9 main-panel">
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
                                        <div (click)="router.navigate(['/tool', module.slug])" class="module-title clickable" [ngClass]="module.type">{{ module.title }}</div>
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
    `
})
export class ToolsComponent {
    @Output() offsetchanged = new EventEmitter();
    @ViewChild('master') master;
    @ViewChild('mainPanel') mainPanel;
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
    ngOnDestroy() {
        this.sub && this.sub.unsubscribe();
    }
    open() {
        this.isOpen = true;
        if (this.master) {
            var rect = this.master.nativeElement.getBoundingClientRect();
            var diff = Math.abs(innerWidth - rect.right) - this.marginLeft;
            this.marginLeft = -diff;
            this.offsetchanged.next(diff);
            this.scrollTo(this.position || 0);
        }
        this.sub = this.router.events.subscribe(event => {
            if (event instanceof NavigationEnd) {
                this.sub && this.sub.unsubscribe();
                this.close();
            }
        });
    }
    close() {
        this.isOpen = false;
        this.toolsTab = null;
        this.marginLeft = 0;
        this.offsetchanged.next(0);
        if (this.mainPanel && this.active == 'tools') {
            this.position = this.mainPanel.nativeElement.scrollTop;   
        }
    }
    slide() {
        if (this.iconPanel) {
            var rect = this.iconPanel.nativeElement.getBoundingClientRect();
            if (rect.right <= innerWidth - 10) return;
            this.marginLeft = -rect.width;
            this.offsetchanged.next(rect.width);
        }
    }
    unslide() {
        this.marginLeft = 0;
        this.offsetchanged.next(0);
    }
    scrollTo(y) {
        setTimeout(() => { 
            if (this.mainPanel) this.mainPanel.nativeElement.scrollTop = y;
        });
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

