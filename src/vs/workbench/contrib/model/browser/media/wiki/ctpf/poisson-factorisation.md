# Collaborative Topic Poisson Factorisation: Poisson Factorisation

Poisson factorisation models a matrix of user-item counts as Poisson variables whose rates are inner products of non-negative user preferences and item attributes. CTPF uses it for both the words and the ratings.

## The model

[Gopalan, Hofman and Blei (2015)](#ref-GHB2015a) describe Poisson factorisation as a probabilistic model of users and items that associates each user with a latent vector of preferences and each item with a latent vector of attributes, constrains both to be sparse and non-negative, and draws each cell of the observed matrix from a Poisson distribution whose rate is the inner product of the two:

y_ui ∼ Poisson(θ_uᵀβ_i).

In their hierarchical version, the preferences and attributes have Gamma priors whose rates are themselves drawn from Gamma distributions, a user activity and an item popularity.

## Properties

[Gopalan, Hofman and Blei (2015)](#ref-GHB2015a) list properties of the model:

- the Gamma priors, with a small shape parameter, encourage sparse representations, most weights close to zero and only a few large;
- the model captures the long-tailed distributions of user activity and item popularity found in consumption data;
- it implicitly down-weights the items a user did not consume, which can mean either lack of interest or lack of opportunity;
- its likelihood depends only on the non-zero entries of the matrix.

## Budgets

[Gopalan, Hofman and Blei (2015)](#ref-GHB2015a) show that, given the total consumption b_u of a user, the counts of that user over the items follow a multinomial with probabilities proportional to θ_uᵀβ_i. Learning a Poisson factorisation, in their words, is effectively the same as learning a budget for each user and how that budget is distributed across items.

The budget itself is Poisson, b_u ∼ Poisson(θ_uᵀ Σ_i β_i). [Gopalan, Hofman and Blei (2015)](#ref-GHB2015a) write that the ability of the model to capture the distribution of user activity is encoded in these assumptions.

## In CTPF

[Gopalan, Charlin and Blei (2014)](#ref-GCB2014a) build CTPF on Poisson factorisation and describe it as replacing the usual Gaussian likelihood and real-valued representations of probabilistic matrix factorisation with a Poisson likelihood and non-negative representations. Compared with Gaussian factorisation, they write, Poisson factorisation has more efficient inference and handles sparse data better.

CTPF factorises the word counts with the topics and the topic intensities, and the ratings with the user preferences and the sum of the intensities and the offsets.

## Inference

For the auxiliary variables of both factorisations, [Gopalan, Charlin and Blei (2014)](#ref-GCB2014a) use the additivity of the Poisson: a count is split among K components, or 2K for a rating, each a Poisson with its own rate. Conditioned on their sum, the components are multinomial, and the complete conditionals of all Gamma variables are Gamma, so coordinate ascent has closed-form updates.

The variational family is mean-field: Gamma factors for the topics, intensities, preferences and offsets, with free shape and rate parameters, and multinomial factors for the auxiliary counts.

## In the panel

TopicModelsVB.jl stores the shape and rate parameters of the Gamma factors in the fields of the model, and the panel's code divides one by the other for the expectations: `model.he ./ model.vav` for the user preferences, `model.gimel ./ model.dalet` for the topic intensities and `model.zayin ./ model.het` for the offsets.

**User-Topic Distribution** reads the preferences, and **Recommend Items** the ranking built from them.

## References

<a id="ref-GCB2014a"></a>Gopalan, P., Charlin, L., & Blei, D. M. (2014). Content-Based Recommendations with Poisson Factorization. *Advances in Neural Information Processing Systems* 27, 3176-3184. [cs.columbia.edu](http://www.cs.columbia.edu/~blei/papers/GopalanCharlinBlei2014.pdf)

<a id="ref-GHB2015a"></a>Gopalan, P., Hofman, J. M., & Blei, D. M. (2015). Scalable Recommendation with Hierarchical Poisson Factorization. *Proceedings of the Thirty-First Conference on Uncertainty in Artificial Intelligence*, 326-335. [auai.org](https://auai.org/uai2015/proceedings/papers/208.pdf)

## See Also

- [Factsheet](factsheet.md) · [Overview](overview.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
- [Topic Model](topic-model.md) · [User-Item Ratings](user-item-ratings.md)
