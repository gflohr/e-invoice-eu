---
title: Qgoda Version 0.9.4 Released
name: qgoda-version-0.9.4-released
view: docs.html
date: 2018-11-04
category: Releases
tags: Release Beta-Release News
---

Qgoda version 0.9.4 has been released as a hotfix release that resolves
a utf-8 issue. It is now available for download either as a regular
Perl install, a docker image or from
[github](https://github.com/gflohr/qgoda/releases).

Due to some inconsistencies with its dependencies
[Template::Plugin::Gettext](https://github.com/gflohr/Template-Plugin-Gettext),
[Locale::XGettext](https://github.com/gflohr/Locale-XGettext),
and [libintl-perl](https://github.com/gflohr/libintl-perl) non-ASCII
characters have been incorrectly rendered. Qgoda now relies on the
most recent versions of these dependencies where the underlying bugs
have been fixed.

Apart from that, the leading "v" is now removed from the version number.
So it's just Qgoda version 0.9.4, and not v0.9.4.
