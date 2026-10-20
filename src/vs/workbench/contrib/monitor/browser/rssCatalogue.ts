/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { localize } from '../../../../nls.js';

// The feeds Explore > Monitor > RSS Feeds offers, by topic. Every address was read on 19 October 2026. The topic
// names are stored in the user's settings, so they are not translated.

export const JULIA_TOPIC = 'Julia';
export const ARXIV_TOPIC = 'arXiv';
export const MEDICINE_TOPIC = 'Medicine and Biomedical Research';
const FINANCE_TOPIC = 'Financial News and Markets';
const FINANCE_RESEARCH_TOPIC = 'Finance Research';
const ECONOMICS_TOPIC = 'Economics and Central Banks';
const SCIENCE_TOPIC = 'General Science';
const STATISTICS_TOPIC = 'Statistics';
const AI_TOPIC = 'AI and Machine Learning';
const COMPUTER_SCIENCE_TOPIC = 'Computer Science';
const MATHEMATICS_TOPIC = 'Mathematics';
const PHYSICS_TOPIC = 'Physics';
const ASTRONOMY_TOPIC = 'Astronomy and Space';
const CHEMISTRY_TOPIC = 'Chemistry';
const BIOLOGY_TOPIC = 'Biology';
const ECOLOGY_TOPIC = 'Natural History and Ecology';
const EARTH_TOPIC = 'Earth and Climate';
const ENGINEERING_TOPIC = 'Engineering';
const LAW_TOPIC = 'Law';
const HISTORY_TOPIC = 'History';
const PHILOSOPHY_TOPIC = 'Philosophy';
const POLITICS_TOPIC = 'Politics';
const ANTHROPOLOGY_TOPIC = 'Anthropology';
const LITERATURE_TOPIC = 'Literature';
const LINGUISTICS_TOPIC = 'Linguistics';
const CLASSICS_TOPIC = 'Classics';
const RELIGION_TOPIC = 'Religion';
const ART_TOPIC = 'Art';
const MUSIC_TOPIC = 'Music';
const THEATRE_TOPIC = 'Theatre and Performing Arts';
const ARCHITECTURE_TOPIC = 'Architecture and Urbanism';
const AGRICULTURE_TOPIC = 'Agriculture and Food';
const VETERINARY_TOPIC = 'Veterinary Science';
const ZOOLOGY_TOPIC = 'Zoology';
const BOTANY_TOPIC = 'Botany and Plant Science';
export const VIDEO_TOPIC = 'Videos and Podcasts';
/**
 * The topics renamed or split, by their old names: their catalogue feeds are now under the catalogue's topics, and the
 * others under the new name; the catalogue's arXiv feeds, once under arXiv, are under their subjects.
 */
export const RENAMED_TOPICS: Readonly<Record<string, string>> = { 'Science': SCIENCE_TOPIC, 'Finance Journals': FINANCE_RESEARCH_TOPIC, 'Arts and Music': ART_TOPIC, 'Classics and Religion': RELIGION_TOPIC, 'Architecture': ARCHITECTURE_TOPIC };

/**
 * A feed of the catalogue: its name, its address and, when it matters, a note shown beside it.
 */
export interface IRssCatalogueFeed {
	readonly name: string;
	readonly url: string;
	readonly note?: string;
}

export interface IRssCatalogueTopic {
	readonly topic: string;
	readonly feeds: readonly IRssCatalogueFeed[];
}

// Searches are feeds too: arXiv answers a search with an Atom feed, PubMed with the ids of the articles found, read
// through NCBI's E-utilities.
const ARXIV_SEARCH = 'https://export.arxiv.org/api/query?';
export const PUBMED_SEARCH = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?';

/** The address of the arXiv search `query`, newest papers first. */
export function arxivSearchUrl(query: string): string {
	return `${ARXIV_SEARCH}search_query=${encodeURIComponent(query)}&sortBy=submittedDate&sortOrder=descending&max_results=50`;
}

/** The name of the arXiv search `query`. */
export function arxivSearchName(query: string): string {
	return `arXiv: ${query}`;
}

/** The name of the PubMed search `term`. */
export function pubmedSearchName(term: string): string {
	return `PubMed: ${term}`;
}

/** The address of the PubMed search `term`, the articles most recently added first. */
/** The feed of a YouTube channel's newest videos, from the channel's id (`UC` and 22 more characters). */
export function youtubeFeedUrl(channelId: string): string {
	return `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;
}

export function pubmedSearchUrl(term: string): string {
	return `${PUBMED_SEARCH}db=pubmed&retmode=json&retmax=50&term=${encodeURIComponent(term)}`;
}

const paywall = localize('rss.notePaywall', "Headlines; articles behind a paywall");
const busy = localize('rss.noteBusy', "Hundreds of papers a day");
const weekdays = localize('rss.noteWeekdays', "New papers on weekdays");
const preprints = localize('rss.notePreprints', "Preprints, not yet peer reviewed");
const youtube = localize('rss.noteYoutube', "YouTube channel");
const podcast = localize('rss.notePodcast', "Podcast");
const readersLinks = localize('rss.noteReadersLinks', "Links chosen by its readers");
const newEntries = localize('rss.noteNewEntries', "New and revised entries");

export const RSS_CATALOGUE: readonly IRssCatalogueTopic[] = [
	{
		topic: JULIA_TOPIC, feeds: [
			{ name: 'JuliaLang Blog', url: 'https://julialang.org/feed.xml' },
			{ name: 'Julia Discourse: Announcements', url: 'https://discourse.julialang.org/c/announce/25.rss' },
			{ name: 'Julia Discourse: Package Announcements', url: 'https://discourse.julialang.org/c/package-announcements/60.rss' },
			{ name: 'SciML Blog', url: 'https://sciml.ai/feed.xml' },
		]
	},
	{
		topic: STATISTICS_TOPIC, feeds: [
			{ name: 'Statistical Modeling, Causal Inference, and Social Science', url: 'https://statmodeling.stat.columbia.edu/feed/' },
			{ name: 'Journal of the American Statistical Association', url: 'https://www.tandfonline.com/feed/rss/uasa20' },
			{ name: 'Journal of the Royal Statistical Society: Series B', url: 'https://academic.oup.com/rss/site_6513/4147.xml' },
			{ name: 'Journal of Statistical Software', url: 'https://www.jstatsoft.org/gateway/plugin/WebFeedGatewayPlugin/rss2' },
			{ name: 'Statistics in Medicine', url: 'https://onlinelibrary.wiley.com/feed/10970258/most-recent' },
			{ name: 'Journal of the Royal Statistical Society: Series A', url: 'https://academic.oup.com/rss/site_6517/4149.xml' },
			{ name: 'Journal of the Royal Statistical Society: Series C', url: 'https://academic.oup.com/rss/site_6519/4150.xml' },
			{ name: 'Significance', url: 'https://academic.oup.com/rss/site_6521/4151.xml' },
			{ name: 'Biometrika', url: 'https://academic.oup.com/rss/site_5265/3131.xml' },
			{ name: 'Biostatistics', url: 'https://academic.oup.com/rss/site_5141/3003.xml' },
			{ name: 'Journal of Survey Statistics and Methodology', url: 'https://academic.oup.com/rss/site_5481/3342.xml' },
			{ name: 'arXiv: Statistics', url: 'https://rss.arxiv.org/rss/stat', note: weekdays },
			{ name: 'arXiv: Statistics, Methodology', url: 'https://rss.arxiv.org/rss/stat.ME', note: weekdays },
			{ name: 'arXiv: Statistics, Machine Learning', url: 'https://rss.arxiv.org/rss/stat.ML', note: weekdays },
			{ name: 'arXiv: Statistics, Computation', url: 'https://rss.arxiv.org/rss/stat.CO', note: weekdays },
			{ name: 'arXiv: Statistics, Applications', url: 'https://rss.arxiv.org/rss/stat.AP', note: weekdays },
			{ name: 'arXiv: Statistics Theory', url: 'https://rss.arxiv.org/rss/math.ST', note: weekdays },
		]
	},
	{
		topic: FINANCE_TOPIC, feeds: [
			{ name: 'Financial Times', url: 'https://www.ft.com/rss/home', note: paywall },
			{ name: 'Financial Times: Markets', url: 'https://www.ft.com/markets?format=rss', note: paywall },
			{ name: 'The Economist: Finance and Economics', url: 'https://www.economist.com/finance-and-economics/rss.xml', note: paywall },
			{ name: 'The Economist: The World This Week', url: 'https://www.economist.com/the-world-this-week/rss.xml', note: paywall },
			{ name: 'Wall Street Journal: Markets', url: 'https://feeds.content.dowjones.io/public/rss/RSSMarketsMain', note: paywall },
			{ name: 'Wall Street Journal: World News', url: 'https://feeds.content.dowjones.io/public/rss/RSSWorldNews', note: paywall },
			{ name: 'Bloomberg', url: 'https://feeds.bloomberg.com/news.rss', note: paywall },
			{ name: 'Bloomberg: Markets', url: 'https://feeds.bloomberg.com/markets/news.rss', note: paywall },
			{ name: 'Bloomberg: Economics', url: 'https://feeds.bloomberg.com/economics/news.rss', note: paywall },
			{ name: 'CNBC: Top News', url: 'https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=100003114' },
			{ name: 'CNBC: Finance', url: 'https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=10000664' },
			{ name: 'Seeking Alpha: Market News', url: 'https://seekingalpha.com/market_currents.xml' },
		]
	},
	{
		topic: FINANCE_RESEARCH_TOPIC, feeds: [
			{ name: 'The Journal of Finance', url: 'https://onlinelibrary.wiley.com/rss/journal/10.1111/(ISSN)1540-6261' },
			{ name: 'Journal of Financial Economics', url: 'https://rss.sciencedirect.com/publication/science/0304405X' },
			{ name: 'The Review of Financial Studies', url: 'https://academic.oup.com/rss/site_5511/3372.xml' },
			{ name: 'Review of Finance', url: 'https://academic.oup.com/rss/site_5510/3371.xml' },
			{ name: 'The Review of Asset Pricing Studies', url: 'https://academic.oup.com/rss/site_5506/3367.xml' },
			{ name: 'The Review of Corporate Finance Studies', url: 'https://academic.oup.com/rss/site_5507/3368.xml' },
			{ name: 'Journal of Financial Econometrics', url: 'https://academic.oup.com/rss/site_5193/3058.xml' },
			{ name: 'arXiv: Quantitative Finance', url: 'https://rss.arxiv.org/rss/q-fin', note: weekdays },
			{ name: 'arXiv: Quantitative Finance, Statistical Finance', url: 'https://rss.arxiv.org/rss/q-fin.ST', note: weekdays },
		]
	},
	{
		topic: ECONOMICS_TOPIC, feeds: [
			{ name: 'Federal Reserve: Press Releases', url: 'https://www.federalreserve.gov/feeds/press_all.xml' },
			{ name: 'Federal Reserve Bank of New York: Liberty Street Economics', url: 'https://libertystreeteconomics.newyorkfed.org/feed/' },
			{ name: 'European Central Bank: Press Releases', url: 'https://www.ecb.europa.eu/rss/press.html' },
			{ name: 'European Central Bank: Blog', url: 'https://www.ecb.europa.eu/rss/blog.html' },
			{ name: 'Bank of England: News', url: 'https://www.bankofengland.co.uk/rss/news' },
			{ name: 'Bank for International Settlements: Press Releases', url: 'https://www.bis.org/doclist/all_pressrels.rss' },
			{ name: 'NBER: New Working Papers', url: 'https://www.nber.org/rss/new.xml' },
			{ name: 'The Quarterly Journal of Economics', url: 'https://academic.oup.com/rss/site_5504/3365.xml' },
			{ name: 'The Review of Economic Studies', url: 'https://academic.oup.com/rss/site_5508/3369.xml' },
			{ name: 'Journal of the European Economic Association', url: 'https://academic.oup.com/rss/site_5571/3427.xml' },
			{ name: 'The Economic Journal', url: 'https://academic.oup.com/rss/site_6182/4014.xml' },
			{ name: 'The World Bank Economic Review', url: 'https://academic.oup.com/rss/site_5522/3383.xml' },
			{ name: 'arXiv: Economics', url: 'https://rss.arxiv.org/rss/econ', note: weekdays },
			{ name: 'arXiv: Econometrics', url: 'https://rss.arxiv.org/rss/econ.EM', note: weekdays },
		]
	},
	{
		topic: SCIENCE_TOPIC, feeds: [
			{ name: 'Nature', url: 'https://www.nature.com/nature.rss' },
			{ name: 'Science', url: 'https://www.science.org/action/showFeed?type=etoc&feed=rss&jc=science' },
			{ name: 'PNAS', url: 'https://www.pnas.org/action/showFeed?type=etoc&feed=rss&jc=pnas' },
			{ name: 'Science News', url: 'https://www.sciencenews.org/feed' },
			{ name: 'Scientific American', url: 'http://rss.sciam.com/ScientificAmerican-Global' },
			{ name: 'Quanta Magazine', url: 'https://www.quantamagazine.org/feed/' },
			{ name: 'Science Advances', url: 'https://www.science.org/action/showFeed?type=etoc&feed=rss&jc=sciadv' },
		]
	},
	{
		topic: AI_TOPIC, feeds: [
			{ name: 'Journal of Machine Learning Research', url: 'https://www.jmlr.org/jmlr.xml' },
			{ name: 'Google DeepMind', url: 'https://deepmind.google/blog/rss.xml' },
			{ name: 'Google Research', url: 'https://research.google/blog/rss/' },
			{ name: 'OpenAI', url: 'https://openai.com/news/rss.xml' },
			{ name: 'Hugging Face Blog', url: 'https://huggingface.co/blog/feed.xml' },
			{ name: 'Berkeley Artificial Intelligence Research', url: 'https://bair.berkeley.edu/blog/feed.xml' },
			{ name: 'arXiv: Machine Learning', url: 'https://rss.arxiv.org/rss/cs.LG', note: busy },
			{ name: 'arXiv: Artificial Intelligence', url: 'https://rss.arxiv.org/rss/cs.AI', note: busy },
			{ name: 'arXiv: Computation and Language', url: 'https://rss.arxiv.org/rss/cs.CL', note: busy },
		]
	},
	{
		topic: MEDICINE_TOPIC, feeds: [
			{ name: 'New England Journal of Medicine', url: 'https://www.nejm.org/action/showFeed?jc=nejm&type=etoc&feed=rss' },
			{ name: 'The Lancet', url: 'https://www.thelancet.com/rssfeed/lancet_current.xml' },
			{ name: 'JAMA', url: 'https://jamanetwork.com/rss/site_3/67.xml' },
			{ name: 'Nature Medicine', url: 'https://www.nature.com/nm.rss' },
			{ name: 'Cell', url: 'https://www.cell.com/cell/current.rss' },
			{ name: 'The BMJ', url: 'https://www.bmj.com/rss/recent.xml' },
			{ name: 'PLOS Medicine', url: 'https://journals.plos.org/plosmedicine/feed/atom' },
			{ name: 'medRxiv', url: 'https://connect.medrxiv.org/medrxiv_xml.php?subject=all', note: preprints },
			{ name: 'bioRxiv', url: 'https://connect.biorxiv.org/biorxiv_xml.php?subject=all', note: preprints },
			{ name: 'Brain', url: 'https://academic.oup.com/rss/site_5367/3228.xml' },
			{ name: 'European Heart Journal', url: 'https://academic.oup.com/rss/site_5375/3236.xml' },
			{ name: 'Journal of the American Medical Informatics Association', url: 'https://academic.oup.com/rss/site_5396/3257.xml' },
			{ name: 'European Journal of Public Health', url: 'https://academic.oup.com/rss/site_5381/3242.xml' },
		]
	},
	{
		topic: COMPUTER_SCIENCE_TOPIC, feeds: [
			{ name: 'Journal of the ACM', url: 'https://dl.acm.org/action/showFeed?type=etoc&feed=rss&jc=jacm' },
			{ name: 'ACM Computing Surveys', url: 'https://dl.acm.org/action/showFeed?type=etoc&feed=rss&jc=csur' },
			{ name: 'IEEE Spectrum: Computing', url: 'https://spectrum.ieee.org/feeds/topic/computing.rss' },
			{ name: 'MIT News: Computer Science and Technology', url: 'https://news.mit.edu/rss/topic/computers' },
			{ name: 'Quanta Magazine: Computer Science', url: 'https://www.quantamagazine.org/computer-science/feed/' },
			{ name: 'Hacker News', url: 'https://hnrss.org/frontpage', note: readersLinks },
			{ name: 'Lobsters', url: 'https://lobste.rs/rss', note: readersLinks },
			{ name: 'Bioinformatics', url: 'https://academic.oup.com/rss/site_5139/3001.xml' },
			{ name: 'Briefings in Bioinformatics', url: 'https://academic.oup.com/rss/site_5143/3005.xml' },
			{ name: 'Journal of Cybersecurity', url: 'https://academic.oup.com/rss/site_5188/3053.xml' },
			{ name: 'The Computer Journal', url: 'https://academic.oup.com/rss/site_5271/3137.xml' },
			{ name: 'arXiv: Computer Science', url: 'https://rss.arxiv.org/rss/cs', note: busy },
		]
	},
	{
		topic: MATHEMATICS_TOPIC, feeds: [
			{ name: 'SIAM Review', url: 'https://epubs.siam.org/action/showFeed?type=etoc&feed=rss&jc=sirev' },
			{ name: 'Quanta Magazine: Mathematics', url: 'https://www.quantamagazine.org/mathematics/feed/' },
			{ name: 'Terence Tao: What\'s New', url: 'https://terrytao.wordpress.com/feed/' },
			{ name: 'AMS Feature Column', url: 'https://blogs.ams.org/featurecolumn/feed/' },
			{ name: 'Proceedings of the London Mathematical Society', url: 'https://academic.oup.com/rss/site_5501/3362.xml' },
			{ name: 'International Mathematics Research Notices', url: 'https://academic.oup.com/rss/site_5177/3041.xml' },
			{ name: 'arXiv: Optimization and Control', url: 'https://rss.arxiv.org/rss/math.OC', note: weekdays },
			{ name: 'arXiv: Mathematics', url: 'https://rss.arxiv.org/rss/math', note: busy },
			{ name: 'arXiv: Probability', url: 'https://rss.arxiv.org/rss/math.PR', note: weekdays },
			{ name: 'arXiv: Numerical Analysis', url: 'https://rss.arxiv.org/rss/math.NA', note: weekdays },
		]
	},
	{
		topic: PHYSICS_TOPIC, feeds: [
			{ name: 'Physical Review Letters', url: 'https://feeds.aps.org/rss/recent/prl.xml' },
			{ name: 'Nature Physics', url: 'https://www.nature.com/nphys.rss' },
			{ name: 'APS Physics', url: 'https://feeds.aps.org/rss/recent/physics.xml' },
			{ name: 'Physics World', url: 'https://physicsworld.com/feed/' },
			{ name: 'Quanta Magazine: Physics', url: 'https://www.quantamagazine.org/physics/feed/' },
			{ name: 'arXiv: Physics', url: 'https://rss.arxiv.org/rss/physics', note: busy },
			{ name: 'arXiv: Quantum Physics', url: 'https://rss.arxiv.org/rss/quant-ph', note: busy },
		]
	},
	{
		topic: ASTRONOMY_TOPIC, feeds: [
			{ name: 'Nature Astronomy', url: 'https://www.nature.com/natastron.rss' },
			{ name: 'NASA: News Releases', url: 'https://www.nasa.gov/news-release/feed/' },
			{ name: 'ESA: Space Science', url: 'https://www.esa.int/rssfeed/Our_Activities/Space_Science' },
			{ name: 'Universe Today', url: 'https://www.universetoday.com/feed/' },
			{ name: 'arXiv: Astrophysics', url: 'https://rss.arxiv.org/rss/astro-ph', note: busy },
		]
	},
	{
		topic: CHEMISTRY_TOPIC, feeds: [
			{ name: 'Nature Chemistry', url: 'https://www.nature.com/nchem.rss' },
			{ name: 'Nature Chemical Biology', url: 'https://www.nature.com/nchembio.rss' },
			{ name: 'Angewandte Chemie International Edition', url: 'https://onlinelibrary.wiley.com/feed/15213773/most-recent' },
			{ name: 'Chemical Science', url: 'http://feeds.rsc.org/rss/sc' },
			{ name: 'Chemical & Engineering News', url: 'https://cen.acs.org/feeds/rss/latestnews.xml' },
		]
	},
	{
		topic: BIOLOGY_TOPIC, feeds: [
			{ name: 'Current Biology', url: 'https://www.cell.com/current-biology/current.rss' },
			{ name: 'PLOS Biology', url: 'https://journals.plos.org/plosbiology/feed/atom' },
			{ name: 'eLife', url: 'https://elifesciences.org/rss/recent.xml' },
			{ name: 'Nature Genetics', url: 'https://www.nature.com/ng.rss' },
			{ name: 'Quanta Magazine: Biology', url: 'https://www.quantamagazine.org/biology/feed/' },
			{ name: 'arXiv: Quantitative Biology', url: 'https://rss.arxiv.org/rss/q-bio', note: weekdays },
		]
	},
	{
		topic: ECOLOGY_TOPIC, feeds: [
			{ name: 'Nature Ecology & Evolution', url: 'https://www.nature.com/natecolevol.rss' },
			{ name: 'Ecology Letters', url: 'https://onlinelibrary.wiley.com/feed/14610248/most-recent' },
			{ name: 'Trends in Ecology & Evolution', url: 'https://www.cell.com/trends/ecology-evolution/current.rss' },
			{ name: 'Methods in Ecology and Evolution', url: 'https://besjournals.onlinelibrary.wiley.com/feed/2041210x/most-recent' },
			{ name: 'Journal of Animal Ecology', url: 'https://besjournals.onlinelibrary.wiley.com/feed/13652656/most-recent' },
			{ name: 'Smithsonian Magazine: Science and Nature', url: 'https://www.smithsonianmag.com/rss/science-nature/' },
			{ name: 'Mongabay: Conservation News', url: 'https://news.mongabay.com/feed/' },
		]
	},
	{
		topic: EARTH_TOPIC, feeds: [
			{ name: 'Nature Climate Change', url: 'https://www.nature.com/nclimate.rss' },
			{ name: 'Nature Geoscience', url: 'https://www.nature.com/ngeo.rss' },
			{ name: 'NASA Earth Observatory', url: 'https://earthobservatory.nasa.gov/feeds/earth-observatory.rss' },
			{ name: 'Carbon Brief', url: 'https://www.carbonbrief.org/feed/' },
		]
	},
	{
		topic: ENGINEERING_TOPIC, feeds: [
			{ name: 'IEEE Spectrum', url: 'https://spectrum.ieee.org/feeds/feed.rss' },
			{ name: 'Nature Electronics', url: 'https://www.nature.com/natelectron.rss' },
			{ name: 'Nature Energy', url: 'https://www.nature.com/nenergy.rss' },
			{ name: 'Nature Materials', url: 'https://www.nature.com/nmat.rss' },
			{ name: 'MIT News: School of Engineering', url: 'https://news.mit.edu/rss/school/engineering' },
			{ name: 'arXiv: Electrical Engineering and Systems Science', url: 'https://rss.arxiv.org/rss/eess', note: busy },
		]
	},
	{
		topic: LAW_TOPIC, feeds: [
			{ name: 'Harvard Law Review', url: 'https://harvardlawreview.org/feed/' },
			{ name: 'SCOTUSblog', url: 'https://www.scotusblog.com/feed/' },
			{ name: 'Lawfare', url: 'https://www.lawfaremedia.org/feeds/articles' },
			{ name: 'Just Security', url: 'https://www.justsecurity.org/feed/' },
			{ name: 'EJIL: Talk!', url: 'https://www.ejiltalk.org/feed/' },
			{ name: 'Opinio Juris', url: 'https://opiniojuris.org/feed/' },
			{ name: 'Verfassungsblog', url: 'https://verfassungsblog.de/feed/' },
			{ name: 'European Law Blog', url: 'https://europeanlawblog.eu/feed/' },
			{ name: 'Jotwell', url: 'https://jotwell.com/feed/' },
			{ name: 'The Volokh Conspiracy', url: 'https://reason.com/volokh/feed/' },
			{ name: 'Balkinization', url: 'https://balkin.blogspot.com/feeds/posts/default' },
			{ name: 'UN News: Law and Crime Prevention', url: 'https://news.un.org/feed/subscribe/en/news/topic/law-and-crime-prevention/feed/rss.xml' },
			{ name: 'Oxford Journal of Legal Studies', url: 'https://academic.oup.com/rss/site_5495/3356.xml' },
			{ name: 'European Journal of International Law', url: 'https://academic.oup.com/rss/site_5452/3313.xml' },
			{ name: 'International Journal of Constitutional Law', url: 'https://academic.oup.com/rss/site_5170/3034.xml' },
			{ name: 'Journal of International Economic Law', url: 'https://academic.oup.com/rss/site_5203/3068.xml' },
			{ name: 'Journal of Legal Analysis', url: 'https://academic.oup.com/rss/site_5476/3337.xml' },
			{ name: 'Current Legal Problems', url: 'https://academic.oup.com/rss/site_5446/3307.xml' },
		]
	},
	{
		topic: HISTORY_TOPIC, feeds: [
			{ name: 'The Economic History Review', url: 'https://onlinelibrary.wiley.com/feed/14680289/most-recent' },
			{ name: 'Explorations in Economic History', url: 'https://rss.sciencedirect.com/publication/science/00144983' },
			{ name: 'History Workshop', url: 'https://www.historyworkshop.org.uk/feed/' },
			{ name: 'JSTOR Daily', url: 'https://daily.jstor.org/feed/' },
			{ name: 'Smithsonian Magazine: History', url: 'https://www.smithsonianmag.com/rss/history/' },
			{ name: 'The Public Domain Review', url: 'https://publicdomainreview.org/rss.xml' },
			{ name: 'The American Historical Review', url: 'https://academic.oup.com/rss/site_5423/3284.xml' },
			{ name: 'Past & Present', url: 'https://academic.oup.com/rss/site_5497/3358.xml' },
			{ name: 'The English Historical Review', url: 'https://academic.oup.com/rss/site_5158/3021.xml' },
			{ name: 'Journal of American History', url: 'https://academic.oup.com/rss/site_5470/3331.xml' },
			{ name: 'European Review of Economic History', url: 'https://academic.oup.com/rss/site_5454/3315.xml' },
			{ name: 'Social History of Medicine', url: 'https://academic.oup.com/rss/site_5514/3375.xml' },
			{ name: 'The Historical Journal', url: 'https://www.cambridge.org/core/rss/product/id/15E98E1D30D09470213F11031D82A83C' },
			{ name: 'Comparative Studies in Society and History', url: 'https://www.cambridge.org/core/rss/product/id/3D5C40349E588565CAD30F5A7E08F68F' },
			{ name: 'The Journal of Economic History', url: 'https://www.cambridge.org/core/rss/product/id/677F550CB2C69EFA1656654D487DE504' },
			{ name: 'Journal of British Studies', url: 'https://www.cambridge.org/core/rss/product/id/3D82EE9C20F7A6ED0160891A67C2AF81' },
			{ name: 'The Journal of African History', url: 'https://www.cambridge.org/core/rss/product/id/5801BD5DA5F1DCCF8BFA7EC236F12F2D' },
			{ name: 'Modern Asian Studies', url: 'https://www.cambridge.org/core/rss/product/id/457172B1126D4C98B0412AA440066031' },
			{ name: 'Transactions of the Royal Historical Society', url: 'https://www.cambridge.org/core/rss/product/id/50500A81A9EA4B7739B58DFE5EE5D9C3' },
			{ name: 'Journal of Global History', url: 'https://www.cambridge.org/core/rss/product/id/362152E06A55E569CD672CA58FB5425E' },
			{ name: 'Journal of the History of Economic Thought', url: 'https://www.cambridge.org/core/rss/product/id/DE90B213159AC189FBBDD434E081B982' },
			{ name: 'Business History Review', url: 'https://www.cambridge.org/core/rss/product/id/C269FC4EBCA2E8C47A2057D9E8E9B812' },
			{ name: 'Enterprise & Society', url: 'https://www.cambridge.org/core/rss/product/id/64B21495494897A8DE797BBCA86847B0' },
			{ name: 'Contemporary European History', url: 'https://www.cambridge.org/core/rss/product/id/326C5884CAC8B1DC6A1B2D5A33FAFDD1' },
			{ name: 'Central European History', url: 'https://www.cambridge.org/core/rss/product/id/C5DBF3E8CD35888A0EDB091529CC9F8A' },
			{ name: 'Journal of Latin American Studies', url: 'https://www.cambridge.org/core/rss/product/id/2CC8E5C88C78522D8CF432A0B6005E54' },
			{ name: 'International Review of Social History', url: 'https://www.cambridge.org/core/rss/product/id/7FF66016B2018F886FFFFA224E60F12D' },
			{ name: 'Slavic Review', url: 'https://www.cambridge.org/core/rss/product/id/BE028C241144CA93B60D30FFBA435841' },
			{ name: 'Medical History', url: 'https://www.cambridge.org/core/rss/product/id/8322CA11A4C5E4B9703574A29A031420' },
			{ name: 'The British Journal for the History of Science', url: 'https://www.cambridge.org/core/rss/product/id/D65F60FBCAC74E99C40887D449137348' },
			{ name: 'Financial History Review', url: 'https://www.cambridge.org/core/rss/product/id/DCA684C4B9E2558C24A8FEFC37C23755' },
			{ name: 'Continuity and Change', url: 'https://www.cambridge.org/core/rss/product/id/23FE8BE8E8BA4803A52A9FB68C708261' },
			{ name: 'Journal of Policy History', url: 'https://www.cambridge.org/core/rss/product/id/57FF635D60998D01F96654544EA8F661' },
			{ name: 'Modern Intellectual History', url: 'https://www.cambridge.org/core/rss/product/id/DA0FCF6112B9EEFD7F49917529181198' },
			{ name: 'Urban History', url: 'https://www.cambridge.org/core/rss/product/id/923A3D28AA1075F462BC003C543FC57D' },
			{ name: 'Speculum', url: 'https://www.journals.uchicago.edu/action/showFeed?type=etoc&feed=rss&jc=spc' },
			{ name: 'Journal of Medieval History', url: 'https://www.tandfonline.com/feed/rss/rmed20' },
			{ name: 'Early Medieval Europe', url: 'https://onlinelibrary.wiley.com/feed/14680254/most-recent' },
			{ name: 'Renaissance Quarterly', url: 'https://www.journals.uchicago.edu/action/showFeed?type=etoc&feed=rss&jc=rq' },
			{ name: 'Renaissance Studies', url: 'https://onlinelibrary.wiley.com/feed/14774658/most-recent' },
			{ name: 'The Sixteenth Century Journal', url: 'https://www.journals.uchicago.edu/action/showFeed?type=etoc&feed=rss&jc=scj' },
			{ name: 'Renaissance and Reformation', url: 'https://jps.library.utoronto.ca/index.php/renref/gateway/plugin/WebFeedGatewayPlugin/rss2' },
		]
	},
	{
		topic: PHILOSOPHY_TOPIC, feeds: [
			{ name: 'Stanford Encyclopedia of Philosophy', url: 'https://plato.stanford.edu/rss/sep.xml', note: newEntries },
			{ name: 'Philosophy & Public Affairs', url: 'https://onlinelibrary.wiley.com/feed/10884963/most-recent' },
			{ name: 'Daily Nous', url: 'https://dailynous.com/feed/' },
			{ name: 'Aeon', url: 'https://aeon.co/feed.rss' },
			{ name: 'Mind', url: 'https://academic.oup.com/rss/site_5489/3350.xml' },
			{ name: 'The Philosophical Quarterly', url: 'https://academic.oup.com/rss/site_5498/3359.xml' },
			{ name: 'Analysis', url: 'https://academic.oup.com/rss/site_5428/3289.xml' },
			{ name: 'The British Journal for the Philosophy of Science', url: 'https://academic.oup.com/rss/site_5434/3295.xml' },
			{ name: 'Proceedings of the Aristotelian Society', url: 'https://academic.oup.com/rss/site_5500/3361.xml' },
			{ name: 'Philosophy', url: 'https://www.cambridge.org/core/rss/product/id/3EA385852862D405D2421320F738E6C6' },
			{ name: 'Canadian Journal of Philosophy', url: 'https://www.cambridge.org/core/rss/product/id/F8B3B46B1A237A95DD4EFCBB206904F7' },
			{ name: 'Journal of the American Philosophical Association', url: 'https://www.cambridge.org/core/rss/product/id/2ED07D9487008A8D938A1B0F11FD052B' },
			{ name: 'Episteme', url: 'https://www.cambridge.org/core/rss/product/id/71889765CB94C81977C512106F267CD1' },
			{ name: 'Economics & Philosophy', url: 'https://www.cambridge.org/core/rss/product/id/B5D4296480440438DA66419338B16C88' },
			{ name: 'Utilitas', url: 'https://www.cambridge.org/core/rss/product/id/E877D32E5504714AD4B5250AFFDAA42C' },
			{ name: 'Kantian Review', url: 'https://www.cambridge.org/core/rss/product/id/D3E55E88C6269FFD657D4E68B193ADAB' },
			{ name: 'Hegel Bulletin', url: 'https://www.cambridge.org/core/rss/product/id/6B7E5895BA3B771738D118BC437247EE' },
			{ name: 'Philosophy of Science', url: 'https://www.cambridge.org/core/rss/product/id/3FA3E42C808A271752EDD8713E8FC268' },
			{ name: 'Hypatia', url: 'https://www.cambridge.org/core/rss/product/id/F3D70AB528A9726BC052F1AEB771A611' },
			{ name: 'The Review of Symbolic Logic', url: 'https://www.cambridge.org/core/rss/product/id/6105F288191A4492745CEC41BAFD283A' },
			{ name: 'The Journal of Symbolic Logic', url: 'https://www.cambridge.org/core/rss/product/id/56ED3BA46977662562A26BC04DD604FD' },
			{ name: 'Bulletin of Symbolic Logic', url: 'https://www.cambridge.org/core/rss/product/id/F7268973893D3981F1B17A2E10347229' },
			{ name: 'Social Philosophy and Policy', url: 'https://www.cambridge.org/core/rss/product/id/009D0E6E344F5D44FF9E2D43B955E1F4' },
			{ name: 'Legal Theory', url: 'https://www.cambridge.org/core/rss/product/id/18A6812B8458E126051E21F835520816' },
		]
	},
	{
		topic: POLITICS_TOPIC, feeds: [
			{ name: 'International Studies Quarterly', url: 'https://academic.oup.com/rss/site_5394/3255.xml' },
			{ name: 'Public Opinion Quarterly', url: 'https://academic.oup.com/rss/site_5502/3363.xml' },
			{ name: 'Political Analysis', url: 'https://www.cambridge.org/core/rss/product/id/EEF1D4438BAB8498B2A647F9DBC47AA7' },
			{ name: 'Political Science Quarterly', url: 'https://academic.oup.com/rss/site_6505/4143.xml' },
			{ name: 'American Political Science Review', url: 'https://www.cambridge.org/core/rss/product/id/833A7242AC7B607BA7F6168DA072DB3B' },
			{ name: 'British Journal of Political Science', url: 'https://www.cambridge.org/core/rss/product/id/FD38AC39CC0E8A315361CDF266B85A14' },
			{ name: 'Perspectives on Politics', url: 'https://www.cambridge.org/core/rss/product/id/34496D0437DEA81D55F7EC7F2AC35018' },
			{ name: 'International Organization', url: 'https://www.cambridge.org/core/rss/product/id/146C8B1E6606CE283EBC5B10B255F4C0' },
			{ name: 'World Politics', url: 'https://www.cambridge.org/core/rss/product/id/A44674D47342D5A8F85F9FF5A0AFDC43' },
			{ name: 'PS: Political Science & Politics', url: 'https://www.cambridge.org/core/rss/product/id/DACDE76A4E1D287359185FE191ACDEDC' },
			{ name: 'Government and Opposition', url: 'https://www.cambridge.org/core/rss/product/id/39EFCD4861CFEA75065FEEDD9AF22D26' },
			{ name: 'Review of International Studies', url: 'https://www.cambridge.org/core/rss/product/id/3B772FE5B36675FAF450722547F58DF7' },
			{ name: 'Political Science Research and Methods', url: 'https://www.cambridge.org/core/rss/product/id/1D739B93871EC423716B286A38E9BD5F' },
			{ name: 'Journal of Experimental Political Science', url: 'https://www.cambridge.org/core/rss/product/id/21823F867AA0CEB8F70A06EEE0E35B09' },
			{ name: 'International Theory', url: 'https://www.cambridge.org/core/rss/product/id/23CCDF908E7F2FED152050B2C7BDFE71' },
			{ name: 'Journal of Public Policy', url: 'https://www.cambridge.org/core/rss/product/id/36840434E1E3E412FFAA6832AA9488AA' },
			{ name: 'The Review of Politics', url: 'https://www.cambridge.org/core/rss/product/id/F2DB6A376929AFCA5BBE69781E206892' },
			{ name: 'Politics & Gender', url: 'https://www.cambridge.org/core/rss/product/id/7DE2C645F007C3B59362A873FC051EC3' },
			{ name: 'Ethics & International Affairs', url: 'https://www.cambridge.org/core/rss/product/id/C897DA23C0F3FC24F9B5B6471FF71C56' },
		]
	},
	{
		topic: ANTHROPOLOGY_TOPIC, feeds: [
			{ name: 'American Anthropologist', url: 'https://anthrosource.onlinelibrary.wiley.com/feed/15481433/most-recent' },
			{ name: 'American Ethnologist', url: 'https://anthrosource.onlinelibrary.wiley.com/feed/15481425/most-recent' },
			{ name: 'Journal of the Royal Anthropological Institute', url: 'https://rai.onlinelibrary.wiley.com/feed/14679655/most-recent' },
			{ name: 'Anthropology Today', url: 'https://rai.onlinelibrary.wiley.com/feed/14678322/most-recent' },
			{ name: 'Medical Anthropology Quarterly', url: 'https://anthrosource.onlinelibrary.wiley.com/feed/15481387/most-recent' },
			{ name: 'American Journal of Biological Anthropology', url: 'https://onlinelibrary.wiley.com/feed/26927691/most-recent' },
			{ name: 'Current Anthropology', url: 'https://www.journals.uchicago.edu/action/showFeed?type=etoc&feed=rss&jc=ca' },
			{ name: 'HAU: Journal of Ethnographic Theory', url: 'https://www.journals.uchicago.edu/action/showFeed?type=etoc&feed=rss&jc=hau' },
			{ name: 'Africa', url: 'https://www.cambridge.org/core/rss/product/id/E25CAC1112BFD1A7778A0C279A4B8520' },
			{ name: 'Evolutionary Human Sciences', url: 'https://www.cambridge.org/core/rss/product/id/F9A99C4602D4F4A5277A9D3A04AE7353' },
			{ name: 'Ethnos', url: 'https://www.tandfonline.com/feed/rss/retn20' },
			{ name: 'Critique of Anthropology', url: 'https://journals.sagepub.com/action/showFeed?ui=0&mi=ehikzz&ai=2b4&jc=coaa&type=etoc&feed=rss' },
		]
	},
	{
		topic: LITERATURE_TOPIC, feeds: [
			{ name: 'American Literary History', url: 'https://academic.oup.com/rss/site_5134/2995.xml' },
			{ name: 'Essays in Criticism', url: 'https://academic.oup.com/rss/site_5159/3022.xml' },
			{ name: 'English: Journal of the English Association', url: 'https://academic.oup.com/rss/site_5449/3310.xml' },
			{ name: 'French Studies', url: 'https://academic.oup.com/rss/site_5458/3319.xml' },
			{ name: 'Contemporary Women\'s Writing', url: 'https://academic.oup.com/rss/site_5153/3016.xml' },
			{ name: 'The Cambridge Quarterly', url: 'https://academic.oup.com/rss/site_5439/3300.xml' },
			{ name: 'The Review of English Studies', url: 'https://academic.oup.com/rss/site_5239/3107.xml' },
			{ name: 'Notes and Queries', url: 'https://academic.oup.com/rss/site_5224/3090.xml' },
			{ name: 'PMLA', url: 'https://www.cambridge.org/core/rss/product/id/07F2113A6102086C3A7ACB66527ACE68' },
			{ name: 'Victorian Literature and Culture', url: 'https://www.cambridge.org/core/rss/product/id/97B87C895706550CBFD1375745C3042E' },
			{ name: 'Journal of American Studies', url: 'https://www.cambridge.org/core/rss/product/id/6809E89819E4BB6F6C96CB367CB84811' },
			{ name: 'Adaptation', url: 'https://academic.oup.com/rss/site_5133/2994.xml' },
			{ name: 'English Literary Renaissance', url: 'https://www.journals.uchicago.edu/action/showFeed?type=etoc&feed=rss&jc=elr' },
		]
	},
	{
		topic: LINGUISTICS_TOPIC, feeds: [
			{ name: 'Applied Linguistics', url: 'https://academic.oup.com/rss/site_5135/2996.xml' },
			{ name: 'International Journal of Lexicography', url: 'https://academic.oup.com/rss/site_5173/3037.xml' },
			{ name: 'ELT Journal', url: 'https://academic.oup.com/rss/site_5157/3020.xml' },
		]
	},
	{
		topic: CLASSICS_TOPIC, feeds: [
			{ name: 'The Classical Quarterly', url: 'https://www.cambridge.org/core/rss/product/id/98B56E98F6176CC085C2D10BEF5DA258' },
			{ name: 'The Journal of Roman Studies', url: 'https://www.cambridge.org/core/rss/product/id/BA980D59E9AEBA8C479580B6318BE61E' },
			{ name: 'The Journal of Hellenic Studies', url: 'https://www.cambridge.org/core/rss/product/id/418FBC31C3986A237F081A8F7FBD9E8E' },
			{ name: 'Greece & Rome', url: 'https://www.cambridge.org/core/rss/product/id/CB0C36C82F3B53F734AB9A46755F0144' },
			{ name: 'Bryn Mawr Classical Review', url: 'https://bmcr.brynmawr.edu/feed/' },
			{ name: 'Classical Receptions Journal', url: 'https://academic.oup.com/rss/site_5152/3015.xml' },
			{ name: 'Society for Classical Studies', url: 'https://classicalstudies.org/rss.xml' },
			{ name: 'Antigone', url: 'https://antigonejournal.com/feed/' },
		]
	},
	{
		topic: RELIGION_TOPIC, feeds: [
			{ name: 'Journal of the American Academy of Religion', url: 'https://academic.oup.com/rss/site_5469/3330.xml' },
			{ name: 'The Journal of Theological Studies', url: 'https://academic.oup.com/rss/site_5215/3081.xml' },
			{ name: 'Journal of Islamic Studies', url: 'https://academic.oup.com/rss/site_5474/3335.xml' },
			{ name: 'Modern Judaism', url: 'https://academic.oup.com/rss/site_5490/3351.xml' },
			{ name: 'Sociology of Religion', url: 'https://academic.oup.com/rss/site_5518/3379.xml' },
			{ name: 'Journal of Church and State', url: 'https://academic.oup.com/rss/site_5471/3332.xml' },
			{ name: 'Oxford Journal of Law and Religion', url: 'https://academic.oup.com/rss/site_5229/3096.xml' },
			{ name: 'Harvard Theological Review', url: 'https://www.cambridge.org/core/rss/product/id/F1768E6E180CAD06C94C302E6E4DE3F9' },
			{ name: 'The Journal of Ecclesiastical History', url: 'https://www.cambridge.org/core/rss/product/id/8EF6696C5F923E985C82359461BA4F16' },
			{ name: 'Religious Studies', url: 'https://www.cambridge.org/core/rss/product/id/38601D210B54555BDB22082CECA7B6CC' },
			{ name: 'New Testament Studies', url: 'https://www.cambridge.org/core/rss/product/id/3028542C9346770331D11438F2A985CE' },
			{ name: 'Church History', url: 'https://www.cambridge.org/core/rss/product/id/1F2C13B2F24D6E0CBA796873B43F24FB' },
			{ name: 'Scottish Journal of Theology', url: 'https://www.cambridge.org/core/rss/product/id/7513691B30575F8675DF7AC00C63A59E' },
			{ name: 'Journal of Law and Religion', url: 'https://www.cambridge.org/core/rss/product/id/8E27515A8B4162AD2B5762D81F70612A' },
			{ name: 'Politics and Religion', url: 'https://www.cambridge.org/core/rss/product/id/8D26C11BBFAEB43F361AA24FA1C22A5D' },
			{ name: 'Horizons', url: 'https://www.cambridge.org/core/rss/product/id/CFCB1ABDC679F449B38FC7EA5DB5FA67' },
		]
	},
	{
		topic: ART_TOPIC, feeds: [
			{ name: 'The British Journal of Aesthetics', url: 'https://academic.oup.com/rss/site_5432/3293.xml' },
			{ name: 'Oxford Art Journal', url: 'https://academic.oup.com/rss/site_5227/3094.xml' },
			{ name: 'Journal of the History of Collections', url: 'https://academic.oup.com/rss/site_5196/3061.xml' },
			{ name: 'Screen', url: 'https://academic.oup.com/rss/site_5512/3373.xml' },
		]
	},
	{
		topic: MUSIC_TOPIC, feeds: [
			{ name: 'Early Music', url: 'https://academic.oup.com/rss/site_5156/3019.xml' },
			{ name: 'Music and Letters', url: 'https://academic.oup.com/rss/site_5222/3088.xml' },
			{ name: 'The Musical Quarterly', url: 'https://academic.oup.com/rss/site_5223/3089.xml' },
			{ name: 'Music Theory Spectrum', url: 'https://academic.oup.com/rss/site_5492/3353.xml' },
			{ name: 'Cambridge Opera Journal', url: 'https://www.cambridge.org/core/rss/product/id/B8656C3637AB71ED339ECB649E3A2253' },
			{ name: 'Early Music History', url: 'https://www.cambridge.org/core/rss/product/id/11644322AFB4FBC0AF883A4900A9BD94' },
			{ name: 'Eighteenth-Century Music', url: 'https://www.cambridge.org/core/rss/product/id/72D4515362DF3356A3516CE24F95320D' },
			{ name: 'Twentieth-Century Music', url: 'https://www.cambridge.org/core/rss/product/id/70A7BC24C500674E425B00ACD7686CCE' },
			{ name: 'Nineteenth-Century Music Review', url: 'https://www.cambridge.org/core/rss/product/id/6B98E6E99E55CAB91DA71FB67931239A' },
			{ name: 'Journal of the Royal Musical Association', url: 'https://www.cambridge.org/core/rss/product/id/5387250D5659E9F0AADB7D3CDD13FCA9' },
			{ name: 'Journal of the Society for American Music', url: 'https://www.cambridge.org/core/rss/product/id/9F21D07D88FC5FE60B6CE258C3CC9F75' },
			{ name: 'Plainsong & Medieval Music', url: 'https://www.cambridge.org/core/rss/product/id/C24169BB4C400DAF51A47772319980F0' },
			{ name: 'Popular Music', url: 'https://www.cambridge.org/core/rss/product/id/AA802B5FB44548E5E91440EA9E0D909F' },
			{ name: 'Tempo', url: 'https://www.cambridge.org/core/rss/product/id/A18B74AE295AE4BE0CBF89E65B9B0EC5' },
			{ name: 'Organised Sound', url: 'https://www.cambridge.org/core/rss/product/id/F662F87343B7F7B98D1E3A6E5A1B21E1' },
			{ name: 'Jazz Perspectives', url: 'https://www.tandfonline.com/feed/rss/rjaz20' },
			{ name: 'JazzTimes', url: 'https://jazztimes.com/feed/' },
			{ name: 'Jazz Journal', url: 'https://jazzjournal.co.uk/feed/' },
			{ name: 'NPR Jazz', url: 'https://feeds.npr.org/10002/rss.xml' },
			{ name: 'The Syncopated Times', url: 'https://syncopatedtimes.com/feed/' },
		]
	},
	{
		topic: THEATRE_TOPIC, feeds: [
			{ name: 'Contemporary Theatre Review', url: 'https://www.tandfonline.com/feed/rss/gctr20' },
			{ name: 'Performance Research', url: 'https://www.tandfonline.com/feed/rss/rprs20' },
			{ name: 'Studies in Theatre and Performance', url: 'https://www.tandfonline.com/feed/rss/rstp20' },
			{ name: 'Theatre, Dance and Performance Training', url: 'https://www.tandfonline.com/feed/rss/rtdp20' },
			{ name: 'Research in Drama Education', url: 'https://www.tandfonline.com/feed/rss/crde20' },
			{ name: 'Text and Performance Quarterly', url: 'https://www.tandfonline.com/feed/rss/rtpq20' },
			{ name: 'Theatre Survey', url: 'https://www.cambridge.org/core/rss/product/id/4C30206EDB0BDB40CA14E8B2AB6C3D9D' },
			{ name: 'New Theatre Quarterly', url: 'https://www.cambridge.org/core/rss/product/id/5138523CFE819020EBB248E389972C0B' },
			{ name: 'Theatre Research International', url: 'https://www.cambridge.org/core/rss/product/id/03BBCE358C9E7D0F423FF3EBA6A75381' },
			{ name: 'Dance Research Journal', url: 'https://www.cambridge.org/core/rss/product/id/CFB5D61CF3EE0F872FAEADF72102ABEC' },
		]
	},
	{
		topic: ARCHITECTURE_TOPIC, feeds: [
			{ name: 'Journal of Architectural Education', url: 'https://www.tandfonline.com/feed/rss/rjae20' },
			{ name: 'The Journal of Architecture', url: 'https://www.tandfonline.com/feed/rss/rjar20' },
			{ name: 'Architectural Science Review', url: 'https://www.tandfonline.com/feed/rss/tasr20' },
			{ name: 'Journal of Urban Design', url: 'https://www.tandfonline.com/feed/rss/cjud20' },
			{ name: 'Planning Perspectives', url: 'https://www.tandfonline.com/feed/rss/rppe20' },
			{ name: 'Architecture and Culture', url: 'https://www.tandfonline.com/feed/rss/rfac20' },
			{ name: 'Journal of Design History', url: 'https://academic.oup.com/rss/site_5472/3333.xml' },
			{ name: 'Dezeen', url: 'https://www.dezeen.com/feed/' },
			{ name: 'ArchDaily', url: 'https://www.archdaily.com/feed' },
			{ name: 'Architectural History', url: 'https://www.cambridge.org/core/rss/product/id/D1FEC648135382964A4CF47A6F5FE8D4' },
			{ name: 'arq: Architectural Research Quarterly', url: 'https://www.cambridge.org/core/rss/product/id/3386C2CEC752273EE932C4791A47543D' },
			{ name: 'Urban Studies', url: 'https://journals.sagepub.com/action/showFeed?ui=0&mi=ehikzz&ai=2b4&jc=usja&type=etoc&feed=rss' },
			{ name: 'Journal of the American Planning Association', url: 'https://www.tandfonline.com/feed/rss/rjpa20' },
			{ name: 'Cities', url: 'https://rss.sciencedirect.com/publication/science/02642751' },
			{ name: 'Planetizen', url: 'https://www.planetizen.com/frontpage/feed' },
		]
	},
	{
		topic: AGRICULTURE_TOPIC, feeds: [
			{ name: 'Nature Food', url: 'https://www.nature.com/natfood.rss' },
			{ name: 'Field Crops Research', url: 'https://rss.sciencedirect.com/publication/science/03784290' },
			{ name: 'Agricultural Systems', url: 'https://rss.sciencedirect.com/publication/science/0308521X' },
			{ name: 'American Journal of Agricultural Economics', url: 'https://onlinelibrary.wiley.com/feed/14678276/most-recent' },
			{ name: 'Food Policy', url: 'https://rss.sciencedirect.com/publication/science/03069192' },
		]
	},
	{
		topic: VETERINARY_TOPIC, feeds: [
			{ name: 'The Veterinary Journal', url: 'https://rss.sciencedirect.com/publication/science/10900233' },
			{ name: 'Veterinary Record', url: 'https://bvajournals.onlinelibrary.wiley.com/feed/20427670/most-recent' },
			{ name: 'Preventive Veterinary Medicine', url: 'https://rss.sciencedirect.com/publication/science/01675877' },
			{ name: 'Frontiers in Veterinary Science', url: 'https://www.frontiersin.org/journals/veterinary-science/rss' },
		]
	},
	{
		topic: ZOOLOGY_TOPIC, feeds: [
			{ name: 'Journal of Zoology', url: 'https://zslpublications.onlinelibrary.wiley.com/feed/14697998/most-recent' },
			{ name: 'Animal Behaviour', url: 'https://rss.sciencedirect.com/publication/science/00033472' },
			{ name: 'Journal of Animal Ecology', url: 'https://besjournals.onlinelibrary.wiley.com/feed/13652656/most-recent' },
			{ name: 'Frontiers in Zoology', url: 'https://link.springer.com/search.rss?facet-journal-id=12983' },
			{ name: 'Zoology', url: 'https://rss.sciencedirect.com/publication/science/09442006' },
		]
	},
	{
		topic: BOTANY_TOPIC, feeds: [
			{ name: 'Nature Plants', url: 'https://www.nature.com/nplants.rss' },
			{ name: 'New Phytologist', url: 'https://nph.onlinelibrary.wiley.com/feed/14698137/most-recent' },
			{ name: 'American Journal of Botany', url: 'https://bsapubs.onlinelibrary.wiley.com/feed/15372197/most-recent' },
			{ name: 'The Plant Journal', url: 'https://onlinelibrary.wiley.com/feed/1365313x/most-recent' },
			{ name: 'Frontiers in Plant Science', url: 'https://www.frontiersin.org/journals/plant-science/rss' },
		]
	},
	{
		topic: VIDEO_TOPIC, feeds: [
			{ name: 'The Wall Street Journal', url: youtubeFeedUrl('UCK7tptUDHh-RYDsdxO1-5QQ'), note: youtube },
			{ name: 'Financial Times', url: youtubeFeedUrl('UCoUxsWakJucWg46KW5RsvPw'), note: youtube },
			{ name: 'The Economist', url: youtubeFeedUrl('UC0p5jTq6Xx_DosDFxVXnWaQ'), note: youtube },
			{ name: 'The Julia Programming Language', url: youtubeFeedUrl('UC9IuUwwE2xdjQUT_LMLONoA'), note: youtube },
			{ name: 'Planet Money', url: 'https://feeds.npr.org/510289/podcast.xml', note: podcast },
			{ name: 'The Indicator from Planet Money', url: 'https://feeds.npr.org/510325/podcast.xml', note: podcast },
			{ name: 'Odd Lots', url: 'https://www.omnycontent.com/d/playlist/e73c998e-6e60-432f-8610-ae210140c5b1/8a94442e-5a74-4fa2-8b8d-ae27003a8d6b/982f5071-765c-403d-969d-ae27003a8d83/podcast.rss', note: podcast },
			{ name: 'EconTalk', url: 'https://feeds.simplecast.com/wgl4xEgL', note: podcast },
		]
	},
];

/** The example of a PubMed search, which Pollis follows at first: Add Feed > PubMed Search adds the user's own. */
const PUBMED_EXAMPLE = '"Cox proportional hazards"[Title/Abstract]';

/** The feeds Pollis follows at first. */
export const DEFAULT_FEEDS: readonly { readonly url: string; readonly topic: string; readonly name?: string }[] = [
	...[
		'https://julialang.org/feed.xml',
		'https://discourse.julialang.org/c/announce/25.rss',
	].map(url => ({ url, topic: JULIA_TOPIC })),
	...[
		'https://statmodeling.stat.columbia.edu/feed/',
		'https://www.tandfonline.com/feed/rss/uasa20',
		'https://www.jstatsoft.org/gateway/plugin/WebFeedGatewayPlugin/rss2',
		'https://rss.arxiv.org/rss/stat.ME',
		'https://rss.arxiv.org/rss/stat.ML',
		'https://rss.arxiv.org/rss/stat',
	].map(url => ({ url, topic: STATISTICS_TOPIC })),
	...[
		'https://www.ft.com/rss/home',
		'https://www.ft.com/markets?format=rss',
		'https://www.economist.com/finance-and-economics/rss.xml',
		'https://feeds.content.dowjones.io/public/rss/RSSMarketsMain',
		'https://feeds.bloomberg.com/news.rss',
		'https://feeds.bloomberg.com/markets/news.rss',
		'https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=100003114',
	].map(url => ({ url, topic: FINANCE_TOPIC })),
	...[
		'https://onlinelibrary.wiley.com/rss/journal/10.1111/(ISSN)1540-6261',
		'https://rss.sciencedirect.com/publication/science/0304405X',
		'https://academic.oup.com/rss/site_5511/3372.xml',
		'https://rss.arxiv.org/rss/q-fin',
	].map(url => ({ url, topic: FINANCE_RESEARCH_TOPIC })),
	...[
		'https://www.federalreserve.gov/feeds/press_all.xml',
		'https://libertystreeteconomics.newyorkfed.org/feed/',
		'https://www.ecb.europa.eu/rss/press.html',
		'https://www.ecb.europa.eu/rss/blog.html',
		'https://www.bankofengland.co.uk/rss/news',
		'https://www.bis.org/doclist/all_pressrels.rss',
		'https://rss.arxiv.org/rss/econ',
	].map(url => ({ url, topic: ECONOMICS_TOPIC })),
	...[
		'https://www.nature.com/nature.rss',
		'https://www.science.org/action/showFeed?type=etoc&feed=rss&jc=science',
		'https://www.sciencenews.org/feed',
		'https://www.pnas.org/action/showFeed?type=etoc&feed=rss&jc=pnas',
		'http://rss.sciam.com/ScientificAmerican-Global',
		'https://www.quantamagazine.org/feed/',
	].map(url => ({ url, topic: SCIENCE_TOPIC })),
	...[
		'https://www.jmlr.org/jmlr.xml',
		'https://deepmind.google/blog/rss.xml',
		'https://rss.arxiv.org/rss/cs.LG',
		'https://rss.arxiv.org/rss/cs.AI',
	].map(url => ({ url, topic: AI_TOPIC })),
	...[
		'https://rss.arxiv.org/rss/math',
	].map(url => ({ url, topic: MATHEMATICS_TOPIC })),
	...[
		'https://rss.arxiv.org/rss/cs',
	].map(url => ({ url, topic: COMPUTER_SCIENCE_TOPIC })),
	...[
		'https://www.nejm.org/action/showFeed?jc=nejm&type=etoc&feed=rss',
		'https://www.thelancet.com/rssfeed/lancet_current.xml',
		'https://jamanetwork.com/rss/site_3/67.xml',
		'https://www.nature.com/nm.rss',
		'https://www.cell.com/cell/current.rss',
	].map(url => ({ url, topic: MEDICINE_TOPIC })),
	{ url: pubmedSearchUrl(PUBMED_EXAMPLE), topic: MEDICINE_TOPIC, name: pubmedSearchName(PUBMED_EXAMPLE) },
	...[
		youtubeFeedUrl('UCK7tptUDHh-RYDsdxO1-5QQ'),
		'https://feeds.npr.org/510289/podcast.xml',
	].map(url => ({ url, topic: VIDEO_TOPIC })),
];

/** A catalogue feed by its address. */
export function findCatalogueFeed(url: string): { topic: string; feed: IRssCatalogueFeed } | undefined {
	for (const { topic, feeds } of RSS_CATALOGUE) {
		const feed = feeds.find(feed => feed.url === url);
		if (feed) {
			return { topic, feed };
		}
	}
	return undefined;
}

/**
 * Whether requests to the host of `url` must be spaced out: arXiv asks for 3 seconds, NCBI allows 3 a second, and
 * Oxford Academic answers 429 Too Many Requests to a few a second.
 */
export function requestSpacing(url: string): number {
	return url.startsWith(ARXIV_SEARCH) ? 3000 : url.startsWith('https://eutils.ncbi.nlm.nih.gov/') ? 400 : url.startsWith('https://academic.oup.com/rss/') ? 1000 : 0;
}
