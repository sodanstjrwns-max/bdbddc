-- 0012_price_items.sql
-- 비급여 수가표(가격 안내) 오너 편집 + 항목별 공개/비공개 토글 (v6.20)
-- pricing.html 정적 수가표를 D1 로 이관. is_published=1 기본 공개, 미시딩/오류 시 정적 원본 폴백.
CREATE TABLE IF NOT EXISTS price_items (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  tab          TEXT NOT NULL,               -- implant|prosthetic|denture|ortho|pediatric
  sort_order   INTEGER NOT NULL,            -- 탭 내 정렬(그룹헤더/항목 순서 보존)
  kind         TEXT NOT NULL DEFAULT 'item',-- 'group'(소분류 헤더) | 'item'
  group_key    TEXT,                        -- 소속 소분류 라벨
  name         TEXT,                        -- 항목명(HTML: 배지 span 포함 가능)
  price        TEXT,                        -- 가격셀 HTML(<span class="price">..</span> 등)
  note         TEXT,                        -- 비고셀 HTML
  group_html   TEXT,                        -- 그룹헤더 <tr> 원본(정확 렌더용)
  is_published INTEGER NOT NULL DEFAULT 1   -- 1=공개, 0=비공개(그룹은 항상 1, 소속 항목 전부 비공개면 자동 숨김)
);
CREATE INDEX IF NOT EXISTS idx_price_items_tab ON price_items(tab, sort_order);
