---
location: /{lingua}/docs/index.html
title: Documentation
name: documentation
categories: Documentation
view: docs.html
type: doc
start: 1
description: Learn how to create a website with Qgoda, with tutorial-style introductory information for beginners or exhaustive API documentation for the experienced.
---

[% USE q = Qgoda %]
Qgoda is a static site generator. It is mainly intended for blogs but you
can build any website you want with it. And by the way, it is pronounced
"yagoda".

[% WRAPPER components/infobox.html
type='warning' title='This Is a Draft!' %]

<p>This documentation is work in progress.  A lot of things missing here,
and part of the things documented here documents a past or future state
of the software.  Well, and some parts of this documentation are plain
wrong.  That being said, it should also be clear that features can still
change without notice, whether they are documented or not.</p>
<p>&nbsp;</p>
<p>
Nonetheless, Qgoda is in productive use since mid 2016 and already
generating a handful of web sites without problems.</p>
[% END %]

[% IF asset.lingua != 'en' %]
[% WRAPPER components/infobox.html
type='warning' title='Incomplete Translation!' %]
The translation for this site is not yet ready. The parts that are not
yet translated will be displayed in English instead.
[% END %]
[% END %]

Setting up your own blog, portfolio or company web site with Qgoda is simple
and straightforward. Yet, Qgoda comes with a unique feature set that makes even complex websites feasible and fun to implement. The highlights are:

- A powerful yet easy to learn templating language.
- Arbitrary [taxonomies]([% q.llink(name = 'taxonomies') %])
  like categories, tags, languages, abstract names or whatever you want.
  Structuring your documents or linking to a specific document is possible
  in a very flexible way.
- Extensibility. Write your extensions in Perl, Python, Ruby or even more
  languages on request.
- Built-in multi-language support for websites with an international
  audience or documentation (like this one).

[% WRAPPER components/infobox.html
type='info' title='Run Your Local Version!' %]
This documenation is also generated using Qgoda. You can check out the
<a href="https://github.com/gflohr/qgoda-site">github sources</a>, <a href="[% q.llink(name = 'installation') %]">install Qgoda</a> and
<a href="https://yarnpkg.com/lang/en/">yarn</a>, type <code>qgoda watch</code> and you build your your own local version of the documentation.
[% END %]
