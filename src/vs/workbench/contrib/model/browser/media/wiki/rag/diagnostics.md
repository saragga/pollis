# Diagnostics

When an answer is wrong, find out which half failed before changing anything. Search the question alone, and read the passages: if the right passage is not among them, no answering model can help; if it is, the fault lies in reranking or generation.

## Where It Went Wrong

| What you see | Likely cause | What to try |
|---|---|---|
| A document has few passages, or none | A scanned PDF, or text it could not read | Look at its passages under **Chunking**; use a version with text |
| Passages cut in the middle of an idea | Too short for these documents | A longer **Passage Length**, and build again |
| The right passage is found, among much else in it | Too long | A shorter **Passage Length**, and build again |
| A name or code is not found | Too rare or split in the PDF, or a different form of it | Search its exact form; read the passage where it should be |
| The same idea in other words is not found | The search by meaning is off, or the model is weak on this field | Look for the words-only note; try another **Embedding Model** |
| The right passage is found, but far down | Many similar passages | **Rerank** from more passages, and keep the best |
| The right passage is among those given, the answer is wrong | The model misread or ignored it | Another **Answering Model**; a narrower question |
| The answer says things no passage says | The model answered from memory | Follow the citations; ask only what the documents hold |

## Searched by Words Only
The line under the search says when the search by meaning did not run, and why: the index has no embeddings, the passages are not embedded, the index was embedded with another model, or the embedding model did not start. The results are then BM25's alone. Choose the model and **Build the Index** again, or check that the model runs.

## Measuring Retrieval
Trying one question at a time misleads. Write ten or twenty questions whose right passage you know, and for each see where it comes:
- **Hit rate at k**: the share of questions with the right passage among the first k. The first thing to raise, since a passage not found cannot be used.
- **Place of the right passage**: how far down it comes when it is found; reranking is meant to improve this.
- **Precision at k**: the share of the first k that are relevant, which matters when many passages could answer.

[Manning, Raghavan and Schütze (2008)](#ref-MRS2008a) cover the evaluation of ranked retrieval in full. Change one thing at a time and compare on the same questions. Compose > Local Models has **Evaluate Embedding Models** and **Evaluate Answering Models**, which do this across models on test sets of questions.

## Checking an Answer
Reading a citation is the real check: does the passage say what the sentence citing it says? Check especially:
- **Faithfulness**: each claim is in a cited passage.
- **Completeness**: the answer leaves out nothing the passages say that matters.
- **Honesty**: when no passage answers, the model says so. Ask something the documents do not hold, and see.

## References

<a id="ref-MRS2008a"></a>Manning, C. D., Raghavan, P. and Schütze, H. (2008). *Introduction to Information Retrieval*. Cambridge University Press. [doi:10.1017/CBO9780511809071](https://doi.org/10.1017/CBO9780511809071)

## See Also
- [Interpretation](interpretation.md) · [Assumptions](assumptions.md) · [Decision Guide](decision-guide.md)
