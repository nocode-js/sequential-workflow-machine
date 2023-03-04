import { Activity } from '../../types';
import { ActivityStateAccessor } from '../../core/activity-context-accessor';
import { ForkActivityNodeBuilder } from './fork-activity-node-builder';
import { ForkActivityConfig, ForkActivityState } from './types';
import { BranchedStep } from 'sequential-workflow-model';

export function createForkActivity<TStep extends BranchedStep, GlobalState = object, ActivityState = object>(
	config: ForkActivityConfig<TStep, GlobalState, ActivityState>
): Activity<GlobalState> {
	const activityStateAccessor = new ActivityStateAccessor<GlobalState, ForkActivityState<ActivityState>>(globalState => ({
		activityState: config.init(globalState)
	}));

	return {
		stepType: config.stepType,
		nodeBuilderFactory: sequenceNodeBuilder => new ForkActivityNodeBuilder(sequenceNodeBuilder, activityStateAccessor, config)
	};
}
