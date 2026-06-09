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
import { IHmdMetadata } from '../common/hmd.types.js';
import { IModelReference, IModelNotebookSection } from '../common/model.types.js';
import { registerHmdWebviewHandlers } from '../handlers/hmd.handler.js';
import { getHmdHtml } from '../webviews/hmd.template.js';

const HMD_VIEW_TYPE = 'pollis.hmd';
const HMD_TITLE = 'Handle Missing Data';

const HMD_REFERENCES: IModelReference[] = [
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
		title: 'Impute.jl: Flexible Missing Data Imputation in Julia',
		authors: 'Greenham, Rory',
		year: 2022,
		journal: 'GitHub',
		url: 'https://github.com/invenia/Impute.jl',
		openAccess: true,
	},
	{ separator: true, label: 'Textbooks' },
	{
		title: 'Statistical Analysis with Missing Data',
		authors: 'Little, Roderick J. A.; Rubin, Donald B.',
		year: 2019,
		journal: 'Wiley (3rd ed.)',
		doi: '10.1002/9781119482260',
		openAccess: false,
	},
	{
		title: 'Flexible Imputation of Missing Data',
		authors: 'van Buuren, Stef',
		year: 2018,
		journal: 'CRC Press (2nd ed.)',
		url: 'https://stefvanbuuren.name/fimd/',
		openAccess: true,
	},
	{ separator: true, label: 'Original Papers' },
	{
		title: 'A Test of Missing Completely at Random for Multivariate Data with Missing Values',
		authors: 'Little, Roderick J. A.',
		year: 1988,
		journal: 'Journal of the American Statistical Association',
		doi: '10.1080/01621459.1988.10478722',
		openAccess: false,
	},
	{
		title: 'Inference and Missing Data',
		authors: 'Rubin, Donald B.',
		year: 1976,
		journal: 'Biometrika',
		doi: '10.1093/biomet/63.3.581',
		openAccess: false,
	},
	{
		title: 'Spectral Regularization Algorithms for Learning Large Incomplete Matrices',
		authors: 'Mazumder, Rahul; Hastie, Trevor; Tibshirani, Robert',
		year: 2010,
		journal: 'Journal of Machine Learning Research',
		url: 'https://www.jmlr.org/papers/v11/mazumder10a.html',
		openAccess: true,
	},
];

export const HMD_NOTEBOOK_SECTIONS: IModelNotebookSection[] = [
	{
		label: 'Handle Missing Data',
		notebooks: [
			{ name: 'Missing Data Basics',    file: 'hmd/tutorial-01-basics.ipynb',        bundled: true, description: 'Detect, count, and summarise missing values with Missings.jl' },
			{ name: 'Imputation Methods',     file: 'hmd/tutorial-02-imputation.ipynb',    bundled: true, description: 'Apply Drop, Substitute, Interpolate, LOCF, and SVD methods via Impute.jl' },
			{ name: 'Time-Series Imputation', file: 'hmd/tutorial-03-time-series.ipynb',   bundled: true, description: 'Impute ordered sequences with LOCF, NOCB, and linear interpolation' },
		],
	},
];

const HMD_METADATA: IHmdMetadata = {
	hmd: {
		packages: [
			{
				name: 'Impute.jl',
				github: 'https://github.com/invenia/Impute.jl',
				papers: [],
			},
			{
				name: 'Missings.jl',
				github: 'https://github.com/JuliaData/Missings.jl',
				papers: [],
			},
			{
				name: 'Tables.jl',
				github: 'https://github.com/JuliaData/Tables.jl',
				papers: [],
			},
		],
		notebookSections: HMD_NOTEBOOK_SECTIONS,
		notebooks: HMD_NOTEBOOK_SECTIONS.flatMap(s => s.notebooks),
		wikis: [
			{ name: 'Factsheet',      file: 'hmd/factsheet.md',      bundled: true },
			{ name: 'Overview',       file: 'hmd/overview.md',        bundled: true },
			{ name: 'Assumptions',    file: 'hmd/assumptions.md',     bundled: true },
			{ name: 'Diagnostics',    file: 'hmd/diagnostics.md',     bundled: true },
			{ name: 'Interpretation', file: 'hmd/interpretation.md',  bundled: true },
			{ name: 'Decision Guide', file: 'hmd/decision-guide.md',  bundled: true },
			{ separator: true, label: 'Methods' },
			{ name: 'Drop',           file: 'hmd/drop.md',            bundled: true },
			{ name: 'Substitute',     file: 'hmd/substitute.md',      bundled: true },
			{ name: 'Interpolate',    file: 'hmd/interpolate.md',     bundled: true },
			{ name: 'LOCF / NOCB',    file: 'hmd/locf.md',            bundled: true },
			{ name: 'SVD',            file: 'hmd/svd.md',             bundled: true },
		],
		references: HMD_REFERENCES,
	},
};

export function openHmdWebview(
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
			title: HMD_TITLE,
			options: { retainContextWhenHidden: true },
			contentOptions: { allowScripts: true },
			extension: undefined,
		},
		HMD_VIEW_TYPE,
		HMD_TITLE,
		undefined,
		{ group: undefined, preserveFocus: false }
	);

	webviewInput.webview.setHtml(getHmdHtml());

	registerHmdWebviewHandlers(
		webviewInput,
		HMD_METADATA,
		openerService,
		editorService,
		quickInputService,
		commandService,
		clipboardService,
		notificationService,
		initialModel,
	);
}
