# Latent Dirichlet Allocation: LDA

LDA models each document as a mixture of topics and each topic as a distribution over words. The panel fits it by collapsed Gibbs sampling, which samples the topic of every token and estimates the topics and mixtures from the counts.

## The generative process

[Blei, Ng and Jordan (2003)](#ref-BNJ2003a) give the generative process of LDA for each document w of a corpus:

1. Choose the length N ∼ Poisson(ξ).
2. Choose the mixture θ ∼ Dir(α).
3. For each of the N words w_n, choose a topic z_n ∼ Multinomial(θ), and then the word from p(w_n ∣ z_n, β), a multinomial conditioned on the topic.

They note that the Poisson assumption on the length is not critical to what follows. The topics are a k × V matrix of word probabilities; in the smoothed model, each row has an exchangeable Dirichlet prior.

## Inference

[Blei, Ng and Jordan (2003)](#ref-BNJ2003a) fit LDA by variational inference. [Griffiths and Steyvers (2004)](#ref-GS2004a) instead integrate out the topics and the mixtures, using the conjugacy of the Dirichlet priors, and sample the assignments z of words to topics from the posterior P(z ∣ w) by Gibbs sampling.

The full conditional of the topic of token i, of word w_i in document d_i, with k topics and V terms, is

P(z_i = j ∣ z_−i, w) ∝ (n_−i,j^(w_i) + β) / (n_−i,j + Vβ) × (n_−i,j^(d_i) + α) / (n_−i^(d_i) + kα),

where the counts leave out the current assignment of token i. [Griffiths and Steyvers (2004)](#ref-GS2004a) read the first ratio as the probability of w_i under topic j and the second as the probability of topic j in document d_i.

## Estimates from a sample

From a single sample of z, [Griffiths and Steyvers (2004)](#ref-GS2004a) estimate the topics and the mixtures by

- φ_j^(w) = (n_j^(w) + β) / (n_j + Vβ),
- θ_j^(d) = (n_j^(d) + α) / (n^(d) + kα),

the predictive distributions of a new word given a topic and of a new topic given a document.

The documentation of `lda` in TextAnalysis.jl, of [JuliaText Contributors (2023)](#ref-JTC2023a), describes its ϕ as the word probabilities per topic and its θ as the topic probabilities per document, and the panel's bullet says that both are read from the last sweep. **Held-Out Perplexity** computes the estimates of [Griffiths and Steyvers (2004)](#ref-GS2004a) from the topic counts of its fit.

## The sampler in practice

[Griffiths and Steyvers (2004)](#ref-GS2004a) initialise the chain with an on-line version of the sampler, which assigns words to topics with counts computed from the words seen so far. The chain then runs for a number of iterations, each sampling every z_i in turn. Only two counts are needed, words by topic and topics by document, so the algorithm runs with little memory by caching the non-zero counts.

In their tests, Gibbs sampling recovered the topics of a synthetic data set faster than variational Bayes and expectation propagation.

## The fit in the panel

The main code calls

```
phi, theta = fit_lda(dtm, k)
```

with **Gibbs Sweeps** sweeps, the priors **Document-Topic Prior (alpha)** and **Topic-Word Prior (beta)**, and the generator seeded with **Seed**. phi is k × V and theta k × N, each column of theta the mixture of one document.

A document left with no tokens after preparation has no mixture: the comment of `heldout_perplexity` notes that theta is NaN for a document with no training tokens, and the actions replace NaN with 0 before ranking or summing.

## New documents

**Infer Topics** appends **New Document** to the corpus, prepares it in the same way and fits again with the same seed. The comment explains that `lda` has no fold-in for unseen documents. The action prints the three topics with the largest share in the new document, each with its share and its eight most probable words.

[Blei, Ng and Jordan (2003)](#ref-BNJ2003a) describe LDA as a well-defined generative model that generalises easily to new documents, unlike pLSI, which has no natural way to assign probability to a previously unseen document.

## References

<a id="ref-BNJ2003a"></a>Blei, D. M., Ng, A. Y., & Jordan, M. I. (2003). Latent Dirichlet Allocation. *Journal of Machine Learning Research* 3, 993-1022. [jmlr.org](https://jmlr.org/papers/v3/blei03a.html)

<a id="ref-GS2004a"></a>Griffiths, T. L., & Steyvers, M. (2004). Finding Scientific Topics. *Proceedings of the National Academy of Sciences* 101(suppl. 1), 5228-5235. [doi:10.1073/pnas.0307752101](https://doi.org/10.1073/pnas.0307752101)

<a id="ref-JTC2023a"></a>JuliaText Contributors (2023). TextAnalysis.jl: Julia NLP Toolkit. [github.com](https://github.com/JuliaText/TextAnalysis.jl)

## See Also

- [Factsheet](factsheet.md) · [Overview](overview.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
