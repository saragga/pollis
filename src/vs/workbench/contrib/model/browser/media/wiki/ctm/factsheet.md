# Correlated Topic Model: Factsheet

A summary of the **Correlated Topic Model** panel: its two models, its inputs, how the code turns text into a corpus, and what the main code prints.

## At a glance

| Item | Value |
| --- | --- |
| Models | CTM, `CTM(corp, k)`; Focused CTM, `fCTM(corp, k)` |
| Package | TopicModelsVB.jl |
| Prior on topic proportions | logistic normal, with a K × K covariance |
| Fitting | variational EM, `train!(model, iter = iters)` |
| Default corpus | The Pollis Guide from PollisDatasets, one document per section |
| Printed | top 10 words of each topic, topic proportions of document 1 |
| Action groups | Visualise, Diagnose, Predict, Compare, Interpret |

The CTM is the model of [Blei and Lafferty (2006)](#ref-BL2006a); the package is that of [Proffitt (2016a)](#ref-Pro2016a).

## Inputs

| Input | Default | Tooltip |
| --- | --- | --- |
| **Corpus** | `corpus` | an array of text documents |
| **Topics (k)** | `10` | number of latent topics to discover |
| **Iterations** | `1000` | number of variational EM training iterations |

**Corpus** accepts any vector of strings, such as `docs = ["first doc", "second doc"]`. Its default loads `dataset("pollis_guide").text` from PollisDatasets.

## From text to a corpus

The code lowercases each document, replaces every character other than a letter or a space with a space, and splits the result into words. The sorted unique words form the vocabulary, and each document becomes a `Document` of vocabulary keys inside a `Corpus`, which the code comment calls TopicModelsVB's own type, not a document-term matrix.

`fixcorp!(corp, stop=true, condense=true, remove_empty_docs=true, trim=true)` then removes stop words, merges repeated words into counts, drops empty documents and trims the vocabulary to the words left. The README of TopicModelsVB.jl recommends running `fixcorp!` before loading a corpus into a model, and describes these keywords.

## Output

The main code ends with

```
showtopics(model, 10)
topicdist(model, 1)
```

`showtopics` prints the ten most probable words of every topic, and `topicdist` the topic proportions of document 1, a vector that sums to 1. In the README, `model.beta` holds the topic distributions of LDA and CTM models as a K × V matrix, with V the number of vocabulary terms, and `model.sigma` the topic covariance matrix of the CTM.

## Packages

The main code loads TopicModelsVB and, for the default corpus, PollisDatasets. The actions add LinearAlgebra, Random and Statistics for the evaluation code, Plots for the heatmap of **Topic Correlations**, and Graphs with GraphPlot for **Topic Network**.

The TopicModelsVB.jl entry of the panel points to a fork that accepts Distributions 0.25, precompiles on Julia 1.13 and fixes `predict` for fLDA and fCTM, following upstream pull request 42.

## References in the panel

| Section | Works |
| --- | --- |
| Software | [Proffitt (2016a)](#ref-Pro2016a) |
| Textbooks | [Jurafsky and Martin (2024)](#ref-JM2024a), [Bishop (2006)](#ref-Bis2006a) |
| Original Papers | [Blei and Lafferty (2006)](#ref-BL2006a), [Blei, Ng and Jordan (2003)](#ref-BNJ2003a), [Proffitt (2016b)](#ref-Pro2016b) |
| Evaluation | [Wallach, Murray, Salakhutdinov and Mimno (2009)](#ref-WMSM2009a), [Mimno, Wallach, Talley, Leenders and McCallum (2011)](#ref-MWTLM2011a) |

## References

<a id="ref-Bis2006a"></a>Bishop, C. M. (2006). *Pattern Recognition and Machine Learning*. Springer. [doi:10.1007/978-0-387-45528-0](https://doi.org/10.1007/978-0-387-45528-0)

<a id="ref-BNJ2003a"></a>Blei, D. M., Ng, A. Y., & Jordan, M. I. (2003). Latent Dirichlet Allocation. *Journal of Machine Learning Research* 3, 993-1022. [jmlr.org](https://jmlr.org/papers/v3/blei03a.html)

<a id="ref-BL2006a"></a>Blei, D. M., & Lafferty, J. D. (2006). Correlated Topic Models. *Advances in Neural Information Processing Systems* 18, 147-154. [proceedings.neurips.cc](https://proceedings.neurips.cc/paper/2005/hash/9e82757e9a1c12cb710ad680db11f6f1-Abstract.html)

<a id="ref-JM2024a"></a>Jurafsky, D., & Martin, J. H. (2024). *Speech and Language Processing* (3rd ed., draft). [web.stanford.edu](https://web.stanford.edu/~jurafsky/slp3/)

<a id="ref-MWTLM2011a"></a>Mimno, D., Wallach, H. M., Talley, E., Leenders, M., & McCallum, A. (2011). Optimizing Semantic Coherence in Topic Models. *Proceedings of the 2011 Conference on Empirical Methods in Natural Language Processing*, 262-272. [aclanthology.org](https://aclanthology.org/D11-1024/)

<a id="ref-Pro2016a"></a>Proffitt, E. (2016a). TopicModelsVB.jl: Variational Bayesian Topic Modeling in Julia. [github.com](https://github.com/ericproffitt/TopicModelsVB.jl)

<a id="ref-Pro2016b"></a>Proffitt, E. (2016b). Filtered Latent Dirichlet Allocation: Variational Algorithm. [github.com](https://github.com/ericproffitt/TopicModelsVB.jl/blob/master/fLDA/fLDA.pdf)

<a id="ref-WMSM2009a"></a>Wallach, H. M., Murray, I., Salakhutdinov, R., & Mimno, D. (2009). Evaluation Methods for Topic Models. *Proceedings of the 26th International Conference on Machine Learning*, 1105-1112. [doi:10.1145/1553374.1553515](https://doi.org/10.1145/1553374.1553515)

## See Also

- [Overview](overview.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
- [CTM](ctm.md) · [Focused CTM](fctm.md)
