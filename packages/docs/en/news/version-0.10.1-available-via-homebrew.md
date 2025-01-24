---
title: Qgoda Version 0.10.1 Available Via Homebrew
name: qgoda-version-0.10.1-available-via-homebrew
view: docs.html
date: 2023-07-14
category: Releases
tags: Release Beta-Release News
---

Qgoda version 0.10.1 can now be downloaded from GitHub at
https://github.com/gflohr/qgoda/releases.

It contains all recent improvements on Qgoda and also some changes that break
compatibility with older versions. The error messages that you receive should
give you a clear idea of what you have to change.

Mac users will be happy to hear that you can now install Qgoda including all
dependencies with [Homebrew](https://brew.sh):

```sh
$ brew tap gflohr/homebrew
$ brew install qgoda
```

Installing on other platforms is a little bit dodgy at the moment. The
Duktape binding for Perl is fixed by now but the fix is not yet available on
CPAN, so that you have to install it from the sources on GitHub.

Also, in order to reduce the number of dependencies of Qgoda, the module
`AnyEvent-Filesys-Notify` has been replaced with a functionally equivalent
module `AnyEvent-Filesys-Watcher`. The two modules may eventually be merged
in the future, and therefore the latter is not yet on CPAN.

Until then, you have to install Qgoda in three steps:

## Install JavaScript-Duktape-XS

```sh
$ git clone https://github.com/gonzus/JavaScript-Duktape-XS.git
$ cd JavaScript-Duktape-XS
$ cpanm .
```

## Install AnyEvent-Filesys-Watcher

```sh
$ git clone https://github.com/gflohr/AnyEvent-Filesys-Watcher.git
$ cd AnyEvent-Filesys-Watcher
$ cpanm .
```

## Install Qgoda

```sh
$ git clone https://github.com/gflohr/qgoda.git
$ cd qgoda
$ cpanm .
```

## Upgrade Hints

If you are upgrading from a previous version, you may have to modify a couple
of configuration variables.

In general, all underscores in configuration variables have been replaced by a
hyphen, for example `exclude_watch` is now `exclude-watch`.

Another breaking change is that all your private variables have to start with
an underscore. That is necessary in order to clearly separate the namespace
for Qgoda variables and private variables, so that there cannot be any
conflicting variables.

If you run `qgoda config` in a project repository of yours, the error
messages will guide you in correcting the variables. When renaming
configuration variables in `_config.yaml` you should also change references
to them in your view files (templates) and possible markdown documents.
