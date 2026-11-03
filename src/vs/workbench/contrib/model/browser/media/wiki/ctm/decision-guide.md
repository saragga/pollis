# Correlated Topic Model: Decision Guide

Choices in the **Correlated Topic Model** panel: the CTM or the Filtered CTM, the number of topics, the number of iterations, and the action that answers a given question.

## CTM or Filtered CTM

| Model | Bullet of the panel | In TopicModelsVB.jl |
| --- | --- | --- |
| CTM | extends LDA with a logistic-normal prior; captures correlations between topics via a covariance matrix | `CTM(corp, K)`, correlated topic model |
| Filtered CTM | identifies and suppresses stop words that would otherwise clutter up the topics | `fCTM(corp, K)`, filtered correlated topic model |

The README describes the filter as dynamically identifying and suppressing stop words that would otherwise clutter the topic distributions. **CTM vs Filtered CTM** fits both on the same training documents and prints their held-out perplexity and mean coherence side by side.

## CTM or LDA

[Blei and Lafferty (2006)](#ref-BL2006a) motivate the CTM by the independence of the topic proportions under the Dirichlet of [Blei, Ng and Jordan (2003)](#ref-BNJ2003a). In their experiments on Science articles, the CTM gave a better fit to held-out documents than LDA and supported more topics, and it predicted the remaining words of partially observed documents with lower perplexity when few words had been observed.

They also note a cost of the logistic normal: it is not conjugate to the multinomial, so the variational updates for the CTM need iterative methods where those for LDA have closed forms.

## Number of topics

**Compare k Topics** fits the selected model with k = 5, 10, 20 and 50 on the training documents and prints the held-out perplexity and the mean coherence for each. [Blei and Lafferty (2006)](#ref-BL2006a) compare numbers of topics in the same way, by the log probability of held-out data under ten-fold cross validation: for their 1960 Science collection, the likelihood of LDA peaks near 30 topics and that of the CTM close to 90.

[Mimno, Wallach, Talley, Leenders and McCallum (2011)](#ref-MWTLM2011a) report a strong relationship between the size of topics and their quality as judged by domain experts: as the number of topics grows, the smallest topics are almost always of poor quality.

## Iterations

**Iterations** sets the rounds of variational EM, 1000 by default. [Blei and Lafferty (2006)](#ref-BL2006a) ran variational inference until the relative change in the bound was under 10⁻⁶ and variational EM until the relative change in the likelihood bound was under 10⁻⁵.

The README of TopicModelsVB.jl trains with `tol = 0` to complete every iteration, and with `checkelbo` to compute the change in the evidence lower bound only every few iterations.

## Which action to use

| Question | Action |
| --- | --- |
| What are the topics? | **Top Words per Topic**, **Topic Labels** |
| Which topics occur together? | **Topic Correlations**, **Topic Network** |
| How well does the model predict new text? | **Perplexity** |
| Are the top words of a topic used together? | **Topic Coherence** |
| What is a new document about? | **Infer Topics** |
| Which documents represent a topic? | **Top Documents** |
| How many topics? | **Compare k Topics** |
| Does the background filter help? | **CTM vs Filtered CTM** |

## Reading further

For evaluation, the panel lists [Wallach, Murray, Salakhutdinov and Mimno (2009)](#ref-WMSM2009a), on estimating the probability of held-out documents, and [Mimno, Wallach, Talley, Leenders and McCallum (2011)](#ref-MWTLM2011a), on topic coherence. Its software reference is [Proffitt (2016a)](#ref-Pro2016a). The original papers are [Blei, Ng and Jordan (2003)](#ref-BNJ2003a) for LDA, [Blei and Lafferty (2006)](#ref-BL2006a) for the CTM and [Proffitt (2016b)](#ref-Pro2016b) for the filter of the Filtered CTM.

## References

<a id="ref-BL2006a"></a>Blei, D. M., & Lafferty, J. D. (2006). Correlated Topic Models. *Advances in Neural Information Processing Systems* 18, 147-154. [proceedings.neurips.cc](https://proceedings.neurips.cc/paper/2005/hash/9e82757e9a1c12cb710ad680db11f6f1-Abstract.html)

<a id="ref-BNJ2003a"></a>Blei, D. M., Ng, A. Y., & Jordan, M. I. (2003). Latent Dirichlet Allocation. *Journal of Machine Learning Research* 3, 993-1022. [jmlr.org](https://jmlr.org/papers/v3/blei03a.html)

<a id="ref-MWTLM2011a"></a>Mimno, D., Wallach, H. M., Talley, E., Leenders, M., & McCallum, A. (2011). Optimizing Semantic Coherence in Topic Models. *Proceedings of the 2011 Conference on Empirical Methods in Natural Language Processing*, 262-272. [aclanthology.org](https://aclanthology.org/D11-1024/)

<a id="ref-Pro2016a"></a>Proffitt, E. (2016a). TopicModelsVB.jl: Variational Bayesian Topic Modeling in Julia. [github.com](https://github.com/ericproffitt/TopicModelsVB.jl)

<a id="ref-Pro2016b"></a>Proffitt, E. (2016b). Filtered Latent Dirichlet Allocation: Variational Algorithm. [github.com](https://github.com/ericproffitt/TopicModelsVB.jl/blob/master/fLDA/fLDA.pdf)

<a id="ref-WMSM2009a"></a>Wallach, H. M., Murray, I., Salakhutdinov, R., & Mimno, D. (2009). Evaluation Methods for Topic Models. *Proceedings of the 26th International Conference on Machine Learning*, 1105-1112. [doi:10.1145/1553374.1553515](https://doi.org/10.1145/1553374.1553515)

## See Also

- [Factsheet](factsheet.md) · [Overview](overview.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md)
- [CTM](ctm.md) · [Filtered CTM](fctm.md)
