/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

// The help of a DuckDB function, from DuckDB's own catalogue, duckdb_functions(): what help?> shows in the duckdb>
// terminal (../node/duckdbShellMain.ts) and what Ask Pollis answers when the question is the function's name.

/** The forms of the DuckDB function named $1, whatever its case, each of its kinds together. */
export const DUCKDB_FUNCTION_FORMS_SQL = 'SELECT function_name, function_type, alias_of, description, return_type, parameters, parameter_types, varargs, examples FROM duckdb_functions() WHERE lower(function_name) = lower($1) ORDER BY function_type, function_oid';

/** Whether $1 is a keyword of DuckDB's SQL. */
export const DUCKDB_KEYWORD_SQL = 'SELECT keyword_name FROM duckdb_keywords() WHERE lower(keyword_name) = lower($1)';

/** The names of the DuckDB functions nearest to $1, the nearest first. */
export const DUCKDB_NEAR_NAMES_SQL = 'SELECT function_name FROM (SELECT DISTINCT function_name, jaro_winkler_similarity(lower(function_name), lower($1)) AS likeness FROM duckdb_functions()) WHERE likeness >= 0.85 ORDER BY likeness DESC, function_name LIMIT 6';

/** The forms shown of each kind of a function: the others are counted. */
const SHOWN_FORMS = 10;

/** A row of {@link DUCKDB_FUNCTION_FORMS_SQL}: one form of a function. */
export interface IDuckDBFunctionForm {
	readonly function_name: string;
	readonly function_type: string;
	readonly alias_of: string | null;
	readonly description: string | null;
	readonly return_type: string | null;
	readonly parameters: readonly string[] | null;
	readonly parameter_types: readonly string[] | null;
	readonly varargs: string | null;
	readonly examples: readonly string[] | null;
}

/** One kind of a DuckDB function, as its help shows it. */
export interface IDuckDBFunctionKind {
	/** The kind, as duckdb_functions() names it: scalar, aggregate, table, macro, table_macro, pragma. */
	readonly type: string;
	/** Its forms as written in SQL, the first {@link SHOWN_FORMS}. */
	readonly forms: readonly string[];
	/** How many more forms it has. */
	readonly more: number;
	/** The function it is another name of, if any. */
	readonly alias?: string;
	readonly descriptions: readonly string[];
	readonly examples: readonly string[];
}

/** A form of a function as written in SQL: its parameters, each with its type, and what it returns. */
function functionForm(form: IDuckDBFunctionForm): string {
	const names = form.parameters ?? [];
	const types = form.parameter_types ?? [];
	// A table function's parameters are named col0, col1...: their types alone say more
	const parameters = names.map((parameter, index) => !types[index] ? parameter : /^col\d+$/.test(parameter) ? types[index] : `${parameter} ${types[index]}`);
	if (form.varargs) {
		parameters.push(`${form.varargs}...`);
	}
	return `${form.function_name}(${parameters.join(', ')})${form.return_type ? ` -> ${form.return_type}` : ''}`;
}

/** The kinds of a function from its forms, in their order: the forms of each, without repeats, its description and its examples. */
export function duckdbFunctionKinds(forms: readonly IDuckDBFunctionForm[]): IDuckDBFunctionKind[] {
	return [...new Set(forms.map(form => form.function_type))].map(type => {
		const ofType = forms.filter(form => form.function_type === type);
		const all = [...new Set(ofType.map(functionForm))];
		return {
			type,
			forms: all.slice(0, SHOWN_FORMS),
			more: Math.max(0, all.length - SHOWN_FORMS),
			alias: ofType.find(form => form.alias_of)?.alias_of ?? undefined,
			descriptions: [...new Set(ofType.flatMap(form => form.description ? [form.description] : []))],
			examples: [...new Set(ofType.flatMap(form => form.examples ?? []))],
		};
	});
}

/** The question as the name of a DuckDB function: a word of letters, digits and underscores alone, else undefined. */
export function duckdbFunctionName(question: string): string | undefined {
	const name = question.trim();
	return /^[A-Za-z_][A-Za-z0-9_]*$/.test(name) ? name : undefined;
}
