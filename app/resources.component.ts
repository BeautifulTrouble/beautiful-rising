
import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { ContentService } from './services';


@Component({
    selector: 'resources',
    template: `
    `
})
export class ResourcesComponent {
    constructor(
        private router: Router,
        private contentService: ContentService) {
    }
    ngOnInit() {
        this.contentService.injectContent(this);
    }
}


