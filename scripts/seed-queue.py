#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
column-queue.json → D1 column_queue 시딩 SQL 생성기
====================================================
task='new-column' 행만 넣는다. 'strengthen'(기존 페이지와 유사도 0.10~0.16)은
새 컬럼을 쓰면 기존 페이지와 자기잠식이 되므로 제외.

게재순위(position)를 GSC CSV에서 병합한다.
2026-08-01 교훈: 순위 없이 기회를 계산하면 3위 제로클릭을 "CTR 개선 기회"로 오판한다.
"""
import csv, json, os, sys

W = '/home/user/gsc-work'
CSV = '/home/user/uploaded_files/검색어 수.csv'
OUT = f'{W}/seed-column-queue.sql'


def q(s):
    return "'" + str(s).replace("'", "''") + "'"


pos = {}
if os.path.isfile(CSV):
    with open(CSV, encoding='utf-8-sig') as f:
        for r in csv.DictReader(f):
            try:
                pos[r['인기 검색어'].strip()] = float(r['게재 순위'])
            except (ValueError, KeyError):
                continue

rows = json.load(open(f'{W}/column-queue.json', encoding='utf-8'))
new = [r for r in rows if r.get('task') == 'new-column']
new.sort(key=lambda r: -r['score'])

# ⚠️ BEGIN TRANSACTION/COMMIT 를 넣지 않는다.
# D1 원격(HTTP API)은 명시적 트랜잭션 구문을 거부한다(로컬만 허용). 배치 실행으로 충분하다.
lines = ['-- 자동 생성: scripts/seed-queue.py — 직접 편집하지 마세요']
matched = 0
for r in new:
    p = pos.get(r['query'])
    if p is not None:
        matched += 1
    lines.append(
        'INSERT OR IGNORE INTO column_queue '
        '(query,impressions,clicks,ctr,position,coverage,nearest,score) VALUES ('
        f'{q(r["query"])},{r["impressions"]},{r["clicks"]},{r["ctr"]},'
        f'{"NULL" if p is None else p},{r["coverage"]},{q(r["nearest"])},{r["score"]});')

open(OUT, 'w', encoding='utf-8').write('\n'.join(lines) + '\n')

print(f'{OUT}')
print(f'  new-column {len(new)}건 / 게재순위 병합 {matched}건 ({matched*100//max(1,len(new))}%)')
print(f'  총 노출 {sum(r["impressions"] for r in new):,}회 → 하루 1건이면 {len(new)}일치')
print(f'  1순위: {new[0]["query"]} (노출 {new[0]["impressions"]:,} / 점수 {new[0]["score"]:.0f})')
