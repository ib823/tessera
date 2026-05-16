# Language Quality for The Fourth Angle: Research Synthesis

> **Purpose.** Evidence-grounded word-choice rules for T4A. Companion to [`bite-size-reading.md`](bite-size-reading.md) — that document covers *structure* (cards, length, sequencing); this one covers the *words inside* those structures. Both feed the build-time validator (`scripts/validate-language.mjs`) and the Stage 6 synthesis preamble (`engine/templates/language-quality-preamble.txt`).

---

## 1. Processing fluency and the felt-truth premium

The single most operationally important finding for editorial word-choice. [Reber, Schwarz & Winkielman 2004](https://pages.ucsd.edu/~pwinkiel/reber-schwarz-winkielman-beauty-PSPR-2004.pdf), [Alter & Oppenheimer 2009](https://journals.sagepub.com/doi/10.1177/1088868309341564), and the canonical [Schwarz et al. 2007](https://dornsife.usc.edu/assets/sites/780/docs/07_pspb_schwarz_et_al_metacognitive.pdf): the easier a statement is to process, the more it is judged as **true**, as **beautiful**, and the experience is misattributed by the reader as their own intelligence. Easy-to-read prose makes the reader feel smart — and trust the source for making them feel that way.

**Mechanisms that raise fluency without dumbing down:**

1. **Concrete nouns over abstractions.** "RM2.4 billion" is fluent; "significant fiscal exposure" is not. "The minister signed" is fluent; "an executive action was undertaken" is not.
2. **Anglo-Saxon verbs as the spine.** *find, hide, charge, vote, pay, kill, give, take, build, break.* These land in fewer milliseconds than their Latinate cousins (*discover, conceal, indict, ballot, remunerate*).
3. **Subject-verb-object syntax.** No subordinate clauses inside `card.big`. The verb should arrive before the seventh word.
4. **Rhythm of three.** Short-short-long. Three-beat parallelism: *"They said safe. We found leaks. The auditor agreed."* The third element carries the punch.
5. **Repetition of key terms across cards within an issue.** Re-encountering the same noun on a later card boosts fluency on the second exposure; fluency is misattributed as truth. Pick one phrase per entity per issue. Do not elegant-vary "the contract" → "the deal" → "the agreement."

**The fluency–vocabulary paradox.** A reader who encounters one perfectly-chosen elevated word (*entrench*, *forbearance*, *capture*) inside otherwise-fluent prose feels *more* intelligent, not less. The plain backbone makes the elevated word land. The mistake is the inverse — academic prose throughout, plain words nowhere — which produces the felt-stupidity penalty. See section 5.

---

## 2. Psychic numbing and the identifiable case

[Paul Slovic's work on psychic numbing](https://www.arithmeticofcompassion.org/psychic-numbing); [Small, Loewenstein & Slovic 2007, *Sympathy and callousness*](https://www.cmu.edu/dietrich/sds/docs/loewenstein/sympathyCallousness.pdf). Single identifiable people drive emotional engagement; statistics — even huge ones — flatten it. The compassion curve actually *descends* with scale.

**Operational rules for T4A:**

- **Fact card 1 leads with a named person, agency, or specific instance.** Then bracket with the number. Never the other way.
- **Raw percentages need denominators.** "Up 40%" is psychic-numbing inert. "Up 40% — from 12,000 to 16,800 cases since 2021" anchors the abstraction.
- **No anonymous victims, no anonymous villains.** "Affected communities," "concerned parties," "various stakeholders" all violate the identifiable-case rule. Name the agency, the village, the company, the law, the year.

**Cap on raw statistics per card.** One statistic per `card.big` is enough. Two competing statistics in one card cancel each other out — the reader remembers neither.

---

## 3. Arousal, valence, and what gets shared

[Berger & Milkman 2012, *What makes online content viral*](https://jonahberger.com/wp-content/uploads/2013/02/ViralityB.pdf) — the most-cited paper on sharing behavior. Two findings drive T4A's emotional palette:

1. **Arousal > valence.** Sharing is driven by physiological arousal, not by whether the emotion is positive or negative. *Anger* and *awe* both travel; *sadness* sits.
2. **The high-arousal-negative palette.** Anger-at-process, anxiety-of-precedent, and indignation-at-asymmetry are the three emotions that drive non-partisan T4A sharing. Each can be evoked without violating the 3R standard, because the target is a *process*, not a *group*.

**Editorial test before publishing any hook or reframe.** Read only that field. Name the dominant emotion the reader will feel. If it is **sadness** or **generalized concern** ("things are bad," "this is troubling") — rewrite. The same facts, expressed in **anger-at-process** ("the audit was buried for six months") or **anxiety-of-precedent** ("this is the third time this decade") — travel.

**Sadness rewrite recipe.**
- *Original (sad):* "Many families have suffered as flood compensation remains undistributed."
- *Rewrite (anger-at-process):* "The compensation fund cleared Cabinet in March. Eight months later, not one ringgit has reached the 1,400 affected families."
- *Or (anxiety-of-precedent):* "Three flood disasters since 2020. Three Cabinet-cleared funds. Zero disbursed."

Same facts, three emotions, very different share rates.

---

## 4. Framing and moral cognition

[George Lakoff, *Moral Politics*](https://press.uchicago.edu/ucp/books/book/chicago/M/bo28247548.html); [Kahneman, *Thinking, Fast and Slow*](https://www.amazon.com/Thinking-Fast-Slow-Daniel-Kahneman/dp/0374533555). A single verb choice carries an entire causal model. *"Exempted"* implies an authority that could have withheld and chose not to. *"Allowed"* implies passive permission. *"Tolerated"* implies disapproval-but-no-action. They are not synonyms in the reader's System 1.

**The verb-frame audit.** For every load-bearing verb in a T4A card, ask: what causal model does this verb imply? Is that the model the evidence supports?

| Weak (passive frame)        | Stronger (active causal frame)               | When to use                                         |
| --------------------------- | -------------------------------------------- | --------------------------------------------------- |
| was allowed                 | was **exempted** / was **insulated** from    | An authority actively chose not to enforce          |
| was reported                | was **disclosed** / was **revealed**         | A specific entity surfaced the fact                 |
| was decided                 | was **arrogated** to / was **conferred** on  | A power was claimed or handed off                   |
| was passed                  | was **enacted** / was **gazetted**           | A formal legal step occurred                        |
| was changed                 | was **walked back** / was **rolled back**    | A reversal under pressure                           |
| was investigated            | was **scrutinised** / was **subpoenaed**     | An adversarial process began                        |
| has concerns                | has **flagged** / has **objected**           | A named entity took an explicit position            |
| is unclear                  | is **opaque** / is **unrecorded**            | The absence of information is itself the story     |
| became a problem            | **metastasised** / **entrenched**            | A failure spread or hardened                        |

**Avoid agentless passives in claims of accountability.** "Mistakes were made" is the canonical example — no agent, no blame, no story. The active-voice rule in `validate-language.mjs` flags `was/were [past participle] by` constructions specifically because they are usually the cleanest rewrite path.

---

## 5. Plain words, precise words — the Pinker reconciliation

[Steven Pinker, *The Sense of Style*](https://www.amazon.com/Sense-Style-Thinking-Persons-Writing/dp/0143127799). The false dichotomy: plain vs. elevated. The actual rule: **plain backbone, elevated spike.** Anglo-Saxon verbs build the structure; one well-chosen Latinate or Greek-derived noun per paragraph delivers the precision that makes the reader feel the writer knew exactly what they meant.

**The one-elevated-word rule.** Every T4A issue should contain at least one carefully-chosen elevated word — typically in the reframe or view card — that carries meaning the plain alternative cannot. *Forbearance* is not a synonym for tolerance; it implies a creditor's right deliberately not exercised. *Entrench* is not a synonym for strengthen; it implies the kind of strengthening that prevents reversal. *Capture* (regulatory) is not corruption — it is the structural condition where the regulated come to control the regulator.

These words make Malaysian readers feel smart because they are rarely used in Malaysian English news prose, yet they are precise enough that the meaning is unambiguous in context. The reader who learns *forbearance* from a T4A reframe acquires a tool they did not previously have for thinking about the issue.

**The vocabulary spike, not vocabulary flood.** More than one elevated word per card and the prose tips from precision into performance. The validator's `--suggest-vocab` mode is opt-in for this reason.

---

## 6. The elevated-vocabulary list

Curated words rarely used in Malaysian English news writing that carry high meaning-per-character. Each entry: **word** — what it means precisely; *weaker alternative it replaces*; example T4A sentence.

### Verbs of structural critique

- **entrench** — to fix something so deeply that reversal becomes difficult. *Replaces:* strengthen, embed, establish. *Example:* "The amendment entrenches the executive's discretion over judicial appointments."
- **insulate** — to deliberately isolate from external pressure. *Replaces:* protect, shield. *Example:* "The clause insulates the regulator from parliamentary oversight."
- **arrogate** — to claim a power that does not legitimately belong to the claimant. *Replaces:* take, assume. *Example:* "The ordinance arrogates to the Minister powers Parliament never granted."
- **launder** (metaphorical) — to pass something disreputable through a legitimate process to clean it. *Replaces:* legitimise, justify. *Example:* "The committee launders a political decision into a procedural one."
- **metastasise** — to spread destructively beyond the original site. *Replaces:* spread, grow. *Example:* "The 1MDB pattern metastasised across three sovereign-wealth vehicles."
- **forbear** / **forbearance** — to deliberately not exercise a right one holds. *Replaces:* tolerate, ignore. *Example:* "The regulator's forbearance on disclosure has lasted four years."
- **defer** — to delay a decision in a way that shifts who has to make it. *Replaces:* postpone. *Example:* "Cabinet deferred the question to a committee whose chair it appoints."
- **outsource** (governance sense) — to assign a public function to a private or unaccountable body. *Replaces:* delegate. *Example:* "The vetting function was outsourced to a private firm with no FOI obligations."

### Nouns of process failure

- **provenance** — the documented chain of where something came from. *Replaces:* origin, source. *Example:* "The funds' provenance was never published."
- **asymmetry** — an imbalance that one side benefits from. *Replaces:* imbalance, unfairness. *Example:* "The information asymmetry between citizen and agency is the design, not the bug."
- **latency** — the gap between cause and visible effect. *Replaces:* delay, lag. *Example:* "The disease has a six-month latency; the cluster predates the public health response by half a year."
- **inflection** — the point where a trend changes direction. *Replaces:* turning point. *Example:* "2018 was the inflection: prosecutions dropped from 47 to 9 the year after."
- **incumbency** — the structural advantage of already holding the position. *Replaces:* current position, sitting government's edge. *Example:* "The amendment converts a five-year incumbency into a decade-long one."
- **precedent** — a prior decision that constrains later ones. *Replaces:* example, prior case. *Example:* "The acquittal sets a precedent for the seven pending cases of the same charge."
- **opacity** — the deliberate absence of visibility. *Replaces:* lack of transparency. *Example:* "The opacity around the procurement is not bureaucratic — it is procurement strategy."
- **discretion** — a decision-maker's freedom to choose among permitted options. *Replaces:* power, choice. *Example:* "Section 4(5) creates ministerial discretion with no published criteria."
- **threshold** — the level above which something triggers. *Replaces:* limit, cut-off. *Example:* "India set the threshold at RM2.8m; Malaysia set none."

### Words of moral weight that avoid 3R risk

- **complicity** — sharing in wrongdoing by failing to act against it. *Replaces:* involvement. Critique of *role*, not group.
- **dereliction** — the willful failure of a duty one was bound to perform. *Replaces:* failure, mistake.
- **expedience** — choosing what works for the moment over what is right. *Replaces:* convenience, practicality.
- **obfuscation** — the deliberate production of confusion to hide a fact. *Replaces:* confusion, vagueness.
- **equanimity** — a calm that is suspicious when the situation demands urgency. *Replaces:* calm. *Example:* "The Ministry's equanimity as the death toll passed 200 became a political problem in itself."
- **circumvention** — going around a rule rather than violating it. *Replaces:* avoidance. *Example:* "The structure is not illegality. It is circumvention."

### Sharp adjectives

- **tractable** — capable of being solved or managed. *Example:* "The technical problem is tractable. The political will is not."
- **tendentious** — biased in a way that pretends to neutrality. *Replaces:* biased. *Example:* "The framing is not balanced — it is tendentious."
- **pyrrhic** — a victory whose cost exceeds the gain. *Example:* "The conviction is pyrrhic if the law it relied on is now repealed."
- **salutary** — beneficial in a corrective way. *Example:* "The dissent has a salutary effect on the next Bench."
- **inveterate** — long-established and habitual. *Replaces:* chronic. *Example:* "The inveterate practice of last-minute exemption notices."
- **proximate** — closest in the causal chain. *Example:* "The proximate cause is the floods. The structural cause is the canal contract."
- **dispositive** — settling the question conclusively. *Example:* "The 2019 ruling is dispositive on standing."
- **putative** — alleged but not established. *Replaces:* alleged. *Example:* "The putative oversight committee never met."

### Constructions to deploy sparingly but well

- **"X is the design, not the bug."** Reverses the reader's assumption that a failure is accidental.
- **"X is not corruption — it is capture."** Distinguishes individual wrongdoing from structural condition.
- **"The proximate cause is X. The structural cause is Y."** Forces the reader past the surface explanation.
- **"What is novel is not X. What is novel is Y."** Resets the news frame.

### Cross-language loanwords (any language ever spoken, if it is the *best* word)

English borrows ruthlessly because no single language carries every concept at the precision a careful writer needs. The rule for T4A is unchanged from §5: **one carefully-chosen elevated word per issue.** That word can come from any language on earth, provided three tests pass:

1. **Precision test.** The loanword carries a meaning English does not — or carries it in fewer characters. *Realpolitik* is not "pragmatic politics"; it is pragmatic politics that subordinates principle to power, and the German word names the moral residue plain English elides.
2. **Register test.** The educated Malaysian reader of TIME, the *Wall Street Journal*, or *The Edge* either already knows the word or can infer its meaning from context. If a Penang lawyer or a KL economist would have to Google it, drop it.
3. **No-substitute test.** Try the plainest English alternative. If the plain word reads as well or better, use the plain word.

Loanwords that fail any of the three tests are *performance*, not precision. The reader who notices the performance discounts the analysis.

#### Malay and Arabic — the home register

These belong in T4A's native voice. Educated Malaysians read them as fluent local English, not as foreign borrowings.

- **daulat** (Malay, from Arabic *dawlah*) — sovereignty in its sacral sense; the ruler's inviolable authority. *Use when:* the issue touches the Conference of Rulers, royal prerogative, or constitutional monarchy. *Plain alternative does not exist* — "sovereignty" misses the sacral charge.
- **maruah** (Malay) — dignity, especially honour that can be wounded by procedural slight. *Replaces:* dignity, face. *Use when:* the harm is reputational and the affront is to standing, not safety.
- **amanah** (Malay/Arabic) — fiduciary trust; a duty held *on behalf of* someone else. *Replaces:* duty, responsibility. *Use when:* the breach is of stewardship, not contract. *Example:* "The pension scheme is *amanah*, not a discretionary fund."
- **rakyat** (Malay) — the people, in the constitutional sense. *Use sparingly* — overused in political speech to the point of cliché. Reserve for moments where the constitutional relationship is the point.
- **adat** (Malay) — customary law, especially Sabah and Sarawak native customary rights. *Use when:* the issue involves NCR land, indigenous governance, or pre-statutory custom.
- **hak** (Malay/Arabic) — right or due, in the legal-moral sense. *Replaces:* right. *Use when:* the entitlement has both legal and moral weight; *hak* carries both, *right* in English skews to legal.
- **lacuna** (Latin, also used in Malaysian legal writing) — a gap in the law, statute, or record. *Replaces:* gap, omission. *Use when:* the gap is consequential and the writer wants the judicial register.
- **mens rea** (Latin) — guilty mind; the mental element of a crime. *Use when:* the legal question turns on intent.
- **prima facie** (Latin) — on first appearance, sufficient unless rebutted. *Replaces:* on the face of it.
- **ijtihad** (Arabic) — independent reasoning in Islamic jurisprudence. *Use when:* a religious-legal question turns on whether the question is open to fresh reasoning or settled by precedent.
- **ulama** (Arabic, plural) — religious scholars collectively. *Use when:* naming a class, not a single mufti.
- **wakaf** (Arabic) — Islamic endowment, perpetual charitable trust. *Use when:* the institution is the legal structure, not the asset.
- **fatwa** (Arabic) — religious edict. *Use precisely* — a fatwa is not a law; misusing the term as synonym for "ruling" is sloppy.

3R note: every Malay/Arabic loanword here describes a *process or concept*, not a community. Critique of *daulat* as a constitutional doctrine is critique of doctrine; "criticising daulat" framed as criticising the institution of the Rulers crosses the 3R line. The word names the structure; the structure can be examined.

#### German — the structural-failure register

German excels at compound nouns for institutional and political failure. Use one per issue at most.

- **Realpolitik** — politics conducted on practical grounds, subordinating principle to power. *Replaces:* pragmatic politics, hard-nosed diplomacy.
- **Schadenfreude** — pleasure in another's misfortune. *Use only when:* this is genuinely the political dynamic; usually it is not, and the word reads as sneering.
- **Putsch** — illegitimate seizure of power, especially by a faction inside the existing institution. *Use when:* describing internal-party coups or attempts to capture an office through procedural manoeuvre. Stronger than "coup" because "coup" implies external force; *Putsch* implies the building turned on itself.
- **Diktat** — a dictated, non-negotiable instruction issued by a superior power. *Replaces:* directive, order. *Use when:* the recipient had no real choice.
- **Zeitgeist** — the dominant spirit or temper of an era. *Use only when:* you can name the era and the temper precisely; otherwise it reads as filler.
- **Anschluss** — political absorption, usually of a smaller polity by a larger one. *Use cautiously* — the WWII echo is loud; reserve for cases where the absorption is the story.
- **Weltanschauung** — comprehensive worldview, especially as a political-philosophical commitment. *Use rarely* — the plain "worldview" reads better in 90% of cases.

#### French — the diplomatic-register

French gives English its vocabulary for diplomacy, statecraft, and ceremonial procedure. Use sparingly.

- **fait accompli** — a thing already done, with reversal impractical. *Replaces:* done deal. *Use when:* the structural point is that the next move is foreclosed.
- **volte-face** — an abrupt and complete reversal of position. *Replaces:* U-turn, reversal. *Use when:* the reversal is total and the speed is the story.
- **détente** — easing of tension between adversaries. *Replaces:* easing, thaw.
- **bricolage** — improvised construction from whatever is at hand. *Use when:* the policy or institution was patched together rather than designed; the bricolage is the criticism.
- **doyen** — the most senior member, especially of a profession. *Replaces:* senior figure.
- **noblesse oblige** — the obligation of those in high position to act with honour. *Use sparingly* and usually ironically when the obligation has been ignored.
- **laissez-faire** — let-it-be; the policy of non-intervention. *Replaces:* hands-off.
- **dirigiste** — directed; characterised by strong state intervention in the economy. *Replaces:* state-directed. *Use when:* the contrast with market-led is the analytical point.

#### Latin and Greek — the legal and analytical register

These belong in T4A whenever the issue is legal or analytical. Most are already in Malaysian English newsroom prose.

- **sui generis** — of its own kind; not comparable to anything else. *Use when:* the structural point is that no other case applies.
- **stare decisis** — let the prior decision stand; the doctrine of binding precedent. *Use when:* the legal question turns on whether a precedent constrains the bench.
- **inter alia** — among other things. *Replaces:* including. *Use when:* the legal-document register matters.
- **mutatis mutandis** — with the necessary changes made. *Use when:* a rule applies to a parallel situation with adjustments, and the adjustments are obvious.
- **status quo ante** — the state of affairs as it was before. *Use when:* the question is whether to restore a prior arrangement.
- **casus belli** — the trigger that justifies a hostile action. *Use carefully* — outside a literal war context this reads as overblown unless the trigger is genuinely the start of something serious.
- **quid pro quo** — this for that; an exchange of favours, often with corruption implication. *Use precisely* — the prosecutorial standard for *quid pro quo* corruption is specific; loose use weakens the term.
- **imprimatur** — official approval; literally "let it be printed." *Replaces:* sanction, blessing. *Use when:* the approval is formal and the formality matters.
- **modus operandi** — the characteristic method of doing something. *Use when:* the pattern is the story.
- **ex ante** / **ex post** — beforehand / afterward. *Use in:* analytical writing about whether a rule was set in advance or fitted after the fact.
- **a priori** — from prior reasoning, without empirical reference. *Use carefully* — often misused for "obvious." Real meaning is closer to "by definition."
- **prima facie** (also above) — on first appearance.
- **ex gratia** — as a favour, not legal obligation. *Use when:* a payment is made without admitting liability.
- **pro tempore** — for the time being; temporary. *Use when:* the temporariness is the point.

#### Other (rare but unmatched)

- **realpolitik** (also above; technically the only Italian/German loanword needed for the political-realism concept)
- **kafkaesque** (English-via-German) — characterised by surreal bureaucratic absurdity. *Use when:* the bureaucracy is the story; otherwise reads as adolescent.
- **byzantine** (English-via-Greek) — needlessly complex, with hidden internal politics. *Use when:* the complexity is intentional or politically motivated.
- **ad hominem** (Latin) — directed at the person, not the argument. *Use precisely.*
- **ipso facto** (Latin) — by that fact alone.

The discipline: **one** of these per issue, in the slot that earns it (typically reframe or view). Two in one issue and the prose starts to sound like a vocabulary exam. None at all and the issue lacks the precision spike that distinguishes T4A from generic editorial copy.

---

## 7. Sentence-level craft — the WSJ / TIME / Medium standard

The elevated vocabulary in §6 supplies the words. This section governs how the sentences are built. These rules are the writer's judgement; only items 3 and 5 are validator-flagged.

### 7.1 Verb diet — the to-be ratio

Strong prose is verb-driven. Weak prose is auxiliary-driven. Count the linking verbs (`is`, `are`, `was`, `were`, `be`, `been`, `being`) in any card. If a card has three or more, rewrite to active verbs.

| Auxiliary-driven (weak)                                                  | Verb-driven (strong)                                       |
| ------------------------------------------------------------------------ | ---------------------------------------------------------- |
| "The contract was a violation of the rule."                              | "The contract violated the rule."                          |
| "There is significant evidence that the regulator was aware."            | "Bank Negara documents show the regulator knew."           |
| "The minister was complicit in the decision."                            | "The minister signed the order."                           |
| "There were three meetings between Cabinet and the firm."                | "Cabinet met the firm three times."                        |

The validator flags fields with ≥3 to-be auxiliaries. The writer judges whether the construction is genuinely needed (sometimes it is — definitions, comparisons, passive-by-design legal statements).

### 7.2 Anglo-Saxon backbone, Latinate spike

Pinker again, sharpened. Build sentences out of Anglo-Saxon verbs (*break, take, hide, hold, give, find, lose, ban*) and place a single Latinate or loanword noun where the analytical weight lands. The reader's eye accelerates over short Saxon words and slows on the long Latinate one — that asymmetry is what makes the precision spike land.

Compare:

> "The committee facilitated the dissemination of information regarding the procurement irregularity."

> "The committee leaked the procurement *lacuna* to the press."

Identical informational content. The second sentence has one elevated word (*lacuna*); every other word is Anglo-Saxon. The reader feels the analytical point without effort.

### 7.3 Sentence rhythm — vary length deliberately

A page of 18-word sentences reads as machine output. A page of seven-word sentences reads as juvenile. The discipline is to alternate.

| Sentence count | Length | Function                                          |
| -------------- | ------ | ------------------------------------------------- |
| Most           | 12-20 words | Carry the analytical work                    |
| One per card   | 4-8 words  | The hammer-down. Land a single point.        |
| Occasionally   | 25-30 words | One subordinate-clause sentence for weight  |

The short sentence is the most undervalued tool. Use it for the kicker on the view card, for the final clause of the reframe, for the moment where the reader needs to stop and absorb.

> "1979 Privy Council: reviewable. 1981 Parliament: ousted. 2018 Federal Court: ouster invalid. 2026 Court of Appeal: emergencies excluded. **Only political checks remain.**" (1988 view card)

Four chronological short sentences, then a five-word kicker. That structure is the reason the card lands.

### 7.4 Show-don't-tell — the specificity floor

Abstraction is the enemy of credibility. Every claim about a structural problem needs a specific particular: a named person, a date, a number with a denominator, a place. The CLAUDE.md "identifiable case leads fact card 1" rule extends here to the whole issue: every card should have at least one specific.

| Telling (weak)                                                  | Showing (strong)                                                                      |
| ---------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| "The system fails workers."                                      | "Sajjad paid RM23,000 in agent fees for a job that paid RM38 a day."                  |
| "Corruption is widespread in procurement."                       | "Of 4,679 defence contracts since 2011, one resulted in a conviction. That conviction was reversed on appeal." |
| "Vulnerable communities are affected disproportionately."        | "All nine killed at Bukit Kukus were foreign workers. The EIA had no Bahasa Indonesia version." |
| "There has been a lack of transparency."                         | "Parliament asked four times. The Minister cited Section 14(a) each time."             |

The same fact, told differently. The right side carries the *same information* the left side intended, plus a denominator the reader can hold.

### 7.5 The rule of three — tricolon

Three parallel items in sequence are the most memorable structure in English (and in most languages). They are why every great speech contains them: *blood, sweat, and tears*; *life, liberty, and the pursuit of happiness*; *I came, I saw, I conquered.* The third item should be the longest or weightiest.

T4A uses tricolons sparingly — once per issue at most, usually on the view card. They land when the three items map cleanly to a structural point.

> "Norway acted within its rules. The real cost is 15 years of LCS spending: **no delivered ships, one DNAA, no conviction across four governments.**" (1983 view)

Three parallel facts, each named in fewer syllables than the last. The reader walks away with the structure.

### 7.6 The kicker — the final clause

WSJ news features end with a sentence that recasts the story. The kicker is not a summary. It is the line the reader will quote in a WhatsApp group with no commentary.

The discipline for T4A's view cards: the last sentence should pass two tests.

1. **WhatsApp test** — does it stand alone as a sentence a thoughtful reader would paste with no context?
2. **Subtraction test** — if the reader remembers only this sentence and forgets everything else, has T4A still landed the point?

Examples of kickers that pass both tests:

> "The fix exists. No coalition will accept the disruption." (1973)

> "Only political checks remain." (1988)

> "The infrastructure works. The guardrails do not." (1887, paraphrased)

A kicker that fails both tests is doing scaffolding work — explaining or qualifying — that belongs earlier in the card.

### 7.7 Anaphora — repetition with intent

Repeating the same opening word or phrase across successive sentences builds rhythm and emphasis. The technique is ancient: Lincoln's *we cannot dedicate, we cannot consecrate, we cannot hallow*; Churchill's *we shall fight*. Used once per issue, in the right slot, it makes a card memorable.

> "Same cast since the 1970s. Lim Kit Siang in DAP for 56 years. Anwar in UMNO since 1982. Najib was MP for 46 years until his SRC conviction." (1987 fact[1])

The implied anaphora — *X in Y for Z years* — repeated three times, creates the structural point without stating it.

---

## 8. The anti-pattern catalog

These are the patterns `scripts/validate-language.mjs` flags as warnings. Each has a rewrite path.

### Hedges that drain a claim

| Pattern                       | Why it weakens                                     | Rewrite                              |
| ----------------------------- | -------------------------------------------------- | ------------------------------------ |
| `perhaps`                     | Signals the writer doesn't believe their own claim | Drop, or commit to a stronger claim  |
| `appears to`                  | Same                                               | State what was observed; cite source |
| `may have`                    | Permits the opposite                               | Either it did or there's no evidence |
| `some suggest` / `some say`   | Vague-attribution dodge                            | Name the suggester                   |
| `it could be argued`          | Writer hides behind an imaginary debater           | Make the argument, own it            |
| `it remains to be seen`       | Punts the analysis                                 | State what the next observable is    |
| `time will tell`              | Same                                               | Same                                 |
| `not entirely clear`          | Weakens — usually it's perfectly clear             | State what is clear; flag the gap    |

### Weak abstractions (the CLAUDE.md list, extended)

`explores`, `examines`, `looks at`, `raises questions about`, `sparks debate`, `considers`, `addresses`, `tackles`, `delves into`, `touches on`, `discusses`, `engages with`, `unpacks`, `dives into`, `weighs in on`.

These all signal "thinkpiece," not "discovery." The reader's System 1 reads them as: *no news here, just opinion*. Use verbs of action and finding instead: *found, charged, voted, paid, hid, exempted, killed, gazetted, walked back, conceded, disclosed, withheld.*

### Bureaucratic dead-weight

`stakeholders`, `going forward`, `in terms of`, `the fact that`, `at this point in time`, `it should be noted that`, `with respect to`, `in the context of`, `in light of the fact that`, `due to the fact that`, `in order to`.

Almost always deletable or replaceable with one short word. `in order to` → `to`. `due to the fact that` → `because`. `at this point in time` → `now`.

### Scaffolding discourse markers (sentence-start)

`However,` `Moreover,` `Furthermore,` `Nevertheless,` `Additionally,` `Crucially,` `Notably,` `Importantly,` `Significantly,` `That said,` `Of course,` `Interestingly,` `Indeed,`.

These are scaffolding for an argument that is not yet load-bearing. A strong logical move does not need announcing — the reader can see it.

| Weak                                                          | Strong                                               |
| -------------------------------------------------------------- | ----------------------------------------------------- |
| "However, the audit was never published."                      | "The audit was never published."                      |
| "Crucially, the regulator depends on industry fees."           | "The regulator depends on industry fees."             |
| "Moreover, three other ministries face the same gap."          | "Three other ministries face the same gap."           |
| "Importantly, the figure excludes Sabah."                      | "The figure excludes Sabah."                          |

If the logical relationship is genuinely non-obvious, name it specifically: *"despite the disclosure,"* *"in the same week,"* *"by the same body,"* *"under the same Act."* Generic scaffolding adverbs are the prose equivalent of vague stage directions.

The validator flags these when they appear at sentence start in any reader-facing field.

### Auxiliary-verb density (the to-be diet)

Three or more `is / are / was / were / be / been / being` auxiliaries in one card field signals weak verb selection. See §7.1 for the rewrite path. The validator flags fields that cross the threshold.

### Formulaic reframe templates

A reframe rotates the reader's mental model. The validator flags structural repetition across the last 10 issues. Templates to watch:

1. **"X is not Y, it is Z."** — Sharpest when fresh; flattens to formula after the third use.
2. **"The question is not X, it is Y."** — Same.
3. **"X isn't the scandal, Y is."** — Same.

**Vary the rhetorical shape.** The variation playbook:
- **Causal restructuring** — name a different cause: *"The leak isn't the scandal. The audit's six-month delay is."*
- **Value restructuring** — move the issue from one moral category to another: *"Floods are not natural disasters when the cause is policy."*
- **Question restructuring** — reframe what the issue is about: *"The question is not whether to regulate. It is who writes the rules."*
- **Hard sentence** — a single declarative that names the unspeakable thing: *"This is the third time this decade."*
- **Re-anchored number** — lead with a number that recontextualises the whole picture: *"In 2018, 47 prosecutions. In 2024, nine."*
- **Paradox** — name a contradiction the system depends on: *"The regulator is funded by the regulated."*

If the validator's running tally shows 4-of-10 in the same template family, the next reframe must use a different family.

---

## 9. The hyphenated-compound heuristic

Hyphens in compound words signal one of three things: (1) the right answer, (2) old style waiting to close up, (3) laziness. The validator distinguishes.

### Hyphens that are right

- **`re-export`, `re-elect`, `re-emerge`** — repeated-letter doubling that would mislead the eye if closed.
- **`anti-Malaysia`, `pro-Sabah`** — prefix on a proper noun.
- **`AI-generated`, `email-based`, `court-ordered`** — compound modifiers before a noun, where dropping the hyphen creates genuine ambiguity.
- **Number compounds:** `40-year`, `RM-denominated`, `21-page`.

### Hyphens that should close up (no hyphen)

| Hyphenated (avoid)   | Closed (prefer)     | Note                              |
| -------------------- | ------------------- | --------------------------------- |
| `non-partisan`       | `nonpartisan`       | Modern style; closed in AP, NYT   |
| `anti-corruption`    | `anticorruption`    | Same                              |
| `pre-trial`          | `pretrial`          | Same                              |
| `co-author`          | `coauthor`          | Same                              |
| `multi-stage`        | `multistage`        | Same                              |
| `re-organise`        | `reorganise`        | Same (no repeated-letter clash)   |
| `decision-making`    | `decision making`   | Two-word noun phrase              |
| `policy-maker`       | `policymaker`       | Closed-compound                   |
| `well-being`         | `wellbeing`         | Same                              |

### Hyphens that depend on grammatical role (writer's judgement, NOT validator-flagged)

The following are correct as **compound modifiers before a noun** but should open up as **noun phrases**. A substring scan cannot tell the two uses apart, so the validator does not flag them — trust the writer.

| Form              | Correct as compound modifier             | Open up as noun phrase                          |
| ----------------- | ----------------------------------------- | ----------------------------------------------- |
| `civil-society`   | "civil-society petitions"                 | "in civil society"                              |
| `private-sector`  | "private-sector firms"                    | "in the private sector"                         |
| `public-interest` | "public-interest litigation"              | "served the public interest"                    |
| `long-term`       | "long-term plan"                          | "in the long term"                              |
| `short-term`      | "short-term fix"                          | "in the short term"                             |

The validator warns; the writer decides. Some genuinely belong hyphenated in T4A's context (e.g. `re-export` for ITAR rules; `civil-society` as a compound modifier) — when a warning fires on the closed-up list above, it is a prompt to confirm, not a verdict to action.

---

## 10. The em-dash test (and other LLM telltales)

T4A's editorial voice is human, not machine. Mass em-dash use is the single strongest visible signature of LLM-generated prose: generative models default to `—` (U+2014) for parenthetical breaks, appositives, and conclusion-setups where most human writers use commas, colons, periods, or parentheses. Readers who recognise the pattern — and many now do — read the prose as machine-written and discount the whole publication's credibility regardless of how rigorous the underlying analysis is.

The rule for T4A: **prefer the punctuation a careful human writer would actually reach for first.** That is almost never the em-dash. The validator flags every `—` in published cards; the writer judges per instance whether the alternative is genuinely better. Most of the time it is.

### Replacement by context

| Original em-dash use                          | Replace with                                                  |
| --------------------------------------------- | ------------------------------------------------------------- |
| Parenthetical aside: `A — short detail — B`   | Parentheses `A (short detail) B` or commas `A, short detail, B` |
| Setup-then-punchline: `A — B`                 | Period `A. B.` or colon `A: B`                                |
| Triple stack: `A — B — C`                     | Splits to two sentences, or commas with one parenthetical     |
| Reframe button: `X — and Y`                   | Period or colon (`X. And Y.` / `X: Y.`)                       |
| Range between numbers: `2020—2025`            | En-dash `2020–2025` (still not em-dash)                       |
| Appositive: `Anwar — the PM — said`           | Drop dashes entirely: `Anwar, the PM, said`                   |

### What we are *not* banning

- En-dashes (`–`, U+2013) in numeric ranges or compound modifiers.
- Hyphens (`-`, U+002D) in compound words.
- Em-dashes inside direct quotations transcribed verbatim from a source — preserve the source's punctuation.
- Em-dashes in author-internal documents (CLAUDE.md, audit reports, research docs). The rule is for the *reader-facing* surfaces: headline, context, card big, card sub.

### Why the rule is "warning" not "error"

A small handful of em-dashes across the corpus are genuinely the cleanest punctuation — a quoted phrase that cannot be paraphrased, a numerical span that *only* an em-dash conveys, a literary pause where every alternative reads worse. The validator surfaces every occurrence; the writer applies judgement. The trend that matters is the aggregate: the corpus should not read em-dash-heavy.

### Other LLM telltales to watch (writer's judgement, not validator-flagged)

- `It's worth noting that…`, `Importantly,…`, `It should be noted…` — bureaucratic dead-weight (also §7).
- Triple parallel structure inside a single sentence (`X, Y, and Z all show that…`) used as a closer.
- The word `nuanced` as a description of one's own analysis.
- `Crucially,` and `Notably,` as discourse markers at sentence start when the next clause is not in fact especially crucial or notable.
- The phrase `at its core` to introduce a reductive summary.
- `That said,` as a transition into a contradiction.

These are not always wrong, but every one of them appearing twice in the same issue is a signal to rewrite.

---

## 11. Editorial-effort allocation (carried forward from CLAUDE.md)

Restated here so it sits next to the word-choice rules that shape it. Because 80% of readers only read the hook:

| Surface             | Editorial time | Why                                                |
| ------------------- | -------------- | -------------------------------------------------- |
| Headline + hook big | ~50%           | Conversion-critical; the only thing 80% will see   |
| Reframe big         | ~20%           | The aha moment; what gets quoted                   |
| View big            | ~15%           | The WhatsApp-quote test; the shareable summary     |
| Three fact bigs     | ~15% combined  | Supporting evidence; concreteness matters more than poetry |
| All `sub` fields    | leftover       | Captions; one specific each; never pad             |

If editing time is being spent in inverse proportion, the issue will land poorly even if every fact is correct.

---

## 12. TL;DR — the operational checklist

Before publishing an issue, walk this list against headline + hook big + reframe big + view big:

1. **No hedge from §8** present.
2. **No weak abstraction from §8** present.
3. **No bureaucratic dead-weight from §8** present.
4. **No scaffolding discourse marker from §8** present at sentence start (`However,` `Moreover,` `Furthermore,` `Crucially,` `Notably,` `Importantly,` `That said,`).
5. **No hyphenated compound from §9** present unless it belongs to the "right" category.
6. **No em-dash from §10** present unless it is the only punctuation that actually works.
7. **Hook contains one specific number, name, or date** in the first clause.
8. **Hook's dominant emotion is anger-at-process or anxiety-of-precedent**, not sadness or generalized concern.
9. **One elevated word from §6** appears somewhere in the issue — and only one. The word may be from any language (English, Malay, Arabic, German, French, Latin, Italian) provided it passes the precision / register / no-substitute test in §6.
10. **Verb diet (§7.1)** — no card carries three or more `is/are/was/were/be/been/being` auxiliaries unless the construction is genuinely needed.
11. **Sentence rhythm (§7.3)** — at least one card carries a short hammer-down sentence (4-8 words).
12. **The view card's last sentence passes the WhatsApp test (§7.6)** — stands alone as a quotable line.
13. **Specificity floor (§7.4)** — every card has at least one named person, named institution, dated event, or numbered fact with a denominator.
14. **Reframe template differs (§8)** from at least 3 of the last 5 reframes.
15. **Verbs are active**; agentless passives ("mistakes were made") absent.
16. **Key entities are named once and reused under the same name**: no elegant variation.

The validator handles 1-6, 10, and 14 mechanically. The rest are the writer's judgement, informed by this document.
