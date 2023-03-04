import { ActivitySet } from './activity-set';
import { ActivityNodeBuilder } from '../types';
import { SequenceNodeBuilder } from './sequence-node-builder';

export class ActivityNodeBuilderResolver<GlobalState> {
	private readonly builders: Map<string, ActivityNodeBuilder<GlobalState>> = new Map();

	public constructor(
		private readonly activitiesSet: ActivitySet<GlobalState>,
		private readonly sequenceNodeBuilder: SequenceNodeBuilder<GlobalState>
	) {}

	public resolve(stepType: string): ActivityNodeBuilder<GlobalState> {
		let builder = this.builders.get(stepType);
		if (builder) {
			return builder;
		}

		const activity = this.activitiesSet.get(stepType);
		builder = activity.nodeBuilderFactory(this.sequenceNodeBuilder);
		this.builders.set(stepType, builder);
		return builder;
	}
}
