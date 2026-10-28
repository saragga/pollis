# Q&A

Q&A mode answers a question from the documents, with **retrieval-augmented generation** (RAG; Lewis and others 2020): it finds the passages most related to the question and has the chat model answer from them alone, citing the documents they came from.

## How It Works
1. `build_index` from RAGTools.jl splits the documents into **chunks** and embeds each one. Each chunk remembers its source document.
2. The question is embedded with the same model, and the **top n** chunks closest to it, by cosine similarity, are retrieved.
3. The chat model receives the question and those chunks, and is instructed to answer from them.
4. The panel prints the answer and the documents the chunks came from.

The index is built once; every further question needs one embedding and one chat call.

## Context Chunks
**Context Chunks** sets n. More chunks give the model a better chance of seeing the passage that holds the answer, but they lengthen the prompt and can bring in passages that distract it. A question whose answer is spread across many documents needs more; a precise factual question needs few.

## Checking an Answer
- **Evidence** prints the retrieved chunks with their sources: the only text the answer was allowed to use. Read them.
- If the chunks contain the answer and the model missed it, try a stronger chat model.
- If the chunks do not contain it, retrieval failed: rephrase the question with the words the documents would use, raise n, or try another embedding model.
- **Label Counts** shows the retrieval scores of the chunks; a sharp drop after the first few means the rest add little.

## Limits
- An answer covers only what was retrieved, so it cannot count or list things across the whole collection ("how many documents mention X"). For that, use Tag or Classify.
- A model can still add facts the chunks do not contain. Treat an answer as a pointer to the sources, not as a source itself.

## Follow-Up Questions
**Apply to New Text** asks a new question against the same index, without embedding the documents again.

## See Also
- [Topics](topics.md) · [Interpretation](interpretation.md) · [Diagnostics](diagnostics.md)
