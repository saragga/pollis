# Contributing to Pollis

Thank you for your interest in Pollis. This is a small, early-stage project maintained by one
person, so a short conversation before you write code will save everyone time.

## Before you start

**Open an issue first** for anything beyond a typo or an obvious bug fix. Pollis has opinionated
conventions, particularly around the guided panels, and a pull request that ignores them is painful
to review and to merge. Describing what you intend to do first avoids that.

## Reporting issues

Please search the [open issues](../../issues) before filing a new one.

A useful report contains:

- the Pollis version (**Pollis → About**), and your operating system;
- what you did, what you expected, and what happened instead;
- the exact steps to reproduce it;
- the generated Julia code, if the problem is with generated code;
- any errors from **Help → Toggle Developer Tools → Console**.

Please do not report security vulnerabilities as public issues — see [`SECURITY.md`](SECURITY.md).

## Building

See the build instructions in [`README.md`](README.md).

## Coding conventions

Pollis inherits VS Code's conventions, which are non-negotiable because most of the codebase is
upstream code:

- **Tabs, not spaces.**
- `PascalCase` for types and enum values; `camelCase` for functions, methods, properties and locals.
- Single quotes for internal strings, double quotes for user-facing strings, which must be localised
  through `vs/nls` using placeholders (`{0}`) rather than concatenation.
- Curly braces on the same line, and always around loop and conditional bodies.
- Arrow functions over anonymous function expressions, but `export function x() {}` at top level.
- Services are injected through the constructor, never resolved later via `IInstantiationService`.
- Register disposables immediately after creating them; return an `IDisposable` from a method that
  is called repeatedly rather than registering to the containing class.
- Avoid `any` and `unknown`.

Every file carries the Pollis copyright header. Do not add `any`-typed public API, and do not
duplicate a utility that already exists — look for it first.

### Validating a change

Always type-check before running tests or opening a pull request:

```sh
npm run compile-check-ts-native   # sources under src/
npm run gulp compile-extensions   # if you changed extensions/
npm run valid-layers-check        # layering violations
```

Do not run `npm run compile`. Unit tests are run with `scripts/test.sh` (`scripts\test.bat` on
Windows), optionally with `--grep <pattern>`.

## Changing upstream code

`POLLIS_GUIDE.md` records every intentional deviation from upstream `Code - OSS`, file by file, with
the reason and how to re-apply it after a rebase. **If you change upstream code, record it there in
the same pull request.** An unrecorded deviation will be silently lost at the next rebase.

## Adding a guided panel

Read [`src/vs/workbench/contrib/WEBVIEW_GUIDE.md`](src/vs/workbench/contrib/WEBVIEW_GUIDE.md) first.
It is the specification, not a suggestion. In particular, every panel builds its HTML through
`buildWebviewHtml()` from `webviewScaffold.ts`, and templates that re-implement that scaffolding will
be sent back.

## Pull requests

Keep them focused — one concern per pull request. Include what you changed and why, and say how you
verified it. Opening a pull request means you accept the Contributor Licence Agreement below.

## Contributor Licence Agreement

Pollis is licensed to everyone under the [GNU Affero General Public License v3.0 or
later](LICENSE.txt). Contributions are accepted under a broader grant, so that the maintainer can also
distribute course-specific builds of Pollis to students, and keep the option of offering Pollis under
other licence terms in the future. You keep the copyright of what you write.

By submitting a contribution (code, documentation, or any other material) to Pollis, you agree to the
following:

1. **Copyright licence.** You grant Antonio Saragga Seabra, and anyone who receives Pollis from him, a
   perpetual, worldwide, non-exclusive, royalty-free, irrevocable licence to use, copy, modify,
   distribute, sublicense and relicense your contribution, under any terms, including proprietary
   terms.
2. **Patent licence.** If your contribution is covered by a patent you own or control, you grant the
   same parties a perpetual, worldwide, non-exclusive, royalty-free, irrevocable licence under that
   patent to make, use, sell and distribute Pollis with your contribution.
3. **Your right to contribute.** The contribution is your own original work, or you otherwise have
   the right to submit it under this agreement. If it includes material written by someone else, or
   covered by another licence, you say so in the pull request.
4. **AI-generated material.** If an AI tool produced any part of the contribution, you have reviewed
   it, you take responsibility for it as your submission, and to the best of your knowledge it does
   not reproduce third-party code under terms incompatible with this agreement.
5. **No other obligations.** You are not expected to provide support for your contribution, and it
   is provided "as is", without warranty of any kind.
