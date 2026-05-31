#!/usr/bin/env python3
# Surgically remove the "aggregateRating": { ... } object from JSON-LD.
# Uses brace-balance scanning (not regex) so nested braces/strings are handled safely.
# Also cleans up the surrounding comma so JSON stays valid.
import sys, re

def strip_aggregate_rating(text):
    out = []
    i = 0
    removed = 0
    n = len(text)
    pat = re.compile(r'"aggregateRating"\s*:\s*\{')
    while i < n:
        m = pat.search(text, i)
        if not m:
            out.append(text[i:])
            break
        out.append(text[i:m.start()])
        # scan from the '{' to find its matching '}'
        j = m.end() - 1  # position of '{'
        depth = 0
        in_str = False
        esc = False
        k = j
        while k < n:
            ch = text[k]
            if in_str:
                if esc:
                    esc = False
                elif ch == '\\':
                    esc = True
                elif ch == '"':
                    in_str = False
            else:
                if ch == '"':
                    in_str = True
                elif ch == '{':
                    depth += 1
                elif ch == '}':
                    depth -= 1
                    if depth == 0:
                        break
            k += 1
        end = k + 1  # position just after matching '}'
        # consume trailing whitespace then optional comma
        tail = end
        while tail < n and text[tail] in ' \t':
            tail += 1
        had_trailing_comma = (tail < n and text[tail] == ',')
        if had_trailing_comma:
            tail += 1
        else:
            # aggregateRating was the last property -> remove the PRECEDING comma
            built = ''.join(out)
            built = re.sub(r',\s*$', '', built)
            out = [built]
        # also swallow a leftover blank line right after, to keep tidy
        while tail < n and text[tail] in ' \t':
            tail += 1
        if tail < n and text[tail] == '\n':
            # keep a single newline for formatting
            pass
        removed += 1
        i = tail
    return ''.join(out), removed

if __name__ == '__main__':
    total = 0
    for path in sys.argv[1:]:
        with open(path, 'r', encoding='utf-8') as fp:
            content = fp.read()
        new, cnt = strip_aggregate_rating(content)
        if cnt:
            with open(path, 'w', encoding='utf-8') as fp:
                fp.write(new)
            total += cnt
            print(f"{path}: removed {cnt} aggregateRating")
        else:
            print(f"{path}: none")
    print(f"TOTAL aggregateRating removed: {total}")
