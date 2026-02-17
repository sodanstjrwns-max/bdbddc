#!/usr/bin/env python3
"""
병원 홈페이지 기획서 Markdown → PDF 변환기
Patient Funnel Standard
"""

import markdown
from weasyprint import HTML
import os

# 1. Read markdown
md_path = "/home/user/webapp/docs/hospital-website-blueprint.md"
with open(md_path, "r", encoding="utf-8") as f:
    md_content = f.read()

# 2. Convert to HTML with tables extension
html_body = markdown.markdown(
    md_content,
    extensions=["tables", "fenced_code", "codehilite", "toc", "nl2br"],
    extension_configs={
        "codehilite": {"css_class": "highlight"},
    },
)

# 3. Wrap in full HTML with professional styling
full_html = f"""<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<style>
@page {{
    size: A4;
    margin: 25mm 20mm 25mm 20mm;
    
    @top-center {{
        content: "Patient Funnel — 병원 홈페이지 제작 기획서";
        font-family: sans-serif;
        font-size: 8pt;
        color: #999;
    }}
    
    @bottom-center {{
        content: counter(page) " / " counter(pages);
        font-family: sans-serif;
        font-size: 8pt;
        color: #999;
    }}
}}

@page :first {{
    @top-center {{ content: none; }}
    @bottom-center {{ content: none; }}
}}

* {{
    box-sizing: border-box;
}}

body {{
    font-family: sans-serif;
    font-size: 10pt;
    line-height: 1.7;
    color: #1a1a2e;
    background: #fff;
}}

/* === COVER PAGE === */
.cover-page {{
    page-break-after: always;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    min-height: 80vh;
    text-align: center;
    padding: 60px 40px;
}}

.cover-page .logo {{
    font-size: 14pt;
    font-weight: 800;
    color: #C9A962;
    letter-spacing: 4px;
    text-transform: uppercase;
    margin-bottom: 12px;
}}

.cover-page .divider {{
    width: 60px;
    height: 3px;
    background: linear-gradient(90deg, #C9A962, #0369a1);
    margin: 20px auto;
    border-radius: 2px;
}}

.cover-page h1 {{
    font-size: 28pt;
    font-weight: 900;
    color: #1a1a2e;
    margin: 20px 0 10px;
    line-height: 1.3;
}}

.cover-page .subtitle {{
    font-size: 13pt;
    color: #666;
    margin-bottom: 40px;
    font-weight: 400;
}}

.cover-page .meta-box {{
    background: #f8f9fa;
    border: 1px solid #e9ecef;
    border-radius: 8px;
    padding: 24px 40px;
    margin-top: 30px;
    text-align: left;
    display: inline-block;
}}

.cover-page .meta-box p {{
    margin: 6px 0;
    font-size: 9.5pt;
    color: #555;
}}

.cover-page .meta-box strong {{
    display: inline-block;
    width: 80px;
    color: #1a1a2e;
}}

.cover-page .confidential {{
    margin-top: 50px;
    font-size: 8pt;
    color: #C9A962;
    font-weight: 700;
    letter-spacing: 2px;
    text-transform: uppercase;
}}

/* === HEADINGS === */
h1 {{
    font-size: 22pt;
    font-weight: 900;
    color: #1a1a2e;
    margin-top: 40px;
    margin-bottom: 15px;
    padding-bottom: 8px;
    border-bottom: 3px solid #C9A962;
    page-break-after: avoid;
}}

h2 {{
    font-size: 14pt;
    font-weight: 800;
    color: #0369a1;
    margin-top: 30px;
    margin-bottom: 10px;
    padding-left: 12px;
    border-left: 4px solid #C9A962;
    page-break-after: avoid;
}}

h3 {{
    font-size: 11.5pt;
    font-weight: 700;
    color: #1a1a2e;
    margin-top: 20px;
    margin-bottom: 8px;
    page-break-after: avoid;
}}

h4 {{
    font-size: 10.5pt;
    font-weight: 700;
    color: #555;
    margin-top: 15px;
    margin-bottom: 6px;
}}

/* === TABLES === */
table {{
    width: 100%;
    border-collapse: collapse;
    margin: 12px 0 20px;
    font-size: 9pt;
    page-break-inside: auto;
}}

thead {{
    background: #1a1a2e;
    color: #fff;
}}

th {{
    padding: 8px 10px;
    text-align: left;
    font-weight: 700;
    font-size: 8.5pt;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}}

td {{
    padding: 7px 10px;
    border-bottom: 1px solid #e9ecef;
    vertical-align: top;
}}

tr:nth-child(even) {{
    background: #f8f9fa;
}}

tr {{
    page-break-inside: avoid;
}}

/* === BLOCKQUOTE === */
blockquote {{
    border-left: 4px solid #C9A962;
    background: #fffbf0;
    padding: 12px 16px;
    margin: 15px 0;
    font-style: italic;
    color: #555;
    border-radius: 0 6px 6px 0;
}}

blockquote strong {{
    color: #1a1a2e;
}}

/* === CODE === */
code {{
    background: #f1f3f5;
    padding: 2px 6px;
    border-radius: 3px;
    font-size: 8.5pt;
    font-family: 'SF Mono', 'Consolas', monospace;
    color: #d63384;
}}

pre {{
    background: #1a1a2e;
    color: #e9ecef;
    padding: 14px 18px;
    border-radius: 6px;
    overflow-x: auto;
    font-size: 8pt;
    line-height: 1.5;
    margin: 12px 0;
    page-break-inside: avoid;
}}

pre code {{
    background: none;
    color: #e9ecef;
    padding: 0;
    font-size: 8pt;
}}

/* === LISTS === */
ul, ol {{
    margin: 8px 0;
    padding-left: 24px;
}}

li {{
    margin: 4px 0;
}}

/* === LINKS === */
a {{
    color: #0369a1;
    text-decoration: none;
}}

/* === HR === */
hr {{
    border: none;
    border-top: 2px solid #e9ecef;
    margin: 30px 0;
}}

/* === STRONG === */
strong {{
    font-weight: 700;
    color: #1a1a2e;
}}

/* === PARAGRAPHS === */
p {{
    margin: 8px 0;
}}

/* === PAGE BREAKS === */
h1 {{
    page-break-before: always;
}}

h1:first-of-type {{
    page-break-before: avoid;
}}

/* Section numbering styling */
</style>
</head>
<body>

<!-- COVER PAGE -->
<div class="cover-page">
    <div class="logo">Patient Funnel</div>
    <div class="divider"></div>
    <h1 style="border:none; page-break-before:avoid; font-size:28pt; margin-top:20px;">병원 홈페이지<br>제작 기획서</h1>
    <p class="subtitle">Seoul BD Dental Standard v1.0</p>
    
    <div class="meta-box">
        <p><strong>기준 사이트</strong> https://bdbddc.com (서울비디치과)</p>
        <p><strong>작성일</strong> 2026년 2월 17일</p>
        <p><strong>작성자</strong> Patient Funnel (페이션트 퍼널)</p>
        <p><strong>버전</strong> v1.0</p>
        <p><strong>분량</strong> 15개 챕터 / 1,329줄 / 50,073자</p>
    </div>
    
    <p class="confidential">Confidential — Patient Funnel Proprietary</p>
</div>

<!-- CONTENT -->
{html_body}

</body>
</html>
"""

# 4. Generate PDF
output_path = "/home/user/webapp/docs/hospital-website-blueprint.pdf"
HTML(string=full_html).write_pdf(output_path)

file_size = os.path.getsize(output_path)
print(f"✅ PDF 생성 완료: {output_path}")
print(f"   파일 크기: {file_size / 1024:.0f} KB")
print(f"   ({file_size / 1024 / 1024:.1f} MB)")
