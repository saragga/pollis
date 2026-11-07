# Diagnostics

## When the Scores Look Wrong
| What you see | Likely cause | What to try |
|---|---|---|
| Many answers under **Cut Off** | The worked answers are longer than **Longest Answer** allows | A larger Longest Answer, or The Answer Only |
| Answers under **Cut Off** with The Answer Only | The model works out its answer against the instruction, and reaches 32 tokens | Worked Step by Step, or Examples First, which shows the form of the answer |
| Many answers under **Could Not Be Read** | The model does not end with "the answer is" | Examples First, which shows the form; open a question to read the answers |
| Every model scores near chance | Answers cut off or unread, or questions too hard for small models | Read Cut Off and Could Not Be Read first, then **By Chance** |
| The **95% Interval** is a dash | A stratum has one question only | Two questions at least in each stratum ticked |
| The interval is wide | Few questions | More questions; the line under the strata gives the widest interval |
| Two runs of a model differ | Different samples or settings | The same seed and settings, which the lines above the results give |

## When a Run Is Slow or Fails
| What you see | Likely cause | What to try |
|---|---|---|
| A model's column shows an **Error** | Its server did not start, usually for lack of memory | Read the message; close other programs; choose a smaller model |
| **Not Answered** above zero | The model's server stopped answering | Run again; a model that stops on its first three questions is not asked the rest |
| **Seconds an Answer** is high | Long worked answers, thinking, or little free memory | The Answer Only, Thinking off, or a smaller model |
| **Make Ready** says Julia was not found | Julia is not installed, or Pollis cannot find it | Install Julia, then Make Ready again |
| **Make Ready** says the questions are not on this computer | The questions that come with PollisBenchmarks.jl are missing | Install PollisBenchmarks.jl again, as the message says, then Make Ready again |

## When a Model's Answers Are Hard to Read
A click on a question in **Questions** shows the question whole, the right answer, and each model's full answer with the answer read from it. Reading a few wrong answers shows whether a model reasons badly, ends in another form, or runs out of tokens.

## See Also
- [Assumptions](assumptions.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
