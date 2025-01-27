# Mapping

Mappings map cells from an invoice spreadsheet file to invoice data.

- [Mapping](#mapping)
  - [Format](#format)
  - [General Structure](#general-structure)
    - [The `meta` Object](#the-meta-object)
      - [The `meta.sectionColumn` Object](#the-metasectioncolumn-object)
      - [The `meta.empty` Array](#the-metaempty-array)
    - [The `ubl:Invoice` Object](#the-ublinvoice-object)
      - [Literal Values](#literal-values)
      - [Sheet References](#sheet-references)
      - [Section References](#section-references)
      - [Cell References](#cell-references)
      - [Formulas](#formulas)
  - [Surprising Arrays](#surprising-arrays)
  - [Examples](#examples)

## Format

The format used is [YAML](https://yaml.org/). YAML is a strict superset of
[JSON](https://www.json.org/) so that you can also use JSON.

## General Structure

The overall structure of a mapping is an object (also known as a hash,
dictionary, or associative array) with named properties like `meta` and
`ubl:Invoice`.

### The `meta` Object

The keys of the `meta` object contain aids for interpreting the actual mapping.

#### The `meta.sectionColumn` Object

They keys of this object are the names of the sheets in the invoice files.
The value are column names which are sequences of at least one uppercase
letter `A` to `Z`.

The meaning of this key becomes later.

#### The `meta.empty` Array

Cells that are empty, are not mapped. The target element simply gets not
created for them.

Unfortunately, some empty cells cannot be detected as such. For example,
in LibreOffice, if a formula `VLOOKUP` finds an empty text cell, it generates
a number cell with a newline as the value. Probably, more such bugs or
ideosyncrasies exist.

If you run into such a case (the author did with the example template that
ships with `e-invoice-eu`), you can define an array `meta.empty` with strings
that are considered empty values. You can then simply write one of these
strings into the cell that is causing the trouble. You should obiously use
stings that will not occur in a regular invoice.

### The `ubl:Invoice` Object

Did we say that a mapping maps cells to invoice data? It is actually the other
way round. The invoice data is mapped from a reference to the invoice data to
the corresponding cell, where it can be found.

The structure matches exactly the structure of invoice data, only that all
values are a reference to a cell where the data can be found in the spreadsheet.
Another difference is that there are no arrays but data inside an array is
directly mapped to the first item of that array. This will also become clearer
later.

Let's look at an excerpt of an actual mapping:

```yaml
meta:
	sectionColumn:
		# The section column of tab "Invoice" is "K".
		Invoice: K
	emtpy: ['[:empty:]'],
ubl:Invoice:
	# The invoice id is found in the cell D7 of the sheet "Invoice".
	cbc:ID: =Invoice.D7
	# The sheet can be omitted and defaults to the first sheet of the file.
	cbc:IssueDate: =F7
	# ... more properties following.
	# The property `cac:InvoiceLine` is actually an array.
	cac:InvoiceLine:
		# Every invoice line is marked by the string "Line" in the section
		# column (`meta.sectionColumn`, see above) of that sheet.
		section: :Line
		# All references following can now be made relative to the
		# corresponding invoice line. The id of the line is found in column
		# A of the 1st row of the section marked with "Line":
		cbc:ID: =Invoice:Line.A1
		# If you omit the section, the row number (3) is relative to the
		# entire sheet.
		cbc:Note: =Invoice.M3
		# ... more items following.
		cac:Item:
			# As mentioned above, the sheet name is optional and defaults to
			# the first sheet of the file.
			cbcName: =Line.B1
		cac:Price:
			cbc:PriceAmount: =Invoice:Line.F1
			# If you use a string without a leading equals sign (`=`), that
			# value is not a reference but a literal value.
			cbc:PriceAmount@currencyCode: EUR
		# ... more properties following.
```

Let's describe that a little bit more in detail:

#### Literal Values

Everything not starting with an equals sign (`=`) is a literal value but it
must be a string. That means that numbers must be put into quotes, for example:

```yaml
ubl:Invoice:
  cbc:InvoiceTypeCode: '380'
```

Because of the way that YAML works, you must also quote the strings "null",
"true", and "false". Especially, the value of `cbc:ChargeIndicator` inside
`cac:AllowanceCharge` sections must be one of the strings "true" or "false",
and not the literals `true` or `false`.

#### Sheet References

The sheet name defaults to the name of the first sheet in the file. If a
sheet name contains a colon (`:`) or dot (`.`), you must enclose it in
single quotes:

```yaml
cbc:DueDate: ='Fancy.SheetName'.D3
```

Note that most spreadsheet applications do not allow colons in sheet names
anyway.

#### Section References

Section references always start with a color (`:`). A section name cannot
contain a colon (`:`) or dot (`.`), and it is not possible to escape or
quote them. Choose names without these characters.

A section reference without a leading sheet reference must have a leading
colon `:`. This is necessary to make it distinguishable from sheet
references.

Example:

```
ubl:Invoice:
  cac:InvoiceLine:
    section: :Line
	cbc:ID: =:Line.A1
	cbc:Note: =SomeSheet.Q23
```

See the references for `cbc:ID` and `cbc:Note`. The id references a cell
in the section `Line` of the first sheet, the default sheet. The reference for
`cbc:Note` references the cell `Q23` in the sheet `SomeSheet`.

To make things more complicated, these "loops" in invoices can be nested.

For example, there is a an array element `ubl:Invoice/cac:AllowanceCharge`
on the document level. But you also have an element
`ubl:Invoice/cac:InvoiceLine/cac:AllowanceCharge` (and there is even one on
the price level). How would you structure that in the spreadsheet? We
assume that the allowance or charge come from column `H` and the line
extension amount from column `I` and the section column is `K`. Your
spreadsheet should then look like this:

| Row | ... | H      | I    | J   | K          |
| --- | --- | ------ | ---- | --- | ---------- |
| 20  |     | 120.00 |      |     | **Line**   |
| 21  |     |        | 3.05 |     | ACLine     |
| 22  |     | 75.50  |      |     | **Line**   |
| 23  |     | 180.00 |      |     | **Line**   |
| 24  |     |        | 1.23 |     | ACLine     |
| 25  |     |        |      |     |            |
| 26  |     |        | 7.50 |     | ACLine     |
| 27  |     |        |      |     | **Footer** |

This invoice has three line items starting on rows 20, 22, and 23.

The first line has a line extension amount of 120.00 and a charge or allowance
of 3.05. Note that you must always use positive values. The sign is derived
from the element `cbc:ChargeIndicator`.

The second line has a line extension amount of 75.50 and not charges or
allowances. The third line has an amount of 180.00 and two charges or
allowances of 1.23 and 7.50.

Wherever you have a row marked "Line" one `cac:InvoiceLine` section starts. It
ends before the next row marked "Line" or the end of the sheet. On that level,
only rows inside that range are considered, and that maybe even nested. For
example, row 25 is part of the first `ACLine` section of the second `Line`
section.

One gotcha is the last `Line` section starting in row 23. Since there is no
other section marker following, that `Line` section spans until the last row
of the sheet. If you chose to name your `AllowanceCharge` section all the
same on all levels, for example `AC`, then they would be consumed by the
last `Line` section and you would not be able to add allowances or charges
on the document level, following the last `Line`.

The takeaway is: Use different section names for different nesting levels
even if they refer to the same thing.

By the way, if you know that your invoices always contain just one line item,
there is no need for making the references dynamic. But are you sure that you
will really never invoice more than one item? And what about charges and
allowances? At the end of the day, having these dynamic references is not
terribly difficult.

#### Cell References

Cell references consist of one or more uppercase characters `A-Z` followed by
one decimal digit `1-9` followed by any number of decimal digits `0-9`. You
know this from your spreadsheet application.

#### Formulas

Are you joking? Formulas are not supported in the mapping. But you can just
use them in the spreadsheet because the extractor picks up the result of the
formular, not the formula itself.

## Surprising Arrays

Some elements are arrays although this will often be surprising. For example,
the element [`/ubl:Invoice/cac:TaxTotal`] is an array with 1-2 elements. But
you will almost always have just one element here. In this case, there is
no need for a section, you can simply omit the `section` property. You will
probably be using this feature without even noticing it.

## Examples

The directory `contrib/templates` contains examples for spreadsheets. The
directory `resources/mappings` contain the corresponding mappings for these
spreadsheets. They will be eventually commented.
