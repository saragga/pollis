# Diagnostics

Few formal tests apply here. The main checks ask whether the matrix holds enough evidence, whether results survive a change in settings, and whether a word's neighbours make sense.

## How to Check How Much Data the Matrix Holds

**Matrix Sparsity** prints the size of the vocabulary before and after **Minimum Count**, the number of non-zero cells, the density, and any word with no context. Density that is high on a tiny corpus means little. A very low density, in contrast, means that rows barely overlap, so that many cosines are exactly 0. A large drop in vocabulary means that the limit removed much of the text. A word listed as having no context has a row of zeros, and cannot have useful neighbours.

## How to Read the Largest Pairs

**Top Co-Occurring Pairs** lists the largest counts, each pair once with no self pairs, next to its PPMI. Top pairs should look like real phrases or associations. Frequent function words among them mean that the stopword list is too short. A large count with a low PPMI is what a pair of frequent words looks like. The reverse, a small count with a high PPMI, is what rare words look like, and it should be treated with caution, as [Church and Hanks (1990)](#ref-CH1990a) note for small counts.

## How to Test Sensitivity to Settings

Use **Compare Window Sizes** and **Context Smoothing** to see whether neighbours hold steady. Change **Minimum Count** and **Distance Weighting** by hand. Stable neighbours under several settings are more believable than neighbours from one tuned run. Instability often points to too little data. [Levy, Goldberg and Dagan (2015)](#ref-LGD2015a) stress that such settings need tuning and reporting. Avoid choosing settings because a favoured word gets favoured neighbours, as the result will not generalise.

## How to Check Neighbours Against Evidence

For a surprising neighbour, look at **Word Vector** for each of the two words, and see which contexts they share. A similarity resting on one shared context is weak. **Raw vs. PPMI** shows the contexts of a word ranked both ways: one with mostly weak associations has little to offer. Cosine values close together do not establish a meaningful order, so ties deserve less attention. Rows with very few non-zero entries tend to give extreme cosines of 0 or 1.

## How to Handle Common Failures

An error reading "not in the vocabulary" means that **Query Word** was removed, by stopwords or by **Minimum Count**, or that it was not lowercased. Actions that look the word up in `index` directly fail in the same case with a key error. An empty matrix suggests a **Minimum Count** too high for the corpus. **Apply to New Sentence** stops if no word of the sentence is in the vocabulary. **Corpus** must be a vector of strings, as a single string will not behave as intended.

## How to Evaluate on a Real Benchmark

The panel shows neighbours and has no score. A real evaluation compares cosines with human similarity ratings on a standard word-pair list, by rank correlation, or it tests analogy or synonym questions. Words missing from the vocabulary should be counted and reported. [Bullinaria and Levy (2007)](#ref-BL2007a) use tasks of that kind to compare settings. Evaluate at the scale of intended use, as results on a small corpus do not carry over.

## References

<a id="ref-BL2007a"></a>Bullinaria, J. A. and Levy, J. P. (2007). Extracting semantic representations from word co-occurrence statistics: a computational study. *Behavior Research Methods* 39(3), 510–526. [doi:10.3758/BF03193020](https://doi.org/10.3758/BF03193020)

<a id="ref-CH1990a"></a>Church, K. W. and Hanks, P. (1990). Word association norms, mutual information, and lexicography. *Computational Linguistics* 16(1), 22–29. [aclanthology.org/J90-1003](https://aclanthology.org/J90-1003/)

<a id="ref-LGD2015a"></a>Levy, O., Goldberg, Y. and Dagan, I. (2015). Improving distributional similarity with lessons learned from word embeddings. *Transactions of the Association for Computational Linguistics* 3, 211–225. [doi:10.1162/tacl_a_00134](https://doi.org/10.1162/tacl_a_00134)

## See Also

- [Assumptions](assumptions.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
