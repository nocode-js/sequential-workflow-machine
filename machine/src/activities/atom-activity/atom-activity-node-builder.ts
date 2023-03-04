import { ActivityNodeBuilder, MachineContext, ActivityNodeConfig, STATE_FAILED_TARGET, STATE_INTERRUPTED_TARGET } from '../../types';
import { ActivityStateAccessor } from '../../core/activity-context-accessor';
import { AtomActivityConfig } from './types';
import { catchUnhandledError } from '../../core/catch-unhandled-error';
import { getStepNodeId } from '../../core/safe-node-id';
import { Step } from 'sequential-workflow-model';
import { isInterruptResult } from '../results/interrupt-result';

export class AtomActivityNodeBuilder<TStep extends Step, GlobalState, ActivityState> implements ActivityNodeBuilder<GlobalState> {
	public constructor(
		private readonly activityStateAccessor: ActivityStateAccessor<GlobalState, ActivityState>,
		private readonly config: AtomActivityConfig<TStep, GlobalState, ActivityState>
	) {}

	public build(step: TStep, nextNodeTarget: string): ActivityNodeConfig<GlobalState> {
		const nodeId = getStepNodeId(step.id);
		return {
			id: nodeId,
			invoke: {
				src: catchUnhandledError(async (context: MachineContext<GlobalState>) => {
					const activityState = this.activityStateAccessor.get(context, nodeId);

					const result = await this.config.handler(step, context.globalState, activityState);
					if (isInterruptResult(result)) {
						context.interrupted = nodeId;
						return;
					}
				}),
				onDone: [
					{
						target: STATE_INTERRUPTED_TARGET,
						cond: (context: MachineContext<GlobalState>) => Boolean(context.interrupted)
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
