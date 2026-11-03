# Correlated Topic Model: Diagnostics

The **Diagnose** group of the **Correlated Topic Model** panel measures a fitted model in two ways: how well it predicts words of documents it has not seen, and how often the top words of each topic appear in the same documents.

## Held-out perplexity

[Blei and Lafferty (2006)](#ref-BL2006a) define the perplexity of a word distribution as the inverse of the per-word geometric average of the probability of the observations: lower values mean more predictive power. With observed words w_{1:P} and the remaining words of each held-out document,

Perp = exp(−Σ_d Σ_{i>P} log p(w_i ∣ w_{1:P}) / Σ_d (N_d − P)).

They describe perplexity as the effective number of equally likely words according to the model.

## Document completion

[Wallach, Murray, Salakhutdinov and Mimno (2009)](#ref-WMSM2009a) describe document completion: the probability of the second half of a document given the first. **Perplexity** also observes one part of each held-out document and scores the rest. It holds out 20% of the documents with `randperm(Xoshiro(1), ...)` and fits the model on the rest.

For each held-out document with at least two distinct words, the odd-numbered distinct terms, with their counts, form the observed part; `predict` infers the topic proportions from them with the topics held fixed. The even-numbered distinct terms are scored, so the split is one of distinct words rather than of word positions, and the two parts need not hold the same number of words. Each scored term has probability Σ_k θ_k β_{k,w}, weighted by its count, and the action returns exp(−ll / n).

Words absent from the training documents have zero topic weight, so the code removes them from both parts. For the Filtered CTM, the probability mixes in the background distribution: η · Σ_k θ_k β_{k,w} + (1 − η) κ_w.

## Reading the perplexity

The panel's description reads lower perplexity as better; the code comment adds that the held-out value is comparable across k because the documents were not used for fitting.

[Blei and Lafferty (2006)](#ref-BL2006a), for whom lower numbers denote more predictive power, use the same kind of measure for the CTM: predictive perplexity on partially observed held-out documents, as a function of the share of words observed.

## Topic Coherence

**Topic Coherence** computes the UMass coherence of [Mimno, Wallach, Talley, Leenders and McCallum (2011)](#ref-MWTLM2011a). With D(v) the number of documents that contain word v and D(v, v′) the number of documents that contain both, the coherence of a topic t with top words v₁, …, v_M is

C(t) = Σ over m = 2, …, M and l = 1, …, m − 1 of log((D(v_m, v_l) + 1) / D(v_l)).

The smoothing count of 1 avoids the logarithm of zero. The panel takes M = 10 and prints the topics from the least coherent to the most, then the mean.

## Reading the coherence

[Mimno, Wallach, Talley, Leenders and McCallum (2011)](#ref-MWTLM2011a) built the measure from the co-occurrence of words in the documents being modelled, without an external reference collection, and found it a better indicator of topics judged poor by domain experts than the size of the topic. The panel's code comment reads values closer to 0 as more coherent.

Coherence is computed on the full corpus in **Topic Coherence**, **Compare k Topics** and **CTM vs Filtered CTM**, while perplexity uses the held-out documents only.

## Training

`train!(model, iter = iters)` runs **Iterations** rounds of variational EM. The README of TopicModelsVB.jl shows `train!` with `tol = 0` to complete all iterations and `checkelbo` to control how often the evidence lower bound is computed; the actions of the panel pass `printelbo = false`. The main code calls `train!` with `iter` alone, and **Iterations**, whose tooltip reads "number of variational EM training iterations", sets that value for the main code and for every action.

## References

<a id="ref-BL2006a"></a>Blei, D. M., & Lafferty, J. D. (2006). Correlated Topic Models. *Advances in Neural Information Processing Systems* 18, 147-154. [proceedings.neurips.cc](https://proceedings.neurips.cc/paper/2005/hash/9e82757e9a1c12cb710ad680db11f6f1-Abstract.html)

<a id="ref-MWTLM2011a"></a>Mimno, D., Wallach, H. M., Talley, E., Leenders, M., & McCallum, A. (2011). Optimizing Semantic Coherence in Topic Models. *Proceedings of the 2011 Conference on Empirical Methods in Natural Language Processing*, 262-272. [aclanthology.org](https://aclanthology.org/D11-1024/)

<a id="ref-WMSM2009a"></a>Wallach, H. M., Murray, I., Salakhutdinov, R., & Mimno, D. (2009). Evaluation Methods for Topic Models. *Proceedings of the 26th International Conference on Machine Learning*, 1105-1112. [doi:10.1145/1553374.1553515](https://doi.org/10.1145/1553374.1553515)

## See Also

- [Factsheet](factsheet.md) · [Overview](overview.md) · [Assumptions](assumptions.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
- [CTM](ctm.md) · [Filtered CTM](fctm.md)
