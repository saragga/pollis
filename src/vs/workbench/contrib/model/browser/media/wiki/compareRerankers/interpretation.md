# Interpretation

## What Found Means for a Reranker
**Found** is how often the passage a question was made from is among the passages Ask Pollis gives, the first in the reranker's order. It is recall at a fixed number of results, with one relevant passage for each question ([Manning, Raghavan and Schütze (2008)](#ref-MRS2008a)), and the figure closest to Ask Pollis in use, since the answering model sees only those passages. The column of **No Reranker** gives Found for the order of the search, and the gain of a reranker is its Found less that one.

## What Place Means for a Reranker
**Place** is the place of the passage among those Ask Pollis gives when it is among them, on average, where 1 is the first. It counts only the questions where the passage was given, so a reranker that brings difficult passages up from far down can have a worse Place than one that leaves them out. Read Place together with Found. Place is not the mean reciprocal rank of the TREC-8 Question Answering Track, which counts a passage not given as well ([Voorhees (1999)](#ref-Voo1999a)).

## Place Among All Found
**Place Among All Found** is the place of the passage among all the passages found for its question, in the reranker's order, as a median over the questions where it was found. It shows how far a reranker moves the passage, also when it does not move it far enough to be given. A reranker with a much better Place Among All Found than No Reranker, and the same Found, moves passages in the right direction, and may give them with a larger number of passages.

## The Places for Each Question in a Reranking Run
The part **Questions** of **Results** shows each question with the place of its passage among all those found, in the order of each reranker and of No Reranker; the places among those Ask Pollis gives are in bold, and a dash means the search did not find the passage. The questions where the columns differ show what a reranker does. A dash in every column marks a question no reranker can help.

## Reading the Speed and Memory of a Reranker
**Reranking, ms** is the time to score all the passages found for a question, on average, which Ask Pollis adds to every question asked. It grows with the number of passages and their length. **Memory, GB** is the memory the reranker's server took, which Ask Pollis needs alongside the embedding model and any local answering model. No Reranker takes neither time nor memory.

## How Large a Gain of a Reranker Matters
Found is a share of the questions run, so with few questions one question more or less moves it visibly, and a small gain over No Reranker can be chance. When the gain comes from a handful of questions, read them before paying for the reranker on every question asked. More questions narrow the uncertainty better than a second run of the same ones, since a reranker gives the same scores when it runs again.

## References

<a id="ref-MRS2008a"></a>Manning, C. D., Raghavan, P. and Schütze, H. (2008). *Introduction to Information Retrieval*. Cambridge University Press. [doi:10.1017/CBO9780511809071](https://doi.org/10.1017/CBO9780511809071)

<a id="ref-Voo1999a"></a>Voorhees, E. M. (1999). The TREC-8 question answering track report. *Proceedings of the Eighth Text REtrieval Conference (TREC-8)*, NIST Special Publication 500-246. [trec.nist.gov](https://trec.nist.gov/pubs/trec8/papers/qa_report.pdf)

## See Also
- [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Decision Guide](decision-guide.md)
