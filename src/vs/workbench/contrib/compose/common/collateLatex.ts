/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { escapeRegExpCharacters } from '../../../../base/common/strings.js';
import { localize } from '../../../../nls.js';

// Collate LaTeX, of Help > Documentation > Collate Documents... (compose/browser/collateDocumentsPage.ts): documents
// joined as the chapters of one book, in LaTeX the user can edit. Each document comes from the copy of its sources
// beside its PDF (extensions/language-julia/scripts/terminalserver/document_source.jl): its main file, with the .tex
// files it inputs put in their place, is cut at \begin{document}. The packages of its preamble go once into the book's
// preamble, the options of each package joined, and its geometry becomes the margins of its chapter; the rest of its
// preamble, its macros, colours, boxes and page style, runs at the start of its chapter, in a group of TeX, so that it
// ends with the chapter and does not meet another chapter's. In the group, the commands LaTeX allows only in the
// preamble work again, a \newcommand of a name taken defines it anyway, the contents are the chapter's own
// (\localtableofcontents of etoc), its sections, figures, tables and equations are numbered as in the document, and its
// labels, links and bookmarks are its own: \label, \ref, \hypertarget and the others add the chapter's number to the
// name. Its files are in chapters/NN/: its resources/, and the pictures and .bib files beside its main file, the paths
// that name them changed to match; its style files (.sty) beside the book. A document that cannot be joined so goes in
// as its PDF pages: a class other than article, references made by BibTeX or biblatex, or no sources.

/** A document's sources, from the copy beside its PDF. */
export interface ILatexSources {
	/** The text of each .tex file beside the main file, by its name, the main file among them. */
	readonly texts: ReadonlyMap<string, string>;
	/** The names of the other files beside the main file: pictures, .bib and style files. */
	readonly files: readonly string[];
}

/** A package of a document's preamble: its name and its options. */
export interface ILatexPackage {
	readonly name: string;
	readonly options: readonly string[];
}

/** A document as a chapter of the book: its LaTeX, or the reason it goes in as its PDF pages. */
export type LatexChapter =
	| { readonly kind: 'latex'; readonly text: string; readonly packages: readonly ILatexPackage[]; readonly geometry: readonly string[] }
	| { readonly kind: 'pdf'; readonly reason: string };

/** A chapter of the book, in its order: its title, its category's, its number and how it goes in. */
export interface IBookChapter {
	readonly title: string;
	readonly category: string;
	/** Its folder in the book, chapters/NN. */
	readonly folder: string;
	readonly kind: 'latex' | 'pdf';
}

/** The packages the book loads itself, with options of its own. */
const BOOK_PACKAGES = new Set(['geometry', 'hyperref', 'pdfpages', 'etoc']);

/** The options of geometry that are the paper's, not the margins': the book's paper is A4. */
const PAPER_OPTION = /^(?:[a-z]+paper|paper\s*=.*|papersize\s*=.*|landscape|portrait|twoside|oneside|showframe|pass)$/;

/** The classes whose documents go in as LaTeX: their sections are an article's. */
const ARTICLE_CLASSES = new Set(['article', 'scrartcl', 'extarticle']);

/** A text without its comments: the % kept, so that a line it ended still adds no space. */
function withoutComments(text: string): string {
	return text.replace(/(?<!\\)%.*$/gm, '%');
}

/** A name for a file or a folder made from a title: lower case, without accents, words joined by _, else `fallback`. */
export function fileStem(title: string, fallback: string): string {
	return title.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '') || fallback;
}

/** A text for LaTeX: its special characters escaped. */
export function latexText(text: string): string {
	return text.replace(/[\\{}&%$#_~^]/g, character => character === '\\' ? '\\textbackslash{}' : character === '~' ? '\\textasciitilde{}' : character === '^' ? '\\textasciicircum{}' : `\\${character}`);
}

/** The options of a package, from the text between its brackets. */
function packageOptions(text: string | undefined): string[] {
	return (text ?? '').split(',').map(option => option.trim()).filter(option => option.length > 0);
}

/**
 * A document as chapter `folder` (chapters/NN) of the book: its LaTeX, with the packages and margins it needs, or the
 * reason it goes in as its PDF pages.
 */
export function chapterLatex(sources: ILatexSources, folder: string): LatexChapter {
	const texts = new Map([...sources.texts].map(([name, text]) => [name, withoutComments(text)]));
	const main = [...texts.entries()].find(([, text]) => /\\begin\s*\{document\}/.test(text));
	if (!main) {
		return { kind: 'pdf', reason: localize('collateLatex.noMain', "its sources have no \\begin{document}") };
	}

	// The .tex files it inputs, in their place, those of Ask Pollis's labels left out: the book has them
	const flatten = (text: string, depth: number): string => text.replace(/\\(?:input|include)\s*\{(?<name>[^}]+)\}/g, (whole, name: string) => {
		const file = name.trim();
		if (/(?:^|\/)ask_labels(?:\.tex)?$/.test(file)) {
			return '';
		}
		const found = texts.get(file) ?? texts.get(`${file}.tex`);
		return found !== undefined && file !== main[0] && depth < 8 ? `\n${flatten(found, depth + 1)}\n` : whole;
	});
	const whole = flatten(main[1], 0);
	const begin = /\\begin\s*\{document\}/.exec(whole)!;
	const end = /\\end\s*\{document\}/.exec(whole);
	let preamble = whole.slice(0, begin.index);
	const body = whole.slice(begin.index + begin[0].length, end && end.index > begin.index ? end.index : undefined);

	const documentClass = /\\documentclass\s*(?:\[[^\]]*\])?\s*\{(?<name>[^}]*)\}/.exec(preamble);
	const className = documentClass?.groups?.name.trim() ?? '';
	if (!ARTICLE_CLASSES.has(className)) {
		return { kind: 'pdf', reason: localize('collateLatex.class', "its class is {0}, not article", className || '?') };
	}
	if (/\\(?:bibliography|addbibresource|printbibliography)\b/.test(preamble + body)) {
		return { kind: 'pdf', reason: localize('collateLatex.bibliography', "its references are made by BibTeX or biblatex") };
	}
	preamble = preamble.replace(documentClass![0], '');

	// The packages, to the book's preamble; the margins, to the chapter's
	const packages: ILatexPackage[] = [];
	const geometry: string[] = [];
	preamble = preamble.replace(/\\(?:usepackage|RequirePackage)\s*(?:\[(?<options>[^\]]*)\])?\s*\{(?<names>[^}]*)\}(?:\s*\[[^\]]*\])?/g, (_whole, options: string | undefined, names: string) => {
		for (const name of names.split(',').map(name => name.trim()).filter(name => name.length > 0)) {
			if (name === 'geometry') {
				geometry.push(...packageOptions(options).filter(option => !PAPER_OPTION.test(option)));
			} else {
				packages.push({ name, options: packageOptions(options) });
			}
		}
		return '';
	});
	preamble = preamble.replace(/\\geometry\s*\{(?<options>[^}]*)\}/g, (_whole, options: string) => {
		geometry.push(...packageOptions(options).filter(option => !PAPER_OPTION.test(option)));
		return '';
	});

	// Its files in its folder of the book: resources/, and the files beside its main file but its style files
	let text = `${preamble}\n${body}`;
	text = text.replace(/(?<=[{,])resources\//g, `${folder}/resources/`);
	for (const file of sources.files.filter(file => !/\.(?:tex|sty|cls)$/i.test(file))) {
		const stem = file.replace(/\.[^.]*$/, '');
		const names = [file, stem].filter((name, index, all) => name && all.indexOf(name) === index).map(escapeRegExpCharacters);
		text = text.replace(new RegExp(`(?<=[{,])(?:${names.join('|')})(?=[},])`, 'g'), name => `${folder}/${name}`);
	}
	return { kind: 'latex', text: text.replace(/\n{3,}/g, '\n\n').trim() + '\n', packages, geometry };
}

/** The packages of the chapters, each once, in the order they first come, the options of each joined. */
function joinedPackages(chapters: readonly LatexChapter[]): ILatexPackage[] {
	const joined = new Map<string, string[]>();
	for (const chapter of chapters) {
		if (chapter.kind !== 'latex') {
			continue;
		}
		for (const { name, options } of chapter.packages) {
			const all = joined.get(name) ?? [];
			joined.set(name, [...all, ...options.filter(option => !all.includes(option))]);
		}
	}
	return [...joined].map(([name, options]) => ({ name, options }));
}

/** A package as the book's preamble loads it. */
function usePackage({ name, options }: ILatexPackage): string {
	return options.length ? `\\usepackage[${options.join(',')}]{${name}}` : `\\usepackage{${name}}`;
}

/**
 * The commands of the book. A chapter runs in a group opened with \pollisinchapter{NN}, after \pollischapter{TITLE}
 * {MARGINS}, and its last page is shipped before the group closes, with the chapter's own page style.
 */
const BOOK_COMMANDS = String.raw`\makeatletter
% The commands LaTeX allows only in the preamble, kept for the preambles of the chapters
\def\pollis@save#1{\expandafter\let\csname pollis@pre@\string#1\endcsname#1}
\def\pollis@restore#1{\expandafter\let\expandafter#1\csname pollis@pre@\string#1\endcsname}
\def\pollis@savepreamble{\let\pollis@preamblecmds\@preamblecmds\let\do\pollis@save\@preamblecmds}
\AddToHook{begindocument/before}{\pollis@savepreamble}
% A command whose name gets the chapter's number: \ref{x} and \ref*{x} name x of this chapter
\def\pollis@named#1#2{#1{\pollis@chapter:#2}}
\def\pollis@prefixed#1{%
  \ifdefined#1%
    \expandafter\let\csname pollis@orig@\string#1\endcsname#1%
    \protected\edef#1{\noexpand\@ifstar
      {\noexpand\pollis@named{\expandafter\noexpand\csname pollis@orig@\string#1\endcsname*}}%
      {\noexpand\pollis@named{\expandafter\noexpand\csname pollis@orig@\string#1\endcsname}}}%
  \fi}
% \pdfbookmark[LEVEL]{TEXT}{NAME} of a chapter; not with \renewcommand, whose optional argument would replace the
% inner command the original calls
\def\pollis@bookmarkat[#1]#2#3{\pollis@pdfbookmark[#1]{#2}{\pollis@chapter:#3}}
% To the start of a right-hand page, a blank left-hand one without a header
\newcommand{\pollis@cleartoright}{\clearpage\ifodd\c@page\else\hbox{}\thispagestyle{empty}\newpage\fi}
\newcommand{\pollispart}[1]{\pollis@cleartoright\restoregeometry\part{#1}}
\newcommand{\pollischapter}[2]{%
  \pollis@cleartoright
  \if\relax\detokenize{#2}\relax\restoregeometry\else\newgeometry{#2}\fi
  \refstepcounter{chapter}%
  \addcontentsline{toc}{chapter}{#1}%
  \markboth{#1}{#1}}
\newcommand{\pollispdfchapter}[3]{%
  \pollis@cleartoright\restoregeometry
  \includepdf[pages=-,addtotoc={1,chapter,0,{#1},pollis:#3}]{#2}}
\newcommand{\pollisinchapter}[1]{%
  \def\pollis@chapter{#1}%
  \let\do\pollis@restore\pollis@preamblecmds
  \long\def\@@ifdefinable##1##2{##2}\let\@ifdefinable\@@ifdefinable
  \let\NewDocumentCommand\DeclareDocumentCommand
  \let\NewDocumentEnvironment\DeclareDocumentEnvironment
  \let\AtBeginDocument\@firstofone
  \let\tableofcontents\localtableofcontents
  \renewcommand{\thesection}{\arabic{section}}%
  \renewcommand{\thefigure}{\arabic{figure}}%
  \renewcommand{\thetable}{\arabic{table}}%
  \renewcommand{\theequation}{\arabic{equation}}%
  \setcounter{secnumdepth}{3}\setcounter{tocdepth}{3}%
  \pollis@prefixed\label\pollis@prefixed\ref\pollis@prefixed\pageref\pollis@prefixed\autoref
  \pollis@prefixed\nameref\pollis@prefixed\hypertarget\pollis@prefixed\hyperlink
  \ifdefined\label@in@display\pollis@prefixed\label@in@display\fi
  \let\pollis@pdfbookmark\pdfbookmark
  \protected\def\pdfbookmark{\@ifnextchar[\pollis@bookmarkat{\pollis@bookmarkat[0]}}%
  \let\pollis@hyperref\hyperref
  \protected\def\hyperref{\@ifnextchar[\pollis@hyperrefat\pollis@hyperref}%
  \def\pollis@hyperrefat[##1]{\pollis@hyperref[\pollis@chapter:##1]}}
\newcommand{\pollischapterend}{\clearpage}
\makeatother`;

/** The book's main file: its preamble, a title page, the contents, and the chapters in their order. */
export function bookLatex(title: string, chapters: readonly IBookChapter[], latex: readonly LatexChapter[]): string {
	const packages = joinedPackages(latex);
	const hyperref = packages.find(entry => entry.name === 'hyperref')?.options.filter(option => !/^bookmarks/.test(option)) ?? [];
	const lines = [
		'% Made by Pollis (Help > Documentation > Collate Documents...): each chapter is a document, in chapters/NN/chapter.tex,',
		'% whose preamble runs at its start, in a group of its own (\\pollisinchapter); the packages are loaded once, here.',
		'\\documentclass[10pt,a4paper,twoside,openright]{book}',
		'\\usepackage[a4paper]{geometry}',
		...packages.filter(entry => !BOOK_PACKAGES.has(entry.name)).map(usePackage),
		'\\usepackage{pdfpages}',
		'\\usepackage{etoc}',
		usePackage({ name: 'hyperref', options: ['bookmarks=true', 'bookmarksopen=true', ...hyperref.length ? hyperref : ['hidelinks']] }),
		`\\hypersetup{pdftitle={${latexText(title)}},pdfcreator={Pollis}}`,
		'\\providecommand{\\asklabel}[2]{}',
		BOOK_COMMANDS,
		'',
		'\\begin{document}',
		'\\pagestyle{empty}',
		'\\null\\vspace*{0.3\\textheight}',
		'\\begin{center}',
		`{\\Huge ${latexText(title)}\\par}\\vspace{1em}`,
		'{\\large \\today\\par}',
		'\\end{center}',
		'\\cleardoublepage',
		'\\pagestyle{plain}',
		'\\pdfbookmark[0]{\\contentsname}{contents}',
		'\\etocsetnexttocdepth{chapter}',
		'\\tableofcontents',
	];
	let category: string | undefined;
	chapters.forEach((chapter, index) => {
		if (chapter.category !== category) {
			category = chapter.category;
			lines.push('', `\\pollispart{${latexText(chapter.category)}}`);
		}
		const number = chapter.folder.replace(/^.*\//, '');
		lines.push('');
		if (chapter.kind === 'pdf' || latex[index].kind !== 'latex') {
			lines.push(`\\pollispdfchapter{${latexText(chapter.title)}}{${chapter.folder}/document.pdf}{${number}}`);
		} else {
			const margins = latex[index].kind === 'latex' ? latex[index].geometry.join(',') : '';
			lines.push(
				`\\pollischapter{${latexText(chapter.title)}}{${margins}}`,
				`\\begingroup\\pollisinchapter{${number}}`,
				`\\input{${chapter.folder}/chapter}`,
				'\\pollischapterend\\endgroup',
			);
		}
	});
	lines.push('', '\\end{document}', '');
	return lines.join('\n');
}
