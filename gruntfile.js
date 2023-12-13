module.exports = function(grunt) {

    const sass = require('node-sass');

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        config: {
            root: ''
        },
        jsResources: [
            '<%= config.root %>js/plugins/scrolltrigger.js',
            // '<%= config.root %>js/basics/menu.js',
            '<%= config.root %>js/basics/custom.js',
            //'<%= config.root %>js/basics/api.js',
        ],
        cssResources: [],

        sass: {
            dist: {
                options: {
                    implementation: sass,
                    sourceMap: true,
                    outputStyle: 'compressed'
                },
                files: {
                    '<%= config.root %>public/build/style.min.css' : '<%= config.root %>css/scss/style.scss',
                    '<%= config.root %>public/build/font.min.css' : '<%= config.root %>css/scss/font.scss',
                    '<%= config.root %>public/build/media-library.min.css' : '<%= config.root %>css/scss/media-library.scss',
                }
            }
        },
        watch: {
            css: {
                files: [ '<%= config.root %>css/scss/**/*.scss'],
                tasks: ['sass:dist'],
            },
            js: {
                files: ['<%= config.root %>js/basics/*.js','<%= config.root %>js/plugins/*.js'],
                tasks: ['concat', 'uglify'] // , 'uglify' // wieder rein wenns in die heiße phase geht, ne
            }
        },
        concat: {
            dist: {
                src: [ '<%= jsResources %>' ],
                dest: '<%= config.root %>public/build/combined.min.js',
                options: {
                    separator: ';'
                }
            }
        },
        uglify: {
            js: {
                files: {
                    '<%= config.root %>public/build/combined.min.js': [ '<%= config.root %>public/build/combined.min.js' ]
                }
            }
        },
        copy: {
            main: {
                files: [
                    {
                        expand: true,
                        cwd: '<%= config.root %>',
                        src: ['css/images/**'],
                        dest: '<%= config.root %>public/build/'
                    },
                    {
                        expand: true,
                        cwd: '<%= config.root %>',
                        src: ['css/fonts/**'],
                        dest: '<%= config.root %>public/build/'
                    }
                ]
            }
        }
    });

    grunt.event.on('watch', function(action, filepath, target) {
        grunt.log.writeln(target + ': ' + filepath + ' has ' + action);
    });

    grunt.registerTask('default',[ 'concat', 'uglify', 'sass:dist', 'copy:main', 'watch']);


    grunt.loadNpmTasks('grunt-sass');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-copy');
}