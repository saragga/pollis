# Evaluate Answering Models — Factsheet

**Evaluate Answering Models** shows which language model should answer Ask Pollis. Each model chosen answers the questions of a test set from the same passages, with the same instruction, and a judge model rates every answer, with [RAGTools.jl](https://github.com/Trumpingtons/RAGTools.jl) ([Simsa (2025)](#ref-Sim...2025a)).

| | |
|---|---|
| **Purpose** | Choose the answering model of Ask Pollis by the ratings of its answers, its speed and its memory |
| **Input** | Chat models on this computer or in the cloud, a test set of questions, and a judge model |
| **Core packages** | [RAGTools.jl](https://github.com/Trumpingtons/RAGTools.jl), [PromptingTools.jl](https://github.com/Trumpingtons/PromptingTools.jl) |
| **Steps** | Models, Questions, Run, Results |
| **Output** | A column of figures for each model, and each question's answers side by side with their ratings, kept in ~/.pollis/ask/Comparisons.duckdb |
| **Key choice** | The judge, whose ratings every comparison rests on |

## When to Use Evaluate Answering Models
- Choosing the answering model of Ask Pollis, which the status bar then sets for the Ask Pollis pane and for the panels.
- Deciding whether a smaller local model answers well enough to save memory and time.
- Deciding whether a cloud model is worth its cost and worth sending the passages out of this computer.
- Seeing whether a new model does better than the one in use, on the questions you care about.

## What Evaluate Answering Models Does Not Measure
Evaluate Answering Models does not measure how well the right passages are found: every model is given the same passages, so finding them is held fixed. Evaluate Embedding Models measures the finding. Nor is the Score a measure of truth: the judge compares an answer with the passages and never sees the right answer, so reading some answers remains part of the evaluation.

## References

<a id="ref-Sim...2025a"></a>Simsa, J. (2025). *RAGTools.jl: Retrieval-Augmented Generation Tools in Julia*. [github.com/JuliaGenAI/RAGTools.jl](https://github.com/JuliaGenAI/RAGTools.jl)

## See Also
- [Overview](overview.md) · [Decision Guide](decision-guide.md) · [Interpretation](interpretation.md)
