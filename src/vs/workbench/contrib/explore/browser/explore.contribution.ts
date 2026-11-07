/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { localize } from '../../../../../vs/nls.js';
import { MenuRegistry, MenuId } from '../../../../platform/actions/common/actions.js';
import { CommandsRegistry, ICommandService } from '../../../../platform/commands/common/commands.js';
import { ContextKeyExpr } from '../../../../platform/contextkey/common/contextkey.js';
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
import { OA_PANEL } from '../../model/browser/commands/oa.command.js';
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
import { IMF_PANEL } from '../../model/browser/commands/imf.command.js';
import { WBD_PANEL } from '../../model/browser/commands/wbd.command.js';
import { FFD_PANEL } from '../../model/browser/commands/ffd.command.js';
import { IDAT_PANEL } from '../../model/browser/commands/idat.command.js';
import { CSV_PANEL } from '../../model/browser/commands/csv.command.js';
import { SQL_PANEL } from '../../model/browser/commands/sql.command.js';
import { openHfmWebview } from '../../model/browser/commands/hfm.command.js';
import { openKgmWebview } from '../../model/browser/commands/kgm.command.js';
import { XLSX_PANEL } from '../../model/browser/commands/xlsx.command.js';
import { YFIN_PANEL } from '../../model/browser/commands/yfin.command.js';
import { ALPV_PANEL } from '../../model/browser/commands/alpv.command.js';
import { FRED_PANEL } from '../../model/browser/commands/fred.command.js';
import { ECB_PANEL } from '../../model/browser/commands/ecb.command.js';
import { EDGAR_PANEL } from '../../model/browser/commands/edgar.command.js';
import { openHfdsWebview } from '../../model/browser/commands/hfds.command.js';
import { openKgdsWebview } from '../../model/browser/commands/kgds.command.js';
import { ISecretStorageService } from '../../../../platform/secrets/common/secrets.js';
import { IFileService } from '../../../../platform/files/common/files.js';
import { IPathService } from '../../../services/path/common/pathService.js';
import { IWorkspaceContextService } from '../../../../platform/workspace/common/workspace.js';
import { ADD_FEED_COMMAND_ID, RSS_FEEDS_COMMAND_ID } from '../../monitor/browser/rssFeedsPage.js';
import { ADD_ALERT_COMMAND_ID, SHOW_ALERTS_COMMAND_ID } from '../../monitor/browser/alertsPage.js';
import { SHOW_MEDIA_COVERAGE_COMMAND_ID } from '../../monitor/browser/mediaCoveragePage.js';
import { JOURNAL_METRICS_COMMAND_ID, NEW_CONNECTION_COMMAND_ID, SHOW_CONNECTIONS_COMMAND_ID, WRDS_PAGE_COMMAND_ID } from '../../databases/common/databaseDrivers.js';
import { ASK_POLLIS_OPEN_PDF_COMMAND_ID } from '../../compose/common/askPollis.js';
import { PDF_VIEWER_OPEN_COMMAND_ID } from '../../../common/pdfViewer.js';

export const EXPL_COMMAND_ID = 'workbench.action.showExplore';
const DSTATS_ID = 'chiara.explore.dstats';
const OA_ID = 'chiara.explore.oa';
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
const IMF_ID = 'chiara.explore.adr.imf';
const WBD_ID = 'chiara.explore.adr.wbd';
const FFD_ID = 'chiara.explore.adr.ffd';
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

CommandsRegistry.registerCommand(EXPL_COMMAND_ID, () => {
	console.log('Explore command executed!');
	alert?.('Explore command executed!');
});

CommandsRegistry.registerCommand(DSTATS_ID, (accessor: ServicesAccessor) => openScaffoldWebview(accessor, DSTATS_PANEL));
CommandsRegistry.registerCommand(OA_ID, (accessor: ServicesAccessor) => openScaffoldWebview(accessor, OA_PANEL));

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
// PDF... in the + of Ask Pollis: a PDF picked, in the PDF Viewer, whose Send to Ask Pollis attaches its areas to the question
CommandsRegistry.registerCommand(ASK_POLLIS_OPEN_PDF_COMMAND_ID, (accessor: ServicesAccessor) => accessor.get(ICommandService).executeCommand(PDF_VIEWER_OPEN_COMMAND_ID));

CommandsRegistry.registerCommand(XLSX_ID, (accessor: ServicesAccessor) => openScaffoldWebview(accessor, XLSX_PANEL));

CommandsRegistry.registerCommand(YFIN_ID, (accessor: ServicesAccessor) => openScaffoldWebview(accessor, YFIN_PANEL));

CommandsRegistry.registerCommand(ALPV_ID, (accessor: ServicesAccessor) => openScaffoldWebview(accessor, ALPV_PANEL));

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

CommandsRegistry.registerCommand(FRED_ID, (accessor: ServicesAccessor) => openScaffoldWebview(accessor, FRED_PANEL));

CommandsRegistry.registerCommand(ECB_ID, (accessor: ServicesAccessor) => openScaffoldWebview(accessor, ECB_PANEL));

CommandsRegistry.registerCommand(EDGAR_ID, (accessor: ServicesAccessor) => openScaffoldWebview(accessor, EDGAR_PANEL));

CommandsRegistry.registerCommand(HMD_ID, (accessor: ServicesAccessor) => openScaffoldWebview(accessor, HMD_PANEL));

CommandsRegistry.registerCommand(IMF_ID, (accessor: ServicesAccessor) => openScaffoldWebview(accessor, IMF_PANEL));

CommandsRegistry.registerCommand(WBD_ID, (accessor: ServicesAccessor) => openScaffoldWebview(accessor, WBD_PANEL));

CommandsRegistry.registerCommand(FFD_ID, (accessor: ServicesAccessor) => openScaffoldWebview(accessor, FFD_PANEL));

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

// "Access Model Repositories" (Hugging Face and Kaggle Models) moved to Compose > Local AI Models (compose.contribution.ts)

// Explore > Access Files (its id kept from its earlier name, for the panel index and the Views)
const CONNSubmenuId = new MenuId('menubarCONNSubmenu');

// Define a new submenu ID for "Data Visualization"
const DVSubmenuId = new MenuId('menubarDVSubmenu');

// Define a new submenu ID for "Descriptive and Online Statistics"
const DOSSubmenuId = new MenuId('menubarDOSSubmenu');

// Define a new submenu ID for "Anomalies and Novelties"
const ANSubmenuId = new MenuId('menubarANSubmenu');

// ===================================================
// TOP-LEVEL EXPLORE MENU STRUCTURE
// ===================================================

MenuRegistry.appendMenuItem(MenuId.MenubarExploreMenu, {
	group: '1_explore',
	submenu: ADRSubmenuId,
	title: localize('showExplore.adr', 'Access Data Libraries'),
	order: 2,
});

MenuRegistry.appendMenuItem(MenuId.MenubarExploreMenu, {
	group: '1_explore',
	submenu: CONNSubmenuId,
	title: localize('showExplore.files', 'Access Files'),
	order: 3,
});

// Explore > Access Databases, below Access Files, in a place of its own, as Pollis keeps its own databases (the
// Databases view): the connection form opened on each database engine, in alphabetical order, then on ODBC, which
// reaches the others, then the Connections of the Databases view and the SQL Databases panel
const ADBSubmenuId = new MenuId('menubarADBSubmenu');

MenuRegistry.appendMenuItem(MenuId.MenubarExploreMenu, {
	group: '1_explore',
	submenu: ADBSubmenuId,
	title: localize('showExplore.databases', "Access Databases"),
	order: 4,
});

MenuRegistry.appendMenuItem(ADBSubmenuId, {
	group: '1_connect',
	command: { id: `${NEW_CONNECTION_COMMAND_ID}.duckdb`, title: localize('showExplore.connectDuckDB', "Connect to DuckDB...") },
	order: 1,
});

MenuRegistry.appendMenuItem(ADBSubmenuId, {
	group: '1_connect',
	command: { id: `${NEW_CONNECTION_COMMAND_ID}.postgres`, title: localize('showExplore.connectPostgres', "Connect to PostgreSQL...") },
	order: 2,
});

MenuRegistry.appendMenuItem(ADBSubmenuId, {
	group: '1_connect',
	command: { id: `${NEW_CONNECTION_COMMAND_ID}.sqlite`, title: localize('showExplore.connectSQLite', "Connect to SQLite...") },
	order: 3,
});

MenuRegistry.appendMenuItem(ADBSubmenuId, {
	group: '2_odbc',
	command: { id: `${NEW_CONNECTION_COMMAND_ID}.odbc`, title: localize('showExplore.connectODBC', "Connect via ODBC...") },
	order: 1,
});

MenuRegistry.appendMenuItem(ADBSubmenuId, {
	group: '3_manage',
	command: { id: SHOW_CONNECTIONS_COMMAND_ID, title: localize('showExplore.showConnections', "Show Connections") },
	order: 1,
});

MenuRegistry.appendMenuItem(ADBSubmenuId, {
	group: '3_manage',
	command: { id: SQL_ID, title: localize('showExplore.sqlDatabases', "SQL Databases") },
	order: 2,
});  // DuckDB.jl

// Explore > RSS and Explore > Alerts: what Pollis watches for the user, after Access Databases.
const RssSubmenuId = new MenuId('menubarRssSubmenu');
const AlertsSubmenuId = new MenuId('menubarAlertsSubmenu');

MenuRegistry.appendMenuItem(MenuId.MenubarExploreMenu, {
	group: '2_explore',
	submenu: RssSubmenuId,
	title: localize('monitor.rssSubmenu', "RSS"),
	order: 4,
});

MenuRegistry.appendMenuItem(MenuId.MenubarExploreMenu, {
	group: '2_explore',
	submenu: AlertsSubmenuId,
	title: localize('monitor.alertsSubmenu', "Alerts"),
	order: 5,
});

// Explore > Media Coverage: what the news and social media said, after RSS and Alerts
MenuRegistry.appendMenuItem(MenuId.MenubarExploreMenu, {
	group: '2_explore',
	command: { id: SHOW_MEDIA_COVERAGE_COMMAND_ID, title: localize('monitor.mediaCoverage', "Media Coverage") },
	order: 6,
});

MenuRegistry.appendMenuItem(RssSubmenuId, {
	group: '1_rss',
	command: { id: RSS_FEEDS_COMMAND_ID, title: localize('monitor.rssFeeds', "RSS Feeds") },
	order: 1,
});

MenuRegistry.appendMenuItem(RssSubmenuId, {
	group: '1_rss',
	command: { id: ADD_FEED_COMMAND_ID, title: localize('monitor.addFeed', "Add Feed...") },
	order: 2,
});

MenuRegistry.appendMenuItem(RssSubmenuId, {
	group: '2_journals',
	command: { id: JOURNAL_METRICS_COMMAND_ID, title: localize('monitor.journalMetrics', "Journal Metrics") },
	order: 1,
});

MenuRegistry.appendMenuItem(AlertsSubmenuId, {
	group: '1_alerts',
	command: { id: SHOW_ALERTS_COMMAND_ID, title: localize('monitor.alerts', "Alerts") },
	order: 1,
});

MenuRegistry.appendMenuItem(AlertsSubmenuId, {
	group: '1_alerts',
	command: { id: ADD_ALERT_COMMAND_ID, title: localize('monitor.addAlert', "Add Alert...") },
	order: 2,
});

MenuRegistry.appendMenuItem(MenuId.MenubarExploreMenu, {
	group: '3_explore',
	submenu: DVSubmenuId,
	title: localize('showExplore.dv', 'Visualise'),
	order: 1,
});

MenuRegistry.appendMenuItem(MenuId.MenubarExploreMenu, {
	group: '3_explore',
	submenu: DOSSubmenuId,
	title: localize('showExplore.dos', 'Descriptive and Online Statistics'),
	order: 2,
});

MenuRegistry.appendMenuItem(DOSSubmenuId, {
	group: '1_dos',
	command: { id: DSTATS_ID, title: localize('eda.ds', 'Descriptive Statistics') },
	order: 1,
}); // StatsBase.jl + FreqTables.jl + Statistics.jl

MenuRegistry.appendMenuItem(DOSSubmenuId, {
	group: '1_dos',
	command: { id: OA_ID, title: localize('eda.oa', 'Online Statistics') },
	order: 2,
}); // OnlineStats.jl

MenuRegistry.appendMenuItem(MenuId.MenubarExploreMenu, {
	group: '3_explore',
	submenu: ANSubmenuId,
	title: localize('showExplore.an', 'Detect Anomalies'),
	order: 3,
}); // OutlierDetection.jl

MenuRegistry.appendMenuItem(MenuId.MenubarExploreMenu, {
	group: '3_explore',
	command: { id: NOVD_ID, title: localize('showExplore.novd', 'Detect Novelties') },
	order: 3.5,
}); // LIBSVM.jl + OnlineStats.jl + ChangePointDetection.jl

MenuRegistry.appendMenuItem(MenuId.MenubarExploreMenu, {
	group: '3_explore',
	command: { id: HMD_ID, title: localize('showExplore.hmd', 'Handle Missing Data') },
	order: 4,
}); // Impute.jl


MenuRegistry.appendMenuItem(MenuId.MenubarExploreMenu, {
	group: '3_explore',
	command: { id: IDAT_ID, title: localize('eda.interpolation', 'Interpolate Data') },
	order: 5,
}); // Interpolations.jl + Dierckx.jl

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

// The databases of finance, accounting and economics research, on WRDS's PostgreSQL server (databases/browser/wrdsPage.ts)
MenuRegistry.appendMenuItem(ADRSubmenuId, {
	group: '2_ds',
	command: { id: WRDS_PAGE_COMMAND_ID, title: localize('ft.wrds', "Wharton Research Data Services (WRDS)") },
	order: 4,
}); // LibPQ.jl

// Regulatory filings

MenuRegistry.appendMenuItem(ADRSubmenuId, {
	group: '4_ds',
	command: {
		id: FRED_ID,
		title: localize('mt.fred', 'Federal Reserve Economic Data (FRED)'),
	},
	order: 2,
}); // Fred.jl

MenuRegistry.appendMenuItem(ADRSubmenuId, {
	group: '4_ds',
	command: {
		id: ECB_ID,
		title: localize('mt.ecb', 'European Central Bank Data Portal'),
	},
	order: 3,
}); // European Central Bank

// Research and institutional datasets

MenuRegistry.appendMenuItem(ADRSubmenuId, {
	group: '4_ds',
	command: {
		id: IMF_ID,
		title: localize('mt.ifm', 'International Monetary Fund Datasets'),
	},
	order: 4,
}); // IMF SDMX API (HTTP.jl + CSV.jl)

MenuRegistry.appendMenuItem(ADRSubmenuId, {
	group: '4_ds',
	command: {
		id: WBD_ID,
		title: localize('mt.wbd', 'World Bank Indicators'),
	},
	order: 5,
}); // WorldBankData.jl

MenuRegistry.appendMenuItem(ADRSubmenuId, {
	group: '4_ds',
	command: {
		id: FFD_ID,
		title: localize('mt.french', 'Kenneth French Data Library'),
	},
	order: 6,
}); // FamaFrenchData.jl

// ===================================================
// SUBMENU: ACCESS FILES
// The formats by kind, one group each: tables, maps, sound and voice, music, and Life Sciences, a submenu
// of its own for the many formats of medicine and biology.
// ===================================================

/** The precondition of a format not built yet: never met, so the menu shows it greyed out. */
const NOT_YET_AVAILABLE = ContextKeyExpr.false();

// The formats Pollis reads, each written out, as the panel index (build/pollis/makePanelIndex.ts) reads them
MenuRegistry.appendMenuItem(CONNSubmenuId, {
	group: '1_tables',
	command: { id: CSV_ID, title: localize('conn.csv', 'CSV Files') },
	order: 1,
});  // CSV.jl

MenuRegistry.appendMenuItem(CONNSubmenuId, {
	group: '1_tables',
	command: { id: XLSX_ID, title: localize('conn.excel', 'Excel Workbooks') },
	order: 2,
});  // XLSX.jl

// Access Files > Life Sciences: a few of the most common formats of each family, the rest to come with the toolboxes
// of their fields, which can add theirs to this submenu
const LifeSciencesSubmenuId = new MenuId('menubarLifeSciencesSubmenu');
MenuRegistry.appendMenuItem(CONNSubmenuId, {
	group: '6_life',
	submenu: LifeSciencesSubmenuId,
	title: localize('conn.lifeSciences', 'Life Sciences'),
	order: 1,
});

// The formats not built yet, greyed out in their groups, after those Pollis reads
const FORMATS_TO_COME: readonly { readonly menu: MenuId; readonly group: string; readonly first: number; readonly items: readonly { readonly id: string; readonly title: string }[] }[] = [
	{
		menu: CONNSubmenuId, group: '1_tables', first: 3, items: [
			{ id: 'chiara.explore.conn.parquet', title: localize('conn.parquet', 'Parquet Files') },
			{ id: 'chiara.explore.conn.json', title: localize('conn.json', 'JSON Files') },
		]
	},
	{
		menu: CONNSubmenuId, group: '3_maps', first: 1, items: [
			{ id: 'chiara.explore.conn.geojson', title: localize('conn.geojson', 'GeoJSON Files') },
			{ id: 'chiara.explore.conn.shapefile', title: localize('conn.shapefile', 'Shapefiles') },
			{ id: 'chiara.explore.conn.geopackage', title: localize('conn.geopackage', 'GeoPackage Files') },
		]
	},
	{
		// Recordings: sound in general, and the formats of voice
		menu: CONNSubmenuId, group: '4_sound', first: 1, items: [
			{ id: 'chiara.explore.conn.wav', title: localize('conn.wav', 'WAV Files') },
			{ id: 'chiara.explore.conn.mp3', title: localize('conn.mp3', 'MP3 Files') },
			{ id: 'chiara.explore.conn.m4a', title: localize('conn.m4a', 'M4A Files') },
			{ id: 'chiara.explore.conn.opus', title: localize('conn.opus', 'Opus Files') },
			{ id: 'chiara.explore.conn.textgrid', title: localize('conn.textgrid', 'Praat TextGrids') },
		]
	},
	{
		// Scores: written notes rather than recorded sound
		menu: CONNSubmenuId, group: '5_music', first: 1, items: [
			{ id: 'chiara.explore.conn.midi', title: localize('conn.midi', 'MIDI Files') },
			{ id: 'chiara.explore.conn.musicxml', title: localize('conn.musicxml', 'MusicXML Files') },
		]
	},
	{
		// Medical imaging: MRI, CT and X-ray
		menu: LifeSciencesSubmenuId, group: '1_imaging', first: 1, items: [
			{ id: 'chiara.explore.conn.dicom', title: localize('conn.dicom', 'DICOM Files') },
			{ id: 'chiara.explore.conn.nifti', title: localize('conn.nifti', 'NIfTI Files') },
		]
	},
	{
		// Biosignals: ECG, EEG and sleep
		menu: LifeSciencesSubmenuId, group: '2_signals', first: 1, items: [
			{ id: 'chiara.explore.conn.edf', title: localize('conn.edf', 'EDF Files') },
			{ id: 'chiara.explore.conn.wfdb', title: localize('conn.wfdb', 'WFDB Records') },
		]
	},
	{
		// DNA and genomics
		menu: LifeSciencesSubmenuId, group: '3_genomics', first: 1, items: [
			{ id: 'chiara.explore.conn.fasta', title: localize('conn.fasta', 'FASTA and FASTQ Files') },
			{ id: 'chiara.explore.conn.vcf', title: localize('conn.vcf', 'VCF Files') },
		]
	},
	{
		// Clinical records
		menu: LifeSciencesSubmenuId, group: '4_clinical', first: 1, items: [
			{ id: 'chiara.explore.conn.fhir', title: localize('conn.fhir', 'FHIR Resources') },
		]
	},
];

for (const { menu, group, first, items } of FORMATS_TO_COME) {
	items.forEach((item, index) => MenuRegistry.appendMenuItem(menu, {
		group,
		command: { id: item.id, title: item.title, precondition: NOT_YET_AVAILABLE },
		order: first + index,
	}));
}


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

