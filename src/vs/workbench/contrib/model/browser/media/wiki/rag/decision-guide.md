# Decision Guide

| Situation | Choice |
|---|---|
| Questions about Pollis or Julia | **Ask Pollis**, which has its own index of them |
| Questions about your own documents | A **Collection** here |
| The answer needs counts or comparisons across documents | A table and a query, not this |
| Short, self-standing paragraphs (notes, documentation) | A shorter **Passage Length**: 100 to 200 words |
| Connected argument (papers, books) | A longer **Passage Length**: 300 to 500 words |
| Not sure | 250 words, then look at the passages |
| The right passage is found, too far down | **Rerank** |
| The right passage is not found at all | Not reranking: another length or **Embedding Model** |
| Private documents | Local models throughout |
| A hard question over passages already right | A stronger **Answering Model**, local or **Cloud** |

## Decision Flow

1. **Can the question be answered from a paragraph or two?** If not, a table and a query, or reading the document, will serve better.
2. **Are the passages cut well?** Read some under **Chunking** before anything else; every later step depends on them.
3. **Is the right passage found?** Search questions you know the answers to. If not, change the length or the embedding model.
4. **Is it found near the top?** If not, search for more passages, 30 say, and **Rerank** to keep the best.
5. **Is the answer faithful to it?** If not, change the answering model.

## Words, Meaning or Both
The page always uses both when it can, since they fail differently. The search by words ([Robertson and Zaragoza (2009)](#ref-RZ2009a)) misses a paraphrase; the search by meaning ([Reimers and Gurevych (2019)](#ref-RG2019a)) can miss an exact name or code it has no sense of. Neither is switched off here. The search by meaning alone is measured in **Evaluate Embedding Models**.

## Reranking or Not
A reranker costs time on every question, in proportion to the passages it reads, and memory for one model more. It is worth it when a collection has many similar passages, such as a set of papers on one topic. It adds little when the first passages are already right, and cannot help when the right one was not found.

## What the Retrieval-Augmented Generation Page Does Not Do
Other ways of retrieving, which the Retrieval-Augmented Generation page does not use:
- **Late interaction**: comparing each word of the question with each word of a passage rather than one vector with one vector, as ColBERT does ([Khattab and Zaharia (2020)](#ref-KZ2020a); [Santhanam, Khattab, Saad-Falcon, Potts and Zaharia (2022)](#ref-SKSPZ2022a)). It keeps a vector for each word of a passage, so it takes more space than one vector a passage.
- **Approximate search**: an index such as HNSW ([Malkov and Yashunin (2020)](#ref-MY2020a)), which finds near vectors without comparing the question with every passage, for collections of millions of passages, at the risk of missing some. The Retrieval-Augmented Generation page compares the question with every passage, so it never misses the nearest, and takes longer the larger the collection.
- **Knowledge graphs**: extracting entities and their relations from the documents, for questions that join facts from many places.

## References

<a id="ref-KZ2020a"></a>Khattab, O. and Zaharia, M. (2020). ColBERT: efficient and effective passage search via contextualized late interaction over BERT. *SIGIR*. [arXiv:2004.12832](https://arxiv.org/abs/2004.12832)

<a id="ref-MY2020a"></a>Malkov, Y. A. and Yashunin, D. A. (2020). Efficient and robust approximate nearest neighbor search using hierarchical navigable small world graphs. *IEEE Transactions on Pattern Analysis and Machine Intelligence* 42(4), 824–836. [doi:10.1109/TPAMI.2018.2889473](https://doi.org/10.1109/TPAMI.2018.2889473)

<a id="ref-RG2019a"></a>Reimers, N. and Gurevych, I. (2019). Sentence-BERT: sentence embeddings using Siamese BERT-networks. *EMNLP*. [arXiv:1908.10084](https://arxiv.org/abs/1908.10084)

<a id="ref-RZ2009a"></a>Robertson, S. and Zaragoza, H. (2009). The probabilistic relevance framework: BM25 and beyond. *Foundations and Trends in Information Retrieval* 4(1–2), 1–174. [doi:10.1561/1500000019](https://doi.org/10.1561/1500000019)

<a id="ref-SKSPZ2022a"></a>Santhanam, K., Khattab, O., Saad-Falcon, J., Potts, C. and Zaharia, M. (2022). ColBERTv2: effective and efficient retrieval via lightweight late interaction. *NAACL*. [arXiv:2112.01488](https://arxiv.org/abs/2112.01488)

## See Also
- [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Interpretation](interpretation.md)
