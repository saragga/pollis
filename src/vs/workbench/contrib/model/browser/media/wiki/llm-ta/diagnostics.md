# Diagnostics

An LLM always returns labels, so the checks are what tell a usable measurement from a plausible-looking one.

## Against Hand Labels
Label a random sample of documents yourself, enter their indices and labels in the panel, and run **Accuracy vs Hand Labels**.

- **Accuracy** is the share of documents where the model agrees with you.
- **Cohen kappa** corrects that share for the agreement expected by chance from how often each label is used. It is zero for chance agreement and one for perfect agreement. Kappa is the number to report: with a rare tag, a model that never uses it scores a high accuracy and a kappa of zero.
- The **confusion matrix** (Classify) shows which categories the model mixes up, which often points to two categories that need clearer names or merging.

In Tag mode each tag is a yes-or-no decision, scored on its own.

## Format
**Evidence** lists the replies that did not follow the instructions: items that match no tag (ignored), or replies that match no category (counted as "unclassified"). A few are normal for small models; many mean the model does not follow the prompt, and a larger model is needed.

## Degenerate Labelling
**Label Counts** shows how often each label is used. Warning signs: one tag on almost every document, a category that is never used, or most documents "unclassified". Small models often apply every tag, or the first one listed.

## Agreement Between Methods
- **Compare Models** runs the same analysis with a second model, from any provider, and gives Cohen kappa between the two. Low agreement means the labels depend on the model, and the task or the labels need work.
- The **Embedding Classifier** labels the documents from their embeddings alone and gives its agreement with the chat model. It is an independent second opinion, at little cost.

## Topics
**Evidence** gives each topic's keywords and its most central document. A topic whose keywords and central document do not match its label was named poorly; one whose keywords are generic words is a weak cluster. See [Topics](topics.md).

## Q&A
**Evidence** prints the retrieved chunks, the only text the answer was allowed to use. If they do not contain the answer, the retrieval failed, whatever the answer says. See [Q&A](qa.md).

## Cost
Each run prints the tokens used, prompt and reply together, which sets the cost with a hosted provider and the time with a local one.

## See Also
- [Interpretation](interpretation.md) · [Assumptions](assumptions.md) · [Decision Guide](decision-guide.md)
