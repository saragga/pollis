# Classification

Classify mode puts every document in exactly one of a set of mutually exclusive categories.

## How It Works
1. For each document, the chat model receives the list of categories and the document, and is asked to reply with the one category that fits best, exactly as written.
2. The calls run in parallel, at temperature 0.
3. The reply is cleaned of spaces, quotes and markdown and compared with the categories, ignoring case. A reply that matches no category becomes **"unclassified"**.

## Writing Categories
- Categories must not overlap: a document that fits two equally well is assigned by chance.
- They should cover the collection. If many documents fit none, add an "other" category rather than forcing them into the nearest one.
- Short, plain names work best, since the model sees only the names. A category that needs a definition to be understood may need a clearer name.

## Checking
- **Label Counts** shows how many documents fall in each category, and how many are unclassified.
- **Document Map** places the documents on a two-dimensional UMAP map of their embeddings, coloured by category: categories that the model applies consistently form regions.
- **Evidence** lists the replies that matched no category.
- **Accuracy vs Hand Labels** gives accuracy, Cohen kappa and the confusion matrix, rows from the model and columns from the hand labels.

## The Embedding Classifier
`train_classifier` from LLMTextAnalysis.jl learns the categories from the document embeddings, with a logistic model:

- trained on your **hand labels** when they are given, which then must include every category;
- otherwise trained on **examples written by the LLM** for each category.

It then labels every document with no further LLM calls, and the panel reports its agreement with the chat model. When the two agree well, the classifier is a cheap way to label a much larger collection.

## See Also
- [Tagging](tagging.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md)
