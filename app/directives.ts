
import { Http } from '@angular/http';
import { Directive, OnInit, Input, Output, EventEmitter, NgZone, ElementRef } from '@angular/core';

import { OutsideAngularService } from './services';


// Inline an svg file with <svg-inline src="url"></svg-inline> tags
@Directive({
	selector: 'svg-inline',
})
export class InlineSVGDirective {
	@Input() src;

    constructor(private http: Http, private el: ElementRef) { }
    ngOnInit() {
        var observable = SVGCache.cache[this.src];
        if (!observable) {
            observable = SVGCache.cache[this.src] = this.http.get(this.src)
                .map(res => res.text())
                .publishLast()
                .refCount(); // Don't execute multiple HTTP requests
        }
        observable.subscribe(
            data => { this.el.nativeElement.innerHTML = data; },
            err => console.error(`Can't load inline svg ${this.src}`)
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
    selector: '[height-polling], [width-polling]',
    //providers: [OutsideAngularService]
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
                    this.zone.run(() => null);  // Force change detection
                }
            }, hInterval);
            if (wInterval) this.wIntervalId = setInterval(() => {
                var wNew = el.nativeElement.clientWidth;
                if (wNew != this.wLast) {
                    this.widthchanged.emit(wNew);
                    this.wLast = wNew;
                    this.zone.run(() => null);  // Force change detection
                }
            }, wInterval);
        });
    }
    ngOnDestroy() {
        this.hIntervalId && clearInterval(this.hIntervalId);
        this.wIntervalId && clearInterval(this.wIntervalId);
    }
}


