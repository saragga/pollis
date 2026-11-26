// POLLIS: Pollis.browse in Pollis.jl, from the REPL or a notebook, opens a page in Pollis' browser with the notification
// `pollis/browse`: an HTML file, such as the report of a profiler that the panels of Compose > Profiling write, or an
// http(s) link. The same page opened again reloads in its tab, so that a report run again replaces the one shown.

import * as vscode from 'vscode'
import { MessageConnection, NotificationType } from 'vscode-jsonrpc/node'

/**
 * Pages to go through in one tab with Previous Page and Next Page, such as the images of the leaves of a manuscript: the
 * address of each, the one to open at (from 1), the tab's title with `{page}` for the number of a page and `{label}` for
 * its label, the labels, and what Save on the browser's bar runs.
 */
interface IBrowsePages {
    readonly urls: string[]
    readonly page: number
    readonly title?: string
    readonly labels?: string[]
    /** The field of a step of the page that opened the pages, and its value, for Save on the browser's bar. */
    readonly save?: { readonly input: string, readonly value: string }
}

const notifyTypeBrowse = new NotificationType<{ page: string, pages?: IBrowsePages }>('pollis/browse')

/**
 * Opens `page`, a path or an http(s) link, in Pollis' browser, in the tab that shows it already if there is one, else in a
 * new tab after the last one, so that pages opened one after another keep their order. With `pages`, the tab goes
 * through them, and the same pages opened again open in their tab.
 */
export async function browse(page: string, pages?: IBrowsePages) {
    const address = (link: string) => /^https?:\/\//i.test(link) ? link : vscode.Uri.file(link).toString()
    const url = address(page)
    if (!pages || !pages.urls.length) {
        await vscode.commands.executeCommand('workbench.action.browser.open', { url, reuseUrlFilter: url, atEnd: true })
        return
    }
    const urls = pages.urls.map(address)
    await vscode.commands.executeCommand('workbench.action.browser.open', {
        url, atEnd: true, reuseKey: `pollis-pages:${urls[0]}`,
        pages: { url: urls[0], urls, first: 1, last: urls.length, page: Math.min(Math.max(1, Math.round(pages.page)), urls.length), title: pages.title, labels: pages.labels, save: pages.save },
    })
}

/** Answers the notification `pollis/browse` of a Julia process: the REPL's or a notebook kernel's. */
export function answerBrowseRequests(connection: MessageConnection) {
    connection.onNotification(notifyTypeBrowse, ({ page, pages }) => browse(page, pages).catch((error) =>
        vscode.window.showErrorMessage(`Pollis could not open ${page}: ${error instanceof Error ? error.message : String(error)}`)
    ))
}
