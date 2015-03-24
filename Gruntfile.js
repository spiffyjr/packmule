// JS files to uglify
var js_files = {
    'www/build/app.min.js': [
        'www/app/shared/cordovahttp.js',

        'www/app/app.debug.js',
        'www/app/app.module.js',
        'www/app/app.route.js',

        'www/app/shared/AppCtrl.js',

        'www/app/shared/item/ItemService.js',
        'www/app/shared/layout/MenuCtrl.js',
        'www/app/shared/layout/RightNavCtrl.js',

        'www/app/shared/platform.js',
        'www/app/shared/util.js',

        'www/app/component/auth/LoginCtrl.js',
        'www/app/component/auth/LogoutCtrl.js',

        'www/app/component/bungie/AuthService.js',
        'www/app/component/bungie/BungieClient.js',
        'www/app/component/bungie/BungieService.js',

        'www/app/component/item/BucketListDirective.js',
        'www/app/component/item/ItemListDirective.js',
        'www/app/component/item/ItemFilters.js',

        'www/app/component/vault/VaultCtrl.js'
    ],
    'www/build/vendor.min.js': [
        'www/asset/js/thenBy.js',
        'www/asset/lib/hammerjs/hammer.js',
        'www/asset/lib/lodash/lodash.js',
        'www/asset/lib/angular/angular.js',
        'www/asset/lib/angular-animate/angular-animate.js',
        'www/asset/lib/angular-aria/angular-aria.js',
        'www/asset/lib/angular-hammer/angular-hammer.js',
        'www/asset/lib/angular-material/angular-material.js',
        'www/asset/lib/angular-ui-router/release/angular-ui-router.js'
    ]
};

// SASS files to compiled.
var scss_files = {
    'www/build/vendor.min.css': 'www/asset/scss/vendor.scss',
    'www/build/style.min.css': 'www/asset/scss/style.scss'
};

// Used to copy files from .css to .scss so they can be included with SASS.
var css_to_scss_file = [
    'www/asset/lib/angular-material/angular-material'
];

module.exports = function(grunt) {
    var copy_files = [];
    for (var i = 0 ; i < css_to_scss_file.length; i++) {
        var file = css_to_scss_file[i];
        copy_files.push({src: file + '.css', dest: file + '.scss'});
    }

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        env : {
            dev : {
                NODE_ENV : 'DEVELOPMENT'
            },
            prod : {
                NODE_ENV : 'PRODUCTION'
            }
        },
        copy: {
            default: {
                files: copy_files
            }
        },
        htmlmin: {
            default: {
                options: {
                    removeComments: true,
                    collapseWhitespace: true
                },
                files: [
                    {
                        expand: true,
                        dot: false,
                        cwd: 'www/app',
                        dest: 'www/build',
                        src: '**/*.html'
                    }
                ]
            }
        },
        preprocess : {
            default : {
                src : 'www/index.html.tpl',
                dest : 'www/index.html'
            }
        },
        sass: {
            dev: {
                options: {
                    style: 'nested'
                },
                files: scss_files
            },
            prod: {
                options: {
                    style: 'compressed'
                },
                files: scss_files
            }
        },
        uglify: {
            options: {
                screwIE8: true,
                mangle: false,
                dead_code: true,
                compress: {
                    drop_console: true,
                    drop_debugger: true,
                    global_defs: {
                        'DEBUG': false
                    },
                    dead_code: true
                }
            },
            default: {
                files: js_files
            }
        },
        watch: {
            dev: {
                files: ['www/asset/scss/*.scss'],
                tasks: ['sass:dev'],
                options: {
                    spawn: false
                }
            }
        }
    });

    // Load the plugin that provides the "uglify" task.
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-htmlmin');
    grunt.loadNpmTasks('grunt-contrib-sass');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-env');
    grunt.loadNpmTasks('grunt-preprocess');
    grunt.loadTasks('tasks');

    // Default task(s).
    grunt.registerTask('default', ['dev']);
    grunt.registerTask('dev', ['copy', 'env:dev', 'preprocess', 'sass:dev', 'watch']);
    grunt.registerTask('prod', ['copy', 'env:prod', 'preprocess', 'htmlmin', 'uglify', 'sass:prod']);

    grunt.registerTask('download', 'Compiles def files', function() {
        var AdmZip = require('adm-zip');
        var fs = require('fs');
        var request = require('request');
        var async = require('async');
        var sqlite3 = require('sqlite3').verbose();
        var done = this.async();

        async.waterfall(
            [
                function(next) {
                    request.get({ url: 'http://www.bungie.net/platform/Destiny/Manifest/', json: true }, function (e, r, body) {
                        var path = body.Response.mobileWorldContentPaths.en;
                        var dbname = path.split('/'); dbname = dbname[dbname.length - 1];
                        var dbpath = 'tmp/' + dbname;

                        var pathParts = path.replace('.content', '').split('_');
                        var hash = pathParts[pathParts.length - 1].substring(0, 8);
                        var zipname = 'tmp/' + hash + '.zip';

                        fs.exists(dbpath, function(exists) {
                            if (exists) {
                                console.log('File already exists, skipping...');
                                next(null, dbpath);
                            } else {
                                var dlRequest = request('http://www.bungie.net' + path);
                                dlRequest
                                    .on('response', function(res) {
                                        res.pipe(fs.createWriteStream(zipname));
                                    })
                                    .on('end', function() {
                                        console.log('Download complete, unzipping...');

                                        var zip = new AdmZip(zipname);
                                        zip.extractAllToAsync('tmp/', true, function() {
                                            fs.unlink(zipname);
                                            next(null, dbpath);
                                        });
                                    });
                            }
                        });
                    });
                },
                function(dbpath, next) {
                    console.log('Opening database ' + dbpath);
                    next(null, new sqlite3.Database(dbpath));
                },
                function(db, next) {
                    var defs = {};
                    db.each('SELECT * FROM DestinyInventoryItemDefinition', function(err, row) {
                        try {
                            var json = JSON.parse(row.json);
                            defs[json.itemHash] = {
                                itemName: json.itemName,
                                itemType: json.itemType,
                                tierType: json.tierType,
                                tierTypeName: json.tierTypeName,
                                bucketTypeHash: json.bucketTypeHash,
                                icon: json.icon
                            };
                        } catch (e) {
                        }
                    }, function() {
                        console.log('Writing ' + (Object.keys(defs).length) + ' item definitions');
                        fs.writeFile('www/asset/json/item-defs.json', JSON.stringify(defs), function(err) {
                            if (err) {
                                return next(err);
                            }
                            next(null, db);
                        });
                    });
                },
                function(db, next) {
                    var defs = {};
                    db.each('SELECT * FROM DestinyInventoryBucketDefinition', function(err, row) {
                        try {
                            var json = JSON.parse(row.json);
                            defs[json.bucketHash] = {
                                bucketName: json.bucketName,
                                bucketOrder: json.bucketOrder,
                                bucketIdentifier: json.bucketIdentifier,
                                category: json.category
                            };
                        } catch (e) {
                        }
                    }, function() {
                        console.log('Writing ' + (Object.keys(defs).length) + ' bucket definitions');
                        fs.writeFile('www/asset/json/bucket-defs.json', JSON.stringify(defs), function(err) {
                            if (err) {
                                return next(err);
                            }
                            next(null, db);
                        });
                    });
                }
            ],
            function(err, db) {
                if (err) {

                } else {
                    db.close();
                    console.log('Finished!');
                }

                done();
            }
        );
    });
};
