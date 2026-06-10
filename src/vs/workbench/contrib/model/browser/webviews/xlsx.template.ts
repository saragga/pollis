/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Antonio Saragga Seabra. All rights reserved.
 *  Proprietary and confidential. Unauthorised copying or distribution is prohibited.
 *--------------------------------------------------------------------------------------------*/

import { buildWebviewHtml } from './webviewScaffold.js';

export function getXlsxHtml(mermaidJs?: string): string {
	return buildWebviewHtml({
		title: 'Excel Workbook',
		mermaidJs,
		wideLayout: true,
		defaultModel: 'write',
		modelsLiteral: "['write', 'read', 'formula']",
		chartW: 54,
		illusCollapsed: true,
		illustrationLabel: 'Illustration',
		illustrationOverrideJs: `			body.innerHTML = '<div style="text-align:center;padding:24px 0;font-size:13px;color:var(--vscode-descriptionForeground);">Excel file reader and writer for the Julia language.</div>';
			return;`,
		extraCss: `
			.refs-container { display: flex; gap: 16px; height: 400px; }
			.refs-list-panel { flex: 0 0 45%; overflow-y: auto; padding-right: 8px; }
			.refs-actions-panel { flex: 0 0 55%; border-left: 1px solid var(--vscode-widget-border); padding-left: 16px; overflow-y: auto; }
			.references-list { display: flex; flex-direction: column; gap: 8px; }
			.reference-item { background: var(--vscode-list-hoverBackground); border: 1px solid var(--vscode-widget-border); border-radius: 4px; padding: 10px; text-align: left; cursor: pointer; transition: all 0.2s; }
			.reference-item:hover { background: var(--vscode-list-activeSelectionBackground); border-color: var(--vscode-focusBorder); }
			.reference-item.active { background: var(--vscode-list-activeSelectionBackground); border-color: var(--vscode-focusBorder); }
			.ref-title { display: block; font-weight: 500; color: var(--vscode-foreground); margin-bottom: 4px; word-break: break-word; }
			.ref-desc { display: block; font-size: 11px; color: var(--vscode-descriptionForeground); }
			.action-btn { display: block; width: 100%; margin-bottom: 8px; padding: 8px 12px; background: var(--vscode-button-background); color: var(--vscode-button-foreground); border: none; border-radius: 3px; cursor: pointer; font-size: 12px; transition: background 0.2s; }
			.action-btn:hover { background: var(--vscode-button-hoverBackground); }
			.ref-placeholder { font-size: 12px; color: var(--vscode-descriptionForeground); text-align: center; padding: 20px 10px; }
		`,
		togglesJs: `			<button class="toggle-btn active" data-model="write">Write</button>
			<button class="toggle-btn" data-model="read">Read</button>
			<button class="toggle-btn" data-model="formula">Formula</button>`,
		bullets: `
				<li><strong>Read</strong> &#8212; load sheets and ranges from any <code>.xlsx</code> file into Julia arrays or Tables.jl-compatible structures</li>
				<li><strong>Write</strong> &#8212; create workbooks with multiple sheets from Julia arrays or any Tables.jl source</li>
				<li><strong>Formula</strong> &#8212; embed Excel formulas, defined names, and rich text (AnnotatedStrings) in cells (v0.11+)</li>
				<li><strong>Format</strong> &#8212; apply fonts, fills, borders, alignment, conditional formatting, and merged cells (v0.11+)</li>
			`,
		decisionRows: `
				<tr><td>Read</td><td>Existing file</td><td>Load sheet data into Julia for analysis or transformation</td></tr>
				<tr><td>Write</td><td>New file</td><td>Generate workbooks programmatically from Julia data</td></tr>
				<tr><td>Format</td><td>Presentation</td><td>Style cells with fonts, colours, borders, and conditional rules</td></tr>
				<tr><td>Formula</td><td>Excel logic</td><td>Embed formulas or defined names for downstream Excel users</td></tr>
			`,
		decisionFirstColumn: 'Task',
		miniChartsJs: `
			function mini_read() {
				var s = '<rect x="4" y="8" width="46" height="68" rx="2" fill="none" stroke="currentColor" stroke-width="0.8" opacity="0.4"/>';
				s += '<line x1="4" y1="22" x2="50" y2="22" stroke="currentColor" stroke-width="0.5" opacity="0.4"/>';
				s += '<line x1="4" y1="36" x2="50" y2="36" stroke="currentColor" stroke-width="0.5" opacity="0.3"/>';
				s += '<line x1="4" y1="50" x2="50" y2="50" stroke="currentColor" stroke-width="0.5" opacity="0.3"/>';
				s += '<line x1="20" y1="8" x2="20" y2="76" stroke="currentColor" stroke-width="0.5" opacity="0.3"/>';
				s += '<text x="27" y="56" text-anchor="middle" font-size="7" fill="currentColor" opacity="0.7">Read</text>';
				return s;
			}
			function mini_write() {
				var s = '<rect x="4" y="8" width="46" height="68" rx="2" fill="none" stroke="currentColor" stroke-width="0.8" opacity="0.4"/>';
				s += '<rect x="10" y="18" width="34" height="10" rx="1" fill="currentColor" opacity="0.25"/>';
				s += '<rect x="10" y="32" width="34" height="10" rx="1" fill="currentColor" opacity="0.15"/>';
				s += '<rect x="10" y="46" width="34" height="10" rx="1" fill="currentColor" opacity="0.15"/>';
				s += '<text x="27" y="70" text-anchor="middle" font-size="7" fill="currentColor" opacity="0.7">Write</text>';
				return s;
			}
			function mini_formula() {
				var s = '<rect x="4" y="8" width="46" height="68" rx="2" fill="none" stroke="currentColor" stroke-width="0.8" opacity="0.4"/>';
				s += '<text x="10" y="28" font-size="9" fill="currentColor" opacity="0.6">=SUM</text>';
				s += '<text x="10" y="42" font-size="9" fill="currentColor" opacity="0.4">=IF</text>';
				s += '<text x="10" y="56" font-size="9" fill="currentColor" opacity="0.4">=AVG</text>';
				return s;
			}
			var MINI_CHARTS = [mini_write, mini_read, mini_formula];
			var MINI_LABELS = ['Write', 'Read', 'Formula'];`,
		codeBranchesJs: `
			if (currentModel === 'read') {
				c += cline(kw('using') + ' ' + ty('XLSX'), 'pure-Julia Excel reader');
				c += blank();
				c += cline(fn('mktempdir') + '() ' + kw('do') + ' dir', 'work in a temp directory — cleaned up automatically');
				c += line('    path = ' + fn('joinpath') + '(dir, "demo.xlsx")');
				c += blank();
				c += cline('    ' + ty('XLSX') + '.' + fn('openxlsx') + '(path; mode="w") ' + kw('do') + ' xf', 'step 1: create a file to read');
				c += line('        ws = xf[1]');
				c += cline('        ws["A1"] = "name";  ws["B1"] = "score"', 'headers');
				c += line('        ws["A2"] = "Alice"; ws["B2"] = 95');
				c += line('        ws["A3"] = "Bob";   ws["B3"] = 87');
				c += line('    ' + kw('end'));
				c += blank();
				c += cline('    ' + ty('XLSX') + '.' + fn('openxlsx') + '(path) ' + kw('do') + ' xf', 'step 2: open and read it back');
				c += cline('        ws  = xf[1]', 'first sheet');
				c += cline('        ' + fn('println') + '("Sheets: ", ' + ty('XLSX') + '.' + fn('sheetnames') + '(xf))', 'list sheet names');
				c += cline('        ' + fn('println') + '("A1:B3 = ", ws["A1:B3"])', 'read range as a Matrix{Any}');
				c += cline('        tbl = ' + ty('XLSX') + '.' + fn('gettable') + '(ws)', 'read as a Tables.jl table (first row = headers)');
				c += cline('        ' + kw('for') + ' row ' + kw('in') + ' ' + ty('XLSX') + '.' + fn('eachtablerow') + '(ws)', 'iterate rows lazily');
				c += cline('            ' + fn('println') + '(row[1], "  ", row[2])', 'access by column index');
				c += line('        ' + kw('end'));
				c += line('    ' + kw('end'));
				c += line(kw('end'));
			} else if (currentModel === 'write') {
				c += cline(kw('using') + ' ' + ty('XLSX'), 'pure-Julia Excel writer');
				c += blank();
				c += cline(fn('mktempdir') + '() ' + kw('do') + ' dir', 'work in a temp directory — cleaned up automatically');
				c += line('    path = ' + fn('joinpath') + '(dir, "output.xlsx")');
				c += cline('    ' + ty('XLSX') + '.' + fn('openxlsx') + '(path; mode="w") ' + kw('do') + ' xf', 'create new workbook');
				c += cline('        ' + ty('XLSX') + '.' + fn('rename!') + '(xf[1], "Results")', 'rename the default Sheet1');
				c += cline('        ws1 = xf[1]', 'reference the (now renamed) sheet');
				c += cline('        ws1["A1"] = "name";  ws1["B1"] = "score"', 'header row');
				c += cline('        ws1["A2"] = "Alice"; ws1["B2"] = 95', 'data row 1');
				c += cline('        ws1["A3"] = "Bob";   ws1["B3"] = 87', 'data row 2');
				c += blank();
				c += cline('        ' + ty('XLSX') + '.' + fn('addsheet!') + '(xf, "Inventory")', 'add a second sheet');
				c += cline('        ws2 = xf["Inventory"]', 'reference it');
				c += cline('        ws2["A1"] = "product"; ws2["B1"] = "qty"', 'header row');
				c += cline('        ws2["A2"] = "A";       ws2["B2"] = 10', 'data row 1');
				c += cline('        ws2["A3"] = "B";       ws2["B3"] = 20', 'data row 2');
				c += line('    ' + kw('end'));
				c += cline('    ' + fn('println') + '("Written: ", path)', 'file is saved when the do-block exits');
				c += line(kw('end'));
			} else {
				c += cline(kw('using') + ' ' + ty('XLSX'), 'Excel formulas and defined names (v0.11+)');
				c += blank();
				c += cline(fn('mktempdir') + '() ' + kw('do') + ' dir', 'work in a temp directory — cleaned up automatically');
				c += line('    path = ' + fn('joinpath') + '(dir, "model.xlsx")');
				c += cline('    ' + ty('XLSX') + '.' + fn('openxlsx') + '(path; mode="w") ' + kw('do') + ' xf', 'create workbook');
				c += cline('        ws = xf[1]', 'first worksheet');
				c += cline('        ws["A1"] = "Jan"; ws["B1"] = 12000.0; ws["C1"] = 8000.0', 'month / revenue / costs');
				c += line('        ws["A2"] = "Feb"; ws["B2"] = 15000.0; ws["C2"] = 9500.0');
				c += line('        ws["A3"] = "Mar"; ws["B3"] = 11000.0; ws["C3"] = 7500.0');
				c += blank();
				c += cline('        ' + ty('XLSX') + '.' + fn('setFormula') + '(ws, "D1", "B1-C1")', 'profit formula — evaluated by Excel');
				c += line('        ' + ty('XLSX') + '.' + fn('setFormula') + '(ws, "D2", "B2-C2")');
				c += line('        ' + ty('XLSX') + '.' + fn('setFormula') + '(ws, "D3", "B3-C3")');
				c += cline('        ' + ty('XLSX') + '.' + fn('addDefinedName') + '(xf, "Revenue", "Sheet1!\$B\$1:\$B\$3")', 'named range usable in Excel formulas');
				c += line('    ' + kw('end'));
				c += line(kw('end'));
			}`,
		actionsJs: `
			var WRITE_ACTIONS = [
				{
					id: 'xlsx-write-cells',
					label: 'Write Cells',
					desc: 'Create a workbook with two sheets by writing cells directly',
					code: function() {
						var c = '';
						c += cline(kw('using') + ' ' + ty('XLSX'), 'pure-Julia Excel writer');
						c += blank();
						c += cline(fn('mktempdir') + '() ' + kw('do') + ' dir', 'work in a temp directory — cleaned up automatically');
						c += line('    path = ' + fn('joinpath') + '(dir, "output.xlsx")');
						c += cline('    ' + ty('XLSX') + '.' + fn('openxlsx') + '(path; mode="w") ' + kw('do') + ' xf', 'create workbook');
						c += cline('        ' + ty('XLSX') + '.' + fn('rename!') + '(xf[1], "Results")', 'rename Sheet1');
						c += line('        ws1 = xf[1]');
						c += cline('        ws1["A1"] = "name";  ws1["B1"] = "score"', 'headers');
						c += line('        ws1["A2"] = "Alice"; ws1["B2"] = 95');
						c += line('        ws1["A3"] = "Bob";   ws1["B3"] = 87');
						c += blank();
						c += cline('        ' + ty('XLSX') + '.' + fn('addsheet!') + '(xf, "Inventory")', 'add second sheet');
						c += line('        ws2 = xf["Inventory"]');
						c += cline('        ws2["A1"] = "product"; ws2["B1"] = "qty"', 'headers');
						c += line('        ws2["A2"] = "A";       ws2["B2"] = 10');
						c += line('        ws2["A3"] = "B";       ws2["B3"] = 20');
						c += line('    ' + kw('end'));
						c += cline('    ' + fn('println') + '("Written: ", path)', 'confirm');
						c += line(kw('end'));
						return c;
					},
				},
			];

			var FORMAT_ACTIONS = [
				{
					id: 'xlsx-write-format',
					label: 'Write and Format',
					desc: 'Write data and apply bold header, fill, and conditional formatting in one block',
					code: function() {
						var c = '';
						c += cline(kw('using') + ' ' + ty('XLSX'), 'pure-Julia Excel writer');
						c += blank();
						c += cline(fn('mktempdir') + '() ' + kw('do') + ' dir', 'work in a temp directory — cleaned up automatically');
						c += line('    path = ' + fn('joinpath') + '(dir, "report.xlsx")');
						c += cline('    ' + ty('XLSX') + '.' + fn('openxlsx') + '(path; mode="w") ' + kw('do') + ' xf', 'create workbook');
						c += line('        ws = xf[1]');
						c += cline('        ws["A1"] = "Product"; ws["B1"] = "Revenue"', 'headers');
						c += line('        ws["A2"] = "Alpha";   ws["B2"] = 5200.0');
						c += line('        ws["A3"] = "Beta";    ws["B3"] = 800.0');
						c += blank();
						c += cline('        ' + kw('for') + ' col ' + kw('in') + ' ["A", "B"]', 'style header row');
						c += cline('            ' + ty('XLSX') + '.' + fn('setFont') + '(ws, col * "1"; bold=true, color="FFFFFF")', 'white bold');
						c += cline('            ' + ty('XLSX') + '.' + fn('setFill') + '(ws, col * "1"; fgColor="4472C4")', 'blue fill');
						c += line('        ' + kw('end'));
						c += cline('        ' + ty('XLSX') + '.' + fn('setConditionalFormat') + '(ws, "B2:B3"; rule="<1000", fgColor="FFC7CE")', 'red if revenue < 1000');
						c += line('    ' + kw('end'));
						c += line(kw('end'));
						return c;
					},
				},
			];

			var INSPECT_ACTIONS = [
				{
					id: 'xlsx-inspect',
					label: 'Inspect Workbook',
					desc: 'Write a file then inspect its sheets and cell dimensions',
					code: function() {
						var c = '';
						c += cline(kw('using') + ' ' + ty('XLSX'), 'pure-Julia Excel');
						c += blank();
						c += cline(fn('mktempdir') + '() ' + kw('do') + ' dir', 'work in a temp directory — cleaned up automatically');
						c += line('    path = ' + fn('joinpath') + '(dir, "demo.xlsx")');
						c += cline('    ' + ty('XLSX') + '.' + fn('openxlsx') + '(path; mode="w") ' + kw('do') + ' xf', 'step 1: write a demo file');
						c += line('        ' + ty('XLSX') + '.' + fn('rename!') + '(xf[1], "Sales")');
						c += line('        ws1 = xf[1]');
						c += line('        ws1["A1"] = "item"; ws1["B1"] = "qty"');
						c += line('        ws1["A2"] = "X";    ws1["B2"] = 10');
						c += line('        ' + ty('XLSX') + '.' + fn('addsheet!') + '(xf, "Costs")');
						c += line('    ' + kw('end'));
						c += blank();
						c += cline('    ' + ty('XLSX') + '.' + fn('openxlsx') + '(path) ' + kw('do') + ' xf', 'step 2: inspect it');
						c += line('        ' + fn('println') + '("Sheets: ", ' + ty('XLSX') + '.' + fn('sheetnames') + '(xf))');
						c += line('        ' + kw('for') + ' name ' + kw('in') + ' ' + ty('XLSX') + '.' + fn('sheetnames') + '(xf)');
						c += cline('            dim = ' + ty('XLSX') + '.' + fn('get_dimension') + '(xf[name])', 'used cell range');
						c += cline('            ' + fn('println') + '(name, " → ", dim)', 'e.g. Sales → A1:B2');
						c += line('        ' + kw('end'));
						c += line('    ' + kw('end'));
						c += line(kw('end'));
						return c;
					},
				},
			];

			var READ_ACTIONS = [
				{
					id: 'xlsx-read-cells',
					label: 'Read as Matrix',
					desc: 'Write a file then read back a cell range as a Matrix{Any}',
					code: function() {
						var c = '';
						c += cline(kw('using') + ' ' + ty('XLSX'), 'pure-Julia Excel');
						c += blank();
						c += cline(fn('mktempdir') + '() ' + kw('do') + ' dir', 'work in a temp directory — cleaned up automatically');
						c += line('    path = ' + fn('joinpath') + '(dir, "demo.xlsx")');
						c += cline('    ' + ty('XLSX') + '.' + fn('openxlsx') + '(path; mode="w") ' + kw('do') + ' xf', 'step 1: write demo data');
						c += line('        ws = xf[1]');
						c += line('        ws["A1"] = "name";  ws["B1"] = "score"');
						c += line('        ws["A2"] = "Alice"; ws["B2"] = 95');
						c += line('        ws["A3"] = "Bob";   ws["B3"] = 87');
						c += line('    ' + kw('end'));
						c += blank();
						c += cline('    ' + ty('XLSX') + '.' + fn('openxlsx') + '(path) ' + kw('do') + ' xf', 'step 2: read it back');
						c += line('        ws  = xf[1]');
						c += cline('        mat = ws["A1:B3"]', 'full range as a Matrix{Any}');
						c += cline('        ' + fn('println') + '(mat)', 'print all cells');
						c += line('    ' + kw('end'));
						c += line(kw('end'));
						return c;
					},
				},
				{
					id: 'xlsx-read-table',
					label: 'Read as Table',
					desc: 'Write a file then read it back as a Tables.jl table',
					code: function() {
						var c = '';
						c += cline(kw('using') + ' ' + ty('XLSX'), 'pure-Julia Excel');
						c += blank();
						c += cline(fn('mktempdir') + '() ' + kw('do') + ' dir', 'work in a temp directory — cleaned up automatically');
						c += line('    path = ' + fn('joinpath') + '(dir, "demo.xlsx")');
						c += cline('    ' + ty('XLSX') + '.' + fn('openxlsx') + '(path; mode="w") ' + kw('do') + ' xf', 'step 1: write demo data');
						c += line('        ws = xf[1]');
						c += cline('        ws["A1"] = "name";  ws["B1"] = "score"', 'header row');
						c += line('        ws["A2"] = "Alice"; ws["B2"] = 95');
						c += line('        ws["A3"] = "Bob";   ws["B3"] = 87');
						c += line('    ' + kw('end'));
						c += blank();
						c += cline('    ' + ty('XLSX') + '.' + fn('openxlsx') + '(path) ' + kw('do') + ' xf', 'step 2: read as Tables.jl table');
						c += cline('        ' + kw('for') + ' row ' + kw('in') + ' ' + ty('XLSX') + '.' + fn('eachtablerow') + '(xf[1])', 'iterate rows (header skipped)');
						c += cline('            ' + fn('println') + '(row[:name], "  ", row[:score])', 'access by column name');
						c += line('        ' + kw('end'));
						c += line('    ' + kw('end'));
						c += line(kw('end'));
						return c;
					},
				},
				{
					id: 'xlsx-read-all-sheets',
					label: 'Read as Dict',
					desc: 'Write a two-sheet file then read every sheet into a Dict',
					code: function() {
						var c = '';
						c += cline(kw('using') + ' ' + ty('XLSX'), 'pure-Julia Excel');
						c += blank();
						c += cline(fn('mktempdir') + '() ' + kw('do') + ' dir', 'work in a temp directory — cleaned up automatically');
						c += line('    path = ' + fn('joinpath') + '(dir, "demo.xlsx")');
						c += cline('    ' + ty('XLSX') + '.' + fn('openxlsx') + '(path; mode="w") ' + kw('do') + ' xf', 'step 1: write two sheets');
						c += line('        ' + ty('XLSX') + '.' + fn('rename!') + '(xf[1], "A")');
						c += line('        ws1 = xf[1]');
						c += line('        ws1["A1"] = "x"; ws1["A2"] = 1');
						c += line('        ' + ty('XLSX') + '.' + fn('addsheet!') + '(xf, "B")');
						c += line('        xf["B"]["A1"] = "y"; xf["B"]["A2"] = 2');
						c += line('    ' + kw('end'));
						c += blank();
						c += cline('    ' + ty('XLSX') + '.' + fn('openxlsx') + '(path) ' + kw('do') + ' xf', 'step 2: read all sheets');
						c += line('        ' + kw('for') + ' name ' + kw('in') + ' ' + ty('XLSX') + '.' + fn('sheetnames') + '(xf)');
						c += cline('            ' + fn('println') + '(name, ": ", xf[name]["A1:A2"])', 'print each sheet data');
						c += line('        ' + kw('end'));
						c += line('    ' + kw('end'));
						c += line(kw('end'));
						return c;
					},
				},
			];`,
		nextStepsHtml: `				<li><button class="list-btn panel-toggle" id="btn-xlsx-write"><svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><path d="M13.854 2.146a.5.5 0 0 1 0 .708l-9 9a.5.5 0 0 1-.168.11l-3.5 1.5a.5.5 0 0 1-.65-.65l1.5-3.5a.5.5 0 0 1 .11-.168l9-9a.5.5 0 0 1 .708 0zM11.207 2.5 13.5 4.793 4.793 13.5 2.5 11.207zm1.021-.43 1.702 1.702-1.395 1.394L10.833 3.466zm-9.81 10.42 1.087-.465L2.04 13.382zM1 14l.002-.007z"/></svg>Write Workbook</button></li>
				<li><button class="list-btn panel-toggle" id="btn-xlsx-format"><svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><path d="M1 2.5A1.5 1.5 0 0 1 2.5 1h11A1.5 1.5 0 0 1 15 2.5v3A1.5 1.5 0 0 1 13.5 7h-11A1.5 1.5 0 0 1 1 5.5v-3zm1.5-.5a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h11a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5h-11zm-1.5 7A1.5 1.5 0 0 1 2.5 8h11A1.5 1.5 0 0 1 15 9.5v3A1.5 1.5 0 0 1 13.5 14h-11A1.5 1.5 0 0 1 1 12.5v-3zm1.5-.5a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h11a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5h-11z"/></svg>Format Cells</button></li>
				<li><button class="list-btn panel-toggle" id="btn-xlsx-inspect"><svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><path d="M12 0.998993C12.276 0.998993 12.5 1.22299 12.5 1.49899C12.5 1.77499 12.276 1.99899 12 1.99899H11.004V6.68299C11.004 7.26299 11.148 7.83299 11.423 8.34299L13.819 12.789C14.358 13.788 13.634 15.001 12.499 15.001H3.50101C2.36501 15.001 1.64301 13.788 2.18101 12.789L4.57501 8.34499C4.85001 7.83499 4.99401 7.26399 4.99401 6.68499V1.99899H4.00001C3.72401 1.99899 3.50001 1.77499 3.50001 1.49899C3.50001 1.22299 3.72401 0.998993 4.00001 0.998993H12ZM5.99401 1.99899V6.68599C5.99401 7.43099 5.80901 8.16399 5.45601 8.81999L4.82101 9.99899H11.18L10.543 8.81699C10.19 8.16099 10.005 7.42799 10.005 6.68199V1.99899H5.99401ZM11.718 10.999H4.28201L3.06201 13.263C2.88201 13.597 3.12401 14 3.50201 14H12.499C12.877 14 13.119 13.596 12.939 13.263L11.718 10.999Z"/></svg>Inspect</button></li>
				<li><button class="list-btn panel-toggle" id="btn-xlsx-read"><svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><path d="M2.5 2C1.67157 2 1 2.67157 1 3.5V12.5C1 13.3284 1.67157 14 2.5 14H6C6.8178 14 7.54389 13.6073 8 13.0002C8.45612 13.6073 9.1822 14 10 14H13.5C14.3284 14 15 13.3284 15 12.5V3.5C15 2.67157 14.3284 2 13.5 2H10C9.1822 2 8.45612 2.39267 8 2.99976C7.54389 2.39267 6.8178 2 6 2H2.5ZM7.5 4.5V11.5C7.5 12.3284 6.82843 13 6 13H2.5C2.22386 13 2 12.7761 2 12.5V3.5C2 3.22386 2.22386 3 2.5 3H6C6.82843 3 7.5 3.67157 7.5 4.5ZM8.5 11.5V4.5C8.5 3.67157 9.17157 3 10 3H13.5C13.7761 3 14 3.22386 14 3.5V12.5C14 12.7761 13.7761 13 13.5 13H10C9.17157 13 8.5 12.3284 8.5 11.5Z"/></svg>Read Formats</button></li>`,
		nextStepsWiringJs: `		document.getElementById('btn-xlsx-write').addEventListener('click', function() {
			showRightPanel(WRITE_ACTIONS, 'Write Workbook', 'btn-xlsx-write');
		});
		document.getElementById('btn-xlsx-format').addEventListener('click', function() {
			showRightPanel(FORMAT_ACTIONS, 'Format Cells', 'btn-xlsx-format');
		});
		document.getElementById('btn-xlsx-inspect').addEventListener('click', function() {
			showRightPanel(INSPECT_ACTIONS, 'Inspect', 'btn-xlsx-inspect');
		});
		document.getElementById('btn-xlsx-read').addEventListener('click', function() {
			showRightPanel(READ_ACTIONS, 'Read Formats', 'btn-xlsx-read');
		});`,
		extraJs: `
		var currentReferences = [];
		var selectedRefIdx = null;
		var rightPanel = document.getElementById('right-panel');

		window.addEventListener('message', function(event) {
			if (event.data.command === 'showReferences') {
				currentReferences = event.data.references || [];
				renderReferencesList();
			}
		});

		function renderReferencesList() {
			if (currentReferences.length === 0) { return; }
			var html = '<div class="panel-header">'
				+ '<span class="right-panel-title">Explore References</span>'
				+ '<button class="panel-close" id="btn-refs-close">&#xd7;</button>'
				+ '</div>'
				+ '<div class="refs-container">'
				+ '<div class="refs-list-panel">'
				+ '<div class="references-list">';
			currentReferences.forEach(function(ref, idx) {
				var desc = (ref.authors || '') + ' · ' + (ref.year || '');
				if (ref.openAccess) { desc += ' · Open Access'; }
				html += '<button class="reference-item" data-idx="' + idx + '">'
					+ '<span class="ref-title">' + esc(ref.title || '') + '</span>'
					+ '<span class="ref-desc">' + esc(desc) + '</span>'
					+ '</button>';
			});
			html += '</div></div>'
				+ '<div class="refs-actions-panel">'
				+ '<div class="ref-placeholder">Select a reference to view details</div>'
				+ '</div>'
				+ '</div>';
			rightPanel.innerHTML = html;
			rightPanel.style.display = 'block';
			document.getElementById('btn-refs-close').addEventListener('click', function() {
				rightPanel.innerHTML = '';
				rightPanel.style.display = 'none';
			});
			document.querySelectorAll('.reference-item').forEach(function(btn) {
				btn.addEventListener('click', function() {
					var idx = parseInt(btn.dataset.idx, 10);
					selectedRefIdx = idx;
					document.querySelectorAll('.reference-item').forEach(function(b) { b.classList.remove('active'); });
					btn.classList.add('active');
					renderReferenceDetails(currentReferences[idx]);
				});
			});
		}

		function renderReferenceDetails(ref) {
			var desc = (ref.authors || '') + ' · ' + (ref.year || '');
			if (ref.openAccess) { desc += ' · Open Access'; }
			var html = '<div style="font-weight: 600; margin-bottom: 8px; color: var(--vscode-foreground);">' + esc(ref.title || '') + '</div>'
				+ '<div style="font-size: 12px; color: var(--vscode-descriptionForeground); margin-bottom: 12px;">' + esc(desc) + '</div>'
				+ '<button class="action-btn" id="btn-open-ref">Open in Browser</button>'
				+ '<button class="action-btn" id="btn-copy-bibtex">Copy BibTeX to Clipboard</button>';
			var actionsPanel = document.querySelector('.refs-actions-panel');
			actionsPanel.innerHTML = html;
			document.getElementById('btn-open-ref').addEventListener('click', function() {
				vscode.postMessage({ command: 'openReference', id: ref.title });
			});
			document.getElementById('btn-copy-bibtex').addEventListener('click', function() {
				var bibtex = generateBibTeX(ref);
				navigator.clipboard.writeText(bibtex).then(function() {
					var btn = document.getElementById('btn-copy-bibtex');
					var original = btn.textContent;
					btn.textContent = 'Copied!';
					setTimeout(function() { btn.textContent = original; }, 2000);
				});
			});
		}

		function generateBibTeX(ref) {
			var type = ref.doi ? 'online' : 'misc';
			var key = (ref.title || 'ref').toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 20);
			var bibtex = '@' + type + '{' + key + ',\\n'
				+ '  title={' + (ref.title || '') + '},\\n'
				+ '  author={' + (ref.authors || '') + '},\\n'
				+ '  year={' + (ref.year || '') + '},\\n';
			if (ref.journal) { bibtex += '  journal={' + ref.journal + '},\\n'; }
			if (ref.doi) { bibtex += '  doi={' + ref.doi + '},\\n'; }
			if (ref.url) { bibtex += '  url={' + ref.url + '},\\n'; }
			bibtex += '}';
			return bibtex;
		}

		function esc(s) { return (s || '').replace(/[&<>"']/g, function(c) { return {'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]; }); }
		`,
	});
}
