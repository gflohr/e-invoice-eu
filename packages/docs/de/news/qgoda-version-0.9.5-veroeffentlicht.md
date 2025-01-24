---
title: Qgoda Version 0.9.5 veröffentlicht
name: qgoda-version-0.9.5-released
view: docs.html
date: 2018-12-01
category: Releases
tags: Release Beta-Release News
---

Die neue Qgoda-Version behebt eine Reihe kleinerer Probleme, die beim
Schreiben von Tests entdeckt worden. Auch der Docker-Container wurde
verbessert. Version 0.9.5 steht als reguläres Perl-Paket, Docker-Image
oder auf [github](https://github.com/gflohr/qgoda/releases) zur
Verfügung.

Wenn die Software im Docker-Container läuft, kann sie jetzt mit
STRG-C statt umständlich mit `docker container kill` beendet werden.
Weiterhin läuft Qgoda jetzt innerhalb des Containers als unprivilegierter
Benutzer.

Eine weitere neue Methode, um Qgoda zu stoppen, besteht darin, eine
Datei `_stop` im Wurzelverzeichnis abzulegen. In die Datei kann
optional auch ein Grund für die Programm-Terminierung geschrieben
werden, der dann nach Abschluss der Operation angezeigt wird.

Das Gros der Änderungen ist jedoch intern. Eine Menge Code wurde
aufgeräumt, etliche neue Tests geschrieben, und im Zuge dessen
wurde eine Menge kleinerer Probleme behoben.
