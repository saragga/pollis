// POLLIS: where the recorder of the runs of coding agents is (agentRecorder.ts, built beside the extension as
// dist/agentRecorder.js): `language-julia.pollisAgentRecorder` answers {node, script}, the program of the extension host,
// which runs as Node with ELECTRON_RUN_AS_NODE=1, and the recorder's script; {} when the script is not there. The pages
// of Compose > Orchestration start each agent through it (launchAgent in pollisAgents.ts).

import * as fs from 'fs'
import * as vscode from 'vscode'

export function activate(context: vscode.ExtensionContext) {
    context.subscriptions.push(
        vscode.commands.registerCommand('language-julia.pollisAgentRecorder', () => {
            const script = context.asAbsolutePath('dist/agentRecorder.js')
            return fs.existsSync(script) ? { node: process.execPath, script } : {}
        })
    )
}
