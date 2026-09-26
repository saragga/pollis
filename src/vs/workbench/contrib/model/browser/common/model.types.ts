/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

export interface IModelPaper {
	readonly title: string;
	readonly authors: string;
	readonly year: number;
	readonly journal?: string;
	readonly doi?: string;
	readonly url?: string;
	readonly googleScholar?: string;
	readonly googleScholarCited?: number;
	readonly openAccess: boolean;
}

export interface IModelVideo {
	readonly title: string;
	readonly description?: string;
	readonly url: string;
}

export interface IModelPackage {
	readonly name: string;
	readonly github: string;
	readonly papers: IModelPaper[];
	readonly videos?: IModelVideo[];
	readonly license?: string;
}

export type IModelNotebook =
	| { readonly name: string; readonly description: string; readonly file: string; readonly bundled: true }
	| { readonly name: string; readonly description: string; readonly url: string; readonly bundled: false };

export type IModelWiki =
	| { readonly name: string; readonly description?: string; readonly file: string; readonly bundled: true }
	| { readonly name: string; readonly description?: string; readonly url: string; readonly bundled: false }
	| { readonly separator: true; readonly label?: string };

export type IModelReference = IModelPaper | { readonly separator: true; readonly label?: string };

export interface IModelNotebookSection {
	readonly label: string;
	readonly notebooks: IModelNotebook[];
}

/**
 * A node in a webview's concept map, rendered as a Mermaid graph node.
 *
 * `kind` drives styling: `center` is the webview itself; `concept` is an abstract
 * grouping (no jump); `topic` is one of the webview's own toggles; `related` is
 * another Pollis webview; `external` is an outside resource.
 *
 * At most one jump target should be set: `model` switches a toggle within the same
 * webview (client-side), `topic`/command executes a Pollis command (opens another
 * webview), and `url` opens an external link. Plain `concept` nodes set none.
 */
export interface IConceptMapNode {
	readonly id: string;
	readonly label: string;
	readonly kind?: 'center' | 'concept' | 'topic' | 'related' | 'external';
	readonly model?: string;
	readonly command?: string;
	readonly url?: string;
}

/** A directed, optionally-labelled relationship between two concept-map nodes. */
export interface IConceptMapEdge {
	readonly from: string;
	readonly to: string;
	readonly label?: string;
}

/** A relationship graph shown (via Mermaid) in the Learn More → Concept Maps panel. */
export interface IConceptMap {
	readonly center: string;
	readonly nodes: IConceptMapNode[];
	readonly edges: IConceptMapEdge[];
}

/** A bullet point in the webview subtitle list. */
export interface IModelBullet {
	readonly text: string;
	readonly detail: string;
}

/** A row in the decision/comparison table. */
export interface IModelDecisionRow {
	readonly task: string;
	readonly context: string;
	readonly purpose: string;
}

/** One selectable chip in an explore-pane group (a Hub filter value). */
export interface IModelExploreChip {
	readonly label: string;
	readonly value: string;
	/** Optional hover tooltip explaining the chip (e.g. what a Benchmark dataset is). */
	readonly tooltip?: string;
}

/**
 * One collapsible group of chips in the interactive "Explore" pane (e.g. the
 * "Computer Vision" sub-group of Task, or the "Domain" group). Groups that share
 * the same `axis` are OR-ed together in the query; different axes are AND-ed — so
 * the several Task sub-groups all behave as one Task filter. `filterPrefix` is
 * prepended to each chip `value` to form the Hub filter token (e.g.
 * `task_categories:` + `image-classification`); leave empty for plain tags.
 * `separatorBefore` draws a divider above the group header (e.g. before Domain).
 */
export interface IModelExploreGroup {
	readonly axis: string;
	readonly label: string;
	readonly filterPrefix: string;
	readonly separatorBefore?: boolean;
	/**
	 * Render this group as a single flat checkbox (no collapsible header) using its one
	 * chip — for a standalone, un-grouped binary criterion that AND-s with the other axes.
	 * A `toggle` group must contain exactly one chip. (Prefer a normal collapsible category
	 * when you have two or more related single filters — OR-within usually reads better.)
	 */
	readonly toggle?: boolean;
	readonly chips: IModelExploreChip[];
}

/**
 * Declarative description of the interactive Explore pane that can replace the
 * Illustration pane: a labelled, ordered list of collapsible groups whose checked
 * chips drive a live Hub query.
 */
export interface IModelExplorePane {
	readonly label: string;
	readonly groups: IModelExploreGroup[];
}

/** Optional HTML rendered above (`intro`) and/or below (`footnote`) a collapsible content pane. */
export interface IModelPaneNote {
	readonly intro?: string;
	readonly footnote?: string;
}

/**
 * Per-pane intro/footnote notes, declared once under `[notes]` in TOML and keyed by pane.
 * Every field is optional and inert when absent — most webviews carry none.
 */
export interface IModelPaneNotes {
	readonly keyPoints?: IModelPaneNote;
	readonly decision?: IModelPaneNote;
	readonly explore?: IModelPaneNote;
}

/** An SVG mini-chart function body for a model toggle (raw JS string). */
export interface IModelMiniChart {
	readonly model: string;
	readonly svg: string;
}

/** A plain-text code example for a model toggle (Julia source). */
export interface IModelCodeBranch {
	readonly model: string;
	readonly code: string;
}

/** A single action inside a Next Steps action group. */
export interface IModelAction {
	readonly id: string;
	readonly label: string;
	readonly desc: string;
	readonly code: string;
}

/** A Next Steps action group shown in the right panel. */
export interface IModelActionGroup {
	readonly id: string;
	readonly label: string;
	readonly actions: IModelAction[];
}
