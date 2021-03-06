
import { Component, ViewChild, EventEmitter, Output } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';

import * as _ from 'lodash';

import { ContentService, ModuleSavingService } from './services';
import { template } from './utilities';


@Component({
    selector: 'tools',
    template: `
        <div class="container visible-md visible-lg">
                <div #master class="master col-xs-12 col-md-5 col-lg-4" [style.margin-left.px]="marginLeft" (mouseenter)="!isOpen && slide()" (mouseleave)="!isOpen && unslide()">
                    <div #iconPanel class="col-md-3 icon-panel" (click)="isOpen ? close() : open()">
                        <div class="arrow" [class.active]="isOpen">
                            <div class="button"><svg-inline src="/assets/img/arrow.svg"></svg-inline></div>
                        </div>
                        <div (click)="activateToggle('news'); $event.stopPropagation()" class="news-icon" [class.active]="isOpen && active == 'news'">
                            <div class="button">
                                <svg-inline src="/assets/img/News_Feed.svg"></svg-inline>
                                <div *ngIf="ready" class="title">{{ textBySlug.ui.sidebar.news }}</div>
                            </div>
                        </div>
                        <div (click)="activateToggle('tools'); $event.stopPropagation()" class="tools-icon" [class.active]="isOpen && active == 'tools'">
                            <div class="button" [class.pulse]="firstSave">
                                <svg-inline src="/assets/img/My_tools.svg"></svg-inline>
                                <div *ngIf="ready" class="title">{{ textBySlug.ui.sidebar.tools }}</div>
                            </div>
                        </div>
                    </div>
                    <div *ngIf="isOpen" class="col-md-9 tab-panel">
                        <div class="row">
                            <div class="col-md-12 tabs">
                                <div *ngIf="active == 'news'" class="row">
                                    <div class="col-md-6 tab twitter-tab">
                                        <div (click)="newsTab = 'twitter'" [class.active]="newsTab == 'twitter'" class="button">
                                            <svg-inline src="/assets/img/Twitter.svg"></svg-inline></div>
                                    </div>
                                    <div class="col-md-6 tab facebook-tab">
                                        <div (click)="newsTab = 'facebook'" [class.active]="newsTab == 'facebook'" class="button">
                                            <svg-inline src="/assets/img/facebook.svg"></svg-inline></div>
                                    </div>
                                </div>
                                <div *ngIf="active == 'tools'" class="row">
                                    <div class="col-md-6 tab pdf-tab">
                                        <div (click)="toolsTab = toolsTab == 'pdf' ? null : 'pdf'; scrollTo(0)" 
                                            [class.active]="toolsTab == 'pdf'" class="button">
                                            <svg-inline src="/assets/img/pdf.svg"></svg-inline></div>
                                    </div>
                                    <div class="col-md-6 tab email-tab">
                                        <div (click)="toolsTab = toolsTab == 'email' ? null : 'email'; scrollTo(0)" 
                                            [class.active]="toolsTab == 'email'" class="button">
                                            <svg-inline src="/assets/img/email.svg"></svg-inline></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div #mainPanel *ngIf="ready && isOpen" class="col-md-9 main-panel">
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
                                                <svg-inline src="/assets/img/Remove.svg"></svg-inline>
                                                <span>{{ textBySlug.ui.sidebar.remove }}</span>
                                            </div>
                                            <div class="col-sm-6 module-share clickable">
                                                <svg-inline src="/assets/img/Share_not_in_module.svg"></svg-inline> 
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
    `
})
export class ToolsComponent {
    active = 'tools';
    closeSub;
    firstSaveSub;
    firstSave;
    iconHTML = '<img src="/assets/img/+_intext.svg" width="25px" class="clickable">';
    @ViewChild('iconPanel') iconPanel;
    isOpen = false;
    @ViewChild('mainPanel') mainPanel;
    @ViewChild('master') master;
    marginLeft = 0;
    modulesBySlug;
    newsTab = 'twitter';
    @Output() offsetchanged = new EventEmitter();
    position;
    ready;
    template = template;
    textBySlug;
    toolsTab = null;

    constructor(
        private router: Router,
        private savingService: ModuleSavingService,
        private contentService: ContentService) {
    }
    ngOnInit() {
        this.contentService.injectContent(this);
        this.firstSaveSub = this.savingService.firstSave.subscribe(() => {
            this.active = 'tools';
            this.firstSave = true;
            if (!this.isOpen) {
                this.open();
                setTimeout(() => {
                    this.firstSave = false;
                    if (this.active == 'tools' && this.isOpen) this.close();
                }, 5000);
            }
        });
    }
    ngOnDestroy() {
        this.closeSub && this.closeSub.unsubscribe();
        this.firstSaveSub && this.firstSaveSub.unsubscribe();
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
        this.closeSub && this.closeSub.unsubscribe();
        this.closeSub = this.router.events.subscribe(event => {
            if (event instanceof NavigationEnd) {
                this.closeSub && this.closeSub.unsubscribe();
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
    activateToggle(which) {
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
        return _.filter(_.map(this.savingService.savedModules.sort(), (slug: string) => this.modulesBySlug[slug]));
    }
}

