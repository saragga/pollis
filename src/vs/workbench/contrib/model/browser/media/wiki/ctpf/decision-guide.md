# Collaborative Topic Poisson Factorisation: Decision Guide

Choices in the **Collaborative Topic Poisson Factorisation** panel: CTPF or a model of the text alone, the number of topics, the ratings to supply, and the action that answers a given question.

## CTPF, LDA or Poisson factorisation

| Model | Uses | Recommends new documents |
| --- | --- | --- |
| LDA | text only | no ratings modelled |
| Poisson factorisation | ratings only | no, in-matrix only |
| CTPF | text and ratings | yes, from content |

[Gopalan, Charlin and Blei (2014)](#ref-GCB2014a) compare CTPF with variants of their own: a content-only model without the offsets, ratings-only Poisson factorisation, which can only make in-matrix predictions, and a decoupled model with separate user vectors for content and ratings. They report that coupling the latent spaces through the offsets is essential for good predictive performance, and that CTPF predicts significantly better than its variants and collaborative topic regression.

## CTPF vs LDA

**CTPF vs LDA** fits an LDA on the text alone and a CTPF on the text and the ratings, both on the odd-position words, and prints the perplexity of each on the same held-out words. The description of the action explains why the comparison uses held-out words: in-sample likelihoods are not comparable, since CTPF also models the ratings.

[Gopalan, Charlin and Blei (2014)](#ref-GCB2014a) initialise the topics and topic intensities of their CTPF models with LDA, and the README of TopicModelsVB.jl shows how to do the same, with `ctpf_model.alef = exp.(model.beta)` from a fitted LDA, CTM or filtered model.

## Number of topics

**Compare k Topics** fits CTPF with k = 5, 10, 20 and 50 and prints, for each, the mean percentile rank of the held-out readers and the held-out word perplexity. A higher rank and a lower perplexity are better on the two halves of the model.

[Gopalan, Charlin and Blei (2014)](#ref-GCB2014a) set K = 100 in all their experiments, on the Mendeley and arXiv data sets.

## Supplying ratings

**Ratings** is a users × documents matrix of positive integers, 0 for unrated, with one column per document of **Corpus** in the same order. [Gopalan, Charlin and Blei (2014)](#ref-GCB2014a) treat the clicks of their arXiv data as implicit feedback, binary data, and the Mendeley data as a binary matrix of articles in libraries.

[Gopalan, Hofman and Blei (2015)](#ref-GHB2015a) describe implicit data, such as purchases, clicks or views, as typically sparse, with most values of the matrix zero.

## Which action to use

| Question | Action |
| --- | --- |
| What are the topics? | **Top Words per Topic**, **Topic Labels** |
| What does each user prefer? | **User-Topic Distribution** |
| How well does the text model predict unseen words? | **Perplexity** |
| How well are held-out readers ranked? | **Held-Out User Rank** |
| What should a user read next? | **Recommend Items** |
| Who should read a new document? | **Infer Topics** |
| How many topics? | **Compare k Topics** |
| Do the ratings change the topics? | **CTPF vs LDA** |
| What is a document about, and how do its readers differ? | **Item-Topic Mix** |

## Reading further

The panel lists [Wang and Blei (2011)](#ref-WB2011a), [Gopalan, Charlin and Blei (2014)](#ref-GCB2014a) and [Gopalan, Hofman and Blei (2015)](#ref-GHB2015a) as original papers. For the held-out evaluation of the text, [Wallach, Murray, Salakhutdinov and Mimno (2009)](#ref-WMSM2009a) compare methods for estimating the probability of held-out documents, document completion among them. The README of TopicModelsVB.jl adds that a CTPF model can be warm started with the topics of another model of the package, `ctpf_model.alef = exp.(model.beta)`, as in the original paper.

## References

<a id="ref-GCB2014a"></a>Gopalan, P., Charlin, L., & Blei, D. M. (2014). Content-Based Recommendations with Poisson Factorization. *Advances in Neural Information Processing Systems* 27, 3176-3184. [cs.columbia.edu](http://www.cs.columbia.edu/~blei/papers/GopalanCharlinBlei2014.pdf)

<a id="ref-GHB2015a"></a>Gopalan, P., Hofman, J. M., & Blei, D. M. (2015). Scalable Recommendation with Hierarchical Poisson Factorization. *Proceedings of the Thirty-First Conference on Uncertainty in Artificial Intelligence*, 326-335. [auai.org](https://auai.org/uai2015/proceedings/papers/208.pdf)

<a id="ref-WMSM2009a"></a>Wallach, H. M., Murray, I., Salakhutdinov, R., & Mimno, D. (2009). Evaluation Methods for Topic Models. *Proceedings of the 26th International Conference on Machine Learning*, 1105-1112. [doi:10.1145/1553374.1553515](https://doi.org/10.1145/1553374.1553515)

<a id="ref-WB2011a"></a>Wang, C., & Blei, D. M. (2011). Collaborative Topic Modeling for Recommending Scientific Articles. *Proceedings of the 17th ACM SIGKDD International Conference on Knowledge Discovery and Data Mining*, 448-456. [doi:10.1145/2020408.2020480](https://doi.org/10.1145/2020408.2020480)

## See Also

- [Factsheet](factsheet.md) · [Overview](overview.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md)
- [Topic Model](topic-model.md) · [Poisson Factorisation](poisson-factorisation.md) · [User-Item Ratings](user-item-ratings.md)
