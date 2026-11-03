# ROUGE Evaluation: ROUGE-L

**ROUGE-L** measures the longest common subsequence of a candidate and a reference: the longest sequence of words that appears in both in the same order, not necessarily consecutively. The panel reads each text as one sequence, as `rouge_l_sentence` in TextAnalysis does.

## Longest common subsequence

[Lin (2004)](#ref-Lin2004a) recalls the definition: a sequence Z = [z₁, …, zₖ] is a subsequence of X = [x₁, …, xₘ] if there is a strictly increasing sequence of indices i₁ < … < iₖ of X with xᵢⱼ = zⱼ for all j. The longest common subsequence, LCS, of X and Y is a common subsequence of maximum length.

To apply it to summaries, [Lin (2004)](#ref-Lin2004a) views a summary sentence as a sequence of words, with the intuition that the longer the LCS of two summary sentences is, the more similar they are.

## The F-measure

For a reference X of m words and a candidate Y of n words, [Lin (2004)](#ref-Lin2004a) defines

R_lcs = LCS(X, Y) / m, P_lcs = LCS(X, Y) / n, F_lcs = (1 + β²) R_lcs P_lcs / (R_lcs + β² P_lcs)

and calls the F-measure ROUGE-L. ROUGE-L is 1 when X = Y, and 0 when the two have nothing in common. In DUC, β was set to a very big number, so that only R_lcs was considered.

In the panel, β is **F Weight (beta)**, an integer, 1 by default, passed to `rouge_l_sentence(refs, cand, β)`. TextAnalysis, by [JuliaText Contributors (2023)](#ref-JTC2023a), sets the default of `rouge_l_sentence` to β = 8 when no value is given.

## Order without adjacency

[Lin (2004)](#ref-Lin2004a) names two advantages of the LCS: it requires in-sequence matches that reflect word order rather than consecutive matches, and it automatically includes the longest in-sequence common n-grams, so that no n-gram length needs to be fixed in advance.

In his example, with the reference "police killed the gunman", the candidate "police kill the gunman" has ROUGE-L 3/4 and "the gunman kill police" 2/4, with β = 1, while both have the same ROUGE-2. He also notes that ROUGE-L is at most the unigram F-measure of the two texts, since it counts only the co-occurring words that are in sequence.

## Only one subsequence

The LCS counts a single in-sequence chain of words. [Lin (2004)](#ref-Lin2004a) shows the consequence with the candidate "the gunman police killed": the LCS with the reference is either "the gunman" or "police killed", not both, so its ROUGE-L equals that of "the gunman kill police", while ROUGE-2 ranks it higher.

**Compare Metrics** shows, for the candidates at hand, how ROUGE-L stands against ROUGE-1 and ROUGE-2.

## Whole texts

`rouge_l_sentence` computes the LCS at sentence level, and the panel passes each candidate and each reference as one string, so a summary of several sentences is read as a single sequence of words. The order of the sentences then matters: a chain of matching words must run through the candidate and the reference in the same order.

The summary-level version, which compares each reference sentence with every candidate sentence, is the **ROUGE-Lsum** tab, described in [ROUGE-Lsum](rouge-lsum.md).

## In the evaluation of ROUGE

[Lin (2004)](#ref-Lin2004a) found that ROUGE-L worked well in single-document summarisation and in evaluating very short summaries, and that ROUGE-L and ROUGE-W did less well on the 100-word multi-document summaries of DUC 2001 to 2003. His conclusions note that the stability and reliability of ROUGE at different sample sizes were reported separately, and he refers to a further study in which ROUGE-L, ROUGE-W and ROUGE-S were effective in the automatic evaluation of machine translation.

## References

<a id="ref-JTC2023a"></a>JuliaText Contributors (2023). *TextAnalysis.jl: Julia NLP Toolkit*. [github.com/JuliaText/TextAnalysis.jl](https://github.com/JuliaText/TextAnalysis.jl)

<a id="ref-Lin2004a"></a>Lin, C.-Y. (2004). ROUGE: A Package for Automatic Evaluation of Summaries. *ACL Workshop on Text Summarization Branches Out*. [aclanthology.org/W04-1013](https://aclanthology.org/W04-1013)

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
- [ROUGE-N](rouge-n.md) · [ROUGE-Lsum](rouge-lsum.md)
