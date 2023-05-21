import { BreakActivityConfig } from './types';
import { BreakActivityNodeBuilder } from './break-activity-node-builder';
import { Step } from 'sequential-workflow-model';
import { Activity } from '../../types';

export function createBreakActivity<TStep extends Step = Step, GlobalState = object, ActivityState = object>(
	config: BreakActivityConfig<TStep, GlobalState, ActivityState>
): Activity<GlobalState> {
	return {
		stepType: config.stepType,
		nodeBuilderFactory: () => new BreakActivityNodeBuilder(config)
	};
}
