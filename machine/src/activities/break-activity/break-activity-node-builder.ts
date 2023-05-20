import { BreakActivityConfig, BreakActivityState } from './types';
import { getLoopStack } from '../loop-stack';
import { Step } from 'sequential-workflow-model';
import {
	ActivityNodeBuilder,
	ActivityNodeConfig,
	BuildingContext,
	MachineContext,
	STATE_FAILED_TARGET,
	STATE_INTERRUPTED_TARGET
} from '../../types';
import { ActivityStateAccessor, catchUnhandledError, getStepNodeId } from '../../core';
import { isInterruptResult } from '../results';
import { isBreakResult } from './break-result';

export class BreakActivityNodeBuilder<TStep extends Step, GlobalState, ActivityState> implements ActivityNodeBuilder<GlobalState> {
	public constructor(
		private readonly activityStateAccessor: ActivityStateAccessor<GlobalState, BreakActivityState<ActivityState>>,
		private readonly config: BreakActivityConfig<TStep, GlobalState, ActivityState>
	) {}

	public build(step: TStep, nextNodeTarget: string, buildingContext: BuildingContext): ActivityNodeConfig<GlobalState> {
		const nodeId = getStepNodeId(step.id);

		const loopName = this.config.loopName(step);
		const leaveNodeTarget = getLoopStack(buildingContext).getNodeTarget(loopName);

		return {
			id: nodeId,
			invoke: {
				src: catchUnhandledError(async (context: MachineContext<GlobalState>) => {
					const internalState = this.activityStateAccessor.get(context, nodeId);

					const result = await this.config.handler(step, context.globalState, internalState.activityState);
					if (isInterruptResult(result)) {
						context.interrupted = nodeId;
						return;
					}

					internalState.break = isBreakResult(result);
				}),
				onDone: [
					{
						target: STATE_INTERRUPTED_TARGET,
						cond: (context: MachineContext<GlobalState>) => Boolean(context.interrupted)
					},
					{
						target: leaveNodeTarget,
						cond: (context: MachineContext<GlobalState>) => {
							const internalState = this.activityStateAccessor.get(context, nodeId);
							return Boolean(internalState.break);
						}
					},
					{
						target: nextNodeTarget
					}
				],
				onError: STATE_FAILED_TARGET
			}
		};
	}
}
