---
title: Qgoda Version 0.10.1 ist jetzt verfuegbar via Homebrew
name: qgoda-version-0.10.1-available-via-homebrew
view: docs.html
date: 2023-07-14
category: Releases
tags: Release Beta-Release News
---

Qgoda Version 0.10.1 kann ab sofort von GitHub
(https://github.com/gflohr/qgoda/releases) heruntergeladen werden.

Das Release enthält alle neuen Verbesserungen an Qgoda, allerdings auch
einige inkompatible Änderungen im Vergleich zu früheren Versionen. Die
daraus resultierenden Fehlermeldungen sollten jedoch klar vermitteln, was
geändert werden muss.

Wer einen Mac verwendet, wird sich freuen, dass Qgoda inklusive aller
Abhängigkeiten jetzt via [Homebrew](https://brew.sh) verfügbar ist:

```sh
$ brew tap gflohr/homebrew
$ brew install qgoda
```

Dafür ist die Installation auf anderen Plattformen leider noch immer etwas
umständlich. Das Duktape-Binding für Perl ist zwar gefixt. Der Fix ist
allerdings noch nicht auf dem CPAN verfügbar. Deshalb muss das Modul manuell
von GitHub installiert werden.

Ebenfalls, um die Anzahl der Abhängigkeiten von Qgoda zu reduzieren, wurde
das Modul `AnyEvent-Filesys-Notify` durch das funktional äquivalente Modul
`AnyEvent-Filesys-Watcher` ersetzt. Die beiden Module werden in der Zukunft
eventuell zusammengeführt, und deshalb ist das neue Modul noch nicht auf
CPAN verfügbar.

Zur Zeit muss Qgoda deshalb in drei Schritten installiert werden:

## JavaScript-Duktape-XS installieren

```sh
$ git clone https://github.com/gonzus/JavaScript-Duktape-XS.git
$ cd JavaScript-Duktape-XS
$ cpanm .
```

## AnyEvent-Filesys-Watcher installieren

```sh
$ git clone https://github.com/gflohr/AnyEvent-Filesys-Watcher.git
$ cd AnyEvent-Filesys-Watcher
$ cpanm .
```

## Qgoda installieren

```sh
$ git clone https://github.com/gflohr/qgoda.git
$ cd qgoda
$ cpanm .
```

## Upgrade-Hinweise

Beim Upgrade von früheren Versionen müssen einige Konfigurationsvariablen
geändert werden.

Allgemein wurden alle Unterstriche in Konfigurationsvariablen durch einen
Bindestrich ersetzt. Zum Beispiel wurde aus `exclude_watch` jetzt
`exclude-watch`.

Weiterhin müssen die Namen privater Variablen jetzt mit einem Unterstrich
anfangen. Diese Änderung war notwendigt damit die Namensräume private Variablen
klar von Qgoda-Variablen getrennt werden, damit keine Konflikte auftreten
können.

Wird das Kommando `qgoda config` in einem Projekt-Verzeichnis ausgeführt,
werden die Fehlermeldungen Hinweise zur Korrektur geben. Wenn
Konfigurationsvariablen umbenannt werden, müssen natürlich auch alle
Referenzen darauf in View-Templates und eventuell Markdown-Dokumenten
geändert werden.
