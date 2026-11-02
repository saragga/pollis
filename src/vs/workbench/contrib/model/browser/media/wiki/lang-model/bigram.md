# Bigram Model

A bigram model predicts each word from the one before it. This one word of context is the first step that captures word order, and it also brings the first serious sparsity problem.

## Conditional probabilities from counts

The estimate is P(w given v) = count(v w) / count(v): of all times v occurred, the share followed by w. A sentence's probability then multiplies these along its words, with each word depending only on its neighbour, which is a first-order Markov chain.

From "the cat sat on the mat", the word "the" occurs twice, once before "cat" and once before "mat". So P(cat given the) = 1 / 2 and P(mat given the) = 1 / 2, and every other follower has probability 0. Those followers now reflect structure: nouns follow "the", and verbs do not.

## What the code gives you

The **Bigram** tab builds `bigrams` and `unigrams` and stops there, with no probability function and no use of **Smoothing k**. The conditional probability takes one line, using `get(bigrams, v * " " * w, 0)` for the numerator and `get(unigrams, v, 0)` for the denominator.

Counting runs over the flattened token list, which has N − 1 bigrams from N tokens, including one false pair per document boundary. The only actions that use bigrams are **Next Word Prediction**, **Top N-grams** and **Probability Ratios**. **Perplexity** and **Sentence Probability** keep scoring unigram probabilities here.

## Why add-one fails for bigrams

Add-k per context is P(w given v) = (count(v w) + k) / (count(v) + kV). On the toy text with k = 1 and V = 5: P(cat given the) = 2 / 7 ≈ 0.29 and P(sat given the) = 1 / 7 ≈ 0.14. An unseen pair now has half the probability of a seen one.

A real vocabulary makes it worse. With V = 10,000, a context seen 5 times with one follower seen 3 times has a maximum likelihood estimate of 0.6, but add-1 gives 4 / 10,005 ≈ 0.0004. That one word has lost almost all its probability to 9,999 never-seen followers. Much smaller values of k reduce the damage, but interpolation or discounting serve better, as [Chen and Goodman (1999)](#ref-CG1999a) showed.

## Where bigrams help

Bigrams capture collocations and local syntax, which accounts for a large share of what context can do. Predictive text, simple language identification and spelling correction all gain from them, since "of the" is far more likely than "the of".

Their limit is one word of memory. In "the cat that I saw yesterday is", the verb depends on "cat", yet the bigram sees only "yesterday". Parameters number V² on paper, but only those seen in the text need storing, which makes bigrams cheap. Move to **Trigram** only if held-out perplexity improves with your corpus.

## References

<a id="ref-CG1999a"></a>Chen, S. F., & Goodman, J. (1999). An Empirical Study of Smoothing Techniques for Language Modeling. *Computer Speech & Language* 13(4), 359-393. [doi:10.1006/csla.1999.0128](https://doi.org/10.1006/csla.1999.0128)

## See Also

- [Factsheet](factsheet.md) · [Overview](overview.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
- [Unigram](unigram.md) · [Trigram](trigram.md)
