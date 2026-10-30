# Assumptions

## The Judge Rates an Answer Against the Passages
The judge in Evaluate Answering Models is given the question, the passages and the answer, and never the right answer of the test set. A rating therefore says how well an answer agrees with the passages it was given, as metrics without human reference answers do ([Es, James, Espinosa Anke and Schockaert (2024)](#ref-EJAS2024a)). An answer can rate well and still be wrong when the passages found do not hold the answer. The right answer is there for you to read beside the answers, in **Answers**.

## A Judge Model Stands In for a Human Reader
A language model that judges other models can come close to human preferences: the strong judges studied by [Zheng, Chiang, Sheng, Zhuang, Wu, Zhuang, Lin, Li, Li, Xing, Zhang, Gonzalez and Stoica (2023)](#ref-ZCSZW...2023a) agreed with people over 80% of the time, about as often as people agree with each other. The same study found the biases of such judges: position, verbosity and favouring their own answers. A long answer may therefore rate higher than a short one that is as good, and a judge should not be among the models it judges.

## Every Model Gets the Same Passages
Evaluate Answering Models finds the passages for each question once, by words and meaning as Ask Pollis does, and gives the same ones to every model. A difference in rating then comes from the model and not from retrieval. The result holds for passages of this quality: a model that does well with the right passage in hand may do worse with poor passages, or the reverse, and when the index or its embedding model changes the comparison may change too.

## The Test Set Stands In for Your Own Questions
A comparison says something only about questions like those asked. The questions of a test set are each made from one passage, so they tend to be answerable from a single paragraph and to use its words. Questions that join several places, or that the documents do not answer at all, are less well represented. A model's rank on the **Standard** test set is a starting point; a test set of your own questions is closer to your use.

## Repeats Show Chance, Not Quality
A model may answer the same question differently each time, and a judge may rate the same answer differently. With **Repeats** at 1, a small difference in Score between two models can be chance. Repeats above 1 show how much answers and seconds vary, in **Spread**, at the cost of a longer run. The questions themselves are also a sample, and a small number of them leaves large differences to chance as well.

## Speed Depends on the Computer and the Moment
**First Word**, **Seconds**, **Reading** and **Writing** hold for this computer at the time of the run. Models on this computer run alone in memory, but other programs still take memory and processor time. The speed of a cloud model depends on its provider's load and on the network, so the same model can be faster or slower on another day. Speeds compare well within a run on one computer, and less well across computers or days.

## References

<a id="ref-EJAS2024a"></a>Es, S., James, J., Espinosa Anke, L. and Schockaert, S. (2024). RAGAs: automated evaluation of retrieval augmented generation. *Proceedings of the 18th Conference of the European Chapter of the Association for Computational Linguistics: System Demonstrations*, 150–158. [doi:10.18653/v1/2024.eacl-demo.16](https://doi.org/10.18653/v1/2024.eacl-demo.16)

<a id="ref-ZCSZW...2023a"></a>Zheng, L., Chiang, W.-L., Sheng, Y., Zhuang, S., Wu, Z., Zhuang, Y., Lin, Z., Li, Z., Li, D., Xing, E. P., Zhang, H., Gonzalez, J. E. and Stoica, I. (2023). Judging LLM-as-a-judge with MT-Bench and Chatbot Arena. *Advances in Neural Information Processing Systems 36*, 46595–46623. [doi:10.52202/075280-2020](https://doi.org/10.52202/075280-2020)

## See Also
- [Interpretation](interpretation.md) · [Diagnostics](diagnostics.md) · [Decision Guide](decision-guide.md)
