// POLLIS: telemetry and crash reporting have been removed from this fork.
//
// The upstream julia-vscode extension shipped Application Insights with hardcoded
// instrumentation keys that transmitted usage data and crash reports to the
// julia-vscode team's Azure endpoints. None of that belongs in Pollis, so this
// module is now a no-op shim: every exported function keeps its original
// signature (so existing call sites compile unchanged) but nothing is sent
// anywhere. The only piece kept functional is the local crash-report pipe server,
// because the Julia process is handed its pipe name and would otherwise fail to
// connect; reports received on it are simply dropped (optionally logged to the
// dev console).

import * as net from 'net'
import { v4 as uuidv4 } from 'uuid'
import * as vscode from 'vscode'
import { generatePipeName } from './utils'

let g_jlcrashreportingpipename: string = null

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function init(context: vscode.ExtensionContext) {
    // No telemetry client is created. Intentionally empty.
}

export function handleNewCrashReport(name: string, message: string, stacktrace: string, cloudRole: string) {
    console.debug(`[julia] crash report dropped (telemetry disabled): ${cloudRole}/${name}: ${message}`)
}

export function handleNewCrashReportFromException(error: Error, cloudRole: string) {
    console.debug(`[julia] crash report dropped (telemetry disabled): ${cloudRole}`, error)
}

export function startLsCrashServer() {
    // Keep a listening pipe so the Julia side has a valid endpoint to connect to.
    // Anything received is parsed minimally and dropped (no network transmission).
    g_jlcrashreportingpipename = generatePipeName(uuidv4(), 'vsc-jl-cr')

    const server = net.createServer(function (connection) {
        let accumulatingBuffer = Buffer.alloc(0)

        connection.on('data', async function (c) {
            accumulatingBuffer = Buffer.concat([accumulatingBuffer, Buffer.from(c)])
        })

        connection.on('close', async function () {
            const replResponse = accumulatingBuffer.toString().split('\n')
            const errorMessageLines = parseInt(replResponse[2])
            const errorMessage = replResponse.slice(3, 3 + errorMessageLines).join('\n')
            const stacktrace = replResponse.slice(3 + errorMessageLines, replResponse.length - 1).join('\n')

            handleNewCrashReport(replResponse[1], errorMessage, stacktrace, replResponse[0])
        })
    })

    server.listen(g_jlcrashreportingpipename)
}

export function getCrashReportingPipename() {
    return g_jlcrashreportingpipename
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function traceEvent(message: string) {
    // Intentionally empty.
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function traceRequest(operationId, operationParentId, name, time, duration, cloudRole) {
    // Intentionally empty.
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function tracePackageLoadError(packagename, message) {
    // Intentionally empty.
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function traceTrace(msg: string) {
    // Intentionally empty.
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function setCurrentJuliaVersion(version: string) {
    // Intentionally empty.
}

export function flush() {
    // Intentionally empty.
}
