# Latent Dirichlet Allocation: Overview

The **Latent Dirichlet Allocation** panel fits LDA, a generative model of a collection of documents, with the `lda` function of TextAnalysis.jl. Each document is a mixture of k topics and each topic a distribution over words, and the panel estimates both by collapsed Gibbs sampling.

## The model in brief

[Blei, Ng and Jordan (2003)](#ref-BNJ2003a) describe LDA as a generative probabilistic model of a corpus, in which documents are represented as random mixtures over latent topics and each topic is characterised by a distribution over words. The panel's first bullet gives the same picture: documents as mixtures of topics, topics as distributions over words, with Dirichlet priors.

For every document, the model draws a mixture θ from a Dirichlet distribution; for every word, it draws a topic from θ and then the word from that topic. The LDA page gives the full generative process.

## Gibbs sampling

[Griffiths and Steyvers (2004)](#ref-GS2004a) present a Markov chain Monte Carlo algorithm for LDA that does not represent the topics and the mixtures as parameters to estimate. Instead, it samples the assignments of words to topics from their posterior distribution, after integrating out the topics and the mixtures, and estimates both from the counts of a sample.

The panel's second bullet describes the same procedure: the sampler resamples the topic of every token given all the others, and phi and theta are read from the last sweep.

## TextAnalysis.jl

The documentation of TextAnalysis.jl, of [JuliaText Contributors (2023)](#ref-JTC2023a), lists LSA and LDA among the features of the package, beside document and corpus types and the document-term matrix. Its `lda(dtm, ntopics, iterations, α, β)` performs latent Dirichlet allocation on a document-term matrix, with the number of Gibbs sampling iterations and the two Dirichlet hyperparameters, and returns ϕ, the topic-word matrix, and θ, the document-topic matrix.

The panel's third bullet names the parts of the package it uses: corpus cleaning, the document-term matrix and `lda`, with the LSA panel for the SVD alternative.

## Actions

| Group | Actions |
| --- | --- |
| Visualise | **Top Words per Topic**, **Document-Topic Distribution** |
| Diagnose | **Held-Out Perplexity**, **Topic Coherence** |
| Predict | **Infer Topics**, **Top Documents** |
| Compare | **Compare k Topics**, **LDA vs LSA** |
| Interpret | **Topic Labels**, **Topic Prevalence** |

The main code fits the model once; **Held-Out Perplexity**, **Compare k Topics** and **Infer Topics** refit it on their own data.

## Wikis and notebooks

The Factsheet lists the inputs, the preparation of the corpus and the output. Assumptions covers the bag of words, the fixed number of topics and the Dirichlet priors, Diagnostics the held-out perplexity and the coherence of topics, Interpretation the topics and mixtures, and the Decision Guide the choices of the panel. The LDA page describes the model and its sampler.

The notebook LDA covers topic modelling with TextAnalysis.jl. The panel's textbooks are [Jurafsky and Martin (2024)](#ref-JM2024a) and [Bishop (2006)](#ref-Bis2006a).

## References

<a id="ref-Bis2006a"></a>Bishop, C. M. (2006). *Pattern Recognition and Machine Learning*. Springer. [doi:10.1007/978-0-387-45528-0](https://doi.org/10.1007/978-0-387-45528-0)

<a id="ref-BNJ2003a"></a>Blei, D. M., Ng, A. Y., & Jordan, M. I. (2003). Latent Dirichlet Allocation. *Journal of Machine Learning Research* 3, 993-1022. [jmlr.org](https://jmlr.org/papers/v3/blei03a.html)

<a id="ref-GS2004a"></a>Griffiths, T. L., & Steyvers, M. (2004). Finding Scientific Topics. *Proceedings of the National Academy of Sciences* 101(suppl. 1), 5228-5235. [doi:10.1073/pnas.0307752101](https://doi.org/10.1073/pnas.0307752101)

<a id="ref-JTC2023a"></a>JuliaText Contributors (2023). TextAnalysis.jl: Julia NLP Toolkit. [github.com](https://github.com/JuliaText/TextAnalysis.jl)

<a id="ref-JM2024a"></a>Jurafsky, D., & Martin, J. H. (2024). *Speech and Language Processing* (3rd ed., draft). [web.stanford.edu](https://web.stanford.edu/~jurafsky/slp3/)

## See Also

- [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
- [LDA](lda.md)
