# Bitget AI Base Camp Hackathon S2 — submission

Everything here is assembled from the Bitget AI Base Camp Hackathon S2 handbook
and from facts verified in this repository. Numbers marked **observed** are
produced by the repo's own test suite (`npm test`, 84/84) or recorded runs.
Nothing is estimated unless it says so.

**Deadline (extended): 2026-10-11.**
The handbook still lists 9/21 with winners announced 10/8. The extension to
10/11 was confirmed by the project owner outside the handbook — submitting into
a closed window may not be accepted, so confirm in the official Telegram before
relying on it.

**Entry:** Track 3 · AI Trading Desk · sub-theme **Execution Assistance**.
Reasoning in "Why this track" below.

---

## Part 1 · Thesis

**Why this exists.** Conventional trading AI presents a confident conclusion
with a list of citations underneath. The citations assert relevance; they do not
measure influence. A thesis that rests entirely on one macro note looks
identical to one resting on four independent confirmations, because both cite
four sources. Nothing in the output says which is which.

The gap is worse on a 7×24 market. Tokenized US stocks trade through the
weekend on synthetic narrative while the reference exchange is shut. An AI
assistant that reasons over Sunday chatter produces a Monday-looking conviction
from no institutional liquidity at all — and the retail trader holding 3x
weekend leverage is the one liquidated at the 09:30 ET opening gap.

**The core hypothesis:** the useful question about an AI trading conclusion is
not "how confident is it" but **"which of my sources is actually load-bearing,
and what is the conclusion resting on when the market is shut."** Influence
should be measured by counterfactual removal, not asserted by citation.

**How Sounding measures it.** Attribution by removal: take the derived
conclusion, remove one source, re-derive, and see whether the conclusion
changes. Remove pairs too. The set whose removal alters the conclusion is the
load-bearing set. Everything else is cosmetic — however many citations it has.

On top of that, **inherited market-clock anchoring**: every load-bearing source
carries the verdict of the reference exchange at the moment it was captured. If
the conclusion rests on a source retrieved while NASDAQ/NYSE was SHUT, it is
tagged `Resting on Unanchored Ground`, because Sunday narrative is not Monday
liquidity.

**The demo that shows it.** Select the preloaded rNVDA case study (3x long).
The baseline says BULLISH citing four sources. Pull `macro-analyst` out of the
foundation and the platform tilts −7° while conviction collapses to NEUTRAL.
Three of the four citations were cosmetic; one was load-bearing. The market
clock reads SHUT. The tripwire arms a downside breach at the 20-EMA. The trader
cancels the order instead of holding weekend leverage into the opening gap.

---

## Part 2 · Target user and product value

**Primary segment: a self-directed retail trader on Bitget Reality holding
tokenized US stock exposure over a weekend, with 1–3x leverage, a directional
thesis assembled from AI research, and no execution desk or risk system behind
them.**

Why this segment and not "all traders":

- They are the only traders exposed to the failure. An institutional desk has a
  risk system that already asks "what breaks this." A retail trader has a chat
  window.
- The weekend is when the trap is live. Bitget's rTokens trade 7×24, so the
  exposure does not pause when NASDAQ does — only the liquidity does.
- Leverage is what converts a bad thesis into a liquidation. The segment that
  uses 1–3x on a weekend is the segment for whom "your conclusion rests on
  Sunday narrative" is the difference between a bad weekend and a margin call.

**Secondary segment: a discretionary or quant trader who wants to know how much
of their AI-generated research is actually doing work** — the same desk, run
against their own sources rather than the preloaded case study.

**What each gets:**

- **Retail weekend trader:** a verdict that says which source is holding the
  conclusion together, whether that source was captured with the market shut,
  and an armed invalidation tripwire — before the order, not in the post-mortem.
- **Research-driven trader:** a measured influence ranking instead of a citation
  list, so a four-source thesis that is really a one-source thesis is visible as
  such.

**What it deliberately does not do:** it never places an order. The runtime
refuses to start without `--read-only` (invariant I5). Zero custody, zero
execution surface. The human decides.

---

## Part 3 · Validation data and key metrics

### Correctness and stability (observed — `npm test`, 84/84)

| Suite | Result |
|---|---|
| Tripwire tests | 10 passed, 0 failed |
| Derive & LLM tests | 16 passed, 0 failed |
| **Total production tests** | **84 passed, 0 failed** |

| Invariant | Status |
|---|---|
| I1–I7 | Verified |
| A1 stability spike | 10/10 PASS |

The invariants are the product's claims stated as tests: deterministic
re-derivation, removal semantics, clock anchoring, and the read-only runtime
boundary among them. The suite is the evidence, and it runs offline with no
credentials.

### The effect the desk is for (observed, in the guided demo)

| Metric | Conventional AI assistant | Sounding |
|---|---|---|
| Attribution model | asserted by citation list | measured by counterfactual removal |
| Market clock awareness | blind — treats Sunday chatter as live liquidity | deterministic NASDAQ/NYSE reference calendar check |
| Fragility discovery | concealed — looks like multi-source consensus | exposed — platform tilts, conviction collapses |
| Trader action | encourages 3x long over the weekend | recommends waiting for Monday 09:30 ET liquidity |
| Capital impact | −14% drawdown (liquidated on Monday gap-down) | capital preserved, tripwire armed at the 20-EMA |
| Execution surface | prompts to trade / connect wallet | strictly `--read-only` |

### Live market inputs (observed)

- Bitget Spot V2 candles for rNVDA, BTC, ETH
- RSI-14, 20-EMA, 50-EMA, MACD computed locally
- Order book depth against structural support
- Five Bitget signal skills (macro, intel, news, sentiment, technical) plus a
  custom user note
- Qwen 3.8 Max via the Bitget gateway for live derivation, with a deterministic
  offline heuristic engine as the instant-demo fallback

### Not measured — stated plainly

- **No paper-trading PnL, no Sharpe, no drawdown on a live book.** Sounding is a
  research desk, not a strategy. It holds no positions and reports no returns;
  inventing them would be the most damaging thing in this submission.
- **No users, no retention, no volume.** The desk has not been distributed.
  *Target:* the guided demo is the distribution claim — a judge reaches the aha
  moment in 60 seconds with no account and no key.
- **The −14% figure is a scenario in the demo**, not a backtest result. It
  illustrates the failure mode; it is not a measured outcome for a user.
- **No fill, price or execution promise of any kind.** The runtime is read-only
  by invariant, not by convention.

### How effective usage would be proven

The desk runs offline with zero credentials. The honest metric is that a judge
can reproduce the finding without an account:

```bash
npm install
npm test          # 84/84, invariants I1–I7, offline
npm run dev       # Overview → Tactical Trading Desk → pull macro-analyst
```

---

## Part 4 · Progress

**Built and verified:**

- Combinatorial attribution by removal — leave-one-out and leave-pair-out
  re-derivation, isolating the minimal load-bearing set
- Inherited market-clock anchoring binding conclusion trust to the reference
  exchange's session
- Foundation visualizer that tilts −7° and collapses conviction when a
  load-bearing source is removed, so the finding is felt rather than read
- Invalidation tripwire armed at structural support (20-EMA), armed before the
  position, not after
- Read-only runtime boundary enforced as an invariant (I5), not a setting
- Deterministic offline engine for instant demo, Qwen 3.8 Max on the Bitget
  gateway for live derivation
- 84/84 tests, invariants I1–I7 verified, A1 stability spike 10/10
- A verdict card that leads the desk with direction, fragility and anchor,
  added in the final frontend pass so the finding is the first thing on screen

**Stack:** TypeScript, Node 24 (`node:sqlite`), React 18, Vite 6, Bitget Spot V2
feeds, Bitget Qwen gateway (`qwen3.8-max`).

**Problems and fixes:**

- **Test import paths and the live-indicator type** were broken across a
  refactor; resolved so the suite runs clean rather than being trimmed.
- **Branding assets were inconsistent** — the logo mark and the banner compass
  emblem had drifted apart; regenerated to match.
- **The verdict arrived last.** The desk computed direction, fragility, anchor
  and stability but delivered them across four sequential panels behind the
  thesis box and source list, so the product's actual answer came after its
  inputs. The verdict card now leads the desk.

**Next steps:** a wider case-study library beyond the preloaded rNVDA demo;
exposing the removal engine against a user's own source set rather than only the
bundled skills; a portfolio-level variant that attributes across correlated
positions rather than one instrument.

---

## Part 5 · Deliverables

In the **Submission Materials Link** field:

| # | Material | Link |
|---|---|---|
| 1 | Repository (MIT, public) | https://github.com/natureloved/Sounding |
| 2 | Live demo | the deployed desk, Overview → Tactical Trading Desk |
| 3 | Guided demo, 60 seconds | the 4-step walkthrough in README §2 |
| 4 | Test suite, offline | `npm test` → 84/84, I1–I7 |
| 5 | A1 stability spike | `npm run spike` → 10/10 PASS |
| 6 | Architecture + invariants | README §3 |
| 7 | Before/after comparison | README §2 |

---

## Part 6 · Take on AI trading (optional)

The failure mode worth designing against is not a model hallucinating a price.
It is a model reading everything correctly and **concealing which input
mattered.** A citation list is an assertion of relevance; removal is a
measurement of influence. Those are different claims, and only one of them
survives a Monday opening gap.

The second thing: on a 7×24 rToken book, time-of-capture is a first-class input.
A conclusion derived from a source read while the reference exchange was shut is
not a weaker conclusion, it is a different kind of conclusion, and it should be
labelled as such rather than presented in the same typeface as one built on live
liquidity.

The third, and the reason this desk never places an order: a research tool that
can trade has a conflict between being useful and being safe. `--read-only` as
an enforced invariant costs nothing and removes the question entirely.

---

## Why this track

**Track 3 · AI Trading Desk · "Execution Assistance"** — "after trader
decision, how does AI handle order splitting and slippage management."

Sounding does not autonomously place orders, hold positions, or run a strategy,
so Track 2 (Agentic Trading) would require a paper-trading log it does not have
and would not fake. Track 3's judging is "feature depth (data sources / Skill
integration count and effectiveness), research quality, LUI fluency,
personalized thesis" — which is what the evidence above measures: five Bitget
signal skills plus a custom note, a live Bitget feed stack, a Qwen gateway, and
a thesis (attribution by removal) that no citation-listing tool can make.

The desk is strictly read-only by invariant, so "Execution Assistance" is read
honestly: it assists the decision and the invalidation plan, and stops there.

---

## Form field quick reference

| Field | Value |
|---|---|
| Track | AI Trading Desk (Track 3) |
| Sub-theme | Execution Assistance |
| Project Description | Parts 1–6 above, pasted into the single long-form field |
| Role of the LLM | Qwen 3.8 Max via the Bitget gateway performs the live derivation — evaluating empirical source subsets and re-deriving the conclusion after each removal. A deterministic offline heuristic engine covers the instant demo with no credentials. Used for extraction and causal re-derivation, never for arithmetic the tests can check. Qwen credits: not used. |
| Submission Materials Link | Deliverables table above (lead with the repo and the live demo) |
| X Promotional Post Link | **required — see X-POST-DRAFT.md** |
| University Name | leave blank unless entering the university pool |
| Apply for Demo Day | **Yes** |
| Apply for K3 Token Subsidy | **Yes** |
| S1 participant | If yes, describe substantive new additions; simple rename/resubmit is invalid |

---

## Before you submit — the blockers

1. **The X post does not exist yet.** The handbook: *"No X post = incomplete
   submission."* Draft is in `X-POST-DRAFT.md`. **This is the only blocker that
   invalidates the entry.**
2. **Confirm the 10/11 extension with Bitget directly.** The handbook still says
   9/21 closed, 10/8 winners announced.
3. Everything else in this file is ready to paste.
