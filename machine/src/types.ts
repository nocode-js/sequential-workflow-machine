import { EventObject, Interpreter, StateConfig, StateMachine, StateNodeConfig, StateSchema, Typestate } from 'xstate';
import { SequenceNodeBuilder } from './core/sequence-node-builder';
import { Definition, Step } from 'sequential-workflow-model';
import { MachineUnhandledError } from './machine-unhandled-error';

export const STATE_INTERRUPTED_ID = 'INTERRUPTED';
export const STATE_INTERRUPTED_TARGET = `#${STATE_INTERRUPTED_ID}`;

export const STATE_FINISHED_ID = 'FINISHED';
export const STATE_FINISHED_TARGET = `#${STATE_FINISHED_ID}`;

export const STATE_FAILED_ID = 'FAILED';
export const STATE_FAILED_TARGET = `#${STATE_FAILED_ID}`;

export interface MachineContext<TGlobalState> {
	interrupted?: string;
	unhandledError?: MachineUnhandledError;
	globalState: TGlobalState;
	activityStates: Record<string, unknown>;
}

export interface Activity<TGlobalState> {
	stepType: string;
	nodeBuilderFactory: ActivityNodeBuilderFactory<TGlobalState>;
}

export type ActivityNodeBuilderFactory<TGlobalState> = (
	sequenceNodeBuilder: SequenceNodeBuilder<TGlobalState>
) => ActivityNodeBuilder<TGlobalState>;

export interface BuildingContext {
	[name: string]: unknown;
}

export interface ActivityNodeBuilder<TGlobalState> {
	build(step: Step, nextNodeTarget: string, buildingContext: BuildingContext): ActivityNodeConfig<TGlobalState>;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ActivityNodeConfig<TGlobalState> = StateNodeConfig<MachineContext<TGlobalState>, Record<string, any>, EventObject>;

export type GlobalStateInitializer<TGlobalState> = (definition: Definition) => TGlobalState;

export type ActivityStateInitializer<TStep extends Step, TGlobalState, TActivityState extends object> = (
	step: TStep,
	globalState: TGlobalState
) => TActivityState;

export type SequentialStateMachine<TGlobalState> = StateMachine<MachineContext<TGlobalState>, StateSchema, EventObject>;
export type SequentialStateMachineInterpreter<TGlobalState> = Interpreter<
	MachineContext<TGlobalState>,
	StateSchema,
	EventObject,
	Typestate<MachineContext<TGlobalState>>,
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	any
>;

export type SignalPayload = Record<string, unknown>;

export type SerializedWorkflowMachineSnapshot<TGlobalState> = StateConfig<MachineContext<TGlobalState>, EventObject>;
