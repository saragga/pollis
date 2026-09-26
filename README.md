# Pollis

Pollis is a desktop environment for statistical modelling, econometrics, simulation and
optimisation, built on top of [Code - OSS](https://github.com/microsoft/vscode) and organised
around [Julia](https://julialang.org).

Rather than starting from a blank file, you pick a method from the menu bar. Pollis opens a guided
panel for it — what the method assumes, when to prefer it over its neighbours, which package
implements it — and generates runnable Julia code that you can copy, open in an editor, send to the
integrated Julia REPL, or drop into a notebook.

> **Status: early.** Pollis is version 0.2.0 and under active development. Interfaces, menu
> structure and generated code are all still moving. Expect rough edges.

## What Pollis adds

Pollis replaces the standard editor menu bar with a set of domain menus:

| Menu | Covers |
|---|---|
| **Explore** | Data sources, retrieval and reference material |
| **Model** | Distributions, copulas, hypothesis testing, regression families, time series, state-space inference, machine learning, neural architectures |
| **Simulate** | Stochastic simulation and scenario generation |
| **Optimise** | Optimisation methods and solvers |
| **Toolboxes** | Applied bundles built on the above |

Behind these menus sit roughly 200 guided panels. Each one is self-contained: a short explanation of
the method, an illustration of where it sits among related methods, inputs for the parameters that
matter, and a generated Julia program.

Where a panel needs credentials for an external data provider, the key is held in the operating
system keychain through the editor's secret storage, and injected into the Julia REPL session only —
never written into generated files.

## Relationship to Visual Studio Code

Pollis is an independent derivative of `Code - OSS`, the MIT-licensed open-source core of Visual
Studio Code. It is **not** Visual Studio Code, and it is **not** affiliated with, endorsed by, or
supported by Microsoft.

Because Pollis is built from `Code - OSS` rather than from the Visual Studio Code product build, it
does not include Microsoft's proprietary customisations, its branding, its telemetry, or the
Visual Studio Marketplace.

## Bundled runtimes

Version 0.2.0 is built against:

| Component | Version |
|---|---|
| Code - OSS | 1.117.0 |
| Julia | 1.12.6 |

## Building from source

Pollis builds the same way `Code - OSS` does. You will need Node.js, Python and a C++ toolchain; the
upstream [How to Contribute](https://github.com/microsoft/vscode/wiki/How-to-Contribute) guide
covers the per-platform prerequisites, which have not changed.

```sh
npm install
npm run watch      # incremental build, leave running
./scripts/code.sh  # launch (scripts\code.bat on Windows)
```

Type-check without a full build:

```sh
npm run compile-check-ts-native
```

`POLLIS_GUIDE.md` records every intentional deviation from upstream, file by file, so that rebasing
onto a newer `Code - OSS` release stays tractable. If you change upstream code, record it there.

## Contributing

Pollis is a small project and the codebase is still settling, so please open an issue to discuss
anything substantial before writing code. Coding conventions are inherited from upstream VS Code and
are summarised in `CONTRIBUTING.md`.

Panels are documented separately in
[`src/vs/workbench/contrib/WEBVIEW_GUIDE.md`](src/vs/workbench/contrib/WEBVIEW_GUIDE.md) — read it
before adding one.

## Security

Please do not report security vulnerabilities through public issues. See
[`SECURITY.md`](SECURITY.md).

## License

Copyright (c) 2026 Antonio Saragga Seabra

Pollis is licensed under the [GNU Affero General Public License v3.0 or later](LICENSE.txt). You may
use, study, share and modify it. If you distribute a modified version, or let others use one over a
network, you must make its source code available under the same licence.

**Extensions are exempt.** An additional permission in [`LICENSE.txt`](LICENSE.txt) lets you
distribute extensions for Pollis under any licence, including a proprietary one, as long as they
interact with Pollis only through the extension API.

The files that come from `Code - OSS` remain under Microsoft's MIT License
(Copyright (c) 2015 - present Microsoft Corporation), reproduced in [`LICENSE.txt`](LICENSE.txt).

Pollis bundles third-party open-source components, each under its own licence. See
[`ThirdPartyNotices.txt`](ThirdPartyNotices.txt).
