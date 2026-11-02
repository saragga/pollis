# Statistical Language Model

A statistical language model assigns a probability to a sequence of words, using counts from a body of text. N-grams are the classic form: simple, transparent and still the clearest way to learn how language modelling works.

## Predicting the next word from counts

The basic question is how likely a word is, given what came before it. Writing out the chain rule, the probability of a sentence is a product of such conditional probabilities, each conditioned on all earlier words.

Long histories are almost never repeated in any corpus, so an n-gram model keeps only the last n − 1 words. [Claude E. Shannon (1948)](#ref-Sha1948a) used approximations of this kind for letters and words, and showed that text generated from them looks more and more like English as the order rises. That same trade runs through this panel: more context means better predictions when counts are available, and fewer counts to estimate them with.

## Three orders of context

**Unigram** treats words as independent, so its only knowledge is how common each word is. **Bigram** adds the previous word, and **Trigram** the previous two. Take the toy text "the cat sat on the mat":

| Tab | Example | Estimate from counts |
|---|---|---|
| **Unigram** | P(the) | 2 / 6 ≈ 0.33 |
| **Bigram** | P(cat given the) | 1 / 2 = 0.5 |
| **Trigram** | P(sat given the cat) | 1 / 1 = 1 |

The rising numbers look like growing certainty, but the last rests on one single observation. Separate wikis cover each order: [Unigram](unigram.md), [Bigram](bigram.md) and [Trigram](trigram.md).

## The zero problem

Any finite corpus misses most possible word sequences. Maximum likelihood gives those a probability of 0, and a single zero makes the probability of a whole sentence 0, however natural it is.

Smoothing moves a little probability from seen sequences to unseen ones. **Smoothing k** sets the simplest version, add-k, which adds k to every count. Better methods exist, including discounting, interpolation and back-off, and a long comparison by [Stanley F. Chen and Joshua Goodman (1999)](#ref-CG1999a) showed how much the choice matters. Those methods are described in the [Trigram](trigram.md) and [Decision Guide](decision-guide.md) wikis.

## From counts to the actions

The actions look at the fitted counts from several sides. **Unigram Distribution** and **Top N-grams** show what is frequent, **Perplexity** and **OOV Rate** test the model on held-out text, and **Sentence Probability** and **Next Word Prediction** apply it. **Probability Ratios** finds word pairs that occur together more often than chance.

Scoring actions work on unigram probabilities even when another tab is open, and **Compare Orders** builds the counts but leaves the comparison to you. The [Diagnostics](diagnostics.md) wiki notes how to read each action in that light.

## Why n-grams still matter

Neural language models have replaced n-grams for most text generation, since they can use long context and share strength between similar words. N-grams still train in seconds on a laptop, need no special hardware, and every number in them can be traced to a count.

The ideas also carry over directly. Cross-entropy and perplexity on held-out text are the way large models are evaluated too, and the sparsity issue explains why word embeddings were needed at all. A baseline n-gram model is also a sober test of whether something more elaborate has really learned anything.

## References

<a id="ref-CG1999a"></a>Chen, S. F., & Goodman, J. (1999). An Empirical Study of Smoothing Techniques for Language Modeling. *Computer Speech & Language* 13(4), 359-393. [doi:10.1006/csla.1999.0128](https://doi.org/10.1006/csla.1999.0128)

<a id="ref-Sha1948a"></a>Shannon, C. E. (1948). A Mathematical Theory of Communication. *Bell System Technical Journal* 27(3), 379-423. [doi:10.1002/j.1538-7305.1948.tb01338.x](https://doi.org/10.1002/j.1538-7305.1948.tb01338.x)

## See Also

- [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
- [Unigram](unigram.md) · [Bigram](bigram.md) · [Trigram](trigram.md)
