const gulp = require('gulp');
const babel = require('gulp-babel');
const del = require('del');

gulp.task('clean_dist', function () {
    return del.sync('./src');
});

gulp.task('transpile', function() {
  return gulp.src('lib/**/*.js')
      .pipe(babel())
      .pipe(gulp.dest('src'));
});

gulp.task('copy_files',function(){
  return gulp.src([
      './lib/schema/yaml/*.json',
      './lib/reporters/html-src/assets/*.css'
  ],  { base: './lib/' })
  .pipe(gulp.dest('src'));
});

gulp.task('default', ['clean_dist', 'transpile', 'copy_files']);