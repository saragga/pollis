# Correlated Topic Model: Interpretation

How to read the output of the **Correlated Topic Model** panel: the topics as word lists, the topic proportions of each document, and the correlations between topics.

## Topics as word lists

**Top Words per Topic** prints the ten most probable words of every topic with `showtopics(model, 10)`, and **Topic Labels** the five most probable as a short label. [Mimno, Wallach, Talley, Leenders and McCallum (2011)](#ref-MWTLM2011a) note that a topic is generally shown to users as its 5 to 20 most probable words in descending order.

The README of TopicModelsVB.jl labels the topics of its own examples from their top twenty words, such as *Computer Science*, *Mathematics* or *Molecular Biology*, and calls those labels tentative.

## Topic proportions

`topicdist(model, d)` returns the topic proportions of document d, which sum to 1. In the README's LDA example, the proportions of a document suggest what it is mostly about, and the text of the document confirms the reading.

**Top Documents** ranks the documents by their share of one topic, `topic_idx = 1` by default, and returns the ten highest. **Infer Topics** keeps the topics fixed and infers the proportions of a new text with `predict`, which, in the README, takes a corpus of unseen documents and a trained model and returns a new model of the same type.

## Topic Correlations

**Topic Correlations** turns the covariance matrix `model.sigma` into a correlation matrix, R_ij = Σ_ij / (s_i s_j) with s_i = √Σ_ii, and draws it as a heatmap from −1 to 1.

[Blei and Lafferty (2006)](#ref-BL2006a) use the covariance as an exploratory tool for understanding and navigating a large corpus, and the README reads the largest positive entries of `model.sigma` as the most closely related topics and the most negative as the most unlikely pairings.

## Topic Network

**Topic Network** draws a graph whose nodes are the topics and whose edges join the pairs with a correlation greater than 0.1, without self-loops. [Blei and Lafferty (2006)](#ref-BL2006a) build a graph of the same kind from 16 351 Science articles, each node a topic labelled with its five most probable phrases, and find densely connected groups of topics in materials science, geology and cell biology.

Their example shows the use they make of it: a researcher alerted to a correlated topic not contained in an article could browse the collection in a topic-guided manner.

## Prediction with correlated topics

[Blei and Lafferty (2006)](#ref-BL2006a) point out that the CTM can predict words from topics that are correlated with those the observed words suggest. In their experiment, after a small number of observed words, the predictive perplexity of the CTM was lower than that of LDA, since the CTM uses topic correlation to infer that words in a related topic may also be probable.

## Background words

For the Focused CTM, `model.eta` is the probability that a word comes from a topic and `model.kappa` the background distribution, as in the held-out code of the panel. The words with the highest probability in κ are, following [Proffitt (2016b)](#ref-Pro2016b), those most likely to be corpus-specific stop words, and their appearance in the topics is suppressed. The top words of `model.kappa`, sorted by probability, list the words the model has sent to the background.

## References

<a id="ref-BL2006a"></a>Blei, D. M., & Lafferty, J. D. (2006). Correlated Topic Models. *Advances in Neural Information Processing Systems* 18, 147-154. [proceedings.neurips.cc](https://proceedings.neurips.cc/paper/2005/hash/9e82757e9a1c12cb710ad680db11f6f1-Abstract.html)

<a id="ref-MWTLM2011a"></a>Mimno, D., Wallach, H. M., Talley, E., Leenders, M., & McCallum, A. (2011). Optimizing Semantic Coherence in Topic Models. *Proceedings of the 2011 Conference on Empirical Methods in Natural Language Processing*, 262-272. [aclanthology.org](https://aclanthology.org/D11-1024/)

<a id="ref-Pro2016b"></a>Proffitt, E. (2016b). Filtered Latent Dirichlet Allocation: Variational Algorithm. [github.com](https://github.com/ericproffitt/TopicModelsVB.jl/blob/master/fLDA/fLDA.pdf)

## See Also

- [Factsheet](factsheet.md) · [Overview](overview.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Decision Guide](decision-guide.md)
- [CTM](ctm.md) · [Focused CTM](fctm.md)
