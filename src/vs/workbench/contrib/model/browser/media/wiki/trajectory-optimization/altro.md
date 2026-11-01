# Trajectory Optimisation — ALTRO

ALTRO adds constraint handling to iterative LQR through an augmented Lagrangian, keeping the speed of that solver on problems with limits ([Howell, Jackson and Manchester (2019)](#ref-HJM2019a)). The **ALTRO** tab implements the core of the method in the panel's own code, for bounds on the controls.

## How the Augmented Lagrangian Handles Control Limits

An augmented Lagrangian replaces each constraint by two terms added to the cost: a multiplier times the violation, and a penalty times the violation squared. The result has no explicit constraints left, so the iterative LQR solver can minimise it. Unlike a pure penalty method, the multipliers carry the price of the constraint from one solve to the next, and so feasibility does not rely on an extremely large penalty.

## How the Outer and Inner Loops of the ALTRO Tab Work

The inner loop runs iterative LQR on the augmented cost, up to **Max Iterations** sweeps. The outer loop then checks the violation of the **Control Bound**. Multipliers are updated from the violation, and while limits are still violated, the penalty is multiplied by 10, starting from **Initial Penalty**. The loop ends when the largest violation is below **Tolerance**, or after 10 outer iterations. The same **Tolerance** also stops each inner solve, on the relative fall in cost.

## How the ALTRO Tab Differs from Published ALTRO

The published solver handles general equality and inequality constraints, including limits on states, and finishes with a projected Newton step that drives the violations to high accuracy. The tab here handles control bounds only and has no final projection, so its controls can exceed **Control Bound** by up to the **Tolerance**, or by more if the 10 outer iterations run out. For the full method, including its other constraint types, Altro.jl is the authors' implementation.

## Strengths and Limits of the ALTRO Tab

The tab respects control limits while each iterate still obeys the dynamics, because iterative LQR always rolls the system forward. The resulting gains remain available for feedback. Against that, a constrained solve takes several inner solves, and each one pays for the rising penalty through a worse-conditioned problem. Too large an **Initial Penalty** can harm the first solves, and too small a value uses up the outer iterations. A problem whose limits cannot be met shows up as a violation that stays above **Tolerance**.

## References

<a id="ref-HJM2019a"></a>Howell, T. A., Jackson, B. E. and Manchester, Z. (2019). ALTRO: a fast solver for constrained trajectory optimization. *2019 IEEE/RSJ International Conference on Intelligent Robots and Systems (IROS)*, 7674–7679. [doi:10.1109/IROS40897.2019.8967788](https://doi.org/10.1109/IROS40897.2019.8967788)

## See Also

- [DDP](ddp.md) · [Direct Methods](direct.md) · [Decision Guide](decision-guide.md) · [Diagnostics](diagnostics.md)
