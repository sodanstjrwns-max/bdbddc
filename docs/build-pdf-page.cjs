/**
 * 병원 홈페이지 기획서 - Markdown → PDF-ready HTML 변환기
 * Patient Funnel Standard
 * 
 * Usage: node docs/build-pdf-page.js
 * Output: docs/hospital-website-blueprint.html (브라우저에서 Ctrl+P → PDF 저장)
 */

const fs = require('fs');
const path = require('path');

// Simple markdown to HTML converter (no dependencies needed)
function mdToHtml(md) {
  let html = md;
  
  // Escape HTML entities in code blocks first
  const codeBlocks = [];
  html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (match, lang, code) => {
    const idx = codeBlocks.length;
    codeBlocks.push({ lang, code: code.replace(/</g, '&lt;').replace(/>/g, '&gt;') });
    return `%%CODEBLOCK_${idx}%%`;
  });
  
  // Inline code
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
  
  // Headers (process from h6 to h1)
  html = html.replace(/^###### (.*$)/gm, '<h6>$1</h6>');
  html = html.replace(/^##### (.*$)/gm, '<h5>$1</h5>');
  html = html.replace(/^#### (.*$)/gm, '<h4>$1</h4>');
  html = html.replace(/^### (.*$)/gm, '<h3>$1</h3>');
  html = html.replace(/^## (.*$)/gm, '<h2>$1</h2>');
  html = html.replace(/^# (.*$)/gm, '<h1>$1</h1>');
  
  // Bold and italic
  html = html.replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>');
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
  
  // Blockquotes
  html = html.replace(/^>\s?(.*$)/gm, '<blockquote_line>$1</blockquote_line>');
  html = html.replace(/(<blockquote_line>.*<\/blockquote_line>\n?)+/g, (match) => {
    const content = match.replace(/<\/?blockquote_line>/g, '').trim();
    return `<blockquote><p>${content}</p></blockquote>\n`;
  });
  
  // Horizontal rules
  html = html.replace(/^---+$/gm, '<hr>');
  
  // Links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
  
  // Tables
  html = html.replace(/^\|(.+)\|\s*\n\|[-| :]+\|\s*\n((?:\|.+\|\s*\n?)*)/gm, (match, headerRow, bodyRows) => {
    const headers = headerRow.split('|').map(h => h.trim()).filter(h => h);
    const headerHtml = headers.map(h => `<th>${h}</th>`).join('');
    
    const rows = bodyRows.trim().split('\n').map(row => {
      const cells = row.replace(/^\||\|$/g, '').split('|').map(c => c.trim());
      return `<tr>${cells.map(c => `<td>${c}</td>`).join('')}</tr>`;
    }).join('\n');
    
    return `<table>\n<thead><tr>${headerHtml}</tr></thead>\n<tbody>\n${rows}\n</tbody>\n</table>\n`;
  });
  
  // Unordered lists
  html = html.replace(/^(\s*)[-*]\s+(.*$)/gm, '$1<li>$2</li>');
  html = html.replace(/((?:<li>.*<\/li>\n?)+)/g, '<ul>\n$1</ul>\n');
  
  // Ordered lists
  html = html.replace(/^\d+\.\s+(.*$)/gm, '<oli>$1</oli>');
  html = html.replace(/((?:<oli>.*<\/oli>\n?)+)/g, (match) => {
    return '<ol>\n' + match.replace(/<\/?oli>/g, (tag) => tag === '<oli>' ? '<li>' : '</li>') + '</ol>\n';
  });
  
  // Restore code blocks
  codeBlocks.forEach((block, idx) => {
    html = html.replace(`%%CODEBLOCK_${idx}%%`, 
      `<pre><code class="language-${block.lang}">${block.code}</code></pre>`);
  });
  
  // Paragraphs - wrap loose text
  html = html.replace(/^(?!<[a-z/]|%%)(.*\S.*)$/gm, '<p>$1</p>');
  
  // Clean up empty paragraphs
  html = html.replace(/<p>\s*<\/p>/g, '');
  
  return html;
}

// Read markdown
const mdContent = fs.readFileSync(path.join(__dirname, 'hospital-website-blueprint.md'), 'utf-8');

// Convert
const htmlBody = mdToHtml(mdContent);

// Build full HTML
const fullHtml = `<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>병원 홈페이지 제작 기획서 — Patient Funnel</title>
<style>
@import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css');

/* === PRINT STYLES === */
@media print {
  @page {
    size: A4;
    margin: 20mm 18mm 20mm 18mm;
  }
  
  body { font-size: 9.5pt !important; }
  .cover-page { page-break-after: always; min-height: 90vh; }
  .no-print { display: none !important; }
  h1 { page-break-before: always; }
  h1:first-of-type { page-break-before: avoid; }
  h2, h3 { page-break-after: avoid; }
  table, pre, blockquote { page-break-inside: avoid; }
  tr { page-break-inside: avoid; }
}

/* === BASE === */
* { box-sizing: border-box; margin: 0; padding: 0; }

body {
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-size: 10.5pt;
  line-height: 1.75;
  color: #1a1a2e;
  background: #f5f5f5;
}

.container {
  max-width: 210mm;
  margin: 0 auto;
  background: #fff;
  box-shadow: 0 0 30px rgba(0,0,0,0.1);
  padding: 50px 60px;
}

@media print { 
  .container { 
    max-width: none; 
    box-shadow: none; 
    padding: 0; 
    margin: 0;
  }
  body { background: #fff; }
}

/* === COVER PAGE === */
.cover-page {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 70vh;
  text-align: center;
  padding: 60px 20px;
  margin-bottom: 40px;
  border-bottom: 2px solid #e9ecef;
}

.cover-logo {
  font-size: 13pt;
  font-weight: 800;
  color: #C9A962;
  letter-spacing: 5px;
  text-transform: uppercase;
  margin-bottom: 8px;
}

.cover-divider {
  width: 60px;
  height: 3px;
  background: linear-gradient(90deg, #C9A962, #0369a1);
  margin: 20px auto;
  border-radius: 2px;
}

.cover-title {
  font-size: 32pt;
  font-weight: 900;
  color: #1a1a2e;
  margin: 16px 0 8px;
  line-height: 1.3;
  border: none !important;
  padding: 0 !important;
  page-break-before: avoid !important;
}

.cover-subtitle {
  font-size: 13pt;
  color: #888;
  font-weight: 400;
  margin-bottom: 40px;
}

.cover-meta {
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 24px 40px;
  text-align: left;
  display: inline-block;
}

.cover-meta p {
  margin: 5px 0;
  font-size: 9.5pt;
  color: #555;
}

.cover-meta strong {
  display: inline-block;
  width: 85px;
  color: #1a1a2e;
}

.cover-confidential {
  margin-top: 50px;
  font-size: 8pt;
  color: #C9A962;
  font-weight: 700;
  letter-spacing: 3px;
}

/* === DOWNLOAD BUTTON === */
.download-bar {
  position: sticky;
  top: 0;
  z-index: 999;
  background: linear-gradient(135deg, #1a1a2e, #0369a1);
  padding: 12px 30px;
  text-align: center;
  box-shadow: 0 2px 10px rgba(0,0,0,0.2);
}

.download-bar button {
  background: #C9A962;
  color: #1a1a2e;
  border: none;
  padding: 10px 30px;
  font-size: 11pt;
  font-weight: 700;
  border-radius: 6px;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.2s;
}

.download-bar button:hover {
  background: #b8943e;
  transform: scale(1.02);
}

.download-bar span {
  color: #fff;
  font-size: 9pt;
  margin-left: 15px;
  opacity: 0.8;
}

/* === HEADINGS === */
h1 {
  font-size: 20pt;
  font-weight: 900;
  color: #1a1a2e;
  margin: 45px 0 15px;
  padding-bottom: 10px;
  border-bottom: 3px solid #C9A962;
}

h2 {
  font-size: 13.5pt;
  font-weight: 800;
  color: #0369a1;
  margin: 30px 0 12px;
  padding-left: 14px;
  border-left: 4px solid #C9A962;
}

h3 {
  font-size: 11.5pt;
  font-weight: 700;
  color: #1a1a2e;
  margin: 22px 0 8px;
}

h4 {
  font-size: 10.5pt;
  font-weight: 700;
  color: #555;
  margin: 16px 0 6px;
}

/* === TABLE === */
table {
  width: 100%;
  border-collapse: collapse;
  margin: 14px 0 22px;
  font-size: 9pt;
}

thead {
  background: #1a1a2e;
  color: #fff;
}

th {
  padding: 9px 12px;
  text-align: left;
  font-weight: 700;
  font-size: 8.5pt;
  letter-spacing: 0.3px;
}

td {
  padding: 8px 12px;
  border-bottom: 1px solid #e9ecef;
  vertical-align: top;
}

tr:nth-child(even) {
  background: #f8f9fa;
}

/* === BLOCKQUOTE === */
blockquote {
  border-left: 4px solid #C9A962;
  background: #fffbf0;
  padding: 14px 18px;
  margin: 16px 0;
  border-radius: 0 6px 6px 0;
  color: #555;
}

blockquote strong { color: #1a1a2e; }

/* === CODE === */
code {
  background: #f1f3f5;
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 8.5pt;
  font-family: 'SF Mono', 'Consolas', 'Monaco', monospace;
  color: #d63384;
}

pre {
  background: #1a1a2e;
  color: #e9ecef;
  padding: 16px 20px;
  border-radius: 8px;
  overflow-x: auto;
  font-size: 8pt;
  line-height: 1.6;
  margin: 14px 0;
}

pre code {
  background: none;
  color: inherit;
  padding: 0;
  font-size: 8pt;
}

/* === LISTS === */
ul, ol {
  margin: 8px 0;
  padding-left: 26px;
}

li { margin: 4px 0; }

/* === MISC === */
a { color: #0369a1; text-decoration: none; }
hr { border: none; border-top: 2px solid #e9ecef; margin: 35px 0; }
p { margin: 8px 0; }
strong { color: #1a1a2e; }

/* === FOOTER === */
.doc-footer {
  margin-top: 50px;
  padding-top: 20px;
  border-top: 2px solid #C9A962;
  text-align: center;
  font-size: 8.5pt;
  color: #999;
}
</style>
</head>
<body>

<!-- DOWNLOAD BAR -->
<div class="download-bar no-print">
  <button onclick="window.print()">📄 PDF 다운로드 (Ctrl+P)</button>
  <span>인쇄 대화상자에서 "PDF로 저장" 선택</span>
</div>

<div class="container">

<!-- COVER PAGE -->
<div class="cover-page">
  <div class="cover-logo">Patient Funnel</div>
  <div class="cover-divider"></div>
  <div class="cover-title">병원 홈페이지<br>제작 기획서</div>
  <p class="cover-subtitle">Seoul BD Dental Standard v1.0</p>
  
  <div class="cover-meta">
    <p><strong>기준 사이트</strong> https://bdbddc.com (서울비디치과)</p>
    <p><strong>작성일</strong> 2026년 2월 17일</p>
    <p><strong>작성자</strong> Patient Funnel (페이션트 퍼널)</p>
    <p><strong>버전</strong> v1.0</p>
    <p><strong>분량</strong> 15개 챕터 · 1,329줄 · 50,073자</p>
  </div>
  
  <p class="cover-confidential">CONFIDENTIAL — PATIENT FUNNEL PROPRIETARY</p>
</div>

<!-- MAIN CONTENT -->
${htmlBody}

<!-- FOOTER -->
<div class="doc-footer">
  <p><strong>Patient Funnel</strong> — 병원 홈페이지 제작 기획서 v1.0</p>
  <p>기준 사이트: https://bdbddc.com | 작성일: 2026-02-17</p>
  <p>© 2026 Patient Funnel. All rights reserved.</p>
</div>

</div><!-- /.container -->

</body>
</html>`;

// Write HTML
const outputPath = path.join(__dirname, 'hospital-website-blueprint.html');
fs.writeFileSync(outputPath, fullHtml, 'utf-8');

const size = fs.statSync(outputPath).size;
console.log(`✅ HTML 생성 완료: ${outputPath}`);
console.log(`   파일 크기: ${(size / 1024).toFixed(0)} KB`);
