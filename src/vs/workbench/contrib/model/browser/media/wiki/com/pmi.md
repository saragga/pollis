# PMI

Pointwise mutual information compares how often two words occur together with how often chance alone would bring them together.

## What PMI Measures

For a word w and a context c:

- PMI(w, c) = log( p(w, c) / (p(w) p(c)) )

If the two were independent, the ratio would be 1 and PMI would be 0. A positive value means more often than chance, and a negative value less often. [Church and Hanks (1990)](#ref-CH1990a) proposed this measure for word association in lexicography. Because the log is natural in the code, exp(PMI) is the number of times more often than chance, which **PMI Interpretation** prints beside each value.

## How the Code Estimates the Probabilities

`pmi_matrix` works on the observed cells. Let total be the sum of all cells:

- p(w, c) = C(w, c) / total
- p(w) = row sum / total
- p(c) = (column sum)^alpha / sum of (column sums)^alpha

All are plain plug-in estimates, with no correction for small samples, and with **Context Smoothing** as alpha. At alpha = 1, the last line is the ordinary marginal, and the matrix stays symmetric. At other values, rows and columns are treated differently, so P[i, j] and P[j, i] can differ.

## Why PMI Favours Rare Words

Rare pairs get large values easily. Suppose that two rare words occur only together: p(w, c) is then about equal to each marginal, so PMI is about −log p(w), which grows as the words get rarer. A pair seen once may outrank a strongly linked common pair, and that single case can be chance. PMI measures the strength of association, and takes no account of the evidence for it. **Minimum Count** and context smoothing both reduce the effect. [Manning and Schütze (1999)](#ref-MS1999a) discuss the same weakness.

## How Context Smoothing Reduces the Bias

Raising context counts to the power alpha below 1 lifts the probability of rare contexts relative to common ones. A larger p(c) gives a smaller PMI with those rare contexts. [Levy, Goldberg and Dagan (2015)](#ref-LGD2015a) carried that idea over from word2vec, and found that 0.75 helps count-based methods as well. The action **Context Smoothing** shows the top pairs at alpha = 1 and at the chosen value, with the corpus count of each word, so that the shift away from rare words can be seen.

## What Happens with Unobserved Pairs

An unobserved pair has p(w, c) = 0, and its PMI is minus infinity. The code leaves such cells empty, in place of that value. An empty cell then reads as 0 in a sparse matrix, and 0 means "at chance". So `neighbours`, which turns `W` into a dense matrix, treats an unseen pair as neutral. A cell of small negative PMI thus sits below an unseen pair, even though the true PMI of the unseen pair may be far lower. That oddity is one reason to prefer PPMI for vectors.

## How Far to Trust Negative Values

A negative value says that a pair occurs less often than chance. Showing that well requires much data, since the expected count must be high enough for a low count to be meaningful. A small corpus cannot do so, and any negative values mostly reflect how few times each word appeared. **PMI Interpretation** lists the "least above or below chance" associations, which should be read with that in mind. On the **PMI** tab, those values also enter the neighbours, so noisy negatives affect the similarity.

## References

<a id="ref-CH1990a"></a>Church, K. W. and Hanks, P. (1990). Word association norms, mutual information, and lexicography. *Computational Linguistics* 16(1), 22–29. [aclanthology.org/J90-1003](https://aclanthology.org/J90-1003/)

<a id="ref-LGD2015a"></a>Levy, O., Goldberg, Y. and Dagan, I. (2015). Improving distributional similarity with lessons learned from word embeddings. *Transactions of the Association for Computational Linguistics* 3, 211–225. [doi:10.1162/tacl_a_00134](https://doi.org/10.1162/tacl_a_00134)

<a id="ref-MS1999a"></a>Manning, C. D. and Schütze, H. (1999). *Foundations of Statistical Natural Language Processing*. MIT Press. [nlp.stanford.edu/fsnlp](https://nlp.stanford.edu/fsnlp/)

## See Also

- [Factsheet](factsheet.md) · [PPMI](ppmi.md) · [Raw Counts](raw-counts.md) · [Interpretation](interpretation.md)
