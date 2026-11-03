# Correlated Topic Model: Overview

The **Correlated Topic Model** panel fits topic models whose topic proportions can be correlated: the correlated topic model (CTM) and its focused variant, `fCTM`, both trained by variational Bayes with TopicModelsVB.jl.

## From LDA to the CTM

[Blei and Lafferty (2006)](#ref-BL2006a) start from latent Dirichlet allocation, the model of [Blei, Ng and Jordan (2003)](#ref-BNJ2003a), in which the words of each document arise from a mixture of topics, each topic a distribution over the vocabulary, with document-specific proportions drawn from a Dirichlet distribution. They name a limitation of that model: it cannot represent correlation between topics, even though a document about genetics is more likely also to be about disease than about x-ray astronomy.

The limitation, in their account, stems from the Dirichlet: under it, the components of the proportions vector are nearly independent. The CTM replaces the Dirichlet with a logistic normal distribution, whose covariance matrix lets the presence of one topic be correlated with the presence of another.

## The generative process

For a K-dimensional mean μ and covariance Σ, and topics β₁, …, β_K over a fixed vocabulary, [Blei and Lafferty (2006)](#ref-BL2006a) generate an N-word document as follows:

1. Draw η ∼ N(μ, Σ).
2. For each word n, draw a topic assignment z_n from Mult(f(η)), with f(η)_i = exp(η_i) / Σ_j exp(η_j).
3. Draw the word w_n from Mult(β_{z_n}).

The process is that of LDA, except that the topic proportions come from a logistic normal rather than a Dirichlet.

## The focused variant

The second model of the panel, **Focused CTM**, runs `fCTM` of TopicModelsVB.jl, which the package documentation calls the filtered correlated topic model. The README states that filtering the CTM dynamically identifies and suppresses stop words that would otherwise clutter the topic distributions.

[Proffitt (2016b)](#ref-Pro2016b) describes the filter for LDA: a Bernoulli switch decides, for every word, whether it is drawn from a topic or from a separate stop word distribution κ, and the words with the highest probability in κ are those most likely to be corpus-specific stop words.

## TopicModelsVB.jl

[Proffitt (2016a)](#ref-Pro2016a) wrote TopicModelsVB.jl, a Julia package for variational Bayesian topic modelling. Its README contrasts the two ways of fitting topic models, Markov chain Monte Carlo and variational inference, and says that the package takes the second approach. The CPU models it lists are LDA, filtered LDA, CTM, filtered CTM and collaborative topic Poisson factorisation, and GPU versions of LDA, CTM and CTPF are trained with the `@gpu` macro.

## Actions

| Group | Actions |
| --- | --- |
| Visualise | **Top Words per Topic**, **Topic Correlations** |
| Diagnose | **Perplexity**, **Topic Coherence** |
| Predict | **Infer Topics**, **Top Documents** |
| Compare | **Compare k Topics**, **CTM vs Focused CTM** |
| Interpret | **Topic Network**, **Topic Labels** |

Every action rebuilds the corpus and fits a model of its own; **CTM vs Focused CTM** fits both models.

## Wikis and notebooks

The Factsheet lists the inputs, the preprocessing and the output, and Assumptions what the models take for granted about the documents. Diagnostics covers held-out perplexity and topic coherence, Interpretation the topics, proportions and correlations, and the Decision Guide the choice of model and of k. The CTM and Focused CTM pages describe each model.

The notebooks are CTM, on the logistic-normal prior for capturing topic correlations, and Focused CTM, on background word separation. The textbooks in the panel's list are [Jurafsky and Martin (2024)](#ref-JM2024a) and [Bishop (2006)](#ref-Bis2006a).

## References

<a id="ref-Bis2006a"></a>Bishop, C. M. (2006). *Pattern Recognition and Machine Learning*. Springer. [doi:10.1007/978-0-387-45528-0](https://doi.org/10.1007/978-0-387-45528-0)

<a id="ref-BNJ2003a"></a>Blei, D. M., Ng, A. Y., & Jordan, M. I. (2003). Latent Dirichlet Allocation. *Journal of Machine Learning Research* 3, 993-1022. [jmlr.org](https://jmlr.org/papers/v3/blei03a.html)

<a id="ref-BL2006a"></a>Blei, D. M., & Lafferty, J. D. (2006). Correlated Topic Models. *Advances in Neural Information Processing Systems* 18, 147-154. [proceedings.neurips.cc](https://proceedings.neurips.cc/paper/2005/hash/9e82757e9a1c12cb710ad680db11f6f1-Abstract.html)

<a id="ref-JM2024a"></a>Jurafsky, D., & Martin, J. H. (2024). *Speech and Language Processing* (3rd ed., draft). [web.stanford.edu](https://web.stanford.edu/~jurafsky/slp3/)

<a id="ref-Pro2016a"></a>Proffitt, E. (2016a). TopicModelsVB.jl: Variational Bayesian Topic Modeling in Julia. [github.com](https://github.com/ericproffitt/TopicModelsVB.jl)

<a id="ref-Pro2016b"></a>Proffitt, E. (2016b). Filtered Latent Dirichlet Allocation: Variational Algorithm. [github.com](https://github.com/ericproffitt/TopicModelsVB.jl/blob/master/fLDA/fLDA.pdf)

## See Also

- [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
- [CTM](ctm.md) · [Focused CTM](fctm.md)
