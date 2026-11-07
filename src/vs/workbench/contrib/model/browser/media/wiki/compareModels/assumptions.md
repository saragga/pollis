# Assumptions

## The Judge Rates an Answer Against the Right Answer
A judge, when one is chosen, is given the question, the right answer of the test set and the answer, and not the passages the answer was written from, and rates from 1 to 5 how well the answer agrees with the right answer. Giving the judge a reference answer is one of the ways [Zheng, Chiang, Sheng, Zhuang, Wu, Zhuang, Lin, Li, Li, Xing, Zhang, Gonzalez and Stoica (2023)](#ref-ZCSZW...2023a) made judges more reliable on questions with one right answer. A rating therefore says whether an answer is right, not whether it keeps to the passages: an answer right from what the model knows rates well even when the passages found did not hold it. Correct details that the right answer does not have are not counted against an answer.

## The Answer Score Measures Nearness in Meaning
The **Answer Score** is the cosine similarity of the embeddings of an answer and of the right answer, by the embedding model of the search. It needs no judge and costs no tokens, but it measures how near two texts are in meaning, not whether their facts agree: an answer with a wrong number can lie near the right answer, and a right answer in other words a little further from it. Its values compare the answers of one run, with one embedding model, and differ from one embedding model to another.

## A Judge Model Stands In for a Human Reader
A language model that judges other models can come close to human preferences: the strong judges studied by [Zheng, Chiang, Sheng, Zhuang, Wu, Zhuang, Lin, Li, Li, Xing, Zhang, Gonzalez and Stoica (2023)](#ref-ZCSZW...2023a) agreed with people over 80% of the time, about as often as people agree with each other. The same study found the biases of such judges: position, verbosity and favouring their own answers. A long answer may therefore rate higher than a short one that is as good, and a judge should not be among the models it judges.

## Every Model Gets the Same Passages
Evaluate Answering Models finds the passages for each question once, with the **Strategy** chosen, as Ask Pollis finds them, and gives the same ones to every model. With **The Question's Own Passage**, each model is given the passage the question was made from, and for a question of the Panel FAQ the passages of the wiki that answers it. A difference in rating then comes from the model and not from retrieval. The result holds for passages of this quality: a model that does well with the right passage in hand may do worse with poor passages, or the reverse, and when the index or its embedding model changes the comparison may change too.

## The Test Set Stands In for Your Own Questions
A comparison says something only about questions like those asked. The questions of a test set are each made from one passage, so they tend to be answerable from a single paragraph and to use its words. Questions that join several places, or that the documents do not answer at all, are less well represented. A model's rank on the **Standard** test set is a starting point; a test set of your own questions is closer to your use.

## Repeats Show Chance, Not Quality
A model may answer the same question differently each time, and a judge may rate the same answer differently. With **Repeats** at 1, a small difference in Score between two models can be chance. Repeats above 1 show how much answers and seconds vary, in **Spread**, at the cost of a longer run. The questions themselves are also a sample, and a small number of them leaves large differences to chance as well.

## Speed Depends on the Computer and the Moment
**First Word**, **Seconds**, **Reading** and **Writing** hold for this computer at the time of the run. Models on this computer run alone in memory, but other programs still take memory and processor time. The speed of a cloud model depends on its provider's load and on the network, so the same model can be faster or slower on another day. Speeds compare well within a run on one computer, and less well across computers or days.

## References

<a id="ref-ZCSZW...2023a"></a>Zheng, L., Chiang, W.-L., Sheng, Y., Zhuang, S., Wu, Z., Zhuang, Y., Lin, Z., Li, Z., Li, D., Xing, E. P., Zhang, H., Gonzalez, J. E. and Stoica, I. (2023). Judging LLM-as-a-judge with MT-Bench and Chatbot Arena. *Advances in Neural Information Processing Systems 36*, 46595–46623. [doi:10.52202/075280-2020](https://doi.org/10.52202/075280-2020)

## See Also
- [Interpretation](interpretation.md) · [Diagnostics](diagnostics.md) · [Decision Guide](decision-guide.md)
