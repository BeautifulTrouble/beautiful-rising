
import { Http } from '@angular/http';
import { Directive, OnInit, Input, Output, Optional, EventEmitter, ElementRef, HostBinding, HostListener } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';

import _ = require('lodash');
import MarkdownIt = require('markdown-it');

import { CachedHttpService, OutsideAngularService, MarkdownService } from './services';


// Inline an svg file with <svg-inline src="url"></svg-inline> tags
@Directive({ selector: 'svg-inline' })
export class InlineSVGDirective {
	@Input() src;
    constructor(private el: ElementRef, private cachedHttp: CachedHttpService) { }
    getSVG() {
        this.cachedHttp.get(this.src)
            .map(res => res.text())
            .subscribe(data => { this.el.nativeElement.innerHTML = data; });
    }
    ngOnInit() { this.getSVG(); }
    ngOnChanges() { this.getSVG(); }
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
 *  <div lazyBackgroundGroup>
 *      <div lazyBackground="/some/url.png"></div>
 *      <div [lazyBackground]="someVariable"></div>
 *      ...
 */
@Directive({ selector: '[lazyBackgroundGroup]'})
export class LazyBackgroundGroupDirective {
    elements = [];
    constructor(private outside: OutsideAngularService) { }
    ngOnInit() {
        this.outside.addEventListener(window, 'scroll', this.lazyLoad);
        this.outside.addEventListener(window, 'resize', this.lazyLoad);
    }
    ngOnDestroy() {
        this.outside.removeEventListener(window, 'scroll', this.lazyLoad);
        this.outside.removeEventListener(window, 'resize', this.lazyLoad);
    }
    add(element, url) {
        this.elements.push([element, url]);
        this.lazyLoad();
    }
    remove(element) {
        _.remove(this.elements, value => value[0] === element);
    }
    lazyLoad = () => {
        let threshold = window.innerHeight + 500;
        for (let [el, url] of this.elements) {
            if (el.getBoundingClientRect().top < threshold) {
                el.style.opacity = 1;   // Use CSS3 transition to fade in
                el.style.backgroundImage = `url(${url})`;
                this.remove(el);
            }
        }
    }
}
@Directive({ selector: '[lazyBackground]'})
export class LazyBackgroundDirective {
    @Input('lazyBackground') url;
    constructor(
        private el: ElementRef,
        private lazyBackground: LazyBackgroundGroupDirective) {
    }
    ngOnInit() {
        this.lazyBackground.add(this.el.nativeElement, this.url);
    }
    ngOnDestroy() {
        this.lazyBackground.remove(this.el.nativeElement);
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
    ngOnChanges() { 
        this.updateContent(); 
    }
    updateContent() { 
        this.el.nativeElement.innerHTML = this.md.render(this.innerMarkdown); 
    }
}


/* Directive which sets the route param to a section element's id on scroll
 * and also handles scrolling to that section when the route param changes
 *
 *  <div addSectionToRoute="/basepath" thresholdElement="#fixed-div">
 *      <section name="one"><!-- /basepath/one --></section>
 *      <section name="two"><!-- /basepath/two --></section>
 *      ...
 */
@Directive({ selector: '[addSectionToRoute],[thresholdElement],[thresholdOffset]' })
export class SectionRouteDirective {
    @Input() addSectionToRoute;
    @Input() thresholdElement;
    @Input() thresholdOffset;
    sections = {};
    currentlyNavigating = false;
    constructor(
        private router: Router, 
        private route: ActivatedRoute) {
    }
    ngOnInit() {
        this.thresholdOffset = parseInt(this.thresholdOffset || 0);
        this.sub = this.router.events.subscribe(event => {
            if (event instanceof NavigationEnd) {
                if (this.currentlyNavigating) return this.currentlyNavigating = false;
                this.setSection(this.route.snapshot.params.section)
            }
        });
    }
    ngOnDestroy() {
        this.sub && this.sub.unsubscribe();
    }
    ngAfterViewInit() {
        // TODO: If this is called before the page is ready, the positioning is slightly off
        this.setSection(this.route.snapshot.params.section);
    }
    add(section, el) {
        this.sections[section] = el;
    }
    remove(section) {
        delete this.sections[section];
    }
    setSection(section) {
        var sectionEl = this.sections[section];
        var position = 0;
        if (sectionEl) {
            position = document.body.scrollTop + sectionEl.getBoundingClientRect().top - this.thresholdOffset;
            if (this.thresholdElement) {
                var tEl = document.querySelector(this.thresholdElement);
                if (tEl) position -= tEl.getBoundingClientRect().bottom;
            }
        }
        this.currentlyNavigating = true;
        window.scrollTo(0, position);
    }
    @HostListener('window:scroll') onScroll() {
        if (this.currentlyNavigating) return this.currentlyNavigating = false;
        var visibleSection;
        var threshold = this.thresholdOffset;
        if (this.thresholdElement) {
            var tEl = document.querySelector(this.thresholdElement);
            if (tEl) threshold = tEl.getBoundingClientRect().bottom + this.thresholdOffset;
        }
        for (let section in this.sections) {
            if (this.sections[section].getBoundingClientRect().top < threshold) visibleSection = section;
        }
        if (visibleSection) {
            this.currentlyNavigating = true;
            this.router.navigate([this.addSectionToRoute, visibleSection]);
        }
    };
}
@Directive({ selector: 'section[name]' })
export class SectionDirective {
    @Input() name;
    constructor(
        private el: ElementRef,
        @Optional() private routeDirective: SectionRouteDirective) {
    }
    ngOnInit() {
        if (this.routeDirective) this.routeDirective.add(this.name, this.el.nativeElement);
    }
    ngOnDestroy() {
        if (this.routeDirective) this.routeDirective.remove(this.name);
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
    SectionDirective,
    SizePollingDirective,
    LazyBackgroundGroupDirective,
    LazyBackgroundDirective
];

