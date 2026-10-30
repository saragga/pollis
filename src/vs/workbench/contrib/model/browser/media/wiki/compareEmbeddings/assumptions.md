# Assumptions

## One Right Passage for Each Question
Evaluate Embedding Models counts a search as right when it finds the passage the question was made from. Another passage may answer the question as well, and finding only that one counts as not found. **Found** therefore understates how often a usable passage is found, and it can penalise a model that finds a good passage elsewhere. To see whether that happened, read the passages for questions where the models differ.

## Questions Made From a Passage Share Its Words
A question written from a passage tends to use the passage's own words, which favours the search by words. Real questions often say the same thing differently, which is where embeddings help. **Found** and **Place** include the search by words, so differences between models may look small; **Found by Meaning** and **Place by Meaning** leave it out and show the embedding model alone. Questions of your own, in your own words, are a harder and fairer test.

## Pollis' Documents Stand In for Yours
A run searches the index of Ask Pollis: the documents, wikis and vignettes of this Pollis. A model that does well there may do less well on a collection of another kind in Retrieval-Augmented Generation. Published benchmarks raise the same doubt: across 8 tasks and 58 datasets, [Muennighoff, Tazi, Magne and Reimers (2023)](#ref-MTMR2023a) found that no embedding model does best on all of them. A model's rank elsewhere is a reason to try it, not a result for your documents.

## The Prefixes Are Part of the Embedding Model
Many embedding models were trained with a short text before each question and each passage, and they find less without it. Evaluate Embedding Models searches with the prefixes known for each model and shows the one for questions in **Question Prefix**. A wrong prefix makes a model look worse than it is. A passage is embedded with its document and headings before its text, so a passage's headings count towards finding it.

## Speed and Memory Depend on the Computer
**Question**, **Search**, **Passages a Second** and **Memory** hold for this computer at the time of the run. **Memory** is the memory free before the model's server started, less the memory free when it was done, so another program starting or stopping during the run changes it. Each model runs alone in memory, and a run compares models fairly only when the computer is otherwise doing about the same during each.

## References

<a id="ref-MTMR2023a"></a>Muennighoff, N., Tazi, N., Magne, L. and Reimers, N. (2023). MTEB: massive text embedding benchmark. *Proceedings of the 17th Conference of the European Chapter of the Association for Computational Linguistics*, 2014–2037. [doi:10.18653/v1/2023.eacl-main.148](https://doi.org/10.18653/v1/2023.eacl-main.148)

## See Also
- [Interpretation](interpretation.md) · [Diagnostics](diagnostics.md) · [Decision Guide](decision-guide.md)
