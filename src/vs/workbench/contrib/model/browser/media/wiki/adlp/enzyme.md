# Enzyme Backend

`Enzyme.jl` differentiates the low-level compiled form of a program, in reverse mode. Its gradient costs about the same however many parameters there are.

## How Enzyme Differs from Other AD Tools

Most AD tools act on source code or on overloaded types. Enzyme runs after the compiler has simplified a program, and differentiates its LLVM representation. [Moses and Churavy (2020)](#ref-MC2020a) argue that differentiating after optimisation gives faster gradients, and allows foreign code to be handled without rewriting it. The practical point for a Julia user is that a likelihood can be written in an ordinary style, including loops and arrays changed in place, and need not avoid mutation as some reverse-mode tools require.

## What the Enzyme Call in the Panel Means

`grad!(G, p)` contains this call:

`Enzyme.autodiff(Reverse, nll, Active, Duplicated(p, G), Const.(data)...)`

- `Reverse` chooses reverse mode.
- `Active` says that the scalar output of `nll` is differentiated.
- `Duplicated(p, G)` pairs the parameters with a shadow array, which receives the gradient.
- `Const.(data)` marks the data as constant, so no derivative is taken with respect to it.

The target is `nll` itself, with data as arguments, and not the closure `negloglik`. A clear activity label for each argument is what the backend needs.

## Why the Enzyme Gradient Must Be Zeroed First

A reverse pass adds into the shadow array and does not overwrite it. `grad!` therefore calls `fill!(G, 0)` first. Without that, every call adds to the previous gradient, and L-BFGS sees a wrong direction with no error raised. `enzyme_grad` in **Enzyme Against ForwardDiff** starts from `zero(p)` for the same reason. Any new code that reuses a shadow array needs the same step, which is the most common mistake when moving from ForwardDiff.

## Where Enzyme Is Strong

Reverse mode gives the whole gradient for a small multiple of one evaluation, so it suits a model with many parameters, such as a regression with hundreds of coefficients or a network. Differentiating optimised code keeps that multiple low. Code with in-place updates is supported, which suits Julia written for speed. The panel's **AD Backend** tooltip gives the same advice, recommending it for many parameters. Likelihoods with thousands of unknowns are a natural use of the same call.

## Where Enzyme Can Fail

The first call compiles the derivative, which can take a noticeable time, so a single timing misleads. Code that is unstable in type, or that relies on runtime dispatch, can raise errors or slow the pass, and such messages can be long and low-level. Support tracks Julia's compiler closely, so a new Julia release can need a new Enzyme release. Activity labels matter too: data left unmarked can cost time or raise an error. If a likelihood fails, switching **AD Backend** to ForwardDiff is a quick test of whether the fault lies in the backend or the code.

## How to Check Enzyme's Output

**AD Against Finite Differences** compares its gradient at the start with a central difference. **Enzyme Against ForwardDiff** compares two independent routes at the optimum, and reports `max_difference` with mean times over 20 calls. Those times come after each backend's first call, so compilation is not counted. A disagreement between backends larger than rounding points to a bug, or to a function that isn't smooth at that point. Timings depend on the machine and on the model's size, and do not carry over to larger models.

## References

<a id="ref-MC2020a"></a>Moses, W. S. and Churavy, V. (2020). Instead of rewriting foreign code for machine learning, automatically synthesize fast gradients. [arXiv:2010.01709](https://arxiv.org/abs/2010.01709)

## See Also

- [Automatic Differentiation](autodiff.md) · [ForwardDiff Backend](forwarddiff.md) · [ChainRules Integration](chainrules.md) · [Overview](overview.md)
