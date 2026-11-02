# Choosing a Language Model

The choices are the order of the n-gram, the smoothing method and whether an n-gram is the right tool at all. Corpus size is the main constraint on all three.

## Quick choices by situation

| Situation | Order | Reason |
|---|---|---|
| Very little text, or word frequencies are all you need | **Unigram** | Stable counts, no context |
| Small to moderate corpus | **Bigram** | Some context, manageable sparsity |
| Large corpus and a good smoothing method | **Trigram** | More context if counts are available |
| Long-range meaning or generation | Neural model | n-grams cannot see far enough |

## Which order for how much text?

Higher order helps while counts stay reliable. Rough sizes follow from counting: V = 10,000 gives 10⁴ unigram parameters, 10⁸ bigram parameters and 10¹² trigram parameters. Only a small part of these ever occur, but those that do must be seen several times to be estimated well.

Let held-out perplexity decide, since a rule of thumb can only give a starting point. Fit each order, score on the same test tokens and accept the higher order only if the score really falls. Remember that **Compare Orders** gives you counts for the three orders but leaves those scores for you to compute.

## Which smoothing?

Add-k is the panel's built-in option. It works well enough for unigrams and for simple comparisons, and it is a fine place to begin. For bigrams and above it moves too much probability to unseen sequences, particularly at k = 1.

Good-Turing discounting estimates the mass of unseen events from how many items were seen once ([Good (1953)](#ref-Goo1953a)): with 100 singletons in 10,000 tokens, the unseen share is about 1%. Interpolation and back-off then use lower orders, and absolute discounting with Kneser-Ney continuation counts performed well in the comparison by [Chen and Goodman (1999)](#ref-CG1999a). For serious use, take one of those rather than add-k.

## How to choose k

Fit on training text, try a grid such as 1, 0.1, 0.01 and 0.001 and keep the lowest perplexity on a validation set. **Compare Smoothing** gives three of those numbers side by side at the unigram level, and it is easy to change the value in **Smoothing k**.

The right k tends to fall as the order rises, for each context has few counts, and any constant added to them weighs heavily. Avoid k = 0 on any text not used for training, because a single unseen item gives an infinite perplexity. Avoid large k too, as it pulls the distribution towards uniform and hides what the corpus says.

## Beyond counting

Refinements on n-grams go a long way. [Goodman (2001)](#ref-Goo2001a) surveyed and combined many of them: smoothing, skipping, clustering and sentence mixture models. Each can be added to the panel's counts by editing the code.

Neural models go further, since embeddings let "cat" and "dog" share evidence, and attention can reach far back. Those models need more data and computing power, and they give answers that are harder to trace. Use an n-gram when the corpus is small, speed matters or every number must be explained. Otherwise, keep it as a baseline. Any larger model should beat it on the same held-out text.

## References

<a id="ref-CG1999a"></a>Chen, S. F., & Goodman, J. (1999). An Empirical Study of Smoothing Techniques for Language Modeling. *Computer Speech & Language* 13(4), 359-393. [doi:10.1006/csla.1999.0128](https://doi.org/10.1006/csla.1999.0128)

<a id="ref-Goo1953a"></a>Good, I. J. (1953). The Population Frequencies of Species and the Estimation of Population Parameters. *Biometrika* 40(3-4), 237-264. [doi:10.1093/biomet/40.3-4.237](https://doi.org/10.1093/biomet/40.3-4.237)

<a id="ref-Goo2001a"></a>Goodman, J. T. (2001). A Bit of Progress in Language Modeling. *Computer Speech and Language* 15(4), 403-434. [doi:10.1006/csla.2001.0174](https://doi.org/10.1006/csla.2001.0174)

## See Also

- [Factsheet](factsheet.md) · [Overview](overview.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md)
- [Unigram](unigram.md) · [Bigram](bigram.md) · [Trigram](trigram.md)
