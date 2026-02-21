/**
 * 병원 홈페이지 기획서 — Markdown → Word (.docx) 변환기
 * Patient Funnel Standard
 * 
 * Usage: node docs/build-docx.cjs
 * Output: docs/hospital-website-blueprint.docx
 */

const fs = require('fs');
const path = require('path');
const docx = require('docx');

const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  HeadingLevel, AlignmentType, BorderStyle, WidthType,
  PageBreak, TabStopType, TabStopPosition, ShadingType,
  Header, Footer, PageNumber, NumberFormat,
  TableOfContents, StyleLevel, convertInchesToTwip,
  ImageRun, ExternalHyperlink
} = docx;

// === COLORS ===
const GOLD = 'C9A962';
const BLUE = '0369a1';
const DARK = '1a1a2e';
const GRAY = '666666';
const LIGHT_BG = 'F8F9FA';
const WHITE = 'FFFFFF';

// === Read markdown ===
const md = fs.readFileSync(path.join(__dirname, 'hospital-website-blueprint.md'), 'utf-8');
const lines = md.split('\n');

// === Parse markdown into structured elements ===
function parseMarkdown(lines) {
  const elements = [];
  let i = 0;
  let inCodeBlock = false;
  let codeLines = [];
  let codeLang = '';
  let inTable = false;
  let tableRows = [];

  while (i < lines.length) {
    const line = lines[i];

    // Code blocks
    if (line.startsWith('```')) {
      if (inCodeBlock) {
        elements.push({ type: 'code', lang: codeLang, content: codeLines.join('\n') });
        codeLines = [];
        inCodeBlock = false;
      } else {
        // Flush table if pending
        if (inTable) {
          elements.push({ type: 'table', rows: tableRows });
          tableRows = [];
          inTable = false;
        }
        inCodeBlock = true;
        codeLang = line.replace('```', '').trim();
      }
      i++;
      continue;
    }

    if (inCodeBlock) {
      codeLines.push(line);
      i++;
      continue;
    }

    // Table detection
    if (line.startsWith('|') && line.includes('|')) {
      // Check if next line is separator
      const nextLine = lines[i + 1] || '';
      if (!inTable) {
        inTable = true;
        tableRows = [];
        // Parse header
        tableRows.push(parseTblRow(line));
        // Skip separator line
        if (nextLine.match(/^\|[\s-:|]+\|$/)) {
          i += 2;
          continue;
        }
      } else {
        // Skip separator lines
        if (line.match(/^\|[\s-:|]+\|$/)) {
          i++;
          continue;
        }
        tableRows.push(parseTblRow(line));
      }
      i++;
      continue;
    } else if (inTable) {
      elements.push({ type: 'table', rows: tableRows });
      tableRows = [];
      inTable = false;
      // Don't increment, process current line
      continue;
    }

    // Headers
    if (line.startsWith('######')) {
      elements.push({ type: 'h6', content: line.replace(/^######\s*/, '') });
    } else if (line.startsWith('#####')) {
      elements.push({ type: 'h5', content: line.replace(/^#####\s*/, '') });
    } else if (line.startsWith('####')) {
      elements.push({ type: 'h4', content: line.replace(/^####\s*/, '') });
    } else if (line.startsWith('###')) {
      elements.push({ type: 'h3', content: line.replace(/^###\s*/, '') });
    } else if (line.startsWith('##')) {
      elements.push({ type: 'h2', content: line.replace(/^##\s*/, '') });
    } else if (line.startsWith('# ')) {
      elements.push({ type: 'h1', content: line.replace(/^#\s*/, '') });
    }
    // Horizontal rule
    else if (line.match(/^---+$/)) {
      elements.push({ type: 'hr' });
    }
    // Blockquote
    else if (line.startsWith('>')) {
      let bqLines = [line.replace(/^>\s?/, '')];
      while (i + 1 < lines.length && lines[i + 1].startsWith('>')) {
        i++;
        bqLines.push(lines[i].replace(/^>\s?/, ''));
      }
      elements.push({ type: 'blockquote', content: bqLines.join('\n') });
    }
    // Empty line
    else if (line.trim() === '') {
      // skip
    }
    // Regular paragraph
    else {
      // Accumulate multi-line paragraphs
      let paraLines = [line];
      while (i + 1 < lines.length) {
        const next = lines[i + 1];
        if (next.trim() === '' || next.startsWith('#') || next.startsWith('>') || next.startsWith('|') || next.startsWith('```') || next.match(/^---+$/)) break;
        i++;
        paraLines.push(next);
      }
      elements.push({ type: 'paragraph', content: paraLines.join('\n') });
    }

    i++;
  }

  // Flush remaining table
  if (inTable && tableRows.length > 0) {
    elements.push({ type: 'table', rows: tableRows });
  }

  return elements;
}

function parseTblRow(line) {
  return line.replace(/^\||\|$/g, '').split('|').map(c => c.trim());
}

// === Convert inline markdown to TextRun array ===
function inlineToRuns(text, baseOpts = {}) {
  const runs = [];
  // Pattern: **bold**, *italic*, `code`, [link](url)
  const regex = /(\*\*\*(.+?)\*\*\*|\*\*(.+?)\*\*|\*(.+?)\*|`([^`]+)`|\[([^\]]+)\]\(([^)]+)\))/g;
  
  let lastIdx = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    // Text before match
    if (match.index > lastIdx) {
      const before = text.slice(lastIdx, match.index);
      if (before) runs.push(new TextRun({ text: before, font: 'Pretendard', size: baseOpts.size || 20, color: baseOpts.color || DARK, ...baseOpts }));
    }

    if (match[2]) {
      // Bold italic ***text***
      runs.push(new TextRun({ text: match[2], bold: true, italics: true, font: 'Pretendard', size: baseOpts.size || 20, color: baseOpts.color || DARK }));
    } else if (match[3]) {
      // Bold **text**
      runs.push(new TextRun({ text: match[3], bold: true, font: 'Pretendard', size: baseOpts.size || 20, color: baseOpts.color || DARK }));
    } else if (match[4]) {
      // Italic *text*
      runs.push(new TextRun({ text: match[4], italics: true, font: 'Pretendard', size: baseOpts.size || 20, color: baseOpts.color || DARK }));
    } else if (match[5]) {
      // Inline code `text`
      runs.push(new TextRun({ text: match[5], font: 'Consolas', size: 18, color: 'd63384', shading: { type: ShadingType.CLEAR, fill: 'F1F3F5' } }));
    } else if (match[6] && match[7]) {
      // Link [text](url)
      runs.push(new TextRun({ text: match[6], font: 'Pretendard', size: baseOpts.size || 20, color: BLUE, underline: {} }));
    }

    lastIdx = match.index + match[0].length;
  }

  // Remaining text
  if (lastIdx < text.length) {
    const remaining = text.slice(lastIdx);
    if (remaining) runs.push(new TextRun({ text: remaining, font: 'Pretendard', size: baseOpts.size || 20, color: baseOpts.color || DARK, ...baseOpts }));
  }

  if (runs.length === 0) {
    runs.push(new TextRun({ text: text || ' ', font: 'Pretendard', size: baseOpts.size || 20, color: baseOpts.color || DARK, ...baseOpts }));
  }

  return runs;
}

// === Build Word document ===
function buildDocument(elements) {
  const children = [];

  // Cover page
  children.push(
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 3000 }, children: [
      new TextRun({ text: 'PATIENT FUNNEL', font: 'Pretendard', size: 28, bold: true, color: GOLD, characterSpacing: 300 })
    ]}),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 200 }, children: [
      new TextRun({ text: '━━━━━━━━━━━━━━━━━', color: GOLD, size: 20 })
    ]}),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 600 }, children: [
      new TextRun({ text: '병원 홈페이지', font: 'Pretendard', size: 56, bold: true, color: DARK })
    ]}),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 100 }, children: [
      new TextRun({ text: '제작 기획서', font: 'Pretendard', size: 56, bold: true, color: DARK })
    ]}),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 300 }, children: [
      new TextRun({ text: 'Patient Funnel Standard Template v4.0 — 실전 예시 완전판', font: 'Pretendard', size: 22, color: GRAY })
    ]}),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 800 }, children: [] }),
    // Cover meta info
    new Paragraph({ alignment: AlignmentType.CENTER, children: [
      new TextRun({ text: '작성자  ', font: 'Pretendard', size: 19, bold: true, color: DARK }),
      new TextRun({ text: 'Patient Funnel (페이션트 퍼널)', font: 'Pretendard', size: 19, color: GRAY })
    ]}),
    new Paragraph({ alignment: AlignmentType.CENTER, children: [
      new TextRun({ text: '버전  ', font: 'Pretendard', size: 19, bold: true, color: DARK }),
      new TextRun({ text: 'v4.0 — 범용 템플릿 + 실전 예시 완전판', font: 'Pretendard', size: 19, color: GRAY })
    ]}),
    new Paragraph({ alignment: AlignmentType.CENTER, children: [
      new TextRun({ text: '최종 수정  ', font: 'Pretendard', size: 19, bold: true, color: DARK }),
      new TextRun({ text: '2026년 2월 21일', font: 'Pretendard', size: 19, color: GRAY })
    ]}),
    new Paragraph({ alignment: AlignmentType.CENTER, children: [
      new TextRun({ text: '레퍼런스  ', font: 'Pretendard', size: 19, bold: true, color: DARK }),
      new TextRun({ text: 'https://bdbddc.com (서울비디치과)', font: 'Pretendard', size: 19, color: BLUE })
    ]}),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 1200 }, children: [
      new TextRun({ text: 'CONFIDENTIAL — PATIENT FUNNEL PROPRIETARY', font: 'Pretendard', size: 16, bold: true, color: GOLD, characterSpacing: 200 })
    ]}),
    new Paragraph({ children: [new TextRun({ break: 1 })], pageBreakBefore: false }),
    new Paragraph({ children: [], pageBreakBefore: true }) // Page break after cover
  );

  // Process each element
  let skipNextTitleH1 = true; // Skip the first H1 (already in cover)

  for (const el of elements) {
    switch (el.type) {
      case 'h1':
        if (skipNextTitleH1) {
          skipNextTitleH1 = false;
          break;
        }
        children.push(new Paragraph({
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 480, after: 200 },
          border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: GOLD } },
          children: [new TextRun({ text: el.content, font: 'Pretendard', size: 36, bold: true, color: DARK })]
        }));
        break;

      case 'h2':
        children.push(new Paragraph({
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 360, after: 160 },
          border: { left: { style: BorderStyle.SINGLE, size: 8, color: GOLD } },
          indent: { left: convertInchesToTwip(0.15) },
          children: [new TextRun({ text: el.content, font: 'Pretendard', size: 26, bold: true, color: BLUE })]
        }));
        break;

      case 'h3':
        children.push(new Paragraph({
          heading: HeadingLevel.HEADING_3,
          spacing: { before: 280, after: 120 },
          children: [new TextRun({ text: el.content, font: 'Pretendard', size: 22, bold: true, color: DARK })]
        }));
        break;

      case 'h4':
        children.push(new Paragraph({
          heading: HeadingLevel.HEADING_4,
          spacing: { before: 200, after: 100 },
          children: [new TextRun({ text: el.content, font: 'Pretendard', size: 20, bold: true, color: GRAY })]
        }));
        break;

      case 'h5':
      case 'h6':
        children.push(new Paragraph({
          spacing: { before: 160, after: 80 },
          children: [new TextRun({ text: el.content, font: 'Pretendard', size: 20, bold: true, color: GRAY })]
        }));
        break;

      case 'blockquote':
        const bqLines = el.content.split('\n');
        for (const bqLine of bqLines) {
          children.push(new Paragraph({
            spacing: { before: 80, after: 80 },
            indent: { left: convertInchesToTwip(0.3) },
            border: { left: { style: BorderStyle.SINGLE, size: 8, color: GOLD } },
            shading: { type: ShadingType.CLEAR, fill: 'FFFBF0' },
            children: inlineToRuns(bqLine, { size: 19, color: '555555' })
          }));
        }
        break;

      case 'code':
        // Code block - render as dark background paragraphs
        const codeContent = el.content.split('\n');
        for (let ci = 0; ci < codeContent.length; ci++) {
          children.push(new Paragraph({
            spacing: { before: ci === 0 ? 120 : 0, after: ci === codeContent.length - 1 ? 120 : 0, line: 300 },
            shading: { type: ShadingType.CLEAR, fill: '1a1a2e' },
            indent: { left: convertInchesToTwip(0.2), right: convertInchesToTwip(0.2) },
            children: [new TextRun({
              text: codeContent[ci] || ' ',
              font: 'Consolas',
              size: 16,
              color: 'E9ECEF'
            })]
          }));
        }
        break;

      case 'table':
        if (el.rows.length > 0) {
          const tblRows = [];
          for (let ri = 0; ri < el.rows.length; ri++) {
            const isHeader = ri === 0;
            const cells = el.rows[ri].map(cellText => {
              return new TableCell({
                shading: isHeader
                  ? { type: ShadingType.CLEAR, fill: DARK }
                  : ri % 2 === 0 ? { type: ShadingType.CLEAR, fill: LIGHT_BG } : undefined,
                margins: { top: 60, bottom: 60, left: 100, right: 100 },
                children: [new Paragraph({
                  children: inlineToRuns(cellText, {
                    size: 17,
                    bold: isHeader,
                    color: isHeader ? WHITE : DARK
                  })
                })]
              });
            });
            tblRows.push(new TableRow({ children: cells, tableHeader: isHeader }));
          }
          children.push(new Table({
            rows: tblRows,
            width: { size: 100, type: WidthType.PERCENTAGE }
          }));
          children.push(new Paragraph({ spacing: { after: 120 }, children: [] }));
        }
        break;

      case 'hr':
        children.push(new Paragraph({
          spacing: { before: 200, after: 200 },
          border: { bottom: { style: BorderStyle.SINGLE, size: 2, color: 'E9ECEF' } },
          children: [new TextRun({ text: '', size: 4 })]
        }));
        break;

      case 'paragraph':
        children.push(new Paragraph({
          spacing: { before: 80, after: 80, line: 360 },
          children: inlineToRuns(el.content)
        }));
        break;
    }
  }

  // Footer
  children.push(
    new Paragraph({
      spacing: { before: 600 },
      border: { top: { style: BorderStyle.SINGLE, size: 4, color: GOLD } },
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({ text: '\n', size: 10 }),
      ]
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({ text: 'Patient Funnel', font: 'Pretendard', size: 18, bold: true, color: DARK }),
        new TextRun({ text: ' — 병원 홈페이지 제작 기획서 v4.0 Template', font: 'Pretendard', size: 18, color: GRAY }),
      ]
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({ text: '레퍼런스: https://bdbddc.com | 최종 수정: 2026-02-21', font: 'Pretendard', size: 16, color: GRAY }),
      ]
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({ text: '© 2026 Patient Funnel. All rights reserved.', font: 'Pretendard', size: 16, color: GRAY }),
      ]
    })
  );

  const doc = new Document({
    styles: {
      default: {
        document: {
          run: {
            font: 'Pretendard',
            size: 20,
            color: DARK,
          }
        }
      }
    },
    sections: [{
      properties: {
        page: {
          margin: {
            top: convertInchesToTwip(1),
            right: convertInchesToTwip(0.9),
            bottom: convertInchesToTwip(0.8),
            left: convertInchesToTwip(0.9),
          }
        }
      },
      headers: {
        default: new Header({
          children: [
            new Paragraph({
              alignment: AlignmentType.RIGHT,
              children: [
                new TextRun({ text: '병원 홈페이지 제작 기획서 v4.0 | Patient Funnel', font: 'Pretendard', size: 14, color: 'AAAAAA' })
              ]
            })
          ]
        })
      },
      footers: {
        default: new Footer({
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({ text: '— ', font: 'Pretendard', size: 16, color: GRAY }),
                new TextRun({ children: [PageNumber.CURRENT], font: 'Pretendard', size: 16, color: GRAY }),
                new TextRun({ text: ' —', font: 'Pretendard', size: 16, color: GRAY }),
              ]
            })
          ]
        })
      },
      children
    }]
  });

  return doc;
}

// === Main ===
async function main() {
  console.log('📄 Markdown → Word 변환 시작...');
  const elements = parseMarkdown(lines);
  console.log(`   파싱 완료: ${elements.length}개 요소`);

  const doc = buildDocument(elements);
  const buffer = await Packer.toBuffer(doc);

  const outputPath = path.join(__dirname, 'hospital-website-blueprint.docx');
  fs.writeFileSync(outputPath, buffer);

  const size = fs.statSync(outputPath).size;
  console.log(`✅ Word 파일 생성 완료: ${outputPath}`);
  console.log(`   파일 크기: ${(size / 1024).toFixed(0)} KB`);
}

main().catch(err => {
  console.error('❌ 오류:', err);
  process.exit(1);
});
