// General purpose stuff goes in here.

import {Http, Response} from '@angular/http';
import {Pipe, PipeTransform, Component, Input, OnInit} from '@angular/core';
import {Observable} from 'rxjs/Observable';


// Template filter to capitalize a word
@Pipe({'name': 'capitalize'})
export class CapitalizePipe implements PipeTransform {
    // TODO: Arabic equivalent
    transform = v => _.capitalize(v);
}


// Inline an svg file with <svg-inline src="url"></svg-inline> tags
@Component({
	selector: 'svg-inline',
	template: `<div [innerHTML]="svgData"></div>`
})
export class SVGComponent implements OnInit {
	@Input() src;
	svgData = '';

    constructor(private http: Http) {
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
            err => { console.error(err); }
        );
    }
}
class SVGCache {
    static cache = {};
}

