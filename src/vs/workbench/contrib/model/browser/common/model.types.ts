/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

export interface IModelPaper {
	/** The work's key in PollisReferences.jl, e.g. `FF1993a`. */
	readonly key?: string;
	readonly title: string;
	readonly authors: string;
	readonly year: number;
	/** The venue: a journal, a conference's proceedings or book, a publisher or an institution. */
	readonly journal?: string;
	/** The BibTeX entry type, as the references database states it. */
	readonly type?: 'article' | 'book' | 'inproceedings' | 'incollection' | 'techreport' | 'phdthesis' | 'misc' | 'video' | 'audio' | 'speech';
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
	/** A fork of a registered package: install from `github` instead of the registry. */
	readonly fork?: boolean;
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
 * Declarative description of the interactive Explore pane: a labelled, ordered list
 * of collapsible groups whose checked chips drive a live Hub query.
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
	/** List the action only for these model toggles. Default: all. */
	readonly models?: string[];
	/** List the action only while an input matches, as `id=a|b` or `id!=a|b`. */
	readonly when?: string;
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
	/** List the choice greyed: it cannot be chosen. */
	readonly disabled?: boolean;
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
	/** Default: `text`. A `textarea` holds several lines, e.g. a SQL query; a code line that uses it becomes one line per line of the value. `tabs` is a select shown as a row of tabs just above the code box. */
	readonly kind?: 'text' | 'select' | 'textarea' | 'tabs';
	/** Placeholder and fallback value of a text input, the initial content of a textarea, or the initially selected choice of a select. */
	readonly default?: string;
	/** The choices of a select input; `default`, else the first one available for the model, is chosen initially. */
	readonly options?: IModelInputOption[];
	/** Show the input only for these model toggles. Default: all. */
	readonly models?: string[];
	/** Show the input only while another input matches, as `id=a|b` or `id!=a|b`; join several conditions with `&`. */
	readonly when?: string;
	/** Start a new form row with this input. */
	readonly newRow?: boolean;
	/**
	 * A text input with an Alert Me... button beside it, which opens Add Alert with its value filled in: a Yahoo Finance
	 * symbol for an alert on its quote, a company's CIK for an alert on its SEC filings, or a series of FRED, the ECB,
	 * the IMF or the World Bank for an alert on its new values.
	 */
	readonly alertMe?: 'quote' | 'filings' | 'fred' | 'ecb' | 'imf' | 'worldBank';
	/** What Alert Me... opens Add Alert with when it is more than the input's value, with `{{id}}` placeholders: `{{country}}/{{indicator}}`. */
	readonly alertValue?: string;
	/**
	 * A text input for a local model file, with Choose... beside it, which opens the Julia extension's picker of the chat
	 * or embedding models on this computer and on Hugging Face. Its value is a path or `hf:owner/repo/file.gguf`.
	 */
	readonly modelFile?: 'chat' | 'embedding';
	/**
	 * A text input for a folder, with Choose... beside it, which opens the folder picker. When a Pollis Workspace is
	 * open, its default is this path in the workspace, whose first part is the kind of folder, as `programs/executables`;
	 * otherwise it is `default`. The code reads it as `expanduser(raw"{{id}}")`.
	 */
	readonly folder?: string;
	/** False leaves Choose... out beside a `folder` input: a plain text input, whose default still follows the Pollis Workspace. */
	readonly chooseFolder?: boolean;
}

/**
 * A question of the FAQ of a panel, its `[[faq]]` table, with the answer its author gives: shown in Learn More, and a
 * question of the Panel FAQ test set of Evaluate Answering Models. `wiki`, the name of the wiki that answers it, lets
 * the evaluation check that its passage was found. A `hidden` one is a question of the test set only: it never
 * reaches the panel.
 */
/**
 * A question of a panel's FAQ as the Panel FAQ test set of Evaluate Answering Models holds it, an IAskPollisEvalItem:
 * the panel it is asked in, and the file of the wiki that answers it, as `boot/assumptions.md`.
 */
export interface IModelFaqItem {
	readonly source: string;
	readonly context: string;
	readonly question: string;
	readonly answer: string;
	readonly panel: { readonly title: string; readonly packages: readonly string[]; readonly references?: readonly string[]; readonly card?: string };
	readonly wikiFile?: string;
	readonly hidden?: boolean;
	/** A closed question, a hidden one of the FAQ: its options in the order they are asked, `answer` the right one, at `rightChoice`. */
	readonly choices?: readonly string[];
	readonly rightChoice?: number;
	/** Why the right option is right, when the author wrote it. */
	readonly explanation?: string;
}

/**
 * A question of the `[[faq]]` table of a panel. A shown one, which Learn More shows, has its answer; a hidden one is a
 * closed question of the Panel FAQ test set: `answer` is its right option, `wrong` the others.
 */
export interface IModelFaq {
	readonly question: string;
	readonly answer: string;
	readonly wiki?: string;
	readonly hidden?: boolean;
	readonly wrong?: readonly string[];
	readonly explanation?: string;
}

/**
 * A curated collection of a `[[collections]]` table: a benchmark or archive that holds datasets of the Dataset Catalog
 * of PollisCompetitions.jl, or where they are listed.
 */
export interface IModelCollection {
	readonly id: string;
	readonly name: string;
	/** The year it was first published. */
	readonly year?: number;
	readonly url: string;
	readonly description: string;
	/** The dataset_id of each of its datasets in the Dataset Catalog. */
	readonly datasets?: readonly string[];
	/** Its papers, keys of PollisReferences. */
	readonly papers?: readonly string[];
}

/** The declarative content of a panel built on the shared scaffold (generated from its TOML). */
export interface IScaffoldPanelData {
	readonly packages: IModelPackage[];
	readonly notebooks: IModelNotebook[];
	readonly notebookSections: IModelNotebookSection[];
	readonly wikis: IModelWiki[];
	readonly references: IModelReference[];
	/** Further packages the examples use (e.g. "Plots.jl"): checked by the install indicator, not listed on the Powered-by line. */
	readonly requires?: string[];
	/** The model toggles. Default: one per code branch, labelled with its capitalised model id. */
	readonly models?: IModelToggle[];
	readonly bullets?: IModelBullet[];
	readonly decisionRows?: IModelDecisionRow[];
	readonly codeBranches?: IModelCodeBranch[];
	readonly actionGroups?: IModelActionGroup[];
	readonly inputs?: IModelInput[];
	/** The questions of its FAQ shown in Learn More, the hidden ones left out. */
	readonly faq?: IModelFaq[];
	/** Its curated collections, for a page that lists datasets. */
	readonly collections?: IModelCollection[];
	/** The style its `[meta]` names: Time Arrow. Default: Classical. */
	readonly style?: 'timeArrow';
	/** Time Arrow: the text in place of Key Points. */
	readonly intro?: string;
	/** Time Arrow: the table between the introduction and the steps. */
	readonly matrix?: IModelMatrix;
	/** Time Arrow: the numbered steps. */
	readonly steps?: IModelStep[];
}

/** The table of a Time Arrow panel (`[matrix]`): its columns and the cells of each of its rows. */
export interface IModelMatrix {
	readonly columns: string[];
	readonly rows: string[][];
}

/** A step of a Time Arrow panel (`[[steps]]`): a numbered pane. */
export interface IModelStep {
	readonly title: string;
	readonly intro: string;
	/** Its dataset's id in Manage Challenge Datasets. */
	readonly dataset: string;
	/** How the step names its dataset. */
	readonly datasetText: string;
	readonly sections: IModelStepSection[];
	/** The name of the step, under which the user's version of its code is kept. */
	readonly id: string;
	/** The inputs of the step, which its code and that of every later one can read as `{{id}}`. */
	readonly inputs: readonly IModelInput[];
	/**
	 * What the later steps need of this one. Before the code of a later step runs, so does the code of each step before
	 * it, unless the Julia REPL has run it as it is now.
	 */
	readonly code: string;
	/** Further code of the step, as looking at or saving its results: no later step runs it. */
	readonly actions: readonly IModelAction[];
}

/** A section of a step (`[[steps.sections]]`): a heading with a text or a list of items. */
interface IModelStepSection {
	readonly heading: string;
	readonly text: string;
	readonly items: string[];
}
