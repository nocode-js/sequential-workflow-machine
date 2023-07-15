import { Activity } from '../../types';
import { AtomActivityNodeBuilder } from './atom-activity-node-builder';
import { AtomActivityConfig, AtomActivityHandler } from './types';
import { Step } from 'sequential-workflow-model';

export function createAtomActivity<TStep extends Step = Step, TGlobalState = object, TActivityState extends object = object>(
	stepType: TStep['type'],
	config: AtomActivityConfig<TStep, TGlobalState, TActivityState>
): Activity<TGlobalState> {
	return {
		stepType: stepType,
		nodeBuilderFactory: () => new AtomActivityNodeBuilder(config)
	};
}

export function createAtomActivityFromHandler<TStep extends Step = Step, TGlobalState = object>(
	stepType: TStep['type'],
	handler: AtomActivityHandler<TStep, TGlobalState, Record<string, never>>
): Activity<TGlobalState> {
	return createAtomActivity(stepType, {
		init: () => ({}),
		handler
	});
}
