/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Antonio Saragga Seabra. All rights reserved.
 *  Proprietary and confidential. Unauthorised copying or distribution is prohibited.
 *--------------------------------------------------------------------------------------------*/

import { buildWebviewHtml } from './webviewScaffold.js';

const HF_MODELS: Record<string, { tag: string; cards: Array<{ id: string; name: string; desc: string }> }> = {
	multimodal: {
		tag: 'multimodal',
		cards: [
			{ id: 'openai/clip-vit-base-patch32',        name: 'CLIP ViT-B/32',       desc: 'Vision–language contrastive model by OpenAI' },
			{ id: 'llava-hf/llava-1.5-7b-hf',           name: 'LLaVA 1.5 7B',         desc: 'Large multimodal model for image–text tasks' },
			{ id: 'Salesforce/blip2-opt-2.7b',           name: 'BLIP-2 OPT-2.7B',      desc: 'Image captioning and visual Q&A' },
			{ id: 'microsoft/Florence-2-large',          name: 'Florence-2 Large',      desc: 'Vision foundation model with dense predictions' },
			{ id: 'google/paligemma-3b-pt-224',          name: 'PaLIGemma 3B',          desc: 'Multimodal model for image understanding' },
		],
	},
	nlp: {
		tag: 'text-generation',
		cards: [
			{ id: 'meta-llama/Llama-3.2-3B-Instruct',   name: 'Llama 3.2 3B',          desc: 'Compact instruction-tuned language model' },
			{ id: 'mistralai/Mistral-7B-Instruct-v0.3', name: 'Mistral 7B Instruct',    desc: 'Efficient 7B instruction model by Mistral AI' },
			{ id: 'google/gemma-2-9b-it',               name: 'Gemma 2 9B',             desc: 'Google open model for text generation tasks' },
			{ id: 'Qwen/Qwen2.5-7B-Instruct',           name: 'Qwen 2.5 7B',            desc: 'Multilingual instruction model by Alibaba' },
			{ id: 'microsoft/phi-4',                    name: 'Phi-4',                  desc: 'Small but capable reasoning model by Microsoft' },
		],
	},
	vision: {
		tag: 'image-classification',
		cards: [
			{ id: 'google/vit-base-patch16-224',         name: 'ViT Base Patch16',       desc: 'Vision Transformer for image classification' },
			{ id: 'microsoft/resnet-50',                 name: 'ResNet-50',              desc: 'Classic deep residual network for vision' },
			{ id: 'facebook/convnext-base-224',          name: 'ConvNeXt Base',          desc: 'Modernised CNN competitive with transformers' },
			{ id: 'google/efficientnet-b4',              name: 'EfficientNet B4',         desc: 'Scalable CNN with strong accuracy/efficiency' },
			{ id: 'apple/mobilevit-small',               name: 'MobileViT Small',         desc: 'Lightweight vision transformer for mobile' },
		],
	},
	audio: {
		tag: 'automatic-speech-recognition',
		cards: [
			{ id: 'openai/whisper-large-v3',             name: 'Whisper Large v3',        desc: 'State-of-the-art multilingual speech recognition' },
			{ id: 'facebook/wav2vec2-large-960h',        name: 'wav2vec2 Large',          desc: 'Self-supervised speech representation model' },
			{ id: 'microsoft/speecht5_asr',              name: 'SpeechT5 ASR',            desc: 'Unified speech–text model for ASR tasks' },
			{ id: 'facebook/hubert-large-ls960-ft',      name: 'HuBERT Large',            desc: 'Hidden-unit BERT for speech understanding' },
			{ id: 'openai/whisper-medium',               name: 'Whisper Medium',          desc: 'Balanced multilingual ASR model' },
		],
	},
	tabular: {
		tag: 'tabular-classification',
		cards: [
			{ id: 'julien-c/wine-quality',               name: 'Wine Quality',            desc: 'Tabular classifier for wine quality prediction' },
			{ id: 'scikit-learn/tabular-playground',     name: 'Tabular Playground',      desc: 'Benchmark tabular classification model' },
			{ id: 'autogluon/tabular-moons',             name: 'AutoGluon Moons',         desc: 'AutoML ensemble for tabular data' },
			{ id: 'inria-soda/carte',                    name: 'CARTE',                   desc: 'Pre-training for tabular data via text' },
			{ id: 'arnolfokam/tabular-cifar-100',        name: 'CIFAR-100 Tabular',       desc: 'Feature-based tabular model on CIFAR-100' },
		],
	},
	rl: {
		tag: 'reinforcement-learning',
		cards: [
			{ id: 'HuggingFaceH4/ppo-LunarLander-v2',   name: 'PPO LunarLander',         desc: 'PPO agent trained on LunarLander-v2' },
			{ id: 'sb3/ppo-CartPole-v1',                 name: 'PPO CartPole',            desc: 'Stable-Baselines3 PPO for CartPole balancing' },
			{ id: 'sb3/dqn-CartPole-v1',                 name: 'DQN CartPole',            desc: 'Deep Q-Network agent for CartPole' },
			{ id: 'HuggingFaceH4/ppo-Acrobot-v1',       name: 'PPO Acrobot',             desc: 'PPO agent for the Acrobot swing-up task' },
			{ id: 'edbeeching/decision-transformer-gym-hopper-medium', name: 'Decision Transformer', desc: 'Offline RL with transformer architecture' },
		],
	},
	graphml: {
		tag: 'graph-ml',
		cards: [
			{ id: 'pyg-team/gat-cora',                  name: 'GAT Cora',                desc: 'Graph Attention Network on Cora citation dataset' },
			{ id: 'pyg-team/gcn-cora',                  name: 'GCN Cora',                desc: 'Graph Convolutional Network for node classification' },
			{ id: 'stanford/ogbn-arxiv',                name: 'OGB arXiv',               desc: 'GNN baseline on the Open Graph Benchmark' },
			{ id: 'graphcore/molecular-gnn',            name: 'Molecular GNN',           desc: 'GNN for molecular property prediction' },
			{ id: 'muhammadfaiz/drug-interaction-gnn',  name: 'Drug Interaction',        desc: 'Link prediction GNN for drug interactions' },
		],
	},
	embedding: {
		tag: 'feature-extraction',
		cards: [
			{ id: 'sentence-transformers/all-MiniLM-L6-v2', name: 'all-MiniLM-L6-v2',   desc: 'Fast and compact sentence embedding model' },
			{ id: 'BAAI/bge-large-en-v1.5',             name: 'BGE Large v1.5',          desc: 'State-of-the-art English text embeddings' },
			{ id: 'thenlper/gte-large',                 name: 'GTE Large',               desc: 'General-purpose text embeddings by Alibaba' },
			{ id: 'intfloat/e5-large-v2',               name: 'E5 Large v2',             desc: 'Universal text embeddings from Microsoft' },
			{ id: 'nomic-ai/nomic-embed-text-v1',       name: 'Nomic Embed v1',          desc: 'Long-context embedding model (8192 tokens)' },
		],
	},
};

const TOPIC_LABELS: Record<string, string> = {
	multimodal: 'Multimodal',
	nlp:        'NLP',
	vision:     'Vision',
	audio:      'Audio',
	tabular:    'Tabular',
	rl:         'Reinforcement Learning',
	graphml:    'Graph ML',
	embedding:  'Embedding',
};

export function getHfmHtml(mermaidJs?: string): string {
	return buildWebviewHtml({
		title: 'Hugging Face Models',
		mermaidJs,
		wideLayout: true,
		defaultModel: 'nlp',
		modelsLiteral: "['multimodal','nlp','vision','audio','tabular','rl','graphml','embedding']",
		chartW: 54,
		illusCollapsed: false,
		togglesJs: `			<button class="toggle-btn" data-model="multimodal">Multimodal</button>
			<button class="toggle-btn active" data-model="nlp">NLP</button>
			<button class="toggle-btn" data-model="vision">Vision</button>
			<button class="toggle-btn" data-model="audio">Audio</button>
			<button class="toggle-btn" data-model="tabular">Tabular</button>
			<button class="toggle-btn" data-model="rl">RL</button>
			<button class="toggle-btn" data-model="graphml">Graph ML</button>
			<button class="toggle-btn" data-model="embedding">Embedding</button>`,
		bullets: `				<li><strong>Multimodal</strong> &#8212; models that combine vision and language (CLIP, LLaVA, BLIP-2)</li>
				<li><strong>Natural Language Processing (NLP)</strong> &#8212; text generation, instruction-following and chat models</li>
				<li><strong>Vision</strong> &#8212; image classification, object detection and visual representation models</li>
				<li><strong>Audio</strong> &#8212; automatic speech recognition and audio understanding models</li>
				<li><strong>Tabular</strong> &#8212; models trained on structured table data for classification or regression</li>
				<li><strong>Reinforcement Learning (RL)</strong> &#8212; policy and value models trained in interactive environments</li>
				<li><strong>Graph Machine Learning (Graph ML)</strong> &#8212; graph neural networks for node/link/graph tasks</li>
				<li><strong>Embedding</strong> &#8212; dense vector representations of text for retrieval and similarity search</li>
			`,
		decisionRows: `				<tr><td>Multimodal</td><td>Image + text</td><td>Tasks requiring both visual and language understanding</td></tr>
				<tr><td>NLP</td><td>Text only</td><td>Text generation, summarisation, Q&amp;A, instruction following</td></tr>
				<tr><td>Vision</td><td>Image only</td><td>Classification, detection, segmentation of visual data</td></tr>
				<tr><td>Audio</td><td>Audio waveform</td><td>Transcription, speaker ID, audio classification</td></tr>
				<tr><td>Tabular</td><td>Structured table</td><td>Regression and classification on tabular features</td></tr>
				<tr><td>RL</td><td>Environment</td><td>Sequential decision-making and policy learning</td></tr>
				<tr><td>Graph ML</td><td>Graph (nodes + edges)</td><td>Node classification, link prediction, graph regression</td></tr>
				<tr><td>Embedding</td><td>Text</td><td>Semantic search, clustering, retrieval-augmented generation</td></tr>
			`,
		extraCss: `	.hfm-browse-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px; }
	.hfm-browse-label { font-size: 12px; font-weight: 600; color: var(--vscode-foreground); }
	.hfm-browse-btn { background: transparent; border: 1px solid var(--vscode-textLink-foreground); border-radius: 4px; color: var(--vscode-textLink-foreground); font-size: 12px; font-family: var(--vscode-font-family); cursor: pointer; padding: 3px 10px; }
	.hfm-browse-btn:hover { background: var(--vscode-textLink-foreground); color: var(--vscode-editor-background); }
`,
		illustrationOverrideJs: buildIllustrationOverrideJs(),
		miniChartsJs: buildMiniChartsJs(),
		codeBranchesJs: buildCodeBranchesJs(),
		actionsJs: buildActionsJs(),
	});
}

function buildIllustrationOverrideJs(): string {
	const topicData = Object.entries(HF_MODELS).map(([key, { tag, cards }]) => {
		const cardsJson = JSON.stringify(cards);
		return `'${key}': { tag: '${tag}', cards: ${cardsJson} }`;
	}).join(',\n\t\t\t\t');

	return `			var HFM_DATA = {
				${topicData}
			};
			var HFM_LABELS = ${JSON.stringify(TOPIC_LABELS)};
			var topic = HFM_DATA[currentModel];
			if (topic) {
				var browseUrl = 'https://huggingface.co/models?pipeline_tag=' + topic.tag + '&sort=trending';
				var cardsHtml = topic.cards.map(function(c) {
					return '<button class="nb-card" data-hf-id="' + esc(c.id) + '">'
						+ '<span class="nb-label">' + esc(c.name) + '</span>'
						+ '<span class="nb-desc">' + esc(c.id) + '</span>'
						+ '<span class="nb-desc">' + esc(c.desc) + '</span>'
						+ '</button>';
				}).join('');
				body.innerHTML = '<div class="hfm-browse-row"><span class="hfm-browse-label">Notable ' + esc(HFM_LABELS[currentModel]) + ' models</span>'
					+ '<button class="hfm-browse-btn" data-url="' + esc(browseUrl) + '">Browse on Hugging Face &#8599;</button></div>'
					+ '<div class="right-action-grid" style="margin-top:12px;">' + cardsHtml + '</div>';
				body.querySelectorAll('[data-hf-id]').forEach(function(btn) {
					btn.addEventListener('click', function() {
						var url = 'https://huggingface.co/' + btn.dataset.hfId;
						vscode.postMessage({ command: 'openUrl', url: url });
					});
				});
				body.querySelectorAll('[data-url]').forEach(function(btn) {
					btn.addEventListener('click', function() {
						vscode.postMessage({ command: 'openUrl', url: btn.dataset.url });
					});
				});
				return;
			}
`;
}

function buildMiniChartsJs(): string {
	const topics = Object.keys(HF_MODELS);
	const fns = topics.map(t => {
		return `function mini_${t}() {
			var s = '<rect x="4" y="8" width="46" height="68" rx="2" fill="none" stroke="currentColor" stroke-width="0.8" opacity="0.4"/>';
			s += '<text x="27" y="52" text-anchor="middle" font-size="7" fill="currentColor" opacity="0.7">${TOPIC_LABELS[t]}</text>';
			return s;
		}`;
	});

	const miniCharts = `[${topics.map(t => `mini_${t}`).join(', ')}]`;
	const miniLabels = `[${topics.map(t => `'${TOPIC_LABELS[t]}'`).join(', ')}]`;

	return fns.join('\n\t\t\t') + `
			var MINI_CHARTS = ${miniCharts};
			var MINI_LABELS = ${miniLabels};`;
}

function buildCodeBranchesJs(): string {
	return `
			if (currentModel === 'embedding') {
				c += line(kw('using') + ' ' + ty('Transformers') + ', ' + ty('Transformers') + '.HuggingFace');
				c += blank();
				c += cline('tkr   = HuggingFace.' + fn('load_tokenizer') + '("sentence-transformers/all-MiniLM-L6-v2")', 'load tokenizer');
				c += cline('model = HuggingFace.' + fn('load_model') + '(HuggingFace.TextEncoderModel, "sentence-transformers/all-MiniLM-L6-v2")', 'load embedding model');
				c += blank();
				c += cline('enc   = tkr("Hello, world!")', 'tokenise input text');
				c += cline('emb   = model(enc.token, enc.segment, enc.attention_mask).hidden_state[:, 1, :]', 'CLS token embedding');
			} else if (currentModel === 'nlp') {
				c += line(kw('using') + ' ' + ty('Transformers') + ', ' + ty('Transformers') + '.HuggingFace');
				c += blank();
				c += cline('tkr   = HuggingFace.' + fn('load_tokenizer') + '("meta-llama/Llama-3.2-3B-Instruct")', 'load tokenizer');
				c += cline('model = HuggingFace.' + fn('load_model') + '(HuggingFace.GPTModel, "meta-llama/Llama-3.2-3B-Instruct")', 'load language model');
				c += blank();
				c += cline('prompt = tkr("The capital of France is")', 'tokenise prompt');
				c += cline('out    = ' + fn('generate') + '(model, prompt.token; max_new_tokens=32)', 'autoregressive generation');
				c += cline('text   = tkr.' + fn('decode') + '(out[1])', 'decode generated token ids');
			} else if (currentModel === 'vision') {
				c += line(kw('using') + ' ' + ty('Transformers') + ', ' + ty('Transformers') + '.HuggingFace');
				c += line(kw('using') + ' ' + ty('Images'));
				c += blank();
				c += cline('proc   = HuggingFace.' + fn('load_processor') + '("google/vit-base-patch16-224")', 'load image processor');
				c += cline('model  = HuggingFace.' + fn('load_model') + '(HuggingFace.ViTModel, "google/vit-base-patch16-224")', 'load ViT model');
				c += blank();
				c += cline('img    = ' + fn('load') + '("image.jpg") |> proc', 'load and preprocess image');
				c += cline('logits = model(img.pixel_values).logits', 'forward pass; shape: (num_classes,)');
				c += cline('pred   = ' + fn('argmax') + '(logits)', 'predicted class index');
			} else if (currentModel === 'audio') {
				c += line(kw('using') + ' ' + ty('Transformers') + ', ' + ty('Transformers') + '.HuggingFace');
				c += line(kw('using') + ' ' + ty('WAV'));
				c += blank();
				c += cline('proc   = HuggingFace.' + fn('load_processor') + '("openai/whisper-large-v3")', 'load audio processor');
				c += cline('model  = HuggingFace.' + fn('load_model') + '(HuggingFace.WhisperModel, "openai/whisper-large-v3")', 'load Whisper model');
				c += blank();
				c += cline('wave, sr = ' + fn('wavread') + '("audio.wav")', 'load 16 kHz mono waveform');
				c += cline('inputs   = proc(wave)', 'extract log-mel spectrogram');
				c += cline('out      = ' + fn('generate') + '(model, inputs.input_features)', 'decode with greedy search');
				c += cline('text     = proc.' + fn('decode') + '(out[1])', 'decoded transcript');
			} else if (currentModel === 'multimodal') {
				c += line(kw('using') + ' ' + ty('Transformers') + ', ' + ty('Transformers') + '.HuggingFace');
				c += line(kw('using') + ' ' + ty('Images'));
				c += blank();
				c += cline('proc  = HuggingFace.' + fn('load_processor') + '("openai/clip-vit-base-patch32")', 'load CLIP processor');
				c += cline('model = HuggingFace.' + fn('load_model') + '(HuggingFace.CLIPModel, "openai/clip-vit-base-patch32")', 'load CLIP model');
				c += blank();
				c += cline('img   = ' + fn('load') + '("photo.jpg") |> proc', 'preprocess image');
				c += cline('txt   = proc("a cat sitting on a mat")', 'tokenise text query');
				c += cline('out   = model(img.pixel_values, txt.input_ids, txt.attention_mask)', 'joint vision–language forward pass');
				c += cline('sim   = out.logits_per_image', 'image–text similarity logits');
			} else {
				c += line(kw('using') + ' ' + ty('Transformers') + ', ' + ty('Transformers') + '.HuggingFace');
				c += blank();
				c += cline('tkr   = HuggingFace.' + fn('load_tokenizer') + '("sentence-transformers/all-MiniLM-L6-v2")', 'load tokenizer');
				c += cline('model = HuggingFace.' + fn('load_model') + '(HuggingFace.TextEncoderModel, "sentence-transformers/all-MiniLM-L6-v2")', 'load model from HF Hub');
			}
`;
}

function buildActionsJs(): string {
	return `
			var VISUALISE_ACTIONS = [
				{
					id: 'embedding-scatter',
					label: 'Embedding Scatter',
					desc: 'Project model embeddings to 2D with UMAP for visual inspection',
					code: function() {
						var c = '';
						c += line(kw('using') + ' ' + ty('Transformers') + ', ' + ty('UMAP') + ', ' + ty('Plots'));
						c += line(kw('using') + ' ' + ty('Transformers') + '.HuggingFace');
						c += blank();
						c += cline('tkr  = HuggingFace.' + fn('load_tokenizer') + '("sentence-transformers/all-MiniLM-L6-v2")', 'load tokenizer');
						c += cline('model = HuggingFace.' + fn('load_model') + '(HuggingFace.TextEncoderModel, "sentence-transformers/all-MiniLM-L6-v2")', 'load embedding model');
						c += blank();
						c += cline('embs = ' + fn('hcat') + '([' + fn('vec') + '(model(tkr(d).token, tkr(d).segment, tkr(d).attention_mask).hidden_state[:, 1, :]) ' + kw('for') + ' d ' + kw('in') + ' docs]...)', 'embed all documents');
						c += cline('proj = ' + fn('umap') + '(embs, 2)', 'reduce to 2D with UMAP');
						c += cline(fn('scatter') + '(proj[1, :], proj[2, :], xlabel="UMAP 1", ylabel="UMAP 2")', 'scatter plot of embeddings');
						return c;
					},
				},
			];

			var DIAGNOSE_ACTIONS = [
				{
					id: 'model-summary',
					label: 'Model Summary',
					desc: 'Print parameter counts and layer structure of a loaded model',
					code: function() {
						var c = '';
						c += line(kw('using') + ' ' + ty('Transformers') + '.HuggingFace');
						c += blank();
						c += cline('model = HuggingFace.' + fn('load_model') + '(HuggingFace.BertModel, "bert-base-uncased")', 'load any HF model');
						c += cline(fn('println') + '(model)', 'inspect layer hierarchy');
						c += cline(fn('sum') + '(length, ' + fn('Flux.params') + '(model))', 'total parameter count');
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
						c += line(kw('using') + ' ' + ty('Transformers') + ', ' + ty('Transformers') + '.HuggingFace');
						c += blank();
						c += cline('tkr    = HuggingFace.' + fn('load_tokenizer') + '("sentence-transformers/all-MiniLM-L6-v2")', 'load tokenizer');
						c += cline('model  = HuggingFace.' + fn('load_model') + '(HuggingFace.TextEncoderModel, "sentence-transformers/all-MiniLM-L6-v2")', 'load model');
						c += blank();
						c += cline('batch  = 16', 'mini-batch size');
						c += line(kw('for') + ' i ' + kw('in') + ' 1:batch:' + fn('length') + '(texts)');
						c += cline('    chunk = texts[i:' + fn('min') + '(i+batch-1, end)]', 'current mini-batch');
						c += cline('    enc   = tkr.(chunk)', 'tokenise batch');
						c += cline('    out   = model.(enc)', 'forward pass over batch');
						c += line(kw('end'));
						return c;
					},
				},
			];

			var COMPARE_ACTIONS = [
				{
					id: 'compare-models',
					label: 'Compare Models',
					desc: 'Benchmark two HF models on the same input',
					code: function() {
						var c = '';
						c += line(kw('using') + ' ' + ty('Transformers') + ', ' + ty('Transformers') + '.HuggingFace');
						c += blank();
						c += cline('ids   = ["bert-base-uncased", "sentence-transformers/all-MiniLM-L6-v2"]', 'models to compare');
						c += blank();
						c += line(kw('for') + ' id ' + kw('in') + ' ids');
						c += cline('    tkr   = HuggingFace.' + fn('load_tokenizer') + '(id)', 'tokenizer for model');
						c += cline('    model = HuggingFace.' + fn('load_model') + '(HuggingFace.BertModel, id)', 'load model');
						c += cline('    enc   = tkr("benchmark text")', 'tokenise input');
						c += cline('    out   = model(enc.token, enc.segment, enc.attention_mask)', 'forward pass');
						c += cline('    ' + fn('println') + '(id, " hidden_size: ", ' + fn('size') + '(out.hidden_state, 1))', 'print hidden dimension');
						c += line(kw('end'));
						return c;
					},
				},
			];

			var INTERPRET_ACTIONS = [
				{
					id: 'attention-weights',
					label: 'Attention Weights',
					desc: 'Visualise last-layer attention for a single input',
					code: function() {
						var c = '';
						c += line(kw('using') + ' ' + ty('Transformers') + ', ' + ty('Transformers') + '.HuggingFace, ' + ty('Plots'));
						c += blank();
						c += cline('tkr   = HuggingFace.' + fn('load_tokenizer') + '("bert-base-uncased")', 'load tokenizer');
						c += cline('model = HuggingFace.' + fn('load_model') + '(HuggingFace.BertModel, "bert-base-uncased")', 'load BERT');
						c += blank();
						c += cline('enc   = tkr("Transformers changed NLP")', 'tokenise text');
						c += cline('out   = model(enc.token, enc.segment, enc.attention_mask; output_attentions=true)', 'forward with attention');
						c += cline('attn  = out.attentions[end][:, :, 1, 1]', 'last-layer attention, head 1');
						c += cline(fn('heatmap') + '(attn, title="Attention")', 'plot attention heatmap');
						return c;
					},
				},
			];
`;
}
