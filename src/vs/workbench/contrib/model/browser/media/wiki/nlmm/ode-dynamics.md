# ODE Dynamics

Many processes are known as rates of change and not as a closed-form curve. Writing the model as differential equations keeps those rates as parameters and lets inputs such as doses act at set times.

## What the ODE Dynamics Tab Fits

The **ODE Dynamics** tab fits a one-compartment model with first-order absorption, a standard form in pharmacokinetics:

d depot / dt = -ka depot

d center / dt = ka depot - (cl_i / v_i) center

Observations follow y_ij ~ Normal(center(t_ij) / v_i, sigma²). Each subject has its own clearance and volume, cl_i = cl exp(eta_cl,i) and v_i = v exp(eta_v,i). Absorption, at rate ka, is shared. The same pattern describes other systems with inflow, transfer and loss, from tracer kinetics to bioprocesses.

## How Dosing Events Enter an ODE Mixed Model

Discrete inputs are rows of the table. `EVID` marks a row as an event (1) or an observation (0). `AMT` gives the amount, `CMT` names the compartment that receives the amount, and `RATE` gives an infusion rate, with 0 for an instantaneous bolus. `DataModel` is told about these columns through `evid_col`, `amt_col`, `rate_col` and `cmt_col`. Event rows have a missing outcome, and the solver restarts at each event with the amount added. The layout follows the event tables used by population pharmacokinetic software.

## How the NoLimits.jl Blocks of an ODE Model Fit Together

`@preDifferentialEquation` computes each subject's parameters once, before the solve. `@DifferentialEquation` states the rates with `D(state) ~ ...`. `@initialDE` sets the starting values of the states. `@formulas` links a state to the outcome, as in `center(t) / v_i`. `set_solver_config` picks the solver and tolerances, here from `OrdinaryDiffEq.jl`, described by [Rackauckas and Nie (2017)](#ref-RN2017a).

## How to Choose a Solver for an ODE Mixed Model

Non-stiff systems run well with an explicit solver such as `Tsit5()`. A stiff system, with rates on very different scales, needs a stiff solver such as `Rodas5P()`, or the fit slows sharply or fails. Tolerances matter because estimators differentiate through the solution: tolerances that are too loose give a noisy objective, and tolerances that are too tight cost time on every evaluation. Exploratory fits can run with looser tolerances, as long as the final fit uses tighter ones and gives the same answer.

## What Identifiability Means for an ODE Mixed Model

Some parameters cannot be told apart from the observed outcome. With only the central concentration observed after an oral dose, the data determine ka and the elimination rate cl / v, yet a swap of the two can fit almost as well, which is known as flip-flop kinetics. The model also identifies volume only relative to the dose. A diverging or very wide interval in **Uncertainty Intervals** often signals such a problem, and the profile-likelihood approach of [Raue, Kreutz, Maiwald, Bachmann, Schilling, Klingmüller and Timmer (2009)](#ref-RKMBS...2009a) can separate structural from practical causes.

## How to Read the Results of the ODE Dynamics Tab

**Half-Life** reports log(2) v / cl, the elimination half-life of a typical subject. **Fitted Trajectories** shows whether the rise and the fall of each subject are captured. **Predict a New Subject** needs the same event layout as the fitted table, since the model has to receive the dose before it can predict. A **Visual Predictive Check** across subjects shows whether the peak and the tail have the right spread.

## References

<a id="ref-RN2017a"></a>Rackauckas, C. and Nie, Q. (2017). DifferentialEquations.jl: A Performant and Feature-Rich Ecosystem for Solving Differential Equations in Julia. *Journal of Open Research Software* 5(1), 15. [doi:10.5334/jors.151](https://doi.org/10.5334/jors.151)

<a id="ref-RKMBS...2009a"></a>Raue, A., Kreutz, C., Maiwald, T., Bachmann, J., Schilling, M., Klingmüller, U. and Timmer, J. (2009). Structural and Practical Identifiability Analysis of Partially Observed Dynamical Models by Exploiting the Profile Likelihood. *Bioinformatics* 25(15), 1923–1929. [doi:10.1093/bioinformatics/btp358](https://doi.org/10.1093/bioinformatics/btp358)

## See Also

- [Factsheet](factsheet.md) · [Nonlinear Curves](nonlinear-curves.md) · [Estimation Methods](estimation-methods.md) · [Uncertainty Quantification](uncertainty-quantification.md)
