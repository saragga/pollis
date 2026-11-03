# Collaborative Topic Poisson Factorisation: Diagnostics

The **Diagnose** group of the **Collaborative Topic Poisson Factorisation** panel evaluates the two halves of the model on held-out data: the text, by the perplexity of unseen words, and the ratings, by the rank of held-out readers among the recommendations.

## Perplexity

**Perplexity** fits the model on the odd-position words of every document and scores the even-position words, the half that was held out. [Wallach, Murray, Salakhutdinov and Mimno (2009)](#ref-WMSM2009a) describe this kind of evaluation as document completion: estimating the probability of the second half of a document given the first.

The probability of word v in document d is the normalised product of the expected topics and the expected intensities,

p(v ∣ d) ∝ Σ_k E[β_vk] E[θ_dk],

with E[β] = `model.alef ./ model.bet` and E[θ_d] = `model.gimel[d] ./ model.dalet`. The action returns exp(−ll / n), the exponential of minus the average log probability of the scored words; lower is better.

## Words that were never fitted

Words that appear only in the held-out half have no topic weight, and the code comment explains that they are not scored. Only words in `seen`, the set of terms of the fitted half, enter the sum.

Documents with no scored word are skipped. The ratings are kept for every document, so the fitted model uses the full rating matrix while its text is scored on unseen words.

## Held-Out User Rank

**Held-Out User Rank** follows the README of TopicModelsVB.jl: with `Random.seed!(1)`, it removes one reader at random from each document that has at least one, trains the model, and looks up the held-out user in `model.drecs[d]`, the users recommended for document d.

For a list of length n where the held-out user appears at position p, the score is (n − p) / (n − 1). The code comment reads 1 as the held-out user ranked first for its document and 0.5 as random; the action returns the mean over the documents.

## The ranking that is scored

[Gopalan, Charlin and Blei (2014)](#ref-GCB2014a) rank recommendations by the posterior expected Poisson rate, score_ud = E[η_uᵀ(θ_d + ε_d)], and the README exposes the scores as `model.scores`, an M × U matrix. The lists in `model.drecs` and `model.urecs` order the users and the documents by those scores.

The README's CiteULike example uses the same proportional ranking and reports it for one document as the position of the held-out user among all non-readers.

## Training rounds

`train!(model, iter = iters)` runs the coordinate ascent of [Gopalan, Charlin and Blei (2014)](#ref-GCB2014a), which updates the Gamma variational parameters of the topics, intensities, preferences and offsets, and the multinomial parameters of the auxiliary variables, in turn.

The panel's actions pass `printelbo = false`. The README recommends checking the evidence lower bound infrequently when training on the GPU, since it is computed on the CPU, and turns it off with `checkelbo = Inf` in its examples.

## References

<a id="ref-GCB2014a"></a>Gopalan, P., Charlin, L., & Blei, D. M. (2014). Content-Based Recommendations with Poisson Factorization. *Advances in Neural Information Processing Systems* 27, 3176-3184. [cs.columbia.edu](http://www.cs.columbia.edu/~blei/papers/GopalanCharlinBlei2014.pdf)

<a id="ref-WMSM2009a"></a>Wallach, H. M., Murray, I., Salakhutdinov, R., & Mimno, D. (2009). Evaluation Methods for Topic Models. *Proceedings of the 26th International Conference on Machine Learning*, 1105-1112. [doi:10.1145/1553374.1553515](https://doi.org/10.1145/1553374.1553515)

## See Also

- [Factsheet](factsheet.md) · [Overview](overview.md) · [Assumptions](assumptions.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
- [Topic Model](topic-model.md) · [Poisson Factorisation](poisson-factorisation.md) · [User-Item Ratings](user-item-ratings.md)
