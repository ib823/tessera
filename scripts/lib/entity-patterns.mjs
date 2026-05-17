/**
 * Shared entity-extraction patterns used by:
 *   - scripts/build-fact-graph.mjs (issue connection graph)
 *   - scripts/build-social-cards.mjs (per-card entity index for the social bot)
 *
 * The patterns are duplicated minimally to avoid coupling internal data shapes.
 * If you add an institution / law here, both consumers pick it up next build.
 */

export const INSTITUTIONS = [
  'MACC', 'SPRM', 'PAC', 'AGC', 'BNM', 'EPF', 'KWSP', 'PETRONAS', 'Khazanah',
  'MCMC', 'JAKIM', 'NRD', 'JPJ', 'LHDN', 'DOSM', 'MITI', 'MOSTI', 'KKMM',
  'MOF', 'EPU', 'MOE', 'MOH', 'KBS', 'KPKT', 'EAIC', 'Suhakam', 'EC', 'SPR',
  'Parliament', 'Senate', 'Dewan Rakyat', 'Dewan Negara', 'Cabinet',
  'High Court', 'Federal Court', 'Court of Appeal',
  'Tabung Haji', 'FELDA', 'MARA', 'PNB', 'TH', 'KWAP',
  'Bursa Malaysia', 'SC', 'Securities Commission',
  'Home Ministry', 'Education Ministry', 'Health Ministry', 'Finance Ministry',
  'Attorney General', 'Chief Justice', 'YDPA', 'Agong',
  'PAS', 'DAP', 'UMNO', 'PKR', 'Bersatu', 'Amanah', 'Warisan', 'GPS',
  'Perikatan Nasional', 'Pakatan Harapan', 'Barisan Nasional',
  '1MDB', 'LCS', 'MRT3', 'ECRL', 'HSR', 'JASA',
  'Boustead', 'FGV', 'Sapura', 'Prasarana', 'PLUS',
  'JPA', 'SPA', 'NADMA', 'CIDB', 'SPAN', 'DOE', 'JKR',
  'Sabah', 'Sarawak', 'Penang', 'Johor', 'Kelantan', 'Terengganu',
  'East Malaysia', 'Borneo',
];

export const LEGISLATION = [
  'SOSMA', 'POCA', 'PPPA', 'Sedition Act', 'OSA', 'Official Secrets Act',
  'MACC Act', 'Companies Act', 'Employment Act', 'Industrial Relations Act',
  'Child Act', 'Education Act', 'Immigration Act', 'Penal Code',
  'Federal Constitution', 'Article 10', 'Article 8', 'Article 121', 'Article 153',
  'Section 4', 'Section 6', 'Section 14A', 'Section 16', 'Section 124B',
  'ISA', 'Emergency Ordinance', 'NSC Act', 'National Security Council',
  'Anti-Money Laundering', 'Whistleblower Protection Act',
  'Prevention of Crime Act', 'Printing Presses',
  'Communications and Multimedia Act', 'CMA',
  'Cybersecurity Act', 'Personal Data Protection',
];

export const STOPWORDS = new Set([
  'Malaysia', 'Malaysian', 'Government', 'Kuala Lumpur', 'Parliament',
  'PM', 'Prime Minister', 'Federal', 'State', 'Ministry',
]);

function escapeForRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Extract entity IDs from a free-text string.
 * Returns a Set of entity IDs like "inst:MACC", "law:SOSMA", "money:RM2.4B".
 */
export function extractEntities(text) {
  if (!text) return new Set();
  const found = new Set();

  for (const inst of INSTITUTIONS) {
    const re = new RegExp(`\\b${escapeForRegex(inst)}\\b`, 'i');
    if (re.test(text)) {
      if (!STOPWORDS.has(inst)) found.add(`inst:${inst}`);
    }
  }

  for (const law of LEGISLATION) {
    const re = new RegExp(`\\b${escapeForRegex(law)}\\b`, 'i');
    if (re.test(text)) {
      found.add(`law:${law}`);
    }
  }

  const moneyRe = /RM\s?([\d,.]+)\s?(billion|B|million|M)\b/gi;
  let m;
  while ((m = moneyRe.exec(text)) !== null) {
    const num = m[1].replace(/,/g, '');
    const unit = m[2].toLowerCase().startsWith('b') ? 'B' : 'M';
    found.add(`money:RM${num}${unit}`);
  }

  return found;
}
