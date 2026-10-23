/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { localize } from '../../../../../vs/nls.js';
import { MenuRegistry, MenuId } from '../../../../platform/actions/common/actions.js';
import { CommandsRegistry } from '../../../../platform/commands/common/commands.js';
import { ServicesAccessor } from '../../../../platform/instantiation/common/instantiation.js';
import { TOOLBOX_SUBMENU_PREFIX } from '../../compose/common/toolboxPanels.js';

import { NLLS_PANEL } from './commands/nlls.command.js';
import { LM_PANEL } from './commands/lm.command.js';
import { GLM_PANEL } from './commands/glm.command.js';
import { openScaffoldWebview } from './commands/scaffold.command.js';
import { LMM_PANEL } from './commands/lmm.command.js';
import { GLMM_PANEL } from './commands/glmm.command.js';
import { LASSO_PANEL } from './commands/lasso.command.js';
import { RNG_PANEL } from './commands/rng.command.js';
import { QRNG_PANEL } from './commands/qrng.command.js';
import { DIST_PANEL } from './commands/dist.command.js';
import { DISTSAMPLING_PANEL } from './commands/distSampling.command.js';
import { HT_PANEL } from './commands/ht.command.js';
import { DE_PANEL } from './commands/de.command.js';
import { UP_PANEL } from './commands/up.command.js';
import { DF_PANEL } from './commands/df.command.js';
import { RQR_PANEL } from './commands/rqr.command.js';
import { SSM_PANEL } from './commands/ssm.command.js';
import { TTE_PANEL } from './commands/tte.command.js';
// Finance panels, deferred for a future Finance Toolbox: import { CTSV_PANEL } from './commands/ctsv.command.js';
import { NSCR_PANEL } from './commands/nscr.command.js';
import { TSF_PANEL } from './commands/tsf.command.js';
import { DT_PANEL } from './commands/dt.command.js';
import { KNN_PANEL } from './commands/knn.command.js';
import { RNN_PANEL } from './commands/rnn.command.js';
import { RL_PANEL } from './commands/rl.command.js';
import { registerPlutoCommands } from './commands/pluto.command.js';
import { registerNewJuliaFileCommand } from './commands/juliaFile.command.js';
import './juliaNotebookKernel.contribution.js';
import './credentialEnvironment.contribution.js';
import './customCopyFileSystem.contribution.js';
import { CNN_PANEL } from './commands/cnn.command.js';
import { GNN_PANEL } from './commands/gnn.command.js';
import { TRANSFORMER_PANEL } from './commands/transformer.command.js';
import { FNN_PANEL } from './commands/fnn.command.js';
import { NF_PANEL } from './commands/nf.command.js';
import { COPULA_PANEL } from './commands/copula.command.js';
import { CEVAL_PANEL } from './commands/ceval.command.js';
import { CPS_PANEL } from './commands/cps.command.js';
import { PPL_PANEL } from './commands/ppl.command.js';
import { RXINFER_PANEL } from './commands/rxinfer.command.js';
import { RULEBASED_PANEL } from './commands/rulebased.command.js';
// Finance panels, deferred for a future Finance Toolbox: import { HFCME_PANEL } from './commands/hfcme.command.js';
// Finance panels, deferred for a future Finance Toolbox: import { RCME_PANEL } from './commands/rcme.command.js';
import { ENSEMBLE_PANEL } from './commands/ensemble.command.js';
import { CLP_PANEL } from './commands/clp.command.js';
import { CLH_PANEL } from './commands/clh.command.js';
import { MANIFOLD_PANEL } from './commands/manifold.command.js';
import { EMBEDDING_PANEL } from './commands/embedding.command.js';
import { AUTOENCODER_PANEL } from './commands/autoencoder.command.js';
import { LCA_PANEL } from './commands/lca.command.js';
// Finance panels, deferred for a future Finance Toolbox: import { VM_PANEL } from './commands/vm.command.js';
import { RP_PANEL } from './commands/rp.command.js';
import { HPT_PANEL } from './commands/hpt.command.js';
import { MC_PANEL } from './commands/mc.command.js';
import { CV_PANEL } from './commands/cv.command.js';
import { CLF_PANEL } from './commands/clf.command.js';
import { ADLP_PANEL } from './commands/adlp.command.js';
import { SBI_PANEL } from './commands/sbi.command.js';
import { EXP_PANEL } from './commands/exp.command.js';
// Finance panels, deferred for a future Finance Toolbox: import { MMN_PANEL } from './commands/mmn.command.js';
import { NNLS_PANEL } from './commands/nnls.command.js';
import { TSLS_PANEL } from './commands/tsls.command.js';
import { GMM_PANEL } from './commands/gmm.command.js';
// Finance panels, deferred for a future Finance Toolbox: import { LRM_PANEL } from './commands/lrm.command.js';
import { GEV_PANEL } from './commands/gev.command.js';
import { GP_PANEL } from './commands/gp.command.js';
import { EVTRISK_PANEL } from './commands/evtRisk.command.js';
import { EVTDIAG_PANEL } from './commands/evtDiag.command.js';
import { HARE_PANEL } from './commands/hare.command.js';
// Finance panels, deferred for a future Finance Toolbox: import { RVOL_PANEL } from './commands/rvol.command.js';
import { LMAR_PANEL } from './commands/lmar.command.js';
import { LMHAR_PANEL } from './commands/lmhar.command.js';
// Finance panels, deferred for a future Finance Toolbox: import { PO_PANEL } from './commands/po.command.js';
import { OA_PANEL } from './commands/oa.command.js';
import { CDS_PANEL } from './commands/cds.command.js';
import { DMAP_PANEL } from './commands/dmap.command.js';
import { NODE_PANEL } from './commands/node.command.js';
import { ATTR_PANEL } from './commands/attr.command.js';
import { CHAOS_PANEL } from './commands/chaos.command.js';
import { CMPLX_PANEL } from './commands/cmplx.command.js';
import { ABM_PANEL } from './commands/abm.command.js';
import { ABMENS_PANEL } from './commands/abmEns.command.js';
import { ABMVIZ_PANEL } from './commands/abmViz.command.js';
// Finance panels, deferred for a future Finance Toolbox: import { TRAD_PANEL } from './commands/trad.command.js';
import { NET_PANEL } from './commands/net.command.js';
import { NETDYN_PANEL } from './commands/netdyn.command.js';
import { NETFLOW_PANEL } from './commands/netflow.command.js';
import { CRN_PANEL } from './commands/crn.command.js';
import { CCA_PANEL } from './commands/cca.command.js';
import { COVSHRINKAGE_PANEL } from './commands/covShrinkage.command.js';
import { LLMTA_PANEL } from './commands/llmTa.command.js';
import { ROUGE_PANEL } from './commands/rouge.command.js';
import { DTM_PANEL } from './commands/dtm.command.js';
import { SLM_PANEL } from './commands/slm.command.js';
import { COM_PANEL } from './commands/com.command.js';
import { LSA_PANEL } from './commands/lsa.command.js';
import { LDA_PANEL } from './commands/lda.command.js';
import { CTM_PANEL } from './commands/ctm.command.js';
import { BERT_PANEL } from './commands/bert.command.js';
import { CLBT_PANEL } from './commands/clbt.command.js';
import { CTPF_PANEL } from './commands/ctpf.command.js';
import { PTP_PANEL } from './commands/ptp.command.js';
import { SREG_PANEL } from './commands/sreg.command.js';
import { SI_PANEL } from './commands/si.command.js';
import { ODE_PANEL } from './commands/ode.command.js';
import { LP_PANEL } from './commands/lp.command.js';
import { QP_PANEL } from './commands/qp.command.js';
import { MPNLP_PANEL } from './commands/mpnlp.command.js';
import { MPCONE_PANEL } from './commands/mpcone.command.js';
import { MPSDP_PANEL } from './commands/mpsdp.command.js';
import { MPMICP_PANEL } from './commands/mpmicp.command.js';
import { MPSOS_PANEL } from './commands/mpsos.command.js';

// ============================================
// COMMAND REGISTRATION
// ============================================

const MODEL_COMMAND_ID = 'workbench.action.showModel';

CommandsRegistry.registerCommand(MODEL_COMMAND_ID, () => {
	console.log('Model command executed!');
});

CommandsRegistry.registerCommand('chiara.statistics.de', accessor => openScaffoldWebview(accessor, DE_PANEL));

CommandsRegistry.registerCommand('chiara.statistics.ht', accessor => openScaffoldWebview(accessor, HT_PANEL));

CommandsRegistry.registerCommand('chiara.statistics.d', accessor => openScaffoldWebview(accessor, DIST_PANEL));

CommandsRegistry.registerCommand('chiara.statistics.d.sampling', accessor => openScaffoldWebview(accessor, DISTSAMPLING_PANEL));

CommandsRegistry.registerCommand('chiara.statistics.ds', accessor => openScaffoldWebview(accessor, DISTSAMPLING_PANEL));

CommandsRegistry.registerCommand('chiara.statistics.copula', accessor => openScaffoldWebview(accessor, CEVAL_PANEL));

CommandsRegistry.registerCommand('chiara.statistics.copula.estimation', accessor => openScaffoldWebview(accessor, COPULA_PANEL));

CommandsRegistry.registerCommand('chiara.statistics.cs', accessor => openScaffoldWebview(accessor, CPS_PANEL));

CommandsRegistry.registerCommand('chiara.statistics.ar.associationRules', (accessor: ServicesAccessor) => {
	openScaffoldWebview(accessor, RULEBASED_PANEL);
});

CommandsRegistry.registerCommand('chiara.statistics.ensemble.ensembleLearning', (accessor: ServicesAccessor) => {
	openScaffoldWebview(accessor, ENSEMBLE_PANEL);
});

CommandsRegistry.registerCommand('chiara.statistics.up', accessor => openScaffoldWebview(accessor, UP_PANEL));

const PPL_OPEN = (accessor: ServicesAccessor) => openScaffoldWebview(accessor, PPL_PANEL);

CommandsRegistry.registerCommand('chiara.statistics.ppl', PPL_OPEN);
CommandsRegistry.registerCommand('chiara.statistics.ppl.turing', PPL_OPEN);


CommandsRegistry.registerCommand('chiara.statistics.ba.rxinfer', accessor => openScaffoldWebview(accessor, RXINFER_PANEL));

const SBI_OPEN = (accessor: ServicesAccessor) => openScaffoldWebview(accessor, SBI_PANEL);

CommandsRegistry.registerCommand('chiara.statistics.sbi', SBI_OPEN);
CommandsRegistry.registerCommand('chiara.statistics.nn.node', accessor => openScaffoldWebview(accessor, NODE_PANEL));

const EXP_OPEN = (accessor: ServicesAccessor) => openScaffoldWebview(accessor, EXP_PANEL);

CommandsRegistry.registerCommand('chiara.statistics.expectation', EXP_OPEN);

CommandsRegistry.registerCommand('chiara.statistics.df', accessor => openScaffoldWebview(accessor, DF_PANEL));

CommandsRegistry.registerCommand('chiara.statistics.rng', accessor => openScaffoldWebview(accessor, RNG_PANEL));

CommandsRegistry.registerCommand('chiara.statistics.qrng', accessor => openScaffoldWebview(accessor, QRNG_PANEL));

CommandsRegistry.registerCommand('chiara.statistics.nlls', accessor => openScaffoldWebview(accessor, NLLS_PANEL));

CommandsRegistry.registerCommand('chiara.statistics.lmm', accessor => openScaffoldWebview(accessor, LMM_PANEL));

CommandsRegistry.registerCommand('chiara.statistics.glmm', accessor => openScaffoldWebview(accessor, GLMM_PANEL));

CommandsRegistry.registerCommand('chiara.statistics.lm', accessor => openScaffoldWebview(accessor, LM_PANEL));
CommandsRegistry.registerCommand('chiara.statistics.lm.ols', accessor => openScaffoldWebview(accessor, LM_PANEL, 'ols'));
CommandsRegistry.registerCommand('chiara.statistics.lm.hac', accessor => openScaffoldWebview(accessor, LM_PANEL, 'ols'));
CommandsRegistry.registerCommand('chiara.statistics.lm.wls', accessor => openScaffoldWebview(accessor, LM_PANEL, 'wls'));
// Finance panel, deferred: CommandsRegistry.registerCommand('chiara.statistics.rbv', accessor => openScaffoldWebview(accessor, RVOL_PANEL));
CommandsRegistry.registerCommand('chiara.statistics.lm.hetero', accessor => openScaffoldWebview(accessor, HARE_PANEL));
CommandsRegistry.registerCommand('chiara.statistics.lm.ar1', accessor => openScaffoldWebview(accessor, LMAR_PANEL));
// Finance panel, deferred: CommandsRegistry.registerCommand('chiara.statistics.eco.po', accessor => openScaffoldWebview(accessor, PO_PANEL));
CommandsRegistry.registerCommand('chiara.statistics.eco.oa', accessor => openScaffoldWebview(accessor, OA_PANEL));
CommandsRegistry.registerCommand('chiara.statistics.nonlin.cds', accessor => openScaffoldWebview(accessor, CDS_PANEL));
CommandsRegistry.registerCommand('chiara.statistics.nonlin.dmap', accessor => openScaffoldWebview(accessor, DMAP_PANEL));
CommandsRegistry.registerCommand('chiara.statistics.nonlin.attr', accessor => openScaffoldWebview(accessor, ATTR_PANEL));
CommandsRegistry.registerCommand('chiara.statistics.nonlin.chaos', accessor => openScaffoldWebview(accessor, CHAOS_PANEL));
CommandsRegistry.registerCommand('chiara.statistics.nonlin.cmplx', accessor => openScaffoldWebview(accessor, CMPLX_PANEL));
CommandsRegistry.registerCommand('chiara.simulate.abm', accessor => openScaffoldWebview(accessor, ABM_PANEL));
CommandsRegistry.registerCommand('chiara.simulate.abm-ens', accessor => openScaffoldWebview(accessor, ABMENS_PANEL));
CommandsRegistry.registerCommand('chiara.simulate.abm-viz', accessor => openScaffoldWebview(accessor, ABMVIZ_PANEL));
// Finance panel, deferred: CommandsRegistry.registerCommand('chiara.simulate.abm-ta', accessor => openScaffoldWebview(accessor, TRAD_PANEL));
CommandsRegistry.registerCommand('chiara.simulate.net', accessor => openScaffoldWebview(accessor, NET_PANEL));
CommandsRegistry.registerCommand('chiara.simulate.netdyn', accessor => openScaffoldWebview(accessor, NETDYN_PANEL));
CommandsRegistry.registerCommand('chiara.simulate.netflow', accessor => openScaffoldWebview(accessor, NETFLOW_PANEL));
CommandsRegistry.registerCommand('chiara.simulate.crn', accessor => openScaffoldWebview(accessor, CRN_PANEL));
CommandsRegistry.registerCommand('chiara.statistics.lm.heteroar1', accessor => openScaffoldWebview(accessor, LMHAR_PANEL));
CommandsRegistry.registerCommand('chiara.statistics.lm.nnls', accessor => openScaffoldWebview(accessor, NNLS_PANEL));
CommandsRegistry.registerCommand('chiara.statistics.lm.tsls', accessor => openScaffoldWebview(accessor, TSLS_PANEL));
CommandsRegistry.registerCommand('chiara.statistics.lm.gmm', accessor => openScaffoldWebview(accessor, GMM_PANEL));

const LASSO_OPEN = (accessor: ServicesAccessor, initialMode?: string) => openScaffoldWebview(accessor, LASSO_PANEL, initialMode);

CommandsRegistry.registerCommand('chiara.statistics.rrq', accessor => LASSO_OPEN(accessor, 'lasso'));
CommandsRegistry.registerCommand('chiara.statistics.rrq.lasso', accessor => LASSO_OPEN(accessor, 'lasso'));
CommandsRegistry.registerCommand('chiara.statistics.rrq.elasticNet', accessor => LASSO_OPEN(accessor, 'enet'));

const RQR_OPEN = (accessor: ServicesAccessor, initialMode?: string) => openScaffoldWebview(accessor, RQR_PANEL, initialMode);

CommandsRegistry.registerCommand('chiara.statistics.rqr', accessor => RQR_OPEN(accessor));
CommandsRegistry.registerCommand('chiara.statistics.rqr.rl0', accessor => RQR_OPEN(accessor, 'robust'));
CommandsRegistry.registerCommand('chiara.statistics.rqr.rl1l2', accessor => RQR_OPEN(accessor, 'robust'));
CommandsRegistry.registerCommand('chiara.statistics.rqr.ql0', accessor => RQR_OPEN(accessor, 'quantile'));
CommandsRegistry.registerCommand('chiara.statistics.rqr.ql1l2', accessor => RQR_OPEN(accessor, 'quantile'));

const SSM_OPEN = (accessor: ServicesAccessor, initialFilter?: string) => openScaffoldWebview(accessor, SSM_PANEL, initialFilter);

CommandsRegistry.registerCommand('chiara.statistics.ssm', accessor => SSM_OPEN(accessor));

CommandsRegistry.registerCommand('chiara.statistics.tvm.dtsv', () => { });

// Finance panel, deferred: const CTSV_OPEN = (accessor: ServicesAccessor) => openScaffoldWebview(accessor, CTSV_PANEL);

// Finance panel, deferred: CommandsRegistry.registerCommand('chiara.statistics.tvm.ctsv', accessor => CTSV_OPEN(accessor));
// Finance panel, deferred: CommandsRegistry.registerCommand('chiara.statistics.dm.heston', accessor => CTSV_OPEN(accessor));
// Finance panel, deferred: CommandsRegistry.registerCommand('chiara.statistics.jdm.bates', accessor => CTSV_OPEN(accessor));
// Finance panel, deferred: CommandsRegistry.registerCommand('chiara.statistics.irm.sabr', accessor => CTSV_OPEN(accessor));
CommandsRegistry.registerCommand('chiara.statistics.tvm.taylor', () => { });
CommandsRegistry.registerCommand('chiara.statistics.tvm.ksc', () => { });
CommandsRegistry.registerCommand('chiara.statistics.vm', () => { });
// Finance panel, deferred: CommandsRegistry.registerCommand('chiara.statistics.eco.hfcme', accessor => openScaffoldWebview(accessor, HFCME_PANEL));
// Finance panel, deferred: CommandsRegistry.registerCommand('chiara.statistics.eco.rcme', accessor => openScaffoldWebview(accessor, RCME_PANEL));

// Finance panel, deferred: CommandsRegistry.registerCommand('chiara.statistics.eco.mmn', accessor => openScaffoldWebview(accessor, MMN_PANEL));

// Finance panel, deferred: CommandsRegistry.registerCommand('chiara.statistics.rmt.lrm', accessor => openScaffoldWebview(accessor, LRM_PANEL));
CommandsRegistry.registerCommand('chiara.statistics.ev.gev', accessor => openScaffoldWebview(accessor, GEV_PANEL));
CommandsRegistry.registerCommand('chiara.statistics.ev.gp', accessor => openScaffoldWebview(accessor, GP_PANEL));
CommandsRegistry.registerCommand('chiara.statistics.ev.riskMeasures', accessor => openScaffoldWebview(accessor, EVTRISK_PANEL));
CommandsRegistry.registerCommand('chiara.statistics.ev.diagnostics', accessor => openScaffoldWebview(accessor, EVTDIAG_PANEL));

CommandsRegistry.registerCommand('chiara.statistics.ml.logpdf', accessor => openScaffoldWebview(accessor, ADLP_PANEL));


const TTE_OPEN = (accessor: ServicesAccessor, initialMethod?: string) => openScaffoldWebview(accessor, TTE_PANEL, initialMethod);

CommandsRegistry.registerCommand('chiara.statistics.tte', accessor => TTE_OPEN(accessor));

const PTP_OPEN = (accessor: ServicesAccessor, initialModel?: string) => openScaffoldWebview(accessor, PTP_PANEL, initialModel);

CommandsRegistry.registerCommand('chiara.statistics.pp', accessor => PTP_OPEN(accessor));

const NSCR_OPEN = (accessor: ServicesAccessor, initialMethod?: string) => openScaffoldWebview(accessor, NSCR_PANEL, initialMethod);

CommandsRegistry.registerCommand('chiara.statistics.nscr', accessor => NSCR_OPEN(accessor));

const TSF_OPEN = (accessor: ServicesAccessor, initialMethod?: string) => openScaffoldWebview(accessor, TSF_PANEL, initialMethod);

CommandsRegistry.registerCommand('chiara.statistics.tsf', accessor => TSF_OPEN(accessor));

CommandsRegistry.registerCommand('chiara.statistics.si', accessor => openScaffoldWebview(accessor, SI_PANEL));

CommandsRegistry.registerCommand('chiara.statistics.ode', accessor => openScaffoldWebview(accessor, ODE_PANEL));

CommandsRegistry.registerCommand('chiara.mp.lp', accessor => openScaffoldWebview(accessor, LP_PANEL));

CommandsRegistry.registerCommand('chiara.mp.milp', accessor => openScaffoldWebview(accessor, LP_PANEL, 'milp'));

CommandsRegistry.registerCommand('chiara.mp.qp', accessor => openScaffoldWebview(accessor, QP_PANEL));

CommandsRegistry.registerCommand('chiara.mp.qcqp', accessor => openScaffoldWebview(accessor, QP_PANEL, 'qcqp'));

CommandsRegistry.registerCommand('chiara.mp.miqp', accessor => openScaffoldWebview(accessor, QP_PANEL, 'miqp'));

CommandsRegistry.registerCommand('chiara.mp.nlp', accessor => openScaffoldWebview(accessor, MPNLP_PANEL));

CommandsRegistry.registerCommand('chiara.mp.minlp', accessor => openScaffoldWebview(accessor, MPNLP_PANEL, 'minlp'));

CommandsRegistry.registerCommand('chiara.mp.cone', accessor => openScaffoldWebview(accessor, MPCONE_PANEL));

CommandsRegistry.registerCommand('chiara.mp.sdp', accessor => openScaffoldWebview(accessor, MPSDP_PANEL));

CommandsRegistry.registerCommand('chiara.mp.micp', accessor => openScaffoldWebview(accessor, MPMICP_PANEL));

CommandsRegistry.registerCommand('chiara.mp.sos', accessor => openScaffoldWebview(accessor, MPSOS_PANEL));

const DT_OPEN = (accessor: ServicesAccessor, initialModel?: string) => openScaffoldWebview(accessor, DT_PANEL, initialModel);

CommandsRegistry.registerCommand('chiara.statistics.dtrf.dt', accessor => DT_OPEN(accessor));
CommandsRegistry.registerCommand('chiara.statistics.dtrf.modalDt', accessor => DT_OPEN(accessor));
CommandsRegistry.registerCommand('chiara.statistics.dtrf.randomDt', accessor => DT_OPEN(accessor));

const CLP_OPEN = (accessor: ServicesAccessor, initialModel?: string) => openScaffoldWebview(accessor, CLP_PANEL, initialModel);

CommandsRegistry.registerCommand('chiara.statistics.cl.partitional', accessor => CLP_OPEN(accessor));

CommandsRegistry.registerCommand('chiara.statistics.cl.hierarchical', accessor => openScaffoldWebview(accessor, CLH_PANEL));

CommandsRegistry.registerCommand('chiara.statistics.pm.manifold', accessor => openScaffoldWebview(accessor, MANIFOLD_PANEL));

CommandsRegistry.registerCommand('chiara.statistics.pm.embedding', accessor => openScaffoldWebview(accessor, EMBEDDING_PANEL));

CommandsRegistry.registerCommand('chiara.statistics.pm.autoencoder', accessor => openScaffoldWebview(accessor, AUTOENCODER_PANEL));

CommandsRegistry.registerCommand('chiara.statistics.pm.lca', accessor => openScaffoldWebview(accessor, LCA_PANEL));

CommandsRegistry.registerCommand('chiara.statistics.pm.cca', accessor => openScaffoldWebview(accessor, CCA_PANEL));

CommandsRegistry.registerCommand('chiara.statistics.pm.covShrinkage', accessor => openScaffoldWebview(accessor, COVSHRINKAGE_PANEL));

// Finance panel, deferred: CommandsRegistry.registerCommand('chiara.statistics.vm', accessor => openScaffoldWebview(accessor, VM_PANEL));

CommandsRegistry.registerCommand('chiara.statistics.mwm.regressionPerf', accessor => openScaffoldWebview(accessor, RP_PANEL));

const HPT_OPEN = (accessor: ServicesAccessor, initialModel?: string) => openScaffoldWebview(accessor, HPT_PANEL, initialModel);

CommandsRegistry.registerCommand('chiara.statistics.mwm.hpt', accessor => HPT_OPEN(accessor));

const MC_OPEN = (accessor: ServicesAccessor, initialModel?: string) => openScaffoldWebview(accessor, MC_PANEL, initialModel);

CommandsRegistry.registerCommand('chiara.statistics.mwm.calibration', accessor => MC_OPEN(accessor));

const CV_OPEN = (accessor: ServicesAccessor) => openScaffoldWebview(accessor, CV_PANEL);

CommandsRegistry.registerCommand('chiara.statistics.mwm.dataPartition', accessor => CV_OPEN(accessor));
CommandsRegistry.registerCommand('chiara.statistics.mwm.trainTestSplit', accessor => CV_OPEN(accessor));
CommandsRegistry.registerCommand('chiara.statistics.mwm.kfoldCV', accessor => CV_OPEN(accessor));
CommandsRegistry.registerCommand('chiara.statistics.mwm.stratifiedKfold', accessor => CV_OPEN(accessor));
CommandsRegistry.registerCommand('chiara.statistics.mwm.loocv', accessor => CV_OPEN(accessor));

const CLF_OPEN = (accessor: ServicesAccessor, initialModel?: string) => openScaffoldWebview(accessor, CLF_PANEL, initialModel);

CommandsRegistry.registerCommand('chiara.statistics.mwm.classificationPerf', accessor => CLF_OPEN(accessor, 'metrics'));
CommandsRegistry.registerCommand('chiara.statistics.mwm.roc', accessor => CLF_OPEN(accessor, 'roc'));

CommandsRegistry.registerCommand('chiara.statistics.knn', accessor => openScaffoldWebview(accessor, KNN_PANEL));

const RNN_OPEN = (accessor: ServicesAccessor, initialModel?: string) => openScaffoldWebview(accessor, RNN_PANEL, initialModel);

CommandsRegistry.registerCommand('chiara.statistics.nn.rnn', accessor => RNN_OPEN(accessor));

registerPlutoCommands();
registerNewJuliaFileCommand();

CommandsRegistry.registerCommand('chiara.statistics.nn.rl', accessor => openScaffoldWebview(accessor, RL_PANEL));

CommandsRegistry.registerCommand('chiara.statistics.nn.cnn', accessor => openScaffoldWebview(accessor, CNN_PANEL));

CommandsRegistry.registerCommand('chiara.statistics.nn.gnn', accessor => openScaffoldWebview(accessor, GNN_PANEL));

CommandsRegistry.registerCommand('chiara.statistics.nn.transformer', accessor => openScaffoldWebview(accessor, TRANSFORMER_PANEL));

CommandsRegistry.registerCommand('chiara.statistics.nn.nf', accessor => openScaffoldWebview(accessor, NF_PANEL));

CommandsRegistry.registerCommand('chiara.statistics.nn.fnn', accessor => openScaffoldWebview(accessor, FNN_PANEL));

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

const MWMSubmenuId = new MenuId('menubarMWMSubmenu');
export const EVSubmenuId = new MenuId('menubarEVSubmenu');
const LMSubmenuId = new MenuId('menubarLMSubmenu'); // Linear Models
const SASubmenuId = new MenuId('menubarSASubmenu');
const NNSubmenuId = new MenuId('menubarNNSubmenu');
const CLSubmenuId = new MenuId('menubarCLSubmenu');
const PMSubmenuId = new MenuId('menubarPMSubmenu');

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

// Model Evaluation
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

// Linear Models
export const LM_COMMAND_ID = 'chiara.statistics.lm';

// Generalized Linear Models (GLM)
export const GLM_COMMAND_ID = 'chiara.statistics.glm';

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
export const ECO_MMN_ID = 'chiara.statistics.eco.mmn';
export const ECO_IVS_ID = 'chiara.statistics.eco.ivs';
export const TVM_TAYLOR_ID = 'chiara.statistics.tvm.taylor';
export const TVM_KSC_ID = 'chiara.statistics.tvm.ksc';

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
	title: localize('showStatistics.mwm', 'Model Evaluation'),
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


MenuRegistry.appendMenuItem(MenuId.MenubarModelMenu, {
	group: '7_ml',
	command: { id: AR_ASSOCIATION_RULES_ID, title: localize('showStatistics.ar', 'Rule-Based Methods') },
	order: 3,
});


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
	command: { id: 'chiara.statistics.de', title: localize('showStatistics.de', 'Density Estimation') },
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
// (in the Financial Econometrics Toolbox's menu, so it shows when that toolbox extension is installed)
// ============================================

MenuRegistry.appendMenuItem(MenuId.for(`${TOOLBOX_SUBMENU_PREFIX}econometrics`), {
	group: '4_et',
	submenu: EVSubmenuId,
	title: localize('showStatistics.ev', 'Extreme Value and Rare Events'),
	order: 1,
});

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

CommandsRegistry.registerCommand(NLP_DTM_TFIDF_ID, accessor => openScaffoldWebview(accessor, DTM_PANEL));
CommandsRegistry.registerCommand(NLP_COOCCURRENCE_ID, accessor => openScaffoldWebview(accessor, COM_PANEL));
CommandsRegistry.registerCommand(NLP_LANG_MODEL_ID, accessor => openScaffoldWebview(accessor, SLM_PANEL));
CommandsRegistry.registerCommand(NLP_LSA_ID, accessor => openScaffoldWebview(accessor, LSA_PANEL));
CommandsRegistry.registerCommand(NLP_LDA_ID, accessor => openScaffoldWebview(accessor, LDA_PANEL, 'lda'));
CommandsRegistry.registerCommand(NLP_CTM_ID, accessor => openScaffoldWebview(accessor, CTM_PANEL, 'ctm'));
CommandsRegistry.registerCommand(NLP_FCTM_ID, accessor => openScaffoldWebview(accessor, CTM_PANEL, 'fctm'));
CommandsRegistry.registerCommand(NLP_CTPF_ID, accessor => openScaffoldWebview(accessor, CTPF_PANEL));
CommandsRegistry.registerCommand(NLP_ROUGE_ID, accessor => openScaffoldWebview(accessor, ROUGE_PANEL));
CommandsRegistry.registerCommand(NLP_LLM_TA_ID, accessor => openScaffoldWebview(accessor, LLMTA_PANEL));
CommandsRegistry.registerCommand(NLP_BERT_ID, accessor => openScaffoldWebview(accessor, BERT_PANEL));
CommandsRegistry.registerCommand(NLP_COLBERT_ID, accessor => openScaffoldWebview(accessor, CLBT_PANEL));

CommandsRegistry.registerCommand('chiara.statistics.sreg', accessor => openScaffoldWebview(accessor, SREG_PANEL));

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
}); // TextAnalysis.jl

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

