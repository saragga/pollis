# Reading Language Model Results

Numbers from an n-gram model are simple counts and logs, but each has a specific reading. The sections here explain how to turn them into statements about the text and the model.

## Perplexity and bits

Cross-entropy in bits per token and perplexity are the same information on different scales: perplexity = 2 to the power of the cross-entropy. A drop of one bit per token halves the perplexity, so a move from 1,000 to 500 is one bit.

Perplexity reads as an effective branching factor, the number of equally likely next words that would give the same uncertainty. A uniform choice over 1,000 words has perplexity 1,000 and about 9.97 bits per token. [Shannon (1951)](#ref-Sha1951a) estimated the entropy of English letters by asking people to predict the next one, showing how much of the uncertainty a human reader's knowledge removes. A model's cross-entropy is always at or above the true entropy of its source, so a lower value means a closer model.

## Frequent words and frequent pairs

**Unigram Distribution** and **Top N-grams** nearly always begin with function words: "the", "of", "and" and pairs like "of the". That says the counts work correctly, though it says little about the corpus.

Content appears lower down, so the interesting part is often past the top ten. Frequencies also fall off roughly as a power of rank, the pattern known as Zipf's law, with a few very common words and a long tail of rare ones. That shape is why vocabulary keeps growing with corpus size, and why the zero problem never quite goes away. Expect a large share of the distinct words to occur only once.

## Sentence log-probabilities

**Sentence Probability** returns `log_p`, a sum of base-2 logs. Seven words at probability 0.01 each give 7 × log2 0.01 ≈ −46.5 bits. Those values are always negative, and longer sentences always have lower values.

Compare only sentences of the same length, or divide by the token count first. The action uses unigrams, so it scores words and ignores order: "the panel open" gets exactly the same value as "open the panel". Common words raise the score, so a high value means familiar words, not good grammar. A bigram or trigram version, written by you, would start to reward word order.

## Next-word guesses

**Next Word Prediction** returns the most frequent follower of `context` in the bigram counts. It is one guess, with no probability attached, and a follower that has only slightly more counts than the next candidate still wins.

Function-word contexts give mostly dull answers, since "the" is followed by many nouns with low shares each. Inspect a few alternatives before reading anything into a single output. When no bigram with the context exists at all, every candidate ties at k, so the result is arbitrary: a word missing from the corpus as a context gives no real prediction.

## Word association with PMI

**Probability Ratios** defines `pmi(w1, w2)`, pointwise mutual information: how much more often a pair occurs than if the words were independent, on a log2 scale. A value of 0 means chance level, and 3 means eight times chance. See [Manning and Schütze (1999)](#ref-MS1999a) for its use on collocations.

Rare pairs get high values. With N = 1,000, "new york" with all three counts at 10 gives about log2(10 × 1,000 / 101) ≈ 6.63, whereas a pair seen once whose words each appear once gives log2(1 × 1,000 / 2) ≈ 8.97. The code adds 1 to the denominator, so results differ slightly from textbook PMI. Unseen pairs give −∞. Set a minimum count before ranking pairs.

## References

<a id="ref-MS1999a"></a>Manning, C. D., & Schütze, H. (1999). *Foundations of Statistical Natural Language Processing*. MIT Press. [Online](https://nlp.stanford.edu/fsnlp/)

<a id="ref-Sha1951a"></a>Shannon, C. E. (1951). Prediction and Entropy of Printed English. *Bell System Technical Journal* 30(1), 50-64. [doi:10.1002/j.1538-7305.1951.tb01366.x](https://doi.org/10.1002/j.1538-7305.1951.tb01366.x)

## See Also

- [Factsheet](factsheet.md) · [Overview](overview.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Decision Guide](decision-guide.md)
- [Unigram](unigram.md) · [Bigram](bigram.md) · [Trigram](trigram.md)
