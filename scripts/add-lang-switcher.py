#!/usr/bin/env python3
"""언어 전환 버튼 스크립트 일괄 삽입 (</body> 직전)"""
import glob, os, re

os.chdir('/home/user/webapp')

TAG = '<script src="/js/lang-switcher.js" defer></script>'

# 대상: 위글롯이 있던 한국어 페이지 + 모든 외국어 페이지
ko_pages = ['404.html','blueprint.html','careers.html','checkup.html','directions.html',
            'faq.html','flight.html','floor-guide.html','games.html','index.html',
            'mission.html','pricing.html','privacy.html','reservation.html','run.html','terms.html']
intl_pages = []
for d in ['en','jp','cn','vi','th','ru']:
    intl_pages += glob.glob(f'{d}/**/*.html', recursive=True)

targets = ko_pages + intl_pages
added, skipped, missing = [], [], []

for f in targets:
    if not os.path.exists(f):
        missing.append(f); continue
    with open(f, encoding='utf-8') as fp:
        c = fp.read()
    if 'lang-switcher.js' in c:
        skipped.append(f); continue
    # </body> 직전 삽입 (마지막 </body> 기준)
    idx = c.rfind('</body>')
    if idx == -1:
        missing.append(f + ' (no </body>)'); continue
    c = c[:idx] + TAG + '\n' + c[idx:]
    with open(f, 'w', encoding='utf-8') as fp:
        fp.write(c)
    added.append(f)

print(f"삽입 완료: {len(added)}개")
for f in added: print(f"  + {f}")
if skipped: print(f"이미 있음: {skipped}")
if missing: print(f"누락/실패: {missing}")
