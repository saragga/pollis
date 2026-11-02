# ChainRules Integration

A differentiation rule tells an AD system the derivative of a function directly, so that it need not look inside. ChainRules is Julia's shared way of writing such rules, and `DistributionsAD.jl` supplies rules for distributions.

## What a ChainRules Rule Is

`ChainRules.jl` defines two kinds of rule, independent of any one AD engine. An `rrule` serves reverse mode: it returns a function's value, along with a pullback that turns an output sensitivity into input sensitivities. An `frule` serves forward mode: it returns the value and its directional derivative. A rule lets an author state a derivative once, and every engine that reads the format benefits. Engines that consume `rrule` include `Zygote.jl`, and the idea follows the general account of reverse mode by [Baydin, Pearlmutter, Radul and Siskind (2018)](#ref-BPRS2018a).

## Why Distributions Need Their Own Rules

Log-densities can pass through special functions, such as the log-gamma in the Gamma and Beta families, and through checks and branches on a parameter's range. Tracing such code may be slow, or may stumble on an operation an engine cannot follow. A rule can state the result directly and more stably. For a Normal log-density, the derivatives are simple:

- With respect to mu: (y − mu) / sigma²
- With respect to log sigma: (y − mu)² / sigma² − 1

`DistributionsAD.jl` provides such rules, so that `logpdf` calls work under rule-based engines. The families themselves come from `Distributions.jl`.

## What Role Rules Play with the Panel's Backends

Neither backend in the panel is built on ChainRules rules. `Enzyme.jl` differentiates the compiled code, and has its own system for custom rules. `ForwardDiff.jl` pushes dual numbers through generic Julia code. The panel loads `DistributionsAD.jl` so that the same likelihood can move to a rule-based engine, such as those used with `Turing.jl`. Results here therefore do not test its rules. Comparing with a rule-based engine would mean adding one to the code, along with a third entry in the backend comparison.

## How to Write a Rule for a New Density

Write a rule when a function is costly to trace, or holds an operation that an engine cannot differentiate. A reverse rule for a scalar function has this form:

```julia
function ChainRulesCore.rrule(::typeof(f), x)
    y = f(x)
    pullback(dy) = (NoTangent(), dy * dfdx(x))
    return y, pullback
end
```

`NoTangent()` stands for the function itself, which has no derivative of interest. After writing one, compare it with a finite difference, as in **AD Against Finite Differences**, as a wrong rule gives a wrong gradient silently.

## When Rules Help and When They Hurt

Rules help with speed, with numerically stable formulas, and with code such as an external library that an engine cannot read. They hurt when they fall out of step with the function, since an engine then trusts a stale formula with no warning. They also apply only to the method signature they are written for, so a call with other types may bypass the rule. Rules are best kept for the few functions that need them, leaving the rest to the engine.

## References

<a id="ref-BPRS2018a"></a>Baydin, A. G., Pearlmutter, B. A., Radul, A. A. and Siskind, J. M. (2018). Automatic differentiation in machine learning: a survey. *Journal of Machine Learning Research* 18(153), 1–43. [jmlr.org/papers/v18/17-468](https://jmlr.org/papers/v18/17-468.html)

## See Also

- [Automatic Differentiation](autodiff.md) · [Enzyme Backend](enzyme.md) · [ForwardDiff Backend](forwarddiff.md) · [Overview](overview.md)
