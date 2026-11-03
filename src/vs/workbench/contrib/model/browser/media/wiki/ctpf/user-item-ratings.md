# Collaborative Topic Poisson Factorisation: User-Item Ratings

The rating model of CTPF draws each user's rating of a document from a Poisson whose rate couples the user's topic preferences with the document's topic intensities and offsets.

## The recommendation model

[Gopalan, Charlin and Blei (2014)](#ref-GCB2014a) give the recommendation model of CTPF as:

1. Draw the user preferences, η_uk ∼ Gamma(e, f).
2. Draw the document topic offsets, ε_dk ∼ Gamma(g, h).
3. Draw each rating, r_ud ∼ Poisson(η_uᵀ(θ_d + ε_d)).

The form of the rate couples the user preferences with both the topic intensities θ_d of the document model and the offsets ε_d, which lets the preferences be read as affinities to the topics.

## Offsets

The offsets capture the deviation of a document from its topic intensities, which occurs when the content of a document is insufficient to explain its ratings. [Gopalan, Charlin and Blei (2014)](#ref-GCB2014a) take the idea of a correction term from collaborative topic regression, the model of [Wang and Blei (2011)](#ref-WB2011a) that combines collaborative filtering with probabilistic topic modelling.

For each rating, inference splits r_ud into K auxiliary counts with rates η_uk θ_dk and K with rates η_uk ε_dk, a multinomial over 2K components given the rating.

## The rating matrix in the panel

**Ratings** is a users × documents matrix, rows the users and columns the documents of **Corpus**. The code reads column d into the readers of document d and their ratings:

```
readers = findall(!iszero, r), ratings = Int.(r[findall(!iszero, r)])
```

and names the users `"1"` to `"U"`. The default is simulated, 50 readers who each rate about one section in twelve, with values from 1 to 5.

## Recommendations

[Gopalan, Charlin and Blei (2014)](#ref-GCB2014a) rank each user's unread documents by score_ud = E[η_uᵀ(θ_d + ε_d)]. In TopicModelsVB.jl the scores are `model.scores`, and the ranked lists are `model.urecs` for users and `model.drecs` for documents.

**Recommend Items** prints the first ten documents in `model.urecs[user_id]`; **Infer Topics** adds a document without readers and prints the first ten users in its `model.drecs` list.

## Held-out readers

**Recommendation Recall** removes one reader from each document that has one, with `Random.seed!(1)`, trains the model and scores the position of the held-out user in `model.drecs[d]`, (n − p) / (n − 1), averaged over the documents. The method is that of the README's CiteULike example, which removes one reader from each document and measures the success of the model at putting the correct user back.

## Original setting

[Wang and Blei (2011)](#ref-WB2011a) studied a large subset of CiteULike, a bibliography sharing service, to recommend scientific articles to the users of an online community, and [Gopalan, Charlin and Blei (2014)](#ref-GCB2014a) the shared libraries of scientists on Mendeley and the access logs of arXiv. In both, an observation records whether a user has an article in a library or has consulted it.

## References

<a id="ref-GCB2014a"></a>Gopalan, P., Charlin, L., & Blei, D. M. (2014). Content-Based Recommendations with Poisson Factorization. *Advances in Neural Information Processing Systems* 27, 3176-3184. [cs.columbia.edu](http://www.cs.columbia.edu/~blei/papers/GopalanCharlinBlei2014.pdf)

<a id="ref-WB2011a"></a>Wang, C., & Blei, D. M. (2011). Collaborative Topic Modeling for Recommending Scientific Articles. *Proceedings of the 17th ACM SIGKDD International Conference on Knowledge Discovery and Data Mining*, 448-456. [doi:10.1145/2020408.2020480](https://doi.org/10.1145/2020408.2020480)

## See Also

- [Factsheet](factsheet.md) · [Overview](overview.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
- [Topic Model](topic-model.md) · [Poisson Factorisation](poisson-factorisation.md)
