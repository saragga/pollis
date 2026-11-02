# Factsheet

**BERT Embeddings** loads a pre-trained transformer through `Transformers.jl` and encodes text into sentence vectors, for comparison and search.

## What the BERT Embeddings Panel Does

| Item | Detail |
|---|---|
| Purpose | Turn text into contextual vectors, and compare them by cosine similarity |
| Julia stack | `Transformers.jl` for tokenizer and model, `Zygote.jl` for **Token Attribution**, `Plots.jl` for figures; `Lux.jl` is named for fine-tuning and not loaded by these tabs |
| Tabs | **Embed**, **Similarity** |
| Input shape | One or two strings, plus an optional vector of strings, `docs` |
| Output | Embedding size, or a cosine, plus `embed_texts` for the Next Steps |
| Model files | Downloaded from the Hugging Face Hub on first use |

## What the Inputs of the BERT Embeddings Panel Default To

| Input | Default | Tabs | Meaning |
|---|---|---|---|
| **Model** | `bert-base-uncased` | All | Hugging Face model name |
| **Text** | `sentence` | **Embed** | Name of a Julia variable holding the text |
| **Text 1** | `sentence1` | **Similarity** | Name of a variable holding the first text |
| **Text 2** | `sentence2` | **Similarity** | Name of a variable holding the second text |

A variable that does not exist gets a demo sentence. The inputs take a variable name, and not the text itself.

## Which Variables the Next Steps Read

| Variable | Used by | Default |
|---|---|---|
| `docs` | Most actions | Eight demo sentences on central banks, football and cooking |
| `query` | **Nearest Neighbour** | One question on central banks |
| `queries` | **Top Similar Docs** | Three questions |
| `attn_text` | **Attention Weights** | The first of `docs` |
| `attr_text` | **Token Attribution** | The first of `docs` |

Define any of them before running an action, and the code keeps that value.

## What Sizes the Named Checkpoints Have

| Checkpoint | Layers | Hidden size | Pooling trained for |
|---|---|---|---|
| `bert-base-uncased` | 12 | 768 | None for similarity |
| `sentence-transformers/all-MiniLM-L6-v2` | 6 | 384 | Mean over the mask |

Both are uncased English models with a limit on input length, so long texts need splitting first. A larger vector costs more to store and to compare.

## See Also

- [Overview](overview.md) · [Tokenisation](tokenisation.md) · [Attention](attention.md) · [Diagnostics](diagnostics.md)
