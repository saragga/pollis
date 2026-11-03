# ROUGE Evaluation: Decision Guide

Which ROUGE measure to report, how to handle several references and the F weight, and how to compare two systems.

## Choosing a measure

| Situation | Measure | Why |
|---|---|---|
| Content overlap at the level of words | **ROUGE-1** | Unigram recall and precision, regardless of order |
| Overlap of short phrases | **ROUGE-2** | Bigram matches reward pairs of consecutive words |
| Word order within one text, without fixed n-gram length | **ROUGE-L** | Longest common subsequence of the whole texts |
| Multi-sentence summaries compared sentence by sentence | **ROUGE-Lsum** | Union longest common subsequence of each reference sentence with the candidate sentences |

[Lin (2004)](#ref-Lin2004a) names two advantages of the longest common subsequence: it does not require consecutive matches but in-sequence matches that reflect word order, and it automatically includes the longest in-sequence common n-grams, so that no n-gram length has to be fixed.

## What the evaluation of ROUGE suggests

| Task in the DUC evaluations | Measures that worked well, according to [Lin (2004)](#ref-Lin2004a) |
|---|---|
| Single-document summaries | ROUGE-2, ROUGE-L, ROUGE-W, ROUGE-S |
| Very short, headline-like summaries | ROUGE-1, ROUGE-L, ROUGE-W, ROUGE-SU4, ROUGE-SU9 |
| Multi-document summaries, with stopwords excluded | ROUGE-1, ROUGE-2, ROUGE-S4, ROUGE-S9, ROUGE-SU4, ROUGE-SU9 |

**Compare Metrics** prints all four of the panel's measures at once, so reporting several of them costs nothing extra.

## Several references

[Lin (2004)](#ref-Lin2004a) found that using several references improved the correlation with human judgments. With several references per document, **Several References** chooses between the best-matching reference, Best Match, the rule of [Lin (2004)](#ref-Lin2004a) for multiple references, and the mean over the references, Average.

Each entry of **References** is either a single string or a vector of strings; documents may have different numbers of references.

## The F weight

**F Weight (beta)** sets β in the F score of ROUGE-L and ROUGE-Lsum, an integer, 1 by default:

F = (1 + β²) R P / (R + β² P)

With β = 1, recall and precision weigh equally; larger values favour recall, as its tooltip says. [Lin (2004)](#ref-Lin2004a) reports that in DUC β was set to a very big number, so that only recall was considered. ROUGE-1 and ROUGE-2 always report F1.

## Comparing two systems

| Need | Output of **Compare Systems** |
|---|---|
| An estimate of the mean F difference with an interval | Paired t interval; paired bootstrap percentile interval |
| A test that makes no normality assumption | Wilcoxon signed-rank p; paired bootstrap interval |
| A view of consistency | Documents on which A is higher and lower |

[Jurafsky and Martin (2024)](#ref-JM2024a) describe the paired bootstrap test, introduced for machine translation by [Koehn (2004)](#ref-Koe2004a), as the paired test most common in natural language processing, and note that it can apply to any metric. [Efron and Tibshirani (1993)](#ref-ET1993a) is the general reference they give for the bootstrap.

## Resamples and seed

**Bootstrap Resamples** sets the number of paired resamples, 10 000 by default; **Seed** fixes the global random number generator, so the interval can be reproduced. [Koehn (2004)](#ref-Koe2004a) uses 1 000 resamples in his experiments, and [Jurafsky and Martin (2024)](#ref-JM2024a) give an example with 10 000.

The panel's description of **Compare Systems** points to the Bootstrap Resampling panel in the Simulate menu, which compares interval methods, resampling schemes and their coverage. Bootstrap.jl, by [Gehring (2023)](#ref-Geh...2023a), offers further confidence intervals, among them basic, normal, studentised and bias-corrected and accelerated.

## Reading the texts

ROUGE scores are counts of shared units, and [Lin (2004)](#ref-Lin2004a) validates them against human judgments of content coverage. **Low-Score Documents** and **Paraphrase vs Wrong Fact** keep the texts in view: the first shows the candidates the metric ranks lowest, the second how the metric treats a change of words and a change of fact. **Evaluate New Candidate** scores any further sentence against references of one's choosing, so that other cases can be tried in the same way.

## References

<a id="ref-ET1993a"></a>Efron, B., & Tibshirani, R. J. (1993). *An Introduction to the Bootstrap*. Chapman and Hall/CRC. [doi:10.1201/9780429246593](https://doi.org/10.1201/9780429246593)

<a id="ref-Geh...2023a"></a>Gehring, J. (2023). *Bootstrap.jl: Statistical Bootstrapping*. [github.com/juliangehring/Bootstrap.jl](https://github.com/juliangehring/Bootstrap.jl)

<a id="ref-JM2024a"></a>Jurafsky, D., & Martin, J. H. (2024). *Speech and Language Processing* (3rd ed., draft). Pearson. [web.stanford.edu/~jurafsky/slp3](https://web.stanford.edu/~jurafsky/slp3/)

<a id="ref-Koe2004a"></a>Koehn, P. (2004). Statistical Significance Tests for Machine Translation Evaluation. *Proceedings of EMNLP 2004*. [aclanthology.org/W04-3250](https://aclanthology.org/W04-3250)

<a id="ref-Lin2004a"></a>Lin, C.-Y. (2004). ROUGE: A Package for Automatic Evaluation of Summaries. *ACL Workshop on Text Summarization Branches Out*. [aclanthology.org/W04-1013](https://aclanthology.org/W04-1013)

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md)
- [ROUGE-N](rouge-n.md) · [ROUGE-L](rouge-l.md) · [ROUGE-Lsum](rouge-lsum.md)
