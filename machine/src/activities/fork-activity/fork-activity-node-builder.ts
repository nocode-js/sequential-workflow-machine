import {
	ActivityNodeBuilder,
	BuildingContext,
	MachineContext,
	ActivityNodeConfig,
	STATE_FAILED_TARGET,
	STATE_INTERRUPTED_TARGET
} from '../../types';
import { ActivityStateProvider } from '../../core/activity-context-provider';
import { ForkActivityConfig, ForkActivityState } from './types';
import { catchUnhandledError } from '../../core/catch-unhandled-error';
import { SequenceNodeBuilder } from '../../core/sequence-node-builder';
import { getBranchNodeId, getStepNodeId } from '../../core/safe-node-id';
import { BranchedStep } from 'sequential-workflow-model';
import { isBranchNameResult } from '../results/branch-name-result';
import { isInterruptResult } from '../results/interrupt-result';
import { isSkipResult } from '../results';

export class ForkActivityNodeBuilder<TStep extends BranchedStep, TGlobalState, TActivityState extends object>
	implements ActivityNodeBuilder<TGlobalState>
{
	public constructor(
		private readonly sequenceNodeBuilder: SequenceNodeBuilder<TGlobalState>,
		private readonly config: ForkActivityConfig<TStep, TGlobalState, TActivityState>
	) {}

	public build(step: TStep, nextNodeTarget: string, buildingContext: BuildingContext): ActivityNodeConfig<TGlobalState> {
		const activityStateProvider = new ActivityStateProvider<TStep, TGlobalState, ForkActivityState<TActivityState>>(step, (s, g) => {
			return {
				activityState: this.config.init(s, g)
			};
		});

		const nodeId = getStepNodeId(step.id);
		const branchNames = Object.keys(step.branches);

		const states: Record<string, ActivityNodeConfig<TGlobalState>> = {};
		for (const branchName of branchNames) {
			const branchNodeId = getBranchNodeId(branchName);
			states[branchNodeId] = this.sequenceNodeBuilder.build(buildingContext, step.branches[branchName], nextNodeTarget);
		}

		const CONDITION: ActivityNodeConfig<TGlobalState> = {
			invoke: {
				src: catchUnhandledError(async (context: MachineContext<TGlobalState>) => {
					const internalState = activityStateProvider.get(context, nodeId);

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
						internalState.skipped = undefined;
						return;
					}

					if (isSkipResult(result)) {
						internalState.targetBranchName = undefined;
						internalState.skipped = true;
						return;
					}

					throw new Error('Not supported result for conditional activity');
				}),
				onDone: [
					{
						target: STATE_INTERRUPTED_TARGET,
						cond: (context: MachineContext<TGlobalState>) => Boolean(context.interrupted)
					},
					{
						target: nextNodeTarget,
						cond: (context: MachineContext<TGlobalState>) => {
							const activityState = activityStateProvider.get(context, nodeId);
							return Boolean(activityState.skipped);
						}
					},
					...branchNames.map(branchName => {
						return {
							target: getBranchNodeId(branchName),
							cond: (context: MachineContext<TGlobalState>) => {
								const activityState = activityStateProvider.get(context, nodeId);
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
