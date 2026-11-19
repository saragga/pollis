/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import assert from 'assert';
import { AppResourcePath, FileAccess } from '../../../../../base/common/network.js';
import { ensureNoDisposablesAreLeakedInTestSuite } from '../../../../../base/test/common/utils.js';
import { FORECASTING_CATALOGUE_FILE, ICatalogueContribution, ICatalogueReferences, readForecastingCatalogue } from '../../browser/forecastingCatalogue.js';

/** The wiki that must list every field of the catalogue and every value of a controlled field. */
const FIELDS_WIKI: AppResourcePath = 'vs/workbench/contrib/model/browser/media/wiki/forecastingCatalogue/fields-vocabularies.md';

/** A file as Pollis ships it, from the folder the tests run from. */
function shippedFile(path: AppResourcePath): Promise<string> {
	return new Promise((resolve, reject) => {
		const request = new XMLHttpRequest();
		request.open('GET', FileAccess.asFileUri(path).toString(true));
		request.onload = () => resolve(request.responseText);
		request.onerror = () => reject(new Error(`${path} could not be read`));
		request.send();
	});
}

/** A schema of a few fields and one view. */
const SCHEMA = `
[[field]]
name = "dataset_id"
label = "Id"
group = "identity"
type = "string"
description = "The key of the dataset"

[[field]]
name = "dataset_name"
label = "Name"
group = "identity"
type = "string"
description = "The name of the dataset"

[[field]]
name = "topic"
label = "Topic"
group = "identity"
type = "string"
vocabulary = "General | Retail"
controlled = true
description = "The subject of the dataset"

[[field]]
name = "collections"
label = "Collections"
group = "identity"
type = "string[]"
description = "The curated collections that hold the dataset"

[[field]]
name = "papers"
label = "Papers"
group = "identity"
type = "string[]"
description = "The references of the dataset"

[[field]]
name = "rows"
label = "Rows"
group = "data"
type = "integer"
description = "The rows of the data"

[[field]]
name = "size_mb"
label = "Size (MB)"
group = "data"
type = "number"
description = "The size of its files"

[[view]]
id = "identity"
label = "Identity"
pinned = ["dataset_name"]
columns = ["topic", "rows"]
`;

/** The works of PollisReferences, and a collection that holds a dataset and names one that is not in the catalogue. */
const REFERENCES: ICatalogueReferences = {
	paperKeys: ['AB2020a', 'CD2021a'],
	collections: [{ id: 'archive', name: 'An Archive', url: 'https://example.org', description: 'Datasets', datasets: ['a', 'z'], papers: ['CD2021a', 'EF2022a'] }],
};

/**
 * Two contributors: the first a dataset with two references, one not in PollisReferences, a value outside its
 * vocabulary, a rows of another type, an unknown field and a field the page sets; the second a dataset of the same id,
 * which the catalogue already has.
 */
const CONTRIBUTIONS: readonly ICatalogueContribution[] = [
	{
		source: 'A Package', content: `
[[datasets]]
dataset_id = "a"
dataset_name = "A Dataset"
topic = "Sport"
rows = "many"
size_mb = 1.5
colour = "red"
collections = ["archive"]

[[datasets.references]]
bibtex_key = "AB2020a"

[[datasets.references]]
bibtex_key = "XY1999a"
` },
	{
		source: 'A Toolbox', content: `
[[datasets]]
dataset_id = "a"
dataset_name = "Another A"
topic = "Retail"
` },
];

suite('Forecasting catalogue', () => {

	ensureNoDisposablesAreLeakedInTestSuite();

	test('the schema Pollis ships has no problems', async () => {
		const { catalogue, problems } = readForecastingCatalogue(await shippedFile(FORECASTING_CATALOGUE_FILE), [], { collections: [] });
		assert.deepStrictEqual({ problems, hasFields: catalogue.fields.length > 0, hasViews: catalogue.views.length > 0 }, { problems: [], hasFields: true, hasViews: true });
	});

	test('a dataset is read with its papers and collections, and what is wrong in the files is a problem', () => {
		const { catalogue, problems } = readForecastingCatalogue(SCHEMA, CONTRIBUTIONS, REFERENCES);
		assert.deepStrictEqual({ problems, entries: catalogue.entries }, {
			problems: [
				'A Package: Dataset "a", field "topic": "Sport" is not in its vocabulary',
				'A Package: Dataset "a", field "rows": its value is not of the type integer',
				'A Package: Dataset "a", field "colour": not a field of the schema',
				'A Package: Dataset "a", field "collections": the page sets it, not the file',
				'A Toolbox: Dataset "a" is in the catalogue already, from A Package',
				'A Package: Dataset "a", reference "XY1999a": not a work of PollisReferences',
				'Collection "archive": "z" is no dataset of the catalogue',
				'Collection "archive", paper "EF2022a": not a work of PollisReferences',
			],
			entries: [{ dataset_id: 'a', dataset_name: 'A Dataset', topic: 'Sport', size_mb: 1.5, papers: ['AB2020a', 'XY1999a'], collections: ['archive'], id: 'a', name: 'A Dataset', source: 'A Package' }],
		});
	});

	test('Fields and Vocabularies lists every field and every value of a controlled field', async () => {
		const { catalogue } = readForecastingCatalogue(await shippedFile(FORECASTING_CATALOGUE_FILE), [], { collections: [] });
		const wiki = await shippedFile(FIELDS_WIKI);
		const names = catalogue.fields.flatMap(field => [field.name, ...field.values]);
		assert.deepStrictEqual(names.filter(name => !wiki.includes('`' + name + '`')), []);
	});
});
