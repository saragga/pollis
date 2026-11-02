# Statistical Language Model: Factsheet

A quick reference for **Statistical Language Model**: the three tabs, the two inputs and what each action computes. The panel builds its counts with `TextAnalysis` and `Languages`, from documents you supply or from The Pollis Guide.

## Tabs and their formulas

| Tab | Conditional on | Maximum likelihood estimate | Objects built |
|---|---|---|---|
| **Unigram** | Nothing | count(w) / N | `unigrams`, `N`, `V`, `prob(w)` |
| **Bigram** | Previous word | count(v w) / count(v) | `unigrams`, `bigrams`, `V` |
| **Trigram** | Two previous words | count(u v w) / count(u v) | `unigrams`, `bigrams`, `trigrams`, `V` |

Only **Unigram** defines a probability function in its code, with add-k smoothing. The other two tabs stop at the counts, ready for your own formula.

## Inputs and defaults

| Input | Default | Meaning |
|---|---|---|
| **Corpus** | `corpus` | Array of text documents |
| **Smoothing k** | 1 | Added to each count; 1 is Laplace, 0 is maximum likelihood |

The default `corpus` is The Pollis Guide with every tenth section held out as `test_tokens`. Its example also defines `new_sentence` and `context`, which the actions use. Your own corpus needs those three defined for **Perplexity**, **OOV Rate**, **Compare Smoothing**, **Sentence Probability** and **Next Word Prediction**.

## The add-k formula

P(w) = (count(w) + k) / (N + kV), where N is the number of tokens and V the number of distinct words.

For the toy text "the cat sat on the mat", N = 6 and V = 5. With k = 1, P(the) = 3 / 11 ≈ 0.273 and an unseen word gets 1 / 11 ≈ 0.091. With k = 0, those become 2 / 6 ≈ 0.333 and 0.

## Actions by group

| Group | Action | Output | Order used |
|---|---|---|---|
| Visualise | **Unigram Distribution** | `top10` | Unigram |
| Visualise | **N-gram Probabilities** | `probs` | Unigram |
| Diagnose | **Perplexity** | `pp` on `test_tokens` | Unigram |
| Diagnose | **OOV Rate** | `oov_rate` | Vocabulary only |
| Predict | **Sentence Probability** | `log_p`, base 2 | Unigram |
| Predict | **Next Word Prediction** | `next_w` after `context` | Bigram |
| Compare | **Compare Orders** | Counts for all three orders | None computed |
| Compare | **Compare Smoothing** | `pp_mle`, `pp_laplace`, `pp_addk` | Unigram |
| Interpret | **Top N-grams** | `top_bg` | Bigram |
| Interpret | **Probability Ratios** | `pmi(w1, w2)` | Bigram over unigrams |

The last column applies whichever tab is open, so read scoring actions as unigram scores unless you rewrite them.

## Tools and textbooks

Counting comes from [JuliaText Contributors (2023)](#ref-JTC2023a). The standard textbook treatments of everything here are [Daniel Jurafsky and James H. Martin (2024)](#ref-JM2024a) and [Christopher D. Manning and Hinrich Schütze (1999)](#ref-MS1999a), and those are the places to read smoothing and evaluation in full. Their chapters on n-grams also cover the unknown-word token and sentence boundary symbols, which this panel leaves out. Read them before extending the code.

## References

<a id="ref-JM2024a"></a>Jurafsky, D., & Martin, J. H. (2024). *Speech and Language Processing* (3rd ed., draft). [Online](https://web.stanford.edu/~jurafsky/slp3/)

<a id="ref-JTC2023a"></a>JuliaText Contributors (2023). TextAnalysis.jl: Julia NLP Toolkit. [GitHub](https://github.com/JuliaText/TextAnalysis.jl)

<a id="ref-MS1999a"></a>Manning, C. D., & Schütze, H. (1999). *Foundations of Statistical Natural Language Processing*. MIT Press. [Online](https://nlp.stanford.edu/fsnlp/)

## See Also

- [Overview](overview.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
- [Unigram](unigram.md) · [Bigram](bigram.md) · [Trigram](trigram.md)
