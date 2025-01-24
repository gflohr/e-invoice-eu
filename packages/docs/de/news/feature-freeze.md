---
title: Feature Freeze
name: feature-freeze
view: docs.html
date: 2018-01-02
category: Ankündigungen
tags: Ankündigung News
---

Als Teil der Vorbereitung für ein erstes produktionsreifen Release, gibt es für Qgoda vorerst einen Feature-Freeze. Lediglich Bug-Fixes and kleinere Verbesserungen werden implementiert.

Der Übersetzungs-Workflow für Zeichenketten sowohl aus Templates als auch Content-Seiten ist vollständig implementiert. Mit `qgoda po --help` bekommt man eine Übersicht.

Die Berechnung und Anzeige verwandter Dokumente ist ebenfalls fertig. Die entsprechende Dokumentationsseite [% q.lanchor(name = 'related-documents') %] wird bald alles beschreiben, was man wissen muss.

Die nächsten Schritte sind:

- minimale API-Dokumentation als Perl POD ...
- ... so, dass ein neues Alpha-Release auf [CPAN](https://search.cpan.org) hochgeladen werden kann
- Behebung der auf [github issues](https://github.com/gflohr/qgoda/issues) erfassten Fehler, sofern sie als MVP (minimum viable product) klassifiziert sind.
- Fertigstellung der Dokumentation auf dieser Seite.

Ein produktionsreifes Release ist für April 2018 geplant.
