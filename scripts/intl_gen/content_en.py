# -*- coding: utf-8 -*-
"""EN content — 미군(Camp Humphreys) + 국제 환자 타겟"""

HREF_HOME = {'ko':'/','en':'/en/','ja':'/jp/dental','zh':'/cn/dental','vi':'/vi/','th':'/th/','ru':'/ru/'}
HREF_IMPLANT = {'ko':'/treatments/implant','en':'/en/implant','ja':'/jp/implant','zh':'/cn/implant','vi':'/vi/implant','th':'/th/implant','ru':'/ru/implant'}
HREF_INVIS = {'ko':'/treatments/invisalign','en':'/en/invisalign','ja':'/jp/invisalign','zh':'/cn/invisalign','vi':'/vi/invisalign'}
HREF_LAMINATE = {'ko':'/treatments/glownate','en':'/en/laminate','ja':'/jp/','zh':'/cn/','vi':'/vi/laminate'}
HREF_PRICING = {'ko':'/pricing','en':'/en/pricing','ja':'/jp/pricing','zh':'/cn/pricing','vi':'/vi/pricing','th':'/th/pricing','ru':'/ru/pricing'}
HREF_DIRECTIONS = {'ko':'/directions','en':'/en/directions','vi':'/vi/directions','th':'/th/directions','ru':'/ru/directions'}
HREF_RESERVATION = {'ko':'/reservation','en':'/en/reservation'}

LANG_CFG = {
    'home': '/en/',
    'nav': [('Home','/en/'),('Implants','/en/implant'),('Invisalign','/en/invisalign'),
            ('Veneers','/en/laminate'),('Pricing','/en/pricing'),('Directions','/en/directions'),
            ('Guides','/en/guide/'),('Book','/en/reservation')],
}

CTA_EN = {'type':'cta','bare':True,'id':'contact',
    't':'Book Your Visit','d':'English-friendly staff · Same price as Korean patients · No broker needed',
    'channels':[
        {'href':'tel:+82-41-415-2892','icon':'fas fa-phone','t':'Call Us','d':'+82-41-415-2892 · 9AM–8PM'},
        {'href':'/reservation','icon':'fas fa-calendar-check','t':'Online Booking','d':'bdbddc.com/reservation'},
        {'href':'https://www.instagram.com/seoul_bddc','icon':'fab fa-instagram','t':'Instagram DM','d':'@seoul_bddc','ext':True},
        {'href':'https://maps.google.com/?q=Seoul+BD+Dental+Cheonan','icon':'fas fa-map-marker-alt','t':'Google Maps','d':'Seoul BD Dental, Cheonan','ext':True},
    ]}

HOURS_EN = {'type':'info','alt':True,'label':'Hours','h2':'Opening Hours — 365 Days a Year','rows':[
    {'k':'Mon – Fri','v':'09:00 – 20:00 (evening care until 8PM)','gold':True},
    {'k':'Sat / Sun / Holidays','v':'09:00 – 13:00'},
    {'k':'Lunch break (weekdays)','v':'12:30 – 14:00'},
    {'k':'Closed days','v':'NONE — open 365 days','gold':True},
]}

PAGES = []

# ─────────────────────────────── /en/ (index)
PAGES.append({
'path':'en/index.html','lang':'en','html_lang':'en','canonical':'/en/','hreflang':HREF_HOME,
'title':'English-Speaking Dentist Near Camp Humphreys & Cheonan | 15 SNU Dentists, No Broker Fees — Seoul BD Dental',
'desc':'English-speaking dental clinic 30 min from Camp Humphreys, in Cheonan. 15 Seoul National University dentists, 6 surgery rooms, open 365 days until 8PM. Implants ₩800K–1.6M, Invisalign, veneers. Same price as Korean patients — NO broker fees. 10 min from KTX Cheonan-Asan. ☎ +82-41-415-2892',
'breadcrumb':[('Home','/'),('English','/en/')],
'hero':{'badge':'🇺🇸 English-Friendly · 30 min from Camp Humphreys',
 'h1':'Cheonan\'s Largest Dental Clinic,<br>Built for International Patients',
 'sub':'15 Seoul National University–trained dentists · 6 independent surgery rooms · Open 365 days a year until 8PM on weekdays. You pay exactly what Korean patients pay — no broker, no markup.',
 'ctas':[{'t':'Call +82-41-415-2892','href':'tel:+82-41-415-2892','icon':'fas fa-phone'},
         {'t':'See Pricing','href':'/en/pricing','icon':'fas fa-won-sign','style':'ghost'}],
 'stats':[('15','SNU Dentists'),('6','Surgery Rooms'),('365','Days Open'),('1,322㎡','Facility (400py)')]},
'sections':[
 {'type':'cards','label':'Why Us','h2':'Why International Patients Choose Seoul BD Dental',
  'desc':'The same clinical system as Seoul National University Dental Hospital — in Cheonan, at community prices.',
  'cards':[
   {'icon':'fas fa-user-doctor','t':'15 SNU-Trained Dentists','d':'Every dentist graduated from Seoul National University — Korea\'s top dental school. Each treatment is handled by the right specialist: implant surgeons, orthodontists, prosthodontists.'},
   {'icon':'fas fa-hospital','t':'400-Pyeong Hospital-Grade Facility','d':'Cheonan\'s largest dental clinic: 5 floors organized by specialty, 6 independent surgery rooms, air-shower infection control — the same protocol as university hospitals.'},
   {'icon':'fas fa-won-sign','t':'Zero Broker Fees','d':'Many clinics quote foreigners 20–50% higher through "medical tourism brokers." Here, you book directly and pay the exact same published price as Korean patients.'},
   {'icon':'fas fa-clock','t':'Open 365 Days, Until 8PM','d':'Weekday evenings until 20:00, plus weekends and holidays 9AM–1PM. Perfect for service members and workers who can\'t take weekday leave.'},
  ]},
 {'type':'banner','alt':True,'center':True,'html':'<b>🎖️ Serving the Camp Humphreys community.</b> We\'re a 30-minute drive (26 km) from Camp Humphreys — many USFK families visit us for implants, Invisalign and veneers at Korean local prices. Off-post dental care <b>without the hassle</b>: direct booking, English support, itemized receipts for insurance claims.'},
 {'type':'cards','label':'Treatments','h2':'Our Main Treatments','grid':'iv2-grid',
  'cards':[
   {'icon':'fas fa-tooth','t':'Dental Implants','href':'/en/implant','more':'Details & prices →','d':'₩800K–1.6M per tooth. Straumann & Osstem fixtures, navigation-guided surgery, 6 dedicated surgery rooms, sedation available.'},
   {'icon':'fas fa-teeth','t':'Invisalign','href':'/en/invisalign','more':'Details & prices →','d':'From ₩3M. SNU orthodontists, 3D ClinCheck simulation, remote-friendly appointment intervals for busy schedules.'},
   {'icon':'fas fa-sparkles','t':'Veneers / Glownate','href':'/en/laminate','more':'Details & prices →','d':'From ₩600K per tooth. Our signature minimal-prep premium veneer — completed in 2–3 days, ideal for short stays.'},
   {'icon':'fas fa-teeth-open','t':'General & Emergency','href':'/en/pricing','more':'Full price list →','d':'Cavity fillings, wisdom teeth, root canals, gum care, crowns, whitening, cleanings — walk-ins welcome, open every day.'},
  ]},
 {'type':'steps','alt':True,'label':'How It Works','h2':'Your First Visit in 4 Steps',
  'steps':[
   {'t':'Contact us','time':'1 min','d':'Call, book online, or DM us on Instagram. Tell us what you need in English — no Korean required.'},
   {'t':'Consultation & 3D scan','time':'Day 1 · ~30 min','d':'Panoramic X-ray and 3D CT included in your consult. The specialist explains options and exact costs before anything starts.'},
   {'t':'Treatment plan & quote','time':'Same day','d':'You get an itemized written quote — the same price sheet Korean patients see. No hidden fees, ever.'},
   {'t':'Treatment begins','time':'Same day or scheduled','d':'Simple treatments (cleaning, fillings) finish in one visit. Implants: 2–3 visits. Veneers: 2–3 days total.'},
  ]},
 HOURS_EN,
 {'type':'cards','label':'Access','h2':'Getting Here',
  'cards':[
   {'icon':'fas fa-car','t':'From Camp Humphreys','d':'About 30 min by car (26 km) via Route 45 / Highway 1. Free underground parking on-site. Address for GPS: 14, Buldang 34-gil, Seobuk-gu, Cheonan.'},
   {'icon':'fas fa-train','t':'From Seoul','d':'KTX Seoul Station → Cheonan-Asan Station (~40 min), then 10 min by taxi. We\'re the closest large dental clinic to the KTX station.'},
   {'icon':'fas fa-bus','t':'Local access','d':'Bus stop "Buldang Jugong 5-danji" is a 1-minute walk. Cheonan Terminal is 15 min by taxi.'},
  ]},
 {'type':'faq','alt':True,'label':'FAQ','h2':'Frequently Asked Questions',
  'faqs':[
   ('Do you have English-speaking staff?','Yes — our coordinators and dentists communicate in English for consultations and treatment explanations. For complex cases we prepare written treatment plans in English.'),
   ('How much does a dental implant cost?','₩800,000–1,600,000 per tooth depending on the fixture brand (Osstem CA ₩800K, Osstem SOI ₩1M, Straumann BLX ₩1.6M). Bone grafts, if needed, are ₩300K–500K. Foreigners pay the same price as Koreans.'),
   ('Can I use my US insurance / Tricare?','We are an off-post Korean clinic, so payment is made directly to us. We provide itemized English receipts and treatment records that many patients use to claim reimbursement from their insurer. Please check your plan\'s overseas dental coverage.'),
   ('Do I need an appointment?','Walk-ins are welcome 365 days a year, but booking ahead means little to no waiting. Call +82-41-415-2892 or use the online form.'),
   ('Can I finish treatment in one visit?','Cleanings, fillings, and simple extractions: yes, one visit. Implants need 2–3 visits over 2–6 months. Veneers take 2–3 days. We plan around deployment schedules and short stays.'),
   ('Is parking available?','Yes, free underground parking is available in our building.'),
  ]},
 CTA_EN,
]})

# ─────────────────────────────── /en/implant
PAGES.append({
'path':'en/implant.html','lang':'en','html_lang':'en','canonical':'/en/implant','hreflang':HREF_IMPLANT,
'title':'Dental Implants in Korea — ₩800K–1.6M Per Tooth, Straumann & Osstem | Seoul BD Dental, Cheonan',
'desc':'Dental implants near Camp Humphreys: Osstem from ₩800,000, Straumann BLX ₩1,600,000 per tooth. 6 dedicated surgery rooms, navigation-guided surgery, sedation available. Same price as Korean patients, itemized English receipts. 30 min from Camp Humphreys.',
'breadcrumb':[('Home','/'),('English','/en/'),('Implants','/en/implant')],
'hero':{'badge':'🦷 Implant Center · 6 Dedicated Surgery Rooms',
 'h1':'Dental Implants at Korean Local Prices',
 'sub':'World-class fixtures (Straumann, Osstem), navigation-guided placement, and university-hospital infection control — from ₩800,000 per tooth, transparent and identical to what Koreans pay.',
 'ctas':[{'t':'Call for Consult','href':'tel:+82-41-415-2892','icon':'fas fa-phone'},
         {'t':'Full Price List','href':'/en/pricing','icon':'fas fa-won-sign','style':'ghost'}],
 'stats':[('6','Surgery Rooms'),('3D','CT & Navigation'),('₩800K','Starting Price'),('10yr+','Fixture Warranty Care')]},
'sections':[
 {'type':'price','label':'Pricing','h2':'Implant Prices (Per Tooth)','desc':'Published prices — the same sheet Korean patients see. VAT included.',
  'head':['Fixture / Procedure','Price','Notes'],
  'rows':[
   {'group':'Implant fixture (per tooth)'},
   {'item':'Straumann BLX (Switzerland)','badge':'PREMIUM','price':'₩1,600,000','note':'Genuine Swiss fixture — world #1 brand','hl':True},
   {'item':'Osstem SOI','price':'₩1,000,000','note':'Korean premium line'},
   {'item':'Osstem CA','price':'₩800,000','note':'Korean standard — excellent track record'},
   {'group':'Surgical options (added if needed)'},
   {'item':'Flapless / navigation-guided surgery','price':'₩100K–300K','note':'Less swelling, faster recovery'},
   {'item':'Simple bone graft','price':'₩300,000','note':''},
   {'item':'Complex bone graft','price':'₩500,000','note':''},
   {'item':'Sinus lift (simple / complex)','price':'₩500K / ₩1M','note':'For upper molar area'},
   {'item':'IV sedation','price':'₩200,000','note':'Sleep through the surgery'},
  ],
  'notes':['Exact cost is confirmed after a 3D CT scan at your first consult — you receive a written itemized quote before treatment starts.',
           'No extra charge for being a foreign patient. Ever.']},
 {'type':'cards','alt':True,'label':'Why Here','h2':'What Makes Our Implant Center Different',
  'cards':[
   {'icon':'fas fa-door-closed','t':'6 Independent Surgery Rooms','d':'Implant surgery happens in dedicated sterile operating rooms with air-shower entry — not in an open treatment bay.'},
   {'icon':'fas fa-crosshairs','t':'Navigation-Guided Placement','d':'3D CT planning + surgical guides put the fixture exactly where planned. Safer around nerves and sinuses, minimal incision.'},
   {'icon':'fas fa-user-doctor','t':'Specialist Division of Labor','d':'Surgeons place fixtures; prosthodontists design the crown. The SNU-hospital model, applied to every single case.'},
   {'icon':'fas fa-shield-heart','t':'Long-Term Aftercare','d':'Regular check-up protocol after loading. If you PCS or relocate, we hand over full records in English.'},
  ]},
 {'type':'steps','label':'Timeline','h2':'Implant Treatment Timeline',
  'steps':[
   {'t':'Consult + 3D CT','time':'Day 1','d':'Scan, diagnosis, fixture recommendation and written quote in one visit (~60 min).'},
   {'t':'Fixture placement','time':'Visit 2 · 30–60 min','d':'Guided surgery under local anesthesia (IV sedation optional). Most patients return to work next day.'},
   {'t':'Healing period','time':'2–4 months','d':'Osseointegration. Temporary teeth provided where visible. Check-ups can be spaced for your schedule.'},
   {'t':'Final crown','time':'Final visit','d':'Custom zirconia crown attached. Bite check, care instructions, and long-term maintenance plan.'},
  ]},
 {'type':'faq','alt':True,'label':'FAQ','h2':'Implant FAQ',
  'faqs':[
   ('Which fixture brand should I choose?','All three lines have excellent success rates. Straumann BLX offers the strongest research base and fastest integration; Osstem is Korea\'s #1 brand with a massive track record. Your surgeon will recommend based on bone quality — not on price.'),
   ('Does it hurt?','Placement is done under local anesthesia and most patients report less discomfort than a tooth extraction. IV sedation (₩200K) is available if you prefer to sleep through it.'),
   ('How long does the whole process take?','Typically 2–6 months from placement to final crown depending on bone condition. Immediate-loading protocols are possible for suitable cases — ask at your consult.'),
   ('Can you work around deployments / PCS moves?','Yes. We compress visit schedules where clinically safe and provide complete English records for continuation of care elsewhere.'),
   ('What if I need a bone graft?','About 30–40% of cases need some grafting (₩300K–500K). It\'s confirmed on the 3D CT before you commit to anything.'),
  ]},
 CTA_EN,
]})

# ─────────────────────────────── /en/invisalign
PAGES.append({
'path':'en/invisalign.html','lang':'en','html_lang':'en','canonical':'/en/invisalign','hreflang':HREF_INVIS,
'title':'Invisalign in Korea from ₩3M — SNU Orthodontists, 3D ClinCheck | Seoul BD Dental, Cheonan',
'desc':'Invisalign clear aligners in Cheonan, 30 min from Camp Humphreys. Express ₩3M, Moderate ₩5.5M, Comprehensive ₩7M. Seoul National University orthodontists, 3D ClinCheck simulation, flexible appointment intervals for busy schedules. Same price as Korean patients.',
'breadcrumb':[('Home','/'),('English','/en/'),('Invisalign','/en/invisalign')],
'hero':{'badge':'😁 Invisalign Clear Aligners',
 'h1':'Invisalign with SNU Orthodontists',
 'sub':'See your final smile before you start with 3D ClinCheck simulation. Flexible 8–12 week visit intervals work well with rotations and busy schedules.',
 'ctas':[{'t':'Book a Consult','href':'tel:+82-41-415-2892','icon':'fas fa-phone'},
         {'t':'Full Price List','href':'/en/pricing','icon':'fas fa-won-sign','style':'ghost'}],
 'stats':[('3D','ClinCheck Preview'),('8–12wk','Visit Intervals'),('₩3M','Starting Price'),('SNU','Orthodontists')]},
'sections':[
 {'type':'price','label':'Pricing','h2':'Invisalign Packages','desc':'Package price covers aligners, all scheduled visits, and refinements per package terms.',
  'head':['Package','Price','Best for'],
  'rows':[
   {'item':'Invisalign Express','price':'₩3,000,000','note':'Minor crowding / relapse after braces'},
   {'item':'Invisalign First (kids)','price':'₩4,000,000','note':'Growing children, phase-1 care'},
   {'item':'Invisalign Light','price':'₩4,500,000','note':'Mild–moderate cases'},
   {'item':'Invisalign Moderate','badge':'POPULAR','price':'₩5,500,000','note':'Most adult cases','hl':True},
   {'item':'Invisalign Comprehensive','price':'₩7,000,000','note':'Full correction, complex bite issues'},
   {'group':'After treatment'},
   {'item':'Retainers (both arches / one arch)','price':'₩500K / ₩250K','note':'Keep your result stable'},
  ],
  'notes':['Which package you need is determined by a scan + orthodontist assessment at the first consult — not by guesswork.']},
 {'type':'cards','alt':True,'label':'Why Here','h2':'Why Get Invisalign Here',
  'cards':[
   {'icon':'fas fa-eye','t':'See the Result First','d':'3D ClinCheck shows your projected tooth movement, week by week, before you pay for anything.'},
   {'icon':'fas fa-plane','t':'Travel-Friendly Protocol','d':'Aligners are dispensed in multi-stage batches, so 8–12 week intervals between visits are routine — ideal for USFK schedules and frequent travelers.'},
   {'icon':'fas fa-user-doctor','t':'Orthodontic Specialists','d':'Treatment is planned and monitored by SNU-trained orthodontists — not general dentists moonlighting in aligners.'},
   {'icon':'fas fa-teeth','t':'Combined Care Under One Roof','d':'Need a cavity filled, wisdom tooth out, or whitening during treatment? Handled in the same building, same day.'},
  ]},
 {'type':'steps','label':'Process','h2':'How Invisalign Works Here',
  'steps':[
   {'t':'Scan & assessment','time':'Day 1','d':'Digital intraoral scan + X-rays. The orthodontist confirms your case level and package.'},
   {'t':'ClinCheck preview','time':'~1–2 weeks later','d':'Review your 3D simulated result. Adjust goals with the doctor. Approve to order aligners.'},
   {'t':'Aligner delivery & start','time':'~2–3 weeks later','d':'Attachments placed, first sets fitted, wear instructions (22 hrs/day).'},
   {'t':'Progress checks','time':'Every 8–12 weeks','d':'Quick check-ins, next aligner batches dispensed. Remote-friendly intervals.'},
   {'t':'Finish & retainers','time':'6–24 months total','d':'Refinements if needed per package, then retainers to lock in the result.'},
  ]},
 {'type':'faq','alt':True,'label':'FAQ','h2':'Invisalign FAQ',
  'faqs':[
   ('How long will my treatment take?','Express cases: 3–6 months. Moderate: 12–18 months. Comprehensive: up to 24 months. Your ClinCheck gives a case-specific estimate before you start.'),
   ('I might PCS mid-treatment. What happens?','Invisalign is the most transfer-friendly orthodontic system — we can dispense larger aligner batches, and your ClinCheck file transfers to any Invisalign provider worldwide.'),
   ('Is it really invisible?','The aligners are transparent and most people won\'t notice them in conversation. Small tooth-colored attachments are placed on some teeth.'),
   ('Invisalign vs braces — which is cheaper here?','Conventional braces run ₩5M–5.5M here; Invisalign Moderate is ₩5.5M. For most adult cases the cost is comparable — the difference is aesthetics and fewer visits.'),
  ]},
 CTA_EN,
]})

# ─────────────────────────────── /en/laminate
PAGES.append({
'path':'en/laminate.html','lang':'en','html_lang':'en','canonical':'/en/laminate','hreflang':HREF_LAMINATE,
'title':'Porcelain Veneers in Korea — Glownate Premium Veneer from ₩600K, Done in 2–3 Days | Seoul BD Dental',
'desc':'Glownate: Seoul BD Dental\'s signature minimal-prep premium veneer. ₩600K–800K per tooth, completed in 2–3 days — ideal for short stays in Korea. Designed by Dr. Hyun Jung-min (SNU). Same price as Korean patients, no broker fees. 30 min from Camp Humphreys.',
'breadcrumb':[('Home','/'),('English','/en/'),('Veneers','/en/laminate')],
'hero':{'badge':'✨ Glownate — Our Signature Premium Veneer',
 'h1':'A New Smile in 2–3 Days',
 'sub':'Glownate is our proprietary minimal-prep veneer technique: barely any tooth reduction, natural glow, 10-year warranty program. Available only at Seoul BD Dental.',
 'ctas':[{'t':'Book a Consult','href':'tel:+82-41-415-2892','icon':'fas fa-phone'},
         {'t':'Full Price List','href':'/en/pricing','icon':'fas fa-won-sign','style':'ghost'}],
 'stats':[('0.3mm','Minimal Prep'),('2–3','Days to Complete'),('₩600K','Starting / Tooth'),('10yr','Warranty Program')]},
'sections':[
 {'type':'price','label':'Pricing','h2':'Veneer Prices (Per Tooth)',
  'head':['Option','Price','Notes'],
  'rows':[
   {'item':'Glownate Light','price':'₩600,000','note':'Minimal-prep premium veneer'},
   {'item':'Glownate Premium','badge':'BEST','price':'₩800,000','note':'Signature line by Dr. Hyun Jung-min','hl':True},
   {'item':'Glownate Repair (re-do of other clinics\' veneers)','price':'Consult','note':'Depends on current condition'},
   {'group':'Related aesthetic care'},
   {'item':'Professional whitening','price':'₩300,000','note':'+10% VAT for cosmetic purpose'},
   {'item':'Diastema closure (resin, per surface)','price':'₩300,000','note':'Gap between front teeth'},
  ],
  'notes':['Most smile-line cases use 4–8 teeth. Your exact plan and total are confirmed at the consult with a written quote.']},
 {'type':'cards','alt':True,'label':'Why Glownate','h2':'Why Patients Fly In for Glownate',
  'cards':[
   {'icon':'fas fa-feather','t':'Barely Touch the Tooth','d':'Typical prep is 0.3–0.5mm — sometimes none at all (no-prep). Your natural tooth structure stays intact under the veneer.'},
   {'icon':'fas fa-clock','t':'2–3 Days, Start to Finish','d':'Day 1: consult + design + prep + temporaries. Day 2–3: final bonding. Perfect for leave periods and short trips.'},
   {'icon':'fas fa-user-doctor','t':'Designed by the Founder','d':'Dr. Hyun Jung-min (Seoul National University) developed the Glownate technique after years in Gangnam\'s top aesthetic clinics.'},
   {'icon':'fas fa-shield-heart','t':'10-Year Warranty Program','d':'Structured warranty and remote aftercare — chips and debonds are covered per program terms.'},
  ]},
 {'type':'steps','label':'Process','h2':'The 2–3 Day Glownate Schedule',
  'steps':[
   {'t':'Consult, smile design & prep','time':'Day 1 · 2–3 hrs','d':'Photos, shade selection, digital smile design, minimal prep, precision impressions, temporary veneers fitted.'},
   {'t':'Lab fabrication','time':'Day 1–2','d':'Our partnered premium ceramic lab crafts each veneer individually while you enjoy Cheonan.'},
   {'t':'Final bonding & polish','time':'Day 2–3 · 1–2 hrs','d':'Try-in, adjustments, adhesive bonding, bite check and glow polish. Walk out with your new smile.'},
  ]},
 {'type':'faq','alt':True,'label':'FAQ','h2':'Veneer FAQ',
  'faqs':[
   ('How is Glownate different from regular veneers?','Glownate is our in-house protocol combining ultra-minimal prep, custom ceramic layering and a proprietary bonding sequence — designed for a natural "glow" rather than the flat, opaque look of cheap veneers.'),
   ('Will my teeth be shaved down?','Only 0.3–0.5mm on average — roughly the thickness of a fingernail. Suitable cases can be done with zero prep.'),
   ('How long do veneers last?','With normal care, 10–15+ years. Our 10-year warranty program covers chips and debonding per its terms.'),
   ('Can I do it over a weekend?','A Friday–Sunday schedule is often possible for 4–8 tooth cases. Contact us in advance so we can reserve the lab slot.'),
   ('I had veneers done elsewhere and hate them.','Glownate Repair handles re-dos of failed or unnatural veneers from other clinics — pricing after assessment.'),
  ]},
 CTA_EN,
]})

# ─────────────────────────────── /en/pricing (NEW)
PAGES.append({
'path':'en/pricing.html','lang':'en','html_lang':'en','canonical':'/en/pricing','hreflang':HREF_PRICING,
'title':'Dental Price List (English) — Implants, Invisalign, Veneers, Fillings | Seoul BD Dental, Cheonan Korea',
'desc':'Full English dental price list of Seoul BD Dental, Cheonan: implants ₩800K–1.6M, Invisalign ₩3M–7M, Glownate veneers ₩600K–800K, zirconia crown ₩550K, cavity fillings from ₩50K, whitening ₩300K. Same prices as Korean patients — no foreigner markup, itemized receipts.',
'breadcrumb':[('Home','/'),('English','/en/'),('Pricing','/en/pricing')],
'hero':{'badge':'💰 Transparent Published Prices',
 'h1':'Full Price List',
 'sub':'This is the same price sheet our Korean patients see. No foreigner markup, no broker fees, itemized English receipts for insurance claims.',
 'ctas':[{'t':'Ask About Your Case','href':'tel:+82-41-415-2892','icon':'fas fa-phone'}],
 'stats':[('0%','Foreigner Markup'),('100%','Itemized Receipts'),('365','Days Open')]},
'sections':[
 {'type':'price','label':'Implants','h2':'Implants & Surgery',
  'head':['Item','Price','Notes'],
  'rows':[
   {'item':'Implant — Straumann BLX (per tooth)','badge':'PREMIUM','price':'₩1,600,000','note':'Genuine Swiss fixture'},
   {'item':'Implant — Osstem SOI (per tooth)','price':'₩1,000,000','note':'Korean premium'},
   {'item':'Implant — Osstem CA (per tooth)','price':'₩800,000','note':'Korean standard'},
   {'item':'Flapless / navigation surgery','price':'₩100K–300K','note':'Add-on'},
   {'item':'Bone graft (simple / complex)','price':'₩300K / ₩500K','note':''},
   {'item':'Sinus lift (simple / complex)','price':'₩500K / ₩1M','note':''},
   {'item':'IV sedation','price':'₩200,000','note':''},
  ]},
 {'type':'price','alt':True,'label':'Aesthetic','h2':'Veneers, Crowns & Whitening',
  'head':['Item','Price','Notes'],
  'rows':[
   {'item':'Glownate Light veneer (per tooth)','price':'₩600,000','note':''},
   {'item':'Glownate Premium veneer (per tooth)','badge':'BEST','price':'₩800,000','note':'Dr. Hyun signature line','hl':True},
   {'item':'Zirconia crown (per tooth)','price':'₩550,000','note':''},
   {'item':'Ceramic inlay (per tooth)','price':'₩350,000','note':''},
   {'item':'Professional whitening','price':'₩300,000','note':'+10% VAT if cosmetic'},
  ]},
 {'type':'price','label':'Orthodontics','h2':'Invisalign & Braces',
  'head':['Item','Price','Notes'],
  'rows':[
   {'item':'Invisalign Express','price':'₩3,000,000','note':'Minor cases'},
   {'item':'Invisalign First','price':'₩4,000,000','note':'Children'},
   {'item':'Invisalign Light','price':'₩4,500,000','note':''},
   {'item':'Invisalign Moderate','badge':'POPULAR','price':'₩5,500,000','note':'','hl':True},
   {'item':'Invisalign Comprehensive','price':'₩7,000,000','note':'Full correction'},
   {'item':'Clippy-C ceramic braces','price':'₩5,000,000','note':'Full arch'},
   {'item':'Clarity Ultra braces','price':'₩5,500,000','note':'Full arch'},
   {'item':'Retainers (both / one arch)','price':'₩500K / ₩250K','note':''},
  ]},
 {'type':'price','alt':True,'label':'General','h2':'General Dentistry',
  'head':['Item','Price','Notes'],
  'rows':[
   {'item':'Composite filling (cavity)','price':'₩50K–250K','note':'By size & location'},
   {'item':'Scaling / cleaning (non-insured)','price':'₩60,000','note':'~₩15–20K with Korean NHIS, once/yr'},
   {'item':'Night guard (bruxism)','price':'₩1,000,000','note':''},
   {'item':'Jaw botox','price':'₩70,000','note':'+VAT if cosmetic'},
   {'item':'Denture (partial / full, per arch)','price':'₩1,500,000','note':''},
   {'item':'Implant denture (per arch)','price':'₩2,000,000','note':'Implant surgery billed separately'},
  ],
  'notes':['Root canals, extractions and X-rays are largely covered by Korean NHIS if you\'re enrolled; non-enrolled patients receive the non-insured rate with an itemized receipt.',
           'All prices in Korean Won (₩). Cards, cash and Korean bank transfer accepted.']},
 {'type':'banner','center':True,'html':'<b>Why so much cheaper than the US?</b> A single implant often runs $3,000–5,000 in the States. Here, a genuine Straumann implant is ₩1.6M (~$1,200) — same fixture, SNU-trained surgeon. That\'s not a "discount clinic" price; it\'s just Korean market price without a broker inflating it.'},
 {'type':'faq','alt':True,'label':'FAQ','h2':'Payment & Insurance FAQ',
  'faqs':[
   ('Do you accept US credit cards?','Yes — Visa, Mastercard, AmEx all work. We also accept cash (KRW) and Korean bank transfer.'),
   ('Can I get documents for insurance reimbursement?','Yes. We issue itemized English receipts, treatment breakdowns and doctor\'s notes on request — commonly used for overseas dental claims.'),
   ('Are these prices final?','These are the published base prices. Your exact quote (including any grafts or add-ons) is confirmed in writing after examination, before treatment starts.'),
   ('Do you offer payment plans?','Korean credit-card installment plans (2–12 months) are available for most cards issued in Korea. For international cards, please ask your issuer about installment options.'),
  ]},
 CTA_EN,
]})

# ─────────────────────────────── /en/directions (NEW)
PAGES.append({
'path':'en/directions.html','lang':'en','html_lang':'en','canonical':'/en/directions','hreflang':HREF_DIRECTIONS,
'title':'Directions — From Camp Humphreys, Seoul & KTX Cheonan-Asan | Seoul BD Dental',
'desc':'How to get to Seoul BD Dental in Cheonan: 30 min drive from Camp Humphreys (26 km), 10 min taxi from KTX Cheonan-Asan station, 40 min from Seoul by KTX. Free underground parking. Address: 14, Buldang 34-gil, Seobuk-gu, Cheonan. ☎ +82-41-415-2892',
'breadcrumb':[('Home','/'),('English','/en/'),('Directions','/en/directions')],
'hero':{'badge':'📍 Buldang-dong, Cheonan',
 'h1':'Getting to Seoul BD Dental',
 'sub':'14, Buldang 34-gil, Seobuk-gu, Cheonan-si — the closest large dental clinic to KTX Cheonan-Asan Station, with free underground parking.',
 'ctas':[{'t':'Open in Google Maps','href':'https://maps.google.com/?q=Seoul+BD+Dental+Cheonan','icon':'fas fa-map-marker-alt'},
         {'t':'Call Us','href':'tel:+82-41-415-2892','icon':'fas fa-phone','style':'ghost'}]},
'sections':[
 {'type':'cards','label':'Routes','h2':'Choose Your Starting Point','grid':'iv2-grid--3',
  'cards':[
   {'icon':'fas fa-car','t':'🎖️ From Camp Humphreys','d':'~30 min by car (26 km). Exit through the main gate → Route 45 south → follow signs to Cheonan/Buldang. GPS: "서울비디치과" or "14 Buldang 34-gil". Free parking in our basement — enter from the building side road.'},
   {'icon':'fas fa-train','t':'🚄 From Seoul','d':'KTX from Seoul Station to Cheonan-Asan Station: ~40 min (trains every 15–30 min). Then a 10-min taxi (~₩8,000) — show the driver: 천안 불당동 서울비디치과.'},
   {'icon':'fas fa-plane','t':'✈️ Just Arrived in Korea? (PCS / New Assignment)','d':'Newly stationed at Camp Humphreys or relocating to the Cheonan–Asan area? From Incheon Airport: AREX to Seoul Station → KTX to Cheonan-Asan (~2 hrs), or airport limousine bus to Cheonan Terminal (~2.5 hrs). Book your first dental check-up as part of settling in — we keep English records for your PCM/insurance.'},
   {'icon':'fas fa-bus','t':'🚌 Local buses','d':'Stop "Buldang Jugong 5-danji" (불당주공5단지) is a 1-minute walk from our door. Multiple city lines from Cheonan Station and Terminal.'},
   {'icon':'fas fa-train-subway','t':'🚉 Subway Line 1','d':'Seoul Subway Line 1 runs to Cheonan Station (slower but cheapest from southern Seoul/Pyeongtaek). From Cheonan Station: 15 min by taxi.'},
   {'icon':'fas fa-square-parking','t':'🅿️ Parking','d':'Free underground parking in our building. Height limit 2.1m. Street parking also available nearby.'},
  ]},
 {'type':'info','alt':True,'label':'Hours','h2':'Opening Hours','rows':[
   {'k':'Mon – Fri','v':'09:00 – 20:00','gold':True},
   {'k':'Sat / Sun / Holidays','v':'09:00 – 13:00'},
   {'k':'Lunch (weekdays)','v':'12:30 – 14:00'},
   {'k':'Phone','v':'+82-41-415-2892','gold':True},
 ]},
 {'type':'banner','center':True,'html':'<b>Tip for taxi:</b> Show this to your driver → <b>"충남 천안시 서북구 불당34길 14 서울비디치과"</b>. From KTX Cheonan-Asan the fare is around ₩8,000; from Cheonan Terminal about ₩7,000.'},
 {'type':'html','label':'Map','h2':'Map','html':'<div style="border-radius:16px;overflow:hidden;border:1px solid rgba(107,66,38,.12)"><iframe src="https://www.google.com/maps?q=36.8061852,127.1063344&hl=en&z=16&output=embed" width="100%" height="380" style="border:0" loading="lazy" title="Seoul BD Dental map" referrerpolicy="no-referrer-when-downgrade"></iframe></div>'},
 CTA_EN,
]})

# ─────────────────────────────── /en/reservation (NEW)
PAGES.append({
'path':'en/reservation.html','lang':'en','html_lang':'en','canonical':'/en/reservation','hreflang':HREF_RESERVATION,
'title':'Book an Appointment in English — Seoul BD Dental, Cheonan | Same Price as Koreans',
'desc':'Book a dental appointment in English at Seoul BD Dental, Cheonan. Phone +82-41-415-2892, online form, or Instagram DM @seoul_bddc. Open 365 days, weekdays until 8PM. 30 min from Camp Humphreys, 10 min from KTX Cheonan-Asan.',
'breadcrumb':[('Home','/'),('English','/en/'),('Reservation','/en/reservation')],
'hero':{'badge':'📅 Booking for International Patients',
 'h1':'Book Your Appointment',
 'sub':'Choose whichever channel is easiest — our coordinators handle English inquiries every day. Walk-ins are also welcome 365 days a year.',
 'ctas':[{'t':'Call Now','href':'tel:+82-41-415-2892','icon':'fas fa-phone'},
         {'t':'Online Form','href':'/reservation','icon':'fas fa-calendar-check','style':'ghost'}]},
'sections':[
 {'type':'cards','label':'Channels','h2':'4 Ways to Book','grid':'iv2-grid',
  'cards':[
   {'icon':'fas fa-phone','t':'1. Phone (fastest)','d':'+82-41-415-2892 — say "English please" and we\'ll connect you to an English-speaking coordinator. Weekdays 9AM–8PM, weekends 9AM–1PM.'},
   {'icon':'fas fa-calendar-check','t':'2. Online form','d':'Use our reservation form (Korean page, but works fine in English — write your request in the memo field). We confirm by phone or text.','href':'/reservation','more':'Open form →'},
   {'icon':'fab fa-instagram','t':'3. Instagram DM','d':'DM @seoul_bddc in English with your name, preferred date/time and what you need. Replies within business hours.','href':'https://www.instagram.com/seoul_bddc','more':'Open Instagram →'},
   {'icon':'fas fa-person-walking','t':'4. Walk-in','d':'No appointment? Just come — we\'re open 365 days. Bring a photo ID. Waiting time is usually short on weekday mornings.'},
  ]},
 {'type':'steps','alt':True,'label':'What to Expect','h2':'Your First Visit',
  'steps':[
   {'t':'Check-in','time':'5 min','d':'Passport or ARC / military ID. Short health questionnaire (English version available).'},
   {'t':'X-ray & scan','time':'10 min','d':'Panoramic X-ray (and 3D CT if implant/surgery consult).'},
   {'t':'Specialist consult','time':'15–30 min','d':'Diagnosis, options, and a written itemized quote in plain English. Zero pressure — take it home and decide.'},
   {'t':'Same-day treatment (optional)','time':'varies','d':'Cleanings, fillings and many treatments can start immediately if you want.'},
  ]},
 {'type':'info','label':'Checklist','h2':'What to Bring','rows':[
   {'k':'Identification','v':'Passport, ARC, or military ID'},
   {'k':'Insurance (if any)','v':'Korean NHIS card, or plan info for receipts'},
   {'k':'Records (optional)','v':'Previous X-rays / treatment notes help a lot'},
   {'k':'Payment','v':'International cards OK (Visa/MC/AmEx)','gold':True},
 ]},
 {'type':'faq','alt':True,'label':'FAQ','h2':'Booking FAQ',
  'faqs':[
   ('How far in advance should I book?','2–3 days ahead is usually enough for consults. For surgery slots or veneer lab scheduling, 1–2 weeks is safer.'),
   ('Can I book for the same day?','Often yes, especially weekday mornings — call and ask. Emergencies are triaged immediately.'),
   ('Is there any consultation fee?','A standard exam fee applies (a few thousand won with Korean NHIS; non-insured rate otherwise) — it\'s included in your treatment cost if you proceed.'),
   ('Can my family members come together?','Absolutely — we see kids too (dedicated pediatric protocols, ₩30K–100K for most pediatric resin care).'),
  ]},
 CTA_EN,
]})
