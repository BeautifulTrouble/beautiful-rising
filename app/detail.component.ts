
import { Component, ElementRef, isDevMode } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router, ActivatedRoute } from '@angular/router';

import _ = require('lodash');

import { plainString, slugify, template } from './utilities';
import { ContentService, ModuleSavingService } from './services';


@Component({
    selector: 'detail',
    template: `
        <div *ngIf="module">
            <div class="container">
                <div [ngClass]="['row', 'type-' + module.type]">
                    <div class="col-sm-12">
                        <div class="module-image" [ngStyle]="{'background-image': module.image ? 'url('+config['asset-path']+'/'+module.image+')' : ''}">
                            <div class="overlay"></div>
                            <div *ngIf="!snapshot" [ngClass]="['pattern', module.type]">
                                <div *ngIf="module.type != 'story'">
                                    <svg-inline *ngIf="!patternTypes.length" src="/assets/patterns/3rows/{{ module.type }}.svg"></svg-inline>
                                    <svg-inline *ngIf="patternTypes.length" src="/assets/patterns/3rowsoverlay/{{ module.type }}.svg"></svg-inline>
                                </div>
                                <svg-inline *ngFor="let type of patternTypes" src="/assets/patterns/3rowsoverlay/{{ type }}.svg"></svg-inline>
                            </div>
                            <div *ngIf="snapshot" 
                                [ngClass]="['pattern', 'pattern-snapshot', module.type]" 
                                [ngStyle]="{'background-image': 'url(/assets/patterns/snapshotoverlay/'+module.type+'.svg)'}"></div>
                            <div class="module-header">
                                <div *ngIf="module.type == 'story'" class="story-extra">
                                    <p *ngIf="module.where || module.when">{{ module.where }} {{ module.when }}</p>
                                    <svg-inline *ngIf="module.region" src="/assets/img/{{ module.region }}.svg" class="region-icon"></svg-inline>
                                </div>
                                <div [routerLink]="['/type', module.type]" [ngClass]="['module-type', 'clickable', module.type]">{{ textBySlug.ui.types[module.type] }}</div>
                                <div class="module-title">{{ module.title }}</div>
                                <div (click)="savingService.toggleSaved(module)" [ngSwitch]="savingService.isSaved(module)" class="module-save clickable">
                                    <div *ngSwitchCase="true"><svg-inline src="/assets/img/-_tileandmodule.svg"></svg-inline>{{ textBySlug.ui.module.remove }}</div>
                                    <div *ngSwitchCase="false"><svg-inline src="/assets/img/+_tileandmodule.svg"></svg-inline>{{ textBySlug.ui.module.save }}</div>
                                </div><br>
                                <div class="module-share clickable">
                                    <svg-inline src="/assets/img/share_in_module.svg"></svg-inline>{{ textBySlug.ui.module.share }}
                                </div>
                            </div>
                            <div class="hidden-xs module-image-caption" [innerHTML]="module['image-caption']"></div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="container">
                <div [ngClass]="['row', 'type-' + module.type]">

                    <div class="hidden-xs hidden-sm col-md-3 col-lg-2 column-a"><!-- large -->
                        <h3 class="border-bottom bigger contributed-by">{{ textBySlug.ui.module['contributed-by'] }}</h3>
                        <div *ngFor="let author of authors" >
                            <a [routerLink]="['/search', 'authors!' + author.slug]">
                                <div class="contributor-image" 
                                    [ngStyle]="{'background-image': author.image ? 'url('+config['asset-path']+'/small-'+author.image+')' : 'url(/assets/img/anon.png)'}"></div>
                                <div class="contributor-name">
                                    <h4 class="first">{{ author.firstname }}</h4>
                                    <h4 class="last">{{ author.lastname }}</h4>
                                </div>
                            </a>
                            <div class="contributor-bio" *ngIf="author.bio" [innerHTML]="author.bio"></div>
                        </div>
                        <div *ngIf="!authors.length">
                            <div class="contributor-image" style="background-image: url('/assets/img/anon.png')"></div>
                            <div class="contributor-name">
                                <div class="anon">
                                    <svg-inline class="your-arrow" src="/assets/img/yourarrow.svg"></svg-inline>
                                    <h4 class="first">{{ textBySlug.ui.module['no-name'] }}</h4> 
                                </div>
                            </div>
                        </div>
                        <div *ngIf="module.tags">
                            <h3 class="border-bottom">{{ textBySlug.ui.module.tags }}</h3>
                            <span *ngFor="let tag of module.tags; let last=last">
                                <a [routerLink]="['/tag', slugify(tag)]" class="tag">{{ tag }}</a><strong *ngIf="!last"> / </strong>
                            </span>
                        </div>
                        <h3 class="border-bottom">{{ textBySlug.ui.module.training }}</h3>
                        <div [innerMarkdown]="template(textBySlug.ui.module['training-request'], {form: textBySlug.ui.forms.training})"></div>
                    </div>

                    <div class="hidden-md hidden-lg column-a"><!-- small -->
                        <div class="col-xs-12">
                            <h3 class="border-bottom bigger contributed-by">{{ textBySlug.ui.module['contributed-by'] }}</h3>
                        </div>
                        <div *ngFor="let author of authors">
                            <div class="col-xs-12 col-sm-4">
                                <a [routerLink]="['/search', 'authors!' + author.slug]">
                                    <div class="contributor-image" 
                                        [ngStyle]="{'background-image': author.image ? 'url('+config['asset-path']+'/small-'+author.image+')' : 'url(/assets/img/anon.png)'}"></div>
                                </a>
                            </div>
                            <div class="col-xs-12 col-sm-8">
                                <a [routerLink]="['/search', 'authors!' + author.slug]">
                                    <div class="contributor-name">
                                        <h4>{{ author.title }}</h4>
                                    </div>
                                </a>
                                <p *ngIf="author.bio" [innerHTML]="author.bio"></p>
                            </div>
                            <div class="clearfix"></div>
                            <div class="hr"></div>
                        </div>
                        <div *ngIf="!authors.length">
                            <div class="col-xs-12 col-sm-4">
                                <div class="contributor-image" style="background-image: url('/assets/img/anon.png')"></div>
                            </div>
                            <div class="col-xs-12 col-sm-8">
                                <div class="contributor-name">
                                    <div class="anon">
                                        <svg-inline class="your-arrow" src="/assets/img/yourarrow.svg"></svg-inline>
                                        <h4 class="first">{{ textBySlug.ui.module['no-name'] }}</h4> 
                                    </div>
                                </div>
                            </div>
                            <div class="clearfix"></div>
                            <div class="hr"></div>
                        </div>
                    </div>

                    <div class="col-xs-12 col-sm-8 col-sm-offset-4 col-md-5 col-md-offset-0 col-lg-offset-1 content">
                        <div *ngIf="snapshot">
                            <p [innerHTML]="module.snapshot"></p>
                            <p><strong>{{ textBySlug.ui.module.snapshot | template: {type: textBySlug.ui.types[module.type].toLowerCase()} }}</strong></p>
                            <div class="row contribute-message">
                                <div class="col-xs-6">
                                    <a href="{{ textBySlug.ui.forms[module.type] }}" target="_blank"><h4>{{ textBySlug.ui.module.form }}</h4></a>
                                </div>
                                <div *ngIf="module['bt-link']" class="col-xs-6">
                                    <a href="{{ module['bt-link'] }}" target="_blank"><h4>{{ textBySlug.ui.module.bt | template: {title: module.title} }}</h4></a>
                                </div>
                            </div>
                        </div>
                        <div *ngIf="!snapshot">
                            <div *ngIf="gallery || !topside">
                                <div class="short-write-up" [innerHTML]="module['short-write-up']"></div>
                                <h5 *ngIf="!gallery" class="button" (click)="topside = true">{{ textBySlug.ui.module['read-more'] }}</h5>
                                <div *ngIf="gallery" class="contribute-message">
                                    <strong [innerMarkdown]="template(textBySlug.ui.module.gallery, {form: textBySlug.ui.forms[module.type]})"></strong>
                                </div>
                            </div>
                            <div *ngIf="topside">
                                <div *ngFor="let epigraph of module.epigraphs" class="epigraphs">
                                    <div class="epigraph" [innerHTML]="epigraph[0]"></div>
                                    <div class="attribution" [innerHTML]="epigraph[1]"></div>
                                </div>
                                <div *ngIf="!gallery" [innerHTML]="module['full-write-up']"></div>
                                <h5 *ngIf="!gallery" class="button" (click)="topside = false">{{ textBySlug.ui.module['read-less'] }}</h5>
                            </div>
                            <div *ngIf="module['how-to-use']" class="how-to-use">
                                <h4>{{ textBySlug.ui.module['how-to-use'] }}</h4>
                                <div [innerMarkdown]="module['how-to-use']"></div>
                            </div>
                            <div *ngIf="module['why-it-worked']" class="why-worked-or-failed">
                                <h4>{{ textBySlug.ui.module['why-it-worked'] }}</h4>
                                <p [innerHTML]="module['why-it-worked']"></p>
                            </div>
                            <div *ngIf="module['why-it-failed']" class="why-worked-or-failed">
                                <h4>{{ textBySlug.ui.module['why-it-failed'] }}</h4>
                                <p [innerHTML]="module['why-it-failed']"></p>
                            </div>
                        </div>
                        <div *ngFor="let type of [['key-tactics', 'key-tactic', 'tactic'],
                                                  ['key-principles', 'key-principle', 'principle'],
                                                  ['key-theories', 'key-theory', 'theory'],
                                                  ['key-methodologies', 'key-methodology', 'methodology']]">
                            <div *ngFor="let each of module[type[0]]; let first=first; let last=last;">
                                <div *ngIf="first && last" [ngClass]="['module-type', 'key-heading', type[2]]">{{ textBySlug.ui.module[type[1]] }}</div><!-- singular -->
                                <div *ngIf="first && !last" [ngClass]="['module-type', 'key-heading', type[2]]">{{ textBySlug.ui.module[type[0]] }}</div><!-- plural -->
                                <h3 [innerHTML]="each[0]"></h3><div [innerHTML]="each[1]"></div>
                            </div>
                        </div>
                        <div *ngIf="module['learn-more']" class="learn-more">
                            <div *ngFor="let learn of module['learn-more']; let first=first;">
                                <h4 *ngIf="first">{{ textBySlug.ui.module['learn-more'] }}</h4>
                                <p>
                                    <a target="_blank" href="{{ learn.link | notags | trim }}">{{ learn.title | notags | trim }}</a>
                                    <span *ngIf="plainString(learn.source)"> / {{ learn.source | notags }}</span><span *ngIf="plainString(learn.year)">, {{ learn.year | notags }}</span>
                                </p>
                            </div>
                        </div>

                        <div *ngIf="(module['real-world-examples'] || []).length" class="examples hidden-sm">
                            <div (click)="topside = !topside" class="heading clickable">
                                <svg-inline src="/assets/img/RWE_{{ module.type }}.svg"></svg-inline>
                                <h3 class="bigger after-arrow" [class.selected]="!topside">{{ textBySlug.ui.module['real-world'] | template:{title: module.title } }}</h3>
                            </div>
                            <div *ngIf="!topside" class="example-wrapper">
                                <div class="example" *ngFor="let example of module['real-world-examples']; let index=index;">
                                    <div class="caption-wrapper" [class.staggered]="!(index%2)">
                                        <div class="caption">
                                            <a target="_blank" href="{{ example.link }}"><h5>{{ example.title }}</h5></a>
                                            <div class="description" [innerMarkdown]="example.description"></div>
                                        </div>
                                    </div>
                                    <div *ngIf="!module.image" class="image"></div>
                                    <div *ngIf="module.image" class="image" 
                                        [class.staggered]="!(index%2)" [class.shifted]="!(index%3)" 
                                        [ngStyle]="{'background-image': 'url(/assets/patterns/snapshotoverlay/' + module.type +'.svg), url('+ config['asset-path'] +'/'+ module.image +')'}"></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="col-sm-12 visible-sm"><!-- small only full width content -->
                        <div *ngIf="(module['real-world-examples'] || []).length" class="examples">
                            <div (click)="topside = !topside" class="heading clickable">
                                <svg-inline src="/assets/img/RWE_{{ module.type }}.svg"></svg-inline>
                                <h3 class="bigger after-arrow" [class.selected]="!topside">{{ textBySlug.ui.module['real-world'] | template:{title: module.title } }}</h3>
                            </div>
                            <div *ngIf="!topside" class="example-wrapper">
                                <div class="example" *ngFor="let example of module['real-world-examples']; let index=index;">
                                    <div class="caption-wrapper" [class.staggered]="!(index%2)">
                                        <div class="caption">
                                            <a target="_blank" href="{{ example.link }}"><h5>{{ example.title }}</h5></a>
                                            <div class="description" [innerMarkdown]="example.description"></div>
                                        </div>
                                    </div>
                                    <div *ngIf="!module.image" class="image"></div>
                                    <div *ngIf="module.image" class="image" 
                                        [class.staggered]="!(index%2)" [class.shifted]="!(index%3)" 
                                        [ngStyle]="{'background-image': 'url(/assets/patterns/snapshotoverlay/' + module.type +'.svg), url('+ config['asset-path'] +'/'+ module.image +')'}"></div>
                                </div>
                            </div>
                        </div>
                        <div *ngIf="module['potential-risks']" (click)="riskCollapsed = !riskCollapsed" class="risks" [class.clickable]="module['potential-risks-short']">
                            <div class="heading">
                                <svg-inline src="/assets/img/pr.svg" [ngClass]="'type-' + module.type"></svg-inline>
                                <h3 class="bigger">{{ textBySlug.ui.module['potential-risks'] }}</h3>
                                <svg-inline *ngIf="module['potential-risks-short']" class="arrow" [class.selected]="!riskCollapsed" src="/assets/img/arrow.svg"></svg-inline>
                            </div>
                            <div *ngIf="riskCollapsed && module['potential-risks-short']" [innerHTML]="module['potential-risks-short']"></div>
                            <div *ngIf="riskCollapsed && !module['potential-risks-short']" [innerHTML]="module['potential-risks']"></div>
                            <div *ngIf="!riskCollapsed" [innerHTML]="module['potential-risks']"></div>
                        </div>
                    </div>

                    <div class="col-xs-12 col-sm-6 col-md-4 column-b">
                        <div *ngIf="module['potential-risks']" (click)="riskCollapsed = !riskCollapsed" class="risks hidden-sm" [class.clickable]="module['potential-risks-short']">
                            <div class="heading">
                                <svg-inline src="/assets/img/pr.svg" [ngClass]="'type-' + module.type"></svg-inline>
                                <h3 class="bigger">{{ textBySlug.ui.module['potential-risks'] }}</h3>
                                <svg-inline *ngIf="module['potential-risks-short']" class="arrow" [class.selected]="!riskCollapsed" src="/assets/img/arrow.svg"></svg-inline>
                            </div>
                            <div *ngIf="riskCollapsed && module['potential-risks-short']" [innerHTML]="module['potential-risks-short']"></div>
                            <div *ngIf="riskCollapsed && !module['potential-risks-short']" [innerHTML]="module['potential-risks']"></div>
                            <div *ngIf="!riskCollapsed" [innerHTML]="module['potential-risks']"></div>
                        </div>
                        <div *ngIf="tactics.length || principles.length || theories.length || methodologies.length || stories.length">
                            <h3 class="bigger related">{{ textBySlug.ui.module['related-modules'] }}</h3>
                            <div class="related">
                                <div *ngIf="tactics.length">
                                    <h3 class="indent">{{ textBySlug.ui.types.tactics }}</h3>
                                    <ul><li *ngFor="let m of tactics">
                                        <a [routerLink]="['/tool', m.slug]" class="tactic">{{ m.title }}</a>
                                    </li></ul>
                                </div>
                                <div *ngIf="principles.length">
                                    <h3 class="indent">{{ textBySlug.ui.types.principles }}</h3>
                                    <ul><li *ngFor="let m of principles">
                                        <a [routerLink]="['/tool', m.slug]" class="principle">{{ m.title }}</a>
                                    </li></ul>
                                </div>
                                <div *ngIf="theories.length">
                                    <h3 class="indent">{{ textBySlug.ui.types.theories }}</h3>
                                    <ul><li *ngFor="let m of theories">
                                        <a [routerLink]="['/tool', m.slug]" class="theory">{{ m.title }}</a>
                                    </li></ul>
                                </div>
                                <div *ngIf="methodologies.length">
                                    <h3 class="indent">{{ textBySlug.ui.types.methodologies }}</h3>
                                    <ul><li *ngFor="let m of methodologies">
                                        <a [routerLink]="['/tool', m.slug]" class="methodology">{{ m.title }}</a>
                                    </li></ul>
                                </div>
                                <div *ngIf="stories.length">
                                    <h3 class="indent">{{ textBySlug.ui.types.stories }}</h3>
                                    <ul><li *ngFor="let m of stories">
                                        <a [routerLink]="['/tool', m.slug]" class="story">{{ m.title }}</a>
                                    </li></ul>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="col-xs-12 col-sm-4 col-sm-offset-1 col-md-4 col-md-offset-0 column-b visible-xs visible-sm">
                        <div *ngIf="module.tags">
                            <h3 class="border-bottom">{{ textBySlug.ui.module.tags }}</h3>
                            <span *ngFor="let tag of module.tags; let last=last">
                                <a [routerLink]="['/tag', slugify(tag)]" class="tag">{{ tag }}</a><strong *ngIf="!last"> / </strong>
                            </span>
                        </div>
                        <h3 class="border-bottom">{{ textBySlug.ui.module.training }}</h3>
                        <div [innerMarkdown]="template(textBySlug.ui.module['training-request'], {form: textBySlug.ui.forms.training})"></div>
                    </div>
                </div>
            </div>

            <a target="_blank" class="edit-link" href="{{ module.document_link }}">edit</a>
        </div>
    `
})
export class DetailComponent {
    _ = _;
    slugify = slugify;
    template = template;
    plainString = plainString;

    constructor(
        private el: ElementRef,
        private title: Title,
        private router: Router,
        private route: ActivatedRoute,
        private contentService: ContentService,
        private savingService: ModuleSavingService) { 
    }
    ngOnInit() {
        this.contentService.injectContent(this, () => {
            this.sub = this.route.params.subscribe((params) => {
                this.module = this.modulesBySlug[params.slug];
                if (!this.module) {
                    this.router.navigate(['/search', 'slug!' + params.slug]);
                    return;
                }
                this.topside = false; // A toggle between the article and examples
                this.riskCollapsed = true;

                this.authors = this.getRelated('authors', this.peopleBySlug);
                this.stories = this.getRelated('stories', this.modulesBySlug);
                this.tactics = this.getRelated('tactics', this.modulesBySlug);
                this.theories = this.getRelated('theories', this.modulesBySlug);
                this.principles = this.getRelated('principles', this.modulesBySlug);
                this.methodologies = this.getRelated('methodologies', this.modulesBySlug);

                // Attempt to split author name into first and last (this assignment syntax is called destructuring)
                this.authors.forEach(author => [, author.firstname, author.lastname] = author.title.split(/^([^\s]+)\s+/))

                this.snapshot = this.module['module-type'] == 'snapshot';
                this.gallery = this.module['module-type'] == 'gallery';

                // Compose the module's pattern
                var types = {'tactics':'tactic', 'principles':'principle', 'theories':'theory', 'methodologies':'methodology'};
                var otherTypes = _.pull(_.keys(types), this.module.type);
                this.patternTypes = _.filter(_.map(otherTypes, each => this.module[`key-${each}`] ? types[each] : null));

                // Adjust the UI
                this.title.setTitle(this.module['title']);
                window.scrollTo(0,0);

                isDevMode() && console.log(this.module);
            });
        });
    }
    ngAfterViewChecked() {
        // HACK: Ensure fragment links don't reload the page
        var links = this.el.nativeElement.querySelectorAll('a[href^="#"]');
        if (links.length) _.map(links, el => el.setAttribute('href', location.pathname + el.hash));

        // HACK: Prevent module links rendered from markdown from reloading the page
        var links = this.el.nativeElement.querySelectorAll('a[href^="/tool"]');
        if (links.length) {
            _.map(links, el => {
                if (el.hash) return; // Don't rewrite links with fragment ids
                var elClone = el.cloneNode(true);
                el.parentNode.replaceChild(elClone, el);
                elClone.addEventListener('click', e => {
                    e.preventDefault();
                    this.router.navigateByUrl(el.getAttribute('href'));
                });
            });
        }
    }
    ngOnDestroy() {
        this.sub && this.sub.unsubscribe();
    }
    getRelated(type, fromCollection) {
        return _.filter(_.map((this.module[type] || []).sort(), (slug) => fromCollection[slug]));
    }
}

