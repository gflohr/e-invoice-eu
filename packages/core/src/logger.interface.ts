/**
 * A logging service.
 */
export interface Logger {
	/**
	 * Logs a general message.
	 *
	 * @param m - The message to log.
	 */
	log(m: string): void;

	/**
	 * Logs a warning message.
	 *
	 * @param m - The warning message to log.
	 */
	warn(m: string): void;

	/**
	 * Logs an error message.
	 *
	 * @param m - The error message to log.
	 */
	error(m: string): void;
}
