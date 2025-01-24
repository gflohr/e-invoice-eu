---
title: Feature Freeze
name: feature-freeze
view: docs.html
date: 2018-01-02
category: Announcements
tags: Announcement News
---

[% USE q = Qgoda %]
In preparation for the first production-ready release, Qgoda has been feature-frozen. Only bug-fixes and minor enhancements will be implemented.

The translation workflow for strings from both templates and contents is now ready, try `qgoda po --help` for an overview.

The computation and display of related documents is also finished. The documentation page [% q.lanchor(name = 'related-documents') %] will soon get updated with everything you have to know.

The next steps are:

- write minimal API documentation as Perl POD ...
- ... so that another alpha release can be uploaded to [CPAN](https://search.cpan.org)
- fix the remaining [github issues](https://github.com/gflohr/qgoda/issues), at least those classified as MVP (minimum viable product)
- finish the documentation on this site

A production-ready release is expected for April 2018.
