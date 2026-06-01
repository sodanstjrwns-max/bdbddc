#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""다국어 페이지의 'Google 4.9★ (...)' 별점 표현 제거 (meta + 본문 h3).
의료광고법 현혹광고 리스크 제거. 별점 외 다른 문구는 보존.
"""
import re, sys, glob, os

files = []
for pat in ['vi/*.html','jp/*.html','en/*.html','cn/*.html','ru/*.html','th/*.html']:
    files += glob.glob(pat)

# 'Google 4.9★' + 선택적 괄호 리뷰수 + 뒤따르는 구두점/공백 을 제거
# 괄호: (...) 또는 （...）
rating_re = re.compile(r'Google\s*4\.9★\s*(?:[（(][^）)]*[）)])?')

apply = '--apply' in sys.argv
total = 0
touched = []
for f in sorted(set(files)):
    with open(f, encoding='utf-8') as fh:
        html = fh.read()
    orig = html
    # 1) meta content="..." 안과 본문 모두에서 별점 토큰 제거
    def clean(m):
        return ''
    new = rating_re.sub('', html)
    # 2) 제거 후 남는 어색한 구두점 정리: '. .' '。。' ' . ' 앞 공백 정리, '★' 잔재
    #    " . " -> " ", 연속 공백 -> 1개, 구두점 앞 공백 제거
    new = re.sub(r'★', '', new)
    # description류에서 ". . " "。 。" 처럼 빈 문장 생기는 것 정리
    new = re.sub(r'\.\s*\.', '.', new)
    new = re.sub(r'。\s*。', '。', new)
    new = re.sub(r'\s{2,}', ' ', new)
    # 본문 h3가 비면 통째로 제거: <h3></h3> 또는 <h3> </h3>
    new = re.sub(r'<h3>\s*</h3>', '', new)
    cnt = len(rating_re.findall(orig))
    if new != orig:
        touched.append((f, cnt))
        total += cnt
        if apply:
            with open(f, 'w', encoding='utf-8') as fh:
                fh.write(new)

print(f"{'[APPLIED]' if apply else '[DRY-RUN]'} 별점 토큰 제거: {total}건 / {len(touched)}파일")
for f, c in touched:
    print(f"  {f}: {c}건")
