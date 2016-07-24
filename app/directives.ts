
import { Http } from '@angular/http';
import { Directive, OnInit, Input, Output, EventEmitter, ElementRef, HostBinding, HostListener } from '@angular/core';
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


/* Simple accordion directive which can be "disabled" to lock it in place
 *
 *  <div accordion> <!-- use <div [accordion]="false"> to disable -->
 *      <div class="some-intermediate-structure">
 *          <div accordionToggle>Click here to toggle next sibling</div>
 *          <div>Inner portion to be toggled</div>
 *          ...
 */
@Directive({ selector: '[accordion]' })
export class AccordionDirective {
    @Input('accordion') active;
    els = [];
    add(el) {
        if (this.active !== false) el.hidden = true;
        this.els.push(el);
    }
    remove(el) {
        _.pull(this.els, el);
    }
    toggle(el) {
        if (this.active === false) return;
        var state = el.hidden;
        _.map(this.els, (el) => { el.hidden = true; });
        el.hidden = !state;
    }
}
@Directive({ selector: '[accordionToggle]' })
export class AccordionToggleDirective {
    constructor(
        private el: ElementRef,
        private accordion: AccordionDirective) {
    }
    ngOnInit() {
        this.accordion.add(this.el.nativeElement.nextElementSibling);
    }
    ngOnDestroy() {
        this.accordion.remove(this.el.nativeElement.nextElementSibling);
    }
    @HostListener('click') onClick() {
        this.accordion.toggle(this.el.nativeElement.nextElementSibling);
    }
    @HostBinding('class.expanded') get isExpanded() {
        return !this.el.nativeElement.nextElementSibling.hidden;
    }
}


/* Directive which lazy-loads background images once they've scrolled onscreen
 *
 *  <div lazyBackgroundImages="lazybg">
 *      <div [attr.data-lazybg]="/some/url.png">
 *      ...
 */
@Directive({ selector: '[lazyBackgroundImages]'})
export class LazyBackgroundDirective {
    constructor(
        private el: ElementRef,
        private outside: OutsideAngularService) {
        this.dataName = 'data-' + (el.nativeElement.getAttribute('lazyBackgroundImages') || 'lazy-background');
        this.dataSelector = `[${this.dataName}]`;
    }
    ngOnInit() {
        this.outside.addEventListener(window, 'scroll', this.lazyLoad);
        this.outside.addEventListener(window, 'resize', this.lazyLoad);
    }
    ngOnDestroy() {
        this.outside.removeEventListener(window, 'scroll', this.lazyLoad);
        this.outside.removeEventListener(window, 'resize', this.lazyLoad);
    }
    ngDoCheck() { this.lazyLoad(); }
    lazyLoad = () => {
        let elements = this.el.nativeElement.querySelectorAll(this.dataSelector);
        elements.length || this.ngOnDestroy();
        let threshold = window.innerHeight + 500;
        for (let el of elements) {
            if (el.getBoundingClientRect().top < threshold) {
                el.style.opacity = 1;   // Use CSS3 transition to fade in
                el.style.backgroundImage = `url(${el.getAttribute(this.dataName)})`;
                el.removeAttribute(this.dataName);
            }
        }
    }
}


/* Directive which provides an [innerMarkdown] feature similar to [innerHTML]
 *
 *  <div [innerMarkdown]="variableName">This will be replaced.</div>
 *  <div [innerMarkdown]="'# Bare markdown works too!'"></div>
 */
@Directive({ selector: '[innerMarkdown]' })
export class MarkdownDirective {
    @Input() innerMarkdown;
    constructor(private el: ElementRef, private md: MarkdownService) { }
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
    constructor(
        private outside: OutsideAngularService,
        private router: Router, 
        private route: ActivatedRoute, 
        private el: ElementRef) {
        this.basePath = el.nativeElement.getAttribute('addSectionToRoute') || '/';
        this.thresholdElement = el.nativeElement.getAttribute('thresholdElement');
        this.thresholdOffset = parseInt(el.nativeElement.getAttribute('thresholdOffset') || '0');
    }
    ngOnInit() {
        this.lastSection = null;
        this.sub = this.route.params.subscribe(this.onRoute);
        this.outside.addEventListener(window, 'scroll', this.onScroll);
    }
    ngAfterViewChecked() {
        if (this.lastSection === null) {
            this.onRoute(this.route.snapshot.params);
        }
    }
    ngOnDestroy() {
        this.sub && this.sub.unsubscribe();
        this.outside.removeEventListener(window, 'scroll', this.onScroll);
    }
    getThreshold() {
        if (this.thresholdElement) {
            var tEl = document.querySelector(this.thresholdElement);
            if (tEl) return tEl.getBoundingClientRect().bottom + this.thresholdOffset;
        }
        return this.thresholdOffset;
    }
    onRoute = (params) => {
        // TODO: handle !params.section specially to avoid delay as component is re-loaded
        if (this.reNavigating) return this.reNavigating = false;
        if (params.section) {
            var sectionEl = document.getElementById(params.section);
            if (sectionEl) {
                window.scrollTo(0, sectionEl.offsetTop)
                this.lastSection = params.section;
            }
        }
    }
    onScroll = () => {
        var visibleSection;
        var sections = document.querySelectorAll('section[id]');
        var threshold = this.getThreshold();
        for (let section of sections) { // Find the lowest visible section
            if (section.getBoundingClientRect().top <= threshold) {
                visibleSection = section.id;
            }
        }
        if (visibleSection) {
            if (visibleSection != this.lastSection) {
                this.reNavigating = true;
                this.router.navigate([this.basePath, visibleSection]);
            }
            this.lastSection = visibleSection;
        }
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
                }
            }, hInterval);

        if (wInterval) this.wIntervalId = this.outside.setInterval(() => {
                var wNew = el.nativeElement.clientWidth;
                if (wNew != this.wLast) {
                    this.widthChanged.emit(wNew);
                    this.wLast = wNew;
                    return true; // Force change detection
                }
            }, wInterval);
    }
    ngOnDestroy() {
        this.hIntervalId && clearInterval(this.hIntervalId);
        this.wIntervalId && clearInterval(this.wIntervalId);
    }
}

export var APP_DIRECTIVES = [
    AccordionDirective,
    AccordionToggleDirective,
    InlineSVGDirective,
    MarkdownDirective,
    SectionRouteDirective,
    SizePollingDirective,
    LazyBackgroundDirective
];

