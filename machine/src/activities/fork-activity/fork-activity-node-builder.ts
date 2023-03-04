import {
	ActivityNodeBuilder,
	BuildingContext,
	MachineContext,
	ActivityNodeConfig,
	STATE_FAILED_TARGET,
	STATE_INTERRUPTED_TARGET
} from '../../types';
import { ActivityStateAccessor } from '../../core/activity-context-accessor';
import { ForkActivityConfig, ForkActivityState } from './types';
import { catchUnhandledError } from '../../core/catch-unhandled-error';
import { SequenceNodeBuilder } from '../../core/sequence-node-builder';
import { getBranchNodeId, getStepNodeId } from '../../core/safe-node-id';
import { BranchedStep } from 'sequential-workflow-model';
import { isBranchNameResult } from '../results/branch-name-result';
import { isInterruptResult } from '../results/interrupt-result';

export class ForkActivityNodeBuilder<TStep extends BranchedStep, GlobalState, ActivityState> implements ActivityNodeBuilder<GlobalState> {
	public constructor(
		private readonly sequenceNodeBuilder: SequenceNodeBuilder<GlobalState>,
		private readonly activityStateAccessor: ActivityStateAccessor<GlobalState, ForkActivityState<ActivityState>>,
		private readonly config: ForkActivityConfig<TStep, GlobalState, ActivityState>
	) {}

	public build(step: TStep, nextNodeTarget: string, buildingContext: BuildingContext): ActivityNodeConfig<GlobalState> {
		const nodeId = getStepNodeId(step.id);
		const branchNames = Object.keys(step.branches);

		const states: Record<string, ActivityNodeConfig<GlobalState>> = {};
		for (const branchName of branchNames) {
			const branchNodeId = getBranchNodeId(branchName);
			states[branchNodeId] = this.sequenceNodeBuilder.build(buildingContext, step.branches[branchName], nextNodeTarget);
		}

		const CONDITION: ActivityNodeConfig<GlobalState> = {
			invoke: {
				src: catchUnhandledError(async (context: MachineContext<GlobalState>) => {
					const internalState = this.activityStateAccessor.get(context, nodeId);

					const result = await this.config.handler(step, context.globalState, internalState.activityState);
					if (isInterruptResult(result)) {
						context.interrupted = nodeId;
						return;
					}

					if (isBranchNameResult(result)) {
						if (!branchNames.includes(result.branchName)) {
							throw new Error(`Branch ${result.branchName} does not exist`);
						}
						internalState.targetBranchName = result.branchName;
						return;
					}

					throw new Error('Not supported result for conditional activity');
				}),
				onDone: [
					{
						target: STATE_INTERRUPTED_TARGET,
						cond: (context: MachineContext<GlobalState>) => Boolean(context.interrupted)
					},
					...branchNames.map(branchName => {
						return {
							target: getBranchNodeId(branchName),
							cond: (context: MachineContext<GlobalState>) => {
								const activityState = this.activityStateAccessor.get(context, nodeId);
								return activityState.targetBranchName === branchName;
							}
						};
					})
				],
				onError: STATE_FAILED_TARGET
			}
		};

		return {
			id: nodeId,
			initial: 'CONDITION',
			states: {
				CONDITION,
				...states
			}
		};
	}
}
