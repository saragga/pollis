# Tagging

Tag mode decides, for every document and every tag, whether the tag applies. Any number of tags can apply to a document, including none.

## How It Works
1. For each document, the chat model receives the list of tags and the document, and is asked to reply with the tags that apply, separated by semicolons, or with none.
2. The calls run in parallel, at temperature 0.
3. Each reply is split into items, cleaned of spaces, quotes and markdown, and compared with the tags, ignoring case. An item that matches no tag is ignored, so the model cannot invent tags.
4. The result is a **tag matrix**: one row per document, one column per tag, true where the tag applies.

## Writing Tags
- Use short, distinct words or phrases, without commas or semicolons, which separate the items of a reply.
- Avoid tags that overlap, or one tag that contains another: the model will apply both, or pick one arbitrarily.
- A tag that is rare in the collection is hard to measure: check it against hand labels with enough documents that have it.

## Checking
- **Label Counts** shows how many documents have each tag; a tag on almost every document is a warning sign.
- **Document Map** shows the tag matrix.
- **Evidence** lists the reply items that matched no tag.
- **Accuracy vs Hand Labels** scores each tag on its own as a yes-or-no decision. For hand labels, give each document's list of tags, for example `[["finance"], ["health", "politics"]]`.
- The **Embedding Classifier** learns one concept per tag with `train_concept` from LLMTextAnalysis.jl: the LLM rewrites sample documents in terms of the tag, and a logistic model learns the direction in embedding space that separates them. Its scores give a second opinion on every tag.

## See Also
- [Classification](classification.md) · [Diagnostics](diagnostics.md) · [Decision Guide](decision-guide.md)
