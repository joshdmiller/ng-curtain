module.exports = function ( grunt ) {
  
  /** 
   * Load required Grunt tasks. These are installed based on the versions listed
   * in `package.json` when you do `npm install` in this directory.
   */
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-karma');
  grunt.loadNpmTasks('grunt-ngmin');
  grunt.loadNpmTasks('grunt-recess');

  /**
   * This is the configuration object Grunt uses to give each plugin its 
   * instructions.
   */
  grunt.initConfig({
    /**
     * The directory to which we throw our compiled project files.
     */
    build_dir: 'build',

    /**
     * We read in our `package.json` file so we can access the package name and
     * version. It's already there, so we don't repeat ourselves here.
     */
    pkg: grunt.file.readJSON("package.json"),

    /**
     * The banner is the comment that is placed at the top of our compiled 
     * source files. It is first processed as a Grunt template, where the `<%=`
     * pairs are evaluated based on this very configuration object.
     */
    meta: {
      banner: 
        '/**\n' +
        ' * <%= pkg.title || pkg.name %> - v<%= pkg.version %> - <%= grunt.template.today("yyyy-mm-dd") %>\n' +
        ' * <%= pkg.homepage %>\n' +
        ' *\n' +
        ' * Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author %>\n' +
        ' * Licensed <%= pkg.licenses.type %> <<%= pkg.licenses.url %>>\n' +
        ' */\n'
    },

    /**
     * This is a collection of file definitions we use in the configuration of
     * build tasks. `js` is all project javascript, less tests. `atpl` contains
     * our reusable components' template HTML files, while `ctpl` contains the
     * same, but for our app's code. `html` is just our main HTML file and 
     * `less` is our main stylesheet.
     */
    app_files: {
      js: [ 'src/*.js', '!src/*.spec.js' ], 
      html: [ 'src/index.html' ],
      less: 'src/main.less',
      unit: [ 'src/*.spec.js' ]
    },

    /**
     * This is also a collection of file definitions we use in the
     * configuration of build tasks, but it differs from the `src` property in
     * that these values are entirely user-defined. While the `src` property
     * ensures all standardized files are collected for compilation, it is the
     * user's job to ensure non-standardized (i.e. vendor-related) files are
     * handled appropriately.
     *
     * The `vendor.js` property holds files to be automatically concatenated
     * and minified with our project source files.
     */
    vendor_files: {
      js: [
        'vendor/angular-unstable/angular.js',
        'vendor/placeholders/angular-placeholders-0.0.1-SNAPSHOT.min.js'
      ]
    },

    /**
     * The directory to delete when `grunt clean` is executed.
     */
    clean: [ '<%= build_dir %>' ],

    /**
     * `grunt concat` concatenates multiple source files into a single file.
     */
    concat: {
      /**
       * The `dist` target is the concatenation of our application source code
       * into a single file. All files matching what's in the `src.js`
       * configuration property above will be included in the final build.
       *
       * In addition, the source is surrounded in the blocks specified in the
       * `module.prefix` and `module.suffix` files, which are just run blocks
       * to ensure nothing pollutes the global scope.
       *
       * The `options` array allows us to specify some customization for this
       * operation. In this case, we are adding a banner to the top of the file,
       * based on the above definition of `meta.banner`. This is simply a 
       * comment with copyright informaiton.
       */
      dist: {
        options: {
          banner: '<%= meta.banner %>'
        },
        src: [ 'module.prefix', '<%= app_files.js %>', 'module.suffix' ],
        dest: '<%= build_dir %>/<%= pkg.name %>.js'
      },

      /**
       * The `libs` target is for all third-party libraries we need to include
       * in the final distribution. They will be concatenated into a single
       * `libs.js` file.  One could combine this with the above for a single
       * payload, but then concatenation order will obviously be important to
       * get right.
       */
      libs: {
        src: [ '<%= vendor_files.js %>' ],
        dest: '<%= build_dir %>/libs.js'
      }
    },

    /**
     * Use ng-min to annotate the sources before minifying
     */
    ngmin: {
      dist: {
        src: [ '<%= build_dir %>/<%= pkg.name %>.js' ],
        dest: '<%= build_dir %>/<%= pkg.name %>.annotated.js'
      }
    },

    /**
     * Minify the sources!
     */
    uglify: {
      options: {
        banner: '<%= meta.banner %>'
      },
      dist: {
        files: {
          '<%= build_dir %>/<%= pkg.name %>.min.js': [ '<%= build_dir %>/<%= pkg.name %>.annotated.js' ]
        }
      }
    },

    /**
     * recess handles our LESS compilation and uglification automatically. Only
     * our `main.less` file is included in compilation; all other files must be
     * imported from this file.
     */
    recess: {
      build:  {
        src: [ '<%= app_files.less %>' ],
        dest: '<%= build_dir %>/<%= pkg.name %>.css',
        options: {
          compile: true,
          compress: false,
          noUnderscores: false,
          noIDs: false,
          zeroUnits: false
        }
      }
    },

    /**
     * `jshint` defines the rules of our linter as well as which files we should
     * check. This file, all java script sources, and all our unit tests are
     * linted based on the policies listed in `options`. But we can allow 
     * specify exclusionary patterns for external components by prefixing them
     * with an exclamation point (!).
     */
    jshint: {
      src: [ 
        'Gruntfile.js', 
        '<%= app_files.js %>', 
        '<%= app_files.unit %>'
      ],
      test: [
        '<%= app_files.unit %>'
      ],
      gruntfile: [
        'Gruntfile.js'
      ],
      options: {
        curly: true,
        immed: true,
        newcap: true,
        noarg: true,
        sub: true,
        boss: true,
        eqnull: true
      },
      globals: {}
    },

    /**
     * The Karma configurations.
     */
    karma: {
      options: {
        configFile: 'karma/karma-unit.js'
      },
      unit: {
        background: true
      },
      continuous: {
        singleRun: true
      }
    },

    /**
     * And for rapid development, we have a watch set up that checks to see if
     * any of the files listed below change, and then to execute the listed 
     * tasks when they do. This just saves us from having to type "grunt" into
     * the command-line every time we want to see what we're working on; we can
     * instead just leave "grunt watch" running in a background terminal. Set it
     * and forget it, as Ron Popeil used to tell us.
     *
     * But we don't need the same thing to happen for all the files. 
     */
    delta: {
      /**
       * By default, we want the Live Reload to work for all tasks; this is
       * overridden in some tasks (like this file) where browser resources are
       * unaffected. It runs by default on port 35729.
       */
      options: {
        livereload: true
      },

      /**
       * When the Gruntfile changes, we just want to lint it. That said, the
       * watch will have to be restarted if it should take advantage of any of
       * the changes.
       */
      gruntfile: {
        files: 'Gruntfile.js',
        tasks: [ 'jshint:gruntfile' ],
        options: {
          livereload: false
        }
      },

      /**
       * When our source files change, we want to run most of our build tasks
       * (excepting uglification).
       */
      src: {
        files: [ 
          '<%= app_files.js %>'
        ],
        tasks: [ 'jshint:src', 'karma:unit:run', 'concat:dist', 'ngmin:dist', 'uglify:dist' ]
      },

      /**
       * When index.html changes, we need to compile just it.
       */
      html: {
        files: [ '<%= app_files.html %>' ],
        tasks: [ 'index' ]
      },

      /**
       * When the CSS files change, we need to compile and minify just them.
       */
      less: {
        files: [ '<%= app_files.less %>' ],
        tasks: [ 'recess' ]
      },

      /**
       * When a unit test file changes, we only want to linit it and run the
       * unit tests.
       */
      unittest: {
        files: [
          '<%= app_files.unit %>'
        ],
        tasks: [ 'jshint:test', 'karma:unit:run' ],
        options: {
          livereload: false
        }
      }
    }
  });

  /**
   * In order to make it safe to just compile or copy *only* what was changed,
   * we need to ensure we are starting from a clean, fresh build. So we rename
   * the `watch` task to `delta` (that's why the configuration var above is
   * `delta`) and then add a new task called `watch` that does a clean build
   * before watching for changes.
   */
  grunt.renameTask( 'watch', 'delta' );
  grunt.registerTask( 'watch', [ 'default', 'karma:unit', 'delta' ] );

  /**
   * The default task is to build.
   */
  grunt.registerTask( 'default', [ 'build' ] );
  grunt.registerTask( 'build', ['clean', 'jshint', 'karma:continuous', 'concat', 'ngmin:dist', 'uglify', 'recess', 'index'] );

  /**
   * A task to build the project, without some of the slower processes. This is
   * used during development and testing and is part of the `watch`.
   */
  grunt.registerTask( 'quick-build', ['clean', 'jshint', 'test', 'concat', 'recess', 'index'] );

  /** 
   * The index.html template includes the stylesheet and javascript sources
   * based on dynamic names calculated in this Gruntfile. This task compiles it.
   */
  grunt.registerTask( 'index', 'Process index.html template', function () {
    grunt.file.copy('src/index.html', grunt.config.get( 'build_dir' ) + '/index.html', { process: grunt.template.process });
  });

};
