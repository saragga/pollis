# Diagnostics

## When a Reranker Gives Too Few Right Passages
| What you see | Likely cause | What to try |
|---|---|---|
| Found is about the same for every reranker and No Reranker | The search already puts most passages near the top | Harder questions, in a test set of your own |
| Found is below that of No Reranker | The reranker prefers other passages to the one the test set names | Read the passages of those questions; try another reranker |
| Found is low for every column | The passages were seldom found at all | Read the line above Results; compare embedding models |
| A reranker's Place Among All Found is good, its Found poor | It moves the passage up, but not far enough | Compare Place; try a larger reranker |
| Found differs by a question or two | Chance, with few questions | Run more questions before choosing |

## When a Run of Rerankers Is Slow or Fails
| What you see | Likely cause | What to try |
|---|---|---|
| A reranker's column shows an Error | Its server did not start, usually for lack of memory | Read the message; close other programs; choose a smaller size |
| Reranking, ms is high | A large reranker, many passages, or little free memory | Compare with a smaller reranker; close other programs |
| The search of the questions takes long | The embedding model finds passages not found before | Wait: the next run takes them again |
| Memory looks too low or too high | Other programs started or stopped during the run | Run again with the computer otherwise idle |
| The run stops with No passages were found | Pollis has not indexed its documents yet | Start the Julia REPL, which builds the index, then run again |

## When Use for Ask Pollis Does Not Help
A reranker set with **Use for Ask Pollis** changes which passages reach the answering model, and adds its time to every question asked. If the answers do not improve, the line of the passages found in Evaluate Answering Models shows how often the right passage now reaches the answering model, and its ratings show how well the model uses it. **Use for Ask Pollis** under No Reranker takes the reranker away again.

## See Also
- [Interpretation](interpretation.md) · [Assumptions](assumptions.md) · [Decision Guide](decision-guide.md)
