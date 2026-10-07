// Level-Namen (Gestalten der Gnosis), je Runde einer fuer Variante 0 (links) und 1 (rechts).
// Eigene Datei, damit gen_levels.py sie beim Neuerzeugen von levels.js nicht ueberschreibt.
// Erlaubte Zeichen = Drehschrift: A-Z 0-9 Leerzeichen . , ! ? >
// Links: Lichtwesen, Aeonen, Seth-Figuren. Rechts: Lehrer, Archonten, am Ende der Demiurg.
import { ROUNDS } from './levels.js';

export const LEVEL_NAMES = [
  // links (Variante 0)
  [
    'ENOCH', 'SETH', 'NOREA', 'ADAMAS', 'ZOE', 'EPINOIA', 'ENNOIA', 'AUTOGENES',
    'HARMOZEL', 'ORIAEL', 'DAVEITHAI', 'ELELETH', 'PROTENNOIA', 'BARBELO', 'BYTHOS', 'SOPHIA',
    'SIGE', 'NOUS', 'ALETHEIA', 'LOGOS', 'ANTHROPOS', 'ECCLESIA', 'HOROS', 'CHRISTOS',
    'MELCHIZEDEK', 'ACHAMOTH', 'YOUEL', 'KALYPTOS', 'PROTOPHANES', 'MARSANES', 'ALLOGENES', 'ZOSTRIANOS',
  ],
  // rechts (Variante 1)
  [
    'SIMON MAGUS', 'HELENA', 'DOSITHEOS', 'MENANDER', 'SATURNINUS', 'BASILIDES', 'CARPOCRATES', 'CERINTHUS',
    'VALENTINUS', 'PTOLEMY', 'HERACLEON', 'THEODOTUS', 'MARCION', 'MANI', 'ABRAXAS', 'SABAOTH',
    'EUGNOSTOS', 'MAGDALENE', 'THOMAS', 'JUDAS', 'BELIAS', 'NEBRUEL', 'IAO', 'ORAIOS',
    'ELOAIOS', 'ADONAIOS', 'ASTAPHAIOS', 'HARMAS', 'ATHOTH', 'SAMAEL', 'SAKLAS', 'YALDABAOTH',
  ],
];

/** Name von Runde round (0-basiert), Variante variant (0/1). */
export function levelName(round, variant) {
  return LEVEL_NAMES[variant ? 1 : 0][((round % ROUNDS) + ROUNDS) % ROUNDS] || '';
}
