/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IOpenerService } from '../../../../../platform/opener/common/opener.js';
import { IEditorService } from '../../../../services/editor/common/editorService.js';
import { IClipboardService } from '../../../../../platform/clipboard/common/clipboardService.js';
import { INotificationService } from '../../../../../platform/notification/common/notification.js';
import { ICommandService } from '../../../../../platform/commands/common/commands.js';
import { IQuickInputService } from '../../../../../platform/quickinput/common/quickInput.js';
import { IWebviewWorkbenchService } from '../../../webviewPanel/browser/webviewWorkbenchService.js';
import { ISidMetadata } from '../common/sid.types.js';
import { IModelReference, IModelNotebookSection } from '../common/model.types.js';
import { registerSidWebviewHandlers } from '../handlers/sid.handler.js';
import { getSidHtml } from '../webviews/sid.template.js';

const SID_VIEW_TYPE = 'pollis.sid';
const SID_TITLE = 'Sampling from Intractable Distributions';

const SID_REFERENCES: IModelReference[] = [
	{ separator: true, label: 'Software' },
	{
		title: 'Julia: A Fresh Approach to Numerical Computing',
		authors: 'Bezanson, Jeff; Edelman, Alan; Karpinski, Stefan; Shah, Viral B.',
		year: 2017,
		journal: 'SIAM Review',
		doi: '10.1137/141000671',
		openAccess: false,
	},
	{
		title: 'Pigeons.jl: Distributed Sampling from Intractable Distributions',
		authors: 'Surjanovic, Nikola; Biron-Lattes, Miguel; Tiede, Paul; Syed, Saifuddin; Campbell, Trevor; Bouchard-Cote, Alexandre',
		year: 2023,
		journal: 'arXiv preprint',
		doi: '10.48550/arXiv.2308.09769',
		openAccess: true,
	},
	{ separator: true, label: 'Textbooks' },
	{
		title: 'Monte Carlo Statistical Methods',
		authors: 'Robert, Christian P.; Casella, George',
		year: 2004,
		journal: 'Springer (2nd ed.)',
		doi: '10.1007/978-1-4757-4145-2',
		openAccess: false,
	},
	{
		title: 'Handbook of Markov Chain Monte Carlo',
		authors: 'Brooks, Steve; Gelman, Andrew; Jones, Galin; Meng, Xiao-Li',
		year: 2011,
		journal: 'Chapman & Hall/CRC',
		doi: '10.1201/b10905',
		openAccess: false,
	},
	{ separator: true, label: 'Original Papers' },
	{
		title: 'Non-reversible parallel tempering: a scalable highly parallel MCMC scheme',
		authors: 'Syed, Saifuddin; Bouchard-Cote, Alexandre; Deligiannidis, George; Doucet, Arnaud',
		year: 2022,
		journal: 'Journal of the Royal Statistical Society: Series B',
		doi: '10.1111/rssb.12464',
		openAccess: true,
	},
	{
		title: 'Exchange Monte Carlo method and application to spin glass simulations',
		authors: 'Hukushima, Koji; Nemoto, Koji',
		year: 1996,
		journal: 'Journal of the Physical Society of Japan',
		doi: '10.1143/JPSJ.65.1604',
		openAccess: false,
	},
];

export const SID_NOTEBOOK_SECTIONS: IModelNotebookSection[] = [
	{
		label: '',
		notebooks: [
			{
				name: 'Basics',
				file: 'sid/tutorial-01-basics.ipynb',
				bundled: true,
				description: 'Introduction to Pigeons.jl: setup, custom log-potentials, and retrieving posterior samples',
			},
			{
				name: 'Custom Targets',
				file: 'sid/tutorial-02-custom-targets.ipynb',
				bundled: true,
				description: 'Defining custom target distributions for complex multimodal posteriors',
			},
			{
				name: 'Diagnostics',
				file: 'sid/tutorial-03-diagnostics.ipynb',
				bundled: true,
				description: 'PT swap rates, round-trip diagnostics, ESS, and normalising constant estimation',
			},
		],
	},
];

const SID_METADATA: ISidMetadata = {
	sid: {
		packages: [
			{
				name: 'Pigeons.jl',
				github: 'https://github.com/Julia-Tempering/Pigeons.jl',
				papers: [],
			},
		],
		notebookSections: SID_NOTEBOOK_SECTIONS,
		notebooks: SID_NOTEBOOK_SECTIONS.flatMap(s => s.notebooks),
		wikis: [
			{ name: 'Factsheet',      file: 'sid/factsheet.md',      bundled: true },
			{ name: 'Overview',       file: 'sid/overview.md',        bundled: true },
			{ name: 'Assumptions',    file: 'sid/assumptions.md',     bundled: true },
			{ name: 'Diagnostics',    file: 'sid/diagnostics.md',     bundled: true },
			{ name: 'Interpretation', file: 'sid/interpretation.md',  bundled: true },
			{ name: 'Decision Guide', file: 'sid/decision-guide.md',  bundled: true },
			{ separator: true, label: 'Algorithm Details' },
			{ name: 'Parallel Tempering', file: 'sid/parallel-tempering.md', bundled: true },
		],
		references: SID_REFERENCES,
	},
};

export function openSidWebview(
	webviewWorkbenchService: IWebviewWorkbenchService,
	openerService: IOpenerService,
	editorService: IEditorService,
	quickInputService: IQuickInputService,
	commandService: ICommandService,
	clipboardService: IClipboardService,
	notificationService: INotificationService,
	initialModel?: string,
): void {
	const webviewInput = webviewWorkbenchService.openWebview(
		{
			title: SID_TITLE,
			options: { retainContextWhenHidden: true },
			contentOptions: { allowScripts: true },
			extension: undefined,
		},
		SID_VIEW_TYPE,
		SID_TITLE,
		undefined,
		{ group: undefined, preserveFocus: false }
	);

	webviewInput.webview.setHtml(getSidHtml());

	registerSidWebviewHandlers(
		webviewInput,
		SID_METADATA,
		openerService,
		editorService,
		quickInputService,
		commandService,
		clipboardService,
		notificationService,
		initialModel,
	);
}
