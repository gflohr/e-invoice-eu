---
title: Qgoda Version 0.9.3 veröffentlicht
name: qgoda-version-0.9.3-released
view: docs.html
date: 2018-11-01
category: Releases
tags: Release Beta-Release News
---

Qgoda version 0.9.3 steht ab sofort zum Download zur Verfügung, entweder
als normales Perl-Paket, als Docker-Container oder von
[github](https://github.com/gflohr/qgoda/releases). Es handelt sich
größtenteils um ein Konsolidierungs-Release, bringt aber auch einige
wichtige Veränderungen.

## Neue Namen für Konfigurationsvariablen

Die aus Benutzersicht wichtigsten Änderungen wurden an der Konfiguration
vorgenommen. Alle Unterstriche ("\_") in Variablennamend wurden durch
Bindestricht ("-") ersetzt. So wurde zum Beispiel aus `exclude_watch` jetzt
`C:exclude-watch`.

## Validierung der Konfiguration mit JSON-Schema

Die Konfigurationsdatei `P:_config.yaml` wird jetzt gegen ein
[JSON-Schema](https://json-schema.org/) validiert, um ungültige
Konfigurationen zu vermeiden. Anderseits sind die Konfigurationsmöglichkeiten
aber auch flexibler geworden, weil Qgoda die Konfiguration in vielen
Fällen automatisch entsprechend dem Schema "repariert". Beispielsweise
müssen die Werte der Konfigurationsvariablen `C:helpers` eigentlich
Listen sein, aber sie lassen sich auch so angeben:

<!--qgoda-no-xgettext-->

```yaml;line-numbers
helpers:
  build: gulp
```

<!--/qgoda-no-xgettext-->

Die Zeichenkette "gulp" wird aber automatisch in eine Liste "befördert":

<!--qgoda-no-xgettext-->

```yaml;line-numbers
helpers:
    build:
	  - gulp
```

<!--/qgoda-no-xgettext-->

Dahinter steckt ein allgemeines Muster, das sich immer verwenden lässt, wenn
eine Liste erwartet wird, diese Liste aber lediglich einen Wert hat. Das ist
zum Beispiel auch für `C:defaults` der Fall:

<!--qgoda-no-xgettext-->

```yaml;line-numbers
defaults:
    - files: /en
      values:
        lingua: en
    - files:
	    - /de
	  values:
	    lingua: de
```

<!--/qgoda-no-xgettext-->

Die beiden Versionen für "de" und "en" sind äquivalent, und das Ergebnis
lässt sich jederzeit mit `qgoda config` überprüfen.

Das zugrundeliegence JSON-Schema lässt sich übrigens mit dem neuen Kommando
`qgoda schema` untersuchen.

## Eingebettete JavaScript-Engine

Die Schema-Validierung geschieht mit Hilfe von [Ajv](https://ajv.js.org/), der
gleichen Bibliothek, die zum Beispiel auch [webpack](https://webpack.js.org/)
verwendet. Allerdings ist Ajv in JavaSCript geschrieben, und es gibt keine
gleichwertige Implementierung in Perl.

Um Ajv dennoch verwenden zu können, wurde die
[Duktape](https://duktape.org/)-Engine via
[JavaScript::Duktape::XS](https://metacpan.org/release/JavaScript-Duktape-XS)
in Qgoda eingebettet. Diese lässt sich sogar mit dem neuen Kommando
`qgoda javascript` oder seinem Alias `qgoda js` direkt ansprechen.
Wer neugierig ist, erfährt mit `qgoda javascript --help` mehr.

## Gerüstbau mit Yeoman

Weiterhin wurde die Arbeit an einem [Yeoman](http://yeoman.io/)-Generator
für Qgoda aufgenommen, siehe https://www.npmjs.com/package/generator-qgoda für
eine Anleitung.

Zur Zeit lässt sich eine einfache Site mit Entwicklungs-Web-Server
erzeugen. Das ist natürlich noch nicht allzu viel, jedoch schon ausreichend,
um eine gut strukturierte Qgoda-Site aufzubauen.

## Weitere Neuerungen

Auf https://metacpan.org/source/GUIDO/Qgoda-v0.9.2/Changes gibt es eine
vollständige Liste der Änderungen einsehen.

## Wie geht's weiter?

Die Pläne für die nächsten Wochen sind:

- Weiterentwicklung des [Yeoman](http://yeoman.io/)-Generators.
- Ersezung des Plug-In-Interfaces von `HTMLFilter` durch ein neues API,
  das auf [Cheerio](https://cheerio.js.org/) aufbaut. Dadurch können Filter
  sowohl in JavaScript als auch in Perl geschrieben werden und zwar mit der
  von [jQuery](https://jquery.com/) bekannten Syntax.
- [Hoedown](https://github.com/hoedown/hoedown) wird der neue
  Standard-Prozessor für Markdown.

Parallel dazu wird natürlich an der weiteren Vervollständigung der
Dokumentation und einer größeren Testabdeckung gearbeitet. Stay tuned!
