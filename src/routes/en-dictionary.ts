// ============================================================
// /en/dictionary — English Dental Dictionary (v5.39)
//
// 목적: 영어권 환자(Camp Humphreys 미군기지·주재원·유학생)의
//       "증상·질환 인지 단계" 검색을 잡아 /en/ 랜딩으로 흘려보내는
//       퍼널 최상단 유입구.
//
// 설계 원칙 (사용자 확정 사항)
//  1) 🅐 증상·질환·해부 용어만 — 시술/비용 키워드는 기존 /en/implant,
//     /en/invisalign, /en/laminate, /en/pricing 랜딩이 이미 커버하므로
//     자기잠식(keyword cannibalization)을 피한다.
//  2) URL은 /en/dictionary/<slug>  (각 용어가 자기 URL을 갖는다)
//  3) 가격은 본문에 쓰지 않고 /en/pricing 으로 링크만 — 사전 페이지의
//     성격을 "정보"로 유지하고 가격 정보는 단일 소스에 둔다.
//  4) 번역이 아니라 영문 네이티브 원고 — 한국 치과를 처음 겪는
//     영어권 환자의 맥락(보험 미적용, 통역, 기지에서의 거리 등)을 반영.
//  5) 한국어 원본 백과사전과 hreflang 양방향 연결.
// ============================================================

import type { Hono } from 'hono'

export type EnTerm = {
  slug: string          // /en/dictionary/<slug>
  h1: string            // 영문 표제
  ko: string            // 한국어 백과사전 term (hreflang 상대)
  aka?: string[]        // 동의어 (검색 커버리지)
  cat: EnCat            // 분류
  tldr: string          // 최상단 즉답 (AEO)
  body: string          // 본문 HTML
  faqs: { q: string; a: string }[]
}

export type EnCat =
  | 'Gum & Periodontal'
  | 'Tooth Decay & Pulp'
  | 'Cracks & Trauma'
  | 'Wisdom & Eruption'
  | 'Bite & Jaw'
  | 'Mouth & Tongue'
  | 'Tooth Anatomy'

// ── 공통 스타일 (한글 백과사전과 동일 톤: #6B4226 / #c9a96e) ──
const TH = 'border:1px solid #e0d4c0;padding:8px 10px;background:#f5f0eb;color:#6B4226;font-size:0.83rem;text-align:left;'
const TD = 'border:1px solid #e0d4c0;padding:8px 10px;font-size:0.88rem;'
const TDC = TD + 'text-align:center;'
const BOX = 'background:#faf7f3;border-left:4px solid #c9a96e;padding:14px 18px;border-radius:0 12px 12px 0;margin:16px 0;'
const WARN = 'background:#fff8ec;border:1px solid #ecd9b4;border-radius:12px;padding:14px 18px;margin:16px 0;'
const TBL = 'width:100%;border-collapse:collapse;margin:14px 0;'

// 내부 링크 헬퍼
/** 같은 영문 사전 내 다른 용어로 링크 */
const D = (slug: string, label: string) =>
  `<a href="/en/dictionary/${slug}" style="color:#6B4226;text-decoration:underline;text-decoration-style:dotted;font-weight:600;">${label}</a>`
/** 기존 영문 랜딩/가격 페이지로 링크 (전환 경로) */
const L = (path: string, label: string) =>
  `<a href="${path}" style="color:#6B4226;text-decoration:underline;font-weight:600;">${label}</a>`

export const EN_TERMS: EnTerm[] = []

// ════════════════════════════════════════════════════════════
// GROUP 1 — Gum & Periodontal
// ════════════════════════════════════════════════════════════

EN_TERMS.push({
  slug: 'gingivitis',
  h1: 'Gingivitis',
  ko: '치은염',
  aka: ['gum inflammation', 'bleeding gums', 'swollen gums'],
  cat: 'Gum & Periodontal',
  tldr: 'Gingivitis is inflammation of the gums caused by plaque bacteria. It is the only stage of gum disease that is fully reversible — once it progresses to periodontitis, the bone loss is permanent. If your gums bleed when you brush, that is gingivitis, not "hard brushing".',
  body: `
<h3>What gingivitis actually is</h3>
<p><strong>Gingivitis</strong> is inflammation limited to the <em>gum tissue only</em>. Plaque — a soft bacterial film — builds up along the gumline within 24 hours of brushing. Your immune system reacts to those bacteria, and the reaction is what you see: redness, puffiness, and bleeding.</p>
<p>The single most important fact about gingivitis is this: <strong>it is the last completely reversible stage of gum disease.</strong> The gums are inflamed, but the bone holding your teeth is still intact. Treat it now and you lose nothing. Let it progress to ${D('periodontitis', 'periodontitis')} and the destroyed bone does not grow back.</p>

<h3>Gingivitis vs. periodontitis — the line that matters</h3>
<table style="${TBL}">
<tr><th style="${TH}"></th><th style="${TH}">Gingivitis</th><th style="${TH}">Periodontitis</th></tr>
<tr><td style="${TD}"><strong>Tissue affected</strong></td><td style="${TD}">Gums only</td><td style="${TD}">Gums + bone + ${D('periodontal-ligament', 'ligament')}</td></tr>
<tr><td style="${TD}"><strong>Bone loss</strong></td><td style="${TDC}">None</td><td style="${TDC}">Yes, permanent</td></tr>
<tr><td style="${TD}"><strong>Reversible?</strong></td><td style="${TDC}"><strong>Fully</strong></td><td style="${TDC}">Manageable, not reversible</td></tr>
<tr><td style="${TD}"><strong>Tooth mobility</strong></td><td style="${TD}">No</td><td style="${TD}">Possible in later stages</td></tr>
<tr><td style="${TD}"><strong>Typical treatment</strong></td><td style="${TD}">Professional cleaning + technique correction</td><td style="${TD}">Deep cleaning, sometimes surgery</td></tr>
</table>

<h3>Signs people wrongly dismiss</h3>
<ul>
<li><strong>Bleeding when brushing or flossing.</strong> Healthy gums do not bleed. "I brushed too hard" is the most expensive misunderstanding in dentistry.</li>
<li><strong>Gums that look shiny, puffy, or darker red</strong> instead of firm and pale pink.</li>
<li><strong>Bad breath that returns quickly</strong> after brushing — see ${D('halitosis', 'halitosis')}.</li>
<li><strong>Tenderness only in one area</strong> — often where floss never reaches.</li>
</ul>
<div style="${BOX}"><strong>Important:</strong> gingivitis is usually <em>painless</em>. Patients routinely arrive with advanced gum disease saying "but it never hurt". Absence of pain is not absence of disease — bleeding is the earlier and more reliable signal.</div>

<h3>Why it happens even to people who brush</h3>
<p>Brushing removes plaque from the flat surfaces you can see. Gingivitis starts in the places a brush cannot reach: between teeth, and in the tiny groove where gum meets tooth. Three specific patterns cause most cases we see:</p>
<ul>
<li><strong>No interdental cleaning.</strong> Floss or interdental brushes are not optional extras; they clean roughly a third of each tooth's surface.</li>
<li><strong>Brushing the teeth but not the gumline.</strong> Angle the bristles about 45° into the gumline rather than scrubbing straight across.</li>
<li><strong>Hardened plaque.</strong> Once plaque mineralises into ${D('dental-calculus', 'calculus (tartar)')}, no amount of home brushing removes it. It has to be scaled off professionally.</li>
</ul>

<h3>Treatment: simpler than patients expect</h3>
<p>Uncomplicated gingivitis is treated by removing the plaque and calculus, then fixing the technique gap that let it accumulate. Most cases resolve within one to two weeks of proper home care after a professional cleaning. There is no surgery and no drilling involved.</p>
<div style="${WARN}"><strong>For patients coming from overseas:</strong> in Korea, a routine scaling is one of the most commonly performed dental procedures and is a short appointment. Note that Korean National Health Insurance coverage applies to residents enrolled in the system; visitors and most SOFA-status patients are treated as non-covered. See ${L('/en/pricing', 'our English price list')} for current non-covered fees — we publish them rather than quoting on the day.</div>

<h3>Special situations</h3>
<ul>
<li><strong>Pregnancy.</strong> Hormonal changes amplify the gum response to the same amount of plaque — see ${D('pregnancy-gingivitis', 'pregnancy gingivitis')}.</li>
<li><strong>Diabetes.</strong> Blood sugar control and gum inflammation influence each other in both directions.</li>
<li><strong>Smoking.</strong> Smokers bleed <em>less</em> because nicotine constricts blood vessels, which masks the main warning sign and lets disease advance silently.</li>
<li><strong>Orthodontic appliances.</strong> Brackets and wires create dozens of new plaque traps; gingivitis around brackets is extremely common and needs specific cleaning tools.</li>
</ul>
`,
  faqs: [
    { q: 'Is gingivitis reversible?', a: 'Yes — completely, and it is the only stage of gum disease that is. The inflammation is confined to gum tissue, with no bone loss yet. After professional removal of plaque and calculus plus corrected home cleaning, gums typically return to normal within one to two weeks. Once it advances to periodontitis, lost bone does not regenerate.' },
    { q: 'My gums bleed when I brush. Am I brushing too hard?', a: 'Almost certainly not. Healthy gums do not bleed from normal brushing. Bleeding means inflamed tissue, which means plaque is sitting at the gumline. Brushing more gently makes the bleeding stop temporarily while the disease continues. The correct response is to clean that area more thoroughly — including between the teeth — and have the calculus removed.' },
    { q: 'Can I cure gingivitis at home with mouthwash?', a: 'Mouthwash reduces bacterial load but cannot remove hardened calculus, and calculus is what keeps the inflammation going in most cases. If your gingivitis is caused purely by soft plaque, improved brushing and flossing can resolve it. If calculus is present, professional scaling is required first — otherwise you are rinsing over a rough surface that continually recolonises.' },
    { q: 'Does gingivitis hurt?', a: 'Usually not, which is exactly why it gets ignored. Most patients report only mild tenderness or none at all. The reliable early indicators are bleeding, colour change, and puffiness — not pain. By the time gum disease causes real pain, it has generally progressed well beyond gingivitis.' },
    { q: 'How often should I get a professional cleaning?', a: 'Every six to twelve months suits most people, but the interval should match how quickly you form calculus, which varies a lot between individuals. Patients with a history of gum disease, orthodontic appliances, diabetes, or heavy calculus formation are often better served every three to four months.' },
    { q: 'I am stationed at Camp Humphreys. Is gingivitis worth a trip off base?', a: 'If your gums bleed regularly, yes — treating it at the gingivitis stage costs a fraction of treating periodontitis later, and the appointment is short. We are about 30 minutes from Camp Humphreys and consultations are conducted in English. You can book directly on our ' + L('/en/reservation', 'English reservation page') + ' without going through a broker or agency.' },
  ],
})

EN_TERMS.push({
  slug: 'periodontitis',
  h1: 'Periodontitis',
  ko: '치주염',
  aka: ['gum disease', 'periodontal disease', 'advanced gum disease'],
  cat: 'Gum & Periodontal',
  tldr: 'Periodontitis is gum disease that has spread past the gums into the bone that anchors your teeth. The bone it destroys does not grow back. Treatment stops the progression and stabilises what remains — which is why the timing of your first visit largely determines the outcome.',
  body: `
<h3>What separates periodontitis from gingivitis</h3>
<p><strong>Periodontitis</strong> begins when inflammation crosses out of the gum tissue and starts destroying the supporting structures around the root: the ${D('alveolar-bone', 'alveolar bone')} and the ${D('periodontal-ligament', 'periodontal ligament')}. That is the entire difference, and it is a permanent one. ${D('gingivitis', 'Gingivitis')} is reversible; periodontitis is controllable.</p>
<p>As the attachment breaks down, a space called a <strong>periodontal pocket</strong> forms between root and gum. Pockets are deeper than a toothbrush can reach, so they collect bacteria, which deepens the pocket further. This self-feeding loop is why the condition accelerates once established.</p>

<h3>Reading the numbers your dentist calls out</h3>
<p>During a periodontal examination we measure pocket depth in millimetres at several points around each tooth. Those numbers are the clearest way to understand your own situation:</p>
<table style="${TBL}">
<tr><th style="${TH}">Pocket depth</th><th style="${TH}">Interpretation</th><th style="${TH}">Typical approach</th></tr>
<tr><td style="${TDC}">1–3 mm</td><td style="${TD}">Healthy or gingivitis only</td><td style="${TD}">Routine cleaning + home care</td></tr>
<tr><td style="${TDC}">4–5 mm</td><td style="${TD}">Early periodontitis; attachment loss has begun</td><td style="${TD}">Deep cleaning below the gumline</td></tr>
<tr><td style="${TDC}">6–7 mm</td><td style="${TD}">Moderate; not cleanable at home</td><td style="${TD}">Deep cleaning, possible surgical access</td></tr>
<tr><td style="${TDC}">8 mm +</td><td style="${TD}">Advanced; tooth may be mobile</td><td style="${TD}">Surgery, or planned extraction if unsalvageable</td></tr>
</table>

<h3>How it presents</h3>
<ul>
<li><strong>Gums that recede</strong>, making teeth look longer and exposing sensitive root surface.</li>
<li><strong>Persistent bad breath</strong> or a metallic taste that returns within hours.</li>
<li><strong>Teeth that feel loose</strong>, shift position, or change how they meet when you bite.</li>
<li><strong>Pus or discharge</strong> at the gumline when pressed.</li>
<li><strong>Food packing</strong> into new gaps between teeth that were not there before.</li>
</ul>
<div style="${WARN}"><strong>The dangerous part:</strong> periodontitis is largely painless until it is advanced. Patients frequently present with 60–70% bone loss and no pain history at all. Do not use pain as your screening test — use bleeding, recession, and mobility.</div>

<h3>Treatment is staged, not a single procedure</h3>
<ol>
<li><strong>Non-surgical deep cleaning.</strong> Calculus is removed from the root surface below the gumline, usually with local anaesthetic and often split across several appointments by area.</li>
<li><strong>Re-evaluation.</strong> Pockets are re-measured after healing, typically four to eight weeks later. Many patients need nothing further.</li>
<li><strong>Surgical access</strong> for pockets that remain too deep to clean — the gum is reflected so the root can be cleaned directly, then repositioned.</li>
<li><strong>Maintenance.</strong> This is the part that decides long-term outcome. Periodontitis is a chronic condition; three-to-four-month recall is standard for treated patients, not optional.</li>
</ol>
<div style="${BOX}"><strong>What treatment can and cannot do:</strong> it reliably stops progression and eliminates infection. It does not regrow the bone already lost. That asymmetry is the reason we push early screening so hard — you are not choosing between treatment now and treatment later; you are choosing how much bone you still have when treatment starts.</div>

<h3>Why it matters beyond your mouth</h3>
<p>Periodontitis is a chronic inflammatory condition with a large surface area of infected tissue. Established associations exist with cardiovascular disease, poorly controlled diabetes, and adverse pregnancy outcomes. The relationship with diabetes runs both ways: uncontrolled blood sugar worsens gum disease, and active gum inflammation makes blood sugar harder to control.</p>
<p>If tooth loss has already occurred, replacement options and their costs are listed on our ${L('/en/pricing', 'English price page')}, and ${L('/en/implant', 'implant treatment is explained here')}. Note that implants placed in previously periodontal sites require the gum disease to be controlled first — otherwise the same bacteria attack the implant.</p>
`,
  faqs: [
    { q: 'Can periodontitis be cured?', a: 'It can be controlled but not reversed. Treatment removes the infection and halts bone loss, and treated patients can keep their teeth for decades. However, the bone already destroyed does not regenerate, and the susceptibility remains — which is why maintenance visits every three to four months are part of the treatment rather than an add-on.' },
    { q: 'Will I lose my teeth?', a: 'Not necessarily, and that depends far more on when treatment starts than on how bad it looks today. Teeth with moderate bone loss and no mobility usually stabilise well. Teeth that are already loose with 8 mm or deeper pockets have a poorer outlook, and in some cases planned extraction with replacement gives a better long-term result than trying to save a hopeless tooth.' },
    { q: 'Is deep cleaning painful?', a: 'It is performed with local anaesthetic, so the procedure itself is comfortable. Afterwards you can expect some tenderness and temporary sensitivity for a few days, particularly to cold, because cleaned root surfaces are briefly more exposed. Most patients describe it as easier than they expected.' },
    { q: 'Why do my teeth feel more sensitive after treatment?', a: 'Removing calculus uncovers root surface that the deposit had been insulating, and inflamed gum tissue shrinks slightly as it heals. Both are signs of healing, not damage. Sensitivity usually settles within two to six weeks; desensitising toothpaste helps in the meantime.' },
    { q: 'Can I get implants if I have periodontitis?', a: 'Only after the disease is brought under control. The bacteria that attack natural teeth also attack the tissue around implants, a condition called peri-implantitis, and it is harder to treat than gum disease around a natural tooth. Any reputable clinic will stabilise the periodontal condition before planning implants.' },
    { q: 'I only have a few months left in Korea. Is it worth starting treatment?', a: 'Yes. Non-surgical deep cleaning can usually be completed within a few weeks, and that alone stops active bone loss. We will provide your chart, radiographs, and pocket measurements in English so your next dentist can continue maintenance without repeating diagnostics. Book through our ' + L('/en/reservation', 'English reservation page') + ' and mention your timeline so we can compress the schedule.' },
  ],
})

EN_TERMS.push({
  slug: 'chronic-periodontitis',
  h1: 'Chronic Periodontitis',
  ko: '만성 치주염',
  aka: ['chronic gum disease', 'adult periodontitis'],
  cat: 'Gum & Periodontal',
  tldr: 'Chronic periodontitis is the slow-progressing, most common form of gum disease, typically appearing after age 35 and advancing over years with little or no pain. Its defining feature is that damage accumulates quietly between dental visits.',
  body: `
<h3>The most common form — and the quietest</h3>
<p><strong>Chronic periodontitis</strong> accounts for the large majority of ${D('periodontitis', 'periodontitis')} cases. "Chronic" here describes the tempo, not the severity: bone is lost slowly, over years to decades, in episodic bursts of activity separated by quiet periods. Because each individual episode is small and painless, patients rarely notice anything until a tooth becomes mobile.</p>

<h3>Chronic vs. aggressive periodontitis</h3>
<table style="${TBL}">
<tr><th style="${TH}"></th><th style="${TH}">Chronic</th><th style="${TH}">Aggressive</th></tr>
<tr><td style="${TD}"><strong>Typical onset</strong></td><td style="${TD}">After 35, gradual</td><td style="${TD}">Adolescence to early 30s</td></tr>
<tr><td style="${TD}"><strong>Rate of bone loss</strong></td><td style="${TD}">Slow, years</td><td style="${TD}">Rapid, months</td></tr>
<tr><td style="${TD}"><strong>Plaque amount</strong></td><td style="${TD}">Matches the damage seen</td><td style="${TD}">Often minimal despite severe loss</td></tr>
<tr><td style="${TD}"><strong>Family history</strong></td><td style="${TD}">Less prominent</td><td style="${TD}">Frequently present</td></tr>
<tr><td style="${TD}"><strong>Pattern</strong></td><td style="${TD}">Generalised, fairly even</td><td style="${TD}">Often localised to incisors and first molars</td></tr>
</table>
<div style="${BOX}"><strong>Why the distinction matters:</strong> if a patient in their twenties shows significant bone loss with clean-looking teeth, that pattern does not fit chronic periodontitis and warrants a different work-up — including family screening, since siblings often share the susceptibility.</div>

<h3>What makes it progress faster in some people</h3>
<ul>
<li><strong>Smoking</strong> — the single strongest modifiable risk factor. It impairs healing and suppresses bleeding, hiding the main warning sign.</li>
<li><strong>Poorly controlled diabetes</strong> — bidirectional relationship with gum inflammation.</li>
<li><strong>Genetic susceptibility</strong> — some immune profiles respond destructively to ordinary bacterial loads.</li>
<li><strong>Untreated ${D('bruxism', 'bruxism')}</strong> — grinding forces do not cause periodontitis, but they accelerate breakdown in teeth that have already lost support.</li>
<li><strong>Retained ${D('dental-calculus', 'calculus')}</strong> below the gumline, which no home routine can reach.</li>
<li><strong>Long gaps between check-ups</strong> — the mechanism most patients actually control.</li>
</ul>

<h3>Why maintenance intervals are the whole ballgame</h3>
<p>Once treated, the pockets are clean but the anatomy remains changed: reduced bone height, longer root surfaces exposed, and deeper residual pockets that are harder to clean at home. Bacteria recolonise these sites within roughly three months. That number is not arbitrary — it is why periodontal maintenance is scheduled at three-to-four-month intervals rather than the usual six.</p>
<p>Patients who keep those intervals typically hold stable for decades. Patients who drift back to annual visits usually return with new bone loss. The treatment was not the deciding factor; the interval was.</p>
<div style="${WARN}"><strong>Practical note for overseas patients:</strong> if you move frequently, ask for your periodontal chart — pocket depths per tooth, plus radiographs — in digital form. Without baseline numbers, your next dentist cannot tell new bone loss from old, and you effectively restart monitoring from zero. We provide these in English on request.</div>

<h3>What you can realistically expect</h3>
<ul>
<li><strong>Progression stops.</strong> This is the primary and achievable goal.</li>
<li><strong>Pockets get shallower</strong> — partly from healing, partly because inflamed gum shrinks. Expect some visible recession.</li>
<li><strong>Bleeding resolves</strong> in most sites within weeks.</li>
<li><strong>Lost bone does not return</strong> in ordinary treatment. Regenerative procedures exist but apply only to specific defect shapes.</li>
<li><strong>Mobile teeth may firm up slightly</strong> as inflammation resolves, though teeth with severe loss stay mobile.</li>
</ul>
`,
  faqs: [
    { q: 'How is chronic periodontitis different from ordinary gum disease?', a: 'Chronic periodontitis is the most common type of periodontitis, defined by slow progression — bone loss accumulating over years rather than months. Gingivitis, by contrast, involves no bone loss at all and is fully reversible. The clinical significance of the "chronic" label is mostly about tempo and expected pattern, which guides how aggressively we monitor.' },
    { q: 'If it progresses slowly, can I wait?', a: 'Slow progression is still permanent progression. Because each episode of bone loss is painless and small, waiting typically means arriving with 40–60% support already gone. Treatment cannot rebuild that. The practical answer is that slow disease rewards early screening more than fast disease does, because the window to act is longer and easier to miss.' },
    { q: 'Why do I need cleanings every three months instead of six?', a: 'Because treated periodontal sites recolonise with bacteria in roughly three months, and your residual pocket anatomy makes home cleaning less effective than before. Three-to-four-month maintenance is the interval that keeps treated patients stable in long-term studies. Returning to six or twelve months is the most common reason for relapse.' },
    { q: 'I smoke. Does treatment still work?', a: 'It works, but less predictably, and healing is slower. Smokers also bleed less, so both you and your dentist lose the earliest warning sign. Reducing or stopping produces a measurable improvement in treatment response — it is the single change with the largest effect on your outcome.' },
    { q: 'Can chronic periodontitis come back after treatment?', a: 'The susceptibility never disappears, so recurrence is always possible — that is why it is managed as a chronic condition. What treatment plus regular maintenance reliably does is keep it inactive. Most recurrences we see follow a lapse in maintenance visits rather than a failure of the original treatment.' },
    { q: 'Does it affect my general health?', a: 'Chronic periodontitis maintains a persistent inflammatory burden, and associations are documented with cardiovascular disease, poorly controlled diabetes, and pregnancy complications. Diabetes in particular interacts in both directions, so treating gum inflammation is often part of improving glycaemic control rather than separate from it.' },
  ],
})

EN_TERMS.push({
  slug: 'dental-calculus',
  h1: 'Dental Calculus (Tartar)',
  ko: '치석',
  aka: ['tartar', 'calculus', 'hardened plaque'],
  cat: 'Gum & Periodontal',
  tldr: 'Calculus is plaque that has mineralised into a hard deposit. Once formed, no toothbrush, floss, mouthwash, or whitening product removes it — only professional scaling does. Its rough surface then breeds more plaque, which is why it drives gum disease.',
  body: `
<h3>How soft plaque becomes stone</h3>
<p>Plaque is a soft bacterial film that forms on teeth within hours. If it is not removed, minerals in your saliva — mainly calcium and phosphate — precipitate into it. Within roughly <strong>24 to 72 hours</strong> the film begins hardening, and over one to two weeks it becomes fully mineralised <strong>calculus</strong>, commonly called tartar.</p>
<p>The clinically important consequence is mechanical, not chemical: calculus has a rough, porous surface that plaque adheres to far more readily than smooth enamel does. So calculus is not just old plaque sitting there — it is a permanent plaque magnet bonded to your tooth. That is the mechanism by which it drives ${D('gingivitis', 'gingivitis')} and then ${D('periodontitis', 'periodontitis')}.</p>

<h3>Supragingival vs. subgingival — two different problems</h3>
<table style="${TBL}">
<tr><th style="${TH}"></th><th style="${TH}">Above the gumline</th><th style="${TH}">Below the gumline</th></tr>
<tr><td style="${TD}"><strong>Colour</strong></td><td style="${TD}">Whitish to yellow-brown</td><td style="${TD}">Dark brown to black (blood pigments)</td></tr>
<tr><td style="${TD}"><strong>Common site</strong></td><td style="${TD}">Behind lower front teeth, outer upper molars</td><td style="${TD}">Inside periodontal pockets</td></tr>
<tr><td style="${TD}"><strong>Visible to you?</strong></td><td style="${TD}">Usually yes</td><td style="${TD}">No — needs probing or radiographs</td></tr>
<tr><td style="${TD}"><strong>Main damage</strong></td><td style="${TD}">Gum inflammation, staining, odour</td><td style="${TD}"><strong>Bone loss</strong></td></tr>
<tr><td style="${TD}"><strong>Removal</strong></td><td style="${TD}">Routine scaling</td><td style="${TD}">Deep cleaning, often with anaesthetic</td></tr>
</table>
<div style="${BOX}"><strong>Why "my teeth look fine" is not reassuring:</strong> the calculus that destroys bone is the kind you cannot see. Subgingival deposits sit inside the pocket, below the gum margin, and are found by probing — not by looking in a mirror.</div>

<h3>Why it always appears in the same places</h3>
<p>Calculus concentrates where saliva ducts empty, because that is where the mineral supply is richest:</p>
<ul>
<li><strong>The inner surface of the lower front teeth</strong> — directly opposite the submandibular and sublingual ducts. This is the number-one site in almost everyone, and it is also the surface most people brush least. See ${D('dental-pulp', 'tooth anatomy')} for orientation on tooth surfaces.</li>
<li><strong>The outer surface of the upper molars</strong> — next to the parotid duct openings.</li>
<li><strong>Crowded or overlapping teeth</strong>, where a brush physically cannot pass.</li>
<li><strong>Around orthodontic brackets and under poorly fitting crown margins.</strong></li>
</ul>

<h3>What actually removes it — and what does not</h3>
<p>Only mechanical professional removal works. Specifically:</p>
<ul>
<li><strong>Ultrasonic scaling</strong> — high-frequency vibration fractures the deposit off the tooth surface. This is the standard method.</li>
<li><strong>Hand instrumentation</strong> for fine finishing and root surfaces.</li>
</ul>
<p>Things that do <em>not</em> remove calculus, despite marketing claims: whitening toothpaste, charcoal powder, mouthwash, oil pulling, baking soda, "tartar control" formulations (these slow new formation; they do not remove existing deposits), and at-home ultrasonic devices sold online — which mostly polish the surface while leaving the subgingival portion untouched.</p>
<div style="${WARN}"><strong>Do not scrape it yourself.</strong> We regularly see patients who used a metal pick or a purchased scaler and produced gum lacerations, scratched root surfaces that then accumulate plaque faster, and in some cases enamel damage. The deposit you can reach is the harmless one; the harmful one is beyond your reach by design.</div>

<h3>Frequency and what to expect</h3>
<p>Most people need professional scaling every six to twelve months, but the correct interval is individual — it depends on how fast <em>you</em> mineralise plaque, which varies several-fold between people. Heavy formers, orthodontic patients, smokers, and anyone with treated gum disease generally need three-to-four-month intervals.</p>
<p>Expect mild sensitivity and slightly more visible gaps for a week or two afterwards. Both are normal: the deposit was insulating the tooth and propping up swollen gum tissue. Fees for non-covered scaling are published on our ${L('/en/pricing', 'English price list')}.</p>
`,
  faqs: [
    { q: 'Can I remove tartar at home?', a: 'No. Calculus is mineralised onto the tooth surface and requires mechanical removal with professional instruments. Toothpaste, mouthwash, charcoal, oil pulling, and baking soda cannot dissolve it. "Tartar control" products only slow the formation of new deposits. Attempting removal with a purchased scaler commonly causes gum injury and root scratching that makes the problem worse.' },
    { q: 'How fast does tartar form?', a: 'Plaque starts mineralising within about 24 to 72 hours and becomes fully hardened over one to two weeks. This is why the timing of your cleaning matters more than its thoroughness — a perfect brushing every other day still permits calculus formation, whereas adequate cleaning every day largely prevents it.' },
    { q: 'Why do I get tartar behind my lower front teeth even though I brush?', a: 'Because the salivary duct openings sit right there, giving that surface the richest mineral supply in your mouth — and it is also the surface most people brush the least, since reaching it requires angling the brush vertically. It is the single most common calculus site, and technique rather than effort is usually the fix.' },
    { q: 'Does scaling damage or thin my enamel?', a: 'No. Ultrasonic scaling is tuned to fracture mineralised deposits, not to cut enamel. What patients interpret as damage is usually the sensation of surfaces that were previously covered being exposed again, plus temporary gum shrinkage as swelling resolves. Uncontrolled DIY scraping does cause real damage — professional scaling does not.' },
    { q: 'Why do my teeth feel sensitive and look gappy after a cleaning?', a: 'The calculus was physically insulating your root surfaces and holding inflamed gum tissue outward. Once removed, exposed dentin responds to cold for a while and the gum settles into its true, healthier position — which reveals spaces that were already there. Sensitivity typically resolves in two to six weeks.' },
    { q: 'Is scaling covered by insurance in Korea?', a: 'Korean National Health Insurance covers one scaling per calendar year for enrolled residents aged 19 and over. Visitors, most SOFA-status patients, and anyone not enrolled are treated as non-covered. Our non-covered fee is published on the ' + L('/en/pricing', 'English price page') + ' so you know the figure before you arrive.' },
  ],
})

EN_TERMS.push({
  slug: 'pregnancy-gingivitis',
  h1: 'Pregnancy Gingivitis',
  ko: '임신성 치은염',
  aka: ['pregnancy gum disease', 'gestational gingivitis'],
  cat: 'Gum & Periodontal',
  tldr: 'Pregnancy hormones make gums react far more strongly to the same amount of plaque, so bleeding and swelling appear even with unchanged brushing habits. It affects a majority of pregnancies, peaks in the second trimester, and dental treatment during pregnancy is safe — deferring it is the greater risk.',
  body: `
<h3>Why pregnancy changes your gums</h3>
<p>Rising progesterone and oestrogen increase gum vascular permeability and alter the local immune response. The result is an amplified inflammatory reaction to <em>the same</em> bacterial load you had before pregnancy. This is the key point patients find reassuring: your hygiene has not necessarily deteriorated — your tissue response has changed.</p>
<p>Reported prevalence ranges from roughly 40% to 70% of pregnancies. Onset is typically in the <strong>second month</strong>, peaking around the <strong>second trimester</strong>, and it usually resolves within a few months of delivery as hormones normalise.</p>

<h3>Timeline and what is safe when</h3>
<table style="${TBL}">
<tr><th style="${TH}">Period</th><th style="${TH}">Gum condition</th><th style="${TH}">Dental care</th></tr>
<tr><td style="${TD}"><strong>1st trimester</strong></td><td style="${TD}">Symptoms beginning; nausea may limit brushing</td><td style="${TD}">Urgent care and cleaning fine; elective work usually deferred</td></tr>
<tr><td style="${TD}"><strong>2nd trimester</strong></td><td style="${TD}"><strong>Peak</strong> swelling and bleeding</td><td style="${TD}"><strong>Optimal window</strong> for cleaning and necessary treatment</td></tr>
<tr><td style="${TD}"><strong>3rd trimester</strong></td><td style="${TD}">Still elevated; may plateau</td><td style="${TD}">Possible, but lying flat gets uncomfortable — keep sessions short</td></tr>
<tr><td style="${TD}"><strong>Postpartum</strong></td><td style="${TD}">Resolves over weeks to months</td><td style="${TD}">Re-evaluate; treat anything deferred</td></tr>
</table>

<h3>Pregnancy gingivitis vs. pyogenic granuloma</h3>
<p>Some patients develop a distinct red, lobulated lump on the gum, usually between teeth, that bleeds readily. This is a <strong>pyogenic granuloma</strong> — sometimes called a pregnancy tumour, which is an unfortunate name because it is entirely benign and not a neoplasm. It typically regresses after delivery. It is removed during pregnancy only if it bleeds heavily, interferes with eating, or grows quickly.</p>
<div style="${BOX}"><strong>Distinguishing feature:</strong> pregnancy gingivitis is diffuse — a general puffiness and bleeding along the gumline. A pyogenic granuloma is a discrete lump with a defined edge. If you can point to one specific bump, mention it at your appointment.</div>

<h3>The safety questions everyone asks</h3>
<ul>
<li><strong>Local anaesthetic</strong> — lidocaine is widely used in pregnancy and is considered appropriate. Untreated dental infection carries more risk to a pregnancy than the anaesthetic does.</li>
<li><strong>Dental radiographs</strong> — the dose from a dental film is very low and the beam is directed away from the abdomen, with lead shielding used. Necessary radiographs are taken; routine screening films are usually postponed.</li>
<li><strong>Scaling</strong> — safe throughout, and specifically beneficial, since removing ${D('dental-calculus', 'calculus')} reduces the bacterial load your amplified immune response is reacting to.</li>
<li><strong>Antibiotics</strong> — several are established as appropriate in pregnancy; the choice is made with your obstetrician when needed.</li>
</ul>
<div style="${WARN}"><strong>Please tell us at booking</strong> that you are pregnant and how many weeks along, and let us know your obstetrician's contact if you have any complications. This changes positioning, appointment length, and medication choices. It is not a reason to be turned away — it is information that makes your visit safer.</div>

<h3>Managing it day to day</h3>
<ul>
<li><strong>Soft-bristled brush, gentle technique.</strong> Bleeding gums still need cleaning; skipping the area makes it worse, not better.</li>
<li><strong>Keep cleaning between the teeth.</strong> This is where the inflammation concentrates.</li>
<li><strong>If nausea prevents brushing</strong>, rinse with water and try brushing at a different time of day, or use a small-headed brush with unflavoured paste.</li>
<li><strong>After vomiting, rinse — do not brush immediately.</strong> Stomach acid softens ${D('enamel', 'enamel')}, and brushing right away abrades the softened surface. Rinse with water, then wait about 30 minutes.</li>
<li><strong>Frequent snacking</strong> raises decay risk; if you are eating small meals often, rinse with water in between.</li>
</ul>

<h3>Why not just wait until after delivery</h3>
<p>Untreated gum inflammation does not pause. It can progress to ${D('periodontitis', 'periodontitis')}, which involves irreversible bone loss, and associations exist between maternal periodontal disease and preterm birth and low birth weight. The postpartum period — with a newborn — is also the least practical time to start a course of dental treatment. The second trimester exists as a treatment window for exactly this reason.</p>
`,
  faqs: [
    { q: 'Is it safe to see a dentist while pregnant?', a: 'Yes. Cleanings and necessary treatment are safe throughout pregnancy, with the second trimester being the most comfortable window. Deferring care is the greater risk, because untreated infection and inflammation carry documented associations with adverse pregnancy outcomes. Tell us your gestational age at booking so we can adapt positioning and appointment length.' },
    { q: 'Why are my gums bleeding when my brushing has not changed?', a: 'Because your tissue response changed rather than your hygiene. Progesterone and oestrogen increase gum vascular permeability, so the same plaque triggers a much stronger inflammatory reaction. This is expected in 40–70% of pregnancies and is not a sign you have been careless — but it does mean plaque removal matters more now, not less.' },
    { q: 'Are dental X-rays safe during pregnancy?', a: 'Dental radiographs deliver a very low dose, the beam is aimed away from the abdomen, and shielding is used. Radiographs that are needed for diagnosis are taken during pregnancy; routine screening films are typically postponed until after delivery. Diagnosing a spreading infection blind is riskier than the image.' },
    { q: 'Will it go away after I give birth?', a: 'In most cases yes — hormone levels normalise and the exaggerated gum response subsides over weeks to a few months. What does not reverse is any bone loss that occurred if it progressed to periodontitis. That is why the goal during pregnancy is keeping it at the reversible gingivitis stage.' },
    { q: 'I have a red lump on my gum that bleeds a lot. What is it?', a: 'That is likely a pyogenic granuloma, sometimes called a pregnancy tumour. Despite the name it is benign and it usually shrinks on its own after delivery. It is removed during pregnancy only if bleeding is heavy, it interferes with eating, or it is enlarging rapidly. Point it out at your visit so it can be distinguished from generalised gingivitis.' },
    { q: 'Morning sickness is making it hard to brush. What should I do?', a: 'Rinse with water after vomiting but wait about 30 minutes before brushing — stomach acid temporarily softens enamel and immediate brushing abrades it. Try brushing at a time of day when nausea is lower, use a smaller brush head, and switch to an unflavoured toothpaste if mint triggers it. Any cleaning is better than skipping the day.' },
  ],
})

// ════════════════════════════════════════════════════════════
// GROUP 2 — Tooth Decay & Pulp
// ════════════════════════════════════════════════════════════

EN_TERMS.push({
  slug: 'dental-caries',
  h1: 'Dental Caries (Cavities)',
  ko: '충치',
  aka: ['cavity', 'tooth decay', 'caries'],
  cat: 'Tooth Decay & Pulp',
  tldr: 'Cavities are holes created by acid from bacteria feeding on sugar. Decay confined to enamel can sometimes be arrested without drilling; once it reaches dentin, the tooth structure is gone permanently and must be filled. Pain appears late — usually only after the decay is already deep.',
  body: `
<h3>The actual mechanism</h3>
<p>Bacteria in plaque metabolise sugars and starches and release acid as a by-product. That acid dissolves mineral out of the tooth surface — a process called demineralisation. Saliva pushes minerals back in between meals. <strong>A cavity forms when the acid attacks outpace the repair.</strong></p>
<p>This framing matters because it explains something counterintuitive: <em>how often</em> you eat sugar affects decay risk more than <em>how much</em>. One dessert produces one acid episode. Sipping a sweetened coffee across three hours produces a near-continuous one, and saliva never gets a window to repair.</p>

<h3>How far it has gone — and what that means for you</h3>
<table style="${TBL}">
<tr><th style="${TH}">Stage</th><th style="${TH}">What is happening</th><th style="${TH}">Symptoms</th><th style="${TH}">Treatment</th></tr>
<tr><td style="${TD}"><strong>Initial (white spot)</strong></td><td style="${TD}">Mineral loss in ${D('enamel', 'enamel')}, surface intact</td><td style="${TD}">None</td><td style="${TD}"><strong>Possibly reversible</strong> — fluoride, plaque control</td></tr>
<tr><td style="${TD}"><strong>Enamel caries</strong></td><td style="${TD}">Surface has broken; no ${D('dentin', 'dentin')} involvement</td><td style="${TD}">Usually none</td><td style="${TD}">Small filling</td></tr>
<tr><td style="${TD}"><strong>Dentin caries</strong></td><td style="${TD}">Into dentin; progresses faster here</td><td style="${TD}">Sensitivity to cold, sweet</td><td style="${TD}">Filling or inlay</td></tr>
<tr><td style="${TD}"><strong>Deep / near pulp</strong></td><td style="${TD}">Approaching the ${D('dental-pulp', 'pulp')}</td><td style="${TD}">Lingering pain, throbbing</td><td style="${TD}">Deep restoration or root canal</td></tr>
<tr><td style="${TD}"><strong>Pulp involvement</strong></td><td style="${TD}">Bacteria reach the nerve — ${D('pulpitis', 'pulpitis')}</td><td style="${TD}">Severe or spontaneous pain</td><td style="${TD}">Root canal, then crown</td></tr>
</table>
<div style="${BOX}"><strong>Where the line is:</strong> enamel has no nerves and no cells, so early enamel lesions can sometimes remineralise. Dentin cannot rebuild itself. Once decay crosses into dentin, that structure is permanently lost — the only question is how much gets replaced with filling material.</div>

<h3>Why "it doesn't hurt" means very little</h3>
<p>Enamel contains no nerve supply at all. Pain begins only when decay reaches dentin, and reliable pain usually means it is deep. So the entire early, cheap, easily-treated phase of a cavity is silent by design.</p>
<p>This is also why interproximal decay — between the teeth — is so commonly missed. It is invisible in a mirror and painless for months, and it is found on a bitewing radiograph. If you have not had films taken in several years, undetected decay between teeth is the most likely thing hiding.</p>

<h3>The sites that account for most cavities</h3>
<ul>
<li><strong>Molar grooves and pits</strong> — narrower than a single bristle, so a brush cannot enter them.</li>
<li><strong>Between teeth</strong>, just below the contact point. Requires floss; brushing does not reach.</li>
<li><strong>At the gumline</strong>, especially where gums have receded and softer root surface is exposed.</li>
<li><strong>Around the edges of old fillings and crowns</strong> — a gap of a few tenths of a millimetre is enough.</li>
<li><strong>Around orthodontic brackets.</strong></li>
<li><strong>Partially erupted ${D('wisdom-tooth', 'wisdom teeth')}</strong>, and the back surface of the molar in front of them.</li>
</ul>

<h3>Prevention that actually changes outcomes</h3>
<ul>
<li><strong>Fluoride toothpaste, and do not rinse with water afterwards.</strong> Spit, don't rinse — rinsing washes away the fluoride you just applied. This single habit change has a measurable effect.</li>
<li><strong>Reduce the frequency of sugar exposure</strong>, not just the quantity. Confine sweets to mealtimes rather than grazing.</li>
<li><strong>Clean between the teeth daily.</strong> This is where the decay you cannot see happens.</li>
<li><strong>Fissure sealants</strong> for deep molar grooves, especially in children.</li>
<li><strong>Bitewing radiographs at intervals</strong> appropriate to your risk — this is how interproximal decay gets caught while it is still small.</li>
</ul>
<div style="${WARN}"><strong>A note on "natural" remedies:</strong> oil pulling, charcoal, and dietary supplements do not close a cavity that has broken the enamel surface. Early white-spot lesions can remineralise with fluoride and plaque control. A hole cannot. Delaying a small filling reliably produces a larger one, and often a root canal.</div>

<h3>What treatment involves</h3>
<p>Decayed tissue is removed and the space is restored — with composite resin for smaller cavities, or an inlay/onlay when a large portion of the tooth is gone. If decay has reached the pulp, ${L('/en/pricing', 'root canal treatment')} becomes necessary and the tooth generally needs a crown afterwards, because a treated tooth with a large cavity is structurally weakened and prone to ${D('tooth-fracture', 'fracture')}.</p>
<p>Current fees for fillings, inlays, and root canal treatment are published on our ${L('/en/pricing', 'English price list')}.</p>
`,
  faqs: [
    { q: 'Can a cavity heal on its own?', a: 'Only at the very earliest stage. A white-spot lesion — mineral loss with the enamel surface still intact — can remineralise with fluoride and improved plaque control. Once the surface has broken and especially once decay reaches dentin, the lost structure cannot regenerate and a filling is required. There is no product or diet that closes an actual hole.' },
    { q: 'My tooth has a hole but does not hurt. Can I wait?', a: 'Waiting reliably makes it more expensive. Enamel has no nerves, so absence of pain tells you very little about depth — pain typically begins only when decay is already close to the pulp. A small filling today is a substantially smaller procedure than the root canal and crown the same tooth may need in a year.' },
    { q: 'Why do I get cavities when I brush twice a day?', a: 'Because the sites where cavities form are the ones a brush cannot reach: between teeth, deep molar grooves, and the margins of old fillings. Brushing handles the flat visible surfaces well. If you are getting decay despite good brushing, the two things to add are daily interdental cleaning and periodic bitewing radiographs to catch what is invisible.' },
    { q: 'Does sugar quantity or frequency matter more?', a: 'Frequency. Each sugar exposure triggers an acid episode lasting roughly 20 to 40 minutes, and saliva needs the gaps in between to remineralise. One dessert with a meal is one episode; sipping a sweet drink over three hours is a nearly continuous attack. The same total sugar can be low-risk or high-risk depending purely on timing.' },
    { q: 'Are dental X-rays really necessary to find cavities?', a: 'For decay between teeth, yes — it is not visible on examination and produces no symptoms until it is deep. Bitewing radiographs are the standard way to detect it early, when a small filling is still sufficient. If you have gone several years without films, interproximal decay is the most common thing found when they are finally taken.' },
    { q: 'What is the "spit, do not rinse" rule?', a: 'After brushing with fluoride toothpaste, spit out the excess but do not rinse with water. Rinsing immediately washes away the fluoride that would otherwise keep working on your enamel surface. It is one of the few no-cost habit changes with a measurable effect on decay rates, and most patients have never been told it.' },
  ],
})

EN_TERMS.push({
  slug: 'pulpitis',
  h1: 'Pulpitis',
  ko: '치수염',
  aka: ['inflamed nerve', 'tooth nerve inflammation', 'dental pulp inflammation'],
  cat: 'Tooth Decay & Pulp',
  tldr: 'Pulpitis is inflammation of the nerve and blood vessels inside a tooth. Reversible pulpitis can settle after the cause is removed; irreversible pulpitis requires root canal treatment. The distinguishing test is simple — whether pain stops within seconds of removing the trigger, or lingers.',
  body: `
<h3>Why this diagnosis decides your treatment</h3>
<p>The ${D('dental-pulp', 'dental pulp')} sits inside a rigid chamber of ${D('dentin', 'dentin')} and ${D('enamel', 'enamel')}. When it becomes inflamed it swells — but it has nowhere to expand. Pressure rises inside the chamber, compresses its own blood supply, and the tissue begins to die. This anatomical trap is why pulpitis behaves differently from inflammation anywhere else in the body, and why it does not simply resolve once past a certain point.</p>
<p>Clinically everything hinges on one distinction: <strong>reversible or irreversible.</strong></p>

<h3>Reversible vs. irreversible — how it is told apart</h3>
<table style="${TBL}">
<tr><th style="${TH}"></th><th style="${TH}">Reversible</th><th style="${TH}">Irreversible</th></tr>
<tr><td style="${TD}"><strong>Pain trigger</strong></td><td style="${TD}">Cold, sweet — a stimulus is needed</td><td style="${TD}">Often <strong>spontaneous</strong>, no trigger</td></tr>
<tr><td style="${TD}"><strong>Duration after trigger</strong></td><td style="${TD}">Stops within seconds</td><td style="${TD}"><strong>Lingers</strong> — minutes to hours</td></tr>
<tr><td style="${TD}"><strong>Night pain</strong></td><td style="${TD}">Rare</td><td style="${TD}">Common; may wake you</td></tr>
<tr><td style="${TD}"><strong>Heat response</strong></td><td style="${TD}">Usually not painful</td><td style="${TD}">Often painful; sometimes relieved by cold</td></tr>
<tr><td style="${TD}"><strong>Localising it</strong></td><td style="${TD}">Fairly easy</td><td style="${TD}">Often diffuse or referred to another tooth/jaw</td></tr>
<tr><td style="${TD}"><strong>Treatment</strong></td><td style="${TD}">Remove cause; pulp recovers</td><td style="${TD}"><strong>Root canal</strong> (or extraction)</td></tr>
</table>
<div style="${BOX}"><strong>The single most useful self-observation:</strong> sip something cold and count. If the pain disappears within a few seconds of swallowing, that points to reversible. If it keeps throbbing for minutes afterwards, that pattern is characteristic of irreversible pulpitis — and it will not settle on its own. This is a guide for describing your symptoms accurately, not a substitute for examination.</div>

<h3>What causes it</h3>
<ul>
<li><strong>Deep ${D('dental-caries', 'decay')}</strong> — the most common cause by a wide margin.</li>
<li><strong>${D('cracked-tooth-syndrome', 'Cracks')}</strong> that let bacteria and fluid reach the pulp.</li>
<li><strong>Trauma</strong> — a blow can inflame the pulp even with no visible damage, sometimes years earlier.</li>
<li><strong>Repeated restorations</strong> on the same tooth; each one removes a little more insulating dentin.</li>
<li><strong>Severe ${D('bruxism', 'grinding')}</strong>, which loads and irritates the pulp chronically.</li>
<li><strong>Advanced ${D('periodontitis', 'gum disease')}</strong> reaching the root tip from below.</li>
</ul>

<h3>The trap patients fall into</h3>
<div style="${WARN}"><strong>"The pain stopped, so it must have healed."</strong> In irreversible pulpitis, pain frequently stops for a period — because the nerve has died. The infection does not stop; it advances out of the root tip into the bone, forming a ${D('periapical-lesion', 'periapical lesion')} or abscess. Patients who wait through this quiet phase typically return with facial swelling and a tooth that is harder to save. Pain ending without treatment is a warning, not a resolution.</div>

<h3>Treatment</h3>
<p><strong>Reversible pulpitis:</strong> remove the cause — clean out the decay, place a restoration, address the grinding — and the pulp recovers. Sensitivity fades over days to a few weeks.</p>
<p><strong>Irreversible pulpitis:</strong> the inflamed tissue is removed, the canal system is cleaned and sealed, and the tooth is restored. A tooth that has had root canal treatment has lost internal structure and its blood supply, so it is more brittle and usually needs a crown to prevent ${D('tooth-fracture', 'fracture')} — that step is part of the treatment, not an upsell.</p>
<p>Antibiotics alone do not treat pulpitis. The infected tissue is inside a chamber with no blood supply left, so systemic antibiotics cannot reach it. They control spreading infection in surrounding tissue but do not remove the source.</p>
<p>Root canal and crown fees are listed on our ${L('/en/pricing', 'English price page')}.</p>
`,
  faqs: [
    { q: 'How do I know if I need a root canal?', a: 'The most telling pattern is pain that lingers after the trigger is removed — cold or sweet sets it off and it keeps aching for minutes rather than stopping in seconds. Spontaneous pain, pain that wakes you at night, and pain on heat also point toward irreversible pulpitis. Confirmation requires clinical testing and a radiograph, but that pattern is what prompts the test.' },
    { q: 'My toothache stopped by itself. Is it fine now?', a: 'This is the most dangerous moment in the sequence. In irreversible pulpitis, pain often ceases because the nerve has died — not because the problem resolved. The bacteria then progress out of the root tip into the surrounding bone, producing an abscess. Patients who wait through the quiet phase usually return with swelling and a worse prognosis for the tooth.' },
    { q: 'Can antibiotics cure pulpitis?', a: 'No. The inflamed or necrotic tissue sits inside a sealed chamber whose blood supply has been compressed or destroyed, so antibiotics carried in the bloodstream cannot reach it. Antibiotics are useful for controlling infection that has spread into surrounding tissue, but the source has to be removed mechanically by root canal treatment or extraction.' },
    { q: 'Why does my dentist insist on a crown after a root canal?', a: 'Because the tooth is now structurally compromised. It has lost internal dentin to both the original decay and the canal access, and it no longer has a blood supply, which makes it more brittle. Molars in particular fracture at a high rate without cuspal coverage. The crown is what protects the investment in the root canal, not an optional extra.' },
    { q: 'Is reversible pulpitis serious?', a: 'It is a warning stage rather than an emergency, and it is genuinely good news relative to the alternative. Remove the cause — decay, a failing filling, grinding — and the pulp recovers on its own. What makes it serious is ignoring it, because the same tooth then progresses to irreversible pulpitis, at which point the only options are root canal or extraction.' },
    { q: 'The pain seems to move between teeth. Is that normal?', a: 'Yes, and it is characteristic of pulpal pain. The pulp has no proprioceptive nerve fibres, so your brain cannot localise it precisely; pain from an upper molar is commonly felt in the lower jaw or in an adjacent tooth. This is why we test individual teeth rather than treating the one that hurts most — the culprit is often not the tooth you would point to.' },
  ],
})

EN_TERMS.push({
  slug: 'periapical-lesion',
  h1: 'Periapical Lesion',
  ko: '치근단 병소',
  aka: ['periapical abscess', 'dental abscess', 'root tip infection', 'periapical granuloma'],
  cat: 'Tooth Decay & Pulp',
  tldr: 'A periapical lesion is an area of infection and bone destruction at the tip of a tooth root, caused by bacteria escaping from a dead pulp. It is usually found on a radiograph as a dark shadow — often in a tooth that no longer hurts at all.',
  body: `
<h3>What it is and how it forms</h3>
<p>When the ${D('dental-pulp', 'pulp')} dies — from deep ${D('dental-caries', 'decay')}, ${D('pulpitis', 'untreated pulpitis')}, trauma, or a ${D('cracked-tooth-syndrome', 'crack')} — bacteria colonise the empty canal and exit through the tiny opening at the root tip. Your immune system meets them there, in bone. The battleground becomes a lesion: inflamed tissue replacing bone, visible on a radiograph as a dark round area at the root apex.</p>
<p>The important implication: <strong>a periapical lesion is not a disease of the tooth. It is a disease of the bone around the tooth, driven by a source inside the tooth.</strong> That is why cleaning the canal system resolves it, and why treating it with antibiotics alone does not.</p>

<h3>The three forms you may hear named</h3>
<table style="${TBL}">
<tr><th style="${TH}">Type</th><th style="${TH}">Character</th><th style="${TH}">Symptoms</th></tr>
<tr><td style="${TD}"><strong>Acute abscess</strong></td><td style="${TD}">Rapid, pus-forming</td><td style="${TD}">Severe pain, swelling, tooth tender to touch, possible fever</td></tr>
<tr><td style="${TD}"><strong>Chronic granuloma</strong></td><td style="${TD}">Slow, walled-off inflammatory tissue</td><td style="${TD}"><strong>Often none</strong> — found incidentally on radiograph</td></tr>
<tr><td style="${TD}"><strong>Radicular cyst</strong></td><td style="${TD}">Fluid-filled sac from long-standing lesion</td><td style="${TD}">Usually painless; can grow and displace structures</td></tr>
</table>
<div style="${BOX}"><strong>Why so many are silent:</strong> once the pulp is dead, the tooth has no nerve left to report pain. The chronic form can sit quietly for years while slowly enlarging. This is why routine radiographs matter even when nothing hurts — a symptomless lesion is still destroying bone.</div>

<h3>Signs that should prompt a visit</h3>
<ul>
<li><strong>A tooth that feels different when you bite</strong> — slightly raised, or tender to tapping.</li>
<li><strong>A small bump on the gum</strong> near the root, sometimes draining a bad-tasting fluid. This is a sinus tract, and it means the infection has found an exit.</li>
<li><strong>Facial or gum swelling.</strong></li>
<li><strong>A tooth that has darkened</strong> relative to its neighbours — see ${D('tooth-discoloration', 'tooth discoloration')}.</li>
<li><strong>A history of trauma to that tooth</strong>, even years ago.</li>
<li><strong>Pain that stopped on its own</strong> after a period of severe toothache.</li>
</ul>
<div style="${WARN}"><strong>When it becomes urgent:</strong> rapidly spreading swelling, difficulty swallowing or breathing, swelling that closes the eye, fever with malaise, or inability to open the mouth. Dental infections in the lower jaw can spread into fascial spaces of the neck, which is a medical emergency. Do not wait these out — go to an emergency department if you cannot reach a dentist.</div>

<h3>Treatment</h3>
<ol>
<li><strong>Remove the source.</strong> Root canal treatment cleans and seals the canal system, eliminating the bacterial reservoir. This is the definitive treatment for most lesions.</li>
<li><strong>Drainage</strong> if there is an acute abscess with pus under pressure — this gives the fastest pain relief.</li>
<li><strong>Antibiotics</strong> as an adjunct when infection is spreading, not as the treatment itself.</li>
<li><strong>Apical surgery</strong> if a lesion persists after properly performed root canal treatment, or in cases of ${D('periodontitis', 'combined')} pathology.</li>
<li><strong>Extraction</strong> when the tooth is not restorable.</li>
</ol>
<p>Healing is monitored radiographically. Bone fills back in slowly — expect <strong>6 to 24 months</strong> for a lesion to resolve on film, with larger ones taking longer. A follow-up radiograph at six to twelve months is standard, and this is the step patients most often skip.</p>
<div style="${BOX}"><strong>Good news that surprises people:</strong> bone regenerates here. Unlike the bone lost to ${D('periodontitis', 'gum disease')}, periapical bone destruction typically fills back in completely once the source of infection is removed. The lesion size on the initial radiograph is not a verdict on the tooth.</div>
`,
  faqs: [
    { q: 'I have an abscess but no pain. Is it still a problem?', a: 'Yes. The chronic form is frequently painless precisely because the nerve inside the tooth is already dead and cannot signal. Meanwhile the lesion continues destroying bone and can enlarge into a cyst. Painlessness reflects a dead nerve, not a resolved infection, and treatment is still required.' },
    { q: 'Can antibiotics clear it up without a root canal?', a: 'No. The bacterial reservoir is inside a canal system with no blood supply, so antibiotics cannot reach it. They can reduce spreading infection and swelling temporarily, and that relief often convinces patients the problem is gone. Once the course finishes, bacteria repopulate from the untreated canal and the lesion returns.' },
    { q: 'Will the bone grow back?', a: 'In most cases yes, and completely. This is a meaningful difference from bone lost to gum disease, which does not regenerate. Once the source inside the tooth is eliminated, periapical bone typically fills in over 6 to 24 months depending on lesion size. Follow-up radiographs confirm it — which is why that appointment matters.' },
    { q: 'There is a small pimple on my gum that keeps draining. What is that?', a: 'That is a sinus tract — a channel the infection has created to release pressure. It explains why the tooth may not hurt much: the pus has an escape route, so pressure never builds. It is a sign of established chronic infection and needs the source treated. The tract itself usually closes on its own once the tooth is treated.' },
    { q: 'When is a dental abscess an emergency?', a: 'Seek immediate care for rapidly spreading swelling, difficulty swallowing or breathing, swelling that closes your eye, fever with feeling generally unwell, or inability to open your mouth. Lower molar infections can spread into neck spaces, which is life-threatening. If you cannot reach a dentist quickly, go to an emergency department rather than waiting.' },
    { q: 'My tooth was injured years ago and now shows a shadow on X-ray. Are they related?', a: 'Very likely. Trauma can kill a pulp without any visible fracture and without immediate symptoms, and the resulting lesion may take years to become radiographically obvious. A darkened tooth with a history of impact and a periapical shadow is a classic combination, and it is usually treated successfully with root canal treatment.' },
  ],
})

EN_TERMS.push({
  slug: 'dental-pulp',
  h1: 'Dental Pulp',
  ko: '치수',
  aka: ['tooth nerve', 'pulp tissue'],
  cat: 'Tooth Decay & Pulp',
  tldr: 'The pulp is the living tissue at the centre of a tooth — nerves, blood vessels, and connective tissue. It is what makes a tooth feel temperature and pain. A tooth survives without it, but becomes more brittle and loses its ability to warn you of problems.',
  body: `
<h3>What is inside a tooth</h3>
<p>Patients often picture a tooth as a solid block. It is not. Beneath ${D('enamel', 'enamel')} and ${D('dentin', 'dentin')} there is a hollow space containing soft living tissue: the <strong>pulp</strong>, commonly called "the nerve", though nerve is only one of its components.</p>
<p>The pulp occupies a chamber in the crown that narrows into canals running down each root, exiting through a tiny opening at the root tip where its blood vessels and nerves connect to the body.</p>

<h3>Its four jobs</h3>
<table style="${TBL}">
<tr><th style="${TH}">Function</th><th style="${TH}">What it does</th></tr>
<tr><td style="${TD}"><strong>Sensory</strong></td><td style="${TD}">Detects temperature, pressure, and injury — this is your early warning system for decay</td></tr>
<tr><td style="${TD}"><strong>Nutritive</strong></td><td style="${TD}">Supplies moisture and nutrients that keep dentin resilient rather than brittle</td></tr>
<tr><td style="${TD}"><strong>Formative</strong></td><td style="${TD}">Produces dentin — including reparative dentin laid down under a slow-advancing cavity</td></tr>
<tr><td style="${TD}"><strong>Defensive</strong></td><td style="${TD}">Mounts an immune response and walls off irritation where it can</td></tr>
</table>
<div style="${BOX}"><strong>The formative function explains a common clinical observation:</strong> a slowly progressing cavity often hurts less than a fast one, because the pulp has had time to build reparative dentin as insulation. Less pain can therefore mean slower decay — not less decay.</div>

<h3>Why the pulp cannot survive swelling</h3>
<p>Inflammation elsewhere in the body causes swelling, and the tissue expands. The pulp is enclosed in rigid dentin with only a pinhole exit. When it swells, internal pressure rises, compresses its own blood vessels, and cuts off its own supply. This is the mechanism that turns reversible ${D('pulpitis', 'pulpitis')} into irreversible pulpitis, and it is why the condition does not resolve past a certain point.</p>

<h3>What changes when the pulp is removed</h3>
<ul>
<li><strong>No sensation.</strong> The tooth will not feel cold or hot again — and it will not warn you about new decay underneath a crown. Root-canal-treated teeth need radiographic monitoring precisely because the alarm is gone.</li>
<li><strong>More brittle.</strong> Losing the internal moisture supply, plus the dentin removed to access the canals, makes ${D('tooth-fracture', 'fracture')} substantially more likely. This is why crowns are recommended, particularly on molars.</li>
<li><strong>Possible darkening.</strong> Some treated teeth discolour over time — see ${D('tooth-discoloration', 'tooth discoloration')}. Internal bleaching can address this.</li>
<li><strong>Still functional.</strong> A properly treated and restored tooth can last decades. Keeping your own root in bone is generally preferable to extraction and replacement.</li>
</ul>

<h3>Age changes worth knowing about</h3>
<p>The pulp chamber shrinks throughout life as dentin is continuously deposited on its walls. A child's pulp is large and sits close to the surface; an older adult's may be narrow and partly calcified.</p>
<table style="${TBL}">
<tr><th style="${TH}">Age</th><th style="${TH}">Chamber</th><th style="${TH}">Clinical consequence</th></tr>
<tr><td style="${TD}">Children, teens</td><td style="${TD}">Large, close to surface</td><td style="${TD}">Decay reaches the pulp faster; cavities need earlier attention</td></tr>
<tr><td style="${TD}">20s–40s</td><td style="${TD}">Moderate</td><td style="${TD}">Typical presentation and treatment</td></tr>
<tr><td style="${TD}">50s+</td><td style="${TD}">Narrow, may be calcified</td><td style="${TD}">Less pain response; root canal technically harder</td></tr>
</table>
<div style="${WARN}"><strong>Two practical consequences.</strong> In children, a cavity that looks small can involve the pulp quickly — paediatric decay is genuinely more time-sensitive than adult decay. In older adults, a narrowed pulp gives a muted pain response, so significant decay can progress with minimal symptoms; radiographs carry more of the diagnostic weight.</div>
`,
  faqs: [
    { q: 'Is the pulp the same as the nerve?', a: 'Not exactly, though the terms get used interchangeably. The pulp is a complete tissue containing nerves, blood vessels, connective tissue, and dentin-forming cells. Nerve fibres are just one component. "Removing the nerve" in casual speech means removing the whole pulp, which is why the tooth also loses its blood supply and moisture, not just sensation.' },
    { q: 'Can a tooth survive without its pulp?', a: 'Yes. A tooth that has had root canal treatment and a proper restoration can function for decades, because the tooth is held in place by the periodontal ligament and bone, not by the pulp. What it loses is sensation and internal moisture, making it more brittle — which is why cuspal coverage with a crown is usually recommended, especially on molars.' },
    { q: 'Why does my child need a filling urgently when the cavity looks small?', a: 'Because a child\u2019s pulp chamber is proportionally much larger and sits closer to the tooth surface. The same depth of decay that would be moderate in an adult can reach the pulp in a child, and there is less dentin thickness to buy time. Paediatric decay genuinely progresses faster relative to the tooth\u2019s size.' },
    { q: 'Why did my dentist say the pulp is calcified and the root canal will be harder?', a: 'The pulp lays down dentin on its own chamber walls throughout life, so canals narrow with age — and they narrow faster in teeth that have had trauma, large fillings, or long-standing decay. Locating and negotiating a very narrow canal takes longer and sometimes requires magnification or referral. It does not mean treatment will fail.' },
    { q: 'If a root-canal-treated tooth cannot feel pain, how will I know if it decays again?', a: 'You largely will not, and that is the important limitation. New decay under a crown margin on a treated tooth can progress silently until it undermines the restoration. This is why treated teeth need periodic radiographs rather than relying on symptoms — the built-in alarm system has been removed along with the pulp.' },
    { q: 'Does a slowly forming cavity hurt less?', a: 'Often yes, because the pulp responds to slow irritation by depositing reparative dentin as extra insulation. That is a genuine defence mechanism, but it makes pain an unreliable measure of depth. A deep, slow lesion can be nearly painless while a shallower, rapid one is acutely sensitive.' },
  ],
})

EN_TERMS.push({
  slug: 'tooth-discoloration',
  h1: 'Tooth Discoloration',
  ko: '치아 변색',
  aka: ['tooth staining', 'yellow teeth', 'dark tooth', 'discoloured tooth'],
  cat: 'Tooth Decay & Pulp',
  tldr: 'Discoloration is either extrinsic (stains on the surface, removable by cleaning) or intrinsic (colour change within the tooth, which cleaning cannot touch). A single tooth that darkens is a different problem entirely — it usually signals a dead pulp and needs examination, not whitening.',
  body: `
<h3>The distinction that determines what will work</h3>
<table style="${TBL}">
<tr><th style="${TH}"></th><th style="${TH}">Extrinsic</th><th style="${TH}">Intrinsic</th></tr>
<tr><td style="${TD}"><strong>Where</strong></td><td style="${TD}">On the outer surface</td><td style="${TD}">Within ${D('dentin', 'dentin')} or ${D('enamel', 'enamel')}</td></tr>
<tr><td style="${TD}"><strong>Typical cause</strong></td><td style="${TD}">Coffee, tea, red wine, tobacco, ${D('dental-calculus', 'calculus')}</td><td style="${TD}">Ageing, trauma, dead pulp, tetracycline, fluorosis</td></tr>
<tr><td style="${TD}"><strong>Pattern</strong></td><td style="${TD}">Generalised, worse between teeth and at gumline</td><td style="${TD}">Uniform, banded, or a single dark tooth</td></tr>
<tr><td style="${TD}"><strong>Responds to cleaning?</strong></td><td style="${TDC}">Yes</td><td style="${TDC}">No</td></tr>
<tr><td style="${TD}"><strong>Responds to bleaching?</strong></td><td style="${TDC}">Yes, readily</td><td style="${TD}">Variably — depends on cause</td></tr>
</table>

<h3>Why teeth naturally darken with age</h3>
<p>Two changes happen simultaneously. Enamel thins with wear, becoming more translucent; and the ${D('dental-pulp', 'pulp')} keeps depositing dentin on the inside, so the dentin layer thickens. Since dentin is yellower than enamel, you end up looking through less white and at more yellow. This is a structural change, not a hygiene failure, and it is why an adult's teeth are legitimately darker than a child's.</p>
<div style="${BOX}"><strong>Practical implication:</strong> age-related yellowing responds reasonably well to bleaching because the colour sits in dentin, which peroxide can reach. Discoloration from tetracycline exposure during tooth development, by contrast, responds poorly and is usually addressed with veneers instead — see ${L('/en/laminate', 'our veneers page')}.</div>

<h3>When ONE tooth goes dark — treat this differently</h3>
<p>Generalised yellowing is a cosmetic question. A single tooth that darkens relative to its neighbours is a clinical finding, and the most common explanation is that its pulp has died. Blood breakdown products from the dead tissue diffuse into the dentin and stain it from inside.</p>
<ul>
<li><strong>Common trigger:</strong> trauma — often years earlier, sometimes forgotten.</li>
<li><strong>Also:</strong> deep ${D('dental-caries', 'decay')} that reached the pulp, or a large old restoration.</li>
<li><strong>Watch for:</strong> a ${D('periapical-lesion', 'periapical lesion')} developing at the root tip, frequently with no pain at all.</li>
</ul>
<div style="${WARN}"><strong>Do not whiten a single dark tooth without an examination first.</strong> External bleaching will not correct a colour change originating inside the tooth, and more importantly it does nothing about the dead pulp or the infection that may be forming in the bone. The correct sequence is: examine and radiograph, treat the pulp if needed, then address colour — often with internal bleaching, which works from inside the tooth.</div>

<h3>Causes checklist</h3>
<ul>
<li><strong>Dietary chromogens</strong> — coffee, tea, red wine, curry, berries, soy sauce.</li>
<li><strong>Tobacco</strong> — tar produces particularly tenacious brown staining.</li>
<li><strong>Chlorhexidine mouthwash</strong> — effective antiseptic, but causes brown staining with prolonged use.</li>
<li><strong>Iron supplements</strong>, especially liquid formulations in children.</li>
<li><strong>Dental fluorosis</strong> — white or brown mottling from excess fluoride during development.</li>
<li><strong>Tetracycline antibiotics</strong> taken during tooth formation — grey-brown horizontal banding.</li>
<li><strong>Amalgam restorations</strong> — can impart a grey cast to surrounding tooth structure.</li>
<li><strong>Root canal treatment</strong>, particularly older techniques or residual material in the crown.</li>
</ul>

<h3>Choosing an approach</h3>
<ol>
<li><strong>Professional cleaning first.</strong> A meaningful share of patients who ask about whitening actually have extrinsic staining and calculus. Cleaning is cheaper, faster, and sometimes sufficient.</li>
<li><strong>Bleaching</strong> for genuine intrinsic yellowing. Options and fees are on our ${L('/en/pricing', 'English price list')}.</li>
<li><strong>Internal bleaching</strong> for a single root-canal-treated dark tooth — the agent is placed inside the tooth.</li>
<li><strong>${L('/en/laminate', 'Veneers')}</strong> where bleaching cannot work: tetracycline banding, severe fluorosis, or discoloration combined with shape or position concerns.</li>
</ol>
<p>One caution on expectations: bleaching does not change the colour of existing crowns, veneers, or composite fillings. If you have restorations on your front teeth, whitening the natural teeth around them can create a visible mismatch — which is why the restorations often need replacing afterwards. Raise this before starting, not after.</p>
`,
  faqs: [
    { q: 'Why are my teeth getting yellower as I age even though my hygiene is good?', a: 'Two structural changes cause it. Enamel thins and becomes more translucent with years of wear, while the pulp continuously deposits new dentin on the inside, thickening that layer. Because dentin is naturally yellower than enamel, you are progressively seeing less white and more yellow. It is a normal anatomical change and not a reflection of your cleaning.' },
    { q: 'One of my front teeth has gone noticeably darker. What does that mean?', a: 'A single darkening tooth most often means its pulp has died, with blood breakdown products staining the dentin from inside. The trigger is frequently trauma, sometimes years earlier and often forgotten. This needs examination and a radiograph rather than whitening, because a periapical infection may be developing silently at the root tip.' },
    { q: 'Will whitening fix a single dark tooth?', a: 'External bleaching generally will not, because the colour originates inside the tooth. More importantly, whitening ignores the underlying cause — a non-vital pulp and possible infection in the bone. The usual sequence is to treat the pulp first, then use internal bleaching, which places the agent inside the tooth where the stain actually is.' },
    { q: 'Can tetracycline staining be whitened?', a: 'Poorly. Tetracycline incorporates into the tooth structure during development and produces grey-brown banding that responds inconsistently to peroxide, even with extended treatment. Veneers are the more predictable solution for these cases, which is why an honest assessment before starting matters more here than with ordinary age-related yellowing.' },
    { q: 'Do my crowns and fillings whiten too?', a: 'No. Bleaching acts on natural tooth structure only. Crowns, veneers, and composite fillings keep their original shade, so whitening the surrounding natural teeth can leave restorations looking conspicuously darker. If you have restorations on visible teeth, plan for possible replacement afterwards and discuss it before treatment rather than being surprised by the result.' },
    { q: 'Should I get a cleaning or whitening first?', a: 'Cleaning first, always. A substantial proportion of patients who request whitening have extrinsic staining and calculus, which cleaning removes at lower cost and with no sensitivity. Only after the surface is genuinely clean can you judge the true underlying shade — and some patients find they no longer want whitening at that point.' },
  ],
})

// ════════════════════════════════════════════════════════════
// GROUP 3 — Cracks & Trauma
// ════════════════════════════════════════════════════════════

EN_TERMS.push({
  slug: 'cracked-tooth-syndrome',
  h1: 'Cracked Tooth Syndrome',
  ko: '치아 균열',
  aka: ['cracked tooth', 'tooth crack', 'craze lines', 'hairline crack in tooth', 'incomplete tooth fracture'],
  cat: 'Cracks & Trauma',
  tldr: 'Cracked tooth syndrome is pain from a crack that has not yet split the tooth apart. The signature complaint is a sharp jolt on releasing a bite rather than on pressing down, often with sensitivity to cold, and the crack is frequently invisible on radiographs. It is one of the most commonly misdiagnosed dental problems, and left alone the crack propagates until the tooth splits or the pulp becomes infected.',
  body: `
<h3>Why the pain comes on release, not on pressure</h3>
<p>A crack divides a tooth into segments that can move independently by a fraction of a millimetre. When you bite down, the segments separate slightly. When you release, they snap back together and pinch the fluid-filled tubules of the exposed ${D('dentin', 'dentin')} — and that hydraulic pulse is what fires the nerve. This is why the classic history is a sharp jab on release, and why patients describe it as unpredictable: it only happens when a hard particle lands on exactly the wrong spot.</p>
<div style="${BOX}"><strong>The diagnostic value of that detail cannot be overstated.</strong> Pain on release, on one specific spot, with a normal-looking tooth on radiograph, is close to being a signature. If you can reproduce it and tell your dentist which tooth and which direction, you have provided more useful information than most tests will.</div>

<h3>Distinguishing a crack from the conditions it imitates</h3>
<table style="${TBL}">
<tr><th style="${TH}">Feature</th><th style="${TH}">Cracked tooth</th><th style="${TH}">Deep decay</th><th style="${TH}">Sinus pressure</th></tr>
<tr><td style="${TD}">Pain trigger</td><td style="${TD}">Biting, worse on release</td><td style="${TD}">Sweet, cold, spontaneous</td><td style="${TD}">Bending forward, altitude</td></tr>
<tr><td style="${TD}">Location</td><td style="${TD}">One tooth, one cusp</td><td style="${TD}">One tooth</td><td style="${TD}">Several upper teeth at once</td></tr>
<tr><td style="${TDC}">Visible on radiograph</td><td style="${TDC}">Often not</td><td style="${TDC}">Usually yes</td><td style="${TDC}">No</td></tr>
<tr><td style="${TDC}">Gets worse over months</td><td style="${TDC}">Yes, steadily</td><td style="${TDC}">Yes</td><td style="${TDC}">Comes and goes</td></tr>
</table>

<h3>How the crack got there</h3>
<ul>
<li><strong>A large old filling.</strong> The most common setting by far. A filling replaces tooth structure but does not reinforce it, so a heavily filled molar has thin walls flexing under load every time you chew.</li>
<li><strong>${D('bruxism', 'Grinding and clenching')}</strong> — repetitive overload, usually at night and usually unnoticed.</li>
<li><strong>Biting something unexpectedly hard</strong> — ice, popcorn kernels, olive pits, bones in stew, the occasional bottle cap.</li>
<li><strong>Thermal cycling</strong> — very hot food followed immediately by ice water makes enamel and dentin expand at different rates.</li>
<li><strong>A previously root-treated tooth</strong> with no crown. Dehydrated and hollowed out, these are the highest-risk teeth in the mouth.</li>
</ul>

<h3>Craze lines versus a real crack</h3>
<p>Nearly every adult has fine vertical lines in the enamel of the front teeth. These are craze lines: they stop at the enamel, cause no symptoms, and need no treatment beyond a cosmetic conversation. A crack that matters extends into dentin, and the difference is not aesthetic — it is whether the crack has reached tissue with nerve endings and a route to the pulp.</p>

<h3>What treatment depends on</h3>
<ol>
<li><strong>Crack confined to enamel and dentin, pulp still healthy.</strong> A crown or onlay that wraps the tooth and stops the segments flexing. Caught here, the prognosis is good and the pulp is usually preserved.</li>
<li><strong>Crack reaching the pulp.</strong> ${D('pulpitis', 'Pulpitis')} is already established, so root canal treatment is needed before the crown.</li>
<li><strong>Crack extending below the gum into the root.</strong> This is the outcome nobody wants. A vertical root fracture is generally not restorable and the tooth is extracted, after which ${L('/en/implant', 'implant treatment')} becomes the replacement discussion.</li>
</ol>
<div style="${WARN}"><strong>Time genuinely matters with this diagnosis.</strong> Cracks do not heal and they do not stay the same length. Every chewing cycle drives the crack a little deeper. The gap between "crown it and keep it" and "extract it" can be a matter of months, which is why vague bite pain deserves an appointment rather than a wait-and-see approach.</div>

<h3>Practical notes for patients based in Korea</h3>
<p>If you are here on a posting or a study term and have intermittent bite pain, get it examined before it becomes urgent. A crack that splits on a weekend turns a planned crown into emergency care. Our clinic is roughly 30 minutes from Camp Humphreys, English-language consultation is available, and we will give you the radiographs and a written summary for your records — useful if you PCS mid-treatment. ${L('/en/reservation', 'Book an English consultation')} or check the ${L('/en/pricing', 'price list')} first if you prefer.</p>
`,
  faqs: [
    { q: 'Why does my tooth hurt when I let go of a bite rather than when I bite down?', a: 'That pattern is characteristic of a crack. Biting separates the cracked segments slightly, and releasing lets them snap back and pinch the fluid inside the dentin tubules, which fires the nerve. Pain on release, localised to one spot, is one of the more reliable clues in dentistry and is worth reporting precisely to your dentist.' },
    { q: 'My dentist says the radiograph looks normal but it still hurts. Is that possible?', a: 'Yes, and it is common. A crack is a plane running roughly parallel to the X-ray beam, so it frequently does not show at all. Diagnosis relies on your history, a bite test on individual cusps, transillumination, and sometimes removing an old filling to look directly. A normal radiograph does not rule out a crack.' },
    { q: 'Are the fine vertical lines on my front teeth cracks?', a: 'Almost certainly craze lines, which stay within the enamel and are present in most adults. They cause no symptoms and need no treatment. A crack that matters extends into dentin, where nerve endings and a pathway to the pulp exist, and that is what produces the biting pain.' },
    { q: 'Can a cracked tooth heal by itself if I am careful?', a: 'No. Unlike bone, tooth structure has no capacity to repair a crack, and normal chewing loads keep driving it deeper. Being careful may reduce symptoms temporarily but does not change the trajectory. This is the reason delay is expensive here: the crack tends to progress from restorable to non-restorable rather than stabilising.' },
    { q: 'Why does a cracked tooth usually need a crown instead of a filling?', a: 'A filling sits inside the tooth and does nothing to stop the walls flexing, so the segments keep moving and the crack keeps propagating. A crown or onlay wraps the outside and holds the segments together, which is what actually stops the mechanism. That is why coverage rather than filling is the standard approach.' },
    { q: 'What happens if the crack has gone into the root?', a: 'A vertical crack extending down the root is generally not restorable, because no restoration can seal a fracture line running below the gum, and bacteria will keep tracking along it. Extraction is usually the honest recommendation, followed by a discussion about replacement options. This is precisely the outcome that early treatment is trying to avoid.' },
  ],
})

EN_TERMS.push({
  slug: 'tooth-fracture',
  h1: 'Tooth Fracture',
  ko: '치아 파절',
  aka: ['broken tooth', 'chipped tooth', 'fractured tooth', 'tooth broke off', 'dental trauma'],
  cat: 'Cracks & Trauma',
  tldr: 'A tooth fracture is a break in the tooth structure, ranging from a chipped enamel corner needing only smoothing to a root fracture requiring extraction. The single factor that determines treatment is depth: whether the break stops in enamel, reaches dentin, exposes the pulp, or extends below the gum. If a whole tooth has been knocked out, keep it moist and get to a dentist within the hour.',
  body: `
<h3>Classification by depth — this is what decides everything</h3>
<table style="${TBL}">
<tr><th style="${TH}">Depth</th><th style="${TH}">What you notice</th><th style="${TH}">Typical treatment</th><th style="${TH}">Urgency</th></tr>
<tr><td style="${TD}">${D('enamel', 'Enamel')} only</td><td style="${TD}">Rough edge, no pain</td><td style="${TD}">Smoothing or small bonding</td><td style="${TDC}">Routine</td></tr>
<tr><td style="${TD}">Into ${D('dentin', 'dentin')}</td><td style="${TD}">Cold and air sensitivity</td><td style="${TD}">Composite or onlay</td><td style="${TDC}">Within days</td></tr>
<tr><td style="${TD}">${D('dental-pulp', 'Pulp')} exposed</td><td style="${TD}">Sharp pain, visible red dot, bleeding</td><td style="${TD}">Pulp treatment then crown</td><td style="${TDC}">Same day</td></tr>
<tr><td style="${TD}">Crown-root fracture</td><td style="${TD}">Piece mobile, pain on any bite</td><td style="${TD}">Crown lengthening or extraction</td><td style="${TDC}">Urgent</td></tr>
<tr><td style="${TD}">Vertical root fracture</td><td style="${TD}">Deep ache, gum swelling</td><td style="${TD}">Usually extraction</td><td style="${TDC}">Urgent</td></tr>
</table>

<h3>What to do in the first hour</h3>
<ol>
<li><strong>Find the fragment</strong> if you can. Modern bonding can sometimes reattach the original piece, and the colour match is by definition perfect.</li>
<li><strong>Rinse with water only.</strong> Not alcohol, not hydrogen peroxide, and do not scrub.</li>
<li><strong>Cold compress on the outside</strong> of the lip or cheek, twenty minutes on and twenty off, to limit swelling.</li>
<li><strong>Avoid chewing on that side</strong> entirely — a partially fractured tooth splits further with very little provocation.</li>
<li><strong>Take a photograph</strong> before treatment. This helps if an insurance or unit medical claim follows.</li>
</ol>

<h3>If an entire tooth has been knocked out</h3>
<div style="${WARN}"><strong>This is the one genuine dental emergency where minutes change the outcome.</strong> Hold the tooth by the crown, never the root. Do not scrub it — the cells on the root surface are what allow reattachment. If it is dirty, rinse briefly in milk or saline. Store it in cold milk, saline, or inside your own cheek; plain water is the worst choice because it destroys those cells osmotically. Replanted within 30 minutes the prognosis is genuinely good; after two hours dry, it is poor. Go to a dentist or an emergency department immediately rather than waiting for a convenient appointment.</div>

<h3>Why some teeth fracture without any accident</h3>
<p>Many fractures in adults are not trauma at all but fatigue failure in a weakened tooth. The pattern is familiar: a molar with a large filling from twenty years ago, thin remaining walls, ${D('bruxism', 'nightly clenching')}, and one day a cusp shears off during an ordinary meal. A previously root-treated tooth without a crown is the highest-risk tooth in the mouth for exactly this reason. Frequently the tooth was already giving warning signs as ${D('cracked-tooth-syndrome', 'cracked tooth syndrome')} for months beforehand.</p>

<h3>Front teeth: function first, then appearance</h3>
<p>A chipped incisor is understandably distressing, but the sequence matters. First establish whether the pulp is alive and whether the root is intact, because a tooth that later develops a ${D('periapical-lesion', 'periapical lesion')} beneath a beautiful new restoration means redoing everything. Once the tooth is confirmed stable, the aesthetic conversation can range from composite bonding to ${L('/en/laminate', 'veneers')}. Fees are listed on our ${L('/en/pricing', 'English price page')}.</p>
<div style="${BOX}"><strong>One point often missed after front-tooth trauma:</strong> the pulp can die months or even years later, with the only sign being the tooth gradually darkening. Traumatised front teeth should be reviewed periodically even when they feel completely normal. If you notice one tooth going grey, that is a finding, not a stain.</div>

<h3>Notes for patients based in Korea</h3>
<p>Fracture treatment on a foreign visitor or SOFA status is generally settled directly rather than through Korean national insurance, so ask for the itemised estimate up front and keep receipts and radiographs for any claim to your own insurer or unit. We are about 30 minutes from Camp Humphreys and provide English-language explanation, written summaries, and copies of imaging. For anything acute, ${L('/en/reservation', 'contact us to be seen')} rather than waiting.</p>
`,
  faqs: [
    { q: 'I chipped a small corner off a tooth and it does not hurt. Do I still need to see a dentist?', a: 'Yes, though not urgently. Painless usually means the break stopped in enamel, which is the best case, but the boundary between enamel and dentin is not something you can judge by looking. A quick examination confirms the depth, and smoothing the sharp edge also prevents it catching your tongue or lip and prevents further chipping along the rough margin.' },
    { q: 'A tooth was knocked out completely. What should I do right now?', a: 'Pick it up by the crown, never the root, and do not scrub it. If dirty, rinse briefly in milk or saline, then store it in cold milk, saline, or your own cheek and get to a dentist or emergency department immediately. Replanting within 30 minutes carries a genuinely good prognosis. Avoid plain water, which destroys the root surface cells that make reattachment possible.' },
    { q: 'Should I keep the broken piece?', a: 'Yes, bring it. Fragments can sometimes be bonded back onto the tooth, and the colour and shape match is naturally perfect because it is the original tooth structure. Keep it moist in milk or saline rather than letting it dry out. Even when reattachment turns out not to be feasible, having the fragment helps in reproducing the original contour.' },
    { q: 'Why did my tooth break while I was eating something soft?', a: 'Because the break was fatigue failure rather than trauma. A molar with a large old filling has thin walls that flex with every chew, and years of loading, often with nightly clenching, propagate a crack until an ordinary bite finishes it. The soft food was the last straw, not the cause. Root-treated teeth without crowns are the most vulnerable of all.' },
    { q: 'My front tooth was injured a year ago and is now turning grey. Is that related?', a: 'Very likely yes. Trauma can kill the pulp with a long delay, and progressive darkening of a single tooth is the classic sign of a non-vital pulp staining the dentin from inside. It needs examination and a radiograph, because an infection may be forming silently at the root tip. Whitening is not the answer here and would leave the real problem untreated.' },
    { q: 'Can a fractured root be saved?', a: 'A horizontal fracture in the upper third of the root can sometimes be splinted and monitored, and a minority do stabilise. A vertical fracture running down the root generally cannot be sealed, because bacteria track along the fracture line no matter what restoration sits on top, so extraction and a replacement plan is usually the honest recommendation rather than repeated attempts to save it.' },
  ],
})

// ════════════════════════════════════════════════════════════
// GROUP 4 — Wisdom & Eruption
// ════════════════════════════════════════════════════════════

EN_TERMS.push({
  slug: 'wisdom-tooth',
  h1: 'Wisdom Tooth',
  ko: '사랑니',
  aka: ['third molar', 'wisdom teeth', 'wisdom tooth pain', 'wisdom tooth removal', 'back molar'],
  cat: 'Wisdom & Eruption',
  tldr: 'Wisdom teeth are the third molars, usually appearing between ages 17 and 25, and there is often not enough jaw room for them. They matter because a partially erupted or angled wisdom tooth traps bacteria and damages the healthy second molar in front of it. Not all need removal — a fully erupted, cleanable, upright wisdom tooth can stay. Positioning, not the mere presence of the tooth, decides.',
  body: `
<h3>Why the problem is anatomical rather than dental</h3>
<p>Human jaws have become smaller over evolutionary time while the tooth count stayed at 32. The third molars are last to arrive and inherit whatever space remains, which is frequently insufficient. The result is a tooth that erupts partially, tilts, or stays fully buried as an ${D('impacted-tooth', 'impacted tooth')}. Nothing has gone wrong with your teeth; the arithmetic simply does not work.</p>

<h3>The four positions and what each one means</h3>
<table style="${TBL}">
<tr><th style="${TH}">Position</th><th style="${TH}">Description</th><th style="${TH}">Main risk</th><th style="${TH}">Usually removed?</th></tr>
<tr><td style="${TD}">Upright, fully erupted</td><td style="${TD}">In line, reachable with a brush</td><td style="${TD}">Low if kept clean</td><td style="${TDC}">No</td></tr>
<tr><td style="${TD}">Partially erupted</td><td style="${TD}">Part of crown under a gum flap</td><td style="${TD}">Recurring infection, decay on both teeth</td><td style="${TDC}">Usually yes</td></tr>
<tr><td style="${TD}">Mesioangular (tilted forward)</td><td style="${TD}">Angled into the second molar</td><td style="${TD}">Decay and bone loss on the second molar</td><td style="${TDC}">Yes</td></tr>
<tr><td style="${TD}">Horizontal or fully buried</td><td style="${TD}">Lying sideways in bone</td><td style="${TD}">Root resorption, cyst formation</td><td style="${TDC}">Usually yes</td></tr>
</table>
<div style="${BOX}"><strong>The tooth genuinely worth protecting is the second molar, not the wisdom tooth.</strong> A forward-tilted third molar creates a narrow trap against the second molar that no brush or floss can reach. Decay then develops on the second molar root surface, in a location that is difficult to restore and sometimes impossible to save. Losing a functional second molar to protect a non-functional third molar is a bad trade, and that logic drives most removal recommendations.</div>

<h3>When removal is genuinely indicated</h3>
<ul>
<li><strong>Repeated pericoronitis</strong> — infection of the gum flap over a partially erupted tooth, with swelling, foul taste, and difficulty opening.</li>
<li><strong>Decay</strong> in the wisdom tooth or, more importantly, on the adjacent second molar.</li>
<li><strong>Bone loss</strong> forming on the back of the second molar, visible on radiograph before you feel anything.</li>
<li><strong>Cyst or radiolucency</strong> around a buried tooth.</li>
<li><strong>Root resorption</strong> of the second molar caused by pressure from the third.</li>
<li><strong>Before ${L('/en/invisalign', 'orthodontic treatment')}</strong> when the tooth interferes with planned movement.</li>
</ul>

<h3>When leaving it alone is the better decision</h3>
<p>A wisdom tooth that is fully erupted, upright, biting against an opposing tooth, and cleanable does useful work and should be kept. A deeply buried tooth with no symptoms, no cyst, and no effect on its neighbour in an older patient may also be safer monitored than removed, particularly when it sits against the inferior alveolar nerve. Blanket removal of all four on principle is not current thinking; targeted removal based on radiographic findings is.</p>

<h3>What recovery actually involves</h3>
<ol>
<li><strong>Days 1–2:</strong> peak swelling. Cold compress, prescribed medication, no smoking, no straws, no vigorous rinsing.</li>
<li><strong>Days 3–4:</strong> swelling and jaw stiffness begin to ease. Soft food, avoid the socket.</li>
<li><strong>Day 7 or so:</strong> suture review; most patients are back to normal eating.</li>
<li><strong>Weeks 2–4:</strong> gum closes over; bone fill continues for several months.</li>
</ol>
<div style="${WARN}"><strong>Two complications worth understanding before consenting.</strong> Dry socket — severe pain starting around day three when the clot is lost — is strongly associated with smoking and with rinsing too vigorously early on. Temporary numbness of the lip or tongue can occur when a lower root lies against the nerve; a CBCT scan beforehand is how that risk is assessed rather than guessed. Ask specifically about your own films rather than accepting a generic answer.</div>

<h3>Practical points for patients in Korea</h3>
<p>Wisdom tooth extraction is one of the procedures most commonly covered under Korean national insurance for those enrolled, while visitors and SOFA-status patients typically settle directly — ask for the itemised estimate and keep receipts for your own insurer. If you are approaching a PCS or a semester abroad, plan removal with recovery time rather than immediately before travel, since flying in the first few days after a difficult extraction is uncomfortable. We are around 30 minutes from Camp Humphreys with English-language consultation and take a CBCT before any lower third molar surgery. ${L('/en/reservation', 'Book a consultation')} or see the ${L('/en/pricing', 'price list')}.</p>
`,
  faqs: [
    { q: 'Do all wisdom teeth have to be removed?', a: 'No. A wisdom tooth that is fully erupted, upright, biting against an opposing tooth, and reachable with a toothbrush is a functional tooth and should be kept. Removal is indicated by position and findings: partial eruption, forward tilting into the second molar, cyst formation, decay, or bone loss behind the neighbouring tooth. Routine removal of all four regardless of position is no longer standard thinking.' },
    { q: 'My wisdom tooth does not hurt. Why remove it?', a: 'Because the damage a tilted wisdom tooth causes is usually silent. Decay on the back of the second molar and bone loss in that pocket develop without symptoms and only announce themselves once the second molar is already compromised. That neighbouring tooth is the one worth protecting, and radiographs show the problem long before you feel anything.' },
    { q: 'Is it better to have them out young?', a: 'Generally yes, if removal is indicated. In the late teens and early twenties the roots are not fully formed, the bone is more elastic, healing is faster, and the risk of nerve proximity complications is lower. The same extraction at forty is a longer procedure with a slower recovery. That said, being young is not by itself a reason to remove a well-positioned tooth.' },
    { q: 'What is pericoronitis?', a: 'It is infection of the gum flap partially covering an erupting wisdom tooth. Bacteria and food debris collect in the space under the flap, which cannot be cleaned, and the result is swelling, a foul taste, pain on biting, and sometimes difficulty opening the jaw. It typically recurs, because the anatomical trap remains after each episode settles, which is why repeated pericoronitis is a common indication for removal.' },
    { q: 'How likely is permanent nerve damage in a lower extraction?', a: 'Permanent altered sensation is uncommon, while temporary numbness is more frequent and usually resolves over weeks to months. The determining factor is how close the root sits to the inferior alveolar nerve, which is why a CBCT scan before lower third molar surgery matters. Ask your surgeon to show you your own imaging and give a risk assessment specific to your anatomy.' },
    { q: 'How long should I take off work or class?', a: 'For a straightforward erupted tooth, one to two days is usually enough. For a buried or horizontal lower tooth, plan on two to three days of reduced activity with swelling peaking around day two. Avoid scheduling removal immediately before a flight or an exam period, and do not smoke during the first several days, since that is the strongest driver of dry socket.' },
  ],
})

EN_TERMS.push({
  slug: 'impacted-tooth',
  h1: 'Impacted Tooth',
  ko: '매복치',
  aka: ['impacted teeth', 'tooth stuck in gum', 'unerupted tooth', 'buried tooth', 'impacted canine'],
  cat: 'Wisdom & Eruption',
  tldr: 'An impacted tooth is one that has failed to erupt into position and remains held in bone or gum past its expected timing. Third molars are impacted most often, followed by upper canines. It matters because an impacted tooth can resorb the roots of neighbouring teeth or form a cyst, both silently. Management ranges from monitoring to surgical exposure with orthodontic traction to removal.',
  body: `
<h3>Which teeth become impacted, and why it varies</h3>
<table style="${TBL}">
<tr><th style="${TH}">Tooth</th><th style="${TH}">Frequency</th><th style="${TH}">Typical management</th></tr>
<tr><td style="${TD}">Lower ${D('wisdom-tooth', 'third molar')}</td><td style="${TD}">Most common</td><td style="${TD}">Removal when findings warrant it</td></tr>
<tr><td style="${TD}">Upper canine</td><td style="${TD}">Second most common</td><td style="${TD}">Surgical exposure and traction into the arch</td></tr>
<tr><td style="${TD}">Upper second premolar</td><td style="${TD}">Uncommon</td><td style="${TD}">Depends on space and angle</td></tr>
<tr><td style="${TD}">Lower second molar</td><td style="${TD}">Uncommon</td><td style="${TD}">Uprighting, sometimes surgically assisted</td></tr>
</table>
<p>The upper canine deserves special attention. It is the cornerstone of the smile and of the bite, it has the longest eruption path of any tooth, and it is the one impaction where preserving rather than removing is almost always the goal. Age matters enormously: traction into position succeeds far more reliably in early adolescence than in adulthood.</p>

<h3>Why an impacted tooth is not harmless just because it is quiet</h3>
<div style="${WARN}"><strong>The two consequences that concern dentists both develop without symptoms.</strong> The first is root resorption — an impacted canine or third molar pressing on a neighbouring root can dissolve it, and the neighbour, a perfectly healthy tooth, may be lost. The second is cyst formation in the follicle around the buried crown, which expands slowly, thins the bone, and in a minority of cases reaches a size requiring major reconstruction. Neither produces pain in its early stages. This is why periodic radiographs, not the absence of symptoms, are how impaction is monitored.</div>

<h3>Signs that a tooth may be impacted</h3>
<ul>
<li>A baby tooth still firmly in place well past the usual age of replacement — the classic sign of an impacted upper canine underneath.</li>
<li>An obvious gap where a tooth should be, with the neighbouring teeth drifting.</li>
<li>A firm bulge in the palate or the outer gum where the buried crown is sitting.</li>
<li>Asymmetry — the same tooth erupted normally on the other side months ago.</li>
<li>Intermittent swelling or a bad taste from a partially erupted molar.</li>
</ul>

<h3>Treatment routes</h3>
<ol>
<li><strong>Monitor.</strong> Reasonable for a deeply buried, asymptomatic tooth with no cyst and no effect on neighbours, especially in older adults, with periodic imaging.</li>
<li><strong>Surgical exposure and traction.</strong> The gum is opened, an attachment bonded to the crown, and light orthodontic force guides the tooth into the arch over months. This is the preferred route for upper canines and is part of a broader ${L('/en/invisalign', 'orthodontic plan')}.</li>
<li><strong>Uprighting.</strong> For a tilted lower second molar, moving it into an upright position rather than removing it.</li>
<li><strong>Removal.</strong> Indicated when the tooth is damaging a neighbour, has a cyst, is causing recurring infection, or cannot realistically be brought into function. ${L('/en/implant', 'Implant replacement')} is discussed when the lost tooth is functionally important.</li>
</ol>

<h3>Why CBCT imaging changed this diagnosis</h3>
<p>A conventional two-dimensional radiograph flattens the picture, and the critical questions about an impacted tooth are three-dimensional: exactly where is the crown relative to the palate, is a neighbouring root already resorbing, and how close is the root to the nerve. Cone-beam CT answers these directly, which is why it has become standard before surgical exposure or difficult removal. Ask to see your own scan — the anatomy is usually easier to understand visually than verbally.</p>

<h3>Notes for families based in Korea</h3>
<p>If your child has a baby tooth that has not been replaced long after its counterpart on the other side, have it imaged rather than waiting further; an impacted canine treated in early adolescence has a substantially better outlook than the same tooth at twenty. For families near Camp Humphreys we are roughly 30 minutes away, consultations are conducted in English, and we provide written summaries and copies of all imaging so that treatment can be continued elsewhere if you relocate mid-course. ${L('/en/reservation', 'Book a consultation')} to have it assessed.</p>
`,
  faqs: [
    { q: 'What does it mean if a baby tooth has not fallen out but the same tooth came in on the other side?', a: 'That asymmetry is one of the most reliable signs of an impacted permanent tooth underneath, most often an upper canine. The baby tooth stays because nothing is pushing it out. It should be imaged rather than watched further, since the success of guiding an impacted canine into position drops considerably with age.' },
    { q: 'Is an impacted tooth dangerous if it never hurts?', a: 'It can be, and the absence of pain is precisely why it is monitored radiographically rather than symptomatically. The two main risks are resorption of a neighbouring root, which can cost you a healthy tooth, and cyst formation around the buried crown, which expands and thins the bone. Both are silent in their early stages and both are visible on imaging long before they are felt.' },
    { q: 'Can an impacted tooth be brought into position instead of removed?', a: 'Often yes, particularly an upper canine. The gum is surgically opened, an attachment is bonded to the crown, and gentle orthodontic force guides it into the arch over several months. Success depends on the angle, depth, and above all the patient age. For a functionally important tooth like the canine, this is generally attempted before removal is considered.' },
    { q: 'Why does my dentist want a CBCT scan rather than a normal X-ray?', a: 'Because the decisions are three-dimensional. A flat radiograph cannot reliably show whether the crown lies toward the palate or the cheek, whether a neighbouring root is already resorbing, or how close a root sits to a nerve. CBCT answers all three, which improves both surgical planning and the accuracy of the risk discussion you are asked to consent to.' },
    { q: 'Is there an age at which it becomes too late to align an impacted canine?', a: 'There is no absolute cut-off, but the odds shift steadily. In early adolescence the bone remodels readily and traction is usually successful. In adulthood the tooth may be ankylosed, effectively fused to bone, in which case it will not move regardless of the force applied and removal with a replacement plan becomes the realistic option. Earlier assessment preserves choices.' },
    { q: 'What happens if an impacted tooth is simply left alone?', a: 'Sometimes nothing for decades, which is why monitoring is a legitimate option for a deeply buried asymptomatic tooth in an older adult. The problem is that the failure modes are silent, so leaving it alone must mean periodic imaging rather than ignoring it. Left genuinely unchecked, the possible outcomes are a resorbed neighbour or an expanding cyst discovered late.' },
  ],
})

EN_TERMS.push({
  slug: 'supernumerary-tooth',
  h1: 'Supernumerary Tooth',
  ko: '과잉치',
  aka: ['extra tooth', 'supernumerary teeth', 'hyperdontia', 'mesiodens', 'extra tooth in gum'],
  cat: 'Wisdom & Eruption',
  tldr: 'A supernumerary tooth is an extra tooth beyond the normal count of 20 primary or 32 permanent teeth. The most common type is a mesiodens, sitting between the two upper front teeth, and it is usually found on a routine childhood radiograph before it causes any complaint. It matters because it can block or deflect the permanent incisors, and early detection generally means simpler treatment.',
  body: `
<h3>Where extra teeth appear</h3>
<table style="${TBL}">
<tr><th style="${TH}">Type</th><th style="${TH}">Location</th><th style="${TH}">Relative frequency</th></tr>
<tr><td style="${TD}">Mesiodens</td><td style="${TD}">Between the upper central incisors</td><td style="${TDC}">Most common</td></tr>
<tr><td style="${TD}">Distomolar</td><td style="${TD}">Behind the ${D('wisdom-tooth', 'third molar')}</td><td style="${TDC}">Common</td></tr>
<tr><td style="${TD}">Paramolar</td><td style="${TD}">Beside a molar, toward the cheek</td><td style="${TDC}">Uncommon</td></tr>
<tr><td style="${TD}">Supplemental incisor or premolar</td><td style="${TD}">A duplicate of a normal tooth</td><td style="${TDC}">Uncommon</td></tr>
</table>
<p>Extra teeth occur more often in the upper jaw than the lower and more often in boys than girls. Many are shaped abnormally — small, cone-shaped, or peg-like — which is one reason a supernumerary is often recognisable on a radiograph even before its position is clear.</p>

<h3>Why it is usually discovered by imaging rather than by symptoms</h3>
<div style="${BOX}"><strong>A supernumerary tooth commonly stays buried, and buried teeth do not hurt.</strong> The situation that brings families in is a permanent front tooth that has not arrived while its counterpart on the other side erupted months earlier, or two front teeth that came in visibly rotated or splayed apart. In both cases the underlying cause may be an extra tooth sitting in the eruption path. This is a substantial part of the argument for taking a screening radiograph around the time the permanent incisors are due.</div>

<h3>Problems an untreated supernumerary can cause</h3>
<ul>
<li><strong>Failure of eruption</strong> — the permanent incisor is physically obstructed and becomes an ${D('impacted-tooth', 'impacted tooth')}.</li>
<li><strong>Deflection</strong> — the tooth erupts but in the wrong position or angle, producing ${D('malocclusion', 'malocclusion')} that then needs correction.</li>
<li><strong>Crowding and midline shift</strong> — the extra width has to go somewhere.</li>
<li><strong>Root resorption</strong> of the adjacent permanent tooth from sustained pressure.</li>
<li><strong>Cyst formation</strong> in the follicle around the buried extra tooth.</li>
<li><strong>Plaque trap</strong> if it does erupt, since an oddly placed tooth is difficult to clean and invites ${D('gingivitis', 'gingivitis')} and decay.</li>
</ul>

<h3>How the decision is made</h3>
<ol>
<li><strong>Remove it</strong> when it is blocking or deflecting a permanent tooth, resorbing a neighbouring root, associated with a cyst, or creating an uncleanable position. Timing is chosen to protect the developing roots of the neighbouring teeth, so this is a judgement about the child's stage of development rather than simply their age.</li>
<li><strong>Monitor it</strong> when it is deeply buried, causing no obstruction, and has no cyst — with periodic imaging rather than assumption.</li>
<li><strong>Keep it</strong> in the occasional case where a supplemental tooth is well aligned, functional, and cleanable, or where it can substitute for a genuinely missing tooth.</li>
</ol>
<p>Removal is frequently only the first half of the plan. Once the obstruction is cleared, the delayed incisor often needs orthodontic guidance into position, so the surgical and ${L('/en/invisalign', 'orthodontic')} phases are planned together rather than sequentially by accident.</p>

<h3>Associated conditions worth knowing about</h3>
<p>Isolated supernumerary teeth are the norm, but multiple extra teeth can be associated with syndromes such as cleidocranial dysplasia or Gardner syndrome, and extra teeth are also more common in cleft lip and palate. Finding several extras is therefore a reason for a broader assessment, not just a dental one. A single mesiodens, by contrast, is usually an isolated finding with no systemic implication.</p>

<h3>Notes for families based in Korea</h3>
<p>If your child is around seven or eight and one upper front tooth has not appeared while the other has, ask for a radiograph rather than waiting another year. Detected early, the usual outcome is one small surgical procedure and a straightforward orthodontic phase; detected after the incisor is fully impacted and the neighbours have closed the space, treatment becomes considerably longer. We are about 30 minutes from Camp Humphreys, consultations are in English, and we provide copies of imaging and a written treatment summary so care can continue elsewhere after a PCS. ${L('/en/reservation', 'Book an assessment')}.</p>
`,
  faqs: [
    { q: 'How do I know if my child has an extra tooth?', a: 'Usually you do not, because most stay buried and buried teeth are painless. The visible clues are a permanent front tooth that has not arrived while its opposite number erupted months earlier, or front teeth that come in rotated or unusually far apart. Confirmation requires a radiograph, which is one reason a screening film around the time the permanent incisors are due is worthwhile.' },
    { q: 'What is a mesiodens?', a: 'A mesiodens is the most common supernumerary tooth, sitting in the midline between the two upper central incisors. It is often small and cone-shaped and frequently remains buried. Its significance is positional: it lies exactly in the eruption path of the permanent front teeth, so it can block or deflect them, which is why it is usually removed once identified.' },
    { q: 'Does an extra tooth always need to be removed?', a: 'No. Removal is indicated when it is obstructing or deflecting a permanent tooth, resorbing an adjacent root, associated with a cyst, or sitting somewhere that cannot be cleaned. A deeply buried extra tooth causing none of these can reasonably be monitored with periodic imaging, and occasionally a well-aligned supplemental tooth is simply kept as a functional tooth.' },
    { q: 'When is the best time to remove one?', a: 'The timing is chosen around the development of the neighbouring permanent teeth, so that surgery does not damage their forming roots, rather than at a fixed age. In practice this often means the mixed-dentition years. Waiting too long is the greater risk, because once the blocked incisor is fully impacted and the neighbours have drifted into its space, treatment becomes longer and more complex.' },
    { q: 'Will my child need braces afterwards?', a: 'Frequently yes. Removing the obstruction clears the path but does not by itself bring a delayed incisor into position, and any deflection or space loss that already occurred still needs correcting. For this reason the surgical and orthodontic phases are best planned together from the outset, which also gives you a realistic picture of the overall timeline.' },
    { q: 'Are extra teeth hereditary?', a: 'There is a familial tendency, and they occur more often in boys and more often in the upper jaw. A single extra tooth is usually an isolated finding with no wider implication. Multiple supernumerary teeth are different: they can be associated with conditions such as cleidocranial dysplasia or Gardner syndrome, so that finding warrants a broader medical assessment rather than a purely dental one.' },
  ],
})

EN_TERMS.push({
  slug: 'primary-teeth',
  h1: 'Primary Teeth (Baby Teeth)',
  ko: '유치',
  aka: ['baby teeth', 'milk teeth', 'deciduous teeth', 'children teeth', 'first teeth'],
  cat: 'Wisdom & Eruption',
  tldr: 'Primary teeth are the 20 first teeth, erupting from around six months and shed between six and twelve years. The most damaging misconception in paediatric dentistry is that they do not matter because they fall out anyway. They hold space for the permanent teeth, guide their eruption, and an infected primary tooth can damage the permanent tooth developing directly beneath it.',
  body: `
<h3>Eruption and shedding timetable</h3>
<table style="${TBL}">
<tr><th style="${TH}">Tooth</th><th style="${TH}">Erupts</th><th style="${TH}">Shed</th></tr>
<tr><td style="${TD}">Central incisor</td><td style="${TDC}">6–10 months</td><td style="${TDC}">6–7 years</td></tr>
<tr><td style="${TD}">Lateral incisor</td><td style="${TDC}">9–13 months</td><td style="${TDC}">7–8 years</td></tr>
<tr><td style="${TD}">First molar</td><td style="${TDC}">13–19 months</td><td style="${TDC}">9–11 years</td></tr>
<tr><td style="${TD}">Canine</td><td style="${TDC}">16–22 months</td><td style="${TDC}">10–12 years</td></tr>
<tr><td style="${TD}">Second molar</td><td style="${TDC}">25–33 months</td><td style="${TDC}">10–12 years</td></tr>
</table>
<p>Ranges vary widely between healthy children, and a few months either side of these figures is not a concern. What does warrant attention is marked asymmetry — the same tooth erupting on one side and not the other after several months — which can indicate an ${D('impacted-tooth', 'impacted tooth')} or a ${D('supernumerary-tooth', 'supernumerary tooth')} in the way.</p>

<h3>Why they are not disposable</h3>
<div style="${BOX}"><strong>A primary molar is a space maintainer that happens to also chew.</strong> Lose one early and the neighbouring teeth drift into the gap within months. The permanent tooth then has nowhere to go and erupts sideways, becomes impacted, or arrives to find the space closed — turning a filling that was declined at age six into ${L('/en/invisalign', 'orthodontic treatment')} at age twelve. This is the single most common way that early neglect becomes expensive later.</div>
<ul>
<li><strong>Space maintenance</strong> — holding the arch length for the permanent successor.</li>
<li><strong>Eruption guidance</strong> — the resorbing primary root acts as a path for the permanent tooth.</li>
<li><strong>Chewing and nutrition</strong> during the years of fastest growth.</li>
<li><strong>Speech development</strong> — the front teeth are involved in forming several sounds.</li>
<li><strong>Jaw growth stimulation</strong> through normal chewing loads.</li>
</ul>

<h3>Why decay moves faster in a baby tooth</h3>
<p>Primary ${D('enamel', 'enamel')} is roughly half the thickness of permanent enamel and the ${D('dental-pulp', 'pulp')} chamber is proportionally much larger. The consequence is that ${D('dental-caries', 'decay')} reaches the nerve far sooner than a parent expects. A small brown spot on a primary molar is not the early stage that the same spot would represent on an adult tooth. Speed of intervention matters more in children, not less.</p>
<div style="${WARN}"><strong>An abscess on a primary tooth can damage the permanent tooth forming beneath it.</strong> The developing permanent crown sits directly under the primary root, and infection in that area can disturb enamel formation, leaving the adult tooth permanently discoloured or malformed when it eventually erupts. This is the clearest answer to "why treat a tooth that is going to fall out": the tooth being protected is the one underneath.</div>

<h3>Practical prevention</h3>
<ol>
<li><strong>Wipe the gums</strong> before any teeth arrive, and brush from the first tooth.</li>
<li><strong>No bottle in bed.</strong> Milk or juice pooling around the upper front teeth overnight produces early childhood caries, sometimes severe by age three.</li>
<li><strong>Brush for them until around age eight.</strong> The manual dexterity for effective brushing arrives later than most parents assume, and supervising is not distrust, it is mechanics.</li>
<li><strong>Fluoride application and sealants</strong> on primary molars, which have deep grooves that a brush cannot enter.</li>
<li><strong>First dental visit by the first birthday</strong> — the value early on is establishing habits and familiarity, so that the first visit is not also the first emergency.</li>
</ol>

<h3>Common questions parents raise</h3>
<p>A loose tooth is best left to the child's own wiggling; it will shed when the root has resorbed. A permanent tooth erupting behind a baby tooth that is still firm — often seen with lower incisors — is common and usually resolves, but should be checked if the primary tooth stays solid. A permanent tooth that erupts looking distinctly more yellow than the baby teeth around it is normal, because permanent ${D('dentin', 'dentin')} is thicker and shows through more.</p>

<h3>Notes for families based in Korea</h3>
<p>Paediatric dental coverage under Korean national insurance applies to enrolled residents; visiting and SOFA-status families generally settle directly, so ask for the itemised estimate up front. If a PCS is approaching, ask for copies of your child's radiographs and a written treatment summary — dental records for children are particularly worth carrying, since eruption timing and prior treatment history inform whatever comes next. We are roughly 30 minutes from Camp Humphreys with English-language consultation. ${L('/en/reservation', 'Book a check-up')}.</p>
`,
  faqs: [
    { q: 'Why treat a cavity in a tooth that is going to fall out anyway?', a: 'Because of what sits underneath. An untreated cavity can reach the nerve and cause an abscess, and the permanent tooth is developing directly beneath that primary root, so the infection can disturb its enamel formation and leave the adult tooth permanently marked. Beyond that, an early extraction lets neighbouring teeth close the space the permanent tooth needs.' },
    { q: 'Do baby teeth decay faster than adult teeth?', a: 'Yes, considerably. Primary enamel is about half as thick and the pulp chamber is proportionally much larger, so decay reaches the nerve much sooner. A small brown spot on a baby molar represents a more advanced situation than the same spot on an adult tooth would, which is why prompt treatment matters more in children rather than less.' },
    { q: 'What happens if a baby molar is lost early?', a: 'The neighbouring teeth drift into the gap, often within months, and the permanent successor loses the space it needs. It then erupts out of position, becomes impacted, or is blocked entirely, and correcting that later usually means orthodontic treatment. A space maintainer placed after an early loss is a small appliance that prevents a much larger problem.' },
    { q: 'When should my child first see a dentist?', a: 'By the first birthday. The purpose at that stage is not treatment but establishing familiarity and reviewing habits such as bottle use, brushing technique, and fluoride. Children whose first visit happens before anything hurts tend to be far more comfortable with dentistry for life, whereas a first visit that is also an emergency sets an unhelpful pattern.' },
    { q: 'My child brushes on their own. Is that enough?', a: 'Usually not before around age eight. The fine motor control needed to clean the inner surfaces and back molars effectively develops later than most parents expect, so children who brush enthusiastically still miss the areas where decay actually starts. Letting them brush first and then going over it yourself preserves independence while ensuring the job gets done.' },
    { q: 'My child\u2019s new permanent tooth looks yellower than the baby teeth. Is something wrong?', a: 'Almost certainly not. Permanent teeth have thicker dentin, which is naturally yellower and shows through the enamel more, so a new adult tooth beside remaining baby teeth genuinely looks darker by comparison. The contrast fades once the surrounding baby teeth are replaced. A single tooth that is grey rather than yellow is different and should be examined.' },
  ],
})

// ════════════════════════════════════════════════════════════
// GROUP 5 — Bite & Jaw
// ════════════════════════════════════════════════════════════

EN_TERMS.push({
  slug: 'malocclusion',
  h1: 'Malocclusion',
  ko: '부정교합',
  aka: ['bad bite', 'crooked teeth', 'overbite', 'underbite', 'crowded teeth', 'crossbite'],
  cat: 'Bite & Jaw',
  tldr: 'Malocclusion means the teeth and jaws do not meet in a functional relationship — crowding, spacing, overbite, underbite, crossbite, or open bite. It is not only an appearance question: an uneven bite concentrates force on individual teeth, creates areas that cannot be cleaned, and contributes to wear, fracture, and gum disease. Some types are best corrected during growth, others can be treated at any age.',
  body: `
<h3>The main patterns</h3>
<table style="${TBL}">
<tr><th style="${TH}">Type</th><th style="${TH}">What it looks like</th><th style="${TH}">Main functional concern</th></tr>
<tr><td style="${TD}">Crowding</td><td style="${TD}">Overlapping, rotated teeth</td><td style="${TD}">Uncleanable contacts, decay and ${D('gingivitis', 'gum inflammation')}</td></tr>
<tr><td style="${TD}">Deep bite</td><td style="${TD}">Upper front teeth cover the lower excessively</td><td style="${TD}">Lower incisor wear, gum trauma</td></tr>
<tr><td style="${TD}">Underbite</td><td style="${TD}">Lower teeth sit ahead of upper</td><td style="${TD}">Chewing inefficiency, jaw strain</td></tr>
<tr><td style="${TD}">Crossbite</td><td style="${TD}">One or more teeth bite inside the opposing arch</td><td style="${TD}">Asymmetric jaw function, localised wear</td></tr>
<tr><td style="${TD}">Open bite</td><td style="${TD}">Front teeth do not meet when back teeth close</td><td style="${TD}">Cannot incise food, speech effects</td></tr>
<tr><td style="${TD}">Spacing</td><td style="${TD}">Gaps between teeth</td><td style="${TD}">Food impaction, aesthetic concern</td></tr>
</table>

<h3>Why this is a health matter and not only cosmetic</h3>
<div style="${BOX}"><strong>Occlusion is a load distribution problem.</strong> A well-aligned arch spreads chewing force across many teeth. A malocclusion concentrates it on a few, and those few show the consequences: flattened cusps, ${D('cracked-tooth-syndrome', 'cracks')}, gum recession on the overloaded side, and eventually ${D('tooth-fracture', 'fracture')}. Add crowded contacts that neither brush nor floss can reach, and you have the two main drivers of tooth loss — decay and periodontal disease — operating in the same mouth for structural reasons rather than behavioural ones.</div>

<h3>What causes it</h3>
<ul>
<li><strong>Inherited jaw and tooth size mismatch</strong> — the largest single factor, and the reason malocclusion runs in families.</li>
<li><strong>Early loss of ${D('primary-teeth', 'primary teeth')}</strong> allowing neighbours to close the space needed by the permanent tooth.</li>
<li><strong>Prolonged thumb sucking or tongue thrust</strong> — a common cause of anterior open bite.</li>
<li><strong>Mouth breathing</strong>, often from chronic nasal obstruction, which alters facial and arch development.</li>
<li><strong>${D('supernumerary-tooth', 'Extra')} or congenitally missing teeth.</strong></li>
<li><strong>Unreplaced missing teeth in adults</strong> — remaining teeth tip and drift into the gap, and the opposing tooth over-erupts.</li>
</ul>

<h3>Timing: what genuinely benefits from early treatment</h3>
<ol>
<li><strong>Around ages 7–9</strong> — a first assessment. Crossbites, severe crowding, and skeletal discrepancies can be influenced while the jaws are still growing, and some later surgery is avoided at this stage.</li>
<li><strong>Ages 11–14</strong> — the conventional comprehensive phase, once most permanent teeth are present.</li>
<li><strong>Adulthood</strong> — tooth alignment is entirely achievable at any age, and ${L('/en/invisalign', 'clear aligner treatment')} has made adult treatment far more acceptable socially. What changes with age is that jaw position itself can no longer be influenced by growth, so significant skeletal discrepancies require a surgical option rather than appliances alone.</li>
</ol>
<div style="${WARN}"><strong>Two expectations worth setting honestly.</strong> First, retention is permanent, not optional — teeth drift for life, and every case that relapses is a case where retainer wear stopped. Second, alignment must be planned around existing dental health: active gum disease should be controlled before orthodontic force is applied to teeth with reduced bone support, otherwise the treatment accelerates the very problem it was meant to help. Fees for aligner and retainer treatment are on our ${L('/en/pricing', 'English price list')}.</div>

<h3>Notes for patients based in Korea</h3>
<p>Orthodontics is a long commitment, which makes it awkward for people on fixed-length postings. If you have eighteen months or less in Korea, discuss that timeline explicitly at the consultation — a plan can often be staged so that a clear transfer point exists, and aligner treatment in particular travels reasonably well with adequate records. Ask for the digital scan files, the treatment plan, and radiographs in a portable format before you leave. We are around 30 minutes from Camp Humphreys with English-language consultation and written treatment plans. ${L('/en/reservation', 'Book an orthodontic consultation')}.</p>
`,
  faqs: [
    { q: 'Is crooked teeth only a cosmetic problem?', a: 'No. Misalignment concentrates chewing force on a few teeth rather than distributing it, producing wear, cracks, and gum recession on the overloaded ones. It also creates overlapping contacts that a brush and floss cannot reach, which raises decay and gum disease risk in specific spots. The aesthetic dimension is real, but the structural consequences are what make it a health issue.' },
    { q: 'At what age should my child first be assessed?', a: 'Around seven to nine. Not because treatment usually starts then, but because that is when a crossbite, a developing skeletal discrepancy, or severe crowding can still be influenced by growth. Some cases treated at this stage avoid surgery later. If nothing needs doing, the outcome is simply periodic review until the permanent teeth are in.' },
    { q: 'Am I too old for orthodontic treatment?', a: 'No. Teeth move in response to force at any age, and adult treatment is now common, particularly with clear aligners. The one genuine difference is that jaw position can no longer be changed by guiding growth, so a significant skeletal discrepancy in an adult requires a surgical option rather than appliances alone. Tooth alignment itself remains entirely achievable.' },
    { q: 'Why do I have to wear a retainer forever?', a: 'Because teeth drift throughout life, with or without prior orthodontics. The fibres and bone around a moved tooth remodel over years, and the surrounding soft tissues keep applying force indefinitely. Almost every relapse case is a case where retainer wear stopped. Treating retention as the permanent maintenance phase rather than an optional aftercare step is what protects the result.' },
    { q: 'Can I get braces if I have gum disease?', a: 'Not until it is controlled. Applying orthodontic force to teeth with reduced bone support and active inflammation accelerates attachment loss, so the sequence must be periodontal treatment first, stability confirmed, then alignment with careful monitoring. Done in that order, orthodontics can actually help by making crowded areas cleanable. Done in the wrong order, it causes harm.' },
    { q: 'I am on a two-year posting in Korea. Is it realistic to start?', a: 'Often yes, but the timeline needs to be on the table from the first consultation rather than raised at the end. Many plans can be staged around a defined transfer point, and aligner treatment transfers relatively well when the digital scans, plan, and radiographs go with you. What causes problems is starting without discussing the departure date and improvising later.' },
  ],
})

EN_TERMS.push({
  slug: 'bruxism',
  h1: 'Bruxism (Teeth Grinding)',
  ko: '이갈이',
  aka: ['teeth grinding', 'clenching', 'grinding teeth at night', 'jaw clenching', 'sleep bruxism'],
  cat: 'Bite & Jaw',
  tldr: 'Bruxism is involuntary grinding or clenching of the teeth, most often during sleep and usually without the person being aware of it. Night-time forces greatly exceed normal chewing forces, which is why bruxism is a leading cause of flattened teeth, cracked molars, failed restorations, and morning jaw pain. It cannot be cured outright, but the damage is largely preventable with protection.',
  body: `
<h3>How you find out you are doing it</h3>
<p>Almost nobody notices their own night-time grinding. The evidence arrives indirectly:</p>
<ul>
<li>Jaw muscles tired or aching on waking, sometimes a dull morning headache at the temples.</li>
<li>Teeth sensitive to cold in the morning, easing as the day goes on.</li>
<li>Visibly flattened cusps and worn front teeth that look shorter than they used to.</li>
<li>Fillings, crowns, or veneers that keep chipping or debonding for no obvious reason.</li>
<li>A partner reporting the sound.</li>
<li>Ridged indentations along the inside of the cheeks, or a scalloped tongue edge.</li>
</ul>
<div style="${BOX}"><strong>The scale of the force is the part patients underestimate.</strong> Normal chewing is intermittent and modulated by protective reflexes. Sleep bruxism bypasses much of that regulation and applies sustained load for far longer than any meal. That is why a tooth that survived thirty years of eating can fail from grinding, and why grinding is the single most common reason a technically excellent crown or veneer fails early.</div>

<h3>Contributing factors</h3>
<table style="${TBL}">
<tr><th style="${TH}">Factor</th><th style="${TH}">Note</th></tr>
<tr><td style="${TD}">Stress and anxiety</td><td style="${TD}">The most commonly reported association; often worsens in identifiable periods</td></tr>
<tr><td style="${TD}">Sleep-disordered breathing</td><td style="${TD}">Grinding frequently clusters around apnoea events — worth screening for</td></tr>
<tr><td style="${TD}">Caffeine, alcohol, nicotine</td><td style="${TD}">All associated with increased night-time episodes</td></tr>
<tr><td style="${TD}">Some medications</td><td style="${TD}">Certain antidepressants and stimulants; discuss rather than stop unilaterally</td></tr>
<tr><td style="${TD}">${D('malocclusion', 'Bite discrepancies')}</td><td style="${TD}">A contributing rather than a sole cause in current thinking</td></tr>
</table>
<div style="${WARN}"><strong>Loud grinding with daytime sleepiness deserves a sleep evaluation, not just a mouthguard.</strong> When bruxism is occurring alongside obstructive sleep apnoea, a guard protects the teeth but leaves the breathing problem — which carries cardiovascular and metabolic consequences — entirely unaddressed. If you snore heavily, wake unrefreshed, or have been told you stop breathing, say so at the dental consultation. It changes the plan.</div>

<h3>What the damage looks like clinically</h3>
<ol>
<li><strong>Wear.</strong> Enamel flattens, then ${D('dentin', 'dentin')} is exposed, producing generalised sensitivity and progressive shortening of the teeth.</li>
<li><strong>Cracks.</strong> ${D('cracked-tooth-syndrome', 'Cracked tooth syndrome')} in heavily filled molars, frequently progressing to ${D('tooth-fracture', 'fracture')}.</li>
<li><strong>Restoration failure.</strong> Chipped porcelain, debonded veneers, fractured cusps around large fillings.</li>
<li><strong>Muscle and joint effects.</strong> Masseter hypertrophy, morning stiffness, and contribution to ${D('tmj-disorder', 'TMJ disorder')}.</li>
<li><strong>Gum recession and abfraction</strong> notches at the gumline on overloaded teeth.</li>
</ol>

<h3>Management that actually works</h3>
<ul>
<li><strong>An occlusal splint made to your own bite.</strong> The mainstay. It does not stop the grinding but redistributes the force and sacrifices the appliance instead of your enamel. A properly fitted custom splint is not interchangeable with an over-the-counter boil-and-bite guard, which can alter the bite and in some cases worsen joint symptoms.</li>
<li><strong>Sleep evaluation</strong> where breathing symptoms are present.</li>
<li><strong>Evening habit changes</strong> — reducing caffeine and alcohol, and giving the jaw a genuine wind-down period.</li>
<li><strong>Daytime awareness training</strong> for clenchers, who often hold the teeth together while concentrating; teeth apart at rest is the target.</li>
<li><strong>Masseter botulinum injection</strong> in selected cases of severe muscle hyperactivity, as an adjunct rather than a first step.</li>
<li><strong>Rebuilding worn teeth</strong> only after the grinding is controlled — restoring first and protecting later is how expensive work gets destroyed twice.</li>
</ul>

<h3>Notes for patients based in Korea</h3>
<p>Postings, relocations, and deployment cycles are exactly the circumstances under which bruxism tends to intensify, and it is worth mentioning a period of high stress at your appointment rather than treating the worn teeth in isolation. If you already have a splint from home, bring it — we can assess whether it still fits after any dental work. We are roughly 30 minutes from Camp Humphreys, consultations are in English, and splint fabrication is straightforward to complete within a short stay. ${L('/en/reservation', 'Book a consultation')} or review the ${L('/en/pricing', 'price list')}.</p>
`,
  faqs: [
    { q: 'How can I tell if I grind my teeth in my sleep?', a: 'Rarely by noticing it directly. The usual signs are jaw muscles that ache on waking, morning temple headaches, teeth that are sensitive to cold in the morning but settle later, visibly flattened cusps, and restorations that keep chipping without explanation. A partner hearing the sound is common. A dentist can also see the characteristic wear pattern before you have any symptoms.' },
    { q: 'Does a mouthguard stop the grinding?', a: 'No, and that is worth understanding. A splint does not switch off the muscle activity; it redistributes the load and sacrifices the appliance instead of your enamel. That is still enormously valuable, because it converts progressive irreversible tooth destruction into replaceable plastic wear. Addressing contributing factors is what reduces the grinding itself.' },
    { q: 'Are over-the-counter boil-and-bite guards good enough?', a: 'They are better than nothing for short-term protection but carry real drawbacks. Because they are not made to your own bite, they can hold the jaw in an unfavourable position, cause teeth to shift over months, and in some patients aggravate joint symptoms. A custom splint made from impressions or a scan of your own arches avoids these problems and lasts far longer.' },
    { q: 'Why does bruxism destroy crowns and veneers so often?', a: 'Because night-time forces are sustained and largely unmodulated by the protective reflexes that regulate chewing, so they exceed what restorative materials are designed to tolerate. A technically excellent crown can fail early purely from grinding load. This is why the sequence matters: control and protect first, then restore, rather than rebuilding teeth that will be ground down again.' },
    { q: 'Is grinding related to snoring or sleep apnoea?', a: 'There is a well-recognised association, with grinding episodes often clustering around breathing disruptions. This matters clinically, because treating only the teeth leaves a condition with cardiovascular and metabolic consequences unaddressed. If you snore loudly, wake unrefreshed, or have been told you stop breathing at night, mention it, as it should redirect part of the workup.' },
    { q: 'Will it go away if my stress reduces?', a: 'It often improves, and many patients notice their grinding tracks identifiable periods of pressure such as a relocation or a deployment cycle. It rarely disappears permanently, though, and it tends to return with the next stressful stretch. For that reason protection is treated as ongoing rather than temporary, especially once there is expensive restorative work to preserve.' },
  ],
})

EN_TERMS.push({
  slug: 'tmj-disorder',
  h1: 'TMJ Disorder (TMD)',
  ko: '턱관절 장애',
  aka: ['TMD', 'TMJ', 'jaw joint pain', 'temporomandibular disorder', 'jaw pain', 'lockjaw'],
  cat: 'Bite & Jaw',
  tldr: 'TMJ disorder covers pain and dysfunction of the jaw joint and the muscles that move it, presenting as jaw pain, clicking, limited opening, and frequently headaches or ear discomfort. Most cases are muscular rather than structural and improve with conservative care. Irreversible treatment — grinding down teeth or surgery — should not be a first step, and rarely needs to be.',
  body: `
<h3>What the joint is doing when it hurts</h3>
<p>The temporomandibular joint is unusual: it both rotates and slides, it is paired so that both sides must move together, and a fibrous disc sits between the bones to distribute load. Pain can arise from the muscles, from the disc position, from the joint surfaces, or from a combination. Distinguishing which one dominates is what determines treatment, and it is the reason a careful history matters more here than in almost any other dental complaint.</p>

<table style="${TBL}">
<tr><th style="${TH}">Type</th><th style="${TH}">Typical presentation</th><th style="${TH}">Prognosis</th></tr>
<tr><td style="${TD}">Muscular (myogenous)</td><td style="${TD}">Diffuse ache, tender muscles, worse with stress and on waking</td><td style="${TD}">Good with conservative care</td></tr>
<tr><td style="${TD}">Disc displacement with reduction</td><td style="${TD}">${D('tmj-clicking', 'Clicking')} on opening, normal range</td><td style="${TD}">Often stable long term</td></tr>
<tr><td style="${TD}">Disc displacement without reduction</td><td style="${TD}">Sudden limited opening, clicking stops</td><td style="${TD}">Needs prompt assessment</td></tr>
<tr><td style="${TD}">Degenerative joint disease</td><td style="${TD}">Grating crepitus, stiffness, older patients</td><td style="${TD}">Managed rather than cured</td></tr>
</table>

<h3>Why it is so often mistaken for something else</h3>
<div style="${BOX}"><strong>Patients with TMD frequently arrive having already seen someone about their ears.</strong> The joint sits directly in front of the ear canal, so joint pain is commonly experienced as earache, fullness, or even tinnitus, and a normal ear examination leaves the patient without an answer. Referred pain to the temple mimics tension headache, and pain along the jawline can be taken for toothache in a completely healthy tooth. If you have had a tooth investigated repeatedly with no findings, the joint and muscles deserve a look.</div>

<h3>Contributing factors</h3>
<ul>
<li><strong>${D('bruxism', 'Grinding and clenching')}</strong> — sustained muscle overload is the most common driver.</li>
<li><strong>Stress</strong>, which raises resting muscle tone and daytime clenching.</li>
<li><strong>Trauma</strong> to the jaw or a whiplash injury.</li>
<li><strong>Prolonged wide opening</strong> — long dental appointments, intubation, extended yawning.</li>
<li><strong>Habits</strong> such as chewing gum for hours, ice chewing, or nail biting.</li>
<li><strong>Systemic joint disease</strong> including rheumatoid arthritis.</li>
<li><strong>Sleeping position</strong> and postural strain, particularly forward head posture.</li>
</ul>

<h3>Conservative management, in order</h3>
<ol>
<li><strong>Load reduction.</strong> Soft diet for a defined period, no gum, cut food into small pieces, avoid wide opening. This alone resolves a meaningful share of acute muscular cases.</li>
<li><strong>Heat and gentle stretching</strong> for muscular pain; cold for acute joint inflammation.</li>
<li><strong>A stabilisation splint</strong> where grinding is a factor, protecting both the teeth and the joint.</li>
<li><strong>Physiotherapy</strong> — jaw exercises, posture correction, and manual therapy have good support.</li>
<li><strong>Short-term medication</strong> as advised, typically anti-inflammatory and sometimes muscle relaxant.</li>
<li><strong>Stress management</strong>, which is not a dismissal of the pain but a treatment of one of its mechanisms.</li>
</ol>
<div style="${WARN}"><strong>Be cautious about irreversible treatment offered early.</strong> Extensive grinding of tooth surfaces to "correct the bite", full-mouth reconstruction, or joint surgery as an initial response to TMD pain is not supported by current evidence and cannot be undone if it does not help. The overwhelming majority of cases respond to reversible, conservative measures. If irreversible work is being proposed before conservative care has been tried properly, a second opinion is entirely reasonable. This information is general and not a diagnosis — an in-person examination is needed for that.</div>

<h3>One situation that is genuinely urgent</h3>
<p>A sudden inability to open more than about two centimetres, particularly in someone whose jaw used to click and has now stopped clicking, suggests the disc has become stuck in front of the condyle. Early treatment has a much better chance of restoring normal movement than treatment months later, once the tissues have adapted. Do not wait this one out.</p>

<h3>Notes for patients based in Korea</h3>
<p>TMD symptoms commonly flare in periods of relocation, deployment, or examination pressure, so mention what has changed in your circumstances rather than only where it hurts. We are about 30 minutes from Camp Humphreys with English-language consultation, and we begin with reversible measures and a clear review point rather than committing to structural treatment at a first visit. ${L('/en/reservation', 'Book an English consultation')}.</p>
`,
  faqs: [
    { q: 'Could my jaw joint be causing my earache?', a: 'Quite possibly. The joint sits immediately in front of the ear canal, so joint and muscle pain is very often experienced as earache, fullness, or tinnitus, and many patients arrive after a normal ear examination left them without an explanation. If ear pain worsens with chewing or wide opening and no ear pathology was found, the joint is a reasonable next thing to examine.' },
    { q: 'Does TMJ disorder require surgery?', a: 'Very rarely. The large majority of cases are muscular or involve disc position that responds to reversible measures: load reduction, heat and stretching, physiotherapy, a splint where grinding contributes, and short-term medication. Surgery is reserved for a small minority with specific structural pathology after conservative care has genuinely failed, not as an early option.' },
    { q: 'My jaw suddenly will not open more than two centimetres. Is that urgent?', a: 'Yes, particularly if it used to click and the clicking has now stopped. That combination suggests the disc has become lodged in front of the joint and is physically blocking movement. Early intervention has a considerably better chance of restoring normal opening than treatment delayed by months, so this is one presentation that should not be waited out.' },
    { q: 'Should I have my bite adjusted to fix TMD?', a: 'Not as a first step. Irreversibly grinding tooth surfaces or undertaking full-mouth reconstruction for TMD pain is not supported by current evidence and cannot be reversed if symptoms persist. Reversible measures should be tried properly first. If extensive irreversible work is proposed before that, seeking a second opinion is entirely reasonable and often clarifying.' },
    { q: 'Is stress really a cause, or is that just a way of dismissing it?', a: 'It is a genuine mechanism, not a dismissal. Stress raises resting muscle tone and increases daytime clenching and night-time grinding, and sustained muscle overload is the most common driver of TMD pain. The pain is entirely physical. Addressing stress is treating one of its causes, which is why symptoms so often flare during relocations, deployments, or exam periods.' },
    { q: 'How long does it take to get better?', a: 'Acute muscular cases often improve substantially within two to four weeks of consistent load reduction and self-care. Longer-standing cases usually improve gradually over months and may fluctuate with stress rather than resolving in a straight line. Steady adherence to conservative measures outperforms escalating to aggressive treatment, and a defined review point helps judge progress objectively.' },
  ],
})

EN_TERMS.push({
  slug: 'tmj-clicking',
  h1: 'TMJ Clicking',
  ko: '턱에서 소리',
  aka: ['jaw clicking', 'jaw popping', 'clicking jaw', 'jaw noise when chewing', 'popping jaw joint'],
  cat: 'Bite & Jaw',
  tldr: 'A clicking or popping jaw usually means the disc inside the joint is slipping out of position and snapping back as you open. Painless clicking with a full range of movement is common and generally does not require treatment. What matters is a change: clicking that becomes painful, or clicking that stops and is replaced by limited opening, which needs prompt assessment.',
  body: `
<h3>What is producing the sound</h3>
<p>A fibrous disc normally sits on top of the condyle and travels with it as the jaw opens. If the disc slips slightly forward, the condyle has to jump over its back edge to get underneath — and that is the click. On closing, the disc slips forward again, which is why many people notice a second, quieter click. The sound itself is mechanical, not a sign of damage in progress.</p>

<h3>Reading your own symptoms</h3>
<table style="${TBL}">
<tr><th style="${TH}">Pattern</th><th style="${TH}">Likely meaning</th><th style="${TH}">Action</th></tr>
<tr><td style="${TD}">Painless click, full opening</td><td style="${TD}">Disc displacement that reduces</td><td style="${TD}">Monitor, no treatment needed</td></tr>
<tr><td style="${TD}">Click plus pain</td><td style="${TD}">Inflammation or muscle involvement</td><td style="${TD}">Assessment, conservative care</td></tr>
<tr><td style="${TD}">Click stopped, opening now limited</td><td style="${TD}">Disc no longer reducing — stuck</td><td style="${TDC}">Prompt assessment</td></tr>
<tr><td style="${TD}">Grating or sandy sound</td><td style="${TD}">Degenerative joint change</td><td style="${TD}">Assessment and long-term management</td></tr>
<tr><td style="${TD}">Locks open occasionally</td><td style="${TD}">Hypermobility or subluxation</td><td style="${TD}">Assessment, avoid wide opening</td></tr>
</table>
<div style="${BOX}"><strong>The most counter-intuitive point: clicking stopping is not necessarily good news.</strong> If the click disappears and your opening simultaneously becomes restricted, the likely explanation is not that the joint healed but that the disc has become stuck in front of the condyle and no longer snaps back — so there is nothing left to make the noise. Silence with limited movement is a reason to be seen soon, not a reason to relax.</div>

<h3>Why painless clicking usually needs no treatment</h3>
<p>Joint noises are common in the general population, and many people click for decades without pain or loss of function. Chasing a painless click with splints, bite adjustment, or surgery risks creating a problem where there was only a sound. The reasonable approach is to leave it alone, avoid habits that overload the joint, and know which changes would warrant attention. Sensible self-care means limiting wide opening, not chewing gum for long periods, cutting hard food into pieces, and controlling ${D('bruxism', 'grinding')} if present.</p>

<h3>What to avoid, and what actually helps</h3>
<ul>
<li><strong>Do not test it repeatedly.</strong> Deliberately clicking the jaw to check whether it still clicks aggravates the tissues and is remarkably common.</li>
<li><strong>Support your jaw when yawning</strong> — a hand under the chin limits the extreme opening that provokes episodes.</li>
<li><strong>Avoid sustained chewing</strong> of gum, tough meat, or ice.</li>
<li><strong>Chew on both sides.</strong> Favouring one side, often because of a sore tooth, overloads the other joint.</li>
<li><strong>Warn your dentist</strong> before long appointments so the jaw can be rested at intervals.</li>
<li><strong>Address grinding</strong> with a properly fitted splint if it is contributing, as ongoing overload is what tends to turn painless clicking into painful ${D('tmj-disorder', 'TMJ disorder')}.</li>
</ul>
<div style="${WARN}"><strong>See someone promptly if</strong> the sound becomes painful, your opening reduces noticeably, the jaw locks either closed or open, your bite starts feeling different from one day to the next, or the noise changes from a click to a grating crepitus. These are the transitions that change management. General information like this is not a diagnosis; an in-person examination of the joint and muscles is required for that.</div>

<h3>Notes for patients based in Korea</h3>
<p>If you have clicked painlessly for years, that history is genuinely useful information and worth mentioning at a routine check-up so that it is recorded as a baseline rather than discovered as a new finding later. Should the pattern change during your posting, being seen early is the difference between reversible care and prolonged limited opening. We are roughly 30 minutes from Camp Humphreys, consultation is available in English, and we manage joint symptoms conservatively before considering anything irreversible. ${L('/en/reservation', 'Book a consultation')}.</p>
`,
  faqs: [
    { q: 'My jaw clicks but does not hurt. Do I need treatment?', a: 'Generally no. Painless clicking with a full range of opening is common and many people experience it for decades without developing problems. Treating a painless click with splints, bite adjustment, or surgery risks creating a problem where only a sound existed. Sensible self-care and knowing which changes matter is the appropriate response.' },
    { q: 'What actually makes the clicking sound?', a: 'The disc that normally sits on top of the jaw condyle has slipped slightly forward, so the condyle must jump over its back edge to get underneath as you open, producing the click. On closing, the disc slips forward again, which is why a second quieter click is often noticed. The sound is mechanical and does not itself indicate ongoing damage.' },
    { q: 'My clicking stopped but now I cannot open wide. Is that improvement?', a: 'Unfortunately the opposite is more likely. Clicking disappearing alongside reduced opening usually means the disc has become stuck in front of the condyle and no longer snaps back, so there is nothing left to make the noise while it now physically blocks movement. Prompt assessment gives a much better chance of restoring normal opening than waiting months.' },
    { q: 'Will clicking get worse over time?', a: 'Not necessarily, and most painless clicking remains stable. What raises the risk of progression is continued overload: nightly grinding, prolonged gum chewing, habitually favouring one side, and repeatedly testing the click deliberately. Reducing those loads is the practical way to keep a harmless noise harmless rather than pursuing active treatment for it.' },
    { q: 'Can exercises stop the clicking?', a: 'Jaw exercises and physiotherapy can help meaningfully with pain, muscle tension, and range of movement, and are well supported for those goals. They are less reliable at eliminating the click itself, because the disc position that produces the sound may not change. That is an acceptable outcome, since comfortable function matters more clinically than whether a noise persists.' },
    { q: 'Is a grating sound different from a click?', a: 'Yes, and it is worth distinguishing. A discrete click or pop points to disc movement, while a grating or sandy sound across the whole range suggests degenerative change in the joint surfaces, which is more common with age and managed rather than cured. A change in the character of the noise from click to grating is a reason to be reassessed.' },
  ],
})

// ════════════════════════════════════════════════════════════
// GROUP 6 — Mouth & Tongue
// ════════════════════════════════════════════════════════════

EN_TERMS.push({
  slug: 'halitosis',
  h1: 'Halitosis (Bad Breath)',
  ko: '구취',
  aka: ['bad breath', 'oral malodour', 'morning breath', 'breath smells', 'chronic bad breath'],
  cat: 'Mouth & Tongue',
  tldr: 'Halitosis is persistent bad breath, and in roughly 85 to 90 percent of cases the source is inside the mouth rather than the stomach. The commonest single site is the back of the tongue, where bacteria break down proteins into volatile sulphur compounds. Because it is a bacterial and often mechanical problem, mouthwash and mints mask it briefly while doing nothing about the cause.',
  body: `
<h3>Where the smell actually comes from</h3>
<p>Certain oral bacteria metabolise protein and release volatile sulphur compounds — hydrogen sulphide, methyl mercaptan, dimethyl sulphide. These are the same molecules responsible for the smell of rotting eggs and cabbage, and the human nose detects them at extremely low concentrations. Anywhere in the mouth that is low in oxygen and rich in protein debris becomes a production site.</p>

<table style="${TBL}">
<tr><th style="${TH}">Source</th><th style="${TH}">Share of cases</th><th style="${TH}">What resolves it</th></tr>
<tr><td style="${TD}">Tongue coating (posterior third)</td><td style="${TDC}">Largest single source</td><td style="${TD}">Daily tongue cleaning</td></tr>
<tr><td style="${TD}">${D('periodontitis', 'Periodontal pockets')}</td><td style="${TDC}">Major</td><td style="${TD}">Periodontal treatment</td></tr>
<tr><td style="${TD}">${D('dental-calculus', 'Calculus')} and plaque</td><td style="${TDC}">Major</td><td style="${TD}">Professional cleaning</td></tr>
<tr><td style="${TD}">Dry mouth</td><td style="${TDC}">Common</td><td style="${TD}">Hydration, review medication</td></tr>
<tr><td style="${TD}">Food trapping around a ${D('wisdom-tooth', 'wisdom tooth')} or faulty restoration</td><td style="${TDC}">Common</td><td style="${TD}">Fix the trap</td></tr>
<tr><td style="${TD}">Tonsil stones, sinus, reflux, systemic</td><td style="${TDC}">10–15%</td><td style="${TD}">Medical referral</td></tr>
</table>
<div style="${BOX}"><strong>The single most commonly skipped step is cleaning the back of the tongue.</strong> Not the tip, which most people scrape, but the posterior third — the rough, papillated area where the coating actually accumulates. It triggers the gag reflex, so almost everyone stops short of it. Reaching a centimetre or two further back, gently, with a scraper rather than a brush, produces a bigger difference for more people than any mouthwash on the market.</div>

<h3>Why mouthwash disappoints</h3>
<p>Most cosmetic rinses provide a strong flavour that masks odour for twenty to thirty minutes without reducing the bacterial load in the pockets or the tongue coating. Worse, high-alcohol formulations dry the mouth, and reduced saliva means less oxygen and less natural clearance — so the smell can rebound stronger than before. Antibacterial rinses containing chlorhexidine or zinc compounds do have genuine effect, but chlorhexidine also stains the teeth brown with prolonged use and is intended for defined courses, not indefinitely.</p>

<h3>Dry mouth deserves separate attention</h3>
<p>Saliva is the mouth's own cleaning and buffering system. When flow drops, malodour, ${D('dental-caries', 'decay')}, and ${D('oral-thrush', 'oral thrush')} all become more likely. Common causes include many antihistamines, antidepressants, blood pressure medications and diuretics, mouth breathing, insufficient fluid intake, and habitual heavy caffeine. Morning breath is simply the physiological version of this: salivary flow falls during sleep, so bacteria work undisturbed for hours. Morning breath that clears after brushing is normal; breath that persists through the day is not.</p>

<h3>A practical sequence to work through</h3>
<ol>
<li><strong>Get a dental examination first.</strong> Periodontal pockets, decay, a failing restoration, or food trapping around a tilted wisdom tooth are all fixable causes that no amount of home care will resolve.</li>
<li><strong>Clean the posterior tongue daily</strong> with a scraper, gently, going as far back as you can tolerate.</li>
<li><strong>Clean between the teeth</strong> — floss or interdental brushes. Brushing alone leaves the interdental surfaces, which are exactly the low-oxygen protein-rich sites in question.</li>
<li><strong>Maintain saliva flow</strong> — water through the day, and a discussion with your physician if a necessary medication is the cause.</li>
<li><strong>Only then consider rinses,</strong> choosing an antibacterial rather than a purely cosmetic one, and alcohol-free.</li>
<li><strong>If oral causes are excluded and it persists,</strong> ask about tonsil stones, sinus drainage, and reflux, and mention any unexplained weight change or thirst so that systemic causes can be considered.</li>
</ol>
<div style="${WARN}"><strong>Two situations that need medical rather than dental attention.</strong> A distinctly sweet or fruity breath odour with increased thirst and urination should be checked promptly, as it can accompany uncontrolled diabetes. A fishy or ammoniacal odour can relate to kidney or liver function. Both are uncommon, but they are the reason persistent bad breath with other new symptoms should not simply be managed with better brushing. This page is general information and not a diagnosis.</div>

<h3>Testing your own breath honestly</h3>
<p>You cannot smell your own breath reliably, because the olfactory system adapts to constant stimuli. Cupping your hands and exhaling tells you very little. More useful: lick the back of your wrist, let it dry for ten seconds, then smell it — or scrape the back of the tongue and smell the scraper. Better still, ask someone you trust to be blunt, or ask directly at a dental appointment. A surprising number of patients spend years worrying without ever asking, and a smaller number have no odour at all and are experiencing a perception problem that also deserves acknowledgement rather than dismissal.</p>

<h3>Notes for patients based in Korea</h3>
<p>If bad breath is your main concern, say so directly at the appointment. It is a routine clinical question, not an embarrassing one, and it changes what gets examined — pocket depths, tongue coating, existing restorations, and food traps all come under scrutiny. We are roughly 30 minutes from Camp Humphreys, consultations are in English, and cleaning and periodontal fees are listed on our ${L('/en/pricing', 'English price page')}. ${L('/en/reservation', 'Book a consultation')}.</p>
`,
  faqs: [
    { q: 'Does bad breath come from the stomach?', a: 'Very rarely. Around 85 to 90 percent of cases originate in the mouth, most often from coating on the back of the tongue, periodontal pockets, plaque and calculus, or food trapping around a tooth. The oesophagus is normally closed, so stomach odour does not continuously vent into the mouth. Reflux can contribute, but it is a minority explanation rather than the default one.' },
    { q: 'Why does mouthwash only work for a short time?', a: 'Because most cosmetic rinses mask odour with flavour for twenty to thirty minutes without reducing the bacteria producing it. High-alcohol formulations can make things worse by drying the mouth, since less saliva means less oxygen and less natural clearance. Antibacterial rinses with chlorhexidine or zinc have real effect, but they are intended for defined courses rather than indefinite use.' },
    { q: 'How should I clean my tongue?', a: 'With a scraper rather than a toothbrush, and crucially further back than most people go. The coating accumulates on the posterior third, which is also where the gag reflex lives, so nearly everyone stops too early. Work back gradually and gently over several days rather than forcing it. This single habit produces a larger improvement for more people than any product.' },
    { q: 'Is morning breath a problem?', a: 'Not by itself. Saliva flow falls during sleep, so bacteria work undisturbed for hours and almost everyone wakes with some odour. Morning breath that clears after brushing and breakfast is entirely normal. Breath that persists through the day despite good cleaning is different and is worth having examined, because it usually points to a specific fixable source.' },
    { q: 'Can gum disease cause bad breath?', a: 'Yes, and it is one of the major causes. Periodontal pockets are deep, low in oxygen, and full of protein debris, which is precisely the environment where odour-producing bacteria thrive. Home care cannot reach the bottom of a pocket, which is why breath often improves markedly after periodontal treatment in a way that no amount of brushing achieved.' },
    { q: 'When should I see a doctor rather than a dentist?', a: 'If a dental examination has excluded oral causes and the problem persists, or if there are additional symptoms. A distinctly sweet or fruity odour with increased thirst and urination warrants prompt medical assessment, and a fishy or ammoniacal odour can relate to kidney or liver function. Tonsil stones, chronic sinus drainage, and reflux are also worth investigating at that point.' },
  ],
})

EN_TERMS.push({
  slug: 'stomatitis',
  h1: 'Stomatitis',
  ko: '구내염',
  aka: ['mouth ulcer', 'canker sore', 'aphthous ulcer', 'mouth sores', 'sore in mouth'],
  cat: 'Mouth & Tongue',
  tldr: 'Stomatitis means inflammation of the mouth lining, most commonly appearing as painful ulcers. Ordinary aphthous ulcers are round, shallow, with a white-yellow base and a red rim, and heal within about two weeks without scarring. The important rule is duration: any ulcer that has not healed in three weeks should be examined rather than treated at home.',
  body: `
<h3>Distinguishing the common types</h3>
<table style="${TBL}">
<tr><th style="${TH}">Type</th><th style="${TH}">Appearance</th><th style="${TH}">Course</th></tr>
<tr><td style="${TD}">Minor aphthous ulcer</td><td style="${TD}">Under 1 cm, white-yellow base, red rim</td><td style="${TD}">Heals in 7–14 days, no scar</td></tr>
<tr><td style="${TD}">Major aphthous ulcer</td><td style="${TD}">Over 1 cm, deeper</td><td style="${TD}">Weeks, may scar</td></tr>
<tr><td style="${TD}">Herpetiform</td><td style="${TD}">Clusters of tiny ulcers</td><td style="${TD}">Merge, heal in 1–2 weeks</td></tr>
<tr><td style="${TD}">Traumatic ulcer</td><td style="${TD}">Irregular, beside a sharp edge or appliance</td><td style="${TD}">Heals once the cause is removed</td></tr>
<tr><td style="${TD}">Herpetic (cold sore type)</td><td style="${TD}">Vesicles first, often on the lip border</td><td style="${TD}">Crusts and heals in 7–10 days</td></tr>
<tr><td style="${TD}">${D('oral-thrush', 'Candidal')}</td><td style="${TD}">White plaques that can be wiped off</td><td style="${TD}">Needs antifungal treatment</td></tr>
</table>

<h3>What triggers recurrent aphthous ulcers</h3>
<ul>
<li><strong>Local trauma</strong> — a toothbrush slip, a sharp crisp, a cheek bite, an orthodontic bracket, or the edge of a broken tooth.</li>
<li><strong>Stress and disturbed sleep</strong>, which is why they cluster around exam periods, deployments, and relocations.</li>
<li><strong>Hormonal fluctuation</strong> in some patients.</li>
<li><strong>Sodium lauryl sulphate</strong> in toothpaste — a genuine trigger in a subset of frequent sufferers, and worth a trial of an SLS-free paste.</li>
<li><strong>Nutritional deficiency</strong> — iron, folate, vitamin B12, and zinc. Frequent recurrent ulcers justify blood tests rather than repeated topical gels.</li>
<li><strong>Acidic and spicy foods</strong>, which more often aggravate an existing ulcer than initiate one.</li>
<li><strong>Certain medications</strong>, including some anti-inflammatories and beta blockers.</li>
</ul>
<div style="${BOX}"><strong>The one thing recurrent ulcers are usually not is a hygiene failure.</strong> Patients frequently assume they have done something wrong, and brush harder as a result, which adds trauma to inflammation. Aphthous ulceration is an immune-mediated process with identifiable triggers, and the productive approach is finding the trigger — deficiency, toothpaste ingredient, a sharp tooth edge, or a stressful period — rather than escalating the scrubbing.</div>

<h3>Managing an episode</h3>
<ol>
<li><strong>Remove the mechanical cause</strong> if there is one — smooth a sharp edge, adjust an appliance, replace a worn brush.</li>
<li><strong>Topical protection or anaesthetic gel</strong> to allow eating and drinking.</li>
<li><strong>Avoid acidic, salty, spicy, and very hot foods</strong> while it heals; these prolong the discomfort without changing the healing time.</li>
<li><strong>Saltwater rinsing</strong> and gentle continued cleaning of the area — stopping brushing near an ulcer makes matters worse.</li>
<li><strong>Maintain hydration and nutrition,</strong> which is a genuine concern with widespread ulceration, particularly in children.</li>
<li><strong>Prescribed topical corticosteroid</strong> where episodes are frequent or severe, under supervision.</li>
</ol>

<h3>When it is more than a canker sore</h3>
<div style="${WARN}"><strong>Have it examined if any of the following apply:</strong> an ulcer that has not healed within three weeks; an ulcer with a hard, rolled, or indurated edge; ulceration accompanied by fever, rash, or genital or eye lesions; ulcers appearing alongside unexplained weight loss or persistent fatigue; a lump or ${D('leukoplakia', 'white patch')} that develops at the site; or a sudden change in the pattern of long-standing ulcers. Duration is the most useful single criterion available to you at home, because a persistent non-healing ulcer requires assessment to exclude ${D('oral-cancer', 'more serious causes')}. This is general information and not a diagnosis.</div>

<h3>Recurrent ulcers as a systemic clue</h3>
<p>Frequently recurring oral ulceration is sometimes the earliest visible sign of something broader — iron or B12 deficiency, coeliac disease, inflammatory bowel disease, or Behçet syndrome when combined with genital ulcers and eye inflammation. This does not mean every canker sore warrants investigation, but a pattern of several episodes a year, or ulcers that are unusually large or slow to heal, is a reasonable prompt for blood tests and a broader history rather than another tube of gel.</p>

<h3>Notes for patients based in Korea</h3>
<p>Ulcer episodes cluster reliably around relocation, deployment cycles, and examination periods, so a run of them during a difficult few months is not surprising. What matters is applying the three-week rule regardless of circumstances: a persistent ulcer needs looking at even when there is an obvious stress explanation available. We are around 30 minutes from Camp Humphreys and consultations are conducted in English. ${L('/en/reservation', 'Book an appointment')} if an ulcer is not settling.</p>
`,
  faqs: [
    { q: 'How long should a mouth ulcer take to heal?', a: 'An ordinary minor aphthous ulcer heals within about seven to fourteen days and leaves no scar. Larger ulcers can take several weeks. The practical rule worth remembering is three weeks: any ulcer still present after that should be examined rather than managed at home, because persistence is the most useful warning sign available without a clinical examination.' },
    { q: 'What causes recurrent canker sores?', a: 'Common triggers include local trauma, stress and poor sleep, hormonal fluctuation, sodium lauryl sulphate in toothpaste, and deficiencies of iron, folate, B12, or zinc. It is an immune-mediated process rather than a hygiene failure, so brushing harder does not help and adds trauma. Frequent recurrences justify blood tests and a trigger review rather than repeated topical gels alone.' },
    { q: 'Can toothpaste cause mouth ulcers?', a: 'In a subset of people, yes. Sodium lauryl sulphate, the foaming agent in most toothpastes, is a recognised trigger for recurrent aphthous ulceration in susceptible individuals. Switching to an SLS-free paste for a couple of months is a simple, low-cost test. If episodes reduce noticeably, you have identified a trigger you control entirely.' },
    { q: 'Are mouth ulcers contagious?', a: 'Ordinary aphthous ulcers are not; they are an immune-mediated reaction, not an infection. Herpetic lesions are different and are contagious, particularly while blistering, and typically start as small vesicles often at the lip border rather than as a single round ulcer inside the cheek. If you are unsure which you have, that distinction is worth confirming.' },
    { q: 'Should I stop brushing near an ulcer?', a: 'No, though gently is the operative word. Abandoning cleaning around the area allows plaque to accumulate and inflammation to worsen, which slows healing. Use a soft brush, be careful, and keep cleaning. If a sharp tooth edge or an appliance caused the ulcer in the first place, having that smoothed is more useful than avoiding the area.' },
    { q: 'When is a mouth ulcer serious?', a: 'When it has not healed in three weeks, has a hard or rolled edge, is accompanied by a lump or a white patch, or comes with fever, rash, eye or genital lesions, unexplained weight loss, or persistent fatigue. A sudden change in the pattern of long-standing ulcers also warrants assessment. These features do not mean something serious is present, only that examination is needed rather than home care.' },
  ],
})

EN_TERMS.push({
  slug: 'geographic-tongue',
  h1: 'Geographic Tongue',
  ko: '지도설',
  aka: ['benign migratory glossitis', 'map tongue', 'patches on tongue', 'tongue patterns', 'erythema migrans oral'],
  cat: 'Mouth & Tongue',
  tldr: 'Geographic tongue is a benign condition in which smooth red patches with slightly raised white borders appear on the tongue surface, changing shape and position over days so that the pattern resembles a map. It is harmless, is not an infection, and is not associated with cancer. No treatment is needed unless there is discomfort, and the main clinical value is confident reassurance.',
  body: `
<h3>What produces the map-like appearance</h3>
<p>The tongue surface is covered in filiform papillae. In geographic tongue, patches of these papillae are temporarily lost, leaving smooth, red, slightly depressed areas, while the margins where the process is active appear as raised whitish or yellowish serpentine borders. The patches then repopulate and new ones appear elsewhere, which is why the pattern visibly migrates. The formal name, benign migratory glossitis, describes exactly this behaviour.</p>
<div style="${BOX}"><strong>The migration is the reassuring feature, not the alarming one.</strong> Patients understandably worry that something changing shape on the tongue must be progressing. In fact the opposite reasoning applies here: a lesion that moves, disappears, and reappears elsewhere within days is behaving in a way that serious pathology does not. What warrants concern is the reverse pattern — a single lesion that stays in one place and persists unchanged for more than three weeks.</div>

<h3>How it is distinguished from other conditions</h3>
<table style="${TBL}">
<tr><th style="${TH}">Condition</th><th style="${TH}">Key distinguishing feature</th></tr>
<tr><td style="${TD}">Geographic tongue</td><td style="${TD}">Patches migrate over days; borders raised and serpentine</td></tr>
<tr><td style="${TD}">${D('oral-thrush', 'Oral thrush')}</td><td style="${TD}">White plaques that can be wiped away, leaving redness</td></tr>
<tr><td style="${TD}">${D('leukoplakia', 'Leukoplakia')}</td><td style="${TD}">Fixed white patch that does not wipe off and does not move</td></tr>
<tr><td style="${TD}">Lichen planus</td><td style="${TD}">Fine lace-like white striations, usually also on the cheek lining</td></tr>
<tr><td style="${TD}">Atrophic glossitis</td><td style="${TD}">Uniformly smooth, pale tongue — suggests deficiency, not patchy</td></tr>
</table>
<p>Fissured tongue, with grooves along the surface, frequently coexists with geographic tongue and is equally benign. Both are anatomical variations rather than diseases.</p>

<h3>Associations worth knowing</h3>
<ul>
<li><strong>Family history</strong> — there is a clear genetic tendency.</li>
<li><strong>Psoriasis</strong> — an established association; many patients with geographic tongue have no skin condition, but the link exists.</li>
<li><strong>Stress</strong>, which patients often report as making patches more noticeable or more uncomfortable.</li>
<li><strong>Hormonal changes</strong>, including pregnancy and the oral contraceptive pill.</li>
<li><strong>Nutritional deficiency</strong> such as B vitamins or zinc, which can worsen sensitivity even where it did not cause the condition.</li>
<li><strong>Allergy and asthma</strong> — reported more frequently in affected individuals.</li>
</ul>

<h3>Managing discomfort when it occurs</h3>
<p>Most people have no symptoms at all and only discover it incidentally or by looking in a mirror. A minority experience burning or sensitivity, typically to acidic, spicy, salty, or very hot foods, because the exposed areas lack their normal papillary covering. Practical measures are straightforward: identify and avoid the specific foods that provoke it, use a bland non-SLS toothpaste, keep well hydrated, and have iron, B12, folate, and zinc checked if the discomfort is persistent. Antifungals and antibiotics do nothing for this condition, and there is no benefit in scrubbing the tongue — the patches are not a coating and cannot be brushed off.</p>
<div style="${WARN}"><strong>What would change the assessment:</strong> a lesion that stays in exactly the same place for more than three weeks; a white patch that will not wipe off and does not migrate; an ulcer with a firm, raised, or indurated edge; a lump within the tongue rather than a surface pattern; numbness, difficulty swallowing, or unexplained bleeding. Geographic tongue does none of these. If any are present, the finding needs examination rather than reassurance — see ${D('leukoplakia', 'leukoplakia')} and ${D('oral-cancer', 'oral cancer')} for why persistence matters. General information here is not a diagnosis.</div>

<h3>Notes for patients based in Korea</h3>
<p>This is one of the conditions where a five-minute examination replaces weeks of internet-driven anxiety, and it is worth having looked at simply to get a definite answer. Bring a photograph taken a week or two earlier if you have one — documented migration is genuinely useful confirmation and saves a follow-up visit. We are roughly 30 minutes from Camp Humphreys and consultations are conducted in English. ${L('/en/reservation', 'Book an examination')} if you want it confirmed.</p>
`,
  faqs: [
    { q: 'Is geographic tongue dangerous?', a: 'No. It is a benign condition with no association with oral cancer and no long-term consequences. The patches represent temporary loss of surface papillae, which then regrow while new patches appear elsewhere. Most people have no symptoms at all. The main value of a consultation is confirming the diagnosis so that you can stop worrying about it.' },
    { q: 'Why does the pattern keep changing?', a: 'Because the affected areas resolve and repopulate with papillae while new areas become involved, so the map appears to migrate over days. This is exactly why the formal name is benign migratory glossitis. The movement is reassuring rather than concerning, since lesions that shift position and disappear behave quite differently from serious pathology, which tends to persist in one place.' },
    { q: 'Is it an infection? Do I need antifungal treatment?', a: 'No, and antifungals will not help. Geographic tongue is not caused by bacteria, fungi, or viruses. Oral thrush is the condition it is most often mistaken for, but thrush produces white plaques that can be wiped away leaving redness underneath, whereas geographic tongue patches are areas of lost surface texture that cannot be wiped off.' },
    { q: 'Can it be cured?', a: 'There is no cure, and none is needed, since the condition is harmless and often entirely asymptomatic. It typically comes and goes for life, sometimes disappearing for long periods. Where discomfort occurs, treatment targets the symptoms — avoiding provoking foods, using a bland toothpaste, checking for nutritional deficiency — rather than attempting to eliminate the condition itself.' },
    { q: 'Why does my tongue burn with certain foods?', a: 'Because the smooth red patches have lost their normal papillary covering and are more exposed than surrounding tissue, so acidic, spicy, salty, and very hot foods contact a more sensitive surface. Identifying your own specific triggers, which vary between individuals, is more effective than following a generic avoidance list. A non-SLS toothpaste often helps too.' },
    { q: 'What would make a tongue lesion concerning instead?', a: 'Persistence in one place for more than three weeks, a white patch that does not wipe off and does not migrate, an ulcer with a firm or rolled edge, a lump within the tongue rather than a surface pattern, or numbness, difficulty swallowing, or unexplained bleeding. Geographic tongue does none of these, which is precisely why distinguishing it clinically is useful.' },
  ],
})

EN_TERMS.push({
  slug: 'oral-thrush',
  h1: 'Oral Thrush',
  ko: '구강 칸디다증',
  aka: ['oral candidiasis', 'candida in mouth', 'white coating on tongue', 'thrush', 'denture sore mouth'],
  cat: 'Mouth & Tongue',
  tldr: 'Oral thrush is an overgrowth of Candida, normally a harmless resident of the mouth. The classic form shows creamy white plaques that can be wiped away leaving a red, sometimes bleeding surface underneath. Because Candida overgrows when conditions change rather than when it is newly acquired, the crucial question is always what allowed it — inhaled steroids, dry mouth, dentures, antibiotics, or an undiagnosed medical condition.',
  body: `
<h3>The distinguishing test, and it is simple</h3>
<p>The classic pseudomembranous form produces creamy white plaques resembling curdled milk on the tongue, palate, or inner cheeks. Gently wiping with gauze removes them, leaving a red and sometimes bleeding base. This single feature is what separates it from ${D('leukoplakia', 'leukoplakia')}, which does not wipe off, and from ${D('geographic-tongue', 'geographic tongue')}, where the pattern is one of lost surface texture rather than a removable coating.</p>

<table style="${TBL}">
<tr><th style="${TH}">Form</th><th style="${TH}">Appearance</th><th style="${TH}">Typical setting</th></tr>
<tr><td style="${TD}">Pseudomembranous</td><td style="${TD}">White plaques that wipe off</td><td style="${TD}">Infants, steroid inhaler users, immunosuppression</td></tr>
<tr><td style="${TD}">Erythematous (atrophic)</td><td style="${TD}">Red, sore, smooth patches, no white</td><td style="${TD}">After antibiotics, under dentures</td></tr>
<tr><td style="${TD}">Angular cheilitis</td><td style="${TD}">Cracked, sore corners of the mouth</td><td style="${TD}">Denture wearers, deficiency states</td></tr>
<tr><td style="${TD}">Denture stomatitis</td><td style="${TD}">Redness matching the denture outline</td><td style="${TD}">Night-time denture wear, poor cleaning</td></tr>
<tr><td style="${TD}">Median rhomboid glossitis</td><td style="${TD}">Red diamond area, mid-dorsal tongue</td><td style="${TD}">Inhaler users, smokers</td></tr>
</table>
<div style="${BOX}"><strong>The red form is the one most often missed.</strong> Erythematous candidiasis produces no white plaques at all — only a sore, red, sometimes burning surface — so patients and clinicians alike look for other explanations. A burning tongue with generalised redness after a course of antibiotics, or a red palate exactly matching the outline of an upper denture, is frequently this rather than an allergy, a deficiency, or a mystery.</div>

<h3>Why it appeared: the question that actually matters</h3>
<ul>
<li><strong>Inhaled corticosteroids</strong> for asthma or COPD — the single most common cause in otherwise healthy adults, and largely preventable by rinsing the mouth after every dose.</li>
<li><strong>Broad-spectrum antibiotics</strong>, which suppress the bacteria that normally keep Candida in check.</li>
<li><strong>Dry mouth</strong> from medication, dehydration, or reduced salivary function — saliva is a major antifungal defence.</li>
<li><strong>Dentures</strong>, especially worn overnight or inadequately cleaned; the fitting surface is an ideal reservoir.</li>
<li><strong>Uncontrolled diabetes</strong> — recurrent thrush is a recognised presenting sign, and glucose in saliva feeds the organism.</li>
<li><strong>Immunosuppression</strong> from disease or treatment.</li>
<li><strong>Infancy and old age</strong>, at either end of immune competence.</li>
<li><strong>Smoking</strong>, which alters the mucosal surface and the local flora.</li>
</ul>
<div style="${WARN}"><strong>Recurrent or unexplained thrush in a healthy-seeming adult should prompt a medical review, not just a repeat prescription.</strong> Persistent or repeatedly returning candidiasis without an obvious local cause is a recognised reason to check blood glucose and consider other causes of impaired immunity. Treating the fungus while ignoring what permitted it produces a cycle of temporary clearance and relapse. This page is general information and not a diagnosis.</div>

<h3>Treatment: antifungal plus the underlying cause</h3>
<ol>
<li><strong>Topical antifungal</strong> — a gel or suspension held in the mouth, used for the full prescribed course rather than stopping when it looks better, since early cessation is the commonest reason for relapse.</li>
<li><strong>Systemic antifungal</strong> for extensive, resistant, or immunocompromised cases, on prescription.</li>
<li><strong>Rinse after every inhaler dose</strong> and use a spacer — this alone prevents the majority of steroid-related cases.</li>
<li><strong>Denture protocol:</strong> remove at night without exception, clean the fitting surface daily, soak as advised, and have the fit checked. An untreated denture reinfects a treated mouth within days.</li>
<li><strong>Address dry mouth</strong> and review contributing medications with the prescriber.</li>
<li><strong>Glycaemic control</strong> where diabetes is involved, which does more for recurrence than any topical agent.</li>
</ol>

<h3>Special situations</h3>
<p>In infants, white plaques inside the mouth are common and generally straightforward, but breastfeeding transmission runs both ways, so mother and baby are usually treated together to avoid a loop. Feeding equipment needs sterilising during the episode. In denture wearers, angular cheilitis at the corners of the mouth frequently accompanies thrush and often signals both fungal involvement and a reduced facial height from worn dentures — which is why the appliance itself, not only the infection, needs assessment. Persistent oral discomfort with dentures also warrants checking for ${D('dental-calculus', 'deposits')} and fit problems rather than assuming fungus alone.</p>

<h3>Notes for patients based in Korea</h3>
<p>Bring a full list of your current medications and inhalers to the appointment, since the cause is frequently sitting in that list rather than in the mouth. If you wear dentures, bring them — treating the mouth without treating the appliance is the classic reason thrush returns within a fortnight. We are about 30 minutes from Camp Humphreys and consultations are in English. ${L('/en/reservation', 'Book an appointment')} if you have white or red patches that are not settling.</p>
`,
  faqs: [
    { q: 'How do I tell thrush from other white patches in the mouth?', a: 'The wipe test is the practical distinction. Thrush plaques can be gently wiped away with gauze, leaving a red and sometimes bleeding surface. Leukoplakia does not wipe off, and geographic tongue involves loss of surface texture rather than a removable coating. That said, a persistent white patch should be examined rather than diagnosed at home by wiping.' },
    { q: 'Why did I get thrush from my asthma inhaler?', a: 'Inhaled corticosteroid settles on the mouth lining and locally suppresses the immune response, allowing Candida already present to overgrow. It is the most common cause in otherwise healthy adults and is largely preventable: rinse your mouth with water and spit after every dose, and use a spacer. This does not reduce the medication effect on your airways at all.' },
    { q: 'Can oral thrush indicate diabetes?', a: 'It can. Recurrent or unexplained candidiasis is a recognised reason to check blood glucose, since raised glucose in saliva feeds the organism and impairs the immune response. This is why repeated thrush in a healthy-seeming adult with no inhaler, antibiotic, or denture explanation warrants a medical review rather than simply another antifungal prescription.' },
    { q: 'Do I need to treat my dentures as well?', a: 'Yes, and it is essential rather than optional. The fitting surface of a denture is a reservoir the antifungal barely reaches, so a treated mouth is reinfected within days by an untreated appliance. Remove dentures every night without exception, clean the fitting surface daily, soak as advised, and have the fit reviewed, since a poorly fitting denture also traps organisms.' },
    { q: 'Is it contagious?', a: 'Candida is a normal mouth inhabitant in most people, so this is overgrowth rather than acquisition, and casual transmission between healthy adults is not a practical concern. The exception is breastfeeding, where mother and infant can pass it back and forth, so both are usually treated together and feeding equipment sterilised during the episode.' },
    { q: 'Why does it keep coming back?', a: 'Almost always because the underlying condition remains. The two most frequent reasons are stopping the antifungal early once it looks better, and treating the mouth while leaving the real reservoir or cause in place — an unclean denture, an inhaler used without rinsing, an untreated dry mouth, or uncontrolled blood glucose. Fixing the cause matters more than the agent chosen.' },
  ],
})

EN_TERMS.push({
  slug: 'leukoplakia',
  h1: 'Leukoplakia',
  ko: '백반증',
  aka: ['white patch in mouth', 'oral leukoplakia', 'white lesion mouth', 'precancerous mouth patch', 'white spot on cheek'],
  cat: 'Mouth & Tongue',
  tldr: 'Leukoplakia is a white patch on the mouth lining that cannot be wiped off and cannot be attributed to any other identifiable cause. It is classified as a potentially malignant disorder, meaning a minority of cases progress to cancer over time, which is why any white patch persisting beyond three weeks needs professional examination rather than watchful waiting at home.',
  body: `
<h3>A diagnosis of exclusion — which is why examination matters</h3>
<p>Leukoplakia is defined by what it is not. Before the term applies, other explanations must be ruled out: ${D('oral-thrush', 'candidiasis')}, which wipes off; frictional keratosis from a sharp tooth edge or cheek biting, which resolves when the cause is removed; lichen planus, with its characteristic lace-like striations; and a smoker's palate. This is precisely why a white patch cannot be self-diagnosed. The label carries a specific implication about risk, and applying it correctly requires excluding the benign look-alikes first.</p>

<table style="${TBL}">
<tr><th style="${TH}">Type</th><th style="${TH}">Appearance</th><th style="${TH}">Relative risk</th></tr>
<tr><td style="${TD}">Homogeneous</td><td style="${TD}">Uniform, flat, thin white patch</td><td style="${TDC}">Lower</td></tr>
<tr><td style="${TD}">Non-homogeneous / speckled</td><td style="${TD}">White mixed with red areas, irregular</td><td style="${TDC}">Higher</td></tr>
<tr><td style="${TD}">Verrucous</td><td style="${TD}">Wrinkled, raised, wart-like surface</td><td style="${TDC}">Higher</td></tr>
<tr><td style="${TD}">Erythroleukoplakia</td><td style="${TD}">Prominent red component</td><td style="${TDC}">Highest</td></tr>
</table>
<div style="${BOX}"><strong>Site matters as much as appearance.</strong> A white patch on the floor of the mouth, the underside or lateral border of the tongue, or the soft palate carries substantially more concern than the same-looking patch inside the cheek. Any patch with a red component, an irregular surface, or a nodular area is treated with more urgency than a uniform thin one. This is why "it looks like nothing much" is not a reliable reassurance without knowing where it is.</div>

<h3>Risk factors</h3>
<ul>
<li><strong>Tobacco in any form</strong> — smoking, and chewing or smokeless products even more strongly. This is the dominant modifiable factor.</li>
<li><strong>Alcohol</strong>, which acts synergistically with tobacco rather than merely additively — combined use multiplies risk rather than adding it.</li>
<li><strong>Betel quid or areca nut</strong>, a major factor in some populations.</li>
<li><strong>Chronic irritation</strong> from a sharp restoration or a poorly fitting denture — though when this is the cause, the lesion is frictional keratosis and resolves once corrected.</li>
<li><strong>Human papillomavirus</strong> in a subset of lesions.</li>
<li><strong>Idiopathic cases</strong> — a meaningful proportion of patients have no risk factor at all, which is why non-smokers should not dismiss a persistent patch.</li>
</ul>

<h3>What happens at assessment</h3>
<ol>
<li><strong>Examination and documentation</strong> — location, size, surface character, photographs for baseline comparison.</li>
<li><strong>Remove the obvious causes</strong> — smooth a sharp cusp, adjust a denture, then review after two to four weeks. Anything that disappears was frictional, not leukoplakia.</li>
<li><strong>Biopsy</strong> for a lesion that persists, and promptly for any high-risk site or non-homogeneous appearance. Histology, not appearance, determines whether dysplasia is present and to what degree — no visual inspection can substitute for it.</li>
<li><strong>Risk factor cessation</strong>, which is where the largest measurable benefit lies. Some lesions regress entirely after tobacco cessation.</li>
<li><strong>Excision</strong> where dysplasia is significant.</li>
<li><strong>Long-term surveillance</strong>, because new lesions can appear elsewhere and treated sites can recur — meaning discharge from follow-up is rarely appropriate.</li>
</ol>
<div style="${WARN}"><strong>Seek examination without delay for:</strong> any white patch lasting more than three weeks; a patch with red areas, nodules, or an irregular surface; a patch that has changed in size, colour, or texture; associated ulceration, bleeding, numbness, or a lump; or difficulty swallowing or speaking. The great majority of white patches turn out to be benign, and the reason for prompt assessment is not that cancer is likely but that the outcome difference between early and late detection is very large. This page is general information and is not a diagnosis — examination is required for that.</div>

<h3>Living with a diagnosed lesion</h3>
<p>Being told you have a potentially malignant disorder is unsettling, and honest framing helps: the large majority of leukoplakias do not become cancer, but the risk is not zero, so surveillance is the price of that reassurance. Three things genuinely change your odds — stopping tobacco completely, reducing alcohol substantially, and attending every review appointment even when nothing seems to be happening. Also useful: perform a monthly self-check with good light and a mirror, looking at the tongue including its underside and edges, the floor of the mouth, and the cheek lining, and report any change rather than waiting for the next scheduled visit. See ${D('oral-cancer', 'oral cancer')} for the full self-examination sequence.</p>

<h3>Notes for patients based in Korea</h3>
<p>If a patch has been noted in your records previously, ask for copies of the notes and any photographs before a relocation, because comparison over time is a large part of how these lesions are assessed and starting again from zero loses that history. We are roughly 30 minutes from Camp Humphreys, consultations are conducted in English, and we document baseline photographs at first assessment. ${L('/en/reservation', 'Book an examination')} if you have a white patch that has lasted more than three weeks.</p>
`,
  faqs: [
    { q: 'Is leukoplakia cancer?', a: 'No. It is classified as a potentially malignant disorder, meaning a minority of cases progress to cancer over time while most do not. That distinction matters: the reason for prompt examination and surveillance is not that malignancy is likely but that the difference in outcome between early and late detection is substantial, and monitoring is what preserves that advantage.' },
    { q: 'How do I know whether a white patch is thrush or leukoplakia?', a: 'Thrush plaques can be wiped away with gauze, leaving a red base; leukoplakia cannot be wiped off. That is a genuine distinction but not a substitute for examination, because other conditions such as lichen planus and frictional keratosis also produce fixed white areas. Any patch that has lasted more than three weeks should be looked at professionally.' },
    { q: 'I do not smoke. Can I still get it?', a: 'Yes. Tobacco is the dominant risk factor and cessation is the single most effective intervention, but a meaningful proportion of cases occur in people with no identifiable risk factor at all. Non-smokers therefore should not dismiss a persistent white patch on the grounds that they lack the classic history, since the assessment pathway is the same.' },
    { q: 'Will it go away if I stop smoking?', a: 'Some lesions do regress fully after complete tobacco cessation, and many stabilise, so it is genuinely worth doing rather than a token recommendation. Reducing alcohol matters too, because alcohol and tobacco act synergistically rather than merely additively. Cessation does not remove the need for surveillance, but it measurably improves the outlook.' },
    { q: 'Why is a biopsy necessary if the patch looks harmless?', a: 'Because appearance and histology do not correlate reliably enough. A visually unremarkable patch can show dysplasia and a dramatic-looking one can be entirely benign, so no amount of experienced inspection substitutes for tissue diagnosis when a lesion persists. The biopsy determines whether dysplasia is present and how significant it is, which is what actually drives management.' },
    { q: 'How often should it be checked?', a: 'The interval depends on site, appearance, histology, and your risk factors, so it is set individually rather than by a universal rule. What is consistent is that surveillance is long-term: new lesions can appear elsewhere and treated sites can recur, so being fully discharged is uncommon. Attending reviews when nothing seems to be changing is exactly when they have value.' },
  ],
})

EN_TERMS.push({
  slug: 'oral-cancer',
  h1: 'Oral Cancer',
  ko: '구강암',
  aka: ['mouth cancer', 'tongue cancer', 'oral cavity cancer', 'lump in mouth', 'non-healing mouth sore'],
  cat: 'Mouth & Tongue',
  tldr: 'Oral cancer is malignancy of the lips, tongue, floor of the mouth, cheek lining, gums, or palate, most often squamous cell carcinoma. Early lesions are frequently painless, which is why they are missed. The most useful single rule for the public is that any ulcer, white or red patch, or lump persisting beyond three weeks needs professional examination — early detection changes outcomes dramatically.',
  body: `
<h3>Why early detection matters so much here</h3>
<p>Outcomes in oral cancer are strongly stage-dependent, and the gap between early and late diagnosis is among the widest in oncology. Yet a substantial proportion of cases are diagnosed late, and the reason is rarely that the lesion was hidden — it is that it did not hurt. Patients wait because pain is the signal they are watching for, and early oral cancer frequently produces none.</p>
<div style="${BOX}"><strong>Persistence, not pain, is the criterion to act on.</strong> Ordinary oral ${D('stomatitis', 'ulcers')} heal within about two weeks. A traumatic ulcer heals once its cause is removed. Anything still present after three weeks has failed the test that most benign lesions pass easily, and that is the point to have it examined regardless of whether it hurts, how small it is, or how plausible your explanation for it seems.</div>

<h3>Signs and symptoms to know</h3>
<ul>
<li>An ulcer or sore that has not healed in three weeks.</li>
<li>A red patch (erythroplakia) or a white patch — see ${D('leukoplakia', 'leukoplakia')} — that persists.</li>
<li>A lump or thickening in the cheek, tongue, or neck.</li>
<li>Persistent numbness of the lip, tongue, or a tooth without a dental explanation.</li>
<li>Unexplained bleeding from the mouth.</li>
<li>Difficulty or discomfort on swallowing, chewing, or moving the tongue or jaw.</li>
<li>A persistent sore throat or the sensation of something caught, without infection.</li>
<li>A change in the way dentures fit, or teeth becoming loose without periodontal cause.</li>
<li>Hoarseness lasting more than a few weeks.</li>
</ul>

<h3>Risk factors</h3>
<table style="${TBL}">
<tr><th style="${TH}">Factor</th><th style="${TH}">Note</th></tr>
<tr><td style="${TD}">Tobacco, all forms</td><td style="${TD}">The dominant risk factor; smokeless products carry high risk too</td></tr>
<tr><td style="${TD}">Alcohol</td><td style="${TD}">Synergistic with tobacco — combined use multiplies rather than adds</td></tr>
<tr><td style="${TD}">Betel quid, areca nut</td><td style="${TD}">Major factor in several regions</td></tr>
<tr><td style="${TD}">HPV (types including 16)</td><td style="${TD}">Increasingly relevant, particularly oropharyngeal sites</td></tr>
<tr><td style="${TD}">Sun exposure</td><td style="${TD}">Specifically for lip cancer</td></tr>
<tr><td style="${TD}">Age over 40, male sex</td><td style="${TD}">Higher incidence, but incidence in younger non-smokers is rising</td></tr>
<tr><td style="${TD}">Previous oral cancer</td><td style="${TD}">Elevated risk of a second primary — lifelong surveillance</td></tr>
</table>
<div style="${WARN}"><strong>No risk factor does not mean no risk.</strong> A growing share of cases occurs in younger patients who neither smoke nor drink heavily, and the practical consequence is that a persistent lesion in a healthy non-smoker deserves exactly the same three-week rule. Dismissing a non-healing ulcer because you do not fit the classic profile is one of the more common reasons for delay.</div>

<h3>A monthly self-examination, done properly</h3>
<ol>
<li><strong>Good light and a mirror.</strong> Remove any dentures first.</li>
<li><strong>Lips</strong> — outside and inside, pulling each lip away from the teeth.</li>
<li><strong>Cheek lining</strong> — pull each cheek out and look at the whole surface.</li>
<li><strong>Tongue</strong> — top, then both lateral borders by moving it side to side, then the underside by lifting the tip to the palate. The lateral border and underside are high-risk sites and the ones most often skipped.</li>
<li><strong>Floor of the mouth</strong> — lift the tongue and look, then feel with a fingertip for any firm area.</li>
<li><strong>Palate</strong> — hard and soft, tilting the head back.</li>
<li><strong>Neck</strong> — feel along both sides and under the jaw for lumps, comparing left with right.</li>
</ol>
<p>Report anything that persists beyond three weeks. Self-examination is a supplement to professional examination, not a replacement — a routine dental check-up includes a soft tissue examination, which is one of the underappreciated benefits of attending regularly even when nothing hurts.</p>

<h3>What assessment involves</h3>
<p>Examination and palpation come first, followed by biopsy, which is the only way to establish a diagnosis; no visual method substitutes for histology. Imaging determines extent and nodal involvement, and treatment is planned by a multidisciplinary team, typically combining surgery, radiotherapy, and in some cases chemotherapy. Dental input before cancer treatment genuinely matters: teeth that will cause problems are best addressed before radiotherapy begins, because extractions in irradiated bone carry a considerably higher complication risk afterwards. If a diagnosis is being made, ask whether a pre-treatment dental assessment has been arranged.</p>
<div style="${WARN}"><strong>This page is general health information, not a diagnosis, and nothing here can determine what a specific lesion is.</strong> The overwhelming majority of persistent mouth lesions turn out to be benign. The purpose of the three-week rule is not to alarm but to remove the guesswork: it is a threshold at which to seek examination, not a prediction. If you have a lesion that meets it, arrange to be seen rather than searching for a more comfortable explanation.</div>

<h3>Notes for patients based in Korea</h3>
<p>If you are here on a posting, a persistent oral lesion is not something to save for your next home visit. Prompt examination and, where indicated, biopsy is available locally, and delay is the one variable that consistently worsens outcomes. We are approximately 30 minutes from Camp Humphreys, consultations and explanations are provided in English, and we can arrange onward referral with English documentation where specialist care is needed. ${L('/en/reservation', 'Book an examination')} without waiting if you have a lesion older than three weeks.</p>
`,
  faqs: [
    { q: 'What is the single most important warning sign?', a: 'An ulcer, patch, or lump that has not healed within three weeks. Ordinary mouth ulcers resolve in about two weeks and traumatic ulcers heal once the cause is removed, so persistence beyond three weeks is the criterion to act on. Crucially it applies whether or not the lesion hurts, since early oral cancer is frequently painless.' },
    { q: 'Does oral cancer hurt in the early stages?', a: 'Often not, and this is precisely why cases are diagnosed late. Patients wait for pain as their signal to seek care, while an early painless lesion progresses quietly. Basing your decision on duration rather than discomfort is the practical correction, because a painless ulcer that has lasted a month warrants examination just as much as a painful one.' },
    { q: 'I do not smoke or drink. Am I at risk?', a: 'Your risk is lower but not absent, and a growing proportion of cases occurs in younger patients without the classic risk factors, some HPV-associated. The practical implication is that the three-week rule applies to you identically. Dismissing a persistent lesion because you do not fit the expected profile is a recognised cause of diagnostic delay.' },
    { q: 'Where in the mouth should I check most carefully?', a: 'The lateral borders and underside of the tongue and the floor of the mouth are higher-risk sites, and they are also the areas people skip because seeing them requires deliberately moving the tongue and lifting it to the palate. Include the soft palate, the whole cheek lining, and both sides of the neck. Do it monthly in good light with dentures removed.' },
    { q: 'Can a dentist detect oral cancer at a routine check-up?', a: 'A routine examination includes inspection and palpation of the soft tissues, and dentists do detect early lesions this way, frequently in patients who had noticed nothing. That is one of the underappreciated reasons to attend regularly even with no symptoms. Definitive diagnosis always requires biopsy, since no visual or light-based screening method replaces histology.' },
    { q: 'Should I see someone before cancer treatment starts?', a: 'Yes, a pre-treatment dental assessment is genuinely important. Teeth likely to cause problems are best dealt with before radiotherapy, because extractions in irradiated bone carry a substantially higher risk of complications afterwards. Ask whether this has been arranged, since it is occasionally overlooked amid the urgency of starting oncological treatment.' },
  ],
})

// ════════════════════════════════════════════════════════════
// GROUP 7 — Tooth Anatomy
// ════════════════════════════════════════════════════════════

EN_TERMS.push({
  slug: 'enamel',
  h1: 'Tooth Enamel',
  ko: '법랑질',
  aka: ['tooth enamel', 'enamel erosion', 'enamel layer', 'outer tooth layer', 'enamel wear'],
  cat: 'Tooth Anatomy',
  tldr: 'Enamel is the outermost layer of the tooth and the hardest tissue in the human body, roughly 96 percent mineral. It contains no living cells, which is the single most important fact about it: once enamel is lost it does not grow back. Early demineralisation can be reversed with fluoride and mineral, but an actual cavity or a worn surface requires restoration.',
  body: `
<h3>Structure and what follows from it</h3>
<p>Enamel is built from densely packed hydroxyapatite crystals arranged in rods running from the ${D('dentin', 'dentin')} surface outward. This gives extraordinary hardness and wear resistance, which is why teeth survive decades of chewing. The trade-off is brittleness and, more importantly, the absence of cells. Bone remodels because it contains living osteocytes and a blood supply. Enamel has neither, so it cannot repair damage biologically.</p>

<table style="${TBL}">
<tr><th style="${TH}">Property</th><th style="${TH}">Enamel</th><th style="${TH}">Dentin</th><th style="${TH}">Bone</th></tr>
<tr><td style="${TD}">Mineral content</td><td style="${TDC}">~96%</td><td style="${TDC}">~70%</td><td style="${TDC}">~60%</td></tr>
<tr><td style="${TD}">Living cells</td><td style="${TDC}">None</td><td style="${TDC}">Odontoblast processes</td><td style="${TDC}">Yes</td></tr>
<tr><td style="${TD}">Can regenerate</td><td style="${TDC}">No</td><td style="${TDC}">Limited (reparative)</td><td style="${TDC}">Yes</td></tr>
<tr><td style="${TD}">Sensation</td><td style="${TDC}">None</td><td style="${TDC}">Yes</td><td style="${TDC}">Yes</td></tr>
</table>
<div style="${BOX}"><strong>Why enamel damage is silent until it is not.</strong> Enamel carries no nerve supply, so erosion and early decay produce no sensation whatsoever. The first symptom most people notice — sensitivity to cold or sweet — means the damage has already reached the dentin beneath. By the time it hurts, the irreversible stage has begun. This is precisely why check-ups and radiographs exist: they catch what your nerves cannot report.</div>

<h3>Demineralisation and remineralisation — the one reversible window</h3>
<p>Enamel is in constant chemical exchange with saliva. When plaque bacteria produce acid after a sugar exposure, or when acidic food or drink lowers the pH, mineral leaves the surface. When saliva restores neutral pH and supplies calcium and phosphate, mineral returns. Fluoride shifts this balance decisively in favour of repair and forms a more acid-resistant mineral.</p>
<p>A white spot lesion is demineralised but not yet cavitated enamel — chalky, opaque, and still structurally continuous. This is the last genuinely reversible stage of ${D('dental-caries', 'decay')}, and it can be arrested or reversed with fluoride, plaque control, and reduced sugar frequency. Once the surface collapses into an actual cavity, no amount of fluoride rebuilds the missing structure and a filling is required. Recognising white spots and acting on them is one of the highest-value things preventive dentistry does.</p>

<h3>Erosion versus decay — different mechanisms, different fixes</h3>
<ul>
<li><strong>Decay</strong> is bacterial: plaque metabolises sugar and produces acid locally, so lesions appear in plaque-retentive sites such as grooves and between teeth. Managed by plaque control, fluoride, and reducing sugar frequency.</li>
<li><strong>Erosion</strong> is chemical without bacteria: acid contacts the tooth directly. Sources include carbonated drinks, citrus, sports drinks, wine, vinegar-based foods, and, importantly, gastric acid from reflux or vomiting. It produces broad, smooth, shiny loss rather than discrete holes, and the palatal surfaces of upper front teeth are often affected first in reflux.</li>
<li><strong>Abrasion</strong> is mechanical: over-vigorous brushing with a hard brush, particularly with abrasive whitening pastes, producing notches at the gumline.</li>
<li><strong>Attrition</strong> is tooth against tooth — the wear pattern of ${D('bruxism', 'grinding')}, flattening cusps and shortening front teeth.</li>
</ul>
<div style="${WARN}"><strong>Do not brush immediately after an acid exposure.</strong> Enamel is temporarily softened for a period after acidic food or drink, and brushing at that moment removes softened mineral mechanically. Rinse with water, or use milk or a fluoride mouthrinse, and wait about thirty minutes. This is one of the few pieces of home advice that reverses what most people instinctively do — and patients who brush conscientiously right after a citrus drink are sometimes the ones with the most erosion.</div>

<h3>Protecting what you have</h3>
<ol>
<li><strong>Fluoride toothpaste twice daily</strong>, and do not rinse with water afterwards — spit only, so the fluoride stays in contact.</li>
<li><strong>Reduce acid and sugar frequency rather than only quantity.</strong> Six small sips of a soft drink across a day is far more damaging than one glass in ten minutes, because each exposure restarts the acid cycle.</li>
<li><strong>Use a straw</strong> for acidic drinks, and avoid swishing or holding them in the mouth.</li>
<li><strong>Soft brush, gentle pressure.</strong> Effective cleaning is about technique and coverage, not force.</li>
<li><strong>Investigate reflux</strong> if erosion appears on the palatal surfaces of upper teeth, since dental erosion is sometimes the first sign of it.</li>
<li><strong>Protect against grinding</strong> with a splint if attrition is present.</li>
</ol>

<h3>Notes for patients based in Korea</h3>
<p>Enamel loss is progressive and painless, so an examination that finds early white spots or the beginnings of erosion is genuinely worth more than one that finds nothing wrong. If you have moved between countries, ask for copies of previous radiographs, since comparison over time shows progression that a single snapshot cannot. We are around 30 minutes from Camp Humphreys with English-language consultation, and preventive and restorative fees are listed on our ${L('/en/pricing', 'English price page')}. ${L('/en/reservation', 'Book a check-up')}.</p>
`,
  faqs: [
    { q: 'Can enamel grow back?', a: 'No. Enamel contains no living cells and no blood supply, so unlike bone it cannot regenerate. Early demineralisation, seen as a chalky white spot, can be remineralised with fluoride, calcium, and phosphate because the surface is still intact. Once an actual cavity or a worn surface has formed, the lost structure has to be replaced with a restoration.' },
    { q: 'Why does enamel damage not hurt?', a: 'Because enamel has no nerve supply at all. Erosion and early decay are therefore completely silent, and the first sensitivity you notice usually means the damage has already reached the dentin underneath, where nerve processes exist. This is exactly why routine examinations and radiographs matter — they detect what symptoms cannot yet report.' },
    { q: 'What is the difference between erosion and decay?', a: 'Decay is bacterial: plaque converts sugar into acid, producing discrete lesions in plaque-retentive sites like grooves and between teeth. Erosion is purely chemical, from dietary acid or gastric acid, and produces broad, smooth, shiny loss rather than holes. They need different management, so distinguishing them changes the advice you should be given.' },
    { q: 'Should I brush right after drinking orange juice?', a: 'No, wait about thirty minutes. Enamel is temporarily softened after acid exposure, so brushing immediately mechanically removes softened mineral. Rinse with water, or use milk or a fluoride rinse, then brush later. Conscientious brushers who clean straight after acidic drinks sometimes show more erosion than people who simply waited.' },
    { q: 'Does whitening toothpaste damage enamel?', a: 'Highly abrasive whitening pastes can contribute to surface wear over years, particularly when combined with a hard brush and heavy pressure. They also work mainly by removing surface stain rather than changing the underlying colour. If you use one, pair it with a soft brush and light pressure, and consider alternating with a standard fluoride paste.' },
    { q: 'Why does my dentist keep mentioning white spots?', a: 'Because a white spot is demineralised enamel with the surface still intact, which makes it the last genuinely reversible stage of decay. Fluoride, better plaque control, and reduced sugar frequency can arrest or reverse it entirely. Once it cavitates, the only option is a filling, so acting at the white spot stage is preventive dentistry at its most valuable.' },
  ],
})

EN_TERMS.push({
  slug: 'dentin',
  h1: 'Dentin',
  ko: '상아질',
  aka: ['dentine', 'dentin sensitivity', 'exposed dentin', 'layer under enamel', 'tooth sensitivity layer'],
  cat: 'Tooth Anatomy',
  tldr: 'Dentin is the layer beneath the enamel, softer and roughly 70 percent mineral, and it makes up the bulk of the tooth. It is riddled with microscopic tubules containing fluid and cell processes connected to the pulp, which is why exposed dentin produces sensitivity. Unlike enamel, dentin has a limited capacity to respond and lay down new protective layers.',
  body: `
<h3>The tubules explain almost everything</h3>
<p>Dentin is not a solid block. It is perforated by tens of thousands of tubules per square millimetre, each running from the ${D('dental-pulp', 'pulp')} outward and containing fluid plus the process of an odontoblast cell. When exposed dentin meets cold, heat, air, sweetness, or touch, the fluid in those tubules moves, and that movement stimulates nerve endings at the pulp end. This hydrodynamic mechanism is why sensitivity is sharp, immediate, and stops when the stimulus is removed.</p>
<div style="${BOX}"><strong>It also explains why sensitivity is not a defect but a signal.</strong> Dentin is designed to be covered — by enamel above the gumline and by cementum and gum below it. Sensitivity means that covering has been breached somewhere: worn enamel, receded gum, an abrasion notch, a ${D('cracked-tooth-syndrome', 'crack')}, decay, or a leaking restoration margin. The productive question is never only "how do I stop the pain" but "where is dentin exposed and why".</div>

<h3>Why dentin can respond when enamel cannot</h3>
<table style="${TBL}">
<tr><th style="${TH}">Response</th><th style="${TH}">What happens</th><th style="${TH}">Consequence</th></tr>
<tr><td style="${TD}">Sclerotic dentin</td><td style="${TD}">Tubules mineralise and narrow</td><td style="${TD}">Sensitivity gradually reduces</td></tr>
<tr><td style="${TD}">Tertiary (reparative) dentin</td><td style="${TD}">New dentin laid down under the injury</td><td style="${TD}">Protective barrier over the pulp</td></tr>
<tr><td style="${TD}">Secondary dentin</td><td style="${TD}">Slow lifelong deposition</td><td style="${TD}">Pulp chamber shrinks with age</td></tr>
</table>
<p>This capacity is the biological basis for conservative treatment of deep cavities. Rather than removing every trace of affected dentin and risking pulp exposure, a dentist may leave a thin layer, seal it well, and allow the pulp to lay down reparative dentin underneath — a technique that saves nerves which older approaches would have sacrificed.</p>

<h3>Common causes of dentin exposure</h3>
<ul>
<li><strong>Gum recession</strong> exposing root surface, which has no ${D('enamel', 'enamel')} covering at all and is therefore immediately sensitive. Frequently follows ${D('periodontitis', 'periodontal disease')} or over-vigorous brushing.</li>
<li><strong>Abrasion notches</strong> at the gumline from hard brushing with abrasive paste.</li>
<li><strong>Erosion</strong> from dietary or gastric acid thinning the enamel.</li>
<li><strong>Attrition</strong> from ${D('bruxism', 'grinding')}, wearing through enamel on the biting surfaces.</li>
<li><strong>${D('dental-caries', 'Decay')}</strong> penetrating enamel.</li>
<li><strong>${D('tooth-fracture', 'Chips and fractures')}</strong> exposing a dentin surface directly.</li>
<li><strong>After whitening or a cleaning</strong> — usually temporary, as peroxide passes through the tubules and scaling exposes previously covered root surfaces.</li>
</ul>

<h3>Managing sensitivity, in a sensible order</h3>
<ol>
<li><strong>Get the cause identified.</strong> Sensitivity from a receded gum, from a crack, and from decay feel similar to the patient but need entirely different treatment. Persistent sensitivity in one specific tooth is more concerning than generalised sensitivity across many.</li>
<li><strong>Desensitising toothpaste</strong> with potassium nitrate or stannous fluoride, applied by rubbing a small amount directly onto the sensitive area with a fingertip and leaving it rather than rinsing immediately. Expect two to four weeks for meaningful effect, not two days.</li>
<li><strong>Stop the mechanical cause</strong> — soft brush, light pressure, no abrasive whitening paste on the affected area.</li>
<li><strong>Reduce acid exposure</strong> and never brush within thirty minutes of it.</li>
<li><strong>In-office fluoride varnish or sealant</strong> over exposed areas.</li>
<li><strong>Restore</strong> abrasion notches, decay, or fractures where present.</li>
<li><strong>Splint for grinding</strong> if attrition is the mechanism.</li>
</ol>
<div style="${WARN}"><strong>Sensitivity that changes character needs examination, not stronger toothpaste.</strong> The reassuring pattern is a sharp pain that stops as soon as the stimulus is removed. Warning signs are pain that lingers for minutes afterwards, pain that wakes you at night, or pain that arrives spontaneously with no trigger — these suggest the pulp itself is inflamed as ${D('pulpitis', 'pulpitis')} rather than dentin merely being exposed, and that is a different problem with a different urgency.</div>

<h3>Why teeth yellow with age</h3>
<p>Dentin is naturally yellower than enamel, and two changes work together over decades: enamel gradually thins and becomes more translucent, while the pulp continues depositing secondary dentin and thickens that inner layer. The result is progressively more yellow showing through progressively less white. It is anatomy, not neglect — which also explains why bleaching has limits, since it acts on the tooth's mineral content and cannot restore lost enamel thickness. See ${D('tooth-discoloration', 'tooth discoloration')} for the full picture.</p>

<h3>Notes for patients based in Korea</h3>
<p>If you have widespread sensitivity, bring your toothbrush and toothpaste to the appointment — brush bristle splay and paste abrasivity are often the most informative findings, and they are easier to demonstrate than describe. We are roughly 30 minutes from Camp Humphreys and consultations are conducted in English. ${L('/en/reservation', 'Book a consultation')} if sensitivity is persistent or localised to one tooth.</p>
`,
  faqs: [
    { q: 'Why are my teeth sensitive to cold?', a: 'Because dentin is exposed somewhere. Dentin contains microscopic fluid-filled tubules connected to the pulp, and cold makes that fluid move, which stimulates the nerve. The exposure could be from gum recession, worn enamel, an abrasion notch, a crack, decay, or a leaking filling margin, so identifying which one matters more than simply suppressing the symptom.' },
    { q: 'Does desensitising toothpaste actually work?', a: 'Yes, for genuine dentin sensitivity, but it needs correct use and realistic timing. Rub a small amount directly onto the sensitive area with a fingertip and leave it rather than rinsing straight away, and allow two to four weeks for meaningful effect. Most people who conclude it does not work either rinsed it off immediately or gave it only a few days.' },
    { q: 'Can dentin repair itself?', a: 'To a limited but real extent, unlike enamel. Tubules can mineralise and narrow, reducing sensitivity over time, and the pulp can lay down reparative dentin beneath an injury. This capacity is why a dentist may deliberately leave a thin layer of affected dentin in a deep cavity and seal over it, allowing the tooth to build its own barrier and preserving the nerve.' },
    { q: 'Why did my teeth become sensitive after a cleaning?', a: 'Because scaling removes calculus that was covering root surfaces, exposing dentin that had been shielded. It is usually temporary and settles over days to a couple of weeks as the tubules mineralise. Using a desensitising paste during that period helps. It is worth mentioning if it persists beyond a few weeks, since that suggests another cause.' },
    { q: 'When is sensitivity a sign of something more serious?', a: 'When the character changes. Sharp pain that stops the moment the stimulus is removed is typical of exposed dentin. Pain that lingers for minutes, wakes you at night, or arises spontaneously without any trigger suggests the pulp itself is inflamed, which is a different diagnosis with greater urgency. Sensitivity localised to one tooth also deserves examination rather than toothpaste.' },
    { q: 'Why do teeth get yellower with age?', a: 'Two anatomical changes combine. Enamel thins and becomes more translucent with decades of wear, while the pulp keeps depositing secondary dentin and thickens that inner layer. Since dentin is naturally yellower than enamel, you progressively see more yellow through less white. It reflects normal ageing rather than poor hygiene, and it also limits what bleaching can achieve.' },
  ],
})

EN_TERMS.push({
  slug: 'alveolar-bone',
  h1: 'Alveolar Bone',
  ko: '치조골',
  aka: ['jawbone', 'bone around teeth', 'alveolar ridge', 'bone loss teeth', 'jaw bone loss'],
  cat: 'Tooth Anatomy',
  tldr: 'Alveolar bone is the specialised bone forming the sockets that hold the teeth. Its defining characteristic is that it exists because of the teeth: it develops as they erupt and resorbs when they are lost. This is why extracted sites shrink, why timing matters for implant planning, and why bone loss from periodontal disease is the mechanism by which teeth eventually loosen.',
  body: `
<h3>Tooth-dependent bone — the concept that explains the rest</h3>
<p>Unlike the rest of the skeleton, alveolar bone is functionally tied to the presence of teeth. It forms as teeth erupt, remodels continuously in response to the forces transmitted through the ${D('periodontal-ligament', 'periodontal ligament')}, and atrophies once that stimulus disappears. Remove a tooth and the socket does not simply fill in level — the surrounding ridge narrows and reduces in height, most rapidly in the first several months and continuing slowly for years.</p>
<div style="${BOX}"><strong>This is the practical argument behind not leaving gaps indefinitely.</strong> Bone volume determines what replacement options remain available. A site restored while the ridge is still substantial is straightforward; the same site years later may require grafting first, adding cost, time, and complexity. It is also why an extraction plan should include a conversation about what comes next, rather than treating removal as a finished episode. See ${L('/en/implant', 'implant treatment')} for how ridge volume affects planning.</div>

<h3>How bone is lost</h3>
<table style="${TBL}">
<tr><th style="${TH}">Cause</th><th style="${TH}">Pattern</th><th style="${TH}">Reversible?</th></tr>
<tr><td style="${TD}">${D('periodontitis', 'Periodontitis')}</td><td style="${TD}">Progressive loss around specific teeth</td><td style="${TD}">Loss is permanent; progression is stoppable</td></tr>
<tr><td style="${TD}">Tooth extraction</td><td style="${TD}">Ridge narrowing and height reduction</td><td style="${TD}">Preventable in part by preservation techniques</td></tr>
<tr><td style="${TD}">${D('periapical-lesion', 'Periapical infection')}</td><td style="${TD}">Localised defect at the root tip</td><td style="${TD}">Often fills in after successful treatment</td></tr>
<tr><td style="${TD}">Cyst or pathology</td><td style="${TD}">Expanding defect</td><td style="${TD}">Depends on lesion and repair</td></tr>
<tr><td style="${TD}">Long-term denture wearing</td><td style="${TD}">Generalised ridge flattening</td><td style="${TDC}">No</td></tr>
<tr><td style="${TD}">Occlusal overload</td><td style="${TD}">Localised, accelerates existing loss</td><td style="${TD}">Progression modifiable</td></tr>
</table>
<div style="${WARN}"><strong>Bone lost to periodontal disease does not regrow with better brushing.</strong> This is the hardest thing for patients to hear and the most important to understand. Treatment stops further loss and can stabilise a tooth for decades, but the height already gone stays gone except in specific defect shapes amenable to regenerative procedures. It reframes the entire value of early treatment: you are protecting bone you still have, not planning to recover bone you have lost.</div>

<h3>Why the bone is what actually loosens teeth</h3>
<p>Patients often assume gum disease loosens teeth by weakening the gums. In fact the gum is the visible tissue and the bone is the structural one. As ${D('chronic-periodontitis', 'chronic periodontitis')} destroys bone height, progressively less root is supported, and a tooth with a fraction of its original support becomes mobile even with a perfectly healthy-looking gum surface. This is also why the crucial measurements at a periodontal examination are pocket depths and radiographic bone levels rather than how much the gums bleed.</p>

<h3>What supports bone health</h3>
<ul>
<li><strong>Control periodontal inflammation</strong> — by a wide margin the most important factor.</li>
<li><strong>Stop smoking.</strong> Smoking impairs the blood supply and healing capacity of alveolar bone and worsens both periodontal and implant outcomes.</li>
<li><strong>Manage diabetes.</strong> Glycaemic control and periodontal status influence one another in both directions.</li>
<li><strong>Keep functional loading</strong> — teeth in use maintain the bone that supports them.</li>
<li><strong>Replace missing teeth in reasonable time</strong> rather than leaving the ridge unstimulated for years.</li>
<li><strong>Discuss bone-modifying medications.</strong> Bisphosphonates and denosumab, used for osteoporosis or in oncology, affect bone turnover and must be disclosed before any extraction or surgery — this is not optional information.</li>
<li><strong>Treat ${D('bruxism', 'grinding')}</strong> where overload is accelerating loss around specific teeth.</li>
</ul>

<h3>Grafting and preservation, briefly</h3>
<p>Where volume is inadequate, bone can be augmented — socket preservation at the time of extraction, guided regeneration, ridge augmentation, or a sinus lift in the upper back jaw. These are established procedures, but the general principle holds that preserving existing bone is simpler, faster, and more predictable than rebuilding it. The single most effective preservation measure available to most patients is having periodontal disease treated early rather than after mobility appears.</p>

<h3>Notes for patients based in Korea</h3>
<p>If bone loss has been mentioned to you previously, ask for the radiographs before relocating — bone levels are assessed by comparison over time, and a new clinician starting without prior films cannot tell stable loss from active progression. Also disclose any osteoporosis medication at the first visit, since it changes surgical planning. We are approximately 30 minutes from Camp Humphreys, consultations are in English, and periodontal and implant fees are on our ${L('/en/pricing', 'English price page')}. ${L('/en/reservation', 'Book an assessment')}.</p>
`,
  faqs: [
    { q: 'Can bone lost to gum disease grow back?', a: 'Generally no. Periodontal treatment stops further loss and can keep a tooth stable for decades, but bone height already lost does not return, apart from certain defect shapes that respond to regenerative procedures. This is why early treatment matters so much: the goal is protecting the bone you still have rather than recovering what has gone.' },
    { q: 'Why do my teeth feel loose if my gums look normal?', a: 'Because the bone, not the gum, provides structural support. Periodontal disease destroys bone height silently, and once a tooth retains only a fraction of its original support it becomes mobile even with a healthy-looking gum surface. This is exactly why pocket depths and radiographic bone levels are measured rather than judging by appearance alone.' },
    { q: 'What happens to the bone after a tooth is extracted?', a: 'It resorbs, because alveolar bone exists in response to the tooth and loses its stimulus once the tooth is gone. The ridge narrows and reduces in height, most rapidly over the first several months and slowly thereafter. This is why replacement options are more straightforward earlier, and why socket preservation is sometimes done at the time of extraction.' },
    { q: 'Does that mean I must get an implant immediately?', a: 'Not immediately, but the timing is a genuine clinical variable rather than purely a matter of preference. Bone volume determines which options remain available without grafting, so leaving a site for years can turn a simple case into one requiring augmentation first. Discussing the replacement plan at the time of extraction is the practical approach.' },
    { q: 'Why does my dentist ask about osteoporosis medication?', a: 'Because bisphosphonates and denosumab alter bone turnover and affect healing after extractions or surgery, with a small but important risk of impaired healing in the jaw. Knowing which drug, at what dose, and for how long changes surgical planning and precautions. This is one medication category that should always be disclosed, including past use.' },
    { q: 'Can bone be rebuilt if I have already lost a lot?', a: 'Often yes, through grafting procedures such as guided bone regeneration, ridge augmentation, or a sinus lift in the upper back jaw. They are well established and frequently successful. The honest caveat is that rebuilding is more complex, more expensive, and less predictable than preserving, which is why prevention and early periodontal treatment remain the better investment.' },
  ],
})

EN_TERMS.push({
  slug: 'periodontal-ligament',
  h1: 'Periodontal Ligament',
  ko: '치주인대',
  aka: ['PDL', 'tooth ligament', 'ligament around tooth', 'tooth attachment', 'periodontal fibres'],
  cat: 'Tooth Anatomy',
  tldr: 'The periodontal ligament is the thin band of fibrous tissue connecting the tooth root to the surrounding bone. It is not a rigid cement joint but a living shock absorber with its own nerve and blood supply. It is what lets you sense bite pressure, what makes orthodontic tooth movement possible, and what an implant does not have.',
  body: `
<h3>A joint, not glue</h3>
<p>The root is suspended in its socket by collagen fibre bundles running from the root surface into the ${D('alveolar-bone', 'alveolar bone')}. This arrangement permits a fraction of a millimetre of physiological movement under load, distributing chewing force rather than transmitting it rigidly. Within that narrow space sit blood vessels, nerve fibres, and cell populations capable of remodelling both bone and the root surface — which is what makes the ligament biologically active rather than merely structural.</p>

<h3>What it does</h3>
<table style="${TBL}">
<tr><th style="${TH}">Function</th><th style="${TH}">Clinical significance</th></tr>
<tr><td style="${TD}">Shock absorption</td><td style="${TD}">Protects both the tooth and the bone from impact loading</td></tr>
<tr><td style="${TD}">Proprioception</td><td style="${TD}">You can sense a hair between your teeth and detect a high filling</td></tr>
<tr><td style="${TD}">Remodelling capacity</td><td style="${TD}">Makes orthodontic movement possible</td></tr>
<tr><td style="${TD}">Nutrient supply</td><td style="${TD}">Feeds the cementum and adjacent bone</td></tr>
<tr><td style="${TD}">Protective reflex</td><td style="${TD}">Triggers jaw opening when you bite something unexpectedly hard</td></tr>
</table>
<div style="${BOX}"><strong>Proprioception is the function patients only appreciate once it is gone.</strong> The ligament's nerve endings are extraordinarily sensitive to pressure and direction, which is why you immediately notice a new filling that sits a fraction too high and why you can feel a poppy seed. An ${L('/en/implant', 'implant')} integrates directly with bone and has no ligament, so it has no proprioception — patients typically adapt well, but the sensory feedback genuinely differs from a natural tooth, and this is worth understanding before treatment rather than discovering afterwards.</div>

<h3>Why orthodontics works at all</h3>
<p>Apply sustained gentle force to a tooth and the ligament responds asymmetrically: bone is resorbed on the side being compressed and deposited on the side under tension, so the tooth migrates through bone while remaining attached. Two consequences follow directly. First, force must be light and continuous — heavy force crushes the ligament's blood supply, causing pain, cell death, and in some cases root resorption. Second, the remodelled tissue takes far longer to stabilise than the movement took, which is the biological reason ${D('malocclusion', 'orthodontic')} retention is a permanent commitment rather than an optional aftercare phase.</p>

<h3>What damages it</h3>
<ul>
<li><strong>${D('periodontitis', 'Periodontal disease')}</strong> — inflammation destroys ligament fibres along with bone, and this attachment loss is what defines periodontitis rather than ${D('gingivitis', 'gingivitis')}.</li>
<li><strong>Occlusal trauma</strong> — a high restoration or ${D('bruxism', 'grinding')} overload produces ligament inflammation, widening on radiographs, and a tooth that feels tender to bite on.</li>
<li><strong>Trauma</strong> — a knocked or displaced tooth injures the ligament directly, and the fate of those cells determines whether a replanted ${D('tooth-fracture', 'avulsed tooth')} survives.</li>
<li><strong>Excessive orthodontic force</strong>, risking root resorption.</li>
<li><strong>Root canal infection</strong> extending through the apex into the ligament space as a ${D('periapical-lesion', 'periapical lesion')}.</li>
</ul>
<div style="${WARN}"><strong>This is why an avulsed tooth must never be scrubbed and must not be stored in water.</strong> Ligament cells remaining on the root surface are what allow reattachment, and they die quickly when dried or exposed to plain water. Handle by the crown, rinse only briefly if visibly dirty, store in cold milk or saline or inside the cheek, and get to a dentist within the hour. Almost everything about avulsion first aid comes down to keeping these cells alive.</div>

<h3>How it is assessed</h3>
<ol>
<li><strong>Percussion.</strong> Tapping a tooth that is tender indicates ligament inflammation, from overload or infection.</li>
<li><strong>Mobility.</strong> Graded movement reflects combined ligament and bone status.</li>
<li><strong>Probing.</strong> Attachment level, not just pocket depth, is what quantifies ligament loss.</li>
<li><strong>Radiographs.</strong> A widened ligament space suggests overload, inflammation, or in some cases pathology.</li>
<li><strong>Bite assessment.</strong> Identifying a single high contact frequently resolves an unexplained tender tooth in one short appointment.</li>
</ol>
<p>The last point is worth emphasising, because a tooth that became sore to bite on shortly after a new filling or crown is often a straightforward occlusal adjustment rather than anything requiring root treatment. If a recently restored tooth is tender, mention the timing explicitly.</p>

<h3>Notes for patients based in Korea</h3>
<p>If a tooth became tender after recent dental work, say when it started — that single detail frequently distinguishes a high contact needing a two-minute adjustment from a pulp problem needing considerably more. And if a tooth is knocked out, the ligament clock is running: cold milk, no scrubbing, immediate care. We are around 30 minutes from Camp Humphreys with English-language consultation. ${L('/en/reservation', 'Book an appointment')}.</p>
`,
  faqs: [
    { q: 'What does the periodontal ligament actually do?', a: 'It suspends the tooth root within its socket by collagen fibres, absorbing and distributing chewing force rather than transmitting it rigidly to bone. It also carries nerve endings that let you sense bite pressure, supplies nutrients to adjacent tissues, and contains cells that remodel bone — which is what makes orthodontic tooth movement biologically possible.' },
    { q: 'Why can I feel a high filling so precisely?', a: 'Because the ligament contains highly sensitive pressure receptors that detect minute differences in force and direction. This proprioception is why you can sense a hair between your teeth and why a restoration a fraction of a millimetre too high is immediately obvious. It is also useful diagnostically, since your localisation of the problem is often accurate.' },
    { q: 'Do dental implants have a periodontal ligament?', a: 'No. An implant integrates directly with bone, with no intervening ligament, so it lacks both the shock-absorbing function and the pressure sensation of a natural tooth. Most patients adapt well and function normally, but the sensory feedback genuinely differs and force is transmitted more directly to bone. Understanding this before treatment sets accurate expectations.' },
    { q: 'How do braces move teeth?', a: 'Sustained light force makes the ligament remodel asymmetrically — bone resorbs on the compressed side and forms on the tension side — so the tooth migrates through bone while staying attached. Force must be light and continuous, because heavy force compresses the blood supply, causing pain and risking root resorption rather than faster movement.' },
    { q: 'Why do I need a retainer after orthodontics?', a: 'Because the remodelled ligament fibres and bone take far longer to stabilise than the movement itself took, and the surrounding tissues keep exerting force on the repositioned teeth. Without retention the teeth drift back. Since teeth continue moving throughout life regardless, retention is best treated as a permanent maintenance habit rather than a temporary phase.' },
    { q: 'Why must a knocked-out tooth be kept in milk rather than water?', a: 'Because ligament cells on the root surface are what allow the tooth to reattach, and plain water destroys them osmotically while drying kills them quickly. Cold milk or saline preserves them, as does holding the tooth inside your own cheek. Handle it by the crown, never scrub the root, and get to a dentist within the hour.' },
  ],
})


// ════════════════════════════════════════════════════════════
// ROUTES — /en/dictionary  hub + /en/dictionary/:slug detail
// ════════════════════════════════════════════════════════════

const SITE = 'https://bdbddc.com'
const OG_IMG = `${SITE}/images/og-glownate.jpg`
const TEL = '+82-41-415-2892'

/** 카테고리 표시 순서 (허브 그룹 순서) */
const CAT_ORDER: EnCat[] = [
  'Gum & Periodontal',
  'Tooth Decay & Pulp',
  'Cracks & Trauma',
  'Wisdom & Eruption',
  'Bite & Jaw',
  'Mouth & Tongue',
  'Tooth Anatomy',
]

const CAT_ICON: Record<EnCat, string> = {
  'Gum & Periodontal': '🦠',
  'Tooth Decay & Pulp': '🦷',
  'Cracks & Trauma': '⚡',
  'Wisdom & Eruption': '🌱',
  'Bite & Jaw': '😬',
  'Mouth & Tongue': '👄',
  'Tooth Anatomy': '🔬',
}

const BY_SLUG = new Map<string, EnTerm>(EN_TERMS.map(t => [t.slug, t]))

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

/** JSON-LD 안전 직렬화 (</script> 차단) */
const jsonld = (o: unknown) =>
  `<script type="application/ld+json">${JSON.stringify(o).replace(/</g, '\\u003c')}</script>`

/** 8개 언어 hreflang 클러스터. enHref만 페이지별로 달라진다. */
const hreflangs = (enHref: string, koHref: string) => `
<link rel="alternate" hreflang="ko" href="${koHref}">
<link rel="alternate" hreflang="en" href="${enHref}">
<link rel="alternate" hreflang="ja" href="${SITE}/jp/dental">
<link rel="alternate" hreflang="zh-CN" href="${SITE}/cn/dental">
<link rel="alternate" hreflang="vi" href="${SITE}/vi/">
<link rel="alternate" hreflang="th" href="${SITE}/th/">
<link rel="alternate" hreflang="ru" href="${SITE}/ru/">
<link rel="alternate" hreflang="x-default" href="${enHref}">`

const NAV = `<nav class="iv2-nav"><div class="iv2-nav__inner"><a href="/en/" class="iv2-nav__logo"><span class="tooth">🦷</span><span class="txt">Seoul BD Dental</span></a><div class="iv2-nav__links"><a href="/en/">Home</a><a href="/en/implant">Implants</a><a href="/en/invisalign">Invisalign</a><a href="/en/laminate">Veneers</a><a href="/en/pricing">Pricing</a><a href="/en/dictionary" class="active">Dictionary</a><a href="/en/directions">Directions</a><a href="/en/reservation">Book</a></div><a href="tel:${TEL}" class="iv2-nav__tel"><i class="fas fa-phone"></i><span>041-415-2892</span></a></div></nav>`

const FOOTER = `<footer class="ed-foot"><div class="ed-wrap">
<p class="ed-foot__name">Seoul BD Dental · 서울비디치과</p>
<p>14, Buldang 34-gil, Seobuk-gu, Cheonan-si, Chungcheongnam-do 31120, Korea</p>
<p>Tel <a href="tel:${TEL}">${TEL}</a> · Open 365 days · Mon–Fri 09:00–20:00 · Sat/Sun/Holidays 09:00–13:00</p>
<p>About 30 minutes by car from Camp Humphreys · 10 minutes from KTX Cheonan-Asan Station</p>
<p class="ed-foot__disc">This dictionary provides general dental information for educational purposes. It is not a diagnosis and does not replace an in-person examination by a licensed dentist.</p>
<p class="ed-foot__links"><a href="/en/">English Home</a> · <a href="/en/pricing">Pricing</a> · <a href="/en/reservation">Book</a> · <a href="/encyclopedia/">한국어 백과사전</a></p>
</div></footer>`

const CSS = `
*{box-sizing:border-box}
body{margin:0;font-family:'Pretendard',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#33291f;background:#fffdfa;line-height:1.75;-webkit-font-smoothing:antialiased}
a{color:#6B4226}
.ed-wrap{max-width:880px;margin:0 auto;padding:0 20px}
.ed-hero{background:linear-gradient(135deg,#6B4226 0%,#8a5c37 55%,#a6763f 100%);color:#fff;padding:46px 0 40px}
.ed-hero .ed-wrap{max-width:880px}
.ed-crumb{font-size:.78rem;opacity:.85;margin-bottom:14px}
.ed-crumb a{color:#f2e2cb;text-decoration:none}
.ed-crumb a:hover{text-decoration:underline}
.ed-badge{display:inline-block;background:rgba(255,255,255,.16);border:1px solid rgba(255,255,255,.3);color:#f6e6c8;font-size:.74rem;font-weight:700;letter-spacing:.04em;padding:5px 12px;border-radius:99px;margin-bottom:14px}
.ed-hero h1{font-size:2.05rem;line-height:1.25;margin:0 0 10px;font-weight:900;letter-spacing:-.02em}
.ed-hero .ed-ko{font-size:.95rem;color:#e9d3ae;margin:0 0 6px;font-weight:600}
.ed-hero .ed-aka{font-size:.8rem;opacity:.8;margin:0}
.ed-main{padding:34px 0 10px}
.ed-tldr{background:#fff8ec;border:1px solid #ecd9b4;border-left:5px solid #c9a96e;border-radius:0 14px 14px 0;padding:20px 22px;margin:0 0 28px}
.ed-tldr b{display:block;color:#6B4226;font-size:.8rem;letter-spacing:.06em;text-transform:uppercase;margin-bottom:8px}
.ed-tldr p{margin:0;font-size:1.02rem}
.ed-body h3{font-size:1.28rem;font-weight:900;color:#6B4226;margin:34px 0 12px;padding-bottom:8px;border-bottom:2px solid #f0e5d4;letter-spacing:-.01em}
.ed-body p{margin:0 0 14px}
.ed-body ul,.ed-body ol{margin:0 0 16px;padding-left:22px}
.ed-body li{margin-bottom:8px}
.ed-body table{width:100%;border-collapse:collapse;margin:16px 0;font-size:.9rem;display:block;overflow-x:auto}
.ed-body strong{color:#5a3720}
.ed-faq{margin:38px 0 0}
.ed-faq h2{font-size:1.4rem;color:#6B4226;font-weight:900;margin:0 0 16px}
.ed-faq details{border:1px solid #ece0cd;border-radius:12px;margin-bottom:10px;background:#fff;overflow:hidden}
.ed-faq summary{cursor:pointer;padding:15px 18px;font-weight:700;font-size:.97rem;color:#5a3720;list-style:none}
.ed-faq summary::-webkit-details-marker{display:none}
.ed-faq summary::after{content:'+';float:right;color:#c9a96e;font-weight:900;font-size:1.2rem;line-height:1}
.ed-faq details[open] summary::after{content:'−'}
.ed-faq details[open] summary{background:#faf7f3;border-bottom:1px solid #f0e5d4}
.ed-faq .a{padding:15px 18px;font-size:.94rem;color:#4a3b2c;margin:0}
.ed-rel{margin:38px 0 0}
.ed-rel h2{font-size:1.25rem;color:#6B4226;font-weight:900;margin:0 0 14px}
.ed-pills{display:flex;flex-wrap:wrap;gap:9px}
.ed-pill{display:inline-block;background:#faf7f3;border:1px solid #e6d8c2;border-radius:99px;padding:8px 16px;font-size:.87rem;font-weight:600;color:#6B4226;text-decoration:none;transition:.15s}
.ed-pill:hover{background:#6B4226;color:#fff;border-color:#6B4226}
.ed-cta{margin:44px 0 20px;background:linear-gradient(135deg,#6B4226,#8a5c37);color:#fff;border-radius:18px;padding:32px 28px;text-align:center}
.ed-cta h2{font-size:1.35rem;margin:0 0 8px;font-weight:900;color:#fff}
.ed-cta p{margin:0 0 20px;font-size:.93rem;opacity:.92}
.ed-btns{display:flex;gap:10px;justify-content:center;flex-wrap:wrap}
.ed-btn{display:inline-block;padding:13px 24px;border-radius:99px;font-weight:800;font-size:.92rem;text-decoration:none;transition:.15s}
.ed-btn--gold{background:#E9C46A;color:#4a3218}
.ed-btn--gold:hover{background:#f2d68c}
.ed-btn--ghost{background:transparent;color:#fff;border:1.5px solid rgba(255,255,255,.55)}
.ed-btn--ghost:hover{background:rgba(255,255,255,.14)}
.ed-cats{margin:8px 0 0}
.ed-cat{margin:0 0 34px}
.ed-cat h2{font-size:1.22rem;color:#6B4226;font-weight:900;margin:0 0 4px;display:flex;align-items:center;gap:9px}
.ed-cat .cnt{font-size:.76rem;color:#a08a6d;font-weight:700;background:#f5efe6;padding:3px 10px;border-radius:99px}
.ed-cat__sub{font-size:.85rem;color:#8a7660;margin:0 0 14px}
.ed-cards{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:14px}
.ed-card{display:block;background:#fff;border:1px solid #ece0cd;border-radius:14px;padding:18px 18px 16px;text-decoration:none;color:inherit;transition:.16s}
.ed-card:hover{border-color:#c9a96e;box-shadow:0 8px 22px rgba(107,66,38,.09);transform:translateY(-2px)}
.ed-card h3{margin:0 0 4px;font-size:1.03rem;font-weight:900;color:#6B4226;letter-spacing:-.01em}
.ed-card .ko{font-size:.78rem;color:#a08a6d;margin:0 0 8px;font-weight:600}
.ed-card p{margin:0;font-size:.85rem;color:#5f5140;line-height:1.62;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}
.ed-intro{background:#faf7f3;border-left:4px solid #c9a96e;border-radius:0 12px 12px 0;padding:18px 22px;margin:0 0 30px}
.ed-intro p{margin:0 0 10px;font-size:.95rem}
.ed-intro p:last-child{margin:0}
.ed-foot{margin-top:50px;background:#33291f;color:#cbbba6;padding:34px 0 40px;font-size:.83rem}
.ed-foot .ed-wrap{max-width:880px}
.ed-foot p{margin:0 0 6px}
.ed-foot a{color:#e9c46a}
.ed-foot__name{color:#fff;font-weight:800;font-size:1rem;margin-bottom:10px!important}
.ed-foot__disc{margin-top:14px!important;padding-top:14px;border-top:1px solid rgba(255,255,255,.14);font-size:.76rem;opacity:.72}
.ed-foot__links{margin-top:12px!important}
.iv2-nav{background:#fff;border-bottom:1px solid rgba(107,66,38,.1);position:sticky;top:0;z-index:50}
.iv2-nav__inner{max-width:1160px;margin:0 auto;padding:0 20px;height:60px;display:flex;align-items:center;gap:20px}
.iv2-nav__logo{display:flex;align-items:center;gap:7px;font-weight:900;color:#6B4226;text-decoration:none;font-size:1rem;flex-shrink:0}
.iv2-nav__links{display:flex;gap:15px;margin-left:auto;flex-wrap:wrap}
.iv2-nav__links a{color:#5f5140;text-decoration:none;font-size:.86rem;font-weight:600}
.iv2-nav__links a:hover,.iv2-nav__links a.active{color:#B08430}
.iv2-nav__tel{display:flex;align-items:center;gap:6px;background:#6B4226;color:#fff;padding:9px 15px;border-radius:99px;font-size:.83rem;font-weight:700;text-decoration:none;flex-shrink:0}
@media(max-width:860px){.iv2-nav__inner{height:auto;padding:10px 16px;flex-wrap:wrap}.iv2-nav__links{margin-left:0;order:3;width:100%;gap:12px;padding-top:4px}.iv2-nav__tel{margin-left:auto}}
@media(max-width:640px){.ed-hero h1{font-size:1.62rem}.ed-hero{padding:32px 0 28px}.ed-body h3{font-size:1.14rem}.ed-cards{grid-template-columns:1fr}}
`

/** 공통 <head> */
const head = (o: {
  title: string
  desc: string
  canonical: string
  koHref: string
  ld: string
}) => `<!DOCTYPE html>
<html lang="en" prefix="og: https://ogp.me/ns#">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0">
<title>${esc(o.title)}</title>
<meta name="description" content="${esc(o.desc)}">
<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1">
<link rel="canonical" href="${o.canonical}">
<meta name="geo.region" content="KR-44">
<meta name="geo.placename" content="Cheonan-si, Chungcheongnam-do">
<meta name="geo.position" content="36.8061852;127.1063344">
<meta property="og:title" content="${esc(o.title)}">
<meta property="og:description" content="${esc(o.desc)}">
<meta property="og:type" content="article">
<meta property="og:url" content="${o.canonical}">
<meta property="og:locale" content="en_US">
<meta property="og:site_name" content="Seoul BD Dental">
<meta property="og:image" content="${OG_IMG}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(o.title)}">
<meta name="twitter:description" content="${esc(o.desc)}">
<meta name="twitter:image" content="${OG_IMG}">
${hreflangs(o.canonical, o.koHref)}
<link rel="icon" href="/favicon.ico?v=2" sizes="48x48">
<link rel="icon" type="image/svg+xml" href="/images/icons/favicon.svg?v=2">
<link rel="apple-touch-icon" sizes="180x180" href="/images/icons/apple-touch-icon.png?v=2">
<meta name="theme-color" content="#6B4226">
<link rel="preconnect" href="https://cdn.jsdelivr.net" crossorigin>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css">
<style>${CSS}</style>
${o.ld}
</head>
<body>
${NAV}`

/** DefinedTermSet 참조 (사전 전체) */
const TERM_SET = {
  '@type': 'DefinedTermSet',
  '@id': `${SITE}/en/dictionary#termset`,
  name: 'Seoul BD Dental — English Dental Dictionary',
  url: `${SITE}/en/dictionary`,
  inLanguage: 'en',
}

const CLINIC_REF = { '@id': `${SITE}/#dentist` }

/** 관련 용어 선정: 본문에서 실제 링크한 용어 우선, 부족하면 같은 카테고리로 채운다 */
function relatedOf(t: EnTerm, max = 6): EnTerm[] {
  const out: EnTerm[] = []
  const seen = new Set<string>([t.slug])
  const re = /\/en\/dictionary\/([a-z0-9-]+)/g
  let m: RegExpExecArray | null
  while ((m = re.exec(t.body)) !== null) {
    const s = m[1]
    if (seen.has(s)) continue
    const hit = BY_SLUG.get(s)
    if (hit) { out.push(hit); seen.add(s) }
    if (out.length >= max) return out
  }
  for (const o of EN_TERMS) {
    if (out.length >= max) break
    if (seen.has(o.slug) || o.cat !== t.cat) continue
    out.push(o); seen.add(o.slug)
  }
  return out
}

export function registerEnDictionary(app: Hono<any>) {

  // ── 허브 ────────────────────────────────────────────────
  const hub = (c: any) => {
    const canonical = `${SITE}/en/dictionary`
    const title = `English Dental Dictionary — Symptoms, Conditions & Tooth Anatomy Explained | Seoul BD Dental`
    const desc = `Plain-English explanations of ${EN_TERMS.length} common dental conditions, symptoms and anatomical terms — written for English-speaking patients in Korea. Gum disease, cavities, wisdom teeth, TMJ, bad breath and more.`

    const ld = [
      jsonld({
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        '@id': `${canonical}#webpage`,
        url: canonical,
        name: title,
        description: desc,
        inLanguage: 'en',
        isPartOf: { '@type': 'WebSite', '@id': `${SITE}/#website`, url: SITE, name: 'Seoul BD Dental' },
        about: CLINIC_REF,
        dateModified: '2026-07-25',
      }),
      jsonld({
        '@context': 'https://schema.org',
        ...TERM_SET,
        description: desc,
        hasDefinedTerm: EN_TERMS.map(t => ({
          '@type': 'DefinedTerm',
          name: t.h1,
          url: `${SITE}/en/dictionary/${t.slug}`,
        })),
      }),
      jsonld({
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE}/` },
          { '@type': 'ListItem', position: 2, name: 'English', item: `${SITE}/en/` },
          { '@type': 'ListItem', position: 3, name: 'Dental Dictionary', item: canonical },
        ],
      }),
      jsonld({
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        name: 'English Dental Dictionary Terms',
        numberOfItems: EN_TERMS.length,
        itemListElement: EN_TERMS.map((t, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          name: t.h1,
          url: `${SITE}/en/dictionary/${t.slug}`,
        })),
      }),
    ].join('')

    const groups = CAT_ORDER.map(cat => {
      const items = EN_TERMS.filter(t => t.cat === cat)
      if (!items.length) return ''
      const cards = items.map(t => `<a class="ed-card" href="/en/dictionary/${t.slug}">
<h3>${esc(t.h1)}</h3>
<p class="ko">${esc(t.ko)}</p>
<p>${esc(t.tldr)}</p></a>`).join('')
      return `<section class="ed-cat">
<h2>${CAT_ICON[cat]} ${esc(cat)} <span class="cnt">${items.length}</span></h2>
<div class="ed-cards">${cards}</div>
</section>`
    }).join('')

    return c.html(`${head({ title, desc, canonical, koHref: `${SITE}/encyclopedia/`, ld })}
<header class="ed-hero"><div class="ed-wrap">
<nav class="ed-crumb"><a href="/en/">Home</a> › Dental Dictionary</nav>
<span class="ed-badge">🇺🇸 ENGLISH · ${EN_TERMS.length} TERMS</span>
<h1>English Dental Dictionary</h1>
<p class="ed-ko">한국어 백과사전 838종 · <a href="/encyclopedia/" style="color:#f2e2cb">보기</a></p>
<p class="ed-aka">Symptoms, conditions and tooth anatomy explained in plain English — for patients living in Korea.</p>
</div></header>
<main class="ed-main"><div class="ed-wrap">
<div class="ed-intro">
<p>If a Korean dentist has just told you something in a language you only half caught, this is the place to look it up. Each entry explains what the condition actually is, how it is usually managed, and what specifically differs when you are being treated in Korea — insurance status, records you can take with you on a PCS move, and when something genuinely warrants same-week attention.</p>
<p>These pages are informational. Nothing here is a diagnosis, and none of it quotes a price — for costs see <a href="/en/pricing">our pricing page</a>, which lists exactly the same figures Korean patients see.</p>
</div>
<div class="ed-cats">${groups}</div>
<section class="ed-cta">
<h2>Not sure what you're dealing with?</h2>
<p>Consultation in English, panoramic X-ray and 3D CT included. About 30 minutes from Camp Humphreys, open 365 days a year.</p>
<div class="ed-btns">
<a class="ed-btn ed-btn--gold" href="tel:${TEL}"><i class="fas fa-phone"></i> Call ${TEL}</a>
<a class="ed-btn ed-btn--ghost" href="/en/reservation">Book online</a>
<a class="ed-btn ed-btn--ghost" href="/en/pricing">See pricing</a>
</div>
</section>
</div></main>
${FOOTER}
</body></html>`)
  }

  app.get('/en/dictionary', hub)
  app.get('/en/dictionary/', hub)

  // ── 상세 ────────────────────────────────────────────────
  app.get('/en/dictionary/:slug', (c: any) => {
    const raw = c.req.param('slug') || ''
    const slug = raw.replace(/\.html?$/i, '').toLowerCase()
    const t = BY_SLUG.get(slug)

    // 동의어(aka)를 슬러그화한 값으로 들어온 경우 canonical 로 301
    if (!t) {
      const norm = slug.replace(/[^a-z0-9]+/g, '')
      const alias = EN_TERMS.find(x =>
        (x.aka || []).some(a => a.toLowerCase().replace(/[^a-z0-9]+/g, '') === norm) ||
        x.h1.toLowerCase().replace(/[^a-z0-9]+/g, '') === norm
      )
      if (alias) return c.redirect(`/en/dictionary/${alias.slug}`, 301)
      return c.redirect('/en/dictionary', 302)
    }
    if (slug !== raw) return c.redirect(`/en/dictionary/${slug}`, 301)

    const canonical = `${SITE}/en/dictionary/${t.slug}`
    const koHref = `${SITE}/encyclopedia/${encodeURIComponent(t.ko)}`
    const title = `${t.h1} — Causes, Symptoms & Treatment in Plain English | Seoul BD Dental`
    const desc = t.tldr.length > 155 ? t.tldr.slice(0, 152).replace(/\s+\S*$/, '') + '…' : t.tldr
    const rel = relatedOf(t)

    const ld = [
      jsonld({
        '@context': 'https://schema.org',
        '@type': ['WebPage', 'MedicalWebPage'],
        '@id': `${canonical}#webpage`,
        url: canonical,
        name: title,
        description: desc,
        inLanguage: 'en',
        isPartOf: { '@type': 'WebSite', '@id': `${SITE}/#website`, url: SITE, name: 'Seoul BD Dental' },
        about: CLINIC_REF,
        speakable: { '@type': 'SpeakableSpecification', cssSelector: ['.ed-tldr', '.ed-hero h1'] },
        dateModified: '2026-07-25',
      }),
      jsonld({
        '@context': 'https://schema.org',
        '@type': 'DefinedTerm',
        '@id': `${canonical}#term`,
        name: t.h1,
        alternateName: [t.ko, ...(t.aka || [])],
        description: t.tldr,
        url: canonical,
        inLanguage: 'en',
        inDefinedTermSet: TERM_SET,
      }),
      jsonld({
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE}/` },
          { '@type': 'ListItem', position: 2, name: 'English', item: `${SITE}/en/` },
          { '@type': 'ListItem', position: 3, name: 'Dental Dictionary', item: `${SITE}/en/dictionary` },
          { '@type': 'ListItem', position: 4, name: t.h1, item: canonical },
        ],
      }),
      jsonld({
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: t.faqs.map(f => ({
          '@type': 'Question',
          name: f.q,
          acceptedAnswer: { '@type': 'Answer', text: f.a },
        })),
      }),
    ].join('')

    const faqHtml = t.faqs.map((f, i) => `<details${i === 0 ? ' open' : ''}>
<summary>${esc(f.q)}</summary>
<p class="a">${esc(f.a)}</p>
</details>`).join('')

    const relHtml = rel.length ? `<section class="ed-rel">
<h2>Related terms</h2>
<div class="ed-pills">${rel.map(r => `<a class="ed-pill" href="/en/dictionary/${r.slug}">${esc(r.h1)}</a>`).join('')}</div>
</section>` : ''

    return c.html(`${head({ title, desc, canonical, koHref, ld })}
<header class="ed-hero"><div class="ed-wrap">
<nav class="ed-crumb"><a href="/en/">Home</a> › <a href="/en/dictionary">Dental Dictionary</a> › ${esc(t.cat)}</nav>
<span class="ed-badge">${CAT_ICON[t.cat]} ${esc(t.cat.toUpperCase())}</span>
<h1>${esc(t.h1)}</h1>
<p class="ed-ko">Korean: ${esc(t.ko)} · <a href="${koHref}" style="color:#f2e2cb">한국어 설명 보기</a></p>
${t.aka && t.aka.length ? `<p class="ed-aka">Also called: ${t.aka.map(esc).join(' · ')}</p>` : ''}
</div></header>
<main class="ed-main"><div class="ed-wrap">
<div class="ed-tldr"><b>In short</b><p>${esc(t.tldr)}</p></div>
<article class="ed-body">${t.body}</article>
<section class="ed-faq"><h2>Frequently asked questions</h2>${faqHtml}</section>
${relHtml}
<section class="ed-cta">
<h2>Have this checked in English</h2>
<p>Consultation with panoramic X-ray and 3D CT included, explained in English before anything starts. About 30 minutes from Camp Humphreys · open 365 days a year.</p>
<div class="ed-btns">
<a class="ed-btn ed-btn--gold" href="tel:${TEL}"><i class="fas fa-phone"></i> Call ${TEL}</a>
<a class="ed-btn ed-btn--ghost" href="/en/reservation">Book online</a>
<a class="ed-btn ed-btn--ghost" href="/en/pricing">See pricing</a>
</div>
</section>
<section class="ed-rel">
<h2>Browse the dictionary</h2>
<div class="ed-pills">
<a class="ed-pill" href="/en/dictionary">← All ${EN_TERMS.length} terms</a>
<a class="ed-pill" href="/encyclopedia/${encodeURIComponent(t.ko)}">한국어: ${esc(t.ko)}</a>
</div>
</section>
</div></main>
${FOOTER}
</body></html>`)
  })
}
