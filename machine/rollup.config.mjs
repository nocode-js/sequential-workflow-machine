import dts from 'rollup-plugin-dts';
import typescript from 'rollup-plugin-typescript2';
import { nodeResolve } from '@rollup/plugin-node-resolve';

const ts = typescript({
	useTsconfigDeclarationDir: true
});

export default [
	{
		input: './src/index.ts',
		plugins: [ts],
		external: ['xstate'],
		output: [
			{
				file: './lib/index.cjs',
				format: 'cjs'
			}
		]
	},
	{
		input: './build/index.d.ts',
		output: [
			{
				file: './lib/index.d.ts',
				format: 'es'
			}
		],
		plugins: [dts()],
	},
	{
		input: './src/index.ts',
		plugins: [
			nodeResolve({
				browser: true,
			}),
			ts
		],
		output: [
			{
				file: './dist/index.umd.js',
				format: 'umd',
				name: 'sequentialWorkflowMachine'
			}
		]
	}
];
