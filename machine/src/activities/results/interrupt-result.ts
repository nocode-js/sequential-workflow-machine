export interface InterruptResult {
	interrupt: true;
}

export function isInterruptResult(result: unknown): result is InterruptResult {
	return typeof result === 'object' && (result as InterruptResult).interrupt === true;
}

export function interrupt(): InterruptResult {
	return { interrupt: true };
}
