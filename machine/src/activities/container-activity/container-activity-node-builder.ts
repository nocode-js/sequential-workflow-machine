import {
	ActivityNodeBuilder,
	MachineContext,
	ActivityNodeConfig,
	STATE_FAILED_TARGET,
	STATE_INTERRUPTED_TARGET,
	BuildingContext
} from '../../types';
import { ActivityStateAccessor } from '../../core/activity-context-accessor';
import { catchUnhandledError } from '../../core/catch-unhandled-error';
import { getStepNodeId } from '../../core/safe-node-id';
import { SequentialStep } from 'sequential-workflow-model';
import { ContainerActivityConfig, ContainerActivityHandler } from './types';
import { SequenceNodeBuilder } from '../../core';
import { isInterruptResult } from '../results/interrupt-result';

export class ContainerActivityNodeBuilder<TStep extends SequentialStep, GlobalState, ActivityState>
	implements ActivityNodeBuilder<GlobalState>
{
	public constructor(
		private readonly sequenceNodeBuilder: SequenceNodeBuilder<GlobalState>,
		private readonly activityStateAccessor: ActivityStateAccessor<GlobalState, ActivityState>,
		private readonly config: ContainerActivityConfig<TStep, GlobalState, ActivityState>
	) {}

	public build(step: TStep, nextNodeTarget: string, buildingContext: BuildingContext): ActivityNodeConfig<GlobalState> {
		const nodeId = getStepNodeId(step.id);

		const enterNodeId = `ENTER.${nodeId}`;
		const leaveNodeId = `LEAVE.${nodeId}`;
		const leaveNodeTarget = `#${leaveNodeId}`;

		const createState = (
			id: string,
			handle: ContainerActivityHandler<TStep, GlobalState, ActivityState> | undefined,
			nextStateNodeTarget: string
		) => {
			return {
				id,
				invoke: {
					src: catchUnhandledError(async (context: MachineContext<GlobalState>) => {
						if (handle) {
							const activityState = this.activityStateAccessor.get(context, nodeId);

							const result = await handle(step, context.globalState, activityState);
							if (isInterruptResult(result)) {
								context.interrupted = nodeId;
								return;
							}
						}
					}),
					onDone: [
						{
							target: STATE_INTERRUPTED_TARGET,
							cond: (context: MachineContext<GlobalState>) => Boolean(context.interrupted)
						},
						{
							target: nextStateNodeTarget
						}
					],
					onError: STATE_FAILED_TARGET
				}
			};
		};

		return {
			id: nodeId,
			initial: 'ENTER',
			states: {
				ENTER: createState(enterNodeId, this.config.onEnter, 'SEQUENCE'),
				SEQUENCE: this.sequenceNodeBuilder.build(buildingContext, step.sequence, leaveNodeTarget),
				LEAVE: createState(leaveNodeId, this.config.onLeave, nextNodeTarget)
			}
		};
	}
}
