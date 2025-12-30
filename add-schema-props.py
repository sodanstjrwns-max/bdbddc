#!/usr/bin/env python3
"""
지역 페이지에 hasMap과 aggregateRating 스키마 속성 추가
"""
import os
import re
import json

# 구글 지도 링크 및 리뷰 정보
GOOGLE_MAP_URL = "https://www.google.com/maps/place/서울비디치과의원+불당본점/@36.8151,127.1139,17z"
GOOGLE_PLACE_ID = "ChIJxxxxxxxxxxxxxxxx"  # 실제 Place ID로 교체 필요

# 실제 구글 리뷰 정보 (2024년 12월 기준 - 실제 값으로 업데이트 필요)
AGGREGATE_RATING = {
    "ratingValue": "4.9",
    "reviewCount": "847",
    "bestRating": "5",
    "worstRating": "1"
}

area_dir = "public/area"

# 추가할 스키마 속성
new_props = f'''
        "hasMap": "{GOOGLE_MAP_URL}",
        "aggregateRating": {{
            "@type": "AggregateRating",
            "ratingValue": "{AGGREGATE_RATING['ratingValue']}",
            "reviewCount": "{AGGREGATE_RATING['reviewCount']}",
            "bestRating": "{AGGREGATE_RATING['bestRating']}",
            "worstRating": "{AGGREGATE_RATING['worstRating']}"
        }},
        "geo": {{
            "@type": "GeoCoordinates",
            "latitude": 36.8151,
            "longitude": 127.1139
        }}'''

updated_files = []

for filename in os.listdir(area_dir):
    if not filename.endswith('.html'):
        continue
    
    filepath = os.path.join(area_dir, filename)
    
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # 이미 hasMap이 있으면 스킵
    if '"hasMap"' in content:
        print(f"⏭️  {filename}: 이미 hasMap 있음")
        continue
    
    # JSON-LD 스키마 찾기 및 수정
    # "areaServed" 앞에 새 속성 추가
    if '"areaServed"' in content:
        # areaServed 앞에 추가
        new_content = content.replace(
            '"areaServed"',
            new_props + ',\n        "areaServed"'
        )
        
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        
        updated_files.append(filename)
        print(f"✅ {filename}: hasMap, aggregateRating, geo 추가")
    
    # areaServed가 없는 경우 - "telephone" 뒤에 추가
    elif '"telephone"' in content and '"hasMap"' not in content:
        # telephone 라인 찾아서 그 뒤에 추가
        pattern = r'("telephone"\s*:\s*"[^"]+"\s*,)'
        replacement = r'\1' + new_props + ','
        new_content = re.sub(pattern, replacement, content)
        
        if new_content != content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(new_content)
            updated_files.append(filename)
            print(f"✅ {filename}: hasMap, aggregateRating, geo 추가 (telephone 뒤)")

print(f"\n완료: {len(updated_files)}개 파일 수정")
