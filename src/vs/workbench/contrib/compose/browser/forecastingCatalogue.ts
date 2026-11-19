/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { AppResourcePath } from '../../../../base/common/network.js';
import { parseToml, TomlValue } from '../../model/browser/common/tomlPanelData.js';

// The forecasting catalogue of Compose > Prediction Competitions > Manage Competition Datasets (forecastingCataloguePage.ts):
// the competitions, datasets, curated collections and archives of published forecasts that Pollis describes. Its schema
// is media/forecastingCatalogue.toml, whose [[field]] tables are the fields of an entry and its [[view]] tables the
// column presets of the page; the entries come from their contributors, PollisCompetitions.jl and the installed
// toolboxes, each a file of [[entry]] tables. readForecastingCatalogue reads them and lists what is wrong in them, each
// problem naming the contributor, the entry and the field; the page shows them, and a unit test fails on any.

/** The schema of the catalogue, its fields and views, as Pollis ships it. */
export const FORECASTING_CATALOGUE_FILE: AppResourcePath = 'vs/workbench/contrib/compose/browser/media/forecastingCatalogue.toml';

/** The entries of PollisCompetitions.jl as Pollis ships them, for when the package is not on this computer. */
export const POLLIS_COMPETITIONS_DATASETS_FILE: AppResourcePath = 'vs/workbench/contrib/compose/browser/media/pollisCompetitions.forecastingDatasets.toml';

/** The file of PollisCompetitions.jl that holds its entries, in the package's folder. */
export const POLLIS_COMPETITIONS_DATASETS_PATH = 'data/forecasting_datasets.toml';

/** PollisCompetitions.jl as the column Source names it. */
export const POLLIS_COMPETITIONS_SOURCE = 'PollisCompetitions.jl';

/** The field that names who contributes an entry, which the page sets. */
const SOURCE_FIELD = 'source';

/** A contributor's file of [[entry]] tables: PollisCompetitions.jl's or a toolbox's. */
export interface ICatalogueContribution {
	/** Who contributes it, as the column Source shows it. */
	readonly source: string;
	readonly content: string;
}

/** The types a field's values may have. */
const FIELD_TYPES = ['string', 'string[]', 'integer', 'boolean'] as const;
type FieldType = typeof FIELD_TYPES[number];

/** The fields every entry has; a dataset the user added from a file of their own has no package. */
const REQUIRED_FIELDS = ['id', 'name', 'type', 'domain'];

/** The type of the entries that are curated collections, which the page shows in their own tab and `collections` names. */
export const COLLECTION_TYPE = 'benchmark_suite';

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

/** A value of an entry: text, a number, true or false, or a list of texts. */
export type CatalogueValue = string | number | boolean | readonly string[];

/** An entry: the fields it has, with their values; an absent field is unknown or does not apply. */
export interface ICatalogueEntry {
	readonly [field: string]: CatalogueValue | undefined;
	readonly id: string;
	readonly name: string;
}

export interface IForecastingCatalogue {
	readonly fields: readonly ICatalogueField[];
	readonly views: readonly ICatalogueView[];
	readonly entries: readonly ICatalogueEntry[];
}

/** What the catalogue is checked against outside its own file. */
export interface ICatalogueReferences {
	/** For each package, the ids of its own catalogue that an implemented entry's package_id may name. */
	readonly packageIds: { readonly [pkg: string]: readonly string[] };
	/** The keys of PollisReferences that the page can show for an entry's papers. */
	readonly paperKeys: readonly string[];
}

/** The catalogue read from its file, and what is wrong in it. */
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
		problems.push(`Field "${required}" is not declared, and every entry has it`);
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

function readEntries(contributions: readonly ICatalogueContribution[], fields: readonly ICatalogueField[], references: ICatalogueReferences, problems: string[]): ICatalogueEntry[] {
	const byName = new Map(fields.map(field => [field.name, field]));
	const entries: ICatalogueEntry[] = [];
	for (const contribution of contributions) {
		const data = parseToml(contribution.content);
		const raw = Array.isArray(data.entry) ? data.entry as TomlValue[] : [];
		for (const [index, entry] of raw.entries()) {
			const id = text(entry.id);
			const label = `${contribution.source}: ` + (id ? `Entry "${id}"` : `Entry ${index + 1}`);
			for (const required of REQUIRED_FIELDS.filter(name => entry[name] === undefined)) {
				problems.push(`${label} has no field "${required}"`);
			}
			// The fields of the schema with values of their types, which the page shows
			const values: { [field: string]: CatalogueValue } = {};
			for (const [key, value] of Object.entries(entry)) {
				const field = byName.get(key);
				if (!field) {
					problems.push(`${label}, field "${key}": not a field of the schema`);
					continue;
				}
				if (key === SOURCE_FIELD) {
					problems.push(`${label}, field "${key}": the page sets it, not the file`);
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
			entries.push({ ...values, id, name: text(entry.name) || id, [SOURCE_FIELD]: contribution.source });
		}
	}

	const ids = new Set(entries.map(entry => entry.id));
	for (const entry of entries) {
		const label = `${entry.source}: Entry "${entry.id}"`;
		for (const [key, linked] of [['parent', texts([entry.parent])], ['related', texts(entry.related)], ['collections', texts(entry.collections)]] as const) {
			for (const other of linked) {
				if (other === entry.id || !ids.has(other)) {
					problems.push(`${label}, field "${key}": "${other}" is ${other === entry.id ? 'the entry itself' : 'no entry of the catalogue'}`);
				}
			}
		}
		for (const collection of texts(entry.collections)) {
			const holder = entries.find(other => other.id === collection);
			if (holder && holder.type !== COLLECTION_TYPE) {
				problems.push(`${label}, field "collections": "${collection}" is not a curated collection (type ${COLLECTION_TYPE})`);
			}
		}
		for (const paper of texts(entry.papers).filter(paper => !references.paperKeys.includes(paper))) {
			problems.push(`${label}, field "papers": "${paper}" is not among the References of the page`);
		}
		const pkg = text(entry.package);
		if (entry.delivery === 'bundled' && pkg === 'PollisCompetitions') {
			problems.push(`${label}, field "delivery": PollisCompetitions ships no data, so its entries are never bundled`);
		}
		if (entry.status === 'implemented') {
			const packageId = text(entry.package_id);
			const known = references.packageIds[pkg];
			if (!packageId) {
				problems.push(`${label}, field "package_id": an implemented entry names its id in the catalogue of ${pkg || 'its package'}`);
			} else if (known && !known.includes(packageId)) {
				problems.push(`${label}, field "package_id": "${packageId}" is not in the catalogue of ${pkg}`);
			}
		}
	}
	return entries;
}

/**
 * The catalogue of the schema `schema` (its fields and views) and the entries of `contributions`, in their order, and
 * the problems found in them, checked against `references`. An id already given keeps its first entry.
 */
export function readForecastingCatalogue(schema: string, contributions: readonly ICatalogueContribution[], references: ICatalogueReferences): ICatalogueRead {
	const problems: string[] = [];
	const data = parseToml(schema);
	const fields = readFields(data, problems);
	const views = readViews(data, fields, problems);
	const entries = readEntries(contributions, fields, references, problems);
	return { catalogue: { fields, views, entries }, problems };
}
