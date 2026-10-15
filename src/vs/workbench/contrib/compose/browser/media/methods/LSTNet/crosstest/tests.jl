# Included by the package tests (method.toml, [tests]): cross-tests A and B against the authors' code, on the
# artificial datasets, on the GPU if one is loaded, otherwise the CPU.
using Lux, Optimisers, MLDataDevices, JSON, DelimitedFiles, Random, Statistics
using LSTNet: Settings, Split, evaluate

include("crosstest.jl")
crosstests()
