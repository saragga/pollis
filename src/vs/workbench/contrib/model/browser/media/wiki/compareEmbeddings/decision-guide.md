# Decision Guide

## Which Embedding Model to Choose
| Situation | Choice of embedding model |
|---|---|
| One model clearly leads in Found | That model, if its Memory and Index fit this computer |
| Two models with about the same Found | The smaller one, or the one with the better Place |
| A larger model leads in Found by Meaning only | The smaller model: the search by words already finds those passages for Ask Pollis |
| Little memory beside a local answering model | The smallest model whose Found you accept |
| A model looks surprisingly weak | Check its Question Prefix before ruling it out |

## Which Questions to Search
| Situation | Choice of questions |
|---|---|
| A first look at some models | About twenty questions of the Standard test set |
| A decision between two or three models | All the questions of the Standard test set |
| Questions that use other words than the documents | A test set of your own, made in Evaluate Answering Models |
| Most of the questions are found by every model | Harder questions, as easy ones cannot separate the models |

## Changing the Embedding Model or Something Else
A better embedding model is not always the remedy when the right passage is missing. When the passage is found far down, a reranker in Retrieval-Augmented Generation may help more. When the passage is cut badly, its length matters more than the model. When the passage is found and the answers are still poor, the answering model is the next thing to compare, in Evaluate Answering Models.

## When to Press Use for Ask Pollis
Press **Use for Ask Pollis** when a model's gain in **Found** rests on more than a handful of questions and its **Memory** leaves room for the answering model. Published benchmarks can suggest which models to try, but no embedding model leads on every task ([Muennighoff, Tazi, Magne and Reimers (2023)](#ref-MTMR2023a)), so the run on these documents decides. Evaluate again after a change of documents large enough to change what is asked.

## References

<a id="ref-MTMR2023a"></a>Muennighoff, N., Tazi, N., Magne, L. and Reimers, N. (2023). MTEB: massive text embedding benchmark. *Proceedings of the 17th Conference of the European Chapter of the Association for Computational Linguistics*, 2014–2037. [doi:10.18653/v1/2023.eacl-main.148](https://doi.org/10.18653/v1/2023.eacl-main.148)

## See Also
- [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Interpretation](interpretation.md)
