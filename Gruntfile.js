'use strict';
module.exports = function(grunt){

    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-sass');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-babel');

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
        "lib/buy.js"
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
                        dest : 'build/dev',
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
                        dest : 'build/produce',
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
                        cwd : 'build/dev',
                        src : [
                            '**/*.es5.js',
                            '!**/*.min.js',
                            '!lib/*'
                        ],
                        dest : 'build/dev',
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
                        cwd : 'build/produce',
                        src : [
                            '**/*.js',
                            '!**/*.min.js',
                            '!lib/*'
                        ],
                        dest : 'build/produce',
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
                        dest : 'build/dev'
                    }
                ]
            },
            produce : {
                files : [
                    {
                        expand : true,
                        cwd : 'src',
                        src : files_copy,
                        dest : 'build/produce'
                    }
                ]
            }
        }
    });

    grunt.registerTask('dev',['babel:dev','uglify:dev','copy:dev'])
    grunt.registerTask('produce',['babel:produce','uglify:produce','copy:produce'])

}