export interface InterruptResult {
	interrupt: true;
}

export function isInterruptResult(result: unknown): result is InterruptResult {
	return Boolean(result) && (result as InterruptResult).interrupt;
}

export function interrupt(): InterruptResult {
	return { interrupt: true };
}
