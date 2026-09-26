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
import { ICmplxMetadata } from '../common/cmplx.types.js';
import { IModelReference } from '../common/model.types.js';
import { registerCmplxWebviewHandlers } from '../handlers/cmplx.handler.js';
import { getCmplxHtml } from '../webviews/cmplx.template.js';

const CMPLX_VIEW_TYPE = 'pollis.cmplx';
const CMPLX_TITLE = 'Complexity & Entropy';

const CMPLX_REFERENCES: IModelReference[] = [
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
		title: 'DynamicalSystems.jl: A Julia software library for chaos and nonlinear dynamics',
		authors: 'Datseris, George',
		year: 2018,
		journal: 'Journal of Open Source Software',
		doi: '10.21105/joss.00598',
		openAccess: true,
	},
	{ separator: true, label: 'Textbooks' },
	{
		title: 'Nonlinear Time Series Analysis',
		authors: 'Kantz, Holger; Schreiber, Thomas',
		year: 2004,
		journal: 'Cambridge University Press (2nd ed.)',
		openAccess: false,
	},
	{
		title: 'Elements of Information Theory',
		authors: 'Cover, Thomas M.; Thomas, Joy A.',
		year: 2006,
		journal: 'Wiley-Interscience (2nd ed.)',
		openAccess: false,
	},
	{ separator: true, label: 'Original Papers' },
	{
		title: 'Permutation Entropy: A Natural Complexity Measure for Time Series',
		authors: 'Bandt, Christoph; Pompe, Bernd',
		year: 2002,
		journal: 'Physical Review Letters',
		doi: '10.1103/PhysRevLett.88.174102',
		openAccess: false,
	},
	{
		title: 'Physiological time-series analysis using approximate entropy and sample entropy',
		authors: 'Richman, Joshua S.; Moorman, J. Randall',
		year: 2000,
		journal: 'American Journal of Physiology',
		doi: '10.1152/ajpheart.2000.278.6.H2039',
		openAccess: false,
	},
	{
		title: 'Surrogate data for hypothesis testing of physical systems',
		authors: 'Schreiber, Thomas; Schmitz, Andreas',
		year: 2000,
		journal: 'Physica D: Nonlinear Phenomena',
		doi: '10.1016/S0167-2789(99)00233-9',
		openAccess: false,
	},
];

const CMPLX_METADATA: ICmplxMetadata = {
	cmplx: {
		packages: [
			{
				name: 'ComplexityMeasures.jl',
				github: 'https://github.com/JuliaDynamics/ComplexityMeasures.jl',
				papers: [],
				videos: [
					{
						title: 'Julia in Academia',
						description: 'Overview of Julia for academic and scientific computing',
						url: 'https://www.youtube.com/watch?v=wPFPT-Ech2c',
					},
				],
			},
			{
				name: 'TimeseriesSurrogates.jl',
				github: 'https://github.com/JuliaDynamics/TimeseriesSurrogates.jl',
				papers: [],
				videos: [],
			},
		],
		notebooks: [
			{ name: 'Permutation Entropy',    file: 'dyn-cmplx/tutorial-01-permutation-entropy.ipynb', bundled: true, description: 'Compute permutation entropy for a time series to quantify ordinal complexity' },
			{ name: 'Sample Entropy',          file: 'dyn-cmplx/tutorial-02-sample-entropy.ipynb',      bundled: true, description: 'Estimate sample entropy to measure signal regularity without template self-matching' },
			{ name: 'Surrogate Testing',       file: 'dyn-cmplx/tutorial-03-surrogates.ipynb',          bundled: true, description: 'Generate surrogate time series and perform hypothesis tests for nonlinearity' },
		],
		wikis: [
			{ name: 'Factsheet',              file: 'dyn-cmplx/factsheet.md',           bundled: true },
			{ name: 'Overview',               file: 'dyn-cmplx/overview.md',             bundled: true },
			{ name: 'Assumptions',            file: 'dyn-cmplx/assumptions.md',          bundled: true },
			{ name: 'Diagnostics',            file: 'dyn-cmplx/diagnostics.md',          bundled: true },
			{ name: 'Interpretation',         file: 'dyn-cmplx/interpretation.md',       bundled: true },
			{ name: 'Decision Guide',         file: 'dyn-cmplx/decision-guide.md',       bundled: true },
			{ separator: true, label: 'Entropy Measures' },
			{ name: 'Permutation Entropy',    file: 'dyn-cmplx/permutation-entropy.md',  bundled: true },
			{ name: 'Sample Entropy',          file: 'dyn-cmplx/sample-entropy.md',       bundled: true },
			{ name: 'Surrogate Testing',       file: 'dyn-cmplx/surrogates.md',           bundled: true },
		],
		references: CMPLX_REFERENCES,
	},
};

export function openCmplxWebview(
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
			title: CMPLX_TITLE,
			options: { retainContextWhenHidden: true },
			contentOptions: { allowScripts: true },
			extension: undefined,
		},
		CMPLX_VIEW_TYPE,
		CMPLX_TITLE,
		undefined,
		{ group: undefined, preserveFocus: false }
	);

	webviewInput.webview.setHtml(getCmplxHtml());

	registerCmplxWebviewHandlers(
		webviewInput,
		CMPLX_METADATA,
		openerService,
		editorService,
		quickInputService,
		commandService,
		clipboardService,
		notificationService,
		initialModel,
	);
}
