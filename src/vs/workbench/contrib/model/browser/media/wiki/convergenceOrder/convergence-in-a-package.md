# Check a Convergence Order: Convergence Tests in a Package

Which packages need a convergence test, what problem it should solve, why every step must use the same Brownian paths, how to choose the steps, the paths and the allowed gap, and what such a test looks like in the tests of a package.

## Which Packages Need a Convergence Test?

A convergence test checks a scheme that steps a differential equation forward in time, so it belongs in the tests of a package that has such a scheme in its own code: a simulator of a diffusion written by hand, the discretisation of a model in continuous time, or a solver of an ordinary differential equation that the package does not take from elsewhere. A package that solves its equations with the solvers of DifferentialEquations.jl relies on solvers that are tested in their own packages, and its tests are better spent on its own code, such as the drift and the diffusion it passes to them. A method package of Pollis whose article simulates a stochastic differential equation can test the order of its simulator beside the targets of the article, as a reference or property test does, since the article gives the scheme and its order.

## What Problem Should a Convergence Test Solve?

The errors of a convergence test are distances from the exact solution, so the test problem needs one. Linear equations have exact solutions: exponential growth, du/dt = a u, for an ordinary differential equation, and geometric Brownian motion, whose exact solution on each Brownian path is known, for a stochastic one; both are the problems of Check a Convergence Order. A scheme written for a model of another form can still be tested on such a problem when its drift and its diffusion are arguments of the scheme. When no exact solution is known, the errors can be measured against a solution computed with a much smaller step, which `analyticless_test_convergence` of DiffEqDevTools does for the solvers of DifferentialEquations.jl; for a stochastic equation, the smaller step must follow the same Brownian path as the steps it is compared with.

## Why Must Every Step Use the Same Brownian Paths?

The strong error compares a solution with the exact solution on the same path of Brownian motion. [Higham (2001)](#ref-Hig2001a) computes the solutions at the larger steps from the Brownian increments drawn at the smallest step: the increment over a larger step is the sum of the small increments it covers, so every step size follows the same path. A scheme written by hand can do the same: draw the increments of the smallest step once for each path, sum them for each larger step, and compare each solution with the exact solution at the end of that path. Paths drawn afresh for each step size would add the difference between paths to the error, and the estimated order would mean little. DiffEqDevTools evaluates the exact solution on the path that each solve draws, so each solution is compared on its own path.

## How Should the Steps and the Paths Be Chosen?

An order describes how the error falls when the step is small enough, so the largest step should already be in that range, where the error follows the step raised to the power of the order. The smallest step should leave the error well above what hides it: the rounding of floating-point numbers for an ordinary differential equation, whose error stops falling once it nears it, and the Monte Carlo error of the mean over the paths for a stochastic one. Halving the step from one size to the next makes the order between two steps the logarithm in base 2 of the ratio of their errors. A strong error is a mean over the paths, and its scatter falls with the square root of their number. A weak error is often much smaller than a strong one, and needs more paths unless the means are compared on the same paths.

## How Wide Should the Allowed Gap Be?

An estimated order scatters around the order of the theory, because of the paths drawn, the steps chosen and the terms of higher order in the error. A test that passes when the estimate lies within an allowed gap of the theory needs a gap wider than that scatter and narrower than the difference that a mistake makes, which is often half an order or more, as when a correction term is dropped. The scatter can be seen by running the test at several seeds before choosing the gap. Once chosen, the seed of the test should be fixed with a `StableRNG` of StableRNGs.jl, whose numbers stay the same across versions of Julia, so that the test does not change its result when Julia changes its default random number generator.

## What Does a Convergence Test Look Like in a Package?

```julia
using Test, StableRNGs, Statistics

@testset "strong order of the Milstein step" begin
    mu, sigma = 2.0, 1.0
    step(x, dt, dW) = x + mu * x * dt + sigma * x * dW + sigma^2 * x * (dW^2 - dt) / 2
    dts = 2.0 .^ (-4:-1:-9)
    finest, n = minimum(dts), 2^9
    rng = StableRNG(1)
    total = zeros(length(dts))
    for _ in 1:1000
        dW = sqrt(finest) .* randn(rng, n)
        exact_end = exp((mu - sigma^2 / 2) + sigma * sum(dW))
        for (j, dt) in enumerate(dts)
            r = round(Int, dt / finest)
            x = 1.0
            for k in 1:div(n, r)
                x = step(x, dt, sum(view(dW, ((k - 1) * r + 1):(k * r))))
            end
            total[j] += abs(x - exact_end) / 1000
        end
    end
    order = cov(log.(dts), log.(total)) / var(log.(dts))
    @test abs(order - 1.0) <= 0.2
end
```

The test takes a few seconds. **Milstein Written by Hand** runs the same scheme with and without its correction term.

## References

<a id="ref-Hig2001a"></a>Higham, D. J. (2001). An algorithmic introduction to numerical simulation of stochastic differential equations. *SIAM Review* 43(3), 525–546. [doi:10.1137/S0036144500378302](https://doi.org/10.1137/S0036144500378302)

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md)
