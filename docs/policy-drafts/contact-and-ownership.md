DRAFT — not legal advice — requires review by a Malaysian-qualified lawyer before publication

# Contact and ownership page: two draft versions

Prepared 8 November 2026. Web sources accessed 8 November 2026.

Whether to name the people behind T4A is the owner's decision. Anonymity may be deliberate, for safety. This file sets out two versions to choose between:

- **Version A, full disclosure:** names the owner and editor, the funding and how editorial independence works.
- **Version B, minimum credible disclosure:** names a registered organisation and how it is funded, without naming individuals.

Both versions share the same contact block (Part D). Part E compares the trust and legal trade-offs. Questions for counsel and the owner are at the end.

---

## Part A. What the site discloses today (not for publication)

- **One email address**, `thefourthangle@proton.me`, on `/about` (`src/pages/about.astro:210`) and `/disclaimer` (`src/pages/disclaimer.astro:104`, `:116`, `:133`). The same address is the push-notification sender identity (`workers/notify/wrangler.toml:18`). It is placed in a signed token sent to the browser makers' push services (Google, Mozilla, Apple, Microsoft) with every notification (`workers/notify/src/index.ts:134-137`, `:276`).
- **No contact page.** The social-posting worker tells the news sites it fetches from that T4A can be reached at `https://thefourthangle.pages.dev/contact` (`workers/social/src/trends.ts:28`). That page does not exist.
- **No owner, byline or legal entity** anywhere on the site. The disclaimer refers to "its operators, contributors, and affiliates" without naming them.
- **A negative funding statement only:** "Independently operated. No political funding, government grants, or payments from any political party, politician, or government-linked entity." (`src/pages/disclaimer.astro:122`). Nothing says who does pay.
- **A regulatory statement:** "This platform operates under the Communications and Multimedia Act 1998." (`src/pages/disclaimer.astro:15`). Counsel should confirm what this is meant to convey.
- **Public accounts:** Bluesky handle `4thangle.bsky.social` (`workers/social/wrangler.toml`); Cloudflare account subdomain `4thangle` (worker hostnames in `public/_headers:7`).

---

## Part B. Version A: full disclosure (reader-facing)

> Style: plain English, no em-dashes. Replace every `[PLACEHOLDER]`.

# Who runs The Fourth Angle

## Who we are

The Fourth Angle (T4A) is published by [ENTITY LEGAL NAME], a [ENTITY TYPE, for example "sole proprietorship registered with SSM" or "private limited company"], registration number [REGISTRATION NUMBER], of [REGISTERED ADDRESS].

T4A was founded in [YEAR] by [FOUNDER NAME]. [FOUNDER NAME] is the [TITLE, for example "publisher and editor"]. [ONE OR TWO SENTENCES OF RELEVANT BACKGROUND.]

[IF OTHERS ARE INVOLVED: T4A is run by [NUMBER] people: [NAME, ROLE]; [NAME, ROLE].]

## Who decides what we publish

[EDITOR NAME], [TITLE], decides what T4A publishes and has the final say on every issue. Every issue goes through 4 independent review stages before publication: primary analysis, a bias audit, fact verification and a synthesis review, with a contrarian stress test for higher-risk issues. We publish every stage's score on every issue, including the low ones.

## How we are funded

In [YEAR], T4A cost about [RM AMOUNT] to run. It was paid for by:

| Source | Share of costs | Notes |
|---|---|---|
| [SOURCE 1, for example "[FOUNDER NAME]'s personal funds"] | [PERCENT] | |
| [SOURCE 2] | [PERCENT] | |
| [ADD A ROW FOR EVERY SOURCE OF 5% OR MORE] | | |

We name every source that provides 5% or more of our costs, and we update this table within [NUMBER] days of any change.

We take no money from political parties, politicians, government or government-linked entities. We run no advertising.

## How we protect our independence

- No funder, adviser or contributor sees an issue before it is published, or has any say over topics, findings or wording. We would turn down money that came with conditions.
- **Declared interests.** [NAME]: [MEMBERSHIPS, EMPLOYMENT, POLITICAL OR RELIGIOUS AFFILIATIONS THAT A READER WOULD WANT TO KNOW, OR "none"]. When an issue touches a declared interest, the issue says so.
- When we get something wrong, we correct it in the open. See our [corrections policy](/corrections-policy).

[Contact block from Part D]

---

## Part C. Version B: minimum credible disclosure (reader-facing)

> Style: plain English, no em-dashes. Replace every `[PLACEHOLDER]`.

# Who publishes The Fourth Angle

## Who we are

The Fourth Angle (T4A) is published by [ORGANISATION NAME], a [ENTITY TYPE], registration number [REGISTRATION NUMBER]. Legal notices can be sent to [ADDRESS FOR SERVICE].

## Why we do not name individuals

We write about power in Malaysia, including issues that touch race, religion and royalty. Work like this can draw harassment of the people who do it, so we do not publish the names of the people who run T4A.

That asks more of your trust, so we try to earn it by making our work checkable:

- each issue lists its sources where we have them on file, and says so plainly where we do not yet;
- each issue publishes the score from every review stage, including the low ones;
- every change after publication is logged under our [corrections policy](/corrections-policy);
- every issue carries a cryptographic signature you can check at [/verify](/verify).

Our legal identity is not hidden. [ORGANISATION NAME] is registered in Malaysia, and the people responsible for it can be identified through the normal legal process. [COUNSEL: confirm this wording.]

## How we are funded

T4A is funded by [FUNDING DESCRIPTION, for example "the personal funds of the people who run it"]. [IF ANY ORGANISATION PROVIDES 5% OR MORE OF COSTS: name it and its share.] We take no money from political parties, politicians, government or government-linked entities. We run no advertising.

## Who decides what we publish

Editorial decisions are made by [ROLE, for example "the editor"], who answers to [ORGANISATION NAME]'s [OWNER OR BOARD]. No funder has any say over topics, findings or wording. Every issue goes through 4 independent review stages before publication, and every stage's score is published.

[Contact block from Part D]

---

## Part D. Contact block (both versions)

## Contact us

| For | Write to | We aim to reply within |
|---|---|---|
| Corrections and errors | [CORRECTIONS EMAIL] | See the [corrections policy](/corrections-policy) |
| Privacy and data requests | [PRIVACY EMAIL] | [NUMBER] days |
| Legal notices | [LEGAL NOTICE ADDRESS] (post) and [LEGAL EMAIL] | [NUMBER] working days |
| Security problems with the site | [SECURITY EMAIL] | [NUMBER] working days |
| Everything else | [CONTACT EMAIL] | [NUMBER] working days |

We read every message. We do not add your address to any mailing list. [OPTIONAL: To write to us securely, use our PGP key, fingerprint [PGP FINGERPRINT].]

[ENGINEERING NOTE: publish this page at `/contact`. The social-posting worker already advertises that address. Creating the page is the owner's call; this draft does not add it.]

---

## Part E. Trust and legal trade-offs (not for publication)

### E1. Summary

| Factor | Version A (full disclosure) | Version B (organisation only) |
|---|---|---|
| Reader trust | Strongest: readers can judge who is speaking and why | Weaker; depends on the checkability measures listed in Version B |
| Fact-checking benchmark (IFCN) | Meets the funding and organisation transparency commitment | Meets the funding and legal-form parts; probably falls short on "by whom editorial control is exercised" |
| Personal presumption of publication (Evidence Act s.114A(1)) | Falls on the named owner and editor | Avoided for individuals by name, but s.114A(2) and (3) still reach whoever holds the hosting, domain and accounts |
| Anonymity in practice | None | Pseudonymity, not anonymity: a registered entity's directors or owners can be bought from SSM |
| Harassment risk to individuals | Higher | Lower, while the link to individuals stays hard to find |
| PDPA notice (s.7(1)(d) "how to contact the data controller") | Straightforward | Needs counsel's view on whether an organisation name and email is enough |
| Receiving legal process | Clear | Needs an address for service |

### E2. Sources and findings

1. **Fact-checking benchmark.** IFCN Code of Principles, commitment 3 ("Transparency of Funding & Organization"): signatories "are transparent about their funding sources"; independent organisations list "each source of funding accounting for 5% or more of total revenue" and their legal form, and explain "how and by whom editorial control is exercised". Source: https://ifcncodeofprinciples.poynter.org/the-commitments. Version A meets this. Version B meets the funding and legal-form parts; whether naming a role rather than a person satisfies "by whom" would be for the IFCN's assessors if T4A ever applied.

2. **Presumption of publication: Evidence Act 1950, s.114A** (inserted by the Evidence (Amendment) (No. 2) Act 2012, Act A1432; Royal Assent 18 June 2012; published in the Gazette 22 June 2012). Gazetted text read from the copy hosted by the International Commission of Jurists: https://icj.org/wp-content/uploads/2012/12/Malaysia-Evidence-Amendment-Act-no.-2-2012-eng.pdf.
   - s.114A(1): "A person whose name, photograph or pseudonym appears on any publication depicting himself as the owner, host, administrator, editor or sub-editor, or who in any manner facilitates to publish or re-publish the publication is presumed to have published or re-published the contents of the publication unless the contrary is proved."
   - s.114A(2): a person registered with a network service provider as the subscriber of the network service on which a publication originates is presumed to be the publisher.
   - s.114A(3): a person who has custody or control of the computer on which a publication originates is presumed to have published it.
   - **What this means here.** Version A puts the s.114A(1) presumption on the named owner and editor. Version B keeps individual names off the site, but s.114A(2) and (3) do not depend on a name appearing: they reach whoever subscribes to the hosting and network services and controls the publishing computer. Version B reduces how easily individuals are found; it does not remove their legal exposure. A pseudonymous byline would still engage s.114A(1). Whether naming a company engages s.114A(1) against the company instead of individuals is for counsel.

3. **Discoverability through SSM.** The Companies Commission of Malaysia sells "Particulars of Directors/ Officers" (current directors and officers, and previous ones for the last 15 years) and a "Business Profile" that includes "current and previous owner" information. Source: https://ssm.com.my/Pages/Product/Corporate-Info.aspx. If Version B uses an SSM-registered company or business, anyone willing to pay can find the people behind it. Other structures (for example a society registered with the Registrar of Societies, or an entity outside Malaysia) disclose differently. That was not researched.

4. **Communications and Multimedia Act 1998, s.233.** On 6 February 2026 the Federal Court, in *Government of Malaysia v Heidy Quah Gaik Li* (Civil Appeal No. 08(f)-35-02/2024(W)), reversed the Court of Appeal and held that the words "offensive" and "annoy" in s.233(1)(a) are not unconstitutional. It read the section down, so that only an "offensive" communication made "with an express intent to annoy" is a basis to prosecute (para [15]). It said that "discontent or anger arising from the expression of political views and more controversial issues do not constitute harm" (para [7]). It also said that communications demeaning a racial group, or attacking the constitutional role of the monarchy, with intent to annoy fall within the section (paras [17] and [18]). It held that Ms Quah's post, about Covid-19 in immigration detention centres, should never have been prosecuted (paras [2] and [12]). Source: the Federal Court's press summary, hosted by ARTICLE 19: https://www.article19.org/wp-content/uploads/2026/02/GOVERNMENT-OF-MALAYSIA-v-HEIDY-QUAH-GAIK-LI_Press_Summary.pdf. The case concerned the pre-2025 wording. Skrine reports that from 11 February 2025 the amended s.233(1)(a) replaces "offensive" with "grossly offensive" (https://www.skrine.com/insights/alerts/august-2025/court-of-appeal-holds-prohibition-against-offensiv; secondary source).
   - **What this means here.** Disclosure does not change what T4A may lawfully publish. It decides who is first in line when a complaint is made. The case shows an individual being charged for a public-interest post that the apex court later said should never have been prosecuted. That is relevant to the owner's safety reasoning. T4A's 3R discipline (critique policy, not communities) protects it under either version.

5. **Printing Presses and Publications Act 1984 (PPPA).** This research found no amendment, as of 8 November 2026, bringing online-only publications under the PPPA's licensing regime. The Home Minister said in December 2024 that PPPA amendments would not be tabled until stakeholders had been consulted (The Star, 3 December 2024: https://www.thestar.com.my/news/nation/2024/12/03/pppa-amendments-to-be-tabled-after-stakeholders039-views-consented-says-saifuddin). That report also cites his March 2024 statement ruling out bringing online platforms under the PPPA. In a written parliamentary reply on 23 June 2026 he said the Act "is currently under review" (New Straits Times, 24 June 2026: https://www.nst.com.my/amp/news/regional/2026/06/1471506/110-investigation-papers-opened-under-printing-presses-act-june-22). These are news reports, not the Act's text. The outcome of the review is unknown and should be watched. Counsel should confirm the current position, including whether any PPPA offence provisions (as distinct from licensing) could reach online content.

6. **Personal Data Protection Act 2010, s.7(1)(d)** requires the privacy notice to tell readers "how to contact the data controller with any inquiries or complaints". Version B must therefore still offer a working contact. Whether it must also name the legal person is a question for counsel (see `privacy-notice.md`, question 19). Source: Act 709 reprint as at 15 September 2026, p. 20: https://www.pdp.gov.my/wp-content/uploads/2026/10/Akta-709-cetakan-semula-2026-BI.pdf.

7. **Push sender identity.** Whatever contact email appears in `VAPID_SUBJECT` is disclosed to the browser makers' push services with every notification (Part A). If the owner wants to keep a personal identity apart from the project, that address should be a project address, as it is now.

### E3. A middle path for the owner to consider

Name an editor by role on the site (Version B), and lodge the full ownership and funding details with counsel, so they can be produced to a court, a regulator or a fact-checking assessor on request. This keeps the public page at Version B while answering the "who is accountable" question. Whether such an arrangement has any legal standing is for counsel.

---

## Questions for counsel and the owner

1. **Entity.** Which legal form should publish T4A: a sole proprietorship or partnership registered with SSM, a private company, a society, or something else? What does each make public, and does any of them let Version B hold up in practice?
2. **s.114A.** If the site names only an organisation as owner and editor, does s.114A(1) attach to the organisation rather than to individuals? Does "person" in s.114A include a body corporate? Does s.114A(2) or (3) still reach the account holders in any case?
3. **Address for service.** Under Version B, what address should receive legal process? Is a registered office, a company secretary or counsel's office acceptable?
4. **Defences.** Would anonymity weaken any defence T4A might rely on in a defamation claim, such as fair comment or responsible journalism? (Not researched.)
5. **PDPA.** Under Version B, does the privacy notice need to name the legal person who is the data controller (s.7(1)(d))?
6. **PPPA and the Media Council.** Is there any current or pending requirement for an online-only analysis site to hold a PPPA permit? Does the Malaysian Media Council Act 2025 (reported in force 14 June 2025) apply to T4A, and would joining the Council require disclosure of ownership?
7. **Existing statements.** Is "This platform operates under the Communications and Multimedia Act 1998" (`src/pages/disclaimer.astro:15`) accurate or useful? Should it stay?
8. **Funding disclosure.** Do any funding sources T4A has or may accept (foreign grants, donations) carry their own disclosure duties? (Not researched.)
9. **Custom domain.** If T4A moves from `thefourthangle.pages.dev` to its own domain, what registrant details become public, and does that undercut Version B? (Not researched.)
10. **Safety.** Does counsel see any step that would materially reduce personal risk for the people behind T4A beyond the choice between A and B?
