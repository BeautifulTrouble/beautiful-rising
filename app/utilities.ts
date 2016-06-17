// General purpose stuff goes in here.

import {Http, Response} from '@angular/http';
import {Pipe, PipeTransform, Component, Input, OnInit} from '@angular/core';
import {Observable} from 'rxjs/Observable';

import _ = require('lodash');


// Note that these are NOT the same slugs used by the API
export var slugify = (s) => s.toLowerCase()
                             .replace(/[^\w\s-]/g, '')
                             .replace(/[\s_-]+/g, '-')
                             .replace(/^-+|-+$/g, '');


@Pipe({'name': 'capitalize'})
export class CapitalizePipe implements PipeTransform {
    // TODO: Arabic equivalent
    transform = v => _.capitalize(v);
}

@Pipe({'name': 'notags'})
export class NotagsPipe implements PipeTransform {
    transform = v => {
        // XXX: Do something different for server-side rendering
        let el = document.createElement('div');
        el.innerHTML = v;
        return el.textContent;
    };
}

@Pipe({'name': 'trim'})
export class TrimPipe implements PipeTransform {
    transform = v => v.trim();
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
        private http: Http) { 
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
            data => { this.svgData = data; },
            err => { console.error(`Unable to load inline svg ${this.src}`); }
        );
    }
}
class SVGCache {
    static cache = {};
}

