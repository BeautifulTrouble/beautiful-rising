// Configure SystemJS

(function(global) {
    var map = {
        '@angular':     'node_modules/@angular',
        'rxjs':         'node_modules/rxjs'
    };

    var packages = {
        'app':          { main: 'main.js', defaultExtension: 'js' },
        'rxjs':         { defaultExtension: 'js' }
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
        '@angular/upgrade',
    ].forEach(function(pkg) {
        packages[pkg] = { main: 'index.js', defaultExtension: 'js' };
    });

    var config = {map: map, packages: packages};
    if (global.filterSystemConfig) { 
        global.filterSystemConfig(config); 
    }
    System.config(config);
})(this);

