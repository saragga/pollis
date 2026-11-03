# Latent Dirichlet Allocation: Interpretation

How to read the output of the **Latent Dirichlet Allocation** panel: topics through their most probable words, documents through their mixtures of topics, and the corpus through the share of tokens of each topic.

## Topics

**Top Words per Topic** draws, for the first six topics, the ten most probable words with their probabilities p(word ∣ topic). **Topic Labels** prints the five most probable words of every topic; the code comment invites the reader to read them and name the topic.

[Griffiths and Steyvers (2004)](#ref-GS2004a) label topics in the same way: in their analysis of PNAS abstracts, each topic is shown by the five words it gives the highest probability, such as words relating to global climate change, to evolution and natural selection, or to cognitive neuroscience.

## Not every topic is a theme

[Griffiths and Steyvers (2004)](#ref-GS2004a) found that not all topics correspond to areas of research. Some picked out scientific words that tend to occur together for other reasons, like words used to describe data or words that express tentative conclusions.

[Mimno, Wallach, Talley, Leenders and McCallum (2011)](#ref-MWTLM2011a) describe kinds of topics that domain experts judged: good topics, intermediate ones, and bad ones, among them chained topics, which join two unrelated concepts through a shared word. **Topic Coherence** gives a score for each topic that can be read together with its top words.

## Document mixtures

**Document-Topic Distribution** draws theta as a heatmap, documents across and topics down. Each column sums to 1 and gives p(topic ∣ document), the mixture of that document.

[Blei, Ng and Jordan (2003)](#ref-BNJ2003a) describe documents in LDA as random mixtures over latent topics. [Griffiths and Steyvers (2004)](#ref-GS2004a) used the estimates of θ to find the most diagnostic topic of each class of PNAS articles, the topic whose mean share in the class was largest relative to its share in the other classes.

## Documents of a topic

**Top Documents** prints the top words of the topic in **Topic to Inspect** and the five documents with the largest share of it, each with its share and its first 80 characters.

[Griffiths and Steyvers (2004)](#ref-GS2004a) also tagged individual abstracts, assigning each word to a topic, and describe that tagging as mainly useful for illustrating the content of individual topics.

## Prevalence

**Topic Prevalence** weights each document's mixture by its number of tokens, sums across the corpus and divides by the total, giving the share of corpus tokens assigned to each topic. The shares sum to 1.

[Griffiths and Steyvers (2004)](#ref-GS2004a) fitted linear trends to θ_j by year to find the topics of PNAS that rose or fell in popularity from 1991 to 2001, the hot and cold topics.

## Labels across fits

[Griffiths and Steyvers (2004)](#ref-GS2004a) explain that the topics have no fixed identity across samples: the model is unchanged by a permutation of the topic indices, so topic j in one fit need not match topic j in another.

The same applies to the panel's refits. The comment in **Infer Topics** says that the topics are re-estimated when the new document is added, so they are labelled by their own top words. **Compare k Topics** and **Held-Out Perplexity** also produce topics of their own.

## References

<a id="ref-BNJ2003a"></a>Blei, D. M., Ng, A. Y., & Jordan, M. I. (2003). Latent Dirichlet Allocation. *Journal of Machine Learning Research* 3, 993-1022. [jmlr.org](https://jmlr.org/papers/v3/blei03a.html)

<a id="ref-GS2004a"></a>Griffiths, T. L., & Steyvers, M. (2004). Finding Scientific Topics. *Proceedings of the National Academy of Sciences* 101(suppl. 1), 5228-5235. [doi:10.1073/pnas.0307752101](https://doi.org/10.1073/pnas.0307752101)

<a id="ref-MWTLM2011a"></a>Mimno, D., Wallach, H. M., Talley, E., Leenders, M., & McCallum, A. (2011). Optimizing Semantic Coherence in Topic Models. *Proceedings of the 2011 Conference on Empirical Methods in Natural Language Processing*, 262-272. [aclanthology.org](https://aclanthology.org/D11-1024/)

## See Also

- [Factsheet](factsheet.md) · [Overview](overview.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Decision Guide](decision-guide.md)
- [LDA](lda.md)
