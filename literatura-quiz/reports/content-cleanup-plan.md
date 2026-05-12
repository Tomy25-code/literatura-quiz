# Literatura Quiz — Content Cleanup Plan

Generated: 2026-05-12 | Source: `reports/qa-report.json`  
**91 warnings · 0 errors · JSON data files NOT modified**

---

## Quick reference

| Category | Count | Auto-fixable | Human review |
|----------|-------|-------------|--------------|
| GENERIC_EXPLANATION | 47 | 47 | 0 |
| LONG_OPTION | 22 | 0 | 22 |
| ENGLISH_WORDS | 1 | 1 | 0 |
| MISSING_WORK_ID | 21 | 21 | 0 |
| **Total** | **91** | **69** | **22** |

---

## 1. GENERIC_EXPLANATION (47 items)

### Root cause

All 47 are `true_false` questions of the form "Кое твърдение е вярно за [X]?" where the correct answer is a verbatim `key_fact` from `authors.json` or `works.json`. Every explanation uses the same boilerplate:

> "Твърдението е взето от записките за [X]."

This is low-information — it doesn't tell the student *why* that statement is true and the others are not.

### Proposed fix (template — same for all 47)

| Source | Proposed explanation |
|--------|---------------------|
| Author question | `Ключовият факт е посочен в записките за [Author name]. Останалите варианти са факти за друг автор.` |
| Work question | `Ключовият факт е посочен в записките за „[Work title]". Останалите варианти са факти за друго произведение.` |

### Why safe
- Changes only the `explanation` field
- Does not touch `question`, `options`, or `correctAnswer`
- New text is factually accurate and fully derivable from the data file structure
- No literary facts invented

### Fix type: **AUTO-FIXABLE** (all 47)

### Item list

| ID | Question (brief) | Correct answer (brief) | Proposed explanation |
|----|-----------------|----------------------|----------------------|
| q-author-dimitar-talev-010 | Вярно за Димитър Талев? | Талев е сред творците, които изграждат облика на жанра на социалния роман. | Ключовият факт е посочен в записките за Димитър Талев. Останалите варианти са факти за друг автор. |
| q-author-aleko-konstantinov-010 | Вярно за Алеко Константинов? | В културното пространство остава като „съвестта на нацията". | Ключовият факт е посочен в записките за Алеко Константинов. Останалите варианти са факти за друг автор. |
| q-author-stanislav-stratiev-008 | Вярно за Станислав Стратиев? | Пише разкази, фейлетони и пиеси. | Ключовият факт е посочен в записките за Станислав Стратиев. Останалите варианти са факти за друг автор. |
| q-author-ivan-vazov-012 | Вярно за Иван Вазов? | Словото му е мост на възхищението между миналото и болезнената съвременност. | Ключовият факт е посочен в записките за Иван Вазов. Останалите варианти са факти за друг автор. |
| q-author-nikola-vaptsarov-011 | Вярно за Никола Вапцаров? | Най-ярък представител на пролетарската поезия. | Ключовият факт е посочен в записките за Никола Вапцаров. Останалите варианти са факти за друг автор. |
| q-author-yordan-radichkov-009 | Вярно за Йордан Радичков? | Откроява се с иронично-присмехулно отношение към обикновения човек. | Ключовият факт е посочен в записките за Йордан Радичков. Останалите варианти са факти за друг автор. |
| q-author-hristo-botev-012 | Вярно за Христо Ботев? | Съчетава революционното дело, публицистиката и поезията. | Ключовият факт е посочен в записките за Христо Ботев. Останалите варианти са факти за друг автор. |
| q-author-elin-pelin-014 | Вярно за Елин Пелин? | В класическите му кратки разкази оживяват картини на селското битие. | Ключовият факт е посочен в записките за Елин Пелин. Останалите варианти са факти за друг автор. |
| q-author-hristo-smirnenski-010 | Вярно за Христо Смирненски? | Определян е като представител на постсимволизма в българската литература. | Ключовият факт е посочен в записките за Христо Смирненски. Останалите варианти са факти за друг автор. |
| q-author-emiliyan-stanev-009 | Вярно за Емилиян Станев? | „Крадецът на праскови" връща към времето на Първата световна война. | Ключовият факт е посочен в записките за Емилиян Станев. Останалите варианти са факти за друг автор. |
| q-author-peyo-yavorov-009 | Вярно за Пейо Яворов? | Част е от кръга „Мисъл" заедно с д-р Кръстев, П. Славейков и П. Тодоров. | Ключовият факт е посочен в записките за Пейо Яворов. Останалите варианти са факти за друг автор. |
| q-author-pencho-slaveykov-008 | Вярно за Пенчо Славейков? | Един от първите български поети, творящи в жанровата форма на лирическата миниатюра. | Ключовият факт е посочен в записките за Пенчо Славейков. Останалите варианти са факти за друг автор. |
| q-author-dimcho-debelyanov-008 | Вярно за Димчо Дебелянов? | Сред представителите на второто поколение модернисти — символистите. | Ключовият факт е посочен в записките за Димчо Дебелянов. Останалите варианти са факти за друг автор. |
| q-author-hristo-fotev-007 | Вярно за Христо Фотев? | Поезията му не се подчинява на класическото стихосложение. | Ключовият факт е посочен в записките за Христо Фотев. Останалите варианти са факти за друг автор. |
| q-author-petya-dubarova-009 | Вярно за Петя Дубарова? | Стихотворенията ѝ са свързани с младежките копнежи по любовта. | Ключовият факт е посочен в записките за Петя Дубарова. Останалите варианти са факти за друг автор. |
| q-author-atanas-dalchev-008 | Вярно за Атанас Далчев? | Вглежда се в проблемите на интелектуалеца. | Ключовият факт е посочен в записките за Атанас Далчев. Останалите варианти са факти за друг автор. |
| q-author-yordan-yovkov-009 | Вярно за Йордан Йовков? | В произведенията му се откроява доброто, независимо кой персонаж е в центъра. | Ключовият факт е посочен в записките за Йордан Йовков. Останалите варианти са факти за друг автор. |
| q-author-viktor-paskov-009 | Вярно за Виктор Пасков? | Героите често носят черти на характера му, а животът им повтаря моменти от неговия. | Ключовият факт е посочен в записките за Виктор Пасков. Останалите варианти са факти за друг автор. |
| q-author-elisaveta-bagryana-009 | Вярно за Елисавета Багряна? | Лирическата ѝ героиня не желае да се примири с ограниченията на родовия бит. | Ключовият факт е посочен в записките за Елисавета Багряна. Останалите варианти са факти за друг автор. |
| q-author-boris-hristov-008 | Вярно за Борис Христов? | Издава две стихосбирки, след което се отказва от поезията. | Ключовият факт е посочен в записките за Борис Христов. Останалите варианти са факти за друг автор. |
| q-work-jelezniyat-svetilnik-013 | Вярно за „Железният светилник"? | Първи роман от тетралогията на Димитър Талев. | Ключовият факт е посочен в записките за „Железният светилник". Останалите варианти са факти за друго произведение. |
| q-work-bai-ganyo-jurnalist-013 | Вярно за „Бай Ганьо журналист"? | Творбата е част от книгата „Бай Ганьо - невероятни разкази за един съвременен българин". | Ключовият факт е посочен в записките за „Бай Ганьо журналист". Останалите варианти са факти за друго произведение. |
| q-work-balkanski-sindrom-012 | Вярно за „Балкански синдром"? | Поставена е на сцена през 1987 г. | Ключовият факт е посочен в записките за „Балкански синдром". Останалите варианти са факти за друго произведение. |
| q-work-paisiy-011 | Вярно за „Паисий"? | Част от цикъла „Епопея на забравените". | Ключовият факт е посочен в записките за „Паисий". Останалите варианти са факти за друго произведение. |
| q-work-novoto-grobishte-nad-slivnitsa-009 | Вярно за „Новото гробище над Сливница"? | Част от стихосбирката „Сливница". | Ключовият факт е посочен в записките за „Новото гробище над Сливница". Останалите варианти са факти за друго произведение. |
| q-work-pri-rilskiya-manastir-013 | Вярно за „При Рилския манастир"? | Част от цикъла „В лоното на Рила". | Ключовият факт е посочен в записките за „При Рилския манастир". Останалите варианти са факти за друго произведение. |
| q-work-istoriya-012 | Вярно за „История"? | Създадена е през 1939/1940 г. | Ключовият факт е посочен в записките за „История". Останалите варианти са факти за друго произведение. |
| q-work-vyara-011 | Вярно за „Вяра"? | Част от „Моторни песни". | Ключовият факт е посочен в записките за „Вяра". Останалите варианти са факти за друго произведение. |
| q-work-noev-kovcheg-013 | Вярно за „Ноев ковчег"? | Излиза за пръв път през 1984 г. в списание „Съвременник". | Ключовият факт е посочен в записките за „Ноев ковчег". Останалите варианти са факти за друго произведение. |
| q-work-borba-012 | Вярно за „Борба"? | Създадена е през 1871 г. | Ключовият факт е посочен в записките за „Борба". Останалите варианти са факти за друго произведение. |
| q-work-do-moeto-parvo-libe-012 | Вярно за „До моето първо либе"? | Създадено е през 1871 г. | Ключовият факт е посочен в записките за „До моето първо либе". Останалите варианти са факти за друго произведение. |
| q-work-andreshko-009 | Вярно за „Андрешко"? | Публикуван е за първи път в списание „Просвета". | Ключовият факт е посочен в записките за „Андрешко". Останалите варианти са факти за друго произведение. |
| q-work-spasova-mogila-009 | Вярно за „Спасова могила"? | Създаден е през 1905 г. | Ключовият факт е посочен в записките за „Спасова могила". Останалите варианти са факти за друго произведение. |
| q-work-vetrenata-melnitsa-012 | Вярно за „Ветрената мелница"? | Първата публикация е през 1902 г. | Ключовият факт е посочен в записките за „Ветрената мелница". Останалите варианти са факти за друго произведение. |
| q-work-prikazka-za-stalbata-013 | Вярно за „Приказка за стълбата"? | Създадена е през 1923 г. | Ключовият факт е посочен в записките за „Приказка за стълбата". Останалите варианти са факти за друго произведение. |
| q-work-kradetsat-na-praskovi-012 | Вярно за „Крадецът на праскови"? | Издадена е през 1948 г. | Ключовият факт е посочен в записките за „Крадецът на праскови". Останалите варианти са факти за друго произведение. |
| q-work-gradushka-011 | Вярно за „Градушка"? | Създадена е през 1900 г. | Ключовият факт е посочен в записките за „Градушка". Останалите варианти са факти за друго произведение. |
| q-work-dve-dushi-011 | Вярно за „Две души"? | Първоначално е отпечатано в списание „Мисъл". | Ключовият факт е посочен в записките за „Две души". Останалите варианти са факти за друго произведение. |
| q-work-spi-ezeroto-012 | Вярно за „Спи езерото"? | Създадена е през 1906 г. | Ключовият факт е посочен в записките за „Спи езерото". Останалите варианти са факти за друго произведение. |
| q-work-az-iskam-da-te-pomnya-vse-taka-012 | Вярно за „Аз искам да те помня все така"? | Първата публикация е в списание „Смях" със заглавие „Елегия". | Ключовият факт е посочен в записките за „Аз искам да те помня все така". Останалите варианти са факти за друго произведение. |
| q-work-kolko-si-hubava-012 | Вярно за „Колко си хубава!"? | Публикувана е през 1967 г. | Ключовият факт е посочен в записките за „Колко си хубава!". Останалите варианти са факти за друго произведение. |
| q-work-posveshtenie-012 | Вярно за „Посвещение"? | Публикувана е в списание „Родна реч" през 1979 г. | Ключовият факт е посочен в записките за „Посвещение". Останалите варианти са факти за друго произведение. |
| q-work-molitva-012 | Вярно за „Молитва"? | Публикувана е за първи път във вестник „Стрелец". | Ключовият факт е посочен в записките за „Молитва". Останалите варианти са факти за друго произведение. |
| q-work-pesenta-na-koleletata-011 | Вярно за „Песента на колелетата"? | Първоначално е публикуван в списание „Златорог". | Ключовият факт е посочен в записките за „Песента на колелетата". Останалите варианти са факти за друго произведение. |
| q-work-balada-za-georg-henig-012 | Вярно за „Балада за Георг Хених"? | Възниква през 1987 г. | Ключовият факт е посочен в записките за „Балада за Георг Хених". Останалите варианти са факти за друго произведение. |
| q-work-potomka-012 | Вярно за „Потомка"? | Първата публикация е в списание „Златорог". | Ключовият факт е посочен в записките за „Потомка". Останалите варианти са факти за друго произведение. |
| q-work-chesten-krast-013 | Вярно за „Честен кръст"? | „Честен кръст" е втората книга на Борис Христов. | Ключовият факт е посочен в записките за „Честен кръст". Останалите варианти са факти за друго произведение. |

---

## 2. LONG_OPTION (22 items)

### Root cause

`creative_history` and `composition` questions reproduce verbatim passages from `works.json`. Some passages exceed the 280-char QA threshold. The same long texts are also reused as **distractors** in other questions — those distractor copies can be shortened without touching the source data.

### Two sub-types

**Type A — Long text is the CORRECT answer (7 items)**  
The option is verbatim from `works.json`. Shortening requires either:
- Editing `works.json` (needs explicit permission)
- Truncating the question option only (risks loss of meaning — human judgment required)
- Splitting into shorter sub-questions (editorial decision)

→ **NEEDS HUMAN REVIEW** (all 7)

**Type B — Long text is a WRONG distractor (15 items)**  
The long text identifies a different work and is used purely as a distractor. Shorter text still uniquely identifies the wrong work and functions as an effective distractor.

→ **HUMAN REVIEW RECOMMENDED** — proposed shortened texts are provided below. Reviewer should confirm meaning is preserved before applying.

---

### Unique long texts with proposed shortenings

Six distinct texts drive all 22 warnings. Proposed shortenings apply to **distractor occurrences only**.

---

#### Text A — "Ветрената мелница" creative_history (283 chars)

**Current (verbatim from `works.json → vetrenata-melnitsa → creative_history`):**
> Първа публикация през 1902 г. с посвещение „Брату си Хр. Ивановц". По спомени на близки прототип на Лазар Дъбака е бащата на писателя, който е проектирал вятърна мелница. Пейзажът и обстановката съответстват на родното село на писателя. През 1904 г. е публикуван в сборник „Разкази".

**Proposed shortened text for distractor use (~195 chars):**
> Първа публикация през 1902 г. с посвещение „Брату си Хр. Ивановц". Прототип на Лазар Дъбака е бащата на писателя. Пейзажът съответства на родното му село. Включен в сборник „Разкази" (1904).

**Occurrences:**

| ID | opt | Role | Action |
|----|-----|------|--------|
| q-work-vetrenata-melnitsa-005 | [0] | CORRECT | NEEDS HUMAN REVIEW |
| q-work-bai-ganyo-jurnalist-005 | [0] | WRONG distractor | Apply Text A shortened |
| q-work-istoriya-005 | [2] | WRONG distractor | Apply Text A shortened |
| q-work-spi-ezeroto-005 | [3] | WRONG distractor | Apply Text A shortened |
| q-work-potomka-005 | [1] | WRONG distractor | Apply Text A shortened |

---

#### Text B — "Аз искам да те помня все така" creative_history (303 chars)

**Current (verbatim from `works.json → az-iskam-da-te-pomnya-vse-taka → creative_history`):**
> Първата публикация на творбата е в списание „Смях" със заглавие „Елегия". Посветена е на Мария Василева - звънчето, и има посвещение „На Зв" по повод раздялата на поета с нея, породила рана и скръб. През 1913 г. е отпечатана в списание „Художествена култура" като част от цикъла „Елегии" и без заглавие.

**Proposed shortened text for distractor use (~210 chars):**
> Публикувана е в сп. „Смях" с наименование „Елегия". Посветена е на Мария Василева (посвещение „На Зв") по повод раздялата на поета с нея. През 1913 г. е включена в „Художествена култура" като цикъл „Елегии".

**Occurrences:**

| ID | opt | Role | Action |
|----|-----|------|--------|
| q-work-az-iskam-da-te-pomnya-vse-taka-005 | [3] | CORRECT | NEEDS HUMAN REVIEW |
| q-work-bai-ganyo-jurnalist-005 | [2] | WRONG distractor | Apply Text B shortened |
| q-work-kradetsat-na-praskovi-005 | [2] | WRONG distractor | Apply Text B shortened |

---

#### Text C — "Бай Ганьо журналист" composition (304 chars)

**Current (verbatim from `works.json → bai-ganyo-jurnalist → composition`):**
> Композиционна рамка, разказ в разказа. Книгата се състои от две части, всяка със свой повествователен модел. Първата включва девет очерка, обединени под общото название „Бай Ганьо тръгна по Европа", а втората - три очерка: „Бай Ганьо се върна от Европа", „Бай Ганьо прави избори" и „Бай Ганьо журналист".

**Proposed shortened text for distractor use (~228 chars):**
> Композиционна рамка, разказ в разказа. Книгата е в две части: първата — девет очерка под „Бай Ганьо тръгна по Европа", а втората — три очерка: „Бай Ганьо се върна от Европа", „Бай Ганьо прави избори" и „Бай Ганьо журналист".

**Occurrences:**

| ID | opt | Role | Action |
|----|-----|------|--------|
| q-work-bai-ganyo-jurnalist-006 | [3] | CORRECT | NEEDS HUMAN REVIEW |
| q-work-bai-ganyo-jurnalist-020 | [2] | CORRECT | NEEDS HUMAN REVIEW |
| q-work-balkanski-sindrom-019 | [0] | WRONG distractor | Apply Text C shortened |
| q-work-paisiy-006 | [3] | WRONG distractor | Apply Text C shortened |
| q-work-vetrenata-melnitsa-006 | [3] | WRONG distractor | Apply Text C shortened |
| q-work-posveshtenie-019 | [1] | WRONG distractor | Apply Text C shortened |

---

#### Text D — "История" creative_history (281 chars — 1 char over)

**Current (verbatim from `works.json → istoriya → creative_history`):**
> Творбата е създадена във време на драматични социални конфликти и исторически обрати. Носи белезите на епохата с нейната тревожност и задава въпроси за мястото на „малкия човек" в голямата история. Има новаторски черти и като светогледни идеи, и като художествени изразни средства.

**Proposed shortened text for distractor use (~203 chars):**
> Творбата е от период на драматични социални конфликти. Носи белезите на епохата и задава въпроси за малкия човек в историята. Има новаторски черти — светогледни идеи и художествени изразни средства.

**Note on correct answer occurrence:** `q-work-istoriya-005` opt[3] is 281 chars — exactly 1 over. A minimal trim (e.g. removing "и като" before "художествени") would fix it. Proposed: `...Има новаторски черти и като светогледни идеи, и в художествените изразни средства.` — but this requires verifying the meaning is unchanged. → HUMAN REVIEW.

**Occurrences:**

| ID | opt | Role | Action |
|----|-----|------|--------|
| q-work-istoriya-005 | [3] | CORRECT | NEEDS HUMAN REVIEW (1 char over) |
| q-work-andreshko-005 | [1] | WRONG distractor | Apply Text D shortened |
| q-work-az-iskam-da-te-pomnya-vse-taka-005 | [2] | WRONG distractor | Apply Text D shortened |
| q-work-chesten-krast-005 | [2] | WRONG distractor | Apply Text D shortened |

---

#### Text E — "Градушка" creative_history (337 chars)

**Current (verbatim from `works.json → gradushka → creative_history`):**
> Творбата е от първия творчески период на поета, когато социалната тематика присъства по-осезано в лириката му. В идейно отношение стои близо до група стихотворения от този период, в които тежкият живот на селянина труденик и неговото оцеляване са в пряка връзка с външни фактори. В конкретния случай зависят от проявлението на природата.

**Proposed shortened text for distractor use (~200 chars):**
> Творбата е от първия творчески период на Яворов, когато социалната тематика е по-осезана. Стои близо до стихотворения за тежкия живот на селянина труденик и оцеляването му в зависимост от природата.

**Occurrences:**

| ID | opt | Role | Action |
|----|-----|------|--------|
| q-work-gradushka-005 | [1] | CORRECT | NEEDS HUMAN REVIEW |
| q-work-vyara-005 | [0] | WRONG distractor | Apply Text E shortened |

---

#### Text F — "Бай Ганьо журналист" creative_history (352 chars)

**Current (verbatim from `works.json → bai-ganyo-jurnalist → creative_history`):**
> Творбата е създадена в годините след Освобождението, време на упадък на ценностите от Възраждането. Действителността изобилства от примери, които могат да послужат за прототип на Алековия герой. Сред тях са разказите на бащата на писателя за „подвизите" на българина, попаднал в конфузни ситуации в чужбина заради невладеенето на чуждия език и култура.

**Proposed shortened text for distractor use (~215 chars):**
> Творбата е от годините след Освобождението — период на упадък на Възрожденските ценности. Прототипи за Алековия герой дава самата действителност, включително разказите на бащата на писателя за „подвизите" на българина в чужбина.

**Occurrences:**

| ID | opt | Role | Action |
|----|-----|------|--------|
| q-work-bai-ganyo-jurnalist-005 | [1] | CORRECT | NEEDS HUMAN REVIEW |
| q-work-kolko-si-hubava-005 | [3] | WRONG distractor | Apply Text F shortened |

---

### Systemic note for human reviewer

The 7 Type A items all arise from `creative_history` category questions where the correct answer IS the long source text. Three options for resolution:

1. **Raise the QA character limit** for `creative_history` question type specifically (e.g. 360 chars). No data change needed.
2. **Editorial shortening** of the correct answer option text, verified against meaning.
3. **Split question** into sub-questions covering specific sub-facts.

Option 1 is the lowest-risk change. Options 2–3 require human editorial judgment.

---

## 3. ENGLISH_WORDS (1 item)

### Fix type: **AUTO-FIXABLE**

| ID | Field | Issue |
|----|-------|-------|
| q-work-borba-003 | `explanation` | Contains English word "distractor" |

**Current explanation (full):**
> В записките „Борба" е определена като „стихотворение; философска и политическа поезия". Генеричният отговор „стихотворение" е заменен като distractor, за да има само един верен отговор.

**Proposed explanation:**
> В записките „Борба" е определена като „стихотворение; философска и политическа поезия". Единствено пълното определение е верният отговор — по-краткото „стихотворение" е включено умишлено като неверен вариант.

**Why safe:** Changes only the `explanation` field. `correctAnswer` and `options` are untouched. Proposed text conveys identical meaning in Bulgarian.

**Wrong answer check:** No concern. The genre from `works.json` is the full phrase "стихотворение; философска и политическа поезия". The shorter "стихотворение" alone appears as a wrong distractor by design — the explanation makes this transparent. This is a legitimate quiz design decision, not a data error.

---

## 4. MISSING_WORK_ID (21 items)

### Root cause

These questions have `workId: null` even though the question text or correct answer mentions exactly one known work from `works.json`. Setting `workId` allows the app to surface these questions when browsing or filtering by work.

### Why safe
- Additive change only — adds a value to an existing null field
- `question`, `options`, `correctAnswer`, `explanation` are untouched
- Each work title maps 1:1 to a known `works.json` entry; the `workId` values are confirmed by the QA script
- No literary facts are involved

### Fix type: **AUTO-FIXABLE** (all 21)

| ID | Category | Work mentioned in question | Proposed `workId` |
|----|----------|--------------------------|-------------------|
| q-author-dimitar-talev-004 | work | Железният светилник | `jelezniyat-svetilnik` |
| q-author-aleko-konstantinov-004 | work | Бай Ганьо журналист | `bai-ganyo-jurnalist` |
| q-author-stanislav-stratiev-003 | work | Балкански синдром | `balkanski-sindrom` |
| q-author-ivan-vazov-004 | work | Паисий | `paisiy` |
| q-author-nikola-vaptsarov-004 | work | История | `istoriya` |
| q-author-yordan-radichkov-003 | work | Ноев ковчег | `noev-kovcheg` |
| q-author-hristo-botev-004 | work | Борба | `borba` |
| q-author-elin-pelin-004 | work | Андрешко | `andreshko` |
| q-author-hristo-smirnenski-003 | work | Приказка за стълбата | `prikazka-za-stalbata` |
| q-author-emiliyan-stanev-003 | work | Крадецът на праскови | `kradetsat-na-praskovi` |
| q-author-emiliyan-stanev-009 | true_false | Крадецът на праскови (in correct answer) | `kradetsat-na-praskovi` |
| q-author-peyo-yavorov-003 | work | Градушка | `gradushka` |
| q-author-pencho-slaveykov-003 | work | Спи езерото | `spi-ezeroto` |
| q-author-dimcho-debelyanov-003 | work | Аз искам да те помня все така | `az-iskam-da-te-pomnya-vse-taka` |
| q-author-hristo-fotev-003 | work | Колко си хубава! | `kolko-si-hubava` |
| q-author-petya-dubarova-003 | work | Посвещение | `posveshtenie` |
| q-author-atanas-dalchev-004 | work | Молитва | `molitva` |
| q-author-yordan-yovkov-004 | work | Песента на колелетата | `pesenta-na-koleletata` |
| q-author-viktor-paskov-003 | work | Балада за Георг Хених | `balada-za-georg-henig` |
| q-author-elisaveta-bagryana-003 | work | Потомка | `potomka` |
| q-author-boris-hristov-003 | work | Честен кръст | `chesten-krast` |

**Note on q-author-emiliyan-stanev-009:** This is a `true_false` question (not `work` category), but the correct answer is explicitly about „Крадецът на праскови". Adding `workId` here enables work-based filtering for this fact, which is semantically appropriate.

---

## 5. Final summary

### Fix count

| Type | Count | Fix type |
|------|-------|----------|
| GENERIC_EXPLANATION | 47 | AUTO-FIXABLE — template explanation |
| MISSING_WORK_ID | 21 | AUTO-FIXABLE — add `workId` value |
| ENGLISH_WORDS | 1 | AUTO-FIXABLE — Bulgarian replacement |
| **Auto-fixable total** | **69** | |
| LONG_OPTION — correct answer | 7 | HUMAN REVIEW — editorial shortening or raise QA limit |
| LONG_OPTION — distractor proposals | 15 | HUMAN REVIEW — review proposed shortened texts |
| **Human review total** | **22** | |
| **Grand total** | **91** | |

### Wrong answer assessment

**No questions with a potentially incorrect `correctAnswer` were found.**

All correct answers are verbatim extracts from `authors.json` (`key_facts`, `period`, `nickname`) or `works.json` (`key_facts`, `creative_history`, `composition`). All wrong options are data fields from other authors/works. No invented literary facts detected across all 91 flagged items.

### Suggested execution order

1. **Apply MISSING_WORK_ID fixes** (21 items) — zero risk, purely additive
2. **Apply ENGLISH_WORDS fix** (1 item) — zero risk, explanation-only
3. **Apply GENERIC_EXPLANATION fixes** (47 items) — low risk, explanation-only
4. **Human review: LONG_OPTION distractor proposals** (15 items) — approve/modify Text A–F shortened versions
5. **Human review: LONG_OPTION correct answers** (7 items) — decide: raise QA limit, shorten editorially, or split questions

---

_Plan generated from `reports/qa-report.json` and cross-referenced against `src/data/authors.json`, `src/data/works.json`, `src/data/questions.json`. No data files were modified._
