var c = require('../gulpfile.config');
var config = new c();
var gulp = require('gulp');
var utils = require('gulp-utils');
var path = require('path');

gulp.task('prependHeaders', function(cb){
    Promise.all([
        utils.prependHeader(config.header, path.join(config.dist, config.dtsOut), config.dist),
        utils.prependHeader(config.header, path.join(config.dist, config.jsOut), config.dist),
        utils.prependHeader(config.header, path.join(config.dist, config.jsMinOut), config.dist)
    ]).then(function(){
        cb();
    });
});