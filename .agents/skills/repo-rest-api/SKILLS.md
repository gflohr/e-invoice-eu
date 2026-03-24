---
name: repo-rest-api
description: >
  Provides AI agents with instructions for using the `e-invoice-eu` REST API.
  Includes deployment options, endpoints, and detailed guidance for each endpoint.
---

# e-invoice-eu REST API

This skill documents how to use the `e-invoice-eu` REST API.


## Deployment

The general options are:

* Run as a (docker) container (easiest).
* Build and run it in production mode (for on-prem).
* Run it locally in development mode (for hacking on e-invoice-eu).

### Docker Container

```sh
docker pull gflohr/e-invoice-eu:latest
docker run --rm -p 3000:3000 --name e-invoice-eu gflohr/e-invoice-eu:latest
```

The slim image does not include LibreOffice. This can be used if PDF versions
of the invoice are never created from spreadsheets but are already available:

```sh
docker pull gflohr/e-invoice-eu:slim
docker run --rm -p 3000:3000 --name e-invoice-eu gflohr/e-invoice-eu:slim
```

### Run in Production Mode

Clone the repository with one of:

```sh
# HTTPS
git clone https://github.com/gflohr/e-invoice-eu.git

# SSH
git clone git@github.com:gflohr/e-invoice-eu.git
```

Build and run the server:

```sh
pnpm install
pnpm run build
cd apps/server
pnpm run start:prod
```

The server is running on http://[::1]:3000.

### Run in Development Mode

Clone the repository with one of:

```sh
# HTTPS
git clone https://github.com/gflohr/e-invoice-eu.git

# SSH
git clone git@github.com:gflohr/e-invoice-eu.git
```

Run the server:

```sh
pnpm install
cd apps/server
pnpm run start:dev
```

## Configuration

The server can be configured with environment variables:

| Name           | Default           | Purpose                   |
| -------------- | ----------------- | ------------------------- |
| `PORT`         | 3000              | The port listened to      |
| `LIBRE_OFFICE` | platform-specific | Locate LibreOffice binary |
| `LIBREOFFICE`  | platform-specific | Same as `LIBRE_OFFICE`.   |
| `NODE_ENV`     | none              | See Node.js docs          |

## Endpoints

### OpenAPI/Swagger Documentation (`/api`, `/api-json`, `/api-yaml`)

#### Purpose / General Mode of Operation

* Read the API documentation
* Try the API out in the browser

#### Usage Examples

* `/api` for interactive HTML documentation
* `/api-json` for API documentation as JSON
* `/api-yaml` for API documentation as YAML

#### Key-Takeaways for AI Agents

* Purely informational.


### Invoice Creation (`/api/invoice/create/{format}`)

#### Purpose / General Mode of Operation

* Creates an e-invoice in the specified format (UBL, CII, Factur-X/ZUGFeRD).
* Can generate from spreadsheet data + mapping, or from JSON invoice data.
* Supports optional PDF embedding and attachments.

#### Prerequisites

* Server must be running.
* Format must be valid (case-insensitive, aliases allowed).
* Spreadsheet and mapping file, if generating from spreadsheet.
* Optional: PDF file if embedding.
* Optional: Additional attachments.

#### Parameters

| Parameter                  | Type    | Description                                              |
| -------------------------- | ------- | -------------------------------------------------------- |
| `format`                   | string  | Supported format                                         |
| `invoice`                  | file    | JSON file for invoice generation                         |
| `mapping`                  | file    | Mapping YAML/JSON for spreadsheet to JSON.               |
| `spreadsheet`              | file    | Spreadsheet file                                         |
| `lang`                     | string  | Language identifier (e.g., fr-fr)                        |
| `embedPDF`                 | boolean | Embed PDF into XML output (ignored for Factur-X/ZUGFeRD) |
| `pdf`                      | file    | PDF version of invoice                                   |
| `pdfID`                    | string  | ID for embedded PDF (defaults to doc number)             |
| `pdfDescription`           | string  | Optional description for embedded PDF                    |
| `attachment`               | string  | Additional attachment                                    |
| `attachmentID`             | string  | ID of attachment (optional)                              |
| `attachmentDescription`    | string  | Description of attachment (optional).                    |
 
Note, that there is no parameter `attachmentMIMEType` because the MIME type
will be provided by the HTTP client.

#### Usage Examples

* Create invoice from spreadsheet + mapping:
```sh
curl -X POST "http://localhost:3000/api/invoice/create/UBL" \
  -F "spreadsheet=@contrib/templates/default-invoice.ods" \
  -F "mapping=@contrib/mappings/default-invoice.yaml"
```
* Create invoice from JSON:
```sh
curl -X POST "http://localhost:3000/api/invoice/create/UBL" \
  -F "invoice=@contrib/data/default-invoice.json"
```
* Full-fledged example
```sh
curl -X POST \
 http://localhost:3000/api/invoice/create/UBL \
 -F lang=de \
 -F spreadsheet=@contrib/templates/default-invoice.ods \
 -F mapping=@contrib/mappings/default-invoice.yaml \
 -F embedPDF=1 \
 -F pdf=@invoice.pdf \
 -F pdfID=1234567890 \
 -F pdfDescription="Invoice as PDF." \
 -F "attachment=@time-sheet.ods;type=application/vnd.oasis.opendocument.spreadsheet" \
 -F "attachmentID=abc-123-xyz" \
 -F attachmentDescription="Detailed description of hours spent." \
 -F attachment=@payment-terms.pdf \
 -F attachmentDescription="Our payment terms"
 ```

#### Key Takeaways for Agents

* Must check if invoice or spreadsheet+mapping is provided.
* Embed PDF only if supported for format.
* Multiple attachments must have optional IDs/descriptions aligned with file order.
* Validate format string against `/api/format/list`.

### Spreadsheet Transformation (`/api/mapping/transform/{format}`)

#### Purpose / General Mode of Operation

* Transforms spreadsheet data into the internal JSON format.
* Useful for informational purposes or as input for /api/invoice/create.

#### Prerequisites

* Server must be running.
* Format must be valid (case-insensitive, aliases allowed).
* Spreadsheet and mapping file
* Valid format identifier

#### Parameters

| Parameter                  | Type    | Description                                              |
| -------------------------- | ------- | -------------------------------------------------------- |
| `format`                   | string  | Supported format                                         |
| `mapping`                  | file    | Mapping YAML/JSON for spreadsheet to JSON.               |
| `spreadsheet`              | file    | Spreadsheet file                                         |

#### Usage Examples

* Transform spreadsheet + mapping into invoice data in internal format:
```sh
curl -X POST "http://localhost:3000/api/mapping/transform/UBL" \
  -F "spreadsheet=@contrib/templates/default-invoice.ods" \
  -F "mapping=@contrib/mappings/default-invoice.yaml"
```

#### Key Takeaways for Agents

* Produces JSON invoice data suitable for /api/invoice/create.
* Format must still be specified, even if internal format does not change.

### Output Format Information (`/api/format/list`)

#### Purpose / General Mode of Operation

* Retrieve a list of supported e-invoice formats and their metadata.
* Returns format name, customization ID, profile ID, MIME type, and syntax.

#### Prerequisites

* None, public endpoint.
* The REST server must be running.

#### Parameters

None.

#### Usage Example

* GET request: `curl http://localhost:3000/api/format/list`
* Expected response:
```json
[
  {
    "name": "UBL",
    "customizationID": "urn:cen.eu:en16931:2017",
    "profileID": "urn:fdc:peppol.eu:2017:poacc:billing:01:1.0",
    "mimeType": "application/xml",
    "syntax": "UBL"
  }
]
```

### Schemas (`/api/schema/mapping` and `/api/schema/invoice`)

#### Purpose / General Mode of Operation

* `/api/schema/mapping`: returns the JSON schema for mapping files.
* `/api/schema/invoice`: returns the JSON schema for invoice JSON data.
* Used for validation and client-side form generation.

#### Prerequisites

* Server running.

#### Parameters

None.

#### Usage Example

* GET request: `curl http://localhost:3000/api/schema/invoice`
* GET request: `curl http://localhost:3000/api/schema/mapping`

#### Key Takeaways for Agents

* Use schemas to validate user-supplied files.
* Schemas link to the official JSON Schema spec.
* No authentication required.

## Check List

[ ] Server running?
[ ] Prerequisites?
