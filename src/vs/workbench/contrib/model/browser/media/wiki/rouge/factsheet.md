# ROUGE Evaluation: Factsheet

The panel's metrics, data, inputs, outputs and sources at a glance.

## Metrics

| Metric | Unit matched | TextAnalysis function | F weight | Source |
|---|---|---|---|---|
| **ROUGE-1** | Unigrams | `rouge_n(refs, cand, 1)` | F1 | [Lin (2004)](#ref-Lin2004a) |
| **ROUGE-2** | Bigrams | `rouge_n(refs, cand, 2)` | F1 | [Lin (2004)](#ref-Lin2004a) |
| **ROUGE-L** | Longest common subsequence of the whole texts | `rouge_l_sentence(refs, cand, β)` | **F Weight (beta)** | [Lin (2004)](#ref-Lin2004a) |
| **ROUGE-Lsum** | Union longest common subsequence, sentence by sentence | `rouge_l_summary(refs, cand, β)` | **F Weight (beta)** | [Lin (2004)](#ref-Lin2004a) |

Each function returns one score per reference, with precision, recall and F. TextAnalysis, by [JuliaText Contributors (2023)](#ref-JTC2023a), provides them with `argmax` and `average` over scores.

## Default data

| Item | Value |
|---|---|
| Source | The Pollis Guide in PollisDatasets, one row per section |
| Documents | Its 19 topics |
| Reference, `gold` | The introduction of each topic |
| System A, `summaries` | The first sentence of every section of the topic |
| System B, `summaries_b` | The last sentence of every section of the topic |
| Preprocessing | Candidates and references are lowercased before scoring |

The three vectors can be replaced by one's own, one entry per document, in the same order.

## Inputs

| Input | Default | Use |
|---|---|---|
| **Candidates (System A)** | `summaries` | One summary per document |
| **References** | `gold` | One reference, or a vector of references, per document |
| **Several References** | Best Match | Best Match takes the reference with the highest F; Average the mean over references |
| **F Weight (beta)** | 1 | Weight of recall against precision in ROUGE-L and ROUGE-Lsum |
| **Candidates (System B)** | `summaries_b` | Second system, for **Compare Systems** |
| **Bootstrap Resamples** | 10000 | Paired bootstrap resamples of the documents |
| **Seed** | 1 | Seed of the global random number generator |
| **New Candidate**, **New References** | Placeholders | One summary and its references, for **Evaluate New Candidate** |

## Outputs

The run prints the macro average of precision, recall and F over the documents, computed with `average` from TextAnalysis. It keeps the vector `scores`, one score per document once **Several References** has combined the references, and the vectors `P`, `R` and `F` of precision, recall and F, one value per document, which the actions use. **Compare Systems** adds the scores of System B, computed in the same way.

## Actions

| Group | Action | Output |
|---|---|---|
| Visualise | **Score Distribution**, **Precision-Recall Plot** | Histogram of F per document; precision against recall, coloured by candidate length |
| Diagnose | **Score Summary**, **Low-Score Documents** | Mean, median, minimum and maximum; the five lowest candidates with their best reference |
| Predict | **Evaluate New Candidate**, **Paraphrase vs Wrong Fact** | Scores of one new summary; scores of three probe sentences |
| Compare | **Compare Metrics**, **Compare Systems** | All four metrics for System A; paired tests of System A against System B |
| Interpret | **Per-Document Scores**, **Aggregate Scores** | Precision, recall and F per document; macro and length-weighted averages |

## Statistical tests

| Test | Package | Source |
|---|---|---|
| Paired t-test on the F differences | HypothesisTests, by [JuliaStats Contributors (2024)](#ref-JSC2024b) | — |
| Wilcoxon signed-rank test | HypothesisTests, by [JuliaStats Contributors (2024)](#ref-JSC2024b) | [Wilcoxon (1945)](#ref-Wil1945a) |
| Paired bootstrap, percentile interval | Bootstrap.jl, by [Gehring (2023)](#ref-Geh...2023a) | [Efron and Tibshirani (1993)](#ref-ET1993a), [Koehn (2004)](#ref-Koe2004a) |

[Jurafsky and Martin (2024)](#ref-JM2024a) describe the paired bootstrap test for comparing two systems on the same test set.

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

- [Overview](overview.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
- [ROUGE-N](rouge-n.md) · [ROUGE-L](rouge-l.md) · [ROUGE-Lsum](rouge-lsum.md)
