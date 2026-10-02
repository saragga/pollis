/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

// import { METHODS } from 'http';
import { localize } from '../../../../../vs/nls.js';
import { MenuRegistry, MenuId } from '../../../../platform/actions/common/actions.js';
import { CommandsRegistry, ICommandService } from '../../../../platform/commands/common/commands.js';
import { ServicesAccessor } from '../../../../platform/instantiation/common/instantiation.js';
import { IWebviewWorkbenchService } from '../../webviewPanel/browser/webviewWorkbenchService.js';
import { IWebviewService } from '../../webview/browser/webview.js';
import { IOpenerService } from '../../../../platform/opener/common/opener.js';
import { IEditorService } from '../../../services/editor/common/editorService.js';
import { IQuickInputService } from '../../../../platform/quickinput/common/quickInput.js';
import { IClipboardService } from '../../../../platform/clipboard/common/clipboardService.js';
import { INotificationService } from '../../../../platform/notification/common/notification.js';
import { INotebookEditorModelResolverService } from '../../notebook/common/notebookEditorModelResolverService.js';
import { INotebookKernelService } from '../../notebook/common/notebookKernelService.js';
import { ILanguageService } from '../../../../editor/common/languages/language.js';
import { IThemeService } from '../../../../platform/theme/common/themeService.js';
import { IRequestService } from '../../../../platform/request/common/request.js';
import { DSTATS_PANEL } from '../../model/browser/commands/dstats.command.js';
import { openScaffoldWebview } from '../../model/browser/commands/scaffold.command.js';
import { NOD_PANEL } from '../../model/browser/commands/nod.command.js';
import { ANDE_PANEL } from '../../model/browser/commands/ande.command.js';
import { NOVD_PANEL } from '../../model/browser/commands/novd.command.js';
import { openCvizWebview } from '../../model/browser/commands/cviz.command.js';
import { openDcmpWebview } from '../../model/browser/commands/dcmp.command.js';
import { openMvizWebview } from '../../model/browser/commands/mviz.command.js';
import { openTsvizWebview } from '../../model/browser/commands/tsviz.command.js';
import { openCpvizWebview } from '../../model/browser/commands/cpviz.command.js';
import { openGsvizWebview } from '../../model/browser/commands/gsviz.command.js';
import { openSfvizWebview } from '../../model/browser/commands/sfviz.command.js';
import { HMD_PANEL } from '../../model/browser/commands/hmd.command.js';
import { IDAT_PANEL } from '../../model/browser/commands/idat.command.js';
import { CSV_PANEL } from '../../model/browser/commands/csv.command.js';
import { SQL_PANEL } from '../../model/browser/commands/sql.command.js';
import { openHfmWebview } from '../../model/browser/commands/hfm.command.js';
import { openKgmWebview } from '../../model/browser/commands/kgm.command.js';
import { openXlsxWebview } from '../../model/browser/commands/xlsx.command.js';
import { openYfinWebview } from '../../model/browser/commands/yfin.command.js';
import { openAlpvWebview } from '../../model/browser/commands/alpv.command.js';
import { openFredWebview } from '../../model/browser/commands/fred.command.js';
import { openEcbWebview } from '../../model/browser/commands/ecb.command.js';
import { openEdgarWebview } from '../../model/browser/commands/edgar.command.js';
import { openHfdsWebview } from '../../model/browser/commands/hfds.command.js';
import { openKgdsWebview } from '../../model/browser/commands/kgds.command.js';
import { ISecretStorageService } from '../../../../platform/secrets/common/secrets.js';
import { IFileService } from '../../../../platform/files/common/files.js';
import { IPathService } from '../../../services/path/common/pathService.js';
import { IWorkspaceContextService } from '../../../../platform/workspace/common/workspace.js';

export const EXPL_COMMAND_ID = 'workbench.action.showExplore';
const DSTATS_ID = 'chiara.explore.dstats';
const NOD_ID = 'chiara.explore.nod';
const ANDE_ID = 'chiara.explore.ande';
const NOVD_ID = 'chiara.explore.novd';
const HMD_ID = 'chiara.explore.hmd';
const IDAT_ID = 'chiara.explore.idat';
const HFM_ID  = 'chiara.explore.hfm';
const KGM_ID  = 'chiara.explore.kgm';
const SQL_ID = 'chiara.explore.conn.sql';
const XLSX_ID = 'chiara.explore.conn.xlsx';
const CSV_ID = 'chiara.explore.conn.csv';
const YFIN_ID = 'chiara.explore.adr.yfin';
const ALPV_ID = 'chiara.explore.adr.alpv';
export const FRED_ID = 'chiara.explore.adr.fred';
export const ECB_ID = 'chiara.explore.adr.ecb';
const EDGAR_ID = 'chiara.explore.adr.edgar';
const HFDS_ID = 'chiara.explore.adr.hfds';
const KGDS_ID = 'chiara.explore.adr.kgds';
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
// const WEBAUTO_ID 		  = 'chiara.explore.webauto.playwright';

CommandsRegistry.registerCommand(EXPL_COMMAND_ID, () => {
	console.log('Explore command executed!');
	alert?.('Explore command executed!');
});

CommandsRegistry.registerCommand(DSTATS_ID, (accessor: ServicesAccessor) => openScaffoldWebview(accessor, DSTATS_PANEL));

CommandsRegistry.registerCommand(NOD_ID, (accessor: ServicesAccessor) => openScaffoldWebview(accessor, NOD_PANEL));

CommandsRegistry.registerCommand(ANDE_ID, (accessor: ServicesAccessor) => openScaffoldWebview(accessor, ANDE_PANEL));

CommandsRegistry.registerCommand(IDAT_ID, (accessor: ServicesAccessor) => openScaffoldWebview(accessor, IDAT_PANEL));

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
		accessor.get(IRequestService),
		accessor.get(IFileService),
		accessor.get(IPathService),
		accessor.get(IWorkspaceContextService),
		accessor.get(ISecretStorageService),
		accessor.get(IWebviewService),
	);
});

CommandsRegistry.registerCommand(KGM_ID, (accessor: ServicesAccessor) => {
	openKgmWebview(
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
		accessor.get(IRequestService),
		accessor.get(IFileService),
		accessor.get(IPathService),
		accessor.get(IWorkspaceContextService),
		accessor.get(ISecretStorageService),
		accessor.get(IWebviewService),
	);
});

CommandsRegistry.registerCommand(SQL_ID, (accessor: ServicesAccessor) => openScaffoldWebview(accessor, SQL_PANEL));
CommandsRegistry.registerCommand(CSV_ID, (accessor: ServicesAccessor) => openScaffoldWebview(accessor, CSV_PANEL));

CommandsRegistry.registerCommand(XLSX_ID, (accessor: ServicesAccessor) => {
	openXlsxWebview(
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
		accessor.get(IFileService),
		accessor.get(IPathService),
		accessor.get(IWorkspaceContextService),
	);
});

CommandsRegistry.registerCommand(YFIN_ID, (accessor: ServicesAccessor) => {
	openYfinWebview(
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
		accessor.get(IFileService),
		accessor.get(IPathService),
		accessor.get(IWorkspaceContextService),
	);
});

CommandsRegistry.registerCommand(ALPV_ID, (accessor: ServicesAccessor) => {
	openAlpvWebview(
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
		accessor.get(IFileService),
		accessor.get(IPathService),
		accessor.get(IWorkspaceContextService),
		accessor.get(ISecretStorageService),
		accessor.get(IWebviewService),
	);
});

CommandsRegistry.registerCommand(HFDS_ID, (accessor: ServicesAccessor) => {
	openHfdsWebview(
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
		accessor.get(IRequestService),
		accessor.get(IFileService),
		accessor.get(IPathService),
		accessor.get(IWorkspaceContextService),
		accessor.get(ISecretStorageService),
		accessor.get(IWebviewService),
	);
});

CommandsRegistry.registerCommand(KGDS_ID, (accessor: ServicesAccessor) => {
	openKgdsWebview(
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
		accessor.get(IRequestService),
		accessor.get(IFileService),
		accessor.get(IPathService),
		accessor.get(IWorkspaceContextService),
		accessor.get(ISecretStorageService),
		accessor.get(IWebviewService),
	);
});

CommandsRegistry.registerCommand(FRED_ID, (accessor: ServicesAccessor) => {
	openFredWebview(
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
		accessor.get(IFileService),
		accessor.get(IPathService),
		accessor.get(IWorkspaceContextService),
		accessor.get(ISecretStorageService),
		accessor.get(IWebviewService),
	);
});

CommandsRegistry.registerCommand(ECB_ID, (accessor: ServicesAccessor) => {
	openEcbWebview(
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
		accessor.get(IFileService),
		accessor.get(IPathService),
		accessor.get(IWorkspaceContextService),
	);
});

CommandsRegistry.registerCommand(EDGAR_ID, (accessor: ServicesAccessor) => {
	openEdgarWebview(
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
		accessor.get(IFileService),
		accessor.get(IPathService),
		accessor.get(IWorkspaceContextService),
		accessor.get(ISecretStorageService),
		accessor.get(IWebviewService),
	);
});

CommandsRegistry.registerCommand(HMD_ID, (accessor: ServicesAccessor) => openScaffoldWebview(accessor, HMD_PANEL));

CommandsRegistry.registerCommand(NOVD_ID, (accessor: ServicesAccessor) => openScaffoldWebview(accessor, NOVD_PANEL));


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
		accessor.get(IFileService),
		accessor.get(IPathService),
		accessor.get(IWorkspaceContextService),
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
		accessor.get(IFileService),
		accessor.get(IPathService),
		accessor.get(IWorkspaceContextService),
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
		accessor.get(IFileService),
		accessor.get(IPathService),
		accessor.get(IWorkspaceContextService),
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
		accessor.get(IFileService),
		accessor.get(IPathService),
		accessor.get(IWorkspaceContextService),
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
		accessor.get(IFileService),
		accessor.get(IPathService),
		accessor.get(IWorkspaceContextService),
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
		accessor.get(IFileService),
		accessor.get(IPathService),
		accessor.get(IWorkspaceContextService),
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
		accessor.get(IFileService),
		accessor.get(IPathService),
		accessor.get(IWorkspaceContextService),
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
		accessor.get(IFileService),
		accessor.get(IPathService),
		accessor.get(IWorkspaceContextService),
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
		accessor.get(IFileService),
		accessor.get(IPathService),
		accessor.get(IWorkspaceContextService),
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
		accessor.get(IFileService),
		accessor.get(IPathService),
		accessor.get(IWorkspaceContextService),
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
		accessor.get(IFileService),
		accessor.get(IPathService),
		accessor.get(IWorkspaceContextService),
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
		accessor.get(IFileService),
		accessor.get(IPathService),
		accessor.get(IWorkspaceContextService),
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
		accessor.get(IFileService),
		accessor.get(IPathService),
		accessor.get(IWorkspaceContextService),
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
		accessor.get(IFileService),
		accessor.get(IPathService),
		accessor.get(IWorkspaceContextService),
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
		accessor.get(IFileService),
		accessor.get(IPathService),
		accessor.get(IWorkspaceContextService),
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
		accessor.get(IFileService),
		accessor.get(IPathService),
		accessor.get(IWorkspaceContextService),
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
		accessor.get(IFileService),
		accessor.get(IPathService),
		accessor.get(IWorkspaceContextService),
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
		accessor.get(IFileService),
		accessor.get(IPathService),
		accessor.get(IWorkspaceContextService),
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
		accessor.get(IFileService),
		accessor.get(IPathService),
		accessor.get(IWorkspaceContextService),
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
		accessor.get(IFileService),
		accessor.get(IPathService),
		accessor.get(IWorkspaceContextService),
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
		accessor.get(IFileService),
		accessor.get(IPathService),
		accessor.get(IWorkspaceContextService),
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
		accessor.get(IFileService),
		accessor.get(IPathService),
		accessor.get(IWorkspaceContextService),
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
		accessor.get(IFileService),
		accessor.get(IPathService),
		accessor.get(IWorkspaceContextService),
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
		accessor.get(IFileService),
		accessor.get(IPathService),
		accessor.get(IWorkspaceContextService),
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
		accessor.get(IFileService),
		accessor.get(IPathService),
		accessor.get(IWorkspaceContextService),
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
		accessor.get(IFileService),
		accessor.get(IPathService),
		accessor.get(IWorkspaceContextService),
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
		accessor.get(IFileService),
		accessor.get(IPathService),
		accessor.get(IWorkspaceContextService),
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
		accessor.get(IFileService),
		accessor.get(IPathService),
		accessor.get(IWorkspaceContextService),
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
		accessor.get(IFileService),
		accessor.get(IPathService),
		accessor.get(IWorkspaceContextService),
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
		accessor.get(IFileService),
		accessor.get(IPathService),
		accessor.get(IWorkspaceContextService),
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
		accessor.get(IFileService),
		accessor.get(IPathService),
		accessor.get(IWorkspaceContextService),
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
		accessor.get(IFileService),
		accessor.get(IPathService),
		accessor.get(IWorkspaceContextService),
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
		accessor.get(IFileService),
		accessor.get(IPathService),
		accessor.get(IWorkspaceContextService),
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
		accessor.get(IFileService),
		accessor.get(IPathService),
		accessor.get(IWorkspaceContextService),
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
		accessor.get(IFileService),
		accessor.get(IPathService),
		accessor.get(IWorkspaceContextService),
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

// ===================================================
// TOP-LEVEL EXPLORE MENU STRUCTURE
// ===================================================

MenuRegistry.appendMenuItem(MenuId.MenubarExploreMenu, {
	group: '1_explore',
	submenu: AMRSubmenuId,
	title: localize('showExplore.amr', 'Access Model Repositories'),
	order: 1,
});

MenuRegistry.appendMenuItem(MenuId.MenubarExploreMenu, {
	group: '1_explore',
	submenu: ADRSubmenuId,
	title: localize('showExplore.adr', 'Access Data Libraries'),
	order: 2,
});

MenuRegistry.appendMenuItem(MenuId.MenubarExploreMenu, {
	group: '1_explore',
	submenu: CONNSubmenuId,
	title: localize('showExplore.formats', 'Access Files and Databases'),
	order: 3,
});

//MenuRegistry.appendMenuItem(MenuId.MenubarExploreMenu, {
//	group: '1_explore',
//	command: {id: WEBAUTO_ID, title: localize('showExplore.wa', 'Web Automation') },
//	order: 4,
//});
// // Playwright enables reliable web automation for testing, scripting, and AI agents.
// One API to drive Chromium, Firefox, and WebKit — in your tests, your scripts, and your agent workflows. Available for TypeScript.
//  Apache-2.0 license
// VS Code extension brings test running, debugging, and code generation directly into your editor (Apache 2.0 License)

//MenuRegistry.appendMenuItem(MenuId.MenubarExploreMenu, {
//	group: '1_explore',
//	submenu: RCSubmenuId,
//	title: localize('showExplore.cc', 'Cloud Computing'),
//	order: 5,
//});

//MenuRegistry.appendMenuItem(MenuId.MenubarExploreMenu, {
//	group: '1_explore',
//	submenu: CSSubmenuId,
//	title: localize('showExplore.cs', 'Cloud Storage'),
//	order: 6,
//});

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
		id: KGM_ID,
		title: localize('ds.km', 'Kaggle Models'),
	},
	order: 2,
}); // https://www.kaggle.com/models


// ===================================================
// SUBMENU: ACESSING LIBRARIES
// ===================================================
MenuRegistry.appendMenuItem(ADRSubmenuId, {
	group: '1_ds',
	command: {
		id: HFDS_ID,
		title: localize('ds.hfds', 'Hugging Face Datasets'),
	},
	order: 1,
}); // HuggingFaceDatasets.jl

MenuRegistry.appendMenuItem(ADRSubmenuId, {
	group: '1_ds',
	command: {
		id: KGDS_ID,
		title: localize('ds.kaggle', 'Kaggle Datasets'),
	},
	order: 2,
}); // Kaggle API + CSV.jl

MenuRegistry.appendMenuItem(ADRSubmenuId, {
	group: '2_ds',
	command: {
		id: YFIN_ID,
		title: localize('fit.yahoo', 'Yahoo Finance'),
	},
	order: 1,
}); // YFinance.jl

MenuRegistry.appendMenuItem(ADRSubmenuId, {
	group: '2_ds',
	command: {
		id: ALPV_ID,
		title: localize('fit.alpha', 'Alpha Vantage'),
	},
	order: 2,
}); // AlphaVantage.jl



MenuRegistry.appendMenuItem(ADRSubmenuId, {
	group: '2_ds',
	command: {
		id: EDGAR_ID,
		title: localize('ft.edgar', 'US SEC EDGAR'),
	},
	order: 3,
}); // ScrapeSEC.jl

//MenuRegistry.appendMenuItem(ADRSubmenuId, {
//	group: '2_ds',
//	command: {
//		id: EXPL_COMMAND_ID, precondition: ContextKeyExpr.false(),
//		title: localize('ft.xbrl', 'Generic iXBRL'),
//	},
//	order: 2,
//});  // XbrlXML.jl
// Regulatory filings

// FRED and ECB moved to Economics Toolbox -> Data Sources (macro data belongs with the domain).

// ===================================================
// SUBMENU: FORMATS AND PROTOCOLS
// ===================================================


MenuRegistry.appendMenuItem(CONNSubmenuId, {
	group: '2_conn',
	command: {
		id: SQL_ID,
		title: localize('conn.sql', 'SQL Databases'),
	},
	order: 1,
});  // DuckDB.jl

MenuRegistry.appendMenuItem(CONNSubmenuId, {
	group: '2_conn',
	command: {
		id: XLSX_ID,
		title: localize('conn.excel', 'Excel Workbooks'),
	},
	order: 2,
});  // XLSX.jl

MenuRegistry.appendMenuItem(CONNSubmenuId, {
	group: '2_conn',
	command: {
		id: CSV_ID,
		title: localize('conn.csv', 'CSV Files'),
	},
	order: 3,
});  // CSV.jl



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



