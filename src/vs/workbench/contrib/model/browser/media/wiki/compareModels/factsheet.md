# Evaluate Answering Models — Factsheet

**Evaluate Answering Models** shows which language model should answer Ask Pollis. It measures open library answering, what the literature calls open-domain question answering ([Chen, Fisch, Weston and Bordes (2017)](#ref-CFWB2017a)): the passages of each question are found in the documents of Pollis, as Ask Pollis finds them, and each model chosen answers from the same passages, with the same instruction. With **The Question's Own Passage**, it measures open book answering instead: each model is given the passage the question was made from, with no search. With **None**, it measures closed book answering: each model is given no passage, and answers from what it learned in training alone ([Roberts, Raffel and Shazeer (2020)](#ref-RRS2020a)). Each answer has an **Answer Score**, how near it is in meaning to the right answer, and a judge model, if one is chosen, rates it from 1 to 5 against the right answer, with [PromptingTools.jl](https://github.com/Trumpingtons/PromptingTools.jl) ([Simecek (2025)](#ref-Sim2025b)).

| | |
|---|---|
| **Purpose** | Choose the answering model of Ask Pollis by the ratings of its answers, its speed and its memory |
| **Input** | Chat models on this computer or in the cloud, a test set of questions, and a judge model if wanted |
| **Core packages** | [RAGTools.jl](https://github.com/Trumpingtons/RAGTools.jl), [PromptingTools.jl](https://github.com/Trumpingtons/PromptingTools.jl) |
| **Steps** | Models, Questions, Run, Results |
| **Output** | A column of figures for each model, and each question's answers side by side with their scores and ratings, kept in ~/.pollis/ask/Comparisons.duckdb |
| **Key choice** | The test set, whose questions every comparison rests on, and whether the passages are found or given |

## When to Use Evaluate Answering Models
- Choosing the answering model of Ask Pollis, which Set Active Models then sets for the Ask Pollis pane and for the panels.
- Deciding whether a smaller local model answers well enough to save memory and time.
- Deciding whether a cloud model is worth its cost and worth sending the passages out of this computer.
- Seeing whether a new model does better than the one in use, on the questions you care about.

## What Evaluate Answering Models Does Not Measure
Evaluate Answering Models does not compare the ways of finding the passages: every model is given the same passages, found once for each question, so finding them is held fixed, and a line of the passages found shows how well they were found. Evaluate Embedding Models and Evaluate Reranking Models compare the models that find them. Nor are the scores a measure of truth: the **Answer Score** measures how near the meaning of an answer is to the right answer, and a rating rests on its judge, so reading some answers remains part of the evaluation.

## References

<a id="ref-CFWB2017a"></a>Chen, D., Fisch, A., Weston, J. and Bordes, A. (2017). Reading Wikipedia to answer open-domain questions. *Proceedings of the 55th Annual Meeting of the Association for Computational Linguistics (Volume 1: Long Papers)*, 1870–1879. [doi:10.18653/v1/P17-1171](https://doi.org/10.18653/v1/P17-1171)

<a id="ref-RRS2020a"></a>Roberts, A., Raffel, C. and Shazeer, N. (2020). How much knowledge can you pack into the parameters of a language model? *Proceedings of the 2020 Conference on Empirical Methods in Natural Language Processing (EMNLP)*, 5418–5426. [doi:10.18653/v1/2020.emnlp-main.437](https://doi.org/10.18653/v1/2020.emnlp-main.437)

<a id="ref-Sim2025b"></a>Simecek, J. (2025). *PromptingTools.jl*. [github.com/svilupp/PromptingTools.jl](https://github.com/svilupp/PromptingTools.jl)

## See Also
- [Overview](overview.md) · [Decision Guide](decision-guide.md) · [Interpretation](interpretation.md)
