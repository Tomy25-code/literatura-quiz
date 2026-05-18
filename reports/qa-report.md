# Literatura Quiz — Content QA Report

Generated: 18.05.2026 г., 18:17:45 ч.

---

## Summary

| Metric | Value |
|--------|-------|
| Authors | 20 |
| Works | 27 |
| Base questions (questions.json) | 415 |
| Generated variants (questions.v2.json) | 81 |
| Generated type questions (questions.types.json) | 59 |
| **Total questions** | **702** |
| **Total errors** | **0** |
| **Total warnings** | **19** |
| Questions with errors | 0 |
| Questions needing review | 0 |

---

## Category distribution

| Category | Questions |
| -------- | --------- |
| true_false | 148 |
| work_recognition | 90 |
| fill_blank | 83 |
| author | 62 |
| period | 47 |
| themes | 47 |
| essay_preparation | 47 |
| work | 40 |
| genre | 27 |
| creative_history | 27 |
| composition | 27 |
| motifs | 24 |
| literary_context | 20 |
| nickname | 8 |
| match_author_work | 5 |


## Difficulty distribution

| Difficulty | Questions |
| ---------- | --------- |
| Лесно | 224 |
| Средно | 362 |
| Трудно | 116 |


## Questions per author (top 20)

| Author | Questions |
| ------ | --------- |
| Иван Вазов | 66 |
| Елин Пелин | 65 |
| Никола Вапцаров | 49 |
| Христо Ботев | 49 |
| Пейо Яворов | 48 |
| Димитър Талев | 32 |
| Атанас Далчев | 32 |
| Алеко Константинов | 31 |
| Йордан Йовков | 30 |
| Станислав Стратиев | 29 |
| Емилиян Станев | 29 |
| Пенчо Славейков | 29 |
| Димчо Дебелянов | 29 |
| Петя Дубарова | 29 |
| Елисавета Багряна | 29 |
| Борис Христов | 29 |
| Йордан Радичков | 28 |
| Христо Смирненски | 28 |
| Христо Фотев | 28 |
| Виктор Пасков | 28 |


## Questions per work (top 20, works with questions only)

| Work | Questions |
| ---- | --------- |
| Крадецът на праскови | 24 |
| Железният светилник | 23 |
| Балкански синдром | 23 |
| Спи езерото | 23 |
| Аз искам да те помня все така | 23 |
| Посвещение | 23 |
| Молитва | 23 |
| Потомка | 23 |
| Честен кръст | 23 |
| Бай Ганьо журналист | 22 |
| Ноев ковчег | 22 |
| Приказка за стълбата | 22 |
| Градушка | 22 |
| Колко си хубава! | 22 |
| Балада за Георг Хених | 22 |
| Паисий | 21 |
| История | 21 |
| Борба | 21 |
| Песента на колелетата | 21 |
| Андрешко | 20 |
| Две души | 20 |
| При Рилския манастир | 19 |
| Вяра | 19 |
| До моето първо либе | 19 |
| Спасова могила | 18 |
| Ветрената мелница | 18 |
| Новото гробище над Сливница | 17 |


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
