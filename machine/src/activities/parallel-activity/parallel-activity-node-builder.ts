import {
	ActivityNodeBuilder,
	BuildingContext,
	MachineContext,
	ActivityNodeConfig,
	STATE_FAILED_TARGET,
	STATE_INTERRUPTED_TARGET
} from '../../types';
import { ActivityStateProvider } from '../../core/activity-context-provider';
import { catchUnhandledError } from '../../core/catch-unhandled-error';
import { SequenceNodeBuilder } from '../../core/sequence-node-builder';
import { getBranchNodeId, getStepNodeId } from '../../core/safe-node-id';
import { BranchedStep } from 'sequential-workflow-model';
import { ParallelActivityConfig, ParallelActivityState } from './types';
import { isInterruptResult, isSkipResult } from '../results';

export class ParallelActivityNodeBuilder<TStep extends BranchedStep, TGlobalState, TActivityState extends object>
	implements ActivityNodeBuilder<TGlobalState>
{
	public constructor(
		private readonly sequenceNodeBuilder: SequenceNodeBuilder<TGlobalState>,
		private readonly config: ParallelActivityConfig<TStep, TGlobalState, TActivityState>
	) {}

	public build(step: TStep, nextNodeTarget: string, buildingContext: BuildingContext): ActivityNodeConfig<TGlobalState> {
		const activityStateProvider = new ActivityStateProvider<TStep, TGlobalState, ParallelActivityState<TActivityState>>(
			step,
			(s, g) => ({ activityState: this.config.init(s, g) })
		);

		const nodeId = getStepNodeId(step.id);
		const branchNames = Object.keys(step.branches);
		const states: Record<string, ActivityNodeConfig<TGlobalState>> = {};

		for (const branchName of branchNames) {
			const branchNodeId = getBranchNodeId(step.id, branchName);
			const leaveNodeId = branchNodeId + '_LEAVE';
			const leaveNodeTarget = '#' + leaveNodeId;

			states[branchNodeId] = {
				initial: 'TRY_LEAVE',
				states: {
					TRY_LEAVE: {
						invoke: {
							src: catchUnhandledError(async () => {
								// TODO: emit on enter?
							}),
							onDone: [
								{
									target: 'SEQUENCE',
									cond: (context: MachineContext<TGlobalState>) => {
										const activityState = activityStateProvider.get(context, nodeId);
										return activityState.branchNames?.includes(branchName) ?? false;
									}
								},
								{
									target: 'LEAVE'
								}
							],
							onError: STATE_FAILED_TARGET
						}
					},
					SEQUENCE: this.sequenceNodeBuilder.build(buildingContext, step.branches[branchName], leaveNodeTarget),
					LEAVE: {
						id: leaveNodeId,
						type: 'final'
					}
				}
			};
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
					if (isSkipResult(result)) {
						internalState.branchNames = [];
						return;
					}
					if (Array.isArray(result)) {
						internalState.branchNames = result.map(r => r.branchName);
						return;
					}
					throw new Error('Not supported result for parallel activity');
				}),
				onDone: [
					{
						target: STATE_INTERRUPTED_TARGET,
						cond: (context: MachineContext<TGlobalState>) => Boolean(context.interrupted)
					},
					{
						target: 'PARALLEL'
					}
				],
				onError: STATE_FAILED_TARGET
			}
		};

		return {
			id: nodeId,
			initial: 'CONDITION',
			states: {
				CONDITION,
				PARALLEL: {
					type: 'parallel',
					states,
					onDone: 'JOIN'
				},
				JOIN: {
					invoke: {
						src: catchUnhandledError(async (context: MachineContext<TGlobalState>) => {
							const internalState = activityStateProvider.get(context, nodeId);
							internalState.branchNames = undefined;
						}),
						onDone: nextNodeTarget,
						onError: STATE_FAILED_TARGET
					}
				}
			}
		};
	}
}
