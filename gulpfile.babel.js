import gulp from 'gulp';
import gulpNodemon from 'gulp-nodemon';
import gulpBabel from 'gulp-babel';
import gulpShell from 'gulp-shell';

gulp.task('nodemon', ['build'], () => {
  gulpNodemon({
    script: 'dist/app.js',
    ext: 'js',
    ignore: ['README.md', 'node_modules/**', '.DS_Store'],
    watch: ['server']
  });
});

gulp.task('dev', ['nodemon'], () => gulp.watch('server/**/*.js', ['build']));

gulp.task('start', ['build'], gulpShell.task([
  'cross-env NODE_ENV=production node ./dist/app.js',
]));

gulp.task('build', () => gulp.src(
    ['./**/*.js', '!dist/**', '!node_modules/**', '!gulpfile.babel.js', '!documentation/**']
  )
  .pipe(gulpBabel({
    presets: ['es2015', 'stage-2']
  }))
  .pipe(gulp.dest('dist')));

gulp.task('truncate-testdb', gulpShell.task([
  'cross-env NODE_ENV=test sequelize db:migrate:undo:all',
]));

gulp.task('migrate', ['truncate-testdb'], gulpShell.task([
  'NODE_ENV=test sequelize db:migrate',
]));

gulp.task('coverage', ['migrate'], gulpShell.task([
  'NODE_ENV=test nyc mocha ./server/tests/**/*.js --timeout 300000',
]));

gulp.task('test', ['coverage']);

gulp.task('truncate', gulpShell.task([
  'cross-env NODE_ENV=development sequelize db:migrate:undo:all',
]));

gulp.task('migrate-dev', ['truncate'], gulpShell.task([
  'cross-env NODE_ENV=development sequelize db:migrate && sequelize db:seed:all',
]));
