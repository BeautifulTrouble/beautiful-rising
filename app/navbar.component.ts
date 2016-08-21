
import { Component, Input, ViewChild } from '@angular/core';
import { Router } from '@angular/router';


@Component({
    selector: 'navbar',
    template: `
        <div *ngIf="textBySlug">
            <div id="fixed-nav" class="fixed-container-wrapper">
                <div class="container">
                    <div class="row">
                        <div class="col-xs-3 col-md-1" [class.col-sm-2]="!visible" [class.col-sm-3]="visible">
                            <div *ngIf="!visible" (click)="visible = true" class="menu-toggle clickable">
                                <svg-inline class="open-icon" src="/assets/img/hamburger.svg"></svg-inline>
                                <h4>{{ textBySlug.ui.menu.title }}</h4>
                            </div>
                            <svg-inline *ngIf="visible" class="close-icon clickable" (click)="visible = false" src="/assets/img/close.svg"></svg-inline>
                        </div>
                        <div class="col-xs-9 col-sm-6 col-md-9">
                            <div class="logo-wrapper" [class.modified-background]="visible" [class.shifted]="!visible">
                                <img (click)="nav([''])" class="logo clickable" src="/assets/img/logo-en.png">
                            </div>
                        </div>
                    </div>
                    <div *ngIf="visible" class="row">
                        <div class="overlay" [class.visible]="visible" (click)="visible = false"></div>
                        <div class="col-xs-12 col-md-3 col-lg-3 menu-outer" (click)="$event.stopPropagation()">
                            <div class="menu">
                                <div class="col-md-12 menu-heading"></div>
                                <div class="menu-sections">
                                    <div class="menu-section row">
                                        <div class="col-xs-8 col-xs-offset-2 col-sm-6 col-sm-offset-3 col-md-12 col-md-offset-0">
                                            <p class="clickable" (click)="nav([''])">{{ textBySlug.ui.menu.home }}</p>
                                        </div>
                                    </div>
                                    <div class="menu-section row">
                                        <div class="col-xs-8 col-xs-offset-2 col-sm-6 col-sm-offset-3 col-md-12 col-md-offset-0">
                                            <h3 class="clickable" (click)="nav(['/about'])">{{ textBySlug.ui.menu.about }}</h3>
                                            <p class="clickable" (click)="nav(['/about', 'whats-inside'])">{{ textBySlug.ui.menu['whats-inside'] }}</p>
                                            <p class="clickable" (click)="nav(['/about', 'process'])">{{ textBySlug.ui.menu.process }}</p>
                                            <p class="clickable" (click)="nav(['/about', 'values'])">{{ textBySlug.ui.menu.values }}</p>
                                            <p class="clickable" (click)="nav(['/about', 'advisory-network'])">{{ textBySlug.ui.menu['advisory-network'] }}</p>
                                            <p class="clickable" (click)="nav(['/about', 'team'])">{{ textBySlug.ui.menu.team }}</p>
                                            <p class="clickable" (click)="nav(['/about', 'beautiful-trouble-and-action-aid'])">{{ textBySlug.ui.menu['beautiful-trouble-and-action-aid'] }}</p>
                                            <p class="clickable" (click)="nav(['/about', 'partners'])">{{ textBySlug.ui.menu.partners }}</p>
                                            <p class="clickable" (click)="nav(['/about', 'faq'])">{{ textBySlug.ui.menu.faq }}</p>
                                        </div>
                                    </div>
                                    <div class="menu-section row">
                                        <div class="col-xs-8 col-xs-offset-2 col-sm-6 col-sm-offset-3 col-md-12 col-md-offset-0">
                                            <h3 class="clickable" (click)="nav(['/platforms'])">{{ textBySlug.ui.menu.platforms }}</h3>
                                            <em>{{ textBySlug.ui.menu.explore }}</em>
                                            <p class="clickable" (click)="nav(['/platforms', 'chatbot'])">{{ textBySlug.ui.menu.chatbot }}</p>
                                            <p class="clickable" (click)="nav(['/platforms', 'game'])">{{ textBySlug.ui.menu.game }}</p>
                                            <p class="clickable" (click)="nav(['/platforms', 'pdf'])">{{ textBySlug.ui.menu.pdf }}</p>
                                        </div>
                                    </div>
                                    <div class="menu-section row">
                                        <div class="col-xs-8 col-xs-offset-2 col-sm-6 col-sm-offset-3 col-md-12 col-md-offset-0">
                                            <h3 class="clickable" (click)="nav(['/contribute'])">{{ textBySlug.ui.menu.contribute }}</h3>
                                            <p class="clickable" (click)="nav(['/contribute', 'how-it-works'])">{{ textBySlug.ui.menu['how-it-works'] }}</p>
                                        </div>
                                    </div>
                                    <!--
                                    <div class="menu-section">
                                        <div class="col-xs-8 col-xs-offset-2 col-sm-6 col-sm-offset-3 col-md-12 col-md-offset-0">
                                            <h3 class="clickable" (click)="nav(['/resources'])">{{ textBySlug.ui.menu['training-and-resources'] }}</h3>
                                            <p class="clickable" (click)="nav(['/resources', 'training'])">{{ textBySlug.ui.menu.training }}</p>
                                            <p class="clickable" (click)="nav(['/resources', 'other'])">{{ textBySlug.ui.menu.other }}</p>
                                        </div>
                                    </div>
                                    -->
                                    <div class="menu-section row">
                                        <div class="col-xs-8 col-xs-offset-2 col-sm-6 col-sm-offset-3 col-md-12 col-md-offset-0">
                                            <h3>{{ textBySlug.ui.menu['contact-us'] }}</h3>
                                            <a class="email" href="mailto:{{ textBySlug.ui.misc['contact-email'] }}">{{ textBySlug.ui.misc['contact-email'] }}</a>
                                            <a href="{{ textBySlug.ui.misc['twitter-link'] }}" target="_blank" style="color: white"><svg-inline src="/assets/img/Twitter.svg"></svg-inline></a>
                                            <a href="{{ textBySlug.ui.misc['facebook-link'] }}" target="_blank" style="color: white"><svg-inline src="/assets/img/facebook.svg"></svg-inline></a>
                                            <div></div>
                                            <br>
                                            <!--
                                            <p class="subscribe-note">Subscribe to our newsletter</p>
                                            <div class="form-wrapper">
                                                <input placeholder="{{ textBySlug.ui.misc['placeholder-email'] }}">
                                                <span class="submit clickable">{{ textBySlug.ui.menu.submit }}</span>
                                            </div>
                                            -->
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `
})
export class NavbarComponent {
    @ViewChild('menu') menu;
    @Input() textBySlug;
    visible = false;
    lastScrollTop = 0;

    constructor(private router: Router) { }
    nav(linkParam) {
        this.router.navigate(linkParam);
        this.visible = false;
    }
}

