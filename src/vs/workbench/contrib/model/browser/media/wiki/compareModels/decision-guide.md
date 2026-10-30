# Decision Guide

## Which Answering Model to Choose
| Situation | Choice of answering model |
|---|---|
| Two models with about the same Score | The one that is faster or takes less memory |
| Private documents or questions | A model on this computer, even at a somewhat lower Score |
| Little memory on this computer | The largest local model that does not trigger the memory warning |
| The best answers matter more than cost | The cloud model with the best Score, after reading some of its answers |
| A high Score with many answers Not Scored | Find out why before trusting that Score |

## Which Judge to Choose
| Situation | Choice of judge |
|---|---|
| A cloud key is available | A strong cloud model as Judge, which uses no memory on this computer |
| Everything has to stay on this computer | The largest local chat model that fits in memory with the models compared |
| The judge is also among the models compared | Another Judge: a judge favours its own answers |
| The ratings will decide something that matters | A Second Judge from another family of models |

The strong judges of [Zheng, Chiang, Sheng, Zhuang, Wu, Zhuang, Lin, Li, Li, Xing, Zhang, Gonzalez and Stoica (2023)](#ref-ZCSZW...2023a) came close to human preferences, and that finding does not extend to weak judges.

## Which Questions and How Many Repeats
| Situation | Choice of questions |
|---|---|
| A first look at a model | About twenty questions of the Standard test set, with Repeats at 1 |
| A decision between two or three models | All the questions of the Standard test set, with Repeats at 2 or 3 |
| Questions about your own field | A test set of your own, with Make Questions... or Add |
| Models that differ by very little | More questions before more Repeats: each new question adds more than asking the same one again |

## When a Comparison of Answering Models Is Enough
Stop when the order of the models is the same across two runs or two judges, or when the models still in contention differ by less than their **Spread**: then speed, memory and privacy can decide. If the line of the passages found is low, stop too and turn to Evaluate Embedding Models, as better passages may do more than a better answering model. After choosing, the status bar sets the answering model for the Ask Pollis pane and for the panels.

## References

<a id="ref-ZCSZW...2023a"></a>Zheng, L., Chiang, W.-L., Sheng, Y., Zhuang, S., Wu, Z., Zhuang, Y., Lin, Z., Li, Z., Li, D., Xing, E. P., Zhang, H., Gonzalez, J. E. and Stoica, I. (2023). Judging LLM-as-a-judge with MT-Bench and Chatbot Arena. *Advances in Neural Information Processing Systems 36*, 46595–46623. [doi:10.52202/075280-2020](https://doi.org/10.52202/075280-2020)

## See Also
- [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Interpretation](interpretation.md)
