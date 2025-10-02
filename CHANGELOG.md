# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [1.0.0-beta.2](///compare/v1.0.0-beta.1...v1.0.0-beta.2) (2025-10-02)

## 1.0.0-beta.1 (2025-10-02)


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
* publisher and developer tables were removed and their data will be merged in the new company table

* feat: filter by publisher

* feat: genre and platform client data loading

* feat: fitler by platforms

* feat: filter by genres

* ui: active filters counter

* ui: clear all filters button

### Features

* add standard-version 3a11f26
* filter by developers and offline support ([#22](undefined/undefined/undefined/issues/22)) b726ba2
* game session ([#25](undefined/undefined/undefined/issues/25)) c26c0a8
* real time in progress session playtime 4c04e90
* recent activity section ([#26](undefined/undefined/undefined/issues/26)) d4c36db


### Bug Fixes

* bottom nav hidden after page refresh in chrome PWA 55bac81
* filter sidebar not opening 0796cc5
* game session repo not persisting game name 08e2859


* Feat/filters (#23) 30f3a42, closes #23
* pre-release 4.x ([#27](undefined/undefined/undefined/issues/27)) dce152f
