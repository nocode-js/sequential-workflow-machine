export type BranchNameResult = { branchName: string };

export function branchName(branchName: string): BranchNameResult {
	return { branchName };
}

export function isBranchNameResult(result: unknown): result is BranchNameResult {
	return Boolean(result) && Boolean((result as BranchNameResult).branchName);
}
