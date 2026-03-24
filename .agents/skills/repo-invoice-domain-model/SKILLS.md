---
name: repo-invoice-domain-model
description: >
  Teaches AI agents about the e-invoice domain concepts used in e-invoice-eu,
  including EN16931 business terms (BT), business rules (BR), CIUS concepts,
  differences between UBL, CII, and Factur-X/ZUGFeRD, and the mapping of
  spreadsheet/JSON data to invoice structures. Use for issue triage, code
  review, type inference guidance, and answering questions about invoice
  semantics.
---

# E-Invoice Domain Model

This skill documents **core domain knowledge** for electronic invoices,
focusing on how e-invoice-eu handles standards, transformations, and structured
data.

## Standards

- **EN16931**: European semantic model for e-invoices.
  - Defines **business terms (BT-xxx)** and **business rules (BR-xxx)**.
  - CIUS (Core Invoice Usage Specification) are country-specific rule sets.
- **UBL (Universal Business Language)**: Strict XML model of the invoice.
- **CII (Cross Industry Invoice)**: XML model that supports some semantic elements UBL does not. Used in Factur-X/ZUGFeRD and standalone.
- **Factur-X/ZUGFeRD**: PDF container format embedding CII XML. Comes in 6 conformance levels (MINIMUM, BASIC_WL, BASIC, EN16931, EXTENDED, XRECHNUNG).
- **XRECHNUNG** German CIUS used especially in B2G in Germany.

The pure XML formats of the German XRECHNUNG are XRECHNUNG-UBL and
XRECHNUNG-CII.

## Business Terms (BT)

- Unique identifiers for invoice fields.
- Examples:
  - **BT-1**: Invoice number
  - **BT-2**: Invoice issue date
  - **BT-112**: Total amount including VAT
- BT numbers should appear in code comments and TypeDoc where appropriate.

## Business Rules (BR)

- Rules that validate business terms.
- Example:
  - **BR-CO-10**: Sum of invoice line net amount (BT-106) must equal total net amount (BT-131)
- Additional BRs can apply by country (CIUS).

## Mappings

- **Spreadsheet → JSON → Internal Format**
- Mapping YAML defines how to locate BT values in the spreadsheet:
  - Single-cell mappings: e.g., invoice number → B12
  - Section mappings: repeatable ranges for line items

## Transformation Notes

- UBL documents are almost 1:1 with JSON input.
- CII documents are produced by transformer (`format-cii.service.ts`) from UBL:
  - Some elements in CII do not exist in UBL and are **currently unsupported**.
- Factur-X/ZUGFeRD PDFs embed CII XML.  
  - Optional PDF generation from spreadsheet via LibreOffice if no PDF is supplied.

## Identifiers and Terminology in Code

- **InternalFormat**: The internal representation derived from PEPPOL-UBL.
- **factur-x / FacturX / facturX**: Case-specific naming for identifiers.
- Use BT numbers and the corresponding field names in comments (example: `cac:InvoiceLine` (`BT-xxx`)) and type annotations.

## Common Pitfalls

- Confusing XRECHNUNG with e-invoice in general
- Modifying generated files instead of mappings or source JSON

## Usage Guidance

AI agents should use this skill to:

1. Interpret issues and PRs with invoice-domain relevance.
2. Explain type inference in `packages/core/src/invoice`.
3. Suggest corrections in mappings or transformations.
4. Clarify standard-specific questions (EN16931, CII, UBL, Factur-X).
5. Validate or comment on business term usage in code or tests.
