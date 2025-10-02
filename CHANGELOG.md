# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [4.0.0](///compare/v3.3.0...v4.0.0) (2025-10-02)


### ⚠ BREAKING CHANGES

* env variable APP_NAME renamed to PLAYATLAS_INSTANCE_NAME
* env variable WORK_DIR renamed to PLAYATLAS_DATA_DIR

* chore: move locator to a svelte file

* chore: filtered game list caching

* chore: functional register page

* chore: functional login page

* chore: remove ORIGIN env variable from compose files

* chore: code cleanup

* chore: require auth for games endpoint

fix: sw causing request loop when request failed

* chore: add authentication for SSE route

* chore: extract dictionary entries for register and login related errors

* chore: protect all api endpoints

* chore: typo

* chore(ui): change note editor bottom nav style and height

* chore: add screenshot store

* chore: reduce log message size on note update

* fix: reactivity problems in settings page

* chore: declare locator inside a context to fix reactivity issues

fix: extension resgistrations not updating correctly on mutation

* chore: extract dictionary entry

* chore: update translations

* fix: registration list showing loading spinner when request failed

* feat: application settings with local persistance

* feat: desconsider hidden games

* chore: ui changes and dictionary entries extraction

* feat: metrics snapshot for non-hidden only games

* feat: disconsider hidden games will affect dashboard graphics

* chore: handle errors in root layout

* chote: update backlog

* chore: add PR github workflow

* fix: workflow pnpm version

* chote: update github workflows
* this version contains multiple changes that are incompatible with previous versions

* pre-release 4.x ([#27](undefined/undefined/undefined/issues/27)) dce152f

## [3.3.0](https://github.com/jguih/playnite-insights/compare/v3.2.1...v3.3.0) (2025-07-29)


### Features

* real time in progress session playtime ([4c04e90](https://github.com/jguih/playnite-insights/commit/4c04e90008e17e6083fb4cfc20e47381bf2e0066))

### [3.2.1](https://github.com/jguih/playnite-insights/compare/v3.2.0...v3.2.1) (2025-07-28)

## [3.2.0](https://github.com/jguih/playnite-insights/compare/v3.1.1...v3.2.0) (2025-07-28)


### Features

* recent activity section ([#26](https://github.com/jguih/playnite-insights/issues/26)) ([d4c36db](https://github.com/jguih/playnite-insights/commit/d4c36dbd7c25b02391d6cb6a31423606835e485c))

### [3.1.1](https://github.com/jguih/playnite-insights/compare/v3.1.0...v3.1.1) (2025-07-27)


### Bug Fixes

* game session repo not persisting game name ([08e2859](https://github.com/jguih/playnite-insights/commit/08e2859f2273c00de76c077efea9c36304953a28))

## [3.1.0](https://github.com/jguih/playnite-insights/compare/v3.0.2...v3.1.0) (2025-07-27)


### Features

* game session ([#25](https://github.com/jguih/playnite-insights/issues/25)) ([c26c0a8](https://github.com/jguih/playnite-insights/commit/c26c0a80d6d1915741d44e637576ace1297bfc2a))

### [3.0.2](https://github.com/jguih/playnite-insights/compare/v3.0.1...v3.0.2) (2025-07-21)

### [3.0.1](https://github.com/jguih/playnite-insights/compare/v3.0.0...v3.0.1) (2025-07-20)


### Bug Fixes

* filter sidebar not opening ([0796cc5](https://github.com/jguih/playnite-insights/commit/0796cc57d58281dcd173dd1a6178a8e5d57fb1e3))

## [3.0.0](https://github.com/jguih/playnite-insights/compare/v2.4.0...v3.0.0) (2025-07-20)


### ⚠ BREAKING CHANGES

* publisher and developer tables were removed and their data will be merged in the new company table

* feat: filter by publisher

* feat: genre and platform client data loading

* feat: fitler by platforms

* feat: filter by genres

* ui: active filters counter

* ui: clear all filters button

* Feat/filters (#23) ([30f3a42](https://github.com/jguih/playnite-insights/commit/30f3a42ee439ed2186e2ce0e23c19371dfd3e8ff)), closes [#23](https://github.com/jguih/playnite-insights/issues/23)

## [2.4.0](https://github.com/jguih/playnite-insights/compare/v2.3.1...v2.4.0) (2025-07-19)


### Features

* filter by developers and offline support ([#22](https://github.com/jguih/playnite-insights/issues/22)) ([b726ba2](https://github.com/jguih/playnite-insights/commit/b726ba24664118266679d1c65346313096a17eee))

### [2.3.1](https://github.com/jguih/playnite-insights/compare/v2.3.0...v2.3.1) (2025-07-17)


### Bug Fixes

* bottom nav hidden after page refresh in chrome PWA ([55bac81](https://github.com/jguih/playnite-insights/commit/55bac8150611a4415ecb089399415234b72aa504))

## [2.3.0](https://github.com/jguih/playnite-insights/compare/v2.2.0...v2.3.0) (2025-07-17)


### Features

* add standard-version ([3a11f26](https://github.com/jguih/playnite-insights/commit/3a11f268b47a02ad30e11ea985ef761b53916539))
