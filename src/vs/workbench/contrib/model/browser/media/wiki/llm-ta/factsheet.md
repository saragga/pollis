# LLM Text Analysis — Factsheet

**LLM text analysis** uses large language models as coders of text: the model reads each document and assigns tags or a category, as a trained research assistant would, or it names the groups that a clustering of embeddings finds. The approach extends classical content analysis and supervised text classification to settings with no training data, at the price of a measurement whose errors must be checked against human coding.

| | |
|---|---|
| **Purpose** | Tag, classify, group or question a collection of documents |
| **Input** | A vector of strings; tags, categories, a number of topics or a question; optionally a sample labelled by hand |
| **Core packages** | [PromptingTools.jl](https://github.com/svilupp/PromptingTools.jl), [LLMTextAnalysis.jl](https://github.com/svilupp/LLMTextAnalysis.jl), [RAGTools.jl](https://github.com/JuliaGenAI/RAGTools.jl), [StatisticalMeasures.jl](https://github.com/JuliaAI/StatisticalMeasures.jl) |
| **Methods** | Zero-shot prompting at temperature 0; hierarchical clustering of embeddings; retrieval-augmented generation; embedding classifiers |
| **Providers** | Local (llama.cpp with GGUF models), Anthropic, Google, OpenAI |
| **Output** | Tags or a category per document, topics with labels and summaries, or an answer with its sources; accuracy and Cohen kappa against hand labels and between models |
| **Key choices** | The mode; the chat model and the embedding model; the wording of tags and categories |

## When to Use

- **Coding open-ended text** at a scale where reading everything is too slow: survey answers, comments, interviews.
- **Labelling documents** for later analysis: the sector of a filing, the stance of an article, the method of a paper.
- **Exploring** an unfamiliar collection: what groups it falls into, what it says about a question.
- **Replacing a keyword search** when meaning matters more than exact words.

## What It Is Not

The labels are measurements with error, not facts: a study that uses them should report agreement with human coding on a sample, and treat disagreement as measurement error. An LLM's answer about the documents is not evidence by itself; Q&A cites the passages it used, and those are what to read. And topics found by clustering are a description of the collection, not a model of how it was generated.

## See Also
- [Overview](overview.md) · [Decision Guide](decision-guide.md) · [Assumptions](assumptions.md)
