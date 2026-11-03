# Collaborative Topic Poisson Factorisation: Topic Model

The topic model of CTPF describes the words of each document with Poisson counts: unnormalised topics of word intensities, and topic intensities for each document.

## The document model

[Gopalan, Charlin and Blei (2014)](#ref-GCB2014a) give the document model of CTPF as:

1. Draw the topics, β_vk ∼ Gamma(a, b).
2. Draw the topic intensities of each document, θ_dk ∼ Gamma(c, d).
3. Draw each word count, w_dv ∼ Poisson(θ_dᵀβ_v).

Each topic β_k is a collection of word intensities over a vocabulary of size V. [Gopalan, Charlin and Blei (2014)](#ref-GCB2014a) note that Poisson factorisation has also been used as a topic model and developed as an alternative text model to latent Dirichlet allocation.

## Words split among topics

For inference, [Gopalan, Charlin and Blei (2014)](#ref-GCB2014a) add K auxiliary variables z_dv,k ∼ Poisson(θ_dk β_vk) for each word count, integers that sum to w_dv. A sum of independent Poisson variables is Poisson with the sum of the rates, so the auxiliary variables keep the distribution of the counts.

Given their sum, the z_dv form a multinomial, with variational parameters φ_dv on the K-simplex. When a count is zero, its auxiliary variables are not random, so inference considers only the non-zero word counts of each document.

## In the code

The panel builds each document from its distinct vocabulary keys and their counts:

```
t = [key[w] for w in ws]; u = unique(t)
Document(terms = u, counts = [count(==(i), t) for i in u], ...)
```

After fitting, the code reads the expected topics as `model.alef ./ model.bet`, a k × V matrix, and the expected intensities of document d as `model.gimel[d] ./ model.dalet`. **Perplexity** multiplies the two and normalises the result into a word distribution for each document.

## Topics in the actions

**Top Words per Topic** and **Topic Labels** list the highest-weight words of every topic with `showtopics`. **Item-Topic Mix** normalises E[θ_d] into the topic mix of each document, and **Infer Topics** prints the topic mix of a new text with `topicdist`.

**Perplexity** and **Compare k Topics** score the document model on the even-position words of every document.

**CTPF vs LDA** compares this document model, fitted together with the ratings, with LDA fitted on the text alone, by the perplexity of the same held-out words.

## Relation to the rating model

The topic intensities θ_d appear in both parts of CTPF: in the rate of the word counts and in the rate of the ratings, η_uᵀ(θ_d + ε_d). [Gopalan, Charlin and Blei (2014)](#ref-GCB2014a) explain that, when there is no reader data, the model depends on the topics to make recommendations.

The User-Item Ratings page describes the offsets ε_d, and the Poisson Factorisation page the factorisation of the ratings.

## References

<a id="ref-GCB2014a"></a>Gopalan, P., Charlin, L., & Blei, D. M. (2014). Content-Based Recommendations with Poisson Factorization. *Advances in Neural Information Processing Systems* 27, 3176-3184. [cs.columbia.edu](http://www.cs.columbia.edu/~blei/papers/GopalanCharlinBlei2014.pdf)

## See Also

- [Factsheet](factsheet.md) · [Overview](overview.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
- [Poisson Factorisation](poisson-factorisation.md) · [User-Item Ratings](user-item-ratings.md)
