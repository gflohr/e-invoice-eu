---
name: repo-source-code-review
description: Review pull requests and source code changes. Use when reviewing PRs, validating implementation patterns, or checking code quality before merging. Covers code quality checks, type safety, documentation review, test coverage, and common issues to watch for.
---

# Reviewing Source Code Changes

Guide for reviewing PRs and source code changes in the entire monorepo.

## When to Use This Guide

- Reviewing pull requests modifying source code, including pipelines
- Validating implementation patterns before merging
- Checking code quality, types, documentation, and tests

## Review Process

1. **Understand the change** — Read PR description, identify affected files.
2. **Check patterns** — Verify code follows existing conventions.
3. **Verify types** — Ensure type safety and proper inference.
4. **Review docs** — Confirm JSDoc is complete and accurate.
5. **Check tests** — Validate runtime and type test coverage.

## What to Review

### Code Quality

| Check             | Requirement                                                           |
| ----------------- | --------------------------------------------------------------------- |
| Naming            | Matches existing patterns.                                            |
| Purity annotation | `// @__NO_SIDE_EFFECTS__` before pure factory functions               |
| Import extensions | Imports do not use `.ts` extension                                    |
| Interface vs type | Prefer `type` over `interface`.                                       |
| Folder structure  | Each API has a barrel file `index.ts`                                 |

**Good — purity annotation:**

```typescript
// @__NO_SIDE_EFFECTS__
export function string(message?: ErrorMessage<StringIssue>): StringSchema {
  return {
    /* ... */
  };
}
```

**Bad — missing annotation:**

```typescript
export function string(message?: ErrorMessage<StringIssue>): StringSchema {
  return {
    /* ... */
  };
}
```

### Type Safety

| Check             | Requirement                                           |
| ----------------- | ----------------------------------------------------- |
| Generic inference | Types infer correctly without explicit annotations    |
| Constraints       | Generic parameters have appropriate `extends` clauses |
| Return types      | Explicit return types on exported functions           |

**Good — constrained generic:**

```typescript
export function minLength<
  TInput extends LengthInput,
  TRequirement extends number,
>(
  requirement: TRequirement,
  message?: ErrorMessage<MinLengthIssue<TInput, TRequirement>>
): MinLengthAction<TInput, TRequirement>;
```

### Documentation

| Check            | Requirement                                       |
| ---------------- | ------------------------------------------------- |
| TypeDoc present  | All exported functions have JSDoc                 |
| First line       | Action verb matching function purpose (see below) |
| `@param` tags    | Every parameter documented                        |
| `@returns` tag   | Return value documented                           |
| Overloads        | Every overload has its own complete TypeDoc block |

### Tests

| Check          | Requirement                                                |
| -------------- | ---------------------------------------------------------- |
| Runtime tests  | `.spec.ts` covers success cases, failure cases, edge cases |
| Error messages | Tests verify correct error messages and issue structure    |

### Casing Style

Classes, interfaces, types, and enums use PascalCase.

Variables, methods, and properties use camelCase.

Wherever allowed, kebab-case should be used, especially for file names.

The underscore should **NEVER** be used.

### Required AI Skill Update

If a code change requires an update of the skills described in
`.agents/skills/*/SKILLS.md`, this should be mentioned. The same holds true
for the hints in the top-level `AGENTS.md`.

## Common Issues

| Issue                     | What to Look For                                             |
| ------------------------- | ------------------------------------------------------------ |
| Missing purity annotation | Factory function without `// @__NO_SIDE_EFFECTS__`           |
| Incomplete TypeDoc        | Missing `@param` or `@returns`, wrong description format     |
| Wrong import extension    | Imports with `.ts` suffix                                    |
| Inconsistent naming       | Schema not ending in `Schema`, format not ending in `Format` |
| Side effects in pure code | Mutations, I/O, or global state                              |

## Checklist

- [ ] Implementation follows existing patterns in similar files
- [ ] `// @__NO_SIDE_EFFECTS__` on pure factory functions
- [ ] Imports do not use `.ts` extension
- [ ] `type` preferred over `interface`
- [ ] TypeDoc complete on all exports
- [ ] Runtime tests in `.spec.ts`
- [ ] Naming conventions followed
- [ ] Documentation updated
- [ ] AI skills updated

## Related Skills

- `repo-structure-navigate` — Navigate the codebase
- `repo-source-code-document` — TypeDoc requirements
