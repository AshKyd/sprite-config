var gulp = require('gulp');
var less = require('gulp-less');
var cssmin = require('gulp-cssmin');
var browserify = require('gulp-browserify');
var uglify = require('gulp-uglify');
var connect = require('gulp-connect');

gulp.task('scripts', function() {
    gulp.src(['src/scripts/index.js'])
        .pipe(browserify({
          debug : true
        }))
        // .pipe(uglify())
        .pipe(gulp.dest('dist/scripts/'))
});

gulp.task('styles', function(){
	gulp.src(['src/style/style.less'])
		.pipe(less())
        // .pipe(cssmin())
		.pipe(gulp.dest('dist/styles/'))
});

gulp.task('connect',function(){
	connect.server({
		root: 'dist',
		livereload: true
	});
});

gulp.task('html', function () {
    gulp.src('src/*.html')
    .pipe(connect.reload())
    .pipe(gulp.dest('dist/'));
});

gulp.task('watch', function () {
	gulp.watch(['src/style/*.less'], ['styles']);
	gulp.watch(['src/scripts/*.js'], ['scripts']);
	gulp.watch(['src/templates/*'], ['scripts']);
	gulp.watch(['src/*.html'], ['html']);
});

gulp.task('dev',['scripts','styles', 'html']);
gulp.task('default',['dev', 'watch', 'connect'])
