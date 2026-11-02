# Decision Guide

Choices concern the weighting, the window and the minimum count, and whether counting is enough at all. Settings matter as much as the method, so they should be chosen for the task.

## Which Tab Fits the Purpose

| Purpose | Tab | Why |
|---|---|---|
| Inspect the evidence, or feed another weighting | **Raw Counts** | Exact counts |
| Word vectors for similarity | **PPMI** | Sparse, reliable and non-negative |
| Find collocations, study associations | **PMI** | Signed strength of a pair |
| Word vectors with below-chance information | **PMI**, on a large corpus | Needs data to trust negatives |

Start with **PPMI** for vectors. Use **Raw Counts** to check what lies behind a result.

## How to Choose the Window Size

Choose a narrow window, 1 to 2, for words of a similar type or function. Choose a wide window, 5 to 10, for topic-related words. [Levy, Goldberg and Dagan (2015)](#ref-LGD2015a) treat window size as a setting to tune for the task, and report that no one value suits all. Try several with **Compare Window Sizes**, keeping other settings fixed. For a short-sentence corpus, wide windows add little, so a change in value may have no effect.

## How to Choose the Minimum Count and Smoothing

Raise **Minimum Count** until rare-word noise fades, without losing the words of interest. On small corpora 2 is sensible, and large corpora often use 5 to 100. Keep **Context Smoothing** at 0.75 unless there is a reason to change it, as it has a good record and small cost. Use 1 if a true chance baseline matters, as with collocation scores. Set **Distance Weighting** to Harmonic (1/d) when using a wide window, as the near words should then count for more.

## When to Use Other Association Scores

PMI answers "how surprising is the pair?". Other scores answer other questions. A log-likelihood ratio or a t-score takes account of the evidence, and so favours common, well-supported pairs. Normalised PMI bounds the range, so that values can be compared. tf-idf weights words by document, not by word pair. For finding collocations, [Manning and Schütze (1999)](#ref-MS1999a) compare several measures, which often rank pairs differently. The choice follows from whether strength or reliability matters more.

## When to Move Beyond Count Vectors

Stay with count vectors for small or specialised corpora, for transparency, and for a baseline. Reduce the dimension with a truncated SVD to get dense vectors that generalise, as in latent semantic analysis. Use trained embeddings, such as word2vec or GloVe, or pretrained ones, when the vocabulary is large and the corpus is general. Use contextual models such as BERT when a word's sense matters. Compare with a PPMI baseline first, since the gain may be smaller than expected.

## What to Report from a Co-Occurrence Study

Report the corpus and its size, preprocessing steps and stopword list, window, weighting, alpha and minimum count. State the vocabulary size and density. Give neighbours with their cosines, and say how results changed under other settings. Where possible, use a benchmark in place of hand-picked examples, and report coverage. Note any corpus features that shape the outcome, such as genre, period and language. Conclusions apply to the text studied, and should not be stated as facts about word meaning in general.

## References

<a id="ref-LGD2015a"></a>Levy, O., Goldberg, Y. and Dagan, I. (2015). Improving distributional similarity with lessons learned from word embeddings. *Transactions of the Association for Computational Linguistics* 3, 211–225. [doi:10.1162/tacl_a_00134](https://doi.org/10.1162/tacl_a_00134)

<a id="ref-MS1999a"></a>Manning, C. D. and Schütze, H. (1999). *Foundations of Statistical Natural Language Processing*. MIT Press. [nlp.stanford.edu/fsnlp](https://nlp.stanford.edu/fsnlp/)

## See Also

- [Factsheet](factsheet.md) · [Overview](overview.md) · [PPMI](ppmi.md) · [Assumptions](assumptions.md)
