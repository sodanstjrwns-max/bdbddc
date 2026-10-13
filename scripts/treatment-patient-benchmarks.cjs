'use strict';

const { parse } = require('node-html-parser');

const BENCHMARKS = new Set(['glownate', 'implant-revision', 'implant', 'whitening', 'invisalign']);
const COMPACT = /<!-- treatment-choice-20261013:start -->[\s\S]*?<!-- treatment-choice-20261013:end -->/g;
const OWN_BLOCKS = /<!-- treatment-patient-(?:intro|provider):start -->[\s\S]*?<!-- treatment-patient-(?:intro|provider):end -->\s*/g;
const text = node => node.text.replace(/\s+/g, ' ').trim();
const escape = value => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

// Classify the original, visually rich sections. Patient decisions, risks and
// treatment steps stay ahead of the clinic's facilities, people and sales copy.
function zoneFor(node, slug) {
  const classes = node.classNames || '';
  const heading = node.querySelectorAll('h1,h2').map(text).join(' ');
  const content = text(node);
  if (node.tagName === 'STYLE') return 'style';
  if (node.tagName === 'SCRIPT') return 'script';
  if (node.nodeType !== 1) return 'comment';
  if (/cta-section|rv-closing/.test(classes) || /^(?:gn|iv)-mid-cta$|^mid-cta$/.test(node.id)) return 'closing';
  if (/col-deeplinks|rv-sources/.test(classes) || node.id === 'revision-sources') return 'related';
  if (/^환자 리뷰 확인$/.test(heading) || /천안치과 서울비디치과 더 알아보기/.test(content)) return 'related';
  if (/^종합 가이드|^이전|^다음|^\*본 정보/.test(content) || /^더 읽어보기:/.test(content)) return 'related';
  if (node.id === 'implant-youtube-channel') return 'related';
  if (node.id === 'patient-decision-guide' || node.id === 'regret-banner' || /faq-inline-section/.test(classes)) return 'patient';
  if (node.id === 'treatmentTimeline' || node.id === 'inside-out') return 'patient';
  if (node.id === 'treatment-price' || /gn-tldr|gn-cinema-banner|ed-mag/.test(classes)) return 'proof';
  if (/treatment-page-hero/.test(classes) || ['gnScrubHero', 'imScrubHero', 'ivScrubHero'].includes(node.id)) return 'proof';
  if (classes.split(' ').includes('gn-hero')) return 'proof';
  if (/tx-inline-vid/.test(classes)) return 'proof';

  if (slug === 'glownate' && (
    /글로우네이트는 그 불안|글로우네이트 제작 현장|글로우네이트 라인업|글로우네이트 수명|일반 라미네이트 vs|글로우네이트가 만드는|지역별 라미네이트|천안·아산 라미네이트/.test(heading)
    || node.id === 'gn-static-cases' || node.id === 'gn-lifespan'
    || /실제 시술하신 38분/.test(content) || /그래서, 어떤 느낌으로/.test(heading)
  )) return 'proof';
  if (slug === 'implant' && (/임플란트, 어디서 하느냐|서울비디치과 임플란트 종류|서울비디치과가 선택한|임플란트 치료 전후 사례/.test(heading) || node.id === 'fixtures')) return 'proof';
  if (slug === 'whitening' && /왜 서울비디치과|전문가 미백 2종|치아미백 비용 안내|왜 4\.9만원/.test(heading)) return 'proof';
  if (slug === 'invisalign' && /서울비디치과 교정 프로그램|서울비디 교정센터가 특별한 이유|인비절라인 담당 원장/.test(heading)) return 'proof';
  return 'patient';
}

// Short empathy rows used to jump straight from a fear to a product pitch.
// Replace only these answers; keep the patient's words and the surrounding design.
const CONCERN_ANSWERS = {
  implant: [
    '어떤 순간이 무서운지 말하고, 마취·진정의 적합성과 남는 부담을 확인하세요.',
    '뼈의 양과 위치를 확인한 뒤, 추가 치료의 필요성과 다른 선택지를 비교하세요.',
    '수술 날짜만이 아니라, 경과 확인과 불편할 때 방문할 일정도 함께 맞춰 보세요.',
    '검사·뼈이식·임시 치아·최종 보철 중 견적에 포함된 범위를 나눠 확인하세요.',
    '바로 다시 심기보다, 무엇이 불편한지와 기존 임플란트를 유지할 수 있는지 먼저 확인하세요.',
    '한 번의 수술 시간과 전체 회복 기간을 나누어 듣고, 생활에 맞는 계획을 상의하세요.'
  ],
  whitening: [
    '원하는 색 변화에 앞서, 현재 치아와 잇몸이 미백을 받기에 적합한지 확인하세요.',
    '평소 시렸던 부위부터 말하고, 불편할 때 멈추거나 조절할 기준을 확인하세요.',
    '원하는 밝기와 유지 부담을 함께 비교하고, 재착색됐을 때의 관리 계획도 물어보세요.'
  ],
  invisalign: [
    '눈에 띄는 정도뿐 아니라 착용 시간·부착물·식사 때 관리까지 함께 비교하세요.',
    '진단·추가 장치·유지장치가 어디까지 포함되는지와 계획 변경 시 비용을 확인하세요.',
    '예상 기간의 근거와 길어질 수 있는 조건을 물어보세요. 빠르다는 말만으로 결정하지 않아도 됩니다.',
    '발치 여부를 먼저 정하기보다, 필요한 이동 공간과 얼굴·물림에 미치는 영향을 설명받으세요.',
    '나이만으로 판단하지 않고 현재 잇몸·치아 상태와 이동 범위를 함께 살펴보세요.'
  ]
};

function softenConcernRows(dom, slug) {
  const answers = CONCERN_ANSWERS[slug];
  if (!answers) return;
  const rows = dom.querySelectorAll('.concern-item-row');
  rows.forEach((row, index) => {
    if (!answers[index]) return;
    const solution = row.querySelector('.solution-text');
    if (solution) solution.set_content(escape(answers[index]));
    row.querySelectorAll('.problem-icon .fa-times-circle').forEach(icon => {
      icon.setAttribute('class', icon.getAttribute('class').replace('fa-times-circle', 'fa-comment-dots'));
    });
  });
}

function replaceTextOutsideStructuredContent(dom, before, after) {
  function visit(node) {
    if (node.nodeType === 1 && (['SCRIPT', 'STYLE'].includes(node.tagName) || /faq-inline-section/.test(node.classNames || ''))) return;
    if (node.nodeType === 3) {
      const old = node.rawText;
      if (old.includes(before)) node.rawText = old.split(before).join(after);
      return;
    }
    node.childNodes?.forEach(visit);
  }
  visit(dom);
}


// Patient explanations checked against the primary sources below. Institutional
// overseas preparation times are not reused as this clinic's instructions.
const CLINICAL_SOURCES = {
  implant: [['King’s College Hospital: Intravenous sedation (2025)', 'https://www.kch.nhs.uk/wp-content/uploads/2023/01/0277-IV-sedation-CSCD-2025-v4_FINAL.pdf']],
  whitening: [['NHS: Teeth whitening (2025)', 'https://www.nhs.uk/tests-and-treatments/teeth-whitening/']],
  invisalign: [['British Orthodontic Society: Retainers', 'https://bos.org.uk/patients/retainers/'], ['British Orthodontic Society: Aligners (2024)', 'https://bos.org.uk/wp-content/uploads/2024/01/Aligners-version-2024.pdf']]
};
const FAQ_CORRECTIONS = {
  implant: {
    '임플란트 수술이 아프나요?': '수술 중 통증 조절을 위해 국소마취를 사용합니다. 불안이 크다면 건강 상태와 치료 범위에 따라 의식하진정을 함께 검토할 수 있습니다. 진정은 전신마취와 달리 의료진의 말에 반응할 수 있는 상태를 목표로 하며, 느끼는 불안과 기억의 정도에는 차이가 있습니다. 무통이나 기억 소실을 보장하는 치료는 아니므로, 걱정되는 순간과 불편을 알릴 방법을 미리 상의하세요.',
    '임플란트 시술 시 통증이 심한가요?': '통증은 국소마취로 조절하며, 의식하진정을 병행하더라도 국소마취는 별도로 필요합니다. 진정 중에도 말에 반응할 수 있고 경험과 기억은 사람마다 다릅니다. 통증이나 불안을 참아야 한다고 생각하지 말고, 치료 전부터 신호와 조절 방법을 정해 두세요. 수술 뒤의 통증·붓기와 회복은 치료 범위와 상태에 따라 달라집니다.',
    '임플란트 수술 당일 운전하고 귀가해도 되나요?': '의식하진정을 받는 날에는 직접 운전하지 않고, 귀가와 회복을 도와줄 성인 보호자를 준비해야 합니다. 겉으로 정신이 맑아 보여도 판단과 움직임에 약물의 영향이 남을 수 있습니다. 운전·업무·중요한 결정의 제한 시간은 진료팀이 준 회복 지침을 따르세요. 국소마취만 받는 경우에도 복용한 약과 몸 상태를 포함해 귀가 방법을 확인하세요.'
  },
  whitening: {
    '미백이 치아에 해롭나요?': '미백 전에는 치아와 잇몸이 건강한지, 현재 시림이나 충치가 있는지 확인해야 합니다. 치과에서 시행해도 일시적인 시림이나 잇몸·목의 자극이 생길 수 있어, 모든 사람에게 아무 영향이 없다고 말할 수는 없습니다. 원래 시렸던 부위와 사용 중인 미백 제품을 알리고, 불편이 생겼을 때 조절하거나 중단할 기준을 상담하세요.',
    '미백은 치아에 해롭지 않나요?': '치과에서 치아·잇몸 상태를 확인하고 적절한 방법을 선택하더라도 시림과 잇몸 자극 같은 부작용은 생길 수 있습니다. 강한 농도나 잦은 사용이 무조건 더 좋은 결과를 뜻하지는 않습니다. 미백 제품을 임의로 추가하거나 사용 시간을 늘리지 말고, 현재 상태와 반응에 맞는 안내를 받으세요.',
    '미백 후 치아가 시리면 어떻게 하나요?': '미백 뒤 일시적인 시림이 나타날 수 있지만, 모든 통증을 정상 반응으로 여기고 참을 필요는 없습니다. 불편이 심하거나 계속되면 추가 미백을 진행하기 전에 치과에 알리세요. 원래의 시림이나 충치·잇몸 문제 여부와 사용한 제품·시간을 함께 확인받는 것이 좋습니다.',
    '미백 시 시린 증상이 있나요?': '미백 과정에서 치아가 시리거나 잇몸에 자극이 생길 수 있습니다. 정도와 지속 기간은 다를 수 있으므로, 원래 시린 부위가 있다면 미리 알려주세요. 불편이 심하거나 이어지면 치료팀에 알리고 다음 미백을 진행할지와 방법을 다시 확인하세요.',
    '자가 미백키트와 치과 미백의 차이는 뭔가요?': '치과에서는 먼저 치아와 잇몸 상태를 확인하고, 치과에서 받는 미백 또는 처방받아 집에서 사용하는 방법을 안내할 수 있습니다. 제품과 방식에 따라 농도·사용 시간·관리 방법이 다르며, 변화의 정도도 개인차가 있습니다. 고농도 제품이나 적은 횟수가 원하는 결과를 보장하는 것은 아닙니다.'
  },
  invisalign: {
    '인비절라인 착용 시 불편하지 않나요?': '새 장치를 끼우면 치아에 압박감이나 뻐근함이 생길 수 있고, 잇몸에 장치가 닿는 불편도 있을 수 있습니다. 적응 속도와 불편의 정도는 사람마다 다릅니다. 다른 장치보다 항상 편안하다고 단정하기보다, 통증이 지속되거나 장치가 맞지 않을 때 연락할 방법을 확인하세요.',
    '인비절라인 착용 시 통증이 있나요?': '새 장치가 치아를 움직이면서 일시적인 압박감이나 뻐근함이 생길 수 있습니다. 통증이 거의 없거나 며칠 안에 반드시 적응한다고 보장할 수는 없습니다. 불편이 심하거나 계속되거나 잇몸을 반복해서 찌른다면 장치를 임의로 바꾸기 전에 진료팀에 상태를 알려주세요.',
    '교정 중 말할 때 발음이 어색하지 않나요?': '처음 투명장치를 착용할 때 발음이 달라졌다고 느낄 수 있으며, 입이 장치에 적응하는 데 시간이 필요할 수 있습니다. 적응 기간에는 개인차가 있으므로 중요한 발표나 대화 일정이 있다면 시작 시점과 적응 부담을 미리 상의하세요. 불편이 계속되면 장치의 적합도도 확인받으세요.',
    '교정 후 다시 틀어질 수 있나요?': '교정한 치아는 이전 위치로 돌아가려는 경향이 있고, 나이가 들면서 배열이 달라질 수도 있습니다. 유지장치를 장기간 지침대로 사용하는 것은 이런 변화와 재발 위험을 줄이는 데 도움이 되지만 완전한 방지를 보장하지는 않습니다. 장치가 헐겁거나 맞지 않거나 고정식 장치가 떨어졌다면, 그냥 두거나 억지로 끼우지 말고 진료팀에 확인하세요.'
  }
};

function correctVisibleFaq(dom, slug) {
  const corrections = FAQ_CORRECTIONS[slug];
  if (!corrections) return;
  for (const item of dom.querySelectorAll('.faq-item')) {
    const question = item.querySelector('.faq-q-text');
    const answer = item.querySelector('.faq-answer');
    const replacement = question && corrections[text(question)];
    if (answer && replacement) answer.set_content(`<p>${escape(replacement)}</p>`);
  }
  dom.querySelectorAll('[data-patient-clinical-sources]').forEach(node => node.remove());
  const faq = dom.querySelector('.faq-inline-section');
  if (faq) {
    faq.insertAdjacentHTML('beforeend', `<div class="container" data-patient-clinical-sources="20261013"><p>이 질문의 설명에 참고한 자료</p><ul>${CLINICAL_SOURCES[slug].map(([name, url]) => `<li><a href="${escape(url)}" target="_blank" rel="noopener noreferrer">${escape(name)}</a></li>`).join('')}</ul><p>일반적인 안내이며, 개인의 치료·회복 지침은 진료팀과 확인하세요.</p></div>`);
  }
}

function synchronizeCorrectedFaqSchema(html, slug) {
  const visible = parse(html);
  const answers = new Map(visible.querySelectorAll('.faq-item').map(item => [item.querySelector('.faq-q-text'), item.querySelector('.faq-answer')]).filter(([q, a]) => q && a).map(([q, a]) => [text(q), text(a)]));
  if (!answers.size) return html;
  return html.replace(/(<script\b[^>]*type=["']application\/ld\+json["'][^>]*>)([\s\S]*?)(<\/script>)/gi, (all, open, content, close) => {
    let schema;
    try { schema = JSON.parse(content); } catch { return all; }
    let changed = false;
    function visit(value) {
      if (!value || typeof value !== 'object') return;
      if (value['@type'] === 'FAQPage') {
        const entities = [...answers].map(([name, answer]) => ({ '@type': 'Question', name, acceptedAnswer: { '@type': 'Answer', text: answer } }));
        if (JSON.stringify(value.mainEntity) !== JSON.stringify(entities)) { value.mainEntity = entities; changed = true; }
        return;
      }
      if (value['@type'] === 'Question' && answers.has(value.name) && value.acceptedAnswer?.text !== answers.get(value.name)) {
        value.acceptedAnswer = { ...value.acceptedAnswer, '@type': 'Answer', text: answers.get(value.name) };
        changed = true;
      }
      Object.values(value).forEach(v => { if (Array.isArray(v)) v.forEach(visit); else visit(v); });
    }
    visit(schema);
    return changed ? `${open}${JSON.stringify(schema).replace(/</g, '\\u003c')}${close}` : all;
  });
}

function findSection(dom, pattern) {
  return dom.querySelectorAll('section').find(node => pattern.test(node.querySelector('h2')?.text.replace(/\s+/g, ' ').trim() || ''));
}
function findHeadingParent(dom, pattern, container) {
  const heading = dom.querySelectorAll('h2,h3,h4').find(node => pattern.test(text(node)));
  return heading && (container ? heading.closest(container) : heading.parentNode);
}
function addPatientAnchorAliases(dom, slug) {
  const targets = {
    'implant-revision': {
      'tg-benefits': dom.querySelector('#inside-out-benefits'),
      'tg-limits': dom.querySelector('#inside-out-limits'),
      'tg-care': dom.querySelector('#inside-out-care'),
      'tg-questions': dom.querySelector('#revision-questions')
    },
    glownate: {
      'tg-benefits': findSection(dom, /앞니를 바꾸는 방법은 네 가지/),
      'tg-limits': dom.querySelector('#gn-stop'),
      'tg-care': findSection(dom, /시술 전·후 관리/),
      'tg-questions': dom.querySelector('.faq-inline-section')
    },
    implant: {
      'tg-benefits': findHeadingParent(dom, /내 치아를 살릴 수 있는지부터/),
      'tg-limits': findHeadingParent(dom, /뼈이식이나 당일 식립이 모두/),
      'tg-care': dom.querySelector('section[aria-label="임플란트 평생 쓰는 비결 영상"]'),
      'tg-questions': dom.querySelector('.faq-inline-section')
    },
    whitening: {
      'tg-benefits': findSection(dom, /소프트 vs 하드 블리칭 비교/),
      'tg-limits': findSection(dom, /어떤 분께 추천되나요/),
      'tg-care': findSection(dom, /시술 전·후 관리/),
      'tg-questions': dom.querySelector('.faq-inline-section')
    },
    invisalign: {
      'tg-benefits': findHeadingParent(dom, /투명교정과 장치교정 중 무엇이 맞나요/),
      'tg-limits': findHeadingParent(dom, /치료 기간과 장치 착용은 어떻게/),
      'tg-care': findHeadingParent(dom, /교정 완료.*유지장치/, '.tl-step'),
      'tg-questions': dom.querySelector('.faq-inline-section')
    }
  }[slug];
  for (const [id, target] of Object.entries(targets)) {
    if (dom.querySelector(`[id="${id}"]`)) continue;
    if (!target) throw new Error(`${slug}: existing patient section for ${id} missing`);
    target.insertAdjacentHTML('afterbegin', `<span class="tg-anchor-target" id="${id}" aria-hidden="true"></span>`);
  }
}


function removeUnverifiedPatientAttributions(dom, slug) {
  if (slug === 'whitening') {
    for (const row of dom.querySelectorAll('tr')) {
      const cells = row.querySelectorAll('td');
      if (cells.length === 3 && /대표적인 환자 코멘트|선택 전에 확인할 점/.test(text(cells[0]))) {
        cells[0].set_content('선택 전에 확인할 점');
        cells[1].set_content('처음 받는 미백이라면<br>시림 이력과 원하는 변화부터 확인');
        cells[2].set_content('중요한 일정이 있다면<br>치료 간격과 회복 여유를 확인');
      }
    }
  }
  if (slug === 'glownate') {
    const concerns = dom.querySelector('#gn-story');
    const subtitle = concerns?.querySelector('.section-subtitle');
    if (subtitle) subtitle.set_content('마음에 걸리는 상황을 먼저 찾아보세요. 같은 고민에도 치료 선택은 달라질 수 있습니다.');
    concerns?.querySelectorAll('.gn-mirror-n').forEach(node => node.remove());
    if (concerns) replaceTextOutsideStructuredContent(concerns, ' 가장 많은 이유입니다.', '');
    const styles = dom.querySelector('.gn-style-grid')?.closest('section');
    if (styles) {
      styles.querySelector('.section-subtitle')?.set_content('「하얗게」는 한 가지가 아닙니다. 주변 치아와의 조화, 밝기와 투명도 중 무엇이 중요한지 생각해 보세요.');
      styles.querySelectorAll('.gn-style-count').forEach(node => node.remove());
      const badge = styles.querySelector('.gn-style-badge');
      if (badge) badge.set_content('주변 치아와의 조화');
      const natural = styles.querySelector('.gn-style-body p');
      if (natural) natural.set_content('주변 치아와 자연스럽게 어울리는 톤을 원한다면, 밝기뿐 아니라 투명도와 형태도 함께 비교해 보세요.');
    }
    const cases = dom.querySelector('#gn-static-cases');
    if (cases) {
      cases.querySelector('.section-subtitle')?.set_content('비슷한 고민과 연결되는 진료 기록을 상황별로 살펴볼 수 있습니다. 개인의 상태와 치료 계획은 다를 수 있습니다.');
      cases.querySelectorAll('.gn-case-docstat').forEach(node => node.remove());
      replaceTextOutsideStructuredContent(cases, '글로우네이트 전체 38건 보기', '글로우네이트 관련 진료 기록 보기');
    }
  }
  if (slug === 'invisalign') {
    const cta = dom.querySelector('#iv-mid-cta');
    cta?.querySelector('h2')?.set_content('교정이 필요한 범위와<br>생활 부담부터 확인해 보세요');
    cta?.querySelector('p')?.set_content('검사 자료와 디지털 계획을 보며 가능한 이동과 한계, 내원·유지 계획을 상담하세요.');
  }
}

function refineOriginalNarrative(dom, slug) {
  softenConcernRows(dom, slug);
  removeUnverifiedPatientAttributions(dom, slug);
  const replacements = [
    ['수술 공포증 완전 해결', '치료 불안 완화를 위한 진정 상담'],
    ['통증 없는 수술 경험', '국소마취와 진정의 역할을 나누어 설명'],
    ['수술실 진입 전 완벽한 감염차단', '수술 환경의 위생을 위한 관리 절차'],
    ['수면 상태에서 편안하게 수술받으세요. 치과 공포증 환자분들께 특히 추천드립니다.', '치료 불안이 크다면 의식하진정의 적용 가능성을 상담하세요. 국소마취는 별도로 필요하며, 반응과 기억에는 개인차가 있습니다.'],
    ['치과 공포증, 다수 식립, 고령 환자', '건강 상태와 치료 범위를 확인한 뒤 개별 상담'],
    ['각 단계를 미리 알면 두려움이 사라집니다', '각 단계에서 무엇을 하는지 알면, 걱정되는 점을 구체적으로 물어볼 수 있습니다'],
    ['완벽한 감염관리', '감염관리를 위한 수술 환경'],
    ['서울대학교 치과병원과 동일한 수준의 수술 환경.', '수술 환경과 감염관리 절차를 살펴보세요.'],
    ['평균 효과 지속 기간을 1.5배 늘리는 핵심 수칙', '시림과 재착색을 살피며 이어가는 관리 수칙'],
    ['교정은 언제 시작하든 1~2년. 고민한 시간만큼 완성도 늦어집니다', '시작을 서두르기보다, 내 생활에서 유지할 수 있는 계획인지 살펴보세요'],
    ['치아가 움직이기 시작했다는 좋은 신호입니다!', '불편이 심하거나 이어지면 담당 의료진에게 알려주세요.'],
    ['아래 항목 중 두 개 이상이면 라미네이트 상담을 받아보실 단계입니다', '해당하는 항목의 개수보다, 무엇이 불편한지와 그 원인을 확인하는 것이 먼저입니다'],
    ['두 개 이상 해당되셨다면 — 다음은 대부분 이 질문으로 이어집니다.', '해당하는 고민이 있다면, 다음 질문도 함께 확인해 보세요.'],
    ['연간 150건 이상을 처리하는 다이아몬드 프로바이더 등급으로, 전 세계 인비절라인 닥터 상위 1%에 해당합니다.', '프로바이더 등급과 별개로, 본인의 치아 이동과 유지 계획을 구체적으로 설명받으세요.'],
    ['무제한 장치 교체(5년 보장)로 완벽한 결과를 추구합니다.', '추가 장치 지원 범위와 적용 조건을 확인하고, 예상 결과와 한계를 함께 비교하세요.'],
    ['형태와 색상을 동시에 완벽하게 개선합니다.', '형태와 색상에서 원하는 변화와 가능한 범위를 함께 살펴봅니다.']
  ];
  for (const [before, after] of replacements) replaceTextOutsideStructuredContent(dom, before, after);

  // Price and credentials remain available later, but the former headline is
  // no longer a promise of universal eligibility or guaranteed results.
  const formerHeading = dom.querySelector('h1') || dom.querySelector('[data-patient-former-h1]');
  if (formerHeading && slug === 'whitening') formerHeading.set_content('치아미백, 적용 범위와 진료 안내');
  if (formerHeading && slug === 'glownate') formerHeading.set_content('글로우네이트의 제작 방식과 진료 안내');
  if (slug === 'whitening') replaceTextOutsideStructuredContent(dom, '누구나 쉽게 · 30분이면 충분', '미백 전 진단 · 상태에 맞는 선택');
}

/**
 * Reuse five existing rich pages without letting clinic promotion lead the story.
 * The caller supplies its normal patient introduction and late provider section.
 * No files are read or written here, and existing head/schema/media are retained.
 */
function reorderPatientSections(html, slug, profile, patientHeroHtml, providerHtml) {
  if (!BENCHMARKS.has(slug)) return html;
  if (!patientHeroHtml || !providerHtml) throw new Error(`${slug}: patient intro and provider HTML are required`);
  const mainMatch = html.match(/(<main\b[^>]*>)([\s\S]*?)(<\/main>)/i);
  if (!mainMatch) throw new Error(`${slug}: main missing`);
  let inner = mainMatch[2].replace(OWN_BLOCKS, '');
  const compact = [];
  inner = inner.replace(COMPACT, block => { compact.push(block); return ''; });
  const dom = parse(inner, { comment: true });
  refineOriginalNarrative(dom, slug);
  correctVisibleFaq(dom, slug);
  addPatientAnchorAliases(dom, slug);
  for (const heading of dom.querySelectorAll('h1')) {
    heading.tagName = 'h2';
    heading.setAttribute('data-patient-former-h1', 'true');
    heading.classList.add('tg-legacy-title');
  }
  const buckets = { style: [], patient: [], proof: [], related: [], closing: [], script: [], comment: [] };
  const elements = dom.childNodes.filter(node => node.nodeType === 1);
  const previousOrders = elements.map(node => Number(node.getAttribute('data-patient-original-order'))).filter(Number.isFinite);
  let nextOrder = Math.max(-1, ...previousOrders) + 1;
  for (const node of dom.childNodes) {
    if (node.nodeType === 3 && !node.rawText.trim()) continue;
    if (node.nodeType !== 1) { buckets.comment.push(node.toString()); continue; }
    const zone = node.getAttribute('data-patient-zone') || zoneFor(node, slug);
    if (!Object.hasOwn(buckets, zone)) throw new Error(`${slug}: unknown patient zone ${zone}`);
    let order = node.getAttribute('data-patient-original-order');
    if (order === undefined) { order = String(nextOrder++); node.setAttribute('data-patient-original-order', order); }
    node.setAttribute('data-patient-zone', zone);
    if (zone === 'proof') node.classList.add('tg-late-showcase');
    buckets[zone].push({ order: Number(order), html: node.toString() });
  }
  const render = zone => buckets[zone].sort((a, b) => a.order - b.order).map(x => x.html).join('\n');
  const intro = `<!-- treatment-patient-intro:start -->${patientHeroHtml}<!-- treatment-patient-intro:end -->`;
  const provider = `<!-- treatment-patient-provider:start -->${providerHtml}<!-- treatment-patient-provider:end -->`;
  const body = [render('style'), intro, render('patient'), compact.join('\n'), provider, render('proof'), render('related'), render('closing'), render('script'), buckets.comment.join('\n')].filter(Boolean).join('\n');
  let mainOpen = mainMatch[1].replace(/\sdata-patient-narrative=(?:"[^"]*"|'[^']*')/g, '');
  mainOpen = mainOpen.replace(/>$/, ' data-patient-narrative="20261013">');
  const output = synchronizeCorrectedFaqSchema(html.replace(mainMatch[0], `${mainOpen}\n${body}\n${mainMatch[3]}`), slug);
  const checked = parse(output);
  if (checked.querySelectorAll('main h1').length !== 1) throw new Error(`${slug}: expected one patient H1`);
  return output;
}

module.exports = { reorderPatientSections };
