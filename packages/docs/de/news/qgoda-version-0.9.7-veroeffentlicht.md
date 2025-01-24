---
title: Qgoda Version 0.9.7 veröffentlicht
name: qgoda-version-0.9.7-released
view: docs.html
date: 2020-04-11
category: Releases
tags: Release Beta-Release News
---

Nach relativ langer Zeit wurde eine neue Qgoda-Version veröffentlicht.
Hauptgrund für die lange Verzögerung waren zwei relativ knifflige Bugs,
und natürlich - wie immer - Zeitmangel.

Version 0.9.7 kann entweder als normales Perl-Paket installiert werden, als
Docker-Image oder direkt von [github](https://github.com/gflohr/qgoda/releases).

Das größte, und leider noch immer ungelöste Problem ist im Moment, dass eine
von Qgodas Abhängigkeiten `JavaScript::Duktape::XS` einen
[noch nicht gefixten Bug](https://github.com/gonzus/JavaScript-Duktape-XS/issues/13)
hat, der die Funktionsfähigkeit von Qgoda verhindert. Leider kann in Perl aber
nicht eine ganz bestimmte Version, sondern lediglich eine Minimalversion als
Abhängigkeit angegeben werden. Im Moment bleibt deshalb nichts anderes
übrig, als diese spezifische Version von `JavaScript::Duktape::XS` _vor_
Qgoda manuell zu installieren:

```sh
$ cpanm GONZUS/JavaScript-Duktape-XS-0.000074.tar.gz
```

Stellt Qgoda fest, dass eine inkompatible Version von `JavaScript::Duktape::XS`
installiert ist, bricht das Programm jetzt zumindest mit einer Fehlermeldung
ab, um das Problem besser zu beschreiben.

Weiterhin wurde `AnyEvent::Filesys::Inotify` wieder als Abhängigkeit
hinzugefügt. Leider hat dieses Modul eine große Anzahl an weiteren
Abhängigkeiten, weshalb in Qgoda 0.9.6 einen eigenen Ersatz für die gleiche
Funktionalität, jedoch mit weniger Abhängigkeiten enthielt. Es stellt sich
allerdings heraus, dass neue Probleme verursachte, zum Beispiel
https://github.com/gflohr/qgoda/issues/88. Deshalb wurde die alte Version jetzt
wiederhergestellt.

Außerdem wurden natürlich auch einige kleinere Bugs behoben.

Viel Spaß mit Qgoda, und bleibt gesund!
