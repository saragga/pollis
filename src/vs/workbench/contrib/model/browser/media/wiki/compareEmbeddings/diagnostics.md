# Diagnostics

## When an Embedding Model Finds Too Little
| What you see | Likely cause | What to try |
|---|---|---|
| Found is about the same for every model | The search by words finds most of the passages | Compare Found by Meaning and Place by Meaning |
| Found is high, Found by Meaning is low | The questions share the words of their passages | Questions in other words, in a test set of your own |
| Found by Meaning is low for one model only | A wrong prefix, or a model weak on these documents | Look at Question Prefix; try another model |
| Found is low for every model | The questions do not fit their passages, or the passages are cut badly | Read some questions with the passage each was made from |
| A model finds the passage, far down | The model finds the topic and not the precise passage | Compare Place by Meaning; try a larger model |

## When a Run of Embedding Models Is Slow or Fails
| What you see | Likely cause | What to try |
|---|---|---|
| The first run takes many minutes | Every passage is being embedded by that model for the first time | Wait, or Stop: the passages embedded until then are kept for the next run |
| Passages a Second is empty | The run embedded nothing, as every passage was already embedded | Nothing is wrong: the speed is shown only when a run embeds passages |
| A model's column shows an Error | Its server did not start, usually for lack of memory | Read the message; close other programs; choose a smaller size |
| Question or Search in milliseconds is high | A large model on this computer, or little free memory | Compare with a smaller model; close other programs |
| Memory looks too low or too high | Other programs started or stopped during the run | Run again with the computer otherwise idle |

## When Use for Ask Pollis Does Not Help
Setting a model with **Use for Ask Pollis** makes the index of Ask Pollis again, without embedding again the passages the run embedded. If the answers do not improve afterwards, the passages may not have been the problem: the line of the passages found in Evaluate Answering Models shows how often the right passage now reaches the answering model, and the ratings there show how well it uses that passage.

## See Also
- [Interpretation](interpretation.md) · [Assumptions](assumptions.md) · [Decision Guide](decision-guide.md)
