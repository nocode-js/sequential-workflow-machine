import { Activity } from '../../types';
import { AtomActivityNodeBuilder } from './atom-activity-node-builder';
import { AtomActivityConfig } from './types';
import { Step } from 'sequential-workflow-model';

export function createAtomActivity<TStep extends Step = Step, TGlobalState = object, TActivityState = object>(
	config: AtomActivityConfig<TStep, TGlobalState, TActivityState>
): Activity<TGlobalState> {
	return {
		stepType: config.stepType,
		nodeBuilderFactory: () => new AtomActivityNodeBuilder(config)
	};
}
