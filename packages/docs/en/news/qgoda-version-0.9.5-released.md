---
title: Qgoda Version 0.9.5 Released
name: qgoda-version-0.9.5-released
view: docs.html
date: 2018-12-01
category: Releases
tags: Release Beta-Release News
---

The new Qgoda version fixes a couple of minor bugs that have been found
while writing more and better tests. It also comes with an
improved docker image. Version 0.9.5 is available for download either
as a regular Perl install, a docker image or from
[github](https://github.com/gflohr/qgoda/releases).

When running as a docker container, you can now stop the process simply
by pressing CTRL-C instead of having to run `docker container kill`.
For improved security, the software now runs as an unprivileged user
inside the container.

Another new way to stop Qgoda is to drop a file named `_stop` in the
root directory. You can optionally write a reason for stopping into
the file, which will be displayed on termination.

Most of the changes are however internal. Code has been cleaned up,
a lot of new tests have been written, and a lot of small issues have
been fixed.
