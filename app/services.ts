// Any task which interacts with a data store should be abstracted to a service here.

import { Injectable, OnDestroy, NgZone } from '@angular/core';
import { Http, URLSearchParams } from '@angular/http';
import { DomSanitizationService } from '@angular/platform-browser/src/security/dom_sanitization_service';

import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import _ = require('lodash');
import ElasticLunr = require('elasticlunr');
import MarkdownIt = require('markdown-it');
import markdownitFootnote = require('markdown-it-footnote');

import { slugify } from './utilities';


// Cache and share the results of Http requests to the same url
@Injectable()
export class CachedHttpService {
    static cache = {};

    constructor(private http: Http) { }
    get(url, options) {
        var observable;
        if (!options) { options = {}; }
        if (options.reload) { delete options.reload; }
        else { observable = CachedHttpService.cache[url]; }
        if (!observable) {
            observable = CachedHttpService.cache[url] = this.http.get(url, options)
                .publishLast()
                .refCount();
        }
        return observable;
    }
}


// Content Service (for fetching and transforming API content)
@Injectable()
export class ContentService {
    language = 'en';
    contentUrl = 'https://api.beautifulrising.org/api/v1/all';
    contentSource = new Subject();
    contentStream = this.contentSource.asObservable();
    contentCacheByLanguage = {};

    constructor(
        private http: Http,
        private sanitizer: DomSanitizationService) { 
    }

    // Returns an object containing several sorted and ordered forms of the API content
    getContent(callback) {
        // Subscribe the callback to a single message
        this.contentStream.first().subscribe(callback);
        // Use cached content when possible or fetch by HTTP
        if (this.contentCacheByLanguage[this.language]) {

            console.log('Using cached content');

            // Emit the cached prepared content to subscribers
            this.contentSource.next(this.contentCacheByLanguage[this.language]);
        } else {

            console.log('Using fresh content');

            var params = new URLSearchParams(`lang=${this.language}`);
            this.http.get(this.contentUrl, {search: params})
                .map(result => result.json())
                .catch(err => Observable.throw('Something went wrong with the content API service!'))
                .subscribe(content => {
                    // Prepare the content for easy consumption by components
                    let output:any = {}
                    output.content = content;
                    output.config = _.find(content, {'type': 'config', 'slug': 'api'});
                    // Bundle content into types
                    output.contentByType = _.groupBy(content, 'type');
                    // Mappings by slug are useful for grabbing related content
                    output.contentBySlug = _.keyBy(content, 'slug');
                    output.textBySlug = _.keyBy(output.contentByType.text, 'slug');
                    output.peopleBySlug = _.keyBy(output.contentByType.person, 'slug');
                    // Prepare a few more useful representations of modules
                    output.moduleTypes = _.map(output.config['types-modules'], t => t.one);
                    output.modulesByType = _.pick(output.contentByType, output.moduleTypes);
                    output.modules = _.flatten(_.values(output.modulesByType));
                    output.modulesFiltered = output.modules; // TODO: remove this
                    output.modulesBySlug = _.keyBy(output.modules, 'slug');
                    //output.modulesByRegion = _.mapKeys(_.groupBy(output.modules, 'region'), (v,k) => slugify(k || 'all'));
                    // Collect all tags
                    output.modulesByTag = {};
                    for (let module of output.modules) {
                        for (let tag of module['tags'] || []) {
                            output.modulesByTag[tag] = output.modulesByTag[tag] || [];
                            output.modulesByTag[tag].push(module);
                        }
                    }
                    output.tags = _.keys(output.modulesByTag).sort();
                    output.modulesByTag = _.mapKeys(output.modulesByTag, (v,k) => slugify(k));


                    // Preprocess content before passing to markdown processor (90% of these tasks belong in the contentloader)
                    output.config.markdown.push('potential-risks-short');
                    output.config.markdown.push('key-modules');
                    for (let module of output.modules) {
                        // Prepare -short version of potential risks
                        if (module['potential-risks'] && module['potential-risks'].length > 470) {
                            module['potential-risks-short'] = _.truncate(module['potential-risks'], {length: 470, separator: /\s+ /});
                        }
                        // Split epigraphs from attributions
                        module.epigraphs = _.map(module.epigraphs || [], (text) => text.split(/\s+[—–―]([^\s].+)/, 2));
                        // Split key-module names from descriptions
                        for (let type of ['key-tactics', 'key-principles', 'key-theories', 'key-methodologies']) {
                            if (module[type]) module[type] = _.map(module[type], text => [text.split(/\s+[-]\s+/, 1)[0], text.replace(/^.+\s+[-]\s+/, '')]);
                        }
                        // Embed blockquotes into full-write-up
                        if (module['full-write-up'] && module['pull-quote']) {
                            let blockquote = `<blockquote class="pull-quote"><p>${module['pull-quote']}</p></blockquote>`;
                            let paragraphs = module['full-write-up'].split(/\n\n\n*/);
                            if (paragraphs.length > 1) {
                                paragraphs.splice(Math.floor(paragraphs.length/2) - Math.floor(paragraphs.length/2)%2, 0, blockquote);
                                module['full-write-up'] = paragraphs.join('\n\n');
                            }
                        }
                    }


                    // Render markdown
                    var md = new MarkdownIt({
                        'html': true,
                        'linkify': true,
                        'typographer': true
                    }).use(markdownitFootnote);
                    // Recursive markdown function handles most nested structures
                    var markdown = (x) => ({
                        'array': a => _.map(a, markdown),
                        'object': o => _.mapValues(o, markdown),
                        'string': s => this.sanitizer.bypassSecurityTrustHtml(md.render(s)),
                        'number': n => n
                    })[x instanceof Array ? 'array' : typeof x](x);
                    // TODO: special-case the text type for easier markdown stuff
                    for (let collection of [output.contentByType.person, output.contentByType.text, output.modules]) {
                        for (let module of collection) {
                            for (let field of output.config.markdown) {
                                if (module[field]) module[field] = markdown(module[field]);
                            }
                        }
                    }

                    // Prepare search index
                    ElasticLunr.tokenizer.setSeperator(/[-\s]+/);
                    output.index = ElasticLunr();
                    output.index.setRef('slug');
                    output.config.search.forEach(field => output.index.addField(field));
                    output.modules.forEach(module => output.index.addDoc(module)); 
                    // Cache the prepared content and emit it to subscribers
                    this.contentCacheByLanguage[this.language] = output;
                    this.contentSource.next(output);
                });
        }
    }
    // For the simple case where you want to populate ~this~ with content variables
    injectContent(target: Scope, then) {
        this.getContent(content => {
            _.merge(target, content)
            if (then /* har */) then(content);
        });
    }
}


// Run timed functions outside angular, only triggering change detection when those functions return true
@Injectable()
export class OutsideAngularService {
    intervalIds = [];
    timeoutIds = [];

    constructor(private zone: NgZone) { }
    ngOnDestroy() {
        for (let each of this.intervalIds) { clearInterval(intervalId); }
        for (let each of this.timeoutIds) { clearTimeout(intervalId); }
    }
    setInterval(callback, interval /* TODO: allow callers to subscribe to return values */) {
        return this.zone.runOutsideAngular(() => {
            var intervalId = setInterval(() => { callback() && this.zone.run(() => null); }, interval);
            this.intervalIds.push(intervalId);
            return intervalId;
        });
    }
    setTimeout(callback, interval /* TODO: allow callers to subscribe to return values */) {
        return this.zone.runOutsideAngular(() => {
            var timeoutId = setTimeout(() => { callback() && this.zone.run(() => null); }, interval);
            this.timeoutIds.push(timeoutIds);
            return timeoutId;
        });
    }
}


// Client Storage Service (auto-persist decorated values to session/localStorage)
@Injectable()
export class ClientStorageService implements OnDestroy {
    constructor(private _zone: NgZone) {
        StorageEmitter.addZone(this._zone);
    }
    ngOnDestroy() {
        StorageEmitter.removeZone(this._zone);
    }
}

// These automagic decorators are to be used like: @LocalStorage() variableNameHere;
export var LocalStorage = (key) => StorageDecoratorFactory(key, localStorage);
export var SessionStorage = (key) => StorageDecoratorFactory(key, sessionStorage);

function StorageDecoratorFactory(key, store) {
    return (obj, propertyName) => {
        propertyName = key || propertyName;
        var value;

        Object.defineProperty(obj, propertyName, {
            enumerable: true,
            get: () => { 
                if (value === undefined) value = JSON.parse(store.getItem(propertyName) || 'null');
                return value;
            },
            set: (v) => { 
                value = v;
            }
        });
        StorageEmitter.subscribe(() => {
            if (value === undefined) value = JSON.parse(store.getItem(propertyName) || 'null');
            store.setItem(propertyName, JSON.stringify(value));
        });
    }
}

// This is factored out of the service so callbacks and subscribers will persist when the service is re-instantiated
class StorageEmitter {
    static callbacks = [];
    static zoneSubscribers = [];

    static subscribe(callback) {
        StorageEmitter.callbacks.push(callback);
    }
    static addZone(zone) {
        var zoneSub = _.remove(StorageEmitter.zoneSubscribers, (zs) => zs[0] === zone)[0];
        if (!zoneSub) zoneSub = [zone, zone.onMicrotaskEmpty.subscribe(() => _.invokeMap(StorageEmitter.callbacks, _.call))];
        StorageEmitter.zoneSubscribers.push(zoneSub);
    }
    static removeZone(zone) {
        var sub = _.remove(StorageEmitter.zoneSubscribers, (zs) => zs[0] === zone)[0];
        if (sub) sub[1].unsubscribe();
    }
}


// Module Saving Service (save to localStorage and backend server)
@Injectable()
export class ModuleSavingService {
    @LocalStorage() savedModules;

    constructor() {
        this.savedModules = this.savedModules || [];
    }
    isSaved(module) {
        return _.includes(this.savedModules, module.slug);
    }
    toggleSaved(module) {
        // TODO: implement backend API saving, auto-sort...
        if (!module.slug) return;
        this.isSaved(module) ? _.pull(this.savedModules, module.slug) : this.savedModules.push(module.slug);
    }
}

