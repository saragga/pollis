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
/**
 * The topics renamed or split, by their old names: their catalogue feeds are now under the catalogue's topics, and the
 * others under the new name; the catalogue's arXiv feeds, once under arXiv, are under their subjects. The videos and
 * podcasts of the catalogue are under their subjects too, and the user's own stay under Videos and Podcasts.
 */
export const RENAMED_TOPICS: Readonly<Record<string, string>> = { 'Science': SCIENCE_TOPIC, 'Finance Journals': FINANCE_RESEARCH_TOPIC, 'Arts and Music': ART_TOPIC, 'Classics and Religion': RELIGION_TOPIC, 'Architecture': ARCHITECTURE_TOPIC, 'Videos and Podcasts': 'Videos and Podcasts' };

/**
 * A feed of the catalogue: its name, its address and, when it matters, a note shown beside it.
 */
export interface IRssCatalogueFeed {
	readonly name: string;
	readonly url: string;
	readonly note?: string;
	/** Whether the feed is a podcast's; a YouTube channel is known by its address. */
	readonly media?: 'audio';
	/** The ISSNs of the journal whose feed it is, print and electronic, by which its levels and metrics are found. */
	readonly issns?: readonly string[];
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
			{ name: 'The Julia Programming Language', url: youtubeFeedUrl('UC9IuUwwE2xdjQUT_LMLONoA'), note: youtube },
		]
	},
	{
		topic: STATISTICS_TOPIC, feeds: [
			{ name: 'Statistical Modeling, Causal Inference, and Social Science', url: 'https://statmodeling.stat.columbia.edu/feed/' },
			{ name: 'Journal of the American Statistical Association', url: 'https://www.tandfonline.com/feed/rss/uasa20', issns: ['0162-1459', '1537-274X'] },
			{ name: 'Journal of the Royal Statistical Society: Series B', url: 'https://academic.oup.com/rss/site_6513/4147.xml', issns: ['1369-7412', '1467-9868'] },
			{ name: 'Journal of Statistical Software', url: 'https://www.jstatsoft.org/gateway/plugin/WebFeedGatewayPlugin/rss2', issns: ['1548-7660'] },
			{ name: 'Statistics in Medicine', url: 'https://onlinelibrary.wiley.com/feed/10970258/most-recent', issns: ['0277-6715', '1097-0258'] },
			{ name: 'Journal of the Royal Statistical Society: Series A', url: 'https://academic.oup.com/rss/site_6517/4149.xml', issns: ['0964-1998', '1467-985X'] },
			{ name: 'Journal of the Royal Statistical Society: Series C', url: 'https://academic.oup.com/rss/site_6519/4150.xml', issns: ['0035-9254', '1467-9876'] },
			{ name: 'Significance', url: 'https://academic.oup.com/rss/site_6521/4151.xml', issns: ['1740-9705', '1740-9713'] },
			{ name: 'Biometrika', url: 'https://academic.oup.com/rss/site_5265/3131.xml', issns: ['0006-3444', '1464-3510'] },
			{ name: 'Biostatistics', url: 'https://academic.oup.com/rss/site_5141/3003.xml', issns: ['1465-4644', '1468-4357'] },
			{ name: 'Journal of Survey Statistics and Methodology', url: 'https://academic.oup.com/rss/site_5481/3342.xml', issns: ['2325-0984', '2325-0992'] },
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
			{ name: 'The Wall Street Journal: Videos', url: youtubeFeedUrl('UCK7tptUDHh-RYDsdxO1-5QQ'), note: youtube },
			{ name: 'Financial Times: Videos', url: youtubeFeedUrl('UCoUxsWakJucWg46KW5RsvPw'), note: youtube },
			{ name: 'The Economist: Videos', url: youtubeFeedUrl('UC0p5jTq6Xx_DosDFxVXnWaQ'), note: youtube },
			{ name: 'Odd Lots', url: 'https://www.omnycontent.com/d/playlist/e73c998e-6e60-432f-8610-ae210140c5b1/8a94442e-5a74-4fa2-8b8d-ae27003a8d6b/982f5071-765c-403d-969d-ae27003a8d83/podcast.rss', note: podcast, media: 'audio' },
		]
	},
	{
		topic: FINANCE_RESEARCH_TOPIC, feeds: [
			{ name: 'The Journal of Finance', url: 'https://onlinelibrary.wiley.com/rss/journal/10.1111/(ISSN)1540-6261', issns: ['0022-1082', '1540-6261'] },
			{ name: 'Journal of Financial Economics', url: 'https://rss.sciencedirect.com/publication/science/0304405X', issns: ['0304-405X', '1879-2774'] },
			{ name: 'The Review of Financial Studies', url: 'https://academic.oup.com/rss/site_5511/3372.xml', issns: ['0893-9454', '1465-7368'] },
			{ name: 'Review of Finance', url: 'https://academic.oup.com/rss/site_5510/3371.xml', issns: ['1572-3097', '1875-824X'] },
			{ name: 'The Review of Asset Pricing Studies', url: 'https://academic.oup.com/rss/site_5506/3367.xml', issns: ['2045-9920', '2045-9939'] },
			{ name: 'The Review of Corporate Finance Studies', url: 'https://academic.oup.com/rss/site_5507/3368.xml', issns: ['2046-9128', '2046-9136'] },
			{ name: 'Journal of Financial Econometrics', url: 'https://academic.oup.com/rss/site_5193/3058.xml', issns: ['1479-8409', '1479-8417'] },
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
			{ name: 'The Quarterly Journal of Economics', url: 'https://academic.oup.com/rss/site_5504/3365.xml', issns: ['0033-5533', '1531-4650'] },
			{ name: 'The Review of Economic Studies', url: 'https://academic.oup.com/rss/site_5508/3369.xml', issns: ['0034-6527', '1467-937X'] },
			{ name: 'Journal of the European Economic Association', url: 'https://academic.oup.com/rss/site_5571/3427.xml', issns: ['1542-4766', '1542-4774'] },
			{ name: 'The Economic Journal', url: 'https://academic.oup.com/rss/site_6182/4014.xml', issns: ['0013-0133', '1468-0297', '1742-0350'] },
			{ name: 'The World Bank Economic Review', url: 'https://academic.oup.com/rss/site_5522/3383.xml', issns: ['0258-6770', '1564-698X'] },
			{ name: 'arXiv: Economics', url: 'https://rss.arxiv.org/rss/econ', note: weekdays },
			{ name: 'arXiv: Econometrics', url: 'https://rss.arxiv.org/rss/econ.EM', note: weekdays },
			{ name: 'Planet Money', url: 'https://feeds.npr.org/510289/podcast.xml', note: podcast, media: 'audio' },
			{ name: 'The Indicator from Planet Money', url: 'https://feeds.npr.org/510325/podcast.xml', note: podcast, media: 'audio' },
			{ name: 'EconTalk', url: 'https://feeds.simplecast.com/wgl4xEgL', note: podcast, media: 'audio' },
		]
	},
	{
		topic: SCIENCE_TOPIC, feeds: [
			{ name: 'Nature', url: 'https://www.nature.com/nature.rss', issns: ['0028-0836', '1476-4687'] },
			{ name: 'Science', url: 'https://www.science.org/action/showFeed?type=etoc&feed=rss&jc=science', issns: ['0036-8075', '0193-4511', '1095-9203'] },
			{ name: 'PNAS', url: 'https://www.pnas.org/action/showFeed?type=etoc&feed=rss&jc=pnas', issns: ['0027-8424', '1091-6490'] },
			{ name: 'Science News', url: 'https://www.sciencenews.org/feed', issns: ['0036-8423', '1943-0930'] },
			{ name: 'Scientific American', url: 'http://rss.sciam.com/ScientificAmerican-Global', issns: ['0036-8733', '1946-7087'] },
			{ name: 'Quanta Magazine', url: 'https://www.quantamagazine.org/feed/' },
			{ name: 'Science Advances', url: 'https://www.science.org/action/showFeed?type=etoc&feed=rss&jc=sciadv', issns: ['2375-2548'] },
		]
	},
	{
		topic: AI_TOPIC, feeds: [
			{ name: 'Journal of Machine Learning Research', url: 'https://www.jmlr.org/jmlr.xml', issns: ['1532-4435', '1533-7928'] },
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
			{ name: 'New England Journal of Medicine', url: 'https://www.nejm.org/action/showFeed?jc=nejm&type=etoc&feed=rss', issns: ['0028-4793', '0096-6762', '1533-4406', '2331-4710'] },
			{ name: 'The Lancet', url: 'https://www.thelancet.com/rssfeed/lancet_current.xml', issns: ['0099-5355', '0140-6736', '1474-547X'] },
			{ name: 'JAMA', url: 'https://jamanetwork.com/rss/site_3/67.xml', issns: ['0002-9955', '0098-7484', '1538-3598', '2376-8118'] },
			{ name: 'Nature Medicine', url: 'https://www.nature.com/nm.rss', issns: ['1078-8956', '1546-170X', '1744-7933'] },
			{ name: 'Cell', url: 'https://www.cell.com/cell/current.rss', issns: ['0092-8674', '1097-4172'] },
			{ name: 'The BMJ', url: 'https://www.bmj.com/rss/recent.xml', issns: ['0007-1447', '0267-0623', '1468-5833'] },
			{ name: 'PLOS Medicine', url: 'https://journals.plos.org/plosmedicine/feed/atom', issns: ['1549-1277', '1549-1676'] },
			{ name: 'medRxiv', url: 'https://connect.medrxiv.org/medrxiv_xml.php?subject=all', note: preprints },
			{ name: 'bioRxiv', url: 'https://connect.biorxiv.org/biorxiv_xml.php?subject=all', note: preprints },
			{ name: 'Brain', url: 'https://academic.oup.com/rss/site_5367/3228.xml', issns: ['0006-8950', '1460-2156'] },
			{ name: 'European Heart Journal', url: 'https://academic.oup.com/rss/site_5375/3236.xml', issns: ['0195-668X', '1522-9645'] },
			{ name: 'Journal of the American Medical Informatics Association', url: 'https://academic.oup.com/rss/site_5396/3257.xml', issns: ['1067-5027', '1527-974X'] },
			{ name: 'European Journal of Public Health', url: 'https://academic.oup.com/rss/site_5381/3242.xml', issns: ['1101-1262', '1464-360X'] },
		]
	},
	{
		topic: COMPUTER_SCIENCE_TOPIC, feeds: [
			{ name: 'Journal of the ACM', url: 'https://dl.acm.org/action/showFeed?type=etoc&feed=rss&jc=jacm', issns: ['0004-5411', '1557-735X'] },
			{ name: 'ACM Computing Surveys', url: 'https://dl.acm.org/action/showFeed?type=etoc&feed=rss&jc=csur', issns: ['0360-0300', '1557-7341'] },
			{ name: 'IEEE Spectrum: Computing', url: 'https://spectrum.ieee.org/feeds/topic/computing.rss' },
			{ name: 'MIT News: Computer Science and Technology', url: 'https://news.mit.edu/rss/topic/computers' },
			{ name: 'Quanta Magazine: Computer Science', url: 'https://www.quantamagazine.org/computer-science/feed/' },
			{ name: 'Hacker News', url: 'https://hnrss.org/frontpage', note: readersLinks },
			{ name: 'Lobsters', url: 'https://lobste.rs/rss', note: readersLinks },
			{ name: 'Bioinformatics', url: 'https://academic.oup.com/rss/site_5139/3001.xml', issns: ['1367-4803', '1367-4811'] },
			{ name: 'Briefings in Bioinformatics', url: 'https://academic.oup.com/rss/site_5143/3005.xml', issns: ['1467-5463', '1477-4054'] },
			{ name: 'Journal of Cybersecurity', url: 'https://academic.oup.com/rss/site_5188/3053.xml', issns: ['2057-2085', '2057-2093'] },
			{ name: 'The Computer Journal', url: 'https://academic.oup.com/rss/site_5271/3137.xml', issns: ['0010-4620', '1460-2067'] },
			{ name: 'arXiv: Computer Science', url: 'https://rss.arxiv.org/rss/cs', note: busy },
		]
	},
	{
		topic: MATHEMATICS_TOPIC, feeds: [
			{ name: 'SIAM Review', url: 'https://epubs.siam.org/action/showFeed?type=etoc&feed=rss&jc=sirev', issns: ['0036-1445', '1095-7200'] },
			{ name: 'Quanta Magazine: Mathematics', url: 'https://www.quantamagazine.org/mathematics/feed/' },
			{ name: 'Terence Tao: What\'s New', url: 'https://terrytao.wordpress.com/feed/' },
			{ name: 'AMS Feature Column', url: 'https://blogs.ams.org/featurecolumn/feed/' },
			{ name: 'Proceedings of the London Mathematical Society', url: 'https://academic.oup.com/rss/site_5501/3362.xml', issns: ['0024-6115', '1460-244X'] },
			{ name: 'International Mathematics Research Notices', url: 'https://academic.oup.com/rss/site_5177/3041.xml', issns: ['1073-7928', '1687-0247'] },
			{ name: 'arXiv: Optimization and Control', url: 'https://rss.arxiv.org/rss/math.OC', note: weekdays },
			{ name: 'arXiv: Mathematics', url: 'https://rss.arxiv.org/rss/math', note: busy },
			{ name: 'arXiv: Probability', url: 'https://rss.arxiv.org/rss/math.PR', note: weekdays },
			{ name: 'arXiv: Numerical Analysis', url: 'https://rss.arxiv.org/rss/math.NA', note: weekdays },
		]
	},
	{
		topic: PHYSICS_TOPIC, feeds: [
			{ name: 'Physical Review Letters', url: 'https://feeds.aps.org/rss/recent/prl.xml', issns: ['0031-9007', '1079-7114', '1092-0145'] },
			{ name: 'Nature Physics', url: 'https://www.nature.com/nphys.rss', issns: ['1745-2473', '1745-2481'] },
			{ name: 'APS Physics', url: 'https://feeds.aps.org/rss/recent/physics.xml' },
			{ name: 'Physics World', url: 'https://physicsworld.com/feed/', issns: ['0953-8585', '2058-7058'] },
			{ name: 'Quanta Magazine: Physics', url: 'https://www.quantamagazine.org/physics/feed/' },
			{ name: 'arXiv: Physics', url: 'https://rss.arxiv.org/rss/physics', note: busy },
			{ name: 'arXiv: Quantum Physics', url: 'https://rss.arxiv.org/rss/quant-ph', note: busy },
		]
	},
	{
		topic: ASTRONOMY_TOPIC, feeds: [
			{ name: 'Nature Astronomy', url: 'https://www.nature.com/natastron.rss', issns: ['2397-3366'] },
			{ name: 'NASA: News Releases', url: 'https://www.nasa.gov/news-release/feed/' },
			{ name: 'ESA: Space Science', url: 'https://www.esa.int/rssfeed/Our_Activities/Space_Science' },
			{ name: 'Universe Today', url: 'https://www.universetoday.com/feed/' },
			{ name: 'arXiv: Astrophysics', url: 'https://rss.arxiv.org/rss/astro-ph', note: busy },
		]
	},
	{
		topic: CHEMISTRY_TOPIC, feeds: [
			{ name: 'Nature Chemistry', url: 'https://www.nature.com/nchem.rss', issns: ['1755-4330', '1755-4349'] },
			{ name: 'Nature Chemical Biology', url: 'https://www.nature.com/nchembio.rss', issns: ['1552-4450', '1552-4469'] },
			{ name: 'Angewandte Chemie International Edition', url: 'https://onlinelibrary.wiley.com/feed/15213773/most-recent', issns: ['1433-7851', '1521-3773'] },
			{ name: 'Chemical Science', url: 'http://feeds.rsc.org/rss/sc', issns: ['2041-6520', '2041-6539'] },
			{ name: 'Chemical & Engineering News', url: 'https://cen.acs.org/feeds/rss/latestnews.xml', issns: ['0009-2347', '1520-605X', '2157-4936'] },
		]
	},
	{
		topic: BIOLOGY_TOPIC, feeds: [
			{ name: 'Current Biology', url: 'https://www.cell.com/current-biology/current.rss', issns: ['0960-9822', '1879-0445'] },
			{ name: 'PLOS Biology', url: 'https://journals.plos.org/plosbiology/feed/atom', issns: ['1544-9173', '1545-7885'] },
			{ name: 'eLife', url: 'https://elifesciences.org/rss/recent.xml', issns: ['2050-084X'] },
			{ name: 'Nature Genetics', url: 'https://www.nature.com/ng.rss', issns: ['1061-4036', '1546-1718'] },
			{ name: 'Quanta Magazine: Biology', url: 'https://www.quantamagazine.org/biology/feed/' },
			{ name: 'arXiv: Quantitative Biology', url: 'https://rss.arxiv.org/rss/q-bio', note: weekdays },
		]
	},
	{
		topic: ECOLOGY_TOPIC, feeds: [
			{ name: 'Nature Ecology & Evolution', url: 'https://www.nature.com/natecolevol.rss', issns: ['2397-334X'] },
			{ name: 'Ecology Letters', url: 'https://onlinelibrary.wiley.com/feed/14610248/most-recent', issns: ['1461-023X', '1461-0248'] },
			{ name: 'Trends in Ecology & Evolution', url: 'https://www.cell.com/trends/ecology-evolution/current.rss', issns: ['0169-5347', '1872-8383'] },
			{ name: 'Methods in Ecology and Evolution', url: 'https://besjournals.onlinelibrary.wiley.com/feed/2041210x/most-recent', issns: ['2041-210X'] },
			{ name: 'Journal of Animal Ecology', url: 'https://besjournals.onlinelibrary.wiley.com/feed/13652656/most-recent', issns: ['0021-8790', '1365-2656'] },
			{ name: 'Smithsonian Magazine: Science and Nature', url: 'https://www.smithsonianmag.com/rss/science-nature/' },
			{ name: 'Mongabay: Conservation News', url: 'https://news.mongabay.com/feed/' },
		]
	},
	{
		topic: EARTH_TOPIC, feeds: [
			{ name: 'Nature Climate Change', url: 'https://www.nature.com/nclimate.rss', issns: ['1758-678X', '1758-6798'] },
			{ name: 'Nature Geoscience', url: 'https://www.nature.com/ngeo.rss', issns: ['1752-0894', '1752-0908'] },
			{ name: 'NASA Earth Observatory', url: 'https://earthobservatory.nasa.gov/feeds/earth-observatory.rss' },
			{ name: 'Carbon Brief', url: 'https://www.carbonbrief.org/feed/' },
		]
	},
	{
		topic: ENGINEERING_TOPIC, feeds: [
			{ name: 'IEEE Spectrum', url: 'https://spectrum.ieee.org/feeds/feed.rss', issns: ['0018-9235', '1939-9340'] },
			{ name: 'Nature Electronics', url: 'https://www.nature.com/natelectron.rss', issns: ['2520-1131'] },
			{ name: 'Nature Energy', url: 'https://www.nature.com/nenergy.rss', issns: ['2058-7546'] },
			{ name: 'Nature Materials', url: 'https://www.nature.com/nmat.rss', issns: ['1476-1122', '1476-4660'] },
			{ name: 'MIT News: School of Engineering', url: 'https://news.mit.edu/rss/school/engineering' },
			{ name: 'arXiv: Electrical Engineering and Systems Science', url: 'https://rss.arxiv.org/rss/eess', note: busy },
		]
	},
	{
		topic: LAW_TOPIC, feeds: [
			{ name: 'Harvard Law Review', url: 'https://harvardlawreview.org/feed/', issns: ['0017-811X', '2161-976X'] },
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
			{ name: 'Oxford Journal of Legal Studies', url: 'https://academic.oup.com/rss/site_5495/3356.xml', issns: ['0143-6503', '1464-3820'] },
			{ name: 'European Journal of International Law', url: 'https://academic.oup.com/rss/site_5452/3313.xml', issns: ['0938-5428', '1464-3596'] },
			{ name: 'International Journal of Constitutional Law', url: 'https://academic.oup.com/rss/site_5170/3034.xml', issns: ['1474-2640', '1474-2659'] },
			{ name: 'Journal of International Economic Law', url: 'https://academic.oup.com/rss/site_5203/3068.xml', issns: ['1369-3034', '1464-3758'] },
			{ name: 'Journal of Legal Analysis', url: 'https://academic.oup.com/rss/site_5476/3337.xml', issns: ['1946-5319', '2161-7201'] },
			{ name: 'Current Legal Problems', url: 'https://academic.oup.com/rss/site_5446/3307.xml', issns: ['0070-1998', '2044-8422'] },
		]
	},
	{
		topic: HISTORY_TOPIC, feeds: [
			{ name: 'The Economic History Review', url: 'https://onlinelibrary.wiley.com/feed/14680289/most-recent', issns: ['0013-0117', '1468-0289'] },
			{ name: 'Explorations in Economic History', url: 'https://rss.sciencedirect.com/publication/science/00144983', issns: ['0014-4983', '1090-2457'] },
			{ name: 'History Workshop', url: 'https://www.historyworkshop.org.uk/feed/' },
			{ name: 'JSTOR Daily', url: 'https://daily.jstor.org/feed/' },
			{ name: 'Smithsonian Magazine: History', url: 'https://www.smithsonianmag.com/rss/history/' },
			{ name: 'The Public Domain Review', url: 'https://publicdomainreview.org/rss.xml' },
			{ name: 'The American Historical Review', url: 'https://academic.oup.com/rss/site_5423/3284.xml', issns: ['0002-8762', '1937-5239'] },
			{ name: 'Past & Present', url: 'https://academic.oup.com/rss/site_5497/3358.xml', issns: ['0031-2746', '1477-464X'] },
			{ name: 'The English Historical Review', url: 'https://academic.oup.com/rss/site_5158/3021.xml', issns: ['0013-8266', '1477-4534'] },
			{ name: 'Journal of American History', url: 'https://academic.oup.com/rss/site_5470/3331.xml', issns: ['0021-8723', '0161-391X', '1945-2314', '2326-2028'] },
			{ name: 'European Review of Economic History', url: 'https://academic.oup.com/rss/site_5454/3315.xml', issns: ['1361-4916', '1474-0044'] },
			{ name: 'Social History of Medicine', url: 'https://academic.oup.com/rss/site_5514/3375.xml', issns: ['0951-631X', '1477-4666'] },
			{ name: 'The Historical Journal', url: 'https://www.cambridge.org/core/rss/product/id/15E98E1D30D09470213F11031D82A83C', issns: ['0018-246X', '1469-5103'] },
			{ name: 'Comparative Studies in Society and History', url: 'https://www.cambridge.org/core/rss/product/id/3D5C40349E588565CAD30F5A7E08F68F', issns: ['0010-4175', '1475-2999'] },
			{ name: 'The Journal of Economic History', url: 'https://www.cambridge.org/core/rss/product/id/677F550CB2C69EFA1656654D487DE504', issns: ['0022-0507', '1471-6372'] },
			{ name: 'Journal of British Studies', url: 'https://www.cambridge.org/core/rss/product/id/3D82EE9C20F7A6ED0160891A67C2AF81', issns: ['0021-9371', '1545-6986'] },
			{ name: 'The Journal of African History', url: 'https://www.cambridge.org/core/rss/product/id/5801BD5DA5F1DCCF8BFA7EC236F12F2D', issns: ['0021-8537', '1469-5138'] },
			{ name: 'Modern Asian Studies', url: 'https://www.cambridge.org/core/rss/product/id/457172B1126D4C98B0412AA440066031', issns: ['0026-749X', '1469-8099'] },
			{ name: 'Transactions of the Royal Historical Society', url: 'https://www.cambridge.org/core/rss/product/id/50500A81A9EA4B7739B58DFE5EE5D9C3', issns: ['0080-4401', '1474-0648'] },
			{ name: 'Journal of Global History', url: 'https://www.cambridge.org/core/rss/product/id/362152E06A55E569CD672CA58FB5425E', issns: ['1740-0228', '1740-0236'] },
			{ name: 'Journal of the History of Economic Thought', url: 'https://www.cambridge.org/core/rss/product/id/DE90B213159AC189FBBDD434E081B982', issns: ['1053-8372', '1469-9656'] },
			{ name: 'Business History Review', url: 'https://www.cambridge.org/core/rss/product/id/C269FC4EBCA2E8C47A2057D9E8E9B812', issns: ['0007-6805', '2044-768X'] },
			{ name: 'Enterprise & Society', url: 'https://www.cambridge.org/core/rss/product/id/64B21495494897A8DE797BBCA86847B0', issns: ['1467-2227', '1467-2235'] },
			{ name: 'Contemporary European History', url: 'https://www.cambridge.org/core/rss/product/id/326C5884CAC8B1DC6A1B2D5A33FAFDD1', issns: ['0960-7773', '1469-2171'] },
			{ name: 'Central European History', url: 'https://www.cambridge.org/core/rss/product/id/C5DBF3E8CD35888A0EDB091529CC9F8A', issns: ['0008-9389', '1569-1616'] },
			{ name: 'Journal of Latin American Studies', url: 'https://www.cambridge.org/core/rss/product/id/2CC8E5C88C78522D8CF432A0B6005E54', issns: ['0022-216X', '1469-767X'] },
			{ name: 'International Review of Social History', url: 'https://www.cambridge.org/core/rss/product/id/7FF66016B2018F886FFFFA224E60F12D', issns: ['0020-8590', '1469-512X'] },
			{ name: 'Slavic Review', url: 'https://www.cambridge.org/core/rss/product/id/BE028C241144CA93B60D30FFBA435841', issns: ['0037-6779', '2325-7784'] },
			{ name: 'Medical History', url: 'https://www.cambridge.org/core/rss/product/id/8322CA11A4C5E4B9703574A29A031420', issns: ['0025-7273', '2048-8343'] },
			{ name: 'The British Journal for the History of Science', url: 'https://www.cambridge.org/core/rss/product/id/D65F60FBCAC74E99C40887D449137348', issns: ['0007-0874', '1474-001X'] },
			{ name: 'Financial History Review', url: 'https://www.cambridge.org/core/rss/product/id/DCA684C4B9E2558C24A8FEFC37C23755', issns: ['0968-5650', '1474-0052'] },
			{ name: 'Continuity and Change', url: 'https://www.cambridge.org/core/rss/product/id/23FE8BE8E8BA4803A52A9FB68C708261', issns: ['0268-4160', '1469-218X'] },
			{ name: 'Journal of Policy History', url: 'https://www.cambridge.org/core/rss/product/id/57FF635D60998D01F96654544EA8F661', issns: ['0898-0306', '1528-4190'] },
			{ name: 'Modern Intellectual History', url: 'https://www.cambridge.org/core/rss/product/id/DA0FCF6112B9EEFD7F49917529181198', issns: ['1479-2443', '1479-2451'] },
			{ name: 'Urban History', url: 'https://www.cambridge.org/core/rss/product/id/923A3D28AA1075F462BC003C543FC57D', issns: ['0963-9268', '1469-8706'] },
			{ name: 'Speculum', url: 'https://www.journals.uchicago.edu/action/showFeed?type=etoc&feed=rss&jc=spc', issns: ['0038-7134', '2040-8072'] },
			{ name: 'Journal of Medieval History', url: 'https://www.tandfonline.com/feed/rss/rmed20', issns: ['0304-4181', '1873-1279'] },
			{ name: 'Early Medieval Europe', url: 'https://onlinelibrary.wiley.com/feed/14680254/most-recent', issns: ['0963-9462', '1468-0254'] },
			{ name: 'Renaissance Quarterly', url: 'https://www.journals.uchicago.edu/action/showFeed?type=etoc&feed=rss&jc=rq', issns: ['0034-4338', '1935-0236'] },
			{ name: 'Renaissance Studies', url: 'https://onlinelibrary.wiley.com/feed/14774658/most-recent', issns: ['0269-1213', '1477-4658'] },
			{ name: 'The Sixteenth Century Journal', url: 'https://www.journals.uchicago.edu/action/showFeed?type=etoc&feed=rss&jc=scj', issns: ['0361-0160', '2326-0726'] },
			{ name: 'Renaissance and Reformation', url: 'https://jps.library.utoronto.ca/index.php/renref/gateway/plugin/WebFeedGatewayPlugin/rss2', issns: ['0034-429X', '2293-7374'] },
		]
	},
	{
		topic: PHILOSOPHY_TOPIC, feeds: [
			{ name: 'Stanford Encyclopedia of Philosophy', url: 'https://plato.stanford.edu/rss/sep.xml', note: newEntries, issns: ['1095-5054'] },
			{ name: 'Philosophy & Public Affairs', url: 'https://onlinelibrary.wiley.com/feed/10884963/most-recent', issns: ['0048-3915', '1088-4963'] },
			{ name: 'Daily Nous', url: 'https://dailynous.com/feed/' },
			{ name: 'Aeon', url: 'https://aeon.co/feed.rss' },
			{ name: 'Mind', url: 'https://academic.oup.com/rss/site_5489/3350.xml', issns: ['0026-4423', '1460-2113'] },
			{ name: 'The Philosophical Quarterly', url: 'https://academic.oup.com/rss/site_5498/3359.xml', issns: ['0031-8094', '1467-9213'] },
			{ name: 'Analysis', url: 'https://academic.oup.com/rss/site_5428/3289.xml', issns: ['0003-2638', '1467-8284'] },
			{ name: 'The British Journal for the Philosophy of Science', url: 'https://academic.oup.com/rss/site_5434/3295.xml', issns: ['0007-0882', '1464-3537'] },
			{ name: 'Proceedings of the Aristotelian Society', url: 'https://academic.oup.com/rss/site_5500/3361.xml', issns: ['0066-7374', '0066-7372', '0066-7373', '1467-9264'] },
			{ name: 'Philosophy', url: 'https://www.cambridge.org/core/rss/product/id/3EA385852862D405D2421320F738E6C6', issns: ['0031-8191', '1469-817X'] },
			{ name: 'Canadian Journal of Philosophy', url: 'https://www.cambridge.org/core/rss/product/id/F8B3B46B1A237A95DD4EFCBB206904F7', issns: ['0045-5091', '1911-0820'] },
			{ name: 'Journal of the American Philosophical Association', url: 'https://www.cambridge.org/core/rss/product/id/2ED07D9487008A8D938A1B0F11FD052B', issns: ['2053-4477', '2053-4485'] },
			{ name: 'Episteme', url: 'https://www.cambridge.org/core/rss/product/id/71889765CB94C81977C512106F267CD1', issns: ['1742-3600', '1750-0117'] },
			{ name: 'Economics & Philosophy', url: 'https://www.cambridge.org/core/rss/product/id/B5D4296480440438DA66419338B16C88', issns: ['0266-2671', '1474-0028'] },
			{ name: 'Utilitas', url: 'https://www.cambridge.org/core/rss/product/id/E877D32E5504714AD4B5250AFFDAA42C', issns: ['0953-8208', '1741-6183'] },
			{ name: 'Kantian Review', url: 'https://www.cambridge.org/core/rss/product/id/D3E55E88C6269FFD657D4E68B193ADAB', issns: ['1369-4154', '2044-2394'] },
			{ name: 'Hegel Bulletin', url: 'https://www.cambridge.org/core/rss/product/id/6B7E5895BA3B771738D118BC437247EE', issns: ['0263-5232', '2051-5367', '2051-5375', '2396-8176'] },
			{ name: 'Philosophy of Science', url: 'https://www.cambridge.org/core/rss/product/id/3FA3E42C808A271752EDD8713E8FC268', issns: ['0031-8248', '1539-767X', '1540-4684'] },
			{ name: 'Hypatia', url: 'https://www.cambridge.org/core/rss/product/id/F3D70AB528A9726BC052F1AEB771A611', issns: ['0887-5367', '1527-2001'] },
			{ name: 'The Review of Symbolic Logic', url: 'https://www.cambridge.org/core/rss/product/id/6105F288191A4492745CEC41BAFD283A', issns: ['1755-0203', '1755-0211'] },
			{ name: 'The Journal of Symbolic Logic', url: 'https://www.cambridge.org/core/rss/product/id/56ED3BA46977662562A26BC04DD604FD', issns: ['0022-4812', '1943-5886'] },
			{ name: 'Bulletin of Symbolic Logic', url: 'https://www.cambridge.org/core/rss/product/id/F7268973893D3981F1B17A2E10347229', issns: ['1079-8986', '1943-5894'] },
			{ name: 'Social Philosophy and Policy', url: 'https://www.cambridge.org/core/rss/product/id/009D0E6E344F5D44FF9E2D43B955E1F4', issns: ['0265-0525', '1471-6437'] },
			{ name: 'Legal Theory', url: 'https://www.cambridge.org/core/rss/product/id/18A6812B8458E126051E21F835520816', issns: ['1352-3252', '1469-8048'] },
		]
	},
	{
		topic: POLITICS_TOPIC, feeds: [
			{ name: 'International Studies Quarterly', url: 'https://academic.oup.com/rss/site_5394/3255.xml', issns: ['0020-8833', '1468-2478'] },
			{ name: 'Public Opinion Quarterly', url: 'https://academic.oup.com/rss/site_5502/3363.xml', issns: ['0033-362X', '1537-5331'] },
			{ name: 'Political Analysis', url: 'https://www.cambridge.org/core/rss/product/id/EEF1D4438BAB8498B2A647F9DBC47AA7', issns: ['1047-1987', '1476-4989'] },
			{ name: 'Political Science Quarterly', url: 'https://academic.oup.com/rss/site_6505/4143.xml', issns: ['0032-3195', '1538-165X'] },
			{ name: 'American Political Science Review', url: 'https://www.cambridge.org/core/rss/product/id/833A7242AC7B607BA7F6168DA072DB3B', issns: ['0003-0554', '1537-5943'] },
			{ name: 'British Journal of Political Science', url: 'https://www.cambridge.org/core/rss/product/id/FD38AC39CC0E8A315361CDF266B85A14', issns: ['0007-1234', '1469-2112'] },
			{ name: 'Perspectives on Politics', url: 'https://www.cambridge.org/core/rss/product/id/34496D0437DEA81D55F7EC7F2AC35018', issns: ['1537-5927', '1541-0986'] },
			{ name: 'International Organization', url: 'https://www.cambridge.org/core/rss/product/id/146C8B1E6606CE283EBC5B10B255F4C0', issns: ['0020-8183', '1531-5088'] },
			{ name: 'World Politics', url: 'https://www.cambridge.org/core/rss/product/id/A44674D47342D5A8F85F9FF5A0AFDC43', issns: ['0043-8871', '1086-3338'] },
			{ name: 'PS: Political Science & Politics', url: 'https://www.cambridge.org/core/rss/product/id/DACDE76A4E1D287359185FE191ACDEDC', issns: ['0030-8269', '1049-0965', '1537-5935', '2325-7172'] },
			{ name: 'Government and Opposition', url: 'https://www.cambridge.org/core/rss/product/id/39EFCD4861CFEA75065FEEDD9AF22D26', issns: ['0017-257X', '1477-7053'] },
			{ name: 'Review of International Studies', url: 'https://www.cambridge.org/core/rss/product/id/3B772FE5B36675FAF450722547F58DF7', issns: ['0260-2105', '1469-9044'] },
			{ name: 'Political Science Research and Methods', url: 'https://www.cambridge.org/core/rss/product/id/1D739B93871EC423716B286A38E9BD5F', issns: ['2049-8470', '2049-8489'] },
			{ name: 'Journal of Experimental Political Science', url: 'https://www.cambridge.org/core/rss/product/id/21823F867AA0CEB8F70A06EEE0E35B09', issns: ['2052-2630', '2052-2649'] },
			{ name: 'International Theory', url: 'https://www.cambridge.org/core/rss/product/id/23CCDF908E7F2FED152050B2C7BDFE71', issns: ['1752-9719', '1752-9727'] },
			{ name: 'Journal of Public Policy', url: 'https://www.cambridge.org/core/rss/product/id/36840434E1E3E412FFAA6832AA9488AA', issns: ['0143-814X', '1469-7815'] },
			{ name: 'The Review of Politics', url: 'https://www.cambridge.org/core/rss/product/id/F2DB6A376929AFCA5BBE69781E206892', issns: ['0034-6705', '1748-6858'] },
			{ name: 'Politics & Gender', url: 'https://www.cambridge.org/core/rss/product/id/7DE2C645F007C3B59362A873FC051EC3', issns: ['1743-923X', '1743-9248'] },
			{ name: 'Ethics & International Affairs', url: 'https://www.cambridge.org/core/rss/product/id/C897DA23C0F3FC24F9B5B6471FF71C56', issns: ['0892-6794', '1747-7093'] },
		]
	},
	{
		topic: ANTHROPOLOGY_TOPIC, feeds: [
			{ name: 'American Anthropologist', url: 'https://anthrosource.onlinelibrary.wiley.com/feed/15481433/most-recent', issns: ['0002-7294', '1548-1433'] },
			{ name: 'American Ethnologist', url: 'https://anthrosource.onlinelibrary.wiley.com/feed/15481425/most-recent', issns: ['0094-0496', '1548-1425'] },
			{ name: 'Journal of the Royal Anthropological Institute', url: 'https://rai.onlinelibrary.wiley.com/feed/14679655/most-recent', issns: ['1359-0987', '1467-9655'] },
			{ name: 'Anthropology Today', url: 'https://rai.onlinelibrary.wiley.com/feed/14678322/most-recent', issns: ['0268-540X', '1467-8322'] },
			{ name: 'Medical Anthropology Quarterly', url: 'https://anthrosource.onlinelibrary.wiley.com/feed/15481387/most-recent', issns: ['0745-5194', '1548-1387'] },
			{ name: 'American Journal of Biological Anthropology', url: 'https://onlinelibrary.wiley.com/feed/26927691/most-recent', issns: ['2692-7691'] },
			{ name: 'Current Anthropology', url: 'https://www.journals.uchicago.edu/action/showFeed?type=etoc&feed=rss&jc=ca', issns: ['0011-3204', '1537-5382'] },
			{ name: 'HAU: Journal of Ethnographic Theory', url: 'https://www.journals.uchicago.edu/action/showFeed?type=etoc&feed=rss&jc=hau', issns: ['2049-1115', '2575-1433'] },
			{ name: 'Africa', url: 'https://www.cambridge.org/core/rss/product/id/E25CAC1112BFD1A7778A0C279A4B8520', issns: ['0001-9720', '1750-0184'] },
			{ name: 'Evolutionary Human Sciences', url: 'https://www.cambridge.org/core/rss/product/id/F9A99C4602D4F4A5277A9D3A04AE7353', issns: ['2513-843X'] },
			{ name: 'Ethnos', url: 'https://www.tandfonline.com/feed/rss/retn20', issns: ['0014-1844', '1469-588X'] },
			{ name: 'Critique of Anthropology', url: 'https://journals.sagepub.com/action/showFeed?ui=0&mi=ehikzz&ai=2b4&jc=coaa&type=etoc&feed=rss', issns: ['0308-275X', '1460-3721'] },
		]
	},
	{
		topic: LITERATURE_TOPIC, feeds: [
			{ name: 'American Literary History', url: 'https://academic.oup.com/rss/site_5134/2995.xml', issns: ['0896-7148', '1468-4365'] },
			{ name: 'Essays in Criticism', url: 'https://academic.oup.com/rss/site_5159/3022.xml', issns: ['0014-0856', '1471-6852'] },
			{ name: 'English: Journal of the English Association', url: 'https://academic.oup.com/rss/site_5449/3310.xml', issns: ['0013-8215', '1756-1124'] },
			{ name: 'French Studies', url: 'https://academic.oup.com/rss/site_5458/3319.xml', issns: ['0016-1128', '1468-2931'] },
			{ name: 'Contemporary Women\'s Writing', url: 'https://academic.oup.com/rss/site_5153/3016.xml', issns: ['1754-1476', '1754-1484'] },
			{ name: 'The Cambridge Quarterly', url: 'https://academic.oup.com/rss/site_5439/3300.xml', issns: ['0008-199X', '1471-6836'] },
			{ name: 'The Review of English Studies', url: 'https://academic.oup.com/rss/site_5239/3107.xml', issns: ['0034-6551', '1471-6968'] },
			{ name: 'Notes and Queries', url: 'https://academic.oup.com/rss/site_5224/3090.xml', issns: ['0029-3970', '1471-6941'] },
			{ name: 'PMLA', url: 'https://www.cambridge.org/core/rss/product/id/07F2113A6102086C3A7ACB66527ACE68', issns: ['0030-8129', '1938-1530'] },
			{ name: 'Victorian Literature and Culture', url: 'https://www.cambridge.org/core/rss/product/id/97B87C895706550CBFD1375745C3042E', issns: ['1060-1503', '1470-1553'] },
			{ name: 'Journal of American Studies', url: 'https://www.cambridge.org/core/rss/product/id/6809E89819E4BB6F6C96CB367CB84811', issns: ['0021-8758', '1469-5154'] },
			{ name: 'Adaptation', url: 'https://academic.oup.com/rss/site_5133/2994.xml', issns: ['1755-0637', '1755-0645'] },
			{ name: 'English Literary Renaissance', url: 'https://www.journals.uchicago.edu/action/showFeed?type=etoc&feed=rss&jc=elr', issns: ['0013-8312', '1475-6757'] },
		]
	},
	{
		topic: LINGUISTICS_TOPIC, feeds: [
			{ name: 'Applied Linguistics', url: 'https://academic.oup.com/rss/site_5135/2996.xml', issns: ['0142-6001', '1477-450X'] },
			{ name: 'International Journal of Lexicography', url: 'https://academic.oup.com/rss/site_5173/3037.xml', issns: ['0950-3846', '1477-4577'] },
			{ name: 'ELT Journal', url: 'https://academic.oup.com/rss/site_5157/3020.xml', issns: ['0951-0893', '1477-4526'] },
		]
	},
	{
		topic: CLASSICS_TOPIC, feeds: [
			{ name: 'The Classical Quarterly', url: 'https://www.cambridge.org/core/rss/product/id/98B56E98F6176CC085C2D10BEF5DA258', issns: ['0009-8388', '1471-6844'] },
			{ name: 'The Journal of Roman Studies', url: 'https://www.cambridge.org/core/rss/product/id/BA980D59E9AEBA8C479580B6318BE61E', issns: ['0075-4358', '1753-528X'] },
			{ name: 'The Journal of Hellenic Studies', url: 'https://www.cambridge.org/core/rss/product/id/418FBC31C3986A237F081A8F7FBD9E8E', issns: ['0075-4269', '2041-4099'] },
			{ name: 'Greece & Rome', url: 'https://www.cambridge.org/core/rss/product/id/CB0C36C82F3B53F734AB9A46755F0144', issns: ['0017-3835', '1477-4550'] },
			{ name: 'Bryn Mawr Classical Review', url: 'https://bmcr.brynmawr.edu/feed/', issns: ['1055-7660'] },
			{ name: 'Classical Receptions Journal', url: 'https://academic.oup.com/rss/site_5152/3015.xml', issns: ['1759-5134', '1759-5142'] },
			{ name: 'Society for Classical Studies', url: 'https://classicalstudies.org/rss.xml' },
			{ name: 'Antigone', url: 'https://antigonejournal.com/feed/' },
		]
	},
	{
		topic: RELIGION_TOPIC, feeds: [
			{ name: 'Journal of the American Academy of Religion', url: 'https://academic.oup.com/rss/site_5469/3330.xml', issns: ['0002-7189', '1477-4585'] },
			{ name: 'The Journal of Theological Studies', url: 'https://academic.oup.com/rss/site_5215/3081.xml', issns: ['0022-5185', '1477-4607'] },
			{ name: 'Journal of Islamic Studies', url: 'https://academic.oup.com/rss/site_5474/3335.xml', issns: ['0955-2340', '1471-6917'] },
			{ name: 'Modern Judaism', url: 'https://academic.oup.com/rss/site_5490/3351.xml', issns: ['0276-1114', '1086-3273'] },
			{ name: 'Sociology of Religion', url: 'https://academic.oup.com/rss/site_5518/3379.xml', issns: ['1069-4404', '1759-8818'] },
			{ name: 'Journal of Church and State', url: 'https://academic.oup.com/rss/site_5471/3332.xml', issns: ['0021-969X', '2040-4867'] },
			{ name: 'Oxford Journal of Law and Religion', url: 'https://academic.oup.com/rss/site_5229/3096.xml', issns: ['2047-0770', '2047-0789'] },
			{ name: 'Harvard Theological Review', url: 'https://www.cambridge.org/core/rss/product/id/F1768E6E180CAD06C94C302E6E4DE3F9', issns: ['0017-8160', '1475-4517'] },
			{ name: 'The Journal of Ecclesiastical History', url: 'https://www.cambridge.org/core/rss/product/id/8EF6696C5F923E985C82359461BA4F16', issns: ['0022-0469', '1469-7637'] },
			{ name: 'Religious Studies', url: 'https://www.cambridge.org/core/rss/product/id/38601D210B54555BDB22082CECA7B6CC', issns: ['0034-4125', '1469-901X'] },
			{ name: 'New Testament Studies', url: 'https://www.cambridge.org/core/rss/product/id/3028542C9346770331D11438F2A985CE', issns: ['0028-6885', '1469-8145'] },
			{ name: 'Church History', url: 'https://www.cambridge.org/core/rss/product/id/1F2C13B2F24D6E0CBA796873B43F24FB', issns: ['0009-6407', '1755-2613'] },
			{ name: 'Scottish Journal of Theology', url: 'https://www.cambridge.org/core/rss/product/id/7513691B30575F8675DF7AC00C63A59E', issns: ['0036-9306', '0336-9306', '1475-3065'] },
			{ name: 'Journal of Law and Religion', url: 'https://www.cambridge.org/core/rss/product/id/8E27515A8B4162AD2B5762D81F70612A', issns: ['0748-0814', '2163-3088'] },
			{ name: 'Politics and Religion', url: 'https://www.cambridge.org/core/rss/product/id/8D26C11BBFAEB43F361AA24FA1C22A5D', issns: ['1755-0483', '1755-0491'] },
			{ name: 'Horizons', url: 'https://www.cambridge.org/core/rss/product/id/CFCB1ABDC679F449B38FC7EA5DB5FA67', issns: ['0360-9669', '2050-8557'] },
		]
	},
	{
		topic: ART_TOPIC, feeds: [
			{ name: 'The British Journal of Aesthetics', url: 'https://academic.oup.com/rss/site_5432/3293.xml', issns: ['0007-0904', '1468-2842'] },
			{ name: 'Oxford Art Journal', url: 'https://academic.oup.com/rss/site_5227/3094.xml', issns: ['0142-6540', '1741-7287'] },
			{ name: 'Journal of the History of Collections', url: 'https://academic.oup.com/rss/site_5196/3061.xml', issns: ['0954-6650', '1477-8564'] },
			{ name: 'Screen', url: 'https://academic.oup.com/rss/site_5512/3373.xml', issns: ['0036-9543', '0036-9546', '1460-2474'] },
		]
	},
	{
		topic: MUSIC_TOPIC, feeds: [
			{ name: 'Early Music', url: 'https://academic.oup.com/rss/site_5156/3019.xml', issns: ['0306-1078', '1741-7260'] },
			{ name: 'Music and Letters', url: 'https://academic.oup.com/rss/site_5222/3088.xml', issns: ['0027-4224', '1477-4631'] },
			{ name: 'The Musical Quarterly', url: 'https://academic.oup.com/rss/site_5223/3089.xml', issns: ['0027-4631', '1741-8399'] },
			{ name: 'Music Theory Spectrum', url: 'https://academic.oup.com/rss/site_5492/3353.xml', issns: ['0195-6167', '1533-8339'] },
			{ name: 'Cambridge Opera Journal', url: 'https://www.cambridge.org/core/rss/product/id/B8656C3637AB71ED339ECB649E3A2253', issns: ['0954-5867', '1474-0621'] },
			{ name: 'Early Music History', url: 'https://www.cambridge.org/core/rss/product/id/11644322AFB4FBC0AF883A4900A9BD94', issns: ['0261-1279', '1474-0559'] },
			{ name: 'Eighteenth-Century Music', url: 'https://www.cambridge.org/core/rss/product/id/72D4515362DF3356A3516CE24F95320D', issns: ['1478-5706', '1478-5714'] },
			{ name: 'Twentieth-Century Music', url: 'https://www.cambridge.org/core/rss/product/id/70A7BC24C500674E425B00ACD7686CCE', issns: ['1478-5722', '1478-5730'] },
			{ name: 'Nineteenth-Century Music Review', url: 'https://www.cambridge.org/core/rss/product/id/6B98E6E99E55CAB91DA71FB67931239A', issns: ['1479-4098', '2044-8414'] },
			{ name: 'Journal of the Royal Musical Association', url: 'https://www.cambridge.org/core/rss/product/id/5387250D5659E9F0AADB7D3CDD13FCA9', issns: ['0269-0403', '1471-6933'] },
			{ name: 'Journal of the Society for American Music', url: 'https://www.cambridge.org/core/rss/product/id/9F21D07D88FC5FE60B6CE258C3CC9F75', issns: ['1752-1963', '1752-1971'] },
			{ name: 'Plainsong & Medieval Music', url: 'https://www.cambridge.org/core/rss/product/id/C24169BB4C400DAF51A47772319980F0', issns: ['0961-1371', '1474-0087'] },
			{ name: 'Popular Music', url: 'https://www.cambridge.org/core/rss/product/id/AA802B5FB44548E5E91440EA9E0D909F', issns: ['0261-1430', '1474-0095'] },
			{ name: 'Tempo', url: 'https://www.cambridge.org/core/rss/product/id/A18B74AE295AE4BE0CBF89E65B9B0EC5', issns: ['0040-2982', '1474-2286', '1478-2286'] },
			{ name: 'Organised Sound', url: 'https://www.cambridge.org/core/rss/product/id/F662F87343B7F7B98D1E3A6E5A1B21E1', issns: ['1355-7718', '1469-8153'] },
			{ name: 'Jazz Perspectives', url: 'https://www.tandfonline.com/feed/rss/rjaz20', issns: ['1749-4060', '1749-4079'] },
			{ name: 'JazzTimes', url: 'https://jazztimes.com/feed/' },
			{ name: 'Jazz Journal', url: 'https://jazzjournal.co.uk/feed/' },
			{ name: 'NPR Jazz', url: 'https://feeds.npr.org/10002/rss.xml' },
			{ name: 'The Syncopated Times', url: 'https://syncopatedtimes.com/feed/' },
		]
	},
	{
		topic: THEATRE_TOPIC, feeds: [
			{ name: 'Contemporary Theatre Review', url: 'https://www.tandfonline.com/feed/rss/gctr20', issns: ['1048-6801', '1477-2264'] },
			{ name: 'Performance Research', url: 'https://www.tandfonline.com/feed/rss/rprs20', issns: ['1352-8165', '1469-9990'] },
			{ name: 'Studies in Theatre and Performance', url: 'https://www.tandfonline.com/feed/rss/rstp20', issns: ['1468-2761', '2040-0616'] },
			{ name: 'Theatre, Dance and Performance Training', url: 'https://www.tandfonline.com/feed/rss/rtdp20', issns: ['1944-3919', '1944-3927'] },
			{ name: 'Research in Drama Education', url: 'https://www.tandfonline.com/feed/rss/crde20', issns: ['1356-9783', '1470-112X'] },
			{ name: 'Text and Performance Quarterly', url: 'https://www.tandfonline.com/feed/rss/rtpq20', issns: ['0734-0796', '1046-2937', '1479-5760', '2331-4400'] },
			{ name: 'Theatre Survey', url: 'https://www.cambridge.org/core/rss/product/id/4C30206EDB0BDB40CA14E8B2AB6C3D9D', issns: ['0040-5574', '1475-4533'] },
			{ name: 'New Theatre Quarterly', url: 'https://www.cambridge.org/core/rss/product/id/5138523CFE819020EBB248E389972C0B', issns: ['0266-464X', '1474-0613'] },
			{ name: 'Theatre Research International', url: 'https://www.cambridge.org/core/rss/product/id/03BBCE358C9E7D0F423FF3EBA6A75381', issns: ['0307-8833', '1474-0672'] },
			{ name: 'Dance Research Journal', url: 'https://www.cambridge.org/core/rss/product/id/CFB5D61CF3EE0F872FAEADF72102ABEC', issns: ['0149-7677', '1940-509X'] },
		]
	},
	{
		topic: ARCHITECTURE_TOPIC, feeds: [
			{ name: 'Journal of Architectural Education', url: 'https://www.tandfonline.com/feed/rss/rjae20', issns: ['1046-4883', '1531-314X'] },
			{ name: 'The Journal of Architecture', url: 'https://www.tandfonline.com/feed/rss/rjar20', issns: ['1360-2365', '1466-4410'] },
			{ name: 'Architectural Science Review', url: 'https://www.tandfonline.com/feed/rss/tasr20', issns: ['0003-8628', '1758-9622'] },
			{ name: 'Journal of Urban Design', url: 'https://www.tandfonline.com/feed/rss/cjud20', issns: ['1357-4809', '1469-9664'] },
			{ name: 'Planning Perspectives', url: 'https://www.tandfonline.com/feed/rss/rppe20', issns: ['0266-5433', '1466-4518'] },
			{ name: 'Architecture and Culture', url: 'https://www.tandfonline.com/feed/rss/rfac20', issns: ['2050-7828', '2050-7836'] },
			{ name: 'Journal of Design History', url: 'https://academic.oup.com/rss/site_5472/3333.xml', issns: ['0952-4649', '1741-7279'] },
			{ name: 'Dezeen', url: 'https://www.dezeen.com/feed/' },
			{ name: 'ArchDaily', url: 'https://www.archdaily.com/feed' },
			{ name: 'Architectural History', url: 'https://www.cambridge.org/core/rss/product/id/D1FEC648135382964A4CF47A6F5FE8D4', issns: ['0066-622X', '2059-5670'] },
			{ name: 'arq: Architectural Research Quarterly', url: 'https://www.cambridge.org/core/rss/product/id/3386C2CEC752273EE932C4791A47543D', issns: ['1359-1355', '1474-0516'] },
			{ name: 'Urban Studies', url: 'https://journals.sagepub.com/action/showFeed?ui=0&mi=ehikzz&ai=2b4&jc=usja&type=etoc&feed=rss', issns: ['0042-0980', '1360-063X'] },
			{ name: 'Journal of the American Planning Association', url: 'https://www.tandfonline.com/feed/rss/rjpa20', issns: ['0194-4363', '1939-0130'] },
			{ name: 'Cities', url: 'https://rss.sciencedirect.com/publication/science/02642751', issns: ['0264-2751', '1873-6084'] },
			{ name: 'Planetizen', url: 'https://www.planetizen.com/frontpage/feed' },
		]
	},
	{
		topic: AGRICULTURE_TOPIC, feeds: [
			{ name: 'Nature Food', url: 'https://www.nature.com/natfood.rss', issns: ['2662-1355'] },
			{ name: 'Field Crops Research', url: 'https://rss.sciencedirect.com/publication/science/03784290', issns: ['0378-4290', '1872-6852'] },
			{ name: 'Agricultural Systems', url: 'https://rss.sciencedirect.com/publication/science/0308521X', issns: ['0308-521X', '1873-2267'] },
			{ name: 'American Journal of Agricultural Economics', url: 'https://onlinelibrary.wiley.com/feed/14678276/most-recent', issns: ['0002-9092', '1467-8276'] },
			{ name: 'Food Policy', url: 'https://rss.sciencedirect.com/publication/science/03069192', issns: ['0306-9192', '1873-5657'] },
		]
	},
	{
		topic: VETERINARY_TOPIC, feeds: [
			{ name: 'The Veterinary Journal', url: 'https://rss.sciencedirect.com/publication/science/10900233', issns: ['1090-0233', '1532-2971'] },
			{ name: 'Veterinary Record', url: 'https://bvajournals.onlinelibrary.wiley.com/feed/20427670/most-recent', issns: ['0042-4900', '2042-7670'] },
			{ name: 'Preventive Veterinary Medicine', url: 'https://rss.sciencedirect.com/publication/science/01675877', issns: ['0167-5877', '1873-1716'] },
			{ name: 'Frontiers in Veterinary Science', url: 'https://www.frontiersin.org/journals/veterinary-science/rss', issns: ['2297-1769'] },
		]
	},
	{
		topic: ZOOLOGY_TOPIC, feeds: [
			{ name: 'Journal of Zoology', url: 'https://zslpublications.onlinelibrary.wiley.com/feed/14697998/most-recent', issns: ['0952-8369', '1469-7998'] },
			{ name: 'Animal Behaviour', url: 'https://rss.sciencedirect.com/publication/science/00033472', issns: ['0003-3472', '1095-8282'] },
			{ name: 'Journal of Animal Ecology', url: 'https://besjournals.onlinelibrary.wiley.com/feed/13652656/most-recent', issns: ['0021-8790', '1365-2656'] },
			{ name: 'Frontiers in Zoology', url: 'https://link.springer.com/search.rss?facet-journal-id=12983', issns: ['1742-9994'] },
			{ name: 'Zoology', url: 'https://rss.sciencedirect.com/publication/science/09442006', issns: ['0944-2006', '1873-2720'] },
		]
	},
	{
		topic: BOTANY_TOPIC, feeds: [
			{ name: 'Nature Plants', url: 'https://www.nature.com/nplants.rss', issns: ['2055-026X', '2055-0278'] },
			{ name: 'New Phytologist', url: 'https://nph.onlinelibrary.wiley.com/feed/14698137/most-recent', issns: ['0028-646X', '1469-8137'] },
			{ name: 'American Journal of Botany', url: 'https://bsapubs.onlinelibrary.wiley.com/feed/15372197/most-recent', issns: ['0002-9122', '1537-2197'] },
			{ name: 'The Plant Journal', url: 'https://onlinelibrary.wiley.com/feed/1365313x/most-recent', issns: ['0960-7412', '1365-313X'] },
			{ name: 'Frontiers in Plant Science', url: 'https://www.frontiersin.org/journals/plant-science/rss', issns: ['1664-462X'] },
		]
	},
];

/** The feeds Pollis follows at first: the Julia news. The user chooses the rest from the catalogue. */
export const DEFAULT_FEEDS: readonly { readonly url: string; readonly topic: string; readonly name?: string }[] = [
	'https://julialang.org/feed.xml',
	'https://discourse.julialang.org/c/announce/25.rss',
].map(url => ({ url, topic: JULIA_TOPIC }));

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
