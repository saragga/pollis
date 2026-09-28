# One-Class SVM

The **One-Class Support Vector Machine** (Schölkopf et al., 2001) learns the smallest region in feature space that contains most of the training data. Points outside the region are novel.

## Construction
```julia
using LIBSVM, Statistics

mu, sd = mean(X_train, dims = 1), std(X_train, dims = 1)
Ztrain = permutedims((X_train .- mu) ./ sd)
Ztest  = permutedims((X_test .- mu) ./ sd)

model = svmtrain(Ztrain; svmtype = OneClassSVM, nu = 0.05)
inside, dec = svmpredict(model, Ztest)
scores = -dec[1, :]
```
LIBSVM expects observations in **columns**. `inside` is `true` for points within the boundary.

## How It Works
The data is mapped through a kernel (by default the Gaussian RBF) into a high-dimensional space, where the method separates it from the origin with maximum margin. Back in the original space the boundary can be curved and can enclose several clusters.

## The nu Parameter
nu is an upper bound on the share of training points left outside the boundary, and a lower bound on the share of support vectors. In practice it is the **false-alarm rate** you accept on normal data.

## Kernel Width
The RBF width (`gamma`, default 1 / number of features) controls smoothness. Large values give a tight, wiggly boundary that flags many new points; small values give a smooth, loose one. Standardising the features first keeps the default reasonable.

## See Also
- [Gaussian Novelty](gaussian-novelty.md) · [Diagnostics](diagnostics.md) · [Decision Guide](decision-guide.md)
