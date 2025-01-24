---
view: landing.html
title: Qgoda - The Multilingual Static Site Generator
location: /{lingua}/index.html
permalink: /{lingua}/
chain: html
wrapper: html
description: Qgoda (Ягода) is a static site generator with a strong focus on multi-linguism and flexibility, written in Perl and JavaScript and extensible with Python, Ruby, Java, and more.
---

<qgoda-no-xgettext>
[% USE q = Qgoda %]
[% q.include('_includes/' _ asset.lingua _ '/landing-page/header.md', asset) %]
[% q.include('_includes/' _ asset.lingua _ '/landing-page/main-features.md', asset) %]
[% q.include('_includes/' _ asset.lingua _ '/landing-page/about.md', asset) %]
</qgoda-no-xgettext>
