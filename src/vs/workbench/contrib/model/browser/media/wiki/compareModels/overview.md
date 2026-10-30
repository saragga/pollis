# Evaluate Answering Models — Overview

Retrieval-augmented generation has two stages: an index finds the passages, and a language model answers from them ([Lewis, Perez, Piktus, Petroni, Karpukhin, Goyal, Küttler, Lewis, Yih, Rocktäschel, Riedel and Kiela (2020)](#ref-LPPPK...2020a)). Two models given the same passages can still answer differently: one keeps to the passages, another goes beyond them or leaves out half of what they say. Evaluate Answering Models holds the passages and the instruction fixed, so that what differs between the answers is the model alone.

## Choosing the Models to Compare
Step 1, **Models**, lists the chat models **On This Computer** and those **In the Cloud, With Your Own Key**. Any mixture can be compared in one run. A model on this computer has to be downloaded first, in Compose > Local Models. A cloud model needs the key of its provider, and it is sent the questions and the passages.

## Choosing the Questions From a Test Set
Step 2, **Questions**, shows the **Test Set**: each question with the passage it was made from and its right answer. **Standard** comes with Pollis, has 100 reviewed questions and cannot be changed; **Save As...** makes a copy that can be, and **New Set...** an empty one. Tick the questions to ask; with none ticked, **Run** asks them all. Each set of your own is kept in ~/.pollis/ask/sets, and every change to it is saved as it is made.

## Making Your Own Test Questions
**Change This Set** has the ways of filling a test set of your own. **Make Questions...** has the model chosen in **By** write a question and its right answer from a passage, as many of each topic as asked, with `RAGTools.build_qa_evals` ([Simsa (2025)](#ref-Sim...2025a)). **Add** takes one question of your own, with the passage that answers it found by **Find Passages**. **Import...** reads the questions of a file and **Export...** writes them to one. **Delete Ticked** removes the questions ticked. Read the questions a model made before a run: a question its passage does not answer is better deleted.

## Running the Comparison
Step 3, **Run**, has the **Judge**, a **Second Judge** if wanted, and **Repeats**, how many times each model answers each question. **Run** first finds the passages for each question, then each model answers, and finally the judges rate every answer. Models on this computer run one after the other, each alone in memory, and a warning appears above **Run** when one needs more memory than is free. **Stop** ends the run early. The charts show the free memory and the tokens as the run goes, and **Model Servers** shows when each local model was loaded and stopped.

## Reading the Results of a Run
Step 4, **Results**, has a column of figures for each model, the best first by the rating of the first judge. Earlier runs of Evaluate Answering Models stay available under **Run**, and **Delete Run** removes one. **Answers** lists the questions of the run with each model's rating and seconds; a click on a question shows the answers side by side, with their sources, seconds and ratings, next to the right answer. A judge's reason for not rating an answer is shown there too.

## A Typical Evaluation of Answering Models
1. Choose two or three models, one of them the model in use, so that the others have something to beat.
2. Tick about twenty questions of the **Standard** test set for a first look, as a run over all of them takes much longer.
3. Choose as **Judge** the strongest model available that is not among those compared.
4. **Run**, then read the figures in **Results** and the answers of the questions where the models differ most.
5. Run all the questions, with **Repeats** above 1, on the models still in contention.

## References

<a id="ref-LPPPK...2020a"></a>Lewis, P., Perez, E., Piktus, A., Petroni, F., Karpukhin, V., Goyal, N., Küttler, H., Lewis, M., Yih, W., Rocktäschel, T., Riedel, S. and Kiela, D. (2020). Retrieval-augmented generation for knowledge-intensive NLP tasks. *NeurIPS*. [arXiv:2005.11401](https://arxiv.org/abs/2005.11401)

<a id="ref-Sim...2025a"></a>Simsa, J. (2025). *RAGTools.jl: Retrieval-Augmented Generation Tools in Julia*. [github.com/JuliaGenAI/RAGTools.jl](https://github.com/JuliaGenAI/RAGTools.jl)

## See Also
- [Factsheet](factsheet.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
