# -*- coding: utf-8 -*-
"""볼륨 확장 섹션 — canonical path 키로 기존 페이지에 추가 삽입 (CTA 직전)
팩트: 5층 구성(1F 교정 / 2F 기공·위생 / 3F BDX검진·소아 / 4F 임플란트센터 6수술방+2회복실 / 5F 종합진료),
소아치과 전문의 3인, 수면·웃음가스 진료, 2021.05 개원, 에어샤워 감염관리"""

EXTRA = {}

# ═══════════════════════════════ EN ═══════════════════════════════

EXTRA['/en/'] = [
 {'type':'cards','label':'Floor Guide','h2':'5 Floors, Each a Dedicated Center','grid':'iv2-grid--3',
  'desc':'One building, one-stop care — each floor is a specialized clinic of its own.',
  'cards':[
   {'icon':'fas fa-teeth','t':'1F · Invisalign Orthodontic Center','d':'Dedicated orthodontic floor with digital scanners and ClinCheck consultation rooms.'},
   {'icon':'fas fa-gears','t':'2F · Digital Lab & Hygiene Center','d':'In-house digital dental lab — crowns and prosthetics designed and milled on site, plus central sterilization.'},
   {'icon':'fas fa-child','t':'3F · BDX Checkup & Pediatric Center','d':'Comprehensive dental checkup programs and a kids-only zone with 3 board-certified pediatric dentists.'},
   {'icon':'fas fa-tooth','t':'4F · Implant Center','d':'6 independent surgery rooms + 2 recovery rooms with air-shower infection control.'},
   {'icon':'fas fa-hospital-user','t':'5F · General Treatment Center','d':'Fillings, root canals, gum care, wisdom teeth and emergency care — all specialties under one roof.'},
   {'icon':'fas fa-shield-virus','t':'University-Hospital Infection Control','d':'Air-shower entry to surgical floors, per-patient instrument sets and central sterilization — audited protocols since opening in 2021.'},
  ]},
 {'type':'cards','alt':True,'label':'For the Whole Family','h2':'Care for Every Age — Kids to Grandparents',
  'cards':[
   {'icon':'fas fa-baby','t':'3 Pediatric Specialists On Staff','d':'Board-certified pediatric dentists, a dedicated kids\' play zone, and laughing-gas / sedation options for anxious children. Pediatric resin fillings ₩30K–100K.'},
   {'icon':'fas fa-bed','t':'Sedation Dentistry','d':'Nitrous oxide and IV sedation for dental phobia — sleep through implants, wisdom-tooth extraction, or long procedures safely with monitoring.'},
   {'icon':'fas fa-tooth','t':'Wisdom Teeth & Difficult Extractions','d':'Impacted and complex wisdom-tooth cases handled in-house by our surgical team — no referral to another hospital needed.'},
   {'icon':'fas fa-user-group','t':'Senior & Denture Care','d':'Full and partial dentures (₩1.5M/arch), implant-supported dentures (₩2M/arch), and gentle care protocols for elderly patients.'},
  ]},
]

EXTRA['/en/implant'] = [
 {'type':'compare','label':'Fixture Comparison','h2':'Straumann vs Osstem — Which Fixture Fits You?',
  'head':['','Straumann BLX','Osstem SOI','Osstem CA'],
  'rows':[
   [('Origin',''),'Switzerland 🇨🇭','Korea 🇰🇷','Korea 🇰🇷'],
   [('Price / tooth',''),('₩1,600,000','good'),'₩1,000,000',('₩800,000','good')],
   [('Research base',''),('World #1, 60+ yrs data','good'),'Strong Korean clinical data','Largest case volume in Korea'],
   [('Osseointegration',''),('Fastest (Roxolid + SLActive)','good'),'Fast','Standard'],
   [('Best for',''),'Weak bone, smokers, diabetics, front teeth','Balance of cost & performance','Healthy bone, molars, budget-conscious'],
  ]},
 {'type':'cards','alt':True,'label':'Advanced Options','h2':'Advanced Implant Solutions We Handle In-House',
  'cards':[
   {'icon':'fas fa-crosshairs','t':'Navigation-Guided Surgery','d':'3D-planned guided placement (+₩100K–300K) — minimal incision, precise positioning near nerves and sinuses.'},
   {'icon':'fas fa-bolt','t':'Immediate Loading','d':'For suitable cases: extraction, implant and temporary tooth in one day — walk out with a tooth, not a gap.'},
   {'icon':'fas fa-teeth-open','t':'Full-Arch Restoration','d':'Lost most or all teeth? Fixed full-arch implant bridges or implant-supported overdentures (₩2M/arch + fixtures).'},
   {'icon':'fas fa-rotate','t':'Implant Revision (Redo)','d':'Failed or infected implants placed elsewhere — removal, bone rebuilding, and replacement by our surgical team.'},
   {'icon':'fas fa-moon','t':'Sedation Implant Surgery','d':'IV sedation (₩200K) with vital-sign monitoring — most patients remember nothing of the surgery.'},
   {'icon':'fas fa-calendar-check','t':'Holiday Implant Program','d':'We operate 365 days — weekend and holiday surgery slots for patients who can\'t take weekday leave.'},
  ]},
 {'type':'steps','label':'Aftercare','h2':'Long-Term Care After Your Implant',
  'steps':[
   {'t':'First week','time':'Day 1–7','d':'Mild swelling is normal. Soft diet, prescribed antibiotics, no smoking — smoking is the #1 cause of early implant failure.'},
   {'t':'Stitch removal & check','time':'~2 weeks','d':'Quick visit to confirm healing. Most discomfort is gone by now.'},
   {'t':'Regular maintenance','time':'Every 6 months','d':'Professional cleaning around the implant and bite check — peri-implantitis prevention is what makes implants last 20+ years.'},
   {'t':'Records for life','time':'Anytime','d':'Full surgical records, fixture details and X-rays available in English whenever you move or travel.'},
  ]},
]

EXTRA['/en/invisalign'] = [
 {'type':'compare','label':'Invisalign vs Braces','h2':'Clear Aligners vs Conventional Braces',
  'head':['','Invisalign','Ceramic braces (Clippy-C)'],
  'rows':[
   [('Visibility',''),('Nearly invisible','good'),('Visible brackets','bad')],
   [('Eating',''),('Remove & eat anything','good'),('Food restrictions (sticky/hard)','bad')],
   [('Hygiene',''),('Brush & floss normally','good'),('Harder to clean around brackets','bad')],
   [('Visit interval',''),('8–12 weeks','good'),'4–6 weeks'],
   [('Discomfort',''),('Mild pressure per new set','good'),('Wire pokes, mouth sores possible','bad')],
   [('Price here',''),'₩3M–7M by package','₩5M (Clippy-C) / ₩5.5M (Clarity Ultra)'],
   [('Complex cases',''),'Most cases treatable','Sometimes better for severe rotations'],
  ]},
 {'type':'cards','alt':True,'label':'Success Tips','h2':'How to Get the Best Invisalign Result',
  'cards':[
   {'icon':'fas fa-clock','t':'22 Hours a Day','d':'Aligners only work while worn. Take them out for meals and brushing only — consistency is 90% of the result.'},
   {'icon':'fas fa-mug-hot','t':'Only Water While Wearing','d':'Coffee, tea and soda stain and warp aligners. Remove them for anything except plain water.'},
   {'icon':'fas fa-toolbox','t':'Chewies & Cases','d':'Bite on chewies 5–10 min daily for a perfect fit, and always store aligners in the case — napkins are how aligners get thrown away.'},
   {'icon':'fas fa-camera','t':'Progress Monitoring','d':'We track your progress photos between visits — if a tooth falls behind schedule, we catch it early and adjust.'},
  ]},
]

EXTRA['/en/laminate'] = [
 {'type':'compare','label':'Treatment Comparison','h2':'Veneers vs Crowns vs Whitening — What Do You Actually Need?',
  'head':['','Glownate Veneer','Zirconia Crown','Whitening'],
  'rows':[
   [('Best for',''),'Shape + color + minor gaps','Broken / root-canaled teeth','Color only'],
   [('Tooth reduction',''),('0.3–0.5mm (minimal)','good'),('Full-circumference prep','bad'),('None','good')],
   [('Durability',''),'10–15+ yrs','10–15+ yrs',('Touch-up every 1–2 yrs','bad')],
   [('Price / tooth',''),'₩600K–800K','₩550K',('₩300K (whole mouth)','good')],
   [('Time',''),('2–3 days','good'),'3–5 days','1 visit'],
  ]},
 {'type':'cards','alt':True,'label':'Caring for Veneers','h2':'Make Your Glownate Last 15 Years',
  'cards':[
   {'icon':'fas fa-ban','t':'Avoid Extreme Force','d':'Don\'t bite fingernails, ice, or bottle caps with veneered teeth. Normal eating — including steak and apples — is completely fine.'},
   {'icon':'fas fa-moon','t':'Night Guard if You Grind','d':'Bruxism is the #1 veneer killer. If you grind, a custom night guard (₩1M) protects your investment.'},
   {'icon':'fas fa-tooth','t':'Normal Brushing Works','d':'Brush and floss exactly like natural teeth. Non-abrasive toothpaste keeps the glaze glossy.'},
   {'icon':'fas fa-calendar-check','t':'Annual Check & Polish','d':'A yearly check-and-polish visit keeps margins sealed and the warranty program active.'},
  ]},
]

EXTRA['/en/pricing'] = [
 {'type':'cards','label':'Why These Prices','h2':'How We Keep Prices This Low — Without Cutting Corners',
  'grid':'iv2-grid--3',
  'cards':[
   {'icon':'fas fa-industry','t':'In-House Digital Lab','d':'Our 2F digital lab designs and mills crowns and prosthetics on site — no external lab markup, faster turnaround.'},
   {'icon':'fas fa-chart-line','t':'Volume, Not Margin','d':'As Cheonan\'s largest clinic operating 365 days, high case volume lets us keep per-case prices at local-market level.'},
   {'icon':'fas fa-handshake-slash','t':'No Broker Chain','d':'Medical-tourism agencies typically add 20–50%. We simply don\'t work with brokers — you book direct, you pay direct.'},
  ]},
 {'type':'faq','alt':True,'label':'Saving Tips','h2':'How to Pay Less — Legitimately',
  'faqs':[
   ('I have Korean NHIS. What\'s covered?','Scaling once per year (~₩15–20K), extractions, root canals, gum treatment and X-rays are covered. For patients 65+, implants (up to 2) and dentures get major NHIS support.'),
   ('Should I combine treatments in one plan?','Yes — combining (e.g., implant + crown work + cleaning) saves repeat exam fees and lets us sequence treatment efficiently. Ask for a combined written quote.'),
   ('Is there a benefit to paying upfront?','Package treatments (Invisalign, full-arch) are quoted as complete packages — no per-visit surprise fees, which is itself the saving.'),
   ('Do prices change seasonally?','Published base prices are stable. Any promotion is applied on top of the published sheet — never a made-up "discount" from an inflated price.'),
  ]},
]

EXTRA['/en/directions'] = [
 {'type':'steps','label':'On Arrival','h2':'When You Arrive — What Happens',
  'steps':[
   {'t':'Park or get dropped off','time':'0 min','d':'Free underground parking (2.1m height limit). Elevator up to 1F reception.'},
   {'t':'Check in at 1F','time':'2 min','d':'Show passport / ARC / military ID. Say "English please" — a coordinator will assist you.'},
   {'t':'Go to your floor','time':'1 min','d':'You\'ll be guided to the right center: 1F ortho, 3F checkup & kids, 4F implant surgery, 5F general treatment.'},
   {'t':'After your visit','time':'—','d':'Payment and next-visit booking at the same floor desk. Itemized English receipt on request.'},
  ]},
 {'type':'info','alt':True,'label':'Landmarks','h2':'Nearby Landmarks (Tell Your Taxi Driver)','rows':[
   {'k':'Bus stop','v':'Buldang Jugong 5-danji (불당주공5단지) — 1 min walk','gold':True},
   {'k':'Neighborhood','v':'Buldang-dong new town — main cafe & shopping street'},
   {'k':'KTX station','v':'Cheonan-Asan Station — 10 min by taxi'},
   {'k':'City landmark','v':'Cheonan City Hall — 5 min by car'},
 ]},
]

EXTRA['/en/reservation'] = [
 {'type':'info','label':'Hours','h2':'When You Can Reach Us','rows':[
   {'k':'Mon – Fri','v':'09:00 – 20:00 (last booking ~19:00)','gold':True},
   {'k':'Sat / Sun / Holidays','v':'09:00 – 13:00 (last booking ~12:00)'},
   {'k':'Lunch (weekdays)','v':'12:30 – 14:00 — phone may be busy'},
   {'k':'Instagram DM','v':'Answered during business hours','gold':True},
 ]},
 {'type':'banner','alt':True,'center':True,'html':'<b>🚨 Dental emergency?</b> Knocked-out tooth, severe pain, swelling, or post-surgery bleeding — call <b>+82-41-415-2892</b> and come straight in. We\'re open 365 days a year; emergencies are triaged first. For a knocked-out tooth: keep it in milk and arrive within 1 hour if possible.'},
]

# ═══════════════════════════════ JP ═══════════════════════════════
# 円換算 目安: 1万₩ ≈ 1,090円 (2026)

EXTRA['/jp/dental'] = [
 {'type':'cards','label':'フロアガイド','h2':'5フロア、それぞれが専門センター','grid':'iv2-grid--3',
  'desc':'ワンビルディング完結型 — 各フロアが独立した専門クリニックとして機能します。',
  'cards':[
   {'icon':'fas fa-teeth','t':'1F・インビザライン矯正センター','d':'デジタルスキャナーとクリンチェック相談室を備えた矯正専用フロア。'},
   {'icon':'fas fa-gears','t':'2F・デジタル技工&衛生センター','d':'院内デジタル技工所 — クラウンや補綴物を院内で設計・製作。外注マージンなしで高品質を実現。'},
   {'icon':'fas fa-child','t':'3F・BDX検診&小児センター','d':'総合歯科検診プログラムと、小児歯科専門医3名が常駐するキッズ専用ゾーン。'},
   {'icon':'fas fa-tooth','t':'4F・インプラントセンター','d':'独立手術室6室+回復室2室。エアシャワー完備の感染管理システム。'},
   {'icon':'fas fa-hospital-user','t':'5F・総合診療センター','d':'虫歯治療・根管治療・歯周ケア・親知らず・急患対応 — すべての診療科目を一つ屋根の下に。'},
   {'icon':'fas fa-shield-virus','t':'大学病院レベルの感染管理','d':'手術フロアへのエアシャワー入室、患者ごとの器具セット、中央滅菌システム — 2021年開院以来の徹底プロトコル。'},
  ]},
 {'type':'cards','alt':True,'label':'ご家族全員に','h2':'お子様からご高齢の方まで — 全世代対応',
  'cards':[
   {'icon':'fas fa-baby','t':'小児歯科専門医3名常駐','d':'小児歯科専門医による診療、キッズプレイゾーン、怖がりなお子様への笑気ガス・鎮静オプション。小児レジン充填3万〜10万₩。'},
   {'icon':'fas fa-bed','t':'鎮静(睡眠)歯科','d':'笑気ガスと静脈内鎮静で歯科恐怖症の方も安心。インプラントや親知らず抜歯もモニタリング下で眠ったまま。'},
   {'icon':'fas fa-tooth','t':'親知らず・難抜歯','d':'埋伏歯や複雑な親知らずも院内の外科チームが対応 — 他院への紹介不要。'},
   {'icon':'fas fa-user-group','t':'シニア&入れ歯ケア','d':'総義歯・部分義歯(片顎150万₩)、インプラントオーバーデンチャー(片顎200万₩)、高齢の方に優しい診療プロトコル。'},
  ]},
]

EXTRA['/jp/implant'] = [
 {'type':'compare','label':'フィクスチャー比較','h2':'ストローマン vs オステム — あなたに合うのは?',
  'head':['','Straumann BLX','Osstem SOI','Osstem CA'],
  'rows':[
   [('原産国',''),'スイス 🇨🇭','韓国 🇰🇷','韓国 🇰🇷'],
   [('1本価格',''),('160万₩ (約17.4万円)','good'),'100万₩ (約10.9万円)',('80万₩ (約8.7万円)','good')],
   [('研究実績',''),('世界シェア1位・60年以上のデータ','good'),'韓国内で豊富な臨床データ','韓国最多の症例数'],
   [('骨結合速度',''),('最速 (Roxolid + SLActive)','good'),'速い','標準'],
   [('おすすめの方',''),'骨が弱い方・喫煙者・糖尿病・前歯','コストと性能のバランス重視','骨の健康な方・奥歯・費用重視'],
  ]},
 {'type':'cards','alt':True,'label':'高度なオプション','h2':'院内で完結する高度インプラント治療',
  'cards':[
   {'icon':'fas fa-crosshairs','t':'ナビゲーション手術','d':'3D計画によるガイド手術(+10万〜30万₩) — 最小切開で、神経や上顎洞近くも精密に埋入。'},
   {'icon':'fas fa-bolt','t':'即時荷重(抜歯即時)','d':'適応症例なら抜歯・埋入・仮歯装着まで1日で完了 — 歯のない期間なしで帰国日程にも対応。'},
   {'icon':'fas fa-teeth-open','t':'全顎(フルアーチ)再建','d':'歯をほとんど失った方へ:固定式フルアーチブリッジ、またはインプラントオーバーデンチャー(片顎200万₩+フィクスチャー)。'},
   {'icon':'fas fa-rotate','t':'インプラント再治療','d':'他院で失敗・感染したインプラントの除去、骨再建、再埋入まで当院外科チームが対応。'},
   {'icon':'fas fa-moon','t':'鎮静下インプラント手術','d':'静脈内鎮静(20万₩)+バイタルモニタリング — ほとんどの患者様は手術の記憶がありません。'},
   {'icon':'fas fa-calendar-check','t':'年中無休インプラント','d':'365日診療 — 土日・祝日の手術枠あり。短期滞在の日程にも柔軟に対応します。'},
  ]},
 {'type':'steps','label':'アフターケア','h2':'インプラント後の長期ケア',
  'steps':[
   {'t':'最初の1週間','time':'1〜7日目','d':'軽い腫れは正常です。柔らかい食事、処方薬の服用、禁煙を — 喫煙は早期失敗の最大原因です。'},
   {'t':'抜糸&チェック','time':'約2週間','d':'治癒確認の短時間来院。日本にお帰りの場合はオンラインでの経過確認も可能です。'},
   {'t':'定期メンテナンス','time':'6ヶ月ごと','d':'インプラント周囲のクリーニングと咬合チェック — インプラント周囲炎の予防が20年以上使える鍵です。'},
   {'t':'記録は一生分','time':'いつでも','d':'手術記録・フィクスチャー情報・レントゲンを日本語対応で提供 — 日本の歯科医院との連携もスムーズ。'},
  ]},
]

EXTRA['/jp/invisalign'] = [
 {'type':'compare','label':'インビザライン vs ワイヤー','h2':'マウスピース矯正 vs 従来のワイヤー矯正',
  'head':['','インビザライン','セラミックブラケット (Clippy-C)'],
  'rows':[
   [('見た目',''),('ほぼ見えない透明マウスピース','good'),'目立ちにくいが装置は見える'],
   [('取り外し',''),('可能 — 食事・歯磨きは普段通り','good'),('不可 — 食事制限あり','bad')],
   [('通院頻度',''),('6〜10週ごと(遠隔モニタリング併用可)','good'),'4〜6週ごとの調整が必要'],
   [('痛み・違和感',''),('少ない — ワイヤーによる口内炎なし','good'),'調整後の痛み・粘膜刺激あり'],
   [('費用',''),'300万〜700万₩ (症例による)','500万₩'],
   [('日本からの通院',''),('◎ 遠隔モニタリング+まとめ渡しに最適','good'),('△ 頻繁な調整来院が必要','bad')],
  ]},
 {'type':'cards','alt':True,'label':'成功のコツ','h2':'インビザライン成功の4つのルール',
  'cards':[
   {'icon':'fas fa-clock','t':'1日22時間装着','d':'食事と歯磨き以外は常に装着。装着時間がそのまま治療結果に直結します。'},
   {'icon':'fas fa-glass-water','t':'装着中は水だけ','d':'コーヒー・お茶・ジュースは着色と虫歯の原因に。飲む時は外して、装着前に軽くうがいを。'},
   {'icon':'fas fa-hand-fist','t':'チューイーを毎日','d':'アライナー交換後は毎日5〜10分チューイーを噛んで、歯にぴったりフィットさせましょう。'},
   {'icon':'fas fa-mobile-screen','t':'遠隔モニタリング活用','d':'日本にいながらスマホ写真で経過確認 — 来韓回数を最小限に抑えられます。'},
  ]},
]

EXTRA['/jp/pricing'] = [
 {'type':'cards','label':'なぜこの価格?','h2':'品質を落とさずに価格を抑えられる3つの理由',
  'cards':[
   {'icon':'fas fa-gears','t':'院内デジタル技工所','d':'クラウン・補綴物を2Fの自社技工所で製作 — 外注技工所のマージンがゼロ。ジルコニアクラウン55万₩(約6万円)が可能な理由です。'},
   {'icon':'fas fa-chart-line','t':'症例数によるスケールメリット','d':'年間120億₩規模・400坪の大型医院 — 材料の大量仕入れと専門分業で1件あたりのコストを削減。'},
   {'icon':'fas fa-handshake-slash','t':'ブローカー・仲介手数料なし','d':'医療ツーリズム仲介業者を通さない直接予約 — 仲介手数料(通常20〜30%)分がそのまま患者様の節約に。'},
  ]},
 {'type':'faq','alt':True,'label':'お支払いのヒント','h2':'賢く治療費を抑えるQ&A',
  'faqs':[
   ('日本の歯科と比べてどのくらい安いですか?','例えばインプラント:日本の自由診療は1本40〜60万円が相場ですが、当院はオステムCA 80万₩(約8.7万円)〜ストローマンBLX 160万₩(約17.4万円)。ジルコニアクラウンは日本の10〜15万円に対し55万₩(約6万円)です。'),
   ('支払い方法は?','現金(ウォン)、クレジットカード(VISA/Master/JCB/AMEX)がご利用いただけます。カードなら両替不要でレートも良好です。'),
   ('見積もりは事前にもらえますか?','はい。パノラマX線データやお口の写真をお送りいただければ、来韓前に日本語の概算見積もりをお出しします。来院後の検査で確定見積もりとなります。'),
   ('追加費用が発生することは?','骨移植(30万〜50万₩)や上顎洞挙上(50万〜100万₩)が必要な場合のみ。必要性と費用は手術前に必ずご説明し、同意なしに進めることはありません。'),
   ('領収書は日本語で発行できますか?','項目別の英文領収書を発行します(海外医療費控除の申請にご利用いただけます)。日本の確定申告での医療費控除は国内医療機関が対象のためご注意ください。'),
  ]},
]

EXTRA['/jp/travel-guide'] = [
 {'type':'steps','label':'ご到着後の流れ','h2':'当院に着いてから — スムーズな受付の流れ',
  'steps':[
   {'t':'駐車 or タクシー降車','time':'0分','d':'無料地下駐車場(高さ制限2.1m)。エレベーターで1F受付へ。'},
   {'t':'1Fで受付','time':'2分','d':'パスポートをご提示ください。「日本語お願いします」とお伝えいただければコーディネーターがご案内します。'},
   {'t':'担当フロアへ','time':'1分','d':'1F矯正、3F検診・小児、4Fインプラント手術、5F総合診療 — 目的のセンターへご案内します。'},
   {'t':'診療後','time':'—','d':'お会計と次回予約は同じフロアの受付で。項目別の英文領収書も発行可能です。'},
  ]},
 {'type':'info','alt':True,'label':'ランドマーク','h2':'タクシーで伝える目印','rows':[
   {'k':'バス停','v':'プルダン住公5団地 (불당주공5단지) — 徒歩1分','gold':True},
   {'k':'エリア','v':'プルダン洞ニュータウン — カフェ&ショッピングストリート'},
   {'k':'KTX駅','v':'天安牙山駅 — タクシー10分 (ソウル駅からKTXで約35分)'},
   {'k':'市内目印','v':'天安市庁 — 車で5分'},
 ]},
 {'type':'cards','label':'天安観光','h2':'治療の合間に — 天安・牙山エリアの楽しみ方',
  'cards':[
   {'icon':'fas fa-hot-tub-person','t':'温陽温泉 (牙山)','d':'600年の歴史を持つ韓国最古級の温泉街。手術前後のリラックスに最適(手術直後の入浴は担当医にご確認を)。タクシー約20分。'},
   {'icon':'fas fa-landmark','t':'独立記念館','d':'韓国最大級の歴史博物館。広大な公園で散策も。車で約25分。'},
   {'icon':'fas fa-bag-shopping','t':'新世界百貨店 天安アサン店','d':'ショッピング&グルメ。天安アサン駅直結でアクセス抜群。'},
   {'icon':'fas fa-utensils','t':'プルダン洞グルメ街','d':'当院周辺は天安随一のカフェ・レストラン街。治療の待ち時間も退屈しません。'},
  ]},
]

# ═══════════════════════════════ CN ═══════════════════════════════
# 人民币参考: 1万₩ ≈ 52元 (2026)

EXTRA['/cn/dental'] = [
 {'type':'cards','label':'楼层指南','h2':'5个楼层,每层都是专科中心','grid':'iv2-grid--3',
  'desc':'一栋楼全搞定 — 每个楼层都是独立运营的专科诊疗中心。',
  'cards':[
   {'icon':'fas fa-teeth','t':'1F · 隐适美正畸中心','d':'正畸专属楼层,配备数字化口扫仪与ClinCheck方案咨询室。'},
   {'icon':'fas fa-gears','t':'2F · 数字化技工&卫生中心','d':'院内自有数字技工所 — 牙冠与修复体院内设计制作,省去外包加价,质量更可控。'},
   {'icon':'fas fa-child','t':'3F · BDX检查&儿童牙科中心','d':'全面口腔检查项目 + 儿童专属游乐区,3名儿童牙科专科医师坐诊。'},
   {'icon':'fas fa-tooth','t':'4F · 种植牙中心','d':'6间独立手术室 + 2间恢复室,风淋(air-shower)级感染管理系统。'},
   {'icon':'fas fa-hospital-user','t':'5F · 综合诊疗中心','d':'补牙、根管治疗、牙周护理、智齿拔除、急诊 — 所有科室一站式覆盖。'},
   {'icon':'fas fa-shield-virus','t':'大学医院级感染管理','d':'手术楼层风淋入室、每位患者独立器械包、中央消毒系统 — 2021年开院以来严格执行。'},
  ]},
 {'type':'cards','alt':True,'label':'全家适用','h2':'从孩子到老人 — 全年龄段照护',
  'cards':[
   {'icon':'fas fa-baby','t':'3名儿童牙科专科医师','d':'儿牙专科医师诊疗、儿童游乐区、针对怕牙医的孩子提供笑气/镇静选项。儿童树脂补牙3万–10万₩。'},
   {'icon':'fas fa-bed','t':'镇静(睡眠)牙科','d':'笑气 + 静脉镇静,牙科恐惧症患者也能安心 — 种植、拔智齿全程监护下"睡着"完成。'},
   {'icon':'fas fa-tooth','t':'智齿&疑难拔牙','d':'阻生智齿、复杂病例由院内外科团队直接处理 — 无需转诊其他医院。'},
   {'icon':'fas fa-user-group','t':'老年&义齿照护','d':'全口/局部活动义齿(单颌150万₩)、种植覆盖义齿(单颌200万₩),针对老年患者的温和诊疗流程。'},
  ]},
]

EXTRA['/cn/implant'] = [
 {'type':'compare','label':'植体对比','h2':'士卓曼 vs 奥齿泰 — 哪款植体适合您?',
  'head':['','Straumann BLX (士卓曼)','Osstem SOI (奥齿泰)','Osstem CA (奥齿泰)'],
  'rows':[
   [('原产地',''),'瑞士 🇨🇭','韩国 🇰🇷','韩国 🇰🇷'],
   [('单颗价格',''),('160万₩ (约8,300元)','good'),'100万₩ (约5,200元)',('80万₩ (约4,200元)','good')],
   [('研究实力',''),('全球市占率第一,60余年数据','good'),'韩国临床数据丰富','韩国病例数最多'],
   [('骨结合速度',''),('最快 (Roxolid + SLActive)','good'),'快','标准'],
   [('适合人群',''),'骨质弱、吸烟者、糖尿病、前牙','性价比均衡之选','骨质健康、后牙、预算优先'],
  ]},
 {'type':'cards','alt':True,'label':'高端方案','h2':'院内即可完成的高端种植方案',
  'cards':[
   {'icon':'fas fa-crosshairs','t':'导航种植手术','d':'3D数字化导板种植(+10万–30万₩) — 微创切口,神经与上颌窦附近也能精准植入。'},
   {'icon':'fas fa-bolt','t':'即刻负重(即拔即种)','d':'符合条件的病例:拔牙、植入、临时牙一天完成 — 不留缺牙期,适合行程紧张的患者。'},
   {'icon':'fas fa-teeth-open','t':'全口重建','d':'牙齿大量缺失?固定式全口种植桥,或种植覆盖义齿(单颌200万₩+植体)。'},
   {'icon':'fas fa-rotate','t':'种植失败再手术','d':'其他医院种植失败或感染 — 由本院外科团队取出、植骨重建、重新种植。'},
   {'icon':'fas fa-moon','t':'镇静种植手术','d':'静脉镇静(20万₩)+ 生命体征监护 — 大多数患者对手术过程毫无记忆。'},
   {'icon':'fas fa-calendar-check','t':'全年无休种植','d':'365天开诊 — 周末、节假日也有手术档期,不用请假也能种牙。'},
  ]},
 {'type':'steps','label':'术后护理','h2':'种植后的长期护理',
  'steps':[
   {'t':'第一周','time':'第1–7天','d':'轻微肿胀属正常。软食、按医嘱服药、严禁吸烟 — 吸烟是种植早期失败的头号原因。'},
   {'t':'拆线&复查','time':'约2周','d':'短暂来院确认愈合情况。回国的患者可通过线上照片远程复查。'},
   {'t':'定期维护','time':'每6个月','d':'种植体周围专业清洁 + 咬合检查 — 预防种植体周围炎,是种植牙用20年以上的关键。'},
   {'t':'终身病历','time':'随时','d':'完整手术记录、植体型号、X光片随时可取 — 回国后与当地牙医对接无障碍。'},
  ]},
]

EXTRA['/cn/invisalign'] = [
 {'type':'compare','label':'隐适美 vs 钢牙','h2':'隐形矫正 vs 传统托槽矫正',
  'head':['','隐适美 Invisalign','陶瓷托槽 (Clippy-C)'],
  'rows':[
   [('外观',''),('几乎隐形的透明牙套','good'),'相对低调但仍可见'],
   [('可摘戴',''),('可以 — 吃饭刷牙照常','good'),('不可 — 饮食有诸多限制','bad')],
   [('复诊频率',''),('每6–10周(可配合远程监控)','good'),'每4–6周需到院调整'],
   [('疼痛/不适',''),('较少 — 无钢丝磨嘴','good'),'调整后酸痛、易磨破口腔黏膜'],
   [('费用',''),'300万–700万₩ (视病例而定)','500万₩'],
   [('适合在华患者',''),('◎ 远程监控+多副牙套一次带走','good'),('△ 需频繁来韩调整','bad')],
  ]},
 {'type':'cards','alt':True,'label':'成功秘诀','h2':'隐适美成功的4条铁律',
  'cards':[
   {'icon':'fas fa-clock','t':'每天佩戴22小时','d':'除吃饭刷牙外全天佩戴。佩戴时长直接决定矫正效果。'},
   {'icon':'fas fa-glass-water','t':'戴牙套只喝水','d':'咖啡、茶、饮料会导致染色和蛀牙。喝其他饮品请摘下,戴回前漱口。'},
   {'icon':'fas fa-hand-fist','t':'每天咬咬胶','d':'每副新牙套开始后,每天咬咬胶(chewies)5–10分钟,让牙套完全贴合牙齿。'},
   {'icon':'fas fa-mobile-screen','t':'善用远程监控','d':'人在中国也能用手机照片跟进进度 — 大幅减少来韩次数。'},
  ]},
]

EXTRA['/cn/pricing'] = [
 {'type':'cards','label':'为什么这个价格?','h2':'不降品质也能降价格的3个理由',
  'cards':[
   {'icon':'fas fa-gears','t':'院内数字技工所','d':'牙冠、修复体在2楼自有技工所制作 — 零外包加价。全锆冠55万₩(约2,900元)就是这么来的。'},
   {'icon':'fas fa-chart-line','t':'规模效应','d':'年营收120亿₩、1,300㎡的大型医院 — 材料批量采购 + 专科分工,摊薄每例成本。'},
   {'icon':'fas fa-handshake-slash','t':'无中介、无回扣','d':'不经医疗旅游中介直接预约 — 省下的中介费(通常20–30%)直接让利给患者。'},
  ]},
 {'type':'faq','alt':True,'label':'省钱攻略','h2':'聪明省下治疗费的Q&A',
  'faqs':[
   ('比国内便宜多少?','以种植牙为例:国内一线城市士卓曼植体普遍1.5万–2.5万元/颗,本院士卓曼BLX 160万₩(约8,300元);奥齿泰CA仅80万₩(约4,200元)。全锆冠国内3,000–8,000元,本院55万₩(约2,900元)。'),
   ('支持哪些付款方式?','支持微信支付、支付宝、银联卡、VISA/Master信用卡及现金(韩元) — 中国患者付款零障碍。'),
   ('能提前拿到报价吗?','可以。通过微信发送全景X光片或口腔照片,来韩前即可收到中文预估报价,到院检查后出具最终报价。'),
   ('会有隐藏费用吗?','只有需要植骨(30万–50万₩)或上颌窦提升(50万–100万₩)时才产生附加费,且术前一定说明并征得同意后才进行。'),
   ('在韩工作者能用韩国医保吗?','持合法签证并加入韩国国民健康保险(NHIS)者,洗牙每年仅需约1.5万–2万₩,拔牙、牙周治疗等也享医保价 — 请携带外国人登录证。'),
  ]},
]

EXTRA['/cn/travel-guide'] = [
 {'type':'steps','label':'到院流程','h2':'抵达医院后 — 顺畅的接待流程',
  'steps':[
   {'t':'停车或下车','time':'0分钟','d':'免费地下停车场(限高2.1m)。乘电梯至1楼前台。'},
   {'t':'1楼登记','time':'2分钟','d':'出示护照或外国人登录证。说一句"中文服务",协调员即刻为您对接。'},
   {'t':'前往对应楼层','time':'1分钟','d':'1楼正畸、3楼检查&儿牙、4楼种植手术、5楼综合诊疗 — 有专人引导。'},
   {'t':'诊疗结束后','time':'—','d':'缴费与下次预约在同楼层前台办理,可开具分项英文收据。'},
  ]},
 {'type':'info','alt':True,'label':'地标','h2':'告诉出租车司机的地标','rows':[
   {'k':'公交站','v':'佛堂住公5小区 (불당주공5단지) — 步行1分钟','gold':True},
   {'k':'所在区域','v':'佛堂洞新城 — 天安核心咖啡&购物街区'},
   {'k':'KTX车站','v':'天安牙山站 — 打车10分钟 (首尔站乘KTX约35分钟)'},
   {'k':'市内地标','v':'天安市政府 — 车程5分钟'},
 ]},
 {'type':'cards','label':'天安游玩','h2':'治疗间隙 — 天安·牙山吃喝玩乐',
  'cards':[
   {'icon':'fas fa-hot-tub-person','t':'温阳温泉 (牙山)','d':'600年历史的韩国最古老温泉街之一,术前术后放松首选(术后即刻泡温泉请先咨询医师)。打车约20分钟。'},
   {'icon':'fas fa-landmark','t':'独立纪念馆','d':'韩国最大规模的历史博物馆,园区广阔适合散步。车程约25分钟。'},
   {'icon':'fas fa-bag-shopping','t':'新世界百货 天安牙山店','d':'购物+美食一站搞定,天安牙山站直连,交通便利。'},
   {'icon':'fas fa-utensils','t':'佛堂洞美食街','d':'医院周边就是天安最热闹的咖啡厅&餐厅街区,候诊时间也不无聊。'},
  ]},
]

# ═══════════════════════════════ VI ═══════════════════════════════
# Đối tượng: lao động E-9, du học sinh, gia đình đa văn hóa tại Cheonan–Asan

EXTRA['/vi/'] = [
 {'type':'cards','label':'Sơ đồ tầng','h2':'5 tầng — mỗi tầng là một trung tâm chuyên khoa','grid':'iv2-grid--3',
  'desc':'Một tòa nhà, đầy đủ mọi dịch vụ — mỗi tầng hoạt động như một phòng khám chuyên khoa riêng.',
  'cards':[
   {'icon':'fas fa-teeth','t':'Tầng 1 · Trung tâm niềng răng Invisalign','d':'Tầng chuyên về chỉnh nha với máy scan kỹ thuật số và phòng tư vấn ClinCheck.'},
   {'icon':'fas fa-gears','t':'Tầng 2 · Labo kỹ thuật số & vệ sinh răng','d':'Labo nha khoa ngay trong bệnh viện — răng sứ được thiết kế và chế tác tại chỗ, không qua trung gian nên giá tốt hơn.'},
   {'icon':'fas fa-child','t':'Tầng 3 · Khám tổng quát BDX & Nha khoa trẻ em','d':'Chương trình khám răng toàn diện + khu vui chơi trẻ em, 3 bác sĩ chuyên khoa nhi.'},
   {'icon':'fas fa-tooth','t':'Tầng 4 · Trung tâm Implant','d':'6 phòng phẫu thuật độc lập + 2 phòng hồi sức, hệ thống kiểm soát nhiễm khuẩn air-shower.'},
   {'icon':'fas fa-hospital-user','t':'Tầng 5 · Trung tâm điều trị tổng hợp','d':'Trám răng, điều trị tủy, nha chu, nhổ răng khôn, cấp cứu — tất cả chuyên khoa trong một tòa nhà.'},
   {'icon':'fas fa-shield-virus','t':'Kiểm soát nhiễm khuẩn chuẩn bệnh viện đại học','d':'Air-shower trước khi vào tầng phẫu thuật, bộ dụng cụ riêng cho từng bệnh nhân, hệ thống tiệt trùng trung tâm — từ khi khai trương 2021.'},
  ]},
 {'type':'cards','alt':True,'label':'Cho cả gia đình','h2':'Chăm sóc mọi lứa tuổi — từ trẻ em đến ông bà',
  'cards':[
   {'icon':'fas fa-baby','t':'3 bác sĩ chuyên khoa nhi','d':'Bác sĩ nha khoa trẻ em có chứng chỉ chuyên khoa, khu vui chơi riêng, khí cười/an thần cho bé sợ nha sĩ. Trám răng trẻ em 30.000–100.000₩.'},
   {'icon':'fas fa-bed','t':'Nha khoa an thần (ngủ)','d':'Khí cười và an thần tĩnh mạch cho người sợ nha sĩ — cấy implant, nhổ răng khôn trong lúc "ngủ", có theo dõi sinh hiệu.'},
   {'icon':'fas fa-tooth','t':'Răng khôn & nhổ răng khó','d':'Răng khôn mọc ngầm, ca phức tạp đều do đội ngũ phẫu thuật của bệnh viện xử lý — không cần chuyển viện.'},
   {'icon':'fas fa-user-group','t':'Người cao tuổi & răng giả','d':'Hàm giả toàn phần/bán phần (1,5 triệu₩/hàm), hàm phủ trên implant (2 triệu₩/hàm), quy trình nhẹ nhàng cho người lớn tuổi.'},
  ]},
]

EXTRA['/vi/implant'] = [
 {'type':'compare','label':'So sánh trụ implant','h2':'Straumann vs Osstem — trụ nào hợp với bạn?',
  'head':['','Straumann BLX','Osstem SOI','Osstem CA'],
  'rows':[
   [('Xuất xứ',''),'Thụy Sĩ 🇨🇭','Hàn Quốc 🇰🇷','Hàn Quốc 🇰🇷'],
   [('Giá / răng',''),('1.600.000₩','good'),'1.000.000₩',('800.000₩','good')],
   [('Nghiên cứu',''),('Số 1 thế giới, hơn 60 năm dữ liệu','good'),'Dữ liệu lâm sàng mạnh tại Hàn','Số ca nhiều nhất Hàn Quốc'],
   [('Tốc độ tích hợp xương',''),('Nhanh nhất (Roxolid + SLActive)','good'),'Nhanh','Tiêu chuẩn'],
   [('Phù hợp với',''),'Xương yếu, người hút thuốc, tiểu đường, răng cửa','Cân bằng giá & chất lượng','Xương khỏe, răng hàm, tiết kiệm'],
  ]},
 {'type':'cards','alt':True,'label':'Kỹ thuật cao','h2':'Các giải pháp implant cao cấp làm ngay tại viện',
  'cards':[
   {'icon':'fas fa-crosshairs','t':'Phẫu thuật định vị 3D','d':'Cấy ghép theo máng hướng dẫn 3D (+100.000–300.000₩) — vết mổ nhỏ, chính xác gần dây thần kinh và xoang hàm.'},
   {'icon':'fas fa-bolt','t':'Tải lực tức thì','d':'Ca phù hợp: nhổ răng, cấy trụ, gắn răng tạm trong 1 ngày — không phải chịu cảnh mất răng.'},
   {'icon':'fas fa-teeth-open','t':'Phục hình toàn hàm','d':'Mất gần hết răng? Cầu răng cố định toàn hàm trên implant, hoặc hàm phủ implant (2 triệu₩/hàm + trụ).'},
   {'icon':'fas fa-rotate','t':'Làm lại implant hỏng','d':'Implant thất bại hoặc nhiễm trùng ở nơi khác — tháo trụ, ghép xương, cấy lại bởi đội phẫu thuật của viện.'},
   {'icon':'fas fa-moon','t':'Cấy implant khi ngủ','d':'An thần tĩnh mạch (200.000₩) + theo dõi sinh hiệu — đa số bệnh nhân không nhớ gì về ca mổ.'},
   {'icon':'fas fa-calendar-check','t':'Cấy implant cuối tuần & ngày lễ','d':'Mở cửa 365 ngày — có lịch mổ thứ 7, chủ nhật, ngày lễ. Không cần xin nghỉ làm vẫn trồng được răng.'},
  ]},
 {'type':'steps','label':'Chăm sóc sau cấy','h2':'Chăm sóc lâu dài sau khi cấy implant',
  'steps':[
   {'t':'Tuần đầu tiên','time':'Ngày 1–7','d':'Sưng nhẹ là bình thường. Ăn đồ mềm, uống thuốc theo toa, tuyệt đối không hút thuốc — hút thuốc là nguyên nhân số 1 làm implant thất bại sớm.'},
   {'t':'Cắt chỉ & kiểm tra','time':'~2 tuần','d':'Đến viện nhanh để kiểm tra lành thương. Đa số hết khó chịu ở giai đoạn này.'},
   {'t':'Bảo dưỡng định kỳ','time':'Mỗi 6 tháng','d':'Vệ sinh chuyên sâu quanh implant + kiểm tra khớp cắn — phòng viêm quanh implant là chìa khóa để dùng hơn 20 năm.'},
   {'t':'Hồ sơ trọn đời','time':'Bất cứ lúc nào','d':'Hồ sơ phẫu thuật, thông tin trụ, phim X-quang luôn sẵn sàng — kể cả khi bạn về Việt Nam hay chuyển chỗ ở.'},
  ]},
]

EXTRA['/vi/invisalign'] = [
 {'type':'compare','label':'Invisalign vs mắc cài','h2':'Niềng trong suốt vs niềng mắc cài truyền thống',
  'head':['','Invisalign','Mắc cài sứ (Clippy-C)'],
  'rows':[
   [('Thẩm mỹ',''),('Khay trong suốt, gần như vô hình','good'),'Kín đáo hơn kim loại nhưng vẫn thấy'],
   [('Tháo lắp',''),('Được — ăn uống, đánh răng bình thường','good'),('Không — phải kiêng nhiều món','bad')],
   [('Tần suất tái khám',''),('6–10 tuần/lần (kết hợp theo dõi từ xa)','good'),'4–6 tuần/lần phải đến chỉnh'],
   [('Đau / khó chịu',''),('Ít — không bị dây cung cọ xước miệng','good'),'Ê sau mỗi lần siết, dễ nhiệt miệng'],
   [('Chi phí',''),'3–7 triệu₩ (tùy ca)','5 triệu₩'],
   [('Hợp với người đi làm ca',''),('◎ Ít phải xin nghỉ, nhận nhiều khay/lần','good'),('△ Phải đến viện thường xuyên','bad')],
  ]},
 {'type':'cards','alt':True,'label':'Bí quyết thành công','h2':'4 nguyên tắc vàng khi đeo Invisalign',
  'cards':[
   {'icon':'fas fa-clock','t':'Đeo 22 giờ mỗi ngày','d':'Chỉ tháo khi ăn và đánh răng. Thời gian đeo quyết định trực tiếp kết quả niềng.'},
   {'icon':'fas fa-glass-water','t':'Chỉ uống nước khi đeo khay','d':'Cà phê, trà, nước ngọt gây ố khay và sâu răng. Muốn uống thì tháo ra, súc miệng trước khi đeo lại.'},
   {'icon':'fas fa-hand-fist','t':'Nhai chewies mỗi ngày','d':'Mỗi khi đổi khay mới, nhai chewies 5–10 phút/ngày để khay ôm sát răng.'},
   {'icon':'fas fa-mobile-screen','t':'Tận dụng theo dõi từ xa','d':'Gửi ảnh qua điện thoại để bác sĩ kiểm tra tiến độ — giảm tối đa số lần phải xin nghỉ làm.'},
  ]},
]

EXTRA['/vi/laminate'] = [
 {'type':'compare','label':'Chọn phương pháp nào?','h2':'Mặt dán sứ vs bọc răng sứ vs tẩy trắng',
  'head':['','Mặt dán sứ (Veneer)','Bọc sứ (Crown)','Tẩy trắng'],
  'rows':[
   [('Mài răng',''),('Rất ít (0,3–0,5mm mặt ngoài)','good'),('Mài toàn bộ quanh răng','bad'),('Không mài','good')],
   [('Khắc phục',''),'Màu, hình dáng, khe hở nhỏ','Răng vỡ lớn, đã điều trị tủy','Chỉ thay đổi màu răng'],
   [('Độ bền',''),'10–15 năm','10–15+ năm','1–3 năm (cần duy trì)'],
   [('Chi phí / răng',''),'Ceramic 350.000₩~','Zirconia 550.000₩','300.000₩ (+VAT, trọn liệu trình)'],
   [('Phù hợp khi',''),'Muốn đẹp răng cửa, đổi màu-dáng','Răng hư tổn nặng cần bảo vệ','Răng đều đẹp, chỉ muốn trắng hơn'],
  ]},
 {'type':'cards','alt':True,'label':'Giữ veneer bền lâu','h2':'4 thói quen giúp mặt dán sứ bền 15 năm',
  'cards':[
   {'icon':'fas fa-ban','t':'Tránh lực mạnh','d':'Không cắn móng tay, mở nắp chai, cắn đá viên bằng răng đã dán sứ — sứ rất cứng nhưng vẫn có thể mẻ vì lực điểm.'},
   {'icon':'fas fa-moon','t':'Máng chống nghiến ban đêm','d':'Nếu bạn nghiến răng khi ngủ, đeo máng bảo vệ (1 triệu₩) để veneer không bị nứt vỡ.'},
   {'icon':'fas fa-tooth','t':'Đánh răng đúng cách','d':'Bàn chải lông mềm + kem không quá mài mòn, chải cả viền nướu — mép veneer sạch thì không bao giờ hở đen.'},
   {'icon':'fas fa-calendar-check','t':'Đánh bóng định kỳ mỗi năm','d':'Mỗi năm 1 lần kiểm tra + đánh bóng tại viện giúp veneer luôn sáng như mới.'},
  ]},
]

EXTRA['/vi/pricing'] = [
 {'type':'cards','label':'Vì sao giá tốt?','h2':'3 lý do giá hợp lý mà chất lượng không đổi',
  'cards':[
   {'icon':'fas fa-gears','t':'Labo kỹ thuật số trong viện','d':'Răng sứ được chế tác ngay tại labo tầng 2 — không mất phí trung gian labo ngoài. Đó là lý do răng sứ zirconia chỉ 550.000₩.'},
   {'icon':'fas fa-chart-line','t':'Quy mô lớn','d':'Bệnh viện 1.300㎡, doanh thu 12 tỷ₩/năm — mua vật liệu số lượng lớn + phân công chuyên khoa giúp giảm chi phí mỗi ca.'},
   {'icon':'fas fa-handshake-slash','t':'Không qua môi giới','d':'Đặt lịch trực tiếp, không qua trung gian — khoản hoa hồng môi giới (thường 20–30%) được trả lại cho bệnh nhân.'},
  ]},
 {'type':'faq','alt':True,'label':'Mẹo tiết kiệm','h2':'Hỏi đáp: tiết kiệm chi phí điều trị thông minh',
  'faqs':[
   ('Tôi có bảo hiểm y tế Hàn Quốc (NHIS), được giảm những gì?','Nếu bạn làm việc hợp pháp (visa E-9, E-7...) và tham gia NHIS: lấy cao răng chỉ khoảng 15.000–20.000₩/năm 1 lần, nhổ răng, điều trị nha chu, khám đau răng đều được áp giá bảo hiểm. Người từ 65 tuổi tham gia NHIS còn được hỗ trợ implant/hàm giả. Nhớ mang thẻ đăng ký người nước ngoài.'),
   ('Trả góp hay trả một lần?','Thanh toán bằng tiền mặt, thẻ nội địa Hàn hoặc thẻ VISA/Master. Với gói điều trị lớn (implant nhiều răng, niềng), có thể chia thanh toán theo giai đoạn điều trị — hỏi quầy lễ tân.'),
   ('Có được báo giá trước khi điều trị không?','Có. Sau khi chụp X-quang toàn cảnh miễn phí lần khám đầu, bạn nhận bảng giá chi tiết từng hạng mục trước khi bắt đầu — không phát sinh chi phí ẩn.'),
   ('Điều trị nhiều răng cùng lúc có rẻ hơn?','Kế hoạch điều trị tổng thể thường tiết kiệm hơn làm lẻ tẻ từng răng — vừa ít lần xin nghỉ làm, vừa được tư vấn gói tối ưu.'),
   ('Giá có tăng bất ngờ không?','Bảng giá niêm yết ổn định. Chỉ phát sinh thêm khi cần ghép xương (300.000–500.000₩) hoặc nâng xoang (500.000–1.000.000₩), và luôn được giải thích + đồng ý trước khi thực hiện.'),
  ]},
]

EXTRA['/vi/directions'] = [
 {'type':'steps','label':'Khi đến viện','h2':'Đến nơi rồi — quy trình tiếp đón',
  'steps':[
   {'t':'Đỗ xe hoặc xuống taxi','time':'0 phút','d':'Bãi đỗ xe ngầm miễn phí (giới hạn chiều cao 2,1m). Đi thang máy lên quầy lễ tân tầng 1.'},
   {'t':'Đăng ký tại tầng 1','time':'2 phút','d':'Xuất trình hộ chiếu hoặc thẻ đăng ký người nước ngoài. Nói "Tiếng Việt" — nhân viên sẽ dùng app phiên dịch hỗ trợ bạn.'},
   {'t':'Lên tầng điều trị','time':'1 phút','d':'Tầng 1 niềng răng, tầng 3 khám & trẻ em, tầng 4 phẫu thuật implant, tầng 5 điều trị tổng hợp — có người dẫn đường.'},
   {'t':'Sau khi khám xong','time':'—','d':'Thanh toán và đặt lịch hẹn tiếp theo ngay tại quầy cùng tầng. Có thể xin hóa đơn chi tiết.'},
  ]},
 {'type':'info','alt':True,'label':'Địa danh gần viện','h2':'Nói với tài xế taxi các địa danh này','rows':[
   {'k':'Trạm xe buýt','v':'Buldang Jugong 5-danji (불당주공5단지) — đi bộ 1 phút','gold':True},
   {'k':'Khu vực','v':'Khu đô thị mới Buldang-dong — phố cà phê & mua sắm trung tâm Cheonan'},
   {'k':'Ga KTX','v':'Ga Cheonan-Asan (천안아산역) — 10 phút taxi'},
   {'k':'Từ KCN Asan / Tangjeong','v':'Khoảng 15–25 phút lái xe — tiện ghé sau giờ tan ca hoặc cuối tuần'},
 ]},
]

EXTRA['/vi/faq'] = [
 {'type':'faq','label':'Hỏi thêm','h2':'Các câu hỏi thường gặp khác từ cộng đồng Việt',
  'faqs':[
   ('Cuối tuần có đông không? Nên đến giờ nào?','Thứ 7, chủ nhật mở cửa 09:00–13:00 và khá đông người lao động. Nên đặt lịch trước qua điện thoại hoặc form online; khung 09:00–10:00 thường vắng nhất.'),
   ('Trẻ em nhà tôi sợ nha sĩ, có cách nào không?','Tầng 3 có khu vui chơi trẻ em và 3 bác sĩ chuyên khoa nhi. Bé quá sợ có thể dùng khí cười hoặc an thần — an toàn, có theo dõi sinh hiệu.'),
   ('Tôi làm ca đêm, có khám được buổi sáng sớm không?','Ngày thường mở cửa từ 09:00. Nếu tan ca sáng, bạn có thể đến ngay 09:00 — đặt lịch trước để không phải chờ.'),
   ('Răng khôn đau quá, có nhổ ngay trong ngày được không?','Trường hợp đau cấp sẽ được ưu tiên. Răng khôn mọc thẳng có thể nhổ ngay; răng ngầm phức tạp sẽ chụp phim, lên lịch phẫu thuật sớm nhất (thường trong vài ngày).'),
   ('Về Việt Nam giữa chừng thì việc điều trị dở dang sao?','Bệnh viện cung cấp hồ sơ điều trị, phim X-quang và kế hoạch còn lại để bạn tiếp tục ở Việt Nam. Với niềng Invisalign có thể nhận trước nhiều khay và theo dõi từ xa.'),
   ('Có nhân viên nói tiếng Việt không?','Bệnh viện hỗ trợ qua app phiên dịch và tài liệu tiếng Việt. Khi đặt lịch, báo trước "bệnh nhân Việt Nam" để viện chuẩn bị chu đáo hơn.'),
  ]},
]

# ═══════════════════════════════ TH ═══════════════════════════════
# กลุ่มเป้าหมาย: แรงงานไทยในนิคมอุตสาหกรรมอาซาน/ทังจอง, นักเรียน, ครอบครัว

EXTRA['/th/'] = [
 {'type':'cards','label':'ผังอาคาร','h2':'5 ชั้น — แต่ละชั้นคือศูนย์เฉพาะทาง','grid':'iv2-grid--3',
  'desc':'ครบจบในตึกเดียว — แต่ละชั้นทำงานเหมือนคลินิกเฉพาะทางแยกกัน',
  'cards':[
   {'icon':'fas fa-teeth','t':'ชั้น 1 · ศูนย์จัดฟันใส Invisalign','d':'ชั้นเฉพาะสำหรับจัดฟัน พร้อมเครื่องสแกนดิจิทัลและห้องปรึกษาแผน ClinCheck'},
   {'icon':'fas fa-gears','t':'ชั้น 2 · แล็บดิจิทัล & ศูนย์อนามัยช่องปาก','d':'แล็บทันตกรรมในโรงพยาบาล — ครอบฟันและฟันปลอมออกแบบและผลิตในที่เดียว ไม่ผ่านคนกลาง ราคาจึงดีกว่า'},
   {'icon':'fas fa-child','t':'ชั้น 3 · ศูนย์ตรวจสุขภาพฟัน BDX & ทันตกรรมเด็ก','d':'โปรแกรมตรวจฟันครบวงจร + โซนเด็กเล่น พร้อมทันตแพทย์เฉพาะทางเด็ก 3 ท่าน'},
   {'icon':'fas fa-tooth','t':'ชั้น 4 · ศูนย์รากฟันเทียม','d':'ห้องผ่าตัดอิสระ 6 ห้อง + ห้องพักฟื้น 2 ห้อง ระบบควบคุมการติดเชื้อแบบ air-shower'},
   {'icon':'fas fa-hospital-user','t':'ชั้น 5 · ศูนย์รักษาทั่วไป','d':'อุดฟัน รักษารากฟัน โรคเหงือก ถอนฟันคุด และเคสฉุกเฉิน — ทุกสาขาในหลังคาเดียว'},
   {'icon':'fas fa-shield-virus','t':'ควบคุมการติดเชื้อระดับโรงพยาบาลมหาวิทยาลัย','d':'ทางเข้า air-shower สู่ชั้นผ่าตัด ชุดเครื่องมือแยกต่อคนไข้ ระบบฆ่าเชื้อส่วนกลาง — ตั้งแต่เปิดปี 2021'},
  ]},
 {'type':'cards','alt':True,'label':'สำหรับทั้งครอบครัว','h2':'ดูแลทุกวัย — ตั้งแต่เด็กถึงผู้สูงอายุ',
  'cards':[
   {'icon':'fas fa-baby','t':'ทันตแพทย์เด็กเฉพาะทาง 3 ท่าน','d':'หมอฟันเด็กเฉพาะทาง โซนเด็กเล่น และแก๊สหัวเราะ/ยาระงับความรู้สึกสำหรับเด็กกลัวหมอฟัน อุดฟันเด็ก 30,000–100,000₩'},
   {'icon':'fas fa-bed','t':'ทันตกรรมแบบหลับ (Sedation)','d':'แก๊สหัวเราะและยานอนหลับทางหลอดเลือด สำหรับคนกลัวหมอฟัน — ฝังรากเทียม ถอนฟันคุดแบบ "หลับ" พร้อมเครื่องมอนิเตอร์ชีพจร'},
   {'icon':'fas fa-tooth','t':'ฟันคุด & การถอนฟันยาก','d':'ฟันคุดฝังลึก เคสซับซ้อน ทีมศัลยกรรมของโรงพยาบาลจัดการเองทั้งหมด — ไม่ต้องส่งตัวไปที่อื่น'},
   {'icon':'fas fa-user-group','t':'ผู้สูงอายุ & ฟันปลอม','d':'ฟันปลอมทั้งปาก/บางส่วน (1.5 ล้าน₩/ขากรรไกร) ฟันปลอมบนรากเทียม (2 ล้าน₩/ขากรรไกร) พร้อมขั้นตอนที่อ่อนโยนสำหรับผู้สูงวัย'},
  ]},
]

EXTRA['/th/implant'] = [
 {'type':'compare','label':'เปรียบเทียบรากเทียม','h2':'Straumann vs Osstem — แบบไหนเหมาะกับคุณ?',
  'head':['','Straumann BLX','Osstem SOI','Osstem CA'],
  'rows':[
   [('ประเทศผู้ผลิต',''),'สวิตเซอร์แลนด์ 🇨🇭','เกาหลี 🇰🇷','เกาหลี 🇰🇷'],
   [('ราคา / ซี่',''),('1,600,000₩','good'),'1,000,000₩',('800,000₩','good')],
   [('งานวิจัยรองรับ',''),('อันดับ 1 ของโลก ข้อมูลกว่า 60 ปี','good'),'ข้อมูลคลินิกแน่นในเกาหลี','จำนวนเคสมากที่สุดในเกาหลี'],
   [('ความเร็วยึดติดกระดูก',''),('เร็วที่สุด (Roxolid + SLActive)','good'),'เร็ว','มาตรฐาน'],
   [('เหมาะกับ',''),'กระดูกบาง คนสูบบุหรี่ เบาหวาน ฟันหน้า','สมดุลราคากับคุณภาพ','กระดูกแข็งแรง ฟันกราม เน้นประหยัด'],
  ]},
 {'type':'cards','alt':True,'label':'เทคนิคขั้นสูง','h2':'การรักษารากเทียมขั้นสูง ทำได้ครบในโรงพยาบาล',
  'cards':[
   {'icon':'fas fa-crosshairs','t':'ผ่าตัดนำวิถี 3D','d':'ฝังรากเทียมด้วยไกด์ 3 มิติ (+100,000–300,000₩) — แผลเล็ก แม่นยำแม้ใกล้เส้นประสาทและโพรงไซนัส'},
   {'icon':'fas fa-bolt','t':'ใส่ฟันทันที (Immediate Loading)','d':'เคสที่เหมาะสม: ถอนฟัน ฝังราก ใส่ฟันชั่วคราว จบใน 1 วัน — ไม่ต้องเดินยิ้มแบบฟันหลอ'},
   {'icon':'fas fa-teeth-open','t':'บูรณะทั้งขากรรไกร','d':'ฟันหายเกือบหมด? สะพานฟันติดแน่นทั้งปากบนรากเทียม หรือฟันปลอมคร่อมรากเทียม (2 ล้าน₩/ขากรรไกร + ราก)'},
   {'icon':'fas fa-rotate','t':'แก้รากเทียมที่ล้มเหลว','d':'รากเทียมที่ทำที่อื่นแล้วหลุดหรือติดเชื้อ — ทีมศัลยกรรมถอดออก ปลูกกระดูกใหม่ และฝังใหม่ให้'},
   {'icon':'fas fa-moon','t':'ฝังรากเทียมแบบหลับ','d':'ยาระงับความรู้สึกทางหลอดเลือด (200,000₩) + มอนิเตอร์ชีพจร — คนไข้ส่วนใหญ่จำอะไรไม่ได้เลย'},
   {'icon':'fas fa-calendar-check','t':'ฝังรากเทียมวันหยุดได้','d':'เปิด 365 วัน — มีคิวผ่าตัดเสาร์ อาทิตย์ วันหยุดนักขัตฤกษ์ ไม่ต้องลางานก็ทำฟันได้'},
  ]},
 {'type':'steps','label':'การดูแลหลังฝัง','h2':'ดูแลระยะยาวหลังฝังรากเทียม',
  'steps':[
   {'t':'สัปดาห์แรก','time':'วันที่ 1–7','d':'บวมเล็กน้อยเป็นเรื่องปกติ กินอาหารอ่อน กินยาตามแพทย์สั่ง ห้ามสูบบุหรี่เด็ดขาด — บุหรี่คือสาเหตุอันดับ 1 ที่ทำให้รากเทียมล้มเหลว'},
   {'t':'ตัดไหม & ตรวจ','time':'~2 สัปดาห์','d':'มาโรงพยาบาลสั้นๆ เพื่อเช็คการหายของแผล อาการไม่สบายส่วนใหญ่หายไปแล้วในช่วงนี้'},
   {'t':'บำรุงรักษาประจำ','time':'ทุก 6 เดือน','d':'ทำความสะอาดรอบรากเทียม + เช็คการสบฟัน — ป้องกันโรครอบรากเทียมคือกุญแจให้ใช้ได้เกิน 20 ปี'},
   {'t':'เวชระเบียนตลอดชีพ','time':'ทุกเมื่อ','d':'บันทึกการผ่าตัด รุ่นรากเทียม ฟิล์มเอกซเรย์ พร้อมให้เสมอ — กลับไทยก็ส่งต่อหมอฟันที่บ้านได้'},
  ]},
]

EXTRA['/th/pricing'] = [
 {'type':'cards','label':'ทำไมราคานี้?','h2':'3 เหตุผลที่ราคาดีโดยคุณภาพไม่ลด',
  'cards':[
   {'icon':'fas fa-gears','t':'แล็บดิจิทัลในโรงพยาบาล','d':'ครอบฟันและฟันปลอมผลิตที่แล็บชั้น 2 ของเราเอง — ไม่มีค่าคนกลางแล็บนอก ครอบเซอร์โคเนีย 550,000₩ จึงเป็นไปได้'},
   {'icon':'fas fa-chart-line','t':'ขนาดใหญ่ = ต้นทุนต่อเคสต่ำ','d':'โรงพยาบาล 1,300㎡ รายได้ 12,000 ล้าน₩/ปี — ซื้อวัสดุจำนวนมาก + แบ่งงานเฉพาะทาง ทำให้ต้นทุนต่อเคสถูกลง'},
   {'icon':'fas fa-handshake-slash','t':'ไม่มีนายหน้า','d':'จองตรงกับโรงพยาบาล ไม่ผ่านเอเจนซี่ — ค่าคอมมิชชั่น (ปกติ 20–30%) กลายเป็นส่วนลดให้คนไข้แทน'},
  ]},
 {'type':'faq','alt':True,'label':'เคล็ดลับประหยัด','h2':'ถาม-ตอบ: ประหยัดค่ารักษาอย่างฉลาด',
  'faqs':[
   ('มีประกันสุขภาพเกาหลี (NHIS) ลดอะไรได้บ้าง?','ถ้าทำงานถูกกฎหมาย (วีซ่า E-9, E-7 ฯลฯ) และเข้าระบบ NHIS: ขูดหินปูนปีละครั้งจ่ายแค่ ~15,000–20,000₩ ถอนฟัน รักษาเหงือก ตรวจปวดฟัน ก็ใช้ราคาประกันได้ อย่าลืมพกบัตรต่างด้าว (외국인등록증)'),
   ('จ่ายเงินยังไงได้บ้าง?','เงินสด (วอน) บัตรเครดิต VISA/Master และบัตรเดบิตเกาหลี สำหรับแผนรักษาใหญ่ (รากเทียมหลายซี่ จัดฟัน) สามารถแบ่งจ่ายตามขั้นตอนการรักษาได้ — สอบถามที่เคาน์เตอร์'),
   ('ขอใบเสนอราคาก่อนรักษาได้ไหม?','ได้ หลังเอกซเรย์พาโนรามาฟรีในการตรวจครั้งแรก คุณจะได้ใบราคาแยกรายการก่อนเริ่มรักษา — ไม่มีค่าใช้จ่ายแอบแฝง'),
   ('รักษาหลายซี่พร้อมกันถูกกว่าไหม?','แผนรักษาแบบรวมมักคุ้มกว่าทำทีละซี่ — ลางานน้อยครั้งกว่า และได้คำปรึกษาแพ็กเกจที่คุ้มที่สุด'),
   ('ราคาจะขึ้นกลางทางไหม?','ราคาที่แจ้งคงที่ จะมีเพิ่มเฉพาะกรณีต้องปลูกกระดูก (300,000–500,000₩) หรือยกไซนัส (500,000–1,000,000₩) ซึ่งจะอธิบายและขอความยินยอมก่อนทำเสมอ'),
  ]},
]

EXTRA['/th/directions'] = [
 {'type':'steps','label':'เมื่อมาถึง','h2':'ถึงโรงพยาบาลแล้ว — ขั้นตอนต้อนรับ',
  'steps':[
   {'t':'จอดรถหรือลงแท็กซี่','time':'0 นาที','d':'ลานจอดรถใต้ดินฟรี (จำกัดความสูง 2.1 ม.) ขึ้นลิฟต์มาที่เคาน์เตอร์ชั้น 1'},
   {'t':'ลงทะเบียนชั้น 1','time':'2 นาที','d':'แสดงพาสปอร์ตหรือบัตรต่างด้าว บอกว่า "คนไทยค่ะ/ครับ" — เจ้าหน้าที่จะใช้แอปแปลภาษาช่วยเหลือคุณ'},
   {'t':'ขึ้นชั้นที่รักษา','time':'1 นาที','d':'ชั้น 1 จัดฟัน ชั้น 3 ตรวจฟัน&เด็ก ชั้น 4 ผ่าตัดรากเทียม ชั้น 5 รักษาทั่วไป — มีเจ้าหน้าที่พาไป'},
   {'t':'หลังรักษาเสร็จ','time':'—','d':'จ่ายเงินและนัดครั้งถัดไปที่เคาน์เตอร์ชั้นเดียวกัน ขอใบเสร็จแยกรายการได้'},
  ]},
 {'type':'info','alt':True,'label':'จุดสังเกต','h2':'บอกคนขับแท็กซี่ด้วยจุดสังเกตเหล่านี้','rows':[
   {'k':'ป้ายรถเมล์','v':'พุลดังจูกง 5-ดันจี (불당주공5단지) — เดิน 1 นาที','gold':True},
   {'k':'ย่าน','v':'เมืองใหม่พุลดัง-ดง — ถนนคาเฟ่&ช้อปปิ้งใจกลางชอนัน'},
   {'k':'สถานี KTX','v':'สถานีชอนัน-อาซาน (천안아산역) — แท็กซี่ 10 นาที'},
   {'k':'จากนิคมอาซาน / ทังจอง','v':'ขับรถประมาณ 15–25 นาที — แวะได้หลังเลิกกะหรือวันหยุดสุดสัปดาห์'},
 ]},
]

# ═══════════════════════════════ RU ═══════════════════════════════
# Аудитория: работники из России/СНГ в промзоне Чхонан–Асан, семьи

EXTRA['/ru/'] = [
 {'type':'cards','label':'Путеводитель по этажам','h2':'5 этажей — каждый является специализированным центром','grid':'iv2-grid--3',
  'desc':'Всё в одном здании — каждый этаж работает как отдельная профильная клиника.',
  'cards':[
   {'icon':'fas fa-teeth','t':'1 этаж · Центр ортодонтии Invisalign','d':'Этаж, полностью посвящённый исправлению прикуса: цифровые сканеры и кабинеты консультаций ClinCheck.'},
   {'icon':'fas fa-gears','t':'2 этаж · Цифровая лаборатория и центр гигиены','d':'Собственная зуботехническая лаборатория — коронки и протезы изготавливаются на месте, без наценки сторонних лабораторий.'},
   {'icon':'fas fa-child','t':'3 этаж · Центр диагностики BDX и детская стоматология','d':'Комплексные программы обследования + детская игровая зона, 3 детских стоматолога-специалиста.'},
   {'icon':'fas fa-tooth','t':'4 этаж · Центр имплантации','d':'6 отдельных операционных + 2 палаты восстановления, система инфекционного контроля air-shower.'},
   {'icon':'fas fa-hospital-user','t':'5 этаж · Центр общего лечения','d':'Пломбы, лечение каналов, дёсны, зубы мудрости, экстренная помощь — все направления под одной крышей.'},
   {'icon':'fas fa-shield-virus','t':'Инфекционный контроль уровня университетской клиники','d':'Air-shower на входе в хирургические этажи, индивидуальные наборы инструментов, центральная стерилизация — с открытия в 2021 году.'},
  ]},
 {'type':'cards','alt':True,'label':'Для всей семьи','h2':'Забота о каждом возрасте — от детей до бабушек и дедушек',
  'cards':[
   {'icon':'fas fa-baby','t':'3 детских стоматолога-специалиста','d':'Сертифицированные детские врачи, игровая зона и закись азота / седация для тревожных детей. Детские пломбы 30 000–100 000₩.'},
   {'icon':'fas fa-bed','t':'Лечение во сне (седация)','d':'Закись азота и внутривенная седация при страхе перед стоматологом — имплантация и удаление зубов мудрости «во сне» под мониторингом.'},
   {'icon':'fas fa-tooth','t':'Зубы мудрости и сложные удаления','d':'Ретинированные и сложные зубы мудрости удаляет наша хирургическая команда — направление в другую больницу не требуется.'},
   {'icon':'fas fa-user-group','t':'Пожилые пациенты и протезы','d':'Полные и частичные съёмные протезы (1,5 млн₩/челюсть), протезы на имплантатах (2 млн₩/челюсть), бережный подход к пожилым.'},
  ]},
]

EXTRA['/ru/implant'] = [
 {'type':'compare','label':'Сравнение имплантатов','h2':'Straumann или Osstem — какой имплантат подходит вам?',
  'head':['','Straumann BLX','Osstem SOI','Osstem CA'],
  'rows':[
   [('Страна',''),'Швейцария 🇨🇭','Корея 🇰🇷','Корея 🇰🇷'],
   [('Цена / зуб',''),('1 600 000₩','good'),'1 000 000₩',('800 000₩','good')],
   [('Научная база',''),('№1 в мире, более 60 лет данных','good'),'Сильные клинические данные в Корее','Наибольшее число случаев в Корее'],
   [('Скорость остеоинтеграции',''),('Самая быстрая (Roxolid + SLActive)','good'),'Быстрая','Стандартная'],
   [('Кому подходит',''),'Слабая кость, курильщики, диабет, передние зубы','Баланс цены и качества','Здоровая кость, жевательные зубы, экономия'],
  ]},
 {'type':'cards','alt':True,'label':'Продвинутые методики','h2':'Сложная имплантация — всё делаем у себя',
  'cards':[
   {'icon':'fas fa-crosshairs','t':'Навигационная хирургия','d':'Имплантация по 3D-шаблону (+100 000–300 000₩) — минимальный разрез, точность рядом с нервами и гайморовой пазухой.'},
   {'icon':'fas fa-bolt','t':'Немедленная нагрузка','d':'В подходящих случаях: удаление, имплантат и временная коронка за один день — уходите с зубом, а не с дыркой.'},
   {'icon':'fas fa-teeth-open','t':'Полное восстановление челюсти','d':'Потеряли большинство зубов? Несъёмные мосты на имплантатах или условно-съёмные протезы (2 млн₩/челюсть + имплантаты).'},
   {'icon':'fas fa-rotate','t':'Переделка неудачных имплантатов','d':'Имплантат, установленный в другом месте, не прижился или воспалился — удалим, восстановим кость и установим заново.'},
   {'icon':'fas fa-moon','t':'Имплантация под седацией','d':'Внутривенная седация (200 000₩) с мониторингом показателей — большинство пациентов не помнят операцию.'},
   {'icon':'fas fa-calendar-check','t':'Имплантация в выходные','d':'Работаем 365 дней в году — операции в субботу, воскресенье и праздники. Не нужно отпрашиваться с работы.'},
  ]},
 {'type':'steps','label':'Уход после операции','h2':'Долгосрочный уход после имплантации',
  'steps':[
   {'t':'Первая неделя','time':'День 1–7','d':'Небольшой отёк — это нормально. Мягкая пища, антибиотики по назначению, никакого курения — курение — причина №1 ранней потери имплантата.'},
   {'t':'Снятие швов и осмотр','time':'~2 недели','d':'Короткий визит для контроля заживления. К этому моменту дискомфорт обычно проходит.'},
   {'t':'Регулярное обслуживание','time':'Каждые 6 месяцев','d':'Профессиональная чистка вокруг имплантата и проверка прикуса — профилактика периимплантита позволяет имплантату служить 20+ лет.'},
   {'t':'Документы на всю жизнь','time':'В любой момент','d':'Полная история операции, модель имплантата и снимки — выдадим при переезде или возвращении домой.'},
  ]},
]

EXTRA['/ru/pricing'] = [
 {'type':'cards','label':'Почему такие цены?','h2':'3 причины низких цен без потери качества',
  'cards':[
   {'icon':'fas fa-gears','t':'Собственная цифровая лаборатория','d':'Коронки и протезы изготавливаются в нашей лаборатории на 2 этаже — ноль наценки сторонних лабораторий. Поэтому циркониевая коронка стоит 550 000₩.'},
   {'icon':'fas fa-chart-line','t':'Эффект масштаба','d':'Клиника площадью 1 300 м² с оборотом 12 млрд₩ в год — оптовые закупки материалов и разделение труда снижают себестоимость каждого случая.'},
   {'icon':'fas fa-handshake-slash','t':'Без посредников','d':'Запись напрямую, без медицинских агентств — комиссия посредников (обычно 20–30%) остаётся в вашем кармане.'},
  ]},
 {'type':'faq','alt':True,'label':'Как сэкономить','h2':'Вопросы и ответы: разумная экономия на лечении',
  'faqs':[
   ('У меня есть корейская медстраховка (NHIS) — что она покрывает?','Если вы работаете легально (виза E-9, E-7 и др.) и застрахованы в NHIS: чистка зубного камня раз в год — всего ~15 000–20 000₩, удаление зубов, лечение дёсен и осмотр при боли — по страховым тарифам. Пациентам 65+ со страховкой доступны субсидии на имплантаты и протезы. Возьмите карту регистрации иностранца.'),
   ('Как можно оплатить?','Наличные (воны), корейские карты, VISA/MasterCard. Для крупных планов лечения (несколько имплантатов, ортодонтия) возможна поэтапная оплата по ходу лечения — уточните на ресепшене.'),
   ('Можно узнать стоимость до начала лечения?','Да. После бесплатного панорамного снимка на первом приёме вы получите смету с разбивкой по пунктам до начала лечения — скрытых платежей нет.'),
   ('Выгоднее лечить несколько зубов сразу?','Комплексный план лечения обычно выгоднее, чем лечить по одному зубу — меньше отгулов с работы и оптимальный пакет по цене.'),
   ('Могут ли цены вырасти в процессе?','Опубликованные цены стабильны. Доплата возможна только при необходимости костной пластики (300 000–500 000₩) или синус-лифтинга (500 000–1 000 000₩) — всегда с объяснением и вашего согласия до процедуры.'),
  ]},
]

EXTRA['/ru/directions'] = [
 {'type':'steps','label':'По прибытии','h2':'Вы приехали — как проходит приём',
  'steps':[
   {'t':'Парковка или выход из такси','time':'0 мин','d':'Бесплатная подземная парковка (ограничение высоты 2,1 м). Лифт до ресепшена на 1 этаже.'},
   {'t':'Регистрация на 1 этаже','time':'2 мин','d':'Покажите паспорт или карту регистрации иностранца. Скажите «по-русски, пожалуйста» — сотрудник поможет через приложение-переводчик.'},
   {'t':'Подъём на нужный этаж','time':'1 мин','d':'1 этаж — ортодонтия, 3 — диагностика и дети, 4 — хирургия имплантации, 5 — общее лечение. Вас проводят.'},
   {'t':'После приёма','time':'—','d':'Оплата и запись на следующий визит — на стойке того же этажа. По запросу выдаём детализированный чек.'},
  ]},
 {'type':'info','alt':True,'label':'Ориентиры','h2':'Скажите таксисту эти ориентиры','rows':[
   {'k':'Автобусная остановка','v':'Пульдан Чжугон 5-данчжи (불당주공5단지) — 1 минута пешком','gold':True},
   {'k':'Район','v':'Новый район Пульдан-дон — главная улица кафе и магазинов Чхонана'},
   {'k':'Станция KTX','v':'Чхонан-Асан (천안아산역) — 10 минут на такси'},
   {'k':'Из промзоны Асан / Танчжон','v':'15–25 минут на машине — удобно заехать после смены или в выходные'},
 ]},
]

# ═══════════════════════════ AEO Quick Answers (v5.16) ═══════════════════════════
# 질문형 H2 + 첫 문장 즉답 — AI 검색엔진(ChatGPT/Perplexity/Google AI) 인용 최적화
# 히어로 직후 #quick-answer 박스로 렌더링, speakable 스키마가 이 박스를 지정

QA = {}

# ── EN (국내 거주: 주한미군·주재원) ──
QA['/en/'] = {'q':'Is there an English-speaking dentist near Camp Humphreys and Cheonan?',
 'a':'Yes — <b>Seoul BD Dental</b> in Cheonan (25 min from Camp Humphreys, 10 min from KTX Cheonan-Asan) has <b>15 Seoul National University-trained dentists</b>, English-speaking coordinators, and is open <b>365 days a year</b>. Foreigners pay exactly the same published prices as Korean patients — no "foreigner markup," no broker fees.'}
QA['/en/implant'] = {'q':'How much does a dental implant cost in Korea?',
 'a':'At Seoul BD Dental in Cheonan, a dental implant costs <b>₩800,000–1,600,000 per tooth</b> (about $600–1,200): Osstem CA ₩800K, Osstem SOI ₩1.0M, Straumann BLX ₩1.6M — fixture, abutment and zirconia-line crown included in the quoted plan. Bone graft, if needed, adds ₩300–500K. That is roughly <b>60–75% less than typical US prices</b> ($3,000–5,000).'}
QA['/en/invisalign'] = {'q':'How much is Invisalign in Korea?',
 'a':'Invisalign at Seoul BD Dental starts at <b>₩3,000,000 (Express)</b> and runs to <b>₩7,000,000 (Comprehensive)</b> — roughly half typical US pricing. Treatment is led by SNU-trained orthodontists with 3D ClinCheck simulation, and remote monitoring cuts in-person visits to every 6–10 weeks.'}
QA['/en/laminate'] = {'q':'How much do porcelain veneers cost in Korea?',
 'a':'Porcelain veneers at Seoul BD Dental cost <b>₩600,000–800,000 per tooth</b> (Glownate Light/Premium) — vs $1,500–2,500 in the US. Thanks to the in-house digital lab, a full smile makeover is completed in <b>2–3 visits over 2–3 days</b>, fitting a normal leave schedule.'}
QA['/en/pricing'] = {'q':'How much does dental treatment cost in Korea for foreigners?',
 'a':'Foreigners pay the <b>same published prices as Koreans</b> at Seoul BD Dental: implants ₩800K–1.6M, Invisalign ₩3–7M, veneers ₩600–800K, zirconia crown ₩550K, fillings ₩50–250K, scaling ₩60K (or ~₩15–20K once a year with Korean NHIS). Every plan is itemized in English before treatment starts — no hidden fees.'}
QA['/en/directions'] = {'q':'How do I get to Seoul BD Dental from Camp Humphreys or Seoul?',
 'a':'From <b>Camp Humphreys: about 25–30 min by car</b> (navigate to "서울비디치과" or 14 Buldang 34-gil, Cheonan). From Seoul: <b>KTX to Cheonan-Asan (~35 min)</b>, then a 10-min taxi. Free underground parking on site; the clinic is open 365 days a year.'}
QA['/en/reservation'] = {'q':'How do I book a dental appointment in English in Korea?',
 'a':'Call <b>+82-41-415-2892</b> and say "English please," or send an Instagram DM to <b>@seoul_bddc</b> — an English-speaking coordinator will confirm your appointment. Walk-ins are accepted 365 days a year, but booking ahead means little to no waiting.'}

# ── JP (해외 거주: 의료관광) ──
QA['/jp/dental'] = {'q':'韓国の歯科は日本よりどのくらい安いですか?',
 'a':'ソウルBD歯科(天安)では、インプラント1本<b>80万〜160万₩(約8.7万〜17.4万円)</b>、ジルコニアクラウン55万₩(約6万円)、セラミックベニア60万〜80万₩ — 日本の自由診療の<b>3分の1〜半額程度</b>です。ソウル大出身の歯科医15名、365日診療、日本人価格の上乗せは一切ありません。ソウル駅からKTXで約35分+タクシー10分です。'}
QA['/jp/implant'] = {'q':'韓国でインプラントを受けるといくらかかりますか?',
 'a':'ソウルBD歯科のインプラントは1本<b>80万₩(約8.7万円)〜160万₩(約17.4万円)</b> — オステムCA 80万₩、オステムSOI 100万₩、ストローマンBLX 160万₩。日本の相場(1本40〜60万円)の<b>約3分の1</b>です。手術は独立手術室6室・エアシャワー完備の4Fインプラントセンターで行い、最短2回の訪韓で完了するプランもあります。'}
QA['/jp/invisalign'] = {'q':'韓国でインビザライン矯正は安いですか?',
 'a':'はい。ソウルBD歯科のインビザラインは<b>300万₩(約33万円)〜700万₩(約76万円)</b> — 日本の相場(80〜120万円)より大幅に抑えられます。ソウル大出身の矯正医が3D ClinCheckで治療計画を立て、遠隔モニタリング併用なら来韓は数ヶ月に1回で済みます。'}
QA['/jp/pricing'] = {'q':'韓国の歯科治療費はなぜ安いのですか?',
 'a':'理由は3つ:①院内デジタル技工所(外注マージンゼロ)、②年間120億₩規模のスケールメリット、③医療ツーリズム仲介業者を通さない直接予約(仲介手数料20〜30%カット)。品質はソウル大出身の歯科医15名+大学病院レベルの感染管理で担保 — <b>安かろう悪かろうではありません</b>。'}
QA['/jp/travel-guide'] = {'q':'日本から韓国の歯科に通院するにはどうすればいいですか?',
 'a':'成田・羽田・関空から仁川空港へ(約2〜2.5時間、往復2〜5万円)、仁川からKTXで<b>天安牙山駅まで約1時間</b>、タクシー10分で当院到着。インプラントなら<b>2泊3日×2回</b>、ベニアなら2泊3日×1回が標準プランです。LINE・メールで事前に日本語見積もり→来韓日程を確定できます。'}

# ── CN (해외 거주 + 재한 중국인) ──
QA['/cn/dental'] = {'q':'韩国看牙比中国便宜吗?质量怎么样?',
 'a':'首尔BD牙科(天安)种植牙<b>80万–160万₩(约4,200–8,300元)</b>,全锆冠55万₩(约2,900元) — 与国内一线城市私立诊所相比约省30–50%,且全部由<b>15名首尔大学出身的牙医</b>诊疗,感染管理达大学医院级别。365天开诊,外国人与韩国人同价,无中介加价。'}
QA['/cn/implant'] = {'q':'在韩国种一颗牙多少钱?',
 'a':'首尔BD牙科种植牙每颗<b>80万₩(约4,200元)–160万₩(约8,300元)</b>:奥齿泰CA 80万₩、奥齿泰SOI 100万₩、士卓曼BLX 160万₩。手术在4楼种植中心(6间独立手术室+风淋感染管理)进行,符合条件可<b>即拔即种当天戴牙</b>,最短2次访韩完成全程。'}
QA['/cn/invisalign'] = {'q':'韩国隐适美多少钱?比国内便宜吗?',
 'a':'首尔BD牙科隐适美<b>300万₩(约1.6万元)–700万₩(约3.6万元)</b>,由首尔大学出身正畸医师全程负责,3D ClinCheck方案先看效果再开始。支持远程监控+一次领取多副牙套,在中国也能继续矫正,几个月来韩一次即可。'}
QA['/cn/pricing'] = {'q':'韩国牙科为什么能这么便宜?',
 'a':'三个原因:①2楼自有数字技工所(零外包加价);②年营收120亿₩的规模效应(材料批量采购);③直接预约不经医疗中介(省下20–30%佣金)。质量由15名首尔大学牙医+大学医院级感染管理保证 — <b>便宜不等于将就</b>。支持微信/支付宝付款。'}
QA['/cn/travel-guide'] = {'q':'从中国来韩国看牙怎么安排行程?',
 'a':'北京/上海/广州直飞仁川(2–3.5小时),仁川乘KTX约1小时到<b>天安牙山站</b>,打车10分钟到院。种植牙标准安排:<b>2次访韩,每次2晚3天</b>;贴面/全瓷冠一次3天即可完成。来韩前通过微信发X光片即可收到中文报价,确定后再订机票。'}

# ── VI (국내 거주 근로자·유학생) ──
QA['/vi/'] = {'q':'Ở Cheonan có nha khoa nào tốt cho người Việt không?',
 'a':'Có — <b>Seoul BD Dental</b> ở Buldang-dong, Cheonan (15–25 phút từ KCN Asan/Tangjeong) có <b>15 bác sĩ tốt nghiệp ĐH Quốc gia Seoul</b>, mở cửa <b>365 ngày kể cả cuối tuần</b> — phù hợp người làm ca. Người Việt trả đúng giá niêm yết như người Hàn, dùng được bảo hiểm NHIS, hỗ trợ app phiên dịch.'}
QA['/vi/implant'] = {'q':'Trồng răng implant ở Hàn Quốc giá bao nhiêu?',
 'a':'Tại Seoul BD Dental, implant giá <b>800.000₩–1.600.000₩/răng</b>: Osstem CA 800.000₩, Osstem SOI 1 triệu₩, Straumann BLX 1,6 triệu₩ — đã gồm trụ, khớp nối và kế hoạch mão răng. Ghép xương (nếu cần) thêm 300.000–500.000₩. Có lịch mổ <b>thứ 7, chủ nhật, ngày lễ</b> — không cần xin nghỉ làm.'}
QA['/vi/invisalign'] = {'q':'Niềng răng trong suốt Invisalign ở Hàn Quốc bao nhiêu tiền?',
 'a':'Invisalign tại Seoul BD Dental từ <b>3 triệu₩ (Express) đến 7 triệu₩ (Comprehensive)</b>, do bác sĩ chỉnh nha tốt nghiệp SNU phụ trách với mô phỏng 3D ClinCheck. Theo dõi từ xa qua ảnh điện thoại — chỉ cần đến viện 6–10 tuần/lần, hợp với người đi làm ca.'}
QA['/vi/laminate'] = {'q':'Dán sứ veneer ở Hàn Quốc giá bao nhiêu?',
 'a':'Mặt dán sứ Glownate tại Seoul BD Dental giá <b>600.000–800.000₩/răng</b>, hoàn thành trong <b>2–3 lần hẹn (2–3 ngày)</b> nhờ labo kỹ thuật số ngay trong viện. Mài răng tối thiểu 0,3–0,5mm, bảo hành rõ ràng, giá niêm yết không phát sinh.'}
QA['/vi/pricing'] = {'q':'Chi phí làm răng ở Hàn Quốc cho người nước ngoài là bao nhiêu?',
 'a':'Người nước ngoài trả <b>đúng giá niêm yết như người Hàn</b>: implant 800.000₩–1,6 triệu₩, niềng Invisalign 3–7 triệu₩, dán sứ 600–800.000₩, mão zirconia 550.000₩, trám răng 50.000–250.000₩. Có <b>NHIS</b>: lấy cao răng chỉ ~15.000–20.000₩/năm, nhổ răng và điều trị nha chu cũng được giá bảo hiểm.'}
QA['/vi/directions'] = {'q':'Đường đi đến Seoul BD Dental Cheonan như thế nào?',
 'a':'Địa chỉ: <b>14 Buldang 34-gil, Seobuk-gu, Cheonan</b> (tìm "서울비디치과" trên Naver Map/Kakao Map). Từ ga KTX Cheonan-Asan: taxi 10 phút. Từ KCN Asan/Tangjeong: lái xe 15–25 phút. Trạm buýt "불당주공5단지" cách 1 phút đi bộ. Đỗ xe ngầm miễn phí.'}
QA['/vi/faq'] = {'q':'Người Việt đi khám răng ở Hàn Quốc cần biết gì?',
 'a':'3 điều quan trọng: ① Mang <b>thẻ đăng ký người nước ngoài</b> — có NHIS thì lấy cao răng, nhổ răng, nha chu đều được giá bảo hiểm; ② Viện mở <b>365 ngày</b> (cuối tuần 09:00–13:00) nên không cần xin nghỉ; ③ Giá niêm yết công khai, báo giá chi tiết trước khi điều trị — không lo bị "chém" vì là người nước ngoài.'}

# ── TH (국내 거주 근로자) ──
QA['/th/'] = {'q':'ที่ชอนันมีคลินิกทำฟันที่เหมาะกับคนไทยไหม?',
 'a':'มี — <b>Seoul BD Dental</b> ที่พุลดัง-ดง ชอนัน (15–25 นาทีจากนิคมอาซาน/ทังจอง) มี<b>ทันตแพทย์จบมหาวิทยาลัยแห่งชาติโซล 15 คน</b> เปิด <b>365 วันรวมเสาร์-อาทิตย์</b> เหมาะกับคนทำงานกะ คนไทยจ่ายราคาเดียวกับคนเกาหลีตามป้ายราคา ใช้ประกัน NHIS ได้ มีแอปแปลภาษาช่วย'}
QA['/th/implant'] = {'q':'รากฟันเทียมที่เกาหลีราคาเท่าไหร่?',
 'a':'ที่ Seoul BD Dental รากฟันเทียมซี่ละ <b>800,000₩–1,600,000₩</b>: Osstem CA 800,000₩, Osstem SOI 1 ล้าน₩, Straumann BLX 1.6 ล้าน₩ — รวมรากเทียม ข้อต่อ และแผนครอบฟันแล้ว ปลูกกระดูก (ถ้าจำเป็น) เพิ่ม 300,000–500,000₩ มีคิวผ่าตัด<b>เสาร์ อาทิตย์ วันหยุด</b> — ไม่ต้องลางาน'}
QA['/th/pricing'] = {'q':'ทำฟันที่เกาหลีแพงไหมสำหรับคนต่างชาติ?',
 'a':'ไม่แพงกว่าคนเกาหลี — คนต่างชาติจ่าย<b>ราคาเดียวกับคนเกาหลีตามป้ายราคา</b>: รากฟันเทียม 800,000₩–1.6 ล้าน₩, จัดฟันใส 3–7 ล้าน₩, วีเนียร์ 600,000–800,000₩, ครอบเซอร์โคเนีย 550,000₩, อุดฟัน 50,000–250,000₩ มี <b>NHIS</b>: ขูดหินปูนปีละครั้งแค่ ~15,000–20,000₩'}
QA['/th/directions'] = {'q':'ไป Seoul BD Dental ชอนันยังไง?',
 'a':'ที่อยู่: <b>14 Buldang 34-gil, Seobuk-gu, Cheonan</b> (ค้นหา "서울비디치과" ใน Naver Map/Kakao Map) จากสถานี KTX ชอนัน-อาซาน: แท็กซี่ 10 นาที จากนิคมอาซาน/ทังจอง: ขับรถ 15–25 นาที ป้ายรถเมล์ "불당주공5단지" เดิน 1 นาที มีที่จอดรถใต้ดินฟรี'}

# ── RU (국내 거주 근로자·CIS) ──
QA['/ru/'] = {'q':'Есть ли в Чхонане стоматология для русскоязычных?',
 'a':'Да — <b>Seoul BD Dental</b> в районе Пульдан-дон, Чхонан (15–25 минут от промзоны Асан/Танчжон) с <b>15 врачами из Сеульского национального университета</b>, открыта <b>365 дней в году, включая выходные</b> — удобно для сменной работы. Иностранцы платят по тому же прейскуранту, что и корейцы, принимается страховка NHIS, помогает приложение-переводчик.'}
QA['/ru/implant'] = {'q':'Сколько стоит имплант зуба в Корее?',
 'a':'В Seoul BD Dental имплантация стоит <b>800 000–1 600 000₩ за зуб</b>: Osstem CA 800 000₩, Osstem SOI 1 млн₩, Straumann BLX 1,6 млн₩ — включая имплантат, абатмент и план коронки. Костная пластика (при необходимости) +300 000–500 000₩. Операции проводятся и <b>в субботу, воскресенье, праздники</b> — не нужно отпрашиваться с работы.'}
QA['/ru/pricing'] = {'q':'Дорого ли лечить зубы в Корее иностранцу?',
 'a':'Не дороже, чем корейцам — иностранцы платят <b>по единому опубликованному прейскуранту</b>: импланты 800 000₩–1,6 млн₩, Invisalign 3–7 млн₩, виниры 600 000–800 000₩, циркониевая коронка 550 000₩, пломбы 50 000–250 000₩. Со страховкой <b>NHIS</b> чистка камня раз в год — всего ~15 000–20 000₩.'}
QA['/ru/directions'] = {'q':'Как добраться до Seoul BD Dental в Чхонане?',
 'a':'Адрес: <b>14 Buldang 34-gil, Seobuk-gu, Cheonan</b> (ищите "서울비디치과" в Naver Map / Kakao Map). От вокзала KTX Чхонан-Асан: 10 минут на такси. От промзоны Асан/Танчжон: 15–25 минут на машине. Остановка «Пульдан Чжугон 5-данчжи» — 1 минута пешком. Бесплатная подземная парковка.'}

# ═══════════════════════════════════════════════════════════════════
# v5.16 — JP/CN travel-guide 의료관광 확장 (A그룹 해외 거주 외국인 전용)
# ═══════════════════════════════════════════════════════════════════

EXTRA['/jp/travel-guide'] += [
 {'type':'steps','alt':True,'label':'モデルプラン','h2':'インプラント治療 2泊3日×2回 モデルプラン',
  'desc':'日本からの患者様に最も多い「インプラント2回訪韓プラン」の実際の流れです。ベニア・ジルコニアクラウンなら2泊3日×1回で完了します。',
  'steps':[
   {'t':'【1回目】1日目:来韓・精密検査','time':'Day 1','d':'午前便で仁川着 → KTXで天安牙山駅へ(約1時間) → 午後に3D CT撮影・精密診断・治療計画確定・日本語での費用最終見積もり。ホテルチェックイン後は不当洞グルメ街で夕食。'},
   {'t':'【1回目】2日目:インプラント埋入手術','time':'Day 2','d':'4Fインプラントセンター(独立手術室・エアシャワー完備)で埋入手術。静脈内鎮静(20万₩)選択可 — 眠っている間に終わります。術後はホテルで安静に。'},
   {'t':'【1回目】3日目:術後チェック・帰国','time':'Day 3','d':'午前に消毒・経過確認 → 英文診断書・処置記録をお渡し → 午後便で帰国。抜糸は日本のかかりつけ医でも、写真での遠隔確認でもOK。'},
   {'t':'〜骨結合期間(日本で待機)〜','time':'2〜4ヶ月','d':'日本で通常どおり生活。経過はLINE・メールで写真を送るだけの遠隔フォロー。'},
   {'t':'【2回目】1〜3日目:型取り・上部構造装着','time':'Day 1–3','d':'2回目の訪韓で型取り → 院内技工所が最短翌日にクラウン製作 → 装着・咬合調整して完了。保証書と英文治療記録をお持ち帰りいただきます。'},
  ]},
 {'type':'cards','label':'アクセス詳細','h2':'日本からのアクセス — 飛行機・KTX 完全ガイド',
  'cards':[
   {'icon':'fas fa-plane-departure','t':'日本 → 仁川空港','d':'成田・羽田・関空・中部・福岡から直行便多数(約1.5〜2.5時間)。LCC利用なら往復2〜4万円台。金浦空港着ならソウル駅経由のKTXが便利です。'},
   {'icon':'fas fa-train','t':'仁川空港 → 天安牙山駅','d':'空港からAREXでソウル駅(約50分)→ KTX乗換で天安牙山駅まで約35分。合計約1.5〜2時間、KTX料金は約14,000₩(約1,500円)。'},
   {'icon':'fas fa-taxi','t':'天安牙山駅 → 当院','d':'タクシーで約10分(約8,000₩)。「ソウルBDチカ(서울비디치과)」または「プルダン住公5団地」とお伝えください。'},
   {'icon':'fas fa-mobile-screen','t':'来韓前の準備','d':'LINE/メールでパノラマX線か口腔内写真を送付 → 日本語で概算見積もり → 日程確定後に航空券予約、が最も無駄のない順番です。'},
  ]},
 {'type':'info','alt':True,'label':'宿泊案内','h2':'天安での宿泊 — 当院周辺のおすすめ','rows':[
   {'k':'不当洞エリア','v':'当院徒歩圏のビジネスホテル多数(1泊5万〜9万₩) — 通院に最も便利','gold':True},
   {'k':'天安牙山駅周辺','v':'新世界百貨店直結エリア。KTX利用・ショッピング重視の方に'},
   {'k':'温陽温泉(牙山)','v':'温泉ホテルで湯治滞在も可能(手術直後の入浴は要相談) — タクシー20分'},
   {'k':'予約のコツ','v':'手術日はホテルを当院から近い順で。ご希望あればスタッフが宿泊エリアをご案内します'},
 ]},
]

EXTRA['/cn/travel-guide'] += [
 {'type':'steps','alt':True,'label':'行程模板','h2':'种植牙 2次访韩·每次2晚3天 标准行程',
  'desc':'中国患者最常见的"种植牙两次访韩方案"实际流程。贴面/全瓷冠只需1次3天即可完成。',
  'steps':[
   {'t':'【第1次】第1天:抵韩·精密检查','time':'Day 1','d':'上午航班抵仁川 → KTX到天安牙山站(约1小时) → 下午3D CT拍摄、精密诊断、确定治疗方案、出具中文最终报价。入住酒店后可在佛堂洞美食街用餐。'},
   {'t':'【第1次】第2天:种植体植入手术','time':'Day 2','d':'4楼种植中心(独立手术室+风淋感染管理)进行植入手术。可选静脉镇静(20万₩) — 睡一觉手术就结束了。术后回酒店静养。'},
   {'t':'【第1次】第3天:术后复查·回国','time':'Day 3','d':'上午消毒·确认恢复情况 → 领取英文诊断书·手术记录 → 下午航班回国。拆线可在国内牙科完成,或微信发照片远程确认。'},
   {'t':'〜骨结合期(在国内等待)〜','time':'2–4个月','d':'在国内正常生活工作,恢复情况通过微信发照片远程跟进即可。'},
   {'t':'【第2次】第1–3天:取模·戴牙冠','time':'Day 1–3','d':'第2次访韩取模 → 院内技工所最快次日完成牙冠制作 → 戴牙·调咬合,治疗完成。质保卡与英文病历一并带回。'},
  ]},
 {'type':'cards','label':'交通攻略','h2':'从中国出发 — 航班·KTX 完整交通攻略',
  'cards':[
   {'icon':'fas fa-plane-departure','t':'中国 → 仁川机场','d':'北京、上海、广州、青岛、沈阳、香港等直飞仁川(2–3.5小时),提前订票往返常见1,500–3,500元。威海、青岛出发航程最短。'},
   {'icon':'fas fa-train','t':'仁川机场 → 天安牙山站','d':'机场乘AREX到首尔站(约50分钟)→ 换乘KTX约35分钟到天安牙山站。全程约1.5–2小时,KTX票价约14,000₩(约73元)。'},
   {'icon':'fas fa-taxi','t':'天安牙山站 → 医院','d':'打车约10分钟(约8,000₩)。给司机看"서울비디치과"或"불당주공5단지"即可。'},
   {'icon':'fas fa-mobile-screen','t':'来韩前的准备','d':'微信发送全景X光片或口腔照片 → 收到中文预估报价 → 确定日程后再订机票,这是最省钱省时的顺序。'},
  ]},
 {'type':'info','alt':True,'label':'住宿指南','h2':'天安住宿 — 医院周边推荐','rows':[
   {'k':'佛堂洞一带','v':'医院步行圈内多家商务酒店(每晚5万–9万₩) — 就诊最方便','gold':True},
   {'k':'天安牙山站周边','v':'新世界百货直连区域,适合重视KTX出行和购物的患者'},
   {'k':'温阳温泉(牙山)','v':'可入住温泉酒店边疗养边治疗(术后即刻泡温泉请先咨询医师) — 打车20分钟'},
   {'k':'预订建议','v':'手术日请优先选离医院近的酒店,如有需要工作人员可协助推荐住宿区域'},
 ]},
]
