// biome-ignore-all lint/style/noCommonJs: migrate later to ES6.
const $ = require('jquery');

$(document).ready(function () {
	const codes = document.querySelectorAll('pre>code');
	for (let i = 0; i < codes.length; ++i) {
		const parent = codes[i].parentElement;
		if (!parent.hasAttribute('class'))
			parent.setAttribute('class', 'language-none');
	}
});
