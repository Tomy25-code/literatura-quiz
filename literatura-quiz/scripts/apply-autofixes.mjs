/**
 * Applies the 69 safe auto-fixes from reports/content-cleanup-plan.md.
 * Changes only: explanation (GENERIC_EXPLANATION), workId (MISSING_WORK_ID),
 * and one explanation word (ENGLISH_WORDS).
 * Does NOT touch: question, options, correctAnswer, authors.json, works.json.
 */

import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dir = dirname(fileURLToPath(import.meta.url));
const questionsPath = resolve(__dir, '../src/data/questions.json');

const questions = JSON.parse(readFileSync(questionsPath, 'utf8'));

// ─── 1. GENERIC_EXPLANATION fixes ──────────────────────────────────────────
// Template for author questions:
//   Ключовият факт е посочен в записките за [Name]. Останалите варианти са факти за друг автор.
// Template for work questions:
//   Ключовият факт е посочен в записките за „[Title]". Останалите варианти са факти за друго произведение.

const genericExplanationFixes = {
  // Author questions
  'q-author-dimitar-talev-010':
    'Ключовият факт е посочен в записките за Димитър Талев. Останалите три отговора са факти за друг автор.',
  'q-author-aleko-konstantinov-010':
    'Ключовият факт е посочен в записките за Алеко Константинов. Останалите три отговора са факти за друг автор.',
  'q-author-stanislav-stratiev-008':
    'Ключовият факт е посочен в записките за Станислав Стратиев. Останалите три отговора са факти за друг автор.',
  'q-author-ivan-vazov-012':
    'Ключовият факт е посочен в записките за Иван Вазов. Останалите три отговора са факти за друг автор.',
  'q-author-nikola-vaptsarov-011':
    'Ключовият факт е посочен в записките за Никола Вапцаров. Останалите три отговора са факти за друг автор.',
  'q-author-yordan-radichkov-009':
    'Ключовият факт е посочен в записките за Йордан Радичков. Останалите три отговора са факти за друг автор.',
  'q-author-hristo-botev-012':
    'Ключовият факт е посочен в записките за Христо Ботев. Останалите три отговора са факти за друг автор.',
  'q-author-elin-pelin-014':
    'Ключовият факт е посочен в записките за Елин Пелин. Останалите три отговора са факти за друг автор.',
  'q-author-hristo-smirnenski-010':
    'Ключовият факт е посочен в записките за Христо Смирненски. Останалите три отговора са факти за друг автор.',
  'q-author-emiliyan-stanev-009':
    'Ключовият факт е посочен в записките за Емилиян Станев. Останалите три отговора са факти за друг автор.',
  'q-author-peyo-yavorov-009':
    'Ключовият факт е посочен в записките за Пейо Яворов. Останалите три отговора са факти за друг автор.',
  'q-author-pencho-slaveykov-008':
    'Ключовият факт е посочен в записките за Пенчо Славейков. Останалите три отговора са факти за друг автор.',
  'q-author-dimcho-debelyanov-008':
    'Ключовият факт е посочен в записките за Димчо Дебелянов. Останалите три отговора са факти за друг автор.',
  'q-author-hristo-fotev-007':
    'Ключовият факт е посочен в записките за Христо Фотев. Останалите три отговора са факти за друг автор.',
  'q-author-petya-dubarova-009':
    'Ключовият факт е посочен в записките за Петя Дубарова. Останалите три отговора са факти за друг автор.',
  'q-author-atanas-dalchev-008':
    'Ключовият факт е посочен в записките за Атанас Далчев. Останалите три отговора са факти за друг автор.',
  'q-author-yordan-yovkov-009':
    'Ключовият факт е посочен в записките за Йордан Йовков. Останалите три отговора са факти за друг автор.',
  'q-author-viktor-paskov-009':
    'Ключовият факт е посочен в записките за Виктор Пасков. Останалите три отговора са факти за друг автор.',
  'q-author-elisaveta-bagryana-009':
    'Ключовият факт е посочен в записките за Елисавета Багряна. Останалите три отговора са факти за друг автор.',
  'q-author-boris-hristov-008':
    'Ключовият факт е посочен в записките за Борис Христов. Останалите три отговора са факти за друг автор.',

  // Work questions
  'q-work-jelezniyat-svetilnik-013':
    'Ключовият факт е посочен в записките за „Железният светилник". Останалите три отговора са факти за друго произведение.',
  'q-work-bai-ganyo-jurnalist-013':
    'Ключовият факт е посочен в записките за „Бай Ганьо журналист". Останалите три отговора са факти за друго произведение.',
  'q-work-balkanski-sindrom-012':
    'Ключовият факт е посочен в записките за „Балкански синдром". Останалите три отговора са факти за друго произведение.',
  'q-work-paisiy-011':
    'Ключовият факт е посочен в записките за „Паисий". Останалите три отговора са факти за друго произведение.',
  'q-work-novoto-grobishte-nad-slivnitsa-009':
    'Ключовият факт е посочен в записките за „Новото гробище над Сливница". Останалите три отговора са факти за друго произведение.',
  'q-work-pri-rilskiya-manastir-013':
    'Ключовият факт е посочен в записките за „При Рилския манастир". Останалите три отговора са факти за друго произведение.',
  'q-work-istoriya-012':
    'Ключовият факт е посочен в записките за „История". Останалите три отговора са факти за друго произведение.',
  'q-work-vyara-011':
    'Ключовият факт е посочен в записките за „Вяра". Останалите три отговора са факти за друго произведение.',
  'q-work-noev-kovcheg-013':
    'Ключовият факт е посочен в записките за „Ноев ковчег". Останалите три отговора са факти за друго произведение.',
  'q-work-borba-012':
    'Ключовият факт е посочен в записките за „Борба". Останалите три отговора са факти за друго произведение.',
  'q-work-do-moeto-parvo-libe-012':
    'Ключовият факт е посочен в записките за „До моето първо либе". Останалите три отговора са факти за друго произведение.',
  'q-work-andreshko-009':
    'Ключовият факт е посочен в записките за „Андрешко". Останалите три отговора са факти за друго произведение.',
  'q-work-spasova-mogila-009':
    'Ключовият факт е посочен в записките за „Спасова могила". Останалите три отговора са факти за друго произведение.',
  'q-work-vetrenata-melnitsa-012':
    'Ключовият факт е посочен в записките за „Ветрената мелница". Останалите три отговора са факти за друго произведение.',
  'q-work-prikazka-za-stalbata-013':
    'Ключовият факт е посочен в записките за „Приказка за стълбата". Останалите три отговора са факти за друго произведение.',
  'q-work-kradetsat-na-praskovi-012':
    'Ключовият факт е посочен в записките за „Крадецът на праскови". Останалите три отговора са факти за друго произведение.',
  'q-work-gradushka-011':
    'Ключовият факт е посочен в записките за „Градушка". Останалите три отговора са факти за друго произведение.',
  'q-work-dve-dushi-011':
    'Ключовият факт е посочен в записките за „Две души". Останалите три отговора са факти за друго произведение.',
  'q-work-spi-ezeroto-012':
    'Ключовият факт е посочен в записките за „Спи езерото". Останалите три отговора са факти за друго произведение.',
  'q-work-az-iskam-da-te-pomnya-vse-taka-012':
    'Ключовият факт е посочен в записките за „Аз искам да те помня все така". Останалите три отговора са факти за друго произведение.',
  'q-work-kolko-si-hubava-012':
    'Ключовият факт е посочен в записките за „Колко си хубава!". Останалите три отговора са факти за друго произведение.',
  'q-work-posveshtenie-012':
    'Ключовият факт е посочен в записките за „Посвещение". Останалите три отговора са факти за друго произведение.',
  'q-work-molitva-012':
    'Ключовият факт е посочен в записките за „Молитва". Останалите три отговора са факти за друго произведение.',
  'q-work-pesenta-na-koleletata-011':
    'Ключовият факт е посочен в записките за „Песента на колелетата". Останалите три отговора са факти за друго произведение.',
  'q-work-balada-za-georg-henig-012':
    'Ключовият факт е посочен в записките за „Балада за Георг Хених". Останалите три отговора са факти за друго произведение.',
  'q-work-potomka-012':
    'Ключовият факт е посочен в записките за „Потомка". Останалите три отговора са факти за друго произведение.',
  'q-work-chesten-krast-013':
    'Ключовият факт е посочен в записките за „Честен кръст". Останалите три отговора са факти за друго произведение.',
};

// ─── 2. MISSING_WORK_ID fixes ───────────────────────────────────────────────

const missingWorkIdFixes = {
  'q-author-dimitar-talev-004':       'jelezniyat-svetilnik',
  'q-author-aleko-konstantinov-004':  'bai-ganyo-jurnalist',
  'q-author-stanislav-stratiev-003':  'balkanski-sindrom',
  'q-author-ivan-vazov-004':          'paisiy',
  'q-author-nikola-vaptsarov-004':    'istoriya',
  'q-author-yordan-radichkov-003':    'noev-kovcheg',
  'q-author-hristo-botev-004':        'borba',
  'q-author-elin-pelin-004':          'andreshko',
  'q-author-hristo-smirnenski-003':   'prikazka-za-stalbata',
  'q-author-emiliyan-stanev-003':     'kradetsat-na-praskovi',
  'q-author-emiliyan-stanev-009':     'kradetsat-na-praskovi',
  'q-author-peyo-yavorov-003':        'gradushka',
  'q-author-pencho-slaveykov-003':    'spi-ezeroto',
  'q-author-dimcho-debelyanov-003':   'az-iskam-da-te-pomnya-vse-taka',
  'q-author-hristo-fotev-003':        'kolko-si-hubava',
  'q-author-petya-dubarova-003':      'posveshtenie',
  'q-author-atanas-dalchev-004':      'molitva',
  'q-author-yordan-yovkov-004':       'pesenta-na-koleletata',
  'q-author-viktor-paskov-003':       'balada-za-georg-henig',
  'q-author-elisaveta-bagryana-003':  'potomka',
  'q-author-boris-hristov-003':       'chesten-krast',
};

// ─── 3. ENGLISH_WORDS fix ───────────────────────────────────────────────────

const englishWordsFixes = {
  'q-work-borba-003': (q) => ({
    ...q,
    explanation: q.explanation
      .replace(
        'е заменен като distractor, за да има само един верен отговор.',
        'е включен умишлено като неверен отговор, за да има само един верен отговор.'
      )
      .replace(
        'е включен умишлено като неверен вариант, за да има само един верен отговор.',
        'е включен умишлено като неверен отговор, за да има само един верен отговор.'
      ),
  }),
};

// ─── Apply fixes ────────────────────────────────────────────────────────────

let explanationFixed = 0;
let workIdFixed = 0;
let englishFixed = 0;

const originalCount = questions.length;

const updated = questions.map((q) => {
  let result = { ...q };

  // GENERIC_EXPLANATION
  if (genericExplanationFixes[q.id]) {
    if (result.explanation !== genericExplanationFixes[q.id]) {
      result = { ...result, explanation: genericExplanationFixes[q.id] };
      explanationFixed++;
    }
  }

  // MISSING_WORK_ID
  if (missingWorkIdFixes[q.id] !== undefined) {
    if (result.workId !== missingWorkIdFixes[q.id]) {
      result = { ...result, workId: missingWorkIdFixes[q.id] };
      workIdFixed++;
    }
  }

  // ENGLISH_WORDS
  if (englishWordsFixes[q.id]) {
    const patched = englishWordsFixes[q.id](result);
    if (patched.explanation !== result.explanation) {
      result = patched;
      englishFixed++;
    }
  }

  return result;
});

// ─── Safety checks ──────────────────────────────────────────────────────────

if (updated.length !== originalCount) {
  console.error(`ABORT: question count changed (${originalCount} → ${updated.length})`);
  process.exit(1);
}

// Verify no questions, options, or correctAnswer were changed
for (let i = 0; i < questions.length; i++) {
  const orig = questions[i];
  const upd  = updated[i];
  if (upd.id !== orig.id) {
    console.error(`ABORT: id mismatch at index ${i}`);
    process.exit(1);
  }
  if (upd.question !== orig.question) {
    console.error(`ABORT: question text changed for ${orig.id}`);
    process.exit(1);
  }
  if (upd.correctAnswer !== orig.correctAnswer) {
    console.error(`ABORT: correctAnswer changed for ${orig.id}`);
    process.exit(1);
  }
  if (JSON.stringify(upd.options) !== JSON.stringify(orig.options)) {
    console.error(`ABORT: options changed for ${orig.id}`);
    process.exit(1);
  }
}

// ─── Write ──────────────────────────────────────────────────────────────────

writeFileSync(questionsPath, JSON.stringify(updated, null, 2) + '\n', 'utf8');

console.log('Auto-fixes applied to src/data/questions.json');
console.log(`  GENERIC_EXPLANATION : ${explanationFixed} explanation(s) updated`);
console.log(`  MISSING_WORK_ID     : ${workIdFixed} workId(s) set`);
console.log(`  ENGLISH_WORDS       : ${englishFixed} explanation(s) patched`);
console.log(`  Total               : ${explanationFixed + workIdFixed + englishFixed}`);
console.log(`  Question count      : ${updated.length} (unchanged)`);
