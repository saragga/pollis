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
import { INodeMetadata } from '../common/node.types.js';
import { IModelReference, IModelNotebookSection } from '../common/model.types.js';
import { registerNodeWebviewHandlers } from '../handlers/node.handler.js';
import { getNodeHtml } from '../webviews/node.template.js';

const NODE_VIEW_TYPE = 'pollis.node';
const NODE_TITLE = 'Neural ODEs for System Identification';

const NODE_REFERENCES: IModelReference[] = [
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
		title: 'DiffEqFlux.jl: A Julia Library for Neural Differential Equations',
		authors: 'Rackauckas, Christopher; Ma, Yingbo; Martensen, Julius; Warner, Collin; Zubov, Kirill; Supekar, Rohit; Skinner, Dominic; Ramadhan, Ali; Edelman, Alan',
		year: 2019,
		journal: 'arXiv',
		doi: '10.48550/arXiv.1902.02376',
		openAccess: true,
	},
	{
		title: 'Universal Differential Equations for Scientific Machine Learning',
		authors: 'Rackauckas, Christopher; Ma, Yingbo; Dixit, Vaibhav; Guo, Xingjian; Innes, Mike; Revels, Jarrett; Nyberg, Joakim; Ivaturi, Vijay',
		year: 2020,
		journal: 'arXiv',
		doi: '10.48550/arXiv.2001.04385',
		openAccess: true,
	},
	{ separator: true, label: 'Textbooks' },
	{
		title: 'Deep Learning',
		authors: 'Goodfellow, Ian; Bengio, Yoshua; Courville, Aaron',
		year: 2016,
		journal: 'MIT Press',
		openAccess: false,
	},
	{
		title: 'Nonlinear Dynamics and Chaos',
		authors: 'Strogatz, Steven H.',
		year: 2015,
		journal: 'Westview Press (2nd ed.)',
		openAccess: false,
	},
	{ separator: true, label: 'Original Papers' },
	{
		title: 'Neural Ordinary Differential Equations',
		authors: 'Chen, Ricky T. Q.; Rubanova, Yulia; Bettencourt, Jesse; Duvenaud, David',
		year: 2018,
		journal: 'NeurIPS',
		doi: '10.48550/arXiv.1806.07366',
		openAccess: true,
	},
	{
		title: 'Latent ODEs for Irregularly-Sampled Time Series',
		authors: 'Rubanova, Yulia; Chen, Ricky T. Q.; Duvenaud, David',
		year: 2019,
		journal: 'NeurIPS',
		doi: '10.48550/arXiv.1907.03907',
		openAccess: true,
	},
];

export const NODE_NOTEBOOK_SECTIONS: IModelNotebookSection[] = [
	{
		label: '',
		notebooks: [
			{
				name: 'Basic Neural ODE',
				file: 'node/tutorial-01-basic.ipynb',
				bundled: true,
				description: 'Fit a NeuralODE to a two-dimensional spiral trajectory and recover the latent dynamics',
			},
			{
				name: 'Multivariate System',
				file: 'node/tutorial-02-multivariate.ipynb',
				bundled: true,
				description: 'Identify a higher-dimensional system from noisy observations using a deeper network architecture',
			},
			{
				name: 'Universal Differential Equations',
				file: 'node/tutorial-03-ude.ipynb',
				bundled: true,
				description: 'Combine known structure with a neural network term to learn unknown parts of the governing equations',
			},
		],
	},
];

const NODE_METADATA: INodeMetadata = {
	node: {
		packages: [
			{
				name: 'DiffEqFlux.jl',
				github: 'https://github.com/SciML/DiffEqFlux.jl',
				papers: [],
			},
		],
		notebookSections: NODE_NOTEBOOK_SECTIONS,
		notebooks: NODE_NOTEBOOK_SECTIONS.flatMap(s => s.notebooks),
		wikis: [
			{ name: 'Factsheet',      file: 'node/factsheet.md',      bundled: true },
			{ name: 'Overview',       file: 'node/overview.md',       bundled: true },
			{ name: 'Assumptions',    file: 'node/assumptions.md',    bundled: true },
			{ name: 'Diagnostics',    file: 'node/diagnostics.md',    bundled: true },
			{ name: 'Interpretation', file: 'node/interpretation.md', bundled: true },
			{ name: 'Decision Guide', file: 'node/decision-guide.md', bundled: true },
			{ separator: true, label: 'Neural ODEs' },
			{ name: 'Architecture',   file: 'node/architecture.md',   bundled: true },
			{ name: 'Training',       file: 'node/training.md',       bundled: true },
		],
		references: NODE_REFERENCES,
	},
};

export function openNodeWebview(
	webviewWorkbenchService: IWebviewWorkbenchService,
	openerService: IOpenerService,
	editorService: IEditorService,
	quickInputService: IQuickInputService,
	commandService: ICommandService,
	clipboardService: IClipboardService,
	notificationService: INotificationService,
): void {
	const webviewInput = webviewWorkbenchService.openWebview(
		{
			title: NODE_TITLE,
			options: { retainContextWhenHidden: true },
			contentOptions: { allowScripts: true },
			extension: undefined,
		},
		NODE_VIEW_TYPE,
		NODE_TITLE,
		undefined,
		{ group: undefined, preserveFocus: false }
	);

	webviewInput.webview.setHtml(getNodeHtml());

	registerNodeWebviewHandlers(
		webviewInput,
		NODE_METADATA,
		openerService,
		editorService,
		quickInputService,
		commandService,
		clipboardService,
		notificationService,
	);
}
