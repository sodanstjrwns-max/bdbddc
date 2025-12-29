import os
import re
import glob

# Read template
with open('/home/user/webapp/mobile-nav-template.html', 'r') as f:
    template = f.read()

# Pattern to match mobile nav section
pattern = r'<!-- Mobile Nav.*?-->.*?<nav class="mobile-nav".*?</nav>\s*<div class="mobile-nav-overlay"[^>]*></div>'
pattern2 = r'<nav class="mobile-nav" id="mobileNav">.*?</nav>\s*<div class="mobile-nav-overlay"[^>]*></div>'

# Find all HTML files
html_files = glob.glob('/home/user/webapp/public/**/*.html', recursive=True)
html_files += glob.glob('/home/user/webapp/public/*.html')

updated = 0
skipped = 0

for filepath in set(html_files):
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Check if file has mobile nav
        if 'id="mobileNav"' not in content:
            skipped += 1
            continue
        
        # Try both patterns
        new_content = re.sub(pattern, template, content, flags=re.DOTALL)
        if new_content == content:
            new_content = re.sub(pattern2, template, content, flags=re.DOTALL)
        
        if new_content != content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(new_content)
            print(f"Updated: {filepath}")
            updated += 1
        else:
            print(f"No change: {filepath}")
            
    except Exception as e:
        print(f"Error {filepath}: {e}")

print(f"\nTotal: {updated} updated, {skipped} skipped (no mobile nav)")
