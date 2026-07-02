#!/usr/bin/env python3
"""
Amplitude 동기 로드 블록 → bd-tag-loader.js 지연 로더 교체 (LCP 개선)

Before (렌더 블로킹 — async/defer 없는 동기 스크립트 2개):
  <script src="https://cdn.amplitude.com/libs/analytics-browser-2.11.1-min.js.gz"></script>
  <script src="https://cdn.amplitude.com/libs/plugin-autocapture-browser-0.9.0-min.js.gz"></script>
  <script>window.amplitude.init(...)...</script>

After:
  <script src="/static/bd-tag-loader.js" defer></script>
"""
import re, sys, pathlib

ROOT = pathlib.Path('/home/user/webapp')
LOADER_TAG = '<script src="/static/bd-tag-loader.js" defer></script>'

# 표준 3줄 블록 (216개 파일 공통) — 주석 유무/개행 유연 매칭
PATTERN = re.compile(
    r'(?:<!--\s*Amplitude[^>]*-->\s*)?'
    r'<script src="https://cdn\.amplitude\.com/libs/analytics-browser-[\d.]+-min\.js\.gz"></script>\s*'
    r'<script src="https://cdn\.amplitude\.com/libs/plugin-autocapture-browser-[\d.]+-min\.js\.gz"></script>\s*'
    r'<script>\s*window\.amplitude\.init\([^<]*?</script>',
    re.DOTALL
)

changed, skipped = 0, 0
targets = [p for p in ROOT.rglob('*.html')
           if 'node_modules' not in p.parts and 'dist' not in p.parts]

for p in targets:
    txt = p.read_text(encoding='utf-8')
    new, n = PATTERN.subn(LOADER_TAG, txt)
    if n:
        p.write_text(new, encoding='utf-8')
        changed += 1
    elif 'cdn.amplitude.com' in txt:
        print(f'  ⚠️ 매칭 실패(수동 확인 필요): {p}')
        skipped += 1

print(f'✅ HTML {changed}개 교체, {skipped}개 수동 확인 필요')
