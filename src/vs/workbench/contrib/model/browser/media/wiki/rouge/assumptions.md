# ROUGE Evaluation: Assumptions

What ROUGE assumes about the references and the text, and what the three tests of **Compare Systems** assume about the scores.

## References as the standard

[Lin (2004)](#ref-Lin2004a) compares the summary to be evaluated with ideal summaries created by humans. The score is therefore relative to the references: a candidate is rewarded for the units it shares with them, and a good summary that the references do not resemble scores low.

In the default data, the reference of each topic is its introduction in The Pollis Guide, written by the author, and the candidates are sentences taken from the same topic's sections. One's own references can replace `gold`, one entry per document.

## Several references

[Lin (2004)](#ref-Lin2004a) notes that the denominator of ROUGE-N grows as references are added, which is reasonable because there might exist multiple good summaries, and that a candidate containing words shared by more references is favoured. With several references, ROUGE computes the pairwise score against every reference and takes the maximum; the ROUGE package also applies a jackknifing procedure over the references.

**Several References** offers the maximum, Best Match, which takes the reference with the highest F, as `argmax` does in TextAnalysis, by [JuliaText Contributors (2023)](#ref-JTC2023a), and the mean over the references, Average. A single string is read as one reference.

## Words and sentences

ROUGE matches units of text, so the result depends on how the text is split and normalised. The panel lowercases candidates and references, so that a word matches regardless of its case, and leaves the other choices to TextAnalysis.

[Lin (2004)](#ref-Lin2004a) evaluated ROUGE on the original summaries, on stemmed versions and on versions with stopwords removed, and found that the effect of stemming and stopword removal on the correlation with human judgments differed between tasks.

**ROUGE-Lsum** reads a text as a sequence of sentences, so, as its comment in the code says, it needs sentence punctuation in both candidate and references.

## Paired documents

**Compare Systems** pairs System A and System B document by document: the two vectors of candidates must have one summary per document, in the same order as the references. [Jurafsky and Martin (2024)](#ref-JM2024a) describe paired tests as those in which each observation in one set can be paired with one in the other, which happens naturally when two systems are compared on the same test set.

The unit of resampling and of testing is the document; the differences dᵢ = F_A,i − F_B,i are the data.

## Assumptions of the tests

| Test | Null hypothesis | Assumption |
|---|---|---|
| Paired t-test | The differences come from a distribution with mean 0 | Independent documents; the t distribution as reference |
| Wilcoxon signed-rank | The distribution of the differences is symmetric about 0 | Independent documents; symmetry |
| Paired bootstrap | — | The documents are representative of the population |

The HypothesisTests documentation, by [JuliaStats Contributors (2024)](#ref-JSC2024b), states the null hypotheses of the paired t-test and of the signed-rank test as in the table, and adds that symmetry is what the signed-rank test needs, not a zero median alone. [Jurafsky and Martin (2024)](#ref-JM2024a) note that parametric tests make assumptions about the distribution of the test statistic, such as normality, and that the bootstrap test only assumes that the sample is representative of the population.

## The bootstrap assumption

[Koehn (2004)](#ref-Koe2004a) states the assumption behind bootstrap resampling of a test set explicitly: estimating the confidence interval from many test sets whose sentences are drawn with replacement from the given set is as good as estimating it from many test sets drawn from an infinite set of sentences. He provides empirical evidence for machine translation with test sets of 300 sentences.

In the panel, the documents play the role of the sentences, and **Bootstrap Resamples** sets the number of resampled sets, 10 000 by default. The bootstrap uses the global random number generator, seeded with **Seed**.

## References

<a id="ref-JSC2024b"></a>JuliaStats Contributors (2024). *HypothesisTests.jl: Hypothesis Tests for Julia*. [github.com/JuliaStats/HypothesisTests.jl](https://github.com/JuliaStats/HypothesisTests.jl)

<a id="ref-JTC2023a"></a>JuliaText Contributors (2023). *TextAnalysis.jl: Julia NLP Toolkit*. [github.com/JuliaText/TextAnalysis.jl](https://github.com/JuliaText/TextAnalysis.jl)

<a id="ref-JM2024a"></a>Jurafsky, D., & Martin, J. H. (2024). *Speech and Language Processing* (3rd ed., draft). Pearson. [web.stanford.edu/~jurafsky/slp3](https://web.stanford.edu/~jurafsky/slp3/)

<a id="ref-Koe2004a"></a>Koehn, P. (2004). Statistical Significance Tests for Machine Translation Evaluation. *Proceedings of EMNLP 2004*. [aclanthology.org/W04-3250](https://aclanthology.org/W04-3250)

<a id="ref-Lin2004a"></a>Lin, C.-Y. (2004). ROUGE: A Package for Automatic Evaluation of Summaries. *ACL Workshop on Text Summarization Branches Out*. [aclanthology.org/W04-1013](https://aclanthology.org/W04-1013)

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
- [ROUGE-N](rouge-n.md) · [ROUGE-L](rouge-l.md) · [ROUGE-Lsum](rouge-lsum.md)
