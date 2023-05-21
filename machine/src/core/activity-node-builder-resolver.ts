import { ActivitySet } from './activity-set';
import { ActivityNodeBuilder } from '../types';
import { SequenceNodeBuilder } from './sequence-node-builder';

export class ActivityNodeBuilderResolver<TGlobalState> {
	private readonly builders: Map<string, ActivityNodeBuilder<TGlobalState>> = new Map();

	public constructor(
		private readonly activitiesSet: ActivitySet<TGlobalState>,
		private readonly sequenceNodeBuilder: SequenceNodeBuilder<TGlobalState>
	) {}

	public resolve(stepType: string): ActivityNodeBuilder<TGlobalState> {
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
