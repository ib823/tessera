/**
 * The exact text a reader copies with "Copy for verification", and the text
 * scripts/sign-content.mjs fingerprints and signs at build time.
 *
 * One function for both sides, so the copy button can never drift from the
 * signed fingerprint (it had: the desktop copy lacked the "Think of it this
 * way" label and always said "All 6 perspectives read", so 7-card issues never
 * verified). Plain JS so the Node build scripts can import it directly.
 *
 * The /verify page trims each line and collapses blank runs before hashing,
 * so only the line content and order matter.
 */

/** @type {Record<string, string>} */
export const VERIFICATION_CARD_LABELS = {
  hook: 'What they said',
  fact: 'What we found',
  reframe: 'The real question',
  analogy: 'Think of it this way',
  view: 'The considered view',
};

/** @param {number} score */
function opinionLabel(score) {
  if (score >= 80) return 'Fundamental';
  if (score >= 60) return 'Significant';
  if (score >= 40) return 'Partial';
  return 'Surface';
}

/**
 * @param {{
 *   headline: string;
 *   context: string;
 *   opinionShift: number;
 *   stageScores?: unknown;
 *   finalScore?: number | null;
 *   status?: string | null;
 *   cards: Array<{ t: string; big: string; sub?: string; lens?: string }>;
 * }} issue
 * @returns {string}
 */
export function buildVerificationText(issue) {
  /** @type {string[]} */
  const lines = [];
  lines.push(issue.headline);
  lines.push(issue.context);
  lines.push('');
  lines.push(`${issue.opinionShift}`);
  lines.push(opinionLabel(issue.opinionShift));

  if (issue.stageScores) {
    lines.push('PA');
    lines.push('BA');
    lines.push('FC');
    lines.push('AF');
    lines.push('CT');
    lines.push('SR');
  }

  if (issue.finalScore != null) {
    lines.push(String(issue.finalScore));
    lines.push('/100');
  }

  if (issue.status) lines.push(issue.status === 'new' ? 'New' : 'Updated');

  for (const card of issue.cards) {
    lines.push('');
    let label = VERIFICATION_CARD_LABELS[card.t] || card.t;
    if (card.t === 'fact' && card.lens) label += ` · ${card.lens}`;
    lines.push(label);
    lines.push('');
    lines.push(card.big);
    if (card.sub) {
      lines.push('');
      lines.push(card.sub);
    }
  }

  lines.push('');
  lines.push(`All ${issue.cards.length} perspectives read`);
  const viewCard = [...issue.cards].reverse().find((card) => card.t === 'view');
  if (viewCard) lines.push(viewCard.big);

  return lines.join('\n');
}
