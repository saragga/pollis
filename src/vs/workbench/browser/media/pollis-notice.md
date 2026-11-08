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
| quack extension for DuckDB | MIT | https://github.com/duckdb/duckdb-quack |
| httpfs extension for DuckDB | MIT | https://github.com/duckdb/duckdb-httpfs |
| OpenSSL (in httpfs) | Apache-2.0 | https://github.com/openssl/openssl |
| curl (in httpfs) | curl | https://github.com/curl/curl |
| Poppler (Poppler_jll) | GPL-2.0 or GPL-3.0 | https://poppler.freedesktop.org |
| PDF.js | Apache-2.0 | https://github.com/mozilla/pdf.js |

julia-vscode bundles a number of Julia packages (under `scripts/packages/`); each retains its own (predominantly MIT) license as distributed in the upstream project.

Parts of Compose > Collaboration (the peer-to-peer connection and the chat) are adapted from p2p-live-share. Collaboration also bundles Trystero with @noble/secp256k1 (MIT) and mqtt (MIT, with its own dependencies under MIT, ISC or BSD licenses); their full license texts are distributed with the bundles in `trystero.license.txt`.

Pollis ships the official DuckDB library (libduckdb), with the DuckDB Node API (`@duckdb/node-api` and `@duckdb/node-bindings`) for its DuckDB terminal, and installs a fork of DuckDB.jl that loads that library into its Julia environment. DuckDB includes third-party libraries under their own licenses (MIT, BSD, Apache-2.0 and others), listed with their license texts in the `third_party` folder of its source.

Pollis also ships the fts extension for DuckDB, full-text search, built by DuckDB from duckdb-fts. It includes the Snowball stemmers (libstemmer, BSD-3-Clause, Copyright Martin Porter and Richard Boulton).

Pollis ships the quack extension for DuckDB, its client and server, with which it serves the database of the Shared Session to its DuckDB terminal and notebooks, on this computer only, and the httpfs extension, on which quack runs; both are built by DuckDB, from duckdb-quack and duckdb-httpfs. httpfs includes OpenSSL 3.6.0 (Apache-2.0) and libcurl 8.17.0 (curl license).

Pollis installs Poppler_jll, the build of Poppler 25.10.0 by the Julia BinaryBuilder project, into its Julia environment: Ask Pollis reads the text of PDF documents with its `pdftotext`. Pollis runs this tool as a separate program and does not link to the Poppler libraries.

Pollis ships the legacy build of PDF.js 6.4.299 in its PDF Viewer (`extensions/pdf-viewer/pdfjs`). PDF.js includes the Adobe CMaps (BSD-3-Clause), the Foxit standard fonts (BSD-3-Clause), the Liberation Sans fonts (GPL-2.0 with the font exception), the JBIG2 decoder of PDFium (BSD-3-Clause), OpenJPEG (BSD-2-Clause), qcms (MIT) and an ICC profile (CC0-1.0); their full license texts are distributed with it, in `LICENSE` and the `LICENSE*` files of its `web` folders.

---

## Copyright Notices

- **Visual Studio Code (Code - OSS)** — Copyright (c) Microsoft Corporation.
- **Codicons** — Copyright (c) Microsoft Corporation.
- **julia-vscode** — Copyright (c) 2012–2022 David Anthoff, Zac Nugent, Sebastian Pfitzner and other contributors.
- **p2p-live-share** — Copyright 2025 _Kerman.
- **Trystero** — Copyright (c) 2021 Dan Motzenbecker.
- **DuckDB**, **DuckDB Node API**, **fts extension for DuckDB**, **quack extension for DuckDB**, **httpfs extension for DuckDB** — Copyright 2018-2025 Stichting DuckDB Foundation.
- **DuckDB.jl** — Copyright 2018-2024 Stichting DuckDB Foundation.
- **Poppler** — Copyright Glyph & Cog, LLC and The Poppler Developers.
- **PDF.js** — Copyright Mozilla Foundation.
- **OpenSSL** — Copyright (c) 1998-2025 The OpenSSL Project Authors; Copyright (c) 1995-1998 Eric A. Young, Tim J. Hudson.
- **curl** — Copyright (c) 1996 - 2025, Daniel Stenberg, <daniel@haxx.se>, and many contributors, see the THANKS file.

---

## MIT License

The components listed above, except Poppler, PDF.js, OpenSSL and curl, are distributed under the MIT License. The following terms apply to each such component, with the copyright notice replaced by the corresponding notice above:

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

---

## GNU General Public License (Poppler)

Poppler is based on Xpdf, which is licensed under the GNU General Public License (GPL), version 2 or 3; all changes made under the Poppler project are licensed under GPL version 2 or later, as stated in the README-XPDF file and in the headers of Poppler's source files. The texts of both versions of the GPL are distributed with the Poppler sources, in `COPYING` (GPL v2) and `COPYING3` (GPL v3), at https://gitlab.freedesktop.org/poppler/poppler.

Poppler is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

---

## Apache License 2.0 (PDF.js, OpenSSL)

PDF.js and OpenSSL are licensed under the Apache License, Version 2.0 (the "License"); you may not use them except in compliance with the License. You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0; its full text is distributed with PDF.js, in `extensions/pdf-viewer/pdfjs/LICENSE`, and in the Third-Party Notices file (`ThirdPartyNotices.txt`) distributed with Pollis.

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.

---

## curl License

```
COPYRIGHT AND PERMISSION NOTICE

Copyright (c) 1996 - 2025, Daniel Stenberg, <daniel@haxx.se>, and many
contributors, see the THANKS file.

All rights reserved.

Permission to use, copy, modify, and distribute this software for any purpose
with or without fee is hereby granted, provided that the above copyright
notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT OF THIRD PARTY RIGHTS. IN
NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE
OR OTHER DEALINGS IN THE SOFTWARE.

Except as contained in this notice, the name of a copyright holder shall not
be used in advertising or otherwise to promote the sale, use or other dealings
in this Software without prior written authorization of the copyright holder.
```
