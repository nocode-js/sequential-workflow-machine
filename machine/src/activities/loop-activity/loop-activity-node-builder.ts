import { SequentialStep } from 'sequential-workflow-model';
import { getLoopStack } from '../loop-stack';
import { LoopActivityConfig, LoopActivityState } from './types';
import { ActivityStateAccessor, SequenceNodeBuilder, catchUnhandledError, getStepNodeId } from '../../core';
import {
	ActivityNodeBuilder,
	ActivityNodeConfig,
	BuildingContext,
	MachineContext,
	STATE_FAILED_TARGET,
	STATE_INTERRUPTED_TARGET
} from '../../types';
import { isInterruptResult } from '../results';

export class LoopActivityNodeBuilder<TStep extends SequentialStep, GlobalState, ActivityState> implements ActivityNodeBuilder<GlobalState> {
	public constructor(
		private readonly sequenceNodeBuilder: SequenceNodeBuilder<GlobalState>,
		private readonly activityStateAccessor: ActivityStateAccessor<GlobalState, LoopActivityState<ActivityState>>,
		private readonly config: LoopActivityConfig<TStep, GlobalState, ActivityState>
	) {}

	public build(step: TStep, nextNodeTarget: string, buildingContext: BuildingContext): ActivityNodeConfig<GlobalState> {
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
						src: catchUnhandledError(async (context: MachineContext<GlobalState>) => {
							if (this.config.onEnter) {
								const internalContext = this.activityStateAccessor.get(context, nodeId);
								this.config.onEnter(step, context.globalState, internalContext.activityState);
							}
						}),
						onDone: 'CONDITION',
						onError: STATE_FAILED_TARGET
					}
				},
				CONDITION: {
					id: conditionNodeId,
					invoke: {
						src: catchUnhandledError(async (context: MachineContext<GlobalState>) => {
							const internalState = this.activityStateAccessor.get(context, nodeId);

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
								cond: (context: MachineContext<GlobalState>) => Boolean(context.interrupted)
							},
							{
								target: 'LOOP',
								cond: (context: MachineContext<GlobalState>) => {
									const activityState = this.activityStateAccessor.get(context, nodeId);
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
						src: catchUnhandledError(async (context: MachineContext<GlobalState>) => {
							if (this.config.onLeave) {
								const internalState = this.activityStateAccessor.get(context, nodeId);
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
