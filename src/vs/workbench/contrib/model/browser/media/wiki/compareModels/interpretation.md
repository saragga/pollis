# Interpretation

## What the Scores of an Answering Model Mean
**Answer Score** is how near a model's answers are in meaning to the right answers, on average: the cosine similarity of their embeddings by the embedding model of the search, from -1 to 1, higher being nearer. **Score** is the judge's rating of a model's answers against the right answers, from 1 to 5, on average over the questions. Columns in **Results** go from the best to the worst, by the Score of the first judge, or by the Answer Score in a run without a judge. Both are relative: they depend on the questions, and the Score on the judge and the Answer Score on the embedding model, so they compare models within one run and say little across runs with another judge or embedding model. A gap of a few hundredths between two models is usually not a real difference.

## The Judge's Scale
The judge rates each answer with a whole number from 1 to 5, after a reason of a sentence or two.

| Rating | The answer |
|---|---|
| 5 | Gives the facts of the right answer and nothing that contradicts it |
| 4 | Gives the main facts of the right answer, with a minor omission or a minor inaccuracy |
| 3 | Gives part of the right answer, or its main fact with an error |
| 2 | Misses the main fact of the right answer, or is mostly wrong |
| 1 | Is wrong, unrelated to the question, or declines to answer |

Correct details that the right answer does not have are not a fault; anything that contradicts it is. The Answer Score and the Score usually agree on the order of the models; when they do not, the answers where they differ most need reading.

## Comparing Two Judges
With a **Second Judge**, **Results** shows the Score by each judge. Judges that put the models in the same order give some confidence in that order, even when one judge is stricter on every model. Judges that reverse two models show that the difference between those two is not settled by the ratings, and the answers need reading. **Answers** shows the rating by the first judge; a click on a question shows the ratings by both.

## What Not Scored Means
**Not Scored** counts the answers not given, or not rated by every judge. Score is an average over the answers rated, so a model with many answers Not Scored may have a Score drawn from its easier questions, and its Score should not be compared directly with that of a model with none. The reason for each failure is shown under the answer in **Answers**.

## Reading the Speed of an Answering Model
**First Word** is the time from sending the question to the first word of the answer, in milliseconds, which is how long the reader waits before seeing anything. **Seconds** is the time for the whole answer. For a model on this computer, **Reading** is how fast it read the instruction, the passages and the question, and **Writing** how fast it wrote the answer, both in tokens per second. **Tokens** gives the tokens read and written for an answer, as the model's API counts them, and a cloud provider charges by them.

## What Spread Means
**Spread** appears when **Repeats** is above 1. It has two numbers: how many points the rating by the first judge varies, and how many seconds the answer time varies, from one asking of the same question to the next, as a standard deviation averaged over the questions. A difference in Score smaller than the Spread of the models is weak evidence that one is better. A model with a low Spread gives more dependable answers from one asking to the next.

## Open Library, Open Book and Closed Book Answering
A run with **Found in the Library** measures open library answering, the search and the answer together; a run with **The Question's Own Passage** measures open book answering, the answer alone, and has no line of the passages found. A run with **None** measures closed book answering, what each model answers from what it learned alone, and has no line of the passages found either. The line under **Results** says which a run was. Two runs of the same models on the same questions, one with the passages found and one with its own passage, show how much the answers lose to the search: a model that scores well with its own passage and less well with the passages found answers well, and is held back by what the search finds. A run with **None** shows which questions a model answers without the documents: a question that most models answer right with no passage tests what they learned, not what they read in the documents of Pollis.

## The Line of the Passages Found
A line in **Results** says for how many questions the passage a question was made from was among those found, and at what average place, with place 1 the first. The line is the same for every model, as all get the same passages. A high figure means the models had what they needed. A low figure means they often answered without the passage they needed, from what they know, so their scores say more about what they know than about how well they answer from the documents.

## See Also
- [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Decision Guide](decision-guide.md)
