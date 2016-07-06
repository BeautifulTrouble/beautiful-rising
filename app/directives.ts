
import { Http } from '@angular/http';
import { Directive, OnInit, Input, Output, EventEmitter, ElementRef } from '@angular/core';

import { CachedHttpService, OutsideAngularService } from './services';


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


@Directive({
    /* Directive which sends (heightChanged) and (widthChanged) events for the given element
     *
     * Example uses w/ & w/o polling interval in milliseconds:
     *  <div heightPolling (heightChanged)="action($event)">
     *  <div heightPolling="100" (heightChanged)="action($event)">
     *  <div widthPolling="100ms" (widthChanged)="action($event)">
     *  <div heightPolling widthPolling="100" (heightChanged)="action($event)" (widthChanged)="action()">
     */
    selector: '[heightPolling], [widthPolling]',
})
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


