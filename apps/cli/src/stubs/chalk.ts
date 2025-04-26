// Jest chokes on the original chalk. We therefore replace it with an
// implementation that just echoes back its argument.
type ChalkFn = ((str: string) => string) & { [key: string]: ChalkFn };

function createChalk(): ChalkFn {
	return new Proxy(((str: string) => str) as ChalkFn, {
		get() {
			return createChalk();
		},
	});
}

const chalk = createChalk();
export default chalk;
