---
title: Getting Help
name: getting-help
section: cli
---
<!--qgoda-no-xgettext-->
[% USE Highlight(config.private.copyCode) %]
<!--/qgoda-no-xgettext-->

You can an overview about all available commands and global options with the
option `--help`:

<!--qgoda-no-xgettext-->
[% FILTER $Highlight "language-sh" %]
e-invoice-eu --help
[% END %]
<!--/qgoda-no-xgettext-->

This will show you an overview of all available commands.

<!--qgoda-no-xgettext-->
[% title = "Global Options" %]
[% WRAPPER components/infobox.html
type='info' title=title %]
<!--/qgoda-no-xgettext-->
The options <code>--help</code> and <code>--verbose</code> are global options.
Because of a technical restriction they have to be specified before the
command name like <code>invoice</code> or <code>transform</code>.
<!--qgoda-no-xgettext-->
[% END %]
<!--/qgoda-no-xgettext-->
