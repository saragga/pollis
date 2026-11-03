# Latent Dirichlet Allocation: Factsheet

A summary of the **Latent Dirichlet Allocation** panel: the model, its inputs, the preparation of the corpus, the fitting step and what the main code prints.

## At a glance

| Item | Value |
| --- | --- |
| Model | LDA, with Dirichlet priors on mixtures and topics |
| Fitting | collapsed Gibbs sampling, `lda` of TextAnalysis.jl |
| Input text | a vector of strings, one per document |
| Output | phi, k × V, p(word ∣ topic); theta, k × N, p(topic ∣ document) |
| Default priors | 0.1 on mixtures, 0.01 on topics |
| Printed | top 10 words of each topic |

The model is that of [Blei, Ng and Jordan (2003)](#ref-BNJ2003a); the sampler is that of [Griffiths and Steyvers (2004)](#ref-GS2004a); the package is that of [JuliaText Contributors (2023)](#ref-JTC2023a).

## Inputs

| Input | Default | Tooltip, in brief |
| --- | --- | --- |
| **Corpus** | `corpus` | vector of text documents |
| **Topics (k)** | `10` | number of latent topics to discover |
| **Gibbs Sweeps** | `1000` | sweeps of collapsed Gibbs sampling over all tokens |
| **Document-Topic Prior (alpha)** | `0.1` | symmetric Dirichlet prior on each document mixture |
| **Topic-Word Prior (beta)** | `0.01` | symmetric Dirichlet prior on each topic |
| **Held-Out Share** | `0.1` | share of tokens held out for the perplexity |
| **Seed** | `1` | seed of the global random number generator |
| **Topic to Inspect** | `1` | topic used by **Top Documents** |
| **New Document** | a string | text placed in the topics by **Infer Topics** |

The tooltips of the two priors add that a value under 1 favours few topics per document and few words per topic.

## Preparing the corpus

The code makes a `StringDocument` of each string and cleans the corpus with

```
prepare!(crps, strip_punctuation | strip_case | strip_numbers | strip_stopwords)
```

which removes punctuation, case, numbers and stop words. `update_lexicon!` builds the vocabulary, and `DocumentTermMatrix(crps)` the N × V matrix of counts, `dtm.dtm`, with its V terms in `dtm.terms`.

The TextAnalysis.jl documentation lists these preparation steps among the options of `prepare!`, together with others such as removing articles, pronouns, sparse terms or frequent terms.

## Fitting

`fit_lda` seeds the global random number generator with **Seed**, since, as the comment says, `lda` samples with it, and runs **Gibbs Sweeps** sweeps with the two priors and `showprogress = false`. The result is

```
phi, theta = fit_lda(dtm, k)
```

The documentation of `lda` describes ϕ as an ntopics × nwords sparse matrix of word probabilities per topic and θ as an ntopics × ndocs dense matrix of topic probabilities per document. The panel's bullet adds that both are read from the last sweep.

## Output and helpers

The main code prints the ten most probable words of every topic with `top_words(phi, t)`. It also defines two helpers used by the actions:

| Helper | Computes |
| --- | --- |
| `umass(ws)` | the UMass coherence of a ranked word list |
| `heldout_perplexity(kk)` | document-completion perplexity at kk topics, with a unigram baseline |

The Diagnostics page describes both.

## Packages

The main code loads TextAnalysis, SparseArrays, LinearAlgebra and Random. Plots draws the charts of **Top Words per Topic**, **Document-Topic Distribution**, **Topic Coherence**, **Compare k Topics** and **Topic Prevalence**, and Statistics gives the means of the coherence actions.

**LDA vs LSA** calls `lsa(dtm)` of the same package, which the TextAnalysis.jl documentation describes as Latent Semantic Analysis on a corpus or document-term matrix, using tf-idf for the term statistics. The LSA panel fits that model on its own.

## References in the panel

| Section | Works |
| --- | --- |
| Software | [JuliaText Contributors (2023)](#ref-JTC2023a) |
| Textbooks | [Jurafsky and Martin (2024)](#ref-JM2024a), [Bishop (2006)](#ref-Bis2006a) |
| Original Papers | [Blei, Ng and Jordan (2003)](#ref-BNJ2003a), [Griffiths and Steyvers (2004)](#ref-GS2004a), [Wallach, Murray, Salakhutdinov and Mimno (2009)](#ref-WMSM2009a), [Mimno, Wallach, Talley, Leenders and McCallum (2011)](#ref-MWTLM2011a) |

## References

<a id="ref-Bis2006a"></a>Bishop, C. M. (2006). *Pattern Recognition and Machine Learning*. Springer. [doi:10.1007/978-0-387-45528-0](https://doi.org/10.1007/978-0-387-45528-0)

<a id="ref-BNJ2003a"></a>Blei, D. M., Ng, A. Y., & Jordan, M. I. (2003). Latent Dirichlet Allocation. *Journal of Machine Learning Research* 3, 993-1022. [jmlr.org](https://jmlr.org/papers/v3/blei03a.html)

<a id="ref-GS2004a"></a>Griffiths, T. L., & Steyvers, M. (2004). Finding Scientific Topics. *Proceedings of the National Academy of Sciences* 101(suppl. 1), 5228-5235. [doi:10.1073/pnas.0307752101](https://doi.org/10.1073/pnas.0307752101)

<a id="ref-JTC2023a"></a>JuliaText Contributors (2023). TextAnalysis.jl: Julia NLP Toolkit. [github.com](https://github.com/JuliaText/TextAnalysis.jl)

<a id="ref-JM2024a"></a>Jurafsky, D., & Martin, J. H. (2024). *Speech and Language Processing* (3rd ed., draft). [web.stanford.edu](https://web.stanford.edu/~jurafsky/slp3/)

<a id="ref-MWTLM2011a"></a>Mimno, D., Wallach, H. M., Talley, E., Leenders, M., & McCallum, A. (2011). Optimizing Semantic Coherence in Topic Models. *Proceedings of the 2011 Conference on Empirical Methods in Natural Language Processing*, 262-272. [aclanthology.org](https://aclanthology.org/D11-1024/)

<a id="ref-WMSM2009a"></a>Wallach, H. M., Murray, I., Salakhutdinov, R., & Mimno, D. (2009). Evaluation Methods for Topic Models. *Proceedings of the 26th International Conference on Machine Learning*, 1105-1112. [doi:10.1145/1553374.1553515](https://doi.org/10.1145/1553374.1553515)

## See Also

- [Overview](overview.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
- [LDA](lda.md)
