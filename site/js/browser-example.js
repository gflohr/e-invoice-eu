(async () => {
	fillFormats();
	addUploadLabelHandlers();
	document
		.getElementById('generate-invoice')
		.addEventListener('click', onGenerateInvoice);
	document
		.getElementById('add-attachment')
		.addEventListener('click', onAttachmentAdded);
	document
		.querySelectorAll('#e-invoice-eu input, #e-invoice-eu select')
		.forEach(element => {
			element.addEventListener('change', updateForm);
		});
	updateForm();

	const attachments = [];

	async function onGenerateInvoice(event) {
		event.preventDefault();

		try {
			const invoiceInput = document.querySelector(
				'input[name="invoice-input"]:checked',
			).value;

			let invoice, spreadsheet;

			if (invoiceInput === 'spreadsheet') {
				const formatSelect = document.getElementById('format');
				const formatOption = formatSelect.options[formatSelect.selectedIndex];
				const format = formatOption.value;

				const mappingYAML = await readFile('mapping-file');
				const mapping = jsyaml.load(mappingYAML);
				spreadsheet = await readFile('spreadsheet-file', true);

				const mappingService = new eInvoiceEU.MappingService(console);
				invoice = mappingService.transform(spreadsheet, format, mapping);
			} else {
				const invoiceJSON = await readFile('invoice-file');
				invoice = JSON.parse(invoiceJSON);
			}

			if (!spreadsheet && document.getElementById('spreadsheet-file').files.length) {
				spreadsheet = await readFile('spreadsheet-file', binary);
			}

			await addAttachment();
			const options = {
				format: document.getElementById('format').value,
				lang: document.getElementById('lang').value,
				pdf: document.getElementById('spreadsheet-file').files.length ? await pdfFileInfo() : undefined,
				embedPDF: document.getElementById('embed-pdf').checked,
				spreadsheet,
				attachments,
			};

			const invoiceService = new eInvoiceEU.InvoiceService(console);
			const renderedInvoice = await invoiceService.generate(invoice, options);
			if (typeof renderedInvoice === 'string') {
				downloadInvoice(renderedInvoice, 'invoice.xml', 'application/xml');
			} else if (
				renderedInvoice instanceof Uint8Array ||
				renderedInvoice instanceof ArrayBuffer
			) {
				downloadInvoice(renderedInvoice, 'invoice.pdf', 'application/pdf');
			} else {
				console.error('Unknown invoice format:', renderedInvoice);
			}
		} catch (e) {
			document.getElementById('error-message').textContent = e.message;

			const dialog = document.getElementById('dialog');
			if (dialog) {
				const modal = bootstrap.Modal.getOrCreateInstance(dialog);
				modal.show();
				throw(e);
			}
		}
	}

	async function pdfFileInfo() {
		const files = document.getElementById('pdf-file').files;
		if (!files) return;

		return {
			buffer: await readFile('pdf-file', true),
			filename: files[0].name,
			mimetype: 'application/pdf',
		};
	}

	function downloadInvoice(data, filename, mimeType) {
		const blob = new Blob([data], { type: mimeType });
		const url = URL.createObjectURL(blob);

		const a = document.createElement('a');
		a.href = url;
		a.download = filename;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);

		URL.revokeObjectURL(url); // Clean up
	}

	async function readFile(inputId, binary) {
		return new Promise((resolve, reject) => {
			const element = document.getElementById(inputId);

			const reader = new FileReader();

			reader.onload = e => {
				resolve(e.target.result);
			};

			reader.onerror = e => reject(`Error reading spreadsheet file: ${e}`);

			if (binary) {
				reader.readAsArrayBuffer(element.files[0]);
			} else {
				reader.readAsText(element.files[0]);
			}
		});
	}

	function updateForm() {
		const formatSelect = document.getElementById('format');
		const formatOption = formatSelect.options[formatSelect.selectedIndex];
		const mimeType = formatOption.dataset.mimeType;

		const invoiceInput = document.querySelector(
			'input[name="invoice-input"]:checked',
		).value;
		const needMapping = invoiceInput === 'spreadsheet';
		if (needMapping) {
			document.getElementById('mapping-file-upload').style.display = 'block';
			document.getElementById('mapping-file').required = true;
			document.getElementById('spreadsheet-file-upload').style.display =
				'block';
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
		const needPDF =
			mimeType === 'application/pdf' || (embedPDF && showEmbedPDF);
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

		if (document.getElementById('attachment-mime-type').value === '') {
			document.getElementById('attachment-mime-type').value =
				document.getElementById('attachment-file').files[0].type;
		}

		return true;
	}

	function checkFormComplete(mimeType, invoiceInput) {
		if (
			mimeType === 'application/pdf' ||
			document.getElementById('embed-pdf').checked
		) {
			if (!document.getElementById('pdf-file').files[0]) return false;
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
				this.nextElementSibling.textContent =
					this.files.length > 0 ? this.files[0].name : 'No file selected.';
			});
		});
	}

	async function onAttachmentAdded(event) {
		event.preventDefault();

		const fileInput = document.getElementById('attachment-file');
		if (!fileInput.files.length > 0) {
			alert('Please select a file.');
			return;
		}

		const template = document.getElementById('attachment');
		const clone = template.content.cloneNode(true);

		const attachmentIndex = attachments.length;
		await addAttachment();
		const attachment = attachments[attachmentIndex];

		const details = clone.querySelector('.flex-grow-1');
		details.innerHTML = `
			<div>File: ${attachment.filename}</div>
			<div>ID: ${attachment.id ?? 'n/a'}</div>
			<div>Description: ${attachment.description ?? 'n/a'}</div>
			<div>MIME type: ${attachment.mimetype ?? 'n/a'}</div>
		`;

		const container = document.getElementById('attachments-list');
		const wrapper = document.createElement('div');
		wrapper.appendChild(clone);

		wrapper
			.querySelector('.delete-attachment')
			.addEventListener('click', function () {
				wrapper.remove();
				attachments.splice(attachmentIndex, 1);
			});

		container.appendChild(wrapper);

		fileInput.value = '';
		fileInput.nextElementSibling.textContent = 'Please select a file!';
		document.getElementById('attachment-id').value = '';
		document.getElementById('attachment-description').value = '';
		document.getElementById('attachment-mime-type').value = '';
	}

	async function addAttachment() {
		const fileInput = document.getElementById('attachment-file');
		if (!fileInput.files.length > 0) {
			return;
		}

		const fileName = fileInput.files[0].name;
		const attachmentId = document.getElementById('attachment-id').value;
		const description = document.getElementById('attachment-description').value;
		const mimeType = document.getElementById('attachment-mime-type').value;

		attachments.push({
			buffer: await readFile('attachment-file', true),
			filename: fileName,
			mimeType: mimeType,
			id: attachmentId,
			description,
		});
	}
})();
