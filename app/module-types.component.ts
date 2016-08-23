
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Router } from '@angular/router';

import _ = require('lodash');

import { ContentService } from './services';


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
                                            <h3>{{ textBySlug.ui.types[each[1]] }}</h3>
                                            <svg-inline class="tworows pattern" src="/assets/patterns/2rows/{{ each[0] }}.svg"></svg-inline>
                                        </div>
                                        <div *ngIf="expanded" class="col-xs-6 col-sm-3"><p class="definition" [innerHTML]="textBySlug.ui.definitions[each[0] + '-short']"></p></div>
                                        <div *ngIf="expanded" class="clearfix"></div>
                                    </div>
                                    <div *ngIf="!first" class="hidden-xs type-representation" [class.expanded]="expanded">
                                        <div [ngClass]="[expanded ? 'col-sm-3' : 'col-sm-2']">
                                            <h3>{{ textBySlug.ui.types[each[1]] }}</h3>
                                            <svg-inline class="tworows pattern" src="/assets/patterns/2rows/{{ each[0] }}.svg"></svg-inline>
                                            <p *ngIf="expanded" class="definition" [innerHTML]="textBySlug.ui.definitions[each[0] + '-short']"></p>
                                        </div>
                                    </div>

                                    <!-- smaller -->
                                    <div class="visible-xs type-representation" [class.expanded]="expanded" [class.clearfix]="true">
                                        <div [ngClass]="[expanded ? 'col-xs-5 col-xs-offset-1' : 'col-xs-5 col-xs-offset-1']">
                                            <h3>{{ textBySlug.ui.types[each[1]] }}</h3>
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
                            <a class="expanded type-link" [routerLink]="['/']">{{ textBySlug.ui.types.all }}</a>
                            <a *ngFor="let each of types" [routerLink]="['/type', each[0]]" [class.selected]="each[0] == type" class="expanded type-link">{{ textBySlug.ui.types[each[1]] }}</a>
                        </div>
                        <div class="hidden-xs col-sm-2 col-md-3 col-lg-4 type-pattern">
                            <div *ngFor="let each of types" class="expanded">
                                <div *ngIf="each[0] == type">
                                    <h3>{{ textBySlug.ui.types[each[1]] }}</h3>
                                    <svg-inline class="pattern" src="/assets/patterns/3rows/{{ each[0] }}.svg"></svg-inline>
                                </div>
                            </div>
                        </div>
                        <div class="col-xs-12 col-sm-7 col-md-7 col-lg-6 type-description">
                            <div [innerHtml]="textBySlug.ui.definitions[type]"></div>
                            <div *ngIf="type == 'story'" class="expanded regions">
                                <h3>Region</h3>
                                <span *ngFor="let each of ['africa','latin-america-and-the-caribbean','north-america','asia','europe','middle-east','oceania']">
                                    <svg-inline *ngIf="region == each" [routerLink]="['/type/story']" [ngClass]="regionHasModules(each) ? 'clickable' : 'disabled'" class="selected" src="/assets/img/{{ each }}.svg"></svg-inline>
                                    <svg-inline *ngIf="region != each" [routerLink]="['/type/story', each]" [ngClass]="regionHasModules(each) ? 'clickable' : 'disabled'" src="/assets/img/{{ each }}.svg"></svg-inline>
                                </span>
                            </div>
                        </div>
                    </div>
                    <div *ngIf="!expanded">
                        <div class="col-md-12 type-list">
                            <a [routerLink]="['/']" class="type-link">{{ textBySlug.ui.types.all }}</a>
                            <a *ngFor="let each of types" class="type-link"
                             [routerLink]="['/type', each[0]]" [class.selected]="each[0] == type" [class.h3]="each[0] == type">{{ textBySlug.ui.types[each[1]] }}</a>
                            <div *ngIf="type == 'story'" class="regions">
                                <span *ngFor="let each of ['africa','latin-america-and-the-caribbean','north-america','asia','europe','middle-east','oceania']">
                                    <svg-inline *ngIf="region == each" [routerLink]="['/type/story']" [ngClass]="regionHasModules(each) ? 'clickable' : 'disabled'" class="selected" src="/assets/img/{{ each }}.svg"></svg-inline>
                                    <svg-inline *ngIf="region != each" [routerLink]="['/type/story', each]" [ngClass]="regionHasModules(each) ? 'clickable' : 'disabled'" src="/assets/img/{{ each }}.svg"></svg-inline>
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
                <svg-inline *ngIf="!expanded || overrideExpanded" (click)="expanded = overrideExpanded = !expanded" 
                 class="hidden-xs arrow clickable" [class.selected]="expanded" src="/assets/img/arrow.svg"></svg-inline>
            </div>
        </div>
    `
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

