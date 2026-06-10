/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Antonio Saragga Seabra. All rights reserved.
 *  Proprietary and confidential. Unauthorised copying or distribution is prohibited.
 *--------------------------------------------------------------------------------------------*/

import { buildWebviewHtml } from './webviewScaffold.js';

// ── Category toggle model cards (drives code preview) ────────────────────────
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

// ── Full HF task taxonomy (illustration pane) ─────────────────────────────────
interface IHfModel {
	id: string;
	name: string;
	task: string;          // pipeline tag label shown on the card
	size: string;          // e.g. "7B", "335M"
	updated: string;       // e.g. "2 days ago"
	downloads: number;
	likes: number;
}
interface IHfTask {
	label: string;
	tag: string;
	models: IHfModel[];
}

interface IHfTaskGroup {
	group: string;
	tasks: IHfTask[];
}

const HF_TASK_GROUPS: IHfTaskGroup[] = [
	{
		group: 'Multimodal',
		tasks: [
			{ label: 'Video-Text-to-Text',          tag: 'video-text-to-text',          models: [{ id: 'llava-hf/llava-1.5-7b-hf',              name: 'LLaVA 1.5 7B',            task: 'Video-Text-to-Text',        size: '7B',    updated: '3 mo ago',  downloads: 892000, likes: 1840 }, { id: 'microsoft/Florence-2-large',                           name: 'Florence-2 Large',        task: 'Video-Text-to-Text',        size: '0.77B', updated: '5 mo ago',  downloads: 541000, likes: 1230 }] },
			{ label: 'Image-Text-to-Text',          tag: 'image-text-to-text',          models: [{ id: 'Salesforce/blip2-opt-2.7b',              name: 'BLIP-2 OPT-2.7B',         task: 'Image-Text-to-Text',        size: '2.7B',  updated: '1 yr ago',  downloads: 1340000, likes: 1520 }, { id: 'google/paligemma-3b-pt-224',             name: 'PaLIGemma 3B',            task: 'Image-Text-to-Text',        size: '3B',    updated: '11 mo ago', downloads: 320000, likes: 890 }] },
			{ label: 'Image-Text-to-Image',         tag: 'image-text-to-image',         models: [{ id: 'microsoft/Florence-2-large',             name: 'Florence-2 Large',         task: 'Image-Text-to-Image',       size: '0.77B', updated: '5 mo ago',  downloads: 541000, likes: 1230 }, { id: 'openai/clip-vit-base-patch32',           name: 'CLIP ViT-B/32',           task: 'Image-Text-to-Image',       size: '150M',  updated: '1 yr ago',  downloads: 4800000, likes: 2340 }] },
			{ label: 'Image-Text-to-Video',         tag: 'image-text-to-video',         models: [{ id: 'ali-vilab/i2vgen-xl',                    name: 'I2VGen-XL',                task: 'Image-Text-to-Video',       size: '2.5B',  updated: '1 yr ago',  downloads: 210000, likes: 620 }, { id: 'stabilityai/stable-video-diffusion-img2vid', name: 'SVD',                 task: 'Image-Text-to-Video',       size: '1.5B',  updated: '8 mo ago',  downloads: 890000, likes: 1750 }] },
			{ label: 'Audio-Text-to-Text',          tag: 'audio-text-to-text',          models: [{ id: 'openai/whisper-large-v3',                name: 'Whisper Large v3',         task: 'Audio-Text-to-Text',        size: '1.5B',  updated: '6 mo ago',  downloads: 5200000, likes: 3410 }, { id: 'facebook/seamless-m4t-v2-large',         name: 'SeamlessM4T v2',          task: 'Audio-Text-to-Text',        size: '2.3B',  updated: '8 mo ago',  downloads: 480000, likes: 720 }] },
			{ label: 'Visual Question Answering',   tag: 'visual-question-answering',   models: [{ id: 'Salesforce/blip-vqa-base',               name: 'BLIP VQA',                 task: 'Visual Question Answering', size: '385M',  updated: '1 yr ago',  downloads: 780000, likes: 940 }, { id: 'dandelin/vilt-b32-finetuned-vqa',        name: 'ViLT VQA',               task: 'Visual Question Answering', size: '87M',   updated: '2 yr ago',  downloads: 1100000, likes: 520 }] },
			{ label: 'Visual Document Retrieval',   tag: 'visual-document-retrieval',   models: [{ id: 'vidore/colpali-v1.2',                    name: 'ColPali v1.2',             task: 'Visual Document Retrieval', size: '3B',    updated: '4 mo ago',  downloads: 95000,  likes: 830 }, { id: 'vidore/colqwen2-v1.0',                   name: 'ColQwen2',               task: 'Visual Document Retrieval', size: '7B',    updated: '3 mo ago',  downloads: 61000,  likes: 490 }] },
			{ label: 'Document Question Answering', tag: 'document-question-answering', models: [{ id: 'impira/layoutlm-document-qa',            name: 'LayoutLM Doc QA',          task: 'Document Question Answering', size: '125M', updated: '2 yr ago',  downloads: 1400000, likes: 670 }, { id: 'microsoft/layoutlmv3-base',              name: 'LayoutLMv3',             task: 'Document Question Answering', size: '125M', updated: '1 yr ago',  downloads: 870000, likes: 490 }] },
			{ label: 'Any-to-Any',                  tag: 'any-to-any',                  models: [{ id: 'facebook/seamless-m4t-v2-large',          name: 'SeamlessM4T v2',           task: 'Any-to-Any',                size: '2.3B',  updated: '8 mo ago',  downloads: 480000, likes: 720 }, { id: 'CogVLM/cogvlm-grounding-generalist',     name: 'CogVLM',                 task: 'Any-to-Any',                size: '17B',   updated: '1 yr ago',  downloads: 230000, likes: 1120 }] },
		],
	},
	{
		group: 'Natural Language Processing',
		tasks: [
			{ label: 'Token Classification',      tag: 'token-classification',      models: [{ id: 'dslim/bert-base-NER',                     name: 'BERT NER',                 task: 'Token Classification',      size: '110M',  updated: '2 yr ago',  downloads: 12000000, likes: 1340 }, { id: 'Jean-Baptiste/roberta-large-ner-english', name: 'RoBERTa NER',          task: 'Token Classification',      size: '355M',  updated: '2 yr ago',  downloads: 2100000, likes: 420 }] },
			{ label: 'Text Classification',       tag: 'text-classification',       models: [{ id: 'distilbert/distilbert-base-uncased-finetuned-sst-2-english', name: 'DistilBERT SST-2', task: 'Text Classification',  size: '67M',   updated: '1 yr ago',  downloads: 8700000, likes: 1120 }, { id: 'cardiffnlp/twitter-roberta-base-sentiment', name: 'RoBERTa Sentiment', task: 'Text Classification',  size: '125M',  updated: '1 yr ago',  downloads: 3400000, likes: 680 }] },
			{ label: 'Zero-Shot Classification',  tag: 'zero-shot-classification',  models: [{ id: 'facebook/bart-large-mnli',                name: 'BART MNLI',                task: 'Zero-Shot Classification',  size: '407M',  updated: '1 yr ago',  downloads: 14000000, likes: 2890 }, { id: 'cross-encoder/nli-deberta-v3-large',     name: 'DeBERTa NLI',          task: 'Zero-Shot Classification',  size: '435M',  updated: '1 yr ago',  downloads: 3600000, likes: 890 }] },
			{ label: 'Sentence Similarity',       tag: 'sentence-similarity',       models: [{ id: 'sentence-transformers/all-MiniLM-L6-v2', name: 'all-MiniLM-L6-v2',        task: 'Sentence Similarity',       size: '22M',   updated: '9 days ago',downloads: 22700000, likes: 4930 }, { id: 'cross-encoder/ms-marco-MiniLM-L-6-v2',   name: 'MS MARCO MiniLM',      task: 'Sentence Similarity',       size: '22M',   updated: '1 yr ago',  downloads: 18000000, likes: 1230 }] },
			{ label: 'Text Ranking',              tag: 'text-ranking',              models: [{ id: 'cross-encoder/ms-marco-MiniLM-L-12-v2',  name: 'MS MARCO MiniLM-L-12',    task: 'Text Ranking',              size: '33M',   updated: '1 yr ago',  downloads: 9800000, likes: 780 }, { id: 'BAAI/bge-reranker-large',                name: 'BGE Reranker Large',    task: 'Text Ranking',              size: '335M',  updated: '8 mo ago',  downloads: 4200000, likes: 890 }] },
			{ label: 'Text Generation',           tag: 'text-generation',           models: [{ id: 'meta-llama/Llama-3.2-3B-Instruct',       name: 'Llama 3.2 3B',            task: 'Text Generation',           size: '3B',    updated: '5 mo ago',  downloads: 18000000, likes: 4120 }, { id: 'mistralai/Mistral-7B-Instruct-v0.3',     name: 'Mistral 7B Instruct',  task: 'Text Generation',           size: '7B',    updated: '8 mo ago',  downloads: 9200000, likes: 3450 }] },
			{ label: 'Question Answering',        tag: 'question-answering',        models: [{ id: 'deepset/roberta-base-squad2',             name: 'RoBERTa SQuAD2',          task: 'Question Answering',        size: '125M',  updated: '2 yr ago',  downloads: 7600000, likes: 890 }, { id: 'deepset/deberta-v3-base-squad2',         name: 'DeBERTa SQuAD2',       task: 'Question Answering',        size: '184M',  updated: '1 yr ago',  downloads: 2900000, likes: 560 }] },
			{ label: 'Table Question Answering',  tag: 'table-question-answering',  models: [{ id: 'google/tapas-large-finetuned-wtq',        name: 'TAPAS WTQ',               task: 'Table Question Answering',  size: '340M',  updated: '1 yr ago',  downloads: 1100000, likes: 340 }, { id: 'microsoft/tapex-large-finetuned-wtq',    name: 'TAPEX',                task: 'Table Question Answering',  size: '406M',  updated: '1 yr ago',  downloads: 680000, likes: 210 }] },
			{ label: 'Translation',               tag: 'translation',               models: [{ id: 'Helsinki-NLP/opus-mt-en-fr',              name: 'OPUS MT en-fr',           task: 'Translation',               size: '74M',   updated: '1 yr ago',  downloads: 4300000, likes: 480 }, { id: 'facebook/nllb-200-distilled-600M',        name: 'NLLB-200',             task: 'Translation',               size: '600M',  updated: '1 yr ago',  downloads: 2800000, likes: 1120 }] },
			{ label: 'Summarization',             tag: 'summarization',             models: [{ id: 'facebook/bart-large-cnn',                 name: 'BART Large CNN',          task: 'Summarization',             size: '407M',  updated: '1 yr ago',  downloads: 16000000, likes: 3120 }, { id: 'google/pegasus-xsum',                    name: 'PEGASUS XSum',         task: 'Summarization',             size: '568M',  updated: '1 yr ago',  downloads: 5600000, likes: 1240 }] },
			{ label: 'Feature Extraction',        tag: 'feature-extraction',        models: [{ id: 'sentence-transformers/all-MiniLM-L6-v2', name: 'all-MiniLM-L6-v2',        task: 'Feature Extraction',        size: '22M',   updated: '9 days ago',downloads: 22700000, likes: 4930 }, { id: 'intfloat/e5-large-v2',                   name: 'E5 Large v2',          task: 'Feature Extraction',        size: '335M',  updated: '9 mo ago',  downloads: 6100000, likes: 1560 }] },
			{ label: 'Fill-Mask',                 tag: 'fill-mask',                 models: [{ id: 'google-bert/bert-base-uncased',           name: 'BERT Base',               task: 'Fill-Mask',                 size: '110M',  updated: '11 mo ago', downloads: 58000000, likes: 2680 }, { id: 'FacebookAI/roberta-large',               name: 'RoBERTa Large',        task: 'Fill-Mask',                 size: '355M',  updated: '11 mo ago', downloads: 7200000, likes: 890 }] },
		],
	},
	{
		group: 'Vision',
		tasks: [
			{ label: 'Depth Estimation',               tag: 'depth-estimation',               models: [{ id: 'depth-anything/Depth-Anything-V2-Large', name: 'Depth Anything V2',       task: 'Depth Estimation',          size: '335M',  updated: '8 mo ago',  downloads: 3200000, likes: 2890 }, { id: 'Intel/dpt-large',                        name: 'DPT Large',              task: 'Depth Estimation',          size: '343M',  updated: '1 yr ago',  downloads: 1800000, likes: 610 }] },
			{ label: 'Image Feature Extraction',       tag: 'image-feature-extraction',       models: [{ id: 'google/vit-base-patch16-224',             name: 'ViT Base',                 task: 'Image Feature Extraction',  size: '86M',   updated: '1 yr ago',  downloads: 6100000, likes: 1450 }, { id: 'facebook/dinov2-large',                  name: 'DINOv2 Large',           task: 'Image Feature Extraction',  size: '307M',  updated: '10 mo ago', downloads: 2400000, likes: 2230 }] },
			{ label: 'Image Classification',           tag: 'image-classification',           models: [{ id: 'google/vit-base-patch16-224',             name: 'ViT Base Patch16',         task: 'Image Classification',      size: '86M',   updated: '1 yr ago',  downloads: 6100000, likes: 1450 }, { id: 'microsoft/resnet-50',                    name: 'ResNet-50',              task: 'Image Classification',      size: '25M',   updated: '1 yr ago',  downloads: 4900000, likes: 820 }] },
			{ label: 'Zero-Shot Image Classification', tag: 'zero-shot-image-classification', models: [{ id: 'openai/clip-vit-large-patch14',          name: 'CLIP ViT-L/14',            task: 'Zero-Shot Classification',  size: '307M',  updated: '1 yr ago',  downloads: 3700000, likes: 2100 }, { id: 'google/siglip-so400m-patch14-384',        name: 'SigLIP',                 task: 'Zero-Shot Classification',  size: '400M',  updated: '9 mo ago',  downloads: 1200000, likes: 1340 }] },
			{ label: 'Video Classification',           tag: 'video-classification',           models: [{ id: 'MCG-NJU/videomae-base',                  name: 'VideoMAE Base',            task: 'Video Classification',      size: '87M',   updated: '1 yr ago',  downloads: 870000, likes: 680 }, { id: 'google/vivit-b-16x2-kinetics400',        name: 'ViViT',                  task: 'Video Classification',      size: '305M',  updated: '1 yr ago',  downloads: 340000, likes: 310 }] },
			{ label: 'Object Detection',               tag: 'object-detection',               models: [{ id: 'facebook/detr-resnet-50',                 name: 'DETR ResNet-50',           task: 'Object Detection',          size: '41M',   updated: '1 yr ago',  downloads: 3100000, likes: 1080 }, { id: 'hustvl/yolos-small',                     name: 'YOLOS Small',            task: 'Object Detection',          size: '30M',   updated: '1 yr ago',  downloads: 1700000, likes: 480 }] },
			{ label: 'Image Segmentation',             tag: 'image-segmentation',             models: [{ id: 'facebook/mask2former-swin-large-coco-panoptic', name: 'Mask2Former',      task: 'Image Segmentation',        size: '216M',  updated: '1 yr ago',  downloads: 540000, likes: 620 }, { id: 'nvidia/segformer-b5-finetuned-ade-640-640', name: 'SegFormer B5',      task: 'Image Segmentation',        size: '84M',   updated: '1 yr ago',  downloads: 1200000, likes: 430 }] },
			{ label: 'Text-to-Image',                  tag: 'text-to-image',                  models: [{ id: 'stabilityai/stable-diffusion-3.5-large',  name: 'SD 3.5 Large',             task: 'Text-to-Image',             size: '8B',    updated: '5 mo ago',  downloads: 4200000, likes: 5620 }, { id: 'black-forest-labs/FLUX.1-dev',            name: 'FLUX.1-dev',             task: 'Text-to-Image',             size: '12B',   updated: '6 mo ago',  downloads: 7800000, likes: 8910 }] },
			{ label: 'Text-to-Video',                  tag: 'text-to-video',                  models: [{ id: 'ali-vilab/text-to-video-ms-1.7b',         name: 'Text-to-Video 1.7B',       task: 'Text-to-Video',             size: '1.7B',  updated: '1 yr ago',  downloads: 320000, likes: 740 }, { id: 'stabilityai/stable-video-diffusion-img2vid', name: 'SVD',              task: 'Text-to-Video',             size: '1.5B',  updated: '8 mo ago',  downloads: 890000, likes: 1750 }] },
			{ label: 'Text-to-3D',                     tag: 'text-to-3d',                     models: [{ id: 'openai/shap-e',                           name: 'Shap-E',                   task: 'Text-to-3D',                size: '300M',  updated: '1 yr ago',  downloads: 610000, likes: 1870 }, { id: 'sudo-ai/zero123plus-v1.1',               name: 'Zero123+',               task: 'Text-to-3D',                size: '400M',  updated: '10 mo ago', downloads: 180000, likes: 540 }] },
			{ label: 'Image-to-Text',                  tag: 'image-to-text',                  models: [{ id: 'Salesforce/blip-image-captioning-large',  name: 'BLIP Captioning',          task: 'Image-to-Text',             size: '446M',  updated: '1 yr ago',  downloads: 2100000, likes: 1340 }, { id: 'nlpconnect/vit-gpt2-image-captioning',   name: 'ViT-GPT2',               task: 'Image-to-Text',             size: '123M',  updated: '2 yr ago',  downloads: 3800000, likes: 780 }] },
			{ label: 'Image-to-Image',                 tag: 'image-to-image',                 models: [{ id: 'timbrooks/instruct-pix2pix',              name: 'InstructPix2Pix',          task: 'Image-to-Image',            size: '3.4B',  updated: '1 yr ago',  downloads: 1600000, likes: 2460 }, { id: 'stabilityai/stable-diffusion-x4-upscaler', name: 'SD Upscaler',         task: 'Image-to-Image',            size: '1.5B',  updated: '1 yr ago',  downloads: 870000, likes: 920 }] },
			{ label: 'Image-to-Video',                 tag: 'image-to-video',                 models: [{ id: 'stabilityai/stable-video-diffusion-img2vid-xt', name: 'SVD XT',          task: 'Image-to-Video',            size: '1.5B',  updated: '8 mo ago',  downloads: 1200000, likes: 2180 }, { id: 'ali-vilab/i2vgen-xl',                    name: 'I2VGen-XL',              task: 'Image-to-Video',            size: '2.5B',  updated: '1 yr ago',  downloads: 210000, likes: 620 }] },
			{ label: 'Image-to-3D',                    tag: 'image-to-3d',                    models: [{ id: 'sudo-ai/zero123plus-v1.1',                name: 'Zero123+',                 task: 'Image-to-3D',               size: '400M',  updated: '10 mo ago', downloads: 180000, likes: 540 }, { id: 'openai/shap-e-img2img',                  name: 'Shap-E img2img',         task: 'Image-to-3D',               size: '300M',  updated: '1 yr ago',  downloads: 290000, likes: 670 }] },
			{ label: 'Video-to-Video',                 tag: 'video-to-video',                 models: [{ id: 'damo-vilab/text-to-video-ms-1.7b',        name: 'Text-to-Video',            task: 'Video-to-Video',            size: '1.7B',  updated: '1 yr ago',  downloads: 320000, likes: 740 }, { id: 'cerspense/zeroscope_v2_576w',             name: 'ZeroScope v2',           task: 'Video-to-Video',            size: '1.4B',  updated: '1 yr ago',  downloads: 560000, likes: 890 }] },
			{ label: 'Unconditional Image Generation', tag: 'unconditional-image-generation', models: [{ id: 'google/ddpm-cifar10-32',                 name: 'DDPM CIFAR-10',            task: 'Unconditional Image Gen.',  size: '35M',   updated: '2 yr ago',  downloads: 1900000, likes: 320 }, { id: 'fusing/ddpm-celeba-hq',                  name: 'DDPM CelebA-HQ',         task: 'Unconditional Image Gen.',  size: '79M',   updated: '2 yr ago',  downloads: 730000, likes: 280 }] },
			{ label: 'Mask Generation',                tag: 'mask-generation',                models: [{ id: 'facebook/sam-vit-huge',                   name: 'SAM ViT-Huge',             task: 'Mask Generation',           size: '632M',  updated: '1 yr ago',  downloads: 5800000, likes: 4230 }, { id: 'facebook/sam-vit-base',                  name: 'SAM ViT-Base',           task: 'Mask Generation',           size: '91M',   updated: '1 yr ago',  downloads: 3400000, likes: 1890 }] },
			{ label: 'Zero-Shot Object Detection',     tag: 'zero-shot-object-detection',     models: [{ id: 'google/owlvit-base-patch32',              name: 'OWL-ViT',                  task: 'Zero-Shot Detection',       size: '92M',   updated: '1 yr ago',  downloads: 1500000, likes: 830 }, { id: 'IDEA-Research/grounding-dino-base',      name: 'Grounding DINO',         task: 'Zero-Shot Detection',       size: '172M',  updated: '7 mo ago',  downloads: 2100000, likes: 1560 }] },
			{ label: 'Keypoint Detection',             tag: 'keypoint-detection',             models: [{ id: 'usyd-community/vitpose-base-simple',      name: 'ViTPose Base',             task: 'Keypoint Detection',        size: '86M',   updated: '9 mo ago',  downloads: 420000, likes: 340 }, { id: 'nielsr/vitpose-base',                    name: 'ViTPose',                task: 'Keypoint Detection',        size: '86M',   updated: '1 yr ago',  downloads: 280000, likes: 210 }] },
		],
	},
	{
		group: 'Audio',
		tasks: [
			{ label: 'Text-to-Speech',               tag: 'text-to-speech',               models: [{ id: 'microsoft/speecht5_tts',                name: 'SpeechT5 TTS',             task: 'Text-to-Speech',            size: '141M',  updated: '1 yr ago',  downloads: 3200000, likes: 1340 }, { id: 'suno/bark',                              name: 'Bark',                   task: 'Text-to-Speech',            size: '500M',  updated: '1 yr ago',  downloads: 2100000, likes: 3280 }] },
			{ label: 'Text-to-Audio',                tag: 'text-to-audio',                models: [{ id: 'facebook/musicgen-small',               name: 'MusicGen Small',           task: 'Text-to-Audio',             size: '300M',  updated: '1 yr ago',  downloads: 1800000, likes: 2740 }, { id: 'cvssp/audioldm2',                        name: 'AudioLDM 2',             task: 'Text-to-Audio',             size: '1.1B',  updated: '1 yr ago',  downloads: 820000, likes: 1120 }] },
			{ label: 'Audio-to-Audio',               tag: 'audio-to-audio',               models: [{ id: 'speechbrain/sepformer-wham',            name: 'SepFormer WHAM',           task: 'Audio-to-Audio',            size: '26M',   updated: '1 yr ago',  downloads: 1200000, likes: 540 }, { id: 'facebook/demucs',                        name: 'Demucs',                 task: 'Audio-to-Audio',            size: '83M',   updated: '1 yr ago',  downloads: 680000, likes: 890 }] },
			{ label: 'Voice Activity Detection',     tag: 'voice-activity-detection',     models: [{ id: 'pyannote/voice-activity-detection',     name: 'pyannote VAD',             task: 'Voice Activity Detection',  size: '7M',    updated: '1 yr ago',  downloads: 560000, likes: 420 }, { id: 'snakers4/silero-vad',                    name: 'Silero VAD',             task: 'Voice Activity Detection',  size: '2M',    updated: '6 mo ago',  downloads: 2400000, likes: 1340 }] },
			{ label: 'Automatic Speech Recognition', tag: 'automatic-speech-recognition', models: [{ id: 'openai/whisper-large-v3',                name: 'Whisper Large v3',         task: 'Automatic Speech Rec.',     size: '1.5B',  updated: '6 mo ago',  downloads: 5200000, likes: 3410 }, { id: 'facebook/wav2vec2-large-960h',           name: 'wav2vec2 Large',         task: 'Automatic Speech Rec.',     size: '317M',  updated: '2 yr ago',  downloads: 8900000, likes: 1780 }] },
			{ label: 'Audio Classification',         tag: 'audio-classification',         models: [{ id: 'superb/wav2vec2-base-superb-ks',       name: 'wav2vec2 KS',              task: 'Audio Classification',      size: '94M',   updated: '2 yr ago',  downloads: 1100000, likes: 280 }, { id: 'MIT/ast-finetuned-audioset-10-10-0.4593', name: 'AST AudioSet',          task: 'Audio Classification',      size: '87M',   updated: '1 yr ago',  downloads: 890000, likes: 340 }] },
		],
	},
	{
		group: 'Tabular',
		tasks: [
			{ label: 'Tabular Classification',  tag: 'tabular-classification',  models: [{ id: 'julien-c/wine-quality',               name: 'Wine Quality',            task: 'Tabular Classification',    size: '<1M',   updated: '2 yr ago',  downloads: 340000, likes: 180 }, { id: 'inria-soda/carte',                       name: 'CARTE',                  task: 'Tabular Classification',    size: '125M',  updated: '8 mo ago',  downloads: 89000,  likes: 210 }] },
			{ label: 'Tabular Regression',      tag: 'tabular-regression',      models: [{ id: 'scikit-learn/tabular-playground',    name: 'Tabular Playground',      task: 'Tabular Regression',        size: '<1M',   updated: '2 yr ago',  downloads: 210000, likes: 120 }, { id: 'autogluon/tabular-moons',                name: 'AutoGluon Moons',        task: 'Tabular Regression',        size: '<1M',   updated: '1 yr ago',  downloads: 160000, likes: 90 }] },
			{ label: 'Time Series Forecasting', tag: 'time-series-forecasting', models: [{ id: 'huggingface/time-series-transformer', name: 'Time Series Transformer', task: 'Time Series Forecasting',   size: '25M',   updated: '1 yr ago',  downloads: 480000, likes: 340 }, { id: 'amazon/chronos-t5-small',                name: 'Chronos T5 Small',       task: 'Time Series Forecasting',   size: '20M',   updated: '7 mo ago',  downloads: 1200000, likes: 870 }] },
		],
	},
	{
		group: 'Learning & Robotics',
		tasks: [
			{ label: 'Reinforcement Learning', tag: 'reinforcement-learning', models: [{ id: 'sb3/ppo-CartPole-v1', name: 'PPO CartPole', task: 'Reinforcement Learning', size: '<1M', updated: '1 yr ago', downloads: 890000, likes: 340 }, { id: 'HuggingFaceH4/ppo-LunarLander-v2', name: 'PPO LunarLander', task: 'Reinforcement Learning', size: '<1M', updated: '1 yr ago', downloads: 560000, likes: 280 }] },
			{ label: 'Graph Machine Learning', tag: 'graph-ml', models: [{ id: 'pyg-team/gat-cora', name: 'GAT Cora', task: 'Graph Machine Learning', size: '<1M', updated: '1 yr ago', downloads: 120000, likes: 230 }, { id: 'pyg-team/gcn-cora', name: 'GCN Cora', task: 'Graph Machine Learning', size: '<1M', updated: '2 yr ago', downloads: 98000, likes: 180 }] },
			{ label: 'Robotics', tag: 'robotics', models: [{ id: 'lerobot/act-so100-8tasks', name: 'ACT SO-100', task: 'Robotics', size: '44M', updated: '3 mo ago', downloads: 68000, likes: 420 }, { id: 'lerobot/pi0', name: 'pi0', task: 'Robotics', size: '3B', updated: '4 mo ago', downloads: 41000, likes: 890 }] },
		],
	},
];

export function getHfmHtml(mermaidJs?: string): string {
	return buildWebviewHtml({
		title: 'Hugging Face Models',
		mermaidJs,
		wideLayout: true,
		defaultModel: 'nlp',
		modelsLiteral: "['multimodal','nlp','vision','audio','tabular','rl','graphml','embedding']",
		chartW: 54,
		illusCollapsed: false,
		illustrationLabel: 'Explore by Task / Framework / Author',
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
		extraCss: `	.hfm-task-layout { display: grid; grid-template-columns: 220px 1fr; gap: 16px; height: 560px; }
	.hfm-task-list { overflow-y: auto; height: 100%; padding-right: 4px; scrollbar-width: none; }
	.hfm-task-list::-webkit-scrollbar { display: none; }
	.hfm-group { margin-bottom: 6px; }
	.hfm-group-toggle { display: flex; align-items: center; gap: 5px; background: transparent; border: none; color: var(--vscode-foreground); font-size: 12px; font-weight: 600; font-family: var(--vscode-font-family); cursor: pointer; padding: 3px 0; width: 100%; text-align: left; user-select: none; padding-left: 17px; }
	.hfm-group-toggle:hover { text-decoration: underline; }
	.hfm-group-chevron { display: inline-flex; transition: transform 0.15s; flex-shrink: 0; opacity: 0.7; margin-left: -17px; }
	.hfm-group.collapsed .hfm-group-chevron { transform: rotate(-90deg); }
	.hfm-group.collapsed .hfm-task-items { display: none; }
	.hfm-task-items { padding-left: 0; }
	.hfm-task-row { display: flex; align-items: center; gap: 6px; padding: 2px 0; cursor: pointer; padding-left: 17px; }
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
		illustrationOverrideJs: buildIllustrationOverrideJs(),
		miniChartsJs: buildMiniChartsJs(),
		codeBranchesJs: buildCodeBranchesJs(),
		actionsJs: buildActionsJs(),
	});
}

function buildIllustrationOverrideJs(): string {
	const groupsJson = JSON.stringify(HF_TASK_GROUPS);

	return `			var HFM_TASK_GROUPS = ${groupsJson};
			var hfmChecked = {};  // tag -> true
			var hfmAuthorChecked = {};  // hf org slug -> true
			var hfmFilterChecked = {};  // filter tag -> true

			var HFM_FRAMEWORKS = [
				{ label: 'Transformers',       tag: 'transformers' },
				{ label: 'PyTorch',            tag: 'pytorch' },
				{ label: 'TensorFlow / Keras', tag: 'tf' },
				{ label: 'JAX / Flax',         tag: 'jax' },
				{ label: 'scikit-learn',       tag: 'scikit-learn' },
				{ label: 'ONNX',               tag: 'onnx' },
				{ label: 'GGUF',               tag: 'gguf' },
				{ label: 'MLX',                tag: 'mlx' },
				{ label: 'OpenVINO',           tag: 'openvino' },
			];
			var hfmLiveModels = null;  // null = not yet loaded
			var hfmFetchSeq = 0;  // incremented on each fetch; stale responses are discarded

			var HFM_AUTHORS = [
				{ label: 'Allen AI',          slug: 'allenai' },
				{ label: 'Apple',             slug: 'apple' },
				{ label: 'Black Forest Labs', slug: 'black-forest-labs' },
				{ label: 'ByteDance',         slug: 'ByteDance' },
				{ label: 'Cohere',            slug: 'CohereForAI' },
				{ label: 'DeepSeek',          slug: 'deepseek-ai' },
				{ label: 'Google',            slug: 'google' },
				{ label: 'Hugging Face',      slug: 'huggingface' },
				{ label: 'Meta',              slug: 'meta-llama' },
				{ label: 'Microsoft',         slug: 'microsoft' },
				{ label: 'Mistral',           slug: 'mistralai' },
				{ label: 'Moonshot',          slug: 'moonshotai' },
				{ label: 'Nvidia',            slug: 'nvidia' },
				{ label: 'OpenAI',            slug: 'openai' },
				{ label: 'Qwen',              slug: 'Qwen' },
				{ label: 'Stability AI',      slug: 'stabilityai' },
				{ label: 'X.AI',              slug: 'xai-org' },
				{ label: 'Z.ai',              slug: 'THUDM' },
			];

			var HFM_SORT_OPTIONS = [
				{ value: 'trending',	   label: 'Trending' },
				{ value: 'likes',		  label: 'Most Likes' },
				{ value: 'downloads',	  label: 'Most Downloads' },
				{ value: 'created_at',	 label: 'Recently Created' },
				{ value: 'last_modified',  label: 'Recently Updated' },
			];
			var hfmSort = 'trending';

			function hfmBrowseUrl() {
				var sortMap = { trending: 'trending', likes: 'likes', downloads: 'downloads', created_at: 'createdAt', last_modified: 'lastModified' };
				var hfSortParam = sortMap[hfmSort] || 'trending';
				var tags = Object.keys(hfmChecked).filter(function(t) { return hfmChecked[t]; });
				var auths = Object.keys(hfmAuthorChecked).filter(function(a) { return hfmAuthorChecked[a]; });
				var base = 'https://huggingface.co/models?sort=' + hfSortParam;
				if (tags.length === 1) { base += '&pipeline_tag=' + tags[0]; }
				if (auths.length === 1) { base += '&author=' + auths[0]; }
				return base;
			}

			function hfmFmt(n) {
				if (n >= 1000000) { return (n / 1000000).toFixed(1).replace(/\\.0$/, '') + 'M'; }
				if (n >= 1000) { return (n / 1000).toFixed(1).replace(/\\.0$/, '') + 'k'; }
				return String(n);
			}

			function hfmRelTime(iso) {
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

			function hfmModelName(id) {
				var parts = id.split('/');
				return parts[parts.length - 1].replace(/-/g, ' ').replace(/_/g, ' ');
			}

			function hfmUpdateSortBtn() {
				var btn = body.querySelector('#hfm-sort-btn');
				if (!btn) { return; }
				var opt = null;
				for (var oi = 0; oi < HFM_SORT_OPTIONS.length; oi++) { if (HFM_SORT_OPTIONS[oi].value === hfmSort) { opt = HFM_SORT_OPTIONS[oi]; break; } }
				if (!opt) { opt = HFM_SORT_OPTIONS[0]; }
				btn.querySelector('.hfm-sort-label').innerHTML = '&#8645; Sort: ' + esc(opt.label);
				body.querySelectorAll('.hfm-sort-option').forEach(function(el) {
					el.classList.toggle('active', el.dataset.value === hfmSort);
				});
				body.querySelector('.hfm-browse-btn').dataset.url = hfmBrowseUrl();
			}

			function hfmTagLabel(tag) {
				if (!tag) { return ''; }
				for (var gi = 0; gi < HFM_TASK_GROUPS.length; gi++) {
					for (var ti = 0; ti < HFM_TASK_GROUPS[gi].tasks.length; ti++) {
						if (HFM_TASK_GROUPS[gi].tasks[ti].tag === tag) { return HFM_TASK_GROUPS[gi].tasks[ti].label; }
					}
				}
				return tag.replace(/-/g, ' ');
			}

			function hfmShowGrid(models) {
				var grid = body.querySelector('.right-action-grid');
				if (!grid) { return; }
				if (models.length === 0) {
					grid.innerHTML = '<div class="hfm-empty">No models found for this selection</div>';
					return;
				}
				grid.innerHTML = models.map(function(m) {
					var name = m.id;
					var task = hfmTagLabel(m.pipeline_tag);
					return '<button class="nb-card hfm-model-card" data-hf-id="' + esc(m.id) + '">'
						+ '<span class="nb-label">' + esc(name) + '</span>'
						+ '<span class="nb-desc hfm-task-tag">' + esc(task) + '</span>'
						+ '<span class="hfm-model-meta">'
						+ '<span class="hfm-meta-chip" title="Last updated">&#8987; ' + esc(hfmRelTime(m.lastModified)) + '</span>'
						+ '<span class="hfm-meta-chip" title="Downloads">&#8595; ' + hfmFmt(m.downloads) + '</span>'
						+ '<span class="hfm-meta-chip" title="Likes">&#9825; ' + hfmFmt(m.likes) + '</span>'
						+ '</span>'
						+ '</button>';
				}).join('');
				grid.querySelectorAll('[data-hf-id]').forEach(function(btn) {
					btn.addEventListener('click', function() {
						vscode.postMessage({ command: 'openUrl', url: 'https://huggingface.co/' + btn.dataset.hfId });
					});
				});
			}

			function hfmShowSpinner() {
				var grid = body.querySelector('.right-action-grid');
				if (grid) { grid.innerHTML = '<div class="hfm-empty hfm-loading">&#8987; Loading&#8230;</div>'; }
			}

			function hfmShowOffline() {
				var grid = body.querySelector('.right-action-grid');
				if (grid) { grid.innerHTML = '<div class="hfm-empty">&#9888; Unable to connect to Hugging Face.<br>Check your network connection and try again.</div>'; }
			}

			function hfmFetch() {
				hfmLiveModels = null;
				hfmFetchSeq++;
				var seq = hfmFetchSeq;
				hfmShowSpinner();
				var tags = Object.keys(hfmChecked).filter(function(t) { return hfmChecked[t]; });
				var auths = Object.keys(hfmAuthorChecked).filter(function(a) { return hfmAuthorChecked[a]; });
				var filters = Object.keys(hfmFilterChecked).filter(function(f) { return hfmFilterChecked[f]; });
				vscode.postMessage({ command: 'fetchHfModels', sort: hfmSort, tags: tags, authors: auths, filters: filters, limit: 30, seq: seq });
			}

			var hfmFetchTimer = null;
			function hfmScheduleFetch() {
				if (hfmFetchTimer) { clearTimeout(hfmFetchTimer); }
				hfmFetchTimer = setTimeout(function() { hfmFetchTimer = null; hfmFetch(); }, 150);
			}

			function hfmUpdateBrowseLabel() {
				var panel = body.querySelector('.hfm-cards-panel');
				if (!panel) { return; }
				var tags = Object.keys(hfmChecked).filter(function(t) { return hfmChecked[t]; });
				var auths = Object.keys(hfmAuthorChecked).filter(function(a) { return hfmAuthorChecked[a]; });
				var filters = Object.keys(hfmFilterChecked).filter(function(f) { return hfmFilterChecked[f]; });
				var taskPart = tags.length === 0 ? '' : tags.length === 1
					? (function() { for (var gi = 0; gi < HFM_TASK_GROUPS.length; gi++) { for (var ti = 0; ti < HFM_TASK_GROUPS[gi].tasks.length; ti++) { if (HFM_TASK_GROUPS[gi].tasks[ti].tag === tags[0]) { return HFM_TASK_GROUPS[gi].tasks[ti].label; } } } return tags[0]; })()
					: tags.length + ' tasks';
				var authPart = auths.length === 0 ? '' : auths.length === 1
					? (function() { for (var ai = 0; ai < HFM_AUTHORS.length; ai++) { if (HFM_AUTHORS[ai].slug === auths[0]) { return HFM_AUTHORS[ai].label; } } return auths[0]; })()
					: auths.length + ' authors';
				var fwPart = filters.length === 0 ? '' : filters.length === 1
					? (function() { for (var fi = 0; fi < HFM_FRAMEWORKS.length; fi++) { if (HFM_FRAMEWORKS[fi].tag === filters[0]) { return HFM_FRAMEWORKS[fi].label; } } return filters[0]; })()
					: filters.length + ' frameworks';
				var lbl = (!taskPart && !authPart && !fwPart) ? 'All models' : [taskPart, authPart, fwPart].filter(Boolean).join(' · ');
				panel.querySelector('.hfm-browse-label').textContent = lbl;
			}

			// handle messages from the extension host
			window.addEventListener('message', function(ev) {
				var msg = ev.data;
				if (msg.command === 'hfModels') {
					if (msg.seq !== undefined && msg.seq !== hfmFetchSeq) { return; }  // stale
					hfmLiveModels = msg.models || [];
					hfmShowGrid(hfmLiveModels);
				} else if (msg.command === 'hfModelsError') {
					if (msg.seq !== undefined && msg.seq !== hfmFetchSeq) { return; }  // stale
					hfmShowOffline();
				}
			});

			var chevronSvg = '<svg width="12" height="12" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><path d="M7.976 10.072l-4.054-4.014-.92.92 4.49 4.45.978.01 4.525-4.46-.918-.92-4.101 4.014z"/></svg>';

			var sortDropdownHtml = '<div class="hfm-sort-dropdown hidden" id="hfm-sort-dropdown">'
				+ HFM_SORT_OPTIONS.map(function(o) {
					return '<button class="hfm-sort-option' + (o.value === 'trending' ? ' active' : '') + '" data-value="' + o.value + '">' + esc(o.label) + '</button>';
				}).join('')
				+ '</div>';

			var listHtml = '<div class="hfm-task-list">';
			HFM_TASK_GROUPS.forEach(function(g) {
				var groupId = 'hfg-' + g.group.replace(/[^a-z0-9]/gi, '-').toLowerCase();
				listHtml += '<div class="hfm-group collapsed" id="' + groupId + '">';
				listHtml += '<button class="hfm-group-toggle"><span class="hfm-group-chevron">' + chevronSvg + '</span>' + esc(g.group) + '</button>';
				listHtml += '<div class="hfm-task-items">';
				g.tasks.forEach(function(t) {
					var cbId = 'hfcb-' + t.tag;
					listHtml += '<label class="hfm-task-row"><input class="hfm-task-cb" type="checkbox" id="' + cbId + '" data-tag="' + esc(t.tag) + '"><span class="hfm-task-label">' + esc(t.label) + '</span></label>';
				});
				listHtml += '</div></div>';
			});
			listHtml += '<hr class="hfm-section-sep">';
			listHtml += '<div class="hfm-group collapsed" id="hfg-framework">';
			listHtml += '<button class="hfm-group-toggle"><span class="hfm-group-chevron">' + chevronSvg + '</span>Framework</button>';
			listHtml += '<div class="hfm-task-items">';
			HFM_FRAMEWORKS.forEach(function(f) {
				var cbId = 'hffwcb-' + f.tag;
				listHtml += '<label class="hfm-task-row"><input class="hfm-task-cb hfm-fw-cb" type="checkbox" id="' + cbId + '" data-fw-tag="' + esc(f.tag) + '"><span class="hfm-task-label">' + esc(f.label) + '</span></label>';
			});
			listHtml += '</div></div>';
			listHtml += '<div class="hfm-group collapsed" id="hfg-developer">';
			listHtml += '<button class="hfm-group-toggle"><span class="hfm-group-chevron">' + chevronSvg + '</span>Author</button>';
			listHtml += '<div class="hfm-task-items">';
			HFM_AUTHORS.forEach(function(a) {
				var cbId = 'hfacb-' + a.slug;
				listHtml += '<label class="hfm-task-row"><input class="hfm-task-cb hfm-author-cb" type="checkbox" id="' + cbId + '" data-slug="' + esc(a.slug) + '"><span class="hfm-task-label">' + esc(a.label) + '</span></label>';
			});
			listHtml += '</div></div>';
			listHtml += '</div>';

			var cardsHtml = '<div class="hfm-cards-panel">'
				+ '<div class="hfm-browse-row"><span class="hfm-browse-label">All models</span>'
				+ '<div class="hfm-browse-controls" style="position:relative;">'
				+ '<button class="hfm-sort-btn" id="hfm-sort-btn"><span class="hfm-sort-label">&#8645; Sort: Trending</span></button>'
				+ sortDropdownHtml
				+ '<button class="hfm-browse-btn" data-url="https://huggingface.co/models?sort=trending">Hugging Face &#8599;</button>'
				+ '</div></div>'
				+ '<div class="right-action-grid"></div>'
				+ '</div>';

			body.innerHTML = '<div class="hfm-task-layout">' + listHtml + cardsHtml + '</div>';

			// group collapse toggles
			body.querySelectorAll('.hfm-group-toggle').forEach(function(btn) {
				btn.addEventListener('click', function() {
					btn.closest('.hfm-group').classList.toggle('collapsed');
				});
			});

			// task checkbox change — re-fetch (debounced so rapid ticks coalesce)
			body.querySelectorAll('.hfm-task-cb:not(.hfm-author-cb):not(.hfm-fw-cb)').forEach(function(cb) {
				cb.addEventListener('change', function() {
					if (cb.checked) { hfmChecked[cb.dataset.tag] = true; } else { delete hfmChecked[cb.dataset.tag]; }
					hfmUpdateBrowseLabel();
					hfmUpdateSortBtn();
					hfmScheduleFetch();
				});
			});

			// author checkbox change — re-fetch (debounced so rapid ticks coalesce)
			body.querySelectorAll('.hfm-author-cb').forEach(function(cb) {
				cb.addEventListener('change', function() {
					if (cb.checked) { hfmAuthorChecked[cb.dataset.slug] = true; } else { delete hfmAuthorChecked[cb.dataset.slug]; }
					hfmUpdateBrowseLabel();
					hfmUpdateSortBtn();
					hfmScheduleFetch();
				});
			});

			// framework checkbox change — re-fetch (debounced so rapid ticks coalesce)
			body.querySelectorAll('.hfm-fw-cb').forEach(function(cb) {
				cb.addEventListener('change', function() {
					if (cb.checked) { hfmFilterChecked[cb.dataset.fwTag] = true; } else { delete hfmFilterChecked[cb.dataset.fwTag]; }
					hfmUpdateBrowseLabel();
					hfmUpdateSortBtn();
					hfmScheduleFetch();
				});
			});

			// sort button — toggle dropdown
			var sortDropdown = body.querySelector('#hfm-sort-dropdown');
			body.querySelector('#hfm-sort-btn').addEventListener('click', function(e) {
				e.stopPropagation();
				sortDropdown.classList.toggle('hidden');
			});
			// sort option click — re-fetch
			sortDropdown.querySelectorAll('.hfm-sort-option').forEach(function(opt) {
				opt.addEventListener('click', function() {
					hfmSort = opt.dataset.value;
					sortDropdown.classList.add('hidden');
					hfmUpdateSortBtn();
					hfmScheduleFetch();
				});
			});
			// close dropdown on outside click
			document.addEventListener('click', function() { sortDropdown.classList.add('hidden'); });

			// browse button
			body.querySelector('.hfm-browse-btn').addEventListener('click', function(e) {
				vscode.postMessage({ command: 'openUrl', url: e.currentTarget.dataset.url });
			});

			// initial fetch
			hfmUpdateSortBtn();
			hfmFetch();
			return;
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
				{
					id: 'julia-onnx-vs-python',
					label: 'Julia (ONNX) vs Python',
					desc: 'Run the same HF ONNX model in Julia and Python; compare outputs and latency',
					code: function() {
						var c = '';
						c += line(kw('# ') + '── Julia side (ONNX.jl) ──────────────────────────────────────');
						c += line(kw('using') + ' ' + ty('ONNX') + ', ' + ty('BenchmarkTools'));
						c += blank();
						c += cline('model  = ONNX.' + fn('load') + '("minilm.onnx")', 'load exported ONNX model');
						c += cline('input  = ' + fn('rand') + '(' + ty('Float32') + ', 1, 128)', 'dummy token-id input (batch=1, seq=128)');
						c += cline('out_jl = model(input)', 'forward pass');
						c += cline('emb_jl = out_jl["last_hidden_state"][:, 1, :]', 'CLS token embedding');
						c += blank();
						c += cline('t_jl   = @benchmark model(input)', 'benchmark');
						c += cline(fn('println') + '("Julia  median: ", ' + fn('median') + '(t_jl).time ÷ 1_000_000, " ms")', 'report latency');
						c += blank();
						c += line(kw('# ') + '── Python side (run in terminal) ─────────────────────────────');
						c += line(kw('# ') + 'pip install optimum[onnxruntime] transformers sentence-transformers');
						c += line(kw('# ') + 'python3 - <<EOF');
						c += line(kw('# ') + 'from optimum.onnxruntime import ORTModelForFeatureExtraction');
						c += line(kw('# ') + 'from transformers import AutoTokenizer');
						c += line(kw('# ') + 'import time, numpy as np');
						c += line(kw('# ') + 'model = ORTModelForFeatureExtraction.from_pretrained(');
						c += line(kw('# ') + '    "sentence-transformers/all-MiniLM-L6-v2", export=True)');
						c += line(kw('# ') + 'tkr   = AutoTokenizer.from_pretrained(');
						c += line(kw('# ') + '    "sentence-transformers/all-MiniLM-L6-v2")');
						c += line(kw('# ') + 'enc   = tkr("benchmark text", return_tensors="pt")');
						c += line(kw('# ') + 't0    = time.perf_counter()');
						c += line(kw('# ') + 'out   = model(**enc)');
						c += line(kw('# ') + 'print(f"Python median: \${(time.perf_counter()-t0)*1000:.1f} ms")');
						c += line(kw('# ') + 'print(f"Embedding shape: \${out.last_hidden_state.shape}")');
						c += line(kw('# ') + 'EOF');
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
