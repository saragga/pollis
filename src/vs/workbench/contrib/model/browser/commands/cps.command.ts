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
import { ICevalMetadata } from '../common/ceval.types.js';
import { registerCopulaSamplingWebviewHandlers } from '../handlers/cps.handler.js';
import { getCsampHtml } from '../webviews/cps.template.js';

const CPS_VIEW_TYPE = 'pollis.copula-sampling';
const CPS_TITLE = 'Copula Sampling';

const CPS_METADATA: ICevalMetadata = {
	ceval: {
		packages: [
			{
				name: 'Copulas.jl',
				github: 'https://github.com/lrnv/Copulas.jl',
				papers: [
					{ title: 'An Introduction to Copulas', authors: 'Nelsen, R.B.', year: 2006, url: 'https://link.springer.com/book/10.1007/0-387-28678-0', openAccess: false },
					{ title: 'Modeling Dependence with Copulas and Applications to Risk Management', authors: 'Embrechts, P., McNeil, A. & Straumann, D.', year: 2002, url: 'https://people.math.ethz.ch/~embrecht/ftp/copchapter.pdf', openAccess: true },
					{ title: 'Everything You Always Wanted to Know about Copula Modeling but Were Afraid to Ask', authors: 'Genest, C. & Favre, A.-C.', year: 2007, url: 'https://doi.org/10.1061/(ASCE)1084-0699(2007)12:4(347)', openAccess: false },
				],
			},
		],
		notebooks: [
			{ name: 'Elliptical Copulas',    file: 'copula/tutorial-01-elliptical.ipynb',    bundled: true, description: 'Gaussian and Student-t copulas &#8212; correlation matrices, sampling, tail dependence' },
			{ name: 'Archimedean Copulas',   file: 'copula/tutorial-02-archimedean.ipynb',   bundled: true, description: 'Clayton, Gumbel, Frank, and Joe copulas &#8212; generators, parameter estimation' },
			{ name: 'Extreme Value Copulas', file: 'copula/tutorial-03-extreme-value.ipynb', bundled: true, description: 'Max-stable copulas &#8212; Gumbel&#8211;Hougaard, Galambos, and Pickands representation' },
			{ name: 'Dependence Measures',   file: 'copula/tutorial-04-dependence.ipynb',    bundled: true, description: 'Kendall&#8217;s &#964;, Spearman&#8217;s &#961;, and upper/lower tail dependence coefficients' },
		],
		wikis: [
			{ name: 'Overview',              file: 'copula/overview.md',            bundled: true },
			{ name: 'Factsheet',             file: 'copula/factsheet.md',           bundled: true },
			{ name: 'Assumptions',           file: 'copula/assumptions.md',         bundled: true },
			{ name: 'Diagnostics',           file: 'copula/diagnostics.md',         bundled: true },
			{ name: 'Interpretation',        file: 'copula/interpretation.md',      bundled: true },
			{ name: 'Decision Guide',        file: 'copula/decision-guide.md',      bundled: true },
			{ name: 'Elliptical Copulas',    file: 'copula/elliptical.md',          bundled: true },
			{ name: 'Archimedean Copulas',   file: 'copula/archimedean.md',         bundled: true },
			{ name: 'Extreme Value Copulas', file: 'copula/extreme-value.md',       bundled: true },
			{ name: 'Marshall&#8211;Olkin Copulas', file: 'copula/marshall-olkin.md', bundled: true },
			{ name: 'Vine Copulas',          file: 'copula/vine.md',                bundled: true },
			{ name: 'Dependence Measures',   file: 'copula/dependence-measures.md', bundled: true },
		],
		tooltips: {
			dim:   'Dimension d — number of marginal variables modelled jointly. Must be an integer &#8805; 2. For Elliptical and Archimedean copulas any d &#8805; 2 is supported; bivariate-only families (Galambos, H&#252;sler&#8211;Reiss, tEV, Marshall&#8211;Olkin) are fixed at d = 2.',
			rho:   'Pairwise correlation &#961; &#8712; (&#8722;1, 1) used to build the correlation matrix &#931;. For d = 2: &#931; = [1 &#961;; &#961; 1]. For d > 2 an equicorrelation structure is assumed: &#931; = &#961; &#183; 11&#7488; + (1&#8722;&#961;) &#183; I. Also used as the tail-correlation parameter for the tEV copula.',
			nu:    'Degrees of freedom &#957; > 0. For Student-t: lower values give heavier tails; as &#957; &#8594; &#8734; it converges to Gaussian. For tEV: same parameter governs the extreme-value tail; lower &#957; increases tail dependence.',
			theta: 'Dependence parameter &#952;. Admissible range varies by family: Clayton &#952; > 0 (lower tail); Gumbel &#952; &#8805; 1 (upper tail); Frank &#952; &#8800; 0 (symmetric); Joe &#952; &#8805; 1 (upper tail); AMH &#952; &#8712; [&#8722;1, 1) (no tail dep.); Galambos &#952; > 0; H&#252;sler&#8211;Reiss &#952; > 0.',
			delta: 'Second shape parameter &#948; for the BB1 copula (Joe&#8211;Clayton nesting). &#948; &#8805; 1 controls the lower tail dependence strength independently of &#952;. BB1 nests Clayton (&#952; &#8594; 0) and Gumbel (&#948; = 1) as special cases.',
			eval:  'Evaluation point u &#8712; [0, 1]^d &#8212; a comma-separated list of d uniform marginal quantiles at which the joint CDF and density are computed. Example: 0.5, 0.5 for d = 2. Each value must lie strictly between 0 and 1.',
		},
	},
};

export function openCopulaSamplingWebview(
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
			title: CPS_TITLE,
			options: { retainContextWhenHidden: true },
			contentOptions: { allowScripts: true },
			extension: undefined,
		},
		CPS_VIEW_TYPE,
		CPS_TITLE,
		undefined,
		{ group: undefined, preserveFocus: false }
	);

	webviewInput.webview.setHtml(getCsampHtml());

	registerCopulaSamplingWebviewHandlers(
		webviewInput,
		CPS_METADATA,
		openerService,
		editorService,
		quickInputService,
		commandService,
		clipboardService,
		notificationService,
	);
}
