# Assumptions

## The Labels
- **The model can do the task.** A tag or category must be something a careful reader could decide from the document alone. If two people would disagree, so will the model, and no amount of prompting fixes an unclear category.
- **The labels are clear words.** The model sees only the names of the tags or categories. A short, distinct name works better than a code, and categories that overlap produce arbitrary choices.
- **Classify means one category each.** Every document must fit exactly one category; a document that fits none or several is forced into one, or becomes "unclassified". Use Tag when several may apply.

## The Model
- **Replies are measurements with error.** Even a strong model mislabels some documents, and its errors are not random: they follow the wording of the prompt, the order of the options and the model's training.
- **Temperature 0 is not full determinism.** The panel asks for the most likely reply, which makes runs repeatable in most cases, but providers do not guarantee identical replies across runs or versions.
- **Models change.** A hosted model name may point to a new version later. Record the exact model and date, or use a local model file, which never changes.
- **Documents fit in the context.** Each document is sent whole. A very long document may be cut by the provider, or exceed a small local model's context; split it first.
- **Small models are weaker.** The default local model is small, chosen to run on any computer. It is good for trying the panel; for research use, check it against hand labels or use a larger model.

## The Embeddings
- **Close vectors mean similar texts.** Topics, Q&A retrieval and the embedding classifier assume the embedding model places texts with similar meaning close together, for the language and domain of the documents.
- **One model for all.** The documents and the queries must be embedded by the same model; embeddings from different models cannot be compared.

## Validation
- **A representative hand-labelled sample.** Accuracy measured on a sample says something about the whole collection only if the sample was drawn at random from it, not chosen for being easy or interesting.

## Privacy
With Anthropic, Google or OpenAI, every document is sent to the provider. Use a local model for confidential or personal data, or check that the provider's terms allow the use.

## See Also
- [Diagnostics](diagnostics.md) · [Decision Guide](decision-guide.md) · [Factsheet](factsheet.md)
