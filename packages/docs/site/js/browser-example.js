class BootstrapLogger {
	log(msg) {
		console.log(msg);
	}

	warn(msg) {
		console.warn(msg);
	}

	error(msg) {
		console.error(msg);
	}
}

(() => {
	const logger = new BootstrapLogger();

	fillFormats();
	addUploadLabelHandlers();
	document.getElementById('add-attachment').addEventListener('click', onAttachmentAdded);
	document.querySelectorAll('#e-invoice-eu input, #e-invoice-eu select')
	.forEach(element => { element.addEventListener('change', updateForm) });
	updateForm();

	function updateForm() {
		const formatSelect = document.getElementById('format');
		const formatOption = formatSelect.options[formatSelect.selectedIndex];
		const mimeType = formatOption.dataset.mimeType;

		const invoiceInput = document.querySelector('input[name="invoice-input"]:checked').value;
		const needMapping = invoiceInput === 'spreadsheet';
		if (needMapping) {
			document.getElementById('mapping-file-upload').style.display = 'block';
			document.getElementById('mapping-file').required = true;
			document.getElementById('spreadsheet-file-upload').style.display = 'block';
			document.getElementById('spreadsheet-file').required = true;
			document.getElementById('invoice-file-upload').style.display = 'none';
			document.getElementById('invoice-file').required = false;
		} else {
			document.getElementById('mapping-file-upload').style.display = 'none';
			document.getElementById('mapping-file').required = false;
			document.getElementById('spreadsheet-file-upload').style.display = 'none';
			document.getElementById('spreadsheet-file').required = false;
			document.getElementById('invoice-file-upload').style.display = 'block';
			document.getElementById('invoice-file').required = true;
		}

		const showEmbedPDF = mimeType !== 'application/pdf';
		if (showEmbedPDF) {
			document.getElementById('embed-pdf-checkbox').style.display = 'block';
		} else {
			document.getElementById('embed-pdf-checkbox').style.display = 'none';
		}

		const embedPDF = document.getElementById('embed-pdf').checked;
		const needPDF = mimeType === 'application/pdf' || (embedPDF && showEmbedPDF);
		if (needPDF) {
			document.getElementById('pdf-file-upload').style.display = 'block';
		} else {
			document.getElementById('pdf-file-upload').style.display = 'none';
		}

		const submitButton = document.getElementById('generate-invoice');
		submitButton.disabled = !checkFormComplete(mimeType, invoiceInput);

		const attachButton = document.getElementById('add-attachment');
		if (checkAttachmentComplete()) {
			attachButton.style.display = 'block';
		} else {
			attachButton.style.display = 'none';
		}
	}

	function checkAttachmentComplete() {
		if (!document.getElementById('attachment-file').files[0]) {
			return false;
		}

		// FIXME! Check that ID, description, and MIME type are set, when
		// needed.

		return true;
	}

	function checkFormComplete(mimeType, invoiceInput) {
		if (mimeType === 'application/pdf'
			|| document.getElementById('embed-pdf').checked) {
			return false;
		}

		if (invoiceInput === 'spreadsheet') {
			if (!document.getElementById('spreadsheet-file').files[0]) {
				return false;
			}
			if (!document.getElementById('mapping-file').files[0]) {
				return false;
			}
		} else {
			if (!document.getElementById('invoice-file').files[0]) {
				return false;
			}
		}

		return true;
	}

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
		document.querySelectorAll('.custom-file-input').forEach(function (input) {
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
