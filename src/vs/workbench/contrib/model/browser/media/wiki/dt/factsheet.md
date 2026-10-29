# Decision Tree Models — Factsheet

A **decision tree** partitions the feature space into rectangles by recursive binary splits and predicts a constant in each: a class or a mean. It is easy to read, needs no scaling of the features, handles interactions and non-linear effects by itself, and works for classification and regression alike. Its weakness is **variance**: a small change in the data can change the whole tree.

| | |
|---|---|
| **Purpose** | Predict a class or a value from features with a model a person can read as a set of rules |
| **Input** | A training feature matrix (rows = samples, columns = features), a training target, and a test feature matrix; for modal trees, columns may hold one series per sample |
| **Core packages** | [DecisionTree.jl](https://github.com/JuliaAI/DecisionTree.jl), [ModalDecisionTrees.jl](https://github.com/aclai-lab/ModalDecisionTrees.jl) |
| **Methods** | Decision Tree (CART), Modal Decision Tree |
| **Output** | The fitted splits and leaves, predictions, class probabilities, accuracy or R-squared, feature importances |
| **Key choice** | The size of the tree (max_depth, min_samples_leaf): deep trees fit the training data and overfit, shallow ones underfit |

## When to Use

- You need a model whose **decisions can be explained** as a short set of rules.
- The relation between features and target has **thresholds and interactions** that a linear model would miss.
- Features are of **mixed kinds and scales**, with no wish to transform them.
- As a **building block**: random forests and boosted trees average or chain many trees for better accuracy.

## What It Is Not

A single tree is rarely the most accurate model: ensembles usually predict better. Its splits are greedy, so the tree is not the best possible one, and it predicts a step function, poor at smooth trends and unable to extrapolate beyond the range of the training data. Its feature importances describe the model, not causes in the world.

## See Also
- [Overview](overview.md) · [Decision Guide](decision-guide.md) · [Assumptions](assumptions.md)
