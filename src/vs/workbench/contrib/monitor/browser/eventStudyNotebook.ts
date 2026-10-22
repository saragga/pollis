/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

// The study.ipynb of an event study: Julia that runs PollisEventStudies.jl on the study's folder (study.toml,
// events.csv and prices/), which computes, for each period, the average and cumulative average abnormal returns a
// minute at a time with their cross-sectional t, the Boehmer, Musumeci and Poulsen (1991) test on standardized CARs,
// and abnormal volume, and writes them to results/. The page draws the same CAARs as the prices come in.

const PACKAGE_URL = 'https://github.com/Trumpingtons/PollisEventStudies.jl';
const REGISTRY_URL = 'https://github.com/Trumpingtons/PollisRegistry';

/** The notebook of the event study in `folder` (its path on disk), as the JSON of a Jupyter notebook in Julia. */
export function eventStudyNotebook(folder: string): string {
	const cells = [
		markdown(String.raw`
# Event Study

The filings an alert on SEC filings fired are the events. Pollis captures the minute prices of each filer's stock and of the benchmark around them, from Yahoo Finance, into this folder:

- **study.toml**: the benchmark, the model of normal returns, the event time and the periods, in minutes before and after it;
- **events.csv**: the filings, with the time EDGAR accepted each and the time of the company's newswire release, as Google News or PR Newswire's own feeds list it (UTC); the event's time (event_time): the earlier of the two, its first public time, or EDGAR's acceptance alone, as study.toml says; whether it came during the regular session and the next open after it;
- **prices/**: a file per filing, with the minute bars of the stock and of the benchmark;
- **news/**: a file per filing, with the articles Google News lists from a day before EDGAR accepted it to a day after.

[PollisEventStudies.jl](${PACKAGE_URL}) computes, for each period, the average abnormal return (AAR) and the cumulative average abnormal return (CAAR) a minute at a time with their cross-sectional t, from the event's time and, for an event outside the regular session, from the next open; and at the end of the period the CAR's t, the Boehmer, Musumeci and Poulsen (1991) test on standardized CARs, and abnormal volume. It writes them to **results/**. Events still capturing prices count up to the last complete minute: run all again as they come in.
`),
		code(String.raw`
${install('0.2.0')}

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

/**
 * The notebook of a study of FOMC releases in `folder`: Julia that runs PollisEventStudies.jl on it, which computes
 * each instrument's move over each period at each release, their mean with its cross-sectional t and the mean move a
 * minute at a time, and writes them to results/.
 */
export function fomcStudyNotebook(folder: string): string {
	const cells = [
		markdown(String.raw`
# FOMC Event Study

The FOMC's releases, from the Federal Reserve's Monetary Policy Press Releases feed, are the events. Pollis captures the bars of the study's instruments around them, from Yahoo Finance, into this folder:

- **study.toml**: the releases (statement, projections, minutes, other), the instruments and the periods, in minutes before and after the release;
- **events.csv**: the releases, with their time (UTC); the statement and the Summary of Economic Projections out at the same time are one event;
- **instruments.csv**: for each release, the Yahoo Finance symbol of each instrument (the contract months follow from the release's month), its unit, its scale and the minutes each bar spans (1, or 5 for a release older than 30 days);
- **prices/**: a file per release, with the bars of each symbol.

[PollisEventStudies.jl](${PACKAGE_URL}) computes each instrument's move from the start of the period to its end at each release, the mean move with its cross-sectional t, and the mean move a minute at a time, and writes them to **results/**. Moves are in basis points of the implied rate (100 less the price) for federal funds (FF1 to FF4) and SOFR futures (SR1, SFR1 to SFR5), of the yield for the 5- and 10-year yields (^FVX, ^TNX), and in per cent for prices (ZT, TIP, ^GSPC, ES). FF1 is scaled by D / (D - d), D the days of the month and d the release's day, as the contract settles on the month's average rate (Kuttner 2001); in the month's last week FF2 stands in for it, unscaled.
`),
		code(String.raw`
${install('0.3.0')}

const STUDY = isfile(joinpath(pwd(), "study.toml")) ? pwd() : raw"${folder}"
results = run_study(STUDY)
`),
		markdown(String.raw`
## Each release

The move of each instrument from the start of the first period to its end, a release a row. Each period's **summary** has the mean moves with their t, and its **paths** the mean move a minute at a time, by instrument.
`),
		code(String.raw`
results[1].moves
`),
		markdown(String.raw`
## Notes

- Yahoo Finance keeps minute bars for 30 days and five-minute bars for 60: the events are the releases of the 59 days before the study was made and those after, captured while Pollis was open.
- An expired futures contract is gone from Yahoo Finance: FF1 of an older release, whose month is over, has no prices.
- Yahoo Finance has no 2-year yield in minutes: ZT, the 2-year Treasury note future, stands for it, as a price (a rise in the price is a fall in the yield).
- Releases out of the regular session: the S&P 500 and TIPS do not trade then, the futures do.
`),
	];
	return JSON.stringify({
		cells,
		metadata: { kernelspec: { display_name: 'Julia', language: 'julia', name: 'julia' }, language_info: { name: 'julia' } },
		nbformat: 4,
		nbformat_minor: 4,
	}, undefined, 1);
}

/** Julia that loads PollisEventStudies.jl, adding it from the Pollis registry, and updating it when older than `minimum`. */
function install(minimum: string): string {
	return String.raw`import Pkg
# From the Pollis registry, added when it is not there, and updated when older than this study needs
if !any(registry -> registry.name == "PollisRegistry", Pkg.Registry.reachable_registries())
	Pkg.Registry.add(url = "${REGISTRY_URL}")
end
installed = [info.version for info in values(Pkg.dependencies()) if info.name == "PollisEventStudies"]
if isempty(installed)
	Pkg.add("PollisEventStudies")
elseif installed[1] < v"${minimum}"
	Pkg.Registry.update("PollisRegistry")
	Pkg.update("PollisEventStudies")
end
using PollisEventStudies`;
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
