'use strict'

import * as sourcemapsupport from 'source-map-support'
import * as vscode from 'vscode'

import * as debugViewProvider from './debugger/debugConfig'
import { JuliaDebugFeature } from './debugger/debugFeature'
import * as documentation from './docbrowser/documentation'
import { CodeCellFeature } from './interactive/codecells'
import * as repl from './interactive/repl'
import { WorkspaceFeature } from './interactive/workspace'
import * as jlpkgenv from './jlpkgenv'
import { ExecutableFeature } from './executables'
import { LanguageClientFeature } from './languageClient'
import { JuliaNotebookFeature } from './notebook/notebookFeature'
import * as openpackagedirectory from './openpackagedirectory'
import * as packagepath from './packagepath'
import * as smallcommands from './smallcommands'
import * as telemetry from './telemetry'
import { setContext } from './utils'
import { JuliaGlobalDiagnosticOutputFeature } from './globalDiagnosticOutput'
import { JuliaCommands } from './juliaCommands'
import { installJuliaOrJuliaupTask } from './juliaupAutoInstall'
import { LmToolFeature } from './lmtool'

sourcemapsupport.install({ handleUncaughtExceptions: false })

export const increaseIndentPattern: RegExp =
    /^(\s*|.*=\s*|.*@\w*\s*)[\w\s]*(?:["'`][^"'`]*["'`])*[\w\s]*\b(if|while|for|function|macro|(mutable\s+)?struct|abstract\s+type|primitive\s+type|let|quote|try|begin|.*\)\s*do|else|elseif|catch|finally)\b(?!(?:.*\bend\b(\s*|\s*#.*)$)|(?:[^[]*\].*)$).*$/
export const decreaseIndentPattern: RegExp = /^\s*(end|else|elseif|catch|finally)\b.*$/

export async function activate(context: vscode.ExtensionContext) {
    console.debug('[julia activation] start language-julia extension')
    const activateStart = performance.now()

    telemetry.init(context)
    console.debug(`[julia activation] telemetry.init: ${(performance.now() - activateStart).toFixed(1)}ms`)

    try {
        setContext('julia.isActive', true)
        let t = performance.now()
        telemetry.traceEvent('activate')

        telemetry.startLsCrashServer()
        console.debug(`[julia activation] initial telemetry: ${(performance.now() - t).toFixed(1)}ms`)

        t = performance.now()
        const globalDiagnosticOutputFeature = new JuliaGlobalDiagnosticOutputFeature()
        context.subscriptions.push(globalDiagnosticOutputFeature)
        console.debug(`[julia activation] JuliaGlobalDiagnosticOutputFeature: ${(performance.now() - t).toFixed(1)}ms`)

        t = performance.now()
        const executableFeature = new ExecutableFeature(context)
        console.debug(`[julia activation] ExecutableFeature: ${(performance.now() - t).toFixed(1)}ms`)

        if (await executableFeature.hasJulia()) {
            executableFeature.setJuliaInstalled(true)
        }

        // Language settings
        vscode.languages.setLanguageConfiguration('julia', {
            indentationRules: {
                increaseIndentPattern: increaseIndentPattern,
                decreaseIndentPattern: decreaseIndentPattern,
            },
        })

        // Active features from other files

        t = performance.now()
        const languageClientFeature: LanguageClientFeature = new LanguageClientFeature(context, executableFeature)
        context.subscriptions.push(languageClientFeature)
        console.debug(`[julia activation] LanguageClientFeature: ${(performance.now() - t).toFixed(1)}ms`)

        t = performance.now()
        const compiledProvider = debugViewProvider.activate(context)
        console.debug(`[julia activation] debugViewProvider.activate: ${(performance.now() - t).toFixed(1)}ms`)

        context.subscriptions.push(executableFeature)

        t = performance.now()
        jlpkgenv.activate(context, executableFeature, languageClientFeature)
        console.debug(`[julia activation] jlpkgenv.activate: ${(performance.now() - t).toFixed(1)}ms`)

        t = performance.now()
        repl.activate(context, compiledProvider, executableFeature, languageClientFeature)
        console.debug(`[julia activation] repl.activate: ${(performance.now() - t).toFixed(1)}ms`)

        t = performance.now()
        documentation.activate(context)
        console.debug(`[julia activation] documentation.activate: ${(performance.now() - t).toFixed(1)}ms`)

        t = performance.now()
        smallcommands.activate(context)
        console.debug(`[julia activation] smallcommands.activate: ${(performance.now() - t).toFixed(1)}ms`)

        t = performance.now()
        packagepath.activate(context, executableFeature)
        console.debug(`[julia activation] packagepath.activate: ${(performance.now() - t).toFixed(1)}ms`)

        t = performance.now()
        openpackagedirectory.activate(context)
        console.debug(`[julia activation] openpackagedirectory.activate: ${(performance.now() - t).toFixed(1)}ms`)

        t = performance.now()
        context.subscriptions.push(new CodeCellFeature(context, compiledProvider))
        console.debug(`[julia activation] CodeCellFeature: ${(performance.now() - t).toFixed(1)}ms`)

        t = performance.now()
        const lmToolFeature = new LmToolFeature(context)
        context.subscriptions.push(lmToolFeature)
        console.debug(`[julia activation] LmToolFeature: ${(performance.now() - t).toFixed(1)}ms`)

        t = performance.now()
        const workspaceFeature = new WorkspaceFeature(context)
        context.subscriptions.push(workspaceFeature)
        console.debug(`[julia activation] WorkspaceFeature: ${(performance.now() - t).toFixed(1)}ms`)

        t = performance.now()
        const notebookFeature = new JuliaNotebookFeature(context, executableFeature, workspaceFeature, compiledProvider)
        context.subscriptions.push(notebookFeature)
        console.debug(`[julia activation] JuliaNotebookFeature: ${(performance.now() - t).toFixed(1)}ms`)

        t = performance.now()
        context.subscriptions.push(new JuliaDebugFeature(context, compiledProvider, executableFeature, notebookFeature))
        console.debug(`[julia activation] JuliaDebugFeature: ${(performance.now() - t).toFixed(1)}ms`)

        t = performance.now()
        context.subscriptions.push(new JuliaCommands(context, executableFeature))
        console.debug(`[julia activation] JuliaCommands: ${(performance.now() - t).toFixed(1)}ms`)

        // POLLIS: do not start LanguageServer.jl (SymbolServer's huge cache + the crashing
        // libpython indexing path). Language features will be provided by JETLS.jl instead.
        // languageClientFeature.startServer()

        // POLLIS: the upstream symbol-cache-download and telemetry-consent prompts have been
        // removed. Telemetry/crash reporting is disabled in this fork (see telemetry.ts).

        const api = {
            version: 6,
            async getEnvironment() {
                return await jlpkgenv.getAbsEnvPath()
            },
            async getJuliaupExecutable(tryInstall: boolean = true) {
                return await executableFeature.getJuliaupExecutable(tryInstall)
            },
            async getJuliaExecutable(tryInstall: boolean = true) {
                return await executableFeature.getExecutable(tryInstall)
            },
            async getJuliaPath() {
                console.warn('Julia extension for VSCode: `getJuliaPath` API is deprecated.')
                return (await executableFeature.getExecutable()).command
            },
            getPkgServer() {
                return vscode.workspace.getConfiguration('julia').get('packageServer')
            },
            async installJuliaOrJuliaup(customCommand?: string) {
                return await installJuliaOrJuliaupTask(executableFeature.taskRunner, customCommand)
            },
            executeInREPL: repl.executeInREPL,
        }

        console.debug(`[julia activation] total: ${(performance.now() - activateStart).toFixed(1)}ms`)

        return api
    } catch (err) {
        telemetry.handleNewCrashReportFromException(err, 'Extension')
        throw err
    }
}

// this method is called when your extension is deactivated
export function deactivate() {
    const promises = []

    promises.push(repl.deactivate())

    telemetry.flush()

    return Promise.all(promises)
}
