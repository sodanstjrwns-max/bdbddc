// ============================================
// lib/pricing.ts — 비급여 수가표(가격 안내) D1 저장 + 공개/비공개 필터 렌더 (v6.20)
// ─────────────────────────────────────────────
// - 정적 pricing.html 의 수가표(5탭)를 D1 price_items 로 이관.
// - 오너가 /admin/pricing 에서 항목명·가격·비고 편집 + 항목별 공개/비공개 토글.
// - 공개 페이지(/pricing, /pricing/:tab)는 is_published=1 항목만 렌더, 전부 숨긴 소분류는 자동 생략.
// - 안전: D1 미가용/미시딩/오류 시 정적 원본 그대로 폴백(절대 빈 표 없음).
// ============================================
import { PRICE_SEED } from '../data/price-seed'

export const PRICE_TABS = ['implant', 'prosthetic', 'denture', 'ortho', 'pediatric'] as const
export type PriceTab = typeof PRICE_TABS[number]

export const PRICE_TAB_LABELS: Record<string, string> = {
  implant: '임플란트',
  prosthetic: '크라운/글로우네이트/레진',
  denture: '틀니·기타 일반',
  ortho: '교정·인비절라인',
  pediatric: '소아치과',
}

export interface PriceItem {
  id: number
  tab: string
  sort_order: number
  kind: 'group' | 'item'
  group_key: string
  name: string
  price: string
  note: string
  group_html: string
  is_published: number
}

let priceMigrationChecked = false

// 테이블 생성 + (비어있으면) 시드 삽입. 재호출 안전(idempotent). 격리 단위 캐시.
export async function ensurePriceItemsMigrated(db: any): Promise<void> {
  if (!db || priceMigrationChecked) return
  await db.exec(
    "CREATE TABLE IF NOT EXISTS price_items (" +
    "id INTEGER PRIMARY KEY AUTOINCREMENT, tab TEXT NOT NULL, sort_order INTEGER NOT NULL, " +
    "kind TEXT NOT NULL DEFAULT 'item', group_key TEXT, name TEXT, price TEXT, note TEXT, " +
    "group_html TEXT, is_published INTEGER NOT NULL DEFAULT 1)"
  )
  try { await db.exec("CREATE INDEX IF NOT EXISTS idx_price_items_tab ON price_items(tab, sort_order)") } catch {}

  const cnt = await db.prepare('SELECT COUNT(*) AS n FROM price_items').first()
  if (cnt && Number(cnt.n) > 0) { priceMigrationChecked = true; return }

  // 비어있음 → 시드 삽입 (전부 공개)
  const stmt = db.prepare(
    'INSERT INTO price_items (tab, sort_order, kind, group_key, name, price, note, group_html, is_published) VALUES (?,?,?,?,?,?,?,?,1)'
  )
  const batch = PRICE_SEED.map(r =>
    stmt.bind(r.tab, r.sort, r.kind, r.group_key, r.name, r.price, r.note, r.group_html)
  )
  await db.batch(batch)
  priceMigrationChecked = true
}

export async function getAllPriceItems(db: any): Promise<PriceItem[]> {
  if (!db) return []
  const res = await db.prepare(
    'SELECT id, tab, sort_order, kind, group_key, name, price, note, group_html, is_published FROM price_items ORDER BY tab, sort_order'
  ).all()
  return (res?.results || []) as PriceItem[]
}

function renderItemRow(r: PriceItem): string {
  return '<tr><td class="treatment-name"><i class="fas fa-check-circle"></i> ' + (r.name || '') +
    '</td><td>' + (r.price || '') + '</td><td class="note">' + (r.note || '') + '</td></tr>'
}

// 한 탭의 tbody 내부 HTML 생성(공개 항목만, 전부 숨겨진 소분류는 생략)
function renderTabTbody(rows: PriceItem[]): string {
  const parts: string[] = []
  let i = 0
  while (i < rows.length) {
    const r = rows[i]
    if (r.kind === 'group') {
      let j = i + 1
      const items: PriceItem[] = []
      while (j < rows.length && rows[j].kind === 'item') { items.push(rows[j]); j++ }
      const pub = items.filter(it => Number(it.is_published) === 1)
      if (pub.length > 0) {
        parts.push(r.group_html || '')
        for (const it of pub) parts.push(renderItemRow(it))
      }
      i = j
    } else {
      if (Number(r.is_published) === 1) parts.push(renderItemRow(r))
      i++
    }
  }
  return parts.join('\n              ')
}

// 정적 pricing.html 에 공개 항목 tbody 를 주입. 항목이 없으면 원본 그대로 반환(폴백).
export function injectPublishedFees(html: string, all: PriceItem[]): string {
  if (!all || all.length === 0) return html
  let out = html
  for (const tab of PRICE_TABS) {
    const rows = all.filter(r => r.tab === tab).sort((a, b) => a.sort_order - b.sort_order)
    if (rows.length === 0) continue
    const body = renderTabTbody(rows)
    // 해당 탭 pricing-content 내부의 첫 <tbody>...</tbody> 치환
    const re = new RegExp('(id="' + tab + '"[\\s\\S]*?<tbody>)[\\s\\S]*?(</tbody>)')
    out = out.replace(re, (_m, p1, p2) => p1 + '\n              ' + body + '\n            ' + p2)
  }
  return out
}
