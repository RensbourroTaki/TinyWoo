// Namensfilter der Highscore-Liste. Laeuft unveraendert im Browser (ueber game/daiganoid.js) und im
// Highscore-Server (api/). Wortlisten in wordlist.js, Tests: `node --test game/filter/test.mjs`.
//
//   sanitizeName(raw)  -> gespeicherte Form: A-Z 0-9 Leerzeichen . , ! ?  (Drehschrift), max. 10 Zeichen
//   checkName(raw)     -> { ok: true, name } | { ok: false, reason, match, name }
//                         reason: empty | spam | reserved | slur | hate | politics | selfharm | sexual | profanity
//                                 | harassment | drugs
//
// Pruefung: Unicode vereinfachen (Akzente, ß, kyrillische/griechische Doppelgaenger), Leetspeak zu Buchstaben
// (0→O, 1→I oder L, 3→E, 4→A, 5→S, 7→T, 8→B ...), Trennzeichen entfernen, Buchstabenwiederholungen tolerieren
// (jeder Buchstabe eines Begriffs darf mehrfach stehen). Harmlose Woerter aus ALLOW werden vor der Pruefung entfernt.
import { ALLOW, CODES_SUB, CODES_TOKEN, PATTERNS, PREFIXES, RESERVED, SPAM, SUBSTRING, SUFFIXES, WORD } from './wordlist.js';

export const MAX_LEN = 10;
const REASONS = ['slur', 'hate', 'politics', 'selfharm', 'sexual', 'profanity', 'harassment', 'drugs'];

// ---------------------------------------------------------------- Unicode -> ASCII

const MAP = {
  'ß': 'SS', 'ẞ': 'SS', 'Æ': 'AE', 'Œ': 'OE', 'Ø': 'O', 'Đ': 'D', 'Ð': 'D', 'Ł': 'L', 'Þ': 'TH', 'Ħ': 'H', 'Ŧ': 'T', 'İ': 'I',
  // Kyrillisch: Doppelgaenger auf das lateinische Aussehen, Rest Umschrift
  'А': 'A', 'В': 'B', 'С': 'C', 'Е': 'E', 'Ё': 'E', 'Н': 'H', 'К': 'K', 'М': 'M', 'О': 'O', 'Р': 'P', 'Т': 'T', 'Х': 'X',
  'У': 'Y', 'Ѕ': 'S', 'І': 'I', 'Ј': 'J', 'Ԁ': 'D', 'Ԛ': 'Q', 'Ԝ': 'W', 'Ғ': 'F', 'Ѵ': 'V', 'Б': 'B', 'Г': 'G', 'Д': 'D',
  'Ж': 'ZH', 'З': 'Z', 'И': 'I', 'Й': 'I', 'Л': 'L', 'П': 'P', 'Ф': 'F', 'Ц': 'TS', 'Ч': 'CH', 'Ш': 'SH', 'Щ': 'SH',
  'Ы': 'Y', 'Э': 'E', 'Ю': 'YU', 'Я': 'YA', 'Ь': '', 'Ъ': '', 'Ї': 'I', 'Є': 'E', 'Ґ': 'G',
  // Griechisch
  'Α': 'A', 'Β': 'B', 'Ε': 'E', 'Ζ': 'Z', 'Η': 'H', 'Ι': 'I', 'Κ': 'K', 'Μ': 'M', 'Ν': 'N', 'Ο': 'O', 'Ρ': 'P', 'Τ': 'T',
  'Υ': 'Y', 'Χ': 'X', 'Ϲ': 'C', 'Γ': 'G', 'Δ': 'D', 'Θ': 'TH', 'Λ': 'L', 'Ξ': 'X', 'Π': 'P', 'Σ': 'S', 'Φ': 'F', 'Ψ': 'PS', 'Ω': 'O',
};
const MAP_RE = new RegExp(`[${Object.keys(MAP).join('')}]`, 'g');

/** Unicode auf Grossbuchstaben A-Z, Ziffern, ASCII-Zeichen bringen (Akzente weg, Doppelgaenger ersetzt). */
function fold(raw) {
  let s = String(raw == null ? '' : raw).slice(0, 60).toUpperCase().replace(MAP_RE, (c) => MAP[c]);
  s = s.normalize('NFKD').replace(/[̀-ͯ]/g, '').toUpperCase();
  return s;
}

/** Gespeicherte Form: nur Zeichen der Drehschrift, max. 10. */
export function sanitizeName(raw) {
  return fold(raw).replace(/[^A-Z0-9 .,!?]/g, '').replace(/\s+/g, ' ').trim().slice(0, MAX_LEN).trim();
}

// ---------------------------------------------------------------- Formen fuer die Pruefung

const SYMBOLS = { '@': 'A', '$': 'S', '€': 'E', '£': 'L', '¥': 'Y', '§': 'S', '¢': 'C', '|': 'I', '!': 'I', '+': 'T', '(': 'C', '[': 'C', '{': 'C', '<': 'C', '0': 'O', '1': 'I', '2': 'Z', '3': 'E', '4': 'A', '5': 'S', '6': 'G', '7': 'T', '8': 'B', '9': 'G' };
const leet = (s, oneIsL) => s.replace(/[@$€£¥§¢|!+([{<0-9]/g, (c) => (c === '1' && oneIsL ? 'L' : SYMBOLS[c]));
const lettersDigits = (s) => s.replace(/[^A-Z0-9@$€£¥§¢|!+([{<]/g, '');

/** Alle Pruefformen eines Textes: Tokens (Woerter) und zusammengezogen, je mit 1→I und 1→L. */
function forms(text) {
  const allow = new Set(ALLOW);
  const tokensRaw = text.split(/[^A-Z0-9@$€£¥§¢|!+([{<]+/).filter(Boolean);
  const kept = tokensRaw.filter((t) => !allow.has(t));          // harmlose Woerter aus ALLOW fallen weg
  const out = { digits: kept.join(''), tokens: [], joined: [] };
  for (const oneIsL of [false, true]) {
    const toks = kept.map((t) => leet(t, oneIsL)).filter(Boolean);
    out.tokens.push(...toks);
    out.joined.push(toks.join(''));
  }
  // Ziffern ganz weglassen (TRUMP2028 -> TRUMP, FUCK69 -> FUCK)
  const bare = kept.map((t) => leet(t.replace(/[0-9]/g, ''), false)).filter(Boolean);
  out.tokens.push(...bare);
  out.joined.push(bare.join(''));
  out.tokens = [...new Set(out.tokens)];
  out.joined = [...new Set(out.joined.filter(Boolean))];
  return out;
}

// ---------------------------------------------------------------- Regex-Aufbau (einmal beim Laden)

const plus = (t) => t.split('').map((c) => (/[A-Z]/.test(c) ? `${c}+` : c.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))).join('');
const alt = (list) => list.map(plus).join('|');
const uniq = (l) => [...new Set(l.filter(Boolean))];

const SUB_RE = {};
for (const r of REASONS) if (SUBSTRING[r] && SUBSTRING[r].length) SUB_RE[r] = new RegExp(alt(uniq(SUBSTRING[r])));

const PRE = `(?:${alt(uniq(PREFIXES))})`;
const SUF = `(?:${alt(uniq(SUFFIXES))})`;
const ALL_WORDS = uniq(REASONS.flatMap((r) => [...(SUBSTRING[r] || []), ...(WORD[r] || [])]));
const BAD = `(?:${alt(ALL_WORDS)})`;
// Ein Wort ist schlecht, wenn es aus Vorsilben + Begriff + Nachsilben (+ optional zweiter Begriff) besteht.
const WORD_RE = new RegExp(`^${PRE}{0,2}${BAD}${SUF}{0,2}(?:${BAD}${SUF}{0,2})?$`);
const WORD_CAT_RE = {};
for (const r of REASONS) if (WORD[r] && WORD[r].length) WORD_CAT_RE[r] = new RegExp(alt(uniq(WORD[r])));

const PATTERN_RE = PATTERNS.map((p) => ({ reason: p.reason, re: new RegExp(p.re) }));
const RESERVED_SUB_RE = new RegExp(alt(RESERVED.sub));
const RESERVED_EXACT = new Set(RESERVED.exact);
const SPAM_SUB = SPAM.sub.map((s) => s.toUpperCase());
const SPAM_EXACT = new Set(SPAM.exact);
const SPAM_TLD_RE = new RegExp(`\\.(?:${SPAM.tld.join('|')})(?:$|[^A-Z])`);
const CODE_TOKEN = new Map();
for (const [r, list] of Object.entries(CODES_TOKEN)) for (const c of list) CODE_TOKEN.set(c, r);

// ---------------------------------------------------------------- Pruefung

function reasonFor(text) {
  for (const r of REASONS) {
    if (SUB_RE[r] && SUB_RE[r].test(text)) return r;
    if (WORD_CAT_RE[r] && WORD_CAT_RE[r].test(text)) return r;
  }
  return 'profanity';
}

function inspect(text) {
  const f = forms(text);
  // Codes auf den Ziffern (1488, 420, 88 ...)
  for (const [r, list] of Object.entries(CODES_SUB)) for (const c of list) if (f.digits.includes(c)) return { reason: r, match: c };
  for (const t of text.split(/[^A-Z0-9]+/)) if (CODE_TOKEN.has(t)) return { reason: CODE_TOKEN.get(t), match: t };
  // Begriffe ueberall (auch in Woertern), auf allen Formen
  for (const s of [...f.joined, ...f.tokens]) {
    for (const r of REASONS) {
      if (SUB_RE[r]) { const m = SUB_RE[r].exec(s); if (m) return { reason: r, match: m[0] }; }
    }
  }
  // Ganze Woerter mit Vor-/Nachsilben
  for (const s of [...f.tokens, ...f.joined]) {
    if (WORD_RE.test(s)) return { reason: reasonFor(s), match: s };
  }
  // Phrasen und Codes als Muster
  for (const s of f.joined) {
    for (const p of PATTERN_RE) { const m = p.re.exec(s); if (m) return { reason: p.reason, match: m[0] }; }
  }
  return null;
}

/** Name pruefen. Prueft die gespeicherte Form UND die Rohform (damit $HIT oder F@CK nicht durch das Kuerzen rutschen). */
export function checkName(raw) {
  const name = sanitizeName(raw);
  if (!name.replace(/[^A-Z0-9]/g, '')) return { ok: false, reason: 'empty', match: '', name };
  const folded = fold(raw);
  const bases = [...new Set([name, folded.replace(/\s+/g, ' ').trim()])];

  // Spam: Links, Wiederholungen, Werbung
  for (const b of bases) {
    const compact = lettersDigits(b).replace(/[@$€£¥§¢|!+([{<]/g, '');
    if (/(.)\1{5,}/.test(compact)) return { ok: false, reason: 'spam', match: compact, name };
    if (SPAM_TLD_RE.test(b.replace(/\s+/g, ''))) return { ok: false, reason: 'spam', match: 'link', name };
    for (const s of SPAM_SUB) if (compact.includes(s.replace(/[^A-Z0-9]/g, ''))) return { ok: false, reason: 'spam', match: s, name };
    for (const t of b.split(/[^A-Z0-9]+/)) if (SPAM_EXACT.has(t)) return { ok: false, reason: 'spam', match: t, name };
  }
  // Betreiber/Personal
  for (const b of bases) {
    const compact = leet(lettersDigits(b), false);
    const m = RESERVED_SUB_RE.exec(compact);
    if (m) return { ok: false, reason: 'reserved', match: m[0], name };
    for (const t of b.split(/[^A-Z0-9]+/)) if (RESERVED_EXACT.has(t)) return { ok: false, reason: 'reserved', match: t, name };
  }
  for (const b of bases) {
    const hit = inspect(b);
    if (hit) return { ok: false, ...hit, name };
  }
  return { ok: true, name };
}

/** Fuer Tests/Debugging: die gepruefte Form (zusammengezogen, Leetspeak aufgeloest). */
export function normalizeForMatch(raw) {
  return forms(fold(raw)).joined[0] || '';
}
