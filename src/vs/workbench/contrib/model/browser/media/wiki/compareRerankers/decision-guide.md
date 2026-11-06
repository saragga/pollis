# Decision Guide

## Which Reranker to Choose, or None
| Situation | Choice of reranker |
|---|---|
| One reranker clearly leads No Reranker in Found | That reranker, if its time and Memory fit this computer |
| Two rerankers with about the same Found | The smaller or faster one, or the one with the better Place |
| No reranker does better than No Reranker | No Reranker: Ask Pollis answers sooner and with less memory |
| Little memory beside a local answering model | The smallest reranker whose gain you accept, or none |
| A reranker gains in Place Among All Found only | No gain for Ask Pollis yet: compare Found before choosing it |

## Which Questions to Rerank
| Situation | Choice of questions |
|---|---|
| A first look at some rerankers | About twenty questions of the Standard test set |
| A decision between rerankers, or none | All the questions of the Standard test set |
| Questions asked in other words than the documents | A test set of your own, made in Evaluate Answering Models |
| No Reranker gives nearly every passage already | Harder questions, as easy ones leave a reranker nothing to do |

## Changing the Reranker or Something Else
A reranker helps when the search finds the right passage but too far down for Ask Pollis to give it. When the search does not find the passage at all, which the line above **Results** shows, a reranker cannot help, and the embedding model, compared in Evaluate Embedding Models, or the questions are the place to look. When the passage is given and the answers are still poor, the answering model is next, in Evaluate Answering Models.

## When to Press Use for Ask Pollis on a Reranker
Press **Use for Ask Pollis** under a reranker when its gain in **Found** over No Reranker rests on more than a handful of questions, and its **Reranking, ms** and **Memory** are a price worth paying on every question asked. Under No Reranker it removes the reranker of Ask Pollis. Evaluate again after a change of documents large enough to change what is asked, or after downloading another reranker.

## See Also
- [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Interpretation](interpretation.md)
