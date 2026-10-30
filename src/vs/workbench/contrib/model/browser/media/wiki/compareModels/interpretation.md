# Interpretation

## What the Score of an Answering Model Means
**Score** is the judge's rating of a model's answers from 1 to 5, on average over the questions; each answer's rating is the mean of its five parts. Columns in **Results** go from the best Score to the worst, by the first judge. A Score is relative: it depends on the judge and on the questions, so it compares models within one run and says little across runs with another judge. A gap of a few hundredths between two models is usually not a real difference.

## The Five Parts of an Answer's Rating
The judge gives each part a whole number from 1 to 5, following the instructions of RAGTools.jl ([Simsa (2025)](#ref-Sim...2025a)).

| Part of the rating | What the judge is asked |
|---|---|
| Relevance | How well does the answer align with the passages? |
| Completeness | Does the answer cover all the essential points of the passages? |
| Clarity | How clear and understandable is the answer? |
| Consistency | How consistent is the answer with the passages as a whole? |
| Helpfulness | How helpful is the answer in answering the question? |

## Reading the Parts of the Rating Together
Two models with one Score can differ in their parts. Low **Consistency** with high **Clarity** is the pattern to watch: an answer that reads well and departs from the passages. Low **Completeness** with high **Consistency** marks a model that is accurate and leaves things out, which more length or another instruction may help. **Relevance** and **Helpfulness** tend to move together, as both ask whether the answer addresses what was asked.

## Comparing Two Judges
With a **Second Judge**, **Results** shows the Score by each judge. Judges that put the models in the same order give some confidence in that order, even when one judge is stricter on every model. Judges that reverse two models show that the difference between those two is not settled by the ratings, and the answers need reading. **Answers** shows the rating by the first judge; a click on a question shows the ratings by both.

## What Not Scored Means
**Not Scored** counts the answers not given, or not rated by every judge. Score is an average over the answers rated, so a model with many answers Not Scored may have a Score drawn from its easier questions, and its Score should not be compared directly with that of a model with none. The reason for each failure is shown under the answer in **Answers**.

## Reading the Speed of an Answering Model
**First Word** is the time from sending the question to the first word of the answer, in milliseconds, which is how long the reader waits before seeing anything. **Seconds** is the time for the whole answer. For a model on this computer, **Reading** is how fast it read the instruction, the passages and the question, and **Writing** how fast it wrote the answer, both in tokens per second. **Tokens** gives the tokens read and written for an answer, as the model's API counts them, and a cloud provider charges by them.

## What Spread Means
**Spread** appears when **Repeats** is above 1. It has two numbers: how many points the rating by the first judge varies, and how many seconds the answer time varies, from one asking of the same question to the next, as a standard deviation averaged over the questions. A difference in Score smaller than the Spread of the models is weak evidence that one is better. A model with a low Spread gives more dependable answers from one asking to the next.

## The Line of the Passages Found
A line in **Results** says for how many questions the passage a question was made from was among those found, and at what average place, with place 1 the first. The line is the same for every model, as all get the same passages. A high figure means the models had what they needed, so their ratings can be taken at face value. A low figure means the ratings rest on answers to passages that often lacked the answer.

## References

<a id="ref-Sim...2025a"></a>Simsa, J. (2025). *RAGTools.jl: Retrieval-Augmented Generation Tools in Julia*. [github.com/JuliaGenAI/RAGTools.jl](https://github.com/JuliaGenAI/RAGTools.jl)

## See Also
- [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Decision Guide](decision-guide.md)
