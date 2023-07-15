import { ActivityNodeBuilder, MachineContext, ActivityNodeConfig, STATE_FAILED_TARGET, STATE_INTERRUPTED_TARGET } from '../../types';
import { ActivityStateProvider } from '../../core/activity-context-provider';
import { AtomActivityConfig } from './types';
import { catchUnhandledError } from '../../core/catch-unhandled-error';
import { getStepNodeId } from '../../core/safe-node-id';
import { Step } from 'sequential-workflow-model';
import { isInterruptResult } from '../results/interrupt-result';

export class AtomActivityNodeBuilder<TStep extends Step, TGlobalState, TActivityState extends object>
	implements ActivityNodeBuilder<TGlobalState>
{
	public constructor(private readonly config: AtomActivityConfig<TStep, TGlobalState, TActivityState>) {}

	public build(step: TStep, nextNodeTarget: string): ActivityNodeConfig<TGlobalState> {
		const activityStateProvider = new ActivityStateProvider(step, this.config.init);
		const nodeId = getStepNodeId(step.id);

		return {
			id: nodeId,
			invoke: {
				src: catchUnhandledError(async (context: MachineContext<TGlobalState>) => {
					const activityState = activityStateProvider.get(context, nodeId);

					const result = await this.config.handler(step, context.globalState, activityState);
					if (isInterruptResult(result)) {
						context.interrupted = nodeId;
						return;
					}
				}),
				onDone: [
					{
						target: STATE_INTERRUPTED_TARGET,
						cond: (context: MachineContext<TGlobalState>) => Boolean(context.interrupted)
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
