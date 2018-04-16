module.exports = function(grunt) {

  grunt.initConfig({

    babel: {
      options: {
          presets: ['es2015'],
      },

      dist: {
          dest: 'src/js/script.es5.js',  // Notice
          src: 'src/js/script.js',
      },
    },

    uglify: {
      options: {
        mangle: false
      },
      my_target: {
        files: {
          'dist/app.min.js': ['node_modules/knockout/build/output/knockout-latest.js', 'src/js/script.es5.js']
        }
      }
    },

    cssmin: {
      compress: {
          files: {
              'dist/app.css': [
                  'src/css/styles.css',
              ]
          }
      }
    },

    targethtml: {
      dist: {
          src: 'src/index.html',
          dest: 'dist/index.html'
      }
    },

    connect: {
      server: {
        options: {
          hostname: 'localhost',
          port: 3000,
          base: 'dist/',
          livereload: true
        }
     },
   },

   watch: {
     options: {
       spawn: false,
       livereload: true
     },
     scripts: {
       files: ['src/*.html',
       'src/js/script.js',
       'src/css/*.css'],
       tasks: ['babel', 'uglify', 'cssmin', 'targethtml']
     }
   },

  });

  grunt.loadNpmTasks('grunt-babel');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-targethtml');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.registerTask('default', ['babel', 'uglify', 'cssmin', 'targethtml', 'connect', 'watch']);
};
