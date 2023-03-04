export function getStepNodeId(stepId: string): string {
	return `STEP_${stepId}`;
}

export function getBranchNodeId(branchName: string): string {
	return `BRANCH_${branchName}`;
}
