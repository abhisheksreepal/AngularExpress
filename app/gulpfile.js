const gulp =require('gulp'),
del = require("del"),
tsc = require("gulp-typescript"),
sourcemaps = require('gulp-sourcemaps'),
tsProject = tsc.createProject("tsconfig.json"),
runSequence = require('run-sequence'),
tslint = require('gulp-tslint');

/**
 * Remove build directory.
 */
gulp.task('clean', (cb) => {
    return del(["dist"], cb);
});

gulp.task('build:client', ["clientResources"], function () {
    var tsProject = tsc.createProject('client/tsconfig.json');
    var tsResult = gulp.src('client/**/*.ts')
        .pipe(sourcemaps.init())
        .pipe(tsProject());
    return tsResult.js
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('dist/client'));
});


gulp.task("clientResources", () => {
    return gulp.src(["client/**/*", "!**/*.ts", "!client/typings", "!client/typings/**", "!client/*.json"])
        .pipe(gulp.dest("dist/client"));
});

/**
 * Compile TypeScript sources and create sourcemaps in build directory.
 */
gulp.task("compile", ["tslint"], () => {
    let tsResult = gulp.src("client/**/*.ts")
        .pipe(sourcemaps.init())
        .pipe(tsProject());
    return tsResult.js
        .pipe(sourcemaps.write("."))
        .pipe(gulp.dest("dist/client"));
});


/**
 * Lint all custom TypeScript files.
 */
gulp.task('tslint', () => {
    return gulp.src("client/app/**/*.ts")
        .pipe(tslint({
			formatter: "prose"
		}))
		.pipe(tslint.report());
});


/**
 * Watch for changes in TypeScript, HTML and CSS files.
 */
gulp.task('watch', ["build:client"],function () {
    gulp.watch(["client/**/*.ts"], ['compile']).on('change', function (e) {
        console.log('TypeScript file ' + e.path + ' has been changed. Compiling.');
    });

    gulp.watch(["client/**/*.html", "client/**/*.css"], ['clientResources']).on('change', function (e) {
        console.log('Resource file ' + e.path + ' has been changed. Updating.');
    });
});

gulp.task("serverResources", () => {
    return gulp.src(["server/**/*", "!**/*.ts", "!server/typings", "!server/typings/**", "!server/*.json"])
        .pipe(gulp.dest("dist/server"));
});

gulp.task('build:server', ["serverResources"], function () {
    var tsProject = tsc.createProject('server/tsconfig.json');
    var tsResult = gulp.src('server/**/*.ts')
        .pipe(sourcemaps.init())
        .pipe(tsProject());
    return tsResult.js
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('dist/server'));
});


/**
 * Watch for changes in TypeScript, HTML and CSS files.
 */
gulp.task('watch:server', ["build:server"],function () {
    gulp.watch(["server/**/*.ts"], ['compile:server']).on('change', function (e) {
        console.log('TypeScript file ' + e.path + ' has been changed. Compiling.');
    });
});

/**
 * Compile TypeScript sources and create sourcemaps in build directory.
 */
gulp.task("compile:server", ["tslint:server"], () => {
    let tsResult = gulp.src("server/**/*.ts")
        .pipe(sourcemaps.init())
        .pipe(tsProject());
    return tsResult.js
        .pipe(sourcemaps.write("."))
        .pipe(gulp.dest("dist/server"));
});


/**
 * Lint all custom TypeScript files.
 */
gulp.task('tslint:server', () => {
    return gulp.src("server/app/**/*.ts")
        .pipe(tslint({
			formatter: "prose"
		}))
		.pipe(tslint.report());
});