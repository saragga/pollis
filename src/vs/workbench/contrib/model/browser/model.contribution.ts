/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { localize } from '../../../../../vs/nls.js';
import { MenuRegistry, MenuId } from '../../../../platform/actions/common/actions.js';
import { CommandsRegistry, ICommandService } from '../../../../platform/commands/common/commands.js';
import { IClipboardService } from '../../../../platform/clipboard/common/clipboardService.js';
import { INotificationService } from '../../../../platform/notification/common/notification.js';
import { ServicesAccessor } from '../../../../platform/instantiation/common/instantiation.js';
import { IWebviewWorkbenchService } from '../../webviewPanel/browser/webviewWorkbenchService.js';
import { IOpenerService } from '../../../../platform/opener/common/opener.js';
import { IEditorService } from '../../../services/editor/common/editorService.js';
import { IQuickInputService } from '../../../../platform/quickinput/common/quickInput.js';
import { ITerminalService } from '../../terminal/browser/terminal.js';

import { openNllsWebview } from './commands/nlls.command.js';
import { LM_PANEL } from './commands/lm.command.js';
import { MM_PANEL } from './commands/mm.command.js';
import { GLM_PANEL } from './commands/glm.command.js';
import { openScaffoldWebview } from './commands/scaffold.command.js';
import { openLmmWebview } from './commands/lmm.command.js';
import { openGlmmWebview } from './commands/glmm.command.js';
import { openLassoWebview } from './commands/lasso.command.js';
import { openRngWebview } from './commands/rng.command.js';
import { openQrngWebview } from './commands/qrng.command.js';
import { DIST_PANEL } from './commands/dist.command.js';
import { openDistSamplingWebview } from './commands/dist-sampling.command.js';
import { openHtWebview } from './commands/ht.command.js';
import { openDeWebview } from './commands/de.command.js';
import { openUpWebview } from './commands/up.command.js';
import { openDfWebview } from './commands/df.command.js';
import { openRqrWebview } from './commands/rqr.command.js';
import { openSsmWebview } from './commands/ssm.command.js';
import { openVcmWebview } from './commands/vcm.command.js';
import { openTteWebview } from './commands/tte.command.js';
import { openCtsvWebview } from './commands/ctsv.command.js';
import { openArimaWebview } from './commands/arima.command.js';
import { VAR_PANEL } from './commands/var.command.js';
import { openNscrWebview } from './commands/nscr.command.js';
import { openTsfWebview } from './commands/tsf.command.js';
import { openNntsfWebview } from './commands/nntsf.command.js';
import { openDtWebview } from './commands/dt.command.js';
import { openKnnWebview } from './commands/knn.command.js';
import { openRnnWebview } from './commands/rnn.command.js';
import { RL_PANEL } from './commands/rl.command.js';
import { registerPlutoCommands } from './commands/pluto.command.js';
import { registerNewJuliaFileCommand } from './commands/juliaFile.command.js';
import './juliaNotebookKernel.contribution.js';
import './credentialEnvironment.contribution.js';
import './customCopyFileSystem.contribution.js';
import { openCnnWebview } from './commands/cnn.command.js';
import { openGnnWebview } from './commands/gnn.command.js';
import { openTransformerWebview } from './commands/transformer.command.js';
import { openFnnWebview } from './commands/fnn.command.js';
import { openNfWebview } from './commands/nf.command.js';
import { openCopulaWebview } from './commands/copula.command.js';
import { openCevalWebview } from './commands/ceval.command.js';
import { openCopulaSamplingWebview } from './commands/cps.command.js';
import { openPplWebview } from './commands/ppl.command.js';
import { openRxinferWebview } from './commands/rxinfer.command.js';
import { openBnetWebview } from './commands/bnet.command.js';
import { openRuleBasedWebview } from './commands/rulebased.command.js';
import { BFMB_PANEL } from './commands/bfmb.command.js';
import { openHfcmeWebview } from './commands/hfcme.command.js';
import { openRcmeWebview } from './commands/rcme.command.js';
import { openBlsdfWebview } from './commands/blsdf.command.js';
import { openEnsembleWebview } from './commands/ensemble.command.js';
import { openClpWebview } from './commands/clp.command.js';
import { openClhWebview } from './commands/clh.command.js';
import { openManifoldWebview } from './commands/manifold.command.js';
import { openEmbeddingWebview } from './commands/embedding.command.js';
import { openAutoencoderWebview } from './commands/autoencoder.command.js';
import { openLcaWebview } from './commands/lca.command.js';
import { VM_PANEL } from './commands/vm.command.js';
import { openRpWebview } from './commands/rp.command.js';
import { openHptWebview } from './commands/hpt.command.js';
import { openMcWebview } from './commands/mc.command.js';
import { openCvWebview } from './commands/cv.command.js';
import { openClfWebview } from './commands/clf.command.js';
import { openAdlpWebview } from './commands/adlp.command.js';
import { openSbiWebview } from './commands/sbi.command.js';
import { openExpWebview } from './commands/exp.command.js';
import { openMmnWebview } from './commands/mmn.command.js';
import { openBcfWebview } from './commands/bcf.command.js';
import { openDtsvWebview } from './commands/dtsv.command.js';
import { DSGE_PANEL } from './commands/dsge.command.js';
import { openNnlsWebview } from './commands/nnls.command.js';
import { openTslsWebview } from './commands/tsls.command.js';
import { openGmmWebview } from './commands/gmm.command.js';
import { openHamWebview } from './commands/ham.command.js';
import { openCtmfWebview } from './commands/ctmf.command.js';
import { LRM_PANEL } from './commands/lrm.command.js';
import { openGevWebview } from './commands/gev.command.js';
import { openGpWebview } from './commands/gp.command.js';
import { openEvtRiskWebview } from './commands/evt-risk.command.js';
import { openEvtDiagWebview } from './commands/evt-diag.command.js';
import { openHareWebview } from './commands/hare.command.js';
import { openGtWebview } from './commands/gt.command.js';
import { openRvolWebview } from './commands/rvol.command.js';
import { openLmarWebview } from './commands/lmar.command.js';
import { openLmharWebview } from './commands/lmhar.command.js';
import { PO_PANEL } from './commands/po.command.js';
import { openOaWebview } from './commands/oa.command.js';
import { openCdsWebview } from './commands/cds.command.js';
import { openDmapWebview } from './commands/dmap.command.js';
import { openNodeWebview } from './commands/node.command.js';
import { openAttrWebview } from './commands/attr.command.js';
import { openChaosWebview } from './commands/chaos.command.js';
import { openCmplxWebview } from './commands/cmplx.command.js';
import { openAbmWebview } from './commands/abm.command.js';
import { openAbmEnsWebview } from './commands/abm-ens.command.js';
import { openAbmVizWebview } from './commands/abm-viz.command.js';
import { TRAD_PANEL } from './commands/trad.command.js';
import { openNetWebview } from './commands/net.command.js';
import { openNetdynWebview } from './commands/netdyn.command.js';
import { openNetflowWebview } from './commands/netflow.command.js';
import { openEpiCompWebview } from './commands/epi-comp.command.js';
import { openEpiUdeWebview } from './commands/epi-ude.command.js';
import { openCrnWebview } from './commands/crn.command.js';
import { openCestWebview } from './commands/cest.command.js';
import { openCcaWebview } from './commands/cca.command.js';
import { openCovShrinkageWebview } from './commands/cov-shrinkage.command.js';
import { openLlmTaWebview } from './commands/llm-ta.command.js';
import { openRougeWebview } from './commands/rouge.command.js';
import { openDtmWebview } from './commands/dtm.command.js';
import { openSlmWebview } from './commands/slm.command.js';
import { openComWebview } from './commands/com.command.js';
import { openLsaWebview } from './commands/lsa.command.js';
import { openLdaWebview } from './commands/lda.command.js';
import { openCtmWebview } from './commands/ctm.command.js';
import { openBertWebview } from './commands/bert.command.js';
import { openClbtWebview } from './commands/clbt.command.js';
import { openCtpfWebview } from './commands/ctpf.command.js';
import { openPtpWebview } from './commands/ptp.command.js';
import { openSregWebview } from './commands/sreg.command.js';
import { openSiWebview } from './commands/si.command.js';
import { openOdeWebview } from './commands/ode.command.js';
import { openAtsfWebview } from './commands/atsf.command.js';
import { openLpWebview } from './commands/lp.command.js';
import { openQpWebview } from './commands/qp.command.js';
import { openMpnlpWebview } from './commands/mpnlp.command.js';
import { openMpconeWebview } from './commands/mpcone.command.js';
import { openMpsdpWebview } from './commands/mpsdp.command.js';
import { openMpsosWebview } from './commands/mpsos.command.js';

// ============================================
// COMMAND REGISTRATION
// ============================================

const MODEL_COMMAND_ID = 'workbench.action.showModel';

CommandsRegistry.registerCommand(MODEL_COMMAND_ID, () => {
	console.log('Model command executed!');
});

CommandsRegistry.registerCommand('chiara.statistics.de', (accessor: ServicesAccessor) => {
	openDeWebview(
		accessor.get(IWebviewWorkbenchService),
		accessor.get(IOpenerService),
		accessor.get(IEditorService),
		accessor.get(IQuickInputService),
		accessor.get(ICommandService),
		accessor.get(IClipboardService),
		accessor.get(INotificationService),
		accessor.get(ITerminalService),
	);
});

CommandsRegistry.registerCommand('chiara.statistics.ht', (accessor: ServicesAccessor) => {
	openHtWebview(
		accessor.get(IWebviewWorkbenchService),
		accessor.get(IOpenerService),
		accessor.get(IEditorService),
		accessor.get(IQuickInputService),
		accessor.get(ICommandService),
		accessor.get(IClipboardService),
		accessor.get(INotificationService),
	);
});

CommandsRegistry.registerCommand('chiara.statistics.d', accessor => openScaffoldWebview(accessor, DIST_PANEL));

CommandsRegistry.registerCommand('chiara.statistics.d.sampling', (accessor: ServicesAccessor) => {
	openDistSamplingWebview(
		accessor.get(IWebviewWorkbenchService),
		accessor.get(IOpenerService),
		accessor.get(IEditorService),
		accessor.get(IQuickInputService),
		accessor.get(ICommandService),
		accessor.get(IClipboardService),
		accessor.get(INotificationService),
	);
});

CommandsRegistry.registerCommand('chiara.statistics.ds', (accessor: ServicesAccessor) => {
	openDistSamplingWebview(
		accessor.get(IWebviewWorkbenchService),
		accessor.get(IOpenerService),
		accessor.get(IEditorService),
		accessor.get(IQuickInputService),
		accessor.get(ICommandService),
		accessor.get(IClipboardService),
		accessor.get(INotificationService),
	);
});

CommandsRegistry.registerCommand('chiara.statistics.copula', (accessor: ServicesAccessor) => {
	openCevalWebview(
		accessor.get(IWebviewWorkbenchService),
		accessor.get(IOpenerService),
		accessor.get(IEditorService),
		accessor.get(IQuickInputService),
		accessor.get(ICommandService),
		accessor.get(IClipboardService),
		accessor.get(INotificationService),
	);
});

CommandsRegistry.registerCommand('chiara.statistics.copula.estimation', (accessor: ServicesAccessor) => {
	openCopulaWebview(
		accessor.get(IWebviewWorkbenchService),
		accessor.get(IOpenerService),
		accessor.get(IEditorService),
		accessor.get(IQuickInputService),
		accessor.get(ICommandService),
		accessor.get(IClipboardService),
		accessor.get(INotificationService),
	);
});

CommandsRegistry.registerCommand('chiara.statistics.cs', (accessor: ServicesAccessor) => {
	openCopulaSamplingWebview(
		accessor.get(IWebviewWorkbenchService),
		accessor.get(IOpenerService),
		accessor.get(IEditorService),
		accessor.get(IQuickInputService),
		accessor.get(ICommandService),
		accessor.get(IClipboardService),
		accessor.get(INotificationService),
	);
});

CommandsRegistry.registerCommand('chiara.statistics.ar.associationRules', (accessor: ServicesAccessor) => {
	openRuleBasedWebview(
		accessor.get(IWebviewWorkbenchService),
		accessor.get(IOpenerService),
		accessor.get(IEditorService),
		accessor.get(IQuickInputService),
		accessor.get(ICommandService),
		accessor.get(IClipboardService),
		accessor.get(INotificationService),
	);
});

CommandsRegistry.registerCommand('chiara.statistics.ensemble.ensembleLearning', (accessor: ServicesAccessor) => {
	openEnsembleWebview(
		accessor.get(IWebviewWorkbenchService),
		accessor.get(IOpenerService),
		accessor.get(IEditorService),
		accessor.get(IQuickInputService),
		accessor.get(ICommandService),
		accessor.get(IClipboardService),
		accessor.get(INotificationService),
	);
});

CommandsRegistry.registerCommand('chiara.statistics.up', (accessor: ServicesAccessor) => {
	openUpWebview(
		accessor.get(IWebviewWorkbenchService),
		accessor.get(IOpenerService),
		accessor.get(IEditorService),
		accessor.get(IQuickInputService),
		accessor.get(ICommandService),
		accessor.get(IClipboardService),
		accessor.get(INotificationService),
	);
});

const PPL_OPEN = (accessor: ServicesAccessor) => openPplWebview(
	accessor.get(IWebviewWorkbenchService),
	accessor.get(IOpenerService),
	accessor.get(IEditorService),
	accessor.get(IQuickInputService),
	accessor.get(ICommandService),
	accessor.get(IClipboardService),
	accessor.get(INotificationService),
);

CommandsRegistry.registerCommand('chiara.statistics.ppl', PPL_OPEN);
CommandsRegistry.registerCommand('chiara.statistics.ppl.turing', PPL_OPEN);

CommandsRegistry.registerCommand('chiara.statistics.ba.bnet', (accessor: ServicesAccessor) => openBnetWebview(
	accessor.get(IWebviewWorkbenchService),
	accessor.get(IOpenerService),
	accessor.get(IEditorService),
	accessor.get(IQuickInputService),
	accessor.get(ICommandService),
	accessor.get(IClipboardService),
	accessor.get(INotificationService),
));

CommandsRegistry.registerCommand('chiara.statistics.ba.rxinfer', (accessor: ServicesAccessor) => openRxinferWebview(
	accessor.get(IWebviewWorkbenchService),
	accessor.get(IOpenerService),
	accessor.get(IEditorService),
	accessor.get(IQuickInputService),
	accessor.get(ICommandService),
	accessor.get(IClipboardService),
	accessor.get(INotificationService),
));

const SBI_OPEN = (accessor: ServicesAccessor) => openSbiWebview(
	accessor.get(IWebviewWorkbenchService),
	accessor.get(IOpenerService),
	accessor.get(IEditorService),
	accessor.get(IQuickInputService),
	accessor.get(ICommandService),
	accessor.get(IClipboardService),
	accessor.get(INotificationService),
);

CommandsRegistry.registerCommand('chiara.statistics.sbi', SBI_OPEN);
CommandsRegistry.registerCommand('chiara.statistics.nn.node', (accessor: ServicesAccessor) => openNodeWebview(
	accessor.get(IWebviewWorkbenchService),
	accessor.get(IOpenerService),
	accessor.get(IEditorService),
	accessor.get(IQuickInputService),
	accessor.get(ICommandService),
	accessor.get(IClipboardService),
	accessor.get(INotificationService),
));

const EXP_OPEN = (accessor: ServicesAccessor) => openExpWebview(
	accessor.get(IWebviewWorkbenchService),
	accessor.get(IOpenerService),
	accessor.get(IEditorService),
	accessor.get(IQuickInputService),
	accessor.get(ICommandService),
	accessor.get(IClipboardService),
	accessor.get(INotificationService),
);

CommandsRegistry.registerCommand('chiara.statistics.expectation', EXP_OPEN);

CommandsRegistry.registerCommand('chiara.statistics.df', (accessor: ServicesAccessor) => {
	openDfWebview(
		accessor.get(IWebviewWorkbenchService),
		accessor.get(IOpenerService),
		accessor.get(IEditorService),
		accessor.get(IQuickInputService),
		accessor.get(ICommandService),
		accessor.get(IClipboardService),
		accessor.get(INotificationService),
	);
});

CommandsRegistry.registerCommand('chiara.statistics.rng', (accessor: ServicesAccessor) => {
	openRngWebview(
		accessor.get(IWebviewWorkbenchService),
		accessor.get(IOpenerService),
		accessor.get(IEditorService),
		accessor.get(IQuickInputService),
		accessor.get(ICommandService),
		accessor.get(IClipboardService),
		accessor.get(INotificationService),
	);
});

CommandsRegistry.registerCommand('chiara.statistics.qrng', (accessor: ServicesAccessor) => {
	openQrngWebview(
		accessor.get(IWebviewWorkbenchService),
		accessor.get(IOpenerService),
		accessor.get(IEditorService),
		accessor.get(IQuickInputService),
		accessor.get(ICommandService),
		accessor.get(IClipboardService),
		accessor.get(INotificationService),
	);
});

CommandsRegistry.registerCommand('chiara.statistics.nlls', (accessor: ServicesAccessor) => {
	openNllsWebview(
		accessor.get(IWebviewWorkbenchService),
		accessor.get(IOpenerService),
		accessor.get(IEditorService),
		accessor.get(IQuickInputService),
		accessor.get(ICommandService),
		accessor.get(IClipboardService),
		accessor.get(INotificationService),
	);
});

CommandsRegistry.registerCommand('chiara.statistics.pdme', accessor => openScaffoldWebview(accessor, MM_PANEL));

CommandsRegistry.registerCommand('chiara.statistics.lmm', (accessor: ServicesAccessor) => {
	openLmmWebview(
		accessor.get(IWebviewWorkbenchService),
		accessor.get(IOpenerService),
		accessor.get(IEditorService),
		accessor.get(IQuickInputService),
		accessor.get(ICommandService),
		accessor.get(IClipboardService),
		accessor.get(INotificationService),
	);
});

CommandsRegistry.registerCommand('chiara.statistics.glmm', (accessor: ServicesAccessor) => {
	openGlmmWebview(
		accessor.get(IWebviewWorkbenchService),
		accessor.get(IOpenerService),
		accessor.get(IEditorService),
		accessor.get(IQuickInputService),
		accessor.get(ICommandService),
		accessor.get(IClipboardService),
		accessor.get(INotificationService),
	);
});

CommandsRegistry.registerCommand('chiara.statistics.lm', accessor => openScaffoldWebview(accessor, LM_PANEL));
CommandsRegistry.registerCommand('chiara.statistics.lm.ols', accessor => openScaffoldWebview(accessor, LM_PANEL, 'ols'));
CommandsRegistry.registerCommand('chiara.statistics.lm.hac', accessor => openScaffoldWebview(accessor, LM_PANEL, 'ols'));
CommandsRegistry.registerCommand('chiara.statistics.lm.wls', accessor => openScaffoldWebview(accessor, LM_PANEL, 'wls'));
CommandsRegistry.registerCommand('chiara.statistics.rbv', (accessor: ServicesAccessor) => openRvolWebview(
	accessor.get(IWebviewWorkbenchService),
	accessor.get(IOpenerService),
	accessor.get(IEditorService),
	accessor.get(IQuickInputService),
	accessor.get(ICommandService),
	accessor.get(IClipboardService),
	accessor.get(INotificationService),
));
CommandsRegistry.registerCommand('chiara.statistics.lm.hetero', (accessor: ServicesAccessor) => openHareWebview(
	accessor.get(IWebviewWorkbenchService),
	accessor.get(IOpenerService),
	accessor.get(IEditorService),
	accessor.get(IQuickInputService),
	accessor.get(ICommandService),
	accessor.get(IClipboardService),
	accessor.get(INotificationService),
));
CommandsRegistry.registerCommand('chiara.statistics.lm.ar1', (accessor: ServicesAccessor) => openLmarWebview(
	accessor.get(IWebviewWorkbenchService),
	accessor.get(IOpenerService),
	accessor.get(IEditorService),
	accessor.get(IQuickInputService),
	accessor.get(ICommandService),
	accessor.get(IClipboardService),
	accessor.get(INotificationService),
));
CommandsRegistry.registerCommand('chiara.statistics.eco.po', accessor => openScaffoldWebview(accessor, PO_PANEL));
CommandsRegistry.registerCommand('chiara.statistics.eco.oa', (accessor: ServicesAccessor) => openOaWebview(
	accessor.get(IWebviewWorkbenchService),
	accessor.get(IOpenerService),
	accessor.get(IEditorService),
	accessor.get(IQuickInputService),
	accessor.get(ICommandService),
	accessor.get(IClipboardService),
	accessor.get(INotificationService),
));
CommandsRegistry.registerCommand('chiara.statistics.nonlin.cds', (accessor: ServicesAccessor) => openCdsWebview(
	accessor.get(IWebviewWorkbenchService),
	accessor.get(IOpenerService),
	accessor.get(IEditorService),
	accessor.get(IQuickInputService),
	accessor.get(ICommandService),
	accessor.get(IClipboardService),
	accessor.get(INotificationService),
));
CommandsRegistry.registerCommand('chiara.statistics.nonlin.dmap', (accessor: ServicesAccessor) => openDmapWebview(
	accessor.get(IWebviewWorkbenchService),
	accessor.get(IOpenerService),
	accessor.get(IEditorService),
	accessor.get(IQuickInputService),
	accessor.get(ICommandService),
	accessor.get(IClipboardService),
	accessor.get(INotificationService),
));
CommandsRegistry.registerCommand('chiara.statistics.nonlin.attr', (accessor: ServicesAccessor) => openAttrWebview(
	accessor.get(IWebviewWorkbenchService),
	accessor.get(IOpenerService),
	accessor.get(IEditorService),
	accessor.get(IQuickInputService),
	accessor.get(ICommandService),
	accessor.get(IClipboardService),
	accessor.get(INotificationService),
));
CommandsRegistry.registerCommand('chiara.statistics.nonlin.chaos', (accessor: ServicesAccessor) => openChaosWebview(
	accessor.get(IWebviewWorkbenchService),
	accessor.get(IOpenerService),
	accessor.get(IEditorService),
	accessor.get(IQuickInputService),
	accessor.get(ICommandService),
	accessor.get(IClipboardService),
	accessor.get(INotificationService),
));
CommandsRegistry.registerCommand('chiara.statistics.nonlin.cmplx', (accessor: ServicesAccessor) => openCmplxWebview(
	accessor.get(IWebviewWorkbenchService),
	accessor.get(IOpenerService),
	accessor.get(IEditorService),
	accessor.get(IQuickInputService),
	accessor.get(ICommandService),
	accessor.get(IClipboardService),
	accessor.get(INotificationService),
));
CommandsRegistry.registerCommand('chiara.simulate.abm', (accessor: ServicesAccessor) => openAbmWebview(
	accessor.get(IWebviewWorkbenchService),
	accessor.get(IOpenerService),
	accessor.get(IEditorService),
	accessor.get(IQuickInputService),
	accessor.get(ICommandService),
	accessor.get(IClipboardService),
	accessor.get(INotificationService),
));
CommandsRegistry.registerCommand('chiara.simulate.abm-ens', (accessor: ServicesAccessor) => openAbmEnsWebview(
	accessor.get(IWebviewWorkbenchService),
	accessor.get(IOpenerService),
	accessor.get(IEditorService),
	accessor.get(IQuickInputService),
	accessor.get(ICommandService),
	accessor.get(IClipboardService),
	accessor.get(INotificationService),
));
CommandsRegistry.registerCommand('chiara.simulate.abm-viz', (accessor: ServicesAccessor) => openAbmVizWebview(
	accessor.get(IWebviewWorkbenchService),
	accessor.get(IOpenerService),
	accessor.get(IEditorService),
	accessor.get(IQuickInputService),
	accessor.get(ICommandService),
	accessor.get(IClipboardService),
	accessor.get(INotificationService),
));
CommandsRegistry.registerCommand('chiara.simulate.abm-ta', accessor => openScaffoldWebview(accessor, TRAD_PANEL));
CommandsRegistry.registerCommand('chiara.simulate.net', (accessor: ServicesAccessor) => openNetWebview(
	accessor.get(IWebviewWorkbenchService),
	accessor.get(IOpenerService),
	accessor.get(IEditorService),
	accessor.get(IQuickInputService),
	accessor.get(ICommandService),
	accessor.get(IClipboardService),
	accessor.get(INotificationService),
));
CommandsRegistry.registerCommand('chiara.simulate.netdyn', (accessor: ServicesAccessor) => openNetdynWebview(
	accessor.get(IWebviewWorkbenchService),
	accessor.get(IOpenerService),
	accessor.get(IEditorService),
	accessor.get(IQuickInputService),
	accessor.get(ICommandService),
	accessor.get(IClipboardService),
	accessor.get(INotificationService),
));
CommandsRegistry.registerCommand('chiara.simulate.netflow', (accessor: ServicesAccessor) => openNetflowWebview(
	accessor.get(IWebviewWorkbenchService),
	accessor.get(IOpenerService),
	accessor.get(IEditorService),
	accessor.get(IQuickInputService),
	accessor.get(ICommandService),
	accessor.get(IClipboardService),
	accessor.get(INotificationService),
));
CommandsRegistry.registerCommand('chiara.simulate.epi-comp', (accessor: ServicesAccessor) => openEpiCompWebview(
	accessor.get(IWebviewWorkbenchService),
	accessor.get(IOpenerService),
	accessor.get(IEditorService),
	accessor.get(IQuickInputService),
	accessor.get(ICommandService),
	accessor.get(IClipboardService),
	accessor.get(INotificationService),
));
CommandsRegistry.registerCommand('chiara.simulate.epi-ude', (accessor: ServicesAccessor) => openEpiUdeWebview(
	accessor.get(IWebviewWorkbenchService),
	accessor.get(IOpenerService),
	accessor.get(IEditorService),
	accessor.get(IQuickInputService),
	accessor.get(ICommandService),
	accessor.get(IClipboardService),
	accessor.get(INotificationService),
));
CommandsRegistry.registerCommand('chiara.simulate.crn', (accessor: ServicesAccessor) => openCrnWebview(
	accessor.get(IWebviewWorkbenchService),
	accessor.get(IOpenerService),
	accessor.get(IEditorService),
	accessor.get(IQuickInputService),
	accessor.get(ICommandService),
	accessor.get(IClipboardService),
	accessor.get(INotificationService),
));
CommandsRegistry.registerCommand('chiara.statistics.cest', (accessor: ServicesAccessor) => openCestWebview(
	accessor.get(IWebviewWorkbenchService),
	accessor.get(IOpenerService),
	accessor.get(IEditorService),
	accessor.get(IQuickInputService),
	accessor.get(ICommandService),
	accessor.get(IClipboardService),
	accessor.get(INotificationService),
));
CommandsRegistry.registerCommand('chiara.statistics.lm.heteroar1', (accessor: ServicesAccessor) => openLmharWebview(
	accessor.get(IWebviewWorkbenchService),
	accessor.get(IOpenerService),
	accessor.get(IEditorService),
	accessor.get(IQuickInputService),
	accessor.get(ICommandService),
	accessor.get(IClipboardService),
	accessor.get(INotificationService),
));
CommandsRegistry.registerCommand('chiara.statistics.lm.nnls', (accessor: ServicesAccessor) => openNnlsWebview(
	accessor.get(IWebviewWorkbenchService),
	accessor.get(IOpenerService),
	accessor.get(IEditorService),
	accessor.get(IQuickInputService),
	accessor.get(ICommandService),
	accessor.get(IClipboardService),
	accessor.get(INotificationService),
));
CommandsRegistry.registerCommand('chiara.statistics.lm.tsls', (accessor: ServicesAccessor) => openTslsWebview(
	accessor.get(IWebviewWorkbenchService),
	accessor.get(IOpenerService),
	accessor.get(IEditorService),
	accessor.get(IQuickInputService),
	accessor.get(ICommandService),
	accessor.get(IClipboardService),
	accessor.get(INotificationService),
));
CommandsRegistry.registerCommand('chiara.statistics.lm.gmm', (accessor: ServicesAccessor) => openGmmWebview(
	accessor.get(IWebviewWorkbenchService),
	accessor.get(IOpenerService),
	accessor.get(IEditorService),
	accessor.get(IQuickInputService),
	accessor.get(ICommandService),
	accessor.get(IClipboardService),
	accessor.get(INotificationService),
));

const LASSO_OPEN = (accessor: ServicesAccessor, initialMode?: string) => openLassoWebview(
	accessor.get(IWebviewWorkbenchService),
	accessor.get(IOpenerService),
	accessor.get(IEditorService),
	accessor.get(IQuickInputService),
	accessor.get(ICommandService),
	accessor.get(IClipboardService),
	accessor.get(INotificationService),
	initialMode
);

CommandsRegistry.registerCommand('chiara.statistics.rrq', accessor => LASSO_OPEN(accessor, 'lasso'));
CommandsRegistry.registerCommand('chiara.statistics.rrq.lasso', accessor => LASSO_OPEN(accessor, 'lasso'));
CommandsRegistry.registerCommand('chiara.statistics.rrq.elasticNet', accessor => LASSO_OPEN(accessor, 'enet'));

const RQR_OPEN = (accessor: ServicesAccessor, initialMode?: string) => openRqrWebview(
	accessor.get(IWebviewWorkbenchService),
	accessor.get(IOpenerService),
	accessor.get(IEditorService),
	accessor.get(IQuickInputService),
	accessor.get(ICommandService),
	accessor.get(IClipboardService),
	accessor.get(INotificationService),
	initialMode
);

CommandsRegistry.registerCommand('chiara.statistics.rqr', accessor => RQR_OPEN(accessor));
CommandsRegistry.registerCommand('chiara.statistics.rqr.rl0', accessor => RQR_OPEN(accessor, 'rl0'));
CommandsRegistry.registerCommand('chiara.statistics.rqr.rl1l2', accessor => RQR_OPEN(accessor, 'rl1l2'));
CommandsRegistry.registerCommand('chiara.statistics.rqr.ql0', accessor => RQR_OPEN(accessor, 'ql0'));
CommandsRegistry.registerCommand('chiara.statistics.rqr.ql1l2', accessor => RQR_OPEN(accessor, 'ql1l2'));

const SSM_OPEN = (accessor: ServicesAccessor, initialFilter?: string) => openSsmWebview(
	accessor.get(IWebviewWorkbenchService),
	accessor.get(IOpenerService),
	accessor.get(IEditorService),
	accessor.get(IQuickInputService),
	accessor.get(ICommandService),
	accessor.get(IClipboardService),
	accessor.get(INotificationService),
	initialFilter,
);

CommandsRegistry.registerCommand('chiara.statistics.ssm', accessor => SSM_OPEN(accessor));

const VCM_OPEN = (accessor: ServicesAccessor, initialModel?: string) => openVcmWebview(
	accessor.get(IWebviewWorkbenchService),
	accessor.get(IOpenerService),
	accessor.get(IEditorService),
	accessor.get(IQuickInputService),
	accessor.get(ICommandService),
	accessor.get(IClipboardService),
	accessor.get(INotificationService),
	initialModel,
);

CommandsRegistry.registerCommand('chiara.statistics.vcm', accessor => VCM_OPEN(accessor));
CommandsRegistry.registerCommand('chiara.statistics.tvm.dtsv', () => { });

const CTSV_OPEN = (accessor: ServicesAccessor) => openCtsvWebview(
	accessor.get(IWebviewWorkbenchService),
	accessor.get(IOpenerService),
	accessor.get(IEditorService),
	accessor.get(IQuickInputService),
	accessor.get(ICommandService),
	accessor.get(IClipboardService),
	accessor.get(INotificationService),
);

CommandsRegistry.registerCommand('chiara.statistics.tvm.ctsv', accessor => CTSV_OPEN(accessor));
CommandsRegistry.registerCommand('chiara.statistics.dm.heston', accessor => CTSV_OPEN(accessor));
CommandsRegistry.registerCommand('chiara.statistics.jdm.bates', accessor => CTSV_OPEN(accessor));
CommandsRegistry.registerCommand('chiara.statistics.irm.sabr', accessor => CTSV_OPEN(accessor));
CommandsRegistry.registerCommand('chiara.statistics.tvm.taylor', () => { });
CommandsRegistry.registerCommand('chiara.statistics.tvm.ksc', () => { });
CommandsRegistry.registerCommand('chiara.statistics.vm', () => { });
CommandsRegistry.registerCommand('chiara.statistics.eco.hfcme', accessor => openHfcmeWebview(
	accessor.get(IWebviewWorkbenchService),
	accessor.get(IOpenerService),
	accessor.get(IEditorService),
	accessor.get(IQuickInputService),
	accessor.get(ICommandService),
	accessor.get(IClipboardService),
	accessor.get(INotificationService),
));
CommandsRegistry.registerCommand('chiara.statistics.eco.rcme', accessor => openRcmeWebview(
	accessor.get(IWebviewWorkbenchService),
	accessor.get(IOpenerService),
	accessor.get(IEditorService),
	accessor.get(IQuickInputService),
	accessor.get(ICommandService),
	accessor.get(IClipboardService),
	accessor.get(INotificationService),
));
CommandsRegistry.registerCommand('chiara.statistics.eco.bfmb', accessor => openScaffoldWebview(accessor, BFMB_PANEL));
CommandsRegistry.registerCommand('chiara.statistics.eco.blsdf', accessor => openBlsdfWebview(
	accessor.get(IWebviewWorkbenchService),
	accessor.get(IOpenerService),
	accessor.get(IEditorService),
	accessor.get(IQuickInputService),
	accessor.get(ICommandService),
	accessor.get(IClipboardService),
	accessor.get(INotificationService),
));

CommandsRegistry.registerCommand('chiara.statistics.eco.mmn', accessor => openMmnWebview(
	accessor.get(IWebviewWorkbenchService),
	accessor.get(IOpenerService),
	accessor.get(IEditorService),
	accessor.get(IQuickInputService),
	accessor.get(ICommandService),
	accessor.get(IClipboardService),
	accessor.get(INotificationService),
));

CommandsRegistry.registerCommand('chiara.statistics.macro.hpf', accessor => openBcfWebview(
	accessor.get(IWebviewWorkbenchService),
	accessor.get(IOpenerService),
	accessor.get(IEditorService),
	accessor.get(IQuickInputService),
	accessor.get(ICommandService),
	accessor.get(IClipboardService),
	accessor.get(INotificationService),
));

CommandsRegistry.registerCommand('chiara.statistics.macro.dtsvm', accessor => openDtsvWebview(
	accessor.get(IWebviewWorkbenchService),
	accessor.get(IOpenerService),
	accessor.get(IEditorService),
	accessor.get(IQuickInputService),
	accessor.get(ICommandService),
	accessor.get(IClipboardService),
	accessor.get(INotificationService),
));

CommandsRegistry.registerCommand('chiara.statistics.macro.dsge', accessor => openScaffoldWebview(accessor, DSGE_PANEL));
CommandsRegistry.registerCommand('chiara.statistics.macro.ham', (accessor: ServicesAccessor) => openHamWebview(
	accessor.get(IWebviewWorkbenchService),
	accessor.get(IOpenerService),
	accessor.get(IEditorService),
	accessor.get(IQuickInputService),
	accessor.get(ICommandService),
	accessor.get(IClipboardService),
	accessor.get(INotificationService),
));
CommandsRegistry.registerCommand('chiara.statistics.rmt.lrm', accessor => openScaffoldWebview(accessor, LRM_PANEL));
CommandsRegistry.registerCommand('chiara.statistics.ev.gev', (accessor: ServicesAccessor) => openGevWebview(
	accessor.get(IWebviewWorkbenchService),
	accessor.get(IOpenerService),
	accessor.get(IEditorService),
	accessor.get(IQuickInputService),
	accessor.get(ICommandService),
	accessor.get(IClipboardService),
	accessor.get(INotificationService),
));
CommandsRegistry.registerCommand('chiara.statistics.ev.gp', (accessor: ServicesAccessor) => openGpWebview(
	accessor.get(IWebviewWorkbenchService),
	accessor.get(IOpenerService),
	accessor.get(IEditorService),
	accessor.get(IQuickInputService),
	accessor.get(ICommandService),
	accessor.get(IClipboardService),
	accessor.get(INotificationService),
));
CommandsRegistry.registerCommand('chiara.statistics.ev.riskMeasures', (accessor: ServicesAccessor) => openEvtRiskWebview(
	accessor.get(IWebviewWorkbenchService),
	accessor.get(IOpenerService),
	accessor.get(IEditorService),
	accessor.get(IQuickInputService),
	accessor.get(ICommandService),
	accessor.get(IClipboardService),
	accessor.get(INotificationService),
));
CommandsRegistry.registerCommand('chiara.statistics.ev.diagnostics', (accessor: ServicesAccessor) => openEvtDiagWebview(
	accessor.get(IWebviewWorkbenchService),
	accessor.get(IOpenerService),
	accessor.get(IEditorService),
	accessor.get(IQuickInputService),
	accessor.get(ICommandService),
	accessor.get(IClipboardService),
	accessor.get(INotificationService),
));
CommandsRegistry.registerCommand('chiara.statistics.macro.ctmf', (accessor: ServicesAccessor) => openCtmfWebview(
	accessor.get(IWebviewWorkbenchService),
	accessor.get(IOpenerService),
	accessor.get(IEditorService),
	accessor.get(IQuickInputService),
	accessor.get(ICommandService),
	accessor.get(IClipboardService),
	accessor.get(INotificationService),
));
CommandsRegistry.registerCommand('chiara.statistics.macro.gt', (accessor: ServicesAccessor) => openGtWebview(
	accessor.get(IWebviewWorkbenchService),
	accessor.get(IOpenerService),
	accessor.get(IEditorService),
	accessor.get(IQuickInputService),
	accessor.get(ICommandService),
	accessor.get(IClipboardService),
	accessor.get(INotificationService),
));

CommandsRegistry.registerCommand('chiara.statistics.ml.logpdf', accessor => openAdlpWebview(
	accessor.get(IWebviewWorkbenchService),
	accessor.get(IOpenerService),
	accessor.get(IEditorService),
	accessor.get(IQuickInputService),
	accessor.get(ICommandService),
	accessor.get(IClipboardService),
	accessor.get(INotificationService),
));

const ARIMA_OPEN = (accessor: ServicesAccessor) => openArimaWebview(
	accessor.get(IWebviewWorkbenchService),
	accessor.get(IOpenerService),
	accessor.get(IEditorService),
	accessor.get(IQuickInputService),
	accessor.get(ICommandService),
	accessor.get(IClipboardService),
	accessor.get(INotificationService),
);

CommandsRegistry.registerCommand('chiara.statistics.arma.arima', accessor => ARIMA_OPEN(accessor));

const VAR_OPEN = (accessor: ServicesAccessor) => openScaffoldWebview(accessor, VAR_PANEL);

CommandsRegistry.registerCommand('chiara.statistics.arma.varModels', accessor => VAR_OPEN(accessor));
//CommandsRegistry.registerCommand('chiara.statistics.tvm.heston', accessor => CTSV_OPEN(accessor, 'heston'));
//CommandsRegistry.registerCommand('chiara.statistics.tvm.sabr',   accessor => CTSV_OPEN(accessor, 'sabr'));
//CommandsRegistry.registerCommand('chiara.statistics.tvm.bates',  accessor => CTSV_OPEN(accessor, 'bates'));

const TTE_OPEN = (accessor: ServicesAccessor, initialMethod?: string) => openTteWebview(
	accessor.get(IWebviewWorkbenchService),
	accessor.get(IOpenerService),
	accessor.get(IEditorService),
	accessor.get(IQuickInputService),
	accessor.get(ICommandService),
	accessor.get(IClipboardService),
	accessor.get(INotificationService),
	initialMethod,
);

CommandsRegistry.registerCommand('chiara.statistics.tte', accessor => TTE_OPEN(accessor));

const PTP_OPEN = (accessor: ServicesAccessor, initialModel?: string) => openPtpWebview(
	accessor.get(IWebviewWorkbenchService),
	accessor.get(IOpenerService),
	accessor.get(IEditorService),
	accessor.get(IQuickInputService),
	accessor.get(ICommandService),
	accessor.get(IClipboardService),
	accessor.get(INotificationService),
	initialModel,
);

CommandsRegistry.registerCommand('chiara.statistics.pp', accessor => PTP_OPEN(accessor));

const NSCR_OPEN = (accessor: ServicesAccessor, initialMethod?: string) => openNscrWebview(
	accessor.get(IWebviewWorkbenchService),
	accessor.get(IOpenerService),
	accessor.get(IEditorService),
	accessor.get(IQuickInputService),
	accessor.get(ICommandService),
	accessor.get(IClipboardService),
	accessor.get(INotificationService),
	initialMethod,
);

CommandsRegistry.registerCommand('chiara.statistics.nscr', accessor => NSCR_OPEN(accessor));

const TSF_OPEN = (accessor: ServicesAccessor, initialMethod?: string) => openTsfWebview(
	accessor.get(IWebviewWorkbenchService),
	accessor.get(IOpenerService),
	accessor.get(IEditorService),
	accessor.get(IQuickInputService),
	accessor.get(ICommandService),
	accessor.get(IClipboardService),
	accessor.get(INotificationService),
	initialMethod,
);

CommandsRegistry.registerCommand('chiara.statistics.tsf', accessor => TSF_OPEN(accessor));

const NNTSF_OPEN = (accessor: ServicesAccessor, initialMethod?: string) => openNntsfWebview(
	accessor.get(IWebviewWorkbenchService),
	accessor.get(IOpenerService),
	accessor.get(IEditorService),
	accessor.get(IQuickInputService),
	accessor.get(ICommandService),
	accessor.get(IClipboardService),
	accessor.get(INotificationService),
	initialMethod,
);

CommandsRegistry.registerCommand('chiara.statistics.nntsf', accessor => NNTSF_OPEN(accessor));

const ATSF_OPEN = (accessor: ServicesAccessor, initialMethod?: string) => openAtsfWebview(
	accessor.get(IWebviewWorkbenchService),
	accessor.get(IOpenerService),
	accessor.get(IEditorService),
	accessor.get(IQuickInputService),
	accessor.get(ICommandService),
	accessor.get(IClipboardService),
	accessor.get(INotificationService),
	initialMethod,
);

CommandsRegistry.registerCommand('chiara.statistics.atsf', accessor => ATSF_OPEN(accessor));

CommandsRegistry.registerCommand('chiara.statistics.si', (accessor: ServicesAccessor) => openSiWebview(
	accessor.get(IWebviewWorkbenchService),
	accessor.get(IOpenerService),
	accessor.get(IEditorService),
	accessor.get(IQuickInputService),
	accessor.get(ICommandService),
	accessor.get(IClipboardService),
	accessor.get(INotificationService),
));

CommandsRegistry.registerCommand('chiara.statistics.ode', (accessor: ServicesAccessor) => openOdeWebview(
	accessor.get(IWebviewWorkbenchService),
	accessor.get(IOpenerService),
	accessor.get(IEditorService),
	accessor.get(IQuickInputService),
	accessor.get(ICommandService),
	accessor.get(IClipboardService),
	accessor.get(INotificationService),
));

CommandsRegistry.registerCommand('chiara.mp.lp', (accessor: ServicesAccessor) => openLpWebview(
	accessor.get(IWebviewWorkbenchService),
	accessor.get(IOpenerService),
	accessor.get(IEditorService),
	accessor.get(IQuickInputService),
	accessor.get(ICommandService),
	accessor.get(IClipboardService),
	accessor.get(INotificationService),
));

CommandsRegistry.registerCommand('chiara.mp.milp', (accessor: ServicesAccessor) => openLpWebview(
	accessor.get(IWebviewWorkbenchService),
	accessor.get(IOpenerService),
	accessor.get(IEditorService),
	accessor.get(IQuickInputService),
	accessor.get(ICommandService),
	accessor.get(IClipboardService),
	accessor.get(INotificationService),
	'milp',
));

CommandsRegistry.registerCommand('chiara.mp.qp', (accessor: ServicesAccessor) => openQpWebview(
	accessor.get(IWebviewWorkbenchService),
	accessor.get(IOpenerService),
	accessor.get(IEditorService),
	accessor.get(IQuickInputService),
	accessor.get(ICommandService),
	accessor.get(IClipboardService),
	accessor.get(INotificationService),
));

CommandsRegistry.registerCommand('chiara.mp.qcqp', (accessor: ServicesAccessor) => openQpWebview(
	accessor.get(IWebviewWorkbenchService),
	accessor.get(IOpenerService),
	accessor.get(IEditorService),
	accessor.get(IQuickInputService),
	accessor.get(ICommandService),
	accessor.get(IClipboardService),
	accessor.get(INotificationService),
	'qcqp',
));

CommandsRegistry.registerCommand('chiara.mp.miqp', (accessor: ServicesAccessor) => openQpWebview(
	accessor.get(IWebviewWorkbenchService),
	accessor.get(IOpenerService),
	accessor.get(IEditorService),
	accessor.get(IQuickInputService),
	accessor.get(ICommandService),
	accessor.get(IClipboardService),
	accessor.get(INotificationService),
	'miqp',
));

CommandsRegistry.registerCommand('chiara.mp.nlp', (accessor: ServicesAccessor) => openMpnlpWebview(
	accessor.get(IWebviewWorkbenchService),
	accessor.get(IOpenerService),
	accessor.get(IEditorService),
	accessor.get(IQuickInputService),
	accessor.get(ICommandService),
	accessor.get(IClipboardService),
	accessor.get(INotificationService),
));

CommandsRegistry.registerCommand('chiara.mp.minlp', (accessor: ServicesAccessor) => openMpnlpWebview(
	accessor.get(IWebviewWorkbenchService),
	accessor.get(IOpenerService),
	accessor.get(IEditorService),
	accessor.get(IQuickInputService),
	accessor.get(ICommandService),
	accessor.get(IClipboardService),
	accessor.get(INotificationService),
	'minlp',
));

CommandsRegistry.registerCommand('chiara.mp.cone', (accessor: ServicesAccessor) => openMpconeWebview(
	accessor.get(IWebviewWorkbenchService),
	accessor.get(IOpenerService),
	accessor.get(IEditorService),
	accessor.get(IQuickInputService),
	accessor.get(ICommandService),
	accessor.get(IClipboardService),
	accessor.get(INotificationService),
));

CommandsRegistry.registerCommand('chiara.mp.sdp', (accessor: ServicesAccessor) => openMpsdpWebview(
	accessor.get(IWebviewWorkbenchService),
	accessor.get(IOpenerService),
	accessor.get(IEditorService),
	accessor.get(IQuickInputService),
	accessor.get(ICommandService),
	accessor.get(IClipboardService),
	accessor.get(INotificationService),
));

CommandsRegistry.registerCommand('chiara.mp.sos', (accessor: ServicesAccessor) => openMpsosWebview(
	accessor.get(IWebviewWorkbenchService),
	accessor.get(IOpenerService),
	accessor.get(IEditorService),
	accessor.get(IQuickInputService),
	accessor.get(ICommandService),
	accessor.get(IClipboardService),
	accessor.get(INotificationService),
));

const DT_OPEN = (accessor: ServicesAccessor, initialModel?: string) => openDtWebview(
	accessor.get(IWebviewWorkbenchService),
	accessor.get(IOpenerService),
	accessor.get(IEditorService),
	accessor.get(IQuickInputService),
	accessor.get(ICommandService),
	accessor.get(IClipboardService),
	accessor.get(INotificationService),
	initialModel,
);

CommandsRegistry.registerCommand('chiara.statistics.dtrf.dt', accessor => DT_OPEN(accessor));
CommandsRegistry.registerCommand('chiara.statistics.dtrf.modalDt', accessor => DT_OPEN(accessor));
CommandsRegistry.registerCommand('chiara.statistics.dtrf.randomDt', accessor => DT_OPEN(accessor));

const CLP_OPEN = (accessor: ServicesAccessor, initialModel?: string) => openClpWebview(
	accessor.get(IWebviewWorkbenchService),
	accessor.get(IOpenerService),
	accessor.get(IEditorService),
	accessor.get(IQuickInputService),
	accessor.get(ICommandService),
	accessor.get(IClipboardService),
	accessor.get(INotificationService),
	initialModel,
);

CommandsRegistry.registerCommand('chiara.statistics.cl.partitional', accessor => CLP_OPEN(accessor));

CommandsRegistry.registerCommand('chiara.statistics.cl.hierarchical', (accessor: ServicesAccessor) => openClhWebview(
	accessor.get(IWebviewWorkbenchService),
	accessor.get(IOpenerService),
	accessor.get(IEditorService),
	accessor.get(IQuickInputService),
	accessor.get(ICommandService),
	accessor.get(IClipboardService),
	accessor.get(INotificationService),
));

CommandsRegistry.registerCommand('chiara.statistics.pm.manifold', (accessor: ServicesAccessor) => openManifoldWebview(
	accessor.get(IWebviewWorkbenchService),
	accessor.get(IOpenerService),
	accessor.get(IEditorService),
	accessor.get(IQuickInputService),
	accessor.get(ICommandService),
	accessor.get(IClipboardService),
	accessor.get(INotificationService),
));

CommandsRegistry.registerCommand('chiara.statistics.pm.embedding', (accessor: ServicesAccessor) => openEmbeddingWebview(
	accessor.get(IWebviewWorkbenchService),
	accessor.get(IOpenerService),
	accessor.get(IEditorService),
	accessor.get(IQuickInputService),
	accessor.get(ICommandService),
	accessor.get(IClipboardService),
	accessor.get(INotificationService),
));

CommandsRegistry.registerCommand('chiara.statistics.pm.autoencoder', (accessor: ServicesAccessor) => openAutoencoderWebview(
	accessor.get(IWebviewWorkbenchService),
	accessor.get(IOpenerService),
	accessor.get(IEditorService),
	accessor.get(IQuickInputService),
	accessor.get(ICommandService),
	accessor.get(IClipboardService),
	accessor.get(INotificationService),
));

CommandsRegistry.registerCommand('chiara.statistics.pm.lca', (accessor: ServicesAccessor) => openLcaWebview(
	accessor.get(IWebviewWorkbenchService),
	accessor.get(IOpenerService),
	accessor.get(IEditorService),
	accessor.get(IQuickInputService),
	accessor.get(ICommandService),
	accessor.get(IClipboardService),
	accessor.get(INotificationService),
));

CommandsRegistry.registerCommand('chiara.statistics.pm.cca', (accessor: ServicesAccessor) => openCcaWebview(
	accessor.get(IWebviewWorkbenchService),
	accessor.get(IOpenerService),
	accessor.get(IEditorService),
	accessor.get(IQuickInputService),
	accessor.get(ICommandService),
	accessor.get(IClipboardService),
	accessor.get(INotificationService),
));

CommandsRegistry.registerCommand('chiara.statistics.pm.covShrinkage', (accessor: ServicesAccessor) => openCovShrinkageWebview(
	accessor.get(IWebviewWorkbenchService),
	accessor.get(IOpenerService),
	accessor.get(IEditorService),
	accessor.get(IQuickInputService),
	accessor.get(ICommandService),
	accessor.get(IClipboardService),
	accessor.get(INotificationService),
));

CommandsRegistry.registerCommand('chiara.statistics.vm', accessor => openScaffoldWebview(accessor, VM_PANEL));

CommandsRegistry.registerCommand('chiara.statistics.mwm.regressionPerf', (accessor: ServicesAccessor) => openRpWebview(
	accessor.get(IWebviewWorkbenchService),
	accessor.get(IOpenerService),
	accessor.get(IEditorService),
	accessor.get(IQuickInputService),
	accessor.get(ICommandService),
	accessor.get(IClipboardService),
	accessor.get(INotificationService),
));

const HPT_OPEN = (accessor: ServicesAccessor, initialModel?: string) => openHptWebview(
	accessor.get(IWebviewWorkbenchService),
	accessor.get(IOpenerService),
	accessor.get(IEditorService),
	accessor.get(IQuickInputService),
	accessor.get(ICommandService),
	accessor.get(IClipboardService),
	accessor.get(INotificationService),
	initialModel,
);

CommandsRegistry.registerCommand('chiara.statistics.mwm.hpt', accessor => HPT_OPEN(accessor));

const MC_OPEN = (accessor: ServicesAccessor, initialModel?: string) => openMcWebview(
	accessor.get(IWebviewWorkbenchService),
	accessor.get(IOpenerService),
	accessor.get(IEditorService),
	accessor.get(IQuickInputService),
	accessor.get(ICommandService),
	accessor.get(IClipboardService),
	accessor.get(INotificationService),
	initialModel,
);

CommandsRegistry.registerCommand('chiara.statistics.mwm.calibration', accessor => MC_OPEN(accessor));

const CV_OPEN = (accessor: ServicesAccessor) => openCvWebview(
	accessor.get(IWebviewWorkbenchService),
	accessor.get(IOpenerService),
	accessor.get(IEditorService),
	accessor.get(IQuickInputService),
	accessor.get(ICommandService),
	accessor.get(IClipboardService),
	accessor.get(INotificationService),
);

CommandsRegistry.registerCommand('chiara.statistics.mwm.dataPartition', accessor => CV_OPEN(accessor));
CommandsRegistry.registerCommand('chiara.statistics.mwm.trainTestSplit', accessor => CV_OPEN(accessor));
CommandsRegistry.registerCommand('chiara.statistics.mwm.kfoldCV', accessor => CV_OPEN(accessor));
CommandsRegistry.registerCommand('chiara.statistics.mwm.stratifiedKfold', accessor => CV_OPEN(accessor));
CommandsRegistry.registerCommand('chiara.statistics.mwm.loocv', accessor => CV_OPEN(accessor));

const CLF_OPEN = (accessor: ServicesAccessor, initialModel?: string) => openClfWebview(
	accessor.get(IWebviewWorkbenchService),
	accessor.get(IOpenerService),
	accessor.get(IEditorService),
	accessor.get(IQuickInputService),
	accessor.get(ICommandService),
	accessor.get(IClipboardService),
	accessor.get(INotificationService),
	initialModel,
);

CommandsRegistry.registerCommand('chiara.statistics.mwm.classificationPerf', accessor => CLF_OPEN(accessor, 'metrics'));
CommandsRegistry.registerCommand('chiara.statistics.mwm.roc', accessor => CLF_OPEN(accessor, 'roc'));

CommandsRegistry.registerCommand('chiara.statistics.knn', (accessor: ServicesAccessor) => openKnnWebview(
	accessor.get(IWebviewWorkbenchService),
	accessor.get(IOpenerService),
	accessor.get(IEditorService),
	accessor.get(IQuickInputService),
	accessor.get(ICommandService),
	accessor.get(IClipboardService),
	accessor.get(INotificationService),
));

const RNN_OPEN = (accessor: ServicesAccessor, initialModel?: string) => openRnnWebview(
	accessor.get(IWebviewWorkbenchService),
	accessor.get(IOpenerService),
	accessor.get(IEditorService),
	accessor.get(IQuickInputService),
	accessor.get(ICommandService),
	accessor.get(IClipboardService),
	accessor.get(INotificationService),
	initialModel,
);

CommandsRegistry.registerCommand('chiara.statistics.nn.rnn', accessor => RNN_OPEN(accessor));

registerPlutoCommands();
registerNewJuliaFileCommand();

CommandsRegistry.registerCommand('chiara.statistics.nn.rl', accessor => openScaffoldWebview(accessor, RL_PANEL));

CommandsRegistry.registerCommand('chiara.statistics.nn.cnn', (accessor: ServicesAccessor) => openCnnWebview(
	accessor.get(IWebviewWorkbenchService),
	accessor.get(IOpenerService),
	accessor.get(IEditorService),
	accessor.get(IQuickInputService),
	accessor.get(ICommandService),
	accessor.get(IClipboardService),
	accessor.get(INotificationService),
));

CommandsRegistry.registerCommand('chiara.statistics.nn.gnn', (accessor: ServicesAccessor) => openGnnWebview(
	accessor.get(IWebviewWorkbenchService),
	accessor.get(IOpenerService),
	accessor.get(IEditorService),
	accessor.get(IQuickInputService),
	accessor.get(ICommandService),
	accessor.get(IClipboardService),
	accessor.get(INotificationService),
));

CommandsRegistry.registerCommand('chiara.statistics.nn.transformer', (accessor: ServicesAccessor) => openTransformerWebview(
	accessor.get(IWebviewWorkbenchService),
	accessor.get(IOpenerService),
	accessor.get(IEditorService),
	accessor.get(IQuickInputService),
	accessor.get(ICommandService),
	accessor.get(IClipboardService),
	accessor.get(INotificationService),
));

CommandsRegistry.registerCommand('chiara.statistics.nn.nf', (accessor: ServicesAccessor) => openNfWebview(
	accessor.get(IWebviewWorkbenchService),
	accessor.get(IOpenerService),
	accessor.get(IEditorService),
	accessor.get(IQuickInputService),
	accessor.get(ICommandService),
	accessor.get(IClipboardService),
	accessor.get(INotificationService),
));

CommandsRegistry.registerCommand('chiara.statistics.nn.fnn', (accessor: ServicesAccessor) => openFnnWebview(
	accessor.get(IWebviewWorkbenchService),
	accessor.get(IOpenerService),
	accessor.get(IEditorService),
	accessor.get(IQuickInputService),
	accessor.get(ICommandService),
	accessor.get(IClipboardService),
	accessor.get(INotificationService),
));

const GLM_SERVICES = (accessor: ServicesAccessor, initialFamily?: string) => openScaffoldWebview(accessor, GLM_PANEL, initialFamily);

CommandsRegistry.registerCommand('chiara.statistics.glm', accessor => GLM_SERVICES(accessor));
CommandsRegistry.registerCommand('chiara.statistics.glm.binary', accessor => GLM_SERVICES(accessor, 'Bernoulli'));
CommandsRegistry.registerCommand('chiara.statistics.glm.count', accessor => GLM_SERVICES(accessor, 'Poisson'));
CommandsRegistry.registerCommand('chiara.statistics.glm.overdispersed', accessor => GLM_SERVICES(accessor, 'NegativeBinomial'));
CommandsRegistry.registerCommand('chiara.statistics.glm.fractional', accessor => GLM_SERVICES(accessor, 'Binomial'));
CommandsRegistry.registerCommand('chiara.statistics.glm.positive', accessor => GLM_SERVICES(accessor, 'Gamma'));


// ============================================
// SUBMENU IDs
// ============================================

const RQRSubmenuId = new MenuId('menubarRQRSubmenu');
const MWMSubmenuId = new MenuId('menubarMWMSubmenu');
export const EVSubmenuId = new MenuId('menubarEVSubmenu');
const GAMSubmenuId = new MenuId('menubarGAMSubmenu');
const BRMSubmenuId = new MenuId('menubarBRMSubmenu');
const LMSubmenuId = new MenuId('menubarLMSubmenu'); // Linear Models
const SASubmenuId = new MenuId('menubarSASubmenu');
const KMSubmenuId = new MenuId('menubarKMSubmenu');
const NBSubmenuId = new MenuId('menubarNBSubmenu');
// const DTRFSubmenuId = new MenuId('menubarDTRFSubmenu');
const NNSubmenuId = new MenuId('menubarNNSubmenu');
const CLSubmenuId = new MenuId('menubarCLSubmenu');
const PMSubmenuId = new MenuId('menubarPMSubmenu');
const DASubmenuId = new MenuId('menubarDASubmenu');

//const VMSubmenuId = new MenuId('menubarVMSubmenu');
// Financial Instruments Toolbox, Macroeconomic Models, Finance Toolbox, Risk Management — now in Explore menu
//const DTSVSubmenuId = new MenuId('menubarDTSVSubmenu');
//const CTSVSubmenuId = new MenuId('menubarCTSVSubmenu');
// Finance Toolbox, Risk Management Toolbox — now in Explore menu
const DistSubmenuId = new MenuId('menubarDistSubmenu');   // Distributions
const CopulaSubmenuId = new MenuId('menubarCopulaSubmenu'); // Copulas
const BASubmenuId = new MenuId('menubarBASubmenu');     // Bayesian Analysis
const NDSubmenuId = new MenuId('menubarNDSubmenu');     // Nonlinear Dynamics
const NLPSubmenuId = new MenuId('menubarNLPSubmenu'); // Natural Language Processing
const DocRepSubmenuId = new MenuId('menubarDocRepSubmenu'); // Document Representation
const TopicModelsSubmenuId = new MenuId('menubarTopicModelsSubmenu'); // Topic & Semantic Models
// ============================================
// COMMAND IDs
// ============================================

// Model Workflow Management
export const MWM_DATA_PARTITION_ID = 'chiara.statistics.mwm.dataPartition';
export const MWM_TRAIN_TEST_SPLIT_ID = 'chiara.statistics.mwm.trainTestSplit';
export const MWM_KFOLD_CV_ID = 'chiara.statistics.mwm.kfoldCV';
export const MWM_STRATIFIED_KFOLD_ID = 'chiara.statistics.mwm.stratifiedKfold';
export const MWM_LOOCV_ID = 'chiara.statistics.mwm.loocv';
export const MWM_CLASSIFICATION_PERF_ID = 'chiara.statistics.mwm.classificationPerf';
export const MWM_REGRESSION_PERF_ID = 'chiara.statistics.mwm.regressionPerf';
export const MWM_ROC_ID = 'chiara.statistics.mwm.roc';
export const MWM_HPT_ID = 'chiara.statistics.mwm.hpt';
export const MWM_CALIBRATION_ID = 'chiara.statistics.mwm.calibration';

// Copula Models
export const COPULA_COMMAND_ID = 'chiara.statistics.copula';
export const CPS_COMMAND_ID = 'chiara.statistics.cs';

// Random Number Generators
export const RNG_COMMAND_ID = 'chiara.statistics.rng';

// Quasi–Random Number Generators
export const QRNG_COMMAND_ID = 'chiara.statistics.qrng';

// Distributions
export const D_COMMAND_ID = 'chiara.statistics.d';
export const DF_COMMAND_ID = 'chiara.statistics.df';

// export const D_DISCRETE_ID = 'chiara.statistics.d.discrete';
// export const D_CONTINUOUS_ID = 'chiara.statistics.d.continuous';
// export const D_TRUNCATED_ID = 'chiara.statistics.d.truncated';
// export const D_CENSORED_ID = 'chiara.statistics.d.censored';
// export const D_MULTIVARIATE_ID = 'chiara.statistics.d.multivariate';
// export const D_MATRIX_VARIATE_ID = 'chiara.statistics.d.matrixVariate';
// export const D_MIXTURE_MODELS_ID = 'chiara.statistics.d.mixtureModels';
// export const D_PRODUCT_ID = 'chiara.statistics.d.product';
// export const D_CONVOLUTIONS_ID = 'chiara.statistics.d.convolutions';

// Time-Series Simulation
export const TSS_COMMAND_ID = 'chiara.statistics.tss';

// Diffusion Process Simulation
export const DPS_COMMAND_ID = 'chiara.statistics.dps';

// Uncertainty Propagation
export const UP_COMMAND_ID = 'chiara.statistics.up';

// Anomaly and Novelty Detection
export const NOD_RS_COMMAND_ID = 'chiara.statistics.nod.rs';
export const NOD_DISTANCE_BASED_ID = 'chiara.statistics.nod.distanceBased';
export const NOD_LOCAL_OUTLIER_ID = 'chiara.statistics.nod.localOutlier';
export const NOD_CONNECTIVITY_ID = 'chiara.statistics.nod.connectivity';
export const NOD_ANGLE_BASED_ID = 'chiara.statistics.nod.angleBased';
export const NOD_AUTOENCODER_ID = 'chiara.statistics.nod.autoencoder';
export const NOD_DEEP_SEMISUPERVISED_ID = 'chiara.statistics.nod.deepSemiSupervised';
export const NOD_E2E_SEMISUPERVISED_ID = 'chiara.statistics.nod.e2eSemiSupervised';
export const NOD_LINEAR_REGRESSION_ID = 'chiara.statistics.nod.linearRegression';

// Density Estimation

// Extreme Value and Rare Events
export const EV_GEV_ID = 'chiara.statistics.ev.gev';
export const EV_GP_ID = 'chiara.statistics.ev.gp';
export const EV_RETURN_STATS_ID = 'chiara.statistics.ev.returnStats';
export const EV_MEAN_EXCESS_ID = 'chiara.statistics.ev.meanExcess';
export const EV_RISK_MEASURES_ID = 'chiara.statistics.ev.riskMeasures';
export const EV_DIAGNOSTICS_ID = 'chiara.statistics.ev.diagnostics';

// Dependence Modeling and Estimation
export const COV_SIMPLE_ID = 'chiara.statistics.cov.simple';
export const COV_HF_SIMPLE_ID = 'chiara.statistics.cov.hfSimple';
export const COV_MRK_ID = 'chiara.statistics.cov.mrk';
export const COV_PREAVG_ID = 'chiara.statistics.cov.preavg';
export const COV_SLMM_ID = 'chiara.statistics.cov.slmm';
export const COV_TWO_SCALES_ID = 'chiara.statistics.cov.twoScales';
export const COV_PARTIAL_ID = 'chiara.statistics.cov.partial';
export const COV_LINEAR_SHRINKAGE_ID = 'chiara.statistics.cov.linearShrinkage';
export const COV_NONLINEAR_SHRINKAGE_ID = 'chiara.statistics.cov.nonlinearShrinkage';
export const COV_WOODBURY_ID = 'chiara.statistics.cov.woodbury';
export const COV_BIWEIGHT_ID = 'chiara.statistics.cov.biweight';
export const COV_EIGENVALUE_FILTER_ID = 'chiara.statistics.cov.eigenvalueFilter';
export const COV_NEAREST_PSD_ID = 'chiara.statistics.cov.nearestPsd';
export const COV_COPULAS_MODEL_ID = 'chiara.statistics.cov.copulasModel';
export const COV_COPULAS_EST_ID = 'chiara.statistics.cov.copulasEst';

// Hypothesis Testing
export const HT_COMMAND_ID = 'chiara.statistics.ht';
// export const HT_Z_TEST_ID = 'chiara.statistics.ht.zTest';
// export const HT_T_TEST_ID = 'chiara.statistics.ht.tTest';
// export const HT_F_TEST_ID = 'chiara.statistics.ht.fTest';
// export const HT_ANOVA_ID = 'chiara.statistics.ht.anova';
// export const HT_LEVENE_ID = 'chiara.statistics.ht.levene';
// export const HT_BROWN_FORSYTHE_ID = 'chiara.statistics.ht.brownForsythe';
// export const HT_POWER_DIVERGENCE_ID = 'chiara.statistics.ht.powerDivergence';
// export const HT_CHI_SQUARED_ID = 'chiara.statistics.ht.chiSquared';
// export const HT_MULTINOMIAL_LR_ID = 'chiara.statistics.ht.multinomialLR';
// export const HT_ANDERSON_DARLING_ID = 'chiara.statistics.ht.andersonDarling';
// export const HT_KS_TEST_ID = 'chiara.statistics.ht.ksTest';
// export const HT_SHAPIRO_WILK_ID = 'chiara.statistics.ht.shapiroWilk';
// export const HT_BINOMIAL_ID = 'chiara.statistics.ht.binomial';
// export const HT_FISHER_EXACT_ID = 'chiara.statistics.ht.fisherExact';
// export const HT_KRUSKAL_WALLIS_ID = 'chiara.statistics.ht.kruskalWallis';
// export const HT_MANN_WHITNEY_ID = 'chiara.statistics.ht.mannWhitney';
// export const HT_WILCOXON_ID = 'chiara.statistics.ht.wilcoxon';
// export const HT_SIGN_TEST_ID = 'chiara.statistics.ht.signTest';
// export const HT_PERMUTATION_ID = 'chiara.statistics.ht.permutation';
// export const HT_WALD_WOLFOWITZ_ID = 'chiara.statistics.ht.waldWolfowitz';
// export const HT_FLIGNER_KILLEEN_ID = 'chiara.statistics.ht.flignerKilleen';
// export const HT_DURBIN_WATSON_ID = 'chiara.statistics.ht.durbinWatson';
// export const HT_BOX_PIERCE_ID = 'chiara.statistics.ht.boxPierce';
// export const HT_LJUNG_BOX_ID = 'chiara.statistics.ht.ljungBox';
// export const HT_BREUSCH_GODFREY_ID = 'chiara.statistics.ht.breuschGodfrey';
// export const HT_ADF_ID = 'chiara.statistics.ht.adf';
// export const HT_CLARK_WEST_ID = 'chiara.statistics.ht.clarkWest';
// export const HT_DIEBOLD_MARIANO_ID = 'chiara.statistics.ht.dieboldMariano';
// export const HT_WHITE_ID = 'chiara.statistics.ht.white';
// export const HT_JARQUE_BERA_ID = 'chiara.statistics.ht.jarqueBera';
// export const HT_HOTELLING_T2_ID = 'chiara.statistics.ht.hotellingT2';
// export const HT_EQUALITY_COV_ID = 'chiara.statistics.ht.equalityCov';
// export const HT_CORRELATION_ID = 'chiara.statistics.ht.correlation';

// Linear Models
export const LM_COMMAND_ID = 'chiara.statistics.lm';

// Generalized Linear Models (GLM)
export const GLM_COMMAND_ID = 'chiara.statistics.glm';
// export const GLM_BINARY_ID = 'chiara.statistics.glm.binary';
// export const GLM_COUNT_ID = 'chiara.statistics.glm.count';
// export const GLM_OVERDISPERSED_ID = 'chiara.statistics.glm.overdispersed';
// export const GLM_FRACTIONAL_ID = 'chiara.statistics.glm.fractional';
// export const GLM_POSITIVE_ID = 'chiara.statistics.glm.positive';

// Generalized Additive Models (GAM)
export const GAM_NORMAL_ID = 'chiara.statistics.gam.normal';
export const GAM_POISSON_ID = 'chiara.statistics.gam.poisson';
export const GAM_GAMMA_ID = 'chiara.statistics.gam.gamma';

// Nonlinear Models
export const NLREG_COMMAND_ID = 'chiara.statistics.nlls';

// Regularized Regression
export const RR_LASSO_ID = 'chiara.statistics.rrq';

// Robust and Quantile Regression
export const RQR_COMMAND_ID = 'chiara.statistics.rqr';
export const RQR_ROBUST_L0_ID = 'chiara.statistics.rqr.rl0';
export const RQR_ROBUST_L1L2_ID = 'chiara.statistics.rqr.rl1l2';
export const RQR_QUANTILE_NO_PENALTY_ID = 'chiara.statistics.rqr.ql0';
export const RQR_QUANTILE_L1L2_ID = 'chiara.statistics.rqr.ql1l2';


// Panel Data and Mixed-Effects
// export const PDME_MEPD_COMMAND_ID = 'chiara.statistics.pdme';
export const LMM_COMMAND_ID = 'chiara.statistics.lmm';
export const GLMM_COMMAND_ID = 'chiara.statistics.glmm';

// Residual Covariance Matrix Estimation
export const RC_HAC_KERNEL_ID = 'chiara.statistics.rc.hacKernel';
export const RC_HAC_EXPO_ID = 'chiara.statistics.rc.hacExpo';
export const RC_HAC_SMOOTHED_ID = 'chiara.statistics.rc.hacSmoothed';
export const RC_HC_ID = 'chiara.statistics.rc.hc';
export const RC_CLUSTER_ROBUST_ID = 'chiara.statistics.rc.clusterRobust';
export const RC_DRISCOLL_KRAAY_ID = 'chiara.statistics.rc.driscollKraay';

// Resampling Methods
export const BRM_RANDOM_ID = 'chiara.statistics.brm.random';
export const BRM_ANTITHETIC_ID = 'chiara.statistics.brm.antithetic';
export const BRM_BALANCED_ID = 'chiara.statistics.brm.balanced';
export const BRM_GLM_ID = 'chiara.statistics.brm.glm';
export const BRM_MAX_ENTROPY_ID = 'chiara.statistics.brm.maxEntropy';
export const BRM_MOVING_BLOCK_ID = 'chiara.statistics.brm.movingBlock';
export const BRM_STATIONARY_BLOCK_ID = 'chiara.statistics.brm.stationaryBlock';
export const BRM_BLOCK_JACKKNIFE_ID = 'chiara.statistics.brm.blockJackknife';
export const BRM_ARTIFICIAL_JACKKNIFE_ID = 'chiara.statistics.brm.artificialJackknife';

// Advanced Time-Series Forecasting
export const ATSF_COMMAND_ID = 'chiara.statistics.atsf';

// Time-Series Smoothing and Decomposition
export const TSSD_ROLLING_ID = 'chiara.statistics.tssd.rolling';
export const TSSD_LOESS_ID = 'chiara.statistics.tssd.loess';
export const TSSD_LOCAL_POLY_ID = 'chiara.statistics.tssd.localPoly';
export const TSSD_TREND_FILTER_ID = 'chiara.statistics.tssd.trendFilter';
export const TSSD_SEASONAL_ADJ_ID = 'chiara.statistics.tssd.seasonalAdj';
export const TSSD_ETS_ID = 'chiara.statistics.ssm.ets';
export const TSSD_X13_ID = 'chiara.statistics.tssd.x13';
export const TSSD_INTERMITTENT_ID = 'chiara.statistics.tssd.intermittent';

// ARIMA/VAR Models
export const ARMA_ACAC_ID = 'chiara.statistics.arma.acac';
export const ARMA_PAF_ID = 'chiara.statistics.arma.paf';
export const ARMA_CCCC_ID = 'chiara.statistics.arma.cccc';
export const ARMA_ARIMA_ID = 'chiara.statistics.arma.arima';
export const ARMA_SARIMA_ID = 'chiara.statistics.arma.sarima';
export const ARMA_ARFIMA_ID = 'chiara.statistics.arma.arfima';
export const ARMA_ARAR_ID = 'chiara.statistics.arma.arar';
export const ARMA_VAR_ID = 'chiara.statistics.arma.svar';
export const ARMA_SVAR_ID = 'chiara.statistics.arma.svar';
export const ARMA_FAVAR_ID = 'chiara.statistics.arma.favar';
export const ARMA_VECM_ID = 'chiara.statistics.arma.vecm';
export const ARMA_IRF_ID = 'chiara.statistics.arma.irf';
export const ARMA_TCA_ID = 'chiara.statistics.arma.tca';
export const ARMA_COINTEGRATION_ID = 'chiara.statistics.arma.cointegration';
export const ARMA_ARIMA_WEBVIEW_ID = 'chiara.statistics.arma.arima';
export const ARMA_VAR_WEBVIEW_ID = 'chiara.statistics.arma.varModels';

// Regime Switching
export const RS_DYNAMIC_MODELS_ID = 'chiara.statistics.rs.dynamicModels';

// Volatility Measurement
export const VM_COMMAND_ID = 'chiara.statistics.vm';

// GARCH-Type Models
export const VCM_ARCH_ID = 'chiara.statistics.vcm.arch';
export const VCM_GARCH_ID = 'chiara.statistics.vcm.garch';
export const VCM_GJR_GARCH_ID = 'chiara.statistics.vcm.gjrGarch';
export const VCM_EGARCH_ID = 'chiara.statistics.vcm.egarch';
export const VCM_CCC_ID = 'chiara.statistics.vcm.ccc';
export const VCM_DCC_ID = 'chiara.statistics.vcm.dcc';

// Stochastic Volatility Model Estimation
export const TVM_DTSV_ID = 'chiara.statistics.tvm.dtsv';
export const TVM_CTSV_ID = 'chiara.statistics.tvm.ctsv';

// Nonlinear Dynamics
export const NONLIN_CDS_ID = 'chiara.statistics.nonlin.cds';
export const NONLIN_DMAP_ID = 'chiara.statistics.nonlin.dmap';
export const NONLIN_ATTR_ID = 'chiara.statistics.nonlin.attr';
export const NONLIN_CHAOS_ID = 'chiara.statistics.nonlin.chaos';
export const NONLIN_CMPLX_ID = 'chiara.statistics.nonlin.cmplx';

// Econometrics
export const ECO_PO_ID = 'chiara.statistics.eco.po';
export const ECO_OA_ID = 'chiara.statistics.eco.oa';
export const ECO_CTSVM_ID = 'chiara.statistics.eco.ctsvm';
export const ECO_HFCME_ID = 'chiara.statistics.eco.hfcme';
export const ECO_RCME_ID = 'chiara.statistics.eco.rcme';
export const ECO_BLSDF_ID = 'chiara.statistics.eco.blsdf';
export const ECO_BFMB_ID = 'chiara.statistics.eco.bfmb';
export const ECO_MMN_ID = 'chiara.statistics.eco.mmn';
export const ECO_IVS_ID = 'chiara.statistics.eco.ivs';
export const TVM_TAYLOR_ID = 'chiara.statistics.tvm.taylor';
export const TVM_KSC_ID = 'chiara.statistics.tvm.ksc';
//export const TVM_HESTON_ID = 'chiara.statistics.tvm.heston';
//export const TVM_SABR_ID = 'chiara.statistics.tvm.sabr';
//export const TVM_BATES_ID = 'chiara.statistics.tvm.bates';

// State-Space Models
export const SSM_UCM_UNI_ID = 'chiara.statistics.ssm.ucmUni';
export const SSM_UCM_MULTI_ID = 'chiara.statistics.ssm.ucmMulti';
export const SSM_KF_ID = 'chiara.statistics.ssm.kf';
export const SSM_SQKF_ID = 'chiara.statistics.ssm.sqkf';
export const SSM_EKF_ID = 'chiara.statistics.ssm.ekf';
export const SSM_SQEKF_ID = 'chiara.statistics.ssm.sqekf';
export const SSM_IEKF_ID = 'chiara.statistics.ssm.iekf';
export const SSM_UKF_ID = 'chiara.statistics.ssm.ukf';
export const SSM_AUKF_ID = 'chiara.statistics.ssm.aukf';
export const SSM_PF_ID = 'chiara.statistics.ssm.pf';
export const SSM_APF_ID = 'chiara.statistics.ssm.apf';
export const SSM_ADPF_ID = 'chiara.statistics.ssm.adpf';
export const SSM_RBPF_ID = 'chiara.statistics.ssm.rbpf';
export const SSM_RBUKF_ID = 'chiara.statistics.ssm.rbukf';
export const SSM_IMMF_ID = 'chiara.statistics.ssm.immf';

// Survival Analysis
export const SA_KAPLAN_MEIER_ID = 'chiara.statistics.sa.kaplanMeier';
export const SA_NELSON_AALEN_ID = 'chiara.statistics.sa.nelsonAalen';
export const SA_AALEN_JOHANSEN_ID = 'chiara.statistics.sa.aalenJohansen';
export const SA_COX_PH_ID = 'chiara.statistics.sa.coxPh';
export const SA_CUMULATIVE_INC_ID = 'chiara.statistics.sa.cumulativeInc';
export const SA_NET_SURVIVAL_ID = 'chiara.statistics.sa.netSurvival';
export const SA_GRAFFEO_LR_ID = 'chiara.statistics.sa.graffeoLR';

// Bayesian Analysis
export const BA_PPL_ID = 'chiara.statistics.ba.ppl';
export const BA_BGLM_ID = 'chiara.statistics.ba.bglm';
export const BA_BVAR_ID = 'chiara.statistics.ba.bglm';
export const BA_BKFS_ID = 'chiara.statistics.ba.bkfs';
export const BA_BN_ID = 'chiara.statistics.ba.bn';
export const BA_BNN_ID = 'chiara.statistics.ba.bnn';

// Conformal Prediction
export const CP_CONFORMAL_ID = 'chiara.statistics.cp.conformal';

// Kernel Methods
export const KM_KERNEL_FUNCTIONS_ID = 'chiara.statistics.km.kernelFunctions';
export const KM_GP_ID = 'chiara.statistics.km.gp';
export const KM_SVM_ID = 'chiara.statistics.km.svm';

// Stochastic Approximation
export const SA_STOCHASTIC_APPROX_ID = 'chiara.statistics.sa.stochasticApprox';

// Naive Bayes
export const NB_GAUSSIAN_ID = 'chiara.statistics.nb.gaussian';
export const NB_MULTINOMIAL_ID = 'chiara.statistics.nb.multinomial';
export const NB_HYBRID_ID = 'chiara.statistics.nb.hybrid';

// Decision Trees and Random Forests
export const DTRF_DT_ID = 'chiara.statistics.dtrf.dt';
export const DTRF_DTBM_ID = 'chiara.statistics.dtrf.randomDt';
export const DTRF_RANDOM_DT_ID = 'chiara.statistics.dtrf.randomDt';
export const DTRF_RF_ID = 'chiara.statistics.dtrf.rf';
export const DTRF_MODAL_DT_ID = 'chiara.statistics.dtrf.modalDt';
export const DTRF_MODAL_RF_ID = 'chiara.statistics.dtrf.modalRf';

// K-Nearest Neighbours
export const KNN_COMMAND_ID = 'chiara.statistics.knn';


// Discriminant Analysis
export const DA_LDA_ID = 'chiara.statistics.da.lda';
export const DA_RDA_ID = 'chiara.statistics.da.rda';
export const DA_MCLDA_ID = 'chiara.statistics.da.mclda';
export const DA_QDA_ID = 'chiara.statistics.da.qda';
export const DA_PLSDA_ID = 'chiara.statistics.da.plsda';
export const DA_FDA_ID = 'chiara.statistics.da.fda';

// Neural Networks
export const NN_FNN_ID = 'chiara.statistics.nn.fnn';
export const NN_NF_ID = 'chiara.statistics.nn.nf';
export const NN_RNN_ID = 'chiara.statistics.nn.rnn';
export const NN_CNN_ID = 'chiara.statistics.nn.cnn';
export const NN_GNN_ID = 'chiara.statistics.nn.gnn';
export const NN_TF_ID = 'chiara.statistics.nn.transformer';
export const NN_MDN_ID = 'chiara.statistics.nn.mdn';
export const NN_INN_ID = 'chiara.statistics.nn.inn';
export const NN_RL_ID =  'chiara.statistics.nn.rl';

// RNN sub-types
export const RNN_LSTM_ID = 'chiara.statistics.nn.rnn.lstm';
export const RNN_GRU_ID = 'chiara.statistics.nn.rnn.gru';
export const RNN_ESN_ID = 'chiara.statistics.nn.rnn.esn';
export const RNN_ATTN_ID = 'chiara.statistics.nn.rnn.attention';

// Rule-Based Methods
export const AR_ASSOCIATION_RULES_ID = 'chiara.statistics.ar.associationRules';

// Clustering
export const CL_PARTITIONAL_ID = 'chiara.statistics.cl.partitional';
export const CL_HIERARCHICAL_ID = 'chiara.statistics.cl.hierarchical';

// Dimensionality Reduction Methods
export const PM_SVD_ID = 'chiara.statistics.pm.svd';
export const PM_EIGEN_DECOMP_ID = 'chiara.statistics.pm.eigenDecomp';
export const PM_PLSR_ID = 'chiara.statistics.pm.plsr';
export const PM_KPLSR_ID = 'chiara.statistics.pm.kplsr';
export const PM_NIPALS_ID = 'chiara.statistics.pm.nipals';
export const PM_PROJECTION_PURSUIT_ID = 'chiara.statistics.pm.projectionPursuit';
export const PM_PCA_ID = 'chiara.statistics.pm.pca';
export const PM_ONLINE_PCA_ID = 'chiara.statistics.pm.onlinePca';
export const PM_PPCA_ID = 'chiara.statistics.pm.ppca';
export const PM_KPCA_ID = 'chiara.statistics.pm.kpca';
export const PM_QPCA_ID = 'chiara.statistics.pm.qpca';
export const PM_RPCA_ID = 'chiara.statistics.pm.rpca';
export const PM_SPCA_ID = 'chiara.statistics.pm.spca';
export const PM_CPCA_ID = 'chiara.statistics.pm.cpca';
export const PM_PCAIV_ID = 'chiara.statistics.pm.pcaiv';
export const PM_ICA_ID = 'chiara.statistics.pm.ica';
export const PM_FA_ID = 'chiara.statistics.pm.fa';
export const PM_DFA_ID = 'chiara.statistics.pm.dfa';
export const PM_NMF_ID = 'chiara.statistics.pm.nmf';
export const PM_RANDOM_PROJ_ID = 'chiara.statistics.pm.randomProj';
export const PM_LDA_TOPIC_ID = 'chiara.statistics.pm.ldaTopic';
export const PM_FLDA_ID = 'chiara.statistics.pm.flda';
export const PM_CTM_ID = 'chiara.statistics.pm.ctm';
export const PM_FCTM_ID = 'chiara.statistics.pm.fctm';
export const PM_CTPF_ID = 'chiara.statistics.pm.ctpf';
export const PM_PCOA_ID = 'chiara.statistics.pm.pcoa';
export const PM_MMDS_ID = 'chiara.statistics.pm.mmds';
export const PM_ISOMAP_ID = 'chiara.statistics.pm.isomap';
export const PM_DIFFUSION_MAPS_ID = 'chiara.statistics.pm.diffusionMaps';
export const PM_LLE_ID = 'chiara.statistics.pm.lle';
export const PM_HLLE_ID = 'chiara.statistics.pm.hlle';
export const PM_LEM_ID = 'chiara.statistics.pm.lem';
export const PM_LTSA_ID = 'chiara.statistics.pm.ltsa';
export const PM_TSNE_ID = 'chiara.statistics.pm.tsne';
export const PM_UMAP_ID = 'chiara.statistics.pm.umap';
export const PM_AUTOENCODERS_ID = 'chiara.statistics.pm.autoencoders';
export const PM_MANIFOLD_ID = 'chiara.statistics.pm.manifold';
export const PM_EMBEDDING_ID = 'chiara.statistics.pm.embedding';
export const PM_AUTOENCODER_ID = 'chiara.statistics.pm.autoencoder';
export const PM_LCA_ID = 'chiara.statistics.pm.lca';
export const PM_CCA_ID = 'chiara.statistics.pm.cca';
export const PM_COV_SHRINKAGE_ID = 'chiara.statistics.pm.covShrinkage';

// Ensemble Learning
export const ENS_ENSEMBLE_METHODS_ID = 'chiara.statistics.ensemble.ensembleLearning';

// Natural Language Processing — Document Representation
export const NLP_DTM_TFIDF_ID = 'chiara.statistics.nlp.dtmTfidf';
export const NLP_COOCCURRENCE_ID = 'chiara.statistics.nlp.cooccurrence';
export const NLP_LANG_MODEL_ID = 'chiara.statistics.nlp.languageModel';

// Natural Language Processing — Topic & Semantic Models
export const NLP_LSA_ID = 'chiara.statistics.nlp.lsa';
export const NLP_LDA_ID = 'chiara.statistics.nlp.lda';
export const NLP_FLDA_ID = 'chiara.statistics.nlp.flda';
export const NLP_CTM_ID = 'chiara.statistics.nlp.ctm';
export const NLP_FCTM_ID = 'chiara.statistics.nlp.fctm';
export const NLP_CTPF_ID = 'chiara.statistics.nlp.ctpf';

// Natural Language Processing — Evaluation & LLM
export const NLP_ROUGE_ID = 'chiara.statistics.nlp.rouge';
export const NLP_LLM_TA_ID = 'chiara.statistics.nlp.llmTextAnalysis';

// Natural Language Processing — Neural Embeddings & Retrieval
export const NLP_BERT_ID = 'chiara.statistics.nlp.bert';
export const NLP_COLBERT_ID = 'chiara.statistics.nlp.colbert';



// ============================================
// MAIN MENU REGISTRATION
// ============================================

MenuRegistry.appendMenuItem(MenuId.MenubarMainMenu, {
	submenu: MenuId.MenubarModelMenu,
	title: {
		value: 'Model',
		original: 'Model',
		mnemonicTitle: localize({ key: 'mModel', comment: ['&& denotes a mnemonic'] }, "&&Model")
	},
	order: 7
});

// ============================================
// TOP-LEVEL MODEL MENU STRUCTURE
// ============================================

MenuRegistry.appendMenuItem(MenuId.MenubarModelMenu, {
	group: '0_model_workflow_management',
	submenu: MWMSubmenuId,
	title: localize('showStatistics.mwm', 'Model Workflow Management'),
	order: 0,
});

MenuRegistry.appendMenuItem(MenuId.MenubarModelMenu, {
	group: '1_distributions',
	submenu: DistSubmenuId,
	title: localize('showStatistics.dist', 'Distributions'),
	order: 1,
});

MenuRegistry.appendMenuItem(MenuId.MenubarModelMenu, {
	group: '1_distributions',
	submenu: CopulaSubmenuId,
	title: localize('showStatistics.copulas', 'Copulas'),
	order: 2,
});

MenuRegistry.appendMenuItem(MenuId.MenubarModelMenu, {
	group: '1_distributions',
	command: { id: HT_COMMAND_ID, title: localize('showStatistics.ht', 'Hypothesis Testing') },
	order: 3,
});

MenuRegistry.appendMenuItem(MenuId.MenubarModelMenu, {
	group: '3_regression',
	submenu: LMSubmenuId,
	title: localize('showStatistics.lm', 'Linear Models'),
	order: 1,
});

MenuRegistry.appendMenuItem(MenuId.MenubarModelMenu, {
	group: '3_regression',
	command: {
		id: LMM_COMMAND_ID,
		title: localize('showStatistics.lmm', 'Linear Mixed Models'),
	},
	order: 2,
});

MenuRegistry.appendMenuItem(MenuId.MenubarModelMenu, {
	group: '3_regression',
	command: {
		id: GLM_COMMAND_ID,
		title: localize('showStatistics.glm', 'Generalised Linear Models'),
	},
	order: 3,
});

MenuRegistry.appendMenuItem(MenuId.MenubarModelMenu, {
	group: '3_regression',
	command: {
		id: GLMM_COMMAND_ID,
		title: localize('showStatistics.glmm', 'Generalised Linear Mixed Models'),
	},
	order: 4,
});

//MenuRegistry.appendMenuItem(MenuId.MenubarModelMenu, {
//	group: '2_regression_statistics',
//	submenu: GAMSubmenuId,
//	title: localize('showStatistics.gam', 'Generalized Additive Models'),
//	order: 0.9,
//});

MenuRegistry.appendMenuItem(MenuId.MenubarModelMenu, {
	group: '3_regression',
	command: {
		id: NLREG_COMMAND_ID,
		title: localize('showStatistics.nlls', 'Nonlinear Regression'),
	},
	order: 5,
});


MenuRegistry.appendMenuItem(MenuId.MenubarModelMenu, {
	group: '3_regression',
	command: {
		id: RR_LASSO_ID,
		title: localize('showStatistics.lasso', 'Penalised and Projection Regression'),
	},
	order: 6,
});

MenuRegistry.appendMenuItem(MenuId.MenubarModelMenu, {
	group: '3_regression',
	command: {
		id: RQR_COMMAND_ID,
		title: localize('showStatistics.rqr', 'Robust and Quantile Regression'),
	},
	order: 7,
});

//MenuRegistry.appendMenuItem(MenuId.MenubarModelMenu, {
//	group: '2_regression_statistics',
//	submenu: BRMSubmenuId,
//	title: localize('showStatistics.brm', 'Resampling Methods'),
//	order: 3,
//});

MenuRegistry.appendMenuItem(MenuId.MenubarModelMenu, {
	group: '4_time_series',
	command: { id: 'chiara.statistics.tsf', title: localize('showStatistics.tsf', 'Time-Series Forecasting') },
	order: 1,
}); // StateSpaceModels.jl + LOESS.jl

MenuRegistry.appendMenuItem(MenuId.MenubarModelMenu, {
	group: '4_time_series',
	command: { id: 'chiara.statistics.ssm', title: localize('showStatistics.ssm', 'State-Space Inference Methods') },
	order: 2,
}); // LowLevelParticleFilters.jl,

MenuRegistry.appendMenuItem(MenuId.MenubarModelMenu, {
	group: '4_time_series',
	command: { id: 'chiara.statistics.si', title: localize('showStatistics.si', 'System Identification Methods') },
	order: 3,
}); // ControlSystemIdentification.jl

MenuRegistry.appendMenuItem(MenuId.MenubarModelMenu, {
	group: '4_time_series',
	command: { id: 'chiara.statistics.ode', title: localize('showStatistics.ode', 'ODE Inference Methods') },
	order: 4,
}); // PEtab.jl, StructuralIdentifiability.jl

MenuRegistry.appendMenuItem(MenuId.MenubarModelMenu, {
	group: '4_time_series',
	submenu: NDSubmenuId,
	title: localize('showStatistics.nd', 'Nonlinear Dynamics'),
	order: 5,
}); // DynamicalSystems.jl

MenuRegistry.appendMenuItem(MenuId.MenubarModelMenu, {
	group: '5_time_related',
	command: { id: 'chiara.statistics.pp', title: localize('showStatistics.pp', 'Point Processes') },
	order: 1,
}); // PointProcesses.jl, Hawkes.jl, HawkesProcesses.jl, NetworkHawkesProcesses.jl

MenuRegistry.appendMenuItem(MenuId.MenubarModelMenu, {
	group: '5_time_related',
	submenu: SASubmenuId,
	title: localize('showStatistics.sa', 'Survival Analysis'),
	order: 2,
}); // Survivaljl, SurvivalAnalysis.jl, HazReg.jl, JointSurvivalModels.jl





//MenuRegistry.appendMenuItem(MenuId.MenubarModelMenu, {
//	group: '5_conformal_prediction',
//	command: {
//		id: CP_CONFORMAL_ID,
//		title: localize('showStatistics.cp', 'Conformal Prediction'),
//	},
//	order: 10,
//});

//MenuRegistry.appendMenuItem(MenuId.MenubarModelMenu, {
//	group: '5_ml_statistics',
//	submenu: KMSubmenuId,
//	title: localize('showStatistics.km', 'Kernel Methods'),
//	order: 11,
//});

//MenuRegistry.appendMenuItem(MenuId.MenubarModelMenu, {
//	group: '5_ml_statistics',
//	submenu: NBSubmenuId,
//	title: localize('showStatistics.nb', 'Naive Bayes'),
//	order: 12,
//});

MenuRegistry.appendMenuItem(MenuId.MenubarModelMenu, {
	group: '6_bayesian',
	submenu: BASubmenuId,
	title: localize('showStatistics.ba', 'Bayesian Analysis'),
	order: 1,
}); // Turing, RxInfer.jl

MenuRegistry.appendMenuItem(MenuId.MenubarModelMenu, {
	group: '7_ml',
	command: {
		id: DTRF_DT_ID,
		title: localize('showStatistics.dtrf', 'Decision Trees'),
	},
	order: 1,
});

MenuRegistry.appendMenuItem(MenuId.MenubarModelMenu, {
	group: '7_ml',
	command: {
		id: KNN_COMMAND_ID,
		title: localize('showStatistics.knn', 'K-Nearest Neighbours'),
	},
	order: 2,
}); // NearestNeighbors.jl

//MenuRegistry.appendMenuItem(MenuId.MenubarStatisticsMenu, {
//	group: '5_ml_statistics',
//	submenu: DASubmenuId,
//	title: localize('showStatistics.da', 'Discriminant Analysis'),
//	order: 15,
//});

MenuRegistry.appendMenuItem(MenuId.MenubarModelMenu, {
	group: '7_ml',
	command: { id: AR_ASSOCIATION_RULES_ID, title: localize('showStatistics.ar', 'Rule-Based Methods') },
	order: 3,
});

//MenuRegistry.appendMenuItem(MenuId.MenubarModelMenu, {
//	group: '7_ml',
//	command: { id: 'chiara.statistics.sreg', title: localize('showStatistics.sreg', 'Symbolic Regression') },
//	order: 4,
//}); // SymbolicRegression.jl

MenuRegistry.appendMenuItem(MenuId.MenubarModelMenu, {
	group: '7_ml',
	submenu: NNSubmenuId,
	title: localize('showStatistics.nn', 'Neural Network Architectures'),
	order: 5,
}); // Flux.jl, RecurrentLayers.jl, GeometricFlux.jl, Transformers.jl

MenuRegistry.appendMenuItem(MenuId.MenubarModelMenu, {
	group: '7_ml',
	command: { id: ENS_ENSEMBLE_METHODS_ID, title: localize('showStatistics.ens', 'Ensemble Learning Methods') },
	order: 6,
});


MenuRegistry.appendMenuItem(MenuId.MenubarModelMenu, {
	group: '8_unsupervised',
	submenu: CLSubmenuId,
	title: localize('showStatistics.cl', 'Clustering'),
	order: 1,
});

MenuRegistry.appendMenuItem(MenuId.MenubarModelMenu, {
	group: '8_unsupervised',
	submenu: PMSubmenuId,
	title: localize('showStatistics.pm', 'Dimensionality Reduction Methods'),
	order: 2,
});

MenuRegistry.appendMenuItem(MenuId.MenubarModelMenu, {
	group: '8_unsupervised',
	submenu: NLPSubmenuId,
	title: localize('showStatistics.nlp', 'Natural Language Processing'),
	order: 3,
});


// ============================================
// SUBMENU: MODEL WORKFLOW MANAGEMENT
// ============================================

MenuRegistry.appendMenuItem(MWMSubmenuId, {
	group: '1_mwm',
	command: { id: MWM_DATA_PARTITION_ID, title: localize('mwm.dpa', 'Cross-Validation Strategies') },
	order: 1,
});


MenuRegistry.appendMenuItem(MWMSubmenuId, {
	group: '2_mwm',
	command: { id: MWM_HPT_ID, title: localize('mwm.hpt', 'Hyperparameter Tuning') },
	order: 1,
});

MenuRegistry.appendMenuItem(MWMSubmenuId, {
	group: '2_mwm',
	command: { id: MWM_CALIBRATION_ID, title: localize('mwm.mc', 'Model Calibration') },
	order: 2,
});

MenuRegistry.appendMenuItem(MWMSubmenuId, {
	group: '3_mwm',
	command: { id: MWM_CLASSIFICATION_PERF_ID, title: localize('mwm.cf', 'Classification Performance') },
	order: 1,
});

MenuRegistry.appendMenuItem(MWMSubmenuId, {
	group: '3_mwm',
	command: { id: MWM_REGRESSION_PERF_ID, title: localize('mwm.rp', 'Regression Performance') },
	order: 2,
});


// ============================================
// SUBMENU: DISTRIBUTIONS
// ============================================

MenuRegistry.appendMenuItem(DistSubmenuId, {
	group: '1_dist',
	command: { id: 'chiara.statistics.de', title: localize('showStatistics.de', 'Distribution Estimation') },
	order: 1,
});

MenuRegistry.appendMenuItem(DistSubmenuId, {
	group: '1_dist',
	command: { id: D_COMMAND_ID, title: localize('showStatistics.d', 'Distribution Evaluation') },
	order: 2,
}); // Distributions.jl

MenuRegistry.appendMenuItem(DistSubmenuId, {
	group: '1_dist',
	command: { id: DF_COMMAND_ID, title: localize('showStatistics.df', 'Distribution Factory') },
	order: 3,
}); // DistributionsFactories.jl

MenuRegistry.appendMenuItem(DistSubmenuId, {
	group: '1_dist',
	command: { id: 'chiara.statistics.expectation', title: localize('showStatistics.expectation', 'Expectations') },
	order: 4,
}); // Expectations.jl

// ============================================
// SUBMENU: COPULAS
// ============================================

MenuRegistry.appendMenuItem(CopulaSubmenuId, {
	group: '1_copula',
	command: { id: 'chiara.statistics.copula.estimation', title: localize('showStatistics.copula.estimation', 'Copula Estimation') },
	order: 1,
});

MenuRegistry.appendMenuItem(CopulaSubmenuId, {
	group: '1_copula',
	command: { id: COPULA_COMMAND_ID, title: localize('showStatistics.copula', 'Copula Evaluation') },
	order: 2,
});

// ============================================
// SUBMENU: LINEAR MODELS
// ============================================
MenuRegistry.appendMenuItem(LMSubmenuId, {
	group: '1_lm',
	command: { id: 'chiara.statistics.lm.hac', title: localize('lm.hac', 'Linear Models with Robust Inference') },
	order: 1,
});


MenuRegistry.appendMenuItem(LMSubmenuId, {
	group: '3_lm',
	command: { id: 'chiara.statistics.lm.hetero', title: localize('lm.hetero', 'Linear Models with Heteroskedasticity') },
	order: 1,
}); // HARE.jl

MenuRegistry.appendMenuItem(LMSubmenuId, {
	group: '3_lm',
	command: { id: 'chiara.statistics.lm.ar1', title: localize('lm.ar1', 'Linear Models with Autocorrelation') },
	order: 2,
}); // HARE.jl

MenuRegistry.appendMenuItem(LMSubmenuId, {
	group: '3_lm',
	command: { id: 'chiara.statistics.lm.heteroar1', title: localize('lm.heteroar1', 'Linear Models with Heteroskedasticity + AR(1)') },
	order: 3,
}); // HARE.jl

MenuRegistry.appendMenuItem(LMSubmenuId, {
	group: '5_lm',
	command: { id: 'chiara.statistics.lm.tsls', title: localize('lm.tsls', 'Two-Stage Least Squares') },
	order: 1,
}); // Microeconometrics.jl

MenuRegistry.appendMenuItem(LMSubmenuId, {
	group: '5_lm',
	command: { id: 'chiara.statistics.lm.gmm', title: localize('lm.gmm', 'Generalized Method of Moments') },
	order: 2,
}); // Microeconometrics.jl

MenuRegistry.appendMenuItem(LMSubmenuId, {
	group: '6_lsm',
	command: { id: 'chiara.statistics.lm.nnls', title: localize('lm.nnls', 'Non-Negative Least Squares') },
	order: 1,
}); // NonNegLeastSquares.jl

// MenuRegistry.appendMenuItem(LMSubmenuId, {
// 	group: '1_lm',
// 	command: { id: LM_BOUNDED_LS_ID, title: localize('lm.bls', 'Bounded Least Squares') },
// 	order: 3,
// });

// MenuRegistry.appendMenuItem(LMSubmenuId, {
// 	group: '1_lm',
// 	command: { id: LM_GENERAL_CONSTRAINTS_ID, title: localize('lm.lsglc', 'Least Squares with General Linear Constraints') },
// 	order: 4,
// });


// MenuRegistry.appendMenuItem(LMSubmenuId, {
// 	group: '3_lm',
// 	command: { id: LM_GEL_ID, title: localize('lm.gel', 'Generalized Empirical Likelihood (GEL)') },
// 	order: 7,
// });

// ============================================
// SUBMENU: GENERALIZED LINEAR MODELS (GLM)
// ============================================

// MenuRegistry.appendMenuItem(GLMSubmenuId, {
// 	group: '1_glm',
// 	command: { id: GLM_BINARY_ID, title: localize('glm.binary', 'Binary') },
// 	order: 1,
// });

// MenuRegistry.appendMenuItem(GLMSubmenuId, {
// 	group: '2_glm',
// 	command: { id: GLM_CATEGORICAL_ID, title: localize('glm.cat', 'Categorical') },
// 	order: 2.1,
// });

// MenuRegistry.appendMenuItem(GLMSubmenuId, {
// 	group: '2_glm',
// 	command: { id: GLM_NESTED_CAT_ID, title: localize('glm.ncat', 'Nested Categorical') },
// 	order: 2.2,
// });

// MenuRegistry.appendMenuItem(GLMSubmenuId, {
// 	group: '2_glm',
// 	command: { id: GLM_MIXED_CAT_ID, title: localize('glm.mcat', 'Mixed Categorical') },
// 	order: 2.3,
// });

// MenuRegistry.appendMenuItem(GLMSubmenuId, {
// 	group: '3_glm',
// 	command: { id: GLM_ORDINAL_ID, title: localize('glm.ordinal', 'Ordinal') },
// 	order: 3,
// });

// MenuRegistry.appendMenuItem(GLMSubmenuId, {
// 	group: '4_glm',
// 	command: { id: GLM_COUNT_ID, title: localize('glm.count', 'Count') },
// 	order: 4,
// });

// MenuRegistry.appendMenuItem(GLMSubmenuId, {
// 	group: '4_glm',
// 	command: { id: GLM_OVERDISPERSED_ID, title: localize('glm.overcount', 'Overdispersed Count') },
// 	order: 5,
// });

// MenuRegistry.appendMenuItem(GLMSubmenuId, {
// 	group: '5_glm',
// 	command: { id: GLM_FRACTIONAL_ID, title: localize('glm.fractional', 'Fractional') },
// 	order: 6,
// });

// MenuRegistry.appendMenuItem(GLMSubmenuId, {
// 	group: '6_glm',
// 	command: { id: GLM_POSITIVE_ID, title: localize('glm.positive', 'Positive Continuous') },
// 	order: 7,
// });

// ============================================
// SUBMENU: GENERALIZED ADDITIVE MODELS (GAM)
// ============================================

MenuRegistry.appendMenuItem(GAMSubmenuId, {
	group: '1_gam',
	command: { id: GAM_NORMAL_ID, title: localize('gam.normal', 'Normal') },
	order: 1,
});

MenuRegistry.appendMenuItem(GAMSubmenuId, {
	group: '1_gam',
	command: { id: GAM_POISSON_ID, title: localize('gam.poisson', 'Poisson') },
	order: 2,
});

MenuRegistry.appendMenuItem(GAMSubmenuId, {
	group: '1_gam',
	command: { id: GAM_GAMMA_ID, title: localize('gam.gamma', 'Gamma') },
	order: 3,
});

// =====================================================
// SUBMENU: REGULARIZED, ROBUST AND QUANTILE REGRESSION
// =====================================================

// MenuRegistry.appendMenuItem(RRQSubmenuId, {
// 	group: '1_rrq',
// 	command: { id: RRQ_LASSO_ID, title: localize('rrq.lasso', 'Standard Lasso Regression (L1)') },
// 	order: 1,
// });

// MenuRegistry.appendMenuItem(RRQSubmenuId, {
// 	group: '1_rrq',
// 	command: { id: RRQ_FUSED_LASSO_ID, title: localize('rrq.fused', 'Fused Lasso Regression (fL1)') },
// 	order: 2,
// });

// MenuRegistry.appendMenuItem(RRQSubmenuId, {
// 	group: '1_rrq',
// 	command: { id: RRQ_GAMMA_LASSO_ID, title: localize('rrq.gamma', 'Gamma Lasso Regression (gL1)') },
// 	order: 3,
// });

// MenuRegistry.appendMenuItem(RRQSubmenuId, {
// 	group: '1_rrq',
// 	command: { id: RRQ_RIDGE_ID, title: localize('rrq.ridge', 'Ridge Regression (L2)') },
// 	order: 4,
// });

// MenuRegistry.appendMenuItem(RRQSubmenuId, {
// 	group: '1_rrq',
// 	command: { id: RRQ_ELASTIC_NET_ID, title: localize('rrq.elastic', 'Elastic Net Regression (ENET)') },
// 	order: 5,
// });

MenuRegistry.appendMenuItem(RQRSubmenuId, {
	group: '2_rq',
	command: { id: RQR_ROBUST_L0_ID, title: localize('rq.rob0', 'Robust Regression (no penalty)') },
	order: 6,
}); // RobustModels.jl

MenuRegistry.appendMenuItem(RQRSubmenuId, {
	group: '2_rq',
	command: { id: RQR_ROBUST_L1L2_ID, title: localize('rq.rob12', 'Robust Regression (L1, L2)') },
	order: 7,
}); // RobustModels.jl

MenuRegistry.appendMenuItem(RQRSubmenuId, {
	group: '3_rq',
	command: { id: RQR_QUANTILE_NO_PENALTY_ID, title: localize('qq.quant0', 'Quantile Regression (no penalty)') },
	order: 8,
}); // RobustModels.jl

MenuRegistry.appendMenuItem(RQRSubmenuId, {
	group: '3_rq',
	command: { id: RQR_QUANTILE_L1L2_ID, title: localize('rq.quant12', 'Quantile Regression (L1, L2)') },
	order: 9,
}); // RobustModels.jl

// ============================================
// SUBMENU: PANEL DATA / MIXED-EFFECTS
// ============================================

// MenuRegistry.appendMenuItem(MMPDSubmenuId, {
// 	group: '1_mmpd',
// 	command: { id: MMPD_LINEAR_MIXED_ID, title: localize('mmpd.lmme', 'Linear Mixed Effects Models') },
// 	order: 1,
// });

// MenuRegistry.appendMenuItem(MMPDSubmenuId, {
// 	group: '1_mmpd',
// 	command: { id: MMPD_GLM_MIXED_ID, title: localize('mmpd.glmme', 'Generalized Linear Mixed Effects Models') },
// 	order: 2,
// });

// MenuRegistry.appendMenuItem(MMPDSubmenuId, {
// 	group: '1_mmpd',
// 	command: { id: MMPD_ENDOGENOUS_ID, title: localize('mmpd.memer', 'Mixed Effects Models with Endogenous Regressors') },
// 	order: 3,
// });

// ============================================
// SUBMENU: RESAMPLING METHODS
// ============================================

MenuRegistry.appendMenuItem(BRMSubmenuId, {
	group: '1_brm',
	command: { id: BRM_RANDOM_ID, title: localize('brm.random', 'Random Resampling with Replacement') },
	order: 1,
});

MenuRegistry.appendMenuItem(BRMSubmenuId, {
	group: '1_brm',
	command: { id: BRM_ANTITHETIC_ID, title: localize('brm.antithetic', 'Antithetic Resampling') },
	order: 2,
});

MenuRegistry.appendMenuItem(BRMSubmenuId, {
	group: '1_brm',
	command: { id: BRM_BALANCED_ID, title: localize('brm.balanced', 'Balanced Random Resampling') },
	order: 3,
});

MenuRegistry.appendMenuItem(BRMSubmenuId, {
	group: '1_brm',
	command: { id: BRM_GLM_ID, title: localize('brm.glm', 'Residuals Resampling in GLM') },
	order: 4,
});

MenuRegistry.appendMenuItem(BRMSubmenuId, {
	group: '1_brm',
	command: { id: BRM_MAX_ENTROPY_ID, title: localize('brm.entropy', 'Maximum Entropy Bootstrap') },
	order: 5,
});

MenuRegistry.appendMenuItem(BRMSubmenuId, {
	group: '2_brm',
	command: { id: BRM_MOVING_BLOCK_ID, title: localize('brm.movi', 'Moving Block Bootstrap') },
	order: 6,
});

MenuRegistry.appendMenuItem(BRMSubmenuId, {
	group: '2_brm',
	command: { id: BRM_STATIONARY_BLOCK_ID, title: localize('brm.stati', 'Stationary Block Bootstrap') },
	order: 7,
});

MenuRegistry.appendMenuItem(BRMSubmenuId, {
	group: '2_brm',
	command: { id: BRM_BLOCK_JACKKNIFE_ID, title: localize('brm.block', 'Block Jackknife') },
	order: 8,
});

MenuRegistry.appendMenuItem(BRMSubmenuId, {
	group: '2_brm',
	command: { id: BRM_ARTIFICIAL_JACKKNIFE_ID, title: localize('brm.artif', 'Artificial Deleted (d) Jackknife') },
	order: 9,
});

// ============================================
// SUBMENU: TIME-SERIES FORECASTING
// ============================================

// MenuRegistry.appendMenuItem(TSSDSubmenuId, {
// 	group: '1_tssd',
// 	command: { id: TSSD_ROLLING_ID, title: localize('tssd.roll', 'Rolling Functions') },
// 	order: 4,
// });

//MenuRegistry.appendMenuItem(TSSDSubmenuId, {
//	group: '1_tssd',
//	command: { id: TSSD_LOESS_ID, title: localize('tssd.loess', 'LOESS Regression') },
//	order: 1,
//}); // now in Time-Series Forecasting webview

//MenuRegistry.appendMenuItem(TSSDSubmenuId, {
//	group: '2_tssd',
//	command: { id: TSSD_ETS_ID, title: localize('tssd.ets', 'ETS Models') },
//	order: 1,
//}); // now in Time-Series Forecasting webview

//MenuRegistry.appendMenuItem(TSSDSubmenuId, {
//	group: '2_tssd',
//	command: { id: SSM_UCM_UNI_ID, title: localize('ssm.ucmUni', 'Univariate Unobserved Components Model') },
//	order: 2,
//}); // moved to State-Space Models webview

//MenuRegistry.appendMenuItem(TSSDSubmenuId, {
//	group: '2_tssd',
//	command: { id: SSM_UCM_MULTI_ID, title: localize('ssm.ucmMulti', 'Multivariate Unobserved Components Model') },
//	order: 3,
//}); // moved to State-Space Models webview

//MenuRegistry.appendMenuItem(TSSDSubmenuId, {
//	group: '3_tssd',
//	command: { id: TSSD_INTERMITTENT_ID, title: localize('tssd.id', 'Intermittent Demand') },
//	order: 10,
//}); // now in Time-Series Forecasting webview


// ============================================
// SUBMENU: ARIMA/VAR TYPE MODELS
// ============================================

//MenuRegistry.appendMenuItem(ARMASubmenuId, {
//	group: '1_arma',
//	command: { id: ARMA_ACAC_ID, title: localize('eda.auto', 'Autocorrelation and Partial Autocorrelation') },
//	order: 1,
//}); // StatsBase.jl

//MenuRegistry.appendMenuItem(ARMASubmenuId, {
//	group: '1_arma',
//	command: { id: ARMA_ARIMA_ID, title: localize('arma.arima', 'ARIMA') },
//	order: 2,
//}); // StateSpaceModels.jl

//MenuRegistry.appendMenuItem(ARMASubmenuId, {
//	group: '1_arma',
//	command: { id: ARMA_SARIMA_ID, title: localize('arma.sarima', 'Seasonal ARIMA') },
//	order: 3,
//}); // StateSpaceModels.jl

// MenuRegistry.appendMenuItem(ARMASubmenuId, {
//	group: '1_arma',
//	command: { id: ARMA_ARFIMA_ID, title: localize('arma.arfima', 'Fractionally ARIMA: ARFIMA.jl') },
//	order: 3,
// });

// MenuRegistry.appendMenuItem(ARMASubmenuId, {
//	group: '1_arma',
//	command: { id: ARMA_ARAR_ID, title: localize('arma.var', 'ARAR/ARARMA Models: Durbyn.jl') },
//	order: 4,
//});

//MenuRegistry.appendMenuItem(ARMASubmenuId, {
//	group: '2_arma',
//	command: { id: ARMA_CCCC_ID, title: localize('eda.cross', 'Cross-Correlation') },
//	order: 1,
//}); // StatsBase.jl

//MenuRegistry.appendMenuItem(ARMASubmenuId, {
//	group: '2_arma',
//	command: { id: ARMA_VAR_ID, title: localize('arma.var', 'Vector Autoregression (VAR)') },
//	order: 2,
//}); // MacroEconometricModels.jl

//MenuRegistry.appendMenuItem(ARMASubmenuId, {
//	group: '2_arma',
//	command: { id: ARMA_SVAR_ID, title: localize('arma.svar', 'Structural VAR') },
//	order: 5,
//}); // MacroEconometricModels.jl

//MenuRegistry.appendMenuItem(ARMASubmenuId, {
//	group: '2_arma',
//	command: { id: ARMA_FAVAR_ID, title: localize('arma.favar', 'Factor-Augmented VAR') },
//	order: 7,
//}); // MacroEconometricModels.jl

//MenuRegistry.appendMenuItem(ARMASubmenuId, {
//	group: '2_arma',
//	command: { id: ARMA_VECM_ID, title: localize('arma.vecm', 'Vector Error Correction Model') },
//	order: 8,
//}); // MacroEconometricModels.jl

//MenuRegistry.appendMenuItem(ARMASubmenuId, {
//	group: '3_arma',
//	command: { id: ARMA_IRF_ID, title: localize('arma.irf', 'Impulse Response Function') },
//	order: 9,
//}); // MacroEconometricModels.jl

//MenuRegistry.appendMenuItem(ARMASubmenuId, {
//	group: '3_arma',
//	command: { id: ARMA_TCA_ID, title: localize('arma.tca', 'Transmission Channel Analysis') },
//	order: 10,
//}); // TransmissionChannelAnalysis.jl

//MenuRegistry.appendMenuItem(ARMASubmenuId, {
//	group: '4_arma',
//	command: { id: ARMA_COINTEGRATION_ID, title: localize('arma.cit', 'Cointegration Tests') },
//	order: 11,
//}); // MacroEconometricModels.jl

// ============================================
// SUBMENU: STATE-SPACE MODELS
// ============================================

//MenuRegistry.appendMenuItem(SSMSubmenuId, {
//	group: '1_kf',
//	command: { id: SSM_KF_ID, title: localize('ssm.kf', 'Kalman Filter') },
//	order: 4,
//}); // LowLevelParticleFilters.jl

//MenuRegistry.appendMenuItem(SSMSubmenuId, {
//	group: '1_kf',
//	command: { id: SSM_SQKF_ID, title: localize('ssm.sqkf', 'Square-Root Kalman Filter (SQKF)') },
//	order: 5,
//}); // LowLevelParticleFilters.jl

//MenuRegistry.appendMenuItem(SSMSubmenuId, {
//	group: '1_kf',
//	command: { id: SSM_EKF_ID, title: localize('ssm.ekf', 'Extended Kalman Filter') },
//	order: 6,
//}); // LowLevelParticleFilters.jl

//MenuRegistry.appendMenuItem(SSMSubmenuId, {
//	group: '1_kf',
//	command: { id: SSM_SQEKF_ID, title: localize('ssm.sqekf', 'Square-Root Extended Kalman Filter (EKF)') },
//	order: 7,
//}); // LowLevelParticleFilters.jl

//MenuRegistry.appendMenuItem(SSMSubmenuId, {
//	group: '1_kf',
//	command: { id: SSM_IEKF_ID, title: localize('ssm.iekf', 'Iterated Extended Kalman Filter (IEKF)') },
//	order: 8,
//}); // LowLevelParticleFilters.jl

//MenuRegistry.appendMenuItem(SSMSubmenuId, {
//	group: '1_kf',
//	command: { id: SSM_UKF_ID, title: localize('ssm.ukf', 'Unscented Kalman Filter') },
//	order: 9,
//}); // LowLevelParticleFilters.jl

//MenuRegistry.appendMenuItem(SSMSubmenuId, {
//	group: '1_kf',
//	command: { id: SSM_AUKF_ID, title: localize('ssm.aukf', 'Augmented Unscented Kalman Filter (AUKF)') },
//	order: 10,
//}); // LowLevelParticleFilters.jl

//MenuRegistry.appendMenuItem(SSMSubmenuId, {
//	group: '2_kf',
//	command: { id: SSM_PF_ID, title: localize('ssm.pf', 'Particle Filter') },
//	order: 11,
//}); // LowLevelParticleFilters.jl

//MenuRegistry.appendMenuItem(SSMSubmenuId, {
//	group: '2_kf',
//	command: { id: SSM_APF_ID, title: localize('ssm.apf', 'Auxiliary Particle Filter') },
//	order: 12,
//});

//MenuRegistry.appendMenuItem(SSMSubmenuId, {
//	group: '2_kf',
//	command: { id: SSM_ADPF_ID, title: localize('ssm.adpf', 'Advanced Particle Filter') },
//	order: 13,
//});

//MenuRegistry.appendMenuItem(SSMSubmenuId, {
//	group: '3_kf',
//	command: { id: SSM_RBPF_ID, title: localize('ssm.rbpf', 'Rao-Blackwellized Particle Filter') },
//	order: 14,
//});

//MenuRegistry.appendMenuItem(SSMSubmenuId, {
//	group: '3_kf',
//	command: { id: SSM_RBUKF_ID, title: localize('ssm.rbukf', 'Rao-Blackwellized Unscented Kalman Filter') },
//	order: 15,
//});

//MenuRegistry.appendMenuItem(SSMSubmenuId, {
//	group: '4_kf',
//	command: { id: SSM_IMMF_ID, title: localize('ssm.immf', 'Interacting Multiple Models Filter') },
//	order: 16,
//});


// ============================================
// SUBMENU: NONLINEAR DYNAMICS
// ============================================

MenuRegistry.appendMenuItem(NDSubmenuId, {
	group: '1_nld',
	command: { id: NONLIN_CMPLX_ID, title: localize('nonlin.cmplx', 'Entropy and Complexity') },
	order: 1,
}); // ComplexityMeasures.jl, TimeseriesSurrogates.jl

MenuRegistry.appendMenuItem(NDSubmenuId, {
	group: '1_nld',
	command: { id: 'chiara.statistics.nonlin.attr', title: localize('nonlin.attr', 'Attractor and Basin Analysis') },
	order: 2,
}); // Attractors.jl

MenuRegistry.appendMenuItem(NDSubmenuId, {
	group: '1_nld',
	command: { id: NONLIN_CHAOS_ID, title: localize('nonlin.chaos', 'Chaos Characterisation') },
	order: 3,
}); // DynamicalSystems.jl

// ============================================
// SUBMENU: VOLATILITY MEASUREMENT
// ============================================

// MenuRegistry.appendMenuItem(VMSubmenuId, {
// 	group: '1_ve',
// 	command: { id: VM_COMMAND_ID, title: localize('ve.hv', 'Historical Volatility') },
// 	order: 1,
// });

// MenuRegistry.appendMenuItem(VMSubmenuId, {
// 	group: '1_ve',
// 	command: { id: VM_COMMAND_ID, title: localize('ve.rbe', 'Range-Based Estimators') },
// 	order: 2,
// });

// MenuRegistry.appendMenuItem(VMSubmenuId, {
// 	group: '3_ve',
// 	command: { id: VM_COMMAND_ID, title: localize('ve.rv', 'HF Realized Volatility') },
// 	order: 3,
// }); // HighFrequencyCovariance.jl

// MenuRegistry.appendMenuItem(VMSubmenuId, {
// 	group: '3_ve',
// 	command: { id: VM_COMMAND_ID, title: localize('ve.tsv', 'HF Two Scales Volatility') },
// 	order: 4,
// }); // HighFrequencyCovariance.jl


// ============================================
// SUBMENU: GARCH-Type MODELS (legacy, kept for reference)
// ============================================

//MenuRegistry.appendMenuItem(VCMSubmenuId, {
//	group: '1_garch',
//	command: { id: VCM_ARCH_ID, title: localize('vcm.arch', 'ARCH') },
//	order: 1,
//});

//MenuRegistry.appendMenuItem(VCMSubmenuId, {
//	group: '1_garch',
//	command: { id: VCM_GARCH_ID, title: localize('vcm.garch', 'GARCH') },
//	order: 2,
//});

//MenuRegistry.appendMenuItem(VCMSubmenuId, {
//	group: '1_garch',
//	command: { id: VCM_EGARCH_ID, title: localize('vcm.egarch', 'EGARCH') },
//	order: 3,
//});

//MenuRegistry.appendMenuItem(VCMSubmenuId, {
//	group: '1_garch',
//	command: { id: VCM_GJR_GARCH_ID, title: localize('vcm.tgarch', 'TGARCH') },
//	order: 4,
//});

//MenuRegistry.appendMenuItem(VCMSubmenuId, {
//	group: '2_garch',
//	command: { id: VCM_DCC_ID, title: localize('vcm.sv', 'Multivariate GARCH (DCC)') },
//	order: 5,
//});


// ============================================
// SUBMENU: SURVIVAL ANALYSIS
// ============================================

MenuRegistry.appendMenuItem(SASubmenuId, {
	group: '1_sa',
	command: { id: 'chiara.statistics.tte', title: localize('sa.tte', 'Time-to-Event Analysis') },
	order: 1,
});

MenuRegistry.appendMenuItem(SASubmenuId, {
	group: '1_sa',
	command: { id: 'chiara.statistics.nscr', title: localize('sa.nscr', 'Net Survival and Competing Risks') },
	order: 2,
});

//MenuRegistry.appendMenuItem(SASubmenuId, {
//	group: '1_sa',
//	command: { id: SA_KAPLAN_MEIER_ID, title: localize('sa.kms', 'Kaplan-Meier Estimator') },
//	order: 3,
//});

//MenuRegistry.appendMenuItem(SASubmenuId, {
//	group: '1_sa',
//	command: { id: SA_NELSON_AALEN_ID, title: localize('sa.naca', 'Nelson-Aalen Estimator') },
//	order: 4,
//});

//MenuRegistry.appendMenuItem(SASubmenuId, {
//	group: '1_sa',
//	command: { id: SA_AALEN_JOHANSEN_ID, title: localize('sa.aaje', 'Aalen-Johansen Estimator') },
//	order: 5,
//});

//MenuRegistry.appendMenuItem(SASubmenuId, {
//	group: '2_sa',
//	command: { id: SA_COX_PH_ID, title: localize('sa.cphe', 'Cox Proportional Hazards Regression') },
//	order: 6,
//});

//MenuRegistry.appendMenuItem(SASubmenuId, {
//	group: '2_sa',
//	command: { id: SA_CUMULATIVE_INC_ID, title: localize('sa.cie', 'Cumulative Incidence Estimation') },
//	order: 8,
//});

//MenuRegistry.appendMenuItem(SASubmenuId, {
//	group: '3_sa',
//	command: { id: SA_NET_SURVIVAL_ID, title: localize('sa.nse', 'Net Survival Estimators') },
//	order: 9,
//});

//MenuRegistry.appendMenuItem(SASubmenuId, {
//	group: '3_sa',
//	command: { id: SA_GRAFFEO_LR_ID, title: localize('sa.glrt', 'Graff\u00e9o\u00b4s Log-Rank Test') },
//	order: 10,
//});

// ============================================
// SUBMENU: KERNEL METHODS
// ============================================

MenuRegistry.appendMenuItem(KMSubmenuId, {
	group: '1_km',
	command: { id: KM_KERNEL_FUNCTIONS_ID, title: localize('km.kf', 'Kernel Functions (KF)') },
	order: 1,
});

MenuRegistry.appendMenuItem(KMSubmenuId, {
	group: '2_km',
	command: { id: KM_GP_ID, title: localize('km.gp', 'Gaussian Processes (GP)') },
	order: 2,
});

MenuRegistry.appendMenuItem(KMSubmenuId, {
	group: '3_km',
	command: { id: KM_SVM_ID, title: localize('km.svm', 'Support Vector Machines (SVM)') },
	order: 3,
});

// ============================================
// SUBMENU: NAIVE BAYES
// ============================================

MenuRegistry.appendMenuItem(NBSubmenuId, {
	group: '1_nb',
	command: { id: NB_GAUSSIAN_ID, title: localize('nb.gc', 'Gaussian NB Classifier') },
	order: 1,
});

MenuRegistry.appendMenuItem(NBSubmenuId, {
	group: '1_nb',
	command: { id: NB_MULTINOMIAL_ID, title: localize('nb.mc', 'Multinomial NB Classifier') },
	order: 2,
});

MenuRegistry.appendMenuItem(NBSubmenuId, {
	group: '1_nb',
	command: { id: NB_HYBRID_ID, title: localize('hb.mc', 'Hybrid NB Classifier') },
	order: 3,
});

// ============================================
// SUBMENU: DECISION TREES
// ============================================

// MenuRegistry.appendMenuItem(DTRFSubmenuId, {
// 	group: '1_dt',
// 	command: { id: DTRF_DT_ID, title: localize('dt.dt', 'Decision Tree') },
// 	order: 1,
// }); // DecisionTree.jl

// MenuRegistry.appendMenuItem(DTRFSubmenuId, {
// 	group: '1_dtrf',
// 	command: { id: DTRF_RANDOM_DT_ID, title: localize('dtrf.rdt', 'Random Decision Tree') },
// 	order: 2,
// });

// MenuRegistry.appendMenuItem(DTRFSubmenuId, {
// 	group: '1_dtrf',
// 	command: { id: DTRF_RF_ID, title: localize('dtrf.rf', 'Random Forest') },
// 	order: 4,
// });

// MenuRegistry.appendMenuItem(DTRFSubmenuId, {
// 	group: '1_dt',
// 	command: { id: DTRF_MODAL_DT_ID, title: localize('dt.mdt', 'Modal Decision Tree') },
// 	order: 2,
// }); // ModalDecisionTrees.jl

// MenuRegistry.appendMenuItem(DTRFSubmenuId, {
// 	group: '1_dt',
// 	command: { id: DTRF_DTBM_ID, title: localize('dt.dtbm', 'Differentiable Decision Tree') },
// 	order: 3,
// }); // NeuroTreeModels.jl


// ============================================
// SUBMENU: K-NEAREST NEIGHBOURS
// ============================================

// MenuRegistry.appendMenuItem(KNNSubmenuId, {
// 	group: '1_knn',
// 	command: { id: KNN_EXACT_ID, title: localize('knn.eknn', 'Exact K-Nearest Neighbours') },
// 	order: 1,
// });

// MenuRegistry.appendMenuItem(KNNSubmenuId, {
// 	group: '1_knn',
// 	command: { id: KNN_APPROXIMATE_ID, title: localize('knn.aknn', 'Approximate K-Nearest Neighbours') },
// 	order: 2,
// });


// ============================================
// SUBMENU: DISCRIMINANT ANALYSIS
// ============================================

MenuRegistry.appendMenuItem(DASubmenuId, {
	group: '1_da',
	command: { id: DA_LDA_ID, title: localize('da.lda', 'Linear Discriminant Analysis (LDA)') },
	order: 1,
});

MenuRegistry.appendMenuItem(DASubmenuId, {
	group: '1_da',
	command: { id: DA_RDA_ID, title: localize('da.rda', 'Regularized Discriminant Analysis') },
	order: 2,
});

MenuRegistry.appendMenuItem(DASubmenuId, {
	group: '1_da',
	command: { id: DA_MCLDA_ID, title: localize('da.mclda', 'Multi-Class LDA') },
	order: 3,
});

MenuRegistry.appendMenuItem(DASubmenuId, {
	group: '1_da',
	command: { id: DA_QDA_ID, title: localize('da.qda', 'Quadratic Discriminant Analysis') },
	order: 4,
});

MenuRegistry.appendMenuItem(DASubmenuId, {
	group: '2_da',
	command: { id: DA_PLSDA_ID, title: localize('da.plsr', 'Partial Least Squares Discriminant Analysis') },
	order: 5,
});

MenuRegistry.appendMenuItem(DASubmenuId, {
	group: '2_da',
	command: { id: DA_FDA_ID, title: localize('da.fda', 'Factorial Discriminant Analysis') },
	order: 6,
});


// ============================================
// SUBMENU: NEURAL NETWORKS
// ============================================

MenuRegistry.appendMenuItem(NNSubmenuId, {
	group: '1_nn',
	command: { id: NN_FNN_ID, title: localize('nn.fnn', 'Feedforward Neural Network') },
	order: 1,
}); // Flux.jl

MenuRegistry.appendMenuItem(NNSubmenuId, {
	group: '1_nn',
	command: { id: NN_NF_ID, title: localize('nn.nf', 'Normalising Flows') },
	order: 6,
}); // Flux.jl

MenuRegistry.appendMenuItem(NNSubmenuId, {
	group: '1_nn',
	command: { id: NN_RNN_ID, title: localize('nn.rnn', 'Recurrent Neural Network') },
	order: 1,
}); // Flux.jl

MenuRegistry.appendMenuItem(NNSubmenuId, {
	group: '1_nn',
	command: { id: NN_RL_ID, title: localize('nn.rl', 'Recurrent Layers') },
	order: 2,
}); // RecurrentLayers.jl, LuxRecurrentLayers.jl


MenuRegistry.appendMenuItem(NNSubmenuId, {
	group: '1_nn',
	command: { id: NN_CNN_ID, title: localize('nn.cnn', 'Convolutional Neural Network') },
	order: 3,
}); // Flux.jl

MenuRegistry.appendMenuItem(NNSubmenuId, {
	group: '1_nn',
	command: { id: NN_GNN_ID, title: localize('nn.gnn', 'Graph Neural Network') },
	order: 4,
}); // Flux.jl, GeometricFlux.jl

MenuRegistry.appendMenuItem(NNSubmenuId, {
	group: '1_nn',
	command: { id: NN_TF_ID, title: localize('nn.t', 'Transformers') },
	order: 5,
}); // Flux.jl, Transformers.jl

// Neural Networks for Estimation
MenuRegistry.appendMenuItem(NNSubmenuId, {
	group: '2_nn_estimation',
	command: { id: 'chiara.statistics.sbi', title: localize('nn.sbi', 'Simulation-Based Inference') },
	order: 1,
}); // NeuralEstimators.jl — amortized Bayesian posterior inference

MenuRegistry.appendMenuItem(NNSubmenuId, {
 	group: '2_nn_estimation',
	command: { id: 'chiara.statistics.nn.node', title: localize('nn.node', 'Neural ODEs for System Identification') },
 	order: 2,
}); // DiffEqFlux.jl

// MenuRegistry.appendMenuItem(NNSubmenuId, {
//	group: '2_nn_estimation',
//	command: { id: 'chiara.statistics.nn.pinn', precondition: ContextKeyExpr.false(), title: localize('nn.pinn', 'Physics-Informed Neural Networks') },
//	order: 3,
//}); // NeuralPDE.jl


// ============================================
// SUBMENU: BAYESIAN ANALYSIS
// ============================================

MenuRegistry.appendMenuItem(BASubmenuId, {
	group: '1_ba',
	command: { id: 'chiara.statistics.ppl.turing', title: localize('ba.turing', 'Sampling-Based Bayesian Inference') },
	order: 1,
}); // Metropolis-Hastings, Hamiltonian Monte Carlo (HMC), No-U-Turn Sampler (NUTS) via Turing.jl

MenuRegistry.appendMenuItem(BASubmenuId, {
	group: '1_ba',
	command: { id: 'chiara.statistics.ba.rxinfer', title: localize('ba.rxinfer', 'Fast Variational Bayesian Inference') },
	order: 2,
}); // Automated Bayesian inference on factor graphs

MenuRegistry.appendMenuItem(BASubmenuId, {
	group: '1_ba',
	command: { id: 'chiara.statistics.ba.bnet', title: localize('ba.bnet', 'Bayesian Network Inference') },
	order: 3,
}); // Structure learning, exact and approximate inference via BayesNets.jl


// ============================================
// SUBMENU: CLUSTERING
// ============================================

MenuRegistry.appendMenuItem(CLSubmenuId, {
	group: '1_cl',
	command: { id: CL_PARTITIONAL_ID, title: localize('cl.partitional', 'Partitional & Density Clustering') },
	order: 1,
});

MenuRegistry.appendMenuItem(CLSubmenuId, {
	group: '1_cl',
	command: { id: CL_HIERARCHICAL_ID, title: localize('cl.hc', 'Hierarchical Clustering') },
	order: 2,
});

// ============================================
// SUBMENU: DIMENSIONALITY REDUCTION METHODS
// ============================================

MenuRegistry.appendMenuItem(PMSubmenuId, {
	group: '1_pm',
	command: { id: PM_LCA_ID, title: localize('pm.lca', 'Latent Component Analysis') },
	order: 1,
});

MenuRegistry.appendMenuItem(PMSubmenuId, {
	group: '2_pm',
	command: { id: PM_CCA_ID, title: localize('pm.cca', 'Canonical Correlation Analysis') },
	order: 1,
});

MenuRegistry.appendMenuItem(PMSubmenuId, {
	group: '2_pm',
	command: { id: PM_MANIFOLD_ID, title: localize('pm.manifold', 'Manifold Learning') },
	order: 2,
});

MenuRegistry.appendMenuItem(PMSubmenuId, {
	group: '2_pm',
	command: { id: PM_EMBEDDING_ID, title: localize('pm.embedding', 'Neighbour Embedding') },
	order: 3,
});

MenuRegistry.appendMenuItem(PMSubmenuId, {
	group: '2_pm',
	command: { id: PM_AUTOENCODER_ID, title: localize('pm.autoencoder', 'Autoencoders') },
	order: 4,
});

MenuRegistry.appendMenuItem(PMSubmenuId, {
	group: '3_pm',
	command: { id: PM_COV_SHRINKAGE_ID, title: localize('pm.covShrinkage', 'Regularised Covariance Estimation') },
	order: 1,
});


// ============================================
// SUBSUBMENU: EXTREME VALUE AND RARE EVENTS
// (registered here; parented by E_RMTSubmenuId in explore.contribution.ts)
// ============================================

// Group 1 — Distribution Fitting
MenuRegistry.appendMenuItem(EVSubmenuId, {
	group: '1_dist',
	command: { id: EV_GEV_ID, title: localize('evre.gev', 'Generalized Extreme Value Distribution') },
	order: 1,
}); // Fit, Evaluate and Sample

MenuRegistry.appendMenuItem(EVSubmenuId, {
	group: '1_dist',
	command: { id: EV_GP_ID, title: localize('evre.gp', 'Generalized Pareto Distribution') },
	order: 2,
});  // Fit, Evaluate and Sample

// Group 2 — EVT Risk Measures
MenuRegistry.appendMenuItem(EVSubmenuId, {
	group: '2_risk',
	command: { id: EV_RISK_MEASURES_ID, title: localize('evre.riskMeasures', 'EVT Risk Measures') },
	order: 1,
});

// Group 3 — Diagnostics
MenuRegistry.appendMenuItem(EVSubmenuId, {
	group: '3_diag',
	command: { id: EV_DIAGNOSTICS_ID, title: localize('evre.diagnostics', 'EVT Diagnostics') },
	order: 1,
});

// ============================================
// STUB COMMANDS: NATURAL LANGUAGE PROCESSING
// (no webviews yet — implementations to follow)
// ============================================

CommandsRegistry.registerCommand(NLP_DTM_TFIDF_ID, (accessor: ServicesAccessor) => {
	openDtmWebview(
		accessor.get(IWebviewWorkbenchService),
		accessor.get(IOpenerService),
		accessor.get(IEditorService),
		accessor.get(IQuickInputService),
		accessor.get(ICommandService),
		accessor.get(IClipboardService),
		accessor.get(INotificationService),
	);
});
CommandsRegistry.registerCommand(NLP_COOCCURRENCE_ID, (accessor: ServicesAccessor) => {
	openComWebview(
		accessor.get(IWebviewWorkbenchService),
		accessor.get(IOpenerService),
		accessor.get(IEditorService),
		accessor.get(IQuickInputService),
		accessor.get(ICommandService),
		accessor.get(IClipboardService),
		accessor.get(INotificationService),
	);
});
CommandsRegistry.registerCommand(NLP_LANG_MODEL_ID, (accessor: ServicesAccessor) => {
	openSlmWebview(
		accessor.get(IWebviewWorkbenchService),
		accessor.get(IOpenerService),
		accessor.get(IEditorService),
		accessor.get(IQuickInputService),
		accessor.get(ICommandService),
		accessor.get(IClipboardService),
		accessor.get(INotificationService),
	);
});
CommandsRegistry.registerCommand(NLP_LSA_ID, (accessor: ServicesAccessor) => {
	openLsaWebview(
		accessor.get(IWebviewWorkbenchService),
		accessor.get(IOpenerService),
		accessor.get(IEditorService),
		accessor.get(IQuickInputService),
		accessor.get(ICommandService),
		accessor.get(IClipboardService),
		accessor.get(INotificationService),
	);
});
CommandsRegistry.registerCommand(NLP_LDA_ID, (accessor: ServicesAccessor) => {
	openLdaWebview(
		accessor.get(IWebviewWorkbenchService),
		accessor.get(IOpenerService),
		accessor.get(IEditorService),
		accessor.get(IQuickInputService),
		accessor.get(ICommandService),
		accessor.get(IClipboardService),
		accessor.get(INotificationService),
		'lda',
	);
});
CommandsRegistry.registerCommand(NLP_FLDA_ID, (accessor: ServicesAccessor) => {
	openLdaWebview(
		accessor.get(IWebviewWorkbenchService),
		accessor.get(IOpenerService),
		accessor.get(IEditorService),
		accessor.get(IQuickInputService),
		accessor.get(ICommandService),
		accessor.get(IClipboardService),
		accessor.get(INotificationService),
		'flda',
	);
});
CommandsRegistry.registerCommand(NLP_CTM_ID, (accessor: ServicesAccessor) => {
	openCtmWebview(
		accessor.get(IWebviewWorkbenchService),
		accessor.get(IOpenerService),
		accessor.get(IEditorService),
		accessor.get(IQuickInputService),
		accessor.get(ICommandService),
		accessor.get(IClipboardService),
		accessor.get(INotificationService),
		'ctm',
	);
});
CommandsRegistry.registerCommand(NLP_FCTM_ID, (accessor: ServicesAccessor) => {
	openCtmWebview(
		accessor.get(IWebviewWorkbenchService),
		accessor.get(IOpenerService),
		accessor.get(IEditorService),
		accessor.get(IQuickInputService),
		accessor.get(ICommandService),
		accessor.get(IClipboardService),
		accessor.get(INotificationService),
		'fctm',
	);
});
CommandsRegistry.registerCommand(NLP_CTPF_ID, (accessor: ServicesAccessor) => {
	openCtpfWebview(
		accessor.get(IWebviewWorkbenchService),
		accessor.get(IOpenerService),
		accessor.get(IEditorService),
		accessor.get(IQuickInputService),
		accessor.get(ICommandService),
		accessor.get(IClipboardService),
		accessor.get(INotificationService),
	);
});
CommandsRegistry.registerCommand(NLP_ROUGE_ID, (accessor: ServicesAccessor) => {
	openRougeWebview(
		accessor.get(IWebviewWorkbenchService),
		accessor.get(IOpenerService),
		accessor.get(IEditorService),
		accessor.get(IQuickInputService),
		accessor.get(ICommandService),
		accessor.get(IClipboardService),
		accessor.get(INotificationService),
	);
});
CommandsRegistry.registerCommand(NLP_LLM_TA_ID, (accessor: ServicesAccessor) => {
	openLlmTaWebview(
		accessor.get(IWebviewWorkbenchService),
		accessor.get(IOpenerService),
		accessor.get(IEditorService),
		accessor.get(IQuickInputService),
		accessor.get(ICommandService),
		accessor.get(IClipboardService),
		accessor.get(INotificationService),
	);
});
CommandsRegistry.registerCommand(NLP_BERT_ID, (accessor: ServicesAccessor) => {
	openBertWebview(
		accessor.get(IWebviewWorkbenchService),
		accessor.get(IOpenerService),
		accessor.get(IEditorService),
		accessor.get(IQuickInputService),
		accessor.get(ICommandService),
		accessor.get(IClipboardService),
		accessor.get(INotificationService),
	);
});
CommandsRegistry.registerCommand(NLP_COLBERT_ID, (accessor: ServicesAccessor) => {
	openClbtWebview(
		accessor.get(IWebviewWorkbenchService),
		accessor.get(IOpenerService),
		accessor.get(IEditorService),
		accessor.get(IQuickInputService),
		accessor.get(ICommandService),
		accessor.get(IClipboardService),
		accessor.get(INotificationService),
	);
});

CommandsRegistry.registerCommand('chiara.statistics.sreg', (accessor: ServicesAccessor) => {
	openSregWebview(
		accessor.get(IWebviewWorkbenchService),
		accessor.get(IOpenerService),
		accessor.get(IEditorService),
		accessor.get(IQuickInputService),
		accessor.get(ICommandService),
		accessor.get(IClipboardService),
		accessor.get(INotificationService),
	);
});

// ============================================
// SUBMENU: NATURAL LANGUAGE PROCESSING
// ============================================

MenuRegistry.appendMenuItem(NLPSubmenuId, {
	group: '1_nlp',
	submenu: DocRepSubmenuId,
	title: localize('nlp.docRep', 'Document Representation'),
	order: 1,
}); // TextAnalysis.jl

MenuRegistry.appendMenuItem(NLPSubmenuId, {
	group: '1_nlp',
	submenu: TopicModelsSubmenuId,
	title: localize('nlp.topicModels', 'Topic & Semantic Models'),
	order: 2,
}); // TextAnalysis.jl + TopicModels.jl

MenuRegistry.appendMenuItem(NLPSubmenuId, {
	group: '2_nlp',
	command: { id: NLP_ROUGE_ID, title: localize('nlp.rouge', 'ROUGE Evaluation') },
	order: 1,
}); // TextAnalysis.jl

MenuRegistry.appendMenuItem(NLPSubmenuId, {
	group: '3_nlp',
	command: { id: NLP_LLM_TA_ID, title: localize('nlp.llmTextAnalysis', 'LLM Text Analysis') },
	order: 1,
}); // LLMTextAnalysis.jl

MenuRegistry.appendMenuItem(NLPSubmenuId, {
	group: '4_nlp',
	command: { id: NLP_BERT_ID, title: localize('nlp.bert', 'BERT Embeddings') },
	order: 1,
}); // Transformers.jl

MenuRegistry.appendMenuItem(NLPSubmenuId, {
	group: '4_nlp',
	command: { id: NLP_COLBERT_ID, title: localize('nlp.colbert', 'ColBERT Retrieval') },
	order: 2,
}); // ColBERT.jl

// ============================================
// SUBMENU: DOCUMENT REPRESENTATION
// ============================================

MenuRegistry.appendMenuItem(DocRepSubmenuId, {
	group: '1_dr',
	command: { id: NLP_DTM_TFIDF_ID, title: localize('nlp.dtmTfidf', 'Document-Term Matrix & TF-IDF') },
	order: 1,
}); // TextAnalysis.jl

MenuRegistry.appendMenuItem(DocRepSubmenuId, {
	group: '1_dr',
	command: { id: NLP_COOCCURRENCE_ID, title: localize('nlp.cooccurrence', 'Co-Occurrence Matrix') },
	order: 2,
}); // TextAnalysis.jl

MenuRegistry.appendMenuItem(DocRepSubmenuId, {
	group: '1_dr',
	command: { id: NLP_LANG_MODEL_ID, title: localize('nlp.languageModel', 'Statistical Language Model') },
	order: 3,
}); // TextAnalysis.jl

// ============================================
// SUBMENU: TOPIC & SEMANTIC MODELS
// ============================================

MenuRegistry.appendMenuItem(TopicModelsSubmenuId, {
	group: '1_tm',
	command: { id: NLP_LSA_ID, title: localize('nlp.lsa', 'Latent Semantic Analysis') },
	order: 1,
}); // TextAnalysis.jl

MenuRegistry.appendMenuItem(TopicModelsSubmenuId, {
	group: '2_tm',
	command: { id: NLP_LDA_ID, title: localize('nlp.lda', 'Latent Dirichlet Allocation') },
	order: 1,
}); // TopicModels.jl

MenuRegistry.appendMenuItem(TopicModelsSubmenuId, {
	group: '2_tm',
	command: { id: NLP_CTM_ID, title: localize('nlp.ctm', 'Correlated Topic Model') },
	order: 2,
}); // TopicModels.jl

MenuRegistry.appendMenuItem(TopicModelsSubmenuId, {
	group: '2_tm',
	command: { id: NLP_CTPF_ID, title: localize('nlp.ctpf', 'Collaborative Topic Poisson Factorisation') },
	order: 3,
}); // TopicModels.jl

