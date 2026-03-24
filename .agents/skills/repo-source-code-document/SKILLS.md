---
name: repo-source-code-document
description: Write TypeDoc comments and inline documentation for e-invoice-eu library source code in /packages/core/src/. Use when documenting classes, interfaces, and types. Covers interface documentation, function overloads, purity annotations, inline comment patterns, and terminology consistency.
---

# E-Invoice-EU Source Code Documentation

Documentation patterns for library source code in `/packages/core/src/`.

## TypeDoc Patterns

### Interface Documentation

```typescript
/**
 * Interface representing an e-invoice format generation service.
 */
export interface EInvoiceFormat {
	/**
	 * The default customization ID of the format.
	 *
	 * This ID specifies a particular customization of the invoice format,
	 * which may define additional constraints or extensions to the standard.
	 */
	get customizationID(): string;

	/**
	 * The default profile ID of the format.
	 *
	 * The profile ID identifies a specific usage profile for the e-invoice,
	 * often used to distinguish between different industry-specific implementations.
	 */
	get profileID(): string;

	/**
	 * Populates an invoice with default and computable values.
	 *
	 * This method fills in any missing fields in the invoice with default values
	 * to ensure it meets the required specifications.
	 *
	 * @param invoice - The invoice to be updated.
	 */
	fillInvoiceDefaults(invoice: Invoice): void;
}
```

**Rules:**

- First line: Short description of the interface.
- Property comments: `The [description].` (always start with "The", end with period).
- All properties use getters.
- No blank lines between command and property.

### Hints

Add hints after the main description, before `@param`:

```typescript
/**
 * Creates an object schema.
 *
 * Hint: This schema removes unknown entries. To include unknown entries, use
 * `looseObject`. To reject unknown entries, use `strictObject`.
 *
 * @param entries The entries schema.
 *
 * @returns An object schema.
 */
```

### Links

Link to external resources when relevant using markdown format:

```typescript
/**
 * Sends an [email](https://en.wikipedia.org/wiki/Email_address).
 */
```

### Implementation Method

The method implementing an interface **should NOT duplicate interface documentation**
and does **NOT need TypeDoc**. Example:

```typescript
// @__NO_SIDE_EFFECTS__
async addMetadata(
  data: Record<string, string>
): Promise<void> {
    /* ... */
}
```

### Functions

**`// @__NO_SIDE_EFFECTS__` rules:**

- Add for pure functions (no external state mutation, no I/O)
- **Do NOT add** for functions that mutate arguments (like `addMetadata`)
- Used by bundlers for tree-shaking

### Utility Functions

```typescript
/**
 * Stringifies an unknown input to a literal or type string.
 *
 * @param input The unknown input.
 *
 * @returns A literal or type string.
 *
 * @internal
 */
// @__NO_SIDE_EFFECTS__
export function stringify(input: unknown): string {
  // ...
}
```

**Rules:**

- Use `@internal` tag for internal utilities.
- Internal functions have no `_` prefix.
- Only add `// @__NO_SIDE_EFFECTS__` if function is pure.

## Inline Comment Patterns

### No Unnecessary Comments

Do not comment obvious code:

```typescript
	// Calculate circumference of the circle.
	const c = 2 * circle.r * Math.PI;
```

In general, it should *always* be obvious, what the code does. And that means
that comments are rarely helpful. Rationale:

* Comments occupy space and therefore obscure sorce code.
* Comments tend to rot. They are not automatically updated, when the code changes.

### Section Headers

```typescript
function run(dataset, config) {
  // Get input value from dataset
  const input = dataset.value;

  // If root type is valid, check nested types.
  if (Array.isArray(input)) {
    // Set typed to true and value to empty array.
    dataset.typed = true;
    dataset.value = [];

    // Parse schema of each array item.
    for (let key = 0; key < input.length; key++) {
      // ...
    }
  }
}
```

**Rules:**

- Describe WHAT the next code block does
- Present tense verbs: "Get", "Parse", "Check", "Set", "Add", "Create"
- **Omit articles** ("the", "a", "an"): "Get input value" not "Get the input value"
- Full stop at end
- Blank line before comment, no blank line after

### Conditional Logic

```typescript
// If root type is valid, check nested types.
if (input && typeof input === 'object') {
  // ...
}

// Otherwise, add issue.
else {
  _ddIssue(this, 'type', dataset, config);
}
```

**Rules:**

- Use "If [condition], [action]"
- Use "Otherwise, [action]" for else branches
- Omit articles

### Hint Comments (Exception)

```typescript
// Hint: The issue is deliberately not constructed with the spread operator
// for performance reasons
const issue: BaseIssue<unknown> = {
  /* ... */
};
```

**Rules:**

- Start with "Hint:"
- Explain WHY, not just what
- **CAN use articles** (unlike other inline comments)
- Document performance decisions, non-obvious logic

### TODO Comments

```typescript
// TODO: Should we add "n" suffix to bigints?
if (type === 'bigint') {
  /* ... */
}
```

## Terminology

Use consistently:

- **Mapping** (for spreadsheet to invoice data mappings)
- **InternalFormat** (not "UBL" for the internal format mostly derived from PEPPOL-UBL)
- **FacturX/ZUGFeRD** (not "Factur-X" or "ZUGFeRD")

The last rule applies to comments. For identifiers, avoid any capitalisation
of "ZUGFeRD" but use `factur-x`, `FacturX`, or `facturX` depending on the
applicable casing style (camelCase, PascalCase, kebap-case).

The term "invoice" often stands for "invoice" or "credit note". Use both
terms, wherever not mentioning "credit note" can lead to confusion.

## Checklist

- [ ] Interfaces: `[description].`
- [ ] Properties: `The [description].`
- [ ] Implementation: NO TypeDoc duplication from interface TypeDoc
- [ ] Pure functions: `// @__NO_SIDE_EFFECTS__`
- [ ] Impure functions (mutate args): NO `@__NO_SIDE_EFFECTS__`
- [ ] Internal utilities: `@internal` tag
- [ ] Inline comments: No articles (except Hint), period at end
- [ ] TypeDoc comments: End with periods
