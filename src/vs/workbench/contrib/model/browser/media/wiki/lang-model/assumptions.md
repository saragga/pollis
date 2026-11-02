# Language Model Assumptions

N-gram models rest on a few simplifications about language and text. Each one is plainly false at some level, and knowing how helps you read the output.

## A short memory

The Markov assumption says the next word depends only on the last n − 1 words. Language clearly has longer links: in "the books on the top shelf are old", the verb agrees with a noun several words back, and no trigram can see that.

The claim is only that a short history is a useful approximation, and it often is, since local patterns carry much of the predictability of text. The errors grow for tasks that hinge on long-range meaning, such as agreement, coreference or topic. A model of low order can look fine on perplexity and still produce nonsense when it generates text.

## Text that stays the same

Probabilities estimated from a corpus are applied to future text as if both came from one fixed source. A model trained on a software manual will meet different words and phrases in a news article, and its perplexity there will be far worse.

The default corpus shows this in a mild form. Its held-out sections are from the same guide, every tenth section, so the test text resembles the training text closely, and scores will flatter what the model could do on outside writing. Language also changes over time, so older corpora drift away from current usage.

## Tokens as the units of meaning

The code applies `prepare!(crps, strip_punctuation | strip_case)` and splits on spaces. Once case is stripped, "Apple" the company and "apple" the fruit are one token. Removing punctuation deletes sentence ends, so "end. The" looks like an ordinary word pair.

Tokens carry no structure in this model. Inflected forms like "run" and "runs" are separate words, sharing no strength, and so are spelling variants. Choices about tokenisation directly change N and V, so two perplexity values are comparable only with the same preparation on both sides.

## No boundaries between sentences or documents

The code flattens every document into one list of tokens before counting. The last word of a document therefore forms an n-gram with the first word of the next, and sentence boundaries are not marked by the usual start and end symbols.

The textbook setup adds such symbols, so that a model can learn which words open a sentence and which end one, and so that each sentence's probability sums correctly over all sentences. The effect here is usually small for large documents, as false n-grams form a small share of the counts. It grows when documents are short.

## Words outside the vocabulary

The formula gives an unseen word k / (N + kV), the same as any other word with zero count. The denominator counts only seen words, so the probabilities over the training vocabulary already sum to 1, and any unseen word adds extra mass on top. The toy text with k = 1 has 11 / 11 for its five seen words, plus 1 / 11 for each unseen one.

The usual fix adds an unknown token, called UNK, to the vocabulary and trains on it, so the total stays at 1. In practice, the panel's form gives usable numbers for comparison. Strictly speaking, its `pp` is not the perplexity of a proper distribution when `oov_rate` is above zero.

## See Also

- [Factsheet](factsheet.md) · [Overview](overview.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
- [Unigram](unigram.md) · [Bigram](bigram.md) · [Trigram](trigram.md)
