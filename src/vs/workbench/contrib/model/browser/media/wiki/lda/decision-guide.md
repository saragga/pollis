# Latent Dirichlet Allocation: Decision Guide

Choices in the **Latent Dirichlet Allocation** panel: the number of topics, the two priors, the number of sweeps, LDA or LSA, and the action that answers a given question.

## Number of topics

**Compare k Topics** fits LDA with k = 2, 5, 10 and 20, on the same split and seed, and prints the held-out perplexity and the mean UMass coherence of each. It plots the perplexity against k with the unigram baseline as a dashed line; the code comment advises choosing k where the curve flattens and coherence holds.

[Griffiths and Steyvers (2004)](#ref-GS2004a) chose the number of topics for their PNAS abstracts by Bayesian model selection, approximating the likelihood P(w ∣ T) by the harmonic mean of P(w ∣ z, T) over posterior samples. They found the best fit at 300 topics and note that the result depends on α and β and on the preparation of the data. [Wallach, Murray, Salakhutdinov and Mimno (2009)](#ref-WMSM2009a) compare the harmonic mean method with other estimators of the probability of held-out documents.

## The two priors

| Input | Default | Tooltip, in brief |
| --- | --- | --- |
| **Document-Topic Prior (alpha)** | 0.1 | under 1, few topics per document |
| **Topic-Word Prior (beta)** | 0.01 | under 1, few words per topic |

The documentation of `lda` in TextAnalysis.jl gives the same reading: α < 1 yields a sparse topic mixture and α > 1 a more uniform one, and likewise for β and the words of a topic.

[Griffiths and Steyvers (2004)](#ref-GS2004a) used β = 0.1 and α = 50/T in all their runs, keeping the sum of the document-topic hyperparameters constant. They write that a small β can be expected to give a fine-grained decomposition of the corpus into topics.

## Gibbs sweeps

**Gibbs Sweeps** sets the number of sweeps over all tokens, 1000 by default. In the PNAS analysis of [Griffiths and Steyvers (2004)](#ref-GS2004a), the log-likelihood stabilised within a few hundred iterations; they discarded the first 1,000 iterations of each chain and took samples at a lag of 100.

The panel's bullet says that phi and theta are read from the last sweep, so one fit gives one sample.

## LDA or LSA

**LDA vs LSA** runs `lsa(dtm)`, the SVD of the tf-idf matrix used in the LSA panel, orients each dimension by its largest loading, takes the top 10 words, and prints the mean UMass coherence of the LDA topics and the LSA dimensions.

[Blei, Ng and Jordan (2003)](#ref-BNJ2003a) describe latent semantic indexing as an SVD of the tf-idf matrix that identifies a linear subspace capturing most of the variance of the collection, and present LDA as a generative probabilistic model of the corpus.

## Which action to use

| Question | Action |
| --- | --- |
| What are the topics? | **Top Words per Topic**, **Topic Labels** |
| What is each document about? | **Document-Topic Distribution** |
| How well do the topics predict unseen tokens? | **Held-Out Perplexity** |
| Do the top words of a topic belong together? | **Topic Coherence** |
| Where does a new text fit? | **Infer Topics** |
| Which documents carry a topic? | **Top Documents** |
| How many topics? | **Compare k Topics** |
| Topics or SVD dimensions? | **LDA vs LSA** |
| Which topics dominate the corpus? | **Topic Prevalence** |

## Reading further

The panel lists [Jurafsky and Martin (2024)](#ref-JM2024a) and [Bishop (2006)](#ref-Bis2006a) as textbooks. Its original papers are [Blei, Ng and Jordan (2003)](#ref-BNJ2003a) for the model, [Griffiths and Steyvers (2004)](#ref-GS2004a) for the collapsed Gibbs sampler, [Wallach, Murray, Salakhutdinov and Mimno (2009)](#ref-WMSM2009a) for the evaluation of topic models on held-out documents, and [Mimno, Wallach, Talley, Leenders and McCallum (2011)](#ref-MWTLM2011a) for the coherence measure. The software entry is [JuliaText Contributors (2023)](#ref-JTC2023a).

## References

<a id="ref-Bis2006a"></a>Bishop, C. M. (2006). *Pattern Recognition and Machine Learning*. Springer. [doi:10.1007/978-0-387-45528-0](https://doi.org/10.1007/978-0-387-45528-0)

<a id="ref-BNJ2003a"></a>Blei, D. M., Ng, A. Y., & Jordan, M. I. (2003). Latent Dirichlet Allocation. *Journal of Machine Learning Research* 3, 993-1022. [jmlr.org](https://jmlr.org/papers/v3/blei03a.html)

<a id="ref-GS2004a"></a>Griffiths, T. L., & Steyvers, M. (2004). Finding Scientific Topics. *Proceedings of the National Academy of Sciences* 101(suppl. 1), 5228-5235. [doi:10.1073/pnas.0307752101](https://doi.org/10.1073/pnas.0307752101)

<a id="ref-JTC2023a"></a>JuliaText Contributors (2023). TextAnalysis.jl: Julia NLP Toolkit. [github.com](https://github.com/JuliaText/TextAnalysis.jl)

<a id="ref-JM2024a"></a>Jurafsky, D., & Martin, J. H. (2024). *Speech and Language Processing* (3rd ed., draft). [web.stanford.edu](https://web.stanford.edu/~jurafsky/slp3/)

<a id="ref-MWTLM2011a"></a>Mimno, D., Wallach, H. M., Talley, E., Leenders, M., & McCallum, A. (2011). Optimizing Semantic Coherence in Topic Models. *Proceedings of the 2011 Conference on Empirical Methods in Natural Language Processing*, 262-272. [aclanthology.org](https://aclanthology.org/D11-1024/)

<a id="ref-WMSM2009a"></a>Wallach, H. M., Murray, I., Salakhutdinov, R., & Mimno, D. (2009). Evaluation Methods for Topic Models. *Proceedings of the 26th International Conference on Machine Learning*, 1105-1112. [doi:10.1145/1553374.1553515](https://doi.org/10.1145/1553374.1553515)

## See Also

- [Factsheet](factsheet.md) · [Overview](overview.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md)
- [LDA](lda.md)
