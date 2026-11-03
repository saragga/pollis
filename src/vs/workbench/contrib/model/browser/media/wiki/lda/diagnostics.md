# Latent Dirichlet Allocation: Diagnostics

The **Diagnose** group of the **Latent Dirichlet Allocation** panel offers two measures: **Held-Out Perplexity**, how well the topics predict tokens kept out of fitting, and **Topic Coherence**, how often the top words of each topic appear in the same documents.

## Perplexity

[Blei, Ng and Jordan (2003)](#ref-BNJ2003a) define the perplexity of a held-out test set as

perplexity = exp(− Σ_d log p(w_d) / Σ_d N_d),

the exponential of minus the average log probability per word. In their words, it is monotonically decreasing in the likelihood of the test data and equivalent to the inverse of the geometric mean per-word likelihood, so a lower perplexity indicates better generalisation.

[Griffiths and Steyvers (2004)](#ref-GS2004a) use the same measure, and note that chance performance gives a perplexity equal to the size of the vocabulary.

## Document completion

[Wallach, Murray, Salakhutdinov and Mimno (2009)](#ref-WMSM2009a) describe document completion as estimating the probability of the second half of a document given the first: the first half of each held-out document is added to the training data and the second half is kept for evaluation.

The panel's **Held-Out Perplexity** follows the same idea within every document. With **Seed**, it holds out each token with probability **Held-Out Share**, fits LDA on the rest, and scores the held-out tokens. The description reads lower as better, and the action compares the result with a unigram baseline.

## The estimates scored

The held-out tokens are scored with the posterior-mean estimates of [Griffiths and Steyvers (2004)](#ref-GS2004a), computed from the topic counts of the fitted model:

- p(w ∣ topic j) = (n_j^(w) + β) / (n_j + Vβ)
- p(topic j ∣ d) = (n_d^(j) + α) / (n_d + kα)

with n_j^(w) the tokens of word w in topic j, n_j the tokens of topic j, n_d^(j) the tokens of document d in topic j and n_d those of document d. The probability of a held-out token of word w in document d is Σ_j p(w ∣ j) p(j ∣ d).

The baseline is an add-one unigram model, (count of w + 1) / (training tokens + V), which ignores the topics.

## Topic coherence

[Mimno, Wallach, Talley, Leenders and McCallum (2011)](#ref-MWTLM2011a) define the coherence of a topic from the document frequency D(v) of each word, the number of documents with at least one token of v, and the co-document frequency D(v, v′):

C = Σ over m = 2, …, M Σ over l = 1, …, m − 1 of log((D(v_m, v_l) + 1) / D(v_l)),

over the M most probable words of the topic. A smoothing count of 1 avoids the logarithm of zero.

**Topic Coherence** computes the measure with the top 10 words of each topic and plots it, with the mean in the title. In the panel's comment, near 0 means that the top words co-occur in the same documents.

## Coherence and expert judgement

[Mimno, Wallach, Talley, Leenders and McCallum (2011)](#ref-MWTLM2011a) built the measure on the observation that words belonging to a single concept tend to co-occur in the same documents. They compared it with the judgements of two domain experts on topics from 300,000 grant and related journal paper abstracts from the National Institutes of Health. Treating the topics the experts labelled as good as positive, coherence gave an average precision of 0.94, against 0.89 for topic size.

In their examples, scores closer to zero indicate higher coherence. They present it as a way of identifying specific semantic problems in topic models without human evaluations or external reference corpora.

## References

<a id="ref-BNJ2003a"></a>Blei, D. M., Ng, A. Y., & Jordan, M. I. (2003). Latent Dirichlet Allocation. *Journal of Machine Learning Research* 3, 993-1022. [jmlr.org](https://jmlr.org/papers/v3/blei03a.html)

<a id="ref-GS2004a"></a>Griffiths, T. L., & Steyvers, M. (2004). Finding Scientific Topics. *Proceedings of the National Academy of Sciences* 101(suppl. 1), 5228-5235. [doi:10.1073/pnas.0307752101](https://doi.org/10.1073/pnas.0307752101)

<a id="ref-MWTLM2011a"></a>Mimno, D., Wallach, H. M., Talley, E., Leenders, M., & McCallum, A. (2011). Optimizing Semantic Coherence in Topic Models. *Proceedings of the 2011 Conference on Empirical Methods in Natural Language Processing*, 262-272. [aclanthology.org](https://aclanthology.org/D11-1024/)

<a id="ref-WMSM2009a"></a>Wallach, H. M., Murray, I., Salakhutdinov, R., & Mimno, D. (2009). Evaluation Methods for Topic Models. *Proceedings of the 26th International Conference on Machine Learning*, 1105-1112. [doi:10.1145/1553374.1553515](https://doi.org/10.1145/1553374.1553515)

## See Also

- [Factsheet](factsheet.md) · [Overview](overview.md) · [Assumptions](assumptions.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
- [LDA](lda.md)
