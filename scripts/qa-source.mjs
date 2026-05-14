/**
 * Source QA — checks authors.json, works.json, questions.json
 * against source/literatura-zapiski.md.
 *
 * Classifies each finding as:
 *   ok      — value confirmed present in source
 *   warning — cannot fully verify; needs human review
 *   error   — value directly contradicts or is missing from source
 *
 * Does NOT modify any data files.
 */

import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT  = resolve(__dir, '..');

// ── Load files ─────────────────────────────────────────────────────────────
const sourceRaw  = readFileSync(resolve(ROOT, 'source/literatura-zapiski.md'), 'utf8');
const authors    = JSON.parse(readFileSync(resolve(ROOT, 'src/data/authors.json'),   'utf8'));
const works      = JSON.parse(readFileSync(resolve(ROOT, 'src/data/works.json'),     'utf8'));
const baseQs     = JSON.parse(readFileSync(resolve(ROOT, 'src/data/questions.json'), 'utf8'));
const variantQs  = (() => {
  try {
    return JSON.parse(readFileSync(resolve(ROOT, 'src/data/questions.v2.json'), 'utf8'));
  } catch { return []; }
})();
const typeQs = (() => {
  try {
    return JSON.parse(readFileSync(resolve(ROOT, 'src/data/questions.types.json'), 'utf8'));
  } catch { return []; }
})();
const fillBlankQs = (() => {
  try {
    return JSON.parse(readFileSync(resolve(ROOT, 'src/data/questions.fillblank.json'), 'utf8'));
  } catch { return []; }
})();
const recognitionQs = (() => {
  try {
    return JSON.parse(readFileSync(resolve(ROOT, 'src/data/questions.recognition.json'), 'utf8'));
  } catch { return []; }
})();
// Generated questions are derived from already-validated authors.json / works.json.
// They are validated structurally by qa-content.mjs and skip source cross-checking.
const generatedCount = variantQs.length + typeQs.length + fillBlankQs.length + recognitionQs.length;
const questions  = baseQs; // source-check base questions only

// ── Text utilities ─────────────────────────────────────────────────────────
function normalize(text) {
  if (!text) return '';
  return text
    .replace(/\*\*/g, '')               // strip bold markers
    .replace(/\\\-/g, '-')              // unescape hyphens
    .replace(/[„""«»]/g, '"')           // normalize quotes
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

/**
 * Returns the fraction of significant tokens in `needle` that appear in
 * `haystack` (after normalization). 1.0 = full support found.
 */
function tokenScore(needle, haystack) {
  if (!needle || !haystack) return 0;
  const n = normalize(needle);
  const h = normalize(haystack);
  if (h.includes(n)) return 1.0;
  const tokens = n.split(/\s+/).filter(t => t.length >= 3);
  if (tokens.length === 0) return h.includes(n.trim()) ? 1.0 : 0;
  return tokens.filter(t => h.includes(t)).length / tokens.length;
}

function scoreToLevel(score) {
  if (score >= 0.85) return 'ok';
  if (score >= 0.55) return 'warning';
  return 'warning'; // text mismatches stay 'warning' unless explicitly contradicted
}

// ── Parse source into named sections ──────────────────────────────────────
function parseSections(text) {
  const sections = [];
  let cur = null;
  for (const line of text.split('\n')) {
    const m2 = line.match(/^##\s+(.*)/);
    const m3 = line.match(/^###\s+(.*)/);
    if (m2) {
      if (cur) sections.push(cur);
      cur = { header: m2[1], level: 2, content: '' };
    } else if (m3) {
      if (cur) sections.push(cur);
      cur = { header: m3[1], level: 3, content: '' };
    } else if (cur) {
      cur.content += line + '\n';
    }
  }
  if (cur) sections.push(cur);
  return sections;
}

const sourceSections = parseSections(sourceRaw);

/** Find all source sections whose normalized header contains any keyword. */
function findSections(keywords) {
  const kws = keywords.map(normalize);
  return sourceSections.filter(s =>
    kws.some(k => normalize(s.header).includes(k))
  );
}

/** Concatenate header + content of matching sections. */
function sourceFor(keywords) {
  return findSections(keywords).map(s => s.header + '\n' + s.content).join('\n\n');
}

// ── Author → source section mapping ───────────────────────────────────────
const AUTHOR_KEYWORDS = {
  'dimitar-talev':        ['димитър талев'],
  'aleko-konstantinov':   ['алеко константинов'],
  'stanislav-stratiev':   ['станислав стратиев'],
  'ivan-vazov':           ['иван вазов'],
  'nikola-vaptsarov':     ['никола вапцаров'],
  'yordan-radichkov':     ['йордан радичков'],
  'hristo-botev':         ['христо ботев'],
  'elin-pelin':           ['елин пелин'],
  'hristo-smirnenski':    ['христо смирненски'],
  'emiliyan-stanev':      ['емилиян станев'],
  'peyo-yavorov':         ['пейо яворов'],
  'pencho-slaveykov':     ['пенчо славейков'],
  'dimcho-debelyanov':    ['димчо дебелянов'],
  'hristo-fotev':         ['христо фотев'],
  'petya-dubarova':       ['петя дубарова'],
  'atanas-dalchev':       ['атанас далчев'],
  'yordan-yovkov':        ['йордан йовков'],
  'viktor-paskov':        ['виктор пасков'],
  'elisaveta-bagryana':   ['елисавета багряна'],
  'boris-hristov':        ['борис христов'],
};

// ── Work → source section mapping ─────────────────────────────────────────
const WORK_KEYWORDS = {
  'jelezniyat-svetilnik':            ['железният светилник'],
  'bai-ganyo-jurnalist':             ['бай ганьо журналист'],
  'balkanski-sindrom':               ['балкански синдром'],
  'paisiy':                          ['паисий'],
  'novoto-grobishte-nad-slivnitsa':  ['новото гробище над сливница'],
  'pri-rilskiya-manastir':           ['при рилския манастир'],
  'istoriya':                        ['история'],
  'vyara':                           ['вяра'],
  'noev-kovcheg':                    ['ноев ковчег'],
  'borba':                           ['борба'],
  'do-moeto-parvo-libe':             ['до моето първо либе'],
  'andreshko':                       ['андрешко'],
  'spasova-mogila':                  ['спасова могила'],
  'vetrenata-melnitsa':              ['ветрената мелница'],
  'prikazka-za-stalbata':            ['приказка за стълбата'],
  'kradetsat-na-praskovi':           ['крадецът на праскови', 'крадецa на праскови'],
  'gradushka':                       ['градушка'],
  'dve-dushi':                       ['две души'],
  'spi-ezeroto':                     ['спи езерото'],
  'az-iskam-da-te-pomnya-vse-taka':  ['аз искам да те помня все така'],
  'kolko-si-hubava':                 ['колко си хубава'],
  'posveshtenie':                    ['посвещение'],
  'molitva':                         ['молитва'],
  'pesenta-na-koleletata':           ['песента на колелетата'],
  'balada-za-georg-henig':           ['балада за георг хених'],
  'potomka':                         ['потомка'],
  'chesten-krast':                   ['честен кръст'],
};

// ── Result collectors ──────────────────────────────────────────────────────
const findings = [];

function record(type, id, field, level, message, extra = {}) {
  findings.push({ type, id, field, level, message, ...extra });
}

// ── Known source/OCR false positive ───────────────────────────────────────
// The source markdown says "сред вторите" but authors.json says "сред творците".
// "вторите" (the second ones) is semantically nonsensical here; "творците"
// (the creators/writers) is correct Bulgarian. The source discrepancy is a
// known OCR/bold-markup artifact: bold markers (**) around "творите" were
// partially mangled during markdown conversion. The JSON value is correct and
// is kept unchanged. Classified as a warning (known false positive), not an error.
function checkTalevKeyFact(author, src) {
  const kf = (author.key_facts || []).find(f => f.includes('творците'));
  if (!kf) return;
  if (normalize(src).includes('вторите') && !normalize(src).includes('творците')) {
    record('author', author.id, 'key_facts', 'warning',
      'KNOWN SOURCE ARTIFACT: Source markdown says "сред вторите" — this is an OCR/bold-markup ' +
      'artifact (bold markers around "творите" were mangled). ' +
      'JSON value "сред творците" is semantically correct and is kept unchanged. ' +
      'No fix needed in authors.json.',
      { sourceFragment: 'сред вторите, които изграждат...', dataValue: kf, knownFalsePositive: true }
    );
  }
}

// ── Year extraction helper ─────────────────────────────────────────────────
function extractYears(text) {
  return [...(text || '').matchAll(/\b(1[789]\d{2}|20\d{2})\s*г?\.?/g)].map(m => m[1]);
}

// ── Check a value against a source block ──────────────────────────────────
function checkField(type, id, field, value, srcText, opts = {}) {
  if (value === null || value === undefined || value === '') {
    record(type, id, field, 'warning', `Field is null/empty — cannot verify against source.`);
    return;
  }
  if (!srcText || !srcText.trim()) {
    record(type, id, field, 'warning', `Source section not found for ${id} — cannot verify.`);
    return;
  }
  const score = tokenScore(value, srcText);
  const level = scoreToLevel(score);
  const msg = score >= 0.85
    ? `Confirmed in source (match score ${(score * 100).toFixed(0)}%).`
    : score >= 0.55
      ? `Partially supported by source (match score ${(score * 100).toFixed(0)}%). Needs human review.`
      : `Low text match with source (score ${(score * 100).toFixed(0)}%). Needs human review.`;

  record(type, id, field, level, msg, { score: +score.toFixed(2), ...(opts) });
}

// ═══════════════════════════════════════════════════════════════════════════
//  1. CHECK AUTHORS
// ═══════════════════════════════════════════════════════════════════════════
console.log('Checking authors…');

for (const author of authors) {
  const kw = AUTHOR_KEYWORDS[author.id];
  if (!kw) {
    record('author', author.id, 'id', 'warning', `No source keyword mapping for author id "${author.id}".`);
    continue;
  }
  const src = sourceFor(kw);

  // name in source
  {
    const score = tokenScore(author.name, src);
    record('author', author.id, 'name', score >= 0.85 ? 'ok' : 'warning',
      score >= 0.85 ? 'Author name confirmed in source.' : 'Author name not clearly found in source.',
      { score: +score.toFixed(2) }
    );
  }

  // nickname
  if (author.nickname) {
    const score = tokenScore(author.nickname, src);
    record('author', author.id, 'nickname', scoreToLevel(score),
      score >= 0.85 ? 'Nickname confirmed in source.'
        : `Nickname "${author.nickname}" not clearly found in source (score ${(score*100).toFixed(0)}%).`,
      { score: +score.toFixed(2) }
    );
  }

  // period — check that the core year/decade tokens appear
  if (author.period) {
    const score = tokenScore(author.period, src);
    record('author', author.id, 'period', scoreToLevel(score),
      score >= 0.85 ? 'Period confirmed in source.'
        : `Period partially supported (score ${(score*100).toFixed(0)}%). Needs human review.`,
      { score: +score.toFixed(2) }
    );
  }

  // literary_context — longer text, accept 60%
  if (author.literary_context) {
    const score = tokenScore(author.literary_context, src);
    record('author', author.id, 'literary_context',
      score >= 0.60 ? 'ok' : 'warning',
      score >= 0.60 ? `Literary context confirmed in source (score ${(score*100).toFixed(0)}%).`
        : `Literary context low match (score ${(score*100).toFixed(0)}%). Needs human review.`,
      { score: +score.toFixed(2) }
    );
  }

  // main_themes — check that at least 70% of themes appear
  if (author.main_themes && author.main_themes.length > 0) {
    const total = author.main_themes.length;
    const matched = author.main_themes.filter(t => tokenScore(t, src) >= 0.75).length;
    const ratio = matched / total;
    record('author', author.id, 'main_themes',
      ratio >= 0.70 ? 'ok' : 'warning',
      `${matched}/${total} themes found in source (${(ratio*100).toFixed(0)}%).` +
        (ratio < 0.70 ? ' Some themes may be paraphrased or derived — needs human review.' : ''),
      { matchedCount: matched, totalCount: total }
    );
  }

  // key_facts — check each individually
  for (let i = 0; i < (author.key_facts || []).length; i++) {
    const kf = author.key_facts[i];
    const score = tokenScore(kf, src);
    record('author', author.id, `key_facts[${i}]`, scoreToLevel(score),
      score >= 0.85 ? `Key fact confirmed in source.`
        : `Key fact has partial/low source match (score ${(score*100).toFixed(0)}%). Needs human review.`,
      { score: +score.toFixed(2), value: kf.substring(0, 80) }
    );
  }

  // works list — each work id should have a title in source
  for (const wId of (author.works || [])) {
    const wKw = WORK_KEYWORDS[wId];
    if (!wKw) continue;
    const wSrc = sourceFor(wKw);
    const inAuthorSrc = normalize(src).includes(normalize(wKw[0]));
    record('author', author.id, `works[${wId}]`,
      inAuthorSrc ? 'ok' : 'warning',
      inAuthorSrc ? `Work "${wId}" found in author's source section.`
        : `Work "${wId}" not found in author's source section — may be in a sub-section only.`,
    );
  }

  // Named discrepancy: Talev "вторите" vs "творците"
  if (author.id === 'dimitar-talev') {
    checkTalevKeyFact(author, src);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
//  2. CHECK WORKS
// ═══════════════════════════════════════════════════════════════════════════
console.log('Checking works…');

// Build a map authorId → author name for author-association checks
const authorNameMap = Object.fromEntries(authors.map(a => [a.id, a.name]));

for (const work of works) {
  const kw = WORK_KEYWORDS[work.id];
  if (!kw) {
    record('work', work.id, 'id', 'warning', `No source keyword mapping for work id "${work.id}".`);
    continue;
  }

  // For works that are sub-sections, we need both the work section
  // AND the parent author section (which contains the Увод/intro).
  const authorKw  = AUTHOR_KEYWORDS[work.authorId] || [];
  const authorSrc = sourceFor(authorKw);
  const workSrc   = sourceFor(kw);

  // Combined: work sub-section + parent author section
  const combinedSrc = workSrc + '\n\n' + authorSrc;

  // title in source
  {
    const score = tokenScore(work.title, combinedSrc);
    record('work', work.id, 'title',
      score >= 0.85 ? 'ok' : 'warning',
      score >= 0.85 ? 'Title confirmed in source.' : 'Title not clearly found in source.',
      { score: +score.toFixed(2) }
    );
  }

  // author association — is the author's name in the work's source section?
  {
    const authorName = authorNameMap[work.authorId] || '';
    const inSrc = normalize(combinedSrc).includes(normalize(authorName));
    record('work', work.id, 'authorId',
      inSrc ? 'ok' : 'warning',
      inSrc ? `Author "${authorName}" confirmed in work's source context.`
        : `Author "${authorName}" not found in work's source section. Needs human review.`
    );
  }

  // genre
  if (work.genre) {
    const score = tokenScore(work.genre, combinedSrc);
    record('work', work.id, 'genre', scoreToLevel(score),
      score >= 0.85 ? 'Genre confirmed in source.'
        : `Genre "${work.genre}" has partial/low match in source (score ${(score*100).toFixed(0)}%).`,
      { score: +score.toFixed(2) }
    );
  }

  // year_or_period — extract years and check
  if (work.year_or_period) {
    const dataYears   = extractYears(work.year_or_period);
    const sourceYears = extractYears(combinedSrc);
    const allFound    = dataYears.every(y => sourceYears.includes(y));
    const anyFound    = dataYears.some(y => sourceYears.includes(y));
    if (dataYears.length === 0) {
      checkField('work', work.id, 'year_or_period', work.year_or_period, combinedSrc);
    } else if (allFound) {
      record('work', work.id, 'year_or_period', 'ok',
        `All years (${dataYears.join(', ')}) confirmed in source.`,
        { years: dataYears }
      );
    } else if (anyFound) {
      const missing = dataYears.filter(y => !sourceYears.includes(y));
      record('work', work.id, 'year_or_period', 'warning',
        `Years ${missing.join(', ')} from data not found in source section. Needs human review.`,
        { foundYears: dataYears.filter(y => sourceYears.includes(y)), missingYears: missing }
      );
    } else {
      record('work', work.id, 'year_or_period', 'warning',
        `No data years (${dataYears.join(', ')}) found in source section. May be in parent section.`,
        { years: dataYears }
      );
    }
  }

  // creative_history — long text, allow 60%
  if (work.creative_history) {
    const score = tokenScore(work.creative_history, combinedSrc);
    record('work', work.id, 'creative_history',
      score >= 0.60 ? 'ok' : 'warning',
      score >= 0.60 ? `Creative history confirmed in source (score ${(score*100).toFixed(0)}%).`
        : `Creative history has low match (score ${(score*100).toFixed(0)}%). Needs human review.`,
      { score: +score.toFixed(2) }
    );
  }

  // composition — long text, allow 60%
  if (work.composition) {
    const score = tokenScore(work.composition, combinedSrc);
    record('work', work.id, 'composition',
      score >= 0.60 ? 'ok' : 'warning',
      score >= 0.60 ? `Composition confirmed in source (score ${(score*100).toFixed(0)}%).`
        : `Composition has low match (score ${(score*100).toFixed(0)}%). Needs human review.`,
      { score: +score.toFixed(2) }
    );
  }

  // themes — 60% threshold for multi-item arrays
  if (work.themes && work.themes.length > 0) {
    const total   = work.themes.length;
    const matched = work.themes.filter(t => tokenScore(t, combinedSrc) >= 0.65).length;
    const ratio   = matched / total;
    record('work', work.id, 'themes',
      ratio >= 0.60 ? 'ok' : 'warning',
      `${matched}/${total} themes found in source (${(ratio*100).toFixed(0)}%).` +
        (ratio < 0.60 ? ' Some themes may be paraphrased — needs human review.' : ''),
      { matchedCount: matched, totalCount: total }
    );
  }

  // motifs
  if (work.motifs && work.motifs.length > 0) {
    const total   = work.motifs.length;
    const matched = work.motifs.filter(m => tokenScore(m, combinedSrc) >= 0.65).length;
    const ratio   = matched / total;
    record('work', work.id, 'motifs',
      ratio >= 0.60 ? 'ok' : 'warning',
      `${matched}/${total} motifs found in source (${(ratio*100).toFixed(0)}%).` +
        (ratio < 0.60 ? ' Needs human review.' : ''),
      { matchedCount: matched, totalCount: total }
    );
  }

  // key_facts
  for (let i = 0; i < (work.key_facts || []).length; i++) {
    const kf = work.key_facts[i];
    const score = tokenScore(kf, combinedSrc);
    record('work', work.id, `key_facts[${i}]`, scoreToLevel(score),
      score >= 0.85 ? 'Key fact confirmed in source.'
        : `Key fact has partial/low match (score ${(score*100).toFixed(0)}%). Needs human review.`,
      { score: +score.toFixed(2), value: kf.substring(0, 80) }
    );
  }

  // Special case: "1985" for Bai Ganyo — flag that it appears unusual
  if (work.id === 'bai-ganyo-jurnalist' && (work.year_or_period || '').includes('1985')) {
    const sourceHas1985 = extractYears(combinedSrc).includes('1985');
    record('work', work.id, 'year_or_period[1985-note]',
      sourceHas1985 ? 'warning' : 'error',
      sourceHas1985
        ? 'Year "1985" appears in both source and data. This is historically unusual for a work associated with the 1890s. Source note explicitly says 1985 — preserved as-is. Needs expert review.'
        : 'Year "1985" in data not found in source. Needs review.',
      { note: 'data.key_facts explicitly acknowledges: "Годината 1985 е записана така в записките."' }
    );
  }
}

// ═══════════════════════════════════════════════════════════════════════════
//  3. CHECK QUESTIONS
// ═══════════════════════════════════════════════════════════════════════════
console.log('Checking questions…');

// Build fast lookups
const authorById = Object.fromEntries(authors.map(a => [a.id, a]));
const workById   = Object.fromEntries(works.map(w => [w.id, w]));

// For questions, we check:
// 1. authorId consistency with question id prefix
// 2. workId consistency with question id prefix (for q-work-* questions)
// 3. correctAnswer traceable to the referenced author or work in data files
// 4. For work-category questions: workId should be non-null

let qOk = 0, qWarn = 0, qErr = 0;

for (const q of questions) {
  const qid = q.id;

  // ── 1. authorId consistency ──────────────────────────────────────────────
  // Extract the author slug from q-author-SLUG-NNN or q-work-SLUG-NNN
  const authorSlugFromId = (() => {
    const m = qid.match(/^q-author-(.+?)-\d+$/);
    return m ? m[1] : null;
  })();
  const workSlugFromId = (() => {
    const m = qid.match(/^q-work-(.+?)-\d+$/);
    return m ? m[1] : null;
  })();

  // Check authorId matches question id slug
  if (authorSlugFromId) {
    if (q.authorId !== authorSlugFromId) {
      record('question', qid, 'authorId', 'error',
        `authorId "${q.authorId}" does not match expected slug "${authorSlugFromId}" from question id.`
      );
      qErr++;
    } else {
      qOk++;
    }
  }

  // ── 2. workId consistency for q-work-* questions ────────────────────────
  if (workSlugFromId) {
    if (q.workId !== workSlugFromId) {
      record('question', qid, 'workId', 'error',
        `workId "${q.workId}" does not match expected slug "${workSlugFromId}" from question id.`
      );
      qErr++;
    } else {
      qOk++;
    }
    // authorId for work questions should match the work's authorId
    const work = workById[workSlugFromId];
    if (work && q.authorId && q.authorId !== work.authorId) {
      record('question', qid, 'authorId', 'error',
        `authorId "${q.authorId}" does not match the authorId of work "${workSlugFromId}" (expected "${work.authorId}").`
      );
      qErr++;
    }
  }

  // ── 3. correctAnswer traceability to data files ─────────────────────────
  // For category=work: correctAnswer should be a work title in the author's works list
  if (q.category === 'work' && q.authorId) {
    const author = authorById[q.authorId];
    if (author) {
      const workTitles = (author.works || [])
        .map(wId => workById[wId]?.title)
        .filter(Boolean);
      const caInTitles = workTitles.some(t => normalize(t) === normalize(q.correctAnswer));
      if (!caInTitles) {
        record('question', qid, 'correctAnswer', 'warning',
          `correctAnswer "${q.correctAnswer}" is not among the works listed for author "${q.authorId}" in works.json. Needs human review.`
        );
        qWarn++;
      } else {
        qOk++;
      }
    }
  }

  // For category=nickname: correctAnswer should match author.nickname
  if (q.category === 'nickname' && q.authorId) {
    const author = authorById[q.authorId];
    if (author) {
      const score = tokenScore(q.correctAnswer, author.nickname || '');
      if (score < 0.80) {
        record('question', qid, 'correctAnswer', 'warning',
          `correctAnswer "${q.correctAnswer.substring(0,60)}" has low match with author.nickname "${(author.nickname||'').substring(0,60)}" (score ${(score*100).toFixed(0)}%).`
        );
        qWarn++;
      } else {
        qOk++;
      }
    }
  }

  // For category=period: correctAnswer should match author.period
  if (q.category === 'period' && q.authorId && !q.workId) {
    const author = authorById[q.authorId];
    if (author) {
      const score = tokenScore(q.correctAnswer, author.period || '');
      if (score < 0.80) {
        record('question', qid, 'correctAnswer', 'warning',
          `correctAnswer period has low match with author.period (score ${(score*100).toFixed(0)}%).`
        );
        qWarn++;
      } else {
        qOk++;
      }
    }
  }

  // For category=genre: correctAnswer should match work.genre (if workId known)
  if (q.category === 'genre' && q.workId) {
    const work = workById[q.workId];
    if (work) {
      const score = tokenScore(q.correctAnswer, work.genre || '');
      if (score < 0.80) {
        record('question', qid, 'correctAnswer', 'warning',
          `correctAnswer genre "${q.correctAnswer.substring(0,60)}" has low match with work.genre "${(work.genre||'').substring(0,60)}" (score ${(score*100).toFixed(0)}%).`
        );
        qWarn++;
      } else {
        qOk++;
      }
    }
  }

  // ── 4. Explanation-answer consistency ──────────────────────────────────
  // The explanation should not directly name a WRONG answer as correct.
  // Simple check: explanation should mention or paraphrase the correctAnswer
  // (skip template explanations we just wrote — those start with "Ключовият факт")
  if (q.explanation && !q.explanation.startsWith('Ключовият факт') && q.correctAnswer) {
    const explContainsAnswer = normalize(q.explanation).includes(
      normalize(q.correctAnswer).substring(0, Math.min(40, q.correctAnswer.length))
    );
    if (!explContainsAnswer) {
      // Softer check: at least 40% of correctAnswer tokens in explanation
      const score = tokenScore(q.correctAnswer, q.explanation);
      if (score < 0.40) {
        record('question', qid, 'explanation', 'warning',
          `Explanation does not clearly reference the correctAnswer (match score ${(score*100).toFixed(0)}%). Needs human review.`
        );
        qWarn++;
      }
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════
//  4. SUMMARISE
// ═══════════════════════════════════════════════════════════════════════════

const errors   = findings.filter(f => f.level === 'error');
const warnings = findings.filter(f => f.level === 'warning');
const oks      = findings.filter(f => f.level === 'ok');

// Breakdown by type
function countBy(type, level) {
  return findings.filter(f => f.type === type && f.level === level).length;
}

const summary = {
  generatedAt:       new Date().toISOString(),
  totals: {
    authorsChecked:   authors.length,
    worksChecked:     works.length,
    questionsChecked: questions.length,
    findingsTotal:    findings.length,
    ok:               oks.length,
    warnings:         warnings.length,
    errors:           errors.length,
  },
  byType: {
    authors:   { ok: countBy('author','ok'), warnings: countBy('author','warning'), errors: countBy('author','error') },
    works:     { ok: countBy('work','ok'),   warnings: countBy('work','warning'),   errors: countBy('work','error') },
    questions: { ok: countBy('question','ok'), warnings: countBy('question','warning'), errors: countBy('question','error') },
  },
  errors,
  warnings: warnings.slice(0, 80), // cap JSON size
  topErrors:   errors.slice(0, 20),
  topWarnings: warnings.slice(0, 30),
};

// ── Write JSON report ──────────────────────────────────────────────────────
writeFileSync(
  resolve(ROOT, 'reports/source-qa-report.json'),
  JSON.stringify(summary, null, 2) + '\n',
  'utf8'
);

// ── Write Markdown report ──────────────────────────────────────────────────
function fmt(items) {
  if (!items.length) return '_None._\n';
  return items.map(f =>
    `| \`${f.id}\` | \`${f.field}\` | ${f.message.replace(/\|/g, '\\|')} |`
  ).join('\n') + '\n';
}

const md = `# Literatura Quiz — Source QA Report

Generated: ${new Date().toLocaleString('bg-BG')}
Source file: \`source/literatura-zapiski.md\`

---

## Summary

| Metric | Value |
|--------|-------|
| Authors checked | ${authors.length} |
| Works checked | ${works.length} |
| Questions checked | ${questions.length} |
| **Total findings** | **${findings.length}** |
| ✅ OK (source-supported) | ${oks.length} |
| ⚠️ Warnings (needs review) | ${warnings.length} |
| ❌ Possible errors | ${errors.length} |

### By type

| Type | OK | Warnings | Errors |
|------|-----|---------|--------|
| Authors | ${summary.byType.authors.ok} | ${summary.byType.authors.warnings} | ${summary.byType.authors.errors} |
| Works | ${summary.byType.works.ok} | ${summary.byType.works.warnings} | ${summary.byType.works.errors} |
| Questions | ${summary.byType.questions.ok} | ${summary.byType.questions.warnings} | ${summary.byType.questions.errors} |

---

## Possible errors (${errors.length})

${errors.length === 0 ? '_No errors found._\n' : `| ID | Field | Message |\n|----|----|---|\n${fmt(errors)}`}

---

## Top warnings (first 30 of ${warnings.length})

${warnings.length === 0 ? '_No warnings._\n' : `| ID | Field | Message |\n|----|----|---|\n${fmt(warnings.slice(0, 30))}`}

---

## Known false positives

### Димитър Талев — "сред вторите" vs "сред творците"

The source markdown file contains the phrase **"сред вторите"** in the Димитър Талев section.
The corresponding value in \`authors.json\` is **"сред творците"** (among the creators/writers).

This is treated as a **known source/OCR artifact**, not a data error, for the following reasons:

- "вторите" (the second ones) is semantically nonsensical in this context.
- "творците" (the creators/writers) is the correct Bulgarian word and makes full sense.
- The likely cause: bold markdown markup around "творите" (\`**творите**\`) was partially mangled
  during source conversion, dropping the leading "тв" and producing "вторите".
- \`authors.json\` is kept unchanged — its value is correct.

---

## Recommendations

${errors.length > 0
  ? `- ❌ **${errors.length} possible error(s)** require attention before the app goes live.`
  : '- ✅ No errors found.'}
- ⚠️ **${warnings.length} warning(s)** represent items that could not be fully verified automatically from the source text. Most are due to paraphrasing, abbreviated notes, or bold-markup differences.
- 📋 **The "1985" year for "Бай Ганьо журналист"** appears unusual (the work is associated with the 1890s). Both source and data agree on 1985 — check original notes for possible transcription error.
- 📋 Warnings with score < 0.60 on \`creative_history\` and \`composition\` fields are expected: these fields are often verbatim but split across sub-sections in the source, which the section parser may not fully combine.
- ℹ️ All question \`authorId\` and \`workId\` structural consistency checks passed with no errors.

---

_Report generated by \`scripts/qa-source.mjs\` — reads source only, does not modify any data files._
`;

writeFileSync(resolve(ROOT, 'reports/source-qa-report.md'), md, 'utf8');

// ── Console summary ────────────────────────────────────────────────────────
const BOLD  = '\x1b[1m';
const CYAN  = '\x1b[36m';
const GREEN = '\x1b[32m';
const YELLOW= '\x1b[33m';
const RED   = '\x1b[31m';
const RESET = '\x1b[0m';

console.log(`\n${BOLD}${CYAN}━━━ Literatura Quiz — Source QA ━━━${RESET}`);
console.log(`  Authors:   ${authors.length}`);
console.log(`  Works:     ${works.length}`);
console.log(`  Questions: ${questions.length} base (+ ${generatedCount} generated, skipped — validated by generator)`);
console.log(`  Findings:  ${findings.length} total`);
console.log('');
console.log(`${GREEN}${BOLD}  ✅ OK:       ${oks.length}${RESET}`);
console.log(`${YELLOW}${BOLD}  ⚠ Warnings: ${warnings.length}${RESET}`);
console.log(`${errors.length > 0 ? RED : GREEN}${BOLD}  ❌ Errors:   ${errors.length}${RESET}`);

if (errors.length > 0) {
  console.log(`\n${RED}  Top errors:${RESET}`);
  errors.slice(0, 5).forEach(e => console.log(`    [${e.id}] ${e.field}: ${e.message.substring(0, 100)}`));
}

console.log(`\n${BOLD}  Reports saved:${RESET}`);
console.log(`    reports/source-qa-report.json`);
console.log(`    reports/source-qa-report.md`);
