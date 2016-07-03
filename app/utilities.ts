// General purpose stuff goes in here.

import { Http } from '@angular/http';
import { Pipe, PipeTransform } from '@angular/core';

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

