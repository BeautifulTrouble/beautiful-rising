// Any task which interacts with a data store should be abstracted to a service here.

import {Injectable, OnDestroy} from '@angular/core';
import {Http, URLSearchParams} from '@angular/http';
import {NgZone} from '@angular/core/src/zone';
import {Observable} from 'rxjs/Observable';
import {Subject} from 'rxjs/Subject';

import _ = require('lodash');
import ElasticLunr = require('elasticlunr');
import MarkdownIt = require('markdown-it');
import markdownitFootnote = require('markdown-it-footnote');

import {slugify} from './utilities';


// Content Service (for fetching and transforming API content)
@Injectable()
export class ContentService {
    language = 'en';
    contentUrl = 'https://api.beautifulrising.org/api/v1/all';
    contentSource = new Subject();
    contentStream = this.contentSource.asObservable();
    contentCacheByLanguage = {};

    constructor(private http: Http) { }

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
                    let output = {}
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
                    output.modulesFiltered = output.modules;
                    output.modulesBySlug = _.keyBy(output.modules, 'slug');
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
                    // Prepare truncated version of potential-risks before rendering as markdown
                    output.config.markdown.push('potential-risks-short');
                    for (let module of output.modules) {
                        if (module['potential-risks'] && module['potential-risks'].length > 470) {
                            // Most of this is now done in the callback initiated by the onInit call to inject variables
                            module['potential-risks-short'] = _.truncate(module['potential-risks'], {length: 470, separator: /\s+ /});
                        }
                    }
                    // Render markdown
                    var md = new MarkdownIt().use(markdownitFootnote);
                    // Recursive markdown function handles most nested structures
                    var markdown = (x) => ({
                        'array': a => _.map(a, markdown),
                        'object': o => _.mapValues(o, markdown),
                        'string': s => md.render(s),
                        'number': n => n
                    })[x instanceof Array ? 'array' : typeof x](x);
                    for (let collection of [output.contentByType.person, output.modules]) {
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
        if (!zoneSub) zoneSub = [zone, 
            zone.onMicrotaskEmpty.subscribe(() => _.invokeMap(StorageEmitter.callbacks, _.call)) ];
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
        // TODO: implement backend API saving, auto-sort, return actual modules?
        if (!module.slug) return;
        this.isSaved(module) ? _.pull(this.savedModules, module.slug) : this.savedModules.push(module.slug);
    }
}

