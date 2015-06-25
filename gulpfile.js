/**---------------------------------------------------------------------------------------------------------------------
 * tgi-core/gulpfile.js
 */

var gulp = require('gulp');
var jshint = require('gulp-jshint');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var childProcess = require('child_process');

// Source and _packaging
var remoteLibFiles = [
  'lib/tgi-store-remote.lib.js',
  'lib/tgi-store-remote.source.js'
];
var remoteLibPackaging = ['lib/_packaging/lib-remote-header'].concat(['node_modules/tgi-core/dist/tgi.core.chunk.js']).concat(remoteLibFiles).concat(['lib/_packaging/lib-remote-footer']);

var hostLibFiles = [
  'lib/tgi-store-host.lib.js',
  'lib/tgi-store-host.source.js'
];
var hostLibPackaging = ['lib/_packaging/lib-host-header'].concat(['node_modules/tgi-core/dist/tgi.core.chunk.js']).concat(hostLibFiles).concat(['lib/_packaging/lib-host-footer']);

// The Spec
var remoteSpecFiles = [
  'node_modules/tgi-core//lib/_packaging/spec-header',
  'lib/_packaging/spec-remote-header',
  'node_modules/tgi-core/dist/tgi.core.spec.chunk.js',
  'lib/tgi-store-remote.spec.js',
  'lib/_packaging/spec-remote-footer'
];
var hostSpecFiles = [
  'node_modules/tgi-core//lib/_packaging/spec-header',
  'lib/_packaging/spec-host-header',
  'node_modules/tgi-core/dist/tgi.core.spec.chunk.js',
  'lib/tgi-store-host.spec.js',
  'lib/_packaging/spec-host-footer'
];

// Build Lib
gulp.task('_buildRemoteLib', function () {
  return gulp.src(remoteLibPackaging)
    .pipe(concat('tgi-store-remote.js'))
    .pipe(gulp.dest('dist'))
    .pipe(rename('tgi-store-remote.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest('dist'));
});
gulp.task('_buildHostLib', function () {
  return gulp.src(hostLibPackaging)
    .pipe(concat('tgi-store-host.js'))
    .pipe(gulp.dest('dist'))
    .pipe(rename('tgi-store-host.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest('dist'));
});

// Build Lib Chunk
gulp.task('_buildRemoteLibChunk', function () {
  return gulp.src(remoteLibFiles)
    .pipe(concat('tgi.store.remote.chunk.js'))
    .pipe(gulp.dest('dist'));
});
gulp.task('_buildHostLibChunk', function () {
  return gulp.src(hostLibFiles)
    .pipe(concat('tgi.store.host.chunk.js'))
    .pipe(gulp.dest('dist'));
});


// Build Spec
gulp.task('_buildRemoteSpec', function () {
  return gulp.src(remoteSpecFiles)
    .pipe(concat('tgi-store-remote.spec.js'))
    .pipe(gulp.dest('dist'));
});
gulp.task('_buildHostSpec', function () {
  return gulp.src(hostSpecFiles)
    .pipe(concat('tgi-store-host.spec.js'))
    .pipe(gulp.dest('dist'));
});

// Build Task
gulp.task('build', ['_buildRemoteLib', '_buildRemoteLibChunk', '_buildRemoteSpec', '_buildHostLib', '_buildHostLibChunk', '_buildHostSpec'], function (callback) {
  callback();
});

// Lint Lib
gulp.task('_lintRemoteLib', ['_buildRemoteLib', '_buildRemoteLibChunk'], function (callback) {
  return gulp.src('dist/tgi-store-remote.js')
    .pipe(jshint())
    .pipe(jshint.reporter('jshint-stylish'))
    .pipe(jshint.reporter('fail'));
});
gulp.task('_lintHostLib', ['_buildHostLib', '_buildHostLibChunk'], function (callback) {
  return gulp.src('dist/tgi-store-host.js')
    .pipe(jshint())
    .pipe(jshint.reporter('jshint-stylish'))
    .pipe(jshint.reporter('fail'));
});

// Lint Spec
gulp.task('_lintRemoteSpec', ['_buildRemoteSpec'], function (callback) {
  return gulp.src('dist/tgi-store-remote.spec.js')
    .pipe(jshint({validthis: true, sub: true}))
    .pipe(jshint.reporter('jshint-stylish'))
    .pipe(jshint.reporter('fail'));
});
gulp.task('_lintHostSpec', ['_buildHostSpec'], function (callback) {
  return gulp.src('dist/tgi-store-host.spec.js')
    .pipe(jshint({validthis: true, sub: true}))
    .pipe(jshint.reporter('jshint-stylish'))
    .pipe(jshint.reporter('fail'));
});

// Lint Task
gulp.task('lint', ['_lintRemoteLib', '_lintRemoteSpec', '_lintHostLib', '_lintHostSpec'], function (callback) {
  callback();
});

// Test Task
gulp.task('test', ['lint'], function (callback) {
  childProcess.exec('node spec/node-runner.js', function (error, stdout, stderr) {
    console.log(stdout);
    callback(error);
  });
});

// Default Task
gulp.task('default', ['lint']);

