import {
	ActivityNodeBuilder,
	MachineContext,
	ActivityNodeConfig,
	STATE_FAILED_TARGET,
	STATE_INTERRUPTED_TARGET,
	BuildingContext
} from '../../types';
import { ActivityStateProvider } from '../../core/activity-context-provider';
import { catchUnhandledError } from '../../core/catch-unhandled-error';
import { getStepNodeId } from '../../core/safe-node-id';
import { SequentialStep } from 'sequential-workflow-model';
import { ContainerActivityConfig, ContainerActivityHandler } from './types';
import { SequenceNodeBuilder } from '../../core';
import { isInterruptResult } from '../results/interrupt-result';

export class ContainerActivityNodeBuilder<TStep extends SequentialStep, TGlobalState, TActivityState>
	implements ActivityNodeBuilder<TGlobalState>
{
	public constructor(
		private readonly sequenceNodeBuilder: SequenceNodeBuilder<TGlobalState>,
		private readonly config: ContainerActivityConfig<TStep, TGlobalState, TActivityState>
	) {}

	public build(step: TStep, nextNodeTarget: string, buildingContext: BuildingContext): ActivityNodeConfig<TGlobalState> {
		const activityStateProvider = new ActivityStateProvider<TStep, TGlobalState, TActivityState>(step, this.config.init);
		const nodeId = getStepNodeId(step.id);

		const enterNodeId = `ENTER.${nodeId}`;
		const leaveNodeId = `LEAVE.${nodeId}`;
		const leaveNodeTarget = `#${leaveNodeId}`;

		const createState = (
			id: string,
			handle: ContainerActivityHandler<TStep, TGlobalState, TActivityState> | undefined,
			nextStateNodeTarget: string
		) => {
			return {
				id,
				invoke: {
					src: catchUnhandledError(async (context: MachineContext<TGlobalState>) => {
						if (handle) {
							const activityState = activityStateProvider.get(context, nodeId);

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
							cond: (context: MachineContext<TGlobalState>) => Boolean(context.interrupted)
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
