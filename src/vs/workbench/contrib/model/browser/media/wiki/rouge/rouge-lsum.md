# ROUGE Evaluation: ROUGE-Lsum

**ROUGE-Lsum** is the summary-level form of ROUGE-L: each sentence of the reference is compared with every sentence of the candidate, and the matches are combined through the union of their longest common subsequences. The panel computes it with `rouge_l_summary` in TextAnalysis.

## The union LCS

[Lin (2004)](#ref-Lin2004a) defines the summary-level score by taking the union of the LCS matches between a reference sentence rᵢ and every candidate sentence cⱼ. For a reference of u sentences with m words in all and a candidate of v sentences with n words in all:

R_lcs = Σᵢ LCS∪(rᵢ, C) / m, P_lcs = Σᵢ LCS∪(rᵢ, C) / n

with the F-measure from R_lcs and P_lcs as for ROUGE-L. LCS∪(rᵢ, C) is the length of the union longest common subsequence of the reference sentence rᵢ and the candidate summary C.

## An example

[Lin (2004)](#ref-Lin2004a) gives the reference sentence rᵢ = w₁ w₂ w₃ w₄ w₅ and a candidate of two sentences, c₁ = w₁ w₂ w₆ w₇ w₈ and c₂ = w₁ w₃ w₈ w₉ w₅:

| Pair | Longest common subsequence |
|---|---|
| rᵢ and c₁ | w₁ w₂ |
| rᵢ and c₂ | w₁ w₃ w₅ |
| Union | w₁ w₂ w₃ w₅ |

The union counts 4 of the 5 words of rᵢ, so LCS∪(rᵢ, C) = 4/5 in his notation. Each candidate sentence can contribute its own matches, and a reference sentence is credited with the words matched by any of them.

## Sentences

The score depends on how the texts are split into sentences. As its comment in the code says, `rouge_l_summary` needs sentence punctuation in candidate and references.

The default candidates are built by splitting each section after a full stop, question mark or exclamation mark followed by a space, and joining the first, or the last, sentences with spaces, so every sentence keeps its final punctuation.

## The F weight

**F Weight (beta)** sets β in the F-measure, 1 by default, and is passed to `rouge_l_summary(refs, cand, β)`, whose β argument TextAnalysis, by [JuliaText Contributors (2023)](#ref-JTC2023a), requires. Larger values of β favour recall; [Lin (2004)](#ref-Lin2004a) reports that in DUC β was set to a very big number, so that only recall was considered at summary level as well.

The example in the TextAnalysis documentation calls `rouge_l_summary` with β = 8 and keeps one score per reference, as the panel does.

## ROUGE-L and ROUGE-Lsum

| Tab | Function | How a multi-sentence text is read |
|---|---|---|
| **ROUGE-L** | `rouge_l_sentence` | One sequence of words |
| **ROUGE-Lsum** | `rouge_l_summary` | A list of sentences, matched sentence by sentence through the union LCS |

The panel's bullet describes the pair the same way: the longest common subsequence over the whole text, or sentence by sentence with the union LCS. When the candidate orders its sentences differently from the reference, ROUGE-Lsum can still credit each reference sentence with the matching words of any candidate sentence.

## In the panel

**Compare Metrics** reports ROUGE-Lsum beside ROUGE-1, ROUGE-2 and ROUGE-L, all with β = 1. **Low-Score Documents** prints the start of the lowest-scoring candidates, where the sentence structure of candidate and reference can be checked by eye.

**Per-Document Scores** lists precision, recall and F of every document on the **ROUGE-Lsum** tab, and **Aggregate Scores** gives their macro and length-weighted averages, the latter weighting precision by the words of the candidate and recall by the words of the references.

## References

<a id="ref-JTC2023a"></a>JuliaText Contributors (2023). *TextAnalysis.jl: Julia NLP Toolkit*. [github.com/JuliaText/TextAnalysis.jl](https://github.com/JuliaText/TextAnalysis.jl)

<a id="ref-Lin2004a"></a>Lin, C.-Y. (2004). ROUGE: A Package for Automatic Evaluation of Summaries. *ACL Workshop on Text Summarization Branches Out*. [aclanthology.org/W04-1013](https://aclanthology.org/W04-1013)

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
- [ROUGE-N](rouge-n.md) · [ROUGE-L](rouge-l.md)
