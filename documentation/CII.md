# CII

The Cross Industry Invoice format CII is usually more verbose than UBL.
It contains a number of elements that are not included in UBL. Since the
internal format of `e-invoice-eu` is PEPPOL UBL, these extra elements would
not appear in CII invoices.

Therefore, special elements - all prefixed with `cii:` - have been added
to the internal schema, so that you can produce these values in CII. In
UBL formats, they are all ignored.

## List of Extra Attributes

The following types are used:

<table>
	<thead>
		<tr>
			<th>Type</th>
			<th>Description</th>
		</tr>
	</thead>
	<tbody>
		<tr>
			<td><code>xs:boolean</code></td>
			<td>Either <code>true</code> or <code>false</code> as a string!</td>
		</tr>
		<tr>
			<td><code>udt:TextType</code></td>
			<td>Free text.</td>
		</tr>
		<tr>
			<td><code>udt:CodeType</code></td>
			<td>Text.  Sometimes, the value has to come from a code list.  The validator will tell you that.</td>
		</tr>
	</tbody>
</table>

In the source path, the leading `ubl:Invoice` is omitted.
In the destination path, the leading `rsm:CrossIndustryInvoice` is omitted.

<table>
	<thead>
		<tr>
			<th>Path</th>
			<th>Destination</th>
			<th>Type</th>
			<th>Semantics</th>
		</tr>
	</thead>
	<tbody>
		<tr>
			<td><code>cii:TestIndicator</code></td>
			<td><code>rsm:ExchangedDocumentContext<br/>ram:TestIndicator<br/>udt:Indicator</code></td>
			<td><code>xs:boolean</code></td>
			<td>The Indicator type may be used when implementing a new system in order to mark the invoice as „trial invoice“.</td>
		</tr>
		<tr>
			<td><code>cii:Name</code></td>
			<td><code>rsm:ExchangedDocument<br/>ram:Name</code></td>
			<td><code>udt:TextType</code></td>
			<td><b>Document name (free text)</b></td>
		</tr>
		<tr>
			<td><code>cii:CopyIndicator</code></td>
			<td><code>rsm:ExchangedDocument<br/>ram:CopyIndicator<br/>udt:Indicator</code></td>
			<td><code>xs:boolean</code></td>
			<td>Not documented. A <code>true</code> value probably means that the document is a copy.</td>
		</tr>
		<tr>
			<td><code>cii:IncludedNoteContentCode</code></td>
			<td><code>rsm:ExchangedDocument<br/>ram:IncludedNote<br/>ram:ContentCode</code></td>
			<td><code>udt:CodeType</code></td>
			<td>Bilaterally agreed text blocks which, here, are transferred as code.</td>
		</tr>
		<tr>
			<td><code>cii:IncludedNoteSubjectCode</code></td>
			<td><code>rsm:ExchangedDocument<br/>ram:IncludedNote<br/>ram:SubjectCode</code></td>
			<td><code>udt:CodeType</code></td>
			<td>
				<b>Code for qualifying the free text for the invoice</b>
				<p>The qualification of the free text of an invoice of BT-2. To be selected from UNTDID 4451.</p>
			</td>
		</tr>
		<tr>
			<td><code>cii:EffectiveSpecifiedPeriod</code></td>
			<td><code>rsm:ExchangedDocument<br/>ram:EffectiveSpecifiedPeriod<br/>ram:CompleteDateTime<br/>udt:DateTimeString</code></td>
			<td><code>udt:DateTimeType</code></td>
			<td>
				<b>Contractual due date of the invoice</b>
				<p>Information only required if the contractual due date differs from due date of the payment (i.e. for SEPA direct debit).</p>
			</td>
		</tr>
		<tr>
			<td><code>cba:InvoiceLine<br />cii:ParentLineID</code></td>
			<td><code>rsm:SupplyChainTradeTransaction<br/>ram:IncludedSupplyChainTradeLineItem<br/>ram:ParentLineID</code></td>
			<td><code>udt:IDType</code></td>
			<td>
				<b>Parent Line ID</b>
			</td>
		</tr>
		<tr>
			<td><code>cac:InvoiceLine<br />cii:IncludedNoteContentCode</code></td>
			<td><code>rsm:ExchangedDocument<br/>ram:IncludedNote<br/>ram:ContentCode</code></td>
			<td><code>udt:CodeType</code></td>
			<td>Bilaterally agreed text blocks which, here, are transferred as code.</td>
		</tr>
		<tr>
			<td><code>cac:InvoiceLine<br />cii:IncludedNoteSubjectCode</code></td>
			<td>
				<code>
					rsm:SupplyChainTradeTransaction<br />
					ram:IncludedSupplyChainTradeLineItem<br/>
					ram:IncludedNote<br/>ram:SubjectCode
				</code>
			</td>
			<td><code>udt:CodeType</code></td>
			<td>
				<b>Code for qualifying the free text for the invoice</b>
				<p>The qualification of the free text of an invoice of BT-2. To be selected from UNTDID 4451.</p>
			</td>
		</tr>
		<tr>
			<td><code>cac:InvoiceLine<br />cii:IncludedNoteSubjectCode</code></td>
			<td>
				<code>
					rsm:SupplyChainTradeTransaction<br />
					ram:IncludedSupplyChainTradeLineItem<br/>
					ram:ID
				</code>
			</td>
			<td><code>udt:IDType</code></td>
			<td>
				<p>Not documented.</p>
			</td>
		</tr>
		<tr>
			<td>
				<code>
					cac:InvoiceLine<br />
					cac:AdditionalItemProperty<br />
					cii:TypeCode
				</code>
			</td>
			<td>
				<code>
					rsm:SupplyChainTradeTransaction<br />
					ram:IncludedSupplyChainTradeLineItem<br/>
					ram:ApplicableProductCharacteristic<br />
					ram:TypeCode
				</code>
			</td>
			<td><code>udt:CodeType</code></td>
			<td>
				<b>Item Attribute Type (Code)</b>
			</td>
		</tr>
		<tr>
			<td>
				<code>
					cac:InvoiceLine<br />
					cac:AdditionalItemProperty<br />
					cii:ValueMeasure
				</code>
			</td>
			<td>
				<code>
					rsm:SupplyChainTradeTransaction<br />
					ram:IncludedSupplyChainTradeLineItem<br/>
					ram:ApplicableProductCharacteristic<br />
					ram:ValueMeasure<br />
					ram:unitCode
				</code>
			</td>
			<td><code>udt:MeasureType</code></td>
			<td>
				<b>Item Attribute Value (numerical measurand)</b>
				<p>
					Code List: Rec. N°20 Entire code list<br />
Recommendation N°20 Intro 2.a describes that both lists should be used in combination.<br />
Code List: Rec. N°21 Entire code list<br />
Recommendation N°20 Intro 2.a describes that both lists must be used in combination.<br />
				</p>
			</td>
		</tr>
	</tbody>
</table>
