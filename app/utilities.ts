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


// Inline an svg file with <svg-icon src="url"></svg-icon> tags
@Component({
	selector: 'svg-icon',
	template: `<div [innerHTML]="iconData"></div>`
})
export class SVGIconComponent implements OnInit {
	@Input() src;
	iconData = '';

    constructor(private http: Http) {
    }
    ngOnInit() {
        var observable = SVGIconCache.cache[this.src];
        if (!observable) {
            observable = SVGIconCache.cache[this.src] = this.http.get(this.src)
                .map(res => res.text())
                .publishLast()
                .refCount(); // Don't execute multiple HTTP requests
        }
        observable.subscribe(
            data => { this.iconData = data; },
            err => { console.error(err); }
        );
    }
}
class SVGIconCache {
    static cache = {};
}

