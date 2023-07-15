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
import { ActivityStateProvider, catchUnhandledError, getStepNodeId } from '../../core';
import { isInterruptResult } from '../results';
import { isBreakResult } from './break-result';

export class BreakActivityNodeBuilder<TStep extends Step, TGlobalState, TActivityState extends object>
	implements ActivityNodeBuilder<TGlobalState>
{
	public constructor(private readonly config: BreakActivityConfig<TStep, TGlobalState, TActivityState>) {}

	public build(step: TStep, nextNodeTarget: string, buildingContext: BuildingContext): ActivityNodeConfig<TGlobalState> {
		const activityStateProvider = new ActivityStateProvider<TStep, TGlobalState, BreakActivityState<TActivityState>>(step, (s, g) => {
			return {
				activityState: this.config.init(s, g)
			};
		});
		const nodeId = getStepNodeId(step.id);

		const loopName = this.config.loopName(step);
		const leaveNodeTarget = getLoopStack(buildingContext).getNodeTarget(loopName);

		return {
			id: nodeId,
			invoke: {
				src: catchUnhandledError(async (context: MachineContext<TGlobalState>) => {
					const internalState = activityStateProvider.get(context, nodeId);

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
						cond: (context: MachineContext<TGlobalState>) => Boolean(context.interrupted)
					},
					{
						target: leaveNodeTarget,
						cond: (context: MachineContext<TGlobalState>) => {
							const internalState = activityStateProvider.get(context, nodeId);
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
