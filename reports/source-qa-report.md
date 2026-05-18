# Literatura Quiz — Source QA Report

Generated: 18.05.2026 г., 18:07:46 ч.
Source file: `source/literatura-zapiski.md`

---

## Summary

| Metric | Value |
|--------|-------|
| Authors checked | 20 |
| Works checked | 27 |
| Questions checked | 415 |
| **Total findings** | **581** |
| ✅ OK (source-supported) | 320 |
| ⚠️ Warnings (needs review) | 261 |
| ❌ Possible errors | 0 |

### By type

| Type | OK | Warnings | Errors |
|------|-----|---------|--------|
| Authors | 109 | 48 | 0 |
| Works | 211 | 94 | 0 |
| Questions | 0 | 119 | 0 |

---

## Possible errors (0)

_No errors found._


---

## Top warnings (first 30 of 261)

| ID | Field | Message |
|----|----|---|
| `dimitar-talev` | `key_facts` | KNOWN SOURCE ARTIFACT: Source markdown says "сред вторите" — this is an OCR/bold-markup artifact (bold markers around "творите" were mangled). JSON value "сред творците" is semantically correct and is kept unchanged. No fix needed in authors.json. |
| `aleko-konstantinov` | `nickname` | Nickname "Щастливеца; съвестта на нацията" not clearly found in source (score 67%). |
| `aleko-konstantinov` | `main_themes` | 3/5 themes found in source (60%). Some themes may be paraphrased or derived — needs human review. |
| `aleko-konstantinov` | `key_facts[0]` | Key fact has partial/low source match (score 83%). Needs human review. |
| `aleko-konstantinov` | `key_facts[1]` | Key fact has partial/low source match (score 78%). Needs human review. |
| `stanislav-stratiev` | `key_facts[0]` | Key fact has partial/low source match (score 75%). Needs human review. |
| `stanislav-stratiev` | `key_facts[1]` | Key fact has partial/low source match (score 80%). Needs human review. |
| `ivan-vazov` | `main_themes` | 1/5 themes found in source (20%). Some themes may be paraphrased or derived — needs human review. |
| `ivan-vazov` | `works[paisiy]` | Work "paisiy" not found in author's source section — may be in a sub-section only. |
| `ivan-vazov` | `works[novoto-grobishte-nad-slivnitsa]` | Work "novoto-grobishte-nad-slivnitsa" not found in author's source section — may be in a sub-section only. |
| `ivan-vazov` | `works[pri-rilskiya-manastir]` | Work "pri-rilskiya-manastir" not found in author's source section — may be in a sub-section only. |
| `nikola-vaptsarov` | `main_themes` | 3/5 themes found in source (60%). Some themes may be paraphrased or derived — needs human review. |
| `nikola-vaptsarov` | `key_facts[0]` | Key fact has partial/low source match (score 67%). Needs human review. |
| `nikola-vaptsarov` | `key_facts[1]` | Key fact has partial/low source match (score 83%). Needs human review. |
| `yordan-radichkov` | `main_themes` | 2/5 themes found in source (40%). Some themes may be paraphrased or derived — needs human review. |
| `yordan-radichkov` | `key_facts[0]` | Key fact has partial/low source match (score 83%). Needs human review. |
| `yordan-radichkov` | `key_facts[1]` | Key fact has partial/low source match (score 50%). Needs human review. |
| `hristo-botev` | `main_themes` | 4/6 themes found in source (67%). Some themes may be paraphrased or derived — needs human review. |
| `hristo-botev` | `key_facts[0]` | Key fact has partial/low source match (score 80%). Needs human review. |
| `hristo-botev` | `key_facts[2]` | Key fact has partial/low source match (score 75%). Needs human review. |
| `hristo-botev` | `works[borba]` | Work "borba" not found in author's source section — may be in a sub-section only. |
| `hristo-botev` | `works[do-moeto-parvo-libe]` | Work "do-moeto-parvo-libe" not found in author's source section — may be in a sub-section only. |
| `elin-pelin` | `nickname` | Nickname "художник на българското село; майстор на късия разказ; певецът на българското село" not clearly found in source (score 78%). |
| `elin-pelin` | `main_themes` | 4/7 themes found in source (57%). Some themes may be paraphrased or derived — needs human review. |
| `elin-pelin` | `works[andreshko]` | Work "andreshko" not found in author's source section — may be in a sub-section only. |
| `elin-pelin` | `works[spasova-mogila]` | Work "spasova-mogila" not found in author's source section — may be in a sub-section only. |
| `elin-pelin` | `works[vetrenata-melnitsa]` | Work "vetrenata-melnitsa" not found in author's source section — may be in a sub-section only. |
| `hristo-smirnenski` | `key_facts[1]` | Key fact has partial/low source match (score 80%). Needs human review. |
| `emiliyan-stanev` | `key_facts[1]` | Key fact has partial/low source match (score 80%). Needs human review. |
| `peyo-yavorov` | `works[gradushka]` | Work "gradushka" not found in author's source section — may be in a sub-section only. |


---

## Known false positives

### Димитър Талев — "сред вторите" vs "сред творците"

The source markdown file contains the phrase **"сред вторите"** in the Димитър Талев section.
The corresponding value in `authors.json` is **"сред творците"** (among the creators/writers).

This is treated as a **known source/OCR artifact**, not a data error, for the following reasons:

- "вторите" (the second ones) is semantically nonsensical in this context.
- "творците" (the creators/writers) is the correct Bulgarian word and makes full sense.
- The likely cause: bold markdown markup around "творите" (`**творите**`) was partially mangled
  during source conversion, dropping the leading "тв" and producing "вторите".
- `authors.json` is kept unchanged — its value is correct.

---

## Recommendations

- ✅ No errors found.
- ⚠️ **261 warning(s)** represent items that could not be fully verified automatically from the source text. Most are due to paraphrasing, abbreviated notes, or bold-markup differences.
- 📋 **The "1985" year for "Бай Ганьо журналист"** appears unusual (the work is associated with the 1890s). Both source and data agree on 1985 — check original notes for possible transcription error.
- 📋 Warnings with score < 0.60 on `creative_history` and `composition` fields are expected: these fields are often verbatim but split across sub-sections in the source, which the section parser may not fully combine.
- ℹ️ All question `authorId` and `workId` structural consistency checks passed with no errors.

---

_Report generated by `scripts/qa-source.mjs` — reads source only, does not modify any data files._
