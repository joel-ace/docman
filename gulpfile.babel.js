import gulp from 'gulp';
import nodemon from 'gulp-nodemon';
import babel from 'gulp-babel';
import shell from 'gulp-shell';

gulp.task('nodemon', ['build'], () => {
  nodemon({
    script: 'dist/index.js',
    ext: 'js',
    ignore: ['README.md', 'node_modules/**', '.DS_Store'],
    watch: ['server']
  });
});

gulp.task('dev', ['nodemon'], () => gulp.watch('server/**/*.js', ['build']));

gulp.task('start', ['build'], shell.task([
  'cross-env NODE_ENV=production node ./dist/',
]));

gulp.task('build', () => gulp.src(['./**/*.js', '!dist/**', '!node_modules/**', '!gulpfile.babel.js'])
  .pipe(babel({
    presets: ['es2015', 'stage-2']
  }))
  .pipe(gulp.dest('dist')));

gulp.task('truncate-testdb', shell.task([
  'cross-env NODE_ENV=test sequelize db:migrate:undo:all',
]));

gulp.task('migrate', ['truncate-testdb'], shell.task([
  'NODE_ENV=test sequelize db:migrate',
]));

gulp.task('coverage', ['migrate'], shell.task([
  'NODE_ENV=test nyc mocha ./server/tests/**/*.js --timeout 300000',
]));

gulp.task('test', ['coverage']);

gulp.task('truncate', shell.task([
  'cross-env NODE_ENV=development sequelize db:migrate:undo:all',
]));

gulp.task('migrate-dev', ['truncate'], shell.task([
  'cross-env NODE_ENV=development sequelize db:migrate && sequelize db:seed:all',
]));
