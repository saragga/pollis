# ROUGE Evaluation: ROUGE-N

**ROUGE-N** counts the n-grams that a candidate summary shares with a reference: unigrams for **ROUGE-1**, bigrams for **ROUGE-2**. The measure is the n-gram co-occurrence statistic of [Lin (2004)](#ref-Lin2004a).

## The definition

[Lin (2004)](#ref-Lin2004a) defines ROUGE-N as an n-gram recall between a candidate summary and a set of reference summaries:

ROUGE-N = Σ_S Σ_gramₙ∈S Count_match(gramₙ) / Σ_S Σ_gramₙ∈S Count(gramₙ)

where S runs over the reference summaries, n is the length of the n-gram and Count_match(gramₙ) is the maximum number of n-grams co-occurring in the candidate and the references. The denominator counts the n-grams of the references, which makes ROUGE-N a recall-related measure.

## Precision and F1

The panel computes ROUGE-N in its own function, `rouge_clipped`, from the n-gram counts that `ngrams` of TextAnalysis, by [JuliaText Contributors (2023)](#ref-JTC2023a), returns for a document. A candidate n-gram matches at most as often as it occurs in the reference, the maximum number of co-occurring n-grams of the definition, so recall and precision lie between 0 and 1. For every reference, the function returns a TextAnalysis `Score` with precision, recall and F. As the panel's bullet puts it, recall is the share of reference n-grams found in the candidate and precision the share of candidate n-grams found in a reference.

The F of `rouge_clipped` is F1, the harmonic mean of the two, whatever the value of **F Weight (beta)**, which applies only to the measures based on longest common subsequences.

## Unigrams and bigrams

| Tab | n | What a match requires |
|---|---|---|
| **ROUGE-1** | 1 | The same word, anywhere in the text |
| **ROUGE-2** | 2 | The same two consecutive words |

[Lin (2004)](#ref-Lin2004a) tested ROUGE-N for n from 1 to 9. On single-document summaries of about 100 words, ROUGE-2 performed better than the other ROUGE-N variants; on very short summaries, ROUGE-1 did well, and ROUGE-N with n > 1 did less well than the other measures.

## Word order

ROUGE-N rewards only the n-grams themselves, not their order in the text. [Lin (2004)](#ref-Lin2004a) illustrates this with the reference "police killed the gunman": the candidates "police kill the gunman" and "the gunman kill police" share the same single bigram, "the gunman", and therefore have the same ROUGE-2 score, although their meanings are very different.

ROUGE-L, which counts matches in sequence, separates the two, and is the subject of [ROUGE-L](rouge-l.md).

## Several references

With several references, [Lin (2004)](#ref-Lin2004a) computes the pairwise ROUGE-N between the candidate and every reference and takes the maximum as the final score. He also notes that the numerator of the definition sums over all references, which gives more weight to n-grams occurring in several of them, favouring candidates that are similar to the consensus of the references.

In the panel, `rouge_clipped` returns one score per reference, and **Several References** keeps either the best one, by F, or their average.

## In the panel

The code calls `rouge_clipped(refs, cand, 1)` on the **ROUGE-1** tab and `rouge_clipped(refs, cand, 2)` on the **ROUGE-2** tab, after lowercasing both sides. The example in the TextAnalysis documentation scores one candidate against two references for n = 1 and n = 2 with `rouge_n`, and takes the best score of each with `argmax`, the same pattern as Best Match.

**Compare Metrics** puts ROUGE-1 and ROUGE-2 beside ROUGE-L and ROUGE-Lsum for the same candidates.

## References

<a id="ref-JTC2023a"></a>JuliaText Contributors (2023). *TextAnalysis.jl: Julia NLP Toolkit*. [github.com/JuliaText/TextAnalysis.jl](https://github.com/JuliaText/TextAnalysis.jl)

<a id="ref-Lin2004a"></a>Lin, C.-Y. (2004). ROUGE: A Package for Automatic Evaluation of Summaries. *ACL Workshop on Text Summarization Branches Out*. [aclanthology.org/W04-1013](https://aclanthology.org/W04-1013)

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
- [ROUGE-L](rouge-l.md) · [ROUGE-Lsum](rouge-lsum.md)
