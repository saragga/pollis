/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Antonio Saragga Seabra. All rights reserved.
 *  Proprietary and confidential. Unauthorised copying or distribution is prohibited.
 *--------------------------------------------------------------------------------------------*/

import { buildWebviewHtml } from './webviewScaffold.js';

// ── Task groups — mirrors HF taxonomy ────────────────────────────────────────

interface IKgmTask {
	readonly label: string;
	readonly searchTerm: string;  // appended to ?search= when selected
}

interface IKgmTaskGroup {
	readonly group: string;
	readonly tasks: IKgmTask[];
}

const KGM_TASK_GROUPS: IKgmTaskGroup[] = [
	{
		group: 'Multimodal',
		tasks: [
			{ label: 'Video-Text-to-Text',          searchTerm: 'video text' },
			{ label: 'Image-Text-to-Text',           searchTerm: 'image text' },
			{ label: 'Visual Question Answering',    searchTerm: 'visual question answering' },
			{ label: 'Document Question Answering',  searchTerm: 'document question answering' },
			{ label: 'Any-to-Any',                   searchTerm: 'any to any' },
		],
	},
	{
		group: 'Natural Language Processing',
		tasks: [
			{ label: 'Text Generation',              searchTerm: 'text generation' },
			{ label: 'Text Classification',          searchTerm: 'text classification' },
			{ label: 'Token Classification',         searchTerm: 'token classification' },
			{ label: 'Question Answering',           searchTerm: 'question answering' },
			{ label: 'Summarization',                searchTerm: 'summarization' },
			{ label: 'Translation',                  searchTerm: 'translation' },
			{ label: 'Sentence Similarity',          searchTerm: 'sentence similarity' },
			{ label: 'Feature Extraction',           searchTerm: 'feature extraction' },
			{ label: 'Fill-Mask',                    searchTerm: 'fill mask' },
		],
	},
	{
		group: 'Vision',
		tasks: [
			{ label: 'Image Classification',         searchTerm: 'image classification' },
			{ label: 'Object Detection',             searchTerm: 'object detection' },
			{ label: 'Image Segmentation',           searchTerm: 'image segmentation' },
			{ label: 'Depth Estimation',             searchTerm: 'depth estimation' },
			{ label: 'Image-to-Image',               searchTerm: 'image to image' },
			{ label: 'Image-to-Text',                searchTerm: 'image to text' },
			{ label: 'Text-to-Image',                searchTerm: 'text to image' },
			{ label: 'Keypoint Detection',           searchTerm: 'keypoint detection' },
		],
	},
	{
		group: 'Audio',
		tasks: [
			{ label: 'Automatic Speech Recognition', searchTerm: 'speech recognition' },
			{ label: 'Text-to-Speech',               searchTerm: 'text to speech' },
			{ label: 'Audio Classification',         searchTerm: 'audio classification' },
			{ label: 'Audio-to-Audio',               searchTerm: 'audio to audio' },
		],
	},
	{
		group: 'Tabular',
		tasks: [
			{ label: 'Tabular Classification',       searchTerm: 'tabular classification' },
			{ label: 'Tabular Regression',           searchTerm: 'tabular regression' },
			{ label: 'Time Series Forecasting',      searchTerm: 'time series' },
		],
	},
	{
		group: 'Learning & Robotics',
		tasks: [
			{ label: 'Reinforcement Learning',       searchTerm: 'reinforcement learning' },
			{ label: 'Graph Machine Learning',       searchTerm: 'graph machine learning' },
			{ label: 'Robotics',                     searchTerm: 'robotics' },
		],
	},
];

const KGM_FRAMEWORKS = [
	{ label: 'Transformers',       ids: ['transformers'] },
	{ label: 'TensorFlow / Keras', ids: ['tensorFlow2', 'keras'] },
	{ label: 'PyTorch',            ids: ['pyTorch'] },
	{ label: 'JAX / Flax',        ids: ['jax', 'flax'] },
	{ label: 'GGUF',              ids: ['gguf'] },
	{ label: 'ONNX',              ids: ['onnx'] },
	{ label: 'scikit-learn',      ids: ['scikitLearn'] },
];

const KGM_AUTHORS = [
	{ label: 'DeepSeek',      slug: 'deepseek-ai' },
	{ label: 'Google',        slug: 'google' },
	{ label: 'Kaggle',        slug: 'kaggle' },
	{ label: 'Keras',         slug: 'keras' },
	{ label: 'Meta',          slug: 'metaresearch' },
	{ label: 'Mistral AI',    slug: 'mistral-ai' },
	{ label: 'Qwen',          slug: 'qwen-lm' },
	{ label: 'Stability AI',  slug: 'stabilityai' },
	{ label: 'TensorFlow',    slug: 'tensorflow' },
	{ label: 'TIMM',          slug: 'timm' },
	{ label: 'Ultralytics',   slug: 'ultralytics' },
];

const KGM_SORT_OPTIONS = [
	{ value: 'hotness',     label: 'Trending' },
	{ value: 'voteCount',   label: 'Most Votes' },
	{ value: 'createTime',  label: 'Recently Created' },
	{ value: 'updateTime',  label: 'Recently Updated' },
];

function buildKgmIllustrationJs(): string {
	const groupsJson = JSON.stringify(KGM_TASK_GROUPS);
	const frameworksJson = JSON.stringify(KGM_FRAMEWORKS);
	const sortJson = JSON.stringify(KGM_SORT_OPTIONS);

	const authorsJson = JSON.stringify(KGM_AUTHORS);

	return `			var KGM_TASK_GROUPS = ${groupsJson};
			var KGM_FRAMEWORKS = ${frameworksJson};
			var KGM_SORT_OPTIONS = ${sortJson};
			var KGM_AUTHORS = ${authorsJson};

			var kgmTaskChecked = {};
			var kgmFrameworkChecked = {};
			var kgmAuthorChecked = {};
			var kgmSort = 'hotness';
			var kgmFetchSeq = 0;
			var kgmFetchTimer = null;

			function kgmFmt(n) {
				if (n >= 1000000) { return (n / 1000000).toFixed(1).replace(/\\.0$/, '') + 'M'; }
				if (n >= 1000) { return (n / 1000).toFixed(1).replace(/\\.0$/, '') + 'k'; }
				return String(n);
			}

			function kgmRelTime(iso) {
				if (!iso) { return ''; }
				var ms = Date.now() - new Date(iso).getTime();
				var sec = Math.floor(ms / 1000);
				if (sec < 60) { return 'just now'; }
				var min = Math.floor(sec / 60);
				if (min < 60) { return min + ' min ago'; }
				var hr = Math.floor(min / 60);
				if (hr < 24) { return hr + ' hr ago'; }
				var d = Math.floor(hr / 24);
				if (d < 30) { return d + ' day' + (d === 1 ? '' : 's') + ' ago'; }
				var mo = Math.floor(d / 30);
				if (mo < 12) { return mo + ' mo ago'; }
				return Math.floor(mo / 12) + ' yr ago';
			}

			function kgmFrameworkLabel(id) {
				for (var fi = 0; fi < KGM_FRAMEWORKS.length; fi++) { if (KGM_FRAMEWORKS[fi].ids[0] === id) { return KGM_FRAMEWORKS[fi].label; } }
				return id;
			}

			function kgmAuthorLabel(slug) {
				for (var ai = 0; ai < KGM_AUTHORS.length; ai++) { if (KGM_AUTHORS[ai].slug === slug) { return KGM_AUTHORS[ai].label; } }
				return slug;
			}

			function kgmUpdateBrowseLabel() {
				var panel = body.querySelector('.kgm-cards-panel');
				if (!panel) { return; }
				var tasks = Object.keys(kgmTaskChecked).filter(function(t) { return kgmTaskChecked[t]; });
				var fws = Object.keys(kgmFrameworkChecked).filter(function(f) { return kgmFrameworkChecked[f]; });
				var auths = Object.keys(kgmAuthorChecked).filter(function(a) { return kgmAuthorChecked[a]; });
				var taskPart = tasks.length === 0 ? '' : tasks.length === 1 ? tasks[0] : tasks.length + ' tasks';
				var fwPart = fws.length === 0 ? '' : fws.length === 1 ? kgmFrameworkLabel(fws[0]) : fws.length + ' frameworks';
				var authPart = auths.length === 0 ? '' : auths.length === 1 ? kgmAuthorLabel(auths[0]) : auths.length + ' authors';
				var lbl = (!taskPart && !fwPart && !authPart) ? 'All models' : [taskPart, fwPart, authPart].filter(Boolean).join(' · ');
				panel.querySelector('.kgm-browse-label').textContent = lbl;
			}

			function kgmShowGrid(models) {
				var grid = body.querySelector('.kgm-cards-panel .right-action-grid');
				if (!grid) { return; }
				if (models.length === 0) {
					grid.innerHTML = '<div class="hfm-empty">No models found for this selection</div>';
					return;
				}
				grid.innerHTML = models.map(function(m) {
					var fwLabel = kgmFrameworkLabel(m.framework);
					return '<button class="nb-card hfm-model-card" data-url="' + esc(m.url) + '">'
						+ '<span class="nb-label">' + esc(m.ref) + '</span>'
						+ '<span class="nb-desc hfm-task-tag">' + esc(fwLabel) + '</span>'
						+ '<span class="hfm-model-meta">'
						+ '<span class="hfm-meta-chip" title="Last updated">&#8987; ' + esc(kgmRelTime(m.updateTime)) + '</span>'
						+ '<span class="hfm-meta-chip" title="Votes">&#9825; ' + kgmFmt(m.voteCount) + '</span>'
						+ '</span>'
						+ '</button>';
				}).join('');
				grid.querySelectorAll('[data-url]').forEach(function(btn) {
					btn.addEventListener('click', function() {
						vscode.postMessage({ command: 'openUrl', url: btn.dataset.url });
					});
				});
			}

			function kgmShowSpinner() {
				var grid = body.querySelector('.kgm-cards-panel .right-action-grid');
				if (grid) { grid.innerHTML = '<div class="hfm-empty hfm-loading">&#8987; Loading&#8230;</div>'; }
			}

			function kgmShowOffline() {
				var grid = body.querySelector('.kgm-cards-panel .right-action-grid');
				if (grid) { grid.innerHTML = '<div class="hfm-empty">&#9888; Unable to connect to Kaggle.<br>Check your network connection and try again.</div>'; }
			}

			function kgmFetch() {
				kgmFetchSeq++;
				var seq = kgmFetchSeq;
				kgmShowSpinner();
				var checkedFwKeys = Object.keys(kgmFrameworkChecked).filter(function(f) { return kgmFrameworkChecked[f]; });
				var fws = [];
				checkedFwKeys.forEach(function(key) {
					for (var fi = 0; fi < KGM_FRAMEWORKS.length; fi++) {
						if (KGM_FRAMEWORKS[fi].ids[0] === key) { fws = fws.concat(KGM_FRAMEWORKS[fi].ids); break; }
					}
				});
				var auths = Object.keys(kgmAuthorChecked).filter(function(a) { return kgmAuthorChecked[a]; });
				var tasks = Object.keys(kgmTaskChecked).filter(function(t) { return kgmTaskChecked[t]; });
				var search = tasks.length > 0 ? tasks[0] : '';
				vscode.postMessage({ command: 'fetchKgmModels', sortBy: kgmSort, frameworks: fws, authors: auths, search: search, pageSize: 30, seq: seq });
			}

			function kgmScheduleFetch() {
				if (kgmFetchTimer) { clearTimeout(kgmFetchTimer); }
				kgmFetchTimer = setTimeout(function() { kgmFetchTimer = null; kgmFetch(); }, 150);
			}

			function kgmUpdateSortBtn() {
				var btn = body.querySelector('#kgm-sort-btn');
				if (!btn) { return; }
				var opt = null;
				for (var oi = 0; oi < KGM_SORT_OPTIONS.length; oi++) { if (KGM_SORT_OPTIONS[oi].value === kgmSort) { opt = KGM_SORT_OPTIONS[oi]; break; } }
				if (!opt) { opt = KGM_SORT_OPTIONS[0]; }
				btn.querySelector('.kgm-sort-label').innerHTML = '&#8645; Sort: ' + esc(opt.label);
				body.querySelectorAll('.kgm-sort-option').forEach(function(el) {
					el.classList.toggle('active', el.dataset.value === kgmSort);
				});
			}

			window.addEventListener('message', function(ev) {
				var msg = ev.data;
				if (msg.command === 'kgmModels') {
					if (msg.seq !== undefined && msg.seq !== kgmFetchSeq) { return; }
					kgmShowGrid(msg.models || []);
				} else if (msg.command === 'kgmModelsError') {
					if (msg.seq !== undefined && msg.seq !== kgmFetchSeq) { return; }
					kgmShowOffline();
				}
			});

			var chevronSvg = '<svg width="12" height="12" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><path d="M7.976 10.072l-4.054-4.014-.92.92 4.49 4.45.978.01 4.525-4.46-.918-.92-4.101 4.014z"/></svg>';

			var kgmSortHtml = '<div class="hfm-sort-dropdown hidden" id="kgm-sort-dropdown">'
				+ KGM_SORT_OPTIONS.map(function(o) {
					return '<button class="kgm-sort-option hfm-sort-option' + (o.value === 'hotness' ? ' active' : '') + '" data-value="' + o.value + '">' + esc(o.label) + '</button>';
				}).join('')
				+ '</div>';

			var listHtml = '<div class="hfm-task-list">';
			KGM_TASK_GROUPS.forEach(function(g) {
				var groupId = 'kgmg-' + g.group.replace(/[^a-z0-9]/gi, '-').toLowerCase();
				listHtml += '<div class="hfm-group collapsed" id="' + groupId + '">';
				listHtml += '<button class="hfm-group-toggle"><span class="hfm-group-chevron">' + chevronSvg + '</span>' + esc(g.group) + '</button>';
				listHtml += '<div class="hfm-task-items">';
				g.tasks.forEach(function(t) {
					listHtml += '<label class="hfm-task-row"><input class="hfm-task-cb kgm-task-cb" type="checkbox" data-search="' + esc(t.searchTerm) + '"><span class="hfm-task-label">' + esc(t.label) + '</span></label>';
				});
				listHtml += '</div></div>';
			});
			listHtml += '<hr class="hfm-section-sep">';
			listHtml += '<div class="hfm-group collapsed" id="kgmg-framework">';
			listHtml += '<button class="hfm-group-toggle"><span class="hfm-group-chevron">' + chevronSvg + '</span>Framework</button>';
			listHtml += '<div class="hfm-task-items">';
			KGM_FRAMEWORKS.forEach(function(f) {
				listHtml += '<label class="hfm-task-row"><input class="hfm-task-cb kgm-fw-cb" type="checkbox" data-fw-id="' + esc(f.ids[0]) + '"><span class="hfm-task-label">' + esc(f.label) + '</span></label>';
			});
			listHtml += '</div></div>';
			listHtml += '<div class="hfm-group collapsed" id="kgmg-author">';
			listHtml += '<button class="hfm-group-toggle"><span class="hfm-group-chevron">' + chevronSvg + '</span>Author</button>';
			listHtml += '<div class="hfm-task-items">';
			KGM_AUTHORS.forEach(function(a) {
				listHtml += '<label class="hfm-task-row"><input class="hfm-task-cb kgm-author-cb" type="checkbox" data-slug="' + esc(a.slug) + '"><span class="hfm-task-label">' + esc(a.label) + '</span></label>';
			});
			listHtml += '</div></div>';
			listHtml += '</div>';

			var cardsHtml = '<div class="kgm-cards-panel hfm-cards-panel">'
				+ '<div class="hfm-browse-row">'
				+ '<span class="kgm-browse-label hfm-browse-label">All models</span>'
				+ '<div class="hfm-browse-controls" style="position:relative;">'
				+ '<button class="hfm-sort-btn" id="kgm-sort-btn"><span class="kgm-sort-label">&#8645; Sort: Trending</span></button>'
				+ kgmSortHtml
				+ '<button class="kgm-browse-btn hfm-browse-btn" data-url="https://www.kaggle.com/models">Kaggle &#8599;</button>'
				+ '</div></div>'
				+ '<div class="right-action-grid"></div>'
				+ '</div>';

			body.innerHTML = '<div class="hfm-task-layout">' + listHtml + cardsHtml + '</div>';

			body.querySelectorAll('.hfm-group-toggle').forEach(function(btn) {
				btn.addEventListener('click', function() { btn.closest('.hfm-group').classList.toggle('collapsed'); });
			});

			body.querySelectorAll('.kgm-task-cb:not(.kgm-fw-cb):not(.kgm-author-cb)').forEach(function(cb) {
				cb.addEventListener('change', function() {
					if (cb.checked) { kgmTaskChecked[cb.dataset.search] = true; } else { delete kgmTaskChecked[cb.dataset.search]; }
					kgmUpdateBrowseLabel();
					kgmScheduleFetch();
				});
			});

			body.querySelectorAll('.kgm-fw-cb').forEach(function(cb) {
				cb.addEventListener('change', function() {
					if (cb.checked) { kgmFrameworkChecked[cb.dataset.fwId] = true; } else { delete kgmFrameworkChecked[cb.dataset.fwId]; }
					kgmUpdateBrowseLabel();
					kgmScheduleFetch();
				});
			});

			body.querySelectorAll('.kgm-author-cb').forEach(function(cb) {
				cb.addEventListener('change', function() {
					if (cb.checked) { kgmAuthorChecked[cb.dataset.slug] = true; } else { delete kgmAuthorChecked[cb.dataset.slug]; }
					kgmUpdateBrowseLabel();
					kgmScheduleFetch();
				});
			});

			var kgmSortDropdown = body.querySelector('#kgm-sort-dropdown');
			body.querySelector('#kgm-sort-btn').addEventListener('click', function(e) {
				e.stopPropagation();
				kgmSortDropdown.classList.toggle('hidden');
			});
			kgmSortDropdown.querySelectorAll('.kgm-sort-option').forEach(function(opt) {
				opt.addEventListener('click', function() {
					kgmSort = opt.dataset.value;
					kgmSortDropdown.classList.add('hidden');
					kgmUpdateSortBtn();
					kgmScheduleFetch();
				});
			});
			document.addEventListener('click', function() { kgmSortDropdown.classList.add('hidden'); });

			body.querySelector('.kgm-browse-btn').addEventListener('click', function(e) {
				vscode.postMessage({ command: 'openUrl', url: e.currentTarget.dataset.url });
			});

			kgmUpdateSortBtn();
			kgmFetch();
			return;
`;
}

export function getKgmHtml(mermaidJs?: string): string {
	return buildWebviewHtml({
		title: 'Kaggle Models',
		bullets: `
			<li><strong>Multimodal</strong> &#8212; models that combine vision and language (CLIP, LLaVA, PaLI)</li>
			<li><strong>Natural Language Processing (NLP)</strong> &#8212; text generation, classification, Q&amp;A, translation, and summarization</li>
			<li><strong>Vision</strong> &#8212; image classification, object detection, segmentation, and depth estimation</li>
			<li><strong>Audio</strong> &#8212; automatic speech recognition, audio classification, and text-to-speech</li>
			<li><strong>Tabular</strong> &#8212; classification, regression, and time series forecasting on structured data</li>
			<li><strong>Reinforcement Learning (RL)</strong> &#8212; policy and value models trained in interactive environments, including robotics control</li>
`,
		decisionRows: `
			<tr><td>Multimodal</td><td>Image + text</td><td>Tasks requiring both visual and language understanding</td></tr>
			<tr><td>NLP</td><td>Text only</td><td>Text generation, summarisation, Q&amp;A, classification</td></tr>
			<tr><td>Vision</td><td>Image</td><td>Classification, detection, and segmentation of visual data</td></tr>
			<tr><td>Audio</td><td>Waveform</td><td>Transcription, speaker ID, speech synthesis</td></tr>
			<tr><td>Tabular</td><td>Structured table</td><td>Regression, classification, forecasting on tabular data</td></tr>
			<tr><td>Reinforcement Learning (RL)</td><td>Environment</td><td>Sequential decision-making, policy learning, and robotic control</td></tr>
`,
		decisionFirstColumn: 'Task',
		wideLayout: true,
		defaultModel: 'nlp',
		modelsLiteral: `['multimodal','nlp','vision','audio','tabular','rl']`,
		chartW: 54,
		miniChartsJs: buildKgmMiniChartsJs(),
		codeBranchesJs: buildKgmCodeBranchesJs(),
		actionsJs: buildKgmActionsJs(),
		togglesJs: `			<button class="toggle-btn" data-model="multimodal">Multimodal</button>
			<button class="toggle-btn active" data-model="nlp">NLP</button>
			<button class="toggle-btn" data-model="vision">Vision</button>
			<button class="toggle-btn" data-model="audio">Audio</button>
			<button class="toggle-btn" data-model="tabular">Tabular</button>
			<button class="toggle-btn" data-model="rl">RL</button>`,
		illusCollapsed: false,
		illustrationLabel: 'Explore by Task / Framework / Author',
		illustrationOverrideJs: buildKgmIllustrationJs(),
		extraCss: `	.hfm-task-layout { display: grid; grid-template-columns: 220px 1fr; gap: 16px; height: 560px; }
	.hfm-task-list { overflow-y: auto; height: 100%; padding-right: 4px; scrollbar-width: none; }
	.hfm-task-list::-webkit-scrollbar { display: none; }
	.hfm-group { margin-bottom: 6px; }
	.hfm-group-toggle { display: flex; align-items: center; gap: 5px; background: transparent; border: none; color: var(--vscode-foreground); font-size: 12px; font-weight: 600; font-family: var(--vscode-font-family); cursor: pointer; padding: 3px 0 3px 17px; width: 100%; text-align: left; user-select: none; }
	.hfm-group-toggle:hover { text-decoration: underline; }
	.hfm-group-chevron { display: inline-flex; transition: transform 0.15s; flex-shrink: 0; opacity: 0.7; margin-left: -17px; }
	.hfm-group.collapsed .hfm-group-chevron { transform: rotate(-90deg); }
	.hfm-group.collapsed .hfm-task-items { display: none; }
	.hfm-task-items { padding-left: 0; }
	.hfm-task-row { display: flex; align-items: center; gap: 6px; padding: 2px 0 2px 17px; cursor: pointer; }
	.hfm-task-row:hover .hfm-task-label { text-decoration: underline; color: var(--vscode-foreground); }
	.hfm-task-cb { appearance: none; -webkit-appearance: none; width: 11px; height: 11px; border: 1px solid var(--vscode-input-border, var(--vscode-widget-border)); border-radius: 2px; background: var(--vscode-input-background); cursor: pointer; flex-shrink: 0; position: relative; margin: 0; outline: none; }
	.hfm-task-cb:focus { outline: none; }
	.hfm-task-cb:checked { background: var(--vscode-textLink-foreground); border-color: var(--vscode-textLink-foreground); }
	.hfm-task-cb:checked::after { content: ''; position: absolute; left: 2px; top: 0px; width: 4px; height: 7px; border: 1.5px solid var(--vscode-editor-background, #fff); border-top: none; border-left: none; transform: rotate(45deg); }
	.hfm-task-label { font-size: 12px; color: var(--vscode-foreground) !important; cursor: pointer; line-height: 1.4; }
	.hfm-cards-panel { display: flex; flex-direction: column; min-width: 0; height: 100%; }
	.hfm-cards-panel .right-action-grid { flex: 1; overflow-y: auto; scrollbar-width: none; }
	.hfm-cards-panel .right-action-grid::-webkit-scrollbar { display: none; }
	.hfm-browse-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; flex-wrap: wrap; gap: 6px; }
	.hfm-browse-label { font-size: 12px; font-weight: 600; color: var(--vscode-foreground); }
	.hfm-browse-controls { display: flex; align-items: center; gap: 6px; }
	.hfm-sort-btn { display: flex; align-items: center; gap: 4px; background: var(--vscode-input-background); color: var(--vscode-input-foreground); border: 1px solid var(--vscode-input-border); border-radius: 4px; font-size: 12px; font-family: var(--vscode-font-family); padding: 3px 8px; cursor: pointer; white-space: nowrap; position: relative; }
	.hfm-sort-btn:hover { border-color: var(--vscode-focusBorder); }
	.hfm-sort-dropdown { position: absolute; top: calc(100% + 3px); right: 0; background: var(--vscode-dropdown-background, var(--vscode-input-background)); border: 1px solid var(--vscode-widget-border); border-radius: 4px; z-index: 100; min-width: 150px; padding: 4px 0; box-shadow: 0 4px 12px rgba(0,0,0,0.3); }
	.hfm-sort-dropdown.hidden { display: none; }
	.hfm-sort-option { display: block; width: 100%; text-align: left; background: transparent; border: none; color: var(--vscode-foreground); font-size: 12px; font-family: var(--vscode-font-family); padding: 5px 12px; cursor: pointer; white-space: nowrap; }
	.hfm-sort-option:hover { background: var(--vscode-list-hoverBackground); }
	.hfm-sort-option.active { color: var(--vscode-textLink-foreground); }
	.hfm-browse-btn { background: transparent; border: 1px solid var(--vscode-textLink-foreground); border-radius: 4px; color: var(--vscode-textLink-foreground); font-size: 12px; font-family: var(--vscode-font-family); cursor: pointer; padding: 3px 10px; }
	.hfm-browse-btn:hover { background: var(--vscode-textLink-foreground); color: var(--vscode-editor-background); }
	.hfm-empty { font-size: 12px; color: var(--vscode-descriptionForeground); font-style: italic; padding: 24px 0; text-align: center; }
	.hfm-task-tag { font-size: 10px; color: var(--vscode-descriptionForeground); margin-bottom: 4px; }
	.hfm-model-meta { display: flex; flex-wrap: wrap; gap: 4px; margin-top: 4px; }
	.hfm-meta-chip { font-size: 10px; color: var(--vscode-descriptionForeground); white-space: nowrap; }
	.hfm-section-sep { border: none; border-top: 1px solid var(--vscode-widget-border); margin: 8px 0 6px; }
`,
		mermaidJs,
	});
}

const KGM_TOPIC_LABELS: Record<string, string> = {
	multimodal: 'Multimodal',
	nlp: 'NLP',
	vision: 'Vision',
	audio: 'Audio',
	tabular: 'Tabular',
	rl: 'RL',
};

function buildKgmMiniChartsJs(): string {
	const topics = Object.keys(KGM_TOPIC_LABELS);
	const fns = topics.map(t => {
		return `function mini_${t}() {
			var s = '<rect x="4" y="8" width="46" height="68" rx="2" fill="none" stroke="currentColor" stroke-width="0.8" opacity="0.4"/>';
			s += '<text x="27" y="52" text-anchor="middle" font-size="7" fill="currentColor" opacity="0.7">${KGM_TOPIC_LABELS[t]}</text>';
			return s;
		}`;
	});
	const miniCharts = `[${topics.map(t => `mini_${t}`).join(', ')}]`;
	const miniLabels = `[${topics.map(t => `'${KGM_TOPIC_LABELS[t]}'`).join(', ')}]`;
	return fns.join('\n\t\t\t') + `
			var MINI_CHARTS = ${miniCharts};
			var MINI_LABELS = ${miniLabels};`;
}

function buildKgmCodeBranchesJs(): string {
	return `
			if (currentModel === 'multimodal') {
				c += line(kw('using') + ' ' + ty('ONNX') + ', ' + ty('Images'));
				c += blank();
				c += cline('model = ONNX.' + fn('load') + '("clip-vit-base.onnx")', 'load CLIP model from Kaggle weights');
				c += blank();
				c += cline('img   = ' + fn('load') + '("photo.jpg")', 'load image');
				c += cline('img_t = ' + fn('preprocess') + '(img)', 'resize to 224x224, normalise');
				c += cline('txt_t = ' + fn('tokenize') + '("a cat on a mat")', 'tokenise text query');
				c += cline('out   = model(img_t, txt_t)', 'joint vision–language forward pass');
				c += cline('sim   = out["logits_per_image"]', 'image–text similarity logits');
			} else if (currentModel === 'nlp') {
				c += line(kw('using') + ' ' + ty('ONNX'));
				c += blank();
				c += cline('model = ONNX.' + fn('load') + '("gemma-2b-it.onnx")', 'load NLP model from Kaggle weights');
				c += blank();
				c += cline('ids   = ' + fn('tokenize') + '("Summarise this article:")', 'tokenise prompt');
				c += cline('out   = model(ids)', 'autoregressive forward pass');
				c += cline('text  = ' + fn('decode') + '(out["logits"])', 'decode output token ids');
			} else if (currentModel === 'vision') {
				c += line(kw('using') + ' ' + ty('ONNX') + ', ' + ty('Images'));
				c += blank();
				c += cline('model = ONNX.' + fn('load') + '("resnet50.onnx")', 'load ResNet from Kaggle weights');
				c += blank();
				c += cline('img    = ' + fn('load') + '("image.jpg")', 'load image');
				c += cline('img_t  = ' + fn('preprocess') + '(img)', 'resize and normalise to (3, 224, 224)');
				c += cline('logits = model(img_t)["output"]', 'forward pass; shape: (1000,)');
				c += cline('pred   = ' + fn('argmax') + '(logits)', 'predicted ImageNet class index');
			} else if (currentModel === 'audio') {
				c += line(kw('using') + ' ' + ty('ONNX') + ', ' + ty('WAV'));
				c += blank();
				c += cline('model = ONNX.' + fn('load') + '("whisper-small.onnx")', 'load Whisper from Kaggle weights');
				c += blank();
				c += cline('wave, sr = ' + fn('wavread') + '("audio.wav")', 'load 16 kHz mono waveform');
				c += cline('feats    = ' + fn('log_mel_spectrogram') + '(wave)', 'extract log-mel features');
				c += cline('out      = model(feats)', 'run encoder–decoder forward pass');
				c += cline('text     = ' + fn('decode') + '(out["token_ids"])', 'decoded transcript');
			} else if (currentModel === 'tabular') {
				c += line(kw('using') + ' ' + ty('ONNX') + ', ' + ty('DataFrames') + ', ' + ty('CSV'));
				c += blank();
				c += cline('model = ONNX.' + fn('load') + '("tabular-classifier.onnx")', 'load tabular model from Kaggle weights');
				c += blank();
				c += cline('df    = CSV.' + fn('read') + '("data.csv", DataFrame)', 'load tabular data');
				c += cline('X     = ' + fn('Matrix') + '(df[:, 1:end-1])', 'feature matrix, shape (n_samples, n_features)');
				c += cline('probs = model(X\\')', 'class probabilities, shape (n_classes, n_samples)');
				c += cline('pred  = ' + fn('argmax') + '.(eachcol(probs))', 'predicted class for each sample');
			} else if (currentModel === 'rl') {
				c += line(kw('using') + ' ' + ty('ONNX'));
				c += blank();
				c += cline('policy = ONNX.' + fn('load') + '("ppo-cartpole.onnx")', 'load RL policy from Kaggle weights');
				c += blank();
				c += cline('obs    = ' + fn('Float32') + '.([0.02, -0.01, 0.03, -0.02])', 'CartPole observation vector');
				c += cline('out    = policy(obs)', 'forward pass through policy network');
				c += cline('action = ' + fn('argmax') + '(out["action_probs"])', 'greedy action selection');
			} else {
				c += line(kw('using') + ' ' + ty('ONNX'));
				c += blank();
				c += cline('model = ONNX.' + fn('load') + '("model.onnx")', 'load any Kaggle ONNX model');
				c += cline('out   = model(input)', 'run forward pass');
			}
`;
}

function buildKgmActionsJs(): string {
	return `
			var VISUALISE_ACTIONS = [
				{
					id: 'prediction-probs',
					label: 'Prediction Probabilities',
					desc: 'Plot the top-5 class probabilities from the model output',
					code: function() {
						var c = '';
						c += line(kw('using') + ' ' + ty('ONNX') + ', ' + ty('Plots') + ', ' + ty('Images'));
						c += blank();
						c += cline('model  = ONNX.' + fn('load') + '("resnet50.onnx")', 'load vision model');
						c += cline('img_t  = ' + fn('preprocess') + '(' + fn('load') + '("image.jpg"))', 'preprocess image');
						c += cline('logits = model(img_t)["output"]', 'forward pass');
						c += cline('top5   = ' + fn('sortperm') + '(logits, rev=true)[1:5]', 'top-5 class indices');
						c += cline(fn('bar') + '(IMAGENET_LABELS[top5], logits[top5], title="Top-5 predictions")', 'plot probabilities');
						return c;
					},
				},
			];

			var DIAGNOSE_ACTIONS = [
				{
					id: 'model-info',
					label: 'Model Info',
					desc: 'Inspect ONNX model inputs, outputs, and operator graph',
					code: function() {
						var c = '';
						c += line(kw('using') + ' ' + ty('ONNX'));
						c += blank();
						c += cline('model = ONNX.' + fn('load') + '("model.onnx")', 'load model');
						c += cline(fn('println') + '("Inputs:  ", ONNX.' + fn('input_names') + '(model))', 'list input names');
						c += cline(fn('println') + '("Outputs: ", ONNX.' + fn('output_names') + '(model))', 'list output names');
						c += cline(fn('println') + '("Nodes:   ", ' + fn('length') + '(model.graph.node))', 'operator count');
						return c;
					},
				},
			];

			var PREDICT_ACTIONS = [
				{
					id: 'batch-inference',
					label: 'Batch Inference',
					desc: 'Run inference over a list of inputs in mini-batches',
					code: function() {
						var c = '';
						c += line(kw('using') + ' ' + ty('ONNX'));
						c += blank();
						c += cline('model = ONNX.' + fn('load') + '("model.onnx")', 'load model once');
						c += cline('batch = 16', 'mini-batch size');
						c += line(kw('for') + ' i ' + kw('in') + ' 1:batch:' + fn('length') + '(inputs)');
						c += cline('    chunk = inputs[i:' + fn('min') + '(i+batch-1, end)]', 'current mini-batch');
						c += cline('    outs  = model.(' + fn('stack') + '(chunk))', 'batched forward pass');
						c += line(kw('end'));
						return c;
					},
				},
			];

			var COMPARE_ACTIONS = [
				{
					id: 'compare-models',
					label: 'Compare Models',
					desc: 'Benchmark two Kaggle ONNX models on the same input',
					code: function() {
						var c = '';
						c += line(kw('using') + ' ' + ty('ONNX') + ', ' + ty('BenchmarkTools'));
						c += blank();
						c += cline('files = ["model-a.onnx", "model-b.onnx"]', 'models to compare');
						c += blank();
						c += line(kw('for') + ' f ' + kw('in') + ' files');
						c += cline('    m   = ONNX.' + fn('load') + '(f)', 'load model');
						c += cline('    t   = @benchmark m(input)', 'benchmark forward pass');
						c += cline('    ' + fn('println') + '(f, " median: ", ' + fn('median') + '(t).time, " ns")', 'report median time');
						c += line(kw('end'));
						return c;
					},
				},
				{
					id: 'julia-onnx-vs-python',
					label: 'Julia (ONNX) vs Python',
					desc: 'Run the same Kaggle ONNX model in Julia and Python; compare outputs and latency',
					code: function() {
						var c = '';
						c += line(kw('# ') + '── Julia side (ONNX.jl) ──────────────────────────────────────');
						c += line(kw('using') + ' ' + ty('ONNX') + ', ' + ty('BenchmarkTools'));
						c += blank();
						c += cline('model  = ONNX.' + fn('load') + '("resnet50.onnx")', 'load Kaggle ONNX model (e.g. keras/resnet)');
						c += cline('input  = ' + fn('rand') + '(' + ty('Float32') + ', 224, 224, 3, 1)', 'random image input (H, W, C, batch)');
						c += cline('out_jl = model(input)', 'forward pass');
						c += cline('pred_jl = ' + fn('argmax') + '(out_jl["logits"][:, 1])', 'top-1 class index');
						c += blank();
						c += cline('t_jl   = @benchmark model(input)', 'benchmark');
						c += cline(fn('println') + '("Julia  median: ", ' + fn('median') + '(t_jl).time ÷ 1_000_000, " ms")', 'report latency');
						c += blank();
						c += line(kw('# ') + '── Python side (run in terminal) ─────────────────────────────');
						c += line(kw('# ') + 'pip install onnxruntime numpy');
						c += line(kw('# ') + 'python3 - <<EOF');
						c += line(kw('# ') + 'import onnxruntime as ort, numpy as np, time');
						c += line(kw('# ') + 'sess  = ort.InferenceSession("resnet50.onnx")');
						c += line(kw('# ') + 'inp   = {sess.get_inputs()[0].name:');
						c += line(kw('# ') + '         np.random.rand(1, 3, 224, 224).astype(np.float32)}');
						c += line(kw('# ') + 't0    = time.perf_counter()');
						c += line(kw('# ') + 'out   = sess.run(None, inp)');
						c += line(kw('# ') + 'print(f"Python median: \${(time.perf_counter()-t0)*1000:.1f} ms")');
						c += line(kw('# ') + 'print(f"Top-1 class:   \${out[0].argmax()}")');
						c += line(kw('# ') + 'EOF');
						return c;
					},
				},
			];

			var INTERPRET_ACTIONS = [
				{
					id: 'intermediate-activations',
					label: 'Intermediate Activations',
					desc: 'Extract and plot activations from an intermediate ONNX node',
					code: function() {
						var c = '';
						c += line(kw('using') + ' ' + ty('ONNX') + ', ' + ty('Plots'));
						c += blank();
						c += cline('model = ONNX.' + fn('load') + '("resnet50.onnx")', 'load model');
						c += cline('acts  = ONNX.' + fn('run') + '(model, input; intermediate="layer4")', 'run with intermediate output');
						c += cline(fn('heatmap') + '(acts[:, :, 1, 1], title="Layer 4 activation map")', 'plot first channel');
						return c;
					},
				},
			];
`;
}