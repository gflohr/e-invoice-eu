---
name: repo-cli-usage
description: >
  Provides AI agents with instructions for using the `e-invoice-eu` CLI. Includes
  installation, help commands, and detailed guidance for each CLI command.
---

# e-invoice-eu CLI Usage

This skill documents how to install and use the `e-invoice-eu` command-line tool.

## Installation

You can install the commandline tool `e-invoice-eu` like this:

```sh
npm install -g @e-invoice-eu/cli
```

Instead of `npm` you can also use `pnpm`, `yarn`, or `bun` with their
respective install directive.

If you lack permissions, prepend sudo to the command.

Test the installation:

```text
e-invoice-eu --version
```

## Obtaining Help

You can get an overview of all available commands and global options with
`e-invoice-eu --help` or `e-invoice-eu -h`.

## Global Options

The only other global option is `--version` respectively `-V` (case matters,
`-v` does not work).

## Commands

### The Command `invoice`

#### Purpose / General Mode of Operation

* Maps spreadsheet data to internal JSON invoice format (optional: can use JSON directly).
* Generates XML or hybrid PDF/XML e-invoices.

#### Prerequisites

* Spreadsheet template (example: contrib/templates/default-invoice.ods).
* Mapping definition file (example: contrib/mappings/default-invoice.yaml).
* Optional: LibreOffice for PDF generation.
* Correct working directory (top-level repo directory).

#### Command-Specific Options

| Option                     | Type   | Description                                              |
| -------------------------- | ------ | -------------------------------------------------------- |
| `-f, --format`             | string | Supported format (UBL, CII, Factur-X/ZUGFeRD)            |
| `-o, --output`             | string | Output file path instead of stdout                       |
| `-i, --invoice`            | string | JSON file for invoice generation                         |
| `-m, --mapping`            | string | Mapping YAML/JSON for spreadsheet to JSON.               |
| `-s, --spreadsheet`        | string | Spreadsheet file                                         |
| `-l, --lang`               | string | Language identifier (e.g., fr-fr)                        |
| `--embedPDF`               |        | Embed PDF into XML output (ignored for Factur-X/ZUGFeRD) |
| `-p, --pdf`                | string | PDF version of invoice                                   |
| `--pdf-id`                 | string | ID for embedded PDF (defaults to doc number)             |
| `--pdf-description`        | string | Optional description for embedded PDF                    |
| `-a, --attachment`         | string | Additional attachment                                    |
| `--attachment-id`          | string | ID of attachment (optional)                              |
| `--attachment-description` | string | Description of attachment (optional).                    |
| `--attachment-mimetype`    | string | MIME type for attachment (optional)                      |

#### Usage Examples

* Basic invoice from spreadsheet:
	* Map spreadsheet → JSON → XML
	* Uses --spreadsheet and --mapping
* Invoice with additional attachments:
	* Embed PDFs or extra files with --embedPDF, --pdf, --attachment* options
* Factur-X/ZUGFeRD output:
	* Binary output redirected to file using --output

#### Special Notes / Hints

* Generating PDF requires LibreOffice unless a PDF is provided.
* Redirecting standard output may corrupt binary output, especially on Windows → always use --output.
* Multiple attachments can be specified; IDs and descriptions must follow in the same order or will be defaulted.

#### JSON Input Only

* Skip mapping step if JSON already exists.
* Specify source of invoice data with `--invoice=INVOICE_JSON` instead of `--spreadsheet=SPREADSHEET` and `--mapping=MAPPING`

#### Key Takeaways for Agents

* Ensure users specify correct format, spreadsheet/mapping, and PDF options.
* Warn about Windows output issues if --output is omitted.
* Advise using optional IDs/descriptions for multiple attachments to avoid misalignment.
* Remember hybrid Factur-X/ZUGFeRD requires a PDF.
* Prefer examples from templates and mappings over rewriting commands.

--- End of documentation for command `invoice`. ---

### The Command `transform`

#### Purpose / General Mode of Operation

* Maps spreadsheet data to the internal JSON invoice format.
* Produces JSON data in the internal format, primarily for inspection or further processing.
* Not intended to produce a valid e-invoice directly.

#### Prerequisites

* Spreadsheet template (example: contrib/templates/default-invoice.ods).
* Mapping definition file (example: contrib/mappings/default-invoice.yaml).
* Correct working directory (top-level repo directory).

#### Command-Specific Options

| Option                     | Type   | Description                                              |
| -------------------------- | ------ | -------------------------------------------------------- |
| `--spreadsheet`            | string | Spreadsheet file containing invoice data.                |
| `--mapping`                | string | Mapping YAML/JSON for spreadsheet → internal JSON        |
| `--output`                 | string | Optional output file path; if omitted, writes to stdout  |
| `-f, --format`             | string | Required format identifier.                              |

The `--format` option is required to set the default customizationID in the
output JSON.

#### Usage Examples

* Transform spreadsheet to internal JSON:
	* Uses --spreadsheet and --mapping
	* Optionally specify --output to save to a file instead of stdout

Example command:

```sh
e-invoice-eu transform --format=UBL \
	    --spreadsheet=contrib/templates/default-invoice.ods \
	    --mapping=contrib/mappings/default-invoice.yaml \
	    --output=invoice.json
```

#### Special Notes / Hints

* --format is required because it determines the default customization ID in the output.
* If a customization ID is already present in the spreadsheet data, it is preserved and --format is mainly informational.
* JSON output is intended for inspection or further processing, not for direct submission as an e-invoice.

#### Key Takeaways for Agents

* Ensure users supply a valid spreadsheet and corresponding mapping.
* Warn users that JSON output is not a valid e-invoice.
* Advise using `jq` to improve readability of the output.
* Format option mainly controls default customization ID; does not overwrite an existing one.

--- End of documentation for command `transform`. ---

### The Command `validate`

#### Purpose / General Mode of Operation

* Validates e-invoices using a local or remote validation server.
* Supports batch processing of multiple invoice files (XML or PDF).
* Detects compliance with supported e-invoice standards and reports errors.

#### Prerequisites

* Java Runtime Environment (JRE) ≥ 11
	* Required to run offline validators or the e-invoice-eu-validator server.
	* Verify with `java -version`.
	* If missing, install OpenJDK
* E-Invoice-EU Validator Server (optional but recommended for batch processing)
	* Download validator-VERSION-jar-with-dependencies.jar from https://github.com/gflohr/e-invoice-eu-validator/releases
	* Start server: `java -jar validator-VERSION-jar-with-dependencies.jar`
	* Server listens on port 8080 by default; use PORT environment variable to override.

#### Command-Specific Options

| Option                     | Type   | Description                                                      |
| -------------------------- | ------ | ---------------------------------------------------------------- |
| `-u, --url`                | string | URL of the validation server (default: `http://localhost:8080`) |
| `-v, --verbose`            |        | Also report results for valid invoices                           |
| `-q, --quiet`              |        | suppress all output                                              |

#### Usage Examples

* Validate multiple invoices: `e-invoice-eu validate invoice*.xml invoice*.pdf`

Sample output:

```text
invoice-283784.xml: ✓ valid
invoice-445937.pdf: ✓ valid
invoice-459872.xml: ✗ invalid
invoice.xml: ✗ invalid
invoice-845937.pdf: ✓ valid

3 invoices valid.
One invoice invalid.
```

#### Key Takeaways for Agents

* Ensure users have JRE ≥ 11 if offline validation is needed.
* Suggest starting the validator server for batch processing.
* Warn that invalid invoices produce detailed console messages.
* Remind that exit codes indicate overall validation success/failure.
* Advise specifying --verbose only if detailed success reports are needed.

--- End of documentation for command `validate`. ---

### The Command `format`

#### Purpose / General Mode of Operation

* Lists supported formats.
* Gives information about an output format in a structured way.
* Useful for scripting applications around the e-invoice-eu tool chain

#### Command-Specific Options

| Option                     | Type   | Description                                                      |
| -------------------------- | ------ | ---------------------------------------------------------------- |
| `-l, --list`               |        | List all supported formats                                       |
| `-i, --info`               | string | Show detailed information about one format                       |
| `-q, --quiet`              |        | suppress all output                                              |

#### Format Identifiers

All output formats have a canonical form. For usability reasons, a lot of
aliases exist.

* Format names are case-insensitive
* "COMFORT" can be used instead of "EN16931"
* "BASIC-WL" can be used instead of "BASIC WL"
* "ZUGFeRD" can be used instead of "Factur-X"

Example: "ZUGFeRD-Comfort" is an alias for the canonical name "Factur-X-EN16931".

#### Usage Examples

* List all formats in alphabetical order: `e-invoice-eu format --list`
* Show information about one format: `e-invoice-eu format --info Factur-X-Extended`

Sample output:

```
name: factur-x-extended
syntax: CII
mimeType: application/pdf
customizationID: urn:cen.eu:en16931:2017#conformant#urn:factur-x.eu:1p0:extended
profileID: urn:fdc:peppol.eu:2017:poacc:billing:01:1.0
```

The output always follows this schema for all formats.

#### Key Takeaways for Agents

* Format names are case-insensitive and have aliases
* The command `format` is mostly used for scripting applications around the tool chain

--- End of documentation for command `format`. ---

### The Command `schema`

#### Purpose / General Mode of Operation

* Outputs the JSON schema definitions.

#### Command-Specific Options

| Option                     | Type   | Description                                                      |
| -------------------------- | ------ | ---------------------------------------------------------------- |
| `--id`                     | string | Allowed arguments are `invoice` and `mapping`                    |

#### Usage Examples

* Output the `invoice` JSON schema: `e-invoice-eu schema --id=invoice`
* Output the `mapping` JSON schema: `e-invoice-eu schema --id=mapping`

The output has all unnecessary whitespace removed. It should be piped through
`jq` if more readability is required.

#### Key Takeaways for Agents

* Only `invoice` and `mapping` are supported.
* Use `jq` where applicable.

--- End of documentation for command `schema`. ---

## Check List

- [ ] The CLI is installed globally (npm, yarn, pnpm, or bun).
- [ ] Use e-invoice-eu --help for general guidance.
- [ ] Each command has its own help: e-invoice-eu *command* --help.
- [ ] Contributors or agents should never modify installation instructions; they are fixed.
- [ ] Include examples for every command in the documentation.
- [ ] Include notes or hints for special scenarios (permissions, PDF generation, etc.).
- [ ] Prefer `--long-option` over `-s`, when giving advice to users.
