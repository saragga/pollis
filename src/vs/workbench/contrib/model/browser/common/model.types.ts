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

/**
 * A plain-text code example for a model toggle (Julia source). `model = "*"` is the fallback
 * branch for every model without its own. The code may use input placeholders (see {@link IModelInput}).
 */
export interface IModelCodeBranch {
	readonly model: string;
	readonly code: string;
}

/** A model toggle (tab) of a scaffold panel, in display order (declared as `[[models]]` in TOML). */
export interface IModelToggle {
	readonly id: string;
	readonly label: string;
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

/** One choice of a `select` input. `models` limits it to those model toggles (default: all). */
export interface IModelInputOption {
	readonly value: string;
	readonly label: string;
	/** Offer the choice only for these model toggles. Default: all. */
	readonly models?: string[];
	/** Offer the choice only while another input matches, as `id=a|b` or `id!=a|b`. */
	readonly when?: string;
}

/**
 * A parameter input shown above the Example Code box (declared as `[[inputs]]` in TOML).
 * Code branches and Next Steps examples reference it as `{{id}}`, which becomes the typed
 * value (or `default` when empty) for a text input and the selected value for a select.
 * A code line starting with `{{?id=a|b}}` (or `{{?id!=a|b}}`) is kept only when the
 * input's value is (or is not) one of the listed values; `{{model}}` is the current model.
 */
export interface IModelInput {
	readonly id: string;
	readonly label: string;
	readonly tooltip?: string;
	/** Default: `text`. */
	readonly kind?: 'text' | 'select';
	/** Placeholder and fallback value of a text input, or the initially selected choice of a select. */
	readonly default?: string;
	/** The choices of a select input; `default`, else the first one available for the model, is chosen initially. */
	readonly options?: IModelInputOption[];
	/** Show the input only for these model toggles. Default: all. */
	readonly models?: string[];
	/** Show the input only while another input matches, as `id=a|b` or `id!=a|b`. */
	readonly when?: string;
	/** Start a new form row with this input. */
	readonly newRow?: boolean;
}

/** The declarative content of a panel built on the shared scaffold (generated from its TOML). */
export interface IScaffoldPanelData {
	readonly packages: IModelPackage[];
	readonly notebooks: IModelNotebook[];
	readonly notebookSections: IModelNotebookSection[];
	readonly wikis: IModelWiki[];
	readonly references: IModelReference[];
	/** The model toggles. Default: one per code branch, labelled with its capitalised model id. */
	readonly models?: IModelToggle[];
	readonly bullets?: IModelBullet[];
	readonly decisionRows?: IModelDecisionRow[];
	readonly miniCharts?: IModelMiniChart[];
	readonly codeBranches?: IModelCodeBranch[];
	readonly actionGroups?: IModelActionGroup[];
	readonly inputs?: IModelInput[];
}
