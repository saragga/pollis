# ROUGE Evaluation: Overview

ROUGE scores a summary by its overlap with summaries written by people. The panel computes four ROUGE measures for every document, averages them, and tests whether one system scores higher than another.

## Automatic evaluation of summaries

[Lin (2004)](#ref-Lin2004a) introduces ROUGE, Recall-Oriented Understudy for Gisting Evaluation, as a set of measures that automatically determine the quality of a summary by comparing it with other, ideal, summaries created by humans. The measures count the number of overlapping units, such as n-grams, word sequences and word pairs, between the summary to be evaluated and the ideal summaries.

The motivation is cost: [Lin (2004)](#ref-Lin2004a) reports that even simple manual evaluation of summaries on a large scale, as in the Document Understanding Conference (DUC), would require over 3,000 hours of human effort, which is expensive and difficult to conduct frequently.

## The measures in the panel

| Measure | Idea |
|---|---|
| **ROUGE-1**, **ROUGE-2** | Share of the reference unigrams or bigrams that the candidate contains |
| **ROUGE-L** | Length of the longest common subsequence of candidate and reference, as recall, precision and F |
| **ROUGE-Lsum** | The same at summary level, with the union of the longest common subsequences of each reference sentence with every candidate sentence |

[Lin (2004)](#ref-Lin2004a) also defines ROUGE-W, a weighted longest common subsequence, and ROUGE-S, based on skip-bigrams; the panel uses the measures that TextAnalysis, by [JuliaText Contributors (2023)](#ref-JTC2023a), provides.

## Recall, precision and F

[Lin (2004)](#ref-Lin2004a) defines ROUGE-N as an n-gram recall: the denominator counts the n-grams of the references. Its relative BLEU, used in machine translation, is precision-based.

TextAnalysis returns, for every reference, a score with precision, recall and F. Recall is the share of the reference covered by the candidate, precision the share of the candidate found in the reference, as the panel's bullet puts it, and F combines the two. For the measures based on longest common subsequences, the F weight β sets how much more recall counts than precision.

## Documents and systems

A summarisation system produces one summary per document. The panel scores each summary against the references of its document, keeping one score per document, and reports the macro average, in which every document counts equally.

The default data come from The Pollis Guide in PollisDatasets: each of its 19 topics is a document, its introduction the reference, and two simple extractive systems the candidates, the first and the last sentence of every section.

## Is one system better?

Scores of two systems on the same documents are paired: each document gives one score to each system. **Compare Systems** tests the difference in F three ways: a paired t-test and a Wilcoxon signed-rank test, from HypothesisTests, by [JuliaStats Contributors (2024)](#ref-JSC2024b), and a paired bootstrap interval, from Bootstrap.jl, by [Gehring (2023)](#ref-Geh...2023a).

[Koehn (2004)](#ref-Koe2004a) introduced paired bootstrap resampling for machine translation: virtual test sets are drawn with replacement from the sentences, both systems are scored on each, and one notes which system performs better. [Jurafsky and Martin (2024)](#ref-JM2024a) present the paired bootstrap test as the most common paired test in natural language processing, based on [Efron and Tibshirani (1993)](#ref-ET1993a); [Wilcoxon (1945)](#ref-Wil1945a) proposed ranking methods, in which the ranks 1, 2, …, n take the place of the data, to obtain a rapid approximate idea of the significance of differences; for paired comparisons, the differences are ranked by size regardless of sign, and the ranks of the negative differences receive a negative sign.

## What the scores measure

ROUGE counts shared units of text. **Paraphrase vs Wrong Fact** shows what this means for the current metric with three probe sentences: a faithful paraphrase that uses other words, a copy of the reference with one fact changed, and an exact copy.

[Lin (2004)](#ref-Lin2004a) evaluates the measures by their correlation with human judgments on DUC data from 2001 to 2003, and reports that the strength of that correlation varies with the measure, the length of the summaries, the number of references and the treatment of stopwords.

## References

<a id="ref-ET1993a"></a>Efron, B., & Tibshirani, R. J. (1993). *An Introduction to the Bootstrap*. Chapman and Hall/CRC. [doi:10.1201/9780429246593](https://doi.org/10.1201/9780429246593)

<a id="ref-Geh...2023a"></a>Gehring, J. (2023). *Bootstrap.jl: Statistical Bootstrapping*. [github.com/juliangehring/Bootstrap.jl](https://github.com/juliangehring/Bootstrap.jl)

<a id="ref-JSC2024b"></a>JuliaStats Contributors (2024). *HypothesisTests.jl: Hypothesis Tests for Julia*. [github.com/JuliaStats/HypothesisTests.jl](https://github.com/JuliaStats/HypothesisTests.jl)

<a id="ref-JTC2023a"></a>JuliaText Contributors (2023). *TextAnalysis.jl: Julia NLP Toolkit*. [github.com/JuliaText/TextAnalysis.jl](https://github.com/JuliaText/TextAnalysis.jl)

<a id="ref-JM2024a"></a>Jurafsky, D., & Martin, J. H. (2024). *Speech and Language Processing* (3rd ed., draft). Pearson. [web.stanford.edu/~jurafsky/slp3](https://web.stanford.edu/~jurafsky/slp3/)

<a id="ref-Koe2004a"></a>Koehn, P. (2004). Statistical Significance Tests for Machine Translation Evaluation. *Proceedings of EMNLP 2004*. [aclanthology.org/W04-3250](https://aclanthology.org/W04-3250)

<a id="ref-Lin2004a"></a>Lin, C.-Y. (2004). ROUGE: A Package for Automatic Evaluation of Summaries. *ACL Workshop on Text Summarization Branches Out*. [aclanthology.org/W04-1013](https://aclanthology.org/W04-1013)

<a id="ref-Wil1945a"></a>Wilcoxon, F. (1945). Individual Comparisons by Ranking Methods. *Biometrics Bulletin* 1(6), 80-83. [doi:10.2307/3001968](https://doi.org/10.2307/3001968)

## See Also

- [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
- [ROUGE-N](rouge-n.md) · [ROUGE-L](rouge-l.md) · [ROUGE-Lsum](rouge-lsum.md)
