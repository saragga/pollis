# Latent Dirichlet Allocation: Assumptions

What LDA takes for granted about documents and words, and what the code of the **Latent Dirichlet Allocation** panel assumes about its corpus.

## Bag of words

[Blei, Ng and Jordan (2003)](#ref-BNJ2003a) base LDA on the bag-of-words assumption, that the order of words in a document can be neglected; in the language of probability theory, an assumption of exchangeability for the words of a document. They also assume that documents are exchangeable, so that the order of the documents in a corpus can be neglected too.

They add that exchangeability is not equivalent to the words being independent and identically distributed: exchangeable words are conditionally independent and identically distributed, given the latent topics.

The panel's document-term matrix holds only the count of each term in each document, so the order of the words is given up before fitting.

## A fixed number of topics

In the basic model of [Blei, Ng and Jordan (2003)](#ref-BNJ2003a), the dimensionality k of the Dirichlet distribution, and so the number of topics, is assumed known and fixed. The panel takes k from **Topics (k)** and keeps it fixed while sampling.

[Griffiths and Steyvers (2004)](#ref-GS2004a) treat the choice of k as a problem of model selection. **Compare k Topics** fits the model at several values and reports held-out perplexity and coherence for each.

## Dirichlet priors

[Blei, Ng and Jordan (2003)](#ref-BNJ2003a) place a Dirichlet prior with parameter α on each document mixture θ. In their smoothed model, each topic is also a random vector drawn from an exchangeable Dirichlet, a Dirichlet with a single scalar parameter.

[Griffiths and Steyvers (2004)](#ref-GS2004a) use the same model, with a Dirichlet prior on the topics, and assume symmetric priors, α and β each a single value. They explain that the priors are conjugate to the multinomial distributions of the topics and the mixtures, which lets them integrate both out.

The panel's two priors are symmetric: **Document-Topic Prior (alpha)** and **Topic-Word Prior (beta)**.

## Conditional independence

Given the topics and the mixture of a document, the words of LDA are drawn independently: a topic from the mixture and a word from that topic. [Griffiths and Steyvers (2004)](#ref-GS2004a) show that the full conditional distribution of a word's topic depends only on two counts, the times a word is assigned to a topic and the times a topic occurs in a document.

The collapsed sampler of the panel's bullet uses that property: it resamples the topic of every token given all the others.

## Preparing the text

The model sees only the terms left by the preparation step. The panel removes punctuation, case, numbers and stop words before building the vocabulary.

[Griffiths and Steyvers (2004)](#ref-GS2004a) prepared their PNAS abstracts in a similar way: they split words at any delimiting character and deleted words that appeared in fewer than five abstracts or belonged to a standard stop list. The TextAnalysis.jl documentation of [JuliaText Contributors (2023)](#ref-JTC2023a) lists `strip_sparse_terms` and `strip_frequent_terms` among the options of `prepare!`.

## The random number generator

Gibbs sampling is a random procedure, and the panel's comment explains that `lda` draws from the global random number generator. `fit_lda` calls `Random.seed!` with **Seed** before every fit, so that the same corpus, priors and k give the same topics.

[Griffiths and Steyvers (2004)](#ref-GS2004a) report that, in their runs, the estimates of different samples could only be combined up to a permutation of the topics, since the indices of the topics are not identifiable.

## References

<a id="ref-BNJ2003a"></a>Blei, D. M., Ng, A. Y., & Jordan, M. I. (2003). Latent Dirichlet Allocation. *Journal of Machine Learning Research* 3, 993-1022. [jmlr.org](https://jmlr.org/papers/v3/blei03a.html)

<a id="ref-GS2004a"></a>Griffiths, T. L., & Steyvers, M. (2004). Finding Scientific Topics. *Proceedings of the National Academy of Sciences* 101(suppl. 1), 5228-5235. [doi:10.1073/pnas.0307752101](https://doi.org/10.1073/pnas.0307752101)

<a id="ref-JTC2023a"></a>JuliaText Contributors (2023). TextAnalysis.jl: Julia NLP Toolkit. [github.com](https://github.com/JuliaText/TextAnalysis.jl)

## See Also

- [Factsheet](factsheet.md) · [Overview](overview.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
- [LDA](lda.md)
