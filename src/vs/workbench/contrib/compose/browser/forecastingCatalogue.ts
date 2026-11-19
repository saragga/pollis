/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { AppResourcePath } from '../../../../base/common/network.js';
import { IModelCollection } from '../../model/browser/common/model.types.js';
import { parseToml, TomlValue } from '../../model/browser/common/tomlPanelData.js';

// The Dataset Catalog of Compose > Prediction Competitions > Manage Competition Datasets (forecastingCataloguePage.ts):
// the datasets on which models are scored and ranked. Its schema is media/forecastingCatalogue.toml, whose [[field]]
// tables are the fields of a dataset and its [[view]] tables the column presets of the page; the datasets come from
// their contributors, PollisCompetitions.jl, the installed toolboxes and the Pollis Workspace, each a file of [[datasets]]
// tables, and the curated collections from the [[collections]] of the page's TOML. readForecastingCatalogue reads them
// and lists what is wrong in them, each problem naming the contributor, the dataset and the field; the page shows them.

/** The schema of the catalogue, its fields and views, as Pollis ships it. */
export const FORECASTING_CATALOGUE_FILE: AppResourcePath = 'vs/workbench/contrib/compose/browser/media/forecastingCatalogue.toml';

/** The file of PollisCompetitions.jl that holds its datasets, in the package's folder. */
export const POLLIS_COMPETITIONS_DATASETS_PATH = 'metadata/datasets.toml';

/** PollisCompetitions.jl as the column Contributor names it. */
export const POLLIS_COMPETITIONS_SOURCE = 'PollisCompetitions.jl';

/** The fields the page sets, which a dataset's file does not give: its contributor, its collections and its papers. */
const SOURCE_FIELD = 'source';
const PAGE_FIELDS = [SOURCE_FIELD, 'collections', 'papers'];

/** The roles of a reference of a dataset. */
const REFERENCE_ROLES = ['Primary', 'Competition', 'Benchmark', 'Other'];

/** A contributor's file of [[datasets]] tables: PollisCompetitions.jl's, a toolbox's or a dataset's of the workspace. */
export interface ICatalogueContribution {
	/** Who contributes it, as the column Contributor shows it. */
	readonly source: string;
	readonly content: string;
}

/** The types a field's values may have. */
const FIELD_TYPES = ['string', 'string[]', 'integer', 'number', 'boolean'] as const;
type FieldType = typeof FIELD_TYPES[number];

/** The fields every dataset has. */
const REQUIRED_FIELDS = ['dataset_id', 'dataset_name', 'topic'];

/** A field of the schema. */
export interface ICatalogueField {
	readonly name: string;
	/** Its heading on the page. */
	readonly label: string;
	/** Its group, the id of the view that shows the group. */
	readonly group: string;
	readonly type: FieldType;
	/** The values a controlled field takes, in the order of its vocabulary; empty for a free field. */
	readonly values: readonly string[];
	/** What the vocabulary of a free field says, such as "free" or an example. */
	readonly vocabulary?: string;
	readonly description: string;
}

/** A column preset of the page: the fields always shown on the left, then its columns. */
export interface ICatalogueView {
	readonly id: string;
	readonly label: string;
	readonly pinned: readonly string[];
	readonly columns: readonly string[];
}

/** A value of a dataset: text, a number, true or false, or a list of texts. */
export type CatalogueValue = string | number | boolean | readonly string[];

/**
 * A dataset: the fields it has, with their values, and its id and name, its dataset_id and dataset_name; an absent field
 * is unknown.
 */
export interface ICatalogueEntry {
	readonly [field: string]: CatalogueValue | undefined;
	readonly id: string;
	readonly name: string;
}

export interface IForecastingCatalogue {
	readonly fields: readonly ICatalogueField[];
	readonly views: readonly ICatalogueView[];
	readonly entries: readonly ICatalogueEntry[];
	readonly collections: readonly IModelCollection[];
}

/** What the catalogue is checked against outside its own files. */
export interface ICatalogueReferences {
	/**
	 * The keys of PollisReferences, which the page shows as the papers of a dataset or a collection; undefined when
	 * PollisReferences could not be read, and the keys are not checked.
	 */
	readonly paperKeys?: readonly string[];
	/** The curated collections of the page. */
	readonly collections: readonly IModelCollection[];
}

/** The catalogue read from its files, and what is wrong in them. */
export interface ICatalogueRead {
	readonly catalogue: IForecastingCatalogue;
	readonly problems: readonly string[];
}

function text(value: unknown): string {
	return typeof value === 'string' ? value.trim() : '';
}

function texts(value: unknown): string[] {
	return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [];
}

function hasType(value: unknown, type: FieldType): boolean {
	switch (type) {
		case 'string': return typeof value === 'string';
		case 'string[]': return Array.isArray(value) && value.every(item => typeof item === 'string');
		case 'integer': return typeof value === 'number' && Number.isInteger(value);
		case 'number': return typeof value === 'number';
		case 'boolean': return typeof value === 'boolean';
	}
}

function readFields(data: TomlValue, problems: string[]): ICatalogueField[] {
	const fields: ICatalogueField[] = [];
	const raw = Array.isArray(data.field) ? data.field as TomlValue[] : [];
	for (const [index, field] of raw.entries()) {
		const name = text(field.name);
		const label = name ? `Field "${name}"` : `Field ${index + 1}`;
		if (!name) {
			problems.push(`${label} has no name`);
			continue;
		}
		if (fields.some(other => other.name === name)) {
			problems.push(`${label} is declared twice`);
			continue;
		}
		const type = text(field.type);
		if (!(FIELD_TYPES as readonly string[]).includes(type)) {
			problems.push(`${label} has the type "${type}": one of ${FIELD_TYPES.join(', ')}`);
			continue;
		}
		for (const key of ['label', 'group', 'description']) {
			if (!text(field[key])) {
				problems.push(`${label} has no ${key}`);
			}
		}
		const vocabulary = text(field.vocabulary);
		const controlled = field.controlled === true;
		const values = controlled ? vocabulary.split('|').map(value => value.trim()).filter(value => value) : [];
		if (controlled && !values.length) {
			problems.push(`${label} is controlled and has no vocabulary`);
		}
		if (controlled && type !== 'string' && type !== 'string[]') {
			problems.push(`${label} is controlled and is not text`);
		}
		fields.push({
			name,
			label: text(field.label) || name,
			group: text(field.group),
			type: type as FieldType,
			values,
			...(!controlled && vocabulary ? { vocabulary } : {}),
			description: text(field.description),
		});
	}
	for (const required of REQUIRED_FIELDS.filter(name => !fields.some(field => field.name === name))) {
		problems.push(`Field "${required}" is not declared, and every dataset has it`);
	}
	return fields;
}

function readViews(data: TomlValue, fields: readonly ICatalogueField[], problems: string[]): ICatalogueView[] {
	const views: ICatalogueView[] = [];
	const raw = Array.isArray(data.view) ? data.view as TomlValue[] : [];
	for (const [index, view] of raw.entries()) {
		const id = text(view.id);
		const label = id ? `View "${id}"` : `View ${index + 1}`;
		if (!id) {
			problems.push(`${label} has no id`);
			continue;
		}
		if (views.some(other => other.id === id)) {
			problems.push(`${label} is declared twice`);
			continue;
		}
		if (!text(view.label)) {
			problems.push(`${label} has no label`);
		}
		const pinned = texts(view.pinned);
		const columns = texts(view.columns);
		for (const column of [...pinned, ...columns].filter(column => !fields.some(field => field.name === column))) {
			problems.push(`${label}, column "${column}": not a field of the schema`);
		}
		views.push({ id, label: text(view.label) || id, pinned, columns });
	}
	if (!views.length) {
		problems.push('The catalogue has no view');
	}
	return views;
}

/** The keys of the [[datasets.references]] of a dataset, checked: each a bibtex_key, with a role of the vocabulary when it has one. */
function readReferences(value: unknown, label: string, problems: string[]): string[] {
	const keys: string[] = [];
	for (const [index, reference] of (Array.isArray(value) ? value as TomlValue[] : []).entries()) {
		const key = text(reference.bibtex_key);
		if (!key) {
			problems.push(`${label}, reference ${index + 1}: it has no bibtex_key`);
			continue;
		}
		for (const name of Object.keys(reference).filter(name => name !== 'bibtex_key' && name !== 'role')) {
			problems.push(`${label}, reference "${key}", field "${name}": a reference has bibtex_key and role only`);
		}
		if (reference.role !== undefined && !REFERENCE_ROLES.includes(text(reference.role))) {
			problems.push(`${label}, reference "${key}", field "role": "${String(reference.role)}" is not one of ${REFERENCE_ROLES.join(', ')}`);
		}
		keys.push(key);
	}
	return keys;
}

function readEntries(contributions: readonly ICatalogueContribution[], fields: readonly ICatalogueField[], references: ICatalogueReferences, problems: string[]): ICatalogueEntry[] {
	const byName = new Map(fields.map(field => [field.name, field]));
	const entries: ICatalogueEntry[] = [];
	for (const contribution of contributions) {
		const data = parseToml(contribution.content);
		const raw = Array.isArray(data.datasets) ? data.datasets as TomlValue[] : [];
		for (const [index, dataset] of raw.entries()) {
			const id = text(dataset.dataset_id);
			const label = `${contribution.source}: ` + (id ? `Dataset "${id}"` : `Dataset ${index + 1}`);
			for (const required of REQUIRED_FIELDS.filter(name => dataset[name] === undefined)) {
				problems.push(`${label} has no field "${required}"`);
			}
			// The fields of the schema with values of their types, which the page shows
			const values: { [field: string]: CatalogueValue } = {};
			for (const [key, value] of Object.entries(dataset)) {
				if (key === 'references') {
					const papers = readReferences(value, label, problems);
					if (papers.length) {
						values.papers = papers;
					}
					continue;
				}
				const field = byName.get(key);
				if (!field || PAGE_FIELDS.includes(key)) {
					problems.push(`${label}, field "${key}": ${field ? 'the page sets it, not the file' : 'not a field of the schema'}`);
					continue;
				}
				if (!hasType(value, field.type)) {
					problems.push(`${label}, field "${key}": its value is not of the type ${field.type}`);
					continue;
				}
				values[key] = value as CatalogueValue;
				if (field.values.length) {
					for (const item of Array.isArray(value) ? value as string[] : [value as string]) {
						if (!field.values.includes(item)) {
							problems.push(`${label}, field "${key}": "${item}" is not in its vocabulary`);
						}
					}
				}
			}
			if (!id) {
				continue;
			}
			const earlier = entries.find(other => other.id === id);
			if (earlier) {
				problems.push(`${label} is in the catalogue already, from ${earlier.source}`);
				continue;
			}
			const collections = references.collections.filter(collection => collection.datasets?.includes(id)).map(collection => collection.id);
			entries.push({
				...values,
				...(collections.length ? { collections } : {}),
				id,
				name: text(dataset.dataset_name) || id,
				[SOURCE_FIELD]: contribution.source,
			});
		}
	}

	const known = references.paperKeys && new Set(references.paperKeys);
	for (const entry of known ? entries : []) {
		for (const paper of texts(entry.papers).filter(paper => !known!.has(paper))) {
			problems.push(`${entry.source}: Dataset "${entry.id}", reference "${paper}": not a work of PollisReferences`);
		}
	}
	// The datasets a collection names must be in the catalogue, once it has any
	if (entries.length) {
		const ids = new Set(entries.map(entry => entry.id));
		for (const collection of references.collections) {
			for (const dataset of (collection.datasets ?? []).filter(dataset => !ids.has(dataset))) {
				problems.push(`Collection "${collection.id}": "${dataset}" is no dataset of the catalogue`);
			}
		}
	}
	return entries;
}

/**
 * The catalogue of the schema `schema` (its fields and views), the datasets of `contributions`, in their order, and the
 * collections of `references`, and the problems found in them. An id already given keeps its first dataset.
 */
export function readForecastingCatalogue(schema: string, contributions: readonly ICatalogueContribution[], references: ICatalogueReferences): ICatalogueRead {
	const problems: string[] = [];
	const data = parseToml(schema);
	const fields = readFields(data, problems);
	const views = readViews(data, fields, problems);
	const entries = readEntries(contributions, fields, references, problems);
	const known = references.paperKeys && new Set(references.paperKeys);
	for (const collection of known ? references.collections : []) {
		for (const paper of (collection.papers ?? []).filter(paper => !known!.has(paper))) {
			problems.push(`Collection "${collection.id}", paper "${paper}": not a work of PollisReferences`);
		}
	}
	return { catalogue: { fields, views, entries, collections: references.collections }, problems };
}
