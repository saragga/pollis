/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import assert from 'assert';
import { AppResourcePath, FileAccess } from '../../../../../base/common/network.js';
import { ensureNoDisposablesAreLeakedInTestSuite } from '../../../../../base/test/common/utils.js';
import { IModelPaper } from '../../../model/browser/common/model.types.js';
import { FORECASTINGCATALOGUE_METADATA } from '../../../model/browser/webviews/forecastingCatalogue.data.js';
import { FORECASTING_CATALOGUE_FILE, ICatalogueContribution, ICatalogueReferences, POLLIS_COMPETITIONS_DATASETS_FILE, POLLIS_COMPETITIONS_SOURCE, readForecastingCatalogue } from '../../browser/forecastingCatalogue.js';

/** The wiki that must list every field of the catalogue and every value of a controlled field. */
const FIELDS_WIKI: AppResourcePath = 'vs/workbench/contrib/model/browser/media/wiki/forecastingCatalogue/fields-vocabularies.md';

/** The ids of data/catalogue.toml of PollisCompetitions.jl, and the papers of the page's References. */
const REFERENCES: ICatalogueReferences = {
	packageIds: { PollisCompetitions: ['m1', 'm3', 'm4', 'm5', 'm6'] },
	paperKeys: FORECASTINGCATALOGUE_METADATA.forecastingCatalogue.references.filter((reference): reference is IModelPaper => 'title' in reference).map(paper => paper.key ?? ''),
};

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
name = "id"
label = "Id"
group = "identity"
type = "string"
description = "Unique key"

[[field]]
name = "name"
label = "Name"
group = "identity"
type = "string"
description = "Display name"

[[field]]
name = "type"
label = "Type"
group = "identity"
type = "string"
vocabulary = "competition | dataset"
controlled = true
description = "Kind of entry"

[[field]]
name = "domain"
label = "Domain"
group = "identity"
type = "string"
vocabulary = "general | retail"
controlled = true
description = "Application domain"

[[field]]
name = "package"
label = "Package"
group = "access"
type = "string"
vocabulary = "PollisDatasets | PollisCompetitions"
controlled = true
description = "Pollis package that lists the entry"

[[field]]
name = "related"
label = "Related"
group = "identity"
type = "string[]"
description = "Related entries"

[[view]]
id = "identity"
label = "Identity"
pinned = ["name"]
columns = ["type", "domain"]
`;

/**
 * Two contributors: the first an entry with an unknown field, a value outside its vocabulary and a related id of no
 * entry; the second an entry of the same id, which the catalogue already has.
 */
const BROKEN: readonly ICatalogueContribution[] = [
	{
		source: 'A Package', content: `
[[entry]]
id = "a"
name = "A Competition"
type = "competition"
domain = "sport"
package = "PollisCompetitions"
colour = "red"
related = ["b"]
` },
	{
		source: 'A Toolbox', content: `
[[entry]]
id = "a"
name = "Another A"
type = "dataset"
domain = "retail"
package = "PollisDatasets"
` },
];

/** The schema and the entries of PollisCompetitions.jl, as Pollis ships them. */
async function shippedCatalogue() {
	return readForecastingCatalogue(await shippedFile(FORECASTING_CATALOGUE_FILE), [{ source: POLLIS_COMPETITIONS_SOURCE, content: await shippedFile(POLLIS_COMPETITIONS_DATASETS_FILE) }], REFERENCES);
}

suite('Forecasting catalogue', () => {

	ensureNoDisposablesAreLeakedInTestSuite();

	test('the catalogue Pollis ships has no problems', async () => {
		const { catalogue, problems } = await shippedCatalogue();
		assert.deepStrictEqual({ problems, hasEntries: catalogue.entries.length > 0 }, { problems: [], hasEntries: true });
	});

	test('an unknown field, a value outside its vocabulary, an id given twice and a related id of no entry are problems', () => {
		assert.deepStrictEqual(readForecastingCatalogue(SCHEMA, BROKEN, REFERENCES).problems, [
			'A Package: Entry "a", field "domain": "sport" is not in its vocabulary',
			'A Package: Entry "a", field "colour": not a field of the schema',
			'A Toolbox: Entry "a" is in the catalogue already, from A Package',
			'A Package: Entry "a", field "related": "b" is no entry of the catalogue',
		]);
	});

	test('Fields and Vocabularies lists every field and every value of a controlled field', async () => {
		const { catalogue } = await shippedCatalogue();
		const wiki = await shippedFile(FIELDS_WIKI);
		const names = catalogue.fields.flatMap(field => [field.name, ...field.values]);
		assert.deepStrictEqual(names.filter(name => !wiki.includes('`' + name + '`')), []);
	});
});
