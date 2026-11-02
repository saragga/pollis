# PPMI

Positive PMI keeps the above-chance associations, and sets the rest to zero. The result is a sparse, non-negative matrix, and it is the usual count-based choice for word vectors.

## What the Transformation Does

PPMI(w, c) = max(PMI(w, c), 0). Unobserved pairs and below-chance pairs share a value of zero. The code applies `max.(vals, 0.0)`, then `dropzeros` to keep the matrix sparse. [Bullinaria and Levy (2007)](#ref-BL2007a) found that positive PMI with cosine similarity performed strongly across several semantic tasks. On the **PPMI** tab, `W` holds this matrix, and most actions that rely on weighted vectors compute it again for themselves.

## Why Dropping Negatives Helps

Negative values are unreliable, because they need far more data than positive ones. Knowing that a word pair attracts is also more informative than knowing that it repels, since most pairs are unrelated anyway. Removing them drops noise, and it avoids the problem of an unseen pair ranking above a pair seen less often than chance. A cost remains: PPMI has no way of saying that two words actively avoid each other. For word similarity, that cost is small, as [Jurafsky and Martin (2024)](#ref-JM2024a) explain in their treatment of vector semantics.

## How Cosine Reads PPMI Vectors

Each row is a vector, one per word, whose components are contexts. Cosine similarity is the dot product over the product of lengths, so that frequent words with long vectors do not dominate. With non-negative values, cosines run from 0 to 1. A cosine of 0 means no shared contexts, and a value near 1 means nearly the same pattern of contexts. **Word Similarity Plot** draws these for the top 20 words, and **Word Vector** lists one row. A word's own row is excluded when `neighbours` ranks.

## How Vectors Compare with Learned Embeddings

Sparse PPMI vectors are long and exact: each dimension is a named context. Dense vectors from a factorisation or a neural method are short, and generalise across contexts that never co-occurred directly. [Landauer and Dumais (1997)](#ref-LD1997a) applied a truncated factorisation in latent semantic analysis. [Levy, Goldberg and Dagan (2015)](#ref-LGD2015a) show that well-tuned count-based vectors can come close to learned ones, so that much of the gap lies in settings. On a small corpus, the panel's sparse rows stay easy to read.

## How a Sentence Becomes a Vector

**Apply to New Sentence** preprocesses a sentence, keeps the words in the vocabulary, averages their PPMI rows, and finds the closest words by cosine. Words outside the vocabulary are ignored, and the action prints which ones it kept. Averaging loses word order altogether. A single frequent word can dominate if it has a long row. Change `new_text` in the code to test another sentence. The result is a rough sentence representation, useful for intuition, and it says nothing about what the sentence claims.

## Where PPMI Is Strong and Weak

PPMI vectors are cheap, transparent and hard to beat as a baseline. Every number traces to a count, and the settings are few. A word in two senses, such as "bank", still gets one row that blends them, and the neighbours may come from either sense. Long, sparse rows also lack generalisation, as two words with no shared context have a cosine of 0 even when they are related. A corpus must be reasonably large before the values settle.

## References

<a id="ref-BL2007a"></a>Bullinaria, J. A. and Levy, J. P. (2007). Extracting semantic representations from word co-occurrence statistics: a computational study. *Behavior Research Methods* 39(3), 510–526. [doi:10.3758/BF03193020](https://doi.org/10.3758/BF03193020)

<a id="ref-JM2024a"></a>Jurafsky, D. and Martin, J. H. (2024). *Speech and Language Processing*, 3rd ed., draft. [web.stanford.edu/~jurafsky/slp3](https://web.stanford.edu/~jurafsky/slp3/)

<a id="ref-LD1997a"></a>Landauer, T. K. and Dumais, S. T. (1997). A solution to Plato's problem: the latent semantic analysis theory of acquisition, induction, and representation of knowledge. *Psychological Review* 104(2), 211–240. [doi:10.1037/0033-295X.104.2.211](https://doi.org/10.1037/0033-295X.104.2.211)

<a id="ref-LGD2015a"></a>Levy, O., Goldberg, Y. and Dagan, I. (2015). Improving distributional similarity with lessons learned from word embeddings. *Transactions of the Association for Computational Linguistics* 3, 211–225. [doi:10.1162/tacl_a_00134](https://doi.org/10.1162/tacl_a_00134)

## See Also

- [Factsheet](factsheet.md) · [PMI](pmi.md) · [Raw Counts](raw-counts.md) · [Decision Guide](decision-guide.md)
