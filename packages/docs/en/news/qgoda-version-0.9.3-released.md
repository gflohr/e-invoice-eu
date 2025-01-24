---
title: Qgoda Version 0.9.3 Released
name: qgoda-version-0.9.3-released
view: docs.html
date: 2018-11-01
category: Releases
tags: Release Beta-Release News
---

Qgoda version 0.9.3 is now available for download either as a regular
Perl install, a docker image or from
[github](https://github.com/gflohr/qgoda/releases). It is mostly a
consolidation release but also features some important changes.

## New Configuration Variable Names

The most important changes from a user perspective have been made to the
configuration. All underscores ("\_") in variable names are now replaced
by hyphens ("-"), for example `exclude_watch` has now become
`C:exclude-watch`.

## Configuration Validation With JSON Schema

The configuration file `P:_config.yaml` is now validated against a
[JSON schema](https://json-schema.org/) as a safe-guard against invalid
configurations. On the other hand, the configuration is now more flexible
because you can often simplify the configuration and Qgoda will "repair"
it for you. For example the values of the Qgoda `C:helpers` are actually
arrays but you can still write this:

<!--qgoda-no-xgettext-->

```yaml;line-numbers
helpers:
  build: gulp
```

<!--/qgoda-no-xgettext-->

The string "gulp" will now be automatically coerced into an array:

<!--qgoda-no-xgettext-->

```yaml;line-numbers
helpers:
    build:
	  - gulp
```

<!--/qgoda-no-xgettext-->

This is a general pattern. You can use it wherever an array is required, when
you have just one value. The same goes for `C:defaults`:

<!--qgoda-no-xgettext-->

```yaml;line-numbers
defaults:
    - files: /en
      values:
        lingua: en
    - files:
	    - /de
	  values:
	    lingua: de
```

<!--/qgoda-no-xgettext-->

The two versions for "en" and "de" are equivalent. You can always check your
results with `qgoda config`.

By the way, you can inspect the JSON schema with the new command `qgoda
schema`.

## Embedded JavaScript Engine

The JSON schema validation is done with [Ajv](https://ajv.js.org/), the
same library that for example [webpack](https://webpack.js.org/) is
using. But Ajv is written in JavaScript and there is no alternative
implementation in Perl available.

In order to use it, the [Duktape](https://duktape.org/) JavaScript engine
was embedded into Qgoda via
[JavaScript::Duktape::XS](https://metacpan.org/release/JavaScript-Duktape-XS).
You can even access this engine with the new command `qgoda javascript`
or its alias `qgoda js`. Try `qgoda javascript --help` if you are curious.

## Scaffolding With Yeoman

Work has started on a [Yeoman](http://yeoman.io/) generator for Qgoda.
See https://www.npmjs.com/package/generator-qgoda for instructions.

You can currently generate a basic site with development web server. Not that
much but already enough to generate a site with a sane structure.

## Other Changes

See https://metacpan.org/source/GUIDO/Qgoda-v0.9.2/Changes for a complete
list of changes.

## Next Steps

The plans for the next week are:

- Further improvement of the [Yeoman](http://yeoman.io/) generator.
- Replace the `HTMLFilter` plug-in interface with a new API based on
  [cheerio](https://cheerio.js.org/). You can then write your own filters
  in JavaScript or Perl but with the familiar
  [jQuery](https://jquery.com/) syntax.
- [Hoedown](https://github.com/hoedown/hoedown) will become the default
  Markdown processor.

Apart from that the continuous goals are the completion of the documentation
on this site and better test coverage. Stay tuned!
