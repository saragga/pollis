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
import { ICcaMetadata } from '../common/cca.types.js';
import { IModelReference } from '../common/model.types.js';
import { registerCcaWebviewHandlers } from '../handlers/cca.handler.js';
import { getCcaHtml } from '../webviews/cca.template.js';

const CCA_VIEW_TYPE = 'pollis.cca';
const CCA_TITLE = 'Canonical Correlation Analysis';

const CCA_REFERENCES: IModelReference[] = [
	{ separator: true, label: 'Software' },
	{
		title: 'Julia: A Fresh Approach to Numerical Computing',
		authors: 'Bezanson, Jeff; Edelman, Alan; Karpinski, Stefan; Shah, Viral B.',
		year: 2017,
		journal: 'SIAM Review',
		doi: '10.1137/141000671',
		openAccess: false,
	},
	{ separator: true, label: 'Textbooks' },
	{
		title: 'An Introduction to Multivariate Statistical Analysis',
		authors: 'Anderson, T. W.',
		year: 2003,
		journal: 'Wiley (3rd ed.)',
		url: 'https://www.wiley.com/en-us/An+Introduction+to+Multivariate+Statistical+Analysis%2C+3rd+Edition-p-9780471360919',
		openAccess: false,
	},
	{ separator: true, label: 'Original Papers' },
	{
		title: 'Relations Between Two Sets of Variates',
		authors: 'Hotelling, Harold',
		year: 1936,
		journal: 'Biometrika',
		doi: '10.1093/biomet/28.3-4.321',
		openAccess: false,
	},
];

const CCA_METADATA: ICcaMetadata = {
	cca: {
		packages: [
			{
				name: 'MultivariateStats.jl',
				github: 'https://juliastats.org/MultivariateStats.jl/stable/',
				papers: [],
			},
		],
		notebooks: [
			{
				name: 'Canonical Correlation Analysis',
				file: 'cca/tutorial-01-cca.ipynb',
				bundled: true,
				description: 'CCA with MultivariateStats.jl — canonical variates, correlations, and joint embedding of two feature sets',
			},
		],
		wikis: [
			{ name: 'Factsheet',      file: 'cca/factsheet.md',      bundled: true },
			{ name: 'Overview',       file: 'cca/overview.md',       bundled: true },
			{ name: 'Assumptions',    file: 'cca/assumptions.md',    bundled: true },
			{ name: 'Diagnostics',    file: 'cca/diagnostics.md',    bundled: true },
			{ name: 'Interpretation', file: 'cca/interpretation.md', bundled: true },
			{ name: 'Decision Guide', file: 'cca/decision-guide.md', bundled: true },
			{ separator: true, label: 'CCA' },
			{ name: 'CCA',            file: 'cca/cca.md',            bundled: true },
		],
		references: CCA_REFERENCES,
	},
};

export function openCcaWebview(
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
			title: CCA_TITLE,
			options: { retainContextWhenHidden: true },
			contentOptions: { allowScripts: true },
			extension: undefined,
		},
		CCA_VIEW_TYPE,
		CCA_TITLE,
		undefined,
		{ group: undefined, preserveFocus: false }
	);

	webviewInput.webview.setHtml(getCcaHtml());

	registerCcaWebviewHandlers(
		webviewInput,
		CCA_METADATA,
		openerService,
		editorService,
		quickInputService,
		commandService,
		clipboardService,
		notificationService,
		initialModel,
	);
}
