# Decision Guide

## Which Mode

| Mode | You have | You get | LLM calls | Needs embeddings |
|---|---|---|---|---|
| **Tag** | A list of tags, any number may apply | Yes or no for every tag, per document | One per document | No |
| **Classify** | Mutually exclusive categories | One category per document | One per document | No |
| **Topics** | No list: you want to find the groups | k topics with labels and summaries | One per topic | Yes |
| **Q&A** | A question about the collection | An answer with the documents it used | One per question | Yes |

- Use **Classify** when every document belongs to exactly one category, and **Tag** when a document can be about several things, or none.
- Use **Topics** first when you do not know which categories exist, then turn the topics you keep into categories for Classify.
- Use **Q&A** to find and summarise what the documents say, not to label them.

## Which Provider

| | Local (llama.cpp) | Hosted (Anthropic, Google, OpenAI) |
|---|---|---|
| **Cost** | Free; uses this computer | Paid per token |
| **Privacy** | Documents stay on this computer | Documents go to the provider |
| **Quality** | Depends on the model the computer can run | Strongest models available |
| **Speed** | Depends on the computer and the GPU | Fast, and calls run in parallel |
| **Reproducibility** | A model file never changes | Model names can point to new versions |

Start with a local model to set up the analysis, and move to a larger or hosted model only if the hand labels show it is needed. For confidential data, stay local.

## Which Model Size
Small local models run anywhere but follow instructions less reliably: they may apply every tag, or reply outside the format. If **Evidence** shows many broken replies, or kappa against hand labels is low, try a larger model before rewriting the prompt.

## The Embedding Classifier Instead of the LLM
Once categories are settled and a sample is labelled by hand, the **Embedding Classifier** labels documents from their embeddings alone, with no LLM call per document. For a large collection, check its agreement with the hand labels; if it is close to the chat model's, it is a much cheaper way to label the rest.

## See Also
- [Tagging](tagging.md) · [Classification](classification.md) · [Topics](topics.md) · [Q&A](qa.md)
