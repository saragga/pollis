# Interpretation

Output here consists of counts, association scores and similarity scores. Each answers a different question, so it matters to keep them apart.

## How to Read a Count, a PMI and a Cosine

| Value | Question | Range |
|---|---|---|
| Count | How often do these words appear together? | 0 and up |
| PMI | How much more often than chance? | Any real value |
| PPMI | PMI, keeping only the above-chance part | 0 and up |
| Cosine | Do these words have the same contexts? | −1 to 1, 0 to 1 without negatives |

Two words can have a high cosine without ever occurring together. "Coffee" and "tea" share contexts, and may have a low direct count. Association is a first-order link, and similarity is a second-order link.

## How to Read the Nearest Neighbours

Each tab prints the top **Neighbours** words by cosine, with values. High values on a small corpus often rest on few contexts. The neighbours are similar in use, so expect related words, opposites and co-hyponyms, such as other drinks. Treat the list as a description of this corpus. **Nearest Neighbours** compares counts and PPMI side by side, and a change there shows how much of the raw result was driven by frequency. Scores are relative, and have no absolute threshold.

## How to Read PMI Values

**PMI Interpretation** prints PMI and exp(PMI), "times chance". A value of 1.1 means roughly three times as often as chance predicts, as exp(1.1) is about 3. Only observed pairs appear, so a list of "least above or below chance" says nothing on pairs never seen. With **Context Smoothing** below 1, the reference point is no longer strict independence, and "times chance" is a looser description. Values also depend on the corpus size and on how rare the words are, so comparing across corpora needs care.

## How to Read the Heatmaps

**Co-Occurrence Heatmap** shows the current `W` for the 20 most frequent words: bright cells mark large values, and its title stays the same on each tab. Blocks of bright cells show a topic. **Word Similarity Plot** shows cosines between PPMI rows, and its diagonal is always 1. Blocks there show words with shared contexts, which may have no direct link in the first heatmap. Comparing the two figures shows the difference between first-order and second-order links, as discussed by [Turney and Pantel (2010)](#ref-TP2010a).

## How to Read Changes Across Settings

**Compare Window Sizes** lists neighbours per window, with density. A shift from similar kinds of word to topic words suggests the effect of a wider window. On short sentences, the shift may be small. **Context Smoothing** lists the top pairs and the corpus count of each word, written as "(n, m)". If the counts rise as alpha falls below 1, the smoothing has shifted the top pairs away from rare words, as intended.

## What the Results Do Not Say

A similarity does not show that two words mean the same, and an association does not show a causal or factual link. A vector reflects the corpus, including what it leaves out and any bias in its language. On 26 sentences, it reflects how the sentences were written. Differences of small size have no stated uncertainty. [Jurafsky and Martin (2024)](#ref-JM2024a) discuss what vector semantics captures and what it misses, including the biases that such vectors absorb from their text.

## References

<a id="ref-JM2024a"></a>Jurafsky, D. and Martin, J. H. (2024). *Speech and Language Processing*, 3rd ed., draft. [web.stanford.edu/~jurafsky/slp3](https://web.stanford.edu/~jurafsky/slp3/)

<a id="ref-TP2010a"></a>Turney, P. D. and Pantel, P. (2010). From frequency to meaning: vector space models of semantics. *Journal of Artificial Intelligence Research* 37, 141–188. [doi:10.1613/jair.2934](https://doi.org/10.1613/jair.2934)

## See Also

- [Factsheet](factsheet.md) · [Diagnostics](diagnostics.md) · [PPMI](ppmi.md) · [PMI](pmi.md)
