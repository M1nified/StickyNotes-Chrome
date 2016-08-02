'use strict';
module.exports = function(grunt){

    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-sass');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-babel');

    var dir_produce = 'build/produce';
    var dir_dev = 'build/dev';

    var files_js = [
        "appData/inAppProducts.js",
        "background/background.js",
        "background/buttons.js",
        "background/general_variables.js",
        "background/general.js",
        "background/shared.js",
        "background/background.js",
        "class/Content.js",
        "class/IndexedDB.js",
        "class/InTheNote.js",
        "class/Note.js",
        "class/Notes.js",
        "class/Notifications.js",
        "class/Speech2Text.js",
        "class/Sync.js",
        "class/SyncMethod.js",
        "class/SyncViaMethods.js",
        "class/Store.js",
        "class/SyncFileSystem.js",
        "class/TextFormat.js",
        "class/WindowManager.js",
        "note/_listeners.js",
        "note/note.js",
        "noteslauncher/noteslauncher.js",
        "options/general.js",
        "options/options.js",
        "store/purchase.js"
    ];
    var files_copy = [
        "manifest.json",
        "**/*.html",
        "**/*.min.js",
        "lib/buy.js",
        "lib/urlize.js",
        "img/*",
        "fonts/*"
    ];
    var files_sass = [
        "note/note.scss",
        "noteslauncher/noteslauncher.scss",
        "options/general.scss",
        "store/purchase.scss"
    ];

    grunt.initConfig({
        babel : {
            options:{
                presets:['es2015']
            },
            dev : {
                options:{
                    sourceMap : true
                },
                files:[
                    {
                        expand : true,
                        cwd : 'src',
                        src : files_js,
                        dest : dir_dev,
                        ext : '.es5.js'
                    }
                ]
            },
            produce : {
                options : {
                    sourceMap : false
                },
                files : [
                    {
                        expand : true,
                        cwd : 'src',
                        src : files_js,
                        dest : dir_produce,
                        ext : '.js'
                    }
                ]
            }
        },
        uglify : {
            options : {
                beautify : false
            },
            dev : {
                options:{
                    sourceMap : true
                },
                files : [
                    {
                        expand : true,
                        cwd : dir_dev,
                        src : [
                            '**/*.es5.js',
                            '!**/*.min.js',
                            '!lib/*'
                        ],
                        dest : dir_dev,
                        ext : '.js'
                    }
                ]
            },
            produce : {
                options : {
                    sourceMap : false
                },
                files : [
                    {
                        expand : true,
                        cwd : dir_produce,
                        src : [
                            '**/*.js',
                            '!**/*.min.js',
                            '!lib/*'
                        ],
                        dest : dir_produce,
                        ext : '.js'
                    }
                ]
            }
        },
        copy : {
            dev : {
                files : [
                    {
                        expand : true,
                        cwd : 'src',
                        src : files_copy,
                        dest : dir_dev
                    }
                ]
            },
            produce : {
                files : [
                    {
                        expand : true,
                        cwd : 'src',
                        src : files_copy,
                        dest : dir_produce
                    }
                ]
            }
        },
        sass : {
            options : {
                outputStyle : 'compressed'
            },
            dev : {
                options : {
                    sourceMap : true
                },
                files : [
                    {
                        expand : true,
                        cwd : 'src',
                        src : files_sass,
                        dest : dir_dev,
                        ext : '.css'
                    }
                ]
            },
            produce : {
                options : {
                    sourceMap : false
                },
                files : [
                    {
                        expand : true,
                        cwd : 'src',
                        src : files_sass,
                        dest : dir_produce,
                        ext : '.css'
                    }
                ]
            }
        }
    });

    grunt.registerTask('dev',['babel:dev','uglify:dev','copy:dev','sass:dev']);
    grunt.registerTask('produce',['babel:produce','uglify:produce','copy:produce','sass:produce']);


}