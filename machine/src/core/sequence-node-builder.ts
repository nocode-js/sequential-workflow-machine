import { ActivitySet } from './activity-set';
import { BuildingContext, ActivityNodeConfig } from '../types';
import { ActivityNodeBuilderResolver } from './activity-node-builder-resolver';
import { getStepNodeId } from './safe-node-id';
import { Sequence } from 'sequential-workflow-model';

export class SequenceNodeBuilder<GlobalState> {
	private readonly resolver = new ActivityNodeBuilderResolver<GlobalState>(this.activitySet, this);

	public constructor(private readonly activitySet: ActivitySet<GlobalState>) {}

	public build(buildingContext: BuildingContext, sequence: Sequence, nextNodeTarget: string): ActivityNodeConfig<GlobalState> {
		if (sequence.length === 0) {
			return {
				invoke: {
					src: () => Promise.resolve(),
					onDone: { target: nextNodeTarget }
				}
			};
		}

		const states: Record<string, ActivityNodeConfig<GlobalState>> = {};
		for (let index = 0; index < sequence.length; index++) {
			const step = sequence[index];
			const nodeId = getStepNodeId(step.id);

			const nextStep = sequence[index + 1];
			let itemNextTarget: string;
			if (nextStep) {
				const nextNodeId = getStepNodeId(nextStep.id);
				itemNextTarget = `#${nextNodeId}`;
			} else {
				itemNextTarget = nextNodeTarget;
			}

			const nodeBuilder = this.resolver.resolve(step.type);
			states[nodeId] = nodeBuilder.build(step, itemNextTarget, buildingContext);
		}

		const firstNodeId = Object.keys(states)[0];
		return {
			initial: firstNodeId,
			states
		};
	}
}
