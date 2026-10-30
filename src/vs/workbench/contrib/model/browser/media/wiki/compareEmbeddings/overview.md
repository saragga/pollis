# Evaluate Embedding Models — Overview

Ask Pollis answers from a few passages, so a passage that is not found cannot help, however good the answering model. Passages are found in two ways: by their words, with BM25 ([Robertson and Zaragoza (2009)](#ref-RZ2009a)), and by their meaning, with the cosine between the embeddings of the question and of each passage ([Reimers and Gurevych (2019)](#ref-RG2019a)). The two lists are fused by reciprocal rank fusion ([Cormack, Clarke and Büttcher (2009)](#ref-CCB2009a)). The embedding model decides the second list, and Evaluate Embedding Models measures what difference it makes.

## Choosing the Embedding Models to Compare
Step 1, **Models**, lists the embedding models on this computer, with their sizes. Evaluate Embedding Models runs them on this computer only, and they are downloaded in Compose > Local Models. Any number of embedding models can be compared in one run. Include the model in use: **In Use** marks it in **Results**, and it gives the others something to beat.

## Choosing the Questions to Search
Step 2, **Questions**, shows the test sets of Evaluate Answering Models, so that both pages can be compared on the same questions: each question with the passage it was made from. Tick the questions to search; with none ticked, **Run** searches them all. **Standard** comes with Pollis. Your own test sets are made and changed in Evaluate Answering Models, which **Change the Test Sets...** opens.

## Running the Search With Each Embedding Model
Step 3, **Run**, takes each model chosen, one after the other and alone in memory. A model first embeds the passages it has not embedded yet, which takes some minutes the first time, and then searches each question. Each passage is embedded once by each model, ever: a later run, and the index of Ask Pollis, take the embeddings from ~/.pollis/documents/embeddings.duckdb. **Stop** ends a run and keeps the passages embedded until then for the next run. The charts follow the free memory during a run.

## Reading the Results and Using a Model
Step 4, **Results**, has a column for each model, the best first by how often it found the passage and then by its place. The part **Questions** shows each question with the place of its passage for each model. **Use for Ask Pollis**, under each model but the one in use, sets that embedding model and its prefixes for Ask Pollis. The index of Ask Pollis is then made again, and the passages the run embedded are not embedded again. Earlier runs of Evaluate Embedding Models stay available under **Run**, and **Delete Run** removes one.

## A Typical Evaluation of Embedding Models
1. Choose the model in use and one or two others, of different sizes.
2. Tick about twenty questions of the **Standard** test set for a first look.
3. **Run**, which takes longest the first time, while the passages are embedded.
4. Compare **Found** and **Place**, then **Found by Meaning** and **Place by Meaning**.
5. Weigh a gain in finding against **Memory** and the size of the index.
6. **Use for Ask Pollis** on the model chosen.

## References

<a id="ref-CCB2009a"></a>Cormack, G. V., Clarke, C. L. A. and Büttcher, S. (2009). Reciprocal rank fusion outperforms Condorcet and individual rank learning methods. *SIGIR*, 758–759. [doi:10.1145/1571941.1572114](https://doi.org/10.1145/1571941.1572114)

<a id="ref-RG2019a"></a>Reimers, N. and Gurevych, I. (2019). Sentence-BERT: sentence embeddings using Siamese BERT-networks. *EMNLP*. [arXiv:1908.10084](https://arxiv.org/abs/1908.10084)

<a id="ref-RZ2009a"></a>Robertson, S. and Zaragoza, H. (2009). The probabilistic relevance framework: BM25 and beyond. *Foundations and Trends in Information Retrieval* 4(1–2), 1–174. [doi:10.1561/1500000019](https://doi.org/10.1561/1500000019)

## See Also
- [Factsheet](factsheet.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
