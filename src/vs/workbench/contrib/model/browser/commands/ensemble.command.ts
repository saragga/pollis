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
import { IEnsembleMetadata } from '../common/ensemble.types.js';
import { registerEnsembleWebviewHandlers } from '../handlers/ensemble.handler.js';
import { getEnsembleHtml } from '../webviews/ensemble.template.js';

const ENSEMBLE_VIEW_TYPE = 'pollis.ensemble';
const ENSEMBLE_TITLE = 'Ensemble Learning Methods';

const ENSEMBLE_METADATA: IEnsembleMetadata = {
	ensemble: {
		packages: [
			{
				name: 'DecisionTree.jl',
				github: 'https://github.com/JuliaAI/DecisionTree.jl',
				papers: [
					{ title: 'Random Forests', authors: 'Breiman, L.', year: 2001, url: 'https://link.springer.com/article/10.1023/A:1010933404324', openAccess: false },
				],
			},
			{
				name: 'EvoTrees.jl',
				github: 'https://github.com/Evovest/EvoTrees.jl',
				papers: [
					{ title: 'Greedy Function Approximation: A Gradient Boosting Machine', authors: 'Friedman, J.H.', year: 2001, url: 'https://projecteuclid.org/journals/annals-of-statistics/volume-29/issue-5/Greedy-function-approximation-A-gradient-boosting-machine/10.1214/aos/1013203451.full', openAccess: false },
				],
			},
			{
				name: 'XGBoost.jl',
				github: 'https://github.com/dmlc/XGBoost.jl',
				papers: [
					{ title: 'XGBoost: A Scalable Tree Boosting System', authors: 'Chen, T. & Guestrin, C.', year: 2016, url: 'https://arxiv.org/abs/1603.02754', openAccess: true },
				],
			},
			{
				name: 'NeuroTreeModels.jl',
				github: 'https://github.com/Evovest/NeuroTreeModels.jl',
				papers: [],
			},
			{
				name: 'SIRUS.jl',
				github: 'https://github.com/rikhuijzer/SIRUS.jl',
				papers: [
					{ title: 'SIRUS: Stable and Interpretable RUle Sets for Classification', authors: 'Bénard, C., Biau, G., Da Veiga, S. & Scornet, E.', year: 2021, url: 'https://projecteuclid.org/journals/electronic-journal-of-statistics/volume-15/issue-1/SIRUS--Stable-and-Interpretable-RUle-Sets-for-classification/10.1214/20-EJS1792.full', openAccess: true },
				],
			},
			{
				name: 'ShapML.jl',
				github: 'https://github.com/nredell/ShapML.jl',
				papers: [
					{ title: 'A Unified Approach to Interpreting Model Predictions', authors: 'Lundberg, S.M. & Lee, S.I.', year: 2017, url: 'https://arxiv.org/abs/1705.07874', openAccess: true },
				],
			},
			{
				name: 'CounterfactualExplanations.jl',
				github: 'https://github.com/JuliaTrustworthyAI/CounterfactualExplanations.jl',
				papers: [
					{ title: 'Explaining Black-Box Models through Counterfactuals', authors: 'Altmeyer, P., van der Blom, I., Daxberger, E. & Martens, D.', year: 2023, url: 'https://arxiv.org/abs/2212.07466', openAccess: true },
				],
			},
		],
		notebooks: [
			{ name: 'Random Forests',       file: 'ensemble/tutorial-01-random-forests.ipynb',   bundled: true, description: 'Training, tuning, and evaluating random forests with DecisionTree.jl' },
			{ name: 'Gradient Boosting',    file: 'ensemble/tutorial-02-gradient-boosting.ipynb', bundled: true, description: 'Gradient boosted trees with EvoTrees.jl — nrounds, depth, learning rate' },
			{ name: 'XGBoost',              file: 'ensemble/tutorial-03-xgboost.ipynb',           bundled: true, description: 'High-performance boosting with XGBoost.jl and regularisation parameters' },
			{ name: 'Model Interpretation', file: 'ensemble/tutorial-04-interpretation.ipynb',    bundled: true, description: 'Feature importance, SIRUS rule extraction, and SHAP value decomposition' },
			{ name: 'Differentiable DT',    file: 'ensemble/tutorial-05-neurotree.ipynb',         bundled: true, description: 'Gradient-boosted soft decision trees with NeuroTreeModels.jl' },
		],
		wikis: [
			{ name: 'Overview',           file: 'ensemble/overview.md',           bundled: true },
			{ name: 'Factsheet',          file: 'ensemble/factsheet.md',          bundled: true },
			{ name: 'Assumptions',        file: 'ensemble/assumptions.md',        bundled: true },
			{ name: 'Diagnostics',        file: 'ensemble/diagnostics.md',        bundled: true },
			{ name: 'Interpretation',     file: 'ensemble/interpretation.md',     bundled: true },
			{ name: 'Decision Guide',     file: 'ensemble/decision-guide.md',     bundled: true },
			{ name: 'Random Forests',     file: 'ensemble/random-forests.md',     bundled: true },
			{ name: 'Gradient Boosting',  file: 'ensemble/gradient-boosting.md',  bundled: true },
			{ name: 'XGBoost',            file: 'ensemble/xgboost.md',            bundled: true },
			{ name: 'Feature Importance', file: 'ensemble/feature-importance.md', bundled: true },
			{ name: 'SIRUS',              file: 'ensemble/sirus.md',              bundled: true },
			{ name: 'SHAP Values',        file: 'ensemble/shap.md',              bundled: true },
		],
	},
};

export function openEnsembleWebview(
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
			title: ENSEMBLE_TITLE,
			options: { retainContextWhenHidden: true },
			contentOptions: { allowScripts: true },
			extension: undefined,
		},
		ENSEMBLE_VIEW_TYPE,
		ENSEMBLE_TITLE,
		undefined,
		{ group: undefined, preserveFocus: false }
	);

	webviewInput.webview.setHtml(getEnsembleHtml());

	registerEnsembleWebviewHandlers(
		webviewInput,
		ENSEMBLE_METADATA,
		openerService,
		editorService,
		quickInputService,
		commandService,
		clipboardService,
		notificationService,
	);
}
