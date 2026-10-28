# Interpretation

## Labels as Measurements
A tag or category from an LLM is a measurement of a property of the text, like a code from a human coder. Treat it the same way:

- report how it was produced: the model and its version, the provider, the date, and the exact tags or categories;
- report its agreement with human coding (Cohen kappa) on a random sample;
- when the labels enter a later analysis, such as a regression, remember that their errors carry into it. Errors that depend on the document's content can bias the estimates, not only add noise.

## Reading Cohen Kappa
Kappa compares the observed agreement with the agreement expected by chance. Common rough guides call values above about 0.6 substantial and above about 0.8 almost perfect, but they are conventions, not tests. What matters is whether the agreement is close to the agreement between two careful human coders on the same task, which is rarely perfect.

## Counts
**Label Counts** shows how often each label was used. A share of documents with a tag is an estimate with two sources of error: sampling, if the documents are a sample, and labelling. Hand labels can correct the share for the model's known error rates.

## Topics
A topic is a group of documents whose embeddings are close. Its **label** and **summary** are written by the chat model from a few of its documents and keywords: they describe the group, but they are a reading of it, not a definition. The number of topics k is a choice, not a finding; groups split and merge as k changes. The **Document Map** places every document in two dimensions with UMAP: nearby points are similar texts, but distances between distant groups and the size of a group on the map mean little.

## Answers
A Q&A answer is generated from the retrieved chunks only. It is supported if those chunks say what it says, which **Evidence** and **Representative Documents** let you check. A fluent answer that the chunks do not support is a hallucination; an answer of "not found" may mean that the retrieval missed the relevant passage, not that the documents lack it.

## Disagreement
When two models disagree on a document, the document is often ambiguous. Read some: they show where the tags or categories need clearer definitions.

## See Also
- [Diagnostics](diagnostics.md) · [Topics](topics.md) · [Q&A](qa.md)
