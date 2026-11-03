# Collaborative Topic Poisson Factorisation: Factsheet

A summary of the **Collaborative Topic Poisson Factorisation** panel: the model, its inputs, how the code builds a corpus with readers and ratings, and what the main code prints.

## At a glance

| Item | Value |
| --- | --- |
| Model | CTPF, `CTPF(corp, k)` in TopicModelsVB.jl |
| Words | Poisson counts with rate θ_dᵀβ_v |
| Ratings | Poisson with rate η_uᵀ(θ_d + ε_d) |
| Priors | Gamma on topics, intensities, preferences and offsets |
| Fitting | coordinate ascent variational inference, `train!(model, iter = iters)` |
| Default corpus | The Pollis Guide from PollisDatasets, one document per section |
| Default ratings | simulated, 50 readers |
| Printed | top 10 words of each topic |

The model is that of [Gopalan, Charlin and Blei (2014)](#ref-GCB2014a); the package is that of [Proffitt (2016)](#ref-Pro2016a).

## Inputs

| Input | Default | Tooltip |
| --- | --- | --- |
| **Corpus** | `corpus` | an array of text documents, one per item |
| **Ratings** | `ratings` | sparse user-item rating matrix; rows are users, columns items |
| **Topics (k)** | `10` | number of latent topics shared by the topic model and the rating model |
| **Iterations** | `1000` | number of variational EM training iterations |

The default **Ratings** is simulated: `sprand(50, D, 0.08, n -> rand(1:5, n))` after `Random.seed!(1)`, which the tooltip describes as 50 readers rating about one section in twelve from 1 to 5. Zero means unrated.

## Building the corpus

The code lowercases each document, keeps letters and spaces, and splits it into words. It removes stop words with `fixcorp!(text, stop = true)` on a corpus of the text alone, before any reader is attached, and keeps the empty documents, so that document d stays column d of the rating matrix. Each document then becomes

```
Document(terms = u, counts = ..., readers = findall(!iszero, r), ratings = Int.(r[...]))
```

with u its distinct vocabulary keys, the counts of each, and, from column d of the rating matrix, the users who rated it and their ratings. The `Corpus` takes the vocabulary and the users `"1"`, …, `"U"`.

The code comment explains why `fixcorp!` is not called on the corpus with the readers: it can re-key users and drop documents, breaking the alignment with R. The README of TopicModelsVB.jl gives the same warning for its CiteULike example, where removing user keys and then fixing a corpus may reorder its user dictionary.

## Output

The main code ends with `showtopics(model, 10)`, the ten highest-weight words of every topic. The README names the fields of a fitted CTPF model:

| Field | Content |
| --- | --- |
| `model.alef ./ model.bet` | the raw topic distributions |
| `model.scores` | the M × U matrix of scores, documents by users |
| `model.drecs` | for each document, the users recommended for it |
| `model.urecs` | for each user, the documents recommended to them |

The panel's code comments read `model.gimel ./ model.dalet` as E[θ_d], `model.zayin ./ model.het` as E[ε_d] and `model.he ./ model.vav` as E[η], the user preferences.

## Packages

The main code loads TopicModelsVB, PollisDatasets for the default corpus, and Random and SparseArrays for the simulated ratings. **Held-Out User Rank** and **Compare k Topics** add Statistics. **CTPF vs LDA** fits `LDA(corp, k)` of the same package on the text alone, and **Infer Topics** reads the topic mix of a new document with `topicdist`.

The TopicModelsVB.jl entry of the panel points to a fork that accepts Distributions 0.25 and precompiles on Julia 1.13.

## References

<a id="ref-GCB2014a"></a>Gopalan, P., Charlin, L., & Blei, D. M. (2014). Content-Based Recommendations with Poisson Factorization. *Advances in Neural Information Processing Systems* 27, 3176-3184. [cs.columbia.edu](http://www.cs.columbia.edu/~blei/papers/GopalanCharlinBlei2014.pdf)

<a id="ref-Pro2016a"></a>Proffitt, E. (2016). TopicModelsVB.jl: Variational Bayesian Topic Modeling in Julia. [github.com](https://github.com/ericproffitt/TopicModelsVB.jl)

## See Also

- [Overview](overview.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
- [Topic Model](topic-model.md) · [Poisson Factorisation](poisson-factorisation.md) · [User-Item Ratings](user-item-ratings.md)
