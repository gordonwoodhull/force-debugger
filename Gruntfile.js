module.exports = function (grunt) {
    'use strict';

    require('load-grunt-tasks')(grunt, {
        pattern: ['grunt-*', '!grunt-lib-phantomjs', '!grunt-template-jasmine-istanbul']
    });
    require('time-grunt')(grunt);

    var config = {
        web: 'web',
        pkg: require('./package.json'),
        jsFiles: module.exports.jsFiles,
        jsWorkerFiles: [
            'src/generate_objects.js',
            'src/cola-worker.js'
        ]
    };

    grunt.initConfig({
        conf: config,
        watch: {
            web: {
                files: ['*.js', '*.css'],
                tasks: ['copy']
            },
            reload: {
                files: ['<%= conf.pkg.name %>.js',
                    '<%= conf.pkg.name %>css',
                    '<%= conf.web %>/js/<%= conf.pkg.name %>.js',
                    '<%= conf.web %>/css/<%= conf.pkg.name %>.css',
                    '<%= conf.pkg.name %>.min.js'],
                options: {
                    livereload: true
                }
            }
        },
        connect: {
            server: {
                options: {
                    port: process.env.PORT || 8888,
                    base: '.'
                }
            }
        },
        copy: {
            'dc-to-gh': {
                files: [
                    {
                        expand: true,
                        flatten: true,
                        nonull: true,
                        src: [
                            'force-debugger.css'
                        ],
                        dest: '<%= conf.web %>/css/'
                    },
                    {
                        expand: true,
                        flatten: true,
                        nonull: true,
                        src: [
                            'force-debugger.js',
                            'node_modules/d3/build/d3.js'
                        ],
                        dest: '<%= conf.web %>/js/'
                    },
                    {
                        expand: true,
                        flatten: true,
                        nonull: true,
                        src: 'node_modules/d3-tip/index.js',
                        dest: '<%= conf.web %>/js/d3-tip/'
                    },
                    {
                        expand: true,
                        flatten: true,
                        nonull: true,
                        src: 'node_modules/d3-tip/examples/example-styles.css',
                        dest: '<%= conf.web %>/css/d3-tip/'
                    }
                ]
            }
        },
        'gh-pages': {
            options: {
                add: true,
                base: '<%= conf.web %>',
                message: 'Synced from from master branch.'
            },
            src: ['**']
        },
        shell: {
            hooks: {
                command: 'cp -n scripts/pre-commit.sh .git/hooks/pre-commit' +
                    ' || echo \'Cowardly refusing to overwrite your existing git pre-commit hook.\''
            }
        }
    });

    // custom tasks
    grunt.registerTask('merge', 'Merge a github pull request.', function (pr) {
        grunt.log.writeln('Merge Github Pull Request #' + pr);
        grunt.task.run(['shell:merge:' + pr, 'test' , 'shell:amend']);
    });
    grunt.registerTask('test-stock-example', 'Test a new rendering of the stock example web page against a ' +
        'baseline rendering', function (option) {
            require('./regression/stock-regression-test.js').testStockExample(this.async(), option === 'diff');
        });
    grunt.registerTask('update-stock-example', 'Update the baseline stock example web page.', function () {
        require('./regression/stock-regression-test.js').updateStockExample(this.async());
    });
    grunt.registerTask('watch:jasmine', function () {
        grunt.config('watch', {
            options: {
                interrupt: true
            },
            runner: grunt.config('watch').jasmineRunner,
            scripts: grunt.config('watch').scripts
        });
        grunt.task.run('watch');
    });

    // task aliases
    grunt.registerTask('web', ['copy', 'gh-pages']);
    grunt.registerTask('server', ['copy', 'connect:server', 'watch:web']);
};
