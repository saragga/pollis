# The Lorenz System

Every tab uses the Lorenz system (Lorenz, 1963), a three-variable model of convection:

    dx/dt = sigma (y - x)
    dy/dt = x (rho - z) - y
    dz/dt = x y - beta z

with the classic values sigma = 10 and beta = 8/3. The panel's **Parameters (p)** input is the vector [sigma, rho, beta]; rho is the parameter that is usually varied.

## Its Equilibria
- The **origin** is an equilibrium for every rho.
- For rho > 1 there are two more, **C+ and C-**, at x = y = plus or minus sqrt(beta (rho - 1)), z = rho - 1. They are mirror images: the system is unchanged when x and y change sign.

## What Happens as rho Grows (sigma = 10, beta = 8/3)

| rho | Attractors | Event |
|---|---|---|
| below 1 | The origin, which attracts everything | |
| 1 | | **Pitchfork**: the origin loses stability and C+ and C- are born |
| 1 to 24.06 | C+ and C-, two fixed points | Above about 13.93, long chaotic transients before settling |
| 24.06 to 24.74 | C+, C- and a chaotic attractor: three coexist | The chaotic attractor appears near 24.06 |
| 24.74 (exactly 470/19) | | **Hopf**: C+ and C- lose stability (subcritical) |
| above 24.74, e.g. 28 | The chaotic Lorenz attractor alone | |

The Hopf value comes from rho = sigma (sigma + beta + 3) / (sigma - beta - 1). At rho = 28 the attractor has a correlation dimension of about 2.05.

## Using Your Own System
Replace `lorenz!` with your own `f!(du, u, p, t)`, which writes the time derivative of the state u into du, and set u0, p and the grid box to fit your state space. The Bifurcation tab also needs the out-of-place `lorenz(u, p)` form, and the index of the parameter to vary in `@optic _[2]`.

## See Also
- [Overview](overview.md) · [Bifurcation Diagrams](bifurcation.md) · [Attractor Finding](attractors.md)
