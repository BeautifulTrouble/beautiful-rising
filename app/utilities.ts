// General purpose stuff goes in here.

import { Http } from '@angular/http';
import { Pipe, PipeTransform } from '@angular/core';

import * as _ from 'lodash';


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


export var plainString = v => {
    if (v && 'changingThisBreaksApplicationSecurity' in v) return v.changingThisBreaksApplicationSecurity;
    return (v || '').toString();
}
@Pipe({'name': 'notags'})
export class NotagsPipe implements PipeTransform {
    transform(text) {
        text = plainString(text);
        let el = document.createElement('div');
        el.innerHTML = text;
        return el.textContent;
    }
}


@Pipe({'name': 'trim'})
export class TrimPipe implements PipeTransform {
    transform = v => (v || '').trim();
}


export var template = (text, values) => _.template(text, { interpolate: /{{([\s\S]+?)}}/g })(values);
@Pipe({'name': 'template'})
export class TemplatePipe implements PipeTransform {
    transform = template;
}


export var APP_PIPES = [
    CapitalizePipe,
    NotagsPipe,
    TrimPipe,
    TemplatePipe
];
