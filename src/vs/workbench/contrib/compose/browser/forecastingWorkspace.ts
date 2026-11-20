/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { VSBuffer } from '../../../../base/common/buffer.js';
import { joinPath } from '../../../../base/common/resources.js';
import { URI } from '../../../../base/common/uri.js';
import { IFileService } from '../../../../platform/files/common/files.js';
import { parseToml, TomlValue } from '../../model/browser/common/tomlPanelData.js';
import { pollisWorkspaceFolderPath } from '../../pollisWorkspace/browser/pollisWorkspace.contribution.js';
import { CatalogueValue, IForecastingCatalogue } from './forecastingCatalogue.js';
import { sha256Of } from './sha256.js';

// The forecasting datasets of the user's Pollis Workspace, in data/forecasting/: a folder for each dataset saved from
// Manage Challenge Datasets (forecastingCataloguePage.ts), named by its id in the catalogue, with the files copied
// and saved.toml, which records each file's size, time and SHA-256 when it was saved, so that a change to the copy is
// seen; and forecastingCatalogue.toml, the whole catalogue as the page last read it, for Julia, which the page
// rewrites and no one edits. A dataset the user adds from a file of their own has, beside its converted files,
// dataset.toml: how it was converted, and its [[datasets]] table in the catalogue, which the page reads with the others.

/** The folder of the forecasting datasets inside the data folder of a Pollis Workspace. */
const FORECASTING_FOLDER = 'forecasting';

/** The record of a saved dataset, in its folder. */
const SAVED_FILE = 'saved.toml';

/** The whole catalogue, written for Julia beside the saved datasets. */
const SNAPSHOT_FILE = 'forecastingCatalogue.toml';

/** The facts of a dataset the user added: how it was converted, and its entry. */
const DATASET_FILE = 'dataset.toml';

/** The contributor of the datasets the user added, as the column Source names it. */
export const WORKSPACE_SOURCE = 'Pollis Workspace';

/** How a dataset the user added was converted: from which file and columns, with which frequency, period and horizon, into how many series. */
export interface IAddedConversion {
	readonly file: string;
	readonly seriesColumn: string;
	readonly timeColumn: string;
	readonly valueColumn: string;
	readonly frequency: string;
	readonly period: number;
	readonly horizon: number;
	readonly series: number;
}

/** A dataset the user added: how it was converted, its fields in the catalogue and the keys of its references. */
export interface IAddedDataset {
	readonly conversion: IAddedConversion;
	readonly dataset: { readonly [field: string]: CatalogueValue };
	readonly references: readonly string[];
}

/** A saved dataset as it is now: as saved, or changed since (a file changed, added or removed). */
export type SavedStatus = 'saved' | 'changed';

/** A file of a saved dataset as it was saved. */
interface ISavedFile {
	readonly path: string;
	readonly bytes: number;
	readonly mtime: number;
	readonly sha256: string;
}

/** Where the forecasting datasets of the Pollis Workspace `workspace` are, without making the folder. */
export async function forecastingFolder(fileService: IFileService, workspace: URI): Promise<URI> {
	return joinPath(await pollisWorkspaceFolderPath(fileService, workspace, 'data'), FORECASTING_FOLDER);
}

/** The files of a dataset's saved.toml, none when it cannot be read. */
function savedFiles(toml: string): ISavedFile[] {
	const files = parseToml(toml).files;
	return (Array.isArray(files) ? files as TomlValue[] : []).flatMap(file =>
		typeof file.path === 'string' && typeof file.bytes === 'number' && typeof file.mtime === 'number' && typeof file.sha256 === 'string'
			? [{ path: file.path, bytes: file.bytes, mtime: file.mtime, sha256: file.sha256 }] : []);
}

/**
 * The status of the dataset saved in `folder`, or undefined when none is: changed when a file is added, removed or of
 * another size, or when one of a later time no longer has the SHA-256 it was saved with.
 */
async function savedStatus(fileService: IFileService, folder: URI): Promise<SavedStatus | undefined> {
	let saved: ISavedFile[];
	try {
		saved = savedFiles((await fileService.readFile(joinPath(folder, SAVED_FILE))).value.toString());
	} catch {
		return undefined;
	}
	const children = ((await fileService.resolve(folder, { resolveMetadata: true })).children ?? []).filter(child => !child.isDirectory && child.name !== SAVED_FILE && child.name !== DATASET_FILE);
	if (children.length !== saved.length) {
		return 'changed';
	}
	for (const file of saved) {
		const now = children.find(child => child.name === file.path);
		if (!now || now.size !== file.bytes) {
			return 'changed';
		}
		if (now.mtime !== file.mtime && await sha256Of((await fileService.readFile(now.resource)).value) !== file.sha256) {
			return 'changed';
		}
	}
	return 'saved';
}

/** The status of each dataset saved in the forecasting folder `folder`, by its id. */
export async function savedStatuses(fileService: IFileService, folder: URI): Promise<Record<string, SavedStatus>> {
	const statuses: Record<string, SavedStatus> = {};
	let children;
	try {
		children = (await fileService.resolve(folder)).children ?? [];
	} catch {
		return statuses;
	}
	await Promise.all(children.filter(child => child.isDirectory).map(async child => {
		const status = await savedStatus(fileService, child.resource);
		if (status) {
			statuses[child.name] = status;
		}
	}));
	return statuses;
}

/**
 * Saves the dataset `id` into the forecasting folder `folder`: the files of `source`, not its subfolders (the
 * forecasts of the entries), copied into `folder/id`, which is emptied first, and saved.toml, which records them.
 */
export async function saveDataset(fileService: IFileService, folder: URI, id: string, source: URI, origin: string): Promise<void> {
	const target = joinPath(folder, id);
	if (await fileService.exists(target)) {
		await fileService.del(target, { recursive: true, useTrash: true });
	}
	await fileService.createFolder(target);
	const files = ((await fileService.resolve(source)).children ?? []).filter(child => !child.isDirectory);
	for (const file of files) {
		await fileService.copy(file.resource, joinPath(target, file.name), true);
	}
	await recordSaved(fileService, target, `what was copied from ${origin}`);
}

/**
 * Writes saved.toml in the folder of a dataset, `target`, recording its files as they are now (not dataset.toml, whose
 * entry the user may edit), so that a change to them is seen; `what` says what they are.
 */
export async function recordSaved(fileService: IFileService, target: URI, what: string): Promise<void> {
	const files = ((await fileService.resolve(target, { resolveMetadata: true })).children ?? []).filter(child => !child.isDirectory && child.name !== SAVED_FILE && child.name !== DATASET_FILE);
	const saved: ISavedFile[] = [];
	for (const file of files) {
		saved.push({ path: file.name, bytes: file.size, mtime: file.mtime, sha256: await sha256Of((await fileService.readFile(file.resource)).value) });
	}
	const lines = [
		`# Saved by Manage Challenge Datasets: ${what}, so that a change to them is seen.`,
		`saved = ${JSON.stringify(new Date().toISOString())}`,
		...saved.flatMap(file => ['', '[[files]]', `path = ${JSON.stringify(file.path)}`, `bytes = ${file.bytes}`, `mtime = ${file.mtime}`, `sha256 = ${JSON.stringify(file.sha256)}`]),
	];
	await fileService.writeFile(joinPath(target, SAVED_FILE), VSBuffer.fromString(lines.join('\n') + '\n'));
}

/** A value as TOML: a string, a number, true or false, or a list of strings. */
function tomlValue(value: CatalogueValue): string {
	if (Array.isArray(value)) {
		return `[${value.map(item => JSON.stringify(item)).join(', ')}]`;
	}
	return typeof value === 'string' ? JSON.stringify(value) : String(value);
}

/** A dataset as a [[datasets]] table: its fields, then its references, `[[datasets.references]]` tables of their keys. */
function datasetToml(fields: { readonly [field: string]: CatalogueValue | undefined }, references: readonly string[]): string[] {
	const lines = ['[[datasets]]'];
	for (const [name, value] of Object.entries(fields)) {
		if (value !== undefined) {
			lines.push(`${name} = ${tomlValue(value)}`);
		}
	}
	for (const key of references) {
		lines.push('', '  [[datasets.references]]', `  bibtex_key = ${tomlValue(key)}`);
	}
	return lines;
}

/**
 * The whole catalogue as TOML: its fields, its views, every dataset, with its contributor in source and its curated
 * collections, and the curated collections.
 */
function catalogueToml(catalogue: IForecastingCatalogue): string {
	const lines = [
		'# The catalogue of challenge datasets as Compose > Prediction Challenges > Manage Challenge Datasets last read',
		'# it: its fields, its views, the datasets of every contributor, each named in source, and the curated collections.',
		'# The page rewrites this file each time it opens: do not edit it. Read it in Julia with TOML.parsefile.',
	];
	for (const field of catalogue.fields) {
		lines.push('', '[[field]]', `name = ${tomlValue(field.name)}`, `label = ${tomlValue(field.label)}`, `group = ${tomlValue(field.group)}`, `type = ${tomlValue(field.type)}`);
		if (field.values.length) {
			lines.push(`vocabulary = ${tomlValue(field.values.join(' | '))}`, 'controlled = true');
		} else if (field.vocabulary) {
			lines.push(`vocabulary = ${tomlValue(field.vocabulary)}`);
		}
		lines.push(`description = ${tomlValue(field.description)}`);
	}
	for (const view of catalogue.views) {
		lines.push('', '[[view]]', `id = ${tomlValue(view.id)}`, `label = ${tomlValue(view.label)}`, `pinned = ${tomlValue(view.pinned)}`, `columns = ${tomlValue(view.columns)}`);
	}
	for (const { id, name, papers, ...fields } of catalogue.entries) {
		lines.push('', ...datasetToml(fields, Array.isArray(papers) ? papers : []));
	}
	for (const collection of catalogue.collections) {
		lines.push('', '[[collections]]', `id = ${tomlValue(collection.id)}`, `name = ${tomlValue(collection.name)}`);
		if (collection.year !== undefined) {
			lines.push(`year = ${collection.year}`);
		}
		lines.push(`url = ${tomlValue(collection.url)}`, `description = ${tomlValue(collection.description)}`);
		if (collection.datasets?.length) {
			lines.push(`datasets = ${tomlValue(collection.datasets)}`);
		}
		if (collection.papers?.length) {
			lines.push(`papers = ${tomlValue(collection.papers)}`);
		}
	}
	return lines.join('\n') + '\n';
}

/** The dataset.toml of each dataset the user added in the forecasting folder `folder`, with the folder's name. */
export async function addedDatasetFiles(fileService: IFileService, folder: URI): Promise<{ readonly id: string; readonly content: string }[]> {
	let children;
	try {
		children = (await fileService.resolve(folder)).children ?? [];
	} catch {
		return [];
	}
	const files = await Promise.all(children.filter(child => child.isDirectory).map(async child => {
		const content = await fileService.readFile(joinPath(child.resource, DATASET_FILE)).then(read => read.value.toString(), () => undefined);
		return content === undefined ? [] : [{ id: child.name, content }];
	}));
	return files.flat().sort((a, b) => a.id.localeCompare(b.id));
}

/** The dataset the user added as `id` in the forecasting folder `folder`, or undefined when its dataset.toml cannot be read. */
export async function readAddedDataset(fileService: IFileService, folder: URI, id: string): Promise<IAddedDataset | undefined> {
	let data: TomlValue;
	try {
		data = parseToml((await fileService.readFile(joinPath(folder, id, DATASET_FILE))).value.toString());
	} catch {
		return undefined;
	}
	const conversion = data.conversion as TomlValue | undefined;
	const [table] = Array.isArray(data.datasets) ? data.datasets as TomlValue[] : [];
	if (!conversion || !table || typeof conversion.file !== 'string' || typeof conversion.series_column !== 'string' || typeof conversion.time_column !== 'string' || typeof conversion.value_column !== 'string' || typeof conversion.period !== 'number' || typeof conversion.horizon !== 'number') {
		return undefined;
	}
	const { references, ...dataset } = table;
	return {
		conversion: {
			file: conversion.file, seriesColumn: conversion.series_column, timeColumn: conversion.time_column, valueColumn: conversion.value_column,
			frequency: typeof conversion.frequency === 'string' ? conversion.frequency : '', period: conversion.period, horizon: conversion.horizon,
			series: typeof conversion.series === 'number' ? conversion.series : 0,
		},
		dataset: dataset as { [field: string]: CatalogueValue },
		references: (Array.isArray(references) ? references as TomlValue[] : []).map(reference => reference.bibtex_key).filter((key): key is string => typeof key === 'string'),
	};
}

/** Writes the dataset.toml of the dataset the user added as `id` in the forecasting folder `folder`. */
export async function writeAddedDataset(fileService: IFileService, folder: URI, id: string, added: IAddedDataset): Promise<void> {
	const { conversion, dataset, references } = added;
	const lines = [
		'# A dataset added in Manage Challenge Datasets from a file of your own. [conversion] says how series.parquet and',
		'# observations.parquet were made from it: change it with Edit Facts on the page, which converts the file again.',
		'# [[datasets]] is the dataset in the catalogue: its fields, and its references as [[datasets.references]] tables',
		'# with the bibtex_key of a work of PollisReferences, may also be edited here, as the schema of the catalogue allows.',
		'',
		'[conversion]',
		`file = ${tomlValue(conversion.file)}`,
		`series_column = ${tomlValue(conversion.seriesColumn)}`,
		`time_column = ${tomlValue(conversion.timeColumn)}`,
		`value_column = ${tomlValue(conversion.valueColumn)}`,
		`frequency = ${tomlValue(conversion.frequency)}`,
		`period = ${conversion.period}`,
		`horizon = ${conversion.horizon}`,
		`series = ${conversion.series}`,
		'',
		...datasetToml(dataset, references),
	];
	await fileService.writeFile(joinPath(folder, id, DATASET_FILE), VSBuffer.fromString(lines.join('\n') + '\n'));
}

/** Writes the whole catalogue into the forecasting folder `folder`, when it differs from the file there. */
export async function writeCatalogueSnapshot(fileService: IFileService, folder: URI, catalogue: IForecastingCatalogue): Promise<void> {
	const file = joinPath(folder, SNAPSHOT_FILE);
	const content = catalogueToml(catalogue);
	const current = await fileService.readFile(file).then(read => read.value.toString(), () => undefined);
	if (current !== content) {
		await fileService.writeFile(file, VSBuffer.fromString(content));
	}
}
