# Correlated Topic Model: Focused CTM

The **Focused CTM** model fits `fCTM(corp, k)` of TopicModelsVB.jl, which the package calls the filtered correlated topic model: a CTM in which a switch sends some words to a background distribution, so that corpus-specific stop words stay out of the topics.

## The filter

[Proffitt (2016b)](#ref-Pro2016b) introduces filtering for LDA. A Bernoulli switch c, with probability η, decides for each word whether it is drawn from the distribution β_z of its topic or from the stop word distribution κ:

c ∼ Bernoulli(η),
w ∼ Categorical((1 − c) κ + c β_z).

The terms with the highest probability in κ are those most likely to be corpus-specific stop words, and their appearance in the topic distributions is suppressed. [Proffitt (2016b)](#ref-Pro2016b) presents filtered LDA as an extension of LDA that captures and filters out the stop words that generic stop word lists do not catch.

## The filtered CTM

The README of TopicModelsVB.jl applies the same idea to the CTM: filtering dynamically identifies and suppresses stop words that would otherwise clutter up the topic distribution output. The topic proportions keep the logistic normal prior of [Blei and Lafferty (2006)](#ref-BL2006a), with its covariance between topics.

The panel's bullet describes the model as a structured variant of the CTM that separates background words from topic-specific words, and the main code comment says that background words are filtered out of the topics.

## Variational updates

For filtered LDA, [Proffitt (2016b)](#ref-Pro2016b) uses a mean-field distribution with a Bernoulli factor τ for each switch beside the topic assignments and the proportions. Among the updates that differ from those of LDA, η becomes the average of the τ over all words, and κ is proportional to the words weighted by 1 − τ, the variational probability that the word comes from the background.

## The code

```
model = fCTM(corp, k)
train!(model, iter = iters)
showtopics(model, 10)
topicdist(model, 1)
```

The fitted model holds η in `model.eta` and κ in `model.kappa`. The held-out code of **Perplexity** and **CTM vs Focused CTM** uses both: for a Focused CTM, the probability of a word w is η · Σ_k θ_k β_{k,w} + (1 − η) κ_w.

The TopicModelsVB.jl entry of the panel points to a fork that, among other changes, fixes `predict` for fLDA and fCTM.

## CTM vs Focused CTM

**CTM vs Focused CTM** fits a CTM and a Focused CTM with the same k and iterations on the same training documents, and prints for each the held-out perplexity and the mean UMass coherence of [Mimno, Wallach, Talley, Leenders and McCallum (2011)](#ref-MWTLM2011a). The description of the action sets the question as topic quality with and without background separation.

The README illustrates the filtered model on National Science Foundation abstracts, where it labels the nine topics of an fCTM from their top words and reads the largest entries of `model.sigma` as related topics.

## References

<a id="ref-BL2006a"></a>Blei, D. M., & Lafferty, J. D. (2006). Correlated Topic Models. *Advances in Neural Information Processing Systems* 18, 147-154. [proceedings.neurips.cc](https://proceedings.neurips.cc/paper/2005/hash/9e82757e9a1c12cb710ad680db11f6f1-Abstract.html)

<a id="ref-MWTLM2011a"></a>Mimno, D., Wallach, H. M., Talley, E., Leenders, M., & McCallum, A. (2011). Optimizing Semantic Coherence in Topic Models. *Proceedings of the 2011 Conference on Empirical Methods in Natural Language Processing*, 262-272. [aclanthology.org](https://aclanthology.org/D11-1024/)

<a id="ref-Pro2016b"></a>Proffitt, E. (2016b). Filtered Latent Dirichlet Allocation: Variational Algorithm. [github.com](https://github.com/ericproffitt/TopicModelsVB.jl/blob/master/fLDA/fLDA.pdf)

## See Also

- [Factsheet](factsheet.md) · [Overview](overview.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
- [CTM](ctm.md)
