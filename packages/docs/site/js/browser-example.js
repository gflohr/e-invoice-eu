(() => {
	fillFormats();
	addUploadLabelHandlers();
	document.getElementById('add-attachment').addEventListener('click', onAttachmentAdded);

	function fillFormats() {
		const formatFactoryService = new eInvoiceEU.FormatFactoryService();
		const formatOptions = document.getElementById('format');
		const formatInfos = formatFactoryService.listFormatServices();
		for (const formatInfo of formatInfos) {
			const option = document.createElement('option');
			option.value = option.textContent = formatInfo.name;
			if (formatInfo.name === 'UBL') {
				option.setAttribute('selected', 'selected');
			}
			option.dataset.mimeType = formatInfo.mimeType;
			formatOptions.appendChild(option);
		}
	}

	function addUploadLabelHandlers() {
		Array.from(document.getElementsByClassName('custom-file-input')).forEach(function (input) {
			input.addEventListener('change', function () {
				this.nextElementSibling.textContent = this.files.length > 0 ? this.files[0].name : 'No file selected.';
			});
		});
	}

	function onAttachmentAdded(event) {
		event.preventDefault();

		const fileInput = document.getElementById('attachment-file');
		const fileLabel = fileInput.nextElementSibling;
		const fileName = fileInput.files.length > 0 ? fileInput.files[0].name : 'No file selected';
		const attachmentId = document.getElementById('attachment-id').value;
		const description = document.getElementById('attachment-description').value;
		const mimeType = document.getElementById('attachment-mime-type').value;

		if (fileName === 'No file selected') {
			alert('Please select a file.');
			return;
		}

		const template = document.getElementById('attachment');
		const clone = template.content.cloneNode(true);

		const details = clone.querySelector('.flex-grow-1');
		details.innerHTML = `
			<div>File: ${fileName}</div>
			<div>ID: ${attachmentId || '—'}</div>
			<div>Description: ${description || '—'}</div>
			<div>MIME type: ${mimeType || '—'}</div>
		`;

		const container = document.getElementById('attachments-list');
		const wrapper = document.createElement('div');
		wrapper.appendChild(clone);

		wrapper.querySelector('.delete-attachment').addEventListener('click', function () {
			wrapper.remove();
		});

		container.appendChild(wrapper);

		fileInput.value = '';
		fileLabel.textContent = 'No file selected.';
		document.getElementById('attachment-id').value = '';
		document.getElementById('attachment-description').value = '';
		document.getElementById('attachment-mime-type').value = '';
	}
})();
