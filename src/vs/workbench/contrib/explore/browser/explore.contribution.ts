/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Antonio Saragga Seabra. All rights reserved.
 *  Proprietary and confidential. Unauthorised copying or distribution is prohibited.
 *--------------------------------------------------------------------------------------------*/

// import { METHODS } from 'http';
import { localize } from '../../../../../vs/nls.js';
import { MenuRegistry, MenuId } from '../../../../platform/actions/common/actions.js';
import { CommandsRegistry } from '../../../../platform/commands/common/commands.js';
import { ContextKeyExpr } from '../../../../platform/contextkey/common/contextkey.js';
import {
	EVSubmenuId,
	ECO_PO_ID, ECO_BFMB_ID, ECO_BLSDF_ID,
	ECO_HFCME_ID, ECO_MMN_ID, ECO_OA_ID, ECO_IVS_ID,
	ARMA_ARIMA_WEBVIEW_ID, ARMA_VAR_WEBVIEW_ID,
	// ATSF_COMMAND_ID,
} from '../../model/browser/model.contribution.js';
import { ServicesAccessor } from '../../../../platform/instantiation/common/instantiation.js';
import { IWebviewWorkbenchService } from '../../webviewPanel/browser/webviewWorkbenchService.js';
import { IOpenerService } from '../../../../platform/opener/common/opener.js';
import { IEditorService } from '../../../services/editor/common/editorService.js';
import { IQuickInputService } from '../../../../platform/quickinput/common/quickInput.js';
import { ICommandService } from '../../../../platform/commands/common/commands.js';
import { IClipboardService } from '../../../../platform/clipboard/common/clipboardService.js';
import { INotificationService } from '../../../../platform/notification/common/notification.js';
import { INotebookEditorModelResolverService } from '../../notebook/common/notebookEditorModelResolverService.js';
import { INotebookKernelService } from '../../notebook/common/notebookKernelService.js';
import { ILanguageService } from '../../../../editor/common/languages/language.js';
import { IThemeService } from '../../../../platform/theme/common/themeService.js';
import { openRdynWebview } from '../../model/browser/commands/rdyn.command.js';
import { openRctlWebview } from '../../model/browser/commands/rctl.command.js';
import { openMcatWebview } from '../../model/browser/commands/mcat.command.js';
import { openRzooWebview } from '../../model/browser/commands/rzoo.command.js';
import { openDstatsWebview } from '../../model/browser/commands/dstats.command.js';
import { openNodWebview } from '../../model/browser/commands/nod.command.js';
import { openAndeWebview } from '../../model/browser/commands/ande.command.js';
import { openNovdWebview } from '../../model/browser/commands/novd.command.js';
import { openCvizWebview } from '../../model/browser/commands/cviz.command.js';
import { openDcmpWebview } from '../../model/browser/commands/dcmp.command.js';
import { openMvizWebview } from '../../model/browser/commands/mviz.command.js';
import { openTsvizWebview } from '../../model/browser/commands/tsviz.command.js';
import { openCpvizWebview } from '../../model/browser/commands/cpviz.command.js';
import { openGsvizWebview } from '../../model/browser/commands/gsviz.command.js';
import { openSfvizWebview } from '../../model/browser/commands/sfviz.command.js';
import { openHmdWebview } from '../../model/browser/commands/hmd.command.js';
import { openIdatWebview } from '../../model/browser/commands/idat.command.js';
import { openHfmWebview } from '../../model/browser/commands/hfm.command.js';

const EXPL_COMMAND_ID = 'workbench.action.showExplore';
const RDYN_ID = 'chiara.explore.rt.1_rdyn';
const RCTL_ID = 'chiara.explore.rt.2_rctl';
const MCAT_ID = 'chiara.explore.rt.3_mcat';
const RZOO_ID = 'chiara.explore.rt.4_rzoo';
const DSTATS_ID = 'chiara.explore.dstats';
const NOD_ID = 'chiara.explore.nod';
const ANDE_ID = 'chiara.explore.ande';
const NOVD_ID = 'chiara.explore.novd';
const HMD_ID = 'chiara.explore.hmd';
const IDAT_ID = 'chiara.explore.idat';
const HFM_ID = 'chiara.explore.hfm';
const CVIZ_SCATTER_ID   = 'chiara.explore.dvcs.scatter';
const CVIZ_BAR_ID       = 'chiara.explore.dvcs.bar';
const CVIZ_HISTOGRAM_ID = 'chiara.explore.dvcs.histogram';
const CVIZ_BOX_ID       = 'chiara.explore.dvcs.box';
const CVIZ_VIOLIN_ID    = 'chiara.explore.dvcs.violin';
const CVIZ_PIE_ID       = 'chiara.explore.dvcs.pie';
const CVIZ_LINE_ID      = 'chiara.explore.dvcs.line';
const DCMP_ECDF_ID        = 'chiara.explore.dvdist.ecdf';
const DCMP_QQ_ID          = 'chiara.explore.dvdist.qq';
const DCMP_MARGINAL_ID    = 'chiara.explore.dvdist.marginal';
const DCMP_CORRELOGRAM_ID = 'chiara.explore.dvdist.correlogram';
const MVIZ_CORNER_ID      = 'chiara.explore.dvmulti.corner';
const MVIZ_PARALLEL_ID    = 'chiara.explore.dvmulti.parallel';
const MVIZ_BUBBLE_ID      = 'chiara.explore.dvmulti.bubble';
const MVIZ_HEATMAP_ID     = 'chiara.explore.dvmulti.heatmap';
const TSVIZ_TSPLOT_ID     = 'chiara.explore.dvts.tsplot';
const TSVIZ_RIBBON_ID     = 'chiara.explore.dvts.ribbon';
const TSVIZ_STACKED_ID    = 'chiara.explore.dvts.stacked';
const TSVIZ_OHLC_ID       = 'chiara.explore.dvts.ohlc';
const CPVIZ_MOSAIC_ID      = 'chiara.explore.dvcp.mosaic';
const CPVIZ_NIGHTINGALE_ID = 'chiara.explore.dvcp.nightingale';
const CPVIZ_WATERFALL_ID   = 'chiara.explore.dvcp.waterfall';
const CPVIZ_TREEMAP_ID     = 'chiara.explore.dvcp.treemap';
const CPVIZ_SANKEY_ID      = 'chiara.explore.dvcp.sankey';
const GSVIZ_NETWORK_ID    = 'chiara.explore.dvgs.network';
const GSVIZ_TREE_ID       = 'chiara.explore.dvgs.tree';
const GSVIZ_CHOROPLETH_ID = 'chiara.explore.dvgs.choropleth';
const GSVIZ_VORONOI_ID    = 'chiara.explore.dvgs.voronoi';
const SFVIZ_CONTOUR_ID    = 'chiara.explore.dvsf.contour';
const SFVIZ_CONTOUR3D_ID  = 'chiara.explore.dvsf.contour3d';
const SFVIZ_SURFACE_ID    = 'chiara.explore.dvsf.surface';
const SFVIZ_VOLUME_ID     = 'chiara.explore.dvsf.volume';
const SFVIZ_PHASE_ID      = 'chiara.explore.dvsf.phase';
const SFVIZ_MESH_ID       = 'chiara.explore.dvsf.mesh';
const SFVIZ_VOXELS_ID     = 'chiara.explore.dvsf.voxels';

CommandsRegistry.registerCommand(EXPL_COMMAND_ID, () => {
	console.log('Explore command executed!');
	alert?.('Explore command executed!');
});

CommandsRegistry.registerCommand(DSTATS_ID, (accessor: ServicesAccessor) => {
	openDstatsWebview(
		accessor.get(IWebviewWorkbenchService),
		accessor.get(IOpenerService),
		accessor.get(IEditorService),
		accessor.get(IQuickInputService),
		accessor.get(ICommandService),
		accessor.get(IClipboardService),
		accessor.get(INotificationService),
	);
});

CommandsRegistry.registerCommand(NOD_ID, (accessor: ServicesAccessor) => {
	openNodWebview(
		accessor.get(IWebviewWorkbenchService),
		accessor.get(IOpenerService),
		accessor.get(IEditorService),
		accessor.get(IQuickInputService),
		accessor.get(ICommandService),
		accessor.get(IClipboardService),
		accessor.get(INotificationService),
	);
});

CommandsRegistry.registerCommand(ANDE_ID, (accessor: ServicesAccessor) => {
	openAndeWebview(
		accessor.get(IWebviewWorkbenchService),
		accessor.get(IOpenerService),
		accessor.get(IEditorService),
		accessor.get(IQuickInputService),
		accessor.get(ICommandService),
		accessor.get(IClipboardService),
		accessor.get(INotificationService),
	);
});

CommandsRegistry.registerCommand(IDAT_ID, (accessor: ServicesAccessor) => {
	openIdatWebview(
		accessor.get(IWebviewWorkbenchService),
		accessor.get(IOpenerService),
		accessor.get(IEditorService),
		accessor.get(IQuickInputService),
		accessor.get(ICommandService),
		accessor.get(IClipboardService),
		accessor.get(INotificationService),
	);
});

CommandsRegistry.registerCommand(HFM_ID, (accessor: ServicesAccessor) => {
	openHfmWebview(
		accessor.get(IWebviewWorkbenchService),
		accessor.get(IOpenerService),
		accessor.get(IEditorService),
		accessor.get(IQuickInputService),
		accessor.get(ICommandService),
		accessor.get(IClipboardService),
		accessor.get(INotificationService),
		accessor.get(INotebookEditorModelResolverService),
		accessor.get(INotebookKernelService),
		accessor.get(ILanguageService),
		accessor.get(IThemeService),
	);
});

CommandsRegistry.registerCommand(HMD_ID, (accessor: ServicesAccessor) => {
	openHmdWebview(
		accessor.get(IWebviewWorkbenchService),
		accessor.get(IOpenerService),
		accessor.get(IEditorService),
		accessor.get(IQuickInputService),
		accessor.get(ICommandService),
		accessor.get(IClipboardService),
		accessor.get(INotificationService),
	);
});

CommandsRegistry.registerCommand(NOVD_ID, (accessor: ServicesAccessor) => {
	openNovdWebview(
		accessor.get(IWebviewWorkbenchService),
		accessor.get(IOpenerService),
		accessor.get(IEditorService),
		accessor.get(IQuickInputService),
		accessor.get(ICommandService),
		accessor.get(IClipboardService),
		accessor.get(INotificationService),
	);
});

CommandsRegistry.registerCommand(RDYN_ID, (accessor: ServicesAccessor) => {
	openRdynWebview(
		accessor.get(IWebviewWorkbenchService),
		accessor.get(IOpenerService),
		accessor.get(IEditorService),
		accessor.get(IQuickInputService),
		accessor.get(ICommandService),
		accessor.get(IClipboardService),
		accessor.get(INotificationService),
	);
});

CommandsRegistry.registerCommand(RCTL_ID, (accessor: ServicesAccessor) => {
	openRctlWebview(
		accessor.get(IWebviewWorkbenchService),
		accessor.get(IOpenerService),
		accessor.get(IEditorService),
		accessor.get(IQuickInputService),
		accessor.get(ICommandService),
		accessor.get(IClipboardService),
		accessor.get(INotificationService),
	);
});

CommandsRegistry.registerCommand(MCAT_ID, (accessor: ServicesAccessor) => {
	openMcatWebview(
		accessor.get(IWebviewWorkbenchService),
		accessor.get(IOpenerService),
		accessor.get(IEditorService),
		accessor.get(IQuickInputService),
		accessor.get(ICommandService),
		accessor.get(IClipboardService),
		accessor.get(INotificationService),
	);
});

CommandsRegistry.registerCommand(RZOO_ID, (accessor: ServicesAccessor) => {
	openRzooWebview(
		accessor.get(IWebviewWorkbenchService),
		accessor.get(IOpenerService),
		accessor.get(IEditorService),
		accessor.get(IQuickInputService),
		accessor.get(ICommandService),
		accessor.get(IClipboardService),
		accessor.get(INotificationService),
	);
});


CommandsRegistry.registerCommand(CVIZ_SCATTER_ID, (accessor: ServicesAccessor) => {
	openCvizWebview(
		accessor.get(IWebviewWorkbenchService),
		accessor.get(IOpenerService),
		accessor.get(IEditorService),
		accessor.get(IQuickInputService),
		accessor.get(ICommandService),
		accessor.get(IClipboardService),
		accessor.get(INotificationService),
		accessor.get(INotebookEditorModelResolverService),
		accessor.get(INotebookKernelService),
		accessor.get(ILanguageService),
		accessor.get(IThemeService),
		'scatter',
	);
});

CommandsRegistry.registerCommand(CVIZ_BAR_ID, (accessor: ServicesAccessor) => {
	openCvizWebview(
		accessor.get(IWebviewWorkbenchService),
		accessor.get(IOpenerService),
		accessor.get(IEditorService),
		accessor.get(IQuickInputService),
		accessor.get(ICommandService),
		accessor.get(IClipboardService),
		accessor.get(INotificationService),
		accessor.get(INotebookEditorModelResolverService),
		accessor.get(INotebookKernelService),
		accessor.get(ILanguageService),
		accessor.get(IThemeService),
		'bar',
	);
});

CommandsRegistry.registerCommand(CVIZ_HISTOGRAM_ID, (accessor: ServicesAccessor) => {
	openCvizWebview(
		accessor.get(IWebviewWorkbenchService),
		accessor.get(IOpenerService),
		accessor.get(IEditorService),
		accessor.get(IQuickInputService),
		accessor.get(ICommandService),
		accessor.get(IClipboardService),
		accessor.get(INotificationService),
		accessor.get(INotebookEditorModelResolverService),
		accessor.get(INotebookKernelService),
		accessor.get(ILanguageService),
		accessor.get(IThemeService),
		'histogram',
	);
});

CommandsRegistry.registerCommand(CVIZ_BOX_ID, (accessor: ServicesAccessor) => {
	openCvizWebview(
		accessor.get(IWebviewWorkbenchService),
		accessor.get(IOpenerService),
		accessor.get(IEditorService),
		accessor.get(IQuickInputService),
		accessor.get(ICommandService),
		accessor.get(IClipboardService),
		accessor.get(INotificationService),
		accessor.get(INotebookEditorModelResolverService),
		accessor.get(INotebookKernelService),
		accessor.get(ILanguageService),
		accessor.get(IThemeService),
		'box',
	);
});

CommandsRegistry.registerCommand(CVIZ_VIOLIN_ID, (accessor: ServicesAccessor) => {
	openCvizWebview(
		accessor.get(IWebviewWorkbenchService),
		accessor.get(IOpenerService),
		accessor.get(IEditorService),
		accessor.get(IQuickInputService),
		accessor.get(ICommandService),
		accessor.get(IClipboardService),
		accessor.get(INotificationService),
		accessor.get(INotebookEditorModelResolverService),
		accessor.get(INotebookKernelService),
		accessor.get(ILanguageService),
		accessor.get(IThemeService),
		'violin',
	);
});

CommandsRegistry.registerCommand(CVIZ_PIE_ID, (accessor: ServicesAccessor) => {
	openCvizWebview(
		accessor.get(IWebviewWorkbenchService),
		accessor.get(IOpenerService),
		accessor.get(IEditorService),
		accessor.get(IQuickInputService),
		accessor.get(ICommandService),
		accessor.get(IClipboardService),
		accessor.get(INotificationService),
		accessor.get(INotebookEditorModelResolverService),
		accessor.get(INotebookKernelService),
		accessor.get(ILanguageService),
		accessor.get(IThemeService),
		'pie',
	);
});

CommandsRegistry.registerCommand(CVIZ_LINE_ID, (accessor: ServicesAccessor) => {
	openCvizWebview(
		accessor.get(IWebviewWorkbenchService),
		accessor.get(IOpenerService),
		accessor.get(IEditorService),
		accessor.get(IQuickInputService),
		accessor.get(ICommandService),
		accessor.get(IClipboardService),
		accessor.get(INotificationService),
		accessor.get(INotebookEditorModelResolverService),
		accessor.get(INotebookKernelService),
		accessor.get(ILanguageService),
		accessor.get(IThemeService),
		'line',
	);
});

CommandsRegistry.registerCommand(DCMP_ECDF_ID, (accessor: ServicesAccessor) => {
	openDcmpWebview(
		accessor.get(IWebviewWorkbenchService),
		accessor.get(IOpenerService),
		accessor.get(IEditorService),
		accessor.get(IQuickInputService),
		accessor.get(ICommandService),
		accessor.get(IClipboardService),
		accessor.get(INotificationService),
		accessor.get(INotebookEditorModelResolverService),
		accessor.get(INotebookKernelService),
		accessor.get(ILanguageService),
		accessor.get(IThemeService),
		'ecdf',
	);
});

CommandsRegistry.registerCommand(DCMP_QQ_ID, (accessor: ServicesAccessor) => {
	openDcmpWebview(
		accessor.get(IWebviewWorkbenchService),
		accessor.get(IOpenerService),
		accessor.get(IEditorService),
		accessor.get(IQuickInputService),
		accessor.get(ICommandService),
		accessor.get(IClipboardService),
		accessor.get(INotificationService),
		accessor.get(INotebookEditorModelResolverService),
		accessor.get(INotebookKernelService),
		accessor.get(ILanguageService),
		accessor.get(IThemeService),
		'qq',
	);
});

CommandsRegistry.registerCommand(DCMP_MARGINAL_ID, (accessor: ServicesAccessor) => {
	openDcmpWebview(
		accessor.get(IWebviewWorkbenchService),
		accessor.get(IOpenerService),
		accessor.get(IEditorService),
		accessor.get(IQuickInputService),
		accessor.get(ICommandService),
		accessor.get(IClipboardService),
		accessor.get(INotificationService),
		accessor.get(INotebookEditorModelResolverService),
		accessor.get(INotebookKernelService),
		accessor.get(ILanguageService),
		accessor.get(IThemeService),
		'marginal',
	);
});

CommandsRegistry.registerCommand(DCMP_CORRELOGRAM_ID, (accessor: ServicesAccessor) => {
	openDcmpWebview(
		accessor.get(IWebviewWorkbenchService),
		accessor.get(IOpenerService),
		accessor.get(IEditorService),
		accessor.get(IQuickInputService),
		accessor.get(ICommandService),
		accessor.get(IClipboardService),
		accessor.get(INotificationService),
		accessor.get(INotebookEditorModelResolverService),
		accessor.get(INotebookKernelService),
		accessor.get(ILanguageService),
		accessor.get(IThemeService),
		'correlogram',
	);
});

CommandsRegistry.registerCommand(MVIZ_CORNER_ID, (accessor: ServicesAccessor) => {
	openMvizWebview(
		accessor.get(IWebviewWorkbenchService),
		accessor.get(IOpenerService),
		accessor.get(IEditorService),
		accessor.get(IQuickInputService),
		accessor.get(ICommandService),
		accessor.get(IClipboardService),
		accessor.get(INotificationService),
		accessor.get(INotebookEditorModelResolverService),
		accessor.get(INotebookKernelService),
		accessor.get(ILanguageService),
		accessor.get(IThemeService),
		'corner',
	);
});

CommandsRegistry.registerCommand(MVIZ_PARALLEL_ID, (accessor: ServicesAccessor) => {
	openMvizWebview(
		accessor.get(IWebviewWorkbenchService),
		accessor.get(IOpenerService),
		accessor.get(IEditorService),
		accessor.get(IQuickInputService),
		accessor.get(ICommandService),
		accessor.get(IClipboardService),
		accessor.get(INotificationService),
		accessor.get(INotebookEditorModelResolverService),
		accessor.get(INotebookKernelService),
		accessor.get(ILanguageService),
		accessor.get(IThemeService),
		'parallel',
	);
});

CommandsRegistry.registerCommand(MVIZ_BUBBLE_ID, (accessor: ServicesAccessor) => {
	openMvizWebview(
		accessor.get(IWebviewWorkbenchService),
		accessor.get(IOpenerService),
		accessor.get(IEditorService),
		accessor.get(IQuickInputService),
		accessor.get(ICommandService),
		accessor.get(IClipboardService),
		accessor.get(INotificationService),
		accessor.get(INotebookEditorModelResolverService),
		accessor.get(INotebookKernelService),
		accessor.get(ILanguageService),
		accessor.get(IThemeService),
		'bubble',
	);
});

CommandsRegistry.registerCommand(MVIZ_HEATMAP_ID, (accessor: ServicesAccessor) => {
	openMvizWebview(
		accessor.get(IWebviewWorkbenchService),
		accessor.get(IOpenerService),
		accessor.get(IEditorService),
		accessor.get(IQuickInputService),
		accessor.get(ICommandService),
		accessor.get(IClipboardService),
		accessor.get(INotificationService),
		accessor.get(INotebookEditorModelResolverService),
		accessor.get(INotebookKernelService),
		accessor.get(ILanguageService),
		accessor.get(IThemeService),
		'heatmap',
	);
});

CommandsRegistry.registerCommand(CPVIZ_MOSAIC_ID, (accessor: ServicesAccessor) => {
	openCpvizWebview(
		accessor.get(IWebviewWorkbenchService),
		accessor.get(IOpenerService),
		accessor.get(IEditorService),
		accessor.get(IQuickInputService),
		accessor.get(ICommandService),
		accessor.get(IClipboardService),
		accessor.get(INotificationService),
		accessor.get(INotebookEditorModelResolverService),
		accessor.get(INotebookKernelService),
		accessor.get(ILanguageService),
		accessor.get(IThemeService),
		'mosaic',
	);
});

CommandsRegistry.registerCommand(CPVIZ_NIGHTINGALE_ID, (accessor: ServicesAccessor) => {
	openCpvizWebview(
		accessor.get(IWebviewWorkbenchService),
		accessor.get(IOpenerService),
		accessor.get(IEditorService),
		accessor.get(IQuickInputService),
		accessor.get(ICommandService),
		accessor.get(IClipboardService),
		accessor.get(INotificationService),
		accessor.get(INotebookEditorModelResolverService),
		accessor.get(INotebookKernelService),
		accessor.get(ILanguageService),
		accessor.get(IThemeService),
		'nightingale',
	);
});

CommandsRegistry.registerCommand(CPVIZ_WATERFALL_ID, (accessor: ServicesAccessor) => {
	openCpvizWebview(
		accessor.get(IWebviewWorkbenchService),
		accessor.get(IOpenerService),
		accessor.get(IEditorService),
		accessor.get(IQuickInputService),
		accessor.get(ICommandService),
		accessor.get(IClipboardService),
		accessor.get(INotificationService),
		accessor.get(INotebookEditorModelResolverService),
		accessor.get(INotebookKernelService),
		accessor.get(ILanguageService),
		accessor.get(IThemeService),
		'waterfall',
	);
});

CommandsRegistry.registerCommand(CPVIZ_TREEMAP_ID, (accessor: ServicesAccessor) => {
	openCpvizWebview(
		accessor.get(IWebviewWorkbenchService),
		accessor.get(IOpenerService),
		accessor.get(IEditorService),
		accessor.get(IQuickInputService),
		accessor.get(ICommandService),
		accessor.get(IClipboardService),
		accessor.get(INotificationService),
		accessor.get(INotebookEditorModelResolverService),
		accessor.get(INotebookKernelService),
		accessor.get(ILanguageService),
		accessor.get(IThemeService),
		'treemap',
	);
});

CommandsRegistry.registerCommand(CPVIZ_SANKEY_ID, (accessor: ServicesAccessor) => {
	openCpvizWebview(
		accessor.get(IWebviewWorkbenchService),
		accessor.get(IOpenerService),
		accessor.get(IEditorService),
		accessor.get(IQuickInputService),
		accessor.get(ICommandService),
		accessor.get(IClipboardService),
		accessor.get(INotificationService),
		accessor.get(INotebookEditorModelResolverService),
		accessor.get(INotebookKernelService),
		accessor.get(ILanguageService),
		accessor.get(IThemeService),
		'sankey',
	);
});

CommandsRegistry.registerCommand(GSVIZ_NETWORK_ID, (accessor: ServicesAccessor) => {
	openGsvizWebview(
		accessor.get(IWebviewWorkbenchService),
		accessor.get(IOpenerService),
		accessor.get(IEditorService),
		accessor.get(IQuickInputService),
		accessor.get(ICommandService),
		accessor.get(IClipboardService),
		accessor.get(INotificationService),
		accessor.get(INotebookEditorModelResolverService),
		accessor.get(INotebookKernelService),
		accessor.get(ILanguageService),
		accessor.get(IThemeService),
		'network',
	);
});

CommandsRegistry.registerCommand(GSVIZ_TREE_ID, (accessor: ServicesAccessor) => {
	openGsvizWebview(
		accessor.get(IWebviewWorkbenchService),
		accessor.get(IOpenerService),
		accessor.get(IEditorService),
		accessor.get(IQuickInputService),
		accessor.get(ICommandService),
		accessor.get(IClipboardService),
		accessor.get(INotificationService),
		accessor.get(INotebookEditorModelResolverService),
		accessor.get(INotebookKernelService),
		accessor.get(ILanguageService),
		accessor.get(IThemeService),
		'tree',
	);
});

CommandsRegistry.registerCommand(GSVIZ_CHOROPLETH_ID, (accessor: ServicesAccessor) => {
	openGsvizWebview(
		accessor.get(IWebviewWorkbenchService),
		accessor.get(IOpenerService),
		accessor.get(IEditorService),
		accessor.get(IQuickInputService),
		accessor.get(ICommandService),
		accessor.get(IClipboardService),
		accessor.get(INotificationService),
		accessor.get(INotebookEditorModelResolverService),
		accessor.get(INotebookKernelService),
		accessor.get(ILanguageService),
		accessor.get(IThemeService),
		'choropleth',
	);
});

CommandsRegistry.registerCommand(GSVIZ_VORONOI_ID, (accessor: ServicesAccessor) => {
	openGsvizWebview(
		accessor.get(IWebviewWorkbenchService),
		accessor.get(IOpenerService),
		accessor.get(IEditorService),
		accessor.get(IQuickInputService),
		accessor.get(ICommandService),
		accessor.get(IClipboardService),
		accessor.get(INotificationService),
		accessor.get(INotebookEditorModelResolverService),
		accessor.get(INotebookKernelService),
		accessor.get(ILanguageService),
		accessor.get(IThemeService),
		'voronoi',
	);
});

CommandsRegistry.registerCommand(SFVIZ_CONTOUR_ID, (accessor: ServicesAccessor) => {
	openSfvizWebview(
		accessor.get(IWebviewWorkbenchService),
		accessor.get(IOpenerService),
		accessor.get(IEditorService),
		accessor.get(IQuickInputService),
		accessor.get(ICommandService),
		accessor.get(IClipboardService),
		accessor.get(INotificationService),
		accessor.get(INotebookEditorModelResolverService),
		accessor.get(INotebookKernelService),
		accessor.get(ILanguageService),
		accessor.get(IThemeService),
		'contour',
	);
});

CommandsRegistry.registerCommand(SFVIZ_CONTOUR3D_ID, (accessor: ServicesAccessor) => {
	openSfvizWebview(
		accessor.get(IWebviewWorkbenchService),
		accessor.get(IOpenerService),
		accessor.get(IEditorService),
		accessor.get(IQuickInputService),
		accessor.get(ICommandService),
		accessor.get(IClipboardService),
		accessor.get(INotificationService),
		accessor.get(INotebookEditorModelResolverService),
		accessor.get(INotebookKernelService),
		accessor.get(ILanguageService),
		accessor.get(IThemeService),
		'contour3d',
	);
});

CommandsRegistry.registerCommand(SFVIZ_SURFACE_ID, (accessor: ServicesAccessor) => {
	openSfvizWebview(
		accessor.get(IWebviewWorkbenchService),
		accessor.get(IOpenerService),
		accessor.get(IEditorService),
		accessor.get(IQuickInputService),
		accessor.get(ICommandService),
		accessor.get(IClipboardService),
		accessor.get(INotificationService),
		accessor.get(INotebookEditorModelResolverService),
		accessor.get(INotebookKernelService),
		accessor.get(ILanguageService),
		accessor.get(IThemeService),
		'surface',
	);
});

CommandsRegistry.registerCommand(SFVIZ_VOLUME_ID, (accessor: ServicesAccessor) => {
	openSfvizWebview(
		accessor.get(IWebviewWorkbenchService),
		accessor.get(IOpenerService),
		accessor.get(IEditorService),
		accessor.get(IQuickInputService),
		accessor.get(ICommandService),
		accessor.get(IClipboardService),
		accessor.get(INotificationService),
		accessor.get(INotebookEditorModelResolverService),
		accessor.get(INotebookKernelService),
		accessor.get(ILanguageService),
		accessor.get(IThemeService),
		'volume',
	);
});

CommandsRegistry.registerCommand(SFVIZ_PHASE_ID, (accessor: ServicesAccessor) => {
	openSfvizWebview(
		accessor.get(IWebviewWorkbenchService),
		accessor.get(IOpenerService),
		accessor.get(IEditorService),
		accessor.get(IQuickInputService),
		accessor.get(ICommandService),
		accessor.get(IClipboardService),
		accessor.get(INotificationService),
		accessor.get(INotebookEditorModelResolverService),
		accessor.get(INotebookKernelService),
		accessor.get(ILanguageService),
		accessor.get(IThemeService),
		'phase',
	);
});

CommandsRegistry.registerCommand(SFVIZ_MESH_ID, (accessor: ServicesAccessor) => {
	openSfvizWebview(
		accessor.get(IWebviewWorkbenchService),
		accessor.get(IOpenerService),
		accessor.get(IEditorService),
		accessor.get(IQuickInputService),
		accessor.get(ICommandService),
		accessor.get(IClipboardService),
		accessor.get(INotificationService),
		accessor.get(INotebookEditorModelResolverService),
		accessor.get(INotebookKernelService),
		accessor.get(ILanguageService),
		accessor.get(IThemeService),
		'mesh',
	);
});

CommandsRegistry.registerCommand(SFVIZ_VOXELS_ID, (accessor: ServicesAccessor) => {
	openSfvizWebview(
		accessor.get(IWebviewWorkbenchService),
		accessor.get(IOpenerService),
		accessor.get(IEditorService),
		accessor.get(IQuickInputService),
		accessor.get(ICommandService),
		accessor.get(IClipboardService),
		accessor.get(INotificationService),
		accessor.get(INotebookEditorModelResolverService),
		accessor.get(INotebookKernelService),
		accessor.get(ILanguageService),
		accessor.get(IThemeService),
		'voxels',
	);
});

CommandsRegistry.registerCommand(TSVIZ_TSPLOT_ID, (accessor: ServicesAccessor) => {
	openTsvizWebview(
		accessor.get(IWebviewWorkbenchService),
		accessor.get(IOpenerService),
		accessor.get(IEditorService),
		accessor.get(IQuickInputService),
		accessor.get(ICommandService),
		accessor.get(IClipboardService),
		accessor.get(INotificationService),
		accessor.get(INotebookEditorModelResolverService),
		accessor.get(INotebookKernelService),
		accessor.get(ILanguageService),
		accessor.get(IThemeService),
		'tsplot',
	);
});


CommandsRegistry.registerCommand(TSVIZ_RIBBON_ID, (accessor: ServicesAccessor) => {
	openTsvizWebview(
		accessor.get(IWebviewWorkbenchService),
		accessor.get(IOpenerService),
		accessor.get(IEditorService),
		accessor.get(IQuickInputService),
		accessor.get(ICommandService),
		accessor.get(IClipboardService),
		accessor.get(INotificationService),
		accessor.get(INotebookEditorModelResolverService),
		accessor.get(INotebookKernelService),
		accessor.get(ILanguageService),
		accessor.get(IThemeService),
		'ribbon',
	);
});

CommandsRegistry.registerCommand(TSVIZ_STACKED_ID, (accessor: ServicesAccessor) => {
	openTsvizWebview(
		accessor.get(IWebviewWorkbenchService),
		accessor.get(IOpenerService),
		accessor.get(IEditorService),
		accessor.get(IQuickInputService),
		accessor.get(ICommandService),
		accessor.get(IClipboardService),
		accessor.get(INotificationService),
		accessor.get(INotebookEditorModelResolverService),
		accessor.get(INotebookKernelService),
		accessor.get(ILanguageService),
		accessor.get(IThemeService),
		'stacked',
	);
});

CommandsRegistry.registerCommand(TSVIZ_OHLC_ID, (accessor: ServicesAccessor) => {
	openTsvizWebview(
		accessor.get(IWebviewWorkbenchService),
		accessor.get(IOpenerService),
		accessor.get(IEditorService),
		accessor.get(IQuickInputService),
		accessor.get(ICommandService),
		accessor.get(IClipboardService),
		accessor.get(INotificationService),
		accessor.get(INotebookEditorModelResolverService),
		accessor.get(INotebookKernelService),
		accessor.get(ILanguageService),
		accessor.get(IThemeService),
		'ohlc',
	);
});

// Define a new submenu ID for "Dataset Repositories"
const ADRSubmenuId = new MenuId('menubarADRSubmenu');

// Define a new submenu ID for "Model Repositories"
const AMRSubmenuId = new MenuId('menubarAMRSubmenu');

// Define a new submenu ID for "Connectors"
const CONNSubmenuId = new MenuId('menubarCONNSubmenu');

// Define a new submenu ID for "Data Visualization"
const DVSubmenuId = new MenuId('menubarDVSubmenu');

// Define a new submenu ID for "Anomalies and Novelties"
const ANSubmenuId = new MenuId('menubarANSubmenu');

// Define a new submenu ID for "Remote Compute"
const RCSubmenuId = new MenuId('menubarRCSubmenu');


// ----------------------------------------------------

// Define a new submenu ID for "Economics Toolbox"
const E_MTSubmenuId = new MenuId('menubarE_MTSubmenu');
const E_MTDataSourcesSubmenuId = new MenuId('menubarE_MTDataSourcesSubmenu');

// Define a new submenu ID for "Econometrics Toolbox"
const E_ETSubmenuId = new MenuId('menubarE_ETSubmenu');

// Define a new submenu ID for "Financial Toolbox"
const E_FTSubmenuId = new MenuId('menubarE_FTSubmenu');

const E_FTDataSourcesSubmenuId = new MenuId('menubarE_FTDataSourcesSubmenu');

// Define a new submenu ID for "Financial Instruments Toolbox"
const E_FITSubmenuId = new MenuId('menubarE_FITSubmenu');

// Diffusion Models
const E_FIT_DPSSubmenuId = new MenuId('menubarE_FIT_DPSSubmenu');

// Jump-Diffusion Models
const E_FIT_JDMSubmenuId = new MenuId('menubarE_FIT_JDMSubmenu');

// Pure Jump Models
const E_FIT_PJMSubmenuId = new MenuId('menubarE_FIT_PJMSubmenu');

// Interest Rate Models
const E_FIT_IRMSubmenuId = new MenuId('menubarE_FIT_IRMSubmenu');

// Yield Curve Models
const E_FIT_YCMSubmenuId = new MenuId('menubarE_FIT_YCMSubmenu');

// Credit Term Structure Models
const E_FIT_CCMSubmenuId = new MenuId('menubarE_FIT_CCMSubmenu');

// Volatility Term Structure Models
const E_FIT_VCMSubmenuId = new MenuId('menubarE_FIT_VCMSubmenu');

// Define a new submenu ID for "Financial Risk Management Toolbox"
const E_RMTSubmenuId = new MenuId('menubarE_RMSubmenu');

// ---------------------------------------------------------------

// Define a new subsubmenu ID for "Sound of Music Toolbox"
const E_SMTSubmenuId = new MenuId('menubarE_SMTSubmenu');
const MLIBSubmenuId = new MenuId('menubarMLIBSubmenu');

// Define a new subsubmenu ID for "Sound of Voice Toolbox"
const E_SVTSubmenuId = new MenuId('menubarE_SVTSubmenu');

// Define a new subsubmenu ID for "Literature Toolbox"
const E_LTSubmenuId = new MenuId('menubarE_LTSubmenu');

// Define a new subsubmenu ID for "Art Toolbox"
const E_ARTTSubmenuId = new MenuId('menubarE_ARTTSubmenu');

// Define a new submenu ID for "Law and Jurisprudence"
const E_LAWSubmenuId = new MenuId('menubarE_LAWSubmenu');

// Define a new submenu ID for "Business Advantage"
const E_BATSubmenuId = new MenuId('menubarE_BATSubmenu');

// ---------------------------------------------------------------

// Define a new subsubmenu ID for "Geoscience Toolbox"
const E_GEOSubmenuId = new MenuId('menubarE_GEOTSubmenu');

// Define a new subsubmenu ID for "History Toolbox"
const E_HSTSubmenuId = new MenuId('menubarE_HSTSubmenu');

// Define a new subsubmenu ID for "Natural History Toolbox"
const E_NHSTSubmenuId = new MenuId('menubarE_NHSTSubmenu');

// ---------------------------------------------------------------

// Define a new subsubmenu ID for "Biomedical Computing Toolbox"
const E_BCTSubmenuId = new MenuId('menubarE_BCTSubmenu');

// Define a new submenu ID for "Clinical Medicine Toolbox"
const E_CMTSubmenuId = new MenuId('menubarE_CMTSubmenu');

// Define a new sub-submenu ID for "Epidemic Models / Pubic Health"
const E_ECTSubmenuId = new MenuId('menubarE_ECTSubmenu');

// ---------------------------------------------------------------

// Define a new submenu ID for "Physics Toolbox"
const E_PHYTSubmenuId = new MenuId('menubarE_PHYTSubmenu');

// Define a new submenu ID for "Computational Engineering Toolbox"
const E_CETSubmenuId = new MenuId('menubarE_CETSubmenu');

// Define a new submenu ID for "Signal Processing Toolbox"
const E_DSPSubmenuId = new MenuId('menubarE_DSPSubmenu');

// Define a new submenu ID for "Materials Science and Computational Chemistry"
const E_MSCCSubmenuId = new MenuId('menubarE_MSCCSubmenu');

// Define a new subsubmenu ID for "Robotics Toolbox"
const E_RTSubmenuId = new MenuId('menubarE_RTSubmenu');


// ===================================================
// TOP-LEVEL EXPLORE MENU STRUCTURE
// ===================================================

MenuRegistry.appendMenuItem(MenuId.MenubarExploreMenu, {
	group: '1_explore',
	submenu: ADRSubmenuId,
	title: localize('showExplore.adr', 'Access Dataset Repositories'),
	order: 2,
});

MenuRegistry.appendMenuItem(MenuId.MenubarExploreMenu, {
	group: '1_explore',
	submenu: AMRSubmenuId,
	title: localize('showExplore.amr', 'Access Model Repositories'),
	order: 3,
});

MenuRegistry.appendMenuItem(MenuId.MenubarExploreMenu, {
	group: '1_explore',
	submenu: CONNSubmenuId,
	title: localize('showExplore.amr', 'Connect'),
	order: 4,
});

MenuRegistry.appendMenuItem(MenuId.MenubarExploreMenu, {
	group: '1_explore',
	submenu: RCSubmenuId,
	title: localize('showExplore.rc', 'Cloud Computing Platforms'),
	order: 5,
});


MenuRegistry.appendMenuItem(MenuId.MenubarExploreMenu, {
	group: '2_explore',
	submenu: DVSubmenuId,
	title: localize('showExplore.dv', 'Visualise'),
	order: 1,
});

MenuRegistry.appendMenuItem(MenuId.MenubarExploreMenu, {
	group: '2_explore',
	command: { id: DSTATS_ID, title: localize('eda.ds', 'Descriptive Statistics') },
	order: 2,
}); // StatsBase.jl + FreqTables.jl + Statistics.jl

MenuRegistry.appendMenuItem(MenuId.MenubarExploreMenu, {
	group: '2_explore',
	submenu: ANSubmenuId,
	title: localize('showExplore.an', 'Detect Anomalies'),
	order: 3,
}); // OutlierDetection.jl

MenuRegistry.appendMenuItem(MenuId.MenubarExploreMenu, {
	group: '2_explore',
	command: { id: NOVD_ID, title: localize('showExplore.novd', 'Detect Novelties') },
	order: 3.5,
}); // LIBSVM.jl + OnlineStats.jl + ChangePointDetection.jl

MenuRegistry.appendMenuItem(MenuId.MenubarExploreMenu, {
	group: '2_explore',
	command: { id: HMD_ID, title: localize('showExplore.hmd', 'Handle Missing Data') },
	order: 4,
}); // Impute.jl


MenuRegistry.appendMenuItem(MenuId.MenubarExploreMenu, {
	group: '2_explore',
	command: { id: IDAT_ID, title: localize('eda.interpolation', 'Interpolate Data') },
	order: 5,
}); // Interpolations.jl + Dierckx.jl


// ------------------- TOOLBOXES ------------------------


MenuRegistry.appendMenuItem(MenuId.MenubarExploreMenu, {
	group: '3_explore',
	submenu: E_MTSubmenuId,
	title: localize('showStatistics.mt', 'Economics Toolbox'),
	order: 1,
});

MenuRegistry.appendMenuItem(MenuId.MenubarExploreMenu, {
	group: '3_explore',
	submenu: E_ETSubmenuId,
	title: localize('showStatistics.et', 'Econometrics Toolbox'),
	order: 2,
});

MenuRegistry.appendMenuItem(MenuId.MenubarExploreMenu, {
	group: '3_explore',
	submenu: E_FTSubmenuId,
	title: localize('showStatistics.ft', 'Finance Toolbox'),
	order: 3,
});

MenuRegistry.appendMenuItem(MenuId.MenubarExploreMenu, {
	group: '3_explore',
	submenu: E_FITSubmenuId,
	title: localize('showStatistics.fit', 'Financial Instruments Toolbox'),
	order: 4,
});

MenuRegistry.appendMenuItem(MenuId.MenubarExploreMenu, {
	group: '3_explore',
	submenu: E_RMTSubmenuId,
	title: localize('showStatistics.rmt', 'Risk Management Toolbox'),
	order: 4,
});

MenuRegistry.appendMenuItem(MenuId.MenubarExploreMenu, {
	group: '3_explore',
	submenu: E_BATSubmenuId,
	title: localize('showStatistics.bat', 'Business Advantage Toolbox'),
	order: 5,
});

// ----------------------------------------------------------------------

MenuRegistry.appendMenuItem(MenuId.MenubarExploreMenu, {
	group: '4_explore',
	submenu: E_SMTSubmenuId,
	title: localize('showStatistics.smt', 'Sound of Music Toolbox'),
	order: 1,
});

MenuRegistry.appendMenuItem(MenuId.MenubarExploreMenu, {
	group: '4_explore',
	submenu: E_SVTSubmenuId,
	title: localize('showStatistics.svt', 'Sound of Voice Toolbox'),
	order: 2,
});

MenuRegistry.appendMenuItem(MenuId.MenubarExploreMenu, {
	group: '4_explore',
	submenu: E_LTSubmenuId,
	title: localize('showStatistics.lt', 'Literature Toolbox'),
	order: 3,
});

MenuRegistry.appendMenuItem(MenuId.MenubarExploreMenu, {
	group: '4_explore',
	submenu: E_ARTTSubmenuId,
	title: localize('showStatistics.art', 'Art Toolbox'),
	order: 4,
});

MenuRegistry.appendMenuItem(MenuId.MenubarExploreMenu, {
	group: '4_explore',
	submenu: E_LAWSubmenuId,
	title: localize('showStatistics.law', 'Law and Jurisprudence Toolbox'),
	order: 5,
});

// --------------------------------------------------------------------

MenuRegistry.appendMenuItem(MenuId.MenubarExploreMenu, {
	group: '5_explore',
	submenu: E_GEOSubmenuId,
	title: localize('showStatistics.geo', 'Geoscience Toolbox'),
	order: 1,
});

MenuRegistry.appendMenuItem(MenuId.MenubarExploreMenu, {
	group: '5_explore',
	submenu: E_HSTSubmenuId,
	title: localize('showStatistics.geo', 'History Toolbox'),
	order: 2,
});

MenuRegistry.appendMenuItem(MenuId.MenubarExploreMenu, {
	group: '5_explore',
	submenu: E_NHSTSubmenuId,
	title: localize('showStatistics.geo', 'Natural History Toolbox'),
	order: 3,
});

// ----------------------------------------------------------------------

MenuRegistry.appendMenuItem(MenuId.MenubarExploreMenu, {
	group: '6_explore',
	submenu: E_BCTSubmenuId,
	title: localize('showStatistics.mt', 'Biomedical Computing Toolbox'),
	order: 1,
});
// The broad field of applied biology and biochemistry that seeks to understand the underlying mechanisms of health and disease.
// Biomedical Computing
// ├── Bioinformatics
// ├── Genomics
// ├── Biomedical Databases
// ├── Medical Imaging
// ├── Neuroinformatics
// ├── Clinical Data Processing
// ├── Computational Biology
// └── Scientific Healthcare ML

// Biomedicine
// ├── Genetics & Molecular Biology
// ├── Pathology & Microbiology
// ├── Immunology
// ├── Epidemiology
// ├── Pharmacology & Toxicology
// ├── Biomedical Image Processing (Medical Image Computing)
// └── Biomedical Data Sources (e.g. Genomics and Proteomics)

MenuRegistry.appendMenuItem(MenuId.MenubarExploreMenu, {
	group: '6_explore',
	submenu: E_CMTSubmenuId,
	title: localize('showStatistics.mt', 'Clinical Medicine Toolbox'),
	order: 2,
});
// Clinical Medicine
// ├── Clinical Laboratory Processing
// ├── Precision and Personalized Medicine
// └── Clinical Decision Support Systems (CDSS)

MenuRegistry.appendMenuItem(MenuId.MenubarExploreMenu, {
	group: '6_explore',
	command: {id: 'showStatistics.eco',
	title: localize('showStatistics.mt', 'Ecology Toolbox'),},
	order: 3,
}); // AlgebraicDynamics.jl

// -------------------------------------------------------------------

MenuRegistry.appendMenuItem(MenuId.MenubarExploreMenu, {
	group: '7_explore',
	submenu: E_PHYTSubmenuId,
	title: localize('showStatistics.phyt', 'Physics Toolbox'),
	order: 1,
}); //

MenuRegistry.appendMenuItem(MenuId.MenubarExploreMenu, {
	group: '7_explore',
	submenu: E_CETSubmenuId,
	title: localize('showStatistics.femt', 'Computational Engineering Toolbox'),
	order: 2,
});
// Computational Engineering
// ├── Finite Elements
// ├── Multiphysics
// ├── Structural Mechanics
// ├── CFD / PDEs
// ├── Topology Optimisation
// ├── PDE-Constrained Optimisation
// ├── Scientific Machine Learning
// ├── Differentiable Simulation
// ├── Control Systems
// ├── Robotics Dynamics
// └── High-Performance Computing


MenuRegistry.appendMenuItem(MenuId.MenubarExploreMenu, {
	group: '7_explore',
	submenu: E_DSPSubmenuId,
	title: localize('showStatistics.dsp', 'Signal Processing Toolbox'),
	order: 2.5,
});

MenuRegistry.appendMenuItem(MenuId.MenubarExploreMenu, {
	group: '7_explore',
	submenu: E_MSCCSubmenuId,
	title: localize('showStatistics.mscc', 'Materials Science and Chemistry Toolbox'),
	order: 2.7,
});

MenuRegistry.appendMenuItem(MenuId.MenubarExploreMenu, {
	group: '7_explore',
	submenu: E_RTSubmenuId,
	title: localize('showStatistics.robot', 'Robotics Toolbox'),
	order: 3,
});

// ===================================================
// SUBMENU: ACESSING DATASET REPOSITORIES
// ===================================================

MenuRegistry.appendMenuItem(ADRSubmenuId, {
	group: '1_ds',
	command: {
		id: EXPL_COMMAND_ID, precondition: ContextKeyExpr.false(),
		title: localize('ds.hf', 'Hugging Face Datasets'),
	},
	order: 1,
}); // HuggingFaceDatasets.jl,

MenuRegistry.appendMenuItem(ADRSubmenuId, {
	group: '1_ds',
	command: {
		id: EXPL_COMMAND_ID, precondition: ContextKeyExpr.false(),
		title: localize('ds.kaggle', 'Kaggle Datasets'),
	},
	order: 2,
});

MenuRegistry.appendMenuItem(ADRSubmenuId, {
	group: '2_ds',
	command: {
		id: EXPL_COMMAND_ID, precondition: ContextKeyExpr.false(),
		title: localize('ds.openml', 'OpenML Datasets'),
	},
	order: 1,
}); // https://www.openml.org/

MenuRegistry.appendMenuItem(ADRSubmenuId, {
	group: '2_ds',
	command: {
		id: EXPL_COMMAND_ID, precondition: ContextKeyExpr.false(),
		title: localize('ds.uci', 'UCI Machine Learning Repository'),
	},
	order: 2,
}); // https://archive.ics.uci.edu/
// MLDatasets.jl (many UCI datasets are mirrored here)

MenuRegistry.appendMenuItem(ADRSubmenuId, {
	group: '2_ds',
	command: {
		id: EXPL_COMMAND_ID, precondition: ContextKeyExpr.false(),
		title: localize('ds.ucruea', 'UCR/UEA Time Series Repository'),
	},
	order: 3,
}); //  TimeSeriesClassification.jl

MenuRegistry.appendMenuItem(ADRSubmenuId, {
 	group: '1_ds',
 	command: {
 		id: EXPL_COMMAND_ID, precondition: ContextKeyExpr.false(),
 		title: localize('ds.mld', 'Machine Learning Datasets'),
 	},
 	order: 3,
}); // MLDatasets.jl

MenuRegistry.appendMenuItem(ADRSubmenuId, {
	group: '2_ds',
	command: {
		id: EXPL_COMMAND_ID, precondition: ContextKeyExpr.false(),
		title: localize('ds.rd', 'R Datasets'),
	},
	order: 3,
}); // RDatasets.jl

// MenuRegistry.appendMenuItem(ADRSubmenuId, {
// 	group: '1_ds',
// 	command: {
// 		id: EXPL_COMMAND_ID, precondition: ContextKeyExpr.false(),
// 		title: localize('ds.m4m5', 'M4, M5 Competition Datasets'),
// 	},
// 	order: 6,
// });


// ===================================================
// SUBMENU: ACESSING MODEL REPOSITORTIES
// ===================================================

MenuRegistry.appendMenuItem(AMRSubmenuId, {
	group: '1_ds',
	command: {
		id: HFM_ID,
		title: localize('ds.hf', 'Hugging Face Models'),
	},
	order: 1,
}); // HuggingFaceHub.jl
// //https://huggingface.co/models


MenuRegistry.appendMenuItem(AMRSubmenuId, {
	group: '1_ds',
	command: {
		id: EXPL_COMMAND_ID, precondition: ContextKeyExpr.false(),
		title: localize('ds.km', 'Kaggle Models'),
	},
	order: 1,
}); // https://www.kaggle.com/models


// ===================================================
// SUBMENU: CONNECT
// ===================================================

MenuRegistry.appendMenuItem(CONNSubmenuId, {
	group: '1_conn',
	command: {
		id: EXPL_COMMAND_ID, precondition: ContextKeyExpr.false(),
		title: localize('conn.http', 'HTTP / REST APIs'),
	},
	order: 1,
});  // HTTP.jl

MenuRegistry.appendMenuItem(CONNSubmenuId, {
	group: '2_conn',
	command: {
		id: EXPL_COMMAND_ID, precondition: ContextKeyExpr.false(),
		title: localize('conn.excel', 'Excel Workbook'),
	},
	order: 1,
});  // XLSX.jl

MenuRegistry.appendMenuItem(CONNSubmenuId, {
	group: '2_conn',
	command: {
		id: EXPL_COMMAND_ID, precondition: ContextKeyExpr.false(),
		title: localize('conn.json', 'JSON Files'),
	},
	order: 2,
});  // JSON.jl

MenuRegistry.appendMenuItem(CONNSubmenuId, {
	group: '2_conn',
	command: {
		id: EXPL_COMMAND_ID, precondition: ContextKeyExpr.false(),
		title: localize('conn.xml', 'XML and XPath'),
	},
	order: 3,
});  // EzXML.jl

MenuRegistry.appendMenuItem(CONNSubmenuId, {
	group: '4_conn',
	command: {
		id: EXPL_COMMAND_ID, precondition: ContextKeyExpr.false(),
		title: localize('conn.http', 'Google Drive'),
	},
	order: 1,
});  // GoogleDrive.jl



// ===================================================
// SUBMENU: CLOUD COMPUTING PLATFORMS
// ===================================================

MenuRegistry.appendMenuItem(RCSubmenuId, {
	group: '1_ccp',
	command: {
		id: EXPL_COMMAND_ID, precondition: ContextKeyExpr.false(),
		title: localize('ccp.colab', 'Google Colab'),
	},
	order: 1,
});  // Becomes active only if the Extension Colab is installed

MenuRegistry.appendMenuItem(RCSubmenuId, {
	group: '1_ccp',
	command: {
		id: EXPL_COMMAND_ID, precondition: ContextKeyExpr.false(),
		title: localize('ccp.azure', 'Microsoft Azure'),
	},
	order: 2,
});  // Becomes active only if the Extension Azure is installed



// ===================================================
// SUBMENU: VISUALISATION
// EDA-only plots — data-centric, pre-modelling.
// Model-diagnostic plots (Trace, Bayesian Network, etc.)
// live in their respective webview Next Steps panels.
// Core packages: StatsPlots.jl, Makie.jl, Plots.jl
// ===================================================

// ── Core Statistical ──────────────────────────────────────────────────

MenuRegistry.appendMenuItem(DVSubmenuId, {
	group: '1_dv',
	command: { id: CVIZ_SCATTER_ID, title: localize('dv.scatter', 'Scatter Plot') },
	order: 1,
});

MenuRegistry.appendMenuItem(DVSubmenuId, {
	group: '1_dv',
	command: { id: CVIZ_BAR_ID, title: localize('dv.bar', 'Bar Chart') },
	order: 2,
});

MenuRegistry.appendMenuItem(DVSubmenuId, {
	group: '1_dv',
	command: { id: CVIZ_HISTOGRAM_ID, title: localize('dv.histogram', 'Histogram') },
	order: 3,
});

MenuRegistry.appendMenuItem(DVSubmenuId, {
	group: '1_dv',
	command: { id: CVIZ_BOX_ID, title: localize('dv.box', 'Box Plot') },
	order: 4,
});

MenuRegistry.appendMenuItem(DVSubmenuId, {
	group: '1_dv',
	command: { id: CVIZ_VIOLIN_ID, title: localize('dv.violin', 'Violin Plot') },
	order: 5,
});

MenuRegistry.appendMenuItem(DVSubmenuId, {
	group: '1_dv',
	command: { id: CVIZ_PIE_ID, title: localize('dv.pie', 'Pie Chart') },
	order: 6,
});

MenuRegistry.appendMenuItem(DVSubmenuId, {
	group: '1_dv',
	command: { id: CVIZ_LINE_ID, title: localize('dv.line', 'Line Plot') },
	order: 7,
});

// ── Distribution Comparison ───────────────────────────────────────────

MenuRegistry.appendMenuItem(DVSubmenuId, {
	group: '2_dv',
	command: { id: DCMP_ECDF_ID, title: localize('dv.ecdf', 'Empirical Cumulative Distribution') },
	order: 1,
});

MenuRegistry.appendMenuItem(DVSubmenuId, {
	group: '2_dv',
	command: { id: DCMP_QQ_ID, title: localize('dv.qq', 'Quantile-Quantile Plot') },
	order: 2,
});

MenuRegistry.appendMenuItem(DVSubmenuId, {
	group: '2_dv',
	command: { id: DCMP_MARGINAL_ID, title: localize('dv.marginal', 'Marginal Plot') },
	order: 3,
});

MenuRegistry.appendMenuItem(DVSubmenuId, {
	group: '2_dv',
	command: { id: DCMP_CORRELOGRAM_ID, title: localize('dv.corre', 'Correlogram') },
	order: 4,
});

// ── Multivariate ──────────────────────────────────────────────────────

MenuRegistry.appendMenuItem(DVSubmenuId, {
	group: '3_dv',
	command: { id: MVIZ_CORNER_ID, title: localize('dv.corner', 'Corner Plot') },
	order: 1,
});

MenuRegistry.appendMenuItem(DVSubmenuId, {
	group: '3_dv',
	command: { id: MVIZ_PARALLEL_ID, title: localize('dv.parallel', 'Parallel Coordinates') },
	order: 2,
});

MenuRegistry.appendMenuItem(DVSubmenuId, {
	group: '3_dv',
	command: { id: MVIZ_BUBBLE_ID, title: localize('dv.bubble', 'Bubble Chart') },
	order: 3,
});

MenuRegistry.appendMenuItem(DVSubmenuId, {
	group: '3_dv',
	command: { id: MVIZ_HEATMAP_ID, title: localize('dv.heat', 'Heatmap') },
	order: 4,
});

// ── Time Series ───────────────────────────────────────────────────────

MenuRegistry.appendMenuItem(DVSubmenuId, {
	group: '4_dv',
	command: { id: TSVIZ_TSPLOT_ID, title: localize('dv.tsplot', 'Time Series Plot') },
	order: 1,
});

MenuRegistry.appendMenuItem(DVSubmenuId, {
	group: '4_dv',
	command: { id: TSVIZ_RIBBON_ID, title: localize('dv.ribbon', 'Ribbon Plot') },
	order: 3,
});

MenuRegistry.appendMenuItem(DVSubmenuId, {
	group: '4_dv',
	command: { id: TSVIZ_STACKED_ID, title: localize('dv.stacked', 'Stacked Area') },
	order: 4,
});

MenuRegistry.appendMenuItem(DVSubmenuId, {
	group: '4_dv',
	command: { id: TSVIZ_OHLC_ID, title: localize('dv.ohlc', 'OHLC') },
	order: 5,
});

// ── Categorical and Proportional ─────────────────────────────────────

MenuRegistry.appendMenuItem(DVSubmenuId, {
	group: '5_dv',
	command: { id: CPVIZ_MOSAIC_ID, title: localize('dv.mp', 'Mosaic Plot') },
	order: 1,
}); // StatsPlots.jl, OnlineStats.jl

MenuRegistry.appendMenuItem(DVSubmenuId, {
	group: '5_dv',
	command: { id: CPVIZ_NIGHTINGALE_ID, title: localize('dv.nightingale', 'Nightingale Rose Chart') },
	order: 2,
}); // Makie.jl, Plots.jl

MenuRegistry.appendMenuItem(DVSubmenuId, {
	group: '5_dv',
	command: { id: CPVIZ_WATERFALL_ID, title: localize('dv.waterfall', 'Waterfall Plot') },
	order: 3,
}); // Makie.jl, Vega.jl

MenuRegistry.appendMenuItem(DVSubmenuId, {
	group: '5_dv',
	command: { id: CPVIZ_TREEMAP_ID, title: localize('dv.treemap', 'Treemap') },
	order: 4,
}); // Makie.jl

MenuRegistry.appendMenuItem(DVSubmenuId, {
	group: '5_dv',
	command: { id: CPVIZ_SANKEY_ID, title: localize('dv.sankey', 'Sankey Diagram') },
	order: 5,
}); // SankeyMakie.jl, Makie.jl

// ── Graph and Spatial ─────────────────────────────────────────────────

MenuRegistry.appendMenuItem(DVSubmenuId, {
	group: '6_dv',
	command: { id: GSVIZ_NETWORK_ID, title: localize('dv.nd', 'Network Diagram') },
	order: 1,
}); // GraphMakie.jl, Graphs.jl

MenuRegistry.appendMenuItem(DVSubmenuId, {
	group: '6_dv',
	command: { id: GSVIZ_TREE_ID, title: localize('dv.tree', 'Tree Diagram') },
	order: 2,
}); // GraphMakie.jl, Graphs.jl

MenuRegistry.appendMenuItem(DVSubmenuId, {
	group: '6_dv',
	command: { id: GSVIZ_CHOROPLETH_ID, title: localize('dv.choro', 'Choropleth') },
	order: 3,
}); // GeoMakie.jl

MenuRegistry.appendMenuItem(DVSubmenuId, {
	group: '6_dv',
	command: { id: GSVIZ_VORONOI_ID, title: localize('dv.voronoi', 'Voronoi Plot') },
	order: 4,
}); // DelaunayTriangulation.jl, CairoMakie.jl


// ── Surfaces and Fields ───────────────────────────────────────────────

MenuRegistry.appendMenuItem(DVSubmenuId, {
	group: '7_dv',
	command: { id: SFVIZ_CONTOUR_ID, title: localize('dv.contour', 'Contour Plot') },
	order: 1,
}); // CairoMakie.jl

MenuRegistry.appendMenuItem(DVSubmenuId, {
	group: '7_dv',
	command: { id: SFVIZ_CONTOUR3D_ID, title: localize('dv.contour3d', '3D Contour') },
	order: 2,
}); // GLMakie.jl

MenuRegistry.appendMenuItem(DVSubmenuId, {
	group: '7_dv',
	command: { id: SFVIZ_SURFACE_ID, title: localize('dv.surface', 'Surface Plot') },
	order: 3,
}); // GLMakie.jl

MenuRegistry.appendMenuItem(DVSubmenuId, {
	group: '7_dv',
	command: { id: SFVIZ_VOLUME_ID, title: localize('dv.volume', 'Volume Plot') },
	order: 4,
}); // GLMakie.jl

MenuRegistry.appendMenuItem(DVSubmenuId, {
	group: '7_dv',
	command: { id: SFVIZ_PHASE_ID, title: localize('dv.phase', 'Phase Portrait') },
	order: 5,
}); // CairoMakie.jl / GLMakie.jl

MenuRegistry.appendMenuItem(DVSubmenuId, {
	group: '7_dv',
	command: { id: SFVIZ_MESH_ID, title: localize('dv.mesh', 'Mesh Plot') },
	order: 6,
}); // CairoMakie.jl / GLMakie.jl

MenuRegistry.appendMenuItem(DVSubmenuId, {
	group: '7_dv',
	command: { id: SFVIZ_VOXELS_ID, title: localize('dv.voxels', 'Voxel Plot') },
	order: 7,
}); // GLMakie.jl


// ============================================
// SUBMENU: ANOMALIES DETECTION
// ============================================

MenuRegistry.appendMenuItem(ANSubmenuId, {
	group: '1_nod',
	command: { id: NOD_ID, title: localize('nod.proximityBased', 'Proximity-Based Outlier Detection') },
	order: 1,
}); // KNN · LOF · COF · ABOD via OutlierDetection.jl

MenuRegistry.appendMenuItem(ANSubmenuId, {
	group: '1_nod',
	command: { id: ANDE_ID, title: localize('nod.learningBased', 'Learning-Based Anomaly Detection') },
	order: 2,
}); // Isolation Forest · AutoEncoder · DeepSAD · ESAD



// ===================================================
// SUBMENU: ECONOMICS TOOLBOX
// ===================================================

// Data Sources submenu
MenuRegistry.appendMenuItem(E_MTSubmenuId, {
	group: '1_mt',
	submenu: E_MTDataSourcesSubmenuId,
	title: localize('mt.dataSources', 'Data Sources'),
	order: 1,
});

MenuRegistry.appendMenuItem(E_MTDataSourcesSubmenuId, {
	group: '1_mtds',
	command: {
		id: EXPL_COMMAND_ID, precondition: ContextKeyExpr.false(),
		title: localize('mt.dbnomics', 'DBnomics Platform'),
	},
	order: 1,
}); // DBnomics.jl

MenuRegistry.appendMenuItem(E_MTDataSourcesSubmenuId, {
	group: '1_mtds',
	command: {
		id: EXPL_COMMAND_ID, precondition: ContextKeyExpr.false(),
		title: localize('mt.fred', 'Federal Reserve Economic Data (FRED)'),
	},
	order: 2,
}); // Fred.jl

MenuRegistry.appendMenuItem(E_MTDataSourcesSubmenuId, {
	group: '1_mtds',
	command: {
		id: EXPL_COMMAND_ID, precondition: ContextKeyExpr.false(),
		title: localize('mt.ifm', 'International Monetary Fund Datasets'),
	},
	order: 3,
}); // IMFData.jl

MenuRegistry.appendMenuItem(E_MTDataSourcesSubmenuId, {
	group: '1_mtds',
	command: {
		id: EXPL_COMMAND_ID, precondition: ContextKeyExpr.false(),
		title: localize('mt.wbd', 'World Bank Indicators'),
	},
	order: 4,
}); // WorldBankData.jl

MenuRegistry.appendMenuItem(E_MTDataSourcesSubmenuId, {
	group: '1_mtds',
	command: {
		id: EXPL_COMMAND_ID, precondition: ContextKeyExpr.false(),
		title: localize('mt.eae', 'Econometrics and Applied Economics'),
	},
	order: 5,
}); // EconDatasets.jl

// Models
MenuRegistry.appendMenuItem(E_MTSubmenuId, {
	group: '4_mt',
	command: { id: 'chiara.statistics.macro.hpf', title: localize('macro.hpf', 'Business Cycle Filters') },
	order: 1,
}); // TrendDecomposition.jl

MenuRegistry.appendMenuItem(E_MTSubmenuId, {
	group: '4_mt',
	command: { id: 'chiara.statistics.macro.dtsvm', title: localize('macro.dtsvm', 'Stochastic Volatility Macroeconomic Models') },
	order: 2,
}); // MacroEconometricModels.jl

MenuRegistry.appendMenuItem(E_MTSubmenuId, {
	group: '4_mt',
	command: { id: 'chiara.statistics.macro.dsge', title: localize('macro.dsge', 'Dynamic Stochastic General Equilibrium (DSGE)') },
	order: 1,
}); // DSGE.jl, EconPDEs.jl, JuliaPerturbation.jl

MenuRegistry.appendMenuItem(E_MTSubmenuId, {
	group: '4_mt',
	command: { id: 'chiara.statistics.macro.ham', title: localize('macro.ham', 'Heterogeneous-Agent Models') },
	order: 2,
}); // EconPDEs.jl

MenuRegistry.appendMenuItem(E_MTSubmenuId, {
	group: '5_mt',
	command: { id: 'chiara.statistics.macro.gt', title: localize('macro.gt', 'Game Theory') },
	order: 1,
}); // GameTheory.jl, StrategicGames.jl, BaryPlots.jl


// ===================================================
// SUBMENU: ECONOMETRICS TOOLBOX
// ===================================================

MenuRegistry.appendMenuItem(E_ETSubmenuId, {
	group: '1_et',
	command: { id: ARMA_ARIMA_WEBVIEW_ID, title: localize('et.arimax', 'ARIMAX Models') },
	order: 1,
});

MenuRegistry.appendMenuItem(E_ETSubmenuId, {
	group: '1_et',
	command: { id: ARMA_VAR_WEBVIEW_ID, title: localize('et.var', 'VAR/VECM Systems') },
	order: 2,
});

MenuRegistry.appendMenuItem(E_ETSubmenuId, {
	group: '1_et',
	command: { id: 'chiara.statistics.vcm', title: localize('et.garch', 'GARCH-Type Models') },
	order: 3,
});

MenuRegistry.appendMenuItem(E_ETSubmenuId, {
 	group: '1_et',
	command: {
		id: 'chiara.statistics.rsm', precondition: ContextKeyExpr.false(),
		title: localize('showStatistics.rsm', 'Regime Switching Models'),
	},
	order: 4,
}); // MarSwitching.jl, HiddenMarkovModels.jl

MenuRegistry.appendMenuItem(E_ETSubmenuId, {
	group: '2_et',
	command: { id: 'chiara.statistics.atsf', title: localize('et.atsf', 'Advanced Time-Series Forecasting') },
	order: 1,
}); // Durbyn.jl

MenuRegistry.appendMenuItem(E_ETSubmenuId, {
	group: '2_et',
	command: { id: 'chiara.statistics.nntsf', title: localize('showStatistics.nntsf', 'Neural Network Time-Series Forecasting') },
	order: 2,
}); // Flux.jl + FluxArchitectures.jl

MenuRegistry.appendMenuItem(E_ETSubmenuId, {
	group: '2_et',
	command: { id: 'chiara.statistics.autotsf', precondition: ContextKeyExpr.false(), title: localize('et.autotsf', 'Automatic Time-Series Forecasting') },
	order: 3,
}); // Heval.jl

MenuRegistry.appendMenuItem(E_ETSubmenuId, {
	group: '3_et',
	command: { id: ECO_BLSDF_ID, title: localize('eco.blsdf', 'Bayesian Linear Stochastic Discount Factor') },
	order: 1,
}); // BayesianFactorZoo.jl

MenuRegistry.appendMenuItem(E_ETSubmenuId, {
	group: '3_et',
	command: { id: ECO_BFMB_ID, title: localize('ft.bfmb', 'Fama-MacBeth Regression') },
	order: 2,
}); // BayesianFactorZoo.jl


// ===================================================
// SUBMENU: FINANCE TOOLBOX
// ===================================================

// Data Sources submenu
MenuRegistry.appendMenuItem(E_FTSubmenuId, {
	group: '1_ft',
	submenu: E_FTDataSourcesSubmenuId,
	title: localize('ft.dataSources', 'Data Sources'),
	order: 1,
});

MenuRegistry.appendMenuItem(E_FTDataSourcesSubmenuId, {
	group: '1_fitds',
	command: {
		id: EXPL_COMMAND_ID, precondition: ContextKeyExpr.false(),
		title: localize('fit.yahoo', 'Yahoo Finance'),
	},
	order: 1,
}); // YFinance.jl

MenuRegistry.appendMenuItem(E_FTDataSourcesSubmenuId, {
	group: '1_fitds',
	command: {
		id: EXPL_COMMAND_ID, precondition: ContextKeyExpr.false(),
		title: localize('fit.alpha', 'Alpha Vantage'),
	},
	order: 2,
}); // AlphaVantage.jl

// Regulatory filings
MenuRegistry.appendMenuItem(E_FTDataSourcesSubmenuId, {
	group: '1_ftds',
	command: {
		id: EXPL_COMMAND_ID, precondition: ContextKeyExpr.false(),
		title: localize('ft.xbrl', 'XBRL'),
	},
	order: 0,
});  // XbrlXML.jl


MenuRegistry.appendMenuItem(E_FTDataSourcesSubmenuId, {
	group: '1_ftds',
	command: {
		id: EXPL_COMMAND_ID, precondition: ContextKeyExpr.false(),
		title: localize('ft.edgar', 'US SEC EDGAR'),
	},
	order: 1,
}); // ScrapeSEC.jl

MenuRegistry.appendMenuItem(E_FTDataSourcesSubmenuId, {
	group: '1_ftds',
	command: {
		id: EXPL_COMMAND_ID, precondition: ContextKeyExpr.false(),
		title: localize('ft.esef', 'EU ESEF'),
	},
	order: 2,
}); // European Union

MenuRegistry.appendMenuItem(E_FTDataSourcesSubmenuId, {
	group: '1_ftds',
	command: {
		id: EXPL_COMMAND_ID, precondition: ContextKeyExpr.false(),
		title: localize('ft.esef', 'CA SEDAR+'),
	},
	order: 3,
}); // Canada

MenuRegistry.appendMenuItem(E_FTDataSourcesSubmenuId, {
	group: '1_ftds',
	command: {
		id: EXPL_COMMAND_ID, precondition: ContextKeyExpr.false(),
		title: localize('ft.edinet', 'JP EDINET'),
	},
	order: 4,
}); // Japan

MenuRegistry.appendMenuItem(E_FTDataSourcesSubmenuId, {
	group: '1_ftds',
	command: {
		id: EXPL_COMMAND_ID, precondition: ContextKeyExpr.false(),
		title: localize('ft.esef', 'KR DART'),
	},
	order: 5,
}); // Korea

MenuRegistry.appendMenuItem(E_FTDataSourcesSubmenuId, {
	group: '1_ftds',
	command: {
		id: EXPL_COMMAND_ID, precondition: ContextKeyExpr.false(),
		title: localize('ft.esef', 'CN CSRC/SHSE/SZSE'),
	},
	order: 6,
}); // China

MenuRegistry.appendMenuItem(E_FTDataSourcesSubmenuId, {
	group: '1_ftds',
	command: {
		id: EXPL_COMMAND_ID, precondition: ContextKeyExpr.false(),
		title: localize('ft.mops', 'TW MOPS'),
	},
	order: 7,
}); // Taiwan

MenuRegistry.appendMenuItem(E_FTDataSourcesSubmenuId, {
	group: '1_ftds',
	command: {
		id: EXPL_COMMAND_ID, precondition: ContextKeyExpr.false(),
		title: localize('ft.hkex', 'HK HKEX'),
	},
	order: 8,
}); // Hong-Kong

MenuRegistry.appendMenuItem(E_FTDataSourcesSubmenuId, {
	group: '1_ftds',
	command: {
		id: EXPL_COMMAND_ID, precondition: ContextKeyExpr.false(),
		title: localize('ft.acra', 'SG ACRA/SGX'),
	},
	order: 9,
}); // Singapore

MenuRegistry.appendMenuItem(E_FTDataSourcesSubmenuId, {
	group: '1_ftds',
	command: {
		id: EXPL_COMMAND_ID, precondition: ContextKeyExpr.false(),
		title: localize('ft.mca21', 'IN MCA21'),
	},
	order: 10,
}); // India

// Research datasets
MenuRegistry.appendMenuItem(E_FTDataSourcesSubmenuId, {
	group: '2_ftds',
	command: {
		id: EXPL_COMMAND_ID, precondition: ContextKeyExpr.false(),
		title: localize('ft.french', 'Kenneth French Data Library'),
	},
	order: 1,
}); // FamaFrenchData.jl

MenuRegistry.appendMenuItem(E_FTSubmenuId, {
	group: '2_ft',
	command: {
		id: EXPL_COMMAND_ID, precondition: ContextKeyExpr.false(),
		title: localize('eda.zscore', 'Transform Data'),
	},
	order: 1,
});
// Resampling, Simple and Log Returns, Temporal and Cross-Sectional Aggregation, Z-score (normalization), Box-Cox,

MenuRegistry.appendMenuItem(E_FTSubmenuId, {
	group: '2_ft',
	command: {
		id: EXPL_COMMAND_ID, precondition: ContextKeyExpr.false(),
		title: localize('eda.zscore', 'Conventions and Calenders'),
	},
	order: 2,
});

// Models
MenuRegistry.appendMenuItem(E_FTSubmenuId, {
	group: '3_ft',
	command: { id: ECO_PO_ID, title: localize('ft.po', 'Portfolio Optimisation') },
	order: 1,
}); // PortfolioOptimisers.jl

MenuRegistry.appendMenuItem(E_FTSubmenuId, {
	group: '3_ft',
	command: { id: 'chiara.statistics.macro.ctmf', title: localize('macro.ctmf', 'Continuous-Time Macro-Finance') },
	order: 2,
}); // EconPDEs.jl


// ===================================================
// SUBMENU: FINANCIAL INSTRUMENTS TOOLBOX
// ===================================================

// High-frequency methods
MenuRegistry.appendMenuItem(E_FITSubmenuId, {
	group: '2_fit',
	command: { id: 'chiara.statistics.rbv', title: localize('tvvm.rbv', 'Range-Based Volatility Estimation') },
	order: 1,
}); // RangeVol.jl

MenuRegistry.appendMenuItem(E_FITSubmenuId, {
	group: '2_fit',
	command: { id: ECO_HFCME_ID, title: localize('eco.hfcme', 'High-Frequency Volatility Estimation') },
	order: 2,
});

MenuRegistry.appendMenuItem(E_FITSubmenuId, {
	group: '2_fit',
	command: { id: ECO_HFCME_ID, title: localize('eco.hfcme.cov', 'High-Frequency Covariance Matrix Estimation') },
	order: 3,
});

MenuRegistry.appendMenuItem(E_FITSubmenuId, {
	group: '2_fit',
	command: { id: ECO_MMN_ID, title: localize('eco.mmn', 'Market Microstructure Noise') },
	order: 4,
}); // MicrostructureNoise.jl


// Yield Curve Models ---------------------------------------------------------------

MenuRegistry.appendMenuItem(E_FITSubmenuId, {
	group: '3_fit',
	submenu: E_FIT_YCMSubmenuId,
	title: localize('showStatistics.yts', 'Yield Curve Models'),
	order: 1,
}); // FinanceModels.jl

MenuRegistry.appendMenuItem(E_FITSubmenuId, {
	group: '3_fit',
	submenu: E_FIT_CCMSubmenuId,
	title: localize('showStatistics.cts', 'Credit Term Structure Models'),
	order: 2,
}); // QuantLib.jl

MenuRegistry.appendMenuItem(E_FITSubmenuId, {
	group: '3_fit',
	submenu: E_FIT_VCMSubmenuId,
	title: localize('showStatistics.vts', 'Volatility Term Structure Models'),
	order: 3,
}); // QuantLib.jl

MenuRegistry.appendMenuItem(E_FITSubmenuId, {
	group: '4_fit',
	command: { id: EXPL_COMMAND_ID, precondition: ContextKeyExpr.false(), title: localize('showStatistics.frbp', 'Price Fixed Rate Bonds') },
	order: 4,
}); // QuantLib.jl

MenuRegistry.appendMenuItem(E_FITSubmenuId, {
	group: '4_fit',
	command: { id: EXPL_COMMAND_ID, precondition: ContextKeyExpr.false(), title: localize('showStatistics.vrbp', 'Price Variable Rate Bonds') },
	order: 5,
}); // QuantLib.jl


// Stochastic Processes ------------------------------------------------------------

MenuRegistry.appendMenuItem(E_FITSubmenuId, {
	group: '5_fit',
	submenu: E_FIT_DPSSubmenuId,
	title: localize('showStatistics.dps', 'Diffusion Models'),
	order: 1,
}); // StochasticDiffEq.jl, Bridge.jl

MenuRegistry.appendMenuItem(E_FITSubmenuId, {
	group: '5_fit',
	submenu: E_FIT_JDMSubmenuId,
	title: localize('showStatistics.jps', 'Jump-Diffusion Models'),
	order: 2,
}); // JumpProcesses.jl

MenuRegistry.appendMenuItem(E_FITSubmenuId, {
	group: '5_fit',
	submenu: E_FIT_PJMSubmenuId,
	title: localize('showStatistics.pj', 'Pure Jump Models / Exponential Lévy Models'),
	order: 3,
}); // Lévy Processes

MenuRegistry.appendMenuItem(E_FITSubmenuId, {
	group: '5_fit',
	submenu: E_FIT_IRMSubmenuId,
	title: localize('showStatistics.irm', 'Interest Rate Models'),
	order: 4,
});

MenuRegistry.appendMenuItem(E_FITSubmenuId, {
	group: '5_fit',
	command: { id: ECO_IVS_ID, precondition: ContextKeyExpr.false(), title: localize('eco.ivs', 'Implied Volatility Surface') },
	order: 5,
});


// Financial Contracts -----------------------------------------------------------------------

MenuRegistry.appendMenuItem(E_FITSubmenuId, {
	group: '6_fit',
	command: {
		id: EXPL_COMMAND_ID, precondition: ContextKeyExpr.false(),
		title: localize('fit.algo', 'Compose Financial Contracts'),
	},
	order: 1,
}); // FinanceModels.jl. Composable contracts, models, and functions that allow for modeling of both simple and complex financial instruments


// Trading -----------------------------------------------------------------------

MenuRegistry.appendMenuItem(E_FITSubmenuId, {
	group: '7_fit',
	command: { id: 'chiara.simulate.abm-ta', precondition: ContextKeyExpr.false(), title: localize('simulate.abm-ta', 'Trading Agents') },
	order: 1,
}); // TradingAgents.jl, Brokerage.jl, VLLimitOrderBook.jl, TotalViewITCH.jl

MenuRegistry.appendMenuItem(E_FITSubmenuId, {
	group: '7_fit',
	command: { id: ECO_OA_ID, title: localize('eco.oa', 'Online Algorithms') },
	order: 2,
}); // OnlineStats.jl

MenuRegistry.appendMenuItem(E_FITSubmenuId, {
	group: '7_fit',
	command: {
		id: EXPL_COMMAND_ID, precondition: ContextKeyExpr.false(),
		title: localize('fit.algo', 'Algorithmic Trading'),
	},
	order: 3,
}); // Trading.jl

MenuRegistry.appendMenuItem(E_FITSubmenuId, {
	group: '7_fit',
	command: {
		id: EXPL_COMMAND_ID, precondition: ContextKeyExpr.false(),
		title: localize('fit.back', 'Backtesting Investment Strategies'),
	},
	order: 4,
}); // Trading.jl


// ============================================
// SUBSUBMENU: YIELD CURVE MODELS
// ============================================

MenuRegistry.appendMenuItem(E_FIT_YCMSubmenuId, {
	group: '1_ycm',
	command: { id: 'chiara.statistics.ycm.ns', precondition: ContextKeyExpr.false(), title: localize('ycm.ns', 'Nelson-Siegel') },
	order: 1,
}); // FinanceModels.jl

MenuRegistry.appendMenuItem(E_FIT_YCMSubmenuId, {
	group: '1_ycm',
	command: { id: 'chiara.statistics.ycm.nss', precondition: ContextKeyExpr.false(), title: localize('ycm.nss', 'Nelson-Siegel-Svensson') },
	order: 2,
}); // FinanceModels.jl

MenuRegistry.appendMenuItem(E_FIT_YCMSubmenuId, {
	group: '1_ycm',
	command: { id: 'chiara.statistics.ycm.sw', precondition: ContextKeyExpr.false(), title: localize('ycm.sw', 'Smith-Wilson') },
	order: 3,
}); // FinanceModels.jl

MenuRegistry.appendMenuItem(E_FIT_YCMSubmenuId, {
	group: '1_ycm',
	command: { id: 'chiara.statistics.ycm.msf', precondition: ContextKeyExpr.false(), title: localize('ycm.msf', 'Maximum Smoothness Forward') },
	order: 4,
});

MenuRegistry.appendMenuItem(E_FIT_YCMSubmenuId, {
	group: '2_ycm',
	command: { id: 'chiara.statistics.ycm.fbs', precondition: ContextKeyExpr.false(), title: localize('ycm.fbs', 'Fitted and Bootstrapped Splines') },
	order: 5,
}); // FinanceModels.jl, QuantLib.jl

MenuRegistry.appendMenuItem(E_FIT_YCMSubmenuId, {
	group: '2_ycm',
	command: { id: 'chiara.statistics.ycm.hwa', precondition: ContextKeyExpr.false(), title: localize('ycm.hwa', 'Hagan-West Algorithm') },
	order: 6,
}); // Google tf-quant-finance (Python)


// ============================================
// SUBSUBMENU: CREDIT TERM STRUCTURE MODELS
// ============================================

MenuRegistry.appendMenuItem(E_FIT_CCMSubmenuId, {
	group: '1_ccm',
	command: { id: 'chiara.statistics.ccm.pdc', precondition: ContextKeyExpr.false(), title: localize('ccm.pdc', 'Piecewise Default Curve')},
	order: 1,
}); // QuantLib.jl

MenuRegistry.appendMenuItem(E_FIT_CCMSubmenuId, {
	group: '1_ccm',
	command: { id: 'chiara.statistics.ccm.ihrc', precondition: ContextKeyExpr.false(), title: localize('ccm.ihrc', 'Interpolated Hazard Rate Curve')},
	order: 2,
}); // QuantLib.jl


// ============================================
// SUBSUBMENU: VOLATILITY TERM STRUCTURE MODELS
// ============================================

MenuRegistry.appendMenuItem(E_FIT_VCMSubmenuId, {
	group: '1_vcm',
	command: { id: 'chiara.statistics.vcm.bcv', precondition: ContextKeyExpr.false(), title: localize('vcm.bcv', 'Black Constant Volatility')},
	order: 1,
}); // QuantLib.jl

MenuRegistry.appendMenuItem(E_FIT_VCMSubmenuId, {
	group: '1_vcm',
	command: { id: 'chiara.statistics.vcm.cov', precondition: ContextKeyExpr.false(), title: localize('vcm.cov', 'Constant Optionlet Volatility')},
	order: 2,
}); // QuantLib.jl

MenuRegistry.appendMenuItem(E_FIT_VCMSubmenuId, {
	group: '1_vcm',
	command: { id: 'chiara.statistics.vcm.csv', precondition: ContextKeyExpr.false(), title: localize('vcm.csv', 'Constant Swaption Volatility')},
	order: 3,
}); // QuantLib.jl

MenuRegistry.appendMenuItem(E_FIT_VCMSubmenuId, {
	group: '1_vcm',
	command: { id: 'chiara.statistics.vcm.lcv', precondition: ContextKeyExpr.false(), title: localize('vcm.csv', 'Local Constant Volatility')},
	order: 4,
}); // QuantLib.jl


// ============================================
// SUBSUBMENU: DIFFUSION MODELS
// ============================================

MenuRegistry.appendMenuItem(E_FIT_DPSSubmenuId, {
	group: '1_diffusion',
	command: { id: 'chiara.statistics.dm.sg', precondition: ContextKeyExpr.false(), title: localize('risk.psg', 'Stochastic Generation') },
	order: 1,
}); // EconomicScenarioGenerators.jl

MenuRegistry.appendMenuItem(E_FIT_DPSSubmenuId, {
	group: '2_diffusion',
	command: { id: 'chiara.statistics.dm.abm', precondition: ContextKeyExpr.false(), title: localize('dm.bs', 'Brownian Motion') },
	order: 1,
}); // QuantLib.jl

MenuRegistry.appendMenuItem(E_FIT_DPSSubmenuId, {
	group: '2_diffusion',
	command: { id: 'chiara.statistics.dm.cev', precondition: ContextKeyExpr.false(), title: localize('dm.cev', 'Constant Elasticity of Variance (CEV)') },
	order: 2,
});

MenuRegistry.appendMenuItem(E_FIT_DPSSubmenuId, {
	group: '2_diffusion',
	command: { id: 'chiara.statistics.dm.dupire', precondition: ContextKeyExpr.false(), title: localize('dm.dupire', 'Dupire Local Volatility Framework') },
	order: 3,
});

MenuRegistry.appendMenuItem(E_FIT_DPSSubmenuId, {
	group: '3_diffusion',
	command: { id: 'chiara.statistics.dm.heston', title: localize('dm.heston', 'Heston Model') },
	order: 1,
});  // QuantLib.jl


// ============================================
// SUBSUBMENU: JUMP-DIFFUSION MODELS
// ============================================

MenuRegistry.appendMenuItem(E_FIT_JDMSubmenuId, {
	group: '1_jump',
	command: { id: 'chiara.statistics.jdm.merton', precondition: ContextKeyExpr.false(), title: localize('jps.merton', 'Merton') },
	order: 1,
});

MenuRegistry.appendMenuItem(E_FIT_JDMSubmenuId, {
	group: '1_jump',
	command: { id: 'chiara.statistics.jdm.kou', precondition: ContextKeyExpr.false(), title: localize('jps.kou', 'Kou Double-Exponential') },
	order: 2,
});

MenuRegistry.appendMenuItem(E_FIT_JDMSubmenuId, {
	group: '2_jump',
	command: { id: 'chiara.statistics.jdm.bates', title: localize('jps.bates', 'Bates Model') },
	order: 1,
});  // QuantLib.jl


// ============================================
// SUBSUBMENU: PURE JUMP MODELS
// ============================================

MenuRegistry.appendMenuItem(E_FIT_PJMSubmenuId, {
	group: '1_purejump',
	command: { id: 'chiara.statistics.pjm.vgm', precondition: ContextKeyExpr.false(), title: localize('pjm.vgm', 'Variance Gamma') },
	order: 1,
});

MenuRegistry.appendMenuItem(E_FIT_PJMSubmenuId, {
	group: '1_purejump',
	command: { id: 'chiara.statistics.pjm.nigm', precondition: ContextKeyExpr.false(), title: localize('pjm.nigm', 'Normal Inverse Gaussian') },
	order: 2,
});

MenuRegistry.appendMenuItem(E_FIT_PJMSubmenuId, {
	group: '1_purejump',
	command: { id: 'chiara.statistics.pjm.cgny', precondition: ContextKeyExpr.false(), title: localize('pjm.cgny', 'Carr-Geman-Madan-Yor (CGMY)') },
	order: 3,
});


// ============================================
// SUBSUBMENU: INTEREST RATE MODELS
// ============================================

MenuRegistry.appendMenuItem(E_FIT_IRMSubmenuId, {
	group: '1_short',
	command: { id: 'chiara.statistics.irm.vasicek', precondition: ContextKeyExpr.false(), title: localize('irm.vasicek', 'Vasicek') },
	order: 1,
}); // FinanceModels.jl

MenuRegistry.appendMenuItem(E_FIT_IRMSubmenuId, {
	group: '1_short',
	command: { id: 'chiara.statistics.irm.gsr', precondition: ContextKeyExpr.false(), title: localize('irm.gsr', 'Gaussian Short Rate (GSR)') },
	order: 2,
}); // QuantLib.jl

MenuRegistry.appendMenuItem(E_FIT_IRMSubmenuId, {
	group: '1_short',
	command: { id: 'chiara.statistics.irm.cir', precondition: ContextKeyExpr.false(), title: localize('irm.cir', 'Cox-Ingersoll-Ross (CIR)') },
	order: 3,
}); // FinanceModels.jl

MenuRegistry.appendMenuItem(E_FIT_IRMSubmenuId, {
	group: '1_short',
	command: { id: 'chiara.statistics.irm.hw', precondition: ContextKeyExpr.false(), title: localize('irm.hw', 'Hull-White') },
	order: 4,
}); // QuantLib.jl, FinanceModels.jl

MenuRegistry.appendMenuItem(E_FIT_IRMSubmenuId, {
	group: '1_short',
	command: { id: 'chiara.statistics.irm.bk', precondition: ContextKeyExpr.false(), title: localize('irm.bk', 'Black-Karasinski') },
	order: 5,
}); // QuantLib.jl

MenuRegistry.appendMenuItem(E_FIT_IRMSubmenuId, {
	group: '2_forward',
	command: { id: 'chiara.statistics.irm.sabr', title: localize('irm.sabr', 'SABR') },
	order: 1,
}); // QuantLib Python, pySABR, FER R, sabr R

MenuRegistry.appendMenuItem(E_FIT_IRMSubmenuId, {
	group: '2_forward',
	command: { id: 'chiara.statistics.irm.bgm', precondition: ContextKeyExpr.false(), title: localize('irm.bgm', 'Brace-Gatarek-Musiela (Market Model)') },
	order: 2,
});  // Google tf-quant-finance (Python)

MenuRegistry.appendMenuItem(E_FIT_IRMSubmenuId, {
	group: '2_forward',
	command: { id: 'chiara.statistics.irm.hjm', precondition: ContextKeyExpr.false(), title: localize('irm.hjm', 'Heath-Jarrow-Morton (HJM) Framework') },
	order: 3,
});  // Google tf-quant-finance (Python)


// ===================================================
// SUBMENU: RISK MANAGEMENT TOOLBOX
// ===================================================

MenuRegistry.appendMenuItem(E_RMTSubmenuId, {
	group: '1_lrm',
	command: { id: 'chiara.statistics.rmt.lrm', title: localize('rmt.lrm', 'Measures of Loss Risk') },
	order: 1,
}); // ActuaryUtilities.jl

MenuRegistry.appendMenuItem(E_RMTSubmenuId, {
	group: '1_lrm',
	command: { id: 'chiara.statistics.rmt.etl', precondition: ContextKeyExpr.false(), title: localize('rmt.etl', 'Tail Risk Simulation') },
	order: 2,
}); // TailRiskScenGen.jl (scenario generation for stochastic programs with tail risk measure)

MenuRegistry.appendMenuItem(E_RMTSubmenuId, {
	group: '2_rmt',
	command: { id: EXPL_COMMAND_ID, precondition: ContextKeyExpr.false(), title: localize('rmt.st', 'Stress Testing') },
	order: 1,
});

MenuRegistry.appendMenuItem(E_RMTSubmenuId, {
	group: '2_rmt',
	command: { id: EXPL_COMMAND_ID, precondition: ContextKeyExpr.false(), title: localize('rmt.ps', 'Market Portfolio Risk Simulation') },
	order: 2,
}); // PortfolioAnalytics.jl, OnlinePortfolioAnalytics.jl

MenuRegistry.appendMenuItem(E_RMTSubmenuId, {
	group: '2_rmt',
	command: { id: EXPL_COMMAND_ID, precondition: ContextKeyExpr.false(), title: localize('rmt.crs', 'Credit Portfolio Risk Simulation') },
	order: 3,
});

MenuRegistry.appendMenuItem(E_RMTSubmenuId, {
	group: '2_rmt',
	command: { id: EXPL_COMMAND_ID, precondition: ContextKeyExpr.false(), title: localize('rmt.crs', 'Valuation Adjustments and Counterparty Credit Risk Simulation') },
	order: 4,
}); // DiffFusion.jl

MenuRegistry.appendMenuItem(E_RMTSubmenuId, {
	group: '3_evre',
	submenu: EVSubmenuId,
	title: localize('showStatistics.ev', 'Extreme Value and Rare Events'),
	order: 1,
});

// ===================================================
// SUBMENU: BUSINESS ADVANTAGE TOOLBOX
// Covers competitive intelligence, counterparty research,
// valuation, credit, fiscal/regulatory, and strategic decisions
// in a potentially international setting.
// Key: Julia where strong (optimisation, probabilistic, time-series);
//      Python via PythonCall where dominant (NLP, scraping, ML scoring).
// ===================================================

// ── Market and Competitive Intelligence ──────────────────────────────

MenuRegistry.appendMenuItem(E_BATSubmenuId, {
	group: '1_bat',
	command: { id: EXPL_COMMAND_ID, precondition: ContextKeyExpr.false(), title: localize('bat.competitive', 'Competitive Landscape Analysis') },
	order: 1,
}); // Python via PythonCall → newspaper3k, requests, BeautifulSoup; Julia: HTTP.jl

MenuRegistry.appendMenuItem(E_BATSubmenuId, {
	group: '1_bat',
	command: { id: EXPL_COMMAND_ID, precondition: ContextKeyExpr.false(), title: localize('bat.marketsizing', 'Market Sizing and Segmentation') },
	order: 2,
}); // Julia: Clustering.jl, Statistics.jl; Python via PythonCall → scikit-learn

MenuRegistry.appendMenuItem(E_BATSubmenuId, {
	group: '1_bat',
	command: { id: EXPL_COMMAND_ID, precondition: ContextKeyExpr.false(), title: localize('bat.sentiment', 'Consumer Sentiment Monitoring') },
	order: 3,
}); // Python via PythonCall → Transformers, VADER, BERTopic

MenuRegistry.appendMenuItem(E_BATSubmenuId, {
	group: '1_bat',
	command: { id: EXPL_COMMAND_ID, precondition: ContextKeyExpr.false(), title: localize('bat.reputation', 'Brand and Reputation Tracking') },
	order: 4,
}); // Python via PythonCall → Transformers, VADER; Julia: TextAnalysis.jl

MenuRegistry.appendMenuItem(E_BATSubmenuId, {
	group: '1_bat',
	command: { id: EXPL_COMMAND_ID, precondition: ContextKeyExpr.false(), title: localize('bat.patent', 'Patent and Innovation Intelligence') },
	order: 5,
}); // Julia: HTTP.jl (PatentsView API, EPO OPS API); Python via PythonCall → patent-client

// ── Company and Counterparty Research ────────────────────────────────

MenuRegistry.appendMenuItem(E_BATSubmenuId, {
	group: '2_bat',
	command: { id: EXPL_COMMAND_ID, precondition: ContextKeyExpr.false(), title: localize('bat.profile', 'Company Financial Profiling') },
	order: 1,
}); // Julia: HTTP.jl (OpenCorporates, Companies House, GLEIF); Python via PythonCall → requests

MenuRegistry.appendMenuItem(E_BATSubmenuId, {
	group: '2_bat',
	command: { id: EXPL_COMMAND_ID, precondition: ContextKeyExpr.false(), title: localize('bat.duediligence', 'Supplier and Client Due Diligence') },
	order: 2,
}); // Julia: HTTP.jl; Python via PythonCall → requests (OpenSanctions, World-Check APIs)

MenuRegistry.appendMenuItem(E_BATSubmenuId, {
	group: '2_bat',
	command: { id: EXPL_COMMAND_ID, precondition: ContextKeyExpr.false(), title: localize('bat.ownership', 'Ownership and Corporate Structure') },
	order: 3,
}); // Julia: Graphs.jl, MetaGraphs.jl (beneficial ownership graphs); Python via PythonCall → networkx

MenuRegistry.appendMenuItem(E_BATSubmenuId, {
	group: '2_bat',
	command: { id: EXPL_COMMAND_ID, precondition: ContextKeyExpr.false(), title: localize('bat.sanctions', 'Sanctions and Watchlist Screening') },
	order: 4,
}); // Julia: HTTP.jl (OpenSanctions API, OFAC, EU Consolidated List)

// ── Valuation and Credit ──────────────────────────────────────────────

MenuRegistry.appendMenuItem(E_BATSubmenuId, {
	group: '3_bat',
	command: { id: EXPL_COMMAND_ID, precondition: ContextKeyExpr.false(), title: localize('bat.valuation', 'Business Valuation') },
	order: 1,
}); // Julia: JuMP.jl (DCF, LBO optimisation), Turing.jl (Bayesian valuation)

MenuRegistry.appendMenuItem(E_BATSubmenuId, {
	group: '3_bat',
	command: { id: EXPL_COMMAND_ID, precondition: ContextKeyExpr.false(), title: localize('bat.creditscoring', 'Credit Scoring') },
	order: 2,
}); // Julia: MLJ.jl; Python via PythonCall → scikit-learn, LightGBM, XGBoost

MenuRegistry.appendMenuItem(E_BATSubmenuId, {
	group: '3_bat',
	command: { id: EXPL_COMMAND_ID, precondition: ContextKeyExpr.false(), title: localize('bat.defaultprob', 'Default Probability Estimation') },
	order: 3,
}); // Julia: Turing.jl (structural and reduced-form models); Python via PythonCall → scikit-learn

MenuRegistry.appendMenuItem(E_BATSubmenuId, {
	group: '3_bat',
	command: { id: EXPL_COMMAND_ID, precondition: ContextKeyExpr.false(), title: localize('bat.cashflow', 'Cash Flow Forecasting') },
	order: 4,
}); // Julia: Turing.jl, DifferentialEquations.jl, StateSpaceModels.jl

// ── Fiscal, Tax and Regulatory ────────────────────────────────────────

MenuRegistry.appendMenuItem(E_BATSubmenuId, {
	group: '4_bat',
	command: { id: EXPL_COMMAND_ID, precondition: ContextKeyExpr.false(), title: localize('bat.fiscalopt', 'Fiscal Optimisation') },
	order: 1,
}); // Julia: JuMP.jl (tax-constrained optimisation, transfer pricing)

MenuRegistry.appendMenuItem(E_BATSubmenuId, {
	group: '4_bat',
	command: { id: EXPL_COMMAND_ID, precondition: ContextKeyExpr.false(), title: localize('bat.transferpricing', 'Transfer Pricing Analysis') },
	order: 2,
}); // Julia: JuMP.jl, Statistics.jl; Python via PythonCall → pandas

MenuRegistry.appendMenuItem(E_BATSubmenuId, {
	group: '4_bat',
	command: { id: EXPL_COMMAND_ID, precondition: ContextKeyExpr.false(), title: localize('bat.regconstraints', 'Regulatory Constraint Mapping') },
	order: 3,
}); // Python via PythonCall → spaCy, Transformers; Julia: Graphs.jl

MenuRegistry.appendMenuItem(E_BATSubmenuId, {
	group: '4_bat',
	command: { id: EXPL_COMMAND_ID, precondition: ContextKeyExpr.false(), title: localize('bat.intltax', 'International Tax and Treaty Analysis') },
	order: 4,
}); // Julia: HTTP.jl (IBFD, OECD BEPS data); Python via PythonCall → requests, spaCy

// ── Operational and Strategic Decisions ──────────────────────────────

MenuRegistry.appendMenuItem(E_BATSubmenuId, {
	group: '5_bat',
	command: { id: EXPL_COMMAND_ID, precondition: ContextKeyExpr.false(), title: localize('bat.supplychain', 'Supply Chain Optimisation') },
	order: 1,
}); // Julia: JuMP.jl, Graphs.jl, HiGHS.jl

MenuRegistry.appendMenuItem(E_BATSubmenuId, {
	group: '5_bat',
	command: { id: EXPL_COMMAND_ID, precondition: ContextKeyExpr.false(), title: localize('bat.pricing', 'Pricing and Revenue Optimisation') },
	order: 2,
}); // Julia: JuMP.jl, Turing.jl (Bayesian demand models)

MenuRegistry.appendMenuItem(E_BATSubmenuId, {
	group: '5_bat',
	command: { id: EXPL_COMMAND_ID, precondition: ContextKeyExpr.false(), title: localize('bat.marketentry', 'Location and Market Entry Analysis') },
	order: 3,
}); // Julia: GeoStats.jl, JuMP.jl; Python via PythonCall → geopandas, scikit-learn

MenuRegistry.appendMenuItem(E_BATSubmenuId, {
	group: '5_bat',
	command: { id: EXPL_COMMAND_ID, precondition: ContextKeyExpr.false(), title: localize('bat.rdintel', 'R&D and Technology Intelligence') },
	order: 4,
}); // Julia: HTTP.jl (PatentsView, Semantic Scholar APIs); Python via PythonCall → patent-client, requests

MenuRegistry.appendMenuItem(E_BATSubmenuId, {
	group: '5_bat',
	command: { id: EXPL_COMMAND_ID, precondition: ContextKeyExpr.false(), title: localize('bat.scenario', 'Scenario Planning and Stress Testing') },
	order: 5,
}); // Julia: Turing.jl, DifferentialEquations.jl, MonteCarloMeasurements.jl


// ===================================================
// SUBMENU: SOUND OF MUSIC TOOLBOX
// ===================================================

MenuRegistry.appendMenuItem(E_SMTSubmenuId, {
	group: '1_smt',
	submenu: MLIBSubmenuId,
	title: localize('smt.lib', 'Music Libraries'),
	order: 1,
});

MenuRegistry.appendMenuItem(MLIBSubmenuId, {
	group: '1_smt',
		command: { id: 'smt.lib.imslp',  precondition: ContextKeyExpr.false(), title: localize('lib.imslp', 'IMSLP-Petrucchi'),
	},
	order: 1,
});

MenuRegistry.appendMenuItem(MLIBSubmenuId, {
	group: '1_conn',
	command: {
		id: 'smt.lib.xml', precondition: ContextKeyExpr.false(),
		title: localize('lib.xml', 'MusicXML'),
	},
	order: 2,
});  // MusicXML.jl
//  Industry standard for sharing interactive sheet music between different software platforms. It preserves the layout, notes, and instructions of a traditional score

MenuRegistry.appendMenuItem(MLIBSubmenuId, {
	group: '1_conn',
	command: {
		id: 'smt.lib.midi', precondition: ContextKeyExpr.false(),
		title: localize('lib.midi', 'MIDI Files'),
	},
	order: 3,
});  // MIDI.jl


MenuRegistry.appendMenuItem(E_SMTSubmenuId, {
	group: '1_smt',
		command: { id: 'chiara.smt.mozart',
		title: localize('smt.midi', 'MIDI Player'),
	},
	order: 2,
});  // Mplay.jl

MenuRegistry.appendMenuItem(E_SMTSubmenuId, {
	group: '2_smt',
	command: { id: EXPL_COMMAND_ID, precondition: ContextKeyExpr.false(), title: localize('smt.score', 'Score Engraving') },
	order: 1,
}); // MusicXML.jl, LilyPond (via shell)

MenuRegistry.appendMenuItem(E_SMTSubmenuId, {
	group: '2_smt',
	command: { id: EXPL_COMMAND_ID, precondition: ContextKeyExpr.false(), title: localize('smt.chord', 'Chord Detection and Harmony Analysis') },
	order: 2,
}); // DSP.jl, FFTW.jl

MenuRegistry.appendMenuItem(E_SMTSubmenuId, {
	group: '2_smt',
	command: { id: EXPL_COMMAND_ID, precondition: ContextKeyExpr.false(), title: localize('smt.features', 'Audio Feature Extraction') },
	order: 3,
}); // DSP.jl, FFTW.jl, PortAudio.jl

MenuRegistry.appendMenuItem(E_SMTSubmenuId, {
	group: '2_smt',
	command: { id: EXPL_COMMAND_ID, precondition: ContextKeyExpr.false(), title: localize('smt.melody', 'Melody Transcription') },
	order: 4,
}); // DSP.jl, FFTW.jl

MenuRegistry.appendMenuItem(E_SMTSubmenuId, {
	group: '2_smt',
	command: { id: EXPL_COMMAND_ID, precondition: ContextKeyExpr.false(), title: localize('smt.rhythm', 'Rhythm and Beat Tracking') },
	order: 5,
}); // DSP.jl

MenuRegistry.appendMenuItem(E_SMTSubmenuId, {
	group: '2_smt',
	command: { id: EXPL_COMMAND_ID, precondition: ContextKeyExpr.false(), title: localize('smt.synth', 'Sound Synthesis and Generation') },
	order: 6,
}); // PortAudio.jl, SampledSignals.jl

MenuRegistry.appendMenuItem(E_SMTSubmenuId, {
	group: '2_smt',
	command: { id: EXPL_COMMAND_ID, precondition: ContextKeyExpr.false(), title: localize('smt.genre', 'Music Genre Classification') },
	order: 7,
}); // Flux.jl, DSP.jl

MenuRegistry.appendMenuItem(E_SMTSubmenuId, {
	group: '3_smt',
	command: {
		id: EXPL_COMMAND_ID, precondition: ContextKeyExpr.false(),
		title: localize('ds.mml', 'Mozart Music Library'),
	},
	order: 1,
});

MenuRegistry.appendMenuItem(E_SMTSubmenuId, {
	group: '3_smt',
	command: {
		id: EXPL_COMMAND_ID, precondition: ContextKeyExpr.false(),
		title: localize('ds.bml', 'Beethoven Music Library'),
	},
	order: 2,
});

MenuRegistry.appendMenuItem(E_SMTSubmenuId, {
	group: '3_smt',
	command: {
		id: EXPL_COMMAND_ID, precondition: ContextKeyExpr.false(),
		title: localize('ds.sml', 'Schubert Music Library'),
	},
	order: 3,
});



// ===================================================
// SUBMENU: SOUND OF VOICE TOOLBOX
// ===================================================

MenuRegistry.appendMenuItem(E_SVTSubmenuId, {
	group: '1_svt',
	command: { id: EXPL_COMMAND_ID, precondition: ContextKeyExpr.false(), title: localize('svt.waveform', 'Audio Waveform Analysis') },
	order: 1,
}); // DSP.jl, FFTW.jl, PortAudio.jl

MenuRegistry.appendMenuItem(E_SVTSubmenuId, {
	group: '1_svt',
	command: { id: EXPL_COMMAND_ID, precondition: ContextKeyExpr.false(), title: localize('svt.vad', 'Voice Activity Detection') },
	order: 2,
}); // SampledSignals.jl, DSP.jl

MenuRegistry.appendMenuItem(E_SVTSubmenuId, {
	group: '1_svt',
	command: { id: EXPL_COMMAND_ID, precondition: ContextKeyExpr.false(), title: localize('svt.pitch', 'Pitch and Formant Analysis') },
	order: 3,
}); // DSP.jl, FFTW.jl, SampledSignals.jl

MenuRegistry.appendMenuItem(E_SVTSubmenuId, {
	group: '1_svt',
	command: { id: EXPL_COMMAND_ID, precondition: ContextKeyExpr.false(), title: localize('svt.prosody', 'Prosody Analysis') },
	order: 4,
}); // DSP.jl, SampledSignals.jl

MenuRegistry.appendMenuItem(E_SVTSubmenuId, {
	group: '1_svt',
	command: { id: EXPL_COMMAND_ID, precondition: ContextKeyExpr.false(), title: localize('svt.speaker', 'Speaker Identification') },
	order: 5,
}); // Flux.jl

MenuRegistry.appendMenuItem(E_SVTSubmenuId, {
	group: '2_svt',
		command: { id: 'chiara.svt.',
		title: localize('svt.ab', 'Audio Books'),
	},
	order: 2,
});

MenuRegistry.appendMenuItem(E_SVTSubmenuId, {
	group: '2_svt',
		command: { id: 'chiara.svt.',
		title: localize('svt.sp', 'Playing Shakespeare'),
	},
	order: 1,
}); // https://blobs.duckdb.org/data/shakespeare.parquet
// Full-text index of Shakespeare's plays

MenuRegistry.appendMenuItem(E_SVTSubmenuId, {
	group: '3_svt',
	command: { id: EXPL_COMMAND_ID, precondition: ContextKeyExpr.false(), title: localize('svt.asr', 'Audio Speech Recognition') },
	order: 1,
}); // Whisper.jl, SpeechRecognition.jl, Gemma 4 12B

MenuRegistry.appendMenuItem(E_SVTSubmenuId, {
	group: '3_svt',
	command: { id: EXPL_COMMAND_ID, precondition: ContextKeyExpr.false(), title: localize('svt.ast', 'Automatic Speech Translation') },
	order: 2,
}); // Whisper.jl, SpeechRecognition.jl, Gemma 4 12B

MenuRegistry.appendMenuItem(E_SVTSubmenuId, {
	group: '3_svt',
	command: { id: EXPL_COMMAND_ID, precondition: ContextKeyExpr.false(), title: localize('svt.tts', 'Text-to-Speech Synthesis') },
	order: 3,
}); // Transformers.jl (via HuggingFace)

MenuRegistry.appendMenuItem(E_SVTSubmenuId, {
	group: '4_svt',
		command: { id: 'chiara.svt.',
		title: localize('svt.lieder', 'Songs'),
	},
	order: 1,
});

MenuRegistry.appendMenuItem(E_SVTSubmenuId, {
	group: '4_svt',
		command: { id: 'chiara.svt.',
		title: localize('svt.cp', 'Choral Pieces'),
	},
	order: 2,
});

MenuRegistry.appendMenuItem(E_SVTSubmenuId, {
	group: '4_svt',
		command: { id: 'chiara.svt.',
		title: localize('svt.opera', 'Opera'),
	},
	order: 3,
});

// ===================================================
// SUBMENU: LITERATURE TOOLBOX
// ===================================================

MenuRegistry.appendMenuItem(E_LTSubmenuId, {
	group: '1_lt',
	command: { id: EXPL_COMMAND_ID, precondition: ContextKeyExpr.false(), title: localize('lt.tokenise', 'Text Tokenisation and Normalisation') },
	order: 1,
}); // TextAnalysis.jl, Languages.jl

MenuRegistry.appendMenuItem(E_LTSubmenuId, {
	group: '1_lt',
	command: { id: EXPL_COMMAND_ID, precondition: ContextKeyExpr.false(), title: localize('lt.ner', 'Named Entity Recognition') },
	order: 2,
}); // TextAnalysis.jl, Transformers.jl

MenuRegistry.appendMenuItem(E_LTSubmenuId, {
	group: '1_lt',
	command: { id: EXPL_COMMAND_ID, precondition: ContextKeyExpr.false(), title: localize('lt.sentiment', 'Sentiment Analysis') },
	order: 3,
}); // TextAnalysis.jl, Flux.jl

MenuRegistry.appendMenuItem(E_LTSubmenuId, {
	group: '1_lt',
	command: { id: EXPL_COMMAND_ID, precondition: ContextKeyExpr.false(), title: localize('lt.keywords', 'Keyword and Keyphrase Extraction') },
	order: 4,
}); // TextAnalysis.jl

MenuRegistry.appendMenuItem(E_LTSubmenuId, {
	group: '2_lt',
	command: { id: EXPL_COMMAND_ID, precondition: ContextKeyExpr.false(), title: localize('lt.similarity', 'Text Similarity and Distance') },
	order: 1,
}); // StringDistances.jl, TextAnalysis.jl

MenuRegistry.appendMenuItem(E_LTSubmenuId, {
	group: '2_lt',
	command: { id: EXPL_COMMAND_ID, precondition: ContextKeyExpr.false(), title: localize('lt.langdetect', 'Language Detection') },
	order: 2,
}); // Languages.jl

MenuRegistry.appendMenuItem(E_LTSubmenuId, {
	group: '2_lt',
	command: { id: EXPL_COMMAND_ID, precondition: ContextKeyExpr.false(), title: localize('lt.readability', 'Readability Scoring') },
	order: 3,
}); // TextAnalysis.jl

MenuRegistry.appendMenuItem(E_LTSubmenuId, {
	group: '2_lt',
	command: { id: EXPL_COMMAND_ID, precondition: ContextKeyExpr.false(), title: localize('lt.stylometry', 'Stylometric Analysis') },
	order: 4,
}); // TextAnalysis.jl, Statistics.jl

MenuRegistry.appendMenuItem(E_LTSubmenuId, {
	group: '3_lt',
	command: { id: EXPL_COMMAND_ID, precondition: ContextKeyExpr.false(), title: localize('lt.concordance', 'Concordance and Collocation') },
	order: 1,
}); // TextAnalysis.jl

MenuRegistry.appendMenuItem(E_LTSubmenuId, {
	group: '3_lt',
	command: { id: EXPL_COMMAND_ID, precondition: ContextKeyExpr.false(), title: localize('lt.corpus', 'Corpus Building and Management') },
	order: 2,
}); // TextAnalysis.jl, Corpus.jl

MenuRegistry.appendMenuItem(E_LTSubmenuId, {
	group: '3_lt',
	command: { id: EXPL_COMMAND_ID, precondition: ContextKeyExpr.false(), title: localize('lt.translate', 'Text Translation') },
	order: 3,
}); // Transformers.jl (via HuggingFace multilingual models)


MenuRegistry.appendMenuItem(E_LTSubmenuId, {
	group: '4_lt',
	command: {
		id: EXPL_COMMAND_ID, precondition: ContextKeyExpr.false(),
		title: localize('ds.hio', 'Homer Canon'),
	},
	order: 1,
}); // The Chicago Homer is a bilingual database of the Iliad and Odyssey as well as the poems of Hesiod and the Homeric Hymns.

MenuRegistry.appendMenuItem(E_LTSubmenuId, {
	group: '4_lt',
	command: {
		id: EXPL_COMMAND_ID, precondition: ContextKeyExpr.false(),
		title: localize('ds.cgt', 'Classic Greek Theater'),
	},
	order: 2,
});

MenuRegistry.appendMenuItem(E_LTSubmenuId, {
	group: '4_lt',
	command: {
		id: EXPL_COMMAND_ID, precondition: ContextKeyExpr.false(),
		title: localize('ds.pd', 'Plato Dialogs'),
	},
	order: 3,
});

MenuRegistry.appendMenuItem(E_LTSubmenuId, {
	group: '4_lt',
	command: {
		id: EXPL_COMMAND_ID, precondition: ContextKeyExpr.false(),
		title: localize('ds.cw', 'Cicero Works'),
	},
	order: 4,
});

MenuRegistry.appendMenuItem(E_LTSubmenuId, {
	group: '4_lt',
	command: {
		id: EXPL_COMMAND_ID, precondition: ContextKeyExpr.false(),
		title: localize('ds.ca', 'Confucius Anaclets'),
	},
	order: 5,
});

MenuRegistry.appendMenuItem(E_LTSubmenuId, {
	group: '4_lt',
	command: {
		id: EXPL_COMMAND_ID, precondition: ContextKeyExpr.false(),
		title: localize('ds.sc', 'Shakespeare Plays and Sonnets'),
	},
	order: 6,
}); // https://blobs.duckdb.org/data/shakespeare.parquet
// Full-text index of Shakespeare's plays


// ===================================================
// SUBMENU: ART TOOLBOX
// ===================================================

MenuRegistry.appendMenuItem(E_ARTTSubmenuId, {
	group: '1_art',
	command: { id: EXPL_COMMAND_ID, precondition: ContextKeyExpr.false(), title: localize('art.load', 'Image Loading and Display') },
	order: 1,
}); // Images.jl, ImageIO.jl, FileIO.jl

MenuRegistry.appendMenuItem(E_ARTTSubmenuId, {
	group: '1_art',
	command: { id: EXPL_COMMAND_ID, precondition: ContextKeyExpr.false(), title: localize('art.palette', 'Colour Palette Extraction') },
	order: 2,
}); // Colors.jl, ImageSegmentation.jl, Clustering.jl

MenuRegistry.appendMenuItem(E_ARTTSubmenuId, {
	group: '1_art',
	command: { id: EXPL_COMMAND_ID, precondition: ContextKeyExpr.false(), title: localize('art.edge', 'Edge and Feature Detection') },
	order: 3,
}); // ImageFiltering.jl, ImageEdgeDetection.jl

MenuRegistry.appendMenuItem(E_ARTTSubmenuId, {
	group: '1_art',
	command: { id: EXPL_COMMAND_ID, precondition: ContextKeyExpr.false(), title: localize('art.segment', 'Image Segmentation') },
	order: 4,
}); // ImageSegmentation.jl

MenuRegistry.appendMenuItem(E_ARTTSubmenuId, {
	group: '2_art',
	command: { id: EXPL_COMMAND_ID, precondition: ContextKeyExpr.false(), title: localize('art.style', 'Style Transfer') },
	order: 1,
}); // Flux.jl, Metalhead.jl

MenuRegistry.appendMenuItem(E_ARTTSubmenuId, {
	group: '2_art',
	command: { id: EXPL_COMMAND_ID, precondition: ContextKeyExpr.false(), title: localize('art.gen', 'Generative Art') },
	order: 2,
}); // Makie.jl, Luxor.jl

MenuRegistry.appendMenuItem(E_ARTTSubmenuId, {
	group: '2_art',
	command: { id: EXPL_COMMAND_ID, precondition: ContextKeyExpr.false(), title: localize('art.compress', 'Image Compression and Encoding') },
	order: 3,
}); // ImageIO.jl, CodecZlib.jl

MenuRegistry.appendMenuItem(E_ARTTSubmenuId, {
	group: '3_art',
	command: { id: EXPL_COMMAND_ID, precondition: ContextKeyExpr.false(), title: localize('art.render3d', '3D Mesh and Scene Rendering') },
	order: 1,
}); // Makie.jl, MeshCat.jl, GeometryBasics.jl

MenuRegistry.appendMenuItem(E_ARTTSubmenuId, {
	group: '3_art',
	command: { id: EXPL_COMMAND_ID, precondition: ContextKeyExpr.false(), title: localize('art.fractal', 'Fractals and Algorithmic Art') },
	order: 2,
}); // Makie.jl, Luxor.jl

MenuRegistry.appendMenuItem(E_ARTTSubmenuId, {
	group: '4_art',
	command: {
		id: EXPL_COMMAND_ID, precondition: ContextKeyExpr.false(),
		title: localize('art.dvn', 'Da Vinci Notebooks'),
	},
	order: 1,
});

// ===================================================
// SUBMENU: GEOSCIENCE TOOLBOX
// ===================================================

MenuRegistry.appendMenuItem(E_GEOSubmenuId, {
	group: '1_geo',
	command: { id: EXPL_COMMAND_ID, precondition: ContextKeyExpr.false(), title: localize('geo.load', 'Geospatial Data Loading') },
	order: 1,
}); // Shapefile.jl, GeoJSON.jl, GeoDataFrames.jl, Rasters.jl

MenuRegistry.appendMenuItem(E_GEOSubmenuId, {
	group: '1_geo',
	command: { id: EXPL_COMMAND_ID, precondition: ContextKeyExpr.false(), title: localize('geo.map', 'Map Visualisation') },
	order: 2,
}); // GeoMakie.jl, Tyler.jl

MenuRegistry.appendMenuItem(E_GEOSubmenuId, {
	group: '1_geo',
	command: { id: EXPL_COMMAND_ID, precondition: ContextKeyExpr.false(), title: localize('geo.proj', 'Coordinate Transformations and Projections') },
	order: 3,
}); // Proj.jl, CoordinateTransformations.jl

MenuRegistry.appendMenuItem(E_GEOSubmenuId, {
	group: '1_geo',
	command: { id: EXPL_COMMAND_ID, precondition: ContextKeyExpr.false(), title: localize('geo.index', 'Spatial Indexing') },
	order: 4,
}); // LibSpatialIndex.jl, NearestNeighbors.jl

MenuRegistry.appendMenuItem(E_GEOSubmenuId, {
	group: '2_geo',
	command: { id: EXPL_COMMAND_ID, precondition: ContextKeyExpr.false(), title: localize('geo.stats', 'Spatial Statistics and Kriging') },
	order: 1,
}); // GeoStats.jl

MenuRegistry.appendMenuItem(E_GEOSubmenuId, {
	group: '2_geo',
	command: { id: EXPL_COMMAND_ID, precondition: ContextKeyExpr.false(), title: localize('geo.raster', 'Raster Analysis') },
	order: 2,
}); // Rasters.jl

MenuRegistry.appendMenuItem(E_GEOSubmenuId, {
	group: '2_geo',
	command: { id: EXPL_COMMAND_ID, precondition: ContextKeyExpr.false(), title: localize('geo.route', 'Route and Network Analysis') },
	order: 3,
}); // Graphs.jl, OpenStreetMapX.jl

MenuRegistry.appendMenuItem(E_GEOSubmenuId, {
	group: '2_geo',
	command: { id: EXPL_COMMAND_ID, precondition: ContextKeyExpr.false(), title: localize('geo.remote', 'Remote Sensing') },
	order: 4,
}); // Rasters.jl, ArchGDAL.jl

MenuRegistry.appendMenuItem(E_GEOSubmenuId, {
	group: '3_geo',
	command: { id: EXPL_COMMAND_ID, precondition: ContextKeyExpr.false(), title: localize('geo.pointcloud', 'Point Cloud Processing') },
	order: 1,
}); // LASDatasets.jl, GeometryBasics.jl

MenuRegistry.appendMenuItem(E_GEOSubmenuId, {
	group: '3_geo',
	command: { id: EXPL_COMMAND_ID, precondition: ContextKeyExpr.false(), title: localize('geo.elevation', 'Digital Elevation Models') },
	order: 2,
}); // Rasters.jl, GMT.jl

// ── Climate Science ───────────────────────────────────────────────────

MenuRegistry.appendMenuItem(E_GEOSubmenuId, {
	group: '4_geo',
	command: { id: EXPL_COMMAND_ID, precondition: ContextKeyExpr.false(), title: localize('geo.climdata', 'Climate Data Access and Download') },
	order: 1,
}); // Python via PythonCall → cdsapi (Copernicus / ERA5, CMIP6); Julia: HTTP.jl, NCDatasets.jl

MenuRegistry.appendMenuItem(E_GEOSubmenuId, {
	group: '4_geo',
	command: { id: EXPL_COMMAND_ID, precondition: ContextKeyExpr.false(), title: localize('geo.atmosphere', 'Atmospheric Analysis') },
	order: 2,
}); // Julia: ClimateBase.jl, YAXArrays.jl, NCDatasets.jl

MenuRegistry.appendMenuItem(E_GEOSubmenuId, {
	group: '4_geo',
	command: { id: EXPL_COMMAND_ID, precondition: ContextKeyExpr.false(), title: localize('geo.ocean', 'Ocean and Sea Surface Analysis') },
	order: 3,
}); // Julia: NCDatasets.jl, Rasters.jl, OceanBasins.jl

MenuRegistry.appendMenuItem(E_GEOSubmenuId, {
	group: '4_geo',
	command: { id: EXPL_COMMAND_ID, precondition: ContextKeyExpr.false(), title: localize('geo.indices', 'Climate Indices and Teleconnections') },
	order: 4,
}); // Julia: ClimateBase.jl (ENSO, NAO, PDO, AMO indices)

MenuRegistry.appendMenuItem(E_GEOSubmenuId, {
	group: '4_geo',
	command: { id: EXPL_COMMAND_ID, precondition: ContextKeyExpr.false(), title: localize('geo.extreme', 'Extreme Weather Event Analysis') },
	order: 5,
}); // Julia: Extremes.jl, Distributions.jl, ClimateBase.jl

MenuRegistry.appendMenuItem(E_GEOSubmenuId, {
	group: '4_geo',
	command: { id: EXPL_COMMAND_ID, precondition: ContextKeyExpr.false(), title: localize('geo.projection', 'Climate Change Projections') },
	order: 6,
}); // Julia: ClimateBase.jl, YAXArrays.jl; Python via PythonCall → xarray, cdsapi (CMIP6 scenarios)

// ── Earth System Modelling ────────────────────────────────────────────

MenuRegistry.appendMenuItem(E_GEOSubmenuId, {
	group: '5_geo',
	command: { id: EXPL_COMMAND_ID, precondition: ContextKeyExpr.false(), title: localize('geo.ocean_model', 'Ocean Circulation Modelling') },
	order: 1,
}); // Oceananigans.jl — Julia-native, GPU-accelerated; world-class ocean model

MenuRegistry.appendMenuItem(E_GEOSubmenuId, {
	group: '5_geo',
	command: { id: EXPL_COMMAND_ID, precondition: ContextKeyExpr.false(), title: localize('geo.atmos_model', 'Atmospheric Modelling') },
	order: 2,
}); // CliMA Atmos.jl — Julia-native atmospheric component; Python via PythonCall → climlab

MenuRegistry.appendMenuItem(E_GEOSubmenuId, {
	group: '5_geo',
	command: { id: EXPL_COMMAND_ID, precondition: ContextKeyExpr.false(), title: localize('geo.land_model', 'Land Surface Modelling') },
	order: 3,
}); // CliMA Land.jl — Julia-native land surface component; DifferentialEquations.jl

MenuRegistry.appendMenuItem(E_GEOSubmenuId, {
	group: '5_geo',
	command: { id: EXPL_COMMAND_ID, precondition: ContextKeyExpr.false(), title: localize('geo.ice_model', 'Ice Sheet and Glacier Modelling') },
	order: 4,
}); // Julia: DifferentialEquations.jl; Python via PythonCall → icepack, PISM

MenuRegistry.appendMenuItem(E_GEOSubmenuId, {
	group: '5_geo',
	command: { id: EXPL_COMMAND_ID, precondition: ContextKeyExpr.false(), title: localize('geo.carbon', 'Carbon Cycle and Biogeochemistry') },
	order: 5,
}); // Oceananigans.jl (BGC module), DifferentialEquations.jl, CliMA

MenuRegistry.appendMenuItem(E_GEOSubmenuId, {
	group: '5_geo',
	command: { id: EXPL_COMMAND_ID, precondition: ContextKeyExpr.false(), title: localize('geo.esm', 'Coupled Earth System Simulation') },
	order: 6,
}); // CliMA — fully Julia-native coupled atmosphere-ocean-land-ice model


// ===================================================
// SUBMENU: HISTORY TOOLBOX
// ===================================================

MenuRegistry.appendMenuItem(E_HSTSubmenuId, {
	group: '1_hst',
	command: { id: EXPL_COMMAND_ID, precondition: ContextKeyExpr.false(), title: localize('hst.timeline', 'Timeline Visualisation') },
	order: 1,
}); // Makie.jl, Plots.jl, Dates.jl

MenuRegistry.appendMenuItem(E_HSTSubmenuId, {
	group: '1_hst',
	command: { id: EXPL_COMMAND_ID, precondition: ContextKeyExpr.false(), title: localize('hst.network', 'Historical Network Analysis') },
	order: 2,
}); // Graphs.jl, MetaGraphs.jl

MenuRegistry.appendMenuItem(E_HSTSubmenuId, {
	group: '1_hst',
	command: { id: EXPL_COMMAND_ID, precondition: ContextKeyExpr.false(), title: localize('hst.events', 'Event Sequence Analysis') },
	order: 3,
}); // Statistics.jl, Dates.jl

MenuRegistry.appendMenuItem(E_HSTSubmenuId, {
	group: '2_hst',
	command: { id: EXPL_COMMAND_ID, precondition: ContextKeyExpr.false(), title: localize('hst.textmine', 'Chronological Text Mining') },
	order: 1,
}); // TextAnalysis.jl, Dates.jl

MenuRegistry.appendMenuItem(E_HSTSubmenuId, {
	group: '2_hst',
	command: { id: EXPL_COMMAND_ID, precondition: ContextKeyExpr.false(), title: localize('hst.dates', 'Date Parsing and Calendar Conversion') },
	order: 2,
}); // Dates.jl, TimeZones.jl

MenuRegistry.appendMenuItem(E_HSTSubmenuId, {
	group: '2_hst',
	command: { id: EXPL_COMMAND_ID, precondition: ContextKeyExpr.false(), title: localize('hst.genealogy', 'Genealogy Data Processing') },
	order: 3,
}); // Graphs.jl (family trees as DAGs)

MenuRegistry.appendMenuItem(E_HSTSubmenuId, {
	group: '2_hst',
	command: { id: EXPL_COMMAND_ID, precondition: ContextKeyExpr.false(), title: localize('hst.sources', 'Historical Data Sources') },
	order: 4,
}); // DBnomics.jl, WorldBankData.jl (historical series)


// ===================================================
// SUBMENU: NATURAL HISTORY TOOLBOX
// ===================================================

MenuRegistry.appendMenuItem(E_NHSTSubmenuId, {
	group: '1_nhst',
	command: { id: EXPL_COMMAND_ID, precondition: ContextKeyExpr.false(), title: localize('nhst.sdm', 'Species Distribution Modelling') },
	order: 1,
}); // SpeciesDistributionModels.jl, EcoSISTEM.jl

MenuRegistry.appendMenuItem(E_NHSTSubmenuId, {
	group: '1_nhst',
	command: { id: EXPL_COMMAND_ID, precondition: ContextKeyExpr.false(), title: localize('nhst.biodiv', 'Biodiversity Indices') },
	order: 2,
}); // Diversity.jl, EcologicalNetworks.jl

MenuRegistry.appendMenuItem(E_NHSTSubmenuId, {
	group: '1_nhst',
	command: { id: EXPL_COMMAND_ID, precondition: ContextKeyExpr.false(), title: localize('nhst.econet', 'Ecological Network Analysis') },
	order: 3,
}); // EcologicalNetworks.jl, Graphs.jl

MenuRegistry.appendMenuItem(E_NHSTSubmenuId, {
	group: '1_nhst',
	command: { id: EXPL_COMMAND_ID, precondition: ContextKeyExpr.false(), title: localize('nhst.popdyn', 'Population Dynamics') },
	order: 4,
}); // DifferentialEquations.jl, AlgebraicDynamics.jl

MenuRegistry.appendMenuItem(E_NHSTSubmenuId, {
	group: '2_nhst',
	command: { id: EXPL_COMMAND_ID, precondition: ContextKeyExpr.false(), title: localize('nhst.phylo', 'Phylogenetic Analysis') },
	order: 1,
}); // PhyloNetworks.jl, PhyloBio.jl

MenuRegistry.appendMenuItem(E_NHSTSubmenuId, {
	group: '2_nhst',
	command: { id: EXPL_COMMAND_ID, precondition: ContextKeyExpr.false(), title: localize('nhst.climate', 'Climate and Environmental Data') },
	order: 2,
}); // Rasters.jl, NCDatasets.jl, ClimateBase.jl

MenuRegistry.appendMenuItem(E_NHSTSubmenuId, {
	group: '2_nhst',
	command: { id: EXPL_COMMAND_ID, precondition: ContextKeyExpr.false(), title: localize('nhst.taxonomy', 'Specimen and Taxonomy Data') },
	order: 3,
}); // GBIF.jl, NCBITaxonomy.jl


// ---------------------------------------------------


// ===================================================
// SUBMENU: CLINICAL MEDICINE TOOLBOX
// ===================================================

MenuRegistry.appendMenuItem(E_CMTSubmenuId, {
	group: '5_explore',
	submenu: E_ECTSubmenuId,
	title: localize('showStatistics.mt', 'Epidemiology / Public Health'),
	order: 1,
});

// Sub-submenus ---------------------------------------

MenuRegistry.appendMenuItem(E_ECTSubmenuId, {
	group: '1_ect',
	command: { id: 'chiara.statistics.cest', title: localize('ect.cest', 'Epidemiological Inference') },
	order: 1,
}); // Pathogen.jl, Rt-without-renewal

MenuRegistry.appendMenuItem(E_ECTSubmenuId, {
	group: '2_ect',
	command: { id: 'chiara.simulate.epi-comp', title: localize('ect.epi-comp', 'Compartmental Models') },
	order: 2,
}); // DifferentialEquations.jl

MenuRegistry.appendMenuItem(E_ECTSubmenuId, {
	group: '2_ect',
	command: { id: 'chiara.simulate.epi-ude', title: localize('ect.epi-ude', 'Universal Differential Equations for Epidemiology') },
	order: 3,
}); // DiffEqFlux.jl, Lux.jl


// ===================================================
// SUBMENU: PHYSICS TOOLBOX
// ===================================================

MenuRegistry.appendMenuItem(E_PHYTSubmenuId, {
	group: '1_phyt',
	command: { id: EXPL_COMMAND_ID, precondition: ContextKeyExpr.false(), title: localize('phyt.mechanics', 'Classical Mechanics') },
	order: 1,
}); // DifferentialEquations.jl, ModelingToolkit.jl

MenuRegistry.appendMenuItem(E_PHYTSubmenuId, {
	group: '1_phyt',
	command: { id: EXPL_COMMAND_ID, precondition: ContextKeyExpr.false(), title: localize('phyt.thermo', 'Thermodynamics and Statistical Mechanics') },
	order: 2,
}); // Clapeyron.jl, DifferentialEquations.jl

MenuRegistry.appendMenuItem(E_PHYTSubmenuId, {
	group: '1_phyt',
	command: { id: EXPL_COMMAND_ID, precondition: ContextKeyExpr.false(), title: localize('phyt.fluid', 'Fluid Dynamics') },
	order: 3,
}); // Oceananigans.jl, Trixi.jl, WaterLily.jl

MenuRegistry.appendMenuItem(E_PHYTSubmenuId, {
	group: '2_phyt',
	command: { id: EXPL_COMMAND_ID, precondition: ContextKeyExpr.false(), title: localize('phyt.em', 'Electromagnetism') },
	order: 1,
}); // DifferentialEquations.jl, Gridap.jl (Maxwell equations)

MenuRegistry.appendMenuItem(E_PHYTSubmenuId, {
	group: '2_phyt',
	command: { id: EXPL_COMMAND_ID, precondition: ContextKeyExpr.false(), title: localize('phyt.qm', 'Quantum Mechanics') },
	order: 2,
}); // QuantumOptics.jl, WaveOptics.jl

MenuRegistry.appendMenuItem(E_PHYTSubmenuId, {
	group: '2_phyt',
	command: { id: EXPL_COMMAND_ID, precondition: ContextKeyExpr.false(), title: localize('phyt.optics', 'Optics and Photonics') },
	order: 3,
}); // OpticSim.jl, WaveOptics.jl

MenuRegistry.appendMenuItem(E_PHYTSubmenuId, {
	group: '3_phyt',
	command: { id: EXPL_COMMAND_ID, precondition: ContextKeyExpr.false(), title: localize('phyt.qc', 'Quantum Computing') },
	order: 1,
}); // Yao.jl, QuantumClifford.jl, Braket.jl

MenuRegistry.appendMenuItem(E_PHYTSubmenuId, {
	group: '3_phyt',
	command: { id: EXPL_COMMAND_ID, precondition: ContextKeyExpr.false(), title: localize('phyt.particle', 'Particle and High-Energy Physics') },
	order: 2,
}); // ROOT.jl, UnROOT.jl, LorentzVectors.jl

MenuRegistry.appendMenuItem(E_PHYTSubmenuId, {
	group: '3_phyt',
	command: { id: EXPL_COMMAND_ID, precondition: ContextKeyExpr.false(), title: localize('phyt.astro', 'Astrophysics and Cosmology') },
	order: 3,
}); // AstroLib.jl, UnitfulAstro.jl, FITSIO.jl

MenuRegistry.appendMenuItem(E_PHYTSubmenuId, {
	group: '3_phyt',
	command: { id: EXPL_COMMAND_ID, precondition: ContextKeyExpr.false(), title: localize('phyt.nuclear', 'Nuclear Physics') },
	order: 4,
}); // Nuclidea.jl, ENDF.jl


// ===================================================
// SUBMENU: BIOMEDICAL COMPUTING TOOLBOX
// ===================================================

MenuRegistry.appendMenuItem(E_BCTSubmenuId, {
	group: '1_bct',
	command: { id: EXPL_COMMAND_ID, precondition: ContextKeyExpr.false(), title: localize('bct.seqalign', 'Sequence Alignment and Comparison') },
	order: 1,
}); // BioSequences.jl, BioAlignments.jl, FASTX.jl

MenuRegistry.appendMenuItem(E_BCTSubmenuId, {
	group: '1_bct',
	command: { id: EXPL_COMMAND_ID, precondition: ContextKeyExpr.false(), title: localize('bct.genome', 'Genome Assembly and Annotation') },
	order: 2,
}); // GenomicAnnotations.jl, GFF3.jl, BioSequences.jl

MenuRegistry.appendMenuItem(E_BCTSubmenuId, {
	group: '1_bct',
	command: { id: EXPL_COMMAND_ID, precondition: ContextKeyExpr.false(), title: localize('bct.expression', 'Gene Expression Analysis') },
	order: 3,
}); // Bioinformatics.jl, MultivariateStats.jl

MenuRegistry.appendMenuItem(E_BCTSubmenuId, {
	group: '1_bct',
	command: { id: EXPL_COMMAND_ID, precondition: ContextKeyExpr.false(), title: localize('bct.variant', 'Variant Analysis') },
	order: 4,
}); // VariantCallFormat.jl, XAM.jl

MenuRegistry.appendMenuItem(E_BCTSubmenuId, {
	group: '2_bct',
	command: { id: EXPL_COMMAND_ID, precondition: ContextKeyExpr.false(), title: localize('bct.protein', 'Protein Structure Analysis') },
	order: 1,
}); // BioStructures.jl, MIToS.jl

MenuRegistry.appendMenuItem(E_BCTSubmenuId, {
	group: '2_bct',
	command: { id: EXPL_COMMAND_ID, precondition: ContextKeyExpr.false(), title: localize('bct.dti', 'Drug-Target Interaction Prediction') },
	order: 2,
}); // Flux.jl, MolecularGraph.jl

MenuRegistry.appendMenuItem(E_BCTSubmenuId, {
	group: '2_bct',
	command: { id: EXPL_COMMAND_ID, precondition: ContextKeyExpr.false(), title: localize('bct.pathway', 'Pathway and Network Analysis') },
	order: 3,
}); // Graphs.jl, MetaGraphs.jl, BiologicalNetworks.jl

MenuRegistry.appendMenuItem(E_BCTSubmenuId, {
	group: '3_bct',
	command: { id: EXPL_COMMAND_ID, precondition: ContextKeyExpr.false(), title: localize('bct.medimage', 'Medical Image Processing') },
	order: 1,
}); // MedImages.jl, ITKIOWrapper.jl, Images.jl

MenuRegistry.appendMenuItem(E_BCTSubmenuId, {
	group: '3_bct',
	command: { id: EXPL_COMMAND_ID, precondition: ContextKeyExpr.false(), title: localize('bct.clinical', 'Clinical Data Processing') },
	order: 2,
}); // HealthBase.jl, FHIR.jl

MenuRegistry.appendMenuItem(E_BCTSubmenuId, {
	group: '3_bct',
	command: { id: EXPL_COMMAND_ID, precondition: ContextKeyExpr.false(), title: localize('bct.ehr', 'Electronic Health Records') },
	order: 3,
}); // FHIR.jl, HL7.jl


// ===================================================
// SUBMENU: COMPUTATIONAL ENGINEERING TOOLBOX
// ===================================================

MenuRegistry.appendMenuItem(E_CETSubmenuId, {
	group: '1_cet',
	command: { id: 'chiara.statistics.femt.topopt', precondition: ContextKeyExpr.false(),
	title: localize('femt.topopt', 'Topology Optimisation'),
	},
	order: 1,
}); // TopOpt.jl

MenuRegistry.appendMenuItem(E_CETSubmenuId, {
	group: '1_cet',
	command: { id: 'chiara.statistics.femt.adcme', precondition: ContextKeyExpr.false(),
	title: localize('femt.adcme', 'Inverse Modeling and Gradient-Based Optimization'),
	},
	order: 2,
}); // ADCME.jl,
// ADCME.jl is based on Tensorflow

MenuRegistry.appendMenuItem(E_CETSubmenuId, {
	group: '1_cet',
	command: { id: 'chiara.statistics.femt.adfem', precondition: ContextKeyExpr.false(),
	title: localize('femt.adfem', 'Finite Element Simulator for Inverse Modeling'),
	},
	order: 3,
}); // AdFem.jl - innovative, efficient, computational-graph-based finite element simulator for inverse modeling

MenuRegistry.appendMenuItem(E_CETSubmenuId, {
	group: '2_cet',
	command: { id: 'chiara.statistics.femt.gridpad', precondition: ContextKeyExpr.false(),
	title: localize('femt.gridpad', 'Finite Element: Gridpad'),
	},
	order: 1,
}); // Gridap.jl

MenuRegistry.appendMenuItem(E_CETSubmenuId, {
	group: '2_cet',
	command: { id: 'chiara.statistics.femt.ferrite', precondition: ContextKeyExpr.false(),
	title: localize('femt.ferrite', 'Finite Element: Ferrite'),
	},
	order: 2,
}); // Ferrite.jl

MenuRegistry.appendMenuItem(E_CETSubmenuId, {
	group: '3_cet',
	command: { id: EXPL_COMMAND_ID, precondition: ContextKeyExpr.false(), title: localize('cet.cfd', 'Computational Fluid Dynamics') },
	order: 1,
}); // Oceananigans.jl, Trixi.jl, WaterLily.jl

MenuRegistry.appendMenuItem(E_CETSubmenuId, {
	group: '3_cet',
	command: { id: EXPL_COMMAND_ID, precondition: ContextKeyExpr.false(), title: localize('cet.structural', 'Structural Mechanics') },
	order: 2,
}); // Ferrite.jl, Gridap.jl

MenuRegistry.appendMenuItem(E_CETSubmenuId, {
	group: '3_cet',
	command: { id: EXPL_COMMAND_ID, precondition: ContextKeyExpr.false(), title: localize('cet.multiphysics', 'Multiphysics Coupling') },
	order: 3,
}); // ModelingToolkit.jl, Gridap.jl

MenuRegistry.appendMenuItem(E_CETSubmenuId, {
	group: '3_cet',
	command: { id: EXPL_COMMAND_ID, precondition: ContextKeyExpr.false(), title: localize('cet.heat', 'Heat Transfer') },
	order: 4,
}); // DifferentialEquations.jl, Gridap.jl

MenuRegistry.appendMenuItem(E_CETSubmenuId, {
	group: '3_cet',
	command: { id: EXPL_COMMAND_ID, precondition: ContextKeyExpr.false(), title: localize('cet.acoustics', 'Acoustics and Wave Propagation') },
	order: 5,
}); // Gridap.jl, DifferentialEquations.jl

MenuRegistry.appendMenuItem(E_CETSubmenuId, {
	group: '3_cet',
	command: { id: EXPL_COMMAND_ID, precondition: ContextKeyExpr.false(), title: localize('cet.hpc', 'High-Performance Computing') },
	order: 6,
}); // MPI.jl, CUDA.jl, LoopVectorization.jl


// ===================================================
// SUBMENU: SIGNAL PROCESSING TOOLBOX
// Core packages: DSP.jl, FFTW.jl, Wavelets.jl,
//   SampledSignals.jl, SignalAnalysis.jl, PortAudio.jl
// ===================================================

// ── Spectral Analysis ─────────────────────────────────────────────────

MenuRegistry.appendMenuItem(E_DSPSubmenuId, {
	group: '1_dsp',
	command: { id: EXPL_COMMAND_ID, precondition: ContextKeyExpr.false(), title: localize('dsp.fft', 'Fast Fourier Transform (FFT)') },
	order: 1,
}); // FFTW.jl, DSP.jl

MenuRegistry.appendMenuItem(E_DSPSubmenuId, {
	group: '1_dsp',
	command: { id: EXPL_COMMAND_ID, precondition: ContextKeyExpr.false(), title: localize('dsp.psd', 'Power Spectral Density') },
	order: 2,
}); // DSP.jl (periodogram, welch, bartlett)

MenuRegistry.appendMenuItem(E_DSPSubmenuId, {
	group: '1_dsp',
	command: { id: EXPL_COMMAND_ID, precondition: ContextKeyExpr.false(), title: localize('dsp.spectrogram', 'Spectrogram') },
	order: 3,
}); // DSP.jl, SignalAnalysis.jl

MenuRegistry.appendMenuItem(E_DSPSubmenuId, {
	group: '1_dsp',
	command: { id: EXPL_COMMAND_ID, precondition: ContextKeyExpr.false(), title: localize('dsp.coherence', 'Cross-Spectrum and Coherence') },
	order: 4,
}); // DSP.jl

MenuRegistry.appendMenuItem(E_DSPSubmenuId, {
	group: '1_dsp',
	command: { id: EXPL_COMMAND_ID, precondition: ContextKeyExpr.false(), title: localize('dsp.cepstrum', 'Cepstral Analysis') },
	order: 5,
}); // DSP.jl (real and complex cepstrum)

// ── Digital Filtering ─────────────────────────────────────────────────

MenuRegistry.appendMenuItem(E_DSPSubmenuId, {
	group: '2_dsp',
	command: { id: EXPL_COMMAND_ID, precondition: ContextKeyExpr.false(), title: localize('dsp.fir', 'FIR Filter Design') },
	order: 1,
}); // DSP.jl (firwin, remez, Kaiser window)

MenuRegistry.appendMenuItem(E_DSPSubmenuId, {
	group: '2_dsp',
	command: { id: EXPL_COMMAND_ID, precondition: ContextKeyExpr.false(), title: localize('dsp.iir', 'IIR Filter Design') },
	order: 2,
}); // DSP.jl (Butterworth, Chebyshev I/II, Elliptic, Bessel)

MenuRegistry.appendMenuItem(E_DSPSubmenuId, {
	group: '2_dsp',
	command: { id: EXPL_COMMAND_ID, precondition: ContextKeyExpr.false(), title: localize('dsp.zerophase', 'Zero-Phase Filtering') },
	order: 3,
}); // DSP.jl (filtfilt — forward-backward pass)

MenuRegistry.appendMenuItem(E_DSPSubmenuId, {
	group: '2_dsp',
	command: { id: EXPL_COMMAND_ID, precondition: ContextKeyExpr.false(), title: localize('dsp.notch', 'Notch and Peak Filtering') },
	order: 4,
}); // DSP.jl (iirnotch, iirpeak)

MenuRegistry.appendMenuItem(E_DSPSubmenuId, {
	group: '2_dsp',
	command: { id: EXPL_COMMAND_ID, precondition: ContextKeyExpr.false(), title: localize('dsp.adaptive', 'Adaptive Filtering') },
	order: 5,
}); // DSP.jl (LMS, RLS algorithms)

// ── Wavelets and Time-Frequency ───────────────────────────────────────

MenuRegistry.appendMenuItem(E_DSPSubmenuId, {
	group: '3_dsp',
	command: { id: EXPL_COMMAND_ID, precondition: ContextKeyExpr.false(), title: localize('dsp.dwt', 'Discrete Wavelet Transform') },
	order: 1,
}); // Wavelets.jl (Haar, Daubechies, Coiflet, Symlet)

MenuRegistry.appendMenuItem(E_DSPSubmenuId, {
	group: '3_dsp',
	command: { id: EXPL_COMMAND_ID, precondition: ContextKeyExpr.false(), title: localize('dsp.cwt', 'Continuous Wavelet Transform') },
	order: 2,
}); // ContinuousWavelets.jl, Wavelets.jl

MenuRegistry.appendMenuItem(E_DSPSubmenuId, {
	group: '3_dsp',
	command: { id: EXPL_COMMAND_ID, precondition: ContextKeyExpr.false(), title: localize('dsp.stft', 'Short-Time Fourier Transform') },
	order: 3,
}); // DSP.jl (stft, istft)

MenuRegistry.appendMenuItem(E_DSPSubmenuId, {
	group: '3_dsp',
	command: { id: EXPL_COMMAND_ID, precondition: ContextKeyExpr.false(), title: localize('dsp.wpt', 'Wavelet Packet Decomposition') },
	order: 4,
}); // Wavelets.jl

MenuRegistry.appendMenuItem(E_DSPSubmenuId, {
	group: '3_dsp',
	command: { id: EXPL_COMMAND_ID, precondition: ContextKeyExpr.false(), title: localize('dsp.hilbert', 'Hilbert Transform and Instantaneous Frequency') },
	order: 5,
}); // DSP.jl (hilbert, analytic signal, instantaneous amplitude and phase)

// ── Statistical Signal Processing ────────────────────────────────────

MenuRegistry.appendMenuItem(E_DSPSubmenuId, {
	group: '4_dsp',
	command: { id: EXPL_COMMAND_ID, precondition: ContextKeyExpr.false(), title: localize('dsp.kalman', 'Kalman and Extended Kalman Filtering') },
	order: 1,
}); // StateSpaceModels.jl — also available via the SSM webview in Model menu

MenuRegistry.appendMenuItem(E_DSPSubmenuId, {
	group: '4_dsp',
	command: { id: EXPL_COMMAND_ID, precondition: ContextKeyExpr.false(), title: localize('dsp.particle', 'Particle Filtering') },
	order: 2,
}); // StateSpaceModels.jl, Turing.jl (sequential Monte Carlo)

MenuRegistry.appendMenuItem(E_DSPSubmenuId, {
	group: '4_dsp',
	command: { id: EXPL_COMMAND_ID, precondition: ContextKeyExpr.false(), title: localize('dsp.wiener', 'Wiener and Optimal Filtering') },
	order: 3,
}); // DSP.jl

MenuRegistry.appendMenuItem(E_DSPSubmenuId, {
	group: '4_dsp',
	command: { id: EXPL_COMMAND_ID, precondition: ContextKeyExpr.false(), title: localize('dsp.ar', 'Autoregressive and ARMA Modelling') },
	order: 4,
}); // DSP.jl (aryule, arburg); also covered in ARIMAX webview

// ── Compressed Sensing and Reconstruction ────────────────────────────

MenuRegistry.appendMenuItem(E_DSPSubmenuId, {
	group: '5_dsp',
	command: { id: EXPL_COMMAND_ID, precondition: ContextKeyExpr.false(), title: localize('dsp.sparse', 'Sparse Signal Recovery') },
	order: 1,
}); // Julia: SparseArrays.jl, JuMP.jl (basis pursuit, LASSO)

MenuRegistry.appendMenuItem(E_DSPSubmenuId, {
	group: '5_dsp',
	command: { id: EXPL_COMMAND_ID, precondition: ContextKeyExpr.false(), title: localize('dsp.cs', 'Compressed Sensing') },
	order: 2,
}); // Julia: SparseArrays.jl, JuMP.jl, COSAMP algorithm

MenuRegistry.appendMenuItem(E_DSPSubmenuId, {
	group: '5_dsp',
	command: { id: EXPL_COMMAND_ID, precondition: ContextKeyExpr.false(), title: localize('dsp.denoise', 'Signal Denoising and Deconvolution') },
	order: 3,
}); // Julia: DSP.jl, Wavelets.jl (wavelet thresholding)

// ── Signal Generation and I/O ─────────────────────────────────────────

MenuRegistry.appendMenuItem(E_DSPSubmenuId, {
	group: '6_dsp',
	command: { id: EXPL_COMMAND_ID, precondition: ContextKeyExpr.false(), title: localize('dsp.gen', 'Waveform and Test Signal Generation') },
	order: 1,
}); // DSP.jl, SampledSignals.jl (sinusoids, chirp, noise, impulse)

MenuRegistry.appendMenuItem(E_DSPSubmenuId, {
	group: '6_dsp',
	command: { id: EXPL_COMMAND_ID, precondition: ContextKeyExpr.false(), title: localize('dsp.audio', 'Audio Capture and Playback') },
	order: 2,
}); // PortAudio.jl, SampledSignals.jl, LibSndFile.jl

MenuRegistry.appendMenuItem(E_DSPSubmenuId, {
	group: '6_dsp',
	command: { id: EXPL_COMMAND_ID, precondition: ContextKeyExpr.false(), title: localize('dsp.resample', 'Signal Resampling and Interpolation') },
	order: 3,
}); // DSP.jl (resample, upsample, downsample), Interpolations.jl

MenuRegistry.appendMenuItem(E_DSPSubmenuId, {
	group: '6_dsp',
	command: { id: EXPL_COMMAND_ID, precondition: ContextKeyExpr.false(), title: localize('dsp.recurrence', 'Recurrence and Nonlinear Analysis') },
	order: 4,
}); // RecurrenceAnalysis.jl (recurrence plots, RQA measures)


// ===================================================
// SUBMENU: MATERIALS SCIENCE AND COMPUTATIONAL CHEMISTRY
// Core Julia packages: DFTK.jl, Molly.jl, AtomsBase.jl,
//   Chemfiles.jl, Clapeyron.jl, CrystallographyBase.jl
// Python via PythonCall where dominant: RDKit, pymatgen, ASE
// ===================================================

// ── Crystal Structure and Symmetry ───────────────────────────────────

MenuRegistry.appendMenuItem(E_MSCCSubmenuId, {
	group: '1_mscc',
	command: { id: EXPL_COMMAND_ID, precondition: ContextKeyExpr.false(), title: localize('mscc.crystal', 'Crystal Structure Loading and Visualisation') },
	order: 1,
}); // Chemfiles.jl, CrystallographyBase.jl, AtomsBase.jl (CIF, XYZ, POSCAR formats)

MenuRegistry.appendMenuItem(E_MSCCSubmenuId, {
	group: '1_mscc',
	command: { id: EXPL_COMMAND_ID, precondition: ContextKeyExpr.false(), title: localize('mscc.symmetry', 'Symmetry Analysis') },
	order: 2,
}); // Spglib.jl (space groups, Wyckoff positions, primitive cells)

MenuRegistry.appendMenuItem(E_MSCCSubmenuId, {
	group: '1_mscc',
	command: { id: EXPL_COMMAND_ID, precondition: ContextKeyExpr.false(), title: localize('mscc.phonon', 'Lattice Dynamics and Phonons') },
	order: 3,
}); // DFTK.jl; Python via PythonCall → phonopy, ASE

MenuRegistry.appendMenuItem(E_MSCCSubmenuId, {
	group: '1_mscc',
	command: { id: EXPL_COMMAND_ID, precondition: ContextKeyExpr.false(), title: localize('mscc.xrd', 'Diffraction Pattern Analysis') },
	order: 4,
}); // CrystallographyBase.jl; Python via PythonCall → pymatgen, diffpy-cmi

// ── Electronic Structure ──────────────────────────────────────────────

MenuRegistry.appendMenuItem(E_MSCCSubmenuId, {
	group: '2_mscc',
	command: { id: EXPL_COMMAND_ID, precondition: ContextKeyExpr.false(), title: localize('mscc.dft', 'Density Functional Theory (DFT)') },
	order: 1,
}); // DFTK.jl — Julia-native, plane-wave DFT, competitive with Quantum ESPRESSO

MenuRegistry.appendMenuItem(E_MSCCSubmenuId, {
	group: '2_mscc',
	command: { id: EXPL_COMMAND_ID, precondition: ContextKeyExpr.false(), title: localize('mscc.bandstructure', 'Band Structure and Density of States') },
	order: 2,
}); // DFTK.jl; Python via PythonCall → pymatgen, ase

MenuRegistry.appendMenuItem(E_MSCCSubmenuId, {
	group: '2_mscc',
	command: { id: EXPL_COMMAND_ID, precondition: ContextKeyExpr.false(), title: localize('mscc.wannier', 'Wannier Functions') },
	order: 3,
}); // Wannier.jl, DFTK.jl

MenuRegistry.appendMenuItem(E_MSCCSubmenuId, {
	group: '2_mscc',
	command: { id: EXPL_COMMAND_ID, precondition: ContextKeyExpr.false(), title: localize('mscc.tightbinding', 'Tight-Binding Models') },
	order: 4,
}); // TightBinding.jl, DFTK.jl

// ── Molecular Dynamics ────────────────────────────────────────────────

MenuRegistry.appendMenuItem(E_MSCCSubmenuId, {
	group: '3_mscc',
	command: { id: EXPL_COMMAND_ID, precondition: ContextKeyExpr.false(), title: localize('mscc.md', 'Classical Molecular Dynamics') },
	order: 1,
}); // Molly.jl (NVT, NPT, NVE ensembles; CUDA acceleration)

MenuRegistry.appendMenuItem(E_MSCCSubmenuId, {
	group: '3_mscc',
	command: { id: EXPL_COMMAND_ID, precondition: ContextKeyExpr.false(), title: localize('mscc.mlff', 'Machine Learning Force Fields') },
	order: 2,
}); // ACEpotentials.jl, InteratomicPotentials.jl; Python via PythonCall → MACE, NequIP

MenuRegistry.appendMenuItem(E_MSCCSubmenuId, {
	group: '3_mscc',
	command: { id: EXPL_COMMAND_ID, precondition: ContextKeyExpr.false(), title: localize('mscc.trajectory', 'Trajectory Analysis') },
	order: 3,
}); // Chemfiles.jl, AtomsBase.jl; Python via PythonCall → MDAnalysis

MenuRegistry.appendMenuItem(E_MSCCSubmenuId, {
	group: '3_mscc',
	command: { id: EXPL_COMMAND_ID, precondition: ContextKeyExpr.false(), title: localize('mscc.enhanced', 'Enhanced Sampling Methods') },
	order: 4,
}); // Molly.jl (replica exchange, metadynamics); Python via PythonCall → PLUMED

// ── Thermodynamics and Phase Equilibria ───────────────────────────────

MenuRegistry.appendMenuItem(E_MSCCSubmenuId, {
	group: '4_mscc',
	command: { id: EXPL_COMMAND_ID, precondition: ContextKeyExpr.false(), title: localize('mscc.eos', 'Equations of State') },
	order: 1,
}); // Clapeyron.jl — comprehensive Julia-native EOS library (SAFT, cubic, multiparameter)

MenuRegistry.appendMenuItem(E_MSCCSubmenuId, {
	group: '4_mscc',
	command: { id: EXPL_COMMAND_ID, precondition: ContextKeyExpr.false(), title: localize('mscc.phase', 'Phase Diagrams and Flash Calculations') },
	order: 2,
}); // Clapeyron.jl (VLE, LLE, VLLE; bubble/dew point; critical point)

MenuRegistry.appendMenuItem(E_MSCCSubmenuId, {
	group: '4_mscc',
	command: { id: EXPL_COMMAND_ID, precondition: ContextKeyExpr.false(), title: localize('mscc.thermochem', 'Thermochemical Properties') },
	order: 3,
}); // Clapeyron.jl; Python via PythonCall → cantera, CoolProp

// ── Cheminformatics ───────────────────────────────────────────────────

MenuRegistry.appendMenuItem(E_MSCCSubmenuId, {
	group: '5_mscc',
	command: { id: EXPL_COMMAND_ID, precondition: ContextKeyExpr.false(), title: localize('mscc.fingerprint', 'Molecular Representation and Fingerprints') },
	order: 1,
}); // Python via PythonCall → RDKit (Morgan, MACCS, topological fingerprints)

MenuRegistry.appendMenuItem(E_MSCCSubmenuId, {
	group: '5_mscc',
	command: { id: EXPL_COMMAND_ID, precondition: ContextKeyExpr.false(), title: localize('mscc.qsar', 'Property Prediction (QSAR / QSPR)') },
	order: 2,
}); // Python via PythonCall → RDKit, DeepChem; Julia: Flux.jl

MenuRegistry.appendMenuItem(E_MSCCSubmenuId, {
	group: '5_mscc',
	command: { id: EXPL_COMMAND_ID, precondition: ContextKeyExpr.false(), title: localize('mscc.retro', 'Reaction Prediction and Retrosynthesis') },
	order: 3,
}); // Python via PythonCall → RDKit, RXN4Chemistry, ASKCOS

MenuRegistry.appendMenuItem(E_MSCCSubmenuId, {
	group: '5_mscc',
	command: { id: EXPL_COMMAND_ID, precondition: ContextKeyExpr.false(), title: localize('mscc.formats', 'Chemical File Format Conversion') },
	order: 4,
}); // Chemfiles.jl (XYZ, SDF, MOL2, PDB, CIF); Python via PythonCall → Open Babel

// ── Materials Informatics ─────────────────────────────────────────────

MenuRegistry.appendMenuItem(E_MSCCSubmenuId, {
	group: '6_mscc',
	command: { id: EXPL_COMMAND_ID, precondition: ContextKeyExpr.false(), title: localize('mscc.matdb', 'Materials Databases') },
	order: 1,
}); // Python via PythonCall → pymatgen (Materials Project), AFLOW, OQMD, ICSD

MenuRegistry.appendMenuItem(E_MSCCSubmenuId, {
	group: '6_mscc',
	command: { id: EXPL_COMMAND_ID, precondition: ContextKeyExpr.false(), title: localize('mscc.hts', 'High-Throughput Screening') },
	order: 2,
}); // Julia: AtomsBase.jl + JuMP.jl; Python via PythonCall → pymatgen, atomate2

MenuRegistry.appendMenuItem(E_MSCCSubmenuId, {
	group: '6_mscc',
	command: { id: EXPL_COMMAND_ID, precondition: ContextKeyExpr.false(), title: localize('mscc.matpred', 'Materials Property Prediction') },
	order: 3,
}); // Python via PythonCall → matminer, MEGNet, CGCNN; Julia: Flux.jl (GNNs via GraphNeuralNetworks.jl)

MenuRegistry.appendMenuItem(E_MSCCSubmenuId, {
	group: '6_mscc',
	command: { id: EXPL_COMMAND_ID, precondition: ContextKeyExpr.false(), title: localize('mscc.matopt', 'Inverse Design and Materials Optimisation') },
	order: 4,
}); // Julia: JuMP.jl, Turing.jl (Bayesian optimisation); Python via PythonCall → botorch, ax-platform


// ===================================================
// SUBMENU: ROBOTICS TOOLBOX
// ===================================================

MenuRegistry.appendMenuItem(E_RTSubmenuId, {
	group: '1_rt',
	command: {
		id: RDYN_ID,
		title: localize('showRobotics.rdyn', 'Robot Dynamics'),
	},
	order: 1,
}); // Rotation Representations, FK, FD, ID; Rotations.jl, RobotDynamics.jl, RigidBodyDynamics.jl

MenuRegistry.appendMenuItem(E_RTSubmenuId, {
	group: '1_rt',
	command: {
		id: RCTL_ID,
		title: localize('showRobotics.rctl', 'Robot Control'),
	},
	order: 2,
}); // IK, PD Joint Control, Computed Torque, Impedance; RobotDynamics.jl, RigidBodyDynamics.jl

MenuRegistry.appendMenuItem(E_RTSubmenuId, {
	group: '2_rt',
	command: {
		id: MCAT_ID,
		title: localize('showRobotics.mcat', 'MeshCat 3D Visualisation'),
	},
	order: 1,
}); // MeshCat.jl, CoordinateTransformations.jl, MeshCatMechanisms.jl

MenuRegistry.appendMenuItem(E_RTSubmenuId, {
	group: '2_rt',
	command: {
		id: RZOO_ID,
		title: localize('showRobotics.rzoo', 'Robot Model Library'),
	},
	order: 2,
}); // RobotZoo.jl, RobotDynamics.jl


// ===================================================
// SUBMENU: LAW AND JURISPRUDENCE TOOLBOX
// Key: Julia where possible; Python via PythonCall where the
//      ecosystem is clearly dominant (NLP, LLM, embeddings).
// ===================================================

// ── Legal Data Sources ────────────────────────────────────────────────

MenuRegistry.appendMenuItem(E_LAWSubmenuId, {
	group: '1_law',
	command: { id: EXPL_COMMAND_ID, precondition: ContextKeyExpr.false(), title: localize('law.eurlex', 'EUR-Lex — EU Legislation') },
	order: 1,
}); // Julia: HTTP.jl + JSON3.jl (EUR-Lex REST API); Python via PythonCall → eurlex

MenuRegistry.appendMenuItem(E_LAWSubmenuId, {
	group: '1_law',
	command: { id: EXPL_COMMAND_ID, precondition: ContextKeyExpr.false(), title: localize('law.courtlistener', 'CourtListener — US Case Law') },
	order: 2,
}); // Julia: HTTP.jl (CourtListener REST API); Python via PythonCall → courtlistener

MenuRegistry.appendMenuItem(E_LAWSubmenuId, {
	group: '1_law',
	command: { id: EXPL_COMMAND_ID, precondition: ContextKeyExpr.false(), title: localize('law.legislationgov', 'Legislation.gov.uk') },
	order: 3,
}); // Julia: HTTP.jl (legislation.gov.uk REST API)

MenuRegistry.appendMenuItem(E_LAWSubmenuId, {
	group: '1_law',
	command: { id: EXPL_COMMAND_ID, precondition: ContextKeyExpr.false(), title: localize('law.pacer', 'PACER — US Federal Court Records') },
	order: 4,
}); // Julia: HTTP.jl (PACER REST API — dockets, filings, case metadata for all US federal courts)

MenuRegistry.appendMenuItem(E_LAWSubmenuId, {
	group: '1_law',
	command: { id: EXPL_COMMAND_ID, precondition: ContextKeyExpr.false(), title: localize('law.cap', 'Caselaw Access Project (CAP)') },
	order: 5,
}); // Julia: HTTP.jl (Harvard CAP API — full text of all US case law from 1658 to 2018)

MenuRegistry.appendMenuItem(E_LAWSubmenuId, {
	group: '1_law',
	command: { id: EXPL_COMMAND_ID, precondition: ContextKeyExpr.false(), title: localize('law.intl', 'International Law Databases') },
	order: 6,
}); // Julia: HTTP.jl (UN Treaty Collection, ICJ, WTO APIs)

// ── Document Analysis ─────────────────────────────────────────────────

MenuRegistry.appendMenuItem(E_LAWSubmenuId, {
	group: '2_law',
	command: { id: EXPL_COMMAND_ID, precondition: ContextKeyExpr.false(), title: localize('law.clause', 'Contract Clause Extraction') },
	order: 1,
}); // Python via PythonCall → spaCy (en_core_web_lg), LexNLP, LegalBench

MenuRegistry.appendMenuItem(E_LAWSubmenuId, {
	group: '2_law',
	command: { id: EXPL_COMMAND_ID, precondition: ContextKeyExpr.false(), title: localize('law.obligation', 'Obligation and Right Detection') },
	order: 2,
}); // Python via PythonCall → spaCy, Hugging Face Transformers (legal-bert)

MenuRegistry.appendMenuItem(E_LAWSubmenuId, {
	group: '2_law',
	command: { id: EXPL_COMMAND_ID, precondition: ContextKeyExpr.false(), title: localize('law.legalner', 'Named Entity Recognition (Legal)') },
	order: 3,
}); // Python via PythonCall → spaCy (en_legal_ner_trf), Transformers

MenuRegistry.appendMenuItem(E_LAWSubmenuId, {
	group: '2_law',
	command: { id: EXPL_COMMAND_ID, precondition: ContextKeyExpr.false(), title: localize('law.docsim', 'Document Similarity and Clustering') },
	order: 4,
}); // Python via PythonCall → sentence-transformers, FAISS; Julia: TextAnalysis.jl

MenuRegistry.appendMenuItem(E_LAWSubmenuId, {
	group: '2_law',
	command: { id: EXPL_COMMAND_ID, precondition: ContextKeyExpr.false(), title: localize('law.summary', 'Legal Document Summarisation') },
	order: 5,
}); // Python via PythonCall → LangChain, Transformers (led-large-legal)

// ── Case Law and Precedent ────────────────────────────────────────────

MenuRegistry.appendMenuItem(E_LAWSubmenuId, {
	group: '3_law',
	command: { id: EXPL_COMMAND_ID, precondition: ContextKeyExpr.false(), title: localize('law.citation', 'Case Citation Network') },
	order: 1,
}); // Julia: Graphs.jl, MetaGraphs.jl (cases as nodes, citations as directed edges)

MenuRegistry.appendMenuItem(E_LAWSubmenuId, {
	group: '3_law',
	command: { id: EXPL_COMMAND_ID, precondition: ContextKeyExpr.false(), title: localize('law.precedent', 'Precedent Search') },
	order: 2,
}); // Python via PythonCall → sentence-transformers, FAISS (semantic similarity over case embeddings)

MenuRegistry.appendMenuItem(E_LAWSubmenuId, {
	group: '3_law',
	command: { id: EXPL_COMMAND_ID, precondition: ContextKeyExpr.false(), title: localize('law.jurisdiction', 'Jurisdiction Classification') },
	order: 3,
}); // Python via PythonCall → scikit-learn, Transformers; Julia: TextAnalysis.jl

MenuRegistry.appendMenuItem(E_LAWSubmenuId, {
	group: '3_law',
	command: { id: EXPL_COMMAND_ID, precondition: ContextKeyExpr.false(), title: localize('law.outcome', 'Outcome Prediction') },
	order: 4,
}); // Python via PythonCall → scikit-learn, LightGBM, Transformers

// ── Regulatory Compliance ─────────────────────────────────────────────

MenuRegistry.appendMenuItem(E_LAWSubmenuId, {
	group: '4_law',
	command: { id: EXPL_COMMAND_ID, precondition: ContextKeyExpr.false(), title: localize('law.gdpr', 'GDPR Compliance Analysis') },
	order: 1,
}); // Python via PythonCall → spaCy, Transformers (privacy-policy classifiers)

MenuRegistry.appendMenuItem(E_LAWSubmenuId, {
	group: '4_law',
	command: { id: EXPL_COMMAND_ID, precondition: ContextKeyExpr.false(), title: localize('law.aml', 'AML / KYC Text Mining') },
	order: 2,
}); // Python via PythonCall → spaCy, Hugging Face; Julia: TextAnalysis.jl

MenuRegistry.appendMenuItem(E_LAWSubmenuId, {
	group: '4_law',
	command: { id: EXPL_COMMAND_ID, precondition: ContextKeyExpr.false(), title: localize('law.regmon', 'Regulatory Change Monitoring') },
	order: 3,
}); // Julia: HTTP.jl, Dates.jl (polling APIs); Python via PythonCall → Transformers (change detection)

MenuRegistry.appendMenuItem(E_LAWSubmenuId, {
	group: '4_law',
	command: { id: EXPL_COMMAND_ID, precondition: ContextKeyExpr.false(), title: localize('law.oblmap', 'Obligation Mapping') },
	order: 4,
}); // Python via PythonCall → spaCy, networkx; Julia: Graphs.jl

// ── Legal Reasoning and AI ────────────────────────────────────────────

MenuRegistry.appendMenuItem(E_LAWSubmenuId, {
	group: '5_law',
	command: { id: EXPL_COMMAND_ID, precondition: ContextKeyExpr.false(), title: localize('law.argument', 'Argumentation Modelling') },
	order: 1,
}); // Julia: Julog.jl (Prolog-style Horn clauses); Python via PythonCall → argumentation frameworks (py-arg)

MenuRegistry.appendMenuItem(E_LAWSubmenuId, {
	group: '5_law',
	command: { id: EXPL_COMMAND_ID, precondition: ContextKeyExpr.false(), title: localize('law.qa', 'Legal Question Answering') },
	order: 2,
}); // Python via PythonCall → LangChain + RAG over case law embeddings, legal-bert

MenuRegistry.appendMenuItem(E_LAWSubmenuId, {
	group: '5_law',
	command: { id: EXPL_COMMAND_ID, precondition: ContextKeyExpr.false(), title: localize('law.inference', 'Logical Inference') },
	order: 3,
}); // Julia: Julog.jl, HerbSearch.jl (inductive logic programming)

MenuRegistry.appendMenuItem(E_LAWSubmenuId, {
	group: '5_law',
	command: { id: EXPL_COMMAND_ID, precondition: ContextKeyExpr.false(), title: localize('law.evidence', 'Evidence Weighting and Probabilistic Reasoning') },
	order: 4,
}); // Julia: Turing.jl (Bayesian networks over evidence); Python via PythonCall → pgmpy

