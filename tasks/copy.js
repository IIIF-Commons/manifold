var c = require('../gulpfile.config');
var config = new c();
var gulp = require('gulp');
var utils = require('gulp-utils');
var path = require('path');

gulp.task('copy:bundle', function() {
    return gulp.src([path.join(config.dist, config.jsBundleOut)].concat(config.examplesDeps)).pipe(gulp.dest(config.examplesDepsDir));
});

gulp.task('copy:typings', function() {
    return gulp.src(config.typings).pipe(gulp.dest(config.typingsDir));
});