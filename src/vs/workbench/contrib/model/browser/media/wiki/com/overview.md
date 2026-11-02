# Overview

A co-occurrence matrix records which words appear near which other words. Its rows can serve as word vectors, so that words used in similar settings come out as similar.

## What the Distributional Idea Says

Words with similar meanings tend to occur in similar contexts. [Harris (1954)](#ref-Har1954a) argued that distribution reflects differences in meaning, and that idea underlies most word vectors. Nobody tells the method what a word means. Counts alone place "coffee" near "tea", provided that both follow "drinks" and "cup of". The method therefore captures relatedness through use, which can include opposites and words from one topic, as well as true synonyms.

## How a Matrix Is Built from Text

The steps in the code are:

1. Lowercase the text, and remove punctuation, numbers and stopwords.
2. Keep words seen at least **Minimum Count** times.
3. Slide a window of **Window Size** tokens over each document.
4. Add to the cell for each pair of words inside the window.

The result is a square, sparse and symmetric matrix `C`, with one row and one column per kept word. `CooMatrix` from `TextAnalysis.jl` does the counting.

## Why Raw Counts Need Weighting

A frequent word appears next to everything, so raw counts mostly reflect frequency, and only weakly reflect association. Weighting asks a different question: does this pair occur more often than chance predicts? Pointwise mutual information answers that, as in [Church and Hanks (1990)](#ref-CH1990a). Its positive version usually does best as a word vector, and the three tabs let the two weightings be compared with the counts.

## How the Three Tabs Differ

| Tab | Cell value | Unobserved pair |
|---|---|---|
| **Raw Counts** | C(w, c) | 0 |
| **PPMI** | max(PMI(w, c), 0) | 0 |
| **PMI** | log p(w, c) / (p(w) p(c)) | Left empty |

All three use the same counts, and set `W` differently. The neighbours printed by each tab are cosine similarities between rows of `W`.

## What the Built-In Corpus Contains

The default **Corpus** is `docs`, 26 short sentences on drinks, pets, finance and rivers. Many sentences come in matched pairs, such as one on coffee and one on tea, so similarity is easy to find on purpose. "Bank" occurs in two senses, to show that one row must cover both. Replacing `docs` with a vector of real text is the next step.

## A Common Workflow for Studying Word Vectors

1. Run **Raw Counts**, then read the neighbours of **Query Word**.
2. Use **Matrix Sparsity** to check how much survived.
3. Switch to **PPMI**, and use **Raw vs. PPMI** to see what weighting changes.
4. Use **Compare Window Sizes** and **Context Smoothing** to test settings.
5. Use **PMI Interpretation** and **Word Vector** to explain a result.

Then replace **Corpus** with real text, and repeat the steps.

## References

<a id="ref-CH1990a"></a>Church, K. W. and Hanks, P. (1990). Word association norms, mutual information, and lexicography. *Computational Linguistics* 16(1), 22–29. [aclanthology.org/J90-1003](https://aclanthology.org/J90-1003/)

<a id="ref-Har1954a"></a>Harris, Z. S. (1954). Distributional structure. *Word* 10(2–3), 146–162. [doi:10.1080/00437956.1954.11659520](https://doi.org/10.1080/00437956.1954.11659520)

## See Also

- [Factsheet](factsheet.md) · [Raw Counts](raw-counts.md) · [PPMI](ppmi.md) · [PMI](pmi.md)
