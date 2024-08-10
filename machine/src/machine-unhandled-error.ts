export class MachineUnhandledError extends Error {
	public constructor(
		message: string,
		public readonly cause: unknown,
		public readonly stepId: string | null
	) {
		super(message);
	}
}
