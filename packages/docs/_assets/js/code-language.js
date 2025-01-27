var $ = require('jquery');

$(document).ready(function () {
	var codes = document.querySelectorAll('pre>code');
	for (var i = 0; i < codes.length; ++i) {
		var parent = codes[i].parentElement;
		if (!parent.hasAttribute('class'))
			parent.setAttribute('class', 'language-none');
	}
});
