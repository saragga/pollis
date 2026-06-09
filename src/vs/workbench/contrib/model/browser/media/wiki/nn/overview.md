# An Introduction to Five Essential Neural Network Architectures

---

## 1. Introduction

Imagine you want to teach a computer to recognize a cat, understand a sentence, or predict tomorrow’s stock price. How would you do it? **Neural networks** are a family of machine learning models loosely inspired by the brain. They learn patterns from data by adjusting millions of tiny numerical “weights” through a process called *training*.

But not all neural networks are the same. Different problems require different architectures. In this text, we will explore five fundamental types:

1. **Feedforward Neural Networks (FNNs)** – the simplest form.
2. **Recurrent Neural Networks (RNNs)** – for sequences like time series or text.
3. **Convolutional Neural Networks (CNNs)** – for grid-like data like images.
4. **Graph Neural Networks (GNNs)** – for data with irregular connections (social networks, molecules).
5. **Transformers** – the modern workhorse for language and beyond.

For each, we will explain the intuition, the core mathematical idea, and the typical architecture. Then, we will see real‑world use cases in **finance** and **medicine/pharmaceutics/genetics**.

---

## 2. Feedforward Neural Networks (FNNs)

### 2.1 The Idea

A feedforward network is the simplest neural network. Information moves in **one direction**: from input to output, passing through one or more hidden layers. There are no cycles or loops – hence “feedforward.”

Think of it as a series of linear combinations followed by non‑linear activations. Each neuron in a layer receives signals from the previous layer, computes a weighted sum, adds a bias, and then applies a non‑linear function like `ReLU(x) = max(0, x)` or `sigmoid(x) = 1/(1+e^{-x})`. This non‑linearity is what gives neural networks the power to model complex relationships.


### 2.2 Typical Applications

- **Regression** (predicting a number, e.g., house price)
- **Classification** (e.g., spam or not spam)
- **Any tabular data problem** where order of features does not matter

### 2.3 Limitations

FNNs treat each input independently. They have **no memory** of previous inputs and cannot handle sequences or spatial structure efficiently. For an image, you would need to flatten it into a long vector, losing all neighbourhood information. That is why we need more specialised architectures.

---

## 3. Recurrent Neural Networks (RNNs)

### 3.1 The Idea

Many data types are **sequential**: stock prices over days, words in a sentence, DNA bases along a strand. In a sequence, the order matters, and future values often depend on past ones. Traditional FNNs cannot capture this dependency because each input is processed in isolation.

RNNs solve this by introducing a **hidden state** that is passed from one time step to the next. At time `t`, the RNN takes the current input `x_t` and the previous hidden state `h_{t-1}`, and produces a new hidden state `h_t` and (optionally) an output `y_t`. This creates a *recurrent* loop: the network has a memory of what it has seen so far.

### 3.2 The Challenge: Vanishing Gradients

In theory, RNNs can remember information over many steps. In practice, when trained with backpropagation through time (BPTT), gradients either vanish (become too small to update weights) or explode. This makes it hard for a basic RNN to learn long‑range dependencies – for example, linking a word at the beginning of a long paragraph to a word at the end.

### 3.3 The LSTM Solution

The **Long Short‑Term Memory (LSTM)** network is a special kind of RNN designed to overcome the vanishing gradient problem. It introduces a *cell state* `c_t` that acts as a conveyor belt of information, and three **gates** that control what to forget, what to store, and what to output:

- **Forget gate** `f_t`: decides which past information to discard.
- **Input gate** `i_t`: decides which new information to store.
- **Output gate** `o_t`: decides what part of the cell state to output as the hidden state.

These gates are learned from data, allowing the LSTM to keep information for thousands of time steps or to forget it immediately. The LSTM is arguably the most widely used RNN variant in practice today.

### 3.4 Applications

- Language modelling (predicting the next word)
- Speech recognition
- Time series forecasting (finance, weather, electricity demand)

---

## 4. Convolutional Neural Networks (CNNs)

### 4.1 The Idea

Images, spectrograms, and other grid‑structured data have *local correlations*: pixels near each other are more related than distant ones. Moreover, patterns (edges, textures, shapes) can appear anywhere in the image – they are *translation invariant*.

CNNs exploit these properties using the **convolution operation**. Instead of fully connecting every input neuron to every output neuron (which would be extremely costly for large images), a CNN slides small filters (kernels) across the input. Each filter detects a specific local pattern, such as a horizontal edge or a colour blob. The result is a *feature map* that shows where that pattern occurs.

### 4.2 Key Components

1. **Convolutional layers**: Apply the filters.
2. **Activation functions** (usually ReLU): introduce non‑linearity.
3. **Pooling layers** (e.g., max‑pooling): reduce spatial dimensions and provide a degree of translation invariance.
4. **Fully connected layers** at the end: combine learned features for final classification or regression.

A typical CNN starts with several convolutional + pooling blocks, then flattens the feature maps and passes them through one or two dense layers.

### 4.3 Why They Work So Well for Images

- **Parameter sharing**: The same filter is used across the whole image, drastically reducing the number of parameters.
- **Local connectivity**: Each neuron looks only at a small spatial region, capturing local patterns.
- **Hierarchical learning**: Early layers detect edges, middle layers detect shapes (e.g., wheels, eyes), and later layers detect whole objects (e.g., cars, faces).

### 4.4 Applications Beyond Images

CNNs are also effective for 1D sequences (e.g., audio waveforms, DNA sequences) where local patterns matter. 1D convolutions can serve as a fast alternative to RNNs for some sequence tasks. Dealing with local patterns (e.g., short-term trends, spikes)

---

## 5. Graph Neural Networks (GNNs)

### 5.1 The Idea

What if your data is not a grid (like an image) or a sequence (like text) but a **graph**? A graph consists of **nodes** (vertices) and **edges** connecting them. Examples: social networks (people as nodes, friendships as edges), molecules (atoms as nodes, chemical bonds as edges), or citation networks (papers as nodes, citations as edges).

Standard neural networks cannot naturally handle graphs because:
- Graphs have no fixed ordering of nodes.
- The number of neighbours varies from node to node.
- The structure (which nodes are connected) is as important as the node features.

**Graph Neural Networks (GNNs)** extend the idea of convolution to graphs. Instead of a sliding kernel, a GNN aggregates information from a node’s neighbours. Typically, a GNN layer works like this:

1. For each node, collect features of its neighbours.
2. Aggregate them (e.g., by averaging or summing).
3. Combine the aggregated neighbour information with the node’s own features.
4. Apply a learnable transformation and an activation.

After several such layers, each node’s representation contains information about its local neighbourhood (like a “receptive field” in a CNN). The output can be used for:
- **Node‑level tasks** (e.g., classify a person’s interest)
- **Edge‑level tasks** (e.g., predict if two proteins interact)
- **Graph‑level tasks** (e.g., classify a molecule as drug‑like or not)

### 5.2 Popular GNN Variants

- **Graph Convolutional Network (GCN)**: uses a normalized sum of neighbour features.
- **Graph Attention Network (GAT)**: learns attention weights to focus on the most relevant neighbours.
- **GraphSAGE**: samples a fixed number of neighbours to handle large graphs.

### 5.3 Why GNNs are Powerful

They combine node features *and* graph topology. This makes them ideal for any problem where relationships matter – which is very common in biology, chemistry, social sciences, and recommender systems.

---

## 6. Transformers

### 6.1 The Idea

In 2017, the paper *“Attention Is All You Need”* introduced the Transformer, a neural network that entirely replaces recurrence (RNNs) and convolution (CNNs) with a mechanism called **self‑attention**. Transformers have since become the dominant architecture for natural language processing (NLP) and are rapidly spreading into computer vision, biology, and even reinforcement learning.

### 6.2 Self‑Attention Explained

Self‑attention allows each position in a sequence to directly attend to all other positions in the same sequence, weighing their importance. For a sequence of `T` tokens, the self‑attention layer computes three matrices from the input: **Queries (Q)**, **Keys (K)**, and **Values (V)**. For each query, we compute a dot product with all keys to obtain attention scores, then take a softmax to get weights, and finally use those weights to combine the values.

The key advantage: any two positions can interact regardless of their distance. In an RNN, a word at position 100 can influence position 101 only after passing through 99 steps; in a Transformer, it takes a single step. This removes the bottleneck of recurrence and allows **massive parallelisation** – one reason why Transformers can be trained on huge datasets using GPUs/TPUs.

### 6.3 Positional Encoding

Because self‑attention does not naturally know the order of the sequence, Transformers add **positional encodings** (usually sine/cosine functions or learned embeddings) to the input embeddings. This gives the model a sense of position.

### 6.4 Architecture Overview

A Transformer encoder (common in BERT, etc.) consists of:
- An input embedding layer plus positional encoding.
- Several identical blocks, each containing:
  - A multi‑head self‑attention layer (allows the model to focus on different aspects simultaneously).
  - A feedforward network (applied to each position independently).
  - Residual connections and layer normalisation around each sub‑layer.

The decoder (used in GPT for text generation) includes an additional cross‑attention layer to attend to the encoder’s output.

### 6.5 Why Transformers are Revolutionary

- **Parallelisation**: Entire sequences are processed at once, unlike RNNs.
- **Long‑range dependencies**: No vanishing gradient problem; each token directly attends to all others. Capture long-range dependencies better than RNNs.
- **Transfer learning**: Pre‑trained Transformers (e.g., BERT, GPT) can be fine‑tuned for many tasks with limited data.

Today, Transformers are the foundation of large language models (LLMs), image recognition (Vision Transformers or ViT), protein structure prediction (AlphaFold), and many other state‑of‑the‑art systems.

---

## 7. Use Cases in Finance

Financial data is often noisy, non‑stationary, and filled with complex dependencies – but each neural network type can be applied to a different financial problem.

### 7.1 Feedforward Neural Networks in Finance

- **Credit scoring**: Banks use FNNs to classify loan applicants as “likely to default” or “likely to repay” based on features like income, debt ratio, credit history, and employment length. Because each applicant is independent, FNNs work well.
- **Option pricing**: FNNs can learn the mapping from underlying price, strike price, volatility, and time to expiration to the option’s fair value, approximating the Black‑Scholes formula.

### 7.2 Recurrent Neural Networks (LSTM) in Finance

- **Stock price prediction**: LSTMs are widely used to forecast future prices (or price movements) based on historical price, volume, and macroeconomic indicators. Their memory helps capture trends, seasonality, and momentum effects.
- **Algorithmic trading strategies**: An LSTM can process a stream of order book data (bid‑ask spreads, order flow) to predict short‑term price direction and generate trading signals.
- **Risk management** (Value at Risk – VaR): LSTMs can model the conditional volatility of asset returns, outperforming traditional GARCH models in some studies.

### 7.3 Convolutional Neural Networks in Finance

- **Chart pattern recognition**: CNNs applied to images (candlestick charts) can identify technical patterns like head‑and‑shoulders, double tops, or flags, which traders use for decision making.
- **High‑frequency market microstructure**: 1D CNNs can process sequences of limit order book snapshots to predict mid‑price movements – often faster than RNNs during training.

### 7.4 Graph Neural Networks in Finance

- **Anti‑money laundering (AML)**: Financial transactions form a graph (accounts as nodes, transactions as edges with amounts and times). GNNs can detect suspicious patterns such as cyclical transfers or sudden bursts of activity that indicate layering or smurfing.
- **Portfolio optimisation**: By building a graph where nodes are stocks and edges represent correlations or industry relationships, GNNs can learn diversified portfolios that minimise risk while maximising return.
- **Credit default contagion**: Modelling the corporate network (supplier‑customer, shared board members) with GNNs helps predict how a default in one company might propagate.

### 7.5 Transformers in Finance

- **Cryptocurrency price prediction**: Transformers have been shown to outperform LSTMs on Bitcoin and Ethereum price forecasting because they capture long‑range dependencies (e.g., weekly or monthly patterns) more effectively.
- **Financial sentiment analysis**: Pre‑trained language models (like FinBERT, a BERT variant fine‑tuned on financial news) classify news articles, earnings call transcripts, or social media posts as bullish or bearish. This sentiment can be used as a trading signal.
- **Time series forecasting for high‑frequency data**: With specialised adaptations (e.g., Informer, Autoformer), Transformers handle very long sequences (thousands of time steps) that would be difficult for LSTMs due to vanishing gradients.

---

## 8. Use Cases in Medicine, Pharmaceutics, and Genetics

These fields generate rich, complex data: genomic sequences, protein structures, patient health records, and medical images. Deep learning has revolutionised many tasks.

### 8.1 Feedforward Neural Networks in Medicine

- **Mortality prediction in ICUs**: Using tabular data (vital signs, lab results, demographics), FNNs can estimate the probability of in‑hospital death, helping doctors allocate resources.
- **Drug response prediction**: Given a patient’s genomic profile and a drug’s chemical features, an FNN can predict whether that drug will be effective – a step toward personalised medicine.

### 8.2 Recurrent Neural Networks (LSTM) in Medicine

- **Electronic Health Records (EHR) modelling**: An LSTM can process a patient’s sequence of hospital visits, diagnoses, medications, and lab results over time to predict future events, such as readmission, heart failure, or sepsis onset.
- **Physiological signal analysis**: LSTMs are applied to electrocardiograms (ECG) and electroencephalograms (EEG) for detecting arrhythmias, seizures, or sleep stages – exploiting the temporal dependencies in the signal.

### 8.3 Convolutional Neural Networks in Medicine

- **Medical image analysis**: This is perhaps the most famous application. CNNs detect tumours in mammograms (breast cancer), classify skin lesions from dermoscopy images (melanoma), segment organs in CT scans, and detect diabetic retinopathy in retinal fundus photographs. Many FDA‑approved AI systems are based on CNNs.
- **Genomics (motif finding)**: 1D CNNs scan DNA or RNA sequences to identify short functional motifs (e.g., transcription factor binding sites). The convolution acts like a pattern‑matching filter for specific base‑pair patterns.

### 8.4 Graph Neural Networks in Medicine and Pharmaceutics

- **Drug discovery**: Molecules are natural graphs (atoms = nodes, bonds = edges). GNNs predict molecular properties (solubility, toxicity, binding affinity) faster than traditional computational chemistry. They are used in virtual screening to identify promising drug candidates.
- **Protein‑protein interaction networks**: GNNs help predict how proteins interact, which is crucial for understanding disease pathways and designing drugs that disrupt harmful interactions.
- **Disease classification using patient similarity graphs**: Nodes are patients, edges represent clinical similarity. A GNN can propagate labels (e.g., disease diagnosis) through the graph, leveraging the fact that similar patients tend to have similar outcomes.
- **Population genetics**: GNNs applied to haplotype graphs (representations of genetic variation across populations) can identify genetic variants associated with complex diseases.

### 8.5 Transformers in Medicine and Genetics

- **Protein structure prediction (AlphaFold)**: DeepMind’s AlphaFold2 uses a Transformer‑based architecture (Evoformer) to predict the 3D structure of a protein from its amino acid sequence. This breakthrough solved a 50‑year grand challenge in biology.
- **Genomic language models**: DNA sequences can be treated like a language. Models such as DNABERT (a Transformer pre‑trained on the human genome) can predict regulatory elements, splice sites, and the effects of non‑coding variants.
- **Clinical text summarisation**: Transformers summarise doctor’s notes, radiology reports, or discharge summaries, extracting key information to reduce documentation burden.
- **Single‑cell RNA‑seq analysis**: Transformers (e.g., scBERT) handle the high‑dimensional, sparse expression data of thousands of cells to identify cell types, infer developmental trajectories, and find disease‑associated cell states.

---

## 9. Concluding Remarks

We have journeyed from the simple feedforward network – which treats each input independently – to the sophisticated Transformer, which can attend to every element in a sequence and has changed the landscape of AI. No single architecture is best for all problems:

- **FNNs** shine when data is tabular and examples are independent.
- **RNNs (especially LSTMs)** are still excellent for moderate‑length sequences and real‑time processing.
- **CNNs** dominate grids like images, but also work well for 1D signals.
- **GNNs** are indispensable when relationships form a graph – a common structure in social and biological systems.
- **Transformers** are the current state‑of‑the‑art for language, long sequences, and many multimodal tasks, but they are computationally heavy and need large datasets.

Understanding these five architectures will give you a solid foundation to read research papers, implement models, and even invent new ones. The field is moving fast, but the core principles – local connectivity, recurrence, attention, and graph aggregation – will remain relevant for years to come.

---

## 10. Further Reading & Practical Advice

- **Hands‑on practice**: Implement a small LSTM for stock prediction using Julia’s Flux.jl. Start with synthetic data before moving to real financial series. Compare the forecasting ability with a simple randow walk model.
- **Be aware of pitfalls**: In finance, avoid look‑ahead bias (using future data to train). In medicine, always validate on independent, multi‑centre data and consider model interpretability.
- **Recommended books**: *Deep Learning* by Goodfellow, Bengio, and Courville; *Pattern Recognition and Machine Learning* by Bishop.
- **Online resources**: Fast.ai, Coursera’s Deep Learning Specialisation, and Distill.pub (for accessible explanations of attention and transformers).

Now you are ready to explore deeper and perhaps contribute to one of these exciting fields. Good luck!
