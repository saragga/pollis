# ROUGE Evaluation: Diagnostics

How to check a set of scores: their spread over documents, the balance of precision and recall, the lowest-scoring documents, and the inputs themselves.

## The inputs

The code checks that **Candidates (System A)** and **References** have one entry per document and stops with an error otherwise; **Compare Systems** checks the same for **Candidates (System B)**. Each reference entry may be a string or a vector of strings.

A candidate scored against the wrong reference, because the order of the documents differs, gives low scores everywhere. **Low-Score Documents** prints the start of each low-scoring candidate beside its best reference, so a mismatch shows at once.

## The distribution of the scores

**Score Distribution** draws a histogram of F over the documents, in 20 bins, with the macro average as a dashed line. **Score Summary** prints the mean, median, minimum and maximum of precision, recall and F.

A mean far from the median, or a long tail of low scores, means that a few documents weigh on the average; **Per-Document Scores** lists every value. The default data have 19 documents, so a handful of low scores is visible in the histogram as separate bars.

## Precision against recall

**Precision-Recall Plot** places every document at its recall and precision, coloured by the number of words of the candidate, with the diagonal dashed. As the comment in the code notes, longer candidates move right, towards higher recall, and down, towards lower precision.

[Lin (2004)](#ref-Lin2004a) defines ROUGE-N as a recall-related measure, its denominator counting the n-grams of the references; precision divides by the length of the candidate instead. A system that writes long summaries can raise recall at the cost of precision, and the plot shows where each document lies on that trade-off.

## The lowest documents

**Low-Score Documents** prints the five documents with the lowest F, each with its F, the first 150 characters of the candidate and of the reference with the highest F, to be read by hand.

The comment in the code states what to look for: a low score can be a faithful paraphrase, and a high score can still state a wrong fact. Reading the candidates is the check that the scores alone cannot give, since [Lin (2004)](#ref-Lin2004a) defines the measures by counts of overlapping units.

## Probes

**Paraphrase vs Wrong Fact** scores three sentences against one reference with the current metric and **Several References** setting:

| Probe | Sentence |
|---|---|
| faithful paraphrase | the central bank lifted borrowing costs by 0.5 percentage points to curb rising prices. |
| one wrong fact | the central bank cut interest rates by half a point to fight inflation. |
| exact copy | the reference itself, which scores 1 |

The reference is "the central bank raised interest rates by half a point to fight inflation." The three F scores show how the current metric ranks a change of words against a change of meaning.

## A new candidate

**Evaluate New Candidate** scores **New Candidate** against **New References** with the current metric and prints precision, recall and F. The candidate and the references are lowercased as in the main run.

[Lin (2004)](#ref-Lin2004a) notes that adding references expands the space of alternative summaries, and that by controlling the types of references added one can design evaluations that focus on different aspects of summarisation. Scoring one candidate against different reference sets is a way to see that effect.

## References

<a id="ref-Lin2004a"></a>Lin, C.-Y. (2004). ROUGE: A Package for Automatic Evaluation of Summaries. *ACL Workshop on Text Summarization Branches Out*. [aclanthology.org/W04-1013](https://aclanthology.org/W04-1013)

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
- [ROUGE-N](rouge-n.md) · [ROUGE-L](rouge-l.md) · [ROUGE-Lsum](rouge-lsum.md)
