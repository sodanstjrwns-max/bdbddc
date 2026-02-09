#!/usr/bin/env python3
"""추가 지역 페이지(public/area) v4 변환"""
import os, sys
sys.path.insert(0, '/home/user/webapp')
from importlib.machinery import SourceFileLoader
mod = SourceFileLoader("converter", "/home/user/webapp/convert-subpages.py").load_module()

BASE = '/home/user/webapp'

# public/area 추가 지역 페이지
areas = {
    'anseong': ('안성', '안성시'),
    'cheongju': ('청주', '청주시'),
    'chungju': ('충주', '충주시'),
    'daejeon': ('대전', '대전광역시'),
    'dangjin': ('당진', '당진시'),
    'gongju': ('공주', '공주시'),
    'hongseong': ('홍성', '홍성군'),
    'jincheon': ('진천', '진천군'),
    'nonsan': ('논산', '논산시'),
    'pyeongtaek': ('평택', '평택시'),
    'sejong': ('세종', '세종시'),
    'seosan': ('서산', '서산시'),
    'yesan': ('예산', '예산군'),
}

count = 0
for slug, (name, full) in areas.items():
    config = {
        'title': f'{name} 치과 추천 — 서울비디치과',
        'desc': f'{full} 치과 추천 서울비디치과 — 서울대 출신 15인 원장 협진, 365일 진료, 임플란트·교정·소아치과 전문.',
        'keywords': f'{name}치과,{name}임플란트,{name}교정,서울비디치과',
        'badge_icon': 'fas fa-map-marker-alt',
        'badge_text': f'{name} 치과',
        'h1': f'{name}에서 가까운<br><span class="text-gradient">서울비디치과</span>',
        'hero_desc': f'{full}에서 서울비디치과까지 — 서울대 출신 15인 원장, 365일 진료',
        'stats': None,
        'breadcrumb': [(f'{name} 치과', '')],
        'cta_title': f'{name}에서 서울비디치과까지',
        'cta_desc': f'{full}에서 편하게 방문하실 수 있습니다. 365일 진료, 야간진료 가능.',
    }
    # public/area에서 직접 변환
    filepath = os.path.join(BASE, 'public', 'area', f'{slug}.html')
    if mod.convert_page(filepath, config, depth=2):
        count += 1
        # area/에도 복사
        area_dir = os.path.join(BASE, 'area')
        os.makedirs(area_dir, exist_ok=True)
        import shutil
        shutil.copy(filepath, os.path.join(area_dir, f'{slug}.html'))

# dist/area에도 동기화
os.makedirs(os.path.join(BASE, 'dist', 'area'), exist_ok=True)
import shutil
for f in os.listdir(os.path.join(BASE, 'area')):
    if f.endswith('.html'):
        shutil.copy(os.path.join(BASE, 'area', f), os.path.join(BASE, 'dist', 'area', f))

print(f"\n✅ 추가 {count}개 지역 페이지 변환 완료!")
