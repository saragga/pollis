# Interpretation

## What Found Means for an Embedding Model
**Found** is how often the passage a question was made from is among the 8 passages Ask Pollis gives, found by words and meaning together. It is the measure closest to Ask Pollis in use, since an answering model sees only these passages. It is recall at a fixed number of results, with one relevant passage for each question ([Manning, Raghavan and Schütze (2008)](#ref-MRS2008a)). Columns in **Results** go from the highest Found to the lowest, and a tie goes to the better **Place**.

## What Place Means for an Embedding Model
**Place** is the place of the passage among those 8 when it is found, on average, where 1 is the first. Place counts only the questions where the passage was found, so a model that finds more difficult passages, low in the list, can have a worse Place than a model that misses them. Read Place together with Found. Place differs from the mean reciprocal rank of the TREC-8 Question Answering Track, which also counts a passage not found ([Voorhees (1999)](#ref-Voo1999a)).

## Found by Meaning and Place by Meaning
**Found by Meaning** is how often the passage is among the first 8 by the embeddings alone, leaving out the search by words. **Place by Meaning** is its place among all the passages by the embeddings alone, as a median, so a few questions with very distant passages do not swamp it. These two figures show the embedding model by itself. A model can gain much here and little in Found, when the search by words already finds those passages.

## The Places for Each Question
The part **Questions** of **Results** shows each question with the place of its passage for each model: first among those Ask Pollis gives, then by meaning alone, with a dash when the passage is not among them. The questions where the models differ show what a model does better. A dash for every model marks a question that no embedding model helps, often because the question does not fit its passage.

## Reading the Speed of an Embedding Model
**Question, ms** is the time to embed a question, on average, which Ask Pollis spends on each question asked. **Search, ms** is the time to find the passages by words and meaning. **Passages a Second** is how fast the model embedded passages, shown when the run embedded any, and it says how long a new index or a new collection will take. A difference of some milliseconds per question is rarely noticed beside the seconds of an answer.

## Reading the Memory and Size of an Embedding Model
**Memory, GB** is the memory the model's server took. Ask Pollis needs the model in memory to embed each question, alongside any local answering model. **Dimensions** is the length of the vectors, and **Index, MB** the size of the embeddings of all the passages. More dimensions cost space and search time, and they do not guarantee better finding. **Question Prefix** is the text put before each question for that model.

## How Large a Difference in Found Matters
Found is a share of the questions asked, so its precision depends on their number. With few questions, one question more or less moves the figure visibly, and a small difference between two models can be chance. When a gain in Found comes from a handful of questions, read those questions before paying for it in memory. More questions, rather than a second run of the same ones, narrow the uncertainty: searches give the same places when repeated.

## References

<a id="ref-MRS2008a"></a>Manning, C. D., Raghavan, P. and Schütze, H. (2008). *Introduction to Information Retrieval*. Cambridge University Press. [doi:10.1017/CBO9780511809071](https://doi.org/10.1017/CBO9780511809071)

<a id="ref-Voo1999a"></a>Voorhees, E. M. (1999). The TREC-8 question answering track report. *Proceedings of the Eighth Text REtrieval Conference (TREC-8)*, NIST Special Publication 500-246. [trec.nist.gov](https://trec.nist.gov/pubs/trec8/papers/qa_report.pdf)

## See Also
- [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Decision Guide](decision-guide.md)
