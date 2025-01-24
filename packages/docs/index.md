---
view: raw
title: E-Invoice-EU
location: /index.html
permalink: /
chain: html
wrapper: html
description: Free and open source tool chain for generating EN16931 conforming invoices (Factur-X/ZUGFeRD, UBL, CII, XRechnung) from popular spreadsheet formats or JSON.
lingua: en
scripts: [/js/negotiate-language.js]
name: 'language-negotiator'
multilang: false
---

<qgoda-no-xgettext>
<script>
var lingua,
	default_lingua = '[% config.linguas.0 %]',
	supported = {};
[% FOREACH lingua IN config.linguas %]
	supported['[% lingua %]'] = true;
[% END %]

for (i = 0; navigator.languages != null && i < navigator.languages.length; ++i) {
	var lang = navigator.languages[i].substr(0, 2);
	if (supported[lang]) {
		lingua = lang;
	}
}

if (lingua == null) {
	lingua = navigator.language || navigator.userLanguage;
	if (lingua != null) {
		lingua = lingua.substr(0, 2);
	}
}

if (!supported[lingua])
	lingua = default_lingua;

document.location.href = '/docs/' + lingua;
</script>
</qgoda-no-xgettext>
