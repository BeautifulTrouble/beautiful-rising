
import { Component, Input, ViewChild } from '@angular/core';
import { Router } from '@angular/router';


@Component({
    selector: 'menu',
    template: `
        <div (click)="visible = !visible" class="menu-toggle clickable">
            <img [class.visible]="visible" class="close-icon" src="/assets/img/close.png">
            <svg-inline class="open-icon" src="/assets/img/hamburger.svg"></svg-inline>
            <h4>Menu</h4>
        </div>
        <div *ngIf="textBySlug && visible">
            <div (click)="visible = !visible" class="overlay" [class.visible]="visible"></div>
            <div class="menu-outer">
                <div class="menu">
                    <div #menu class="menu-inner">
                        <div class="menu-top"></div>
                        <div (window:scroll)="onScroll()" class="menu-scroll">
                            <div class="menu-section">
                                <!-- wait for https://github.com/angular/angular/pull/9792 to add routerLinkActive -->
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
                            <div class="menu-section">
                                <h3 class="clickable" (click)="nav(['/platforms'])">{{ textBySlug.ui.menu.platforms }}</h3>
                                <em>{{ textBySlug.ui.menu.explore }}</em>
                                <p class="clickable" (click)="nav(['/platforms', 'chatbot'])">{{ textBySlug.ui.menu.chatbot }}</p>
                                <p class="clickable" (click)="nav(['/platforms', 'game'])">{{ textBySlug.ui.menu.game }}</p>
                                <p class="clickable" (click)="nav(['/platforms', 'pdf'])">{{ textBySlug.ui.menu.pdf }}</p>
                            </div>
                            <div class="menu-section">
                                <h3 class="clickable" (click)="nav(['/contribute'])">{{ textBySlug.ui.menu.contribute }}</h3>
                                <p class="clickable" (click)="nav(['/contribute', 'how-it-works'])">{{ textBySlug.ui.menu['how-it-works'] }}</p>
                            </div>
                            <!--
                            <div class="menu-section">
                                <h3 class="clickable" (click)="nav(['/resources'])">{{ textBySlug.ui.menu['training-and-resources'] }}</h3>
                                <p class="clickable" (click)="nav(['/resources', 'training'])">{{ textBySlug.ui.menu.training }}</p>
                                <p class="clickable" (click)="nav(['/resources', 'other'])">{{ textBySlug.ui.menu.other }}</p>
                            </div>
                            -->
                            <div class="menu-section">
                                <h3>{{ textBySlug.ui.menu['contact-us'] }}</h3>
                                <a class="email" href="mailto:{{ textBySlug.ui.misc['contact-email'] }}">{{ textBySlug.ui.misc['contact-email'] }}</a>
                                <a href="{{ textBySlug.ui.misc['twitter-link'] }}" target="_blank" style="color: white"><svg-inline src="/assets/img/Twitter.svg"></svg-inline></a>
                                <a href="{{ textBySlug.ui.misc['facebook-link'] }}" target="_blank" style="color: white"><svg-inline src="/assets/img/facebook.svg"></svg-inline></a>

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
    `
})
export class MenuComponent {
    @ViewChild('menu') menu;
    @Input() textBySlug;
    visible = false;
    lastScrollTop = 0;

    constructor(private router: Router) { }
    nav(linkParam) {
        this.router.navigate(linkParam);
        this.visible = false;
    }
    onScroll() {
        var scrollTop = document.body.scrollTop;
        if (scrollTop != this.lastScrollTop) {
            this.menu.nativeElement.scrollTop = this.menu.nativeElement.scrollTop + (scrollTop - this.lastScrollTop);
            this.lastScrollTop = scrollTop;
        }
    }
}

