# CII

The Cross Industry Invoice format CII is usually more verbose than UBL.
It contains a number of elements that are not included in UBL. Since the
internal format of `e-invoice-eu` is PEPPOL UBL, these extra elements would
not appear in CII invoices.

Therefore, special elements - all prefixed with `cii:` - have been added
to the internal schema, so that you can produce these values in CII. In
UBL formats, they are all ignored.

Please note that all extra elements are coded manually.
Be prepared for bugs and missing elements. Please file an issue if you spot
such a problem!

<table>
	<thead>
		<tr>
			<th>Source Path</th>
			<th>Destination Path</th>
			<th>Factur-X Profile</th>
		</tr>
	</thead>
	<tbody>
		<tr>
			<td><code>ubl:Invoice<br />cii:TestIndicator</code></td>
			<td><code>rsm:CrossIndustryInvoice<br />rsm:ExchangedDocumentContext<br />ram:TestIndicator<br />udt:Indicator</code></td>
			<td>MINIMUM<br />BASIC WL<br />BASIC<br />EN16931<br />EXTENDED</td>
		</tr>
		<tr>
			<td><code>ubl:Invoice<br />cii:Name</code></td>
			<td><code>rsm:CrossIndustryInvoice<br />ram:ExchangedDocument<br />ram:Name</code></td>
			<td>MINIMUM<br />BASIC WL<br />BASIC<br />EN16931<br />EXTENDED</td>
		</tr>
		<tr>
			<td><code>ubl:Invoice<br />cii:CopyIndicator</code></td>
			<td><code>rsm:CrossIndustryInvoice<br />ram:ExchangedDocument<br />ram:CopyIndicator<br />udt:Indicatory</code></td>
			<td>MINIMUM<br />BASIC WL<br />BASIC<br />EN16931<br />EXTENDED</td>
		</tr>
		<tr>
			<td><code>ubl:Invoice<br />cii:LanguageID</code></td>
			<td><code>rsm:CrossIndustryInvoice<br />ram:ExchangedDocument<br />ram:LanguageID</code></td>
			<td>MINIMUM<br />BASIC WL<br />BASIC<br />EN16931<br />EXTENDED</td>
		</tr>
		<tr>
			<td><code>ubl:Invoice<br />cii:IncludedNoteContentCode</code></td>
			<td><code>rsm:CrossIndustryInvoice<br />ram:ExchangedDocument<br />ram:IncludedNote<br />udt:ContentCode</code></td>
			<td>MINIMUM<br />BASIC WL<br />BASIC<br />EN16931<br />EXTENDED</td>
		</tr>
		<tr>
			<td><code>ubl:Invoice<br />cii:IncludedNoteSubjectCode</code></td>
			<td><code>rsm:CrossIndustryInvoice<br />ram:ExchangedDocument<br />ram:IncludedNote<br />udt:SubjectCode</code></td>
			<td>MINIMUM<br />BASIC WL</td>
		</tr>
		<tr>
			<td><code>ubl:Invoice<br />cii:EffectiveSpecifiedPeriod</code></td>
			<td><code>rsm:CrossIndustryInvoice<br />ram:ExchangedDocument<br />ram:EffectiveSpecifiedPeriod<br />ram:CompleteDateTime<br />udt:DateTimeString</code></td>
			<td>MINIMUM<br />BASIC WL<br />BASIC<br />EN16931<br />EXTENDED</td>
		</tr>
		<tr>
			<td><code>ubl:Invoice<br />cac:InvoiceLine<br />cii:ParentLineID</code></td>
			<td><code>rsm:CrossIndustryInvoice<br />rsm:SupplyChainTradeTransaction<br />ram:IncludedSupplyChainTradeLineItem<br />ram:AssociatedDocumentLineDocument<br />ram:ParentLineID</code></td>
			<td></td>
		</tr>
		<tr>
			<td><code>ubl:Invoice<br />cac:InvoiceLine<br />cii:LineStatusCode</code></td>
			<td><code>rsm:CrossIndustryInvoice<br />rsm:SupplyChainTradeTransaction<br />ram:IncludedSupplyChainTradeLineItem<br />ram:AssociatedDocumentLineDocument<br />ram:LineStatusCode</code></td>
			<td>MINIMUM<br />BASIC WL<br />BASIC<br />EN16931<br />EXTENDED</td>
		</tr>
		<tr>
			<td><code>ubl:Invoice<br />cac:InvoiceLine<br />cii:IncludedNoteContentCode</code></td>
			<td><code>rsm:CrossIndustryInvoice<br />rsm:SupplyChainTradeTransaction<br />ram:IncludedSupplyChainTradeLineItem<br />ram:AssociatedDocumentLineDocument<br />ram:IncludedNote<br />udt:ContentCode</code></td>
			<td>MINIMUM<br />BASIC WL<br />BASIC<br />EN16931<br />EXTENDED</td>
		</tr>
		<tr>
			<td><code>ubl:Invoice<br />cac:InvoiceLine<br />cii:IncludedNoteSubjectCode</code></td>
			<td><code>rsm:CrossIndustryInvoice<br />rsm:SupplyChainTradeTransaction<br />ram:IncludedSupplyChainTradeLineItem<br />ram:AssociatedDocumentLineDocument<br />ram:IncludedNote<br />udt:SubjectCode</code></td>
			<td>MINIMUM<br />BASIC WL</td>
		</tr>
		<tr>
			<td><code>ubl:Invoice<br />cac:InvoiceLine<br />cac:Item<br />cii:SpecifiedTradeProductID</code></td>
			<td><code>rsm:CrossIndustryInvoice<br />rsm:SupplyChainTradeTransaction<br />ram:IncludedSupplyChainTradeLineItem<br />ram:SpecifiedTradeProduct<br />ram:ID</code></td>
			<td></td>
		</tr>
		<tr>
			<td><code>ubl:Invoice<br />cac:InvoiceLine<br />cac:Item<br />cac:AdditionalItemProperty<br />cii:TypeCode</code></td>
			<td><code>rsm:CrossIndustryInvoice<br />rsm:SupplyChainTradeTransaction<br />ram:IncludedSupplyChainTradeLineItem<br />ram:SpecifiedTradeProduct<br />ram:ApplicableProductCharacteristic<br />ram:TypeCode</code></td>
			<td>MINIMUM<br />BASIC WL<br />BASIC<br />EN16931<br />EXTENDED</td>
		</tr>
		<tr>
			<td><code>ubl:Invoice<br />cac:InvoiceLine<br />cac:Item<br />cac:AdditionalItemProperty<br />cii:ValueMeasure</code></td>
			<td><code>rsm:CrossIndustryInvoice<br />rsm:SupplyChainTradeTransaction<br />ram:IncludedSupplyChainTradeLineItem<br />ram:SpecifiedTradeProduct<br />ram:ApplicableProductCharacteristic<br />ram:ValueMeasure</code></td>
			<td>MINIMUM<br />BASIC WL<br />BASIC<br />EN16931<br />EXTENDED</td>
		</tr>
		<tr>
			<td><code>ubl:Invoice<br />cac:InvoiceLine<br />cac:Item<br />cac:AdditionalItemProperty<br />cii:ValueMeasure@unitCode</code></td>
			<td><code>rsm:CrossIndustryInvoice<br />rsm:SupplyChainTradeTransaction<br />ram:IncludedSupplyChainTradeLineItem<br />ram:SpecifiedTradeProduct<br />ram:ApplicableProductCharacteristic<br />ram:ValueMeasure@unitCode</code></td>
			<td>MINIMUM<br />BASIC WL<br />BASIC<br />EN16931<br />EXTENDED</td>
		</tr>
		<tr>
			<td><code>ubl:Invoice<br />cac:InvoiceLine<br />cac:Item<br />cac:CommodityClassification<br />cii:ListVersionID</code></td>
			<td><code>rsm:CrossIndustryInvoice<br />rsm:SupplyChainTradeTransaction<br />ram:IncludedSupplyChainTradeLineItem<br />ram:SpecifiedTradeProduct<br />ram:DesignatedProductClassification<br />ram:ClassCode<br />ram:ListVersionID</code></td>
			<td>MINIMUM<br />BASIC WL<br />BASIC<br />EN16931</td>
		</tr>
		<tr>
			<td><code>ubl:Invoice<br />cac:InvoiceLine<br />cac:Item<br />cac:CommodityClassification<br />cii:ClassName</code></td>
			<td><code>rsm:CrossIndustryInvoice<br />rsm:SupplyChainTradeTransaction<br />ram:IncludedSupplyChainTradeLineItem<br />ram:SpecifiedTradeProduct<br />ram:DesignatedProductClassification<br />ram:ClassName</code></td>
			<td>MINIMUM<br />BASIC WL<br />BASIC<br />EN16931<br />EXTENDED</td>
		</tr>
		<tr>
			<td><code>ubl:Invoice<br />cac:InvoiceLine<br />cac:Item<br />cii:BatchID</code></td>
			<td><code>rsm:CrossIndustryInvoice<br />rsm:SupplyChainTradeTransaction<br />ram:IncludedSupplyChainTradeLineItem<br />ram:SpecifiedTradeProduct<br />ram:IndividualTradeProductInstance<br />ram:BatchID</code></td>
			<td>MINIMUM<br />BASIC WL<br />BASIC<br />EN16931<br />EXTENDED</td>
		</tr>
	</tbody>
</table>
