# Evaluate Answering Models — Overview

Retrieval-augmented generation has two stages: an index finds the passages, and a language model answers from them ([Lewis, Perez, Piktus, Petroni, Karpukhin, Goyal, Küttler, Lewis, Yih, Rocktäschel, Riedel and Kiela (2020)](#ref-LPPPK...2020a)). Two models given the same passages can still answer differently: one keeps to the passages, another goes beyond them or leaves out half of what they say. Answering from passages that a search has to find first, in a library of documents, is open library answering, what the literature calls open-domain question answering ([Chen, Fisch, Weston and Bordes (2017)](#ref-CFWB2017a)). Evaluate Answering Models measures it as Ask Pollis does it, the passages found in the documents of Pollis by the strategy chosen. It also measures open book answering, each model given the passage the question was made from, with no search, which tests the answer alone, and closed book answering, each model given no passage, answering from what it learned in training alone ([Roberts, Raffel and Shazeer (2020)](#ref-RRS2020a)), which shows the questions a model answers without the documents. Each way it holds the passages and the instruction fixed, so that what differs between the answers is the model alone.

## Choosing the Models to Compare
Step 1, **Models**, lists the chat models **On This Computer** and those **In the Cloud, With Your Own Key**. Any mixture can be compared in one run. A model on this computer has to be downloaded first, in Compose > Local AI Models. A cloud model needs the key of its provider, and it is sent the questions and the passages.

## Choosing the Questions From a Test Set
Step 2, **Questions**, shows the **Test Set**: each question with the passage it was made from and its right answer. **Standard** comes with Pollis, has 100 reviewed questions and cannot be changed; **Save As...** makes a copy that can be, and **New Set...** an empty one. Tick the questions to ask; with none ticked, **Run** asks them all. **Tick at Random** ticks the number of questions given, drawn at random and spread over the panels or topics of the set, and the ticks stay until it draws again, so that runs of different models or strategies ask the same questions. Each set of your own is kept in ~/.pollis/ask/sets, and every change to it is saved as it is made.

## Making Your Own Test Questions
**Change This Set** has the ways of filling a test set of your own. **Make Questions...** has the model chosen in **By** write a question and its right answer from a passage, as many of each topic as asked (Pollis, Julia Language, Topic Panels, Articles and Package APIs), with `RAGTools.build_qa_evals` ([Simecek (2025)](#ref-Sim...2025a)). **Add** takes one question of your own, with the passage that answers it found by **Find Passages**. **Import...** reads the questions of a file and **Export...** writes them to one. **Delete Ticked** removes the questions ticked. Read the questions a model made before a run: a question its passage does not answer is better deleted.

## Running the Comparison
Step 3, **Run**, has the **Passages**, **Found in the Library** or **The Question's Own Passage**, the **Strategy** of Ask Pollis that finds the passages and asks the models, which the question's own passage does not need, the **Judge**, None or a model, a **Second Judge** if wanted, and **Repeats**, how many times each model answers each question. **Run** first finds the passages for each question, or takes its own, then each model answers, then each answer gets its **Answer Score**, how near it is in meaning to the right answer by the embedding model of the search, and finally the judges, if any, rate every answer from 1 to 5 against the right answer. With **Judge** set to None, the run costs no tokens beyond the answers. Models on this computer run one after the other, each alone in memory, and a warning appears above **Run** when one needs more memory than is free. **Stop** ends the run early. The charts show the free memory and the tokens as the run goes, and **Model Servers** shows when each local model was loaded and stopped.

## Choosing Where the Passages Are Found
With **Passages** set to **Found in the Library**, **Search In** chooses where the strategy finds the passages, as **Search In** of Ask Pollis does. **Auto** searches each question in the collections nearest it, Pollis' own documents, the Julia Manual or both, and leaves out the Package APIs, the Articles, the Knowledge Base and the collections of Retrieval-Augmented Generation. Any of the sources can be ticked instead, alone or together, or **All Sources** chosen, so that a run measures the answers from the sources it is meant for: a question made from an abstract finds its passage only when **Articles** is searched, or when it is asked in the panel that cites the work. A question of the Panel FAQ is asked in its panel, whose own passages give most of those found. The line of a run in **Results** says what **Search In** chose.

## Reading the Results of a Run
Step 4, **Results**, has a column of figures for each model, the best first by the rating of the first judge, or by the Answer Score in a run without a judge. A line below the figures says for how many questions the passage the question was made from was among those found, and at what place on average. Earlier runs of Evaluate Answering Models stay available under **Run**, and **Delete Run** removes one. **Answers** lists the questions of the run with each model's rating by the first judge, or its Answer Score in a run without a judge, and its seconds; a click on a question shows the answers side by side, with their sources, seconds, Answer Scores and ratings, next to the right answer. A judge's reason for not rating an answer is shown there too.

## A Typical Evaluation of Answering Models
1. Choose two or three models, one of them the model in use, so that the others have something to beat.
2. Tick about twenty questions of the **Standard** test set with **Tick at Random** for a first look, as a run over all of them takes much longer.
3. Leave **Judge** at None for a first look, as the Answer Score needs no judge; for a decision, choose as Judge the strongest model available that is not among those compared.
4. **Run**, then read the figures in **Results**, the line of the passages found, and the answers of the questions where the models differ most.
5. Run all the questions, with **Repeats** above 1, on the models still in contention.

## References

<a id="ref-CFWB2017a"></a>Chen, D., Fisch, A., Weston, J. and Bordes, A. (2017). Reading Wikipedia to answer open-domain questions. *Proceedings of the 55th Annual Meeting of the Association for Computational Linguistics (Volume 1: Long Papers)*, 1870–1879. [doi:10.18653/v1/P17-1171](https://doi.org/10.18653/v1/P17-1171)

<a id="ref-LPPPK...2020a"></a>Lewis, P., Perez, E., Piktus, A., Petroni, F., Karpukhin, V., Goyal, N., Küttler, H., Lewis, M., Yih, W., Rocktäschel, T., Riedel, S. and Kiela, D. (2020). Retrieval-augmented generation for knowledge-intensive NLP tasks. *NeurIPS*. [arXiv:2005.11401](https://arxiv.org/abs/2005.11401)

<a id="ref-RRS2020a"></a>Roberts, A., Raffel, C. and Shazeer, N. (2020). How much knowledge can you pack into the parameters of a language model? *Proceedings of the 2020 Conference on Empirical Methods in Natural Language Processing (EMNLP)*, 5418–5426. [doi:10.18653/v1/2020.emnlp-main.437](https://doi.org/10.18653/v1/2020.emnlp-main.437)

<a id="ref-Sim...2025a"></a>Simecek, J. (2025). *RAGTools.jl: Retrieval-Augmented Generation Tools in Julia*. [github.com/JuliaGenAI/RAGTools.jl](https://github.com/JuliaGenAI/RAGTools.jl)

## See Also
- [Factsheet](factsheet.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
