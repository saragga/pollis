/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

// allow-any-unicode-comment-file

// A word checked against a Hunspell dictionary, its .aff and .dic files, as Hunspell checks it: the word itself, or a
// stem of the dictionary with the prefixes and suffixes its flags allow stripped off (two suffixes, or a prefix and a
// suffix, at most), or a compound of such words, by compound rules (Dutch numbers) or by the flags of the first, middle
// and last parts (German, Dutch), which a stem has or an affix gives it. It reads the files of LibreOffice's
// dictionaries: flags of one character, two characters, numbers or UTF-8, aliases of flags, conversions of the input,
// and words that need an affix, are only in compounds or are forbidden. It only says whether a word is in the
// dictionary: OCR Files and Snippets uses it to flag the words a scan may have misread (ocrFiles.ts).

/** An affix: a prefix or a suffix, the flag of the stems that take it, what it strips and adds, and on what condition. */
interface IAffix {
	readonly flag: string;
	readonly prefix: boolean;
	readonly cross: boolean;
	readonly strip: string;
	readonly add: string;
	/** The test of the stem: its start for a prefix, its end for a suffix. */
	readonly condition: RegExp | undefined;
	/** The flags the affix gives the word: those of the affixes that may come after it, and of compounds. */
	readonly continuation: ReadonlySet<string>;
}

/** Where a word is: alone, or a part of a compound, whose first part may have prefixes and last part suffixes. */
interface IPlace {
	readonly compound: boolean;
	readonly prefix: boolean;
	readonly suffix: boolean;
}

/** A compound boundary Hunspell forbids: a part ending in `end` (with the flag `endFlag`) before one beginning with `begin`. */
interface ICompoundPattern {
	readonly end: string;
	readonly endFlag: string;
	readonly begin: string;
	readonly beginFlag: string;
}

type FlagMode = 'char' | 'long' | 'num' | 'utf8';

/** The most parts a compound is split into. */
const COMPOUND_PARTS = 5;

const ALONE: IPlace = { compound: false, prefix: true, suffix: true };

/** A Hunspell dictionary, from the text of its .aff and .dic files. */
export class Hunspell {

	private mode: FlagMode = 'char';
	private readonly aliases: string[][] = [];
	private readonly stems = new Map<string, string[][]>();
	/** The affixes, by the last character they add (a suffix) or the first (a prefix); '' for those that add nothing. */
	private readonly suffixes = new Map<string, IAffix[]>();
	private readonly prefixes = new Map<string, IAffix[]>();
	private readonly conversions: [string, string][] = [];
	private needAffix = '';
	private onlyInCompound = '';
	private forbidden = '';
	private circumfix = '';
	private compoundFlag = '';
	private compoundBegin = '';
	private compoundMiddle = '';
	private compoundEnd = '';
	private compoundPermit = '';
	private compoundMin = 3;
	private checkCompoundCase = false;
	private checkCompoundDuplicate = false;
	private readonly compoundPatterns: ICompoundPattern[] = [];
	/** The compound rules, each a pattern over the flags of the parts, every flag one character of `ruleFlags`. */
	private readonly compoundRules: RegExp[] = [];
	private readonly ruleFlags = new Map<string, string>();

	constructor(aff: string, dic: string) {
		this.readAffixes(aff);
		this.readWords(dic);
	}

	/** The character set the .aff file names, from its SET line, for decoding both files. */
	static encoding(affHead: string): string {
		const set = /^SET\s+(?<name>\S+)/m.exec(affHead)?.groups?.name.toLowerCase() ?? 'utf-8';
		return set === 'utf-8' || set === 'utf8' ? 'utf-8' : set.replace(/^iso8859-/, 'iso-8859-').replace(/^microsoft-cp/, 'windows-');
	}

	/** Whether the dictionary has `word`, as written or with a capital letter Hunspell lowers. */
	correct(word: string): boolean {
		const converted = this.convert(word);
		if (this.known(converted)) {
			return true;
		}
		const lower = converted.toLocaleLowerCase();
		const capitalized = converted.charAt(0) + converted.slice(1).toLocaleLowerCase();
		// Capitalised (a sentence's first word) or all in capitals (a heading): the dictionary's form in lower case, or capitalised
		if (converted !== lower && (converted === capitalized || converted === converted.toLocaleUpperCase())) {
			return this.known(lower) || (converted !== capitalized && this.known(capitalized));
		}
		return false;
	}

	private known(word: string): boolean {
		return this.analyses(word, ALONE).length > 0 || this.compound(word);
	}

	private convert(word: string): string {
		let result = word;
		for (const [from, to] of this.conversions) {
			if (result.includes(from)) {
				result = result.split(from).join(to);
			}
		}
		return result;
	}

	/**
	 * The flags of the ways `word` is made, at `place`: a stem, or a stem with a suffix, two suffixes, a prefix, or a prefix
	 * and a suffix. Each is the stem's flags with those the affixes give it.
	 */
	private analyses(word: string, place: IPlace): string[][] {
		const found: string[][] = [];
		const stemUsable = (flags: readonly string[]) => !flags.includes(this.forbidden) && (place.compound || !flags.includes(this.onlyInCompound));
		// An affix in a compound's part only where the part may have one, or with the flag that permits it anywhere
		const affixUsable = (affix: IAffix) => (place.compound
			? (affix.prefix ? place.prefix : place.suffix) || affix.continuation.has(this.compoundPermit)
			: !affix.continuation.has(this.onlyInCompound));
		const add = (flags: readonly string[], affixes: IAffix[]) => {
			// An affix that needs another; a circumfix, which needs a prefix and a suffix that both are
			if (affixes.length === 1 && affixes[0].continuation.has(this.needAffix)) {
				return;
			}
			const circumfixes = affixes.filter(affix => affix.continuation.has(this.circumfix));
			if (circumfixes.length && (circumfixes.length !== 2 || circumfixes[0].prefix === circumfixes[1].prefix)) {
				return;
			}
			found.push(affixes.length ? [...flags, ...affixes.flatMap(affix => [...affix.continuation])] : [...flags]);
		};
		for (const flags of this.stems.get(word) ?? []) {
			if (stemUsable(flags) && !flags.includes(this.needAffix)) {
				add(flags, []);
			}
		}
		// A suffix, and a suffix before it that allows it
		for (const suffix of this.affixesOf(this.suffixes, word.charAt(word.length - 1))) {
			const inner = affixUsable(suffix) ? this.stripSuffix(word, suffix) : undefined;
			if (inner === undefined) {
				continue;
			}
			for (const flags of this.stems.get(inner) ?? []) {
				if (stemUsable(flags) && flags.includes(suffix.flag)) {
					add(flags, [suffix]);
				}
			}
			for (const before of this.affixesOf(this.suffixes, inner.charAt(inner.length - 1))) {
				if (!before.continuation.has(suffix.flag) || !affixUsable(before)) {
					continue;
				}
				const stem = this.stripSuffix(inner, before);
				for (const flags of stem === undefined ? [] : this.stems.get(stem) ?? []) {
					if (stemUsable(flags) && flags.includes(before.flag)) {
						add(flags, [before, suffix]);
					}
				}
			}
		}
		// A prefix, and a suffix with it when both may combine
		for (const prefix of this.affixesOf(this.prefixes, word.charAt(0))) {
			const inner = affixUsable(prefix) ? this.stripPrefix(word, prefix) : undefined;
			if (inner === undefined) {
				continue;
			}
			for (const flags of this.stems.get(inner) ?? []) {
				if (stemUsable(flags) && flags.includes(prefix.flag)) {
					add(flags, [prefix]);
				}
			}
			for (const suffix of this.affixesOf(this.suffixes, inner.charAt(inner.length - 1))) {
				const linked = suffix.continuation.has(prefix.flag) || prefix.continuation.has(suffix.flag);
				if (!((prefix.cross && suffix.cross) || linked) || !affixUsable(suffix)) {
					continue;
				}
				const stem = this.stripSuffix(inner, suffix);
				for (const flags of stem === undefined ? [] : this.stems.get(stem) ?? []) {
					if (stemUsable(flags) && (flags.includes(prefix.flag) || suffix.continuation.has(prefix.flag)) && (flags.includes(suffix.flag) || prefix.continuation.has(suffix.flag))) {
						add(flags, [prefix, suffix]);
					}
				}
			}
		}
		return found;
	}

	private affixesOf(table: Map<string, IAffix[]>, character: string): IAffix[] {
		const at = table.get(character) ?? [];
		const empty = table.get('') ?? [];
		return empty.length ? [...at, ...empty] : at;
	}

	private stripSuffix(word: string, suffix: IAffix): string | undefined {
		if (!word.endsWith(suffix.add) || (word.length <= suffix.add.length && !suffix.strip)) {
			return undefined;
		}
		const stem = word.slice(0, word.length - suffix.add.length) + suffix.strip;
		return stem && (!suffix.condition || suffix.condition.test(stem)) ? stem : undefined;
	}

	private stripPrefix(word: string, prefix: IAffix): string | undefined {
		if (!word.startsWith(prefix.add) || (word.length <= prefix.add.length && !prefix.strip)) {
			return undefined;
		}
		const stem = prefix.strip + word.slice(prefix.add.length);
		return stem && (!prefix.condition || prefix.condition.test(stem)) ? stem : undefined;
	}

	/** Whether `word` is a compound the dictionary allows: by its compound rules, or by its flags for compound parts. */
	private compound(word: string): boolean {
		if (!this.compoundRules.length && !this.compoundFlag && !this.compoundBegin) {
			return false;
		}
		return this.compoundFrom(word, 0, [], [], new Map());
	}

	/** Whether `word` from `start` ends a compound after `parts`; `memo` the analyses of the pieces of the word already made. */
	private compoundFrom(word: string, start: number, parts: string[], analyses: string[][][], memo: Map<number, string[][]>): boolean {
		if (start === word.length) {
			return parts.length >= 2 && this.compoundAllowed(parts, analyses);
		}
		if (parts.length >= COMPOUND_PARTS || word.length - start < this.compoundMin) {
			return false;
		}
		for (let end = start + this.compoundMin; end <= word.length; end++) {
			if (end < word.length && word.length - end < this.compoundMin) {
				continue;
			}
			const part = word.slice(start, end);
			const previous = parts[parts.length - 1];
			if (previous !== undefined && !this.boundaryAllowed(previous, part)) {
				continue;
			}
			// A piece is read once for the word: where it starts and ends say whether it may have a prefix or a suffix
			const key = start * (word.length + 1) + end;
			let found = memo.get(key);
			if (!found) {
				found = this.analyses(part, { compound: true, prefix: start === 0, suffix: end === word.length });
				memo.set(key, found);
			}
			if (found.length && (previous === undefined || this.patternsAllow(previous, analyses[analyses.length - 1], part, found))
				&& this.compoundFrom(word, end, [...parts, part], [...analyses, found], memo)) {
				return true;
			}
		}
		return false;
	}

	/** Whether two parts may meet: no capital letter at the boundary (CHECKCOMPOUNDCASE), no part twice (CHECKCOMPOUNDDUP). */
	private boundaryAllowed(previous: string, part: string): boolean {
		if (this.checkCompoundDuplicate && previous === part) {
			return false;
		}
		if (this.checkCompoundCase) {
			const last = previous.charAt(previous.length - 1);
			const first = part.charAt(0);
			const capital = (character: string) => character !== character.toLocaleLowerCase();
			if (last !== '-' && first !== '-' && (capital(last) || capital(first))) {
				return false;
			}
		}
		return true;
	}

	/** Whether no CHECKCOMPOUNDPATTERN forbids the boundary between two parts. */
	private patternsAllow(previous: string, previousAnalyses: string[][], part: string, analyses: string[][]): boolean {
		for (const pattern of this.compoundPatterns) {
			if (previous.endsWith(pattern.end) && part.startsWith(pattern.begin)
				&& (!pattern.endFlag || previousAnalyses.every(flags => flags.includes(pattern.endFlag)))
				&& (!pattern.beginFlag || analyses.every(flags => flags.includes(pattern.beginFlag)))) {
				return false;
			}
		}
		return true;
	}

	/** Whether the parts, each with the flags of its possible stems, make a compound by a rule or by the compound flags. */
	private compoundAllowed(parts: readonly string[], analyses: string[][][]): boolean {
		if (this.compoundRules.length) {
			const choices = analyses.map(part => [...new Set(part.flatMap(flags => flags.map(flag => this.ruleFlags.get(flag)).filter((code): code is string => !!code)))]);
			if (choices.every(codes => codes.length)) {
				let sequences = [''];
				for (const codes of choices) {
					sequences = sequences.flatMap(sequence => codes.map(code => sequence + code)).slice(0, 2000);
				}
				if (sequences.some(sequence => this.compoundRules.some(rule => rule.test(sequence)))) {
					return true;
				}
			}
		}
		if (this.compoundFlag || this.compoundBegin) {
			const allowed = (part: string[][], position: string) => part.some(flags =>
				(this.compoundFlag && flags.includes(this.compoundFlag)) || (position && flags.includes(position)));
			return analyses.every((part, index) => allowed(part, index === 0 ? this.compoundBegin : index === parts.length - 1 ? this.compoundEnd : this.compoundMiddle));
		}
		return false;
	}

	/** The flags of a field of flags, or of the alias it numbers. */
	private flags(field: string): string[] {
		if (!field) {
			return [];
		}
		if (this.aliases.length && /^\d+$/.test(field)) {
			return this.aliases[Number(field) - 1] ?? [];
		}
		return this.parseFlags(field);
	}

	private parseFlags(field: string): string[] {
		switch (this.mode) {
			case 'long': return field.match(/[\s\S]{1,2}/g) ?? [];
			case 'num': return field.split(',').filter(Boolean);
			case 'utf8': return Array.from(field);
			default: return field.split('');
		}
	}

	private readAffixes(aff: string): void {
		const lines = aff.split(/\r?\n/);
		// The tables AF, ICONV, COMPOUNDRULE and CHECKCOMPOUNDPATTERN start with a line of their number of entries, `AF 333`
		const counted = new Set<string>();
		const entry = (key: string) => counted.has(key) || !counted.add(key);
		for (let index = 0; index < lines.length; index++) {
			const fields = lines[index].trim().split(/\s+/);
			const [key, value = ''] = fields;
			switch (key) {
				case 'FLAG': this.mode = value === 'long' ? 'long' : value === 'num' ? 'num' : value === 'UTF-8' ? 'utf8' : 'char'; break;
				case 'AF': if (entry(key)) { this.aliases.push(this.parseFlags(value)); } break;
				case 'NEEDAFFIX': case 'PSEUDOROOT': this.needAffix = value; break;
				case 'ONLYINCOMPOUND': this.onlyInCompound = value; break;
				case 'FORBIDDENWORD': this.forbidden = value; break;
				case 'CIRCUMFIX': this.circumfix = value; break;
				case 'COMPOUNDFLAG': this.compoundFlag = value; break;
				case 'COMPOUNDBEGIN': this.compoundBegin = value; break;
				case 'COMPOUNDMIDDLE': this.compoundMiddle = value; break;
				case 'COMPOUNDEND': case 'COMPOUNDLAST': this.compoundEnd = value; break;
				case 'COMPOUNDPERMITFLAG': this.compoundPermit = value; break;
				case 'COMPOUNDMIN': this.compoundMin = /^\d+$/.test(value) ? Math.max(1, Number(value)) : 3; break;
				case 'CHECKCOMPOUNDCASE': this.checkCompoundCase = true; break;
				case 'CHECKCOMPOUNDDUP': this.checkCompoundDuplicate = true; break;
				case 'CHECKCOMPOUNDPATTERN': if (entry(key) && fields.length >= 3) { this.addCompoundPattern(fields[1], fields[2]); } break;
				case 'ICONV': if (entry(key) && fields.length >= 3) { this.conversions.push([fields[1], fields[2]]); } break;
				case 'COMPOUNDRULE': if (entry(key)) { this.addCompoundRule(value); } break;
				case 'PFX':
				case 'SFX': {
					// The header, `SFX flag Y count`, then `count` lines `SFX flag strip add condition`
					const count = Number(fields[3]);
					if (fields.length < 4 || !Number.isInteger(count)) {
						break;
					}
					const cross = fields[2] === 'Y';
					const table = key === 'PFX' ? this.prefixes : this.suffixes;
					for (let line = 0; line < count && index + 1 < lines.length; line++) {
						index++;
						const parts = lines[index].trim().split(/\s+/);
						if (parts[0] !== key || parts[1] !== value || parts.length < 4) {
							continue;
						}
						const affix = this.affix(value, key === 'PFX', cross, parts[2], parts[3], parts[4] ?? '.');
						const at = affix.add ? (affix.prefix ? affix.add.charAt(0) : affix.add.charAt(affix.add.length - 1)) : '';
						const list = table.get(at) ?? [];
						list.push(affix);
						table.set(at, list);
					}
					break;
				}
			}
		}
		// The longest conversion first, so `ﬃ` is converted before `ﬀ`
		this.conversions.sort((a, b) => b[0].length - a[0].length);
	}

	private affix(flag: string, prefix: boolean, cross: boolean, strip: string, addField: string, condition: string): IAffix {
		const slash = addField.indexOf('/');
		const add = slash >= 0 ? addField.slice(0, slash) : addField;
		const continuation = new Set(slash >= 0 ? this.flags(addField.slice(slash + 1)) : []);
		return {
			flag, prefix, cross, continuation,
			strip: strip === '0' ? '' : strip,
			add: add === '0' ? '' : add,
			condition: condition === '.' ? undefined : new RegExp(prefix ? `^(?:${conditionPattern(condition)})` : `(?:${conditionPattern(condition)})$`, 'u'),
		};
	}

	/** `end[/flag] begin[/flag]`: the end of a part, the beginning of the next, each optionally with a flag. */
	private addCompoundPattern(end: string, begin: string): void {
		const split = (field: string) => {
			const slash = field.indexOf('/');
			return slash >= 0 ? [field.slice(0, slash), this.flags(field.slice(slash + 1))[0] ?? ''] : [field, ''];
		};
		const [endText, endFlag] = split(end);
		const [beginText, beginFlag] = split(begin);
		this.compoundPatterns.push({ end: endText === '0' ? '' : endText, endFlag, begin: beginText === '0' ? '' : beginText, beginFlag });
	}

	private addCompoundRule(rule: string): void {
		// The flags of the rule, each in parentheses when they are long or numbers, with * and ? after them
		const tokens = this.mode === 'long' || this.mode === 'num' ? rule.match(/\([^)]*\)[*?]?/g) ?? [] : Array.from(rule.matchAll(/[^*?][*?]?/gu), match => match[0]);
		let pattern = '';
		for (const token of tokens) {
			const quantifier = /[*?]$/.test(token) ? token.slice(-1) : '';
			const flag = (quantifier ? token.slice(0, -1) : token).replace(/^\((?<flag>.*)\)$/, '$<flag>');
			let code = this.ruleFlags.get(flag);
			if (!code) {
				code = String.fromCodePoint(0xE000 + this.ruleFlags.size);
				this.ruleFlags.set(flag, code);
			}
			pattern += code + quantifier;
		}
		if (pattern) {
			this.compoundRules.push(new RegExp(`^${pattern}$`, 'u'));
		}
	}

	private readWords(dic: string): void {
		const lines = dic.split(/\r?\n/);
		for (let index = 1; index < lines.length; index++) {
			const line = lines[index];
			if (!line || line.startsWith('\t') || line.startsWith('#')) {
				continue;
			}
			// `word/flags`, then morphological fields after a tab or a space; a slash in the word is escaped
			const field = line.split(/[\t ]/)[0];
			const slash = field.search(/(?<!\\)\//);
			const word = (slash >= 0 ? field.slice(0, slash) : field).replace(/\\\//g, '/');
			if (!word) {
				continue;
			}
			const flags = slash >= 0 ? this.flags(field.slice(slash + 1)) : [];
			const homonyms = this.stems.get(word);
			if (homonyms) {
				homonyms.push(flags);
			} else {
				this.stems.set(word, [flags]);
			}
		}
	}
}

/** A Hunspell condition (characters, `.`, and classes in brackets) as a regular expression. */
function conditionPattern(condition: string): string {
	let pattern = '';
	let inClass = false;
	for (const character of condition) {
		if (character === '[') {
			inClass = true;
			pattern += '[';
		} else if (character === ']' && inClass) {
			inClass = false;
			pattern += ']';
		} else if (character === '.' && !inClass) {
			pattern += '.';
		} else if (character === '^' && inClass && pattern.endsWith('[')) {
			pattern += '^';
		} else {
			pattern += character.replace(/[\\^$.*+?()[\]{}|/-]/g, '\\$&');
		}
	}
	return pattern;
}
