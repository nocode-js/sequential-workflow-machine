import { EventObject, Interpreter, StateMachine, StateNodeConfig, StateSchema, Typestate } from 'xstate';
import { SequenceNodeBuilder } from './core/sequence-node-builder';
import { Definition, Step } from 'sequential-workflow-model';

export const STATE_INTERRUPTED_ID = 'INTERRUPTED';
export const STATE_INTERRUPTED_TARGET = `#${STATE_INTERRUPTED_ID}`;

export const STATE_FINISHED_ID = 'FINISHED';
export const STATE_FINISHED_TARGET = `#${STATE_FINISHED_ID}`;

export const STATE_FAILED_ID = 'FAILED';
export const STATE_FAILED_TARGET = `#${STATE_FAILED_ID}`;

export type MachineUnhandledError = unknown;

export interface MachineContext<GlobalState> {
	interrupted?: string;
	unhandledError?: MachineUnhandledError;
	globalState: GlobalState;
	activityStates: Record<string, unknown>;
}

export interface Activity<GlobalState> {
	stepType: string;
	nodeBuilderFactory: ActivityNodeBuilderFactory<GlobalState>;
}

export interface ActivityConfig<TStep extends Step> {
	stepType: TStep['type'];
}

export type ActivityNodeBuilderFactory<GlobalState> = (
	sequenceNodeBuilder: SequenceNodeBuilder<GlobalState>
) => ActivityNodeBuilder<GlobalState>;

export interface BuildingContext {
	[name: string]: unknown;
}

export interface ActivityNodeBuilder<GlobalState> {
	build(step: Step, nextNodeTarget: string, buildingContext: BuildingContext): ActivityNodeConfig<GlobalState>;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ActivityNodeConfig<GlobalState> = StateNodeConfig<MachineContext<GlobalState>, Record<string, any>, EventObject>;

export type GlobalStateInitializer<GlobalState> = (definition: Definition) => GlobalState;

export type ActivityStateInitializer<GlobalState, ActivityState> = (globalState: GlobalState) => ActivityState;

export type SequentialStateMachine<GlobalState> = StateMachine<MachineContext<GlobalState>, StateSchema, EventObject>;
export type SequentialStateMachineInterpreter<GlobalState> = Interpreter<
	MachineContext<GlobalState>,
	StateSchema,
	EventObject,
	Typestate<MachineContext<GlobalState>>,
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	any
>;
