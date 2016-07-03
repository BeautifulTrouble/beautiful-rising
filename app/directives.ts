
import { Http } from '@angular/http';
import { Directive, OnInit, Input, Output, EventEmitter, ElementRef } from '@angular/core';

import { CachedHttpService, OutsideAngularService } from './services';


// Inline an svg file with <svg-inline src="url"></svg-inline> tags
@Directive({
	selector: 'svg-inline',
})
export class InlineSVGDirective {
	@Input() src;

    constructor(
        private el: ElementRef,
        private cachedHttp: CachedHttpService) { 
    }
    ngOnInit() {
        this.cachedHttp.get(this.src)
            .map(res => res.text())
            .subscribe(data => { this.el.nativeElement.innerHTML = data; });
    }
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
})
export class SizePollingDirective {
    @Output() heightchanged = new EventEmitter();
    @Output() widthchanged = new EventEmitter();
    defaultInterval = 100;

    constructor(
        private outside: OutsideAngularService,
        private el: ElementRef) {
        var hInterval = el.nativeElement.getAttribute('height-polling');
        var wInterval = el.nativeElement.getAttribute('width-polling');
        hInterval = hInterval ? parseInt(hInterval) : hInterval === '' ? this.defaultInterval : null;
        wInterval = wInterval ? parseInt(wInterval) : wInterval === '' ? this.defaultInterval : null;

        // Angular has wrapped every call to setInterval with change detection logic using
        // zone.js, so we run this polling outside of Angular's zone for better performance
        if (hInterval) this.hIntervalId = this.outside.setInterval(() => {
            var hNew = el.nativeElement.clientHeight;
            if (hNew != this.hLast) {
                this.heightchanged.emit(hNew);
                this.hLast = hNew;
                return true; // Force change detection
            }, hInterval);

        if (wInterval) this.wIntervalId = this.outside.setInterval(() => {
            var wNew = el.nativeElement.clientWidth;
            if (wNew != this.wLast) {
                this.widthchanged.emit(wNew);
                this.wLast = wNew;
                return true; // Force change detection
            }, wInterval);
    }
    ngOnDestroy() {
        this.hIntervalId && clearInterval(this.hIntervalId);
        this.wIntervalId && clearInterval(this.wIntervalId);
    }
}


