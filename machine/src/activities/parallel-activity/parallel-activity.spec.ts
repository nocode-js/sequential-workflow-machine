import { BranchedStep, Branches, Definition, Step } from 'sequential-workflow-model';
import { createActivitySet } from '../../core';
import { createAtomActivityFromHandler } from '../atom-activity';
import { createParallelActivity } from './parallel-activity';
import { createWorkflowMachineBuilder } from '../../workflow-machine-builder';
import { branchName } from '../results';

interface ParallelTestGlobalState {
	logger: string;
}

interface LogStep extends Step {
	properties: {
		message: string;
	};
}

interface JobStep extends Step {
	properties: {
		job: string;
	};
}

interface ParallelStep extends BranchedStep {
	properties: {
		activeBranchNames: string[];
	};
}

function createLogStep(id: string): LogStep {
	return {
		id,
		componentType: 'task',
		name: `Log ${id}`,
		type: 'log',
		properties: {
			message: id
		}
	};
}

function createJobStep(id: string, job: string): JobStep {
	return {
		id,
		componentType: 'task',
		name: `Job ${id}`,
		type: 'job',
		properties: {
			job
		}
	};
}

function createParallelStep(id: string, activeBranchNames: string[], branches: Branches): ParallelStep {
	return {
		id,
		componentType: 'activity',
		name: 'Parallel',
		type: 'parallel',
		properties: { activeBranchNames },
		branches
	};
}

function createDefinition0(activeBranchNames: string[]) {
	return {
		sequence: [
			createLogStep('before'),
			createParallelStep('parallel', activeBranchNames, {
				threadAlfa: [createLogStep('alfa_0'), createLogStep('alfa_1'), createLogStep('alfa_2')],
				threadBeta: [createLogStep('beta_0'), createLogStep('beta_1')],
				threadGamma: [createLogStep('gamma_1')],
				threadDelta: []
			}),
			createLogStep('after')
		],
		properties: {}
	};
}

function createTest(definition: Definition) {
	const activitySet = createActivitySet<ParallelTestGlobalState>([
		createAtomActivityFromHandler<LogStep, ParallelTestGlobalState>('log', async (step, globalState) => {
			globalState.logger += `;${step.id};`;
			const delay = Math.ceil(20 * Math.random());
			await new Promise(resolve => setTimeout(resolve, delay));
		}),
		createAtomActivityFromHandler<JobStep, ParallelTestGlobalState>('job', async (step, globalState) => {
			globalState.logger += ';job;';
			if (step.properties.job === 'fail') {
				throw new Error('Job failed!');
			}
		}),
		createParallelActivity<ParallelStep, ParallelTestGlobalState>('parallel', {
			init: () => ({}),
			handler: async step => step.properties.activeBranchNames.map(branchName)
		})
	]);

	const builder = createWorkflowMachineBuilder(activitySet);
	const machine = builder.build(definition);

	const interpreter = machine.create({
		init: () => ({
			logger: ''
		})
	});

	return interpreter;
}

describe('ParallelActivity', () => {
	it('should iterate over all threads', done => {
		const interpreter = createTest(createDefinition0(['threadAlfa', 'threadBeta', 'threadGamma', 'threadDelta']));
		const currentStepIdsHistory: Record<string, number> = {};

		interpreter.onChange(() => {
			const stepIds = interpreter.getSnapshot().getCurrentStepIds();
			for (const stepId of stepIds) {
				if (Number.isFinite(currentStepIdsHistory[stepId])) {
					currentStepIdsHistory[stepId]++;
				} else {
					currentStepIdsHistory[stepId] = 1;
				}
			}
		});
		interpreter.onDone(() => {
			const snapshot = interpreter.getSnapshot();
			const logger = snapshot.globalState.logger;

			expect(currentStepIdsHistory['parallel']).toBe(13);
			expect(currentStepIdsHistory['alfa_0']).toBeGreaterThanOrEqual(1);
			expect(currentStepIdsHistory['alfa_1']).toBeGreaterThanOrEqual(1);
			expect(currentStepIdsHistory['alfa_2']).toBeGreaterThanOrEqual(1);
			expect(currentStepIdsHistory['beta_0']).toBeGreaterThanOrEqual(1);
			expect(currentStepIdsHistory['beta_1']).toBeGreaterThanOrEqual(1);
			expect(currentStepIdsHistory['gamma_1']).toBeGreaterThanOrEqual(1);
			expect(currentStepIdsHistory['after']).toBe(1);
			expect(currentStepIdsHistory['before']).toBe(1);

			expect(logger).toContain(';before;');
			expect(logger).toContain(';after;');
			const inside = extractBetween(logger, ';before;', ';after;');

			expect(inside).toContain(';alfa_0;');
			expect(inside).toContain(';alfa_1;');
			expect(inside).toContain(';alfa_2;');
			expect(inside).toContain(';beta_0;');
			expect(inside).toContain(';beta_1;');
			expect(inside).toContain(';gamma_1;');

			done();
		});
		interpreter.start();
	});

	it('should iterate over 2 threads', done => {
		const interpreter = createTest(createDefinition0(['threadBeta', 'threadGamma']));

		interpreter.onDone(() => {
			const snapshot = interpreter.getSnapshot();
			const logger = snapshot.globalState.logger;

			expect(logger).toContain(';before;');
			expect(logger).toContain(';after;');
			const inside = extractBetween(logger, ';before;', ';after;');

			expect(inside).toContain(';beta_0;');
			expect(inside).toContain(';beta_1;');
			expect(inside).toContain(';gamma_1;');

			done();
		});
		interpreter.start();
	});

	it('should finish even if the branch is empty', done => {
		const interpreter = createTest(createDefinition0(['threadDelta']));

		interpreter.onDone(() => {
			const snapshot = interpreter.getSnapshot();
			const logger = snapshot.globalState.logger;
			expect(logger).toBe(';before;;after;');
			done();
		});
		interpreter.start();
	});

	it('should finish with error if a step inside a branch fails', done => {
		const definition: Definition = {
			sequence: [
				createLogStep('before'),
				createParallelStep('parallel', ['thread0'], {
					thread0: [createLogStep('hello'), createJobStep('job', 'fail'), createLogStep('world')]
				}),
				createLogStep('after')
			],
			properties: {}
		};

		const interpreter = createTest(definition);

		interpreter.onDone(() => {
			const snapshot = interpreter.getSnapshot();
			const logger = snapshot.globalState.logger;

			expect(logger).toBe(';before;;hello;;job;');
			expect(snapshot.unhandledError?.message).toBe('Job failed!');

			expect(snapshot.isFailed()).toEqual(true);
			expect(snapshot.isInterrupted()).toEqual(false);
			expect(snapshot.isFinished()).toEqual(false);

			done();
		});
		interpreter.start();
	});

	it('should finish definition with multiple parallel sections', done => {
		const definition: Definition = {
			sequence: [
				createLogStep('before'),
				createParallelStep('red', ['red0', 'red1'], {
					red0: [
						createLogStep('red0_start'),
						createParallelStep('blue', ['blue0', 'blue1', 'blue2'], {
							blue0: [createLogStep('red0_blue0')],
							blue1: [createLogStep('red0_blue1')],
							blue2: [createLogStep('red0_blue2')]
						}),
						createLogStep('red0_end')
					],
					red1: [
						createLogStep('red1_start'),
						createParallelStep('green', ['green0', 'green1'], {
							green0: [createLogStep('red1_green0')],
							green1: [createLogStep('red1_green1')]
						}),
						createLogStep('red1_end')
					]
				}),
				createLogStep('after')
			],
			properties: {}
		};

		const interpreter = createTest(definition);

		interpreter.onDone(() => {
			const snapshot = interpreter.getSnapshot();
			const logger = snapshot.globalState.logger;

			expect(logger).toContain(';before;');
			expect(logger).toContain(';after;');

			const inside = extractBetween(logger, ';before;', ';after;');
			const red0 = extractBetween(inside, ';red0_start;', ';red0_end;');

			expect(red0).toContain(';red0_blue0;');
			expect(red0).toContain(';red0_blue1;');
			expect(red0).toContain(';red0_blue2;');

			const red1 = extractBetween(inside, ';red1_start;', ';red1_end;');
			expect(red1).toContain(';red1_green0;');
			expect(red1).toContain(';red1_green1;');

			expect(snapshot.isFailed()).toEqual(false);
			expect(snapshot.isFinished()).toEqual(true);
			expect(snapshot.isInterrupted()).toEqual(false);

			done();
		});
		interpreter.start();
	});
});

function extractBetween(log: string, start: string, end: string) {
	return log.split(start)[1].split(end)[0];
}
