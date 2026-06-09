# Bidirectional RNNs

## The Core Idea

A standard (unidirectional) RNN processes a sequence in **chronological order**: at time step *t* it has seen *x₁, x₂, …, xₜ* but none of the future inputs *xₜ₊₁, xₜ₊₂, …* This is natural for real-time prediction — predicting the next word as you speak, or the next price tick as it arrives.

However, in many tasks the **entire sequence is known upfront** and you are not predicting the future in real time. In such cases you can exploit **future context** to make better predictions about the present.

A **Bidirectional RNN (BiRNN)** runs two independent RNNs — one **forward** (past → future) and one **backward** (future → past) — and concatenates their hidden states. The backward RNN processes the sequence in reverse, so at position *t* it has effectively seen all inputs from *t+1* to the end.

> **Key distinction:** you are not "using data from the future" in a predictive sense. You are running a model on a **fixed, complete sequence** where all time steps are already known.

---

## When Is Future Context Useful?

Future context helps when the meaning or label of an element depends on **both** what came before **and** what comes after.

### Natural Language Processing

- **Part-of-Speech Tagging** — whether "bank" is a noun ("river bank") or a verb ("to bank money") depends on the words that follow. A BiRNN sees both sides and disambiguates correctly.
- **Named Entity Recognition** — identifying that "Apple" is a company (not a fruit) often requires seeing "released a new iPhone" which comes *after* the word.
- **Sentiment Analysis** — "This movie was not great, but I enjoyed it." The word "not" alone suggests negativity, but the later phrase reverses the meaning. A BiRNN resolves the ambiguity using future context.
- **Machine Translation** — the correct translation of a word mid-sentence often depends on the grammatical structure of the rest of the sentence.

### Finance (Offline and Batch Settings)

- **Credit Scoring with Complete Transaction History** — when evaluating a loan application using an applicant's full historical transaction record, you can process it bidirectionally. Risk signals often become clear only in hindsight: a sudden spending spike followed by a missed payment several months later reveals a pattern that the forward pass alone may miss.
- **Post-hoc Anomaly Detection in Financial Statements** — auditors have the full fiscal-year ledger. A BiRNN can flag unusual entries by looking at both the preceding and subsequent bookings — an anomalous transaction may be "explained" (or confirmed as fraudulent) by a later reversal or adjustment.
- **Post-trade Analysis** — after a trading session, analysts reviewing the order book and execution record can benefit from bidirectional processing to detect wash trades, layering, or spoofing patterns that are only recognisable when both pre- and post-event behaviour are visible simultaneously.
- **Regime Detection in Historical Data** — identifying volatility regimes, liquidity crises, or structural breaks in a historical price series. The transition into and out of a regime is clearer when both the run-up and the recovery are visible to the model.
- **Earnings Call Transcript Analysis** — when classifying the tone or forward guidance of a complete transcript, the conclusion of a sentence often recontextualises earlier statements. BiRNNs consistently outperform unidirectional models on document-level sentiment in financial NLP.
- **ESG Scoring from Annual Reports** — given a fixed document, the model benefits from full context when assigning granular ESG scores to individual passages.

### Genomics and Bioinformatics

- **Protein Secondary Structure Prediction** — whether an amino acid is part of an alpha-helix or beta-sheet depends strongly on residues that come after it. BiLSTMs process the entire protein chain to predict each residue's structure with high accuracy.
- **DNA Splice Site Detection** — splice site patterns extend both upstream and downstream; a BiRNN uses full sequence context to identify them reliably.

### Speech and Handwriting (Offline)

- **Phoneme Classification from Recorded Audio** — transcribing a pre-recorded file allows looking at the full utterance. Co-articulation means a phoneme's pronunciation is influenced by what follows. BiRNNs are standard in offline speech recognition pipelines.
- **OCR of Scanned Handwriting** — the shape of a letter depends on how it connects to the next letter; a BiRNN improves word-level accuracy by seeing the entire line.

---

## A Simple Intuition Example

Consider the sentence with a masked word:

`"I [MASK] my homework."`

- **Unidirectional RNN (forward only):** after seeing `"I"` it might guess `"did"`, `"ate"`, or `"hated"`. There is no information yet about what follows, so the prediction is uncertain.
- **Bidirectional RNN:** when processing `[MASK]`, the backward RNN has already seen `"my homework"` (it ran from the end). This constrains the missing word to a past-tense transitive verb that can take `"my homework"` as a direct object. The correct answer becomes obvious.

The backward pass supplies **future evidence** that the model can use **at the current time step** — something a unidirectional RNN cannot do.

---

## BiLSTM vs BiGRU

Both LSTM and GRU cells support bidirectional wrappers. The choice follows the same logic as in the unidirectional case:

| Dimension | BiLSTM | BiGRU |
|---|---|---|
| Memory mechanism | Separate cell state + hidden state | Single hidden state |
| Parameters | ~4× input size per layer | ~3× input size per layer |
| Long-range dependencies | Better; cell state acts as an explicit memory | Good; update gate handles gating |
| Training speed | Slower | Faster (~25 % fewer operations) |
| Typical advantage | Long documents, long protein sequences | Shorter sequences, limited compute |
| Financial NLP | Preferred for full annual reports | Preferred for short headlines or tweets |

In practice, BiGRU often matches BiLSTM on sequences shorter than ~200 tokens while being noticeably faster to train. For sequences in the thousands of steps (genomics, long financial histories) BiLSTM tends to retain a small but consistent edge.

---

## When You Cannot Use a Bidirectional RNN

A BiRNN requires the **entire sequence to be available at inference time**. You cannot use it in any real-time or online setting:

| Setting | Why BiRNN is Excluded |
|---|---|
| Real-time trading signals | Future prices are not yet known |
| Live speech-to-text | Must transcribe as the speaker talks |
| Real-time fraud detection | Cannot see future transactions |
| Autoregressive generation | Output at step *t* is used as input at *t+1* |

> **Rule of thumb:** if the entire sequence is available at inference time, a BiRNN will almost always outperform its unidirectional counterpart. If data arrives as a stream and you need immediate predictions, use a unidirectional RNN or a causal CNN.

---

## Mathematical Summary

At each time step *t* a BiRNN computes:

```
h_fwd_t  =  RNN_fwd(x_t, h_fwd_{t−1})      # forward pass
h_bwd_t  =  RNN_bwd(x_t, h_bwd_{t+1})      # backward pass
h_t      =  [h_fwd_t ; h_bwd_t]            # concatenation → 2 × hidden_size
```

The combined vector `h_t` encodes information from both the left context (past) and the right context (future) and is passed to the output layer.

---

## Practical Recommendations

- **Use a BiLSTM or BiGRU** whenever your dataset consists of fixed-length sequences that are fully available at inference time — pre-collected text, genomic data, historical financial records, scanned documents.
- **Verify your inference setup** — if the model is later deployed to score *new* sequences in real time, ensure the complete sequence can be buffered before running the model. If not, retrain a unidirectional version.
- **Expect roughly double the parameters** in the recurrent layers compared to a unidirectional model of the same hidden size, because two cells run in parallel.
- **Combine with attention** — a BiRNN + attention head is a natural stepping stone toward the Transformer. The attention weights often reveal which future positions were most informative for a given prediction, making the model more interpretable.
- **In financial NLP,** pre-trained bidirectional language models (FinBERT, BloombergGPT) have largely superseded standalone BiLSTMs for text tasks. Use a BiRNN when you need a lightweight, trainable-from-scratch solution or when you are combining text features with numerical time series in a custom architecture.
