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
import { IRuleBasedMetadata } from '../common/rulebased.types.js';
import { registerRuleBasedWebviewHandlers } from '../handlers/rulebased.handler.js';
import { getRuleBasedHtml } from '../webviews/rulebased.template.js';

const RULEBASED_VIEW_TYPE = 'pollis.rulebased';
const RULEBASED_TITLE = 'Rule-Based Methods';

const RULEBASED_METADATA: IRuleBasedMetadata = {
	rulebased: {
		packages: [
			{
				name: 'RuleMiner.jl',
				github: 'https://github.com/JaredSchwartz/RuleMiner.jl',
				papers: [
					{ title: 'Fast Algorithms for Mining Association Rules', authors: 'Agrawal, R. & Srikant, R.', year: 1994, url: 'https://www.vldb.org/conf/1994/P487.PDF', openAccess: true },
					{ title: 'New Algorithms for Fast Discovery of Association Rules', authors: 'Zaki, M.J., Parthasarathy, S., Ogihara, M. & Li, W.', year: 1997, url: 'https://www.cs.rpi.edu/~zaki/PaperDir/KDD97.pdf', openAccess: true },
					{ title: 'Mining Frequent Patterns without Candidate Generation', authors: 'Han, J., Pei, J. & Yin, Y.', year: 2000, url: 'https://dl.acm.org/doi/10.1145/342009.335372', openAccess: false },
				],
			},
		],
		notebooks: [
			{ name: 'Frequent Itemset Mining',    file: 'rulebased/tutorial-01-itemsets.ipynb',    bundled: true, description: 'Apriori, ECLAT, FP-Growth &#8212; mining frequent itemsets with support thresholds' },
			{ name: 'Closed and Maximal Itemsets', file: 'rulebased/tutorial-02-closed-maximal.ipynb', bundled: true, description: 'FP-Close and FP-Maximal &#8212; compact representations of the frequent itemset lattice' },
			{ name: 'Association Rule Mining',     file: 'rulebased/tutorial-03-rules.ipynb',       bundled: true, description: 'Rule generation and filtering by confidence, lift, conviction, and leverage' },
		],
		wikis: [
			{ name: 'Overview',           file: 'rulebased/overview.md',           bundled: true },
			{ name: 'Factsheet',          file: 'rulebased/factsheet.md',          bundled: true },
			{ name: 'Assumptions',        file: 'rulebased/assumptions.md',        bundled: true },
			{ name: 'Diagnostics',        file: 'rulebased/diagnostics.md',        bundled: true },
			{ name: 'Interpretation',     file: 'rulebased/interpretation.md',     bundled: true },
			{ name: 'Decision Guide',     file: 'rulebased/decision-guide.md',     bundled: true },
			{ name: 'Apriori',            file: 'rulebased/apriori.md',            bundled: true },
			{ name: 'ECLAT',              file: 'rulebased/eclat.md',              bundled: true },
			{ name: 'FP-Growth',          file: 'rulebased/fpgrowth.md',           bundled: true },
			{ name: 'Closed Itemsets',    file: 'rulebased/closed-itemsets.md',    bundled: true },
			{ name: 'Maximal Itemsets',   file: 'rulebased/maximal-itemsets.md',   bundled: true },
			{ name: 'Association Rules',  file: 'rulebased/association-rules.md',  bundled: true },
		],
	},
};

export function openRuleBasedWebview(
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
			title: RULEBASED_TITLE,
			options: { retainContextWhenHidden: true },
			contentOptions: { allowScripts: true },
			extension: undefined,
		},
		RULEBASED_VIEW_TYPE,
		RULEBASED_TITLE,
		undefined,
		{ group: undefined, preserveFocus: false }
	);

	webviewInput.webview.setHtml(getRuleBasedHtml());

	registerRuleBasedWebviewHandlers(
		webviewInput,
		RULEBASED_METADATA,
		openerService,
		editorService,
		quickInputService,
		commandService,
		clipboardService,
		notificationService,
	);
}
