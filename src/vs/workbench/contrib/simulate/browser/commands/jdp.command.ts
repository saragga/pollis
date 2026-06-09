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
import { IJdpMetadata } from '../common/jdp.types.js';
import { IModelReference } from '../../../model/browser/common/model.types.js';
import { registerJdpWebviewHandlers } from '../handlers/jdp.handler.js';
import { getJdpHtml } from '../webviews/jdp.template.js';

const JDP_VIEW_TYPE = 'pollis.jdp';
const JDP_TITLE = 'Jump-Diffusion Processes';

const JDP_REFERENCES: IModelReference[] = [
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
		title: 'JumpProcesses.jl: A Julia Package for Stochastic Jump Processes',
		authors: 'Rackauckas, Christopher; Nie, Qing; et al.',
		year: 2022,
		journal: 'GitHub',
		url: 'https://github.com/SciML/JumpProcesses.jl',
		openAccess: true,
	},
	{ separator: true, label: 'Textbooks' },
	{
		title: 'Financial Modelling with Jump Processes',
		authors: 'Cont, Rama; Tankov, Peter',
		year: 2004,
		journal: 'Chapman and Hall / CRC',
		doi: '10.1201/9780203485217',
		openAccess: false,
	},
	{
		title: 'Stochastic Calculus for Finance II: Continuous-Time Models',
		authors: 'Shreve, Steven E.',
		year: 2004,
		journal: 'Springer',
		doi: '10.1007/978-1-4757-4296-1',
		openAccess: false,
	},
	{ separator: true, label: 'Original Papers' },
	{
		title: 'Option Pricing When Underlying Stock Returns Are Discontinuous',
		authors: 'Merton, Robert C.',
		year: 1976,
		journal: 'Journal of Financial Economics',
		doi: '10.1016/0304-405X(76)90022-2',
		openAccess: false,
	},
	{
		title: 'A Jump-Diffusion Model for Option Pricing',
		authors: 'Kou, Steven G.',
		year: 2002,
		journal: 'Management Science',
		doi: '10.1287/mnsc.48.8.1086.166',
		openAccess: false,
	},
];

const JDP_METADATA: IJdpMetadata = {
	jdp: {
		packages: [
			{
				name: 'JumpProcesses.jl',
				github: 'https://github.com/SciML/JumpProcesses.jl',
				videos: [],
				papers: [],
			},
			{
				name: 'DifferentialEquations.jl',
				github: 'https://github.com/SciML/DifferentialEquations.jl',
				videos: [],
				papers: [],
			},
		],
		notebooks: [
			{ name: 'Compound Poisson', file: 'jdp/tutorial-01-compound-poisson.ipynb', bundled: true, description: 'SDE with Compound Poisson jumps of arbitrary distribution via ConstantRateJump' },
			{ name: 'Gaussian Jumps', file: 'jdp/tutorial-02-gaussian-jumps.ipynb', bundled: true, description: 'Merton-style jump-diffusion: normally distributed jump sizes with constant rate' },
			{ name: 'Custom Rate', file: 'jdp/tutorial-03-custom-rate.ipynb', bundled: true, description: 'State-dependent jump intensity using VariableRateJump' },
		],
		wikis: [
			{ name: 'Factsheet',      file: 'jdp/factsheet.md',      bundled: true },
			{ name: 'Overview',       file: 'jdp/overview.md',       bundled: true },
			{ name: 'Assumptions',    file: 'jdp/assumptions.md',    bundled: true },
			{ name: 'Diagnostics',    file: 'jdp/diagnostics.md',    bundled: true },
			{ name: 'Interpretation', file: 'jdp/interpretation.md', bundled: true },
			{ name: 'Decision Guide', file: 'jdp/decision-guide.md', bundled: true },
			{ separator: true, label: 'Methods' },
			{ name: 'Compound Poisson', file: 'jdp/compound-poisson.md', bundled: true },
			{ name: 'Gaussian Jumps',   file: 'jdp/gaussian-jumps.md',   bundled: true },
			{ name: 'Custom Rate',      file: 'jdp/custom-rate.md',      bundled: true },
		],
		references: JDP_REFERENCES,
	},
};

export function openJdpWebview(
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
			title: JDP_TITLE,
			options: { retainContextWhenHidden: true },
			contentOptions: { allowScripts: true },
			extension: undefined,
		},
		JDP_VIEW_TYPE,
		JDP_TITLE,
		undefined,
		{ group: undefined, preserveFocus: false }
	);

	webviewInput.webview.setHtml(getJdpHtml());

	registerJdpWebviewHandlers(
		webviewInput,
		JDP_METADATA,
		openerService,
		editorService,
		quickInputService,
		commandService,
		clipboardService,
		notificationService,
		initialModel,
	);
}
