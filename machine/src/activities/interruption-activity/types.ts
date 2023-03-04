import { Step } from 'sequential-workflow-model';
import { ActivityConfig } from '../../types';

export type InterruptionActivityHandler<TStep extends Step, GlobalState> = (step: TStep, globalState: GlobalState) => Promise<void>;

export interface InterruptionActivityConfig<TStep extends Step, GlobalState> extends ActivityConfig<TStep> {
	handler: InterruptionActivityHandler<TStep, GlobalState>;
}
