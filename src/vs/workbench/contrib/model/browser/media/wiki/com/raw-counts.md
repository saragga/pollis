# Raw Counts

The raw matrix holds the evidence that every weighting builds on. Its settings decide what counts as a co-occurrence, and those decisions carry through to all later results.

## What a Cell Counts

C(w, c) is the number of times word c falls inside the window around word w, summed across documents. A window of 2 covers two tokens on each side. The code passes `mode = :directional`, so that each pair of positions is counted once, and the matrix returned is still symmetric. Counts stop at document boundaries, so that sentence splits matter. [Manning and Schütze (1999)](#ref-MS1999a) treat collocations and windows in depth. **Top Co-Occurring Pairs** lists the largest cells, once per pair.

## What Preprocessing Changes

Stopwords and punctuation are removed before counting, so a window spans only the remaining words. Two words separated by "of the" count as neighbours. Keeping stopwords would fill the matrix with high counts for words carrying little meaning. Lowercasing merges "Bank" and "bank", and it also loses any difference between a name and a common word. No stemming is applied, so "drinks" and "drink" stay separate. A different stopword list can change the vocabulary noticeably, so state it in any report.

## How Window Size Changes What Is Measured

A narrow window finds words that fill the same grammatical slot, so that neighbours tend to be similar in kind. A wide window finds words from the same topic, so that neighbours tend to be merely associated. [Levy, Goldberg and Dagan (2015)](#ref-LGD2015a) show that such settings can matter as much as the choice of algorithm. **Compare Window Sizes** runs windows of 1, 2 and 5. On very short sentences, a wide window soon reaches the whole sentence, and larger values then add nothing.

## How Distance Weighting Works

Under **Distance Weighting**, None (Counts) gives each pair in the window a weight of 1. Harmonic (1/d) gives a weight of 1/d to words d positions apart, through the `normalize` keyword of `CooMatrix`. Nearby words then count for more, and a wide window does less harm. Cells stop being whole numbers, so that **Top Co-Occurring Pairs** shows fractions. PMI still runs on those values, although the probability reading becomes looser, since each is now a share of total weight.

## Why Raw Counts Make Weak Vectors

Cosine ignores vector length, but not the direction set by frequent contexts. Rows of raw counts lean toward the most common words, so words can look similar only because both occur near one frequent word. The problem shrinks with stopword removal, and it does not vanish. **Nearest Neighbours** prints the raw and PPMI results together, which makes the difference easy to see. [Bullinaria and Levy (2007)](#ref-BL2007a) compare count-based measures on semantic tasks, and report good results from positive PMI.

## What the Minimum Count Does

**Minimum Count** removes words seen fewer than that many times, using the corpus count after preprocessing. A rare word's row has too little evidence to mean much, and weighting tends to exaggerate it. A higher value gives a smaller, denser matrix. It also makes a query word fail if the word falls below the limit, as `neighbours` then reports that it is not in the vocabulary. **Matrix Sparsity** shows how many words were kept, and names any left with no context.

## References

<a id="ref-BL2007a"></a>Bullinaria, J. A. and Levy, J. P. (2007). Extracting semantic representations from word co-occurrence statistics: a computational study. *Behavior Research Methods* 39(3), 510–526. [doi:10.3758/BF03193020](https://doi.org/10.3758/BF03193020)

<a id="ref-LGD2015a"></a>Levy, O., Goldberg, Y. and Dagan, I. (2015). Improving distributional similarity with lessons learned from word embeddings. *Transactions of the Association for Computational Linguistics* 3, 211–225. [doi:10.1162/tacl_a_00134](https://doi.org/10.1162/tacl_a_00134)

<a id="ref-MS1999a"></a>Manning, C. D. and Schütze, H. (1999). *Foundations of Statistical Natural Language Processing*. MIT Press. [nlp.stanford.edu/fsnlp](https://nlp.stanford.edu/fsnlp/)

## See Also

- [Factsheet](factsheet.md) · [PMI](pmi.md) · [PPMI](ppmi.md) · [Decision Guide](decision-guide.md)
