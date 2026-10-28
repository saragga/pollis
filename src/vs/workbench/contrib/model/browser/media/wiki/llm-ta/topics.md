# Topics

Topics mode finds groups of similar documents without a list of categories, and has the chat model name and summarise each group. It follows the approach of BERTopic and similar methods: embed, cluster, then describe.

## How It Works
1. `build_index` from LLMTextAnalysis.jl embeds every document with the embedding model, computes the cosine distances between them, and extracts keywords for each document.
2. `build_clusters!` clusters the documents hierarchically with **complete linkage** and cuts the tree into k groups.
3. For each group, the chat model receives its keywords and some of its documents, and writes a short **label** and a **summary**.

Only the naming step calls the chat model, once per topic, so Topics is cheap even for a large collection; embedding is the main cost.

## Choosing k
k is where the tree is cut, not a property of the documents. A small k gives broad themes; a large k splits them into narrower ones, and some groups become too small to mean much. Try several values: themes that stay together as k changes are robust, and the right k is the one whose topics are useful for the question.

## Checking
- **Label Counts** shows the size of each topic; one huge topic and many tiny ones mean the embeddings do not separate the documents well.
- **Evidence** gives each topic's keywords and its most central document. When they do not match the label, the label is wrong; when the keywords are generic, the topic is weak.
- **Document Map** places the documents on a two-dimensional UMAP map coloured by topic.
- **Representative Documents** shows examples from each topic: read them before trusting a label.

## New Documents
**Apply to New Text** places a new document in a topic without clustering again: an embedding classifier, trained on the topic assignments, scores it.

## See Also
- [Classification](classification.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
