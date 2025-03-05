default: all

NPX = npx
BUN = bun

INVOICE_SCHEMA_DEPENDENCIES = \
	peppol-bis-invoice-3/structure/syntax/ubl-invoice.xml \
	peppol-bis-invoice-3/structure/codelist/*.xml

all: \
	src/schema/invoice.schema.json \
	src/invoice/invoice.interface.ts \
	src/invoice/invoice.schema.ts \
	src/schema/mapping.schema.json \
	src/mapping/mapping.interface.ts \
	src/mapping/mapping.schema.ts \
	../../packages/docs/en/docs/other/business-terms.md \
	../../packages/docs/en/docs/other/business-groups.md

src/schema/invoice.schema.json: scripts/parse-ubl-structure.mts $(INVOICE_SCHEMA_DEPENDENCIES)
	$(BUN) $< >$@ || rm -f $@
	$(NPX) ajv compile --spec=draft2019 -s $@ || rm -f $@

src/invoice/invoice.interface.ts: scripts/json-schema-to-interface.mts src/schema/invoice.schema.json
	$(BUN) $< src/schema/invoice.schema.json $@
	$(NPX) eslint $@ --fix

src/invoice/invoice.schema.ts: scripts/json-schema-to-typescript.mts src/schema/invoice.schema.json
	$(BUN) $< invoice
	$(NPX) eslint $@ --fix
	$(NPX) prettier --write $@

src/schema/mapping.schema.json: scripts/transform-ubl-mapping.mts src/schema/invoice.schema.json
	$(BUN) $< src/schema/invoice.schema.json $@
	$(NPX) ajv compile --spec=draft2019 -s $@ || rm -f $@

src/mapping/mapping.interface.ts: scripts/json-schema-to-interface.mts src/schema/mapping.schema.json
	$(BUN) $< src/schema/mapping.schema.json $@
	$(NPX) eslint $@ --fix

src/mapping/mapping.schema.ts: scripts/json-schema-to-typescript.mts src/schema/mapping.schema.json
	$(BUN) $< mapping
	$(NPX) eslint $@ --fix
	$(NPX) prettier --write $@

../../packages/docs/en/docs/other/business-terms.md: scripts/extract-business-terms.mts src/schema/invoice.schema.json
	$(BUN) $< terms src/schema/invoice.schema.json >$@ || rm -f $@

../../packages/docs/en/docs/other/business-groups.md: scripts/extract-business-terms.mts src/schema/invoice.schema.json
	$(BUN) $< groups src/schema/invoice.schema.json >$@ || rm -f $@

.PHONY: clean

clean:
	rm -f src/schema/*.json \
		src/invoice/invoice.interface.ts src/mapping/mapping.interface.ts \
		src/invoice/invoice.schema.ts src/mapping/mapping.schema.ts \
		../../packages/docs/en/docs/other/business-terms.md \
		../../packages/docs/en/docs/other/business-groups.md

