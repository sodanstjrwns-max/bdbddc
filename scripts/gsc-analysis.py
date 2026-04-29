#!/usr/bin/env python3
"""
Google Search Console 데이터 분석 스크립트
bdbddc.com (서울비디치과) - 2026년 1월~4월 GSC 데이터 기반
"""

import csv
import json
import os
from collections import defaultdict

DATA_DIR = "/home/user/uploaded_files"
OUTPUT_DIR = "/home/user/webapp/public/static"

def parse_pct(s):
    return float(s.replace('%','')) if s else 0

def read_csv(filename):
    rows = []
    filepath = os.path.join(DATA_DIR, filename)
    with open(filepath, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            rows.append(row)
    return rows

# ============================================================
# 1. KEYWORDS DATA
# ============================================================
keywords_raw = read_csv("검색어 수.csv")
keywords = []
for row in keywords_raw:
    kw = {
        'query': row['인기 검색어'],
        'clicks': int(row['클릭수']),
        'impressions': int(row['노출']),
        'ctr': parse_pct(row['CTR']),
        'position': float(row['게재 순위'])
    }
    keywords.append(kw)

# ============================================================
# 2. PAGES DATA
# ============================================================
pages_raw = read_csv("페이지.csv")
pages = []
for row in pages_raw:
    pg = {
        'url': row['인기 페이지'],
        'clicks': int(row['클릭수']),
        'impressions': int(row['노출']),
        'ctr': parse_pct(row['CTR']),
        'position': float(row['게재 순위'])
    }
    pages.append(pg)

# ============================================================
# 3. CHART (DAILY) DATA
# ============================================================
chart_raw = read_csv("차트.csv")
chart = []
for row in chart_raw:
    ch = {
        'date': row['날짜'],
        'clicks': int(row['클릭수']),
        'impressions': int(row['노출']),
        'ctr': parse_pct(row['CTR']),
        'position': float(row['게재 순위'])
    }
    chart.append(ch)

# ============================================================
# 4. DEVICE DATA
# ============================================================
devices = {
    'desktop': {'clicks': 310, 'impressions': 10775, 'ctr': 2.88, 'position': 10.26},
    'mobile': {'clicks': 221, 'impressions': 8630, 'ctr': 2.56, 'position': 6.31},
    'tablet': {'clicks': 8, 'impressions': 373, 'ctr': 2.14, 'position': 5.38}
}

# ============================================================
# 5. COUNTRY DATA
# ============================================================
countries_raw = read_csv("국가.csv")
countries = []
for row in countries_raw:
    ct = {
        'country': row['국가'],
        'clicks': int(row['클릭수']),
        'impressions': int(row['노출']),
        'ctr': parse_pct(row['CTR']),
        'position': float(row['게재 순위'])
    }
    countries.append(ct)

# ============================================================
# ANALYSIS
# ============================================================

# --- Keyword Classification ---
brand_terms = ['서울비디치과', '비디치과', '두정서울비디치과', '서울비디치과의원', 'bddental', 'bdbddc',
               '서울비디치과 리뷰', '천안 서울비디치과 후기', '서울비디치과의원 불당본점',
               '문석준 치과의사']

def is_brand(q):
    q_lower = q.lower()
    for bt in brand_terms:
        if bt.lower() in q_lower:
            return True
    return False

def classify_intent(q):
    q_lower = q.lower()
    local_signals = ['천안', '불당', '아산', '두정', '세종', '대전', '홍성', '서산', '당진', '예산',
                     '오산', '평택', '안성', '근처', 'near me', 'nearby', '추천', '잘하는']
    info_signals = ['뜻', '영어로', '란', '이란', '구조', '번호', '순서', '시기', '정의',
                    '원인', '증상', '부작용', '과정', '방법', '차이', '종류']
    commercial_signals = ['가격', '비용', '비교', '추천', '잘하는', '후기', '저렴', '할부',
                         '보험', '실비', '디시']
    transactional_signals = ['예약', '전화', '상담', '영업시간', '진료시간', '일요일', '주말']
    
    for s in local_signals:
        if s in q_lower:
            return 'local'
    for s in transactional_signals:
        if s in q_lower:
            return 'transactional'
    for s in commercial_signals:
        if s in q_lower:
            return 'commercial'
    for s in info_signals:
        if s in q_lower:
            return 'informational'
    return 'informational'

def classify_topic(q):
    q_lower = q.lower()
    topics = {
        '임플란트': ['임플란트', 'implant', '식립', '골유착', '상악동', 'gbr', '뼈이식', '골이식',
                   'all on', '오버덴쳐', '즉시', '네비게이션', '수면임플란트', '스트라우만', '오스템',
                   'slactive', 'roxolid'],
        '교정': ['교정', '인비절라인', 'invisalign', '브라켓', '와이어', '파워체인', '리테이너',
                '클리피씨', 'retainer', '헤드기어', '교합', 'braces', '부분교정', '급속교정'],
        '라미네이트/심미': ['라미네이트', '미백', 'glownate', '심미', 'veneer', '치아성형', 'e-max',
                       'emax', '이맥스', '제로네이트'],
        '소아치과': ['소아', '어린이', '유치', '맹출', '소구치', '대구치', '첫 치과', 'pediatric',
                  '아이', '키즈'],
        '일반진료': ['충치', '레진', '인레이', '크라운', '신경치료', '근관', '발치', '사랑니',
                   '스케일링', '잇몸', '치주', '보존', '보철', '틀니', 'denture'],
        '치과용어/백과': ['뜻', '영어로', '정의', '구조', '번호', '치식', '단면', '해부'],
        '병원찾기': ['치과 추천', '잘하는', '근처', 'near me', '추천해줘', '병원 비교'],
        '비용/보험': ['가격', '비용', '보험', '실비', '할부', '분할', '급여', '비급여', '의료급여']
    }
    for topic, signals in topics.items():
        for s in signals:
            if s in q_lower:
                return topic
    return '기타'

# Rank buckets
rank_1_3 = [k for k in keywords if k['position'] <= 3]
rank_4_10 = [k for k in keywords if 3 < k['position'] <= 10]
rank_11_20 = [k for k in keywords if 10 < k['position'] <= 20]
rank_21_plus = [k for k in keywords if k['position'] > 20]

# Quick wins (rank 11-20, impressions >= 5)
quick_wins = sorted([k for k in keywords if 10 < k['position'] <= 20 and k['impressions'] >= 5],
                    key=lambda x: x['impressions'], reverse=True)

# CTR anomalies (rank <=10, impressions >= 20, CTR < 5%)
ctr_low = sorted([k for k in keywords if k['position'] <= 10 and k['impressions'] >= 20 and k['ctr'] < 5],
                 key=lambda x: x['impressions'], reverse=True)

# High potential (rank >20, impressions >= 10)
high_potential = sorted([k for k in keywords if k['position'] > 20 and k['impressions'] >= 10],
                        key=lambda x: x['impressions'], reverse=True)

# Brand vs Non-brand
brand_kws = [k for k in keywords if is_brand(k['query'])]
nonbrand_kws = [k for k in keywords if not is_brand(k['query'])]
brand_clicks = sum(k['clicks'] for k in brand_kws)
nonbrand_clicks = sum(k['clicks'] for k in nonbrand_kws)
brand_imp = sum(k['impressions'] for k in brand_kws)
nonbrand_imp = sum(k['impressions'] for k in nonbrand_kws)

# Topic distribution
topic_stats = defaultdict(lambda: {'count': 0, 'clicks': 0, 'impressions': 0})
for k in keywords:
    t = classify_topic(k['query'])
    topic_stats[t]['count'] += 1
    topic_stats[t]['clicks'] += k['clicks']
    topic_stats[t]['impressions'] += k['impressions']

# Intent distribution
intent_stats = defaultdict(lambda: {'count': 0, 'clicks': 0, 'impressions': 0})
for k in keywords:
    intent = classify_intent(k['query'])
    intent_stats[intent]['count'] += 1
    intent_stats[intent]['clicks'] += k['clicks']
    intent_stats[intent]['impressions'] += k['impressions']

# Page section analysis
section_stats = defaultdict(lambda: {'count': 0, 'clicks': 0, 'impressions': 0})
for p in pages:
    url = p['url']
    if '/encyclopedia/' in url:
        section = 'encyclopedia'
    elif '/blog/' in url:
        section = 'blog'
    elif '/area/' in url:
        section = 'area'
    elif '/treatments/' in url:
        section = 'treatments'
    elif '/doctors/' in url:
        section = 'doctors'
    elif '/faq/' in url or '/faq' == url.split('bdbddc.com')[-1]:
        section = 'faq'
    elif '/cases/' in url:
        section = 'cases'
    else:
        section = 'main'
    section_stats[section]['count'] += 1
    section_stats[section]['clicks'] += p['clicks']
    section_stats[section]['impressions'] += p['impressions']

# Cannibalization check - keywords appearing in multiple pages (simplified)
# We'll identify keywords that rank for the same topic
cheonan_dental_kws = [k for k in keywords if '천안' in k['query'] and ('치과' in k['query'] or '임플란트' in k['query'] or '교정' in k['query'])]

# Dead pages (impressions >= 20, clicks = 0)
dead_pages = sorted([p for p in pages if p['impressions'] >= 20 and p['clicks'] == 0],
                    key=lambda x: x['impressions'], reverse=True)

# High performing pages
high_perf_pages = sorted([p for p in pages if p['clicks'] >= 3],
                         key=lambda x: x['clicks'], reverse=True)

# Weekly aggregation from chart
weekly = defaultdict(lambda: {'clicks': 0, 'impressions': 0, 'days': 0})
for ch in chart:
    # Get ISO week
    from datetime import datetime
    dt = datetime.strptime(ch['date'], '%Y-%m-%d')
    week_key = dt.strftime('%Y-W%W')
    weekly[week_key]['clicks'] += ch['clicks']
    weekly[week_key]['impressions'] += ch['impressions']
    weekly[week_key]['days'] += 1

# Monthly aggregation
monthly = defaultdict(lambda: {'clicks': 0, 'impressions': 0, 'days': 0})
for ch in chart:
    month_key = ch['date'][:7]
    monthly[month_key]['clicks'] += ch['clicks']
    monthly[month_key]['impressions'] += ch['impressions']
    monthly[month_key]['days'] += 1

# ============================================================
# BUILD JSON DATA for Dashboard
# ============================================================
dashboard_data = {
    'summary': {
        'total_clicks': sum(k['clicks'] for k in keywords),
        'total_impressions': sum(k['impressions'] for k in keywords),
        'avg_ctr': round(sum(k['clicks'] for k in keywords) / max(sum(k['impressions'] for k in keywords), 1) * 100, 2),
        'avg_position': round(sum(k['position'] * k['impressions'] for k in keywords) / max(sum(k['impressions'] for k in keywords), 1), 1),
        'total_keywords': len(keywords),
        'keywords_with_clicks': len([k for k in keywords if k['clicks'] > 0]),
        'total_pages': len(pages),
        'pages_with_clicks': len([p for p in pages if p['clicks'] > 0]),
        'period': '2026-01-28 ~ 2026-04-27 (3개월)'
    },
    'rank_distribution': {
        '1-3위': len(rank_1_3),
        '4-10위': len(rank_4_10),
        '11-20위': len(rank_11_20),
        '20위+': len(rank_21_plus)
    },
    'brand_vs_nonbrand': {
        'brand': {'keywords': len(brand_kws), 'clicks': brand_clicks, 'impressions': brand_imp,
                  'ctr': round(brand_clicks / max(brand_imp, 1) * 100, 2)},
        'nonbrand': {'keywords': len(nonbrand_kws), 'clicks': nonbrand_clicks, 'impressions': nonbrand_imp,
                     'ctr': round(nonbrand_clicks / max(nonbrand_imp, 1) * 100, 2)}
    },
    'quick_wins': [{'query': k['query'], 'clicks': k['clicks'], 'impressions': k['impressions'],
                    'ctr': k['ctr'], 'position': k['position'], 'topic': classify_topic(k['query'])}
                   for k in quick_wins[:40]],
    'ctr_low': [{'query': k['query'], 'clicks': k['clicks'], 'impressions': k['impressions'],
                 'ctr': k['ctr'], 'position': k['position']} for k in ctr_low[:30]],
    'high_potential': [{'query': k['query'], 'clicks': k['clicks'], 'impressions': k['impressions'],
                        'ctr': k['ctr'], 'position': k['position'], 'topic': classify_topic(k['query'])}
                       for k in high_potential[:30]],
    'top_keywords': sorted(keywords, key=lambda x: x['impressions'], reverse=True)[:50],
    'topic_stats': {t: dict(v) for t, v in topic_stats.items()},
    'intent_stats': {t: dict(v) for t, v in intent_stats.items()},
    'section_stats': {s: dict(v) for s, v in section_stats.items()},
    'devices': devices,
    'countries': countries[:15],
    'chart': chart,
    'monthly': {k: dict(v) for k, v in sorted(monthly.items())},
    'dead_pages': [{'url': p['url'].replace('https://bdbddc.com',''), 'impressions': p['impressions'],
                    'position': p['position']} for p in dead_pages[:30]],
    'high_perf_pages': [{'url': p['url'].replace('https://bdbddc.com',''), 'clicks': p['clicks'],
                         'impressions': p['impressions'], 'ctr': p['ctr'], 'position': p['position']}
                        for p in high_perf_pages[:30]],
    'cheonan_keywords': sorted(cheonan_dental_kws, key=lambda x: x['impressions'], reverse=True),
    'all_keywords_by_rank': sorted(keywords, key=lambda x: x['position'])[:100],
}

# Calculate growth metrics
months = sorted(monthly.keys())
if len(months) >= 2:
    last_month = months[-1]
    prev_month = months[-2]
    click_growth = ((monthly[last_month]['clicks'] - monthly[prev_month]['clicks']) / max(monthly[prev_month]['clicks'], 1)) * 100
    imp_growth = ((monthly[last_month]['impressions'] - monthly[prev_month]['impressions']) / max(monthly[prev_month]['impressions'], 1)) * 100
    dashboard_data['growth'] = {
        'click_growth_pct': round(click_growth, 1),
        'imp_growth_pct': round(imp_growth, 1),
        'last_month': last_month,
        'prev_month': prev_month
    }

os.makedirs(OUTPUT_DIR, exist_ok=True)
with open(os.path.join(OUTPUT_DIR, 'gsc-data.json'), 'w', encoding='utf-8') as f:
    json.dump(dashboard_data, f, ensure_ascii=False, indent=2)

print("✅ GSC data JSON generated:", os.path.join(OUTPUT_DIR, 'gsc-data.json'))
print(f"   Keywords: {len(keywords)}, Pages: {len(pages)}, Days: {len(chart)}")
print(f"   Quick Wins: {len(quick_wins)}, CTR Low: {len(ctr_low)}, High Potential: {len(high_potential)}")
print(f"   Dead Pages: {len(dead_pages)}")
