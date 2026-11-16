/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

// The market of a Trading Floor game, kept by the facilitator's copy: a continuous limit order book for one asset,
// where each team is a desk with cash and shares. Orders are matched as they come, best price first and, at the same
// price, oldest first, a trade being made at the price of the order already on the book. A desk can buy only with
// the cash its other buy orders do not hold, sell only the shares its other sell orders do not, and never trade with
// itself. Prices are kept in whole ticks, so that no rounding creeps into cash.

import { generateUuid } from '../../../../../base/common/uuid.js';
import { localize } from '../../../../../nls.js';
import { IMarketLevel, IMarketOrder, IMarketPayload, IMarketTrade } from './collaborationProtocol.js';

/** A case's market ([market] in case.toml): the asset, the currency, how long a period trades, the tick, each desk's start, and the limits of an order. */
export interface IMarketSpec {
	readonly asset: string;
	readonly unit: string;
	readonly minutes: number;
	readonly tick: number;
	readonly cash: number;
	readonly shares: number;
	readonly maxOrder: number;
	readonly maxPrice: number;
}

/** A desk's position: its cash in ticks, its shares, and what it bought and sold this period. */
interface IDesk {
	cash: number;
	shares: number;
	bought: number;
	sold: number;
	boughtValue: number;
	soldValue: number;
}

interface IRestingOrder {
	readonly id: string;
	readonly team: number;
	readonly side: 'buy' | 'sell';
	/** In ticks. */
	readonly price: number;
	remaining: number;
	readonly by: string;
	readonly sequence: number;
}

/** A trade of the period, for the round's folder: its price in ticks, the shares, the two desks and who placed each order. */
export interface IMarketFill {
	readonly price: number;
	readonly quantity: number;
	readonly buyer: number;
	readonly seller: number;
	readonly buyerBy: string;
	readonly sellerBy: string;
	readonly time: number;
}

/** What a desk's position was at the close of a period: cash and prices in the case's currency. */
export interface IDeskPosition {
	readonly cash: number;
	readonly shares: number;
	readonly bought: number;
	readonly sold: number;
	readonly averageBuy: number;
	readonly averageSell: number;
}

const MAX_ORDERS_PER_DESK = 20;
const BOOK_LEVELS = 8;
const TRADES_SHOWN = 12;

export class MarketBook {

	private readonly desks = new Map<number, IDesk>();
	private bids: IRestingOrder[] = [];
	private asks: IRestingOrder[] = [];
	private fills: IMarketFill[] = [];
	private readonly recent: IMarketTrade[] = [];
	private lastPrice: number | undefined;
	private sequence = 0;
	private period = 0;
	private open = false;
	private closesAt = 0;

	constructor(readonly spec: IMarketSpec, teams: readonly number[]) {
		for (const team of teams) {
			this.desks.set(team, { cash: this.ticks(spec.cash), shares: spec.shares, bought: 0, sold: 0, boughtValue: 0, soldValue: 0 });
		}
	}

	/** When the period being traded closes, as the facilitator's clock tells it. */
	get closingTime(): number {
		return this.closesAt;
	}

	/** Whether orders are taken now. */
	isOpen(now = Date.now()): boolean {
		return this.open && now < this.closesAt;
	}

	/** Opens a period for spec.minutes from now, each desk's buying and selling counted afresh. */
	openPeriod(round: number, now = Date.now()): void {
		this.period = round;
		this.open = true;
		this.closesAt = now + this.spec.minutes * 60_000;
		this.fills = [];
		for (const desk of this.desks.values()) {
			desk.bought = desk.sold = desk.boughtValue = desk.soldValue = 0;
		}
	}

	/** Closes the period: no more orders, and those on the book are cancelled. */
	closePeriod(): void {
		this.open = false;
		this.bids = [];
		this.asks = [];
	}

	/** Places a desk's order, matching it against the book; says why when it is refused. */
	place(team: number, by: string, side: 'buy' | 'sell', price: number, quantity: number, now = Date.now()): string | undefined {
		const desk = this.desks.get(team);
		if (!desk || !this.isOpen(now)) {
			return localize('market.closed', "The market is closed: orders are taken while a period is being traded.");
		}
		if (!Number.isInteger(quantity) || quantity < 1 || quantity > this.spec.maxOrder) {
			return localize('market.badQuantity', "An order is for a whole number of shares, from 1 to {0}.", this.spec.maxOrder);
		}
		const ticks = this.ticks(price);
		if (!Number.isFinite(ticks) || ticks < 1 || ticks > this.ticks(this.spec.maxPrice)) {
			return localize('market.badPrice', "A price is from {0} to {1}.", this.moneyText(1), this.moneyText(this.ticks(this.spec.maxPrice)));
		}
		if (this.bids.concat(this.asks).filter(order => order.team === team).length >= MAX_ORDERS_PER_DESK) {
			return localize('market.tooManyOrders', "Your desk has {0} orders on the book: cancel one first.", MAX_ORDERS_PER_DESK);
		}
		const own = side === 'buy' ? this.asks.find(order => order.team === team && order.price <= ticks) : this.bids.find(order => order.team === team && order.price >= ticks);
		if (own) {
			return localize('market.selfTrade', "It would trade with your own desk's order at {0}: cancel that order first.", this.moneyText(own.price));
		}
		if (side === 'buy' && ticks * quantity > desk.cash - this.held(team, 'buy')) {
			return localize('market.noCash', "Your desk has {0} of cash not held by its other orders: not enough to buy {1} shares at {2}.", this.moneyText(desk.cash - this.held(team, 'buy')), quantity, this.moneyText(ticks));
		}
		if (side === 'sell' && quantity > desk.shares - this.held(team, 'sell')) {
			return localize('market.noShares', "Your desk has {0} shares not held by its other orders: it cannot sell {1}.", desk.shares - this.held(team, 'sell'), quantity);
		}
		let remaining = quantity;
		const book = side === 'buy' ? this.asks : this.bids;
		while (remaining > 0 && book.length && (side === 'buy' ? book[0].price <= ticks : book[0].price >= ticks)) {
			const resting = book[0];
			const traded = Math.min(remaining, resting.remaining);
			this.fill(side === 'buy' ? team : resting.team, side === 'buy' ? resting.team : team, side === 'buy' ? by : resting.by, side === 'buy' ? resting.by : by, resting.price, traded, now);
			remaining -= traded;
			resting.remaining -= traded;
			if (!resting.remaining) {
				book.shift();
			}
		}
		if (remaining) {
			const order: IRestingOrder = { id: generateUuid(), team, side, price: ticks, remaining, by, sequence: this.sequence++ };
			const list = side === 'buy' ? this.bids : this.asks;
			list.push(order);
			list.sort((a, b) => (side === 'buy' ? b.price - a.price : a.price - b.price) || a.sequence - b.sequence);
		}
		return undefined;
	}

	/** Cancels one of a desk's orders; false when it has no such order. */
	cancel(team: number, id: string): boolean {
		for (const list of [this.bids, this.asks]) {
			const index = list.findIndex(order => order.id === id && order.team === team);
			if (index >= 0) {
				list.splice(index, 1);
				return true;
			}
		}
		return false;
	}

	/** The market as a player sees it: the book, the last trades and, for a team, its desk. */
	view(team?: number, now = Date.now()): IMarketPayload {
		const levels = (orders: readonly IRestingOrder[]): IMarketLevel[] => {
			const result: { price: number; quantity: number }[] = [];
			for (const order of orders) {
				const level = result.at(-1);
				if (level && level.price === order.price) {
					level.quantity += order.remaining;
				} else if (result.length < BOOK_LEVELS) {
					result.push({ price: order.price, quantity: order.remaining });
				} else {
					break;
				}
			}
			return result.map(level => ({ price: this.money(level.price), quantity: level.quantity }));
		};
		const desk = team === undefined ? undefined : this.desks.get(team);
		const orders = (team === undefined ? [] : this.bids.concat(this.asks).filter(order => order.team === team)).map((order): IMarketOrder => ({ id: order.id, side: order.side, price: this.money(order.price), quantity: order.remaining, by: order.by }));
		return {
			round: this.period,
			open: this.isOpen(now),
			remaining: Math.max(0, Math.round((this.closesAt - now) / 1000)),
			asset: this.spec.asset,
			unit: this.spec.unit,
			tick: this.spec.tick,
			maxOrder: this.spec.maxOrder,
			bids: levels(this.bids),
			asks: levels(this.asks),
			trades: this.recent.slice(-TRADES_SHOWN).reverse(),
			...(this.lastPrice !== undefined ? { last: this.money(this.lastPrice) } : {}),
			volume: this.fills.reduce((sum, item) => sum + item.quantity, 0),
			...(desk ? { desk: { cash: this.money(desk.cash), shares: desk.shares, orders } } : {}),
		};
	}

	/** Each desk's position, in the case's currency. */
	positions(): Map<number, IDeskPosition> {
		return new Map([...this.desks].map(([team, desk]) => [team, {
			cash: this.money(desk.cash),
			shares: desk.shares,
			bought: desk.bought,
			sold: desk.sold,
			averageBuy: desk.bought ? this.money(desk.boughtValue) / desk.bought : 0,
			averageSell: desk.sold ? this.money(desk.soldValue) / desk.sold : 0,
		}]));
	}

	/** The period's trades, and its last, average, highest and lowest prices and volume; prices 0 when nothing traded. */
	summary(): { readonly fills: readonly IMarketFill[]; readonly last: number; readonly average: number; readonly high: number; readonly low: number; readonly volume: number } {
		const volume = this.fills.reduce((sum, item) => sum + item.quantity, 0);
		const value = this.fills.reduce((sum, item) => sum + item.price * item.quantity, 0);
		return {
			fills: this.fills,
			last: this.lastPrice === undefined ? 0 : this.money(this.lastPrice),
			average: volume ? this.money(value) / volume : 0,
			high: this.fills.length ? this.money(Math.max(...this.fills.map(item => item.price))) : 0,
			low: this.fills.length ? this.money(Math.min(...this.fills.map(item => item.price))) : 0,
			volume,
		};
	}

	/** A price in ticks as money. */
	money(ticks: number): number {
		return Math.round(ticks * this.spec.tick * 1e6) / 1e6;
	}

	/** An amount in ticks as the players read it, with the currency and the tick's decimals, such as GBP4,250.50 when the unit is GBP. */
	private moneyText(ticks: number): string {
		const decimals = Math.max(0, Math.min(6, Math.ceil(-Math.log10(this.spec.tick) - 1e-9)));
		return this.spec.unit + this.money(ticks).toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
	}

	private ticks(amount: number): number {
		return Math.round(amount / this.spec.tick);
	}

	/** The cash a desk's buy orders hold, in ticks, or the shares its sell orders do. */
	private held(team: number, side: 'buy' | 'sell'): number {
		return (side === 'buy' ? this.bids : this.asks).filter(order => order.team === team).reduce((sum, order) => sum + (side === 'buy' ? order.price * order.remaining : order.remaining), 0);
	}

	private fill(buyer: number, seller: number, buyerBy: string, sellerBy: string, price: number, quantity: number, time: number): void {
		const buy = this.desks.get(buyer)!;
		const sell = this.desks.get(seller)!;
		buy.cash -= price * quantity;
		buy.shares += quantity;
		buy.bought += quantity;
		buy.boughtValue += price * quantity;
		sell.cash += price * quantity;
		sell.shares -= quantity;
		sell.sold += quantity;
		sell.soldValue += price * quantity;
		this.fills.push({ price, quantity, buyer, seller, buyerBy, sellerBy, time });
		this.recent.push({ price: this.money(price), quantity, time });
		if (this.recent.length > TRADES_SHOWN) {
			this.recent.shift();
		}
		this.lastPrice = price;
	}
}

/** On a player's side, the market as the facilitator sent it, checked: undefined when it is not one. */
export function checkedMarket(value: unknown): IMarketPayload | undefined {
	if (!value || typeof value !== 'object') {
		return undefined;
	}
	const market = value as Record<string, unknown>;
	const finite = (item: unknown): item is number => typeof item === 'number' && Number.isFinite(item);
	const text = (item: unknown, length: number) => typeof item === 'string' ? item.slice(0, length) : '';
	if (!finite(market.round) || !finite(market.remaining) || !finite(market.tick) || !finite(market.maxOrder) || !finite(market.volume) || typeof market.asset !== 'string') {
		return undefined;
	}
	const levels = (list: unknown): IMarketLevel[] => (Array.isArray(list) ? list : []).slice(0, BOOK_LEVELS).flatMap(item => item && typeof item === 'object' && finite(item.price) && finite(item.quantity) ? [{ price: item.price, quantity: item.quantity }] : []);
	const trades = (Array.isArray(market.trades) ? market.trades : []).slice(0, TRADES_SHOWN).flatMap((item): IMarketTrade[] => item && typeof item === 'object' && finite(item.price) && finite(item.quantity) && finite(item.time) ? [{ price: item.price, quantity: item.quantity, time: item.time }] : []);
	const desk = market.desk && typeof market.desk === 'object' ? market.desk as Record<string, unknown> : undefined;
	const orders = (Array.isArray(desk?.orders) ? desk.orders : []).slice(0, MAX_ORDERS_PER_DESK).flatMap((item): IMarketOrder[] => item && typeof item === 'object' && typeof item.id === 'string' && (item.side === 'buy' || item.side === 'sell') && finite(item.price) && finite(item.quantity)
		? [{ id: item.id.slice(0, 60), side: item.side, price: item.price, quantity: item.quantity, by: text(item.by, 80) }] : []);
	return {
		round: market.round,
		open: market.open === true,
		remaining: market.remaining,
		asset: text(market.asset, 80),
		unit: text(market.unit, 10),
		tick: market.tick,
		maxOrder: market.maxOrder,
		bids: levels(market.bids),
		asks: levels(market.asks),
		trades,
		...(finite(market.last) ? { last: market.last } : {}),
		volume: market.volume,
		...(desk && finite(desk.cash) && finite(desk.shares) ? { desk: { cash: desk.cash, shares: desk.shares, orders } } : {}),
		...(typeof market.refused === 'string' && market.refused ? { refused: text(market.refused, 400) } : {}),
	};
}
