# Collaborative Topic Poisson Factorisation: Overview

The **Collaborative Topic Poisson Factorisation** panel fits CTPF, a model of documents and of the users who rate them, with `CTPF(corp, k)` of TopicModelsVB.jl. The same k topics describe what the documents are about and what the users prefer, and the fitted model recommends documents to users and users to documents.

## The model in brief

[Gopalan, Charlin and Blei (2014)](#ref-GCB2014a) develop CTPF as a generative model of articles and reader preferences. It models both the reader behaviour and the texts with Poisson distributions, and connects the latent topics that represent the texts with the latent preferences that represent the readers.

The panel's first bullet gives the same structure: a joint model that combines a topic model for document content with Poisson factorisation for user-item ratings. Its second bullet describes k as the number of latent topics shared between the document model and the recommendation model.

## Where the model comes from

[Gopalan, Charlin and Blei (2014)](#ref-GCB2014a) name two models that CTPF draws on. Collaborative topic regression, of [Wang and Blei (2011)](#ref-WB2011a), combines collaborative filtering with probabilistic topic modelling to recommend scientific articles. Poisson factorisation, of [Gopalan, Hofman and Blei (2015)](#ref-GHB2015a), is a probabilistic matrix factorisation that replaces the Gaussian likelihood and real-valued representations with a Poisson likelihood and non-negative representations.

CTPF links the two factorisations through a correction term borrowed from collaborative topic regression: a vector of topic offsets for each document, which captures the deviation of its readership from its content.

## Recommending old and new documents

Once the posterior is fitted, [Gopalan, Charlin and Blei (2014)](#ref-GCB2014a) rank each user's unread documents by the expected Poisson rate E[η_uᵀ(θ_d + ε_d)]. A document with readers is recommended from its content and its offsets; a document without readers, the cold start case, from its content alone.

In their account, the two cases are not disjoint tasks but a continuum: the model can give better predictions for documents with few ratings by using their topic intensities.

## TopicModelsVB.jl

[Proffitt (2016)](#ref-Pro2016a) lists CTPF among the CPU models of TopicModelsVB.jl, as the collaborative topic Poisson factorisation model with K topics, beside LDA, filtered LDA, CTM and filtered CTM. Its README describes CTPF as a collaborative filtering topic model that uses the thematic structure of documents to improve recommendations beyond what the document-user matrix alone allows, and that mitigates the cold start problem.

## Actions

| Group | Actions |
| --- | --- |
| Visualise | **Top Words per Topic**, **User-Topic Distribution** |
| Diagnose | **Perplexity**, **Held-Out User Rank** |
| Predict | **Recommend Items**, **Infer Topics** |
| Compare | **Compare k Topics**, **CTPF vs LDA** |
| Interpret | **Topic Labels**, **Item-Topic Mix** |

Each action rebuilds the corpus from **Corpus** and **Ratings** and fits its own model.

## Wikis and notebooks

The Factsheet lists the inputs, the construction of the corpus and the output. Assumptions covers the Poisson model of words and ratings, Diagnostics the held-out evaluation, Interpretation the topics, preferences and offsets, and the Decision Guide the choices of the panel. Three pages describe the components of the model: the Topic Model, Poisson Factorisation and the User-Item Ratings.

The notebook CTPF covers joint document modelling and recommendation with TopicModelsVB.jl.

## References

<a id="ref-GCB2014a"></a>Gopalan, P., Charlin, L., & Blei, D. M. (2014). Content-Based Recommendations with Poisson Factorization. *Advances in Neural Information Processing Systems* 27, 3176-3184. [cs.columbia.edu](http://www.cs.columbia.edu/~blei/papers/GopalanCharlinBlei2014.pdf)

<a id="ref-GHB2015a"></a>Gopalan, P., Hofman, J. M., & Blei, D. M. (2015). Scalable Recommendation with Hierarchical Poisson Factorization. *Proceedings of the Thirty-First Conference on Uncertainty in Artificial Intelligence*, 326-335. [auai.org](https://auai.org/uai2015/proceedings/papers/208.pdf)

<a id="ref-Pro2016a"></a>Proffitt, E. (2016). TopicModelsVB.jl: Variational Bayesian Topic Modeling in Julia. [github.com](https://github.com/ericproffitt/TopicModelsVB.jl)

<a id="ref-WB2011a"></a>Wang, C., & Blei, D. M. (2011). Collaborative Topic Modeling for Recommending Scientific Articles. *Proceedings of the 17th ACM SIGKDD International Conference on Knowledge Discovery and Data Mining*, 448-456. [doi:10.1145/2020408.2020480](https://doi.org/10.1145/2020408.2020480)

## See Also

- [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
- [Topic Model](topic-model.md) · [Poisson Factorisation](poisson-factorisation.md) · [User-Item Ratings](user-item-ratings.md)
