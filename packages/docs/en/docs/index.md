---
location: /{lingua}/docs/index.html
title: E-Invoice-EU
name: documentation
categories: Documentation
view: docs.html
type: doc
start: 1
description: 
---
[% USE q = Qgoda %]
Free and open source tool chain for generating EN16931 conforming invoices (Factur-X/ZUGFeRD, UBL, CII, XRechnung) from popular spreadsheet formats or JSON.

[% WRAPPER components/infobox.html
type='warning' title='This Is a Draft!' %]

<p>This documentation is work in progress.  A lot of things missing here,
and part of the things documented here documents a past or future state
of the software.  Well, and some parts of this documentation are plain
wrong.  That being said, it should also be clear that features can still
change without notice, whether they are documented or not.</p>
[% END %]

[% IF asset.lingua != 'en' %]
[% WRAPPER components/infobox.html
type='warning' title='Incomplete Translation!' %]
The translation for this site is not yet ready. The parts that are not
yet translated will be displayed in English instead.
[% END %]
[% END %]
