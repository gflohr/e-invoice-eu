var $ = require('jquery');

$(document).ready(function () {
	if ($('body').hasClass('keyboard-navigation')) {
		window.onkeyup = function (e) {
			var id;

			if (e.code === 'PageUp') {
				id = 'nav-back';
			} else if (e.code === 'PageDown') {
				id = 'nav-forward';
			} else if (e.code === 'KeyB') {
				id = 'nav-home';
			}

			if (id !== undefined) {
				console.log(id);
				var anchor = document.getElementById(id);
				if (anchor && anchor.href && anchor.href !== window.location)
					window.location = anchor.href;
			}
		};
	}
});
