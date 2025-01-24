---
title: Qgoda Version 0.9.4 veröffentlicht
name: qgoda-version-0.9.4-released
view: docs.html
date: 2018-11-04
category: Releases
tags: Release Beta-Release News
---

Qgoda Version 0.9.4 wurde gerade als Hotfix-Relese veröffentlicht, das
ein UTF-8-Problem behebt. Es kann als reguläres Perl-Pakt, Docker-Image
oder von [github](https://github.com/gflohr/qgoda/releases) installiert
werden.

Wegen Inkonsistenzen mit den Abhängigkeiten

[Template::Plugin::Gettext](https://github.com/gflohr/Template-Plugin-Gettext),
[Locale::XGettext](https://github.com/gflohr/Locale-XGettext)
und [libintl-perl](https://github.com/gflohr/libintl-perl) wurden
nicht-ASCII-Zeichen inkorrekt dargestellt. Qgoda beruht jetzt auf den
neuesten Versionen dieser Abhängigkeiten, in denen die zugrundeliegenden
Bugs gefixt sind.

Weiterhin wurde das führende "v" von den Versionsnummern entfernt.
Die neue Version ist also 0.9.4 und nicht v0.9.4.
