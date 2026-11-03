# Correlated Topic Model: Assumptions

What the models of the **Correlated Topic Model** panel take for granted about documents, words and topics, and what the code's preprocessing assumes about the text.

## Documents as bags of words

[Blei and Lafferty (2006)](#ref-BL2006a) describe a topic model as a generative probabilistic model that uses a small number of distributions over a vocabulary to describe a document collection. The words of each document arise from a mixture of topics; the topics are shared by all documents, and the proportions are specific to each document.

In the panel, each document is reduced to the counts of its vocabulary words. The README of TopicModelsVB.jl shows that condensing a corpus, which the code does with `condense=true`, merges repeated words and gives up their order, and advises against condensing when term order is to be kept.

## Correlated topic proportions

The CTM draws the log proportions η of each document from a multivariate normal N(μ, Σ) and maps them to the simplex. [Blei and Lafferty (2006)](#ref-BL2006a) explain that the logistic normal models correlations between the components through the covariance matrix of the normal distribution.

The contrast is with the Dirichlet of [Blei, Ng and Jordan (2003)](#ref-BNJ2003a), under which, in the account of [Blei and Lafferty (2006)](#ref-BL2006a), the components of the proportions vector are nearly independent. The CTM keeps the rest of the LDA process: given the proportions, each word picks a topic and is drawn from that topic.

## Background words in the Focused CTM

**Focused CTM** adds a second source of words. In the filtered LDA of [Proffitt (2016b)](#ref-Pro2016b), a Bernoulli switch c with probability η decides for each word whether it comes from the topic distribution β_z or from the stop word distribution κ:

w ∼ Categorical((1 − c) κ + c β_z).

The README describes the filtered CTM in the same terms: filtering dynamically identifies and suppresses stop words that would otherwise clutter up the topic distributions.

## Variational inference

The posterior of the CTM is intractable, and [Blei and Lafferty (2006)](#ref-BL2006a) approximate it with mean-field variational methods: a factorised distribution whose parameters are fitted to make its Kullback-Leibler divergence to the true posterior small. Since the logistic normal is not conjugate to the multinomial, they bound the log normaliser with a Taylor expansion and add a variational parameter for it.

Parameters are estimated by variational EM: the E-step fits the variational parameters of each document, and the M-step re-estimates the topics, μ and Σ. The TopicModelsVB.jl README describes variational inference as fast, with distributions approximated to ensure tractability.

## Preprocessing

The code keeps only letters, lowercases them and removes stop words with `fixcorp!(..., stop=true)`. Words are split on spaces, so hyphenated terms become two words and digits are dropped.

The vocabulary is the set of distinct words left in the corpus after `trim=true`. A new document, in **Infer Topics**, is reduced to the words already in that vocabulary, then condensed into counts with `fixcorp!(new_corp, condense=true)`.

## Number of topics

**Topics (k)** fixes K before fitting. [Blei and Lafferty (2006)](#ref-BL2006a) compare the CTM with LDA across numbers of topics on held-out Science articles: in their experiment the held-out likelihood of LDA peaks near 30 topics and that of the CTM close to 90. **Compare k Topics** runs the panel's own comparison for k = 5, 10, 20 and 50, each fitted on the same training documents with the same **Iterations**.

## References

<a id="ref-BNJ2003a"></a>Blei, D. M., Ng, A. Y., & Jordan, M. I. (2003). Latent Dirichlet Allocation. *Journal of Machine Learning Research* 3, 993-1022. [jmlr.org](https://jmlr.org/papers/v3/blei03a.html)

<a id="ref-BL2006a"></a>Blei, D. M., & Lafferty, J. D. (2006). Correlated Topic Models. *Advances in Neural Information Processing Systems* 18, 147-154. [proceedings.neurips.cc](https://proceedings.neurips.cc/paper/2005/hash/9e82757e9a1c12cb710ad680db11f6f1-Abstract.html)

<a id="ref-Pro2016b"></a>Proffitt, E. (2016b). Filtered Latent Dirichlet Allocation: Variational Algorithm. [github.com](https://github.com/ericproffitt/TopicModelsVB.jl/blob/master/fLDA/fLDA.pdf)

## See Also

- [Factsheet](factsheet.md) · [Overview](overview.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
- [CTM](ctm.md) · [Focused CTM](fctm.md)
