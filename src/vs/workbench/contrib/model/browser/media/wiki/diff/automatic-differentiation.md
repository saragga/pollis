# Automatic Differentiation

Automatic differentiation (AD) computes exact derivatives of a *program*. It is neither symbolic differentiation, which manipulates formulas, nor numerical differentiation, which takes difference quotients. AD applies the chain rule to each elementary operation (`+`, `*`, `sin`, `exp`, ...) as the program runs, so the result is exact to machine precision. The cost is a small constant multiple of evaluating the function once.

## A Short History

**The chain rule (1670s).** Leibniz stated the rule for differentiating composite functions in his notes from 1676, and it is the whole of AD's mathematics. What took three centuries was working out how to apply it mechanically, and efficiently, to computer programs.

**Dual numbers (1873).** William Kingdon Clifford introduced numbers $a + b\,\varepsilon$ with $\varepsilon^2 = 0$. They turned out to be exactly forward-mode AD: $f(a + \varepsilon) = f(a) + f'(a)\,\varepsilon$ for any polynomial, and by extension for any smooth $f$.

**Forward mode (1964).** R. E. Wengert published a short program that computed derivatives by breaking a formula into a sequence of elementary steps and carrying each step's derivative along with its value. That sequence of intermediate variables is still called a *Wengert list*.

**The complex step (1967).** Lyness and Moler showed how to differentiate analytic functions numerically using complex arithmetic. Squire and Trapp (1998) turned this into the one-line formula $f'(x) \approx \operatorname{Im} f(x + ih)/h$, which has no cancellation error. It is a close cousin of forward-mode AD.

**Reverse mode (1970).** In his 1970 master's thesis at the University of Helsinki, Seppo Linnainmaa described propagating sensitivities *backwards* through a computation. He wrote this to analyse accumulated rounding error, and published it in *BIT* in 1976. This gives the gradient of a scalar function at a cost independent of the number of inputs. Bert Speelpenning's 1980 thesis turned the idea into a compiler that generated gradient code automatically.

**Backpropagation (1986).** Paul Werbos had proposed applying reverse-mode differentiation to neural networks in his 1974 thesis. Rumelhart, Hinton and Williams's 1986 *Nature* paper popularised it as *backpropagation*, which is reverse-mode AD specialised to layered networks.

**The AD tool era (1990s).** Andreas Griewank and others set out the theory, including the result that a gradient costs at most a small constant times the function itself. They also built tools: ADOL-C (C++, operator overloading), ADIFOR (Fortran, source transformation) and later Tapenade. Griewank and Walther's *Evaluating Derivatives* (2000; 2nd edition 2008) is the standard reference.

**Deep learning (2010s).** Theano, TensorFlow, PyTorch and JAX put reverse-mode AD at the centre of machine learning. Training a network with millions of parameters is only feasible because one backward pass gives the whole gradient.

**AD in Julia.** Julia's generic functions and multiple dispatch suit AD especially well.

| Year | Package | Approach |
|---|---|---|
| 2016 | **ForwardDiff.jl** (Revels, Lubin, Papamarkou) | Forward mode with dual numbers that flow through any generic Julia code |
| 2018 | **Zygote.jl** (Innes) | Reverse mode by source-to-source transformation; the default in Flux for years, but it cannot handle array mutation |
| 2020 | **Enzyme.jl** (Moses, Churavy) | Differentiates LLVM compiler IR *after* optimisation; supports mutation; works across languages |
| 2024 | **Mooncake.jl** (Tebbutt and others) | Reverse mode on Julia's own IR, successor to Tapir.jl; supports mutation |
| 2024 | **DifferentiationInterface.jl** (Dalle, Hill) | One interface over all of the above, plus FiniteDiff and Symbolics |

## How It Works: A Worked Example

Take $f(x_1, x_2) = x_1 x_2 + \sin x_1$ at $(x_1, x_2) = (2, 3)$. As a Wengert list:

| Step | Value | Forward: derivative along $x_1$ |
|---|---|---|
| $v_1 = x_1$ | 2 | $\dot v_1 = 1$ |
| $v_2 = x_2$ | 3 | $\dot v_2 = 0$ |
| $v_3 = v_1 v_2$ | 6 | $\dot v_3 = \dot v_1 v_2 + v_1 \dot v_2 = 3$ |
| $v_4 = \sin v_1$ | $\sin 2$ | $\dot v_4 = \cos(v_1)\,\dot v_1 = \cos 2$ |
| $v_5 = v_3 + v_4$ | $6 + \sin 2$ | $\dot v_5 = 3 + \cos 2 = \partial f / \partial x_1$ |

**Forward mode** runs this table once per input direction. Getting $\partial f/\partial x_2$ needs a second pass with $\dot v_1 = 0,\ \dot v_2 = 1$.

**Reverse mode** runs the table forward once to get the values, then goes backwards with *adjoints* $\bar v_i = \partial f / \partial v_i$, starting from $\bar v_5 = 1$:

| Step (backwards) | Adjoint |
|---|---|
| $v_5 = v_3 + v_4$ | $\bar v_3 = 1,\ \bar v_4 = 1$ |
| $v_4 = \sin v_1$ | $\bar v_1 \mathrel{+}= \bar v_4 \cos v_1 = \cos 2$ |
| $v_3 = v_1 v_2$ | $\bar v_1 \mathrel{+}= \bar v_3 v_2 = 3,\ \ \bar v_2 = \bar v_3 v_1 = 2$ |

One backward pass gives the whole gradient $(3 + \cos 2,\ 2)$.

## Forward or Reverse?

For $F : \mathbb{R}^n \to \mathbb{R}^m$:

| | Forward mode | Reverse mode |
|---|---|---|
| One pass gives | A Jacobian-vector product $J v$ (one column direction) | A vector-Jacobian product $u^\top J$ (one row direction) |
| Full Jacobian needs | $n$ passes | $m$ passes |
| Best when | Few inputs, many outputs | Many inputs, few outputs, e.g. a gradient |
| Memory | Small | Stores the forward pass (the "tape") |
| Julia backends | ForwardDiff, Enzyme forward, Mooncake forward | Enzyme, Mooncake |

A Hessian is usually computed **forward-over-reverse**: forward mode applied to a reverse-mode gradient. In DifferentiationInterface this is `SecondOrder(AutoForwardDiff(), AutoEnzyme())` or similar.

## Dual Numbers in Five Lines

```julia
struct Dual <: Number; v::Float64; d::Float64; end
Base.:+(a::Dual, b::Dual) = Dual(a.v + b.v, a.d + b.d)
Base.:*(a::Dual, b::Dual) = Dual(a.v * b.v, a.d * b.v + a.v * b.d)   # product rule
Base.sin(a::Dual) = Dual(sin(a.v), cos(a.v) * a.d)                   # chain rule
f(x1, x2) = x1 * x2 + sin(x1)
f(Dual(2, 1), Dual(3, 0))   # Dual(6.909..., 2.583...): value and df/dx1 = 3 + cos(2)
```

ForwardDiff.jl is this idea made fast and complete, with chunks of several partials carried at once.

## What AD Does Not Do

- It differentiates the program as written: at a kink or an `if` branch it returns the derivative of the branch taken.
- It does not simplify: there is no formula at the end, only numbers. Use Symbolics for formulas.
- An iterative algorithm, such as a solver loop, is differentiated through its iterations unless a custom rule (e.g. the implicit function theorem) is supplied. Packages such as ImplicitDifferentiation.jl provide such rules.

## Further Reading

- Griewank and Walther (2008), *Evaluating Derivatives*: the standard text.
- Baydin, Pearlmutter, Radul and Siskind (2018): a survey from the machine-learning side.
- Dalle and Hill (2026): the design of DifferentiationInterface.
- The JuliaCon talks under Multimedia Tutorials in this panel.

## See Also
- [Overview](overview.md) · [Diagnostics](diagnostics.md) · [Decision Guide](decision-guide.md) · [Factsheet](factsheet.md)
