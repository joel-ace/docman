import gulp from 'gulp';
import loadPlugins from 'gulp-load-plugins';
import path from 'path';

/** Load gulp plugins into variable */
const plugins = loadPlugins();

const paths = {
  js: ['./**/*.js', '!dist/**', '!node_modules/**', '!gulpfile.babel.js']
};

/** Transpile ES6 to ES5 using babel into the dist directory */
gulp.task('babel', () =>
  gulp.src(paths.js, { base: '.' })
    .pipe(plugins.babel())
    .pipe(gulp.dest('dist'))
);

/** Start server with restart on file change events*/
gulp.task('nodemon', ['babel'], () =>
  plugins.nodemon({
    script: path.join('dist', 'index.js'),
    ext: 'js',
    ignore: ['README.md', '.DS_Store', 'node_modules/**/*.js', 'dist/**/*.js'],
    tasks: ['babel']
  })
);

gulp.task('default', ['nodemon']);
