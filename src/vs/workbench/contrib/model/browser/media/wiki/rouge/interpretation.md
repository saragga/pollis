# ROUGE Evaluation: Interpretation

How to read the outputs: the per-document scores, the two averages, the four metrics side by side, and the comparison of two systems.

## One score per document

For each document, the score has three parts. Recall is the share of the reference matched by the candidate, precision the share of the candidate matched in the reference, and F their combination, F1 for ROUGE-N and the weighted F of [Lin (2004)](#ref-Lin2004a) for ROUGE-L and ROUGE-Lsum. **Per-Document Scores** lists all three for every document.

A score of 1 means the candidate and the reference share all their units; [Lin (2004)](#ref-Lin2004a) notes that ROUGE-L is 1 when the two are equal and 0 when their longest common subsequence is empty.

## Macro and length-weighted averages

**Aggregate Scores** prints two averages:

| Average | Computation |
|---|---|
| Macro | The mean of precision, recall and F over documents, each document counting equally, as `average` in TextAnalysis, by [JuliaText Contributors (2023)](#ref-JTC2023a) |
| Length-weighted | Precision weighted by the number of candidate words, recall by the mean number of reference words, and F1 from the two |

The weights are the denominators of the two ratios, so, with one reference per document, the length-weighted precision and recall pool the matches over the documents, and long documents count more. When documents differ much in length, the two averages can differ.

## Comparing the metrics

**Compare Metrics** prints the macro precision, recall and F of ROUGE-1, ROUGE-2, ROUGE-L and ROUGE-Lsum for System A, all with F1.

[Lin (2004)](#ref-Lin2004a) explains why the metrics differ on the same text. ROUGE-2 counts only matches of two consecutive words. ROUGE-L does not require consecutive matches, only matches in sequence that reflect word order, and its value is at most the unigram F-measure. In his example, with S1 "police killed the gunman" as the reference, S2 "police kill the gunman" and S3 "the gunman kill police" have the same ROUGE-2 score, while ROUGE-L gives S2 3/4 and S3 2/4.

## How well ROUGE tracks human judgment

[Lin (2004)](#ref-Lin2004a) assessed the measures by their correlation with human-assigned coverage scores on DUC data, and found that ROUGE-2, ROUGE-L, ROUGE-W and ROUGE-S worked well in single-document summarisation, that ROUGE-1 and ROUGE-L performed well for very short, headline-like summaries, and that excluding stopwords and using several references usually improved the correlation.

He adds that correlations as high as in single-document tasks were hard to reach in multi-document summarisation, where fewer samples were available.

## Is System A better than System B?

**Compare Systems** reports, for the F differences between A and B:

| Output | Meaning |
|---|---|
| Mean F difference and 95% interval (t) | The paired t-test's estimate and interval for the mean difference |
| p (t) | The paired t-test of a mean difference of 0 |
| Wilcoxon signed-rank p | The test of a distribution of differences symmetric about 0 |
| Paired bootstrap 95% interval | The 2.5% and 97.5% percentiles of the mean difference over the resamples |
| Counts | The documents on which A scores higher and lower |

An interval that excludes 0, with small p-values, supports a difference between the systems on documents like these. [Jurafsky and Martin (2024)](#ref-JM2024a) call the difference between the systems the effect size, and frame the question as whether it is large enough to reject the null hypothesis that A is not better than B.

## Percentile intervals

[Koehn (2004)](#ref-Koe2004a) computes the interval by drawing 1 000 test sets with replacement, sorting their scores and dropping the top and bottom 2.5%, and checks on 100 test sets of 300 sentences that the score on a test set of 30 000 sentences lies within the estimated interval for all but three. The panel's interval is the same percentile interval, `PercentileConfInt(0.95)` in Bootstrap.jl, by [Gehring (2023)](#ref-Geh...2023a), computed on the mean F difference with **Bootstrap Resamples** resamples.

For a pair of systems, [Koehn (2004)](#ref-Koe2004a) counts how often one system outperforms the other over the resampled test sets, and draws the conclusion that it is better with 95% statistical significance when it does so 95% of the time.

## References

<a id="ref-Geh...2023a"></a>Gehring, J. (2023). *Bootstrap.jl: Statistical Bootstrapping*. [github.com/juliangehring/Bootstrap.jl](https://github.com/juliangehring/Bootstrap.jl)

<a id="ref-JTC2023a"></a>JuliaText Contributors (2023). *TextAnalysis.jl: Julia NLP Toolkit*. [github.com/JuliaText/TextAnalysis.jl](https://github.com/JuliaText/TextAnalysis.jl)

<a id="ref-JM2024a"></a>Jurafsky, D., & Martin, J. H. (2024). *Speech and Language Processing* (3rd ed., draft). Pearson. [web.stanford.edu/~jurafsky/slp3](https://web.stanford.edu/~jurafsky/slp3/)

<a id="ref-Koe2004a"></a>Koehn, P. (2004). Statistical Significance Tests for Machine Translation Evaluation. *Proceedings of EMNLP 2004*. [aclanthology.org/W04-3250](https://aclanthology.org/W04-3250)

<a id="ref-Lin2004a"></a>Lin, C.-Y. (2004). ROUGE: A Package for Automatic Evaluation of Summaries. *ACL Workshop on Text Summarization Branches Out*. [aclanthology.org/W04-1013](https://aclanthology.org/W04-1013)

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Decision Guide](decision-guide.md)
- [ROUGE-N](rouge-n.md) · [ROUGE-L](rouge-l.md) · [ROUGE-Lsum](rouge-lsum.md)
