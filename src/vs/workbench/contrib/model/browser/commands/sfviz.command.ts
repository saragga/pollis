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
import { getMermaidUris } from '../../../mermaid/browser/mermaidHelper.js';
import { ISfvizMetadata } from '../common/sfviz.types.js';
import { IModelReference, IModelNotebookSection } from '../common/model.types.js';
import { INotebookEditorModelResolverService } from '../../../notebook/common/notebookEditorModelResolverService.js';
import { INotebookKernelService } from '../../../notebook/common/notebookKernelService.js';
import { ILanguageService } from '../../../../../editor/common/languages/language.js';
import { IThemeService } from '../../../../../platform/theme/common/themeService.js';
import { IFileService } from '../../../../../platform/files/common/files.js';
import { IPathService } from '../../../../services/path/common/pathService.js';
import { IWorkspaceContextService } from '../../../../../platform/workspace/common/workspace.js';
import { registerSfvizWebviewHandlers } from '../handlers/sfviz.handler.js';
import { getSfvizHtml } from '../webviews/sfviz.template.js';

const SFVIZ_VIEW_TYPE = 'pollis.sfviz';
const SFVIZ_TITLE = 'Surfaces and Fields';

const SFVIZ_REFERENCES: IModelReference[] = [
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
		title: 'Makie.jl: Flexible High-Performance Plotting for Julia',
		authors: 'Danisch, Simon; Krumbiegel, Julius',
		year: 2021,
		journal: 'Journal of Open Source Software',
		doi: '10.21105/joss.03349',
		openAccess: true,
	},
	{
		title: 'CairoMakie.jl and GLMakie.jl: Makie Backends',
		authors: 'Makie contributors',
		year: 2023,
		journal: 'GitHub',
		url: 'https://github.com/MakieOrg/Makie.jl',
		openAccess: true,
	},
	{ separator: true, label: 'Textbooks' },
	{
		title: 'The Visualization Handbook',
		authors: 'Hansen, Charles D.; Johnson, Chris R. (eds.)',
		year: 2005,
		journal: 'Academic Press',
		doi: '10.1016/B978-0-12-387582-2.X5000-5',
		openAccess: false,
	},
	{
		title: 'Visualization Analysis and Design',
		authors: 'Munzner, Tamara',
		year: 2014,
		journal: 'CRC Press',
		url: 'https://www.cs.ubc.ca/~tmm/vadbook/',
		openAccess: false,
	},
	{ separator: true, label: 'Original Papers' },
	{
		title: 'Marching Cubes: A High Resolution 3D Surface Construction Algorithm',
		authors: 'Lorensen, William E.; Cline, Harvey E.',
		year: 1987,
		journal: 'ACM SIGGRAPH Computer Graphics',
		doi: '10.1145/37402.37422',
		openAccess: false,
	},
	{
		title: 'Display of Surfaces from Volume Data',
		authors: 'Levoy, Marc',
		year: 1988,
		journal: 'IEEE Computer Graphics and Applications',
		doi: '10.1109/38.511',
		openAccess: false,
	},
];

export const SFVIZ_NOTEBOOK_SECTIONS: IModelNotebookSection[] = [
	{
		label: 'Surfaces and Fields',
		notebooks: [
			{ name: 'Contour Plot',  file: 'sfviz/tutorial-01-contour.ipynb',   bundled: true, description: 'Isolines of a 2D scalar field with CairoMakie; levels, labels, and filled contours' },
			{ name: '3D Contour',    file: 'sfviz/tutorial-02-contour3d.ipynb',  bundled: true, description: 'Lift contours onto a 3D axis and draw isosurfaces of a 3D field with GLMakie' },
			{ name: 'Surface',       file: 'sfviz/tutorial-03-surface.ipynb',    bundled: true, description: 'Render f(x, y) as an interactive height map on an Axis3 with GLMakie' },
			{ name: 'Volume',        file: 'sfviz/tutorial-04-volume.ipynb',     bundled: true, description: 'Visualise a 3D scalar field as nested isosurfaces / a translucent volume with GLMakie' },
			{ name: 'Phase Portrait', file: 'sfviz/tutorial-05-phase.ipynb',     bundled: true, description: 'Trace the flow of a 2D dynamical system with streamplot (CairoMakie or GLMakie)' },
			{ name: 'Mesh',          file: 'sfviz/tutorial-06-mesh.ipynb',       bundled: true, description: 'Build an explicit surface from vertices and faces with GeometryBasics and GLMakie' },
			{ name: 'Voxels',        file: 'sfviz/tutorial-07-voxels.ipynb',     bundled: true, description: 'Draw each cell of a 3D grid as a coloured cube with GLMakie' },
		],
	},
];

const SFVIZ_METADATA: ISfvizMetadata = {
	sfviz: {
		packages: [
			{ name: 'Makie.jl',      github: 'https://github.com/MakieOrg/Makie.jl',       papers: [] },
			{ name: 'CairoMakie.jl', github: 'https://github.com/MakieOrg/Makie.jl/tree/master/CairoMakie',   papers: [] },
			{ name: 'GLMakie.jl',    github: 'https://github.com/MakieOrg/Makie.jl/tree/master/GLMakie',      papers: [] },
			{ name: 'GeometryBasics.jl', github: 'https://github.com/JuliaGeometry/GeometryBasics.jl',         papers: [] },
		],
		notebookSections: SFVIZ_NOTEBOOK_SECTIONS,
		notebooks: SFVIZ_NOTEBOOK_SECTIONS.flatMap(s => s.notebooks),
		wikis: [
			{ name: 'Factsheet',      description: 'Quick-reference: plot types, Julia packages, and when to use each',       file: 'sfviz/factsheet.md',      bundled: true },
			{ name: 'Overview',       description: 'When to use surface and field visualisations',                              file: 'sfviz/overview.md',        bundled: true },
			{ name: 'Assumptions',    description: 'Data requirements for scalar fields, vector fields, and explicit geometry', file: 'sfviz/assumptions.md',     bundled: true },
			{ name: 'Diagnostics',    description: 'Detecting artefacts, sampling issues, and misleading 3D perspectives',     file: 'sfviz/diagnostics.md',     bundled: true },
			{ name: 'Interpretation', description: 'How to read isosurfaces, flow fields, and volumetric data',                 file: 'sfviz/interpretation.md',  bundled: true },
			{ name: 'Decision Guide', description: 'Which surface or field plot fits your dimensionality and data type',        file: 'sfviz/decision-guide.md',  bundled: true },
			{ separator: true, label: 'Plot Types' },
			{ name: 'Contour Plot',   description: 'Iso-level curves of a scalar field f(x, y)',                               file: 'sfviz/contour.md',     bundled: true },
			{ name: '3D Contour',     description: 'Iso-level surfaces of a scalar field f(x, y, z)',                          file: 'sfviz/contour3d.md',   bundled: true },
			{ name: 'Surface',        description: 'Explicit surface z = f(x, y) rendered in 3D',                             file: 'sfviz/surface.md',     bundled: true },
			{ name: 'Volume',         description: 'Volumetric data rendered with opacity and colour transfer functions',       file: 'sfviz/volume.md',      bundled: true },
			{ name: 'Phase Portrait', description: 'Trajectory and fixed-point structure of a 2D dynamical system',            file: 'sfviz/phase.md',       bundled: true },
			{ name: 'Mesh',           description: 'Explicit triangulated surface or 3D mesh geometry',                        file: 'sfviz/mesh.md',        bundled: true },
			{ name: 'Voxels',         description: 'Discrete 3D grid of scalar values shown as coloured cubes',                file: 'sfviz/voxels.md',      bundled: true },
		],
		references: SFVIZ_REFERENCES,
		conceptMap: {
			center: 'Surfaces and Fields',
			nodes: [
				{ id: 'root', label: 'Surfaces and Fields', kind: 'center' },
				{ id: 'q_s2d', label: 'Scalar field f(x, y)', kind: 'concept' },
				{ id: 'q_s3d', label: 'Scalar field f(x, y, z)', kind: 'concept' },
				{ id: 'q_vec', label: 'Vector field', kind: 'concept' },
				{ id: 'q_geom', label: 'Explicit geometry', kind: 'concept' },
				{ id: 'contour', label: 'Contour', kind: 'topic', model: 'contour' },
				{ id: 'contour3d', label: '3D Contour', kind: 'topic', model: 'contour3d' },
				{ id: 'surface', label: 'Surface', kind: 'topic', model: 'surface' },
				{ id: 'volume', label: 'Volume', kind: 'topic', model: 'volume' },
				{ id: 'phase', label: 'Phase Portrait', kind: 'topic', model: 'phase' },
				{ id: 'mesh', label: 'Mesh', kind: 'topic', model: 'mesh' },
				{ id: 'voxels', label: 'Voxels', kind: 'topic', model: 'voxels' },
				{ id: 'r_mviz', label: 'Multivariate Plots', kind: 'related', command: 'chiara.explore.dvmulti.heatmap' },
				{ id: 'r_gsviz', label: 'Graph and Spatial', kind: 'related', command: 'chiara.explore.dvgs.choropleth' },
				{ id: 'ext', label: 'Makie.jl', kind: 'external', url: 'https://github.com/MakieOrg/Makie.jl' },
			],
			edges: [
				{ from: 'root', to: 'q_s2d', label: 'asks about' },
				{ from: 'root', to: 'q_s3d', label: 'asks about' },
				{ from: 'root', to: 'q_vec', label: 'asks about' },
				{ from: 'root', to: 'q_geom', label: 'asks about' },
				{ from: 'q_s2d', to: 'contour', label: 'level sets in' },
				{ from: 'q_s2d', to: 'surface', label: 'as height in' },
				{ from: 'q_s3d', to: 'contour3d', label: 'isosurfaces in' },
				{ from: 'q_s3d', to: 'volume', label: 'by opacity in' },
				{ from: 'q_s3d', to: 'voxels', label: 'as cells in' },
				{ from: 'q_vec', to: 'phase', label: 'streamlines in' },
				{ from: 'q_geom', to: 'mesh', label: 'triangles in' },
				{ from: 'q_s2d', to: 'r_mviz', label: 'as a heatmap in' },
				{ from: 'q_geom', to: 'r_gsviz', label: 'on a map in' },
				{ from: 'root', to: 'ext', label: 'plotted with' },
			],
		},
	},
};

export function openSfvizWebview(
	webviewWorkbenchService: IWebviewWorkbenchService,
	openerService: IOpenerService,
	editorService: IEditorService,
	quickInputService: IQuickInputService,
	commandService: ICommandService,
	clipboardService: IClipboardService,
	notificationService: INotificationService,
	notebookEditorModelResolverService: INotebookEditorModelResolverService,
	notebookKernelService: INotebookKernelService,
	languageService: ILanguageService,
	themeService: IThemeService,
	fileService: IFileService,
	pathService: IPathService,
	workspaceContextService: IWorkspaceContextService,
	initialModel?: string,
): void {
	const mermaid = getMermaidUris();
	const webviewInput = webviewWorkbenchService.openWebview(
		{
			title: SFVIZ_TITLE,
			options: { retainContextWhenHidden: true },
			contentOptions: { allowScripts: true, localResourceRoots: [mermaid.distRoot] },
			extension: undefined,
		},
		SFVIZ_VIEW_TYPE,
		SFVIZ_TITLE,
		undefined,
		{ group: undefined, preserveFocus: false }
	);

	webviewInput.webview.setHtml(getSfvizHtml(mermaid.js));

	registerSfvizWebviewHandlers(
		webviewInput,
		SFVIZ_METADATA,
		openerService,
		editorService,
		quickInputService,
		commandService,
		clipboardService,
		notificationService,
		notebookEditorModelResolverService,
		notebookKernelService,
		languageService,
		themeService,
		fileService,
		pathService,
		workspaceContextService,
		initialModel,
	);
}
