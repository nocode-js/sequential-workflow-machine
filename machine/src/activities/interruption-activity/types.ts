import { Step } from 'sequential-workflow-model';
import { ActivityConfig } from '../../types';

export type InterruptionActivityHandler<TStep extends Step, TGlobalState> = (step: TStep, globalState: TGlobalState) => Promise<void>;

export interface InterruptionActivityConfig<TStep extends Step, TGlobalState> extends ActivityConfig<TStep> {
	handler: InterruptionActivityHandler<TStep, TGlobalState>;
}
