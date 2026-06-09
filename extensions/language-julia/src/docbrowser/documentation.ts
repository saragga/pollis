import markdownit from 'markdown-it'
import * as path from 'path'
import * as vscode from 'vscode'
import { constructCommandString, onEvent, registerCommand } from '../utils'
import * as repl from '../interactive/repl'

const DOC_NO_REPL_MESSAGE =
    'Documentation is looked up from the Julia REPL. Start the Julia REPL (and load the relevant packages), then search again.'

function openArgs(href: string) {
    const matches = href.match(/^((\w+:\/\/)?.+?)(?:[:#](\d+))?$/)
    let uri
    let line
    if (matches[1] && matches[3] && matches[2] === undefined) {
        uri = matches[1]
        line = parseInt(matches[3])
    } else {
        uri = vscode.Uri.parse(matches[1])
    }
    return { uri, line }
}

const md = new markdownit()
    .use(
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        require('@traptitech/markdown-it-katex'),
        {
            output: 'html',
        }
    )
    .use(
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        require('markdown-it-footnote')
    )

// add custom validator to allow for file:// links
const BAD_PROTO_RE = /^(vbscript|javascript|data):/
const GOOD_DATA_RE = /^data:image\/(gif|png|jpeg|webp);/
md.validateLink = (url) => {
    // url should be normalized at this point, and existing entities are decoded
    const str = url.trim().toLowerCase()

    return BAD_PROTO_RE.test(str) ? (GOOD_DATA_RE.test(str) ? true : false) : true
}

md.renderer.rules.link_open = (tokens, idx, options, _env, self) => {
    const aIndex = tokens[idx].attrIndex('href')

    if (aIndex >= 0 && tokens[idx].attrs[aIndex][1] === '@ref' && tokens.length > idx + 1) {
        const commandUri = constructCommandString('language-julia.search-word', { searchTerm: tokens[idx + 1].content })
        tokens[idx].attrs[aIndex][1] = vscode.Uri.parse(commandUri).toString()
    } else if (aIndex >= 0 && tokens.length > idx + 1) {
        const href = tokens[idx + 1].content
        const { uri, line } = openArgs(href)
        let commandUri
        if (line === undefined) {
            commandUri = constructCommandString('vscode.open', uri)
        } else {
            commandUri = constructCommandString('language-julia.openFile', { path: uri, line })
        }
        tokens[idx].attrs[aIndex][1] = commandUri
    }

    return self.renderToken(tokens, idx, options)
}

export function activate(context: vscode.ExtensionContext) {
    const provider = new DocumentationViewProvider(context)

    context.subscriptions.push(
        registerCommand('language-julia.show-documentation-pane', async () => await provider.showDocumentationPane()),
        registerCommand('language-julia.show-documentation', async () => await provider.showDocumentation()),
        registerCommand('language-julia.browse-back-documentation', async () => provider.browseBack()),
        registerCommand('language-julia.browse-forward-documentation', async () => provider.browseForward()),
        registerCommand('language-julia.search-word', async (params: { searchTerm: string }) =>
            provider.findHelp(params)
        ),
        vscode.window.registerWebviewViewProvider('julia-documentation', provider)
    )
}

class DocumentationViewProvider implements vscode.WebviewViewProvider {
    private view?: vscode.WebviewView

    private backStack = Array<string>() // also keep current page
    private forwardStack = Array<string>()

    constructor(private context: vscode.ExtensionContext) {}

    resolveWebviewView(view: vscode.WebviewView) {
        this.view = view

        view.webview.options = {
            enableScripts: true,
            enableCommandUris: true,
        }
        view.webview.html = this.createWebviewHTML(
            'Search for documentation above, or place the cursor on a Julia symbol and run **Julia: Show Documentation**. Results come from the running Julia REPL.'
        )

        onEvent(view.webview.onDidReceiveMessage, (msg) => {
            if (msg.type === 'search') {
                this.showDocumentationFromWord(msg.query)
            } else {
                console.error('unknown message received')
            }
        })
    }

    findHelp(params: { searchTerm: string }) {
        this.showDocumentationFromWord(params.searchTerm)
    }

    async showDocumentationPane() {
        if (this.view?.show === undefined) {
            // this forces the webview to be resolved, but changes focus:
            await vscode.commands.executeCommand('julia-documentation.focus')
        }
        this.view?.show(true)
    }

    async showDocumentationFromWord(word: string) {
        await this.showDocumentationPane()
        if (!repl.isConnected()) {
            // The REPL is started on demand by getDocumentationFromWord; show feedback meanwhile.
            this.setTransientHTML('Starting the Julia REPL…')
        }

        const docAsMD = await this.getDocumentationFromWord(word)
        if (docAsMD === undefined) {
            this.setTransientHTML(DOC_NO_REPL_MESSAGE)
            return
        }
        const content = docAsMD.trim() === '' ? `No documentation found for \`${word}\`.` : docAsMD
        this.setHTML(this.createWebviewHTML(content))
    }

    async getDocumentationFromWord(word: string): Promise<string | undefined> {
        return await repl.getDocFromWord(word)
    }

    async showDocumentation() {
        const editor = vscode.window.activeTextEditor
        if (!editor) {
            return
        }

        const word = this.getWordAtCursor(editor)
        this.forwardStack = [] // initialize forward page stack for manual search
        await this.showDocumentationPane()

        if (!word) {
            this.setTransientHTML('Place the cursor on a Julia symbol to look up its documentation.')
            return
        }
        if (!repl.isConnected()) {
            this.setTransientHTML('Starting the Julia REPL…')
        }

        const docAsMD = await this.getDocumentationFromWord(word)
        if (docAsMD === undefined) {
            this.setTransientHTML(DOC_NO_REPL_MESSAGE)
            return
        }
        const content = docAsMD.trim() === '' ? `No documentation found for \`${word}\`.` : docAsMD
        this.setHTML(this.createWebviewHTML(content))
    }

    private setTransientHTML(markdown: string) {
        // Render an info/status message without pushing it onto the browse history.
        if (this.view) {
            this.view.webview.html = this.createWebviewHTML(markdown)
        }
    }

    private getWordAtCursor(editor: vscode.TextEditor): string | undefined {
        // Match Julia identifiers including macros (@time) and qualified names (Base.sort!).
        const range = editor.document.getWordRangeAtPosition(
            editor.selection.start,
            /@?[A-Za-z_][\w!]*(?:\.[A-Za-z_][\w!]*)*/
        )
        return range ? editor.document.getText(range) : undefined
    }

    createWebviewHTML(docAsMD: string) {
        const docAsHTML = md.render(docAsMD)

        const extensionPath = this.context.extensionPath

        const googleFontscss = this.view.webview.asWebviewUri(
            vscode.Uri.file(path.join(extensionPath, 'libs', 'google_fonts', 'css'))
        )
        const fontawesomecss = this.view.webview.asWebviewUri(
            vscode.Uri.file(path.join(extensionPath, 'libs', 'fontawesome', 'fontawesome.min.css'))
        )
        const solidcss = this.view.webview.asWebviewUri(
            vscode.Uri.file(path.join(extensionPath, 'libs', 'fontawesome', 'solid.min.css'))
        )
        const brandscss = this.view.webview.asWebviewUri(
            vscode.Uri.file(path.join(extensionPath, 'libs', 'fontawesome', 'brands.min.css'))
        )
        const documenterStylesheetcss = this.view.webview.asWebviewUri(
            vscode.Uri.file(path.join(extensionPath, 'libs', 'documenter', 'documenter-vscode.css'))
        )
        const katexcss = this.view.webview.asWebviewUri(
            vscode.Uri.file(path.join(extensionPath, 'libs', 'katex', 'katex.min.css'))
        )

        const webfontjs = this.view.webview.asWebviewUri(
            vscode.Uri.file(path.join(extensionPath, 'libs', 'webfont', 'webfont.js'))
        )

        return `
    <html lang="en" class='theme--documenter-vscode'>

    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Julia Documentation Pane</title>
        <link href=${googleFontscss} rel="stylesheet" type="text/css" />
        <link href=${fontawesomecss} rel="stylesheet" type="text/css" />
        <link href=${solidcss} rel="stylesheet" type="text/css" />
        <link href=${brandscss} rel="stylesheet" type="text/css" />
        <link href=${katexcss} rel="stylesheet" type="text/css" />
        <link href=${documenterStylesheetcss} rel="stylesheet" type="text/css">

        <script type="text/javascript">
            WebFontConfig = {
                custom: {
                    families: ['KaTeX_AMS', 'KaTeX_Caligraphic:n4,n7', 'KaTeX_Fraktur:n4,n7','KaTeX_Main:n4,n7,i4,i7', 'KaTeX_Math:i4,i7', 'KaTeX_Script','KaTeX_SansSerif:n4,n7,i4', 'KaTeX_Size1', 'KaTeX_Size2', 'KaTeX_Size3', 'KaTeX_Size4', 'KaTeX_Typewriter'],
                    urls: ['${katexcss}']
                },
            }
        </script>

        <style>
        html, body {
            max-width: 100%;
            min-width: 0 !important;
            margin: 0;
            box-sizing: border-box;
            overflow-x: hidden;
        }
        body {
            word-break: normal;
            overflow-wrap: break-word;
        }
        .docs-main, .content {
            max-width: 100%;
            box-sizing: border-box;
        }
        .content p, .content li, .content h1, .content h2, .content h3, .content h4 {
            overflow-wrap: anywhere;
            word-break: break-word;
        }
        /* Wrap fenced/inline code instead of overflowing. Must out-specify and override the
           documenter theme, which forces "white-space: pre; overflow-x: auto" on .content pre. */
        html.theme--documenter-vscode pre,
        html.theme--documenter-vscode .content pre,
        .content pre {
            white-space: pre-wrap !important;
            word-wrap: break-word !important;
            word-break: break-word;
            overflow-wrap: anywhere;
            overflow-x: hidden !important;
            max-width: 100%;
        }
        html.theme--documenter-vscode pre code,
        html.theme--documenter-vscode .content pre code,
        .content pre code,
        .content code {
            white-space: pre-wrap !important;
            word-break: break-word;
            overflow-wrap: anywhere;
        }
        .content table {
            display: block;
            max-width: 100%;
            overflow-x: auto;
        }
        body:active {
            outline: 1px solid var(--vscode-focusBorder);
        }
        .search {
            position: fixed;
            background-color: var(--vscode-sideBar-background);
            width: 100%;
            padding: 5px;
            display: flex;
            z-index: 2;
        }
        .search input[type="text"] {
            width: 100%;
            background-color: var(--vscode-input-background);
            border: none;
            outline: none;
            color: var(--vscode-input-foreground);
            padding: 4px;
        }
        .search input[type="text"]:focus {
            outline: 1px solid var(--vscode-editorWidget-border);
        }
        button {
            width: 30px;
            margin: 0 5px 0 0;
            display: inline;
            border: none;
            box-sizing: border-box;
            padding: 5px 7px;
            text-align: center;
            cursor: pointer;
            justify-content: center;
            align-items: center;
            background-color: var(--vscode-button-background);
            color: var(--vscode-button-foreground);
            font-family: var(--vscode-font-family);
        }
        button:hover {
            background-color: var(--vscode-button-hoverBackground);
        }

        button:focus {
            outline: 1px solid var(--vscode-focusBorder);
            outline-offset: 0px;
        }
        </style>

        <script src=${webfontjs}></script>
    </head>

    <body>
        <div class="search">
            <input id="search-input" type="text" placeholder="Search"></input>
        </div>
        <div class="docs-main" style="padding: 50px 1em 1em 1em">
            <article class="content">
                ${docAsHTML}
            </article>
        </div>
        <script>
            const vscode = acquireVsCodeApi()

            function search(val) {
                if (val) {
                    vscode.postMessage({
                        type: 'search',
                        query: val
                    })
                }
            }
            function onKeyDown(ev) {
                if (ev && ev.keyCode === 13) {
                    const val = document.getElementById('search-input').value
                    search(val)
                }
            }
            document.getElementById('search-input').addEventListener('keydown', onKeyDown)
        </script>
    </body>

    </html>
    `
    }

    setHTML(html: string) {
        // set current stack
        this.backStack.push(html)

        if (this.view) {
            this.view.webview.html = html
        }
    }

    isBrowseBackAvailable() {
        return this.backStack.length > 1
    }

    isBrowseForwardAvailable() {
        return this.forwardStack.length > 0
    }

    browseBack() {
        if (!this.isBrowseBackAvailable()) {
            return
        }

        const current = this.backStack.pop()
        this.forwardStack.push(current)

        this.setHTML(this.backStack.pop())
    }

    browseForward() {
        if (!this.isBrowseForwardAvailable()) {
            return
        }

        this.setHTML(this.forwardStack.pop())
    }
}
