/**
 * Card index utilities and runtime entity extraction (used by the trend
 * ingest to score headlines against cards).
 *
 * The entity patterns mirror scripts/lib/entity-patterns.mjs. Kept in
 * sync manually — they change rarely (institutions/laws).
 */
import type { SocialCard } from './types';

const INSTITUTIONS = [
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

const LEGISLATION = [
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

const STOPWORD_ENTITIES = new Set([
  'Malaysia', 'Malaysian', 'Government', 'Kuala Lumpur', 'Parliament',
  'PM', 'Prime Minister', 'Federal', 'State', 'Ministry',
]);

function escapeForRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

const INSTITUTION_PATTERNS = INSTITUTIONS.map((i) => ({
  id: `inst:${i}`,
  re: new RegExp(`\\b${escapeForRegex(i)}\\b`, 'i'),
  skip: STOPWORD_ENTITIES.has(i),
}));

const LEGISLATION_PATTERNS = LEGISLATION.map((l) => ({
  id: `law:${l}`,
  re: new RegExp(`\\b${escapeForRegex(l)}\\b`, 'i'),
}));

const MONEY_RE = /RM\s?([\d,.]+)\s?(billion|B|million|M)\b/gi;

export function extractEntitiesFromText(text: string): string[] {
  if (!text) return [];
  const found = new Set<string>();

  for (const { id, re, skip } of INSTITUTION_PATTERNS) {
    if (skip) continue;
    if (re.test(text)) found.add(id);
  }
  for (const { id, re } of LEGISLATION_PATTERNS) {
    if (re.test(text)) found.add(id);
  }
  let m: RegExpExecArray | null;
  MONEY_RE.lastIndex = 0;
  while ((m = MONEY_RE.exec(text)) !== null) {
    const num = m[1].replace(/,/g, '');
    const unit = m[2].toLowerCase().startsWith('b') ? 'B' : 'M';
    found.add(`money:RM${num}${unit}`);
  }

  return [...found];
}

export function isPostableCard(c: SocialCard): boolean {
  return c.big.length > 0 && c.weight > 0;
}
