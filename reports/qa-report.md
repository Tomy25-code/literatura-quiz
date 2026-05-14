# Literatura Quiz — Content QA Report

Generated: 14.05.2026 г., 20:41:16 ч.

---

## Summary

| Metric | Value |
|--------|-------|
| Authors | 20 |
| Works | 27 |
| Base questions (questions.json) | 415 |
| Generated variants (questions.v2.json) | 81 |
| Generated type questions (questions.types.json) | 59 |
| **Total questions** | **638** |
| **Total errors** | **0** |
| **Total warnings** | **19** |
| Questions with errors | 0 |
| Questions needing review | 0 |

---

## Category distribution

| Category | Questions |
| -------- | --------- |
| true_false | 148 |
| fill_blank | 83 |
| author | 62 |
| period | 47 |
| themes | 47 |
| essay_preparation | 47 |
| work | 40 |
| genre | 27 |
| creative_history | 27 |
| composition | 27 |
| work_recognition | 26 |
| motifs | 24 |
| literary_context | 20 |
| nickname | 8 |
| match_author_work | 5 |


## Difficulty distribution

| Difficulty | Questions |
| ---------- | --------- |
| Лесно | 224 |
| Средно | 320 |
| Трудно | 94 |


## Questions per author (top 20)

| Author | Questions |
| ------ | --------- |
| Иван Вазов | 61 |
| Елин Пелин | 60 |
| Христо Ботев | 45 |
| Никола Вапцаров | 44 |
| Пейо Яворов | 43 |
| Димитър Талев | 29 |
| Атанас Далчев | 29 |
| Йордан Йовков | 29 |
| Алеко Константинов | 28 |
| Станислав Стратиев | 26 |
| Йордан Радичков | 26 |
| Емилиян Станев | 26 |
| Пенчо Славейков | 26 |
| Димчо Дебелянов | 26 |
| Христо Фотев | 26 |
| Петя Дубарова | 26 |
| Виктор Пасков | 26 |
| Елисавета Багряна | 26 |
| Борис Христов | 26 |
| Христо Смирненски | 25 |


## Questions per work (top 20, works with questions only)

| Work | Questions |
| ---- | --------- |
| Крадецът на праскови | 21 |
| Железният светилник | 20 |
| Балкански синдром | 20 |
| Ноев ковчег | 20 |
| Градушка | 20 |
| Спи езерото | 20 |
| Аз искам да те помня все така | 20 |
| Колко си хубава! | 20 |
| Посвещение | 20 |
| Молитва | 20 |
| Песента на колелетата | 20 |
| Балада за Георг Хених | 20 |
| Потомка | 20 |
| Честен кръст | 20 |
| Бай Ганьо журналист | 19 |
| Паисий | 19 |
| Борба | 19 |
| Андрешко | 19 |
| Приказка за стълбата | 19 |
| История | 18 |
| При Рилския манастир | 17 |
| Вяра | 17 |
| До моето първо либе | 17 |
| Две души | 17 |
| Новото гробище над Сливница | 16 |
| Спасова могила | 16 |
| Ветрената мелница | 16 |


---

## Top errors

_No errors found._


## Top warnings

| ID | Code | Message |
| ---- | ---- | ------- |
| q-work-bai-ganyo-jurnalist-005 | LONG_OPTION | option[0] is 283 chars (max 280): "Първа публикация през 1902 г. с посвещение… |
| q-work-bai-ganyo-jurnalist-005 | LONG_OPTION | option[1] is 352 chars (max 280): "Творбата е създадена в годините след Освоб… |
| q-work-bai-ganyo-jurnalist-005 | LONG_OPTION | option[2] is 303 chars (max 280): "Първата публикация на творбата е в списани… |
| q-work-bai-ganyo-jurnalist-006 | LONG_OPTION | option[3] is 304 chars (max 280): "Композиционна рамка, разказ в разказа. Кни… |
| q-work-paisiy-006 | LONG_OPTION | option[3] is 304 chars (max 280): "Композиционна рамка, разказ в разказа. Кни… |
| q-work-istoriya-005 | LONG_OPTION | option[2] is 283 chars (max 280): "Първа публикация през 1902 г. с посвещение… |
| q-work-istoriya-005 | LONG_OPTION | option[3] is 281 chars (max 280): "Творбата е създадена във време на драматич… |
| q-work-vyara-005 | LONG_OPTION | option[0] is 337 chars (max 280): "Творбата е от първия творчески период на п… |
| q-work-andreshko-005 | LONG_OPTION | option[1] is 281 chars (max 280): "Творбата е създадена във време на драматич… |
| q-work-vetrenata-melnitsa-005 | LONG_OPTION | option[0] is 283 chars (max 280): "Първа публикация през 1902 г. с посвещение… |
| q-work-vetrenata-melnitsa-006 | LONG_OPTION | option[3] is 304 chars (max 280): "Композиционна рамка, разказ в разказа. Кни… |
| q-work-kradetsat-na-praskovi-005 | LONG_OPTION | option[2] is 303 chars (max 280): "Първата публикация на творбата е в списани… |
| q-work-gradushka-005 | LONG_OPTION | option[1] is 337 chars (max 280): "Творбата е от първия творчески период на п… |
| q-work-spi-ezeroto-005 | LONG_OPTION | option[3] is 283 chars (max 280): "Първа публикация през 1902 г. с посвещение… |
| q-work-az-iskam-da-te-pomnya-vse-taka-005 | LONG_OPTION | option[2] is 281 chars (max 280): "Творбата е създадена във време на драматич… |
| q-work-az-iskam-da-te-pomnya-vse-taka-005 | LONG_OPTION | option[3] is 303 chars (max 280): "Първата публикация на творбата е в списани… |
| q-work-kolko-si-hubava-005 | LONG_OPTION | option[3] is 352 chars (max 280): "Творбата е създадена в годините след Освоб… |
| q-work-potomka-005 | LONG_OPTION | option[1] is 283 chars (max 280): "Първа публикация през 1902 г. с посвещение… |
| q-work-chesten-krast-005 | LONG_OPTION | option[2] is 281 chars (max 280): "Творбата е създадена във време на драматич… |


---

## Recommendations

- ✅ **No errors** — all technical validation checks passed.
- ⚠️ Review **19 option(s)** longer than 280 characters — they may be hard to read on mobile.

---

_Report generated by scripts/qa-content.mjs_
