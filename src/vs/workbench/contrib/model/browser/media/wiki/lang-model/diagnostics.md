# Language Model Diagnostics

A language model can look fine from its counts and still predict poorly. The checks here concern held-out text, unseen words, the size of k and the way the actions relate to the open tab.

## Held-out perplexity

**Perplexity** computes the average of −log2 P(w) over `test_tokens` and raises 2 to that power. A value of 1,000 means that the model is about as uncertain as if it were choosing among 1,000 equally likely words at each step.

Lower is better, but only on the same test tokens with the same preparation. The value must come from text kept out of training, since scoring training text rewards memorising: a high-order model can get close to 1 on its own training text. The action scores unigram probabilities whichever tab is open. To test **Bigram** or **Trigram**, you need your own loop using conditional probabilities and the same `test_tokens`.

## Out-of-vocabulary rate

**OOV Rate** reports the share of test tokens missing from the training vocabulary. Every one of those gets the same small probability, so a high rate puts a floor under the perplexity that no choice of n can fix.

A high rate suggests that the corpus is too small or differs in subject from the test text, or that preparation splits words too finely, for instance by keeping numbers or rare identifiers. The remedy lies with the data: more training text, or mapping rare tokens to UNK. Note that the rate only sees single words. A test bigram made of two known words can still be unseen, which is usually far more common than an unseen word.

## Tuning the smoothing constant

**Compare Smoothing** gives `pp_mle`, `pp_laplace` and `pp_addk` on the same test tokens. `pp_mle` becomes infinite as soon as one test word was unseen, because log2 of 0 is −∞, so an infinity there is expected and not a bug.

Try several values of **Smoothing k**, such as 1, 0.1 and 0.01, and take the lowest test perplexity. Use a validation set when you can, separate from the final test set, so the final score stays honest. At unigram level, the choice usually changes little if N is much larger than V. It matters far more for higher orders, as the [Bigram](bigram.md) wiki shows.

## Is the corpus large enough?

Compare the number of tokens to the number of possible n-grams. With V = 10,000 there are 10⁸ possible bigrams and 10¹² possible trigrams, so a million-token corpus can only fill a small part of either.

Two quick checks reveal the shortage. The share of test bigrams or trigrams missing from training says how often a model has no counts to use. The count of singletons, sequences seen only once, says how much of the table rests on one observation. Train on half of the corpus and on all of it, then compare perplexity: a big gain from more text means the corpus is the limit, and a higher order would need still more text.

## Reading the actions against the tab

The actions do not change with the tab. **N-gram Probabilities**, **Perplexity**, **Sentence Probability** and **Compare Smoothing** always work from `unigrams`, and identical results across tabs mean nothing more than that.

**Compare Orders** builds the three count tables but prints no perplexity, so no ranking of orders appears. **Next Word Prediction** uses bigram counts, and adding the same k to every candidate cannot change which one has the highest count. **Smoothing k** therefore has no effect on `next_w`. Both the **Bigram** and **Trigram** tabs define only count tables, so conditional probabilities and their smoothing are for you to add.

## See Also

- [Factsheet](factsheet.md) · [Overview](overview.md) · [Assumptions](assumptions.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
- [Unigram](unigram.md) · [Bigram](bigram.md) · [Trigram](trigram.md)
