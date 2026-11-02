# Factsheet

**Co-Occurrence Matrix** counts how often words appear near each other, weights the counts, and uses the rows as word vectors.

## What the Panel Does

| Item | Detail |
|---|---|
| Purpose | Build and weight a word-by-word matrix, and find similar words |
| Julia stack | `TextAnalysis.jl` for text and counting, `Plots.jl` for figures |
| Tabs | **Raw Counts**, **PPMI**, **PMI** |
| Main functions | `CooMatrix`, `coom`, `pmi_matrix`, `neighbours` |
| Printed result | Words kept, distinct pairs, and nearest neighbours of the query |

Counting comes from [JuliaText Contributors (2023)](#ref-JTC2023a).

## What the Inputs of the Panel Default To

| Input | Default | Role |
|---|---|---|
| **Corpus** | `docs` | Vector of strings, one per sentence or document |
| **Window Size** | 2 | Tokens on each side that count as context |
| **Minimum Count** | 2 | Rarer words leave the matrix |
| **Distance Weighting** | None (Counts) | Count 1, or 1/d with Harmonic (1/d) |
| **Context Smoothing** | 0.75 | Exponent alpha on context counts |
| **Query Word** | "coffee" | Word for neighbours and word-level actions |
| **Neighbours** | 5 | Number of neighbours or top entries |

All inputs apply to all tabs, although **Context Smoothing** has no effect on `W` in **Raw Counts**.

## What the Generated Code Fixes

| Item | Value |
|---|---|
| Preprocessing | `strip_case`, `strip_punctuation`, `strip_numbers`, `strip_stopwords` |
| Counting mode | `mode = :directional`, each pair of positions once |
| Similarity | Cosine between rows, excluding the word itself |
| Words in figures | The 20 most frequent |
| Windows compared | 1, 2 and 5 |
| Sample sentence | "a cup of hot tea with lemon", in **Apply to New Sentence** |

## How Each Tab Sets the Matrix

| Tab | Code |
|---|---|
| **Raw Counts** | `W = C` |
| **PPMI** | `W = pmi_matrix(C; alpha)` |
| **PMI** | `W = pmi_matrix(C; alpha, positive = false)` |

Some actions compute PPMI for themselves, whichever tab is open, and **Co-Occurrence Heatmap** is the one that draws the current `W`.

## What Each Next Step in the Panel Shows

| Action | Result |
|---|---|
| **Co-Occurrence Heatmap** | Current `W` for the top words |
| **Word Similarity Plot** | PPMI cosine between the top words |
| **Matrix Sparsity** | Vocabulary, density and words with no context |
| **Top Co-Occurring Pairs** | Highest counts, with PPMI |
| **Nearest Neighbours** | Neighbours under counts and PPMI |
| **Apply to New Sentence** | Closest words to a mean PPMI vector |
| **Raw vs. PPMI** | Contexts ranked both ways |
| **Compare Window Sizes** | Neighbours and density by window |
| **Context Smoothing** | Top pairs at alpha = 1 and the chosen alpha |
| **PMI Interpretation** | Strongest and weakest associations |
| **Word Vector** | Non-zero contexts of the query word |

## References

<a id="ref-JTC2023a"></a>JuliaText Contributors (2023). TextAnalysis.jl: Julia NLP toolkit. [github.com/JuliaText/TextAnalysis.jl](https://github.com/JuliaText/TextAnalysis.jl)

## See Also

- [Overview](overview.md) · [Raw Counts](raw-counts.md) · [PPMI](ppmi.md) · [PMI](pmi.md)
