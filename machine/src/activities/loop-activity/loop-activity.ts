import { ActivityStateAccessor } from '../../core';
import { Activity } from '../../types';
import { LoopActivityNodeBuilder } from './loop-activity-node-builder';
import { LoopActivityConfig, LoopActivityState } from './types';
import { SequentialStep } from 'sequential-workflow-model';

export function createLoopActivity<TStep extends SequentialStep, GlobalState = object, ActivityState = object>(
	config: LoopActivityConfig<TStep, GlobalState, ActivityState>
): Activity<GlobalState> {
	const activityStateAccessor = new ActivityStateAccessor<GlobalState, LoopActivityState<ActivityState>>((globalState: GlobalState) => ({
		activityState: config.init(globalState)
	}));

	return {
		stepType: config.stepType,
		nodeBuilderFactory: sequenceNodeBuilder => new LoopActivityNodeBuilder(sequenceNodeBuilder, activityStateAccessor, config)
	};
}
