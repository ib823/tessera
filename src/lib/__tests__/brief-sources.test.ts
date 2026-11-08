import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
  explicitPrimary,
  findSourcesSections,
  parseBriefSources,
  parseCitation,
  parseSourcesField,
  splitUrl,
} from '../../../scripts/lib/brief-sources.mjs';
import { matchStealth } from '../../../scripts/lib/stealth-terms.mjs';

/*
 * Fixtures are verbatim excerpts from engine/briefs/*.md, one per format the
 * parser has to tolerate. The brief each one comes from is named per test.
 */

const brief = (body: string) => `# ISSUE\n\nIntro.\n\n${body}\n\n## CONTRADICTIONS\n\n1. Not a source.\n`;

describe('format: numbered "Publisher, "Title," Date" without URLs (bestinet-migrant-visa-monopoly)', () => {
  const md = brief(`## SOURCES

1. Bloomberg, "Malaysia's Migrant Recruitment Is Lucrative Business, But Not For Workers," Jan 23, 2026
2. MalaysiaNow, "Damning Bloomberg report implicates Putrajaya," Jan 26, 2026
4. The Edge Malaysia, "Rampant corruption traps Malaysia's poorest migrant workers," Jan 2026`);

  it('extracts publisher, title and date, keeps the brief numbering as ref', () => {
    const { status, entries } = parseBriefSources(md);
    expect(status).toBe('ok');
    expect(entries).toHaveLength(3);
    expect(entries[0]).toEqual({
      ref: '1',
      title: "Malaysia's Migrant Recruitment Is Lucrative Business, But Not For Workers",
      publisher: 'Bloomberg',
      date: 'Jan 23, 2026',
      url: null,
      primary: false,
    });
    expect(entries[2]).toMatchObject({ ref: '4', publisher: 'The Edge Malaysia', date: 'Jan 2026' });
  });

  it('stops at the next section', () => {
    const { entries } = parseBriefSources(md);
    expect(entries.map((e) => e.title)).not.toContain('Not a source');
  });
});

describe('format: plain "SOURCES:" label with "Publisher: Title (Date) — URL" (lahad-datu-security-resolution)', () => {
  const md = `ISSUE: Lahad Datu\n\nSOURCES:
1. Daily Express: ESSCOM marks 12 years (Apr 2025) — https://www.dailyexpress.com.my/news/255651/esscom-marks-12-years-of-unwavering-security-in-eastern-sabah/
2. FMT: Esscom base only 41% complete (Oct 2025) — https://www.freemalaysiatoday.com/category/nation/2025/10/06/esscom-base-in-pulau-mabul-only-41-complete-a-g-report-finds

CONTRADICTIONS:
1. None.`;

  it('splits publisher from title and keeps the URL verbatim', () => {
    const { entries } = parseBriefSources(md);
    expect(entries).toHaveLength(2);
    expect(entries[0]).toEqual({
      ref: '1',
      title: 'ESSCOM marks 12 years',
      publisher: 'Daily Express',
      date: 'Apr 2025',
      url: 'https://www.dailyexpress.com.my/news/255651/esscom-marks-12-years-of-unwavering-security-in-eastern-sabah/',
      primary: false,
    });
    expect(entries[1].url).toBe(
      'https://www.freemalaysiatoday.com/category/nation/2025/10/06/esscom-base-in-pulau-mabul-only-41-complete-a-g-report-finds',
    );
  });
});

describe('format: tier headings classify primary sources (coa-emergency-proclamation-non-justiciable)', () => {
  const md = brief(`## SOURCES

**Tier A — Primary constitutional and case law**
1. Federal Constitution of Malaysia, Article 150, full text (Attorney General's Chambers, federal legislation portal): https://lom.agc.gov.my/federal-constitution.php
3. Constitution (Amendment) Act 1981 — text via Wikipedia "List of amendments to the Constitution of Malaysia" (secondary index; primary act text via AGC): https://en.wikipedia.org/wiki/List_of_amendments_to_the_Constitution_of_Malaysia
4. *Stephen Kalong Ningkan v Government of Malaysia* [1968] 1 MLJ 119 (FC) — case summary, Republic of Sabah North Borneo law commentary: https://www.rsnborneo.com/2023/07/the-saga-of-stephen-kalong-ningkan.html

**Tier B — Decision-day reporting (4 May 2026)**
7. Free Malaysia Today, "Emergency declarations beyond courts' jurisdiction, rules Court of Appeal", 4 May 2026: https://www.freemalaysiatoday.com/category/nation/2026/05/04/emergency-declarations-beyond-courts-jurisdiction-rules-court-of-appeal`);

  it('marks Tier A entries primary unless the entry itself says secondary', () => {
    const { entries } = parseBriefSources(md);
    expect(entries.map((e) => [e.ref, e.primary])).toEqual([
      ['1', true],
      ['3', false], // "(secondary index; ...)" overrides the section
      ['4', true],
      ['7', false],
    ]);
  });

  it('uses an italic case name as the title and drops the working note', () => {
    const { entries } = parseBriefSources(md);
    expect(entries[2]).toMatchObject({
      title: 'Stephen Kalong Ningkan v Government of Malaysia',
      url: 'https://www.rsnborneo.com/2023/07/the-saga-of-stephen-kalong-ningkan.html',
    });
    // The Act is the source; the quoted Wikipedia page name after "via Wikipedia" is not its title.
    expect(entries[1].title).toBe('Constitution (Amendment) Act 1981');
    expect(JSON.stringify(entries)).not.toMatch(/secondary index/);
  });
});

describe('format: [P]/[S] markers, (a)/(b) parts, evidence quotes and notes (malaysian-crude-iran-blockade-gap)', () => {
  const md = brief(`## SOURCES

Primary (P) = official document, statute, statistics agency dataset, sanctions record or regulator
publication, opened this session. Secondary (S) = reporting or analyst publication. S→P = reporting that
quotes an official statement verbatim.

1. **[P]** U.S. Energy Information Administration, International Energy Statistics, Malaysia, annual,
   unit TBPD, retrieved 7 Nov 2026. Quote: "Crude oil including lease condensate | Production | 2025 |
   512.67 ... 2024 | 478.34". Browser view (no key needed): https://www.eia.gov/international/data/country/MYS ;
   API (needs a key; the public DEMO_KEY works): https://api.eia.gov/v2/international/data/?api_key=DEMO_KEY&frequency=annual
3. **[P]** EIA, *Today in Energy*: (a) "China imported record amounts of crude oil in 2023", originally 16
   Apr 2024, republished 3 Jan 2025 ("Customs data indicate that China imported 54% more crude oil").
   https://www.eia.gov/todayinenergy/detail.php?id=64131 ; (b) "China imported record volumes of crude
   oil in the first half of 2023", 18 Sep 2023 ("imports from Malaysia increased 330,000 b/d (46%) to 1.0
   million b/d"). https://www.eia.gov/todayinenergy/detail.php?id=60401
13. **War and blockade**: (a) **[S→P]** CENTCOM release "U.S. to Blockade Ships Entering or Exiting
    Iranian Ports", 12 Apr 2026, reproduced verbatim by Seapower ("will begin implementing a blockade");
    centcom.mil returned 403. https://seapowermagazine.org/u-s-to-blockade-ships-entering-or-exiting-iranian-ports/ ;
    (b) **[S]** The Star, "Malaysia strongly condemns attack on Iran by US and Israel, says PM", 2 Mar 2026
    ("wide-ranging strikes that began on Saturday (Feb 28)"). https://www.thestar.com.my/news/nation/2026/03/02/attack-on-iran-violates-universal-principles-says-anwar
18. **[S]** Media comparisons of the gap: (a) CNBC, Anniek Bao, "China skirts U.S. sanctions to remain top
    Iranian oil buyer", 27 Jun 2025 ("China's crude imports from Malaysia increased"). Note: the same
    article's Kpler figures ("17.8 million barrels per day") are evidently mis-scaled; do not use. The
    independent check could not reopen this page (block page); treat as context only.
    https://www.cnbc.com/2025/06/27/china-us-sanctions-shadow-fleet-top-iranian-oil-buyer-trade.html ;
    (b) The Edge Malaysia, "Malaysia facilitating Iranian oil exports — report", 25 Jul 2024 (Standard
    Chartered: 1.456m b/d). https://theedgemalaysia.com/node/720280`);

  it('turns markers into the primary flag and splits (a)/(b) into their own entries', () => {
    const { entries } = parseBriefSources(md);
    expect(entries.map((e) => [e.ref, e.primary])).toEqual([
      ['1', true],
      ['3a', true],
      ['3b', true],
      ['13a', false],
      ['13b', false],
      ['18a', false],
      ['18b', false],
    ]);
  });

  it('inherits a publisher-name group label, not an editorial category', () => {
    const { entries } = parseBriefSources(md);
    const byRef = Object.fromEntries(entries.map((e) => [e.ref, e]));
    expect(byRef['3a']).toMatchObject({
      publisher: 'EIA, Today in Energy',
      title: 'China imported record amounts of crude oil in 2023',
      date: '16 Apr 2024',
      url: 'https://www.eia.gov/todayinenergy/detail.php?id=64131',
    });
    expect(byRef['13a'].publisher).toBe('CENTCOM release');
    expect(byRef['13b'].publisher).toBe('The Star');
  });

  it('drops evidence quotes, notes and verification text, and skips keyed API URLs', () => {
    const { entries } = parseBriefSources(md);
    const text = JSON.stringify(entries);
    for (const internal of ['Quote', 'Kpler figures', 'independent check', 'opened this session', 'returned 403', 'DEMO_KEY', '54% more']) {
      expect(text).not.toContain(internal);
    }
    expect(entries[0]).toMatchObject({
      title:
        'U.S. Energy Information Administration, International Energy Statistics, Malaysia, annual, unit TBPD, retrieved 7 Nov 2026',
      url: 'https://www.eia.gov/international/data/country/MYS',
      date: null, // a retrieval date is not a publication date
    });
  });
});

describe('format: bullets with [S#] IDs under PRIMARY / SECONDARY labels (macc-rm548m-singapore-freeze-rejected)', () => {
  const md = brief(`## SOURCES

PRIMARY (statutes, court records, agency actions):
- **[S4] AMLATFPUAA 2001 (Act 613), full text** — ss.53, 56, 4(1).
  https://www.sprm.gov.my/admin/files/sprm/assets/pdf/penguatkuasaan/amlatfpuaa-2001-akta-613-bi.pdf
- **[S2] Bernama** — MACC to file appeal; 14-day window.
  https://bernama.com/misc/rss/news.php?id=2560454

SECONDARY (spectrum / detail):
- **[S3] NST** — High Court rejects freeze, RM548m.
  https://www.nst.com.my/news/nation/2026/05/1445747/
- The Vibes https://www.thevibes.com/articles/news/123237/ ; Malay Mail
  https://www.malaymail.com/news/malaysia/2026/05/23/...221053

_Sourcing note: ≥10 primary items (statutes + court records + agency
actions)._`);

  it('reads bullets as entries and section labels as the primary flag', () => {
    const { entries } = parseBriefSources(md);
    expect(entries.map((e) => [e.title, e.publisher, e.primary])).toEqual([
      ['AMLATFPUAA 2001 (Act 613), full text', null, true],
      ['MACC to file appeal; 14-day window', 'Bernama', true],
      ['High Court rejects freeze, RM548m', 'NST', false],
      ['The Vibes', null, false],
    ]);
  });

  it('never links an elided URL', () => {
    expect(splitUrl('Malay Mail https://www.malaymail.com/news/malaysia/2026/05/23/...221053').url).toBeNull();
  });
});

describe('format: "Description (Publisher, Date)" (ewallet-consumer-protection-gaps)', () => {
  it('reads the trailing parenthetical as publisher and date', () => {
    expect(parseCitation('Home Ministry data on RM2.77 billion fraud losses in 2025 (Malay Mail, Jan 2026)')).toEqual({
      title: 'Home Ministry data on RM2.77 billion fraud losses in 2025',
      publisher: 'Malay Mail',
      date: 'Jan 2026',
      url: null,
    });
    expect(parseCitation('PDPA 2025 amendments — phases 1-3 (Chambers and Partners, 2026)')).toMatchObject({
      title: 'PDPA 2025 amendments — phases 1-3',
      publisher: 'Chambers and Partners',
      date: '2026',
    });
  });

  it('withholds an entry whose only attribution is generic', () => {
    const { entries, excluded } = parseBriefSources(
      brief('## SOURCES\n\n12. Rural vs urban cash reliance statistics (multiple academic sources)\n13. TNG eWallet Money-Back Guarantee (RinggitPlus)'),
    );
    expect(entries.map((e) => e.title)).toEqual(['TNG eWallet Money-Back Guarantee']);
    expect(excluded).toEqual([{ ref: '12', reason: 'no citable publisher' }]);
  });
});

describe('labelled entries and exclusions (statutory-body-ceo-squash-court-bribe, malay-grievance-policy-capture)', () => {
  it('handles A1-style labels and wrapped lines, and withholds an entry logged for exclusion', () => {
    const md = brief(`## SOURCES
A1. Malay Mail, "MACC nabs federal agency CEO over RM1m bribe linked to squash court
    project", 14 Apr 2026.
    https://www.malaymail.com/news/malaysia/2026/04/14/macc-nabs-federal-agency-ceo-over-rm1m-bribe-linked-to-squash-court-project/216227
A7. FMT, "Rodziah denies link to CEO under probe by MACC", 15 Apr 2026 — LOGGED FOR
    EXCLUSION ONLY (unverified third-party allegation; do not use).
    https://www.freemalaysiatoday.com/category/nation/2026/04/15/rodziah-denies-link-to-ceo-under-probe-by-macc`);
    const { entries, excluded } = parseBriefSources(md);
    expect(entries).toEqual([
      {
        ref: 'A1',
        title: 'MACC nabs federal agency CEO over RM1m bribe linked to squash court project',
        publisher: 'Malay Mail',
        date: '14 Apr 2026',
        url: 'https://www.malaymail.com/news/malaysia/2026/04/14/macc-nabs-federal-agency-ceo-over-rm1m-bribe-linked-to-squash-court-project/216227',
        primary: false,
      },
    ]);
    expect(excluded).toEqual([{ ref: 'A7', reason: 'logged for exclusion only' }]);
  });

  it("withholds cross-references to T4A's own issues", () => {
    const md = brief(`## SOURCES

1. **Issue 1170** — Bumiputera Contract Quota System Loses RM12B to Rent-Seeking. finalScore 84.5. file: \`src/data/issues/1170.json\`
13. Published issue 0142 — Communications Amendment (the law being used)`);
    const { status, entries, excluded } = parseBriefSources(md);
    expect(status).toBe('empty');
    expect(entries).toEqual([]);
    expect(excluded.map((x) => x.ref)).toEqual(['1', '13']);
  });

  it('treats a stub or a "to compile" plan as no source list', () => {
    expect(parseBriefSources(brief('## SOURCES\n\n_To be filled in. 15-25 citations._')).status).toBe('empty');
    expect(parseBriefSources(brief('## SOURCES (to compile)\n\n**Primary:**\n1. Federal Constitution Article 49A text (Act A1664).')).status).toBe(
      'planned',
    );
    expect(parseBriefSources('# Brief\n\nNo bibliography here.').status).toBe('missing');
  });

  it('does not treat "SOURCE SPECTRUM CHECK" or a CONTEXT heading as a SOURCES section', () => {
    const sections = findSourcesSections('## CONTEXT (timeline with sources)\n1. x\n## SOURCE SPECTRUM CHECK\n- y\n');
    expect(sections).toEqual([]);
  });
});

describe('primary markers', () => {
  it('reads the brief classification conservatively', () => {
    expect(explicitPrimary('**[P]** EIA, Country Analysis Brief')).toBe(true);
    expect(explicitPrimary('LHDN, "e-Invoice Implementation Timeline," https://x (PRIMARY).')).toBe(true);
    expect(explicitPrimary('The Star, "x", 22 Dec 2025 (citing LHDN CEO press statement — PRIMARY-citing).')).toBe(false);
    expect(explicitPrimary('**[S→P: company statement]** Google, "x"')).toBe(false);
    expect(explicitPrimary('Tengku Zafrul Aziz, MITI statement — *Primary if ministerial press release.*')).toBe(false);
    expect(explicitPrimary('[S12] Malay Mail, "x"')).toBeNull(); // an ID, not a marker
  });
});

describe('fallback: the sources string on an issue', () => {
  it('splits on semicolons, verbatim, with no primary flag', () => {
    expect(parseSourcesField('Bernama 14 Apr 2026; The Star 14 Apr 2026; CPC Act 593 s.28/s.117')).toEqual([
      { ref: 's1', title: 'Bernama 14 Apr 2026', publisher: null, date: null, url: null, primary: false },
      { ref: 's2', title: 'The Star 14 Apr 2026', publisher: null, date: null, url: null, primary: false },
      { ref: 's3', title: 'CPC Act 593 s.28/s.117', publisher: null, date: null, url: null, primary: false },
    ]);
    expect(parseSourcesField(undefined)).toEqual([]);
  });
});

describe('real brief: engine/briefs/malaysian-crude-iran-blockade-gap.md (issue 2017)', () => {
  const md = readFileSync(new URL('../../../engine/briefs/malaysian-crude-iran-blockade-gap.md', import.meta.url), 'utf8');

  it('yields a primary-rich list with no workflow text', () => {
    const { status, entries } = parseBriefSources(md);
    expect(status).toBe('ok');
    expect(entries.length).toBeGreaterThanOrEqual(8);
    expect(entries.filter((e) => e.primary).length).toBeGreaterThanOrEqual(1);
    for (const e of entries) {
      expect(e.title.length).toBeGreaterThan(1);
      if (e.url) expect(e.url).toMatch(/^https:\/\//);
      expect(`${e.title} ${e.publisher ?? ''}`).not.toMatch(/\[(?:P|S)\]|S→P|\*\*|GAP \d|opened this session|independent check/);
    }
  });

  it('is deterministic', () => {
    expect(parseBriefSources(md)).toEqual(parseBriefSources(md));
  });
});

describe('stealth terms for source data', () => {
  it('catches provider and methodology terms', () => {
    expect(matchStealth('OpenAI, "Disrupting deceptive uses of AI", 2024')).toContain('openai');
    expect(matchStealth('Grok said')).toContain('grok');
    expect(matchStealth('GPT-4o system card')).toContain('gpt');
    expect(matchStealth('a large language model')).toContain('language model');
    expect(matchStealth('https://github.com/x/y')).toContain('github');
  });

  it('allows subject-matter uses that published issues already make', () => {
    expect(matchStealth('Malaysia Witnesses First AI Data Centre Protest In Johor')).toEqual([]);
    expect(matchStealth('a new business model for ports')).toEqual([]);
    expect(matchStealth('Astro Awani, "MACC probes Felda"')).toEqual([]);
  });
});
