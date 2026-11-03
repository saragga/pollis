# Collaborative Topic Poisson Factorisation: Interpretation

How to read the output of the **Collaborative Topic Poisson Factorisation** panel: topics as word lists, documents as topic intensities plus reader offsets, users as topic preferences, and recommendations as ranked lists.

## Topics

**Top Words per Topic** prints the ten highest-weight words of each topic, and **Topic Labels** the five highest as a label. The README of TopicModelsVB.jl gives the raw topic distributions of a CTPF model as `model.alef ./ model.bet`, the expected word intensities of each topic.

[Gopalan, Charlin and Blei (2014)](#ref-GCB2014a) present CTPF as an interpretable latent space for understanding patterns of readership, which organises the articles according to their topics.

## What a document is about, and who reads it

**Item-Topic Mix** prints for each document two topic mixes, each normalised to sum to 1: E[θ_d], from the text, and E[θ_d + ε_d], which adds the topic offsets learned from the readers. The second is the part of the document that enters the rate of its ratings, η_uᵀ(θ_d + ε_d).

[Gopalan, Charlin and Blei (2014)](#ref-GCB2014a) illustrate the two parts with the EM paper of Dempster, Laird and Rubin in the Mendeley data: the topic intensities show what the paper is about, probabilistic modelling and statistical algorithms, and the offsets show the preferences of its readers, which include computer vision and statistical network analysis.

## User preferences

**User-Topic Distribution** computes E[η] = `model.he ./ model.vav`, normalises each user's column to sum to 1, and prints the three topics with the largest weight for every user. Since the preferences multiply the topic intensities in the rate of a rating, [Gopalan, Charlin and Blei (2014)](#ref-GCB2014a) interpret them as affinities to the latent topics.

The same preferences enter the ranking of **Recommend Items**, where each user's E[η_u] multiplies θ_d + ε_d of every unread document.

## Recommendations

**Recommend Items** prints the first ten entries of `model.urecs[user_id]`, the unread documents recommended to user 1 by default, best first, and the same list with `showurecs`. In the README, `showurecs` and `showdrecs` print the recommendations for a user and for a document.

The ranking follows the expected rate E[η_uᵀ(θ_d + ε_d)]. For a document with many readers, the offsets carry what the readers reveal; for a document with none, the ranking rests on its topics, as [Gopalan, Charlin and Blei (2014)](#ref-GCB2014a) explain for the cold start case.

## Cold start

**Infer Topics** adds a new text as a document with no readers and fits the model again, since, as the code comment says, CTPF has no `predict`. The action prints the topic mix of the new document and the first ten users in `model.drecs[d]`, those to whom it would be recommended.

[Gopalan, Charlin and Blei (2014)](#ref-GCB2014a) define in-matrix documents as those rated by at least one user and call the recommendation of all others, based entirely on content, the cold start problem.

## Exploring a collection

[Gopalan, Charlin and Blei (2014)](#ref-GCB2014a) use θ and ε together to find subclasses of articles in a topic: those with a high intensity in the topic, those with a low intensity but a large θ_dk + ε_dk, which reveal the outside interests of the topic's readers, and those with a high intensity that also draw readers from outside.

**Item-Topic Mix** gives the inputs for such a reading: the topic mix of each document from its text, and the mix once the offsets are added.

## References

<a id="ref-GCB2014a"></a>Gopalan, P., Charlin, L., & Blei, D. M. (2014). Content-Based Recommendations with Poisson Factorization. *Advances in Neural Information Processing Systems* 27, 3176-3184. [cs.columbia.edu](http://www.cs.columbia.edu/~blei/papers/GopalanCharlinBlei2014.pdf)

## See Also

- [Factsheet](factsheet.md) · [Overview](overview.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Decision Guide](decision-guide.md)
- [Topic Model](topic-model.md) · [Poisson Factorisation](poisson-factorisation.md) · [User-Item Ratings](user-item-ratings.md)
