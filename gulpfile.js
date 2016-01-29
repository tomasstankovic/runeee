var gulp = require('gulp'),
  args = require('yargs').argv,
  autoprefixer = require('gulp-autoprefixer'),
  bump = require('gulp-bump'),
  imagemin = require('gulp-imagemin'),
  jshint = require('gulp-jshint'),
  livereload = require('gulp-livereload'),
  minifyCSS = require('gulp-minify-css'),
  mocha = require('gulp-mocha'),
  nib = require('nib'),
  nodemon = require('gulp-nodemon'),
  plumber = require('gulp-plumber'),
  rimraf = require('gulp-rimraf'),
  runSequence = require('run-sequence'),
  shell = require('gulp-shell'),
  size = require('gulp-size'),
  stylus = require('gulp-stylus'),
  git = require('gulp-git'),
  uglify = require('gulp-uglify'),
  pngquant = require('imagemin-pngquant'),
  webpack = require('gulp-webpack'),
  webpackLib = require('webpack');

var VERSION;

var paths = {
  scriptsFrontend: ['./client/js/**/*.js'],
  scripts: [
    './client/js/**/*.js',
    '!./client/js/lib/**/*.js',
    '!./client/js/bower_components/**/*.js',
    './server/**/*.js'
  ],
  images: './client/img/**/*.{png,jpg,jpeg,gif}',
  stylus: ['./client/css/app.styl'],
  css: ['./build/css/app.css']
};

gulp.task('clean', function() {
  return gulp.src(['./build/js', './build/css', './build/deps.js'], {
      read: false
    })
    .pipe(rimraf({
      force: true
    }));
});

gulp.task('clean-js', function() {
  return gulp.src(['./build/js'], {
      read: false
    })
    .pipe(rimraf({
      force: true
    }));
});

gulp.task('clean-all', function() {
  return gulp.src('./build', {
      read: false
    })
    .pipe(rimraf({
      force: true
    }));
});

gulp.task('copy-js', function() {
  return gulp.src(paths.scriptsFrontend)
    .pipe(gulp.dest('./build/js'));
});

gulp.task('imagemin', function() {
  return gulp.src(paths.images)
    .pipe(imagemin({
      progressive: true,
      use: [pngquant()]
    }))
    .pipe(gulp.dest('./build/img'));
});

gulp.task('image-copy', function() {
  return gulp.src(paths.images)
    .pipe(gulp.dest('./build/img'));
});

gulp.task('jshint', function() {
  return gulp.src(paths.scripts)
    .pipe(jshint())
    .pipe(jshint.reporter('jshint-stylish'));
});

gulp.task('minify-css', function() {
  return gulp.src(paths.css)
    .pipe(minifyCSS())
    .pipe(gulp.dest('./build/css'));
});

gulp.task('stylus', function() {
  return gulp.src(paths.stylus)
    .pipe(plumber())
    .pipe(stylus({
      errors: true,
      use: [nib()]
    }))
    .pipe(autoprefixer(['> 1%', 'last 2 versions', 'Firefox ESR', 'Opera 12.1', 'ie 8', 'ie 9']))
    .pipe(size({
      showFiles: true
    }))
    .pipe(size({
      showFiles: true,
      gzip: true
    }))
    .pipe(gulp.dest('./build/css'));
});

gulp.task('set-ulimit', shell.task([
  'ulimit -n 10240'
]));

gulp.task('test', function() {
  return gulp.src('test/**/*.test.js', {
      read: false
    })
    .pipe(mocha({
      reporter: 'spec'
    }));
});

gulp.task('test-deployed', function() {
  return gulp.src('test/**/*.test.js', {
      read: false
    })
    .pipe(mocha({
      reporter: 'spec'
    }))
    .once('end', function() {
      process.exit();
    });
});

gulp.task('uglify', function() {
  return gulp.src('./build/js/build-dev.js')
    .pipe(uglify())
    .pipe(gulp.dest('./build/js'));
});

gulp.task('webpack', function() {
  return gulp.src('./client/js/main.js')
    .pipe(webpack({
      output: {
        filename: 'build-dev.js'
      },
      alias: {
        moment: 'moment/moment.js'
      },
      plugins: (function() {
        var plugins = [];
        plugins.push(

          new webpackLib.optimize.DedupePlugin(),
          new webpackLib.optimize.OccurenceOrderPlugin(),
          new webpackLib.ContextReplacementPlugin(/moment[\/\\]locale$/, /en|sk/),

          new webpackLib.optimize.UglifyJsPlugin({
            compress: {
              warnings: false
            }
          })


        );
        return plugins;
      })(),
      modulesDirectories: ['app/bower_components']
    }))
    .pipe(gulp.dest('./build/js/'));
});

gulp.task('git-commit', function() {
  var packageJSON = require('./package.json');
  return gulp.src(['./build/*', './package.json', './bower.json'])
    .pipe(git.add({
      args: '-A'
    }))
    .pipe(git.commit('Release v' + packageJSON.version));
});

gulp.task('git-push', function() {
  return git.push('origin', 'master', function(err) {
    if (err) {
      throw err;
    }
    process.exit();
  });
});

gulp.task('bump', function() {
  return gulp.src(['./bower.json', './package.json'])
    .pipe(bump({
      type: VERSION
    }))
    .pipe(gulp.dest('./'));
});

gulp.task('dev', ['stylus', 'minify-css', 'webpack', 'test']);

gulp.task('release', function() {
  VERSION = args.v || args.version;

  if (typeof VERSION !== 'undefined') {
    runSequence('clean', 'stylus', 'minify-css', 'test', 'webpack', 'uglify', 'imagemin', 'bump', 'git-commit', 'git-push');
  } else {
    console.log('SORRY, app --version parameter missing.');
  }
});

gulp.task('start-server', function() {
  nodemon({
    script: 'server/app.js',
    watch: ['server/**/*.js']
  }).on('start');

  livereload.listen();
  gulp.watch(['client/css/**/*.styl'], ['stylus', 'minify-css']);
  gulp.watch(['client/js/**/*.js', '!./client/js/bower_components/**/*.js', '!/client/js/build.js'], ['webpack']);
  gulp.watch(['test/**/*.js'], ['test']);
  gulp.watch(['build/css/app.css', 'build/img/**', 'client/js/**/*.js', 'server/views/**/*.jade']).on('change', livereload.changed);
  gulp.watch(['client/img/**/*'], ['image-copy']);
});

gulp.task('server', ['dev', 'start-server']);
gulp.task('default', ['set-ulimit', 'dev', 'start-server']);
