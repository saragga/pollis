# Limit Order Book

`LimitOrderBook.jl` (Philippe Casgrain, MIT licence, unregistered) is an in-memory matching engine for a single instrument. It keeps bids and asks in two AVL trees of price levels, each level a first-in-first-out queue, and matches incoming orders in **price-time priority**. It has no notion of time, traders or strategies: the Trading Agents and Limit Order Book models supply those and let the package do all the matching.

## Types

```julia
OrderBook{Sz,Px,Oid,Aid}()   # size, price, order id and account id types
```

The panel uses `OrderBook{Int,Int,Int,Int}`: prices are **whole ticks** (price 100.00 is 10000 with a 0.01 tick). Floating-point prices work too, but a cancellation must quote the order's price exactly, and a price computed two different ways can differ in the last bit.

| Name | Meaning |
|---|---|
| `BUY_ORDER`, `SELL_ORDER` | Order sides (`OrderSide`) |
| `Order` | A resting order: `side`, `size`, `price`, `orderid`, `acctid` |
| `VANILLA_FILLTYPE` | Default: trade what crosses, rest the remainder |
| `IMMEDIATEORCANCEL_FILLTYPE` | Trade what crosses, discard the remainder |

## Functions

| Call | Does | Returns |
|---|---|---|
| `submit_limit_order!(ob, id, side, price, size[, acct])` | Cross if marketable, rest the remainder | `(new_open_order, matches, left_to_trade)` |
| `submit_market_order!(ob, side, size)` | Walk the opposite side | `(matches, left_to_trade)` |
| `submit_market_order_byfunds!(ob, side, funds)` | Market order for an amount of cash | `(matches, funds_left)` |
| `cancel_order!(ob, id, side, price)` | Remove a resting order | The order, or `nothing` |
| `best_bid_ask(ob)` | Best quotes | `(bid, ask)`, `nothing` for an empty side |
| `book_depth_info(ob, depth)` | Top `depth` price levels per side | `Dict(:BID => Dict(:price, :volume, :orders), :ASK => ...)` |
| `volume_bid_ask(ob)`, `n_orders_bid_ask(ob)` | Total shares and orders per side | `(bid, ask)` |
| `get_acct(ob, acct)` | Open orders of an account | Order map or `nothing` |
| `clear_book!(ob, n)` | Remove all orders beyond the best `n` levels per side | Cleared orders |

`matches` lists the resting orders that traded, with the price and the size filled from each.

## Example: Walking the Book

```julia
using LimitOrderBook
ob = OrderBook{Int,Int,Int,Int}()
for (id, px, sz) in [(1, 10_001, 2), (2, 10_002, 3), (3, 10_004, 5)]
    submit_limit_order!(ob, id, SELL_ORDER, px, sz)
end
fills, left = submit_market_order!(ob, BUY_ORDER, 4)
[(o.price, o.size) for o in fills]   # [(10001, 2), (10002, 2)]: the order took two levels
best_bid_ask(ob)                     # (nothing, 10002): one share left at 100.02
```

## Known Issues (version 0.1.0)

| Issue | Effect | Panel workaround |
|---|---|---|
| The sell-side cross test compares the limit price with the best **ask** instead of the best bid | A marketable sell limit order is neither matched nor rested: it is silently dropped | Marketable orders are sent as one-share market orders, which is identical for one-share orders |
| `pop_order!` lowers the order count even when the order id is not at that price | Cancelling an order that has already traded corrupts `n_orders_bid_ask` | Filled orders are removed from the panel's list of live orders, so they are never cancelled |
| No compat bound on AVLTrees, whose 0.4.0 release removed `findkey` | A fresh install fails with `UndefVarError: findkey not defined` | Pollis installs a fork that bounds AVLTrees to 0.3 |
| `FILLORKILL_ORDER` is exported but not defined | `using LimitOrderBook` cannot reach the fill-or-kill mode by that name | Not used; it is defined as `LimitOrderBook.FILLORKILL_FILLTYPE` |

Pollis installs the fork [Trumpingtons/LimitOrderBook.jl](https://github.com/Trumpingtons/LimitOrderBook.jl), which fixes the first three issues (pull request [#9](https://github.com/p-casgrain/LimitOrderBook.jl/pull/9) upstream). The panel code keeps its workarounds, so it gives the same results on either version.

With the sell-side bug fixed, orders of more than one share could be sent as limit orders that take what crosses and rest the rest, which is the natural extension to variable order sizes.

## See Also
- [Factsheet](factsheet.md) · [Overview](overview.md) · [Assumptions](assumptions.md) · [Trading Agents](trading-agents.md) · [Market Microstructure](market-microstructure.md)
