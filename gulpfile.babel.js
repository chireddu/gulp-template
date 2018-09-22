import gulp from 'gulp';
import plugins from 'gulp-load-plugins';
import del from 'del';
import pkg from './package.json';
import livereload from 'gulp-livereload';
import runSequence from 'run-sequence';
import browserSync from 'browser-sync';
const dirs = pkg['template-configs'].directories;

// ---------------------------------------------------------------------
// | CLEAN TASK - DELETE DIST FOLDER                                   |
// ---------------------------------------------------------------------

gulp.task('clean', (done) => {
  del([
    dirs.dist
  ]).then(() => {
    done();
  });
});

// ---------------------------------------------------------------------
// | COPY TASK - COPY ALL FILES                                        |
// ---------------------------------------------------------------------

gulp.task('copy', [
  'copy:.htaccess',
  'copy:index.html',
  'copy:jquery',
  'copy:main.css',
  'copy:misc',
]);

gulp.task('copy:.htaccess', () =>
  gulp.src('node_modules/apache-server-configs/dist/.htaccess')
    .pipe(plugins().replace(/# ErrorDocument/g, 'ErrorDocument'))
    .pipe(gulp.dest(dirs.dist))
);

gulp.task('copy:index.html', () => {
  gulp.src(`${dirs.src}/index.html`)
    .pipe(gulp.dest(dirs.dist));
});

gulp.task('copy:jquery', () =>
  gulp.src(['node_modules/jquery/dist/jquery.min.js'])
    // .pipe(plugins().rename(`jquery-${pkg.devDependencies.jquery}.min.js`))
    .pipe(gulp.dest(`${dirs.dist}/js/vendor`))
);

gulp.task('copy:main.css', () => {
  gulp.src(`${dirs.src}/css/main.css`)
    .pipe(plugins().autoprefixer({
      browsers: ['last 2 versions', 'ie >= 9', '> 1%'],
      cascade: false
    }))
    .pipe(gulp.dest(`${dirs.dist}/css`));
});

gulp.task('copy:misc', () =>
  gulp.src([
    `${dirs.src}/**/*`,
    `!${dirs.src}/css/main.css`,
    `!${dirs.src}/css/**/*.scss`,
    `!${dirs.src}/index.html`
  ], {
    dot: false
  }).pipe(gulp.dest(dirs.dist))
);

// ---------------------------------------------------------------------
// | MAIN TASKS                                                        |
// ---------------------------------------------------------------------

gulp.task('sass', function() {
  gulp.src(`${dirs.src}/css/main.scss`)
    .pipe(plugins().sass({outputStyle: 'compressed'}).on('error', plugins().sass.logError))
    .pipe(plugins().autoprefixer({
      browsers: ['last 2 versions', 'ie >= 9', '> 1%'],
      cascade: false
    }))
    .pipe(gulp.dest(`${dirs.src}/css`));
});

gulp.task('rebuild-css', (done) => {
  runSequence(
    'sass',
    'clean',
    'copy',
    done);
});

gulp.task('build', (done) => {
  runSequence(
    'clean',
    'copy',
    done);
});

gulp.task('watch', function() {
  livereload.listen();
  gulp.watch(`${dirs.src}/*.html`, ['build']).on('change', browserSync.reload);
  gulp.watch(`${dirs.src}/css/**/*.scss`, ['rebuild-css']).on('change', browserSync.reload);
  gulp.watch(`${dirs.src}/img/**/*`, ['build']).on('change', browserSync.reload);
  gulp.watch(`${dirs.src}/js/**/*`, ['build']).on('change', browserSync.reload);
});

gulp.task('browser-init', function() {
  browserSync.init({
    server: {
      baseDir: `${dirs.dist}`
    }
  });
});

gulp.task('develop', (done) => {
  runSequence(
    'clean',
    'copy',
    'browser-init',
    'watch',
    done);
});
