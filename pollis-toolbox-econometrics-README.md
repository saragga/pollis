# Financial Econometrics Toolbox

Version 1.0.4

The Pollis Financial Econometrics Toolbox covers time-series econometrics and empirical asset pricing: ARIMAX models, VAR/VECM systems, GARCH-type and regime switching models, time-series forecasting, and Bayesian asset-pricing factor models.

Installing it adds the **Financial Econometrics** submenu to the **Model** menu. Each panel has key points, a decision table, example code you can send to the Julia REPL or a notebook, reference wikis and notebook tutorials.

## Panels

| Panel | What it covers | Powered by |
|---|---|---|
| ARIMAX Models | ARIMA and seasonal ARIMA models with exogenous regressors | StateSpaceModels.jl |
| VAR/VECM Systems | VAR, structural VAR, factor-augmented VAR and VECM, with transmission channel analysis | MacroEconometricModels.jl, TransmissionChannelAnalysis.jl |
| GARCH-Type Models | GARCH, EGARCH, GJR-GARCH and DCC volatility models | ARCHModels.jl |
| Regime Switching Models | Markov-switching regression, autoregression and ARCH, with time-varying transitions | MarSwitching.jl |
| Advanced Time-Series Forecasting | BATS/TBATS, the Theta method and intermittent demand | Durbyn.jl |
| Neural Network Time-Series Forecasting | LSTnet, DA-RNN, TPA-LSTM and DSANet | FluxArchitectures.jl, Flux.jl |
| Automatic Time-Series Forecasting | Auto ARIMA, auto ETS, auto ARARMA and a race between models | Durbyn.jl |
| Bayesian Linear Stochastic Discount Factor | Bayesian SDF estimation with spike-and-slab factor selection | BayesianFactorZoo.jl |
| Fama-MacBeth Regression | Bayesian and classical Fama-MacBeth regressions of returns on factors | BayesianFactorZoo.jl, FamaFrenchData.jl |

## Requirements

Julia. Each panel lists the Julia packages it uses on its Powered by line and offers to install the missing ones.

## License

AGPL-3.0
