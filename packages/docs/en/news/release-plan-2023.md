---
title: Release Plan 2023
name: release-plan-2023
view: docs.html
date: 2023-06-21
category: Releases
tags:
  - Release
  - Release-Plan
  - News
---

The last Qgoda release was a corona release from April 2020. That does not mean that Qgoda is a
dead project but rather that relatively few bugs popped up and the project is
almost considered feature complete. On the other hand the open issue
[Javascript::Duktape::XS 0.75+ does not work with qgoda](https://github.com/gflohr/qgoda/issues/86)
has made it somewhat useless to do a new release.

## The JavaScript::Duktape::XS Problem

The pull request [Catchable Perl
Exceptions](https://github.com/gonzus/JavaScript-Duktape-XS/pull/34) that fixes
the problem has been accepted and merged. But a new release of
`JavaScript::Duktape::XS` is required before Qgoda itself can be updated. Once
that happens, the build process for Qgoda will be straightforward again.

## New Beta Release

A new beta release is expected before the end of summer. You will be kept
up-to-date here.

## First Stable Release

Qgoda has proven to be pretty feature complete. Two features are currently
still considered missing:

### Dependency Tracking

Currently, whenever an asset or view template changes, the entire site is
rebuild. The github version of Qgoda already tracks dependencies between assets
and views and it should be possible to re-generate only those files that
need an update. Unfortunately, that feature is still buggy and therefore
switched off by default.

### Priority/Generation Order

In order for a [listing]([% q.llinkPost(name='listings') %]) to be able to
"view" all other articles it has to be generated _after_ these articles.
This is done with the help of the template variable
[`asset.priority`]([% q.llinkPost(name='template-variables')#asset.priority %]).
Having to set and sometimes tune this variable is, of course, a nuisance but
even over time, no better idea came up.

With dependency tracking working, this problem could be solved by adding
a command-line argument `--rebuild` to the `build` and `watch` commands. In
presence of this option, the internal data structure that holds all assets
is no longer deleted after every site generation but re-used. Therefore,
in the second run, all missing dependencies between assets should be fixed.

### Qgoda Themes

The Qgoda themes on github suffer from bit-rot. Besides, the Qgoda command
"init" has issues. This is not a show-stopper but it should be fixed
nonetheless.

Stay tuned!
