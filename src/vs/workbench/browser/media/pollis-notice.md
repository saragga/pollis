# Third-Party Notices

Pollis is licensed under the GNU Affero General Public License v3.0, and incorporates the following open-source components. Each remains the property of its respective copyright holders and is licensed under the terms reproduced below, which continue to apply to it within Pollis.

| Component | License | Source |
|---|---|---|
| Visual Studio Code (Code - OSS) | MIT | https://github.com/microsoft/vscode |
| Codicons | MIT | https://github.com/microsoft/vscode-codicons |
| julia-vscode | MIT | https://github.com/julia-vscode/julia-vscode |
| p2p-live-share | MIT | https://github.com/KermanX/p2p-live-share |
| Trystero | MIT | https://github.com/dmotz/trystero |
| DuckDB | MIT | https://github.com/duckdb/duckdb |
| DuckDB Node API | MIT | https://github.com/duckdb/duckdb-node-neo |
| DuckDB.jl (Pollis fork) | MIT | https://github.com/Trumpingtons/DuckDB.jl |
| fts extension for DuckDB | MIT | https://github.com/duckdb/duckdb-fts |

julia-vscode bundles a number of Julia packages (under `scripts/packages/`); each retains its own (predominantly MIT) license as distributed in the upstream project.

Parts of Compose > Collaboration (the peer-to-peer connection and the chat) are adapted from p2p-live-share. Collaboration also bundles Trystero with @noble/secp256k1 (MIT) and mqtt (MIT, with its own dependencies under MIT, ISC or BSD licenses); their full license texts are distributed with the bundles in `trystero.license.txt`.

Pollis ships the official DuckDB library (libduckdb), with the DuckDB Node API (`@duckdb/node-api` and `@duckdb/node-bindings`) for its DuckDB terminal, and installs a fork of DuckDB.jl that loads that library into its Julia environment. DuckDB includes third-party libraries under their own licenses (MIT, BSD, Apache-2.0 and others), listed with their license texts in the `third_party` folder of its source.

Pollis also ships the fts extension for DuckDB, full-text search, built by DuckDB from duckdb-fts. It includes the Snowball stemmers (libstemmer, BSD-3-Clause, Copyright Martin Porter and Richard Boulton).

---

## Copyright Notices

- **Visual Studio Code (Code - OSS)** — Copyright (c) Microsoft Corporation.
- **Codicons** — Copyright (c) Microsoft Corporation.
- **julia-vscode** — Copyright (c) 2012–2022 David Anthoff, Zac Nugent, Sebastian Pfitzner and other contributors.
- **p2p-live-share** — Copyright 2025 _Kerman.
- **Trystero** — Copyright (c) 2021 Dan Motzenbecker.
- **DuckDB**, **DuckDB Node API**, **fts extension for DuckDB** — Copyright 2018-2025 Stichting DuckDB Foundation.
- **DuckDB.jl** — Copyright 2018-2024 Stichting DuckDB Foundation.

---

## MIT License

The components listed above are distributed under the MIT License. The following terms apply to each such component, with the copyright notice replaced by the corresponding notice above:

```
Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```
