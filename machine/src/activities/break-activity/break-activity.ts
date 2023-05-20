import { BreakActivityConfig, BreakActivityState } from './types';
import { BreakActivityNodeBuilder } from './break-activity-node-builder';
import { Step } from 'sequential-workflow-model';
import { Activity } from '../../types';
import { ActivityStateAccessor } from '../../core';

export function createBreakActivity<TStep extends Step = Step, GlobalState = object, ActivityState = object>(
	config: BreakActivityConfig<TStep, GlobalState, ActivityState>
): Activity<GlobalState> {
	const activityStateAccessor = new ActivityStateAccessor<GlobalState, BreakActivityState<ActivityState>>(globalState => ({
		activityState: config.init(globalState)
	}));

	return {
		stepType: config.stepType,
		nodeBuilderFactory: () => new BreakActivityNodeBuilder(activityStateAccessor, config)
	};
}
