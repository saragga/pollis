/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { localize } from '../../../../../vs/nls.js';
import { MenuRegistry, MenuId } from '../../../../platform/actions/common/actions.js';
import { ContextKeyExpr } from '../../../../platform/contextkey/common/contextkey.js';
import { CommandsRegistry, ICommandService } from '../../../../platform/commands/common/commands.js';
import { ServicesAccessor } from '../../../../platform/instantiation/common/instantiation.js';
import { IWebviewWorkbenchService } from '../../webviewPanel/browser/webviewWorkbenchService.js';
import { IOpenerService } from '../../../../platform/opener/common/opener.js';
import { IEditorService } from '../../../services/editor/common/editorService.js';
import { IQuickInputService } from '../../../../platform/quickinput/common/quickInput.js';
import { IClipboardService } from '../../../../platform/clipboard/common/clipboardService.js';
import { INotificationService } from '../../../../platform/notification/common/notification.js';
import { openIdoWebview } from '../../model/browser/commands/ido.command.js';
import { openOptimWebview } from '../../model/browser/commands/optim.command.js';
import { openDsWebview } from '../../model/browser/commands/ds.command.js';
import { openSoWebview } from '../../model/browser/commands/so.command.js';
import { openFoWebview } from '../../model/browser/commands/fo.command.js';
import { openQnWebview } from '../../model/browser/commands/qn.command.js';
import { openSgmWebview } from '../../model/browser/commands/sgm.command.js';
import { openFomWebview } from '../../model/browser/commands/fom.command.js';
import { openCamWebview } from '../../model/browser/commands/cam.command.js';
import { openNllsWebview } from '../../model/browser/commands/nlls.command.js';
import { openDgoWebview } from '../../model/browser/commands/dgo.command.js';
import { openPgoWebview } from '../../model/browser/commands/pgo.command.js';
import { openHnsWebview } from '../../model/browser/commands/hns.command.js';
import { openEsWebview } from '../../model/browser/commands/es.command.js';
import { openDevolWebview } from '../../model/browser/commands/devol.command.js';
import { openGalgWebview } from '../../model/browser/commands/galg.command.js';
import { openCoptWebview } from '../../model/browser/commands/copt.command.js';
import { openProxWebview } from '../../model/browser/commands/prox.command.js';
import { openMbmWebview } from '../../model/browser/commands/mbm.command.js';
import { openDcoWebview } from '../../model/browser/commands/dco.command.js';
import { openSwarmWebview } from '../../model/browser/commands/swarm.command.js';
import { openBoptWebview } from '../../model/browser/commands/bopt.command.js';
import { openSboWebview } from '../../model/browser/commands/sbo.command.js';
import { openMoptWebview } from '../../model/browser/commands/mopt.command.js';
import { openNgoWebview } from '../../model/browser/commands/ngo.command.js';
import { openCmpWebview } from '../../model/browser/commands/cmp.command.js';
import { openVariWebview } from '../../model/browser/commands/vari.command.js';
import { openGtWebview } from '../../model/browser/commands/gt.command.js';
import { openMpecWebview } from '../../model/browser/commands/mpec.command.js';
import { openBlvWebview } from '../../model/browser/commands/blv.command.js';
import { openDpWebview } from '../../model/browser/commands/dp.command.js';
import { openMdpWebview } from '../../model/browser/commands/mdp.command.js';
import { openMadpWebview } from '../../model/browser/commands/madp.command.js';
import { openRoptWebview } from '../../model/browser/commands/ropt.command.js';
import { openSproWebview } from '../../model/browser/commands/spro.command.js';
import { openCcdrWebview } from '../../model/browser/commands/ccdr.command.js';
import { openPbmWebview } from '../../model/browser/commands/pbm.command.js';
import { openDcmWebview } from '../../model/browser/commands/dcm.command.js';
import { openMpmWebview } from '../../model/browser/commands/mpm.command.js';
import { openBndtWebview } from '../../model/browser/commands/bndt.command.js';
import { openQlWebview } from '../../model/browser/commands/ql.command.js';
import { openPgmWebview } from '../../model/browser/commands/pgm.command.js';
import { openAcmWebview } from '../../model/browser/commands/acm.command.js';
import { openMarlWebview } from '../../model/browser/commands/marl.command.js';
import { openAzeroWebview } from '../../model/browser/commands/azero.command.js';
import { openLqrWebview } from '../../model/browser/commands/lqr.command.js';
import { openTrajWebview } from '../../model/browser/commands/traj.command.js';
import { openMpcWebview } from '../../model/browser/commands/mpc.command.js';
// import { METHODS } from 'http';

const OPTIMISE_COMMAND_ID = 'workbench.action.showOptimise';
const IDO_ID = 'chiara.optimise.ido';
const LQR_ID = 'chiara.optimise.oc.1_classical';
const TRAJ_ID = 'chiara.optimise.oc.2_traj';
const MPC_ID  = 'chiara.optimise.oc.3_mpc';
const OPTIM_ID = 'chiara.optimise.local';
const DS_ID = 'chiara.optimise.ds';
const SO_ID = 'chiara.optimise.so';
const FO_ID = 'chiara.optimise.fo';
const NLLS_ID = 'chiara.optimise.nlls';
const QN_ID = 'chiara.optimise.qn';
const SGM_ID = 'chiara.optimise.sgm';
const FOM_ID = 'chiara.optimise.sgm.fom';
const CAM_ID = 'chiara.optimise.sgm.cam';
const DGO_ID = 'chiara.optimise.go.dg';
const PGO_ID = 'chiara.optimise.go.pg';
const HNS_ID = 'chiara.optimise.go.hn';
const ES_ID = 'chiara.optimise.ec.es';
const DEVOL_ID = 'chiara.optimise.ec.devol';
const GALG_ID = 'chiara.optimise.ec.galg';
const COPT_ID = 'chiara.optimise.gbo.co';
const PROX_ID = 'chiara.optimise.gbo.np';
const MBM_ID = 'chiara.optimise.gfo.mb';
const DCO_ID = 'chiara.optimise.dco';
const SWARM_ID = 'chiara.optimise.swarm';
const BOPT_ID = 'chiara.optimise.bopt';
const SBO_ID = 'chiara.optimise.sbo';
const MOPT_ID = 'chiara.optimise.mopt';
const NGO_ID = 'chiara.optimise.ngo';
const CMP_ID = 'chiara.optimise.evp.cmp';
const VARI_ID = 'chiara.optimise.evp.vari';
const NASH_ID = 'chiara.optimise.evp.nash';
const MPEC_ID = 'chiara.optimise.evp.mpec';
const BLV_ID = 'chiara.optimise.evp.blv';
const DP_ID = 'chiara.optimise.dp';
const MDP_ID = 'chiara.optimise.mdp';
const MADP_ID = 'chiara.optimise.madp';
const ROPT_ID = 'chiara.optimise.ropt';
const SPRO_ID = 'chiara.optimise.spro';
const CCDR_ID = 'chiara.optimise.ccdr';
const PBM_ID = 'chiara.optimise.moo.pb';
const DCM_ID = 'chiara.optimise.moo.dc';
const MPM_ID = 'chiara.optimise.moo.pm';

CommandsRegistry.registerCommand(OPTIMISE_COMMAND_ID, () => {
	console.log('Optimise command executed!');
});

CommandsRegistry.registerCommand(OPTIM_ID, (accessor: ServicesAccessor) => {
	openOptimWebview(
		accessor.get(IWebviewWorkbenchService),
		accessor.get(IOpenerService),
		accessor.get(IEditorService),
		accessor.get(IQuickInputService),
		accessor.get(ICommandService),
		accessor.get(IClipboardService),
		accessor.get(INotificationService),
	);
});

CommandsRegistry.registerCommand(DS_ID, (accessor: ServicesAccessor) => {
	openDsWebview(
		accessor.get(IWebviewWorkbenchService),
		accessor.get(IOpenerService),
		accessor.get(IEditorService),
		accessor.get(IQuickInputService),
		accessor.get(ICommandService),
		accessor.get(IClipboardService),
		accessor.get(INotificationService),
	);
});

CommandsRegistry.registerCommand(SO_ID, (accessor: ServicesAccessor) => {
	openSoWebview(
		accessor.get(IWebviewWorkbenchService),
		accessor.get(IOpenerService),
		accessor.get(IEditorService),
		accessor.get(IQuickInputService),
		accessor.get(ICommandService),
		accessor.get(IClipboardService),
		accessor.get(INotificationService),
	);
});

CommandsRegistry.registerCommand(FO_ID, (accessor: ServicesAccessor) => {
	openFoWebview(
		accessor.get(IWebviewWorkbenchService),
		accessor.get(IOpenerService),
		accessor.get(IEditorService),
		accessor.get(IQuickInputService),
		accessor.get(ICommandService),
		accessor.get(IClipboardService),
		accessor.get(INotificationService),
	);
});

CommandsRegistry.registerCommand(QN_ID, (accessor: ServicesAccessor) => {
	openQnWebview(
		accessor.get(IWebviewWorkbenchService),
		accessor.get(IOpenerService),
		accessor.get(IEditorService),
		accessor.get(IQuickInputService),
		accessor.get(ICommandService),
		accessor.get(IClipboardService),
		accessor.get(INotificationService),
	);
});

CommandsRegistry.registerCommand(SGM_ID, (accessor: ServicesAccessor) => {
	openSgmWebview(
		accessor.get(IWebviewWorkbenchService),
		accessor.get(IOpenerService),
		accessor.get(IEditorService),
		accessor.get(IQuickInputService),
		accessor.get(ICommandService),
		accessor.get(IClipboardService),
		accessor.get(INotificationService),
	);
});

CommandsRegistry.registerCommand(FOM_ID, (accessor: ServicesAccessor) => {
	openFomWebview(
		accessor.get(IWebviewWorkbenchService),
		accessor.get(IOpenerService),
		accessor.get(IEditorService),
		accessor.get(IQuickInputService),
		accessor.get(ICommandService),
		accessor.get(IClipboardService),
		accessor.get(INotificationService),
	);
});

CommandsRegistry.registerCommand(CAM_ID, (accessor: ServicesAccessor) => {
	openCamWebview(
		accessor.get(IWebviewWorkbenchService),
		accessor.get(IOpenerService),
		accessor.get(IEditorService),
		accessor.get(IQuickInputService),
		accessor.get(ICommandService),
		accessor.get(IClipboardService),
		accessor.get(INotificationService),
	);
});

CommandsRegistry.registerCommand(IDO_ID, (accessor: ServicesAccessor) => {
	openIdoWebview(
		accessor.get(IWebviewWorkbenchService),
		accessor.get(IOpenerService),
		accessor.get(IEditorService),
		accessor.get(IQuickInputService),
		accessor.get(ICommandService),
		accessor.get(IClipboardService),
		accessor.get(INotificationService),
	);
});

CommandsRegistry.registerCommand(LQR_ID, (accessor: ServicesAccessor) => {
	openLqrWebview(
		accessor.get(IWebviewWorkbenchService),
		accessor.get(IOpenerService),
		accessor.get(IEditorService),
		accessor.get(IQuickInputService),
		accessor.get(ICommandService),
		accessor.get(IClipboardService),
		accessor.get(INotificationService),
	);
});

CommandsRegistry.registerCommand(TRAJ_ID, (accessor: ServicesAccessor) => {
	openTrajWebview(
		accessor.get(IWebviewWorkbenchService),
		accessor.get(IOpenerService),
		accessor.get(IEditorService),
		accessor.get(IQuickInputService),
		accessor.get(ICommandService),
		accessor.get(IClipboardService),
		accessor.get(INotificationService),
	);
});

CommandsRegistry.registerCommand(MPC_ID, (accessor: ServicesAccessor) => {
	openMpcWebview(
		accessor.get(IWebviewWorkbenchService),
		accessor.get(IOpenerService),
		accessor.get(IEditorService),
		accessor.get(IQuickInputService),
		accessor.get(ICommandService),
		accessor.get(IClipboardService),
		accessor.get(INotificationService),
	);
});


CommandsRegistry.registerCommand(NLLS_ID, (accessor: ServicesAccessor) => {
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

CommandsRegistry.registerCommand(DGO_ID, (accessor: ServicesAccessor) => {
	openDgoWebview(
		accessor.get(IWebviewWorkbenchService),
		accessor.get(IOpenerService),
		accessor.get(IEditorService),
		accessor.get(IQuickInputService),
		accessor.get(ICommandService),
		accessor.get(IClipboardService),
		accessor.get(INotificationService),
	);
});

CommandsRegistry.registerCommand(PGO_ID, (accessor: ServicesAccessor) => {
	openPgoWebview(
		accessor.get(IWebviewWorkbenchService),
		accessor.get(IOpenerService),
		accessor.get(IEditorService),
		accessor.get(IQuickInputService),
		accessor.get(ICommandService),
		accessor.get(IClipboardService),
		accessor.get(INotificationService),
	);
});

CommandsRegistry.registerCommand(HNS_ID, (accessor: ServicesAccessor) => {
	openHnsWebview(
		accessor.get(IWebviewWorkbenchService),
		accessor.get(IOpenerService),
		accessor.get(IEditorService),
		accessor.get(IQuickInputService),
		accessor.get(ICommandService),
		accessor.get(IClipboardService),
		accessor.get(INotificationService),
	);
});

CommandsRegistry.registerCommand(ES_ID, (accessor: ServicesAccessor) => {
	openEsWebview(
		accessor.get(IWebviewWorkbenchService),
		accessor.get(IOpenerService),
		accessor.get(IEditorService),
		accessor.get(IQuickInputService),
		accessor.get(ICommandService),
		accessor.get(IClipboardService),
		accessor.get(INotificationService),
	);
});

CommandsRegistry.registerCommand(DEVOL_ID, (accessor: ServicesAccessor) => {
	openDevolWebview(
		accessor.get(IWebviewWorkbenchService),
		accessor.get(IOpenerService),
		accessor.get(IEditorService),
		accessor.get(IQuickInputService),
		accessor.get(ICommandService),
		accessor.get(IClipboardService),
		accessor.get(INotificationService),
	);
});

CommandsRegistry.registerCommand(COPT_ID, (accessor: ServicesAccessor) => {
	openCoptWebview(
		accessor.get(IWebviewWorkbenchService),
		accessor.get(IOpenerService),
		accessor.get(IEditorService),
		accessor.get(IQuickInputService),
		accessor.get(ICommandService),
		accessor.get(IClipboardService),
		accessor.get(INotificationService),
	);
});

CommandsRegistry.registerCommand(GALG_ID, (accessor: ServicesAccessor) => {
	openGalgWebview(
		accessor.get(IWebviewWorkbenchService),
		accessor.get(IOpenerService),
		accessor.get(IEditorService),
		accessor.get(IQuickInputService),
		accessor.get(ICommandService),
		accessor.get(IClipboardService),
		accessor.get(INotificationService),
	);
});

CommandsRegistry.registerCommand(MBM_ID, (accessor: ServicesAccessor) => {
	openMbmWebview(
		accessor.get(IWebviewWorkbenchService),
		accessor.get(IOpenerService),
		accessor.get(IEditorService),
		accessor.get(IQuickInputService),
		accessor.get(ICommandService),
		accessor.get(IClipboardService),
		accessor.get(INotificationService),
	);
});

CommandsRegistry.registerCommand(PROX_ID, (accessor: ServicesAccessor) => {
	openProxWebview(
		accessor.get(IWebviewWorkbenchService),
		accessor.get(IOpenerService),
		accessor.get(IEditorService),
		accessor.get(IQuickInputService),
		accessor.get(ICommandService),
		accessor.get(IClipboardService),
		accessor.get(INotificationService),
	);
});

CommandsRegistry.registerCommand(DCO_ID, (accessor: ServicesAccessor) => {
	openDcoWebview(
		accessor.get(IWebviewWorkbenchService),
		accessor.get(IOpenerService),
		accessor.get(IEditorService),
		accessor.get(IQuickInputService),
		accessor.get(ICommandService),
		accessor.get(IClipboardService),
		accessor.get(INotificationService),
	);
});

CommandsRegistry.registerCommand(SWARM_ID, (accessor: ServicesAccessor) => {
	openSwarmWebview(
		accessor.get(IWebviewWorkbenchService),
		accessor.get(IOpenerService),
		accessor.get(IEditorService),
		accessor.get(IQuickInputService),
		accessor.get(ICommandService),
		accessor.get(IClipboardService),
		accessor.get(INotificationService),
	);
});

CommandsRegistry.registerCommand(BOPT_ID, (accessor: ServicesAccessor) => {
	openBoptWebview(
		accessor.get(IWebviewWorkbenchService),
		accessor.get(IOpenerService),
		accessor.get(IEditorService),
		accessor.get(IQuickInputService),
		accessor.get(ICommandService),
		accessor.get(IClipboardService),
		accessor.get(INotificationService),
	);
});

CommandsRegistry.registerCommand(SBO_ID, (accessor: ServicesAccessor) => {
	openSboWebview(
		accessor.get(IWebviewWorkbenchService),
		accessor.get(IOpenerService),
		accessor.get(IEditorService),
		accessor.get(IQuickInputService),
		accessor.get(ICommandService),
		accessor.get(IClipboardService),
		accessor.get(INotificationService),
	);
});

CommandsRegistry.registerCommand(MOPT_ID, (accessor: ServicesAccessor) => {
	openMoptWebview(
		accessor.get(IWebviewWorkbenchService),
		accessor.get(IOpenerService),
		accessor.get(IEditorService),
		accessor.get(IQuickInputService),
		accessor.get(ICommandService),
		accessor.get(IClipboardService),
		accessor.get(INotificationService),
	);
});

CommandsRegistry.registerCommand(NGO_ID, (accessor: ServicesAccessor) => {
	openNgoWebview(
		accessor.get(IWebviewWorkbenchService),
		accessor.get(IOpenerService),
		accessor.get(IEditorService),
		accessor.get(IQuickInputService),
		accessor.get(ICommandService),
		accessor.get(IClipboardService),
		accessor.get(INotificationService),
	);
});

CommandsRegistry.registerCommand(MDP_ID, (accessor: ServicesAccessor) => {
	openMdpWebview(
		accessor.get(IWebviewWorkbenchService),
		accessor.get(IOpenerService),
		accessor.get(IEditorService),
		accessor.get(IQuickInputService),
		accessor.get(ICommandService),
		accessor.get(IClipboardService),
		accessor.get(INotificationService),
	);
});

CommandsRegistry.registerCommand(MADP_ID, (accessor: ServicesAccessor) => {
	openMadpWebview(
		accessor.get(IWebviewWorkbenchService),
		accessor.get(IOpenerService),
		accessor.get(IEditorService),
		accessor.get(IQuickInputService),
		accessor.get(ICommandService),
		accessor.get(IClipboardService),
		accessor.get(INotificationService),
	);
});

CommandsRegistry.registerCommand('chiara.statistics.rl.bndt', (accessor: ServicesAccessor) => {
	openBndtWebview(
		accessor.get(IWebviewWorkbenchService),
		accessor.get(IOpenerService),
		accessor.get(IEditorService),
		accessor.get(IQuickInputService),
		accessor.get(ICommandService),
		accessor.get(IClipboardService),
		accessor.get(INotificationService),
	);
});

CommandsRegistry.registerCommand('chiara.statistics.rl.ql', (accessor: ServicesAccessor) => {
	openQlWebview(
		accessor.get(IWebviewWorkbenchService),
		accessor.get(IOpenerService),
		accessor.get(IEditorService),
		accessor.get(IQuickInputService),
		accessor.get(ICommandService),
		accessor.get(IClipboardService),
		accessor.get(INotificationService),
	);
});

CommandsRegistry.registerCommand('chiara.statistics.rl.pgm', (accessor: ServicesAccessor) => {
	openPgmWebview(
		accessor.get(IWebviewWorkbenchService),
		accessor.get(IOpenerService),
		accessor.get(IEditorService),
		accessor.get(IQuickInputService),
		accessor.get(ICommandService),
		accessor.get(IClipboardService),
		accessor.get(INotificationService),
	);
});

CommandsRegistry.registerCommand('chiara.statistics.rl.acm', (accessor: ServicesAccessor) => {
	openAcmWebview(
		accessor.get(IWebviewWorkbenchService),
		accessor.get(IOpenerService),
		accessor.get(IEditorService),
		accessor.get(IQuickInputService),
		accessor.get(ICommandService),
		accessor.get(IClipboardService),
		accessor.get(INotificationService),
	);
});

CommandsRegistry.registerCommand('chiara.statistics.rl.marl', (accessor: ServicesAccessor) => {
	openMarlWebview(
		accessor.get(IWebviewWorkbenchService),
		accessor.get(IOpenerService),
		accessor.get(IEditorService),
		accessor.get(IQuickInputService),
		accessor.get(ICommandService),
		accessor.get(IClipboardService),
		accessor.get(INotificationService),
	);
});

CommandsRegistry.registerCommand('chiara.statistics.rl.azero', (accessor: ServicesAccessor) => {
	openAzeroWebview(
		accessor.get(IWebviewWorkbenchService),
		accessor.get(IOpenerService),
		accessor.get(IEditorService),
		accessor.get(IQuickInputService),
		accessor.get(ICommandService),
		accessor.get(IClipboardService),
		accessor.get(INotificationService),
	);
});

CommandsRegistry.registerCommand(DP_ID, (accessor: ServicesAccessor) => {
	openDpWebview(
		accessor.get(IWebviewWorkbenchService),
		accessor.get(IOpenerService),
		accessor.get(IEditorService),
		accessor.get(IQuickInputService),
		accessor.get(ICommandService),
		accessor.get(IClipboardService),
		accessor.get(INotificationService),
	);
});

CommandsRegistry.registerCommand(CCDR_ID, (accessor: ServicesAccessor) => {
	openCcdrWebview(
		accessor.get(IWebviewWorkbenchService),
		accessor.get(IOpenerService),
		accessor.get(IEditorService),
		accessor.get(IQuickInputService),
		accessor.get(ICommandService),
		accessor.get(IClipboardService),
		accessor.get(INotificationService),
	);
});

CommandsRegistry.registerCommand(SPRO_ID, (accessor: ServicesAccessor) => {
	openSproWebview(
		accessor.get(IWebviewWorkbenchService),
		accessor.get(IOpenerService),
		accessor.get(IEditorService),
		accessor.get(IQuickInputService),
		accessor.get(ICommandService),
		accessor.get(IClipboardService),
		accessor.get(INotificationService),
	);
});

CommandsRegistry.registerCommand(ROPT_ID, (accessor: ServicesAccessor) => {
	openRoptWebview(
		accessor.get(IWebviewWorkbenchService),
		accessor.get(IOpenerService),
		accessor.get(IEditorService),
		accessor.get(IQuickInputService),
		accessor.get(ICommandService),
		accessor.get(IClipboardService),
		accessor.get(INotificationService),
	);
});

CommandsRegistry.registerCommand(BLV_ID, (accessor: ServicesAccessor) => {
	openBlvWebview(
		accessor.get(IWebviewWorkbenchService),
		accessor.get(IOpenerService),
		accessor.get(IEditorService),
		accessor.get(IQuickInputService),
		accessor.get(ICommandService),
		accessor.get(IClipboardService),
		accessor.get(INotificationService),
	);
});

CommandsRegistry.registerCommand(MPEC_ID, (accessor: ServicesAccessor) => {
	openMpecWebview(
		accessor.get(IWebviewWorkbenchService),
		accessor.get(IOpenerService),
		accessor.get(IEditorService),
		accessor.get(IQuickInputService),
		accessor.get(ICommandService),
		accessor.get(IClipboardService),
		accessor.get(INotificationService),
	);
});

CommandsRegistry.registerCommand(CMP_ID, (accessor: ServicesAccessor) => {
	openCmpWebview(
		accessor.get(IWebviewWorkbenchService),
		accessor.get(IOpenerService),
		accessor.get(IEditorService),
		accessor.get(IQuickInputService),
		accessor.get(ICommandService),
		accessor.get(IClipboardService),
		accessor.get(INotificationService),
	);
});

CommandsRegistry.registerCommand(VARI_ID, (accessor: ServicesAccessor) => {
	openVariWebview(
		accessor.get(IWebviewWorkbenchService),
		accessor.get(IOpenerService),
		accessor.get(IEditorService),
		accessor.get(IQuickInputService),
		accessor.get(ICommandService),
		accessor.get(IClipboardService),
		accessor.get(INotificationService),
	);
});

CommandsRegistry.registerCommand(NASH_ID, (accessor: ServicesAccessor) => {
	openGtWebview(
		accessor.get(IWebviewWorkbenchService),
		accessor.get(IOpenerService),
		accessor.get(IEditorService),
		accessor.get(IQuickInputService),
		accessor.get(ICommandService),
		accessor.get(IClipboardService),
		accessor.get(INotificationService),
		'potential',
	);
});

CommandsRegistry.registerCommand(PBM_ID, (accessor: ServicesAccessor) => {
	openPbmWebview(
		accessor.get(IWebviewWorkbenchService),
		accessor.get(IOpenerService),
		accessor.get(IEditorService),
		accessor.get(IQuickInputService),
		accessor.get(ICommandService),
		accessor.get(IClipboardService),
		accessor.get(INotificationService),
	);
});

CommandsRegistry.registerCommand(DCM_ID, (accessor: ServicesAccessor) => {
	openDcmWebview(
		accessor.get(IWebviewWorkbenchService),
		accessor.get(IOpenerService),
		accessor.get(IEditorService),
		accessor.get(IQuickInputService),
		accessor.get(ICommandService),
		accessor.get(IClipboardService),
		accessor.get(INotificationService),
	);
});

CommandsRegistry.registerCommand(MPM_ID, (accessor: ServicesAccessor) => {
	openMpmWebview(
		accessor.get(IWebviewWorkbenchService),
		accessor.get(IOpenerService),
		accessor.get(IEditorService),
		accessor.get(IQuickInputService),
		accessor.get(ICommandService),
		accessor.get(IClipboardService),
		accessor.get(INotificationService),
	);
});

// Register the Optimise menu to the main menu
MenuRegistry.appendMenuItem(MenuId.MenubarMainMenu, {
	submenu: MenuId.MenubarOptimiseMenu,
	title: {
		value: 'Optimise',
		original: 'Optimise',
		mnemonicTitle: localize({ key: 'mOptimise', comment: ['&& denotes a mnemonic'] }, "&&Optimise")
	},
	order: 8
});

// ============================================
// SUBMENU IDs — GROUP 1
// ============================================

const GBOSubmenuId = new MenuId('menubarGBOSubmenu');  // Gradient-Based Optimization
const SGMSubmenuId = new MenuId('menubarSGMSubmenu');  // Stochastic Gradient Methods
const GFOSubmenuId = new MenuId('menubarGFOSubmenu');  // Gradient-Free Optimization
const GOSubmenuId = new MenuId('menubarGOSubmenu');   // Global Optimization
const ECSubmenuId = new MenuId('menubarECSubmenu');   // Evolutionary Computation
const MOOSubmenuId = new MenuId('menubarMOOSubmenu');  // Multi-Objective Optimization
const HMOSubmenuId = new MenuId('menubarHMOSubmenu');  // Hybrid and Multistart Methods

// ============================================
// SUBMENU IDs — MATHEMATICAL PROGRAMMING
// ============================================

const LPSubmenuId = new MenuId('menubarMPLPSubmenu');   // Linear Programming
const QPSubmenuId = new MenuId('menubarMPQPSubmenu');   // Quadratic Programming

const CCPSubmenuId = new MenuId('menubarMPCCPSubmenu');  // Conic & Convex Programming
// NLPSubmenuId removed — Nonlinear Programming now uses a direct command
const CVPSubmenuId = new MenuId('menubarMPCVPSubmenu');  // Complementarity & Variational Problems

// ============================================
// SUBMENU IDs — GROUPS 3+
// ============================================

const OCSubmenuId = new MenuId('menubarOCSubmenu');  // Optimal Control
const SDMSubmenuId = new MenuId('menubarSDMSubmenu');  // Markov Decision Processes
const RLSubmenuId = new MenuId('menubarRLSubmenu');   // Reinforcement Learning

// ============================================
// SUBMENU DIY
// ============================================
const DIYSubmenuId = new MenuId('menubarDIYSubmenu'); // DIY Estimation Methods


MenuRegistry.appendMenuItem(MenuId.MenubarOptimiseMenu, {
	group: '1_optimisation',
	submenu: GFOSubmenuId,
	title: localize('optimise.gfo', 'Gradient-Free Optimisation'),
	order: 1,
});

MenuRegistry.appendMenuItem(MenuId.MenubarOptimiseMenu, {
	group: '1_optimisation',
	submenu: GBOSubmenuId,
	title: localize('optimise.gbo', 'Gradient-Based Optimisation'),
	order: 2,
});

MenuRegistry.appendMenuItem(MenuId.MenubarOptimiseMenu, {
	group: '1_optimisation',
	submenu: SGMSubmenuId,
	title: localize('optimise.sgm', 'Stochastic and Learning-Based Optimisation'),
	order: 3,
});

MenuRegistry.appendMenuItem(MenuId.MenubarOptimiseMenu, {
	group: '1_optimisation',
	submenu: GOSubmenuId,
	title: localize('optimise.go', 'Global Optimisation'),
	order: 4,
});

MenuRegistry.appendMenuItem(MenuId.MenubarOptimiseMenu, {
	group: '2_optimisation',
	command: { id: BOPT_ID, title: localize('optimise.bo', 'Bayesian Optimisation') },
	order: 1,
});

MenuRegistry.appendMenuItem(MenuId.MenubarOptimiseMenu, {
	group: '2_optimisation',
	command: { id: SBO_ID, title: localize('optimise.sbo', 'Surrogate-Based Optimisation') },
	order: 2,
});

MenuRegistry.appendMenuItem(MenuId.MenubarOptimiseMenu, {
	group: '3_optimisation',
	submenu: ECSubmenuId,
	title: localize('optimise.ec', 'Evolutionary Computation'),
	order: 1,
});

MenuRegistry.appendMenuItem(MenuId.MenubarOptimiseMenu, {
	group: '3_optimisation',
	command: { id: SWARM_ID, title: localize('optimise.si', 'Swarm Intelligence') },
	order: 2,
});

MenuRegistry.appendMenuItem(MenuId.MenubarOptimiseMenu, {
	group: '4_optimisation',
	command: { id: MOPT_ID, title: localize('optimise.mfo', 'Optimisation on Riemannian Manifolds') },
	order: 1,
}); // Manopt.jl

MenuRegistry.appendMenuItem(MenuId.MenubarOptimiseMenu, {
	group: '4_optimisation',
	command: { id: DCO_ID, title: localize('optimise.dco', 'Discrete and Combinatorial Optimisation') },
	order: 2,
});

MenuRegistry.appendMenuItem(MenuId.MenubarOptimiseMenu, {
	group: '4_optimisation',
	command: { id: NGO_ID, title: localize('optimise.ngo', 'Network and Graph Optimisation') },
	order: 3,
});

MenuRegistry.appendMenuItem(MenuId.MenubarOptimiseMenu, {
	group: '5_optimisation',
	submenu: MOOSubmenuId,
	title: localize('optimise.moo', 'Multi-Objective Optimisation'),
	order: 1,
});


// ============================================
// GROUP 2: MATHEMATICAL PROGRAMMING
// ============================================

MenuRegistry.appendMenuItem(MenuId.MenubarOptimiseMenu, {
	group: '6_optimisation',
	command: { id: 'chiara.mp.lp', title: localize('mp.lp', 'Linear Programming') },
	order: 1,
});

MenuRegistry.appendMenuItem(MenuId.MenubarOptimiseMenu, {
	group: '6_optimisation',
	command: { id: 'chiara.mp.qp', title: localize('mp.qp', 'Quadratic Programming') },
	order: 2,
});

MenuRegistry.appendMenuItem(MenuId.MenubarOptimiseMenu, {
	group: '6_optimisation',
	command: { id: 'chiara.mp.sos', title: localize('mp.pp', 'Polynomial Programming') },
	order: 3,
});

MenuRegistry.appendMenuItem(MenuId.MenubarOptimiseMenu, {
	group: '6_optimisation',
	submenu: CCPSubmenuId,
	title: localize('mp.ccp', 'Convex, Conic and Semidefinite Programming'),
	order: 4,
});

MenuRegistry.appendMenuItem(MenuId.MenubarOptimiseMenu, {
	group: '6_optimisation',
	command: { id: 'chiara.mp.nlp', title: localize('mp.nlp', 'Nonlinear Programming') },
	order: 5,
});

MenuRegistry.appendMenuItem(MenuId.MenubarOptimiseMenu, {
	group: '6_optimisation',
	command: { id: BLV_ID, title: localize('mp.gth', 'Hierarchical Optimisation') },
	order: 6,
}); // BilevelJuMP.jl

MenuRegistry.appendMenuItem(MenuId.MenubarOptimiseMenu, {
	group: '6_optimisation',
	submenu: CVPSubmenuId,
	title: localize('mp.cvp', 'Complementarity and Variational Problems'),
	order: 7,
});

MenuRegistry.appendMenuItem(MenuId.MenubarOptimiseMenu, {
	group: '7_optimisation',
	command: { id: ROPT_ID, title: localize('mp.ro', 'Uncertainty-Set Robust Optimisation') },
	order: 1,
});

MenuRegistry.appendMenuItem(MenuId.MenubarOptimiseMenu, {
	group: '7_optimisation',
	command: { id: CCDR_ID, title: localize('mp.ccdr', 'Chance-Constrained and Distributionally Robust') },
	order: 2,
}); // JuMP.jl, Clarabel.jl, HiGHS.jl

// ============================================
// GROUP 3: DYNAMIC AND SEQUENTIAL METHODS
// ============================================

MenuRegistry.appendMenuItem(MenuId.MenubarOptimiseMenu, {
	group: '8_optimisation',
	command: { id: SPRO_ID, title: localize('showOptimisation.sp', 'Stochastic Programming') },
	order: 1,
}); // StochasticPrograms.jl, SDDP.jl

MenuRegistry.appendMenuItem(MenuId.MenubarOptimiseMenu, {
	group: '8_optimisation',
	command: { id: DP_ID, title: localize('showOptimisation.dp', 'Dynamic Programming') },
	order: 2,
}); // QuantEcon.jl , StochDynamicProgramming.jl

MenuRegistry.appendMenuItem(MenuId.MenubarOptimiseMenu, {
	group: '8_optimisation',
	submenu: OCSubmenuId,
	title: localize('showOptimisation.oc', 'Optimal Control'),
	order: 3,
}); // ControlSystems.jl, TrajectoryOptimization.jl, ModelPredictiveControl.jl, RobotDynamics.jl

MenuRegistry.appendMenuItem(MenuId.MenubarOptimiseMenu, {
	group: '8_optimisation',
	submenu: SDMSubmenuId,
	title: localize('showOptimisation.sdm', 'Markov Decision Processes'),
	order: 4,
}); // POMDPs.jl, POMDPSolvers.jl, MCTS.jl

MenuRegistry.appendMenuItem(MenuId.MenubarOptimiseMenu, {
	group: '8_optimisation',
	submenu: RLSubmenuId,
	title: localize('showOptimisation.rl', 'Reinforcement Learning'),
	order: 5,
}); // ReinforcementLearning.jl

MenuRegistry.appendMenuItem(MenuId.MenubarOptimiseMenu, {
	group: '8_optimisation',
	command: {
		id: IDO_ID,
		title: localize('showOptimisation.ido', 'Infinite-Dimensional Optimisation')
	},
	order: 6,
});

// ============================================
// GROUP 4: DO-IT-YOURSELF ESTIMATION METHODS
// ============================================

//MenuRegistry.appendMenuItem(MenuId.MenubarOptimiseMenu, {
//	group: '9_optimisation',
//	submenu: DIYSubmenuId,
//	title: localize('showOptimisation.DIY', 'DO-IT-YOURSELF Estimation Methods'),
//	order: 1,
//});

// ============================================
// SUBMENU: GRADIENT-BASED OPTIMIZATION
// ============================================

MenuRegistry.appendMenuItem(GBOSubmenuId, {
	group: '1_gbo',
	command: { id: FO_ID, title: localize('gbo.fo', 'First-Order Methods') },
	order: 1,
});

MenuRegistry.appendMenuItem(GBOSubmenuId, {
	group: '1_gbo',
	command: { id: QN_ID, title: localize('gbo.qn', 'Quasi-Newton Methods') },
	order: 2,
});

MenuRegistry.appendMenuItem(GBOSubmenuId, {
	group: '1_gbo',
	command: { id: NLLS_ID, title: localize('gbo.nlls', 'Nonlinear Least Squares Methods') },
	order: 3,
}); // LeastSquaresOptim.jl for LevenbergMarquardt() and Dogleg(), NonlinearSolve.jl for GaussNewton()

MenuRegistry.appendMenuItem(GBOSubmenuId, {
	group: '1_gbo',
	command: { id: SO_ID, title: localize('gbo.so', 'Second-Order Methods') },
	order: 4,
});

MenuRegistry.appendMenuItem(GBOSubmenuId, {
	group: '1_gbo',
	command: { id: COPT_ID, title: localize('gbo.co', 'Constrained Optimisation') },
	order: 5,
});

MenuRegistry.appendMenuItem(GBOSubmenuId, {
	group: '1_gbo',
	command: { id: PROX_ID, title: localize('gbo.np', 'Nonsmooth and Proximal') },
	order: 6,
});

// ============================================
// SUBMENU: STOCHASTIC GRADIENT METHODS
// ============================================

MenuRegistry.appendMenuItem(SGMSubmenuId, {
	group: '1_sgm',
	command: { id: FOM_ID, title: localize('sgm.fom', 'First-Order Methods') },
	order: 1,
});

MenuRegistry.appendMenuItem(SGMSubmenuId, {
	group: '1_sgm',
	command: { id: CAM_ID, title: localize('sgm.cam', 'Curvature-Aware Methods') },
	order: 2,
});

// ============================================
// SUBMENU: GRADIENT-FREE OPTIMIZATION
// ============================================

MenuRegistry.appendMenuItem(GFOSubmenuId, {
	group: '1_gfo',
	command: { id: DS_ID, title: localize('gfo.ds', 'Direct Search Methods') },
	order: 1,
});

MenuRegistry.appendMenuItem(GFOSubmenuId, {
	group: '1_gfo',
	command: { id: MBM_ID, title: localize('gfo.mb', 'Model-Based Methods') },
	order: 2,
});


// ============================================
// SUBMENU: GLOBAL OPTIMIZATION
// ============================================

MenuRegistry.appendMenuItem(GOSubmenuId, {
	group: '1_go',
	command: { id: DGO_ID, title: localize('go.dg', 'Deterministic Global Methods') },
	order: 1,
});

MenuRegistry.appendMenuItem(GOSubmenuId, {
	group: '1_go',
	command: { id: PGO_ID, title: localize('go.pg', 'Principled Stochastic Search with Local Refinement') },
	order: 2,
});

MenuRegistry.appendMenuItem(GOSubmenuId, {
	group: '1_go',
	command: { id: HNS_ID, title: localize('go.hn', 'Stochastic Neighbourhood Search') },
	order: 3,
});



// ============================================
// SUBMENU: EVOLUTIONARY COMPUTATION
// ============================================

MenuRegistry.appendMenuItem(ECSubmenuId, {
	group: '1_ec',
	command: { id: ES_ID, title: localize('ec.es', 'Evolution Strategies') },
	order: 1,
});

MenuRegistry.appendMenuItem(ECSubmenuId, {
	group: '1_ec',
	command: { id: DEVOL_ID, title: localize('ec.de', 'Differential Evolution') },
	order: 2,
});

MenuRegistry.appendMenuItem(ECSubmenuId, {
	group: '1_ec',
	command: { id: GALG_ID, title: localize('ec.ga', 'Genetic Algorithms') },
	order: 3,
});


// ============================================
// SUBMENU: MULTI-OBJECTIVE OPTIMIZATION
// ============================================

MenuRegistry.appendMenuItem(MOOSubmenuId, {
	group: '1_moo',
	command: { id: PBM_ID, title: localize('moo.pb', 'Pareto-Based Methods') },
	order: 1,
});

MenuRegistry.appendMenuItem(MOOSubmenuId, {
	group: '1_moo',
	command: { id: DCM_ID, title: localize('moo.dc', 'Decomposition and Constrained Multiobjective') },
	order: 2,
});

MenuRegistry.appendMenuItem(MOOSubmenuId, {
	group: '1_moo',
	command: { id: MPM_ID, title: localize('moo.pm', 'Performance Metrics') },
	order: 3,
});

// ============================================
// SUBMENU: HYBRID AND MULTISTART METHODS
// ============================================

MenuRegistry.appendMenuItem(HMOSubmenuId, {
	group: '1_hmo',
	command: { id: OPTIMISE_COMMAND_ID, precondition: ContextKeyExpr.false(), title: localize('hmo.mr', 'Multistart and Restart Methods') },
	order: 1,
});

MenuRegistry.appendMenuItem(HMOSubmenuId, {
	group: '1_hmo',
	command: { id: OPTIMISE_COMMAND_ID, precondition: ContextKeyExpr.false(), title: localize('hmo.mhe', 'Memetic and Hybrid Evolutionary Methods') },
	order: 2,
});

MenuRegistry.appendMenuItem(HMOSubmenuId, {
	group: '1_hmo',
	command: { id: OPTIMISE_COMMAND_ID, precondition: ContextKeyExpr.false(), title: localize('hmo.lgh', 'Local-Global Hybridization') },
	order: 3,
});


// =====================================================
// SUBMENU: MARKOV DECISION PROCESSES
// =====================================================

MenuRegistry.appendMenuItem(SDMSubmenuId, {
	group: '1_sdm',
	command: { id: MDP_ID, title: localize('sdm.mdp', 'Single-Agent Decision Processes') },
	order: 1,
}); // POMDPs.jl — MDP | POMDP | Semi-MDP

MenuRegistry.appendMenuItem(SDMSubmenuId, {
	group: '1_sdm',
	command: { id: MADP_ID, title: localize('sdm.madp', 'Multi-Agent Decision Processes') },
	order: 2,
}); // POMDPs.jl, GameTheory.jl — Dec-POMDP | Stochastic Games


// ================================================
// SUBMENU: REINFORCEMENT LEARNING
// ================================================

MenuRegistry.appendMenuItem(RLSubmenuId, {
	group: '1_value',
	command: { id: 'chiara.statistics.rl.bndt', title: localize('rl.bndt', 'Bandit Problems') },
	order: 1,
});

MenuRegistry.appendMenuItem(RLSubmenuId, {
	group: '1_value',
	command: { id: 'chiara.statistics.rl.ql', title: localize('rl.ql', 'Q-Learning') },
	order: 2,
});

MenuRegistry.appendMenuItem(RLSubmenuId, {
	group: '2_policy',
	command: { id: 'chiara.statistics.rl.pgm', title: localize('rl.pgm', 'Policy Gradient Methods') },
	order: 1,
});

MenuRegistry.appendMenuItem(RLSubmenuId, {
	group: '2_policy',
	command: { id: 'chiara.statistics.rl.acm', title: localize('rl.acm', 'Actor-Critic Methods') },
	order: 2,
});

MenuRegistry.appendMenuItem(RLSubmenuId, {
	group: '3_multi',
	command: { id: 'chiara.statistics.rl.marl', title: localize('rl.marl', 'Multi-Agent Reinforcement Learning') },
	order: 1,
});

MenuRegistry.appendMenuItem(RLSubmenuId, {
	group: '4_search',
	command: { id: 'chiara.statistics.rl.azero', title: localize('rl.azero', 'AlphaZero') },
	order: 1,
});

// ============================================
// SUBMENU: LINEAR PROGRAMMING
// ============================================

MenuRegistry.appendMenuItem(LPSubmenuId, {
	group: '1_lp',
	command: { id: 'chiara.mp.lp', title: localize('lp.lp', 'Linear Programming') },
	order: 1,
});

MenuRegistry.appendMenuItem(LPSubmenuId, {
	group: '1_lp',
	command: { id: 'chiara.mp.milp', title: localize('lp.milp', 'Mixed-Integer Linear Programming') },
	order: 2,
});

// ============================================
// SUBMENU: QUADRATIC PROGRAMMING
// ============================================

MenuRegistry.appendMenuItem(QPSubmenuId, {
	group: '1_qp',
	command: { id: OPTIMISE_COMMAND_ID, precondition: ContextKeyExpr.false(), title: localize('qp.qp', 'Quadratic Programming') },
	order: 1,
});

MenuRegistry.appendMenuItem(QPSubmenuId, {
	group: '1_qp',
	command: { id: OPTIMISE_COMMAND_ID, precondition: ContextKeyExpr.false(), title: localize('qp.qcqp', 'Quadratically Constrained QP') },
	order: 2,
});

MenuRegistry.appendMenuItem(QPSubmenuId, {
	group: '1_qp',
	command: { id: OPTIMISE_COMMAND_ID, precondition: ContextKeyExpr.false(), title: localize('qp.miqp', 'Mixed-Integer QP') },
	order: 3,
});

// ============================================
// SUBMENU: CONIC & CONVEX PROGRAMMING
// ============================================

MenuRegistry.appendMenuItem(CCPSubmenuId, {
	group: '1_ccp',
	command: { id: 'chiara.mp.cone', title: localize('ccp.cone', 'Convex and Conic Programming') },
	order: 1,
});

MenuRegistry.appendMenuItem(CCPSubmenuId, {
	group: '1_ccp',
	command: { id: 'chiara.mp.sdp', title: localize('ccp.sdp', 'Semidefinite Programming') },
	order: 2,
});

MenuRegistry.appendMenuItem(CCPSubmenuId, {
	group: '1_ccp',
	command: { id: OPTIMISE_COMMAND_ID, precondition: ContextKeyExpr.false(), title: localize('ccp.mic', 'Mixed-Integer Conic Programming') },
	order: 3,
});

// ============================================
// SUBMENU: COMPLEMENTARITY & VARIATIONAL PROBLEMS
// ============================================

MenuRegistry.appendMenuItem(CVPSubmenuId, {
	group: '1_cvp',
	command: { id: CMP_ID, title: localize('cvp.cmp', 'Complementarity Problems') },
	order: 1,
});

MenuRegistry.appendMenuItem(CVPSubmenuId, {
	group: '1_cvp',
	command: { id: VARI_ID, title: localize('cvp.vari', 'Variational Inequalities') },
	order: 2,
});

MenuRegistry.appendMenuItem(CVPSubmenuId, {
	group: '1_cvp',
	command: { id: MPEC_ID, title: localize('cvp.mpec', 'Equilibrium Constraints') },
	order: 3,
});

// ============================================
// SUBMENU: GAME THEORY & HIERARCHICAL OPTIMISATION
// ============================================


// ============================================
// SUBMENU: DIY ESTIMATION METHODS
// ============================================

MenuRegistry.appendMenuItem(DIYSubmenuId, {
	group: '8_optimisation',
	command: {
		id: 'chiara.diy.mle', precondition: ContextKeyExpr.false(),
		title: localize('showOptimisation.mle', 'Maximum-Likelihood Estimation'),
	},
	order: 1,
}); // Optim.jl

MenuRegistry.appendMenuItem(DIYSubmenuId, {
	group: '8_optimisation',
	command: {
		id: 'chiara.diy.cmle', precondition: ContextKeyExpr.false(),
		title: localize('showOptimisation.cml', 'Conditional Maximum-Likelihood'),
	},
	order: 2,
}); // Optim.jl, RaschModels.jl

MenuRegistry.appendMenuItem(DIYSubmenuId, {
	group: '8_optimisation',
	command: {
		id: 'chiara.diy.em', precondition: ContextKeyExpr.false(),
		title: localize('showOptimisation.em', 'Expectation Maximization (EM) Algorithm'),
	},
	order: 3,
});

MenuRegistry.appendMenuItem(DIYSubmenuId, {
	group: '8_optimisation',
	command: {
		id: 'chiara.diy.gmm', precondition: ContextKeyExpr.false(),
		title: localize('showOptimisation.gmm', 'Generalized Method of Moments'),
	},
	order: 4,
});

MenuRegistry.appendMenuItem(DIYSubmenuId, {
	group: '8_optimisation',
	command: {
		id: 'chiara.diy.smm', precondition: ContextKeyExpr.false(),
		title: localize('showOptimisation.smm', 'Simulated Method of Moments'),
	},
	order: 5,
});

// ============================================
// SUBMENU: OPTIMAL CONTROL
// ============================================

// Group 1 — Analytic / Classical
MenuRegistry.appendMenuItem(OCSubmenuId, {
	group: '1_classical',
	command: {
		id: LQR_ID,
		title: localize('showOptimisation.lqr', 'Linear Optimal Control'),
	},
	order: 1,
}); // LQR, LQG; ControlSystems.jl

MenuRegistry.appendMenuItem(OCSubmenuId, {
	group: '1_classical',
	command: {
		id: TRAJ_ID,
		title: localize('showOptimisation.traj', 'Trajectory Optimisation'),
	},
	order: 2,
}); // Direct, Indirect, DDP, ALTRO; TrajectoryOptimization.jl

MenuRegistry.appendMenuItem(OCSubmenuId, {
	group: '1_classical',
	command: {
		id: MPC_ID,
		title: localize('showOptimisation.mpc', 'Model Predictive Control'),
	},
	order: 3,
}); // LinMPC, NonLinMPC; ModelPredictiveControl.jl

