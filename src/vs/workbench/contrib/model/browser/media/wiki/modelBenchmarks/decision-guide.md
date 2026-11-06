# Decision Guide

## How Many Questions to Draw
| Situation | Sample |
|---|---|
| A first look at some models | 2 or 3 questions in each subject of MMLU-Pro, or 30 problems of GSM8K |
| Choosing between two models | Enough questions for their intervals not to overlap: often 200 or more |
| Comparing the subjects of a model | Equal allocation, 10 questions or more in each subject |
| Estimating the score on the whole benchmark | Proportional allocation, every subject ticked |
| Repeating a run with another model or setting | The same seed, size and allocation |

## Which Settings to Use
| Situation | Setting |
|---|---|
| The benchmarks' own way of asking | Worked Step by Step, no examples |
| Many answers could not be read | Examples First, which shows the form of the answer |
| Many answers cut off | A larger Longest Answer |
| The quickest run | The Answer Only, with a Longest Answer of 256 |
| A model that thinks | Thinking on, with a larger Longest Answer, against the same model with Thinking off |

## Which Model to Choose
| Situation | Choice |
|---|---|
| One model's interval lies above the others' | That model, if its speed and memory fit this computer |
| The intervals overlap widely | The smaller or faster model, or a larger sample first |
| A model leads in the subjects you work in | That model, from **By Stratum**, with enough questions in those subjects |
| Two quantisations of one model score alike | The smaller quantisation |

## Beyond the Benchmarks
A benchmark compares the models on its own questions. How well a model answers questions about Pollis from its documents is measured in Evaluate Answering Models, on test sets made from those documents, which no model has seen in training.

## See Also
- [Overview](overview.md) · [Interpretation](interpretation.md) · [Factsheet](factsheet.md)
