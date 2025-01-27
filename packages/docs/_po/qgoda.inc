# Makefile snippet for Qgoda.  Extract all strings from Markdown files that
# serve as the base for translated documents.

MDPOTFILES = $(srcdir)/MDPOTFILES \
        $(shell cat $(srcdir)/MDPOTFILES)

$(srcdir)/markdown.pot: $(srcdir)/MDPOTFILES $(MDPOTFILES)
	$(QGODA) xgettext --output=$(srcdir)/markdown.pox --from-code="utf-8" \
		--add-comments=TRANSLATORS: --files-from=$(srcdir)/MDPOTFILES \
		--copyright-holder='$(COPYRIGHT_HOLDER)' --force-po \
		--msgid-bugs-address='$(MSGID_BUGS_ADDRESS)' && \
	rm -f $@ && mv $(srcdir)/markdown.pox $@
