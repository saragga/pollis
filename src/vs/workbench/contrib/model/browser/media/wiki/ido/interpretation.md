# Reading Optimal Control Results

A solved model gives one number, the cost, and two sets of curves, the states and the controls. Most of the insight lies in their shapes and in where the bounds and costates act.

## The objective value

`objective` is the integral of the running cost as computed by the transcription's quadrature. Its units are those of the running cost times time, so it only has meaning alongside the cost you typed.

The value is exact for the discretised problem and only approximate for the continuous one, and a coarse mesh can land on either side of the true value. Quote it with the number of supports and the method. Compared across settings, a change in the leading digits means the mesh matters, whereas a change in far-off digits is usually solver tolerance.

## The shape of the control

**Optimal Trajectory** shows the plan. The shape carries the logic of the cost, and the default shows a clear case: least energy gives a straight line, u(t) = −1.5(1 − t), pushing hard at first and braking hard at the end, passing zero in the middle.

Costs change that shape. Control energy gives smooth curves. Cost linear in the control gives bang-bang plans that jump between −umax and umax. Time spent at a bound means that the bound is limiting performance, and the optimal cost would fall if it were relaxed. If no part of the control touches **Control Bound**, the bound is inactive and any larger value gives the same answer.

## Reading the phase portrait

**Phase Portrait** plots x1 against x2, with time hidden. On the default it runs from (1, 0), bows through negative velocity and returns to (0, 0). The widest point is where the control changes sign, at t = 1 with x₂ = −0.75, which is the fastest moment of the move.

A loop, a sharp corner or a long detour reveals things the time plots can hide. A sharp corner suggests a jump in the control. A detour may be a true feature of the problem, a local optimum or a mesh effect, and **Compare Derivative Methods** helps to tell which. The plot uses the first two states only.

## Costates as shadow prices

Pontryagin's principle attaches a costate p(t) to each state, and it can be read as the marginal cost of a unit change in that state at that time. **Costates** plots the duals of `model[:ode]` as the discrete version of those curves.

On the default, the theory gives p₁ = 3 and p₂ = 3(1 − t), with u = −p₂ / 2 tying the control to the second one. The code's duals are scaled by the quadrature weights of the transcription, and their sign depends on the convention. Read the shape and the zero crossings first, and rescale before quoting a size. A straight line in p₂ here goes with a straight line in `u`.

## Sensitivity to the start

**Initial-State Sensitivity** gives the derivative of the optimal cost with respect to each initial state. On the default both are 3: starting a little further out, or moving a little faster away from the target, costs 3 units per unit of change at first.

The figures are local. Because the default cost is quadratic in the initial state, its slope changes with distance, so large changes need a re-solve. The cost is 1.5(1 + e)² for a shift e in the first state, which gives 6 at e = 1 rather than the 1.5 + 3 = 4.5 the slope would predict.

## Cost against horizon

**Horizon Sweep** plots the optimal cost for 8 values of T, from 0.5 to twice the current **T**. For the default without a bound the curve is 12 / T³, which is 12 at T = 1, about 3.56 at T = 1.5 and 0.1875 at T = 4. Time is therefore a very strong lever on energy here.

The bound changes the left end of the curve. For T below about 1.095 the cost is above 12 / T³, because the control is clipped, and at the first grid value of 0.5 the default is infeasible, as a move needs at least 0.894. Any point there is not a real optimum, and it may plot as a gap.

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Decision Guide](decision-guide.md)
