import { FX_BASIC, FX_BASIC_WL, FX_EN16931, FX_EXTENDED, FX_MINIMUM, Transformation, ublInvoice } from '../src/format/format-cii.service';

console.log(`
<table>
	<thead>
		<tr>
			<th>Source Path</th>
			<th>Destination Path</th>
			<th>Factur-X Profile</th>
		</tr>
	</thead>
	<tbody>`);

extract([], [], [ublInvoice]);

console.log(`\t</tbody>
</table>`);

function extract(
	src: string[],
	dest: string[],
	transformations: Transformation[],
) {
	for (const transformation of transformations) {
		const childSrc = [...src, ...transformation.src];
		const childDest = [...dest, ...transformation.dest];

		switch(transformation.type) {
			case 'object':
				extract(childSrc, childDest, transformation.children);
				break;
			case 'array':
				extract(childSrc, childDest, transformation.children);
				break;
			case 'string':
				if (childSrc[childSrc.length - 1].match(/^cii:/)) {
					createTr(childSrc, childDest, transformation);
				}
				break;
		}
	}
}

function createTr(
	src: string[],
	dest: string[],
	transformation: Transformation,
) {
	console.log('\t\t<tr>');
	console.log('\t\t\t<td><code>' + src.join('<br />') + '</code></td>');
	console.log('\t\t\t<td><code>' + dest.join('<br />') + '</code></td>');

	const profiles: string[] = [];
	if (transformation.fxProfile) {
		if (transformation.fxProfile <= FX_MINIMUM) {
			profiles.push('MINIMUM');
		}
		if (transformation.fxProfile <= FX_BASIC_WL) {
			profiles.push('BASIC WL');
		}
		if (transformation.fxProfile <= FX_BASIC) {
			profiles.push('BASIC');
		}
		if (transformation.fxProfile <= FX_EN16931) {
			profiles.push('EN16931');
		}
		if (transformation.fxProfile <= FX_EXTENDED) {
			profiles.push('EXTENDED');
		}
	}
	console.log('\t\t\t<td>' + profiles.join('<br />') + '</td>');

	console.log('\t\t</tr>');
}
