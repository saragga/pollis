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
import { INntsfMetadata } from '../common/nntsf.types.js';
import { IModelNotebookSection, IModelReference } from '../common/model.types.js';
import { registerNntsfWebviewHandlers } from '../handlers/nntsf.handler.js';
import { getNntsfHtml } from '../webviews/nntsf.template.js';

const NNTSF_VIEW_TYPE = 'pollis.nntsf';
const NNTSF_TITLE = 'Neural Network Time-Series Forecasting';

export const NNTSF_NOTEBOOK_SECTIONS: IModelNotebookSection[] = [
	{
		label: 'Architectures',
		notebooks: [
			{ name: 'LSTnet',   file: 'nntsf/tutorial-01-lstnet.ipynb',   bundled: true, description: 'CNN + recurrent-skip GRU + autoregressive term' },
			{ name: 'DA-RNN',   file: 'nntsf/tutorial-02-darnn.ipynb',    bundled: true, description: 'Input-attention encoder + temporal-attention decoder' },
			{ name: 'TPA-LSTM', file: 'nntsf/tutorial-03-tpa-lstm.ipynb', bundled: true, description: 'LSTM with temporal pattern attention' },
			{ name: 'DSANet',   file: 'nntsf/tutorial-04-dsanet.ipynb',   bundled: true, description: 'Global and local self-attention, no recurrence' },
		],
	},
];

const NNTSF_REFERENCES: IModelReference[] = [
	{ separator: true, label: 'Software' },
	{
		title: 'Fashionable Modelling with Flux',
		authors: 'Innes, Mike; Saba, Elliot; Fischer, Keno; Gandhi, Dhairya; Rudilosso, Marco Concetto; Joy, Neethu Mariya; Karmali, Tejan; Pal, Avik; Shah, Viral',
		year: 2018,
		journal: 'arXiv',
		doi: '10.48550/arXiv.1811.01457',
		openAccess: true,
	},
	{
		title: 'Flux: Elegant Machine Learning with Julia',
		authors: 'Innes, Mike',
		year: 2018,
		journal: 'Journal of Open Source Software',
		doi: '10.21105/joss.00602',
		openAccess: true,
	},
	{ separator: true, label: 'Textbooks' },
	{
		title: 'Deep Learning',
		authors: 'Goodfellow, Ian; Bengio, Yoshua; Courville, Aaron',
		year: 2016,
		journal: 'MIT Press',
		url: 'https://www.deeplearningbook.org',
		openAccess: true,
	},
	{
		title: 'Forecasting: Principles and Practice',
		authors: 'Hyndman, Rob J.; Athanasopoulos, George',
		year: 2021,
		journal: 'OTexts',
		url: 'https://otexts.com/fpp3/',
		openAccess: true,
	},
	{ separator: true, label: 'Original Papers' },
	{
		title: 'Modeling Long- and Short-Term Temporal Patterns with Deep Neural Networks (LSTNet)',
		authors: 'Lai, Guokun; Chang, Wei-Cheng; Yang, Yiming; Liu, Hanxiao',
		year: 2018,
		journal: 'SIGIR',
		doi: '10.1145/3209978.3210006',
		openAccess: false,
	},
	{
		title: 'A Dual-Stage Attention-Based Recurrent Neural Network for Time Series Prediction (DA-RNN)',
		authors: 'Qin, Yao; Song, Dongjin; Chen, Haifeng; Cheng, Wei; Jiang, Guofei; Cottrell, Garrison W.',
		year: 2017,
		journal: 'IJCAI',
		doi: '10.24963/ijcai.2017/366',
		openAccess: true,
	},
	{
		title: 'Temporal Pattern Attention for Multivariate Time Series Forecasting (TPA-LSTM)',
		authors: 'Shih, Shun-Yao; Sun, Fan-Keng; Lee, Hung-yi',
		year: 2019,
		journal: 'Machine Learning',
		doi: '10.1007/s10994-019-05815-0',
		openAccess: true,
	},
	{
		title: 'DSANet: Dual Self-Attention Network for Multivariate Time Series Forecasting',
		authors: 'Huang, Siteng; Wang, Donglin; Wu, Xuehan; Tang, Ao',
		year: 2019,
		journal: 'CIKM',
		doi: '10.1145/3357384.3358132',
		openAccess: false,
	},
];

const NNTSF_METADATA: INntsfMetadata = {
	nntsf: {
		packages: [
			{ name: 'FluxArchitectures.jl', github: 'https://github.com/sdobber/FluxArchitectures.jl', papers: [] },
			{ name: 'Flux.jl', github: 'https://github.com/FluxML/Flux.jl', papers: [] },
		],
		notebooks: NNTSF_NOTEBOOK_SECTIONS.flatMap(s => s.notebooks),
		notebookSections: NNTSF_NOTEBOOK_SECTIONS,
		wikis: [
			{ name: 'Factsheet',      file: 'nntsf/factsheet.md',      bundled: true },
			{ name: 'Overview',       file: 'nntsf/overview.md',       bundled: true },
			{ name: 'Assumptions',    file: 'nntsf/assumptions.md',    bundled: true },
			{ name: 'Diagnostics',    file: 'nntsf/diagnostics.md',    bundled: true },
			{ name: 'Interpretation', file: 'nntsf/interpretation.md', bundled: true },
			{ name: 'Decision Guide', file: 'nntsf/decision-guide.md', bundled: true },
			{ separator: true, label: 'Architectures' },
			{ name: 'LSTnet',   file: 'nntsf/lstnet.md',   bundled: true },
			{ name: 'DA-RNN',   file: 'nntsf/darnn.md',    bundled: true },
			{ name: 'TPA-LSTM', file: 'nntsf/tpa-lstm.md', bundled: true },
			{ name: 'DSANet',   file: 'nntsf/dsanet.md',   bundled: true },
		],
		references: NNTSF_REFERENCES,
		tooltips: {
			pool:    'Pool length: number of past time steps fed to the network as one input window.',
			conv:    'Number of convolutional filters in the LSTnet CNN layer that captures short-term local patterns.',
			recur:   'Hidden size of the recurrent (GRU) layer that captures longer-term dependencies.',
			skip:    'Skip length: period of the recurrent-skip connection, set to the dominant seasonal cycle.',
			epochs:  'Number of training epochs (passes over the data) for the optimiser.',
			encoder: 'Hidden size of the DA-RNN input-attention encoder.',
			decoder: 'Hidden size of the DA-RNN temporal-attention decoder.',
			hidden:  'Hidden size of the LSTM cells in TPA-LSTM.',
			layers:  'Number of stacked LSTM layers in TPA-LSTM.',
			filters: 'Number of filters in the TPA-LSTM temporal-pattern-attention convolution.',
			local:   'Local window length for DSANet local self-attention.',
			kernels: 'Number of convolutional kernels in the DSANet feature branches.',
			dmodel:  'Model dimension (width) of the DSANet self-attention blocks.',
		},
	},
};

export function openNntsfWebview(
	webviewWorkbenchService: IWebviewWorkbenchService,
	openerService: IOpenerService,
	editorService: IEditorService,
	quickInputService: IQuickInputService,
	commandService: ICommandService,
	clipboardService: IClipboardService,
	notificationService: INotificationService,
	initialMethod?: string,
): void {
	const webviewInput = webviewWorkbenchService.openWebview(
		{
			title: NNTSF_TITLE,
			options: { retainContextWhenHidden: true },
			contentOptions: { allowScripts: true },
			extension: undefined,
		},
		NNTSF_VIEW_TYPE,
		NNTSF_TITLE,
		undefined,
		{ group: undefined, preserveFocus: false }
	);

	webviewInput.webview.setHtml(getNntsfHtml());

	registerNntsfWebviewHandlers(
		webviewInput,
		NNTSF_METADATA,
		openerService,
		editorService,
		quickInputService,
		commandService,
		clipboardService,
		notificationService,
		initialMethod,
	);
}
