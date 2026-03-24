#!/usr/bin/env python3
"""
각 진료 페이지에 환자가 진짜 궁금한 FAQ 추가 (v2 - 더 안정적인 삽입 로직)
- HTML faq-item 추가
- FAQPage 구조화 데이터 업데이트
"""
import re, json, os, sys

# 페이지별 추가 FAQ (환자 관점 실전 질문)
NEW_FAQS = {
    "scaling": [
        ("스케일링 하면 치아가 깎이거나 약해지나요?", "아닙니다. 스케일링은 치아 표면의 치석만 제거하는 시술로, 치아 자체를 깎지 않습니다. 오히려 치석을 방치하면 잇몸뼈가 녹아 치아가 흔들릴 수 있으므로 정기적 스케일링이 치아를 지키는 방법입니다."),
        ("스케일링 후 이가 벌어진 느낌이 드는데 정상인가요?", "네, 정상입니다. 치석이 치아 사이를 메우고 있다가 제거되면서 일시적으로 벌어진 느낌이 듭니다. 잇몸이 회복되면 자연스러워지며, 벌어진 느낌이 클수록 치석이 많았다는 뜻입니다."),
        ("임신 중에도 스케일링을 받을 수 있나요?", "임신 중기(4~6개월)에는 가능합니다. 임신성 치은염 예방을 위해 오히려 권장되며, 내원 시 임신 사실을 알려주시면 안전하게 진행합니다."),
    ],
    "implant": [
        ("임플란트 수술 당일 운전하고 귀가해도 되나요?", "일반 마취(국소 마취) 시에는 운전이 가능합니다. 다만 수면 임플란트를 받으신 경우에는 당일 운전을 삼가시고 보호자 동반을 권합니다."),
        ("흡연자도 임플란트가 가능한가요?", "가능하지만, 흡연은 골유착 실패 확률을 2~3배 높입니다. 수술 전 2주, 수술 후 최소 2개월 금연을 강력히 권합니다. 금연이 어려우시면 상담 시 말씀해 주세요."),
        ("임플란트 후 음식은 언제부터 먹을 수 있나요?", "수술 당일부터 반대쪽으로 부드러운 음식(죽, 스프 등)을 드실 수 있습니다. 딱딱한 음식은 2주 이후, 수술 부위로 씹는 것은 보철물 완성 후부터 가능합니다."),
    ],
    "invisalign": [
        ("인비절라인 착용 중 커피나 음료를 마셔도 되나요?", "물은 착용 상태로 마셔도 됩니다. 커피, 차 등 색소가 있는 음료는 장치 변색의 원인이 되므로 제거 후 마시는 것을 권합니다. 식사 후 양치 후 다시 착용하세요."),
        ("교정 중 말할 때 발음이 어색하지 않나요?", "처음 1~2일 정도 미세한 발음 차이가 있을 수 있으나, 대부분 3일 이내 적응합니다. 직업상 발표가 많은 분들도 큰 불편 없이 사용하고 계십니다."),
        ("인비절라인 교정 중 여행이나 출장 가도 되나요?", "물론입니다. 투명교정의 가장 큰 장점 중 하나입니다. 다음 단계 장치를 미리 받아가시면 되고, 원격으로 경과를 확인할 수도 있습니다."),
    ],
    "glownate": [
        ("글로우네이트가 자연 치아처럼 보이나요?", "네, 글로우네이트는 디지털 스마일 디자인(DSD)으로 환자의 얼굴형, 피부톤, 잇몸라인에 맞춰 제작하여 자연 치아보다 더 자연스럽고 아름다운 결과를 만듭니다."),
        ("글로우네이트 후 음식 제한이 있나요?", "일상적인 식사에는 제한이 없습니다. 다만 딱딱한 견과류를 앞니로 깨물거나, 얼음을 씹는 습관은 피해주시면 더 오래 유지됩니다."),
        ("기존 라미네이트를 글로우네이트로 교체할 수 있나요?", "가능합니다. 기존 라미네이트가 변색되거나 파손된 경우, 글로우네이트로 업그레이드 시술이 가능합니다. 기존 상태에 따라 치아 삭제 없이 교체가 가능한 경우도 있습니다."),
    ],
    "cavity": [
        ("충치가 있는데 안 아프면 치료 안 해도 되나요?", "안 됩니다. 충치는 통증이 없어도 계속 진행됩니다. 초기에 발견하면 간단한 레진 치료로 끝나지만, 방치하면 신경치료나 발치까지 필요할 수 있습니다. 통증은 이미 많이 진행된 신호입니다."),
        ("충치치료 후 얼마나 지나면 식사할 수 있나요?", "레진 치료는 당일 바로 식사 가능합니다. 인레이·크라운의 경우 임시 접착 기간에는 반대쪽으로 부드럽게 드시고, 최종 접착 후에는 정상 식사가 가능합니다."),
        ("치과가 무서워서 충치를 오래 방치했는데 어떻게 하나요?", "걱정 마세요. 치과 공포증이 있는 분들을 위한 맞춤 진료를 합니다. 작은 치료부터 천천히 시작하며, 필요 시 수면진료도 가능합니다. 방치 기간이 길수록 빠른 상담이 중요합니다."),
    ],
    "root-canal": [
        ("신경치료가 정말 아프나요? 무서워요.", "현대 신경치료는 충분한 마취 후 진행하므로 시술 중 통증은 거의 없습니다. 치과가 무서운 분들도 많이 받으시는 시술이며, 불안하시면 수면진료도 가능합니다. 오히려 치료를 미루면 통증이 더 심해집니다."),
        ("신경치료 횟수가 왜 여러 번인가요?", "치아 뿌리 속 신경관의 감염을 완전히 제거하기 위해 보통 2~3회 방문이 필요합니다. 감염이 심하면 추가 방문이 필요할 수 있으며, 충분히 소독해야 장기적 성공률이 높아집니다."),
    ],
    "crown": [
        ("크라운 재료(지르코니아, PFM, 금) 중 뭐가 좋나요?", "위치와 상황에 따라 다릅니다. 앞니는 심미적인 지르코니아, 어금니는 강도가 높은 지르코니아나 금이 적합합니다. 정확한 추천은 검진 후 상담 시 안내드립니다."),
        ("크라운을 씌우면 그 치아는 영구적인가요?", "크라운은 영구적이지 않습니다. 보통 10~15년 이상 사용하지만, 관리 상태에 따라 달라집니다. 6개월마다 정기 검진으로 크라운 상태를 확인하는 것이 좋습니다."),
    ],
    "pediatric": [
        ("아이가 치과를 너무 무서워하는데 어떻게 하나요?", "소아치과 전문의가 아이의 공포와 불안을 전문적으로 다룹니다. 첫 방문은 치료 없이 친해지기부터 시작하고, 필요 시 웃음가스나 수면치료로 편안하게 진행합니다. 겁쟁이 아이도 걱정 마세요."),
        ("수면치료 비용은 얼마인가요?", "수면치료 비용은 치료 내용과 시간에 따라 달라집니다. 정확한 비용은 상담 시 안내드리며, <a href='/pricing' style='color:var(--color-primary);font-weight:600;'>비용 안내 페이지</a>를 참고해 주세요."),
        ("아이 치아에 은색 크라운을 씌워야 한다는데 꼭 해야 하나요?", "유치가 심하게 손상된 경우 기성 금속관(SSC)이 가장 효과적입니다. 유치가 빠질 때까지 치아를 보호하며, 영구치 공간을 유지하는 역할도 합니다. 심미적으로 걱정되시면 지르코니아 기성관도 상담 가능합니다."),
    ],
    "whitening": [
        ("미백 후 치아가 시리면 어떻게 하나요?", "일시적인 시림은 정상 반응이며, 보통 1~3일 내 사라집니다. 시림 방지 치약 사용이 도움되며, 시술 전 검진으로 시림 가능성을 미리 확인합니다."),
        ("자가 미백키트와 치과 미백의 차이는 뭔가요?", "시중 미백키트는 농도가 낮아 효과가 제한적입니다. 치과 전문 미백은 고농도 약제를 안전하게 사용하여 1~2회 시술로 확실한 효과를 볼 수 있습니다."),
        ("미백 후 음식 제한이 있나요?", "시술 후 48시간 동안 커피, 와인, 카레 등 색소가 진한 음식을 피하면 효과가 오래 유지됩니다. 이후에는 일상적인 식사가 가능합니다."),
    ],
    "wisdom-tooth": [
        ("사랑니 발치가 정말 아프나요? 겁이 나요.", "충분한 마취 후 진행하므로 발치 중에는 통증이 없습니다. 치과가 무서운 분은 수면 발치도 가능합니다. 발치 후 2~3일 정도 불편감이 있으나 처방 진통제로 관리됩니다."),
        ("사랑니 발치 후 회복 기간은 얼마나 되나요?", "일반적으로 3~7일이면 일상생활이 가능합니다. 매복된 사랑니의 경우 1~2주 정도 소요될 수 있으며, 실밥 제거는 보통 7~10일 후입니다."),
        ("사랑니 4개를 한 번에 빼도 되나요?", "가능하지만, 보통 한 쪽(좌우) 2개씩 나눠서 발치하는 것을 권합니다. 양쪽을 한꺼번에 발치하면 식사가 어렵기 때문입니다. 수면 발치 시 4개를 한 번에 하는 경우도 있습니다."),
    ],
    "aesthetic": [
        ("심미치료 후 자연스러워 보이나요? 티가 나지 않을까 걱정돼요.", "디지털 스마일 디자인(DSD)으로 시술 전 결과를 미리 확인할 수 있습니다. 환자의 얼굴형, 입술 라인, 피부톤에 맞춰 제작하므로 자연스러운 결과가 나옵니다."),
        ("심미치료 상담만 받아도 되나요? 바로 시술해야 하는 건 아니죠?", "물론입니다. 상담만 받으셔도 전혀 부담 없습니다. 여러 옵션을 설명드리고, 시뮬레이션을 보신 후 충분히 생각하시고 결정하시면 됩니다."),
    ],
    "bridge": [
        ("브릿지를 하면 양쪽 치아가 약해지나요?", "양쪽 치아를 일부 삭제하므로 원래 치아보다는 약해질 수 있습니다. 하지만 치아 상태가 건강하다면 브릿지로 10년 이상 잘 사용하는 분들이 많습니다. 상태에 따라 임플란트와 비교 상담도 도와드립니다."),
        ("브릿지 아래 음식물이 끼면 어떻게 관리하나요?", "치간칫솔이나 워터픽(구강세정기)으로 브릿지 아래를 매일 세척하는 것이 중요합니다. 올바른 관리법은 시술 후 상세히 안내드립니다."),
    ],
    "bruxism": [
        ("이갈이를 하는지 어떻게 알 수 있나요?", "본인은 모르는 경우가 많습니다. 아침에 턱이 뻐근하거나 두통이 있다면 의심해볼 수 있습니다. 치아 마모 패턴으로도 확인 가능하며, 검진 시 정확히 진단해 드립니다."),
        ("나이트가드가 불편하지 않나요?", "처음 1~2주 적응 기간이 필요하지만, 맞춤 제작이므로 시중 기성품보다 훨씬 편안합니다. 적응 후에는 오히려 없으면 잠이 안 온다는 분들이 많습니다."),
    ],
    "denture": [
        ("임플란트 틀니(오버덴처)는 일반 틀니와 뭐가 다른가요?", "임플란트 2~4개로 틀니를 고정하는 방식입니다. 일반 틀니보다 씹는 힘이 3~4배 강하고, 빠지는 불편이 없습니다. 전체 임플란트보다 비용이 절약됩니다."),
        ("틀니를 하면 맛을 느끼기 어려운가요?", "상악(위) 틀니는 입천장을 덮기 때문에 미각이 다소 줄어들 수 있습니다. 임플란트 틀니는 입천장을 덮지 않아 자연스러운 미각을 유지할 수 있습니다."),
    ],
    "emergency": [
        ("치아가 빠졌을 때 어떻게 해야 하나요?", "빠진 치아를 우유에 담거나 입안(볼 안쪽)에 넣어 보관하고, 30분 이내에 내원하면 재식 성공률이 높습니다. 치아를 물로 문지르거나 건조하게 보관하면 안 됩니다."),
        ("밤에 갑자기 이가 아프면 어떡하나요?", "서울비디치과는 평일 야간 20시까지 진료합니다. 응급 통증 시 전화(041-415-2892)로 먼저 연락 주시면 빠른 안내가 가능합니다. 진통제 복용 후 내원하셔도 됩니다."),
    ],
    "gum": [
        ("잇몸에서 피가 나면 양치를 하면 안 되나요?", "오히려 더 꼼꼼히 양치해야 합니다. 출혈은 잇몸 염증 때문이며, 양치를 안 하면 더 악화됩니다. 부드러운 칫솔로 잇몸 경계를 닦아주세요."),
        ("잇몸병은 유전인가요?", "유전적 요인이 일부 있지만, 관리 습관이 더 큰 영향을 줍니다. 가족 중 잇몸 질환 이력이 있다면 정기 검진을 더 자주 받으시는 것을 권합니다."),
    ],
    "gum-surgery": [
        ("잇몸수술 후 음식은 언제부터 먹을 수 있나요?", "수술 당일부터 미지근한 부드러운 음식(죽, 스프)은 가능합니다. 뜨겁거나 자극적인 음식은 1주일 정도 피하세요. 수술 부위 반대쪽으로 조심스럽게 식사하세요."),
        ("잇몸수술은 보험이 되나요?", "치주판막수술(치주소파술)은 건강보험 적용 대상입니다. 잇몸뼈이식 등 일부 시술은 비급여입니다. 검진 후 보험 적용 여부를 정확히 안내드립니다."),
    ],
    "inlay": [
        ("인레이와 크라운은 뭐가 다른가요?", "인레이는 충치 부분만 메우는 부분 수복이고, 크라운은 치아 전체를 덮는 전체 수복입니다. 남은 치아가 충분하면 인레이가 치아 삭제량이 적어 더 보존적입니다."),
        ("인레이를 하면 그 치아에 다시 충치가 생길 수 있나요?", "인레이와 치아 경계 부위에 2차 충치가 발생할 수 있습니다. 정기 검진과 올바른 양치 습관으로 예방할 수 있으며, 치실 사용도 중요합니다."),
    ],
    "periodontitis": [
        ("치주염 치료를 받으면 흔들리는 치아가 다시 단단해지나요?", "치주염으로 인한 잇몸뼈 손실은 완전히 복원되기 어렵습니다. 하지만 조기 치료로 진행을 멈추고, 재생 치료로 일부 회복이 가능합니다. 치아가 흔들린다면 최대한 빨리 내원하세요."),
        ("치주염인데 통증이 없으면 괜찮은 건가요?", "아닙니다. 치주염은 '침묵의 질환'으로 통증 없이 진행됩니다. 잇몸 출혈, 구취, 잇몸 내림 등이 초기 신호이며, 통증이 느껴질 때는 이미 상당히 진행된 상태입니다."),
    ],
    "prevention": [
        ("정기 검진은 얼마나 자주 받아야 하나요?", "일반적으로 6개월에 1회를 권장합니다. 잇몸 질환이 있거나 임플란트가 있는 분은 3~4개월마다 검진받으시면 좋습니다."),
        ("치실과 치간칫솔 중 뭘 써야 하나요?", "둘 다 사용하시는 것이 가장 좋습니다. 치아 사이가 좁으면 치실, 치아 사이가 넓거나 브릿지·임플란트가 있으면 치간칫솔이 효과적입니다."),
    ],
    "resin": [
        ("레진치료는 보험이 되나요?", "12세 이하 아동의 영구치 충치 레진 치료는 건강보험이 적용됩니다. 성인의 경우 대부분 비급여이나, 위치와 상황에 따라 다르므로 내원 시 확인해 드립니다."),
        ("레진으로 앞니 벌어진 것도 메울 수 있나요?", "가능합니다. 다이렉트 레진 본딩으로 벌어진 앞니를 자연스럽게 메울 수 있으며, 당일 1회 방문으로 완료됩니다. 라미네이트보다 치아 삭제가 적어 보존적입니다."),
    ],
    "tmj": [
        ("턱관절 치료는 어느 과에서 받아야 하나요?", "치과에서 전문적으로 진단·치료합니다. 턱관절장애의 주요 원인인 교합 문제, 이갈이, 근육 긴장 등을 종합적으로 평가하고 맞춤 치료를 제공합니다."),
        ("턱이 아프면 찜질을 해도 되나요?", "급성기(갑자기 아플 때)에는 냉찜질, 만성 통증에는 온찜질이 도움됩니다. 단, 2주 이상 지속되면 반드시 검진을 받으세요. 자가 치료로는 근본 원인을 해결하기 어렵습니다."),
    ],
    "apicoectomy": [
        ("치근단절제술은 일반 신경치료와 뭐가 다른가요?", "신경치료는 치아 윗부분(크라운)에서 접근하지만, 치근단절제술은 잇몸을 절개하여 뿌리 끝을 직접 제거합니다. 신경치료로 해결되지 않는 뿌리 끝 감염에 시행합니다."),
        ("치근단절제술 대신 임플란트를 하는 게 낫지 않나요?", "자연치아를 살릴 수 있다면 먼저 시도하는 것을 권합니다. 성공률이 85~95%로 높으며, 자연치아 보존이 장기적으로 더 유리합니다. 실패 시 임플란트로 전환할 수 있습니다."),
    ],
    "re-root-canal": [
        ("재신경치료가 처음보다 더 아프나요?", "충분한 마취 후 진행하므로 시술 중 통증은 거의 없습니다. 다만 기존 충전물을 제거하는 과정이 추가되어 시간이 더 걸릴 수 있습니다."),
        ("재신경치료 실패 시 바로 발치해야 하나요?", "치근단절제술(수술적 접근)이라는 추가 방법이 있습니다. 그래도 안 되면 발치 후 임플란트를 고려합니다. 단계적으로 자연치아 보존을 시도합니다."),
    ],
}

def get_max_faq_id(html):
    """기존 FAQ의 마지막 번호 찾기"""
    ids = re.findall(r'aria-controls="faq-(\d+)"', html)
    return max(int(i) for i in ids) if ids else 0

def make_faq_html(q, a, faq_id):
    """FAQ 아이템 HTML 생성"""
    return f'''          <div class="faq-item">
            <button class="faq-question" aria-expanded="false" aria-controls="faq-{faq_id}">
              <span class="faq-q-badge">Q</span>
              <span class="faq-q-text">{q}</span>
              <span class="faq-icon"><i class="fas fa-chevron-down"></i></span>
            </button>
            <div class="faq-answer" id="faq-{faq_id}" role="region"><p>{a}</p></div>
          </div>'''

def update_faq_schema(html, new_faqs):
    """FAQPage 구조화 데이터에 새 Q&A 추가"""
    # Find the FAQPage JSON-LD block
    pattern = r'(<script type="application/ld\+json">\s*\{[^}]*"@type":\s*"FAQPage"[^<]*"mainEntity":\s*\[)(.*?)(\]\s*\}\s*</script>)'
    match = re.search(pattern, html, re.DOTALL)
    if not match:
        print(f"    WARNING: FAQPage schema not found")
        return html
    
    existing = match.group(2).strip()
    new_entries = []
    for q, a in new_faqs:
        # HTML 태그 제거 for schema
        clean_a = re.sub(r'<[^>]+>', '', a)
        entry = json.dumps({
            "@type": "Question",
            "name": q,
            "acceptedAnswer": {
                "@type": "Answer",
                "text": clean_a
            }
        }, ensure_ascii=False, indent=6)
        new_entries.append(entry)
    
    # Combine existing + new
    separator = ",\n    " if existing.rstrip().endswith('}') else ""
    new_schema = existing + separator + ",\n    ".join(new_entries)
    
    return html[:match.start()] + match.group(1) + new_schema + match.group(3) + html[match.end():]

def add_faq_items(html, new_faqs, start_id):
    """faq-list의 </div> 닫는 태그 직전에 새 FAQ 삽입"""
    # Find the faq-list div and its closing tag
    faq_list_start = html.find('class="faq-list"')
    if faq_list_start == -1:
        print(f"    WARNING: faq-list not found")
        return html
    
    # Find the closing </div> of faq-list
    # Strategy: find all faq-item divs, then find the </div> that closes faq-list
    # The faq-list closing pattern is:    </div>\n      </div>\n    </section>
    # or more precisely: "        </div>\n      </div>\n    </section>"
    
    # Find the last faq-answer closing tag within the faq section
    search_start = faq_list_start
    last_faq_answer_end = -1
    
    # Find all faq-answer endings after faq-list
    pos = search_start
    while True:
        idx = html.find('</div>\n          </div>', pos)
        if idx == -1 or idx > html.find('</section>', faq_list_start):
            break
        last_faq_answer_end = idx + len('</div>\n          </div>')
        pos = idx + 1
    
    if last_faq_answer_end == -1:
        # Try alternative pattern (might have different whitespace)
        # Look for the closing of faq-list div: find matching </div>
        # More robust: find "</div>" that's followed by "</div>" then "</section>"
        section_end = html.find('</section>', faq_list_start)
        # Go backwards from section_end to find the faq-list closing
        # The pattern is: ...last-faq-item...</div>(faq-list)</div>(container)</section>
        chunk = html[faq_list_start:section_end]
        
        # Find the last occurrence of class="faq-item" block end
        last_item = chunk.rfind('</div>\n          </div>')
        if last_item != -1:
            last_faq_answer_end = faq_list_start + last_item + len('</div>\n          </div>')
        else:
            # Fallback: find </div>\n        </div> pattern (faq-list close)
            faq_list_close = chunk.rfind('</div>\n        </div>')
            if faq_list_close != -1:
                insert_at = faq_list_start + faq_list_close
                new_items = []
                for i, (q, a) in enumerate(new_faqs):
                    new_items.append(make_faq_html(q, a, start_id + i))
                insert_html = "\n" + "\n".join(new_items) + "\n"
                return html[:insert_at] + insert_html + html[insert_at:]
            
            print(f"    WARNING: Could not find FAQ insertion point")
            return html
    
    # Insert new FAQ items after the last existing FAQ item
    new_items = []
    for i, (q, a) in enumerate(new_faqs):
        new_items.append(make_faq_html(q, a, start_id + i))
    
    insert_html = "\n" + "\n".join(new_items)
    return html[:last_faq_answer_end] + insert_html + html[last_faq_answer_end:]

def process_file(filepath, faqs):
    with open(filepath, 'r', encoding='utf-8') as f:
        html = f.read()
    
    # Check if these FAQs already exist (prevent duplicates)
    first_q = faqs[0][0]
    if first_q in html:
        print(f"    SKIP: FAQ already exists ('{first_q[:30]}...')")
        return 0
    
    max_id = get_max_faq_id(html)
    start_id = max_id + 1
    
    # 1. Add HTML FAQ items
    html = add_faq_items(html, faqs, start_id)
    
    # 2. Update FAQPage schema
    html = update_faq_schema(html, faqs)
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(html)
    
    return len(faqs)

# 실행
os.chdir(os.path.dirname(os.path.abspath(__file__)))
total_added = 0
results = []
for page, faqs in sorted(NEW_FAQS.items()):
    filepath = f"treatments/{page}.html"
    if os.path.exists(filepath):
        print(f"Processing {page}...")
        count = process_file(filepath, faqs)
        total_added += count
        results.append(f"  {page}: +{count}개")
    else:
        results.append(f"  {page}: 파일 없음!")

print(f"\n{'='*50}")
print(f"✅ FAQ 추가 완료: {len(NEW_FAQS)}개 페이지, 총 +{total_added}개 FAQ")
for r in sorted(results):
    print(r)
