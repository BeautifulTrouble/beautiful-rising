// Configure SystemJS

(function(global) {
    var map = {
        '@angular':             'node_modules/@angular',
        'rxjs':                 'node_modules/rxjs',
        'elasticlunr':          'node_modules/elasticlunr',
        'lodash':               'node_modules/lodash',
        'markdown-it':          'node_modules/markdown-it/dist',
        'markdown-it-footnote': 'node_modules/markdown-it-footnote/dist'
    };

    var packages = {
        'app':                  { main: 'main.js', defaultExtension: 'js' },
        'rxjs':                 { defaultExtension: 'js' },
        'elasticlunr':          { main: 'elasticlunr.min.js' },
        'lodash':               { main: 'lodash.min.js' },
        'markdown-it':          { main: 'markdown-it.min.js' },
        'markdown-it-footnote': { main: 'markdown-it-footnote.min.js'}
    };
    [
        '@angular/common',
        '@angular/compiler',
        '@angular/core',
        '@angular/http',
        '@angular/platform-browser',
        '@angular/platform-browser-dynamic',
        '@angular/router',
        '@angular/router-deprecated',
        '@angular/testing',
        '@angular/upgrade'
    ].forEach(function(pkg) {
        packages[pkg] = { main: 'index.js', defaultExtension: 'js' };
    });

    var config = {map: map, packages: packages};
    if (global.filterSystemConfig) { 
        global.filterSystemConfig(config); 
    }
    System.config(config);
})(this);

