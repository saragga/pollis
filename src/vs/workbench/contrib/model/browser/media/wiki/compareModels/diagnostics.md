# Diagnostics

## When the Ratings of the Models Look Wrong
| What you see | Likely cause | What to try |
|---|---|---|
| Every model has about the same Score | The judge rates everything alike, or the questions are easy | A stronger Judge; harder questions; read the answers |
| A wrong answer has a high Score | The judge compares with the passages, and the passages do not hold the answer | Compare with the right answer in Answers; look at the line of the passages found |
| A right answer has a low Score | The answer goes beyond the passages, from what the model knows | Read the passages: the rating may be fair for answers meant to keep to them |
| Long answers rate above short ones | The verbosity bias of the judge | Read a few answers of each; try another Judge |
| The two judges rate a model differently | One judge is stricter, or one of them is weak | Read the answers where they differ; trust the stronger judge |

## When Answers Are Not Rated or Not Given
| What you see | Likely cause | What to try |
|---|---|---|
| Not Scored is high for one model | The model gave no answer to those questions | Open those questions in Answers; check that the model starts and its key is valid |
| Not Scored is high for every model | The judge does not reply with the five parts of the rating | Read "Not rated by" under an answer in Answers; choose a stronger Judge |
| A cloud model fails on every question | Its key is missing or wrong, or its provider refuses the request | Check the key of that provider; read the message the run gives |
| The same question is rated by one judge only | The other judge's reply could not be read | Run again with that judge, or accept the question as Not Scored |

## When a Local Model Is Slow or Does Not Start
| What you see | Likely cause | What to try |
|---|---|---|
| Model Servers says Did not start | Too little free memory for the model | Close other programs; choose a smaller size or quantisation in Compose > Local Models |
| A warning about memory above Run | A model compared, or a local judge, needs more memory than is free | Free some memory, or use a cloud judge |
| First Word is long, Writing is fast | The model reads the passages slowly | Look at Reading; a graphics card or a smaller model reads faster |
| Writing is slow | The model is too large for this computer | A smaller size or quantisation of the same model |
| Free Memory falls during the run | Other programs are running, or a model is still loaded | Look at Model Servers for when each model stopped |

## When the Right Passage Is Not Found
Results of Evaluate Answering Models show a line of the passages found: of the questions made from a passage, for how many that passage was among those found, and at what average place. When the line is low, the models were answering without the passage they needed, and their ratings say little. Improving the search comes first: Evaluate Embedding Models compares the models that find the passages.

## See Also
- [Interpretation](interpretation.md) · [Assumptions](assumptions.md) · [Decision Guide](decision-guide.md)
