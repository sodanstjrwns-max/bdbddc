#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
백과사전 short(요약 박스) 버그 수정.
버그:
  1) 제목 겹침: short가 "{term}이란{term}(..." 처럼 detail의 <h3>제목</h3> 텍스트가 본문 앞에 붙음
  2) 끝 잘림: detail에서 앞 150자만 잘라 "..."로 끝남 (문장 중간 절단)

해결:
  detail HTML에서 첫 번째 <p> 본문을 추출 → 첫 완결 문장(마침표 기준)으로 short 재생성.
  - 제목(<h3>...</h3>)은 스킵
  - "{term}이란", "{term}(영문)은/는" 등 본문 자체 도입부는 그대로 둔다 (자연스러움)
  - 너무 길면(>180자) 첫 1~2문장 내에서 마침표로 자연 종료
"""
import json
import re
import sys
import html as html_lib

SRC = 'public/data/encyclopedia.json'

def strip_tags(s: str) -> str:
    s = re.sub(r'<[^>]+>', '', s)
    s = html_lib.unescape(s)
    return re.sub(r'\s+', ' ', s).strip()

def first_paragraph(detail: str) -> str:
    """detail HTML에서 첫 <p>...</p> 본문 텍스트를 반환. 없으면 전체 태그제거 텍스트."""
    m = re.search(r'<p[^>]*>(.*?)</p>', detail, re.IGNORECASE | re.DOTALL)
    if m:
        return strip_tags(m.group(1))
    return strip_tags(detail)

def make_short(term: str, detail: str) -> str:
    para = first_paragraph(detail)
    if not para:
        return ''
    # 첫 1~2 완결 문장 추출 (한국어 마침표/물음표/느낌표 기준)
    sentences = re.split(r'(?<=[.!?。])\s+', para)
    out = ''
    for sent in sentences:
        candidate = (out + (' ' if out else '') + sent).strip()
        out = candidate
        # 한 문장으로 충분히 의미가 있으면 멈춤 (40자 이상 & 문장부호로 끝남)
        if len(out) >= 40 and re.search(r'[.!?。]$', out):
            break
        # 너무 길어지면 중단
        if len(out) >= 180:
            break
    out = out.strip()
    # 안전장치: 그래도 마침표 없이 끝나면 문장부호 보정 없이 그대로 (자연 문장 우선)
    return out

def main():
    dry = '--apply' not in sys.argv
    with open(SRC, 'r', encoding='utf-8') as f:
        data = json.load(f)
    items = data['items'] if isinstance(data, dict) and 'items' in data else data

    changed = 0
    samples = []
    for it in items:
        term = it.get('term', '')
        old_short = it.get('short', '') or ''
        detail = it.get('detail', '') or ''
        if not detail:
            continue
        # 버그 판정: 겹침 or 잘림(...로 끝남) or 빈 short
        is_dup = bool(re.match(re.escape(term) + r'(이란|란)?' + re.escape(term), old_short))
        is_trunc = old_short.rstrip().endswith('...') or old_short.rstrip().endswith('…')
        if not (is_dup or is_trunc or not old_short):
            continue
        new_short = make_short(term, detail)
        if not new_short:
            continue
        if new_short != old_short:
            if len(samples) < 15:
                samples.append((term, old_short[:60], new_short[:80]))
            if not dry:
                it['short'] = new_short
            changed += 1

    print(f"{'[DRY-RUN] ' if dry else '[APPLIED] '}수정 대상: {changed}개\n")
    print("===== 변경 샘플 (BEFORE → AFTER) =====")
    for term, old, new in samples:
        print(f"\n[{term}]")
        print(f"  BEFORE: {old}...")
        print(f"  AFTER : {new}")

    if not dry:
        with open(SRC, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        print(f"\n저장 완료: {SRC}")

if __name__ == '__main__':
    main()
