#!/usr/bin/env node
/**
 * v5.41 — 일본어(/jp) 클러스터 CTR 최적화
 * ----------------------------------------
 * GSC 2026-04-26~07-25 실측 검색어:
 *   オールオン4 韓国 費用   3클릭/32노출
 *   ラミネートベニア 韓国 料金  2/110
 *   韓国インプラント オールオン4  2/29
 *   韓国 ラミネートベニア  2/17
 *   → /jp/guide/implant 34클릭/562노출 (CTR 6.0% — 사이트 전체 최고)
 *      /jp/ 17/903 (1.9%)
 *
 * 방향: 볼륨은 작지만 CTR·객단가가 압도적인 구간.
 *       실제 검색되는 표현(料金·値段·オールオン4·日本語対応)을 title 전면에 배치.
 *
 * 의료광고법 준수: 최상급 표현 금지, 치료 효과 보장 금지.
 *                  가격은 기존 페이지 표기 범위를 그대로 유지.
 */
const fs = require('fs')
const path = require('path')
const ROOT = path.join(__dirname, '..')

const TARGETS = [
  {
    file: 'jp/guide/implant.html',
    note: '34클릭/562노출 CTR 6.0% — 사이트 최고. オールオン4 검색어 흡수',
    title: '韓国インプラント 費用・オールオン4 料金ガイド 2026 | 日本との比較・期間・保証 — 歯科医が解説',
    desc: '韓国インプラントの費用を日本と比較して解説します。オールオン4(All-on-4)の料金と適応条件、種類別の違い、治療期間と渡韓回数、保証とアフターケアまで。ソウル大出身の歯科医が日本語で直接説明。天安ソウルBD歯科・仲介手数料なし。',
  },
  {
    file: 'jp/guide/laminate.html',
    note: 'ラミネートベニア 韓国 料金 2/110 · 韓国 ラミネートベニア 2/17',
    title: 'ラミネートベニア 韓国 料金 2026 | 1本いくら? 日本との費用比較・寿命・Glownate — 歯科医が解説',
    desc: '韓国のラミネートベニアは1本いくらかかるのか、日本の費用と比較して解説します。Glownate(グロウネイト)と従来型の違い、削る量、寿命と再治療の条件、何本すれば自然に見えるか。仲介なし・韓国人と同一料金。天安ソウルBD歯科。',
  },
  {
    file: 'jp/guide/invisalign.html',
    note: '矯正インテント — 期間·費用を前面へ',
    title: '韓国インビザライン 費用・期間ガイド 2026 | 何回渡韓が必要? パッケージ比較 — 矯正歯科医が解説',
    desc: '韓国でインビザラインを受ける場合の費用と期間を解説します。日本との料金比較、7種類のパッケージの違い、ClinCheckによる治療計画、渡韓の回数と間隔、リテーナーまで。日本語対応・仲介手数料なし。天安ソウルBD歯科。',
  },
  {
    file: 'jp/pricing.html',
    note: '料金表 — 検索表現に合わせる',
    title: '韓国 歯科 料金表 2026 | インプラント・ラミネート・インビザライン 費用一覧 — ソウルBD歯科',
    desc: '韓国・天安ソウルBD歯科の料金表を全て公開しています。インプラント、ラミネートベニア(Glownate)、インビザライン、一般診療の費用一覧。仲介手数料なし・韓国人と同一料金。追加費用が発生する条件も明記しています。',
  },
  {
    file: 'jp/travel-guide.html',
    note: '渡韓治療の実務 — 不安解消型へ',
    title: '韓国 歯科 渡韓治療ガイド | 何泊必要? 空港からのアクセス・ホテル・通訳 — ソウルBD歯科',
    desc: '日本から韓国で歯科治療を受ける場合の実務ガイド。何泊必要か、仁川空港からのアクセス(KTXで天安牙山駅)、周辺ホテル、日本語対応、治療後のフォロー体制、2泊3日モデルコースまで具体的に説明します。天安ソウルBD歯科。',
  },
  {
    file: 'jp/guide/index.html',
    note: 'ハブ — 費用比較を前面へ',
    title: '韓国 歯科治療 費用ガイド 2026 | インプラント・ラミネート・インビザライン 日本との比較',
    desc: '韓国で歯科治療を受ける前に知っておきたいことを、治療別にまとめました。インプラント、ラミネートベニア、インビザラインの費用を日本と比較し、渡韓の回数、保証とアフターケア、日本語対応の有無まで。ソウル大出身の歯科医が執筆。',
  },
]

function esc(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

let changed = 0
for (const t of TARGETS) {
  const p = path.join(ROOT, t.file)
  if (!fs.existsSync(p)) { console.log(`  ⚠️  없음: ${t.file}`); continue }
  let html = fs.readFileSync(p, 'utf8')
  const before = html
  html = html.replace(/<title>[\s\S]*?<\/title>/, `<title>${t.title}</title>`)
  html = html.replace(/(<meta\s+name="description"\s+content=")[^"]*(")/, `$1${esc(t.desc)}$2`)
  html = html.replace(/(<meta\s+property="og:title"\s+content=")[^"]*(")/, `$1${esc(t.title)}$2`)
  html = html.replace(/(<meta\s+property="og:description"\s+content=")[^"]*(")/, `$1${esc(t.desc)}$2`)
  html = html.replace(/(<meta\s+name="twitter:title"\s+content=")[^"]*(")/, `$1${esc(t.title)}$2`)
  html = html.replace(/(<meta\s+name="twitter:description"\s+content=")[^"]*(")/, `$1${esc(t.desc)}$2`)
  if (html === before) { console.log(`  ⚠️  변경 없음: ${t.file}`); continue }
  fs.writeFileSync(p, html)
  console.log(`  ✅ ${t.file}`)
  console.log(`     └ ${t.note}`)
  changed++
}
console.log(`\nretitle-jp: ${changed}개 변경`)
