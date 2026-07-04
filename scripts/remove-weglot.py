#!/usr/bin/env python3
"""위글롯 스크립트 일괄 제거"""
import re, glob, os

os.chdir('/home/user/webapp')

# 패턴 1: defer 방식 (index.html 등)
pattern_defer = re.compile(
    r'<!-- Weglot Multilingual[^>]*-->\s*<script>\s*window\.addEventListener\(\'DOMContentLoaded\', function\(\) \{\s*'
    r'var s = document\.createElement\(\'script\'\);\s*'
    r's\.src = \'https://cdn\.weglot\.com/weglot\.min\.js\';\s*'
    r's\.onload = function\(\) \{ Weglot\.initialize\(\{ api_key: \'[^\']+\' \}\); \};\s*'
    r'document\.head\.appendChild\(s\);\s*\}\);\s*</script>\s*',
    re.DOTALL
)

# 패턴 2: 직접 삽입 방식 (careers.html)
pattern_direct = re.compile(
    r'<!-- Weglot Multilingual -->\s*'
    r'<script type="text/javascript" src="https://cdn\.weglot\.com/weglot\.min\.js"></script>\s*'
    r'<script>Weglot\.initialize\(\{ api_key: \'[^\']+\' \}\);</script>\s*',
    re.DOTALL
)

files = [f for f in glob.glob('*.html')]
changed = []
for f in files:
    with open(f, encoding='utf-8') as fp:
        content = fp.read()
    orig = content
    content = pattern_defer.sub('', content)
    content = pattern_direct.sub('', content)
    if content != orig:
        with open(f, 'w', encoding='utf-8') as fp:
            fp.write(content)
        changed.append(f)

print(f"수정된 파일 {len(changed)}개:")
for f in changed:
    print(f"  - {f}")

# 검증: 남은 weglot 스크립트 참조 확인 (blueprint.html 문서 내용 제외)
print("\n남은 weglot 참조:")
for f in glob.glob('*.html'):
    with open(f, encoding='utf-8') as fp:
        c = fp.read()
    if 'cdn.weglot.com' in c:
        print(f"  ! {f}")
