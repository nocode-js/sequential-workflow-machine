import { Activity } from '../../types';
import { ActivityStateAccessor } from '../../core/activity-context-accessor';
import { AtomActivityNodeBuilder } from './atom-activity-node-builder';
import { AtomActivityConfig } from './types';
import { Step } from 'sequential-workflow-model';

export function createAtomActivity<TStep extends Step = Step, GlobalState = object, ActivityState = object>(
	config: AtomActivityConfig<TStep, GlobalState, ActivityState>
): Activity<GlobalState> {
	const activityStateAccessor = new ActivityStateAccessor(config.init);

	return {
		stepType: config.stepType,
		nodeBuilderFactory: () => new AtomActivityNodeBuilder(activityStateAccessor, config)
	};
}
