export interface Logger {
	log(m: string): void;
	warn(m: string): void;
	error(m: string): void;
}
