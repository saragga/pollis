/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Antonio Saragga Seabra. All rights reserved.
 *  Proprietary and confidential. Unauthorised copying or distribution is prohibited.
 *--------------------------------------------------------------------------------------------*/

import { IOpenerService } from '../../../../../platform/opener/common/opener.js';
import { IEditorService } from '../../../../services/editor/common/editorService.js';
import { IClipboardService } from '../../../../../platform/clipboard/common/clipboardService.js';
import { INotificationService } from '../../../../../platform/notification/common/notification.js';
import { ICommandService } from '../../../../../platform/commands/common/commands.js';
import { IQuickInputService } from '../../../../../platform/quickinput/common/quickInput.js';
import { IWebviewWorkbenchService } from '../../../webviewPanel/browser/webviewWorkbenchService.js';
import { ISiMetadata } from '../common/si.types.js';
import { IModelReference, IModelNotebookSection } from '../common/model.types.js';
import { registerSiWebviewHandlers } from '../handlers/si.handler.js';
import { getSiHtml } from '../webviews/si.template.js';

const SI_VIEW_TYPE = 'pollis.si';
const SI_TITLE = 'System Identification Methods';

const SI_REFERENCES: IModelReference[] = [
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
		title: 'ControlSystems.jl: A Control Toolbox for Julia',
		authors: 'Bagge Carlson, Fredrik; Fält, Mattias; Heimerson, Albin; Troeng, Olof',
		year: 2021,
		journal: 'GitHub',
		openAccess: true,
	},
	{ separator: true, label: 'Textbooks' },
	{
		title: 'System Identification: Theory for the User',
		authors: 'Ljung, Lennart',
		year: 1999,
		journal: 'Prentice Hall (2nd ed.)',
		openAccess: false,
	},
	{
		title: 'Identification of Linear Systems',
		authors: 'Soderstrom, Torsten; Stoica, Petre',
		year: 1989,
		journal: 'Prentice Hall',
		openAccess: false,
	},
	{
		title: 'Subspace Methods for System Identification',
		authors: 'Katayama, Tohru',
		year: 2005,
		journal: 'Springer',
		doi: '10.1007/1-84628-158-X',
		openAccess: false,
	},
	{ separator: true, label: 'Original Papers' },
	{
		title: 'A New Algorithm for Optimal Filtering of Noisy Observations',
		authors: 'Van Overschee, Peter; De Moor, Bart',
		year: 1994,
		journal: 'Automatica',
		doi: '10.1016/0005-1098(94)90230-5',
		openAccess: false,
	},
	{
		title: 'N4SID: Subspace Algorithms for the Identification of Combined Deterministic-Stochastic Systems',
		authors: 'Van Overschee, Peter; De Moor, Bart',
		year: 1994,
		journal: 'Automatica',
		doi: '10.1016/0005-1098(94)90231-3',
		openAccess: false,
	},
	{
		title: 'Frequency-Domain System Identification Using Non-Parametric Noise Models',
		authors: 'Pintelon, Rik; Schoukens, Johan',
		year: 2012,
		journal: 'IEEE Transactions on Automatic Control',
		doi: '10.1109/TAC.2012.2199974',
		openAccess: false,
	},
];

export const SI_NOTEBOOK_SECTIONS: IModelNotebookSection[] = [
	{
		label: 'Parametric Methods',
		notebooks: [
			{
				name: 'ARX Identification',
				file: 'si/tutorial-01-arx.ipynb',
				bundled: true,
				description: 'Fitting ARX and ARMAX models, order selection via AIC/BIC, and residual analysis',
			},
			{
				name: 'State-Space (N4SID)',
				file: 'si/tutorial-02-statespace.ipynb',
				bundled: true,
				description: 'Subspace identification of state-space models with N4SID for SISO and MIMO systems',
			},
			{
				name: 'Robust Identification',
				file: 'si/tutorial-05-robust.ipynb',
				bundled: true,
				description: 'Robust identification using regularisation and uncertainty-aware model fitting',
			},
		],
	},
	{
		label: 'Frequency-Domain Methods',
		notebooks: [
			{
				name: 'Spectral Analysis',
				file: 'si/tutorial-03-spectral.ipynb',
				bundled: true,
				description: 'Non-parametric frequency-response estimation via spectral analysis and Welch periodogram',
			},
			{
				name: 'Impulse Response',
				file: 'si/tutorial-04-impulse-response.ipynb',
				bundled: true,
				description: 'Estimating impulse response functions and converting to frequency-domain representations',
			},
			{
				name: 'Time vs Frequency Domain',
				file: 'si/tutorial-06-time-vs-freq.ipynb',
				bundled: true,
				description: 'Comparing time-domain PEM and frequency-domain methods on the same identification problem',
			},
		],
	},
];

const SI_METADATA: ISiMetadata = {
	si: {
		packages: [
			{
				name: 'ControlSystemIdentification.jl',
				github: 'https://github.com/baggepinnen/ControlSystemIdentification.jl',
				papers: [],
			},
		],
		notebookSections: SI_NOTEBOOK_SECTIONS,
		notebooks: SI_NOTEBOOK_SECTIONS.flatMap(s => s.notebooks),
		wikis: [
			{ name: 'Factsheet',      file: 'si/factsheet.md',      bundled: true },
			{ name: 'Overview',       file: 'si/overview.md',        bundled: true },
			{ name: 'Assumptions',    file: 'si/assumptions.md',     bundled: true },
			{ name: 'Diagnostics',    file: 'si/diagnostics.md',     bundled: true },
			{ name: 'Interpretation', file: 'si/interpretation.md',  bundled: true },
			{ name: 'Decision Guide', file: 'si/decision-guide.md',  bundled: true },
			{ separator: true, label: 'Model Structures' },
			{ name: 'ARX / ARMAX',    file: 'si/arx-armax.md',       bundled: true },
			{ name: 'Subspace (N4SID)', file: 'si/n4sid.md',         bundled: true },
			{ name: 'Output Error',   file: 'si/output-error.md',    bundled: true },
		],
		references: SI_REFERENCES,
	},
};

export function openSiWebview(
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
			title: SI_TITLE,
			options: { retainContextWhenHidden: true },
			contentOptions: { allowScripts: true },
			extension: undefined,
		},
		SI_VIEW_TYPE,
		SI_TITLE,
		undefined,
		{ group: undefined, preserveFocus: false }
	);

	webviewInput.webview.setHtml(getSiHtml());

	registerSiWebviewHandlers(
		webviewInput,
		SI_METADATA,
		openerService,
		editorService,
		quickInputService,
		commandService,
		clipboardService,
		notificationService,
	);
}
