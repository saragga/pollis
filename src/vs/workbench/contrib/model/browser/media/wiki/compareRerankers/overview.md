# Evaluate Reranking Models — Overview

Ask Pollis gives the answering model a few passages, 8 unless the setting `pollis.ask.passages` says otherwise. With a reranker set in Set Active Models, it first finds three times as many, by words and meaning, and the reranker keeps the best of them. A reranker reads the question and a passage together, which judges their fit more closely than comparing their embeddings, and costs a run of the model for every passage ([Nogueira and Cho (2019)](#ref-NC2019a)). Evaluate Reranking Models measures what that buys.

## Choosing the Rerankers to Compare
Step 1, **Models**, lists the rerankers on this computer, with their sizes, and any number can be compared in one run. Rerankers are downloaded in Compose > Local Models, like the other local models. Every run also measures **No Reranker**, the passages in the order the search found them, which is what Ask Pollis gives when no reranker is set: a reranker earns its place only by doing better than that order.

## Choosing the Questions to Rerank
Step 2, **Questions**, shows the test sets of Evaluate Answering Models, the same ones Evaluate Embedding Models uses, each question with the passage it was made from. Tick the questions to run; with none ticked, **Run** takes them all. **Standard** comes with Pollis, and **Change the Test Sets...** opens Evaluate Answering Models, where test sets of your own are made and changed.

## Running the Rerankers on the Same Passages
Step 3, **Run**, first finds the passages of each question once, with the embedding model of Ask Pollis, as Ask Pollis finds them with a reranker set. Passages found before for the same question, with the same index and embedding model, are taken again, as Evaluate Answering Models takes them. Each reranker chosen then runs alone in memory, one after the other, and puts the same passages in its order, so every difference between the rerankers is the rerankers' own. **Stop** ends a run, and the questions reranked until then are shown. The charts follow the free memory during a run.

## Reading the Results and Using a Reranker
Step 4, **Results**, has a column for each reranker and for No Reranker, the best first by how often the passage is among those Ask Pollis gives, then by its place. A line above the table says for how many questions the passage was among those found at all, which no reranker can exceed. The part **Questions** shows each question with the place of its passage in the order of each reranker. **Use for Ask Pollis** sets that reranker, or none, for Ask Pollis. Earlier runs stay under **Run**, and **Delete Run** removes one.

## A Typical Evaluation of Rerankers
1. Choose one or two rerankers of different sizes; No Reranker is always measured.
2. Tick about twenty questions of the **Standard** test set for a first look.
3. **Run**.
4. Compare **Found** with that of No Reranker, then **Place**.
5. Weigh a gain in Found against **Reranking, ms** and **Memory**.
6. **Use for Ask Pollis** on the reranker chosen, or on No Reranker.

## References

<a id="ref-NC2019a"></a>Nogueira, R. and Cho, K. (2019). Passage re-ranking with BERT. [arXiv:1901.04085](https://doi.org/10.48550/arXiv.1901.04085)

## See Also
- [Factsheet](factsheet.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
