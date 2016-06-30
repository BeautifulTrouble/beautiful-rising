// General purpose stuff goes in here.

import { Http, Response } from '@angular/http';
import { Pipe, PipeTransform, Component, Input, OnInit, ElementRef, Directive, Output, EventEmitter, NgZone } from '@angular/core';
import { DomSanitizationService } from '@angular/platform-browser/src/security/dom_sanitization_service';

import { Observable } from 'rxjs/Observable';
import _ = require('lodash');


// Note that these are NOT the same slugs used by the API
export var slugify = (s) => s.toLowerCase()
                             .replace(/[^\w\s-]/g, '')
                             .replace(/[\s_-]+/g, '-')
                             .replace(/^-+|-+$/g, '');


@Pipe({'name': 'capitalize'})
export class CapitalizePipe implements PipeTransform {
    // TODO: Arabic equivalent
    transform = v => _.capitalize(v || '');
}

export var untrustedString = v => {
    if (v && 'changingThisBreaksApplicationSecurity' in v) return v.changingThisBreaksApplicationSecurity;
    return (v || '').toString();
}
export var noTags = v => {
    v = untrustedString(v);
    let el = document.createElement('div');
    el.innerHTML = v;
    return el.textContent;
};
@Pipe({'name': 'notags'})
export class NotagsPipe implements PipeTransform {
    transform = noTags;
}

@Pipe({'name': 'trim'})
export class TrimPipe implements PipeTransform {
    transform = v => (v || '').trim();
}


// Inline an svg file with <svg-inline src="url"></svg-inline> tags
@Component({
	selector: 'svg-inline',
	template: `<div [innerHTML]="svgData"></div>`
})
export class SVGComponent implements OnInit {
	@Input() src;
	svgData = '';

    constructor(
        private http: Http,
        private sanitizer: DomSanitizationService) { 
    }
    ngOnInit() {
        var observable = SVGCache.cache[this.src];
        if (!observable) {
            observable = SVGCache.cache[this.src] = this.http.get(this.src)
                .map(res => res.text())
                .publishLast()
                .refCount(); // Don't execute multiple HTTP requests
        }
        observable.subscribe(
            data => { this.svgData = this.sanitizer.bypassSecurityTrustHtml(data); },
            err => { console.error(`Unable to load inline svg ${this.src}`); }
        );
    }
}
class SVGCache {
    static cache = {};
}


@Directive({
    /* Directive which sends (heightchanged) and (widthchanged) events for the given element
     *
     * Example uses w/ & w/o polling interval in milliseconds:
     *  <div height-polling (heightchanged)="action($event)">
     *  <div height-polling="100" (heightchanged)="action($event)">
     *  <div width-polling="100ms" (widthchanged)="action($event)">
     *  <div height-polling width-polling="100" (heightchanged)="action($event)" (widthchanged)="action()">
     */
    selector: '[height-polling], [width-polling]'
})
export class SizePollingDirective {
    @Output() heightchanged = new EventEmitter();
    @Output() widthchanged = new EventEmitter();
    defaultInterval = 100;

    constructor(private zone: NgZone, private el: ElementRef) {
        var hInterval = el.nativeElement.getAttribute('height-polling');
        var wInterval = el.nativeElement.getAttribute('width-polling');
        hInterval = hInterval ? parseInt(hInterval) : hInterval === '' ? this.defaultInterval : null;
        wInterval = wInterval ? parseInt(wInterval) : wInterval === '' ? this.defaultInterval : null;

        // Angular has wrapped every call to setInterval with change detection logic using
        // zone.js, so we run this polling outside of Angular's zone for better performance
        this.zone.runOutsideAngular(() => {
            if (hInterval) this.hIntervalId = setInterval(() => {
                var hNew = el.nativeElement.clientHeight;
                if (hNew != this.hLast) {
                    this.heightchanged.emit(hNew);
                    this.hLast = hNew;
                    this.zone.run();    // Force change detection
                }
            }, hInterval);
            if (wInterval) this.wIntervalId = setInterval(() => {
                var wNew = el.nativeElement.clientWidth;
                if (wNew != this.wLast) {
                    this.widthchanged.emit(wNew);
                    this.wLast = wNew;
                    this.zone.run();    // Force change detection
                }
            }, wInterval);
        });
    }
    ngOnDestroy() {
        this.hIntervalId && clearInterval(this.hIntervalId);
        this.wIntervalId && clearInterval(this.wIntervalId);
    }
}

