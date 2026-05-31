#!/usr/bin/env python3
# Surgically remove the "review": [ ... ] array from JSON-LD in treatment HTML files.
# Keeps aggregateRating and all other schema intact.
# Uses bracket-balance scanning (not regex) so nested braces are handled safely.
import sys, re

def strip_review_arrays(text):
    out = []
    i = 0
    removed = 0
    n = len(text)
    # match the key:  "review": [
    pat = re.compile(r'"review"\s*:\s*\[')
    while i < n:
        m = pat.search(text, i)
        if not m:
            out.append(text[i:])
            break
        # append everything before the match
        out.append(text[i:m.start()])
        # now scan from the '[' to find its matching ']'
        j = m.end() - 1  # position of '['
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
                elif ch == '[':
                    depth += 1
                elif ch == ']':
                    depth -= 1
                    if depth == 0:
                        break
            k += 1
        # k now points at matching ']'
        end = k + 1
        # consume a trailing comma + whitespace/newline if present, to keep JSON valid
        tail = end
        while tail < n and text[tail] in ' \t':
            tail += 1
        if tail < n and text[tail] == ',':
            tail += 1
        # also swallow following whitespace up to next non-space on same construct
        # but we must preserve a comma BEFORE if needed. We removed the trailing comma,
        # which is correct because "review" typically sits between two properties or before geo.
        # Safer: if there was NO trailing comma (review was last prop), we must remove the
        # PRECEDING comma instead. Detect by looking back in already-built output.
        had_trailing_comma = (text[end:tail].find(',') != -1)
        if not had_trailing_comma:
            # remove preceding comma from out
            built = ''.join(out)
            built = re.sub(r',\s*$', '', built)
            out = [built]
        removed += 1
        i = tail
    return ''.join(out), removed

if __name__ == '__main__':
    total = 0
    for path in sys.argv[1:]:
        with open(path, 'r', encoding='utf-8') as fp:
            content = fp.read()
        new, cnt = strip_review_arrays(content)
        if cnt:
            with open(path, 'w', encoding='utf-8') as fp:
                fp.write(new)
            total += cnt
            print(f"{path}: removed {cnt} review array(s)")
        else:
            print(f"{path}: no review array found")
    print(f"TOTAL review arrays removed: {total}")
