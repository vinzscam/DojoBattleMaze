var gulp = require('gulp');
var exec = require('child_process').exec;
var changed = require('gulp-changed'); 
var browserify = require('gulp-browserify');
var livereload = require('gulp-livereload');
var server = require('./server/index.js');
var express = require('express');
var buffer = require('vinyl-buffer');
var uglify = require('gulp-uglify');
var babelify = require('babelify');
var size = require('gulp-size');
var open = require('gulp-open');

gulp.task('server', function(){
	return server();
});

gulp.task('browserify', function(){
  return gulp.src('./admin/www/js/index.js')
    .pipe(browserify({
      debug : false,
      transform: [babelify.configure({presets: ['es2015', 'react']})]
    }))
    .pipe(gulp.dest('./admin/build/'))
    .pipe(livereload());
});

gulp.task('uglify', function(){
  return gulp.src('./admin/www/js/index.js')
    .pipe(browserify({
      debug : false,
      transform: [babelify.configure({presets: ['es2015', 'react']})]
    }))
    .pipe(buffer())
    .pipe(uglify())
    .pipe(size())
    .pipe(gulp.dest('./admin/build/'));
});

gulp.task('watch', function(){
  gulp.watch('./admin/www/index.html', ['www']);
  gulp.watch('./admin/www/static/**', ['static']);
  gulp.watch('./admin/www/js/**', ['browserify']);
});

gulp.task('www', function(){
  var dest = './admin/build'
  return gulp.src(['./admin/www/index.html'])
    .pipe(changed(dest))
    .pipe(gulp.dest(dest))
    .pipe(livereload());
});

gulp.task('static', function(){
  var dest = './admin/build/static'
  return gulp.src(['./admin/www/static/**'])
    .pipe(changed(dest))
    .pipe(gulp.dest(dest))
    .pipe(livereload());
});

function admin( openBrowser ){
  var app = express();
  app.use('/', express.static(__dirname + '/admin/build'));
  var server = app.listen(3001, function(){
    console.log(`*** server started on localhost:${server.address().port} ***`);
    var pipe = gulp.src(__filename)
    openBrowser && pipe.pipe(open({uri: `http://localhost:${server.address().port}`}));
  });
}

gulp.task('admin-dev', ['browserify'], admin);
gulp.task('admin', ['browserify'], admin.bind(this, true));

gulp.task('livereload', function(){
  livereload.listen({
    host: 'localhost',
    port: 35829
  });
});

gulp.task('default', ['server', 'www', 'static', 'admin']);
gulp.task('dev', ['server', 'www', 'static', 'admin-dev', 'livereload', 'watch']);


