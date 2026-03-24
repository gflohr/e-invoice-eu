---
name: repo-generated-files
description: >
  Explains the rules and patterns for generated files in the e-invoice-eu library,
  including TypeScript interfaces, JSON schemas, and mapping scaffolds. Guides AI
  agents on which files are generated, how they are updated, and how to handle
  issues or pull requests involving generated code.
---

# E-Invoice-EU Generated Files

This skill documents **how generated files are handled** in the e-invoice-eu repo.
Generated files appear in `packages/core/src/invoice`, `packages/core/src/schema`,
and similar directories.

## General Rules

- **Generated files are read-only.**
  - Do not edit manually.
  - Edits must be made in the **source from which the file is generated**, e.g., mapping YAML, XSL files, or scripts.
- **First line always contains a warning comment**, e.g.:
  
```ts
// This file is generated. Do NOT edit! Edit <source file> instead.

// ... generated content follows.
```

Generated files include:

* TypeScript interfaces (.ts) generated from JSON schemas
* JSON schema definitions (.json)
* Mapping scaffolds for spreadsheet → JSON → XML transformations

## Updating Generated Files
Files are updated by scripts in `packages/core/scripts/` via
`packages/core/Makefile`.

Typical workflow:

1. Edit source (YAML, XSL, spreadsheet, or JSON template)
2. Run `make` in `packages/core`
3. Commit both the source and updated generated files together

Don'ts:

* Do not update generated files independently in PRs.

## Naming and Placement

Generated files are always under their corresponding package’s src/ directory.
File names usually match the source or schema they were generated from, e.g.:

* `invoice.interface.ts` → generated from invoice.json schema
* `mapping.schema.ts` → mapping scaffold schema

## Handling Issues and Pull Requests

AI agents should:

* Never suggest direct edits to generated files.
* Detect if a PR modifies generated files without updating sources → flag as improper.
* Prefer to guide contributors to modify the source artifacts instead.
* Understand that most type-checking, linting, and documentation applies to source-generated content, not runtime values in generated files.

## Special Notes
  
* Some generated files contain complex type relationships derived from PEPPOL-UBL schemas. AI agents should:

  * Use them only as a reference for type inference
  * Avoid manually duplicating logic from these files

* Internal tools and scripts rely on consistent structure of generated files. Misaligned edits may break:

  * JSON → TypeScript conversion
  * Mapping transformations

## Summary for AI Agents

* Generated files are read-only; never edit manually.
* Source of truth: YAML, XSL, scripts, or spreadsheet templates.
* Workflow: edit source → regenerate → commit.
* Validation: type tests, linting, and documentation check the generated files automatically.
* PR handling: advise contributors to update sources, not generated files.
