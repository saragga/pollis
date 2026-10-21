/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

// The study.ipynb of an event study: Julia that runs PollisEventStudies.jl on the study's folder (study.toml,
// events.csv and prices/), which computes, for each period, the average and cumulative average abnormal returns a
// minute at a time with their cross-sectional t, the Boehmer, Musumeci and Poulsen (1991) test on standardized CARs,
// and abnormal volume, and writes them to results/. The page draws the same CAARs as the prices come in.

const PACKAGE_URL = 'https://github.com/Trumpingtons/PollisEventStudies.jl';

/** The notebook of the event study in `folder` (its path on disk), as the JSON of a Jupyter notebook in Julia. */
export function eventStudyNotebook(folder: string): string {
	const cells = [
		markdown(String.raw`
# Event Study

The filings an alert on SEC filings fired are the events. Pollis captures the minute prices of each filer's stock and of the benchmark around them, from Yahoo Finance, into this folder:

- **study.toml**: the benchmark, the model of normal returns and the periods, in minutes before and after the filing;
- **events.csv**: the filings, with the time EDGAR accepted each (UTC), whether it came in during the regular session and the next open after it;
- **prices/**: a file per filing, with the minute bars of the stock and of the benchmark.

[PollisEventStudies.jl](${PACKAGE_URL}) computes, for each period, the average abnormal return (AAR) and the cumulative average abnormal return (CAAR) a minute at a time with their cross-sectional t, from the filing and, for a filing outside the regular session, from the next open; and at the end of the period the CAR's t, the Boehmer, Musumeci and Poulsen (1991) test on standardized CARs, and abnormal volume. It writes them to **results/**. Events still capturing prices count up to the last complete minute: run all again as they come in.
`),
		code(String.raw`
import Pkg
Base.find_package("PollisEventStudies") === nothing && Pkg.add(url = "${PACKAGE_URL}")
using PollisEventStudies

const STUDY = isfile(joinpath(pwd(), "study.toml")) ? pwd() : raw"${folder}"
results = run_study(STUDY)
`),
		markdown(String.raw`
## Each event

At the end of each period: the CAR in per cent, the standardized CAR (by the residual standard deviation of the estimation days and the square root of the minutes it spans), abnormal volume (the mean log(1 + volume) of the regular-session minutes after the filing, or after the next open, less that of those before the filing) and, with the market model, beta.
`),
		code(String.raw`
results[1].events
`),
		markdown(String.raw`
## Notes

- **Market-adjusted**: the normal return is the benchmark's. **Market model**: alpha plus beta times the benchmark's return, estimated on the minute returns of the regular sessions of the trading days before the period, not across the night.
- The Boehmer, Musumeci and Poulsen test needs the estimation days, which Pollis captures for the market model only.
- Yahoo Finance keeps minute prices for 30 days: the events are the filings of the 30 days before the study was made and those after, captured while Pollis was open.
- The benchmark trades only in the regular session: after the close, the stock's moves are its own.
`),
	];
	return JSON.stringify({
		cells,
		metadata: { kernelspec: { display_name: 'Julia', language: 'julia', name: 'julia' }, language_info: { name: 'julia' } },
		nbformat: 4,
		nbformat_minor: 4,
	}, undefined, 1);
}

/** A cell's source: its lines, each but the last ending in a newline. */
function source(text: string): string[] {
	const lines = text.replace(/^\n/, '').replace(/\n$/, '').split('\n');
	return lines.map((line, index) => index < lines.length - 1 ? `${line}\n` : line);
}

function markdown(text: string) {
	return { cell_type: 'markdown', metadata: {}, source: source(text) };
}

function code(text: string) {
	return { cell_type: 'code', execution_count: null, metadata: {}, outputs: [], source: source(text) };
}
