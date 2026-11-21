import esbuild from 'esbuild'
import { cpSync } from 'node:fs'

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
    // Pollis: the script of the page Pollis.jl writes for a map in Pollis' browser, which runs as a plain script
    const pageCtx = await esbuild.context({
        entryPoints: [{ in: 'src/interactive/pollisMapPage.ts', out: 'pollisMapPage' }],
        bundle: true,
        format: 'iife',
        minify: production,
        sourcemap: true,
        sourcesContent: false,
        platform: 'browser',
        outdir: './dist',
        logLevel: 'warning',
        plugins: [esbuildProblemMatcherPlugin],
    })
    // Pollis: a notebook's page loads files only from the folder of a renderer's entry point, so the libraries the map
    // renderer loads, with their licences, are copied beside it, into dist/libs
    for (const lib of ['maplibre', 'mapillary']) {
        cpSync(`libs/${lib}`, `dist/libs/${lib}`, { recursive: true })
    }
    for (const context of [ctx, rendererCtx, pageCtx]) {
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
