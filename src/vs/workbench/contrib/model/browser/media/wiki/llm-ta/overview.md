# Overview

The LLM Text Analysis panel analyses a collection of texts with **large language models** (LLMs). The documents are a vector of strings: survey answers, abstracts, reports, news items, sections of a manual. The panel has four modes:

- **Tag**: mark each document with every tag that applies, from a list you give ([Tagging](tagging.md)).
- **Classify**: put each document in exactly one category ([Classification](classification.md)).
- **Topics**: find groups of similar documents without a list, and have the LLM name and summarise each group ([Topics](topics.md)).
- **Q&A**: answer a question from the documents, citing the ones used ([Q&A](qa.md)).

## Two Kinds of Model
- A **chat model** reads text and writes text: it tags, classifies, names topics and answers questions.
- An **embedding model** turns each text into a vector of numbers, so that texts with similar meaning lie close together. Topics, Q&A, the document map and the embedding classifier rely on it.

Both can run **on this computer** with llama.cpp, which comes with Pollis: open models in GGUF files, downloaded the first time, with no key and no data leaving the machine. Or they can run with **Anthropic**, **Google** or **OpenAI**, with a key from the provider. Anthropic has no embedding models, so it is paired with another embedding provider.

## Common Workflow

1. Choose the mode, the documents and the models; start with a local model on a small set of documents.
2. Run the analysis, then **View Results** and **Label Counts**.
3. Look at the **Evidence**: replies that broke the format, or the context behind an answer.
4. Label a sample by hand and run **Accuracy vs Hand Labels**: this is the test that matters.
5. Check that the result does not hang on one model with **Compare Models** and the **Embedding Classifier**.
6. Apply the same set-up to new documents with **Apply to New Text**.

## See Also
- [Factsheet](factsheet.md) · [Decision Guide](decision-guide.md) · [Assumptions](assumptions.md)
