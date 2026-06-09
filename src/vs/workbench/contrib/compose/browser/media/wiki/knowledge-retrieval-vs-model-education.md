# Knowledge Retrieval and Model Education: Two Ways of Making AI Smarter

---

## 1. The Central Question

You have a powerful, general-purpose language model. It reasons well, writes clearly, and understands a wide range of topics. But it does not know your domain — your data, your terminology, your specific problem space.

How do you fix that?

There are two fundamentally different answers to this question, and choosing between them is one of the most consequential architectural decisions in applied AI. This document explains both approaches, what distinguishes them at a conceptual and technical level, and when each is the right tool.

---

## 2. The Library and the Course

Before diving into technical detail, consider two ways a person might become more knowledgeable:

**The first way** is to build a well-organised personal library. When you need to answer a question, you consult the relevant book, extract the pertinent passage, and use it to inform your answer. Your underlying thinking has not changed — you are the same person — but you now have access to a vast collection of reference material that you can draw on at any moment.

**The second way** is to enrol in a course. After months of study, you emerge transformed. You no longer need to consult a book for every question: the knowledge has been internalised, restructured into your own mental models, and made available as intuition. You are literally not the same thinker you were before.

These two metaphors map exactly onto the two approaches explored in this document:

- **Knowledge Retrieval** (Retrieval-Augmented Generation, RAG) — the library.
- **Model Education** (Fine-Tuning) — the course.

---

## 3. Knowledge Retrieval

### 3.1 What It Is

Knowledge Retrieval augments a language model at *inference time* — that is, at the moment it is answering a question. The model's weights are never modified. Instead, relevant documents or passages are retrieved from an external knowledge base and injected into the model's context alongside the query.

The pipeline has three stages:

1. **Indexing**: Documents are converted into dense vector representations (embeddings) and stored in a vector database (e.g., LanceDB). Each embedding captures the semantic meaning of its document.
2. **Retrieval**: When a query arrives, it is embedded using the same encoder. The vector database finds the documents whose embeddings are closest to the query embedding (nearest-neighbour search).
3. **Generation**: The retrieved documents are concatenated with the query and passed to the language model, which generates a response grounded in the retrieved context.

### 3.2 Mathematical Sketch

Let `E(·)` be an embedding function and `D = {d₁, d₂, ..., dₙ}` the document corpus. At query time, given query `q`:

```
scores(q, dᵢ) = E(q) · E(dᵢ)        (cosine or dot-product similarity)
top-k = argtop-k_i scores(q, dᵢ)     (retrieve k most relevant docs)
answer = LLM(q, d_{top-k})            (generate conditioned on context)
```

The model itself — its weights `θ` — remains unchanged throughout. Only the context changes.

### 3.3 Characteristics

| Property | Description |
| :--- | :--- |
| **Model weights** | Unchanged |
| **Knowledge source** | External, queryable at inference time |
| **Updateable** | Yes — add or remove documents without retraining |
| **Traceable** | Yes — responses can be grounded with citations |
| **Latency** | Adds retrieval overhead at inference time |
| **Cost** | Low — no GPU training required |

### 3.4 When It Excels

- Your knowledge base changes frequently (regulations, prices, news, research papers).
- You need traceable, citable responses — auditability matters.
- You want to add domain knowledge without touching the model.
- Your documents are long and varied, and the relevant content differs per query.
- You have limited compute budget (no GPU cluster available for training).

---

## 4. Model Education

### 4.1 What It Is

Model Education modifies the model itself. Starting from a pre-trained model with weights `θ₀`, a training process updates those weights on a domain-specific dataset `(X, Y)` to produce a new set of weights `θ*`. The resulting model has genuinely different behaviour: it has internalised the patterns, vocabulary, reasoning styles, and domain conventions found in the training data.

Unlike Knowledge Retrieval, the knowledge gained through Model Education is not stored in an external database — it is encoded in the model's billions of parameters. There is no lookup at inference time: the model simply *knows*.

### 4.2 The Main Approaches

**Full Fine-Tuning** updates all parameters of the model. It is the most expressive approach but requires substantial compute and risks forgetting previously learned general knowledge (catastrophic forgetting).

**Parameter-Efficient Fine-Tuning (PEFT)** updates only a small subset of parameters, leaving most of the original model frozen. The most widely used methods are:

- **LoRA (Low-Rank Adaptation)**: Inserts small trainable matrices into each layer. If the pre-trained weight matrix is `W₀ ∈ ℝ^{d×k}`, LoRA adds a low-rank update `ΔW = BA` where `B ∈ ℝ^{d×r}`, `A ∈ ℝ^{r×k}`, and `r ≪ min(d, k)`. At inference, `W = W₀ + BA`.
- **Prefix Tuning**: Prepends trainable tokens to each transformer layer's key and value sequences.
- **Adapters**: Inserts small bottleneck feed-forward modules between existing layers.

**Instruction Fine-Tuning** trains the model on (instruction, response) pairs, teaching it to follow specific kinds of prompts or to respond in a particular style or format.

### 4.3 Mathematical Sketch

The objective is to minimise the loss on the training dataset `D = {(xᵢ, yᵢ)}`:

```
θ* = argmin_θ (1/|D|) Σᵢ ℒ(fθ(xᵢ), yᵢ)
```

where `fθ` is the model, `ℒ` is typically cross-entropy loss, and the minimisation proceeds via gradient descent (AdamW or similar). For LoRA:

```
θ* = {W₀ (frozen), B*, A*}    where only B and A are updated
```

### 4.4 Characteristics

| Property | Description |
| :--- | :--- |
| **Model weights** | Modified |
| **Knowledge source** | Internal — encoded in parameters |
| **Updateable** | Requires retraining to incorporate new knowledge |
| **Traceable** | No — responses cannot be cited to a source |
| **Latency** | No retrieval overhead at inference time |
| **Cost** | Higher — GPU training required |

### 4.5 When It Excels

- You want the model to adopt a specific reasoning style, tone, or format — not just access facts.
- Your domain has specialised vocabulary or notation the base model does not handle well.
- You need very low inference latency (no retrieval step).
- Your knowledge is stable — it does not change frequently.
- You want the model to learn *how to think* about a problem, not just *what facts apply*.

---

## 5. Side-by-Side Comparison

| Dimension | Knowledge Retrieval | Model Education |
| :--- | :--- | :--- |
| **Analogy** | Consulting a well-organised library | Completing a course of study |
| **Model weights** | Unchanged | Updated |
| **Knowledge location** | External vector database | Model parameters |
| **Knowledge updates** | Instant — add documents | Requires retraining |
| **Reasoning style** | Unchanged (base model) | Can be transformed |
| **Inference latency** | Higher (retrieval step) | Lower (no lookup) |
| **Compute cost** | Low (embedding only) | Higher (gradient descent) |
| **Auditability** | High (citable sources) | Low (opaque parameters) |
| **Risk of hallucination** | Lower (grounded in retrieved text) | Higher without careful training |
| **Risk of forgetting** | None | Catastrophic forgetting possible |

---

## 6. Using Both Together

Knowledge Retrieval and Model Education are not mutually exclusive — in practice, the most capable systems combine them.

A common pattern:

1. **Educate the model** on domain language, conventions, and reasoning patterns using fine-tuning. The model learns *how to reason* in the domain.
2. **Equip it with a library** using retrieval augmentation. At inference time, the now domain-fluent model draws on up-to-date external documents to ground its responses in current facts.

This mirrors the human analogy: a trained expert (Model Education) who also has access to a well-stocked library (Knowledge Retrieval) is more capable than either alone. The education teaches *how to use* the library effectively; the library provides the facts the expert's training could not have anticipated.

---

## 7. Practical Decision Guide

```
Does your knowledge base change frequently?
├── Yes → Knowledge Retrieval (easy to update)
└── No → Either approach

Do you need citable, auditable responses?
├── Yes → Knowledge Retrieval
└── No → Either approach

Is inference latency critical?
├── Yes → Model Education (no retrieval step)
└── No → Either approach

Do you want to change *how* the model reasons, not just what it knows?
├── Yes → Model Education
└── No → Knowledge Retrieval may suffice

Do you have GPU compute available for training?
├── No → Knowledge Retrieval
└── Yes → Either approach

Is your dataset large and domain-specific (thousands of examples)?
├── Yes → Model Education is worth the investment
└── No → Start with Knowledge Retrieval
```

---

## 8. Applications in Finance and Analytics

### Knowledge Retrieval

- **Regulatory compliance**: Retrieve the precise clause from MiFID II, Basel III, or Solvency II that applies to a given transaction.
- **Earnings call analysis**: Index all earnings call transcripts; retrieve relevant passages when querying management guidance for a specific company and quarter.
- **Research synthesis**: Build a library of academic papers on a topic; retrieve and synthesise findings on demand.

### Model Education

- **Domain-specific language**: Teach a model the conventions of financial statements — how to interpret EBITDA adjustments, off-balance-sheet items, or covenant language.
- **Quantitative reasoning style**: Fine-tune on worked examples of financial modelling to produce models that reason quantitatively rather than descriptively.
- **Consistent output format**: Train the model to always emit structured JSON with specific fields for downstream processing pipelines.

### Combined

- A fine-tuned model that understands fixed-income markets retrieves today's credit spreads from a live index and synthesises a coherent risk assessment. The education provides the reasoning framework; the retrieval provides the current data.

---

## 9. Further Reading

- **Knowledge Retrieval**: Lewis et al. (2020), *Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks* — the paper that named and formalised RAG. [arXiv:2005.11401](https://arxiv.org/abs/2005.11401)
- **LoRA**: Hu et al. (2021), *LoRA: Low-Rank Adaptation of Large Language Models*. [arXiv:2106.09685](https://arxiv.org/abs/2106.09685)
- **Instruction Fine-Tuning**: Wei et al. (2021), *Finetuned Language Models Are Zero-Shot Learners*. [arXiv:2109.01652](https://arxiv.org/abs/2109.01652)
- **PEFT library** (Hugging Face): practical implementations of LoRA, prefix tuning, and adapters in Python.
- **RAGTools.jl** and **DocsScraper.jl**: Julia implementations for building retrieval pipelines.
