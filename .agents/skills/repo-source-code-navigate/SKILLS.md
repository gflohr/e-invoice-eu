---
name: repo-structure-navigate
description: Navigate the e-invoice-eu repository structure. Use when looking for files, understanding the codebase layout, finding schema definitions, locating tests, API docs, or guide pages. Covers monorepo layout, library architecture, file naming conventions, and quick lookups.
---

# E-Invoice-EU Repository Structure

## Monorepo Layout

```
e-invoice-eu/
├── assets/             # Logos and so on.
├── apps/               # Applications.
│   ├── cli/            # The command-line interface.
│   └── server/         # The REST API using NestJS
├── contrib/            # Sample files, custom data, and helpers.
│   ├── code-lists/     # Code-lists that override those by PEPPOL-UBL.
│   ├── data/           # Sample invoices as JSON.
│   ├── mappings/       # Sample mappings from spreadsheet data to invoice data.
│   ├── templates/      # Sample invoices as LibreOffice Calc documents (spreadsheets).
│   └── validators/     # Wrapper scripts around popular Java validators.
└── packages/           # Other.
│   ├── core/           # The @e-invoice-eu/core library.
│   └── documentation/  # Documentation using qgoda static site generator.
```

## Core Library (`/packages/core/src/`)

### Directory Structure

| Directory   | Purpose                         | Examples                                          |
| ----------- | ------------------------------- | ------------------------------------------------- |
| `format/`   | Output format generators.       | `format-cii/`, `format-ubl/`, `format-factur-x/`. |
| `invoice/`  | Invoice representation.         |                                                   |
| `locale/`   | Binary translations (`.mo`)     | `de/`, `fr/`, `bg/`.                              |
| `types/`    | TypeScript definitions          | `schema.ts`, `issue.ts`, `dataset.ts`         |
| `utils/`    | Internal helpers (prefixed `_`) | `_addIssue/`, `_stringify/`, `ValiError/`     |
| `storages/` | Global state                    | Config, message storage                       |

### Output Formats

- CII (XML)
- UBL (XML)
- Factur-X-Minimum (PDF/A, CII)
- Factur-X-Basic-WL (PDF/A, CII)
- Factur-X-Basic (PDF/A, CII)
- Factur-X-EN16931 (PDF/A, CII)
- Factur-X-Extended (PDF/A, CII)
- Factur-X-XRECHNUNG (PDF/A, CII)
- XRECHNUNG-CII (XML)
- XRECHNUNG-UBL (XML)

The backends in `packages/core/src/format` use inheritance, for example:

`format-factur-x-extended.service.ts` extends
`format-factur-x.service.ts` extends
`format-cii.service.ts` extends
`format-ubl.service.ts` extends
`format-xml.service.ts`.

### Schemas

in 

- `invoice` - an invoice document
- `mapping` - a spreadsheet-to-invoice mapping

The mapping schema is mostly based on the invoice schema.

### File Naming Convention

We use multiple dots to describe the function of a source code file, for
example `invoice.service.ts`, `invoice.service.spec.ts`, `invoice.controller.ts`,
and so on.

Test files (`*.spec.ts`) live next to the file with the class under test. There
is not test directory.

## Commands

```bash
pnpm install                    # Install dependencies
pnpm test                       # Run Jest tests (all packages)
pnpm lint                       # ESLint + tsc + deno check (all packages)
pnpm format                     # Format code with Prettier (all packages)
pnpm build                      # Build for publishing (all packages)
```

They work and do the same thing from the root of the repository for all
workspaces or from a workspace directory.

## Key Principles

1. **Modularity** - Small, focused functions
2. **Zero dependencies** - Core library has no runtime deps
3. **Maximum test coverage** - Required for library
4. **Tree-shakable** - Use `// @__NO_SIDE_EFFECTS__` annotation (not yet implemented)
5. **Type-safe** - Full TypeScript with strict mode

## Do's and Don'ts

**Do:**

- Follow existing code patterns
- Write runtime and type tests
- Add TypeDoc documentation
- Keep functions small and focused
- Check bundle size impact

**Don't:**

- Add unnecessary external dependencies (left-pad)
- Modify core types without full test run
- Skip tests
- Create large multi-purpose functions
- Modify generated files (`dist/`, `coverage/`)
