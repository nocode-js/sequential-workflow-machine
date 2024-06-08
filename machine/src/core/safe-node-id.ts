export const STATE_STEP_ID_PREFIX = 'STEP_';
export const STATE_BRANCH_ID_PREFIX = 'BRANCH_';

export function getStepNodeId(stepId: string): string {
	return STATE_STEP_ID_PREFIX + stepId;
}

export function getBranchNodeId(stepId: string, branchName: string): string {
	return STATE_BRANCH_ID_PREFIX + stepId + '_' + branchName;
}
