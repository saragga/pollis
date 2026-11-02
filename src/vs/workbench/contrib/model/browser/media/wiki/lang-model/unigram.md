# Unigram Model

A unigram model gives each word a probability that ignores all context. It is the simplest language model, and it sets a floor that any model with context has to beat.

## Estimating word probabilities

The maximum likelihood estimate is P(w) = count(w) / N, the share of tokens that are w. These fractions sum to 1 over the vocabulary, and they maximise the probability of the training text among all models of this form.

The code stores the counts in `unigrams`, the total in `N` and the vocabulary size in `V`. Its function `prob(w)` applies add-k: (count(w) + k) / (N + kV). For "the cat sat on the mat" with k = 1, the probabilities are 3 / 11 for "the" and 2 / 11 for each other word, and these sum to 1.

## A bag of words

Independence means a sentence's probability is the product of its words' probabilities, so word order has no effect at all. "Dog bites man" and "man bites dog" get exactly the same score.

Generated text shows the limit directly: draw words from a unigram model and you get a stream of common words with no syntax. That is a poor model of English, but a surprisingly useful one for tasks that depend on which words appear rather than how they connect, such as language identification, spam filters and retrieval. A topic model works on the same bag-of-words view.

## Smoothing at this level

Sparsity is mild here, because there are only V parameters and N is usually far larger. If N = 100,000 and V = 10,000, a word seen 100 times has P = 0.001 under maximum likelihood and 101 / 110,000 ≈ 0.00092 under add-1, which is a small change.

Add-1 does shift mass towards the rare words, however. In that example it moves about 9% of the probability, since each of the 10,000 words gets 1 extra from a new total of 110,000. A smaller k keeps the rare words from being oversold. Words not in the training text still receive a floor of k / (N + kV), about 9 in a million here.

## What a unigram model gives you

The **Unigram** tab is the only one with a working probability function in its code, and **Perplexity**, **Sentence Probability** and **Compare Smoothing** all build on the same formula. It gives a baseline in seconds with a simple, stable estimate, and its perplexity tells you how much of the text's uncertainty word frequency alone explains.

Any gain from adding context is measured against this baseline. A bigram that fails to beat it on held-out text has too few counts or bad smoothing, and a large gain means that local word order carries real information in your text.

## See Also

- [Factsheet](factsheet.md) · [Overview](overview.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
- [Bigram](bigram.md) · [Trigram](trigram.md)
