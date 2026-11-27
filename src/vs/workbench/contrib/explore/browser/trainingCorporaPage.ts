/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { DisposableStore } from '../../../../base/common/lifecycle.js';
import { escape } from '../../../../base/common/strings.js';
import { URI } from '../../../../base/common/uri.js';
import { localize, localize2 } from '../../../../nls.js';
import { Action2, registerAction2 } from '../../../../platform/actions/common/actions.js';
import { ICommandService } from '../../../../platform/commands/common/commands.js';
import { IFileService } from '../../../../platform/files/common/files.js';
import { ServicesAccessor } from '../../../../platform/instantiation/common/instantiation.js';
import { INotificationService } from '../../../../platform/notification/common/notification.js';
import { IOpenerService } from '../../../../platform/opener/common/opener.js';
import { IStorageService } from '../../../../platform/storage/common/storage.js';
import { IEditorService } from '../../../services/editor/common/editorService.js';
import { IPathService } from '../../../services/path/common/pathService.js';
import { registerScaffoldPageHandlers } from '../../model/browser/handlers/scaffoldPage.handler.js';
import { TRANSCRIPTION_METADATA } from '../../model/browser/webviews/transcription.data.js';
import { buildWebviewHtml } from '../../model/browser/webviews/webviewScaffold.js';
import { INotebookEditorModelResolverService } from '../../notebook/common/notebookEditorModelResolverService.js';
import { INotebookKernelService } from '../../notebook/common/notebookKernelService.js';
import { WebviewInput } from '../../webviewPanel/browser/webviewEditorInput.js';
import { IWebviewWorkbenchService } from '../../webviewPanel/browser/webviewWorkbenchService.js';

// Training Corpora, from Explore > Transcription > Browse Training Corpora... (explore.contribution.ts). A page of the
// scaffold in the Minimal style: a table of the corpora of manuscripts with their transcriptions on which models of
// automatic transcription are trained and tested, each opening at its source. It shares the Learn More of the
// Transcription page (transcription.toml), whose Training Corpora wiki describes them.

/** The command that opens the page, from Explore > Transcription > Browse Training Corpora... */
export const TRAINING_CORPORA_PAGE_COMMAND_ID = 'pollis.transcription.trainingCorpora';

/** A corpus of the table. */
interface ICorpus {
	readonly name: string;
	/** Where it is published, opened in Pollis's browser. */
	readonly url: string;
	readonly where: string;
	readonly holds: string;
	readonly languages: string;
	readonly transcription: string;
	readonly size: string;
	readonly licence: string;
	/** The work that describes it, as cited in the Transcription page's references. */
	readonly describedIn: string;
}

function corpora(): ICorpus[] {
	return [
		{
			name: 'CATMuS Medieval',
			url: 'https://huggingface.co/datasets/CATMuS/medieval',
			where: 'Hugging Face',
			holds: localize('trainingCorpora.catmusHolds', "Lines of more than 200 manuscripts and incunabula from the 8th to the 16th century, with their page images and layout"),
			languages: localize('trainingCorpora.catmusLanguages', "10 languages, among them French, Latin, Spanish, Italian, Catalan, Dutch and English"),
			transcription: localize('trainingCorpora.catmusTranscription', "Graphematic, under the CATMuS guidelines"),
			size: '26.5 GB',
			licence: 'CC BY 4.0',
			describedIn: localize('trainingCorpora.catmusCite', "Clérice and 17 coauthors (2024)"),
		},
		{
			name: localize('trainingCorpora.icdarName', "ICDAR 2026 Competition Test Set"),
			url: 'https://zenodo.org/records/19884972',
			where: 'Zenodo',
			holds: localize('trainingCorpora.icdarHolds', "The test pages of the three tasks of the Competition on Multilingual Medieval Handwriting Recognition, with their transcriptions"),
			languages: localize('trainingCorpora.icdarLanguages', "Eight Romance languages (Task 1), Occitan (Task 2) and Czech (Task 3)"),
			transcription: localize('trainingCorpora.icdarTranscription', "Graphematic, under the CATMuS guidelines"),
			size: '236 MB',
			licence: 'CC BY 4.0',
			describedIn: localize('trainingCorpora.icdarCite', "Clérice and Kiessling (2026)"),
		},
		{
			name: 'TRIDIS',
			url: 'https://huggingface.co/datasets/magistermilitum/Tridis',
			where: 'Hugging Face',
			holds: localize('trainingCorpora.tridisHolds', "About 4,000 pages of documentary manuscripts, such as registers, charters, proceedings and accounts, from the 12th to the 17th century"),
			languages: localize('trainingCorpora.tridisLanguages', "Latin, French, Spanish, German and Dutch, mainly from Spain, France and Germany"),
			transcription: localize('trainingCorpora.tridisTranscription', "Semi-diplomatic: abbreviations expanded, punctuation and letter forms normalised"),
			size: '33.3 GB',
			licence: 'MIT',
			describedIn: localize('trainingCorpora.tridisCite', "Torres Aguilar (2025)"),
		},
		{
			name: localize('trainingCorpora.peroName', "PERO Layout Dataset"),
			url: 'https://zenodo.org/records/19184850',
			where: 'Zenodo',
			holds: localize('trainingCorpora.peroHolds', "Pages of historical documents with their layout, for training and testing layout analysis"),
			languages: '—',
			transcription: '—',
			size: '1.6 GB',
			licence: 'CC BY 4.0',
			describedIn: localize('trainingCorpora.peroCite', "Kodym and Hradiš (2021)"),
		},
	];
}

type TrainingCorporaMessage =
	| { readonly command: 'open'; readonly index: number };

/** The page, when it is open. */
let openPage: WebviewInput | undefined;

async function openTrainingCorporaPage(accessor: ServicesAccessor): Promise<void> {
	const webviewWorkbenchService = accessor.get(IWebviewWorkbenchService);
	const commandService = accessor.get(ICommandService);
	const openerService = accessor.get(IOpenerService);
	const editorService = accessor.get(IEditorService);
	const notificationService = accessor.get(INotificationService);
	const notebookEditorModelResolverService = accessor.get(INotebookEditorModelResolverService);
	const notebookKernelService = accessor.get(INotebookKernelService);
	const fileService = accessor.get(IFileService);
	const pathService = accessor.get(IPathService);
	const storageService = accessor.get(IStorageService);

	if (openPage && !openPage.isDisposed()) {
		webviewWorkbenchService.revealWebview(openPage, openPage.group ?? -1, false);
		return;
	}
	const title = localize('trainingCorpora.title', "Training Corpora");
	const webviewInput = webviewWorkbenchService.openWebview(
		{
			title,
			options: { retainContextWhenHidden: true },
			contentOptions: { allowScripts: true, localResourceRoots: [] },
			extension: undefined,
		},
		'pollis.transcription.trainingCorpora',
		title,
		undefined,
		{ group: undefined, preserveFocus: false }
	);
	openPage = webviewInput;
	webviewInput.webview.setHtml(pageHtml());
	const disposables = new DisposableStore();
	disposables.add(registerScaffoldPageHandlers(webviewInput, 'transcription', title, TRANSCRIPTION_METADATA.transcription, openerService, editorService, commandService, notificationService, notebookEditorModelResolverService, notebookKernelService, fileService, pathService, storageService));
	disposables.add(webviewInput.webview.onDidDispose(() => {
		openPage = undefined;
		disposables.dispose();
	}));

	const list = corpora();
	disposables.add(webviewInput.webview.onMessage(async (e: { message: TrainingCorporaMessage }) => {
		const message = e.message;
		if (message.command === 'open' && typeof message.index === 'number') {
			const corpus = list[message.index];
			if (corpus) {
				await openerService.open(URI.parse(corpus.url));
			}
		}
	}));
}

function pageHtml(): string {
	const text = {
		title: localize('trainingCorpora.title', "Training Corpora"),
		intro: localize('trainingCorpora.intro', "Corpora of manuscripts with their transcriptions made by hand, on which models of automatic transcription are trained and tested. Each opens at its source, from which it is downloaded."),
		hint: localize('trainingCorpora.hint', "A model reads best the text transcribed as its training corpus was: graphematic, with abbreviations as written, or semi-diplomatic, with abbreviations expanded. A model is tested on pages it was not trained on, such as those of the competition's test set."),
		corpus: localize('trainingCorpora.corpus', "Corpus"),
		holds: localize('trainingCorpora.holds', "What It Holds"),
		languages: localize('trainingCorpora.languages', "Languages"),
		transcription: localize('trainingCorpora.transcription', "Transcription"),
		size: localize('trainingCorpora.size', "Size"),
		licence: localize('trainingCorpora.licence', "Licence"),
		describedIn: localize('trainingCorpora.describedIn', "Described In"),
	};
	const rows = corpora().map((corpus, index) => `
				<tr>
					<td><a href="#" data-index="${index}">${escape(corpus.name)}</a><div class="tc-where">${escape(corpus.where)}</div></td>
					<td>${escape(corpus.holds)}</td>
					<td>${escape(corpus.languages)}</td>
					<td>${escape(corpus.transcription)}</td>
					<td class="tc-nowrap">${escape(corpus.size)}</td>
					<td class="tc-nowrap">${escape(corpus.licence)}</td>
					<td>${escape(corpus.describedIn)}</td>
				</tr>`).join('');
	return buildWebviewHtml({
		title: text.title,
		omitPoweredBy: true,
		introHtml: text.intro,
		extraCss: `
		.container { max-width: 1200px; }
		.trainingCorpora .hint { color: var(--vscode-descriptionForeground); margin: 8px 0 12px 0; line-height: 1.4; max-width: 900px; }
		.trainingCorpora table { width: 100%; border-collapse: collapse; }
		.trainingCorpora th, .trainingCorpora td { text-align: left; vertical-align: top; padding: 6px 10px 6px 0; border-bottom: 1px solid var(--vscode-panel-border); }
		.trainingCorpora th { font-weight: 600; white-space: nowrap; }
		.trainingCorpora a { color: var(--vscode-textLink-foreground); text-decoration: none; font-weight: 600; }
		.trainingCorpora a:hover { text-decoration: underline; }
		.trainingCorpora .tc-where { color: var(--vscode-descriptionForeground); font-size: 0.92em; }
		.trainingCorpora .tc-nowrap { white-space: nowrap; }
`,
		bodyHtml: `
		<div class="trainingCorpora">
			<p class="hint">${escape(text.hint)}</p>
			<table>
				<thead><tr>
					<th>${escape(text.corpus)}</th><th>${escape(text.holds)}</th><th>${escape(text.languages)}</th><th>${escape(text.transcription)}</th><th>${escape(text.size)}</th><th>${escape(text.licence)}</th><th>${escape(text.describedIn)}</th>
				</tr></thead>
				<tbody>${rows}
				</tbody>
			</table>
		</div>
`,
		pageScriptJs: `
	document.querySelectorAll('.trainingCorpora a[data-index]').forEach(link => link.addEventListener('click', event => {
		event.preventDefault();
		vscode.postMessage({ command: 'open', index: Number(link.dataset.index) });
	}));
`,
	});
}

registerAction2(class extends Action2 {
	constructor() {
		super({
			id: TRAINING_CORPORA_PAGE_COMMAND_ID,
			title: localize2('trainingCorpora.action', "Browse Training Corpora"),
			category: localize2('trainingCorpora.category', "Explore"),
			f1: true,
		});
	}
	run(accessor: ServicesAccessor): Promise<void> {
		return openTrainingCorporaPage(accessor);
	}
});
