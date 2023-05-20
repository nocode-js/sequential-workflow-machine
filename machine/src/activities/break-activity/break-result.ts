export interface BreakResult {
	break: true;
}

export function isBreakResult(result: unknown): result is BreakResult {
	return typeof result === 'object' && (result as BreakResult).break;
}

export function break_(): BreakResult {
	return { break: true };
}
