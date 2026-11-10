// POLLIS: Pollis.browse in Pollis.jl, from the REPL or a notebook, opens a page in Pollis' browser with the notification
// `pollis/browse`: an HTML file, such as the report of a profiler that the panels of Compose > Profiling write, or an
// http(s) link. The same page opened again reloads in its tab, so that a report run again replaces the one shown.

import * as vscode from 'vscode'
import { MessageConnection, NotificationType } from 'vscode-jsonrpc/node'

const notifyTypeBrowse = new NotificationType<{ page: string }>('pollis/browse')

/** Opens `page`, a path or an http(s) link, in Pollis' browser, in the tab that shows it already if there is one. */
async function browse(page: string) {
    const url = /^https?:\/\//i.test(page) ? page : vscode.Uri.file(page).toString()
    await vscode.commands.executeCommand('workbench.action.browser.open', { url, reuseUrlFilter: url })
}

/** Answers the notification `pollis/browse` of a Julia process: the REPL's or a notebook kernel's. */
export function answerBrowseRequests(connection: MessageConnection) {
    connection.onNotification(notifyTypeBrowse, ({ page }) => browse(page).catch((error) =>
        vscode.window.showErrorMessage(`Pollis could not open ${page}: ${error instanceof Error ? error.message : String(error)}`)
    ))
}
