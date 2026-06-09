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
import { ICvMetadata } from '../common/cv.types.js';
import { IModelReference, IModelNotebookSection } from '../common/model.types.js';
import { registerCvWebviewHandlers } from '../handlers/cv.handler.js';
import { getCvHtml } from '../webviews/cv.template.js';

const CV_VIEW_TYPE = 'pollis.cv';
const CV_TITLE = 'Cross-Validation Strategies';

const CV_REFERENCES: IModelReference[] = [
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
		title: 'DataSplits.jl: Resampling Strategies for Machine Learning',
		authors: 'Grheco, Davide',
		year: 2024,
		journal: 'GitHub',
		openAccess: true,
	},
	{ separator: true, label: 'Textbooks' },
	{
		title: 'The Elements of Statistical Learning',
		authors: 'Hastie, Trevor; Tibshirani, Robert; Friedman, Jerome',
		year: 2009,
		journal: 'Springer (2nd ed.)',
		openAccess: true,
	},
	{
		title: 'Pattern Recognition and Machine Learning',
		authors: 'Bishop, Christopher M.',
		year: 2006,
		journal: 'Springer',
		openAccess: false,
	},
	{ separator: true, label: 'Original Papers' },
	{
		title: 'A Study of Cross-Validation and Bootstrap for Accuracy Estimation and Model Selection',
		authors: 'Kohavi, Ron',
		year: 1995,
		journal: 'IJCAI',
		openAccess: true,
	},
	{
		title: 'Sample Selection via Kennard-Stone Algorithm',
		authors: 'Kennard, R. W.; Stone, L. A.',
		year: 1969,
		journal: 'Technometrics',
		doi: '10.1080/00401706.1969.10490666',
		openAccess: false,
	},
	{
		title: 'Combinatorial Framework for Leave-One-Out Cross-Validation',
		authors: 'Arlot, Sylvain; Celisse, Alain',
		year: 2010,
		journal: 'Statistics Surveys',
		doi: '10.1214/09-SS054',
		openAccess: true,
	},
];

export const CV_NOTEBOOK_SECTIONS: IModelNotebookSection[] = [
	{
		label: 'Cross-Validation',
		notebooks: [
			{
				name: 'K-Fold CV',
				file: 'cv/tutorial-01-kfold.ipynb',
				bundled: true,
				description: 'Standard k-fold cross-validation with DataSplits.jl KFold iterator',
			},
			{
				name: 'Stratified K-Fold',
				file: 'cv/tutorial-02-stratified.ipynb',
				bundled: true,
				description: 'Class-preserving folds with StratifiedKFold for imbalanced datasets',
			},
			{
				name: 'Nested CV',
				file: 'cv/tutorial-03-nested.ipynb',
				bundled: true,
				description: 'Outer evaluation loop + inner hyperparameter tuning loop with NestedCV',
			},
		],
	},
	{
		label: 'Distance-Based Splits',
		notebooks: [
			{
				name: 'Kennard-Stone',
				file: 'cv/tutorial-04-kennardstone.ipynb',
				bundled: true,
				description: 'Space-filling train set selection with KennardStoneSplit for spectral and chemical data',
			},
			{
				name: 'SPXY Split',
				file: 'cv/tutorial-05-spxy.ipynb',
				bundled: true,
				description: 'Joint X/y space coverage with SPXYSplit for regression on continuous responses',
			},
		],
	},
	{
		label: 'Time-Series & Group',
		notebooks: [
			{
				name: 'Time-Series Split',
				file: 'cv/tutorial-06-timeseries.ipynb',
				bundled: true,
				description: 'Chronological expanding-window CV with TimeSeriesSplit',
			},
			{
				name: 'Group K-Fold',
				file: 'cv/tutorial-07-group.ipynb',
				bundled: true,
				description: 'Keep entire groups (patients, batches) intact across folds with GroupKFold',
			},
		],
	},
];

const CV_METADATA: ICvMetadata = {
	cv: {
		packages: [
			{
				name: 'DataSplits.jl',
				github: 'https://github.com/davide-grheco/DataSplits.jl',
				papers: [],
			},
		],
		notebookSections: CV_NOTEBOOK_SECTIONS,
		notebooks: CV_NOTEBOOK_SECTIONS.flatMap(s => s.notebooks),
		wikis: [
			{ name: 'Factsheet',        file: 'cv/factsheet.md',        bundled: true },
			{ name: 'Overview',         file: 'cv/overview.md',         bundled: true },
			{ name: 'Assumptions',      file: 'cv/assumptions.md',      bundled: true },
			{ name: 'Diagnostics',      file: 'cv/diagnostics.md',      bundled: true },
			{ name: 'Interpretation',   file: 'cv/interpretation.md',   bundled: true },
			{ name: 'Decision Guide',   file: 'cv/decision-guide.md',   bundled: true },
			{ separator: true, label: 'Strategies' },
			{ name: 'Cross-Validation', file: 'cv/cross-validation.md', bundled: true },
			{ name: 'Distance-Based',   file: 'cv/distance-based.md',   bundled: true },
			{ name: 'Group-Aware',      file: 'cv/group-aware.md',      bundled: true },
			{ name: 'Time-Series',      file: 'cv/time-series.md',      bundled: true },
		],
		references: CV_REFERENCES,
	},
};

export function openCvWebview(
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
			title: CV_TITLE,
			options: { retainContextWhenHidden: true },
			contentOptions: { allowScripts: true },
			extension: undefined,
		},
		CV_VIEW_TYPE,
		CV_TITLE,
		undefined,
		{ group: undefined, preserveFocus: false }
	);

	webviewInput.webview.setHtml(getCvHtml());

	registerCvWebviewHandlers(
		webviewInput,
		CV_METADATA,
		openerService,
		editorService,
		quickInputService,
		commandService,
		clipboardService,
		notificationService,
	);
}
