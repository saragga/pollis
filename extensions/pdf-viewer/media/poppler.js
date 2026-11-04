/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

// The Poppler tools of the tools sidebar: Extract Text, Tables, Document Info, Fonts, Images, Render Pages, Convert,
// Split, Merge and Attachments. Each is a fold with its options, Run and its Julia code. The extension runs the tool of
// Poppler_jll in the hidden Julia process of the Julia extension (pdf_tools.jl), on the file on the disk, and asks
// for the folder or the file to save to. The files written, and the files attached to the PDF, are shown by their
// kind: a CSV file as a table, a picture as itself, a text file as its text.

import { areaCells, cellsCsv, cellsTabbed, pageRanges, parseCsv, tsvWords } from './cells.js';

/** How many rows of a table, and how many characters of a text file, are shown. */
const MAX_ROWS = 60;
const MAX_TEXT = 200000;

/** The kinds of file that are shown in the sidebar, by their extension. */
// The Poppler programs, as their names appear in the hints; the group keeps them in a split
const POPPLER_PROGRAMS = /\b(?<program>pdf(?:totext|info|fonts|images|toppm|tocairo|tops|tohtml|separate|unite|detach|attach))\b/;
const TABLE_FILES = /\.(csv|tsv)$/i;
const PICTURE_FILES = /\.(png|jpe?g|gif|webp|svg)$/i;
const TEXT_FILES = /\.(txt|md|json|xml|html?|tex|bib|log|ya?ml|toml|jl|py|r|m)$/i;
const PICTURE_TYPES = { png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', gif: 'image/gif', webp: 'image/webp', svg: 'image/svg+xml' };

const extensionOf = name => /\.(?<extension>[^./\\]+)$/.exec(name)?.groups.extension.toLowerCase() ?? '';
const nameOf = path => path.substring(path.replace(/\\/g, '/').lastIndexOf('/') + 1);

/** The brackets, coloured by depth as the editor colours them: an opening one and its closing one alike. */
const OPENING = '([{';
const CLOSING = ')]}';

/**
 * Colours the brackets of coloured code by their depth, in the theme's colours for bracket pairs, as the panels do;
 * those of comments keep the colour of the comment.
 */
function colorBrackets(root) {
	let depth = 0;
	const texts = [];
	const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
	for (let node = walker.nextNode(); node; node = walker.nextNode()) {
		texts.push(node);
	}
	for (const node of texts) {
		// A comment is a token of its own, which starts with #
		if (node.parentElement?.textContent.trimStart().startsWith('#')) {
			continue;
		}
		const fragment = document.createDocumentFragment();
		let run = '';
		for (const character of node.nodeValue) {
			const opening = OPENING.includes(character);
			if (!opening && !CLOSING.includes(character)) {
				run += character;
				continue;
			}
			if (run) {
				fragment.appendChild(document.createTextNode(run));
				run = '';
			}
			if (!opening) {
				depth = Math.max(0, depth - 1);
			}
			const bracket = document.createElement('span');
			bracket.textContent = character;
			bracket.style.color = `var(--vscode-editorBracketHighlight-foreground${depth % 6 + 1})`;
			fragment.appendChild(bracket);
			if (opening) {
				depth++;
			}
		}
		if (run) {
			fragment.appendChild(document.createTextNode(run));
		}
		node.replaceWith(fragment);
	}
}

/** A string of Julia code. */
const juliaString = text => `"${text.replace(/[\\"$]/g, character => `\\${character}`)}"`;

/** An argument of a Julia command literal: its placeholders as the variables of the code, quoted when it needs to be. */
function juliaArgument(argument) {
	const variables = { '{pdf}': '$pdf', '{out}': '$out', '{outStem}': '$(first(splitext(out)))', '{more}': '$more', '{attachment}': '$attachment', '{dir}': '$dir', '{page}': '$page' };
	if (variables[argument]) {
		return variables[argument];
	}
	if (argument.startsWith('{dir}/')) {
		return `$(joinpath(dir, ${juliaString(argument.slice('{dir}/'.length)).replace(/\{page\}/g, '$page')}))`;
	}
	return /^[\w.,:=+%/-]+$/.test(argument) ? argument : `"${argument.replace(/[\\"$`]/g, character => `\\${character}`)}"`;
}

/**
 * The tools, in `parent`. `context` gives the helpers of pdfViewer.js: T, config, post, app, element, button, format,
 * table, stem and getArea. Returns what pdfViewer.js tells the tools: the area, the document, and the messages of the
 * extension.
 */
export function popplerTools(parent, context) {
	const { T, config, post, app, element, button, format, table, stem, getArea } = context;

	let token = 0;
	const waiting = new Map();
	/** Sends a message that the extension answers with the same token. */
	const ask = (message, onStatus) => new Promise(resolve => {
		const id = ++token;
		waiting.set(id, { resolve, onStatus });
		post({ ...message, token: id });
	});

	// pdf.js starts after the tools are made
	const pageCount = () => app()?.pdfDocument?.numPages ?? 0;

	/** The colours of the tokens of the coloured code, in the theme's colours. */
	const tokenStyle = element('style');
	document.head.appendChild(tokenStyle);

	// ---- The options of every tool: the pages, the area and the password

	const section = element('section', 'pollisSection');
	section.appendChild(element('h2', '', T.poppler));
	section.appendChild(element('p', 'pollisHint', T.popplerHint));
	parent.appendChild(section);

	function field(label, title, input, row) {
		const wrapper = element('label', 'pollisField');
		if (title) {
			wrapper.title = title;
		}
		wrapper.append(element('span', '', label), input);
		row.appendChild(wrapper);
		return input;
	}

	function numberField(label, title, value, row, step = '1') {
		const input = element('input');
		input.type = 'number';
		input.min = '0';
		input.step = step;
		input.value = value;
		return field(label, title, input, row);
	}

	function selectField(label, title, options, row) {
		const input = element('select');
		for (const [value, text] of options) {
			const option = element('option', '', text);
			option.value = value;
			input.appendChild(option);
		}
		return field(label, title, input, row);
	}

	const shared = element('div', 'pollisSettings pollisOptions');
	section.appendChild(shared);
	const firstInput = numberField(T.firstPage, undefined, '1', shared);
	firstInput.min = '1';
	const lastInput = numberField(T.lastPage, T.lastPageTitle, '', shared);
	lastInput.min = '1';
	const passwordInput = element('input');
	passwordInput.type = 'password';
	passwordInput.autocomplete = 'off';
	field(T.password, T.passwordTitle, passwordInput, shared);

	const areaRow = element('label', 'pollisCheck');
	const onlyArea = element('input');
	onlyArea.type = 'checkbox';
	onlyArea.disabled = true;
	const areaLabel = element('span', '', T.onlyArea);
	areaRow.append(onlyArea, areaLabel);
	areaRow.title = T.onlyAreaTitle;
	section.appendChild(areaRow);

	/** The area the tools crop to, when Only the Area is on. */
	const croppedArea = () => onlyArea.checked ? getArea() : undefined;

	/** The page range, or why it is not one. */
	function pageRange() {
		const count = pageCount();
		if (!count) {
			return T.noDocument;
		}
		const first = Number(firstInput.value || 1);
		const last = lastInput.value ? Number(lastInput.value) : count;
		if (!Number.isInteger(first) || !Number.isInteger(last) || first < 1 || last > count || last < first) {
			return format(T.badRange, count);
		}
		return { first, last };
	}

	const password = () => passwordInput.value ? ['-upw', passwordInput.value] : [];
	const rangeArgs = range => ['-f', String(range.first), '-l', String(range.last)];
	/** The area as -x -y -W -H, in pixels at `scale` pixels to a point. */
	const cropArgs = (area, scale = 1) => area ? ['-x', String(Math.round(area.x * scale)), '-y', String(Math.round(area.y * scale)), '-W', String(Math.round(area.W * scale)), '-H', String(Math.round(area.H * scale))] : [];
	/** For a vector output, the area in points, on pages the size of the area. */
	const paperArgs = area => area ? [...cropArgs(area), '-paperw', String(Math.round(area.W)), '-paperh', String(Math.round(area.H))] : [];
	const pagesOf = range => Array.from({ length: range.last - range.first + 1 }, (_, i) => range.first + i);

	// ---- What a tool shows: its text, its files, a file by its kind

	/** A text with Copy, Save... and Send to Ask Pollis. */
	function textView(box, text, name, truncated) {
		box.textContent = '';
		if (!text.trim()) {
			box.appendChild(element('p', 'pollisHint', T.nothingFound));
			return;
		}
		box.appendChild(element('pre', 'pollisOutput', text.length > MAX_TEXT ? text.slice(0, MAX_TEXT) : text));
		if (truncated || text.length > MAX_TEXT) {
			box.appendChild(element('p', 'pollisHint', T.outputCut));
		}
		const actions = element('div', 'pollisButtons');
		actions.append(
			button(T.copyCode, undefined, () => post({ command: 'copy', text })),
			button(T.save, undefined, () => post({ command: 'saveAs', kind: 'other', name, data: new TextEncoder().encode(text) })),
			button(T.sendToAsk, T.sendOutputTitle, () => post({ command: 'ask', kind: 'file', name, content: text })),
		);
		box.appendChild(actions);
	}

	/** A table of cells with Copy Table, Save CSV... and Send to Ask Pollis. */
	function cellsView(box, cells, name) {
		box.textContent = '';
		if (!cells.length) {
			box.appendChild(element('p', 'pollisHint', T.noText));
			return;
		}
		const scroll = element('div', 'pollisTableBox');
		scroll.appendChild(table(cells.slice(0, MAX_ROWS)));
		const size = format(T.tableSize, cells.length, Math.max(...cells.map(row => row.length)));
		const actions = element('div', 'pollisButtons');
		actions.append(
			button(T.copyTable, T.copyTableTitle, () => post({ command: 'copy', text: cellsTabbed(cells) })),
			button(T.saveCsv, undefined, () => post({ command: 'saveAs', kind: 'csv', name, data: new TextEncoder().encode(cellsCsv(cells) + '\n') })),
			button(T.sendToAsk, T.sendTableTitle, () => post({ command: 'ask', kind: 'file', name, content: cellsCsv(cells) })),
		);
		box.append(scroll, element('p', 'pollisHint', cells.length > MAX_ROWS ? `${size}. ${format(T.tableShown, MAX_ROWS)}` : size), actions);
	}

	/** A file by its kind: a CSV file as a table, a picture as itself, a text file as its text; `data` is its bytes. */
	function fileView(box, name, data) {
		box.textContent = '';
		if (TABLE_FILES.test(name)) {
			const cells = parseCsv(new TextDecoder().decode(data));
			cellsView(box, cells, name.replace(/\.tsv$/i, '.csv'));
		} else if (PICTURE_FILES.test(name)) {
			const type = PICTURE_TYPES[extensionOf(name)];
			const picture = element('img');
			picture.src = URL.createObjectURL(new Blob([data], { type }));
			picture.alt = name;
			const holder = element('div', 'pollisPicture');
			holder.appendChild(picture);
			box.appendChild(holder);
			if (type === 'image/png' || type === 'image/jpeg') {
				const actions = element('div', 'pollisButtons');
				actions.appendChild(button(T.sendToAsk, T.sendImageTitle, async () => {
					const content = await new Promise(resolve => {
						const reader = new FileReader();
						reader.onload = () => resolve(reader.result);
						reader.readAsDataURL(new Blob([data], { type }));
					});
					post({ command: 'ask', kind: 'image', name, content });
				}));
				box.appendChild(actions);
			}
		} else {
			textView(box, new TextDecoder().decode(data), name, false);
		}
	}

	/** The button that shows a file of this kind, or none for a kind that is not shown. */
	const showLabel = name => TABLE_FILES.test(name) ? T.showTable : PICTURE_FILES.test(name) ? T.showImage : TEXT_FILES.test(name) ? T.showText : undefined;

	/** A row of a file: its name, and the buttons given, with Show Table, Show or Show Text for its kind, which shows it below. */
	function fileRow(list, name, buttons, read) {
		const item = element('div', 'pollisFile');
		const header = element('div', 'pollisFileHeader');
		header.appendChild(element('span', 'pollisFileName', name));
		const actions = element('div', 'pollisButtons');
		const view = element('div', 'pollisFileView');
		view.hidden = true;
		const label = showLabel(name);
		let show;
		if (label) {
			show = button(label, undefined, async () => {
				if (!view.hidden) {
					view.hidden = true;
					show.textContent = label;
					return;
				}
				view.hidden = false;
				view.textContent = T.working;
				const data = await read();
				if (data) {
					fileView(view, name, data);
					show.textContent = T.hide;
				} else {
					view.textContent = T.notRead;
				}
			});
			actions.appendChild(show);
		}
		actions.append(...buttons);
		item.append(header, actions, view);
		list.appendChild(item);
		return show;
	}

	/**
	 * The files a tool has written: how many, in which folder, with Reveal for the folder; then each file with Open,
	 * Reveal and the buttons of its kind.
	 */
	function filesView(box, files, folder) {
		box.textContent = '';
		if (!files.length) {
			box.appendChild(element('p', 'pollisHint', T.noFiles));
			return;
		}
		const [before, after] = format(files.length === 1 ? T.oneFileWritten : T.filesWritten, files.length, '\u0000').split('\u0000');
		const written = element('p', 'pollisHint pollisWritten');
		written.append(before);
		if (folder) {
			written.append(element('span', 'pollisPath', folder.label), after ?? '', button(T.reveal, folder.path, () => post({ command: 'reveal', path: folder.path })));
		}
		box.appendChild(written);
		const list = element('div', 'pollisFiles');
		for (const path of files) {
			fileRow(list, nameOf(path), [
				button(T.open, path, () => post({ command: 'openFile', path })),
				button(T.reveal, undefined, () => post({ command: 'reveal', path })),
			], async () => (await ask({ command: 'readFile', path })).data);
		}
		box.appendChild(list);
	}

	// ---- A tool: its fold, Run, what it shows and its code

	const tools = [];

	/**
	 * A tool's fold. `build(body)` adds its options; `plan()` gives the request for the extension and how to show the
	 * answer, or a string that says why it cannot run; `code(plan)`, when given, writes the code instead of the code made
	 * from the request.
	 */
	/** A heading over the tools that follow it. */
	function group(title) {
		parent.appendChild(element('h3', 'pollisGroup', title));
	}

	/** A hint, with the names of the Poppler programs in the yellow of packages. */
	function setHint(box, hint) {
		box.textContent = '';
		for (const [i, part] of hint.split(POPPLER_PROGRAMS).entries()) {
			// The split keeps the names, at the odd places
			box.append(i % 2 ? element('span', 'pollisPath', part) : part);
		}
	}

	function tool(key, title, short, hint, build, plan, code) {
		const details = element('details', 'pollisFold');
		// The name, and under it what the tool does, seen while the fold is closed
		const summary = element('summary');
		const name = element('span', 'pollisFoldTitle');
		name.append(element('span', '', title), element('span', 'pollisFoldDescription', short));
		summary.appendChild(name);
		details.appendChild(summary);
		const body = element('div', 'pollisFoldBody');
		details.appendChild(body);
		const hintBox = element('p', 'pollisHint');
		setHint(hintBox, hint);
		body.appendChild(hintBox);
		const options = element('div', 'pollisSettings pollisOptions');
		body.appendChild(options);
		build(options, hintBox);
		const status = element('p', 'pollisHint');
		const result = element('div', 'pollisResult');
		const run = button(T.run, undefined, () => start());
		const runRow = element('div', 'pollisButtons');
		runRow.appendChild(run);

		const codeFold = element('details', 'pollisFold pollisCode');
		codeFold.appendChild(element('summary', '', T.juliaCode));
		const codeBlock = element('pre');
		const codeActions = element('div', 'pollisButtons');
		codeActions.append(
			button(T.copyCode, undefined, () => post({ command: 'copy', text: codeText })),
			button(T.runInRepl, T.runInReplTitle, () => post({ command: 'runInRepl', code: codeText })),
		);

		/** The code, and the code last coloured: shown plain at once, and coloured as the panels colour theirs once the fold is open. */
		let codeText = '';
		let colored;
		const setCode = text => {
			codeText = text;
			if (colored !== text) {
				colored = undefined;
				codeBlock.textContent = text;
			}
			if (codeFold.open) {
				colorize();
			}
		};
		async function colorize() {
			const text = codeText;
			if (colored === text) {
				return;
			}
			const answer = await ask({ command: 'colorize', code: text });
			// The code changed meanwhile, or Pollis could not colour it
			if (text !== codeText || !answer.html) {
				return;
			}
			tokenStyle.textContent = answer.css ?? '';
			codeBlock.innerHTML = answer.html;
			colorBrackets(codeBlock);
			colored = text;
		}
		codeFold.addEventListener('toggle', () => {
			if (codeFold.open) {
				colorize();
			}
		});
		codeFold.append(codeBlock, codeActions);
		body.append(runRow, status, result, codeFold);
		parent.appendChild(details);

		/** The paths chosen at the last run, for the code. */
		let chosen;
		const refresh = () => {
			const planned = plan();
			if (typeof planned !== 'object') {
				setCode(`# ${planned ?? ''}`);
				return;
			}
			setCode(code ? code(planned) : requestCode(planned.request, chosen));
		};
		options.addEventListener('input', () => {
			chosen = undefined;
			refresh();
		});
		options.addEventListener('change', refresh);

		async function start() {
			const planned = plan();
			if (typeof planned !== 'object') {
				status.textContent = planned ?? '';
				return;
			}
			run.disabled = true;
			status.textContent = format(T.running, planned.request.tool ?? 'pdfseparate');
			const { answer } = await ask({ command: 'poppler', request: planned.request }, text => {
				status.textContent = text;
			});
			run.disabled = false;
			if (answer.cancelled) {
				status.textContent = '';
				return;
			}
			if (answer.error) {
				status.textContent = answer.error;
				return;
			}
			chosen = answer.chosen;
			refresh();
			if (answer.code !== 0) {
				status.textContent = format(T.toolFailed, planned.request.tool ?? 'pdfseparate', answer.code);
				result.textContent = '';
				if (answer.stderr?.trim()) {
					result.appendChild(element('pre', 'pollisOutput', answer.stderr));
				}
				return;
			}
			status.textContent = '';
			planned.show(result, answer);
		}

		/** Colours the code again, in the colours of another theme. */
		const recolor = () => {
			colored = undefined;
			if (codeFold.open) {
				colorize();
			}
		};
		const entry = { key, title, details, refresh, recolor };
		tools.push(entry);
		return entry;
	}

	/** The code of a request: the PDF, the folder or file chosen, and the tool's command. */
	function requestCode(request, chosen) {
		const args = request.args ?? [];
		const outs = (request.parts ?? []).map(part => part.out);
		const uses = name => [...args, ...outs].some(argument => argument === name || argument.startsWith(`${name}/`));
		const lines = ['using Poppler_jll  # the Poppler tools; Pkg.add("Poppler_jll") the first time', ''];
		lines.push(`pdf = ${juliaString(config.path)}`);
		if (uses('{dir}')) {
			lines.push(chosen?.dir ? `dir = ${juliaString(chosen.dir)}` : 'dir = dirname(pdf)  # the folder for the files');
		}
		if (request.output?.kind === 'file') {
			lines.push(chosen?.out ? `out = ${juliaString(chosen.out)}` : `out = joinpath(dirname(pdf), ${juliaString(request.output.name)})`);
		}
		if (uses('{more}')) {
			lines.push(chosen?.more ? `more = [${chosen.more.map(juliaString).join(', ')}]` : 'more = String[]  # the paths of the PDFs to add after this one');
		}
		if (uses('{attachment}')) {
			lines.push(chosen?.attachment ? `attachment = ${juliaString(chosen.attachment)}` : 'attachment = "notes.txt"  # the path of the file to attach');
		}
		if (request.parts) {
			const all = request.parts.flatMap(part => part.pages);
			const file = out => out === '{out}' ? 'out' : `joinpath(dir, ${juliaString(out.slice('{dir}/'.length))})`;
			const parts = request.parts.map(part => `\t([${part.pages.join(', ')}], ${file(part.out)}),`);
			lines.push(
				'',
				'# Each page a file of its own, in a temporary folder; then the pages of each PDF joined, in their order',
				'separate = mktempdir()',
				`run(\`$(pdfseparate()) -f ${Math.min(...all)} -l ${Math.max(...all)} $pdf $(joinpath(separate, "%d.pdf"))\`)`,
				'page(p) = joinpath(separate, "$p.pdf")',
				'for (pages, file) in [',
				...parts,
				']',
				'\tlength(pages) == 1 ? cp(page(pages[1]), file; force = true) : run(`$(pdfunite()) $(page.(pages)) $file`)',
				'end',
			);
			return lines.join('\n');
		}
		lines.push('');
		if (request.replace) {
			lines.push(`rm(out; force = true)  # ${request.tool} does not write over a file`);
		}
		const command = `\`$(${request.tool}()) ${args.map(juliaArgument).join(' ')}\``;
		if (request.pages) {
			// A run of pages as a range, else the list of the pages given
			const pages = request.pages;
			const run = pages.every((page, i) => page === pages[0] + i);
			const list = run ? `${pages[0]}:${pages[pages.length - 1]}` : `[${pages.join(', ')}]`;
			if (args[args.length - 1] === '-') {
				lines.push(`text = join(read(${command}, String) for page in ${list})  # - writes to standard output`, 'print(text)');
			} else {
				lines.push(`for page in ${list}`, `\trun(${command})`, 'end');
			}
		} else if (args[args.length - 1] === '-') {
			lines.push(`text = read(${command}, String)  # - writes to standard output`, 'print(text)');
		} else {
			lines.push(`run(${command})`);
		}
		return lines.join('\n');
	}

	/** Shows the standard output of a tool as text, saved or sent as `name`. */
	const showText = name => (box, answer) => textView(box, answer.stdout ?? '', name, answer.truncated);
	const showFiles = (box, answer) => filesView(box, answer.files ?? [], answer.folder);

	group(T.readGroup);

	// ---- Extract Text

	let textOrder;
	let textPages;
	tool('text', T.extractText, T.extractTextShort, T.extractTextHint, row => {
		textOrder = selectField(T.textOrder, T.textOrderTitle, [['reading', T.readingOrder], ['layout', T.physicalLayout], ['raw', T.streamOrder]], row);
		textPages = element('input', 'pollisWide');
		textPages.type = 'text';
		textPages.placeholder = T.pagesPlaceholder;
		field(T.splitPages, T.splitPagesTitle, textPages, row);
	}, () => {
		const range = pageRange();
		if (typeof range !== 'object') {
			return range;
		}
		const order = textOrder.value === 'reading' ? [] : [`-${textOrder.value}`];
		const area = croppedArea();
		const suffix = area ? ' area' : '';
		// The pages given, such as 1-3, 7, each read in its turn; or else First Page to Last Page in one run
		const text = textPages.value.trim();
		if (text) {
			const ranges = pageRanges(text, pageCount());
			if (!ranges) {
				return format(T.badPages, pageCount());
			}
			return {
				request: { tool: 'pdftotext', args: [...password(), '-enc', 'UTF-8', ...order, '-f', '{page}', '-l', '{page}', ...cropArgs(area), '{pdf}', '-'], pages: ranges.flat() },
				show: showText(`${stem()} p${text.replace(/\s+/g, '')}${suffix}.txt`),
			};
		}
		return {
			request: { tool: 'pdftotext', args: [...password(), '-enc', 'UTF-8', ...order, ...rangeArgs(range), ...cropArgs(area), '{pdf}', '-'] },
			show: showText(`${stem()} p${range.first}-${range.last}${suffix}.txt`),
		};
	});

	// ---- Tables

	let gapInput;
	let rowToleranceInput;
	const tablesPlan = () => {
		const area = getArea();
		if (!area) {
			return T.tablesNeedArea;
		}
		const gap = Number(gapInput.value) || 0;
		const rowTolerance = Number(rowToleranceInput.value) || 0;
		return {
			area, gap, rowTolerance,
			request: { tool: 'pdftotext', args: [...password(), '-tsv', '-f', String(area.page), '-l', String(area.page), '{pdf}', '-'] },
			show: (box, answer) => cellsView(box, areaCells(tsvWords(answer.stdout ?? ''), area, gap, rowTolerance), `${stem()} p${area.page} table.csv`),
		};
	};
	tool('tables', T.tables, T.tablesShort, T.tablesHint, row => {
		gapInput = numberField(T.gap, T.gapTitle, '8', row, '0.5');
		rowToleranceInput = numberField(T.rowTolerance, T.rowToleranceTitle, '3', row, '0.5');
	}, tablesPlan, planned => {
		const { area, gap, rowTolerance } = planned;
		const pw = password().map(juliaArgument).join(' ');
		return [
			'using Poppler_jll  # the Poppler tools; Pkg.add("Poppler_jll") the first time',
			'',
			`pdf = ${juliaString(config.path)}`,
			`page = ${area.page}`,
			`area = (x = ${area.x}, y = ${area.y}, W = ${area.W}, H = ${area.H})  # in points from the top left corner of the page`,
			`gap, rowtol = ${gap}, ${rowTolerance}  # the column gap and the row tolerance, in points`,
			'',
			'# One line per word, with its box: level, page, paragraph, block, line, word, left, top, width, height, confidence, text',
			`tsv = read(\`$(pdftotext()) ${pw ? `${pw} ` : ''}-tsv -f $page -l $page $pdf -\`, String)`,
			'words = @NamedTuple{x::Float64, y::Float64, w::Float64, text::String}[]',
			'for line in split(tsv, \'\\n\')[2:end]',
			'\tf = split(line, \'\\t\')',
			'\t(length(f) == 12 && f[1] == "5") || continue  # level 5 is a word',
			'\tx, y, w, h = parse.(Float64, f[7:10])',
			'\tinside = area.x <= x + w / 2 <= area.x + area.W && area.y <= y + h / 2 <= area.y + area.H  # the centre of the word',
			'\tinside && push!(words, (x = x, y = y, w = w, text = String(f[12])))',
			'end',
			'isempty(words) && error("No words in the area: the page may be a scan")',
			'# Rows: words whose tops are within the row tolerance',
			'sort!(words, by = w -> (w.y, w.x))',
			'rows = [[words[1]]]',
			'for w in words[2:end]',
			'\tw.y - rows[end][1].y <= rowtol ? push!(rows[end], w) : push!(rows, [w])',
			'end',
			'# Columns: the spans of the words, joined unless a gap of at least the column gap is between them',
			'spans = sort([(w.x, w.x + w.w) for w in words])',
			'cols = [spans[1]]',
			'for (a, b) in spans[2:end]',
			'\ta - cols[end][2] < gap ? (cols[end] = (cols[end][1], max(cols[end][2], b))) : push!(cols, (a, b))',
			'end',
			'cells = fill("", length(rows), length(cols))',
			'for (i, row) in enumerate(rows), w in sort(row, by = w -> w.x)',
			'\tj = findlast(c -> c[1] <= w.x + w.w / 2, cols)',
			'\tcells[i, j] = isempty(cells[i, j]) ? w.text : cells[i, j] * " " * w.text',
			'end',
			'cells',
		].join('\n');
	});

	// ---- Fonts

	let fontMode;
	tool('fonts', T.fonts, T.fontsShort, T.fontsHint, row => {
		fontMode = selectField(T.show, T.fontModeTitle, [['used', T.fontsUsed], ['subst', T.substitutes]], row);
	}, () => {
		const range = pageRange();
		if (typeof range !== 'object') {
			return range;
		}
		return { request: { tool: 'pdffonts', args: [...password(), ...(fontMode.value === 'subst' ? ['-subst'] : []), ...rangeArgs(range), '{pdf}'] }, show: showText(`${stem()} fonts.txt`) };
	});

	// ---- Images

	let imageMode;
	tool('images', T.images, T.imagesShort, T.imagesHint, row => {
		imageMode = selectField(T.imagesAction, T.imageModeTitle, [['list', T.list], ['all', T.saveOwnFormat], ['png', T.saveAsPng]], row);
	}, () => {
		const range = pageRange();
		if (typeof range !== 'object') {
			return range;
		}
		if (imageMode.value === 'list') {
			return { request: { tool: 'pdfimages', args: [...password(), '-list', ...rangeArgs(range), '{pdf}'] }, show: showText(`${stem()} images.txt`) };
		}
		// -p puts the page in the name of each file
		return { request: { tool: 'pdfimages', args: [...password(), `-${imageMode.value}`, '-p', ...rangeArgs(range), '{pdf}', `{dir}/${stem()}`], output: { kind: 'folder' } }, show: showFiles };
	});

	// ---- Attachments

	/** The files attached to the PDF, as pdf.js reads them: their names and bytes. */
	async function attachedFiles() {
		const attachments = await app().pdfDocument?.getAttachments();
		const entries = attachments instanceof Map ? [...attachments] : Object.entries(attachments ?? {});
		return entries.map(([id, attachment]) => ({ id, name: attachment.filename, attachment }));
	}

	/** The bytes of a file attached to the PDF. */
	async function attachedBytes(file) {
		return file.attachment.content ?? await app().pdfDocument.getAttachmentContent(file.id);
	}

	/** The attached files, each with Save... and the button of its kind. */
	async function attachmentsView(box, listed) {
		box.textContent = '';
		const files = await attachedFiles();
		// The names pdfdetach lists, in its order; pdf.js gives their bytes
		const names = [...listed.matchAll(/^\s*\d+:\s*(?<name>.+?)\s*$/gm)].map(match => match.groups.name);
		const shown = names.length ? names : files.map(file => file.name);
		if (!shown.length) {
			box.appendChild(element('p', 'pollisHint', T.noAttachments));
			return;
		}
		const list = element('div', 'pollisFiles');
		for (const name of shown) {
			const file = files.find(candidate => candidate.name === name);
			fileRow(list, name, file ? [button(T.save, undefined, async () => post({ command: 'saveAs', kind: 'other', name, data: await attachedBytes(file) }))] : [],
				async () => file ? attachedBytes(file) : undefined);
		}
		box.appendChild(list);
	}

	let attachAction;
	const attachmentsTool = tool('attachments', T.attachments, T.attachmentsShort, T.attachmentsHint, row => {
		attachAction = selectField(T.action, undefined, [['list', T.list], ['saveall', T.saveAll], ['add', T.addFile]], row);
	}, () => {
		if (!pageCount()) {
			return T.noDocument;
		}
		switch (attachAction.value) {
			case 'list':
				return { request: { tool: 'pdfdetach', args: [...password(), '-enc', 'UTF-8', '-list', '{pdf}'] }, show: (box, answer) => attachmentsView(box, answer.stdout ?? '') };
			case 'saveall':
				return { request: { tool: 'pdfdetach', args: [...password(), '-saveall', '-o', '{dir}', '{pdf}'], output: { kind: 'folder' } }, show: showFiles };
			default:
				// An attachment of the same name is replaced
				return { request: { tool: 'pdfattach', args: ['-replace', '{pdf}', '{attachment}', '{out}'], pick: 'file', replace: true, output: { kind: 'file', name: `${stem()} with attachment.pdf`, extension: 'pdf' } }, show: showFiles };
		}
	});
	const attachmentView = element('div', 'pollisResult');
	attachmentsTool.details.querySelector('.pollisFoldBody').appendChild(attachmentView);

	// ---- Document Info

	let infoDetail;
	tool('info', T.documentInfo, T.documentInfoShort, T.documentInfoHint, row => {
		infoDetail = selectField(T.show, undefined, [['summary', T.summary], ['meta', T.xmpMetadata], ['box', T.pageBoxes], ['url', T.links], ['dests', T.namedDestinations], ['struct-text', T.structureTree], ['js', T.javaScript]], row);
	}, () => {
		const count = pageCount();
		if (!count) {
			return T.noDocument;
		}
		const detail = infoDetail.value;
		const args = detail === 'summary' ? ['-isodates'] : detail === 'box' ? ['-box', '-f', '1', '-l', String(count)] : [`-${detail}`];
		return { request: { tool: 'pdfinfo', args: [...password(), ...args, '{pdf}'] }, show: showText(`${stem()} ${detail === 'summary' ? 'info' : detail}.txt`) };
	});

	group(T.makeGroup);

	// ---- Render Pages

	let renderFormat;
	let resolutionInput;
	let colourMode;
	tool('render', T.renderPages, T.renderPagesShort, T.renderPagesHint, row => {
		renderFormat = selectField(T.format, undefined, [['png', 'PNG'], ['jpeg', 'JPEG'], ['tiff', 'TIFF']], row);
		resolutionInput = numberField(T.resolution, T.resolutionTitle, '150', row);
		colourMode = selectField(T.colour, undefined, [['colour', T.inColour], ['gray', T.grey], ['mono', T.blackAndWhite]], row);
	}, () => {
		const range = pageRange();
		if (typeof range !== 'object') {
			return range;
		}
		const resolution = Number(resolutionInput.value);
		if (!(resolution >= 10 && resolution <= 2400)) {
			return T.badResolution;
		}
		const colour = colourMode.value === 'colour' ? [] : [`-${colourMode.value}`];
		// pdftoppm takes the area in pixels: points times the resolution over 72
		const args = [...password(), `-${renderFormat.value}`, '-r', String(resolution), ...colour, ...rangeArgs(range), ...cropArgs(croppedArea(), resolution / 72), '{pdf}', `{dir}/${stem()}`];
		return { request: { tool: 'pdftoppm', args, output: { kind: 'folder' } }, show: showFiles };
	});

	// ---- Convert

	let convertFormat;
	// The hint of each format: what it is for
	const convertHints = { svg: T.convertSvgHint, pdf: T.convertPdfHint, ps: T.convertPsHint, eps: T.convertEpsHint, html: T.convertHtmlHint, xml: T.convertXmlHint };
	tool('convert', T.convert, T.convertShort, T.convertSvgHint, (row, hintBox) => {
		convertFormat = selectField(T.format, T.convertFormatTitle, [['svg', 'SVG'], ['pdf', T.pdfOfArea], ['ps', 'PostScript'], ['eps', 'EPS'], ['html', 'HTML'], ['xml', 'XML']], row);
		convertFormat.addEventListener('change', () => setHint(hintBox, convertHints[convertFormat.value] ?? ''));
	}, () => {
		const range = pageRange();
		if (typeof range !== 'object') {
			return range;
		}
		const kind = convertFormat.value;
		const area = croppedArea();
		if (area && kind !== 'svg' && kind !== 'pdf') {
			return T.areaFormats;
		} else if (!area && kind === 'pdf') {
			return T.pdfNeedsArea;
		}
		const pages = `p${range.first}-${range.last}`;
		switch (kind) {
			case 'svg':
				// One file for each page
				return { request: { tool: 'pdftocairo', args: [...password(), '-svg', ...paperArgs(area), '-f', '{page}', '-l', '{page}', '{pdf}', `{dir}/${stem()}-{page}.svg`], pages: pagesOf(range), output: { kind: 'folder' } }, show: showFiles };
			case 'pdf':
				return { request: { tool: 'pdftocairo', args: [...password(), '-pdf', ...paperArgs(area), ...rangeArgs(range), '{pdf}', '{out}'], output: { kind: 'file', name: `${stem()} ${pages} area.pdf`, extension: 'pdf' } }, show: showFiles };
			case 'ps':
				return { request: { tool: 'pdftops', args: [...password(), ...rangeArgs(range), '{pdf}', '{out}'], output: { kind: 'file', name: `${stem()} ${pages}.ps`, extension: 'ps' } }, show: showFiles };
			case 'eps':
				// An EPS file holds one page: the first of the range
				return { request: { tool: 'pdftops', args: [...password(), '-eps', '-f', String(range.first), '-l', String(range.first), '{pdf}', '{out}'], output: { kind: 'file', name: `${stem()} p${range.first}.eps`, extension: 'eps' } }, show: showFiles };
			case 'html':
				// -s: one HTML file for all the pages, with its pictures beside it
				return { request: { tool: 'pdftohtml', args: [...password(), '-s', '-noframes', '-q', ...rangeArgs(range), '{pdf}', `{dir}/${stem()}`], output: { kind: 'folder' } }, show: showFiles };
			default:
				// -i leaves out the pictures; pdftohtml adds .xml to the name it is given
				return { request: { tool: 'pdftohtml', args: [...password(), '-xml', '-i', '-q', ...rangeArgs(range), '{pdf}', '{outStem}'], output: { kind: 'file', name: `${stem()} ${pages}.xml`, extension: 'xml' } }, show: showFiles };
		}
	});

	// ---- Split

	let splitMode;
	let splitPages;
	tool('split', T.split, T.splitShort, T.splitHint, row => {
		splitMode = selectField(T.splitInto, undefined, [['pages', T.filePerPage], ['one', T.pagesIntoOne], ['ranges', T.filePerRange]], row);
		splitPages = element('input', 'pollisWide');
		splitPages.type = 'text';
		splitPages.placeholder = T.pagesPlaceholder;
		field(T.splitPages, T.splitPagesTitle, splitPages, row);
	}, () => {
		// Pages only for the modes that take a list
		splitPages.parentElement.hidden = splitMode.value === 'pages';
		const range = pageRange();
		if (typeof range !== 'object') {
			return range;
		}
		if (splitMode.value === 'pages') {
			// %d becomes the number of the page
			return { request: { tool: 'pdfseparate', args: [...rangeArgs(range), '{pdf}', `{dir}/${stem()}-%d.pdf`], output: { kind: 'folder' } }, show: showFiles };
		}
		// The pages given, such as 1-3, 5, or else First Page to Last Page
		const text = splitPages.value.trim();
		const ranges = text ? pageRanges(text, pageCount()) : [pagesOf(range)];
		if (!ranges) {
			return format(T.badPages, pageCount());
		}
		const label = text ? text.replace(/\s+/g, '') : `${range.first}-${range.last}`;
		if (splitMode.value === 'one') {
			return { request: { parts: [{ pages: ranges.flat(), out: '{out}' }], output: { kind: 'file', name: `${stem()} p${label}.pdf`, extension: 'pdf' } }, show: showFiles };
		}
		const name = pages => pages.length === 1 ? `${pages[0]}` : `${pages[0]}-${pages[pages.length - 1]}`;
		return { request: { parts: ranges.map(pages => ({ pages, out: `{dir}/${stem()} p${name(pages)}.pdf` })), output: { kind: 'folder' } }, show: showFiles };
	});

	// ---- Merge

	tool('merge', T.merge, T.mergeShort, T.mergeHint, () => { }, () => pageCount()
		? { request: { tool: 'pdfunite', args: ['{pdf}', '{more}', '{out}'], pick: 'pdfs', output: { kind: 'file', name: `${stem()} merged.pdf`, extension: 'pdf' } }, show: showFiles }
		: T.noDocument);

	const refreshAll = () => tools.forEach(entry => entry.refresh());
	shared.addEventListener('input', refreshAll);
	onlyArea.addEventListener('change', refreshAll);
	refreshAll();

	return {
		/** A new area, or none: Only the Area is on for a new one, and the pages are its page. */
		areaChanged(area) {
			onlyArea.disabled = !area;
			onlyArea.checked = !!area;
			areaLabel.textContent = area ? format(T.onlyAreaOf, area.page) : T.onlyArea;
			if (area) {
				firstInput.value = String(area.page);
				lastInput.value = String(area.page);
			}
			refreshAll();
		},
		documentOpened() {
			lastInput.placeholder = String(pageCount() || '');
			refreshAll();
		},
		/** A file attached to the PDF, chosen in the Attachments of the Pages pane: shown by its kind in Attachments. */
		showAttachment(name, data) {
			attachmentsTool.details.open = true;
			const list = element('div', 'pollisFiles');
			const show = fileRow(list, name, [button(T.save, undefined, () => post({ command: 'saveAs', kind: /\.pdf$/i.test(name) ? 'pdf' : 'other', name, data }))], async () => data);
			attachmentView.textContent = '';
			attachmentView.appendChild(list);
			show?.click();
			attachmentsTool.details.scrollIntoView({ block: 'nearest' });
		},
		/** The code of the tools coloured again, in the colours of the theme now chosen. */
		recolor() {
			for (const entry of tools) {
				entry.recolor();
			}
		},
		/** Whether a file of this name is shown by its kind. */
		shows: name => !!showLabel(name),
		received(message) {
			const entry = waiting.get(message.token);
			if (!entry) {
				return;
			}
			if (message.command === 'popplerStatus') {
				entry.onStatus?.(message.text);
				return;
			}
			waiting.delete(message.token);
			entry.resolve(message);
		},
	};
}
