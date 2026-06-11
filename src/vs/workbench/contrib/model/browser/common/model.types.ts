/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Antonio Saragga Seabra. All rights reserved.
 *  Proprietary and confidential. Unauthorised copying or distribution is prohibited.
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
