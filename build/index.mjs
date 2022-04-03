import { build } from 'esbuild'

build({
    entryPoints: ['src/index.ts'],
    outdir: 'dist',
    platform: 'node',
    bundle: true,
    target: ['node10'],
}).catch(console.log)
