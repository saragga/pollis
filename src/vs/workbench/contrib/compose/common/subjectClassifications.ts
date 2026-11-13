/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

// The key words and subject classifications a text gives on its first pages, as articles print them: "Key words.
// Julia, numerical, scientific computing, parallel", "AMS subject classifications. 68N15, 65Y05, 97P40", "JEL
// Classification: G12, G14", "CCS Concepts: • Software and its engineering → Compilers". Each is read from the line
// its label starts, and the lines that go on with it; a text without them has none. The subject of a text is the
// top-level class of the first code it gives, the primary one, as its classification system names it.

/** The classification systems read, by the names Pollis shows. */
const MSC = 'MSC';
const JEL = 'JEL';
const ACM = 'ACM CCS';

/**
 * The top-level classes of the Mathematics Subject Classification, MSC2020, by their two digits, as zbMATH Open and
 * the American Mathematical Society name them (msc2020.org, CC BY-NC-SA 4.0).
 */
const MSC_CLASSES: Readonly<Record<string, string>> = {
	'00': 'General and overarching topics; collections',
	'01': 'History and biography',
	'03': 'Mathematical logic and foundations',
	'05': 'Combinatorics',
	'06': 'Order, lattices, ordered algebraic structures',
	'08': 'General algebraic systems',
	'11': 'Number theory',
	'12': 'Field theory and polynomials',
	'13': 'Commutative algebra',
	'14': 'Algebraic geometry',
	'15': 'Linear and multilinear algebra; matrix theory',
	'16': 'Associative rings and algebras',
	'17': 'Nonassociative rings and algebras',
	'18': 'Category theory; homological algebra',
	'19': 'K-theory',
	'20': 'Group theory and generalizations',
	'22': 'Topological groups, Lie groups',
	'26': 'Real functions',
	'28': 'Measure and integration',
	'30': 'Functions of a complex variable',
	'31': 'Potential theory',
	'32': 'Several complex variables and analytic spaces',
	'33': 'Special functions',
	'34': 'Ordinary differential equations',
	'35': 'Partial differential equations',
	'37': 'Dynamical systems and ergodic theory',
	'39': 'Difference and functional equations',
	'40': 'Sequences, series, summability',
	'41': 'Approximations and expansions',
	'42': 'Harmonic analysis on Euclidean spaces',
	'43': 'Abstract harmonic analysis',
	'44': 'Integral transforms, operational calculus',
	'45': 'Integral equations',
	'46': 'Functional analysis',
	'47': 'Operator theory',
	'49': 'Calculus of variations and optimal control; optimization',
	'51': 'Geometry',
	'52': 'Convex and discrete geometry',
	'53': 'Differential geometry',
	'54': 'General topology',
	'55': 'Algebraic topology',
	'57': 'Manifolds and cell complexes',
	'58': 'Global analysis, analysis on manifolds',
	'60': 'Probability theory and stochastic processes',
	'62': 'Statistics',
	'65': 'Numerical analysis',
	'68': 'Computer science',
	'70': 'Mechanics of particles and systems',
	'74': 'Mechanics of deformable solids',
	'76': 'Fluid mechanics',
	'78': 'Optics, electromagnetic theory',
	'80': 'Classical thermodynamics, heat transfer',
	'81': 'Quantum theory',
	'82': 'Statistical mechanics, structure of matter',
	'83': 'Relativity and gravitational theory',
	'85': 'Astronomy and astrophysics',
	'86': 'Geophysics',
	'90': 'Operations research, mathematical programming',
	'91': 'Game theory, economics, finance, and other social and behavioral sciences',
	'92': 'Biology and other natural sciences',
	'93': 'Systems theory; control',
	'94': 'Information and communication theory, circuits',
	'97': 'Mathematics education',
};

/** The top-level classes of the Journal of Economic Literature classification, as the American Economic Association names them (aeaweb.org/econlit). */
const JEL_CLASSES: Readonly<Record<string, string>> = {
	A: 'General Economics and Teaching',
	B: 'History of Economic Thought, Methodology, and Heterodox Approaches',
	C: 'Mathematical and Quantitative Methods',
	D: 'Microeconomics',
	E: 'Macroeconomics and Monetary Economics',
	F: 'International Economics',
	G: 'Financial Economics',
	H: 'Public Economics',
	I: 'Health, Education, and Welfare',
	J: 'Labor and Demographic Economics',
	K: 'Law and Economics',
	L: 'Industrial Organization',
	M: 'Business Administration and Business Economics; Marketing; Accounting; Personnel Economics',
	N: 'Economic History',
	O: 'Economic Development, Innovation, Technological Change, and Growth',
	P: 'Political Economy and Comparative Economic Systems',
	Q: 'Agricultural and Natural Resource Economics; Environmental and Ecological Economics',
	R: 'Urban, Rural, Regional, Real Estate, and Transportation Economics',
	Y: 'Miscellaneous Categories',
	Z: 'Other Special Topics',
};

/** The top-level branches of the ACM Computing Classification System, CCS 2012 (dl.acm.org/ccs). */
const ACM_BRANCHES: readonly string[] = [
	'General and reference', 'Hardware', 'Computer systems organization', 'Networks', 'Software and its engineering',
	'Theory of computation', 'Mathematics of computing', 'Information systems', 'Security and privacy',
	'Human-centered computing', 'Computing methodologies', 'Applied computing', 'Social and professional topics',
];

/** What a labelled line holds. */
type LabelKind = 'keyWords' | typeof MSC | typeof JEL | typeof ACM;

/** The labels of the lines read, each with what its line holds; the label is cut off the line. */
const LABELS: readonly { readonly pattern: RegExp; readonly kind: LabelKind }[] = [
	{ pattern: /^(?:key\s*-?\s*words?(?:\s+and\s+phrases)?|index\s+terms)\s*[.:\u2014\u2013-]*\s*/i, kind: 'keyWords' },
	{ pattern: /^(?:\d{4}\s+)?(?:AMS|mathematics)\b[^.:]{0,60}?classifications?\s*(?:\(?(?:MSC\s*)?\d{4}\)?)?\s*[.:\u2014\u2013-]+\s*/i, kind: MSC },
	{ pattern: /^MSC\s*\(?\d{0,4}\)?\s*(?:classifications?|codes?)?\s*[.:\u2014\u2013-]+\s*/i, kind: MSC },
	{ pattern: /^JEL\b[^.:]{0,40}?[.:\u2014\u2013-]+\s*/i, kind: JEL },
	{ pattern: /^(?:(?:ACM\s+)?CCS\s+concepts|ACM\s+(?:CCS|computing\s+classification(?:\s+system)?))\b[^.:]{0,20}?[.:\u2014\u2013-]+\s*/i, kind: ACM },
];

/** A line that ends a labelled block: what comes after the key words and codes on a first page. */
const BLOCK_END = /^(?:doi\b|https?:|received\b|accepted\b|published\b|introduction\b|contents\b|abstract\b|\u00a9|\(c\)|\d+(?:\.\d+)*\.?\s+[A-Z])/i;

/** The codes of a system in a line. */
const CODES: Readonly<Record<typeof MSC | typeof JEL, RegExp>> = {
	[MSC]: /\b\d{2}(?:[A-Z](?:\d{2}|xx)|-(?:XX|\d{2}))\b/g,
	[JEL]: /\b[A-Z]\d{1,2}\b/g,
};

/** A classification a text gives: its system, as Pollis names it, and its codes, the primary first. */
export interface ISubjectClassification {
	readonly system: string;
	readonly codes: readonly string[];
}

/** The key words and subject classifications of a text. */
export interface ITextClassification {
	readonly keyWords: readonly string[];
	readonly classifications: readonly ISubjectClassification[];
}

/** The kind of the label a line starts with, and the line without it; undefined for a line without one. */
function labelled(line: string): { kind: LabelKind; rest: string } | undefined {
	for (const label of LABELS) {
		const match = label.pattern.exec(line);
		if (match) {
			return { kind: label.kind, rest: line.slice(match[0].length) };
		}
	}
	return undefined;
}

/** The key words of a line: its items, between commas, semicolons or bullets. */
function keyWordsOf(text: string): string[] {
	const words: string[] = [];
	for (const item of text.split(/\s*[;,\u00b7\u2022]\s*|\s+[\u2014\u2013]\s+/)) {
		const word = item.replace(/\s+/g, ' ').replace(/[.\s]+$/, '').trim();
		if (word && word.length <= 80 && !words.some(other => other.toLowerCase() === word.toLowerCase())) {
			words.push(word);
		}
	}
	return words.slice(0, 25);
}

/** The codes of a line of `system`: those of its pattern, or, for the ACM, its concepts, between semicolons. */
function codesOf(system: typeof MSC | typeof JEL | typeof ACM, text: string): string[] {
	const codes = system === ACM
		? text.split(/\s*;\s*/).map(item => item.replace(/^[\u2022\u00b7\s]+/, '').replace(/\s*\u2192\s*/g, ' \u2192 ').replace(/[.\s]+$/, '').trim())
		: text.match(CODES[system]) ?? [];
	return [...new Set(codes.filter(code => code))];
}

/**
 * The key words and subject classifications of a text, from the text of its first pages: the first block of each
 * label, its line and the lines that go on with it, at most three.
 */
export function readClassification(text: string): ITextClassification {
	const lines = text.split(/\r?\n/).map(line => line.trim());
	let keyWords: string[] = [];
	const classifications: ISubjectClassification[] = [];
	for (let i = 0; i < lines.length; i++) {
		const found = labelled(lines[i]);
		if (!found || (found.kind === 'keyWords' ? keyWords.length : classifications.some(c => c.system === found.kind))) {
			continue;
		}
		let block = found.rest;
		for (let j = i + 1; j < lines.length && j <= i + 3; j++) {
			const next = lines[j];
			const goesOn = found.kind === 'keyWords' ? /[,;]$/.test(block) || /^[a-z]/.test(next) : found.kind === ACM ? /[;\u2192]$/.test(block) : !!next.match(CODES[found.kind]);
			if (!next || !goesOn || labelled(next) || BLOCK_END.test(next)) {
				break;
			}
			block += ' ' + next;
		}
		if (found.kind === 'keyWords') {
			keyWords = keyWordsOf(block);
		} else {
			const codes = codesOf(found.kind, block);
			if (codes.length) {
				classifications.push({ system: found.kind, codes });
			}
		}
	}
	return { keyWords, classifications };
}

/** A classification as the table and catalogue.toml show it: "MSC: 68N15, 65Y05, 97P40". */
export function classificationText(classification: ISubjectClassification): string {
	return `${classification.system}: ${classification.codes.join(classification.system === ACM ? '; ' : ', ')}`;
}

/** The classification of a text as written in catalogue.toml or on the page: "MSC: 68N15, 65Y05"; undefined without a system. */
export function parseClassification(text: string): ISubjectClassification | undefined {
	const match = /^(?<system>[^:]+):\s*(?<codes>.*)$/.exec(text.trim());
	if (!match?.groups) {
		return undefined;
	}
	const system = match.groups.system.trim();
	const known = [MSC, JEL, ACM].find(name => name.toLowerCase() === system.toLowerCase() || (name === MSC && /^AMS$/i.test(system)));
	const codes = match.groups.codes.split(known === ACM ? /\s*;\s*/ : /\s*[,;]\s*/).map(code => code.trim()).filter(code => code);
	return codes.length ? { system: known ?? system, codes } : undefined;
}

/**
 * The subject of a text: the top-level class of the first code of its first classification, its primary code, as its
 * system names it, with the code of the class beside it: "Computer science (MSC 68)". Undefined for a code no table has.
 */
export function subjectOf(classifications: readonly ISubjectClassification[]): string | undefined {
	const first = classifications.find(classification => classification.codes.length);
	const code = first?.codes[0];
	if (!first || !code) {
		return undefined;
	}
	if (first.system === MSC) {
		const name = MSC_CLASSES[code.slice(0, 2)];
		return name && `${name} (${MSC} ${code.slice(0, 2)})`;
	}
	if (first.system === JEL) {
		const name = JEL_CLASSES[code[0]];
		return name && `${name} (${JEL} ${code[0]})`;
	}
	if (first.system === ACM) {
		const branch = code.split('\u2192')[0].trim();
		return ACM_BRANCHES.find(name => name.toLowerCase() === branch.toLowerCase()) && `${branch} (${ACM})`;
	}
	return undefined;
}
