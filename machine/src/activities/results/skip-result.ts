export interface SkipResult {
	skip: true;
}

export function isSkipResult(result: unknown): result is SkipResult {
	return typeof result === 'object' && (result as SkipResult).skip === true;
}

export function skip(): SkipResult {
	return { skip: true };
}
