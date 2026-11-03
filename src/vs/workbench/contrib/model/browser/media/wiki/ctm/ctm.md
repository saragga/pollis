# Correlated Topic Model: CTM

The **CTM** model fits the correlated topic model of [Blei and Lafferty (2006)](#ref-BL2006a) with `CTM(corp, k)` of TopicModelsVB.jl: topics over the vocabulary, and document proportions drawn from a logistic normal distribution whose covariance captures correlations between topics.

## The model

Let μ and Σ be a K-dimensional mean and covariance and β₁, …, β_K the topics. For each document:

1. Draw η ∼ N(μ, Σ).
2. For each of its N words, draw a topic z_n ∼ Mult(f(η)), with f(η)_i = exp(η_i) / Σ_j exp(η_j).
3. Draw the word w_n ∼ Mult(β_{z_n}).

[Blei and Lafferty (2006)](#ref-BL2006a) call this process identical to that of LDA except for the logistic normal in place of the Dirichlet, and the covariance matrix the means by which the CTM models correlations between topics.

## Inference

The posterior of η and of the topic assignments is intractable. [Blei and Lafferty (2006)](#ref-BL2006a) use a factorised variational distribution: independent univariate Gaussians for the components of η and multinomials for the topic assignments. The non-conjugacy of the logistic normal makes the expected log normaliser hard to compute, so they bound it with a Taylor expansion and an extra variational parameter ζ.

Coordinate ascent optimises the variational parameters, and the updates for the means and variances of η need iterative methods. The variational EM algorithm alternates these per-document fits with maximum likelihood estimates of the topics, μ and Σ.

## The code

```
model = CTM(corp, k)
train!(model, iter = iters)
showtopics(model, 10)
topicdist(model, 1)
```

`CTM(corp, K)` is, in the README, the correlated topic model with K topics. The fitted model holds the topics in `model.beta`, a K × V matrix, and the topic covariance in `model.sigma`, from which **Topic Correlations** and **Topic Network** derive their correlation matrix. The README shows `model.sigma` for a fitted model and reads its largest off-diagonal entries.

## The default run

The default fits 10 topics in 1000 iterations to the sections of The Pollis Guide, after the preprocessing that lowercases the text, keeps letters only and removes stop words. The output lists the top ten words of each topic and the topic proportions of the first section.

All the actions of the panel fit `CTM`, and **CTM vs Focused CTM** also fits `fCTM` beside it.

## Results in the original paper

[Blei and Lafferty (2006)](#ref-BL2006a) fitted a 100-topic CTM to 16 351 Science articles from 1990 to 1999 and built a graph of the topics and their correlations. On 1452 documents from 1960, with ten-fold cross validation, the CTM gave a higher held-out log probability than LDA at every number of topics they tried, peaking close to 90 topics where LDA peaked near 30.

The comparison used importance sampling with the fitted variational distribution as the proposal, to avoid comparing bounds.

## References

<a id="ref-BL2006a"></a>Blei, D. M., & Lafferty, J. D. (2006). Correlated Topic Models. *Advances in Neural Information Processing Systems* 18, 147-154. [proceedings.neurips.cc](https://proceedings.neurips.cc/paper/2005/hash/9e82757e9a1c12cb710ad680db11f6f1-Abstract.html)

## See Also

- [Factsheet](factsheet.md) · [Overview](overview.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
- [Focused CTM](fctm.md)
