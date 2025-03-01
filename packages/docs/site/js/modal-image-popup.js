function enrichImage(img, modal) {
	const innerImg = modal.getElementsByTagName('img')[0];
	const caption = modal.getElementsByTagName('div')[0];
	img.classList.add('gfl-magnifiable');
	const src = img.src;
	img.addEventListener('click', () => {
		modal.style.display = 'block';
		innerImg.src = src;
		console.log(innerImg.src);
		caption.innerHTML = img.alt;
	});
}

const container = document.createElement('div');
document.body.appendChild(container);
container.classList.add('gfl-modal')

const innerImg = document.createElement('img');
container.appendChild(innerImg);
innerImg.classList.add('gfl-modal-content')

const caption = document.createElement('div');
caption.id = 'gfl-caption';
container.appendChild(caption);

const content = document.getElementsByTagName('qgoda-content')[0];
for (var img of content.getElementsByTagName('img')) {
	if (!img.classList.contains('gfl-modal-content')) {
		if (img.naturalWidth > img.width) {
			enrichImage(img, container);
		} else {
			img.width = img.naturalWidth;
		}
	}
}

container.onclick = function() {
	container.style.display = 'none';
}

innerImg.onclick = (event) => {
	event.stopPropagation();
	container.style.display = 'none';
	window.open(innerImg.src);
};
