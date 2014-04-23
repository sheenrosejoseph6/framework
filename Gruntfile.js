module.exports = function (grunt) {
  'use strict';

  // Force use of Unix newlines
  grunt.util.linefeed = '\n';

  RegExp.quote = function (string) {
    return string.replace(/[-\\^$*+?.()|[\]{}]/g, '\\$&')
  }

  var fs = require('fs')

  // Project configuration.
  grunt.initConfig({

    // Metadata.
    pkg: grunt.file.readJSON('package.json'),
    banner: '/*!\n' +
              ' * Framework v<%= pkg.version %> (<%= pkg.homepage %>)\n' +
              ' * \n' +
              ' * Copyright <%= grunt.template.today("yyyy") %> <%= pkg.author %>\n' +
              ' * http://opensource.org/licenses/MIT\n' +
              ' */\n',
    jqueryCheck: 'if (typeof jQuery === "undefined") { throw new Error("Bootstrap Javascript requires jQuery") }\n\n',

    // Task configuration.
    clean: {
      dist: 'dist'
    },

    less: {
      compileCore: {
        options: {
          strictMath: true,
          sourceMap: true,
          outputSourceFiles: true,
          sourceMapURL: '<%= pkg.name %>.css.map',
          sourceMapFilename: 'dist/css/<%= pkg.name %>.css.map'
        },
        files: {
          'dist/css/<%= pkg.name %>.css': 'less/strapit.less'
        }
      },
      minify: {
        options: {
          cleancss: true
        },
        files: {
          'dist/css/<%= pkg.name %>.min.css': 'dist/css/<%= pkg.name %>.css'
        }
      }
    },

    autoprefixer: {
      options: {
        browsers: ['last 2 versions', 'ie 8', 'ie 9', 'android 2.3', 'android 4', 'opera 12']
      },
      core: {
        options: {
          map: true
        },
        src: 'css/framework.css'
      }
    },

    csslint: {
      options: {
        csslintrc: 'less/.csslintrc'
      },
      src: [
        'dist/css/<%= pkg.name %>.css',
      ]
    },

    cssmin: {
      maincompress: {
        options: {
          keepSpecialComments: '*',
          noAdvanced: true, // turn advanced optimizations off until the issue is fixed in clean-css
          report: 'min',
          selectorsMergeMode: 'ie8'
        },
        src: [
          'dist/css/<%= pkg.name %>.css'
        ],
        dest: 'dist/css/<%= pkg.name %>.min.css'
      }
    },

    usebanner: {
      dist: {
        options: {
          position: 'top',
          banner: '<%= banner %>'
        },
        files: {
          src: [
            'dist/css/<%= pkg.name %>.css',
            'dist/css/<%= pkg.name %>.min.css'
          ]
        }
      }
    },

    csscomb: {
      options: {
        config: 'sass/.csscomb.json'
      },
      dist: {
        expand: true,
        cwd: 'css/',
        src: ['*.css', '!*.min.css'],
        dest: 'css/'
      }
    },

    connect: {
      server: {
        options: {
          port: 3000,
          base: '.'
        }
      }
    },

    watch: {
      reloader: {
        files: 'docs/*.html',
        options: {
          livereload: true
        }
      },
      less: {
        files: ['less/*.less', 'less/*/*.less'],
        tasks: ['less', 'csscomb', 'cssmin:maincompress', 'usebanner', 'copy:docs'],
        options: {
          livereload: true
        }
      }
    },

    sass: {
      dist: {
        options: {
          style: 'expanded'
        },
        files: {
          'css/framework.css': 'sass/app.scss'
        }
      }
    },

    sed: {
      versionNumber: {
        pattern: (function () {
          var old = grunt.option('oldver')
          return old ? RegExp.quote(old) : old
        })(),
        replacement: grunt.option('newver'),
        recursive: true
      }
    }

  });


  // These plugins provide necessary tasks.
  require('load-grunt-tasks')(grunt, {scope: 'devDependencies'});

  // CSS distribution task.
  grunt.registerTask('dist-css', ['sass:dist', 'autoprefixer', 'csscomb']);

  // Full distribution task.
  grunt.registerTask('dist', ['clean', 'dist-css']);

  // Default task.
  grunt.registerTask('default', ['dist']);

  // Version numbering task.
  // grunt change-version-number --oldver=A.B.C --newver=X.Y.Z
  // This can be overzealous, so its changes should always be manually reviewed!
  grunt.registerTask('change-version-number', ['sed']);

};