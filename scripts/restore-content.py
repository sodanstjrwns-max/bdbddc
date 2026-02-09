#!/usr/bin/env python3
"""
v5.1 Content Restoration Script
================================
Strategy: Take the ORIGINAL <main> content from git (c422fb7) 
and splice it into the CURRENT redesigned shell (head/header/footer).

The new design's head, header, footer, mobile nav, floating CTA, 
and scripts are PRESERVED from the current version.

The original content (main block) is RESTORED from git history.
"""

import subprocess
import os
import re
import sys

WEBAPP_DIR = "/home/user/webapp"
GIT_REF = "c422fb7"  # Last commit before v5.0 redesign

# All pages to restore (relative to webapp/)
PAGES = [
    # Core subpages
    "faq.html",
    "directions.html",
    "floor-guide.html",
    "reservation.html",
    
    # Doctors
    "doctors/index.html",
    "doctors/moon.html",
    "doctors/kim-mg.html",
    "doctors/lee-bm.html",
    "doctors/park-sb.html",
    "doctors/kang-mj.html",
    "doctors/kim-mj.html",
    "doctors/jo.html",
    "doctors/seo.html",
    "doctors/hyun.html",
    "doctors/kang.html",
    "doctors/lee.html",
    "doctors/park.html",
    "doctors/kim.html",
    "doctors/choi.html",
    "doctors/lim.html",
    
    # Treatments - specialty centers
    "treatments/index.html",
    "treatments/implant.html",
    "treatments/invisalign.html",
    "treatments/pediatric.html",
    "treatments/aesthetic.html",
    "treatments/glownate.html",
    
    # Treatments - general
    "treatments/cavity.html",
    "treatments/crown.html",
    "treatments/root-canal.html",
    "treatments/whitening.html",
    "treatments/scaling.html",
    "treatments/gum.html",
    "treatments/periodontitis.html",
    "treatments/wisdom-tooth.html",
    "treatments/tmj.html",
    "treatments/bruxism.html",
    "treatments/bridge.html",
    "treatments/denture.html",
    "treatments/emergency.html",
    "treatments/prevention.html",
    "treatments/gum-surgery.html",
    "treatments/re-root-canal.html",
    "treatments/apicoectomy.html",
    "treatments/resin.html",
    "treatments/inlay.html",
    
    # Content pages
    "bdx/index.html",
    "column/columns.html",
    "video/index.html",
    "cases/gallery.html",
    "notice/index.html",
    
    # Area pages
    "area/cheonan.html",
    "area/asan.html",
    "area/sejong.html",
    "area/daejeon.html",
    "area/cheongju.html",
    "area/pyeongtaek.html",
    "area/dangjin.html",
    "area/seosan.html",
    "area/gongju.html",
    "area/nonsan.html",
    "area/hongseong.html",
    "area/yesan.html",
    "area/chungju.html",
    "area/jincheon.html",
    "area/anseong.html",
    "area/buldang.html",
    
    # Misc
    "privacy.html",
    "terms.html",
    
    # FAQ sub
    "faq/implant.html",
    "faq/orthodontics.html",
]

# pricing.html is already mostly OK (data preserved), skip it
# 404.html doesn't need original content restoration

def get_git_content(filepath):
    """Get file content from git history."""
    try:
        result = subprocess.run(
            ["git", "show", f"{GIT_REF}:{filepath}"],
            capture_output=True, text=True, cwd=WEBAPP_DIR
        )
        if result.returncode == 0:
            return result.stdout
        return None
    except Exception as e:
        print(f"  ERROR getting git content: {e}")
        return None

def read_file(filepath):
    """Read current file."""
    full_path = os.path.join(WEBAPP_DIR, filepath)
    try:
        with open(full_path, 'r', encoding='utf-8') as f:
            return f.read()
    except Exception as e:
        print(f"  ERROR reading file: {e}")
        return None

def write_file(filepath, content):
    """Write file."""
    full_path = os.path.join(WEBAPP_DIR, filepath)
    os.makedirs(os.path.dirname(full_path), exist_ok=True)
    with open(full_path, 'w', encoding='utf-8') as f:
        f.write(content)

def extract_main_content(html):
    """Extract content between <main...> and </main> tags (inclusive)."""
    # Find the main opening tag
    main_start = re.search(r'<main[^>]*>', html)
    if not main_start:
        return None
    
    # Find the closing </main> tag  
    main_end = html.rfind('</main>')
    if main_end == -1:
        return None
    
    # Return content from <main> start to </main> end
    return html[main_start.start():main_end + len('</main>')]

def extract_shell_before_main(html):
    """Extract everything before <main> tag."""
    main_start = re.search(r'<main[^>]*>', html)
    if not main_start:
        return None
    return html[:main_start.start()]

def extract_shell_after_main(html):
    """Extract everything after </main> tag."""
    main_end = html.rfind('</main>')
    if main_end == -1:
        return None
    return html[main_end + len('</main>'):]

def ensure_common_css(head_html):
    """Ensure common-v4.css is linked in the head."""
    if 'common-v4.css' not in head_html:
        # Add common-v4.css after design-system-v4.css
        head_html = head_html.replace(
            '<link rel="stylesheet" href="/css/subpage-v4.css">',
            '<link rel="stylesheet" href="/css/common-v4.css">\n  <link rel="stylesheet" href="/css/subpage-v4.css">'
        )
        # Also try relative paths
        head_html = head_html.replace(
            '<link rel="stylesheet" href="../css/subpage-v4.css">',
            '<link rel="stylesheet" href="../css/common-v4.css">\n  <link rel="stylesheet" href="../css/subpage-v4.css">'
        )
    return head_html

def fix_main_tag(main_content):
    """Ensure main tag has role='main' attribute for the new design."""
    # Replace old main tag format with new format
    main_content = re.sub(
        r'<main\s+id="main-content"\s*>',
        '<main id="main-content" role="main">',
        main_content
    )
    return main_content

def process_page(filepath):
    """Process a single page: restore original main content in new design shell."""
    print(f"  Processing: {filepath}")
    
    # Get original content from git
    original = get_git_content(filepath)
    if not original:
        print(f"    SKIP: No original content in git")
        return False
    
    # Get current (redesigned) version
    current = read_file(filepath)
    if not current:
        print(f"    SKIP: Current file not found")
        return False
    
    # Extract original main content
    original_main = extract_main_content(original)
    if not original_main:
        print(f"    SKIP: No <main> tag in original")
        return False
    
    # Extract current shell (before and after main)
    current_before = extract_shell_before_main(current)
    current_after = extract_shell_after_main(current)
    
    if current_before is None or current_after is None:
        print(f"    SKIP: Can't extract shell from current version")
        return False
    
    # Ensure common-v4.css is included
    current_before = ensure_common_css(current_before)
    
    # Fix main tag
    original_main = fix_main_tag(original_main)
    
    # Combine: new shell + original content
    result = current_before + original_main + current_after
    
    # Write the result
    write_file(filepath, result)
    
    orig_main_lines = original_main.count('\n')
    curr_main_lines = extract_main_content(current)
    curr_lines = curr_main_lines.count('\n') if curr_main_lines else 0
    print(f"    OK: Restored {orig_main_lines} lines (was {curr_lines})")
    return True

def main():
    print("=" * 60)
    print("v5.1 Content Restoration")
    print("=" * 60)
    print(f"Source: git ref {GIT_REF}")
    print(f"Strategy: Original <main> content → New design shell")
    print(f"Pages to process: {len(PAGES)}")
    print()
    
    os.chdir(WEBAPP_DIR)
    
    success = 0
    failed = 0
    skipped = 0
    
    for page in PAGES:
        result = process_page(page)
        if result:
            success += 1
        else:
            failed += 1
    
    print()
    print("=" * 60)
    print(f"RESULTS: {success} restored, {failed} failed/skipped")
    print("=" * 60)

if __name__ == "__main__":
    main()
