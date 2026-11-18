import esbuild from 'esbuild'

const production = process.argv.includes('--production')
const watch = process.argv.includes('--watch')

/**
 * @type {import('esbuild').Plugin}
 */
const esbuildProblemMatcherPlugin = {
    name: 'esbuild-problem-matcher',

    setup(build) {
        build.onStart(() => {
            console.log('[watch] build started')
        })
        build.onEnd((result) => {
            result.errors.forEach(({ text, location }) => {
                console.error(`✘ [ERROR] ${text}`)
                if (location == null) return
                console.error(`    ${location.file}:${location.line}:${location.column}:`)
            })
            console.log('[watch] build finished')
        })
    },
}

async function main() {
    const ctx = await esbuild.context({
        entryPoints: ['src/extension.ts', 'src/agentRecorder.ts'],
        bundle: true,
        format: 'cjs',
        minify: production,
        sourcemap: true,
        sourcesContent: false,
        platform: 'node',
        outdir: './dist',
        external: [
            'vscode',
            'applicationinsights-native-metrics',
            '@opentelemetry/instrumentation',
            '@azure/opentelemetry-instrumentation-azure-sdk',
        ],
        logLevel: 'warning',
        plugins: [esbuildProblemMatcherPlugin],
    })
    // Pollis: the notebook renderer of maps, which runs in the notebook's page as an ES module
    const rendererCtx = await esbuild.context({
        entryPoints: [{ in: 'src/renderers/pollisMapRenderer.mts', out: 'pollisMapRenderer' }],
        bundle: true,
        format: 'esm',
        minify: production,
        sourcemap: true,
        sourcesContent: false,
        platform: 'browser',
        outdir: './dist',
        logLevel: 'warning',
        plugins: [esbuildProblemMatcherPlugin],
    })
    for (const context of [ctx, rendererCtx]) {
        if (watch) {
            await context.watch()
        } else {
            await context.rebuild()
            await context.dispose()
        }
    }
}

main().catch((e) => {
    console.error(e)
    process.exit(1)
})
