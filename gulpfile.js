const gulp = require('gulp');
const mocha = require('gulp-mocha');
const yargs = require('yargs');

gulp.task('test', () => {
  let stream = gulp.src('__test__/**/*.js', { read: false })
    .pipe(mocha({ reporter: 'spec' }));

  if (yargs.argv.failTaskOnError) {
    stream = stream.on('error', process.exit.bind(process, 1));
  } else {
    stream = stream.on('error', process.exit.bind(process, 0));
  }
  return stream;
});
