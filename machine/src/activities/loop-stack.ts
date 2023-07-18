import { BuildingContext } from '../types';

export interface LoopStackItem {
	name: string;
	leaveNodeTarget: string;
}

const stackKey = 'loopStack';

export function getLoopStack(buildingContext: BuildingContext): LoopStack {
	let stack = buildingContext[stackKey] as LoopStack | undefined;
	if (!stack) {
		stack = new LoopStack();
		buildingContext[stackKey] = stack;
	}
	return stack;
}

export class LoopStack {
	private readonly stack: LoopStackItem[] = [];

	public push(name: string, leaveNodeTarget: string) {
		if (this.stack.some(item => item.name === name)) {
			throw new Error(`Loop with name "${name}" is already used in the stack`);
		}

		this.stack.push({
			name,
			leaveNodeTarget
		});
	}

	public pop() {
		this.stack.pop();
	}

	public getNodeTarget(nameOrIndex: string | -1): string {
		let item: LoopStackItem | undefined;
		if (typeof nameOrIndex === 'number') {
			if (nameOrIndex !== -1) {
				throw new Error(`Index ${nameOrIndex} is not supported`);
			}
			item = this.stack[this.stack.length - 1];
			if (!item) {
				throw new Error('Cannot find any parent loop');
			}
		} else {
			item = this.stack.find(item => item.name === nameOrIndex);
			if (!item) {
				throw new Error(`Loop "${nameOrIndex}" not found`);
			}
		}
		return item.leaveNodeTarget;
	}
}
