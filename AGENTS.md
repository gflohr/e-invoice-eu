# AI Agent Instructions

The E-Invoice-EU project is a toolchain for generating EN16931 conforming
e-invoices (Factur-X/ZUGFeRD, UBL, CII, XRechnung) from popular spreadsheet
formats (Excel, LibreOffice Calc, ...) or JSON.

## Monorepo Layout

| Directory                  | Purpose                                         |
| -------------------------- | ----------------------------------------------- |
| `packages/core/`           | The core functionality                          |
| `packages/docs/`           | Documentation including TypeDoc                 |
| `apps/cli/`                | The command-line interface                       |
| `apps/server/`             | The REST API built on NestJS                    |

## Essential Commands

```bash
pnpm install                    # Install dependencies
pnpm test                       # Run Vitest tests (all packages)
pnpm check                      # Biome check (all packages)
pnpm check:fix                  # Biome check with automatic fix (all packages)
pnpm build                      # Build for publishing (all packages)
```

## Code Conventions

- **ESM without `.ts` extensions** in imports
- **`type` over `interface`** for object shapes
- **JSDoc required** on exported functions (first overload only for overload sets)
- **`// @__NO_SIDE_EFFECTS__`** before pure factory functions for tree-shaking
- **Tabs for indentation, spaces for formatting**

## Other Rules

- **Source code is the single source of truth.** All documentation must match `{apps,packages}/*/src/`.
- **Lint and format after modifying code.** Run `pnpm check` so that CI passes.
- **Use the GitHub CLI for GitHub-related tasks.** Prefer `gh` for pull requests, issues, checks, and other GitHub operations.

## Background

The standard EN16931 allows the XML formats CII (Cross Industry Invoices) and
UBL (Universal Business Language) as semantic models. CII does not allow
credit nodes while UBL does. However, CII allows "corrected invoices" which
semantically overlap with "credit notes". The distinction is vague and also
depends on the country of the user.

There is also the French standard Factur-X and the German standard ZUGFeRD.
Nowadays, the two standards have been unified and only differ in their name.

Factur-X/ZUGFeRD documents are PDFs conforming to the PDF/A standard. They
must have XMP metadata embedded, and an XML attachment containing the electronic
invoice in CII format, UBL is not allowed.

Factur-X/ZUGFeRD come in 6 different flavours, called conformance levels:

* MINIMUM - a minimal e-invoice, not a valid invoice document in the EU
* BASIC_WL - a basic e-invoice but without line items (WL = without lines)
* BASIC - like BASIC_WL but with line items
* EN16931 - previously called COMFORT, with more semantic elements than BASIC
* EXTENDED - the maximum allowed set of semantic elements
* XRECHNUNG - allowing all elements from CII and specific to B2G in Germany

XRECHNUNG is a prominent example of a Core Invoice Usage Specification. A CIUS
defines country-specific business rules. As a consequence, the EN16931 is 
often considered not a EU-wide standard, because every member country
can define its own rules. This causes massive problems in practice.

Business terms are specific elements of an e-invoice. For example, the invoice
number is BT-1. Business rules are semantic rules referring to business terms,
for example BR-CO-10 demands "Sum of Invoice line net amount (BT-106) = Σ
Invoice line net amount (BT-131)". This is how CIUSs are defined by the
member countries.

Many elements allow only a fixed set of values. These are usually defined
as *code lists* that refer to external standards like ISO, ISO/IEC,
UNTDID, CEF, or UN/ECE recommendations.

Validators for electronic invoices are currently all written in Java, and
contain the UBL and CII structure in XSL stylesheets. The business rules are
encoded into Schematron rules.  The e-invoice-eu software only checks that the
input data conforms to UBL. 

The library can be used in two ways. You can define a mapping YAML file
that transforms a spreadsheet into a JSON file that is then transformed into
the XML output, or JSON can be used directly.

UBL documents are more or less a strict XML equivalent of the input JSON.

CII documents are generated using a hand-crafted transformer
(`src/format/format-cii.service.ts`).

CII allows more semantic elements than UBL. The library currently only supports
those elements that have a counterpart in PEPPOL-UBL.

Additional CII elements are not yet implemented and may need future support.

Many organisations will prefer to also provide the invoice as a PDF. For
Factur-X/ZUGFeRD, this PDF is the container for the electronic invoice. For
pure XML formats, the PDF can be included as a base64 encoded string.
Additional attachments containing supplementary information are allowed.

The PDF version either has to be supplied by the user or - if the invoice
input is a spreadsheet - can be created automatically by the software by
invoking LibreOffice and printing the first tab of the spreadsheet into a
PDF document.

## Library Architecture

The core types and interfaces of the library are generated from the XSL files
in the sub-repository packages/core/peppol-bis-invoice-3. That repository
is used to build the PEPPOL-UBL documentation and website.

**Do not modify generated files directly.** Always use the scripts to
regenerate them.

The XML files are first transformed with the `Makefile` and various scripts
in `scripts` to `src/schema/invoice.json`, a JSON schema for PEPPOL-UBL.
The JSON schema is converted to an interface `src/invoice/invoice.interface.ts`.
Therefore, users of the library can benefit from type-safety for their invoice
data.

The schema itself is also converted into a TypeScript representation.

There are also equivalent files generated for "mappings". A mapping defines
how spreadsheets are converted into valid invoice data. They mostly consist
of rules specifying where a particular invoice field can be found, for example
the invoice number should be taken from cell B12.

Because some fields, such as line items, can repeat, users can define
spreadsheet sections. Cell addresses within a section are relative to the
section start, not the beginning of the spreadsheet.

The library translates the XMP metadata with `esgettext`. The user interface
is not translated.

Directory structure:

```
packages/core
peppol-bis-invoice-3/   → PEPPOL-UBL documentation for generating the TypeScript/JSON definitions
po/                     → translations as .po files
scripts/                → helper scripts for generating the TypeScript/JSON definitions
src/                    → the library source code, see below
```

Directory structure of the `src` directory.

```
packages/core/src/
├── format/    → support for all possible (XML and PDF/XML) output formats
├── invoice/   → validation of invoice input data and transformation into a valid invoice document
├── locale/    → .mo files containing translations for esgettext
├── schema/    → the JSON schema definitions as JSON and TypeScript
└── utils/     → Internal helpers
```

## Format Identifiers

All output formats have a canonical form. For usability reasons, a lot of
aliases exist. These aliases may be used, wherever the format name has to be
passed as a string (library, REST API, command-line interface).

* Format names are case-insensitive
* "COMFORT" can be used instead of "EN16931"
* "BASIC-WL" can be used instead of "BASIC WL"
* "ZUGFeRD" can be used instead of "Factur-X"

Example: "ZUGFeRD-Comfort" is an alias for the canonical name "Factur-X-EN16931".

## Documentation

The source code documentation of the library is converted to HTML using
typedoc. The end-user documentation covering general information, description
of the command-line interface, and the REST service is written in Markdown.

The online documentation (on GitHub Pages) is created from the HTML and
Markdown files with the static site generator Qgoda, which also translates the
documentation into German based on `.po` files extracted from the English
version. The German translation is currently incomplete.

Qgoda is written in Perl and based on Template Toolkit. The source files
are Markdown files that can be enriched by Template Toolkit directives.

The entire documentation is also fed into a Google NotebookLM, so that users
can chat with an AI bot about the software. There should be a GitHub action
that automatically updates the NotebookLM.

The NestJS server has the usual `/api` endpoint for OpenAPI/Swagger
documentation.

## Language

Australian/British English is used throughout all components of the software.

Source code comments use proper language, terminating sentences with a full
stop, exclamation mark, or question mark. Formal spelling like "is not",
"cannot" is preferred over the informal versions like "isn't" or "can't".

Do not use spaces around slashes, when they separate two single words like
"with/without" or "Factur-X/ZUGFeRD". Use spaces, when they separate
multi-word phrases like in "Purpose / General Mode of Operation", even when just
one of the two is a multi-word phrase.

Always put a space before a unit or a percent sign. It is "5 m", "50 %",
and "37.2 °C".

Do not use spaces around phrases in any kind of parentheses.

Good:

- invoices (or credit notes)
- `if (Object.prototype.hasOwnProperty.call(something, 'else'))`

Bad:

- ~~invoices ( or credit notes )~~
- ~~`if ( Object.prototype.hasOwnProperty.call( something, 'else' ) )`~~

## Docker Container

The NestJS server is also available as a Docker container that is built on
every push with GitHub actions. Releases are also published to DockerHub.

The GitHub Action produces two images:

* e-invoice-eu — includes the NestJS service and LibreOffice (use this if automatic PDF generation from spreadsheets is needed).
* e-invoice-eu:slim — excludes LibreOffice (use this if PDF generation is done externally).

## Issue Guidelines

Many issues are filed by people without a strong technical background. They often
file issues that are related to multiple problems, often unrelated. That
causes extra work for the maintainers.

This is less of a problem for a pull request, unless the commits are squashed
or cannot be reverted independently.

If an issue contains multiple unrelated problems (e.g. different bugs or
feature requests), suggest splitting it into separate issues.

For pull requests, do not request splitting unless it is clearly feasible
without extra work for the contributor.

Do not use labels like `invalid`, `invalid-multi-issue`, or `wontfix` that can
sound embarrassing for users and contributors. Apply labels based on the
touched topics instead.

## Agent Skills

This repository includes agent skills in `.agents/skills/` following the
[Agent Skills](https://agentskills.io) open standard.

**Naming:** Skills prefixed with repo- are local to this repository. Only these
should be invoked automatically by AI agents in this repo. External skills may
exist but require explicit usage.
