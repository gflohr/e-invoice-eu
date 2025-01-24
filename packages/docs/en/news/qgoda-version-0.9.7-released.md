---
title: Qgoda Version 0.9.7 Released
name: qgoda-version-0.9.7-released
view: docs.html
date: 2020-04-11
category: Releases
tags: Release Beta-Release News
---

After quite a long time, a new qgoda version has been released. The reason
for the long delay were two particularly nasty issues and, like always,
lack of time.

Version 0.9.7 is available for download either as a regular Perl install, a
docker image or from [github](https://github.com/gflohr/qgoda/releases).

The biggest problem at the moment - and it is still unresolved - is that
one of Qgoda's dependencies `JavaScript::Duktape::XS` has an
[unresolved issue](https://github.com/gonzus/JavaScript-Duktape-XS/issues/13)
which breaks Qgoda. Unfortunately, you cannot specify a specific version
as a dependency in Perl but only a minimum version. That means that fresh
installs will always be broken. The current workaround is to install that
specific version of `JavaScript::Duktape::XS` manually _before_ you install qgoda:

```sh
$ cpanm GONZUS/JavaScript-Duktape-XS-0.000074.tar.gz
```

Should qgoda detect an incompatible version of `JavaScript::Duktape::XS` being
used, it now terminates with an errror message to make the problem more
obvious.

Another change is that `AnyEvent::Filesys::Inotify` was added again as a
dependency. That package has a lot of dependencies which makes it somewhat
hard to install. Therefore, Qgoda 0.9.6 contained a replace with less
dependencies. It turned out, however, that his caused other issues, for
example https://github.com/gflohr/qgoda/issues/88, and so the old
version was restored instead.

Other than that, a number of smaller bugs have been fixed.

Have fun with Qgoda and stay healthy!
