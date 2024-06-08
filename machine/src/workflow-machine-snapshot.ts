import { StateValue } from 'xstate';
import { MachineUnhandledError } from './machine-unhandled-error';
import { readStatePaths } from './core/state-path-reader';
import { STATE_FAILED_ID, STATE_FINISHED_ID, STATE_INTERRUPTED_ID } from './types';
import { STATE_STEP_ID_PREFIX } from './core';

export class WorkflowMachineSnapshot<GlobalState> {
	private statePaths?: string[][];

	public constructor(
		public readonly globalState: GlobalState,
		public readonly unhandledError: MachineUnhandledError | undefined,
		private readonly stateValue: StateValue
	) {}

	/**
	 * @returns The paths of all currently executing states.
	 * @example `[ ['MAIN', 'STEP_1'], ['MAIN', 'STEP_2'] ]`
	 */
	public getStatePaths(): string[][] {
		if (!this.statePaths) {
			this.statePaths = readStatePaths(this.stateValue);
		}
		return this.statePaths;
	}

	/**
	 * @returns The path of the currently executing state.
	 * If multiple states are currently executing, it returns `null`.
	 * To get all paths of executing states, use the `getStatePaths` method.
	 * @example `['MAIN', 'STEP_1']`
	 * @example `null`
	 */
	public tryGetStatePath(): string[] | null {
		const paths = this.getStatePaths();
		return paths.length === 1 ? paths[0] : null;
	}

	/**
	 * @returns The ID of the currently executing state.
	 * If multiple states are currently executing, it returns `null`.
	 */
	public tryGetCurrentStepId(): string | null {
		const path = this.tryGetStatePath();
		return path ? tryExtractStepId(path) : null;
	}

	/**
	 * @returns the list of ID of the currently executing steps.
	 */
	public getCurrentStepIds(): string[] {
		const ids = new Set<string>();
		const paths = this.getStatePaths();
		for (const path of paths) {
			const id = tryExtractStepId(path);
			if (id) {
				ids.add(id);
			}
		}
		return [...ids];
	}

	/**
	 * @returns `true` if the workflow machine is finished, otherwise `false`.
	 */
	public isFinished(): boolean {
		const path = this.tryGetStatePath();
		return path !== null && path[0] === STATE_FINISHED_ID;
	}

	/**
	 * @returns `true` if the workflow has failed, otherwise `false`.
	 */
	public isFailed(): boolean {
		const path = this.tryGetStatePath();
		return path !== null && path[0] === STATE_FAILED_ID;
	}

	/**
	 * @returns `true` if the workflow is interrupted, otherwise `false`.
	 */
	public isInterrupted(): boolean {
		const path = this.tryGetStatePath();
		return path !== null && path[0] === STATE_INTERRUPTED_ID;
	}
}

function tryExtractStepId(path: string[]): string | null {
	for (let i = path.length - 1; i >= 0; i--) {
		const item = path[i];
		if (item.startsWith(STATE_STEP_ID_PREFIX)) {
			return item.substring(STATE_STEP_ID_PREFIX.length);
		}
	}
	return null;
}
