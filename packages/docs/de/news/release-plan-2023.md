---
title: Release Plan 2023
name: release-plan-2023
view: docs.html
date: 2023-06-21
category: Releases
tags: Release Release-Plan News
---

Das letzte Qgoda-Release stammt war ein Corona-Release vom April 2020. Das
heißt nicht, dass Qgoda ein totes Projekt ist, sondern vielmehr, dass relativ
wenige Bugs aufgetaucht sind. Außerdem sind fast alle notwendigen Features
eingebaut. Andererseits hat das Problem [Javascript::Duktape::XS 0.75+ does not work with qgoda](https://github.com/gflohr/qgoda/issues/86) ein Release wenig sinnvoll erscheinen lassen.

## Das JavaScript::Duktape::XS-Problem

Der Pull-Request [Catchable Perl
Exceptions](https://github.com/gonzus/JavaScript-Duktape-XS/pull/34), der das
Problem behebt, wurde akzeptiert und integriert. Aber bevor Qgoda aktualisiert
werden kann, ist ein neues Release von `JavaScript::Duktape::XS` erforderlich.
Danach wird die Installation von Qgoda wieder problemlos möglich sein.

## Neues Beta-Release

Ein neues Beta-Release wird daher noch vor dem Ende des Sommers erwartet.
Hier wird man darüber auf dem Laufenden gehalten.

## Erstes Stable-Release

Qgoda ist mehr oder weniger komplett. Zwei Features werden zur Zeit noch als
fehlend betrachtet:

### Dependency-Tracking

Zur Zeit wird bei jeder Änderung eines Assets oder Views die komplette Site
neu generiert. Die GitHub-Version von Qgoda verfolgt aber bereits alle
Abhängigkeiten zwischen Assets und Views und es sollte ddaher möglich sein,
nur die Dateien neu zu generieren, die tatsächlich einer Aktualisierung
befürfen. Leider hat das Feature aber noch Probleme und ist daher
standardmäßig abgeschaltet.

### Priorität/Generierungs-Reihenfolge

Damit ein [Listing]([% q.llinkPost(name='listings') %]) alle anderen Artikel
"sehen" kann, muss es _nach_ diesen Artikeln generiert werden. Das geschieht
mittels der Template-Variablen
[`asset.priority`]([% q.llinkPost(name='template-variables')#asset.priority %]).
Dass man immer daran denken muss, diese Variable zu setzen, ist natürlich
lästig, aber auch im Laufe der Jahre erschien keine bessere Idee.

Mit Dependency-Tracking könnte das Problem gelöst werden, indem den
Kommandos `build` und `watch` ein
Kommandozeilen-Argument `--rebuild` to the `build` and `watch` zugefügt werden.
In Anwesenheit dieser Option wird die interne Datenstruktur, in der alle
Assets gespeichert sind, nicht bei jeder Neu-Generierung gelöscht, sondern
wiederverwendet. Beim zweiten Durchlauf würden daher alle fehlenden
Abhängigkeiten automatisch behoben, sofern sich nichts anderes geändert
hat.

### Qgoda-Themes

Die Qgoda-Themes auf GitHub sind etwas in die Jahre gekommen. Außerdem hat
das Qgoda-Kommando "init" ein paar Probleme. Das ist kein Show-Stopper,
sollte aber natürlich zeitnah gefixt werden.

Mehr demnächst an dieser Stelle!
