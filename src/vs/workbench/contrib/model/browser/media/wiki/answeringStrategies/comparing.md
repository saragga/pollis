# Ask Pollis Strategies — Comparing Strategies

## How Are Two Strategies Compared?
Two answering strategies are compared by running Evaluate Answering Models with each, on the same test set and with the same models. Evaluate..., in the details of a strategy on the Ask Pollis Strategies page, opens Evaluate Answering Models with that strategy set in its Strategy menu. Each run keeps the strategy it used, and the run's scores appear in the Latest Runs of the strategy's details. Evaluate Answering Models finds the passages for each question once per run and gives every model the same passages, so the difference between two runs on the same questions comes from the strategy.

## What Is the Panel FAQ Test Set?
The Panel FAQ test set of Evaluate Answering Models holds the questions of the FAQ of the panels, those Learn More shows and those panel authors keep hidden, each with its answer and the wiki the answer comes from. Each question is asked in its panel, as if typed in that panel's Ask Pollis box. Ask Pollis never searches the FAQ itself, so a strategy scores well only when it finds the wiki that holds the answer and the answering model uses it. The Panel FAQ is the benchmark for strategies that use the panel a question is asked in, as their differences show only on questions asked in a panel.

## What Is the Panel FAQ Score?
Panel FAQ Score, a column of the table of the Ask Pollis Strategies page, is the best model's score in the latest run of Evaluate Answering Models with the strategy on the Panel FAQ, or on questions ticked from it. With a judge, the score is the judge's, of 5; without one, it is the answer score. The model, the number of questions and the date follow. No run on the Panel FAQ yet means the strategy has not been evaluated there. No score means the run had neither a judge nor an answer score, which needs the embedding model of Ask Pollis. Two strategies' scores are comparable only when their runs had the same models, judge and questions.

## How Are the Scores of a Run Read?
Latest Runs, in the details of a strategy, shows, for each run, its date, how many questions it asked, whether they were those of the Panel FAQ, and one score for each model. With a judge, the score is the judge's final score, its average over the questions. Without a judge, the score is the answer score: the similarity in meaning between each answer and the right answer, from -1 to 1, higher being nearer. A dash marks a model with no score. Scores are comparable only between runs of the same kind, both with the same judge or both without one, on the same questions.

## What Makes a Comparison Fair?
A comparison of strategies is fair when only the strategy changes between the runs. Use the same test set, ticked questions, models, judge and repeats in both runs, and the same reranker and embedding model in Set Active Models. A strategy with a rerank step gains nothing when no reranker is set, as Needs, in the strategy's details, says. A small difference between two runs can be chance, especially on few questions: repeats, set in Evaluate Answering Models, show how much a model's answers vary from one run to the next.

## See Also
- [Factsheet](factsheet.md) · [Overview](overview.md) · [Writing a Strategy](writing.md)
