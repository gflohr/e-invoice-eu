---
title: Browser Example
name: browser-example
section: other
description: The E-Invoice-EU core library also works in the browser.
scripts:
- /site/js/browser-example.js
---
<!--qgoda-no-xgettext-->
[% USE q = Qgoda %]
[% USE Highlight %]
<!--/qgoda-no-xgettext-->

Creating e-invoices in the browser is absolutely possible but has one little
caveat. If you want to embed a PDF version of the invoice to be embedded into
an XML invoice format or if you are targetting a hybrid Factur-X/ZUGFeRD format,
you have to always provide a PDF. The server and commandline versions can
also create a PDF from a spreadsheet file but that is not possible in the
browser because it requires executing
[LibreOffice](https://www.libreoffice.org/).

The form below will create an e-invoice. You can see the source code in the
source of this page at
https://raw.githubusercontent.com/gflohr/e-invoice-eu/refs/heads/main/packages/docs/en/docs/other/browser-example.md!

The application is structured as a wizard.

## E-Invoice Generate Based on [E-Invoice-EU](https://github.com/gflohr/e-invoice-eu)

<!--qgoda-no-xgettext-->
<form id="e-invoice-eu">
	<div class="form-group">
		<label for="format">Output format (*)</label>
		<select id="format" class="form-control" required>
		</select>
	</div>
	<label for="lang">Language code (*)</label>
	<div class="form-group">
		<input id="lang" name="lang" pattern="^[a-zA-Z]{2}(?:-[a-zA-Z]{2})?"
			value="en-gb" required/>
	</div>
	<label>Input data (*)</label>
	<div class="form-check">
		<input class="form-check-input" type="radio" name="invoice-input"
			value="spreadsheet" checked>
		<label class="form-check-label" for="spreadsheetOption">Spreadsheet</label>
	</div>
	<div class="form-check">
		<input class="form-check-input" type="radio" name="invoice-input"
			value="json">
		<label class="form-check-label" for="jsonOption">JSON</label>
	</div>
	<br />
	<div class="form-group" id="spreadsheet-file-upload">
		<label>Spreadsheet file (*)</label>
		<div class="custom-file">
			<input type="file" class="custom-file-input" id="spreadsheet-file" required>
			<label class="custom-file-label" for="spreadsheet-file">
				No file selected.
			</label>
			<small class="form-text text-muted">For example
				<a href="https://github.com/gflohr/e-invoice-eu/raw/refs/heads/main/contrib/templates/default-invoice.ods"
				target="_blank">
					default-invoice.ods
				</a>
			</small>
		</div>
	</div>
	<div class="form-group" id="mapping-file-upload">
		<label>[% q.lanchor(name='mapping') %] (*)</label>
		<div class="custom-file">
			<input type="file" class="custom-file-input" id="mapping-file" required>
			<label class="custom-file-label" for="mapping-file">
				No file selected.
			</label>
			<small class="form-text text-muted">For example
				<a href="https://github.com/gflohr/e-invoice-eu/blob/main/contrib/mappings/default-invoice.yaml"
				target="_blank">
					default-invoice.yaml
				</a>
			</small>
		</div>
	</div>
	<div class="form-group" id="json-file-upload">
		<label>JSON Data ([% q.lanchor(name='internal-format') %]) (*)</label>
		<div class="custom-file">
			<input type="file" class="custom-file-input" id="invoice-file" required>
			<label class="custom-file-label" for="invoice-file">
				No file selected.
			</label>
			<small class="form-text text-muted">For example
				<a href="https://github.com/gflohr/e-invoice-eu/blob/main/contrib/data/default-invoice.json"
				target="_blank">
					default-invoice.yaml
				</a>
			</small>
		</div>
	</div>
	<div class="form-group" id="embed-pdf-checkbox">
		<div class="form-check">
			<input class="form-check-input" type="checkbox" name="embed-pdf"
				id="embed-pdf">
			<label class="form-check-label" for="embedPDF">Embed PDF?</label>
		</div>
	</div>
	<div class="form-group" id="pdf-file-upload">
		<label>Invoice PDF (*)</label>
		<div class="custom-file">
			<input type="file" class="custom-file-input" id="pdf-file">
			<label class="custom-file-label" for="ppdf-file">
				No file selected.
			</label>
			<small class="form-text text-muted">For example
				<a href="https://github.com/gflohr/e-invoice-eu/blob/main/contrib/templates/default-invoice.pdf"
				target="_blank">
					default-invoice.pdf
				</a>
			</small>
		</div>
	</div>
	<h3>Optional Attachments</h3>
	<div class="form-group">
		<div id="attachments-list">
			<template id="attachment">
				<div class="d-flex align-items-center">
					<div class="flex-grow-1 border p-2">
						<div>File:</div>
						<div>ID:</div>
						<div>Description:</div>
						<div>MIME type:</div>
					</div>
					<button type="button" class="btn btn-danger btn-sm ml-2 delete-attachment">
						<i class="bi-trash"></i>
					</button>
				</div>
			</template>
		</div>
		<label>File</label>
		<div class="custom-file">
			<input type="file" class="custom-file-input" id="attachment-file">
			<label class="custom-file-label" for="attachment-file" id="attachment-file-label">
				No file selected.
			</label>
		</div>
		<label for="attachment-id">Attachment ID</label>
		<input id="attachment-id" class="form-control"
			placeholder="Optional ID"></input>
		<label for="attachment-description">Attachment description</label>
		<input id="attachment-description" class="form-control"
			placeholder="Optional description"></input>
		<label for="attachment-mime-type">Attachment MIME type</label>
		<input id="attachment-mime-type" class="form-control"
			placeholder="Optional MIME type"></input>
	</div>
	<button class="btn btn-primary" id="add-attachment">Add attachment</button>
</form>
<script src="/e-invoice-eu/e-invoice-eu.js"></script>
<!--/qgoda-no-xgettext-->
