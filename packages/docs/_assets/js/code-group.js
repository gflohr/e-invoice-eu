(function() {
	document.querySelectorAll('code-group').forEach(group => {
		console.log(group);
	});

	document.querySelectorAll('code-group code-tabs input').forEach(input => {
		input.addEventListener('change', event => {
			const group = event.target.parentElement.parentElement;
			group.querySelectorAll('code-blocks code-block').forEach(block => block.removeAttribute('class'));

			const id = event.target.id.replace(/^code-tab-/, 'code-block-');
			console.log(id)
			document.getElementById(id).setAttribute('class', 'active');
		});
	});
})();
