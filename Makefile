default: all

NPX = npx

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
	documentation/BusinessTerms.md

src/schema/invoice.schema.json: scripts/parse-ubl-structure.mts $(INVOICE_SCHEMA_DEPENDENCIES)
	$(NPX) tsx $< >$@ || rm -f $@
	$(NPX) ajv compile --spec=draft2019 -s $@ || rm -f $@

src/invoice/invoice.interface.ts: scripts/json-schema-to-interface.mts src/schema/invoice.schema.json
	$(NPX) tsx $< src/schema/invoice.schema.json $@
	$(NPX) eslint $@ --fix

src/invoice/invoice.schema.ts: scripts/json-schema-to-typescript.mts src/schema/invoice.schema.json
	$(NPX) tsx $< invoice
	$(NPX) eslint $@ --fix
	$(NPX) prettier --write $@

src/schema/mapping.schema.json: scripts/transform-ubl-mapping.mts src/schema/invoice.schema.json
	$(NPX) tsx $< src/schema/invoice.schema.json $@
	$(NPX) ajv compile --spec=draft2019 -s $@ || rm -f $@

src/mapping/mapping.interface.ts: scripts/json-schema-to-interface.mts src/schema/mapping.schema.json
	$(NPX) tsx $< src/schema/mapping.schema.json $@
	$(NPX) eslint $@ --fix

src/mapping/mapping.schema.ts: scripts/json-schema-to-typescript.mts src/schema/mapping.schema.json
	$(NPX) tsx $< mapping
	$(NPX) eslint $@ --fix
	$(NPX) prettier --write $@

documentation/BusinessTerms.md: scripts/extract-business-terms.mts src/schema/invoice.schema.json
	$(NPX) tsx $< src/schema/invoice.schema.json >$@ || rm -f $@

.PHONY: clean

clean:
	rm -f src/schema/*.json \
		src/invoice/invoice.interface.ts src/mapping/mapping.interface.ts \
		src/invoice/invoice.schema.ts src/mapping/mapping.schema.ts \
		documentation/BusinessTerms.md
