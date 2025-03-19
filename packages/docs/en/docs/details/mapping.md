---
title: Mapping
name: mapping
section: details
description: Mapping definitions map data from spreadsheet cells to invoice data fields.
---

<!--qgoda-no-xgettext-->

[% USE q = Qgoda %]
[% USE Highlight %]

<!--/qgoda-no-xgettext-->

## Practical Considerations

The example files in the directory
[`contrib`](https://github.com/gflohr/e-invoice-eu/tree/main/contrib)
just work. It is strongly recommended that you use them as a starting point
for your own invoice templates and mappings until you become comfortable with
the concepts used. This is easier than you may think at first glance, once you
get the hang of it.

[% title = "Do I Need a Mapping?" %]

<!--qgoda-no-xgettext-->

[% WRAPPER components/infobox.html type='info' title=title %]

<!--/qgoda-no-xgettext-->

If you use the software to create e-invoices directly from JSON data, you can
skip this section. Mappings are only required for
generating e-invoices from spreadsheet data.

<!--qgoda-no-xgettext-->

[% END %]

<!--/qgoda-no-xgettext-->

<qgoda-toc/>

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

The keys of this object are the names of the sheets in the invoice files.
The value are column names which are sequences of at least one uppercase
letter `A` to `Z`.

The meaning of this key becomes clearer later.

#### The `meta.empty` Array

Cells that are empty, are not mapped. The target element simply gets not
created for them.

Unfortunately, some empty cells cannot be detected as such. For example,
in LibreOffice, if a formula `VLOOKUP` finds an empty text cell, it generates
a number cell with a newline as the value. Probably, more such bugs or
ideosyncrasies exist.

If you run into such a case (we did with the example template that
ships with E-Invoice-EU), you can define an array `meta.empty` with strings
that are considered empty values. You can then simply write one of these
strings into the cell that is causing the trouble. You should obiously use
stings that will not occur in a regular invoice.

### The `ubl:Invoice` Object

Did we say that a mapping maps table cells to invoice data? It is actually the other
way round. The mapping maps a reference into the invoice data to a reference
to a cell where the value can be found. Instead of a reference to a cell you
can also specify a literal value.

The structure matches exactly the structure of invoice data,
see [% q.lanchor(name='internal-format') %], only that all
values are either a reference to a table cell or a literal value.

Another difference is that there are no arrays but data inside an array is
directly mapped to the first item of that array. This will also become clearer
later.

Let's look at an excerpt of an actual mapping:

<!--qgoda-no-xgettext-->

[% FILTER $Highlight "language-yaml" "line-numbers" %]
meta:
sectionColumn:
Invoice: K
emtpy: ['[:empty:]', '%no-no-nothing%'],
ubl:Invoice:
cbc:ID: =Invoice.D7
cbc:IssueDate: =F7
cac:InvoiceLine:
section: :Line
cbc:ID: =Invoice:Line.A1
cbc:Note: =Invoice.M3
cac:Item:
cbcName: =Line.B1
cac:Price:
cbc:PriceAmount: =Invoice:Line.F1
cbc:PriceAmount@currencyCode: EUR
[% END %]

<!--/qgoda-no-xgettext-->

**Line 3**: The section column in the sheet `Invoice` is column `K`.

**Line 4**: Cells with the values `[:empty:]` and `%no-no-nothing%` should be considered empty.

**Line 6**: The invoice id is found in the cell D7 of the sheet `Invoice`.

**Line 7**: The issue date is found in cell F7. Which sheet? The first sheet because a sheet name was not given.

**Line 8**: The invoice lines are actually an array but ...

**Line 9**: ... the start of each invoice line is marked with the string "Line" in the section column (`meta.sectionColumn`, see above!) of that sheet.

**Line 10**: All following inside this section can now be made relative to the
corresponding invoice line. The id of the line is found in column
A of the 1st row of the section marked with "Line".

**Line 11**: But if the section is omitted, the row number (3) is meant to be relative to the
entire sheet.

**Line 13**: As mentioned above, the sheet name is optional and defaults to the
first sheet. In this case we have a section `Line` but no sheet. The cell
reference `=Line.B1` therefore refers to column `B` of the 1st row of section
`Line` in the first sheet of the file.

**Line 15**: If you use a string without a leading equals sign (`=`), that
value is not a reference but a literal value. In this case, the attribute
`currencyCode` of `cbc:PriceAmount` is always `EUR` and not read from the
spreadsheet.

Let's describe that in a little bit more formal way:

#### Literal Values

Everything not starting with an equals sign (`=`) is a literal value but it
must be a string. That means that numbers must be put into quotes, for example:

<!--qgoda-no-xgettext-->

[% FILTER $Highlight "language-yaml" %]
ubl:Invoice:
cbc:InvoiceTypeCode: '380'
[% END %]

<!--/qgoda-no-xgettext-->

Because of the way that YAML works, you must also quote the strings "null",
"true", "false", "yes", and "no". Especially, the value of `cbc:ChargeIndicator` inside
`cac:AllowanceCharge` sections must be one of the strings "true" or "false",
and not the boolean values `true` or `false`.

#### Sheet References

The sheet name defaults to the name of the first sheet in the file. If a
sheet name contains a colon (`:`) or dot (`.`), you must enclose it in
single quotes:

<!--qgoda-no-xgettext-->

[% FILTER $Highlight "language-yaml" %]
cbc:DueDate: ='Fancy.SheetName'.D3
[% END %]

<!--/qgoda-no-xgettext-->

Note that most spreadsheet applications do not allow colons in sheet names
anyway.

#### Section References

Section references always start with a colon (`:`). A section name cannot
contain a colon (`:`) or dot (`.`), and it is not possible to escape or
quote them. Choose names without these characters.

A section reference without a leading sheet reference must have a leading
colon `:`. This is necessary to make it distinguishable from sheet
references.

Example:

<!--qgoda-no-xgettext-->

[% FILTER $Highlight "language-yaml" %]
ubl:Invoice:
cac:InvoiceLine:
section: :Line
cbc:ID: =:Line.A1
cbc:Note: =SomeSheet.Q23
[% END %]

<!--/qgoda-no-xgettext-->

See the references for `cbc:ID` and `cbc:Note`. The id references a cell
in the section `Line` of the first sheet, the default sheet. The reference for
`cbc:Note` references the cell `Q23` in the sheet `SomeSheet`.

To make things more complicated, these "loops" in invoices can be nested.

For example, there is a an array element
[`ubl:Invoice/cac:AllowanceCharge`](https://docs.peppol.eu/poacc/billing/3.0/syntax/ubl-invoice/cac-AllowanceCharge/)
on the document level. But you also have an element
[`ubl:Invoice/cac:InvoiceLine/cac:AllowanceCharge`](https://docs.peppol.eu/poacc/billing/3.0/syntax/ubl-invoice/cac-InvoiceLine/cac-AllowanceCharge/)
on line item level, and even one more on
the price level. How would you structure that in the spreadsheet? We
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

The first line item has a line extension amount of 120.00 and a charge or allowance
of 3.05. Note that you must always use positive values. The sign is derived
from the element
[`cbc:ChargeIndicator`](https://docs.peppol.eu/poacc/billing/3.0/syntax/ubl-invoice/cac-InvoiceLine/cac-AllowanceCharge/cbc-ChargeIndicator/).

The second line item has a line extension amount of 75.50 and no charges or
allowances. The third line has an amount of 180.00 and two charges or
allowances of 1.23 and 7.50.

Wherever you have a row marked "Line", one
[`cac:InvoiceLine`](https://docs.peppol.eu/poacc/billing/3.0/syntax/ubl-invoice/cac-InvoiceLine/)
section starts. It
ends before the next row marked "Line" or the end of the sheet. On that level,
only rows inside that range are considered, and that may even be nested. For
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

#### Cell References

Cell references consist of one or more uppercase characters `A-Z` followed by
one decimal digit `1-9` followed by a positive decimal integer. We know that
from our spreadsheet application.

#### Formulas

Are you joking? Formulas are not supported in the mapping. But you can just
use them in the spreadsheet because the extractor picks up the result of the
formula, not the formula itself.

## Surprising Arrays

Some elements are arrays although this will often be surprising. For example,
the element
[`/ubl:Invoice/cac:TaxTotal`](https://docs.peppol.eu/poacc/billing/3.0/syntax/ubl-invoice/cac-TaxTotal/)
is an array with 1-2 elements. But
you will almost always have just one element here. In this case, there is
no need for a section, you can simply omit the `section` property. You will
probably be using this feature without even noticing it.

## Examples

The directory
[`contrib/templates`](https://github.com/gflohr/e-invoice-eu/tree/main/contrib/templates)
contains examples for spreadsheets. The directory
[`contrib/mappings`](https://github.com/gflohr/e-invoice-eu/tree/main/contrib/mappings)
contain the corresponding mappings for these spreadsheets.

## Code Lists

One problem of code lists is that the values are often not human-understandable.
It is not obvious that the unit code `HUR` stands for hours.

The example templates in
[`contrib/templates`](https://github.com/gflohr/e-invoice-eu/tree/main/contrib/templates)
try to make that a little bit more user-friendly with the help of data ranges and
the spreadsheet function `VLOOKUP`. The general idea is that the user selects
a human-readable value from a combo box (the data range) that is then
translated to the machine-readable code from a lookup table defined elsewhere.
This happens with the help of the `VLOOKUP` function.

Instead, you can always just use two cells that are not coupled; one
for the human readable value that gets printed and one for the machine-readable
code. This simplifies the spreadsheet but makes your process more error-prone.
