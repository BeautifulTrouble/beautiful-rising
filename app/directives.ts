
import { Http } from '@angular/http';
import { Directive, OnInit, Input, Output, EventEmitter, ElementRef, HostListener } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import _ = require('lodash');
import MarkdownIt = require('markdown-it');

import { CachedHttpService, OutsideAngularService, MarkdownService } from './services';


// Inline an svg file with <svg-inline src="url"></svg-inline> tags
@Directive({ selector: 'svg-inline' })
export class InlineSVGDirective {
	@Input() src;
    constructor(private el: ElementRef, private cachedHttp: CachedHttpService) { }
    ngOnInit() {
        this.cachedHttp.get(this.src)
            .map(res => res.text())
            .subscribe(data => { this.el.nativeElement.innerHTML = data; });
    }
}


/* Directive which provides an [innerMarkdown] feature similar to [innerHTML]
 *
 *  <div [innerMarkdown]="variableName">This will be replaced.</div>
 */
@Directive({ selector: '[innerMarkdown]' })
export class MarkdownDirective {
    @Input() innerMarkdown;
    constructor(private el: ElementRef, private md: MarkdownService) { }
    ngOnInit() { this.updateContent(); }
    ngOnChanges() { this.updateContent(); }
    updateContent() { this.el.nativeElement.innerHTML = this.md.render(this.innerMarkdown); }
}


/* Directive which sets the route param to a section element's id on scroll
 * and also handles scrolling to that section when the route param changes
 *
 *  <div addSectionToRoute="/basepath" thresholdElement="#fixed-div">
 *      <section id="one"><!-- /basepath/one --></section>
 *      <section id="two"><!-- /basepath/two --></section>
 *      ...
 */
@Directive({ selector: '[addSectionToRoute]' })
export class SectionRouteDirective {
    constructor(private router: Router, private route: ActivatedRoute, private el: ElementRef) {
        this.basePath = el.nativeElement.getAttribute('addSectionToRoute') || '/';
        this.thresholdElement = el.nativeElement.getAttribute('thresholdElement');
        this.thresholdOffset = parseInt(el.nativeElement.getAttribute('thresholdOffset') || '0');
    }
    ngOnInit() {
        this.lastSection = null;
        this.sub = this.route.params.subscribe(params => {
            // TODO: if (!params.section) ...handle the transitional flicker
            if (params.section && params.section != this.lastSection) {
                var sectionEl = document.getElementById(params.section);
                if (sectionEl) {
                    window.scrollTo(0, sectionEl.offsetTop)
                    this.lastSection = params.section;
                }
            }
        });
    }
    ngOnDestroy() {
        this.sub && this.sub.unsubscribe();
    }
    getThreshold() {
        if (this.thresholdElement) {
            var tEl = document.querySelector(this.thresholdElement);
            if (tEl) return tEl.getBoundingClientRect().bottom + this.thresholdOffset;
        }
        return this.thresholdOffset;
    }
    @HostListener('window:scroll', ['$event'])
    onScroll(event) {
        var visibleSection;
        var sections = document.querySelectorAll('section[id]');
        var threshold = this.getThreshold();
        for (let section of sections) { // Find the lowest visible section
            if (section.getBoundingClientRect().top <= threshold) {
                visibleSection = section.id;
            }
        }
        if (visibleSection && visibleSection != this.lastSection) {
            this.router.navigate([this.basePath, visibleSection]);
        }
        this.lastSection = visibleSection;
    }
}


/* Directive which sends (heightChanged) and (widthChanged) events for the given element
 *
 * Example uses w/ & w/o polling interval in milliseconds:
 *  <div heightPolling (heightChanged)="action($event)">
 *  <div heightPolling="100" (heightChanged)="action($event)">
 *  <div widthPolling="100ms" (widthChanged)="action($event)">
 *  <div heightPolling widthPolling="100" (heightChanged)="action($event)" (widthChanged)="action()">
 */
@Directive({ selector: '[heightPolling], [widthPolling]' })
export class SizePollingDirective {
    @Output() heightChanged = new EventEmitter();
    @Output() widthChanged = new EventEmitter();
    defaultInterval = 100;

    constructor(
        private outside: OutsideAngularService,
        private el: ElementRef) {
        var hInterval = el.nativeElement.getAttribute('heightPolling');
        var wInterval = el.nativeElement.getAttribute('widthPolling');
        hInterval = hInterval ? parseInt(hInterval) : hInterval === '' ? this.defaultInterval : null;
        wInterval = wInterval ? parseInt(wInterval) : wInterval === '' ? this.defaultInterval : null;

        // Angular has wrapped every call to setInterval with change detection logic using
        // zone.js, so we run this polling outside of Angular's zone for better performance
        if (hInterval) this.hIntervalId = this.outside.setInterval(() => {
            var hNew = el.nativeElement.clientHeight;
            if (hNew != this.hLast) {
                this.heightChanged.emit(hNew);
                this.hLast = hNew;
                return true; // Force change detection
            }, hInterval);

        if (wInterval) this.wIntervalId = this.outside.setInterval(() => {
            var wNew = el.nativeElement.clientWidth;
            if (wNew != this.wLast) {
                this.widthChanged.emit(wNew);
                this.wLast = wNew;
                return true; // Force change detection
            }, wInterval);
    }
    ngOnDestroy() {
        this.hIntervalId && clearInterval(this.hIntervalId);
        this.wIntervalId && clearInterval(this.wIntervalId);
    }
}

export var APP_DIRECTIVES = [
    InlineSVGDirective,
    MarkdownDirective,
    SectionRouteDirective,
    SizePollingDirective,
];
