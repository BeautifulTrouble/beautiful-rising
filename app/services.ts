// Any task which interacts with a data store should be abstracted to a service here.

import {Injectable, OnDestroy} from '@angular/core';
import {Http, URLSearchParams} from '@angular/http';
import {NgZone} from '@angular/core/src/zone';
import {Observable} from 'rxjs/Observable';


// Content Service (for fetching API content)
@Injectable()
export class ContentService {
    private _contentUrl = 'https://api-testing.beautifulrising.org/api/v1/all';

    constructor(private http: Http) { }
    getContent(language: string) { 
        var params = new URLSearchParams(`lang=${language}`);
        return this.http.get(this._contentUrl, {search: params})
            .map(result => result.json())
            .catch(err => Observable.throw('Server error'));
    }
}


// Client Storage Service (auto-persist decorated ngModel values to session/localStorage)
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
export var LocalStorage = (key) => StorageDecoratorFactory(key, localStorage || {});
export var SessionStorage = (key) => StorageDecoratorFactory(key, sessionStorage || {});

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
        StorageEmitter.subscribe(_.debounce(() => {
            // XXX: make sure this debouncing sufficiently reduces churn
            if (value === undefined) value = JSON.parse(store.getItem(propertyName) || 'null');
            store.setItem(propertyName, JSON.stringify(value));
        }, 500));
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
        // TODO: implement backend API saving
        this.isSaved(module) ? _.pull(this.savedModules, module.slug) : this.savedModules.push(module.slug);
    }
}

