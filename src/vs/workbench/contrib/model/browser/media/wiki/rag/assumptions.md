# Assumptions

## The Answer Is in the Documents
Retrieval always returns passages, the nearest there are, even if none answers the question. A model given them may say so, or may answer anyway from what it remembers. The method adds nothing to a collection that does not hold the answer.

## The Documents Can Be Read as Text
A PDF is read from its text layer. A scanned PDF with no text layer gives no passages, and is not read from its images. Tables, formulas and figures come through as far as their text does: a table may lose its columns and a formula its layout, so a question that depends on one may not find it, or the model may misread it.

## A Passage Makes Sense Alone
A passage is found and read without the rest of its document. "The method above fails in this case" means little by itself. The heading a passage keeps and the sentence it carries over help, but a collection written with long chains of reference suffers, and longer passages may suit it better.

## One Passage Holds the Answer
The search finds passages one at a time. A question whose answer is spread over many places of a document, such as "how does the argument develop", finds parts of it at best.

## The Question Looks Like Its Answer
The search by words and the search by meaning both compare the question with the passages: by shared words or by closeness of meaning. A question put in other terms than the documents' can miss what a reader would find, by words especially. A question in the terms of the field does better than a vague one.

## English, for the Search by Words
The search by words reduces words to their English stems and drops English stop words. A collection in another language is still searched, but only by the exact forms of its words, and leans more on the search by meaning, as far as the embedding model knows that language.

## The Same Embedding Model Throughout
Vectors of different models cannot be compared. A question is embedded with the model that made the index; if that model cannot be used, the page falls back on the search by words and says why.

## The Index Is as Recent as Its Last Build
A collection's index holds the documents as they were when **Build the Index** last ran. A file changed or added after that is not searched until the index is built again.

## What Leaves the Computer
A local embedding model, reranker and answering model keep everything on this computer. A **Cloud** answering model is sent the question and the passages found.

## See Also
- [Diagnostics](diagnostics.md) · [Overview](overview.md) · [Decision Guide](decision-guide.md)
