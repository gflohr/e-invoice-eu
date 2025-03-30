---
title: Installation
name: installation
section: cli
description: The tool <code>e-invoice-eu</code> can be used to create electronic invoices on the commandline.
---

<!--qgoda-no-xgettext-->

[% USE Highlight(config.private.copyCode) %]
[% USE CodeGroup %]

<!--/qgoda-no-xgettext-->

You can install the commandline tool `e-invoice-eu` like this:

<!--qgoda-no-xgettext-->

[% FILTER $CodeGroup %]
[npm]
[% FILTER $Highlight "language-sh" %]
npm install -g @e-invoice-eu/cli
[% END %]

[yarn]
[% FILTER $Highlight "language-sh" %]
yarn global add @e-invoice-eu/cli
[% END %]

[pnpm]
[% FILTER $Highlight "language-sh" %]
pnpm add -g @e-invoice-eu/cli
[% END %]

[bun]
[% FILTER $Highlight "language-sh" %]
bun add -g @e-invoice-eu/cli
[% END %]

[% END %]

<!--/qgoda-no-xgettext-->

If you lack the required permissions to install the command globally,
you may have to prepend `sudo` to the command.

<!--qgoda-no-xgettext-->

[% title = "Pro Tip: Use <code>nvm</code>" %]
[% WRAPPER components/infobox.html
type='info' title=title %]

<!--/qgoda-no-xgettext-->

You can avoid using <code>sudo</code> by using the <a
href="https://github.com/nvm-sh/nvm">Node
Version Manager <code>nvm</code></a>. That has the additional benefit that
you have multiple versions of <a href="https://nodejs.org/">Node.js</a>
available simultaneously.

<!--qgoda-no-xgettext-->

[% END %]

<!--/qgoda-no-xgettext-->

Test that the installation has worked:

[% FILTER $Highlight "language-sh" %]
e-invoice-eu --version
[% END %]

That should output version information.
