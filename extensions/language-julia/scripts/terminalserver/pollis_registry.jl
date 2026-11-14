# Copyright (c) 2026 Antonio Saragga Seabra
# SPDX-License-Identifier: MIT

# Pollis: the Pollis registry, where Pollis's own packages are registered. Included by Pollis.jl and by the scripts
# that the Julia extension runs in hidden processes, before they add one of those packages by name.

const POLLIS_REGISTRY = "https://github.com/Trumpingtons/PollisRegistry"

"""
Adds the Pollis registry to the depot, unless a reachable registry has its name. On a depot with no registry, General
is added first, as Pkg adds General by itself only to a depot with none.
"""
function add_pollis_registry(Pkg::Module; io::IO = stderr)
	registries = Pkg.Registry.reachable_registries()
	any(registry -> registry.name == "PollisRegistry", registries) && return
	isempty(registries) && Pkg.Registry.add("General"; io)
	Pkg.Registry.add(Pkg.RegistrySpec(url = POLLIS_REGISTRY); io)
end
