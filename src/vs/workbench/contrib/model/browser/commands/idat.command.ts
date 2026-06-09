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
import { IIdatMetadata } from '../common/idat.types.js';
import { IModelReference, IModelNotebookSection } from '../common/model.types.js';
import { registerIdatWebviewHandlers } from '../handlers/idat.handler.js';
import { getIdatHtml } from '../webviews/idat.template.js';

const IDAT_VIEW_TYPE = 'pollis.idat';
const IDAT_TITLE = 'Interpolate Data';

const IDAT_REFERENCES: IModelReference[] = [
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
		title: 'Interpolations.jl: Fast, Flexible Interpolations',
		authors: 'Holy, Tim; others',
		year: 2024,
		journal: 'GitHub',
		url: 'https://github.com/JuliaMath/Interpolations.jl',
		openAccess: true,
	},
	{
		title: 'Dierckx.jl: Spline Fitting for Julia',
		authors: 'Barbary, Kyle',
		year: 2018,
		journal: 'GitHub',
		url: 'https://github.com/kbarbary/Dierckx.jl',
		openAccess: true,
	},
	{ separator: true, label: 'Textbooks' },
	{
		title: 'A Practical Guide to Splines',
		authors: 'de Boor, Carl',
		year: 2001,
		journal: 'Springer (revised ed.)',
		doi: '10.1007/978-1-4612-6333-3',
		openAccess: false,
	},
	{
		title: 'Numerical Methods for Scientists and Engineers',
		authors: 'Hamming, Richard W.',
		year: 1987,
		journal: 'Dover Publications (2nd ed.)',
		url: 'https://store.doverpublications.com/0486652416.html',
		openAccess: false,
	},
	{
		title: 'Numerical Analysis',
		authors: 'Burden, Richard L.; Faires, J. Douglas; Burden, Annette M.',
		year: 2015,
		journal: 'Cengage Learning (10th ed.)',
		url: 'https://www.cengage.com/c/numerical-analysis-10e-burden',
		openAccess: false,
	},
	{ separator: true, label: 'Original Papers' },
	{
		title: 'On Calculating with B-Splines',
		authors: 'de Boor, Carl',
		year: 1972,
		journal: 'Journal of Approximation Theory',
		doi: '10.1016/0021-9045(72)90080-9',
		openAccess: false,
	},
	{
		title: 'A Smoothing Spline Based on a Geodesic Metric',
		authors: 'Dierckx, Paul',
		year: 1982,
		journal: 'Journal of Computational and Applied Mathematics',
		doi: '10.1016/0377-0427(82)90060-3',
		openAccess: false,
	},
];

export const IDAT_NOTEBOOK_SECTIONS: IModelNotebookSection[] = [
	{
		label: 'Interpolate Data',
		notebooks: [
			{ name: '1D Interpolation',     file: 'idat/tutorial-01-1d.ipynb',         bundled: true, description: 'Linear and cubic spline interpolation on irregular knots with Interpolations.jl' },
			{ name: 'B-Spline Grids',       file: 'idat/tutorial-02-bspline.ipynb',    bundled: true, description: 'Interpolate regular grid data in 1D and 2D with BSpline and scale()' },
			{ name: 'Dierckx Fitting',      file: 'idat/tutorial-03-dierckx.ipynb',    bundled: true, description: 'Fit smooth splines to scattered data and evaluate derivatives with Dierckx.jl' },
			{ name: 'Extrapolation',        file: 'idat/tutorial-04-extrapolation.ipynb', bundled: true, description: 'Control out-of-range behaviour: Throw, Flat, Linear, and Periodic boundary conditions' },
		],
	},
];

const IDAT_METADATA: IIdatMetadata = {
	idat: {
		packages: [
			{
				name: 'Interpolations.jl',
				github: 'https://github.com/JuliaMath/Interpolations.jl',
				papers: [],
			},
			{
				name: 'Dierckx.jl',
				github: 'https://github.com/kbarbary/Dierckx.jl',
				papers: [],
			},
		],
		notebookSections: IDAT_NOTEBOOK_SECTIONS,
		notebooks: IDAT_NOTEBOOK_SECTIONS.flatMap(s => s.notebooks),
		wikis: [
			{ name: 'Factsheet',      file: 'idat/factsheet.md',      bundled: true },
			{ name: 'Overview',       file: 'idat/overview.md',        bundled: true },
			{ name: 'Assumptions',    file: 'idat/assumptions.md',     bundled: true },
			{ name: 'Diagnostics',    file: 'idat/diagnostics.md',     bundled: true },
			{ name: 'Interpretation', file: 'idat/interpretation.md',  bundled: true },
			{ name: 'Decision Guide', file: 'idat/decision-guide.md',  bundled: true },
			{ separator: true, label: 'Methods' },
			{ name: 'Linear',         file: 'idat/linear.md',          bundled: true },
			{ name: 'Cubic Spline',   file: 'idat/cubic-spline.md',    bundled: true },
			{ name: 'B-Spline',       file: 'idat/bspline.md',         bundled: true },
			{ name: 'Dierckx Spline', file: 'idat/dierckx.md',         bundled: true },
		],
		references: IDAT_REFERENCES,
	},
};

export function openIdatWebview(
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
			title: IDAT_TITLE,
			options: { retainContextWhenHidden: true },
			contentOptions: { allowScripts: true },
			extension: undefined,
		},
		IDAT_VIEW_TYPE,
		IDAT_TITLE,
		undefined,
		{ group: undefined, preserveFocus: false }
	);

	webviewInput.webview.setHtml(getIdatHtml());

	registerIdatWebviewHandlers(
		webviewInput,
		IDAT_METADATA,
		openerService,
		editorService,
		quickInputService,
		commandService,
		clipboardService,
		notificationService,
		initialModel,
	);
}
