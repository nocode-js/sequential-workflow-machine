import { Step } from 'sequential-workflow-model';

export type InterruptionActivityHandler<TStep extends Step, TGlobalState> = (step: TStep, globalState: TGlobalState) => Promise<void>;

export interface InterruptionActivityConfig<TStep extends Step, TGlobalState> {
	handler: InterruptionActivityHandler<TStep, TGlobalState>;
}
