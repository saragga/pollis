# Trigram Model

A trigram model predicts each word from the previous two. Two words of context can separate meanings that one word cannot, but the counts run out fast, so back-off or interpolation becomes essential.

## Two words of context

The estimate is P(w given u v) = count(u v w) / count(u v). A second word can disambiguate: after "bank", many words are possible, but "river bank" and "savings bank" lead to different followers.

The price shows on the toy text. Each of the four trigrams in "the cat sat on the mat" occurs once, so P(sat given the cat) = 1 / 1 = 1. That estimate rests on a single observation, and it says the model has seen nothing else follow "the cat", not that nothing else can. Near-certain probabilities based on one count are the typical trigram overfit.

## What the code gives you

The **Trigram** tab builds `trigrams`, `bigrams` and `unigrams` and stops, as its code comment says, at the point where back-off or interpolation would begin. **Smoothing k** is not used, and no conditional probability is defined.

From N tokens the flattened list yields N − 2 trigrams. No action reads the trigram table except **Compare Orders**, which builds it and prints no score. Any evaluation of the **Trigram** tab therefore needs your own short loop over `test_tokens`, using overlapping triples and a suitable fallback when a context has not been seen.

## Sparsity in numbers

With V = 10,000 there are 10¹² possible trigrams. A million-token corpus holds at most 10⁶ of those, or one in a million. Many valid trigrams in new text will have never been seen, and the context u v itself may be unseen as well, so the formula becomes 0 / 0.

The zero-count pairs therefore form two different cases. An unseen trigram with a seen context can be smoothed, whereas an unseen context says the model has no trigram evidence at all and must use something else. Add-k gives a uniform distribution in that second case, however, throwing away what lower orders know. That is why simple smoothing fails so badly here.

## Interpolation

Linear interpolation always mixes the three orders: P = λ₃ P(w given u v) + λ₂ P(w given v) + λ₁ P(w), with the λ values summing to 1.

With λ = (0.6, 0.3, 0.1) and component estimates 0, 0.2 and 0.01, the result is 0 + 0.06 + 0.001 = 0.061, which is non-zero even though the trigram was never seen. The weights are fitted on held-out text, not on the training text, because training text would always favour the highest order. Letting the weights depend on the context's count improves results further, a family studied by [Chen and Goodman (1999)](#ref-CG1999a).

## Back-off

Back-off uses the highest order that has evidence, and falls to a lower one otherwise. If the trigram has been seen, a discounted trigram estimate is used. If not, the method drops to the bigram scaled by a weight, and from there to the unigram.

The scheme from [Katz (1987)](#ref-Kat1987a) discounts seen counts with Good-Turing, which frees up mass for lower orders so that the result is still a proper distribution. Interpolation always mixes, whereas back-off switches, and in many comparisons the two perform similarly. A cheap variant, stupid back-off, ignores normalisation and uses fixed penalties, which suits very large corpora.

## Is the third word worth it?

Trigrams paid off in classic speech recognition, where large corpora were available and a model's job was to rank word sequences. On a small corpus, a well-smoothed bigram often has lower held-out perplexity than a poorly smoothed trigram.

Measure rather than assume. Fit interpolated bigram and trigram models on the same text and compare them on the same `test_tokens`. Going beyond three words needs much larger corpora, and storage grows fast. Most of the time, that is the point at which a neural model starts to make sense.

## References

<a id="ref-CG1999a"></a>Chen, S. F., & Goodman, J. (1999). An Empirical Study of Smoothing Techniques for Language Modeling. *Computer Speech & Language* 13(4), 359-393. [doi:10.1006/csla.1999.0128](https://doi.org/10.1006/csla.1999.0128)

<a id="ref-Kat1987a"></a>Katz, S. M. (1987). Estimation of Probabilities from Sparse Data for the Language Model Component of a Speech Recognizer. *IEEE Transactions on Acoustics, Speech, and Signal Processing* 35(3), 400-401. [doi:10.1109/TASSP.1987.1165125](https://doi.org/10.1109/TASSP.1987.1165125)

## See Also

- [Factsheet](factsheet.md) · [Overview](overview.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
- [Unigram](unigram.md) · [Bigram](bigram.md)
