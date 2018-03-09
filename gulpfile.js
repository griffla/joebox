// include gulp
var gulp = require('gulp');

// include plug-ins
var jshint = require('gulp-jshint');
var minifyHTML = require('gulp-minify-html');
var changed = require('gulp-changed');
var imagemin = require('gulp-imagemin');
var concat = require('gulp-concat');
var stripDebug = require('gulp-strip-debug');
var uglify = require('gulp-uglify');
var autoprefix = require('gulp-autoprefixer');
var minifyCSS = require('gulp-minify-css');
var svgmin = require('gulp-svgmin');


// JS HINT
gulp.task('jshint', function() {
  gulp.src('./resources/js/*.js')
    .pipe(jshint())
    .pipe(jshint.reporter('default'));
});


// JS
gulp.task('scripts', function() {
  gulp.src([
      './resources/js/jquery.joebox.plugin.js',
    ])
    .pipe(concat('jquery.joebox.min.js'))
//    .pipe(stripDebug()) // take back for prod
    .pipe(uglify())
    .pipe(gulp.dest('./dist/js/'));
});

// CSS
gulp.task('styles', function() {
  gulp.src([
      './resources/css/joebox.css',
    ])
    .pipe(concat('jquery.joebox.min.css'))
    .pipe(autoprefix('last 2 versions'))
    .pipe(minifyCSS())
    .pipe(gulp.dest('./dist/css/'));
});


// DEMO HTML
// minify new or changed HTML pages
gulp.task('htmlpage', function() {
  var htmlSrc = './resources/html/*.html',
      htmlDst = './demo';

  gulp.src(htmlSrc)
    .pipe(changed(htmlDst))
    .pipe(minifyHTML())
    .pipe(gulp.dest(htmlDst));
});

// DEMO JS
gulp.task('demoscripts', function() {
  gulp.src([
      './resources/js/demo.js',
      './resources/js/jquery.easings.js', // include easings
    ])
    .pipe(concat('demo.js'))
//    .pipe(stripDebug()) // take back for prod
    .pipe(uglify())
    .pipe(gulp.dest('./demo/js/'));
});

// DEMO CSS
// concat, auto-prefix and minify
gulp.task('demostyles', function() {
  gulp.src([
      './resources/css/demo.css',
    ])
    .pipe(concat('demo.css'))
    .pipe(autoprefix('last 2 versions'))
    .pipe(minifyCSS())
    .pipe(gulp.dest('./demo/css/'));
});

// DEMO IMAGES
// minify new images
gulp.task('imagemin', function() {
  gulp.src([
      './resources/images/demo/**',
      '!./resources/images/demo/original', 
      '!./resources/images/demo/original/**'
    ])
    .pipe(changed('./demo/images'))
    .pipe(imagemin())
    .pipe(gulp.dest('./demo/images'));
});

// Watch Changes
gulp.task('default', ['scripts', 'demoscripts', 'htmlpage', 'styles', 'demostyles', 'imagemin'], function() {
  // watch for HTML changes
  gulp.watch('./resources/html/*.html', function() {
    gulp.run('htmlpage');
  });

  // watch for JS changes
  gulp.watch('./resources/js/*.js', function() {
    gulp.run('jshint', 'scripts');
  });

  // watch for CSS changes
  gulp.watch('./resources/css/joebox.css', function() {
    gulp.run('styles');
  });

  // watch for Demo CSS changes
  gulp.watch('./resources/css/demo.css', function() {
    gulp.run('demostyles');
  });
});

