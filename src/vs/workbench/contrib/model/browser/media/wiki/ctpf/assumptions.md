# Collaborative Topic Poisson Factorisation: Assumptions

What CTPF takes for granted about words, users and ratings, and what the code of the **Collaborative Topic Poisson Factorisation** panel assumes about its inputs.

## Counts, not proportions

CTPF models word counts and ratings as Poisson variables. [Gopalan, Charlin and Blei (2014)](#ref-GCB2014a) draw each component β_vk of the unnormalised topics from a Gamma distribution, the topic intensities θ_dk of each document from a Gamma, and each word count from w_dv ∼ Poisson(θ_dᵀβ_v). The topics are collections of word intensities over a vocabulary of size V, not probability distributions.

The panel's documents are bags of words: each `Document` holds the distinct vocabulary keys of a text and their counts, with the order of the words given up.

## Ratings as Poisson counts

The recommendation model draws user preferences η_uk ∼ Gamma(e, f) and document offsets ε_dk ∼ Gamma(g, h), and each rating from r_ud ∼ Poisson(η_uᵀ(θ_d + ε_d)). In [Gopalan, Charlin and Blei (2014)](#ref-GCB2014a), r_ud equals one if user u consulted document d, can be greater if the user rated the document, and is zero otherwise; most values of the matrix are zero.

The panel's **Ratings** holds positive integers for rated documents and 0 for the rest. The code passes the non-zero entries of each column to the document as its `readers` and `ratings`.

## Shared topics

The rate of a rating combines the user preferences with the topic intensities of the document, so the same k dimensions describe both. [Gopalan, Charlin and Blei (2014)](#ref-GCB2014a) explain that this coupling lets the user preferences be read as affinities to the latent topics.

The offsets ε_d capture the deviation of a document from its topic intensities, which occurs when its content is insufficient to explain its ratings: for example, that a machine learning article interests a biologist because other biologists read it.

## Zeros and sparsity

[Gopalan, Hofman and Blei (2014)](#ref-GHB2014a) show that the likelihood of Poisson factorisation depends only on the non-zero entries of the user-item matrix, which makes computation efficient for sparse data. They also explain that the model has two ways of explaining an unconsumed item, lack of interest or lack of opportunity, so it implicitly down-weights the contribution of the items that a user did not consume.

The Gamma priors with a small shape parameter, in their words, encourage sparse representations of users and items, with most weights close to zero and only a few large.

## Alignment of documents and users

The code keeps column d of the rating matrix with document d of the corpus, and row u with user u. The code comment explains that `fixcorp!` is not called because it can re-key users and drop documents, breaking that alignment.

As a consequence the vocabulary keeps every word of the texts, since the stop word removal of `fixcorp!` is not applied.

## Variational inference

[Gopalan, Charlin and Blei (2014)](#ref-GCB2014a) augment CTPF with auxiliary Poisson variables that split each word count and each rating among the topics. With them, the model is conditionally conjugate: every complete conditional is a Gamma or a multinomial, and coordinate ascent variational inference has closed-form updates.

The panel's code comment calls `train!` coordinate-ascent variational inference, for the number of rounds set by **Iterations**.

## References

<a id="ref-GCB2014a"></a>Gopalan, P., Charlin, L., & Blei, D. M. (2014). Content-Based Recommendations with Poisson Factorization. *Advances in Neural Information Processing Systems* 27, 3176-3184. [cs.columbia.edu](http://www.cs.columbia.edu/~blei/papers/GopalanCharlinBlei2014.pdf)

<a id="ref-GHB2014a"></a>Gopalan, P., Hofman, J. M., & Blei, D. M. (2014). Scalable Recommendation with Hierarchical Poisson Factorization. *Proceedings of the 31st Conference on Uncertainty in Artificial Intelligence (UAI 2015)*. [auai.org](https://auai.org/uai2015/proceedings/papers/208.pdf)

## See Also

- [Factsheet](factsheet.md) · [Overview](overview.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
- [Topic Model](topic-model.md) · [Poisson Factorisation](poisson-factorisation.md) · [User-Item Ratings](user-item-ratings.md)
