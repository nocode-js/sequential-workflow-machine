import { SequentialStep } from 'sequential-workflow-model';
import { getLoopStack } from '../loop-stack';
import { LoopActivityConfig, LoopActivityState } from './types';
import { ActivityStateProvider, SequenceNodeBuilder, catchUnhandledError, getStepNodeId } from '../../core';
import {
	ActivityNodeBuilder,
	ActivityNodeConfig,
	BuildingContext,
	MachineContext,
	STATE_FAILED_TARGET,
	STATE_INTERRUPTED_TARGET
} from '../../types';
import { isInterruptResult } from '../results';

export class LoopActivityNodeBuilder<TStep extends SequentialStep, TGlobalState, TActivityState extends object>
	implements ActivityNodeBuilder<TGlobalState>
{
	public constructor(
		private readonly sequenceNodeBuilder: SequenceNodeBuilder<TGlobalState>,
		private readonly config: LoopActivityConfig<TStep, TGlobalState, TActivityState>
	) {}

	public build(step: TStep, nextNodeTarget: string, buildingContext: BuildingContext): ActivityNodeConfig<TGlobalState> {
		const activityStateProvider = new ActivityStateProvider<TStep, TGlobalState, LoopActivityState<TActivityState>>(step, (s, g) => ({
			activityState: this.config.init(s, g)
		}));
		const nodeId = getStepNodeId(step.id);

		const conditionNodeId = `CONDITION.${nodeId}`;
		const conditionNodeTarget = `#${conditionNodeId}`;
		const leaveNodeId = `LEAVE.${nodeId}`;
		const leaveNodeTarget = `#${leaveNodeId}`;

		const loopName = this.config.loopName(step);
		const loopStack = getLoopStack(buildingContext);
		loopStack.push(loopName, leaveNodeTarget);

		const LOOP = this.sequenceNodeBuilder.build(buildingContext, step.sequence, conditionNodeTarget);

		loopStack.pop();

		return {
			id: nodeId,
			initial: 'ENTER',
			states: {
				ENTER: {
					invoke: {
						src: catchUnhandledError(async (context: MachineContext<TGlobalState>) => {
							if (this.config.onEnter) {
								const internalState = activityStateProvider.get(context, nodeId);
								this.config.onEnter(step, context.globalState, internalState.activityState);
							}
						}),
						onDone: 'CONDITION',
						onError: STATE_FAILED_TARGET
					}
				},
				CONDITION: {
					id: conditionNodeId,
					invoke: {
						src: catchUnhandledError(async (context: MachineContext<TGlobalState>) => {
							const internalState = activityStateProvider.get(context, nodeId);

							const result = await this.config.condition(step, context.globalState, internalState.activityState);
							if (isInterruptResult(result)) {
								context.interrupted = nodeId;
								return;
							}

							internalState.continue = result;
						}),
						onDone: [
							{
								target: STATE_INTERRUPTED_TARGET,
								cond: (context: MachineContext<TGlobalState>) => Boolean(context.interrupted)
							},
							{
								target: 'LOOP',
								cond: (context: MachineContext<TGlobalState>) => {
									const activityState = activityStateProvider.get(context, nodeId);
									return Boolean(activityState.continue);
								}
							},
							{
								target: 'LEAVE'
							}
						],
						onError: STATE_FAILED_TARGET
					}
				},
				LOOP,
				LEAVE: {
					id: leaveNodeId,
					invoke: {
						src: catchUnhandledError(async (context: MachineContext<TGlobalState>) => {
							if (this.config.onLeave) {
								const internalState = activityStateProvider.get(context, nodeId);
								this.config.onLeave(step, context.globalState, internalState.activityState);
							}
						}),
						onDone: nextNodeTarget,
						onError: STATE_FAILED_TARGET
					}
				}
			}
		};
	}
}
