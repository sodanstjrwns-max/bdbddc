# -*- coding: utf-8 -*-
"""VI content — 주한 베트남 근로자/유학생/결혼이민자 타겟"""
from content_en import HREF_HOME, HREF_IMPLANT, HREF_INVIS, HREF_LAMINATE, HREF_PRICING, HREF_DIRECTIONS

HREF_FAQ = {'ko':'/faq','vi':'/vi/faq'}

LANG_CFG = {
    'home': '/vi/',
    'nav': [('Trang chủ','/vi/'),('Implant','/vi/implant'),('Invisalign','/vi/invisalign'),
            ('Dán sứ','/vi/laminate'),('Bảng giá','/vi/pricing'),('Đường đi','/vi/directions'),
            ('FAQ','/vi/faq'),('Đặt lịch','/reservation')],
}

CTA_VI = {'type':'cta','bare':True,'id':'contact',
    't':'Đặt Lịch Khám Ngay','d':'Hỗ trợ app dịch thuật · Giá như người Hàn · Không qua môi giới',
    'channels':[
        {'href':'tel:+82-41-415-2892','icon':'fas fa-phone','t':'Gọi điện','d':'+82-41-415-2892 · 9h–20h'},
        {'href':'/reservation','icon':'fas fa-calendar-check','t':'Đặt lịch online','d':'bdbddc.com/reservation'},
        {'href':'https://www.instagram.com/seoul_bddc','icon':'fab fa-instagram','t':'Instagram DM','d':'@seoul_bddc','ext':True},
        {'href':'https://maps.google.com/?q=Seoul+BD+Dental+Cheonan','icon':'fas fa-map-marker-alt','t':'Google Maps','d':'Seoul BD Dental, Cheonan','ext':True},
    ]}

HOURS_VI = {'type':'info','alt':True,'label':'Giờ mở cửa','h2':'Mở Cửa 365 Ngày/Năm','rows':[
    {'k':'Thứ 2 – Thứ 6','v':'09:00 – 20:00 (khám tối đến 8 giờ)','gold':True},
    {'k':'Thứ 7 / CN / Ngày lễ','v':'09:00 – 13:00'},
    {'k':'Nghỉ trưa (ngày thường)','v':'12:30 – 14:00'},
    {'k':'Ngày nghỉ','v':'KHÔNG CÓ — mở cửa 365 ngày','gold':True},
]}

PAGES = []

# ─────────────────────────────── /vi/ (index)
PAGES.append({
'path':'vi/index.html','lang':'vi','html_lang':'vi','canonical':'/vi/','hreflang':HREF_HOME,
'title':'Nha Khoa Cheonan Cho Người Việt — 15 Bác Sĩ ĐH Quốc Gia Seoul, Giá Như Người Hàn | Seoul BD Dental',
'desc':'Nha khoa lớn nhất Cheonan thân thiện với người Việt Nam: 15 bác sĩ tốt nghiệp ĐH Quốc gia Seoul, 6 phòng phẫu thuật, mở cửa 365 ngày đến 20h. Implant 800.000₩–1,6 triệu₩, Invisalign, dán sứ. Giá như người Hàn — KHÔNG môi giới. Có bảo hiểm y tế Hàn Quốc (NHIS). ☎ +82-41-415-2892',
'breadcrumb':[('Trang chủ','/'),('Tiếng Việt','/vi/')],
'hero':{'badge':'🇻🇳 Thân thiện với người Việt · Không môi giới',
 'h1':'Nha Khoa Lớn Nhất Cheonan,<br>Chào Đón Cộng Đồng Người Việt',
 'sub':'15 bác sĩ tốt nghiệp Đại học Quốc gia Seoul · 6 phòng phẫu thuật độc lập · Mở cửa 365 ngày, ngày thường đến 20h. Bạn trả đúng giá niêm yết như người Hàn — không trung gian, không phụ phí.',
 'ctas':[{'t':'Gọi +82-41-415-2892','href':'tel:+82-41-415-2892','icon':'fas fa-phone'},
         {'t':'Xem bảng giá','href':'/vi/pricing','icon':'fas fa-won-sign','style':'ghost'}],
 'stats':[('15','Bác sĩ SNU'),('6','Phòng phẫu thuật'),('365','Ngày mở cửa'),('1.322㎡','Cơ sở (400py)')]},
'sections':[
 {'type':'cards','label':'Vì sao chọn chúng tôi','h2':'Vì Sao Người Việt Chọn Seoul BD Dental',
  'desc':'Hệ thống điều trị giống Bệnh viện Nha khoa ĐH Quốc gia Seoul — ngay tại Cheonan, với giá địa phương.',
  'cards':[
   {'icon':'fas fa-user-doctor','t':'15 Bác Sĩ ĐH Quốc Gia Seoul','d':'Tất cả bác sĩ đều tốt nghiệp ĐH Quốc gia Seoul — trường nha khoa số 1 Hàn Quốc. Mỗi điều trị do đúng chuyên khoa phụ trách: phẫu thuật implant, chỉnh nha, phục hình răng.'},
   {'icon':'fas fa-hospital','t':'Cơ Sở 400py Chuẩn Bệnh Viện','d':'Nha khoa lớn nhất Cheonan: 5 tầng phân theo chuyên khoa, 6 phòng phẫu thuật độc lập, hệ thống air-shower kiểm soát nhiễm khuẩn như bệnh viện đại học.'},
   {'icon':'fas fa-won-sign','t':'Không Phí Môi Giới','d':'Nhiều nơi tính giá người nước ngoài cao hơn 20–50% qua "cò môi giới". Ở đây, bạn đặt lịch trực tiếp và trả đúng giá niêm yết như người Hàn.'},
   {'icon':'fas fa-id-card','t':'Dùng Được Bảo Hiểm Y Tế (NHIS)','d':'Có bảo hiểm y tế Hàn Quốc? Lấy cao răng, nhổ răng, điều trị tủy... được bảo hiểm hỗ trợ giống người Hàn. Nhân viên hướng dẫn tận tình.'},
  ]},
 {'type':'banner','alt':True,'center':True,'html':'<b>🇻🇳 Gửi cộng đồng người Việt tại Cheonan – Asan – Pyeongtaek:</b> nhiều anh chị em công nhân, du học sinh và gia đình Việt – Hàn đã tin tưởng điều trị tại đây. Không cần giỏi tiếng Hàn — chúng tôi hỗ trợ app dịch thuật trong suốt quá trình khám, và có tài liệu giải thích bằng tiếng Việt cho các điều trị chính.'},
 {'type':'cards','label':'Dịch vụ','h2':'Các Điều Trị Chính','grid':'iv2-grid',
  'cards':[
   {'icon':'fas fa-tooth','t':'Cấy Ghép Implant','href':'/vi/implant','more':'Chi tiết & giá →','d':'800.000₩–1,6 triệu₩/răng. Trụ Straumann & Osstem, phẫu thuật định vị 3D, 6 phòng phẫu thuật riêng, có gây mê tĩnh mạch.'},
   {'icon':'fas fa-teeth','t':'Invisalign (Niềng Trong Suốt)','href':'/vi/invisalign','more':'Chi tiết & giá →','d':'Từ 3 triệu₩. Bác sĩ chỉnh nha SNU, mô phỏng 3D ClinCheck, lịch tái khám 8–12 tuần/lần phù hợp người đi làm.'},
   {'icon':'fas fa-sparkles','t':'Dán Sứ Glownate','href':'/vi/laminate','more':'Chi tiết & giá →','d':'Từ 600.000₩/răng. Dán sứ cao cấp mài răng tối thiểu — hoàn thành trong 2–3 ngày.'},
   {'icon':'fas fa-teeth-open','t':'Nha Khoa Tổng Quát & Cấp Cứu','href':'/vi/pricing','more':'Xem bảng giá →','d':'Trám răng, nhổ răng khôn, điều trị tủy, viêm nướu, bọc sứ, tẩy trắng, lấy cao răng — đến trực tiếp không cần hẹn, mở cửa mỗi ngày.'},
  ]},
 {'type':'steps','alt':True,'label':'Quy trình','h2':'Lần Khám Đầu Tiên — 4 Bước',
  'steps':[
   {'t':'Liên hệ','time':'1 phút','d':'Gọi điện, đặt online, hoặc nhắn Instagram. Có thể nhắn bằng tiếng Việt — chúng tôi dùng app dịch để trả lời.'},
   {'t':'Khám & chụp phim 3D','time':'Ngày 1 · ~30 phút','d':'Chụp X-quang toàn cảnh và CT 3D ngay trong buổi khám. Bác sĩ chuyên khoa giải thích các lựa chọn và chi phí chính xác trước khi bắt đầu.'},
   {'t':'Kế hoạch điều trị & báo giá','time':'Cùng ngày','d':'Bạn nhận báo giá chi tiết bằng văn bản — đúng bảng giá người Hàn xem. Không phí ẩn.'},
   {'t':'Bắt đầu điều trị','time':'Cùng ngày hoặc theo hẹn','d':'Điều trị đơn giản (lấy cao răng, trám) xong trong 1 buổi. Implant: 2–3 buổi. Dán sứ: 2–3 ngày.'},
  ]},
 HOURS_VI,
 {'type':'cards','label':'Đường đi','h2':'Cách Đến Nha Khoa',
  'cards':[
   {'icon':'fas fa-train','t':'Từ ga KTX Cheonan-Asan','d':'Taxi 10 phút (~8.000₩). Đưa tài xế xem: 천안 불당동 서울비디치과.'},
   {'icon':'fas fa-bus','t':'Xe buýt nội thành','d':'Trạm "Buldang Jugong 5-danji" (불당주공5단지) — đi bộ 1 phút. Nhiều tuyến từ ga Cheonan và bến xe Cheonan.'},
   {'icon':'fas fa-car','t':'Ô tô / đỗ xe','d':'Bãi đỗ xe ngầm miễn phí trong tòa nhà. GPS: 충남 천안시 서북구 불당34길 14.'},
  ]},
 {'type':'faq','alt':True,'label':'FAQ','h2':'Câu Hỏi Thường Gặp',
  'faqs':[
   ('Nha khoa có nhân viên nói tiếng Việt không?','Hiện tại chúng tôi hỗ trợ bằng tiếng Anh cơ bản và app dịch thuật (Papago/Google) — nhiều bệnh nhân Việt đã điều trị thuận lợi theo cách này. Với ca phức tạp, kế hoạch điều trị được chuẩn bị bằng văn bản để bạn dịch và xem lại thoải mái.'),
   ('Chi phí implant là bao nhiêu?','800.000₩–1.600.000₩/răng tùy loại trụ (Osstem CA 800.000₩, Osstem SOI 1 triệu₩, Straumann BLX 1,6 triệu₩). Ghép xương nếu cần: 300.000–500.000₩. Người nước ngoài trả cùng giá với người Hàn.'),
   ('Tôi có bảo hiểm y tế Hàn Quốc (건강보험), dùng được không?','Được. Lấy cao răng (1 lần/năm ~15.000–20.000₩), nhổ răng, điều trị tủy, chụp X-quang... được bảo hiểm hỗ trợ giống hệt người Hàn. Mang thẻ ARC khi đến khám.'),
   ('Không có bảo hiểm thì sao?','Vẫn khám bình thường theo giá không bảo hiểm niêm yết (ví dụ lấy cao răng 60.000₩) và nhận hóa đơn chi tiết. Không có bất kỳ phụ phí nào cho người nước ngoài.'),
   ('Có cần đặt lịch trước không?','Đến trực tiếp cũng được — mở cửa 365 ngày. Nhưng đặt trước sẽ gần như không phải chờ. Gọi +82-41-415-2892 hoặc đặt online.'),
   ('Chủ nhật có làm việc không?','Có — thứ 7, chủ nhật và ngày lễ đều mở cửa 09:00–13:00. Ngày thường mở đến 20:00, rất tiện cho người đi làm ca.'),
  ]},
 CTA_VI,
]})

# ─────────────────────────────── /vi/implant
PAGES.append({
'path':'vi/implant.html','lang':'vi','html_lang':'vi','canonical':'/vi/implant','hreflang':HREF_IMPLANT,
'title':'Cấy Ghép Implant Tại Hàn Quốc — 800.000₩–1,6 Triệu₩/Răng, Straumann & Osstem | Seoul BD Dental Cheonan',
'desc':'Cấy ghép implant tại Cheonan cho người Việt: Osstem từ 800.000₩, Straumann BLX 1.600.000₩/răng. 6 phòng phẫu thuật riêng, phẫu thuật định vị 3D, gây mê tĩnh mạch. Giá như người Hàn, báo giá bằng văn bản. Mở cửa 365 ngày.',
'breadcrumb':[('Trang chủ','/'),('Tiếng Việt','/vi/'),('Implant','/vi/implant')],
'hero':{'badge':'🦷 Trung Tâm Implant · 6 Phòng Phẫu Thuật Riêng',
 'h1':'Implant Với Giá Địa Phương Hàn Quốc',
 'sub':'Trụ implant hàng đầu thế giới (Straumann, Osstem), phẫu thuật định vị 3D, kiểm soát nhiễm khuẩn chuẩn bệnh viện đại học — từ 800.000₩/răng, minh bạch và đúng giá người Hàn trả.',
 'ctas':[{'t':'Gọi tư vấn','href':'tel:+82-41-415-2892','icon':'fas fa-phone'},
         {'t':'Bảng giá đầy đủ','href':'/vi/pricing','icon':'fas fa-won-sign','style':'ghost'}],
 'stats':[('6','Phòng phẫu thuật'),('3D','CT & Định vị'),('800.000₩','Giá khởi điểm'),('10 năm+','Chăm sóc bảo hành')]},
'sections':[
 {'type':'price','label':'Bảng giá','h2':'Giá Implant (Mỗi Răng)','desc':'Giá niêm yết công khai — đúng bảng giá người Hàn xem. Đã gồm VAT.',
  'head':['Trụ / Thủ thuật','Giá','Ghi chú'],
  'rows':[
   {'group':'Trụ implant (mỗi răng)'},
   {'item':'Straumann BLX (Thụy Sĩ)','badge':'PREMIUM','price':'1.600.000₩','note':'Trụ Thụy Sĩ chính hãng — thương hiệu số 1 thế giới','hl':True},
   {'item':'Osstem SOI','price':'1.000.000₩','note':'Dòng cao cấp Hàn Quốc'},
   {'item':'Osstem CA','price':'800.000₩','note':'Dòng tiêu chuẩn Hàn Quốc — độ tin cậy cao'},
   {'group':'Thủ thuật bổ sung (nếu cần)'},
   {'item':'Phẫu thuật không lật vạt / định vị 3D','price':'100.000–300.000₩','note':'Ít sưng, hồi phục nhanh'},
   {'item':'Ghép xương đơn giản','price':'300.000₩','note':''},
   {'item':'Ghép xương phức tạp','price':'500.000₩','note':''},
   {'item':'Nâng xoang (đơn giản / phức tạp)','price':'500.000₩ / 1 triệu₩','note':'Vùng răng hàm trên'},
   {'item':'Gây mê tĩnh mạch','price':'200.000₩','note':'Ngủ trong suốt ca phẫu thuật'},
  ],
  'notes':['Chi phí chính xác được xác nhận sau khi chụp CT 3D ở buổi khám đầu — bạn nhận báo giá chi tiết bằng văn bản trước khi điều trị.',
           'Không bao giờ tính thêm phí vì bạn là người nước ngoài.']},
 {'type':'cards','alt':True,'label':'Điểm khác biệt','h2':'Trung Tâm Implant Của Chúng Tôi Khác Gì?',
  'cards':[
   {'icon':'fas fa-door-closed','t':'6 Phòng Phẫu Thuật Độc Lập','d':'Phẫu thuật implant diễn ra trong phòng mổ vô trùng riêng có air-shower — không phải ghế khám chung.'},
   {'icon':'fas fa-crosshairs','t':'Phẫu Thuật Định Vị 3D','d':'Lập kế hoạch CT 3D + máng hướng dẫn phẫu thuật đặt trụ chính xác vị trí. An toàn hơn với dây thần kinh và xoang hàm, rạch tối thiểu.'},
   {'icon':'fas fa-user-doctor','t':'Phân Công Theo Chuyên Khoa','d':'Bác sĩ phẫu thuật đặt trụ; bác sĩ phục hình thiết kế mão răng. Mô hình bệnh viện ĐHQG Seoul áp dụng cho mọi ca.'},
   {'icon':'fas fa-shield-heart','t':'Chăm Sóc Dài Hạn','d':'Tái khám định kỳ sau khi gắn răng. Nếu bạn về nước hoặc chuyển vùng, chúng tôi bàn giao hồ sơ đầy đủ.'},
  ]},
 {'type':'steps','label':'Lộ trình','h2':'Lộ Trình Điều Trị Implant',
  'steps':[
   {'t':'Khám + CT 3D','time':'Ngày 1','d':'Chụp phim, chẩn đoán, tư vấn loại trụ và báo giá bằng văn bản trong 1 buổi (~60 phút).'},
   {'t':'Đặt trụ implant','time':'Buổi 2 · 30–60 phút','d':'Phẫu thuật định vị dưới gây tê tại chỗ (có thể chọn gây mê tĩnh mạch). Hầu hết bệnh nhân đi làm lại ngày hôm sau.'},
   {'t':'Giai đoạn lành xương','time':'2–4 tháng','d':'Trụ tích hợp với xương. Răng tạm được gắn ở vùng thẩm mỹ. Lịch tái khám linh hoạt theo ca làm việc của bạn.'},
   {'t':'Gắn mão răng cuối','time':'Buổi cuối','d':'Gắn mão zirconia thiết kế riêng. Kiểm tra khớp cắn, hướng dẫn chăm sóc và kế hoạch bảo trì dài hạn.'},
  ]},
 {'type':'faq','alt':True,'label':'FAQ','h2':'FAQ Về Implant',
  'faqs':[
   ('Nên chọn loại trụ nào?','Cả 3 dòng đều có tỷ lệ thành công rất cao. Straumann BLX có nền tảng nghiên cứu mạnh nhất và tích hợp xương nhanh nhất; Osstem là thương hiệu số 1 Hàn Quốc với hồ sơ lâm sàng khổng lồ. Bác sĩ sẽ tư vấn dựa trên chất lượng xương của bạn — không dựa trên giá.'),
   ('Có đau không?','Đặt trụ được thực hiện dưới gây tê tại chỗ, đa số bệnh nhân thấy nhẹ nhàng hơn nhổ răng. Nếu sợ, có thể chọn gây mê tĩnh mạch (200.000₩) để ngủ suốt ca.'),
   ('Toàn bộ quá trình mất bao lâu?','Thường 2–6 tháng từ lúc đặt trụ đến gắn răng cuối, tùy tình trạng xương. Ca phù hợp có thể gắn răng tức thì — hỏi bác sĩ khi khám.'),
   ('Tôi sắp về Việt Nam giữa chừng thì sao?','Chúng tôi sắp xếp lịch nén các buổi hẹn khi an toàn về mặt lâm sàng, và cung cấp hồ sơ đầy đủ để bạn tiếp tục chăm sóc tại Việt Nam.'),
   ('Nếu cần ghép xương thì sao?','Khoảng 30–40% ca cần ghép xương (300.000–500.000₩). Điều này được xác nhận trên phim CT 3D trước khi bạn quyết định bất cứ điều gì.'),
  ]},
 CTA_VI,
]})

# ─────────────────────────────── /vi/invisalign
PAGES.append({
'path':'vi/invisalign.html','lang':'vi','html_lang':'vi','canonical':'/vi/invisalign','hreflang':HREF_INVIS,
'title':'Invisalign Tại Hàn Quốc Từ 3 Triệu₩ — Bác Sĩ Chỉnh Nha SNU, Mô Phỏng 3D | Seoul BD Dental Cheonan',
'desc':'Niềng răng trong suốt Invisalign tại Cheonan: Express 3 triệu₩, Moderate 5,5 triệu₩, Comprehensive 7 triệu₩. Bác sĩ chỉnh nha ĐH Quốc gia Seoul, mô phỏng 3D ClinCheck, tái khám 8–12 tuần/lần phù hợp người đi làm. Giá như người Hàn.',
'breadcrumb':[('Trang chủ','/'),('Tiếng Việt','/vi/'),('Invisalign','/vi/invisalign')],
'hero':{'badge':'😁 Invisalign — Niềng Răng Trong Suốt',
 'h1':'Invisalign Với Bác Sĩ Chỉnh Nha SNU',
 'sub':'Xem trước nụ cười hoàn thiện bằng mô phỏng 3D ClinCheck trước khi bắt đầu. Lịch tái khám 8–12 tuần/lần — rất phù hợp với người làm ca và lịch bận rộn.',
 'ctas':[{'t':'Đặt lịch tư vấn','href':'tel:+82-41-415-2892','icon':'fas fa-phone'},
         {'t':'Bảng giá đầy đủ','href':'/vi/pricing','icon':'fas fa-won-sign','style':'ghost'}],
 'stats':[('3D','Xem trước ClinCheck'),('8–12 tuần','Giữa các lần tái khám'),('3 triệu₩','Giá khởi điểm'),('SNU','Bác sĩ chỉnh nha')]},
'sections':[
 {'type':'price','label':'Bảng giá','h2':'Các Gói Invisalign','desc':'Giá gói bao gồm khay niềng, các buổi tái khám định kỳ và tinh chỉnh theo điều khoản gói.',
  'head':['Gói','Giá','Phù hợp với'],
  'rows':[
   {'item':'Invisalign Express','price':'3.000.000₩','note':'Chen chúc nhẹ / tái phát sau niềng'},
   {'item':'Invisalign First (trẻ em)','price':'4.000.000₩','note':'Trẻ đang phát triển, giai đoạn 1'},
   {'item':'Invisalign Light','price':'4.500.000₩','note':'Ca nhẹ – trung bình'},
   {'item':'Invisalign Moderate','badge':'PHỔ BIẾN','price':'5.500.000₩','note':'Đa số ca người lớn','hl':True},
   {'item':'Invisalign Comprehensive','price':'7.000.000₩','note':'Chỉnh toàn diện, khớp cắn phức tạp'},
   {'group':'Sau điều trị'},
   {'item':'Hàm duy trì (2 hàm / 1 hàm)','price':'500.000₩ / 250.000₩','note':'Giữ kết quả ổn định'},
  ],
  'notes':['Gói phù hợp được xác định qua scan + đánh giá của bác sĩ chỉnh nha ở buổi khám đầu — không đoán mò.']},
 {'type':'cards','alt':True,'label':'Vì sao ở đây','h2':'Vì Sao Niềng Invisalign Tại Đây',
  'cards':[
   {'icon':'fas fa-eye','t':'Xem Kết Quả Trước','d':'Mô phỏng 3D ClinCheck cho thấy răng bạn di chuyển từng tuần — trước khi bạn thanh toán bất cứ khoản nào.'},
   {'icon':'fas fa-business-time','t':'Phù Hợp Người Đi Làm','d':'Khay niềng được phát theo đợt nhiều giai đoạn, nên 8–12 tuần mới cần tái khám một lần — không lo xin nghỉ làm thường xuyên.'},
   {'icon':'fas fa-user-doctor','t':'Bác Sĩ Chỉnh Nha Chuyên Khoa','d':'Kế hoạch được lập và theo dõi bởi bác sĩ chỉnh nha đào tạo tại SNU — không phải bác sĩ tổng quát làm thêm.'},
   {'icon':'fas fa-teeth','t':'Điều Trị Kết Hợp Một Nơi','d':'Cần trám răng, nhổ răng khôn hay tẩy trắng trong lúc niềng? Xử lý cùng tòa nhà, cùng ngày.'},
  ]},
 {'type':'steps','label':'Quy trình','h2':'Quy Trình Invisalign',
  'steps':[
   {'t':'Scan & đánh giá','time':'Ngày 1','d':'Scan trong miệng kỹ thuật số + X-quang. Bác sĩ chỉnh nha xác nhận mức độ ca và gói phù hợp.'},
   {'t':'Xem trước ClinCheck','time':'~1–2 tuần sau','d':'Xem kết quả mô phỏng 3D. Điều chỉnh mục tiêu cùng bác sĩ. Duyệt để đặt khay.'},
   {'t':'Nhận khay & bắt đầu','time':'~2–3 tuần sau','d':'Gắn attachment, đeo bộ khay đầu tiên, hướng dẫn đeo (22 giờ/ngày).'},
   {'t':'Tái khám định kỳ','time':'Mỗi 8–12 tuần','d':'Kiểm tra nhanh, nhận đợt khay tiếp theo.'},
   {'t':'Hoàn thành & hàm duy trì','time':'Tổng 6–24 tháng','d':'Tinh chỉnh nếu cần theo gói, sau đó đeo hàm duy trì để giữ kết quả.'},
  ]},
 {'type':'faq','alt':True,'label':'FAQ','h2':'FAQ Về Invisalign',
  'faqs':[
   ('Điều trị mất bao lâu?','Ca Express: 3–6 tháng. Moderate: 12–18 tháng. Comprehensive: đến 24 tháng. ClinCheck cho ước tính cụ thể theo ca của bạn trước khi bắt đầu.'),
   ('Tôi có thể phải về nước giữa chừng?','Invisalign là hệ thống chỉnh nha dễ chuyển tiếp nhất — chúng tôi có thể phát đợt khay lớn hơn, và hồ sơ ClinCheck chuyển được cho bất kỳ nha sĩ Invisalign nào trên thế giới, kể cả tại Việt Nam.'),
   ('Có thật sự "vô hình" không?','Khay trong suốt, hầu hết mọi người không nhận ra khi nói chuyện. Một số răng được gắn attachment nhỏ cùng màu răng.'),
   ('Invisalign so với niềng mắc cài — cái nào rẻ hơn?','Mắc cài thẩm mỹ ở đây khoảng 5–5,5 triệu₩; Invisalign Moderate 5,5 triệu₩. Với đa số ca người lớn chi phí tương đương — khác biệt là thẩm mỹ và ít buổi hẹn hơn.'),
  ]},
 CTA_VI,
]})

# ─────────────────────────────── /vi/laminate
PAGES.append({
'path':'vi/laminate.html','lang':'vi','html_lang':'vi','canonical':'/vi/laminate','hreflang':HREF_LAMINATE,
'title':'Dán Sứ Veneer Tại Hàn Quốc — Glownate Từ 600.000₩/Răng, Hoàn Thành 2–3 Ngày | Seoul BD Dental',
'desc':'Glownate: kỹ thuật dán sứ cao cấp mài răng tối thiểu độc quyền của Seoul BD Dental. 600.000–800.000₩/răng, hoàn thành trong 2–3 ngày. Thiết kế bởi BS. Hyun Jung-min (ĐHQG Seoul). Giá như người Hàn, không môi giới.',
'breadcrumb':[('Trang chủ','/'),('Tiếng Việt','/vi/'),('Dán sứ','/vi/laminate')],
'hero':{'badge':'✨ Glownate — Dán Sứ Cao Cấp Độc Quyền',
 'h1':'Nụ Cười Mới Trong 2–3 Ngày',
 'sub':'Glownate là kỹ thuật dán sứ mài tối thiểu độc quyền: gần như không mài răng, độ bóng tự nhiên, chương trình bảo hành 10 năm. Chỉ có tại Seoul BD Dental.',
 'ctas':[{'t':'Đặt lịch tư vấn','href':'tel:+82-41-415-2892','icon':'fas fa-phone'},
         {'t':'Bảng giá đầy đủ','href':'/vi/pricing','icon':'fas fa-won-sign','style':'ghost'}],
 'stats':[('0,3mm','Mài tối thiểu'),('2–3','Ngày hoàn thành'),('600.000₩','Từ / răng'),('10 năm','Chương trình bảo hành')]},
'sections':[
 {'type':'price','label':'Bảng giá','h2':'Giá Dán Sứ (Mỗi Răng)',
  'head':['Lựa chọn','Giá','Ghi chú'],
  'rows':[
   {'item':'Glownate Light','price':'600.000₩','note':'Dán sứ cao cấp mài tối thiểu'},
   {'item':'Glownate Premium','badge':'BEST','price':'800.000₩','note':'Dòng signature của BS. Hyun Jung-min','hl':True},
   {'item':'Glownate Repair (sửa dán sứ nơi khác làm hỏng)','price':'Tư vấn','note':'Tùy tình trạng hiện tại'},
   {'group':'Thẩm mỹ liên quan'},
   {'item':'Tẩy trắng răng chuyên nghiệp','price':'300.000₩','note':'+10% VAT mục đích thẩm mỹ'},
   {'item':'Đóng khe thưa (composite, mỗi mặt)','price':'300.000₩','note':'Khe hở răng cửa'},
  ],
  'notes':['Đa số ca làm 4–8 răng vùng cười. Kế hoạch và tổng chi phí chính xác được xác nhận bằng văn bản tại buổi tư vấn.']},
 {'type':'cards','alt':True,'label':'Vì sao Glownate','h2':'Vì Sao Glownate Đặc Biệt',
  'cards':[
   {'icon':'fas fa-feather','t':'Gần Như Không Mài Răng','d':'Mài trung bình chỉ 0,3–0,5mm — có ca không cần mài (no-prep). Cấu trúc răng thật của bạn được giữ nguyên dưới lớp sứ.'},
   {'icon':'fas fa-clock','t':'2–3 Ngày Từ Đầu Đến Cuối','d':'Ngày 1: tư vấn + thiết kế + mài + răng tạm. Ngày 2–3: dán sứ hoàn thiện. Phù hợp kỳ nghỉ ngắn.'},
   {'icon':'fas fa-user-doctor','t':'Thiết Kế Bởi Người Sáng Lập','d':'BS. Hyun Jung-min (ĐH Quốc gia Seoul) phát triển kỹ thuật Glownate sau nhiều năm tại các phòng khám thẩm mỹ hàng đầu Gangnam.'},
   {'icon':'fas fa-shield-heart','t':'Bảo Hành 10 Năm','d':'Chương trình bảo hành có hệ thống — mẻ, bong sứ được bảo hành theo điều khoản chương trình.'},
  ]},
 {'type':'steps','label':'Quy trình','h2':'Lịch Trình Glownate 2–3 Ngày',
  'steps':[
   {'t':'Tư vấn, thiết kế nụ cười & mài răng','time':'Ngày 1 · 2–3 giờ','d':'Chụp ảnh, chọn màu sứ, thiết kế nụ cười kỹ thuật số, mài tối thiểu, lấy dấu chính xác, gắn răng tạm.'},
   {'t':'Chế tác tại lab','time':'Ngày 1–2','d':'Lab sứ cao cấp đối tác chế tác từng miếng dán riêng biệt.'},
   {'t':'Dán hoàn thiện & đánh bóng','time':'Ngày 2–3 · 1–2 giờ','d':'Thử sứ, chỉnh sửa, dán keo chuyên dụng, kiểm tra khớp cắn và đánh bóng. Ra về với nụ cười mới.'},
  ]},
 {'type':'faq','alt':True,'label':'FAQ','h2':'FAQ Về Dán Sứ',
  'faqs':[
   ('Glownate khác gì dán sứ thông thường?','Glownate là quy trình độc quyền kết hợp mài siêu tối thiểu, đắp sứ thủ công từng lớp và trình tự dán riêng — tạo độ "glow" tự nhiên thay vì vẻ đục, phẳng của dán sứ giá rẻ.'),
   ('Răng tôi có bị mài nhiều không?','Trung bình chỉ 0,3–0,5mm — khoảng độ dày móng tay. Ca phù hợp có thể không cần mài.'),
   ('Dán sứ bền bao lâu?','Chăm sóc bình thường: 10–15+ năm. Chương trình bảo hành 10 năm bao gồm mẻ và bong sứ theo điều khoản.'),
   ('Làm trong cuối tuần được không?','Lịch thứ 6 – chủ nhật thường khả thi với ca 4–8 răng. Liên hệ trước để chúng tôi giữ chỗ lab.'),
   ('Tôi dán sứ nơi khác và không hài lòng.','Glownate Repair chuyên sửa lại các ca dán sứ hỏng hoặc thiếu tự nhiên từ phòng khám khác — báo giá sau khi đánh giá.'),
  ]},
 CTA_VI,
]})

# ─────────────────────────────── /vi/pricing (NEW)
PAGES.append({
'path':'vi/pricing.html','lang':'vi','html_lang':'vi','canonical':'/vi/pricing','hreflang':HREF_PRICING,
'title':'Bảng Giá Nha Khoa (Tiếng Việt) — Implant, Invisalign, Dán Sứ, Trám Răng | Seoul BD Dental Cheonan',
'desc':'Bảng giá nha khoa đầy đủ bằng tiếng Việt của Seoul BD Dental Cheonan: implant 800.000₩–1,6 triệu₩, Invisalign 3–7 triệu₩, dán sứ Glownate 600.000–800.000₩, mão zirconia 550.000₩, trám răng từ 50.000₩, tẩy trắng 300.000₩. Giá như người Hàn — không phụ phí người nước ngoài.',
'breadcrumb':[('Trang chủ','/'),('Tiếng Việt','/vi/'),('Bảng giá','/vi/pricing')],
'hero':{'badge':'💰 Giá Niêm Yết Minh Bạch',
 'h1':'Bảng Giá Đầy Đủ',
 'sub':'Đây là đúng bảng giá mà bệnh nhân Hàn Quốc xem. Không phụ phí người nước ngoài, không phí môi giới, hóa đơn chi tiết rõ ràng.',
 'ctas':[{'t':'Hỏi về trường hợp của bạn','href':'tel:+82-41-415-2892','icon':'fas fa-phone'}],
 'stats':[('0%','Phụ phí người nước ngoài'),('100%','Hóa đơn chi tiết'),('365','Ngày mở cửa')]},
'sections':[
 {'type':'price','label':'Implant','h2':'Implant & Phẫu Thuật',
  'head':['Hạng mục','Giá','Ghi chú'],
  'rows':[
   {'item':'Implant — Straumann BLX (mỗi răng)','badge':'PREMIUM','price':'1.600.000₩','note':'Trụ Thụy Sĩ chính hãng'},
   {'item':'Implant — Osstem SOI (mỗi răng)','price':'1.000.000₩','note':'Cao cấp Hàn Quốc'},
   {'item':'Implant — Osstem CA (mỗi răng)','price':'800.000₩','note':'Tiêu chuẩn Hàn Quốc'},
   {'item':'Phẫu thuật không lật vạt / định vị','price':'100.000–300.000₩','note':'Bổ sung'},
   {'item':'Ghép xương (đơn giản / phức tạp)','price':'300.000₩ / 500.000₩','note':''},
   {'item':'Nâng xoang (đơn giản / phức tạp)','price':'500.000₩ / 1.000.000₩','note':''},
   {'item':'Gây mê tĩnh mạch','price':'200.000₩','note':''},
  ]},
 {'type':'price','alt':True,'label':'Thẩm mỹ','h2':'Dán Sứ, Mão Răng & Tẩy Trắng',
  'head':['Hạng mục','Giá','Ghi chú'],
  'rows':[
   {'item':'Dán sứ Glownate Light (mỗi răng)','price':'600.000₩','note':''},
   {'item':'Dán sứ Glownate Premium (mỗi răng)','badge':'BEST','price':'800.000₩','note':'Dòng signature BS. Hyun','hl':True},
   {'item':'Mão zirconia (mỗi răng)','price':'550.000₩','note':''},
   {'item':'Inlay sứ (mỗi răng)','price':'350.000₩','note':''},
   {'item':'Tẩy trắng chuyên nghiệp','price':'300.000₩','note':'+10% VAT nếu thẩm mỹ'},
  ]},
 {'type':'price','label':'Chỉnh nha','h2':'Invisalign & Niềng Răng',
  'head':['Hạng mục','Giá','Ghi chú'],
  'rows':[
   {'item':'Invisalign Express','price':'3.000.000₩','note':'Ca nhẹ'},
   {'item':'Invisalign First','price':'4.000.000₩','note':'Trẻ em'},
   {'item':'Invisalign Light','price':'4.500.000₩','note':''},
   {'item':'Invisalign Moderate','badge':'PHỔ BIẾN','price':'5.500.000₩','note':'','hl':True},
   {'item':'Invisalign Comprehensive','price':'7.000.000₩','note':'Chỉnh toàn diện'},
   {'item':'Mắc cài sứ Clippy-C','price':'5.000.000₩','note':'Toàn hàm'},
   {'item':'Mắc cài Clarity Ultra','price':'5.500.000₩','note':'Toàn hàm'},
   {'item':'Hàm duy trì (2 hàm / 1 hàm)','price':'500.000₩ / 250.000₩','note':''},
  ]},
 {'type':'price','alt':True,'label':'Tổng quát','h2':'Nha Khoa Tổng Quát',
  'head':['Hạng mục','Giá','Ghi chú'],
  'rows':[
   {'item':'Trám composite (răng sâu)','price':'50.000–250.000₩','note':'Theo kích thước & vị trí'},
   {'item':'Lấy cao răng (không bảo hiểm)','price':'60.000₩','note':'~15.000–20.000₩ với NHIS, 1 lần/năm'},
   {'item':'Máng chống nghiến răng','price':'1.000.000₩','note':''},
   {'item':'Botox hàm','price':'70.000₩','note':'+VAT nếu thẩm mỹ'},
   {'item':'Hàm giả (tháo lắp, mỗi hàm)','price':'1.500.000₩','note':''},
   {'item':'Hàm giả trên implant (mỗi hàm)','price':'2.000.000₩','note':'Phẫu thuật implant tính riêng'},
  ],
  'notes':['Điều trị tủy, nhổ răng và X-quang phần lớn được bảo hiểm y tế Hàn Quốc (NHIS) chi trả nếu bạn có bảo hiểm; chưa có bảo hiểm thì áp dụng giá không bảo hiểm kèm hóa đơn chi tiết.',
           'Tất cả giá bằng Won Hàn Quốc (₩). Nhận thẻ, tiền mặt và chuyển khoản ngân hàng Hàn Quốc.']},
 {'type':'banner','center':True,'html':'<b>Có bảo hiểm y tế Hàn Quốc (건강보험)?</b> Nếu bạn đang làm việc hợp pháp tại Hàn và đóng bảo hiểm, rất nhiều điều trị (lấy cao răng 1 lần/năm, nhổ răng, điều trị tủy, X-quang...) chỉ tốn 10–30% chi phí. Mang thẻ ARC đến — nhân viên sẽ kiểm tra quyền lợi giúp bạn miễn phí.'},
 {'type':'faq','alt':True,'label':'FAQ','h2':'FAQ Thanh Toán & Bảo Hiểm',
  'faqs':[
   ('Có thể trả góp không?','Thẻ tín dụng Hàn Quốc hỗ trợ trả góp 2–12 tháng cho hầu hết các thẻ. Nhân viên sẽ hướng dẫn khi thanh toán.'),
   ('Nhận hóa đơn để yêu cầu bảo hiểm được không?','Được. Chúng tôi xuất hóa đơn chi tiết, bảng kê điều trị và giấy xác nhận của bác sĩ khi bạn yêu cầu.'),
   ('Giá này là giá cuối cùng chưa?','Đây là giá niêm yết cơ bản. Báo giá chính xác (gồm ghép xương hoặc chi phí bổ sung nếu có) được xác nhận bằng văn bản sau khi khám, trước khi điều trị.'),
   ('Không có bảo hiểm NHIS có khám được không?','Hoàn toàn được — bạn trả theo giá không bảo hiểm niêm yết, đúng như người Hàn không dùng bảo hiểm. Không có phụ phí nào khác.'),
  ]},
 CTA_VI,
]})

# ─────────────────────────────── /vi/directions (NEW)
PAGES.append({
'path':'vi/directions.html','lang':'vi','html_lang':'vi','canonical':'/vi/directions','hreflang':HREF_DIRECTIONS,
'title':'Đường Đi — Từ Ga KTX Cheonan-Asan, Bến Xe Cheonan, Asan & Pyeongtaek | Seoul BD Dental',
'desc':'Cách đến Seoul BD Dental ở Cheonan: taxi 10 phút từ ga KTX Cheonan-Asan, xe buýt đến trạm Buldang Jugong 5-danji (đi bộ 1 phút), bãi đỗ xe ngầm miễn phí. Địa chỉ: 14, Buldang 34-gil, Seobuk-gu, Cheonan. ☎ +82-41-415-2892',
'breadcrumb':[('Trang chủ','/'),('Tiếng Việt','/vi/'),('Đường đi','/vi/directions')],
'hero':{'badge':'📍 Buldang-dong, Cheonan',
 'h1':'Đường Đến Seoul BD Dental',
 'sub':'14, Buldang 34-gil, Seobuk-gu, Cheonan-si — nha khoa lớn gần ga KTX Cheonan-Asan nhất, có bãi đỗ xe ngầm miễn phí.',
 'ctas':[{'t':'Mở Google Maps','href':'https://maps.google.com/?q=Seoul+BD+Dental+Cheonan','icon':'fas fa-map-marker-alt'},
         {'t':'Gọi điện','href':'tel:+82-41-415-2892','icon':'fas fa-phone','style':'ghost'}]},
'sections':[
 {'type':'cards','label':'Tuyến đường','h2':'Chọn Điểm Xuất Phát','grid':'iv2-grid--3',
  'cards':[
   {'icon':'fas fa-train','t':'🚄 Từ ga KTX Cheonan-Asan','d':'Taxi 10 phút (~8.000₩). Đưa tài xế xem: 천안 불당동 서울비디치과. Đây là nha khoa lớn gần ga KTX nhất.'},
   {'icon':'fas fa-bus','t':'🚌 Từ bến xe Cheonan','d':'Taxi 15 phút (~7.000₩), hoặc xe buýt nội thành đến trạm "Buldang Jugong 5-danji" (불당주공5단지) — đi bộ 1 phút tới cửa.'},
   {'icon':'fas fa-train-subway','t':'🚉 Tàu điện tuyến 1','d':'Tuyến 1 tàu điện Seoul chạy đến ga Cheonan (rẻ nhất từ Pyeongtaek/Suwon). Từ ga Cheonan: taxi 15 phút.'},
   {'icon':'fas fa-industry','t':'🏭 Từ KCN Asan / Tangjeong','d':'Ô tô 15–20 phút. Nhiều anh chị em công nhân khu Tangjeong, Baebang, KCN Asan đến khám buổi tối (mở đến 20h) hoặc cuối tuần.'},
   {'icon':'fas fa-city','t':'🏙️ Từ Pyeongtaek','d':'Ô tô ~30 phút, hoặc tàu tuyến 1 đến ga Cheonan rồi taxi. Cuối tuần vẫn mở cửa 9h–13h.'},
   {'icon':'fas fa-square-parking','t':'🅿️ Đỗ xe','d':'Bãi đỗ ngầm miễn phí trong tòa nhà (giới hạn chiều cao 2,1m). Có thể đỗ ngoài đường gần đó.'},
  ]},
 {'type':'info','alt':True,'label':'Giờ mở cửa','h2':'Giờ Mở Cửa','rows':[
   {'k':'Thứ 2 – Thứ 6','v':'09:00 – 20:00','gold':True},
   {'k':'Thứ 7 / CN / Ngày lễ','v':'09:00 – 13:00'},
   {'k':'Nghỉ trưa (ngày thường)','v':'12:30 – 14:00'},
   {'k':'Điện thoại','v':'+82-41-415-2892','gold':True},
 ]},
 {'type':'banner','center':True,'html':'<b>Mẹo đi taxi:</b> Đưa tài xế xem dòng này → <b>"충남 천안시 서북구 불당34길 14 서울비디치과"</b>. Từ ga KTX Cheonan-Asan khoảng 8.000₩; từ bến xe Cheonan khoảng 7.000₩.'},
 {'type':'html','label':'Bản đồ','h2':'Bản Đồ','html':'<div style="border-radius:16px;overflow:hidden;border:1px solid rgba(107,66,38,.12)"><iframe src="https://www.google.com/maps?q=36.8061852,127.1063344&hl=vi&z=16&output=embed" width="100%" height="380" style="border:0" loading="lazy" title="Bản đồ Seoul BD Dental" referrerpolicy="no-referrer-when-downgrade"></iframe></div>'},
 CTA_VI,
]})

# ─────────────────────────────── /vi/faq (NEW)
PAGES.append({
'path':'vi/faq.html','lang':'vi','html_lang':'vi','canonical':'/vi/faq','hreflang':HREF_FAQ,
'title':'FAQ Cho Người Việt — Bảo Hiểm, Chi Phí, Ngôn Ngữ, Đặt Lịch | Seoul BD Dental Cheonan',
'desc':'Giải đáp mọi thắc mắc của người Việt tại Hàn Quốc về khám nha khoa: dùng bảo hiểm y tế NHIS thế nào, chi phí implant/niềng răng, có cần biết tiếng Hàn không, đặt lịch ra sao, trả góp được không. Seoul BD Dental Cheonan ☎ +82-41-415-2892',
'breadcrumb':[('Trang chủ','/'),('Tiếng Việt','/vi/'),('FAQ','/vi/faq')],
'hero':{'badge':'❓ Hỏi Đáp Cho Cộng Đồng Người Việt',
 'h1':'Câu Hỏi Thường Gặp',
 'sub':'Tổng hợp những câu hỏi người Việt tại Hàn hay hỏi nhất — về ngôn ngữ, bảo hiểm, chi phí và quy trình khám.',
 'ctas':[{'t':'Gọi +82-41-415-2892','href':'tel:+82-41-415-2892','icon':'fas fa-phone'},
         {'t':'Đặt lịch online','href':'/reservation','icon':'fas fa-calendar-check','style':'ghost'}]},
'sections':[
 {'type':'faq','label':'Ngôn ngữ & Giao tiếp','h2':'Ngôn Ngữ & Giao Tiếp',
  'faqs':[
   ('Tôi không biết tiếng Hàn, khám được không?','Được. Nhiều bệnh nhân Việt điều trị tại đây bằng app dịch thuật (Papago/Google Translate) + tiếng Anh cơ bản của nhân viên. Kế hoạch điều trị và báo giá được đưa bằng văn bản để bạn dịch và đọc kỹ ở nhà.'),
   ('Tôi có thể dẫn bạn biết tiếng Hàn đi cùng không?','Hoàn toàn được và rất hoan nghênh — người thân/bạn bè có thể vào cùng phòng tư vấn.'),
   ('Nhắn tin hỏi trước bằng tiếng Việt được không?','Được — nhắn Instagram DM @seoul_bddc bằng tiếng Việt, chúng tôi dùng công cụ dịch để trả lời trong giờ làm việc.'),
  ]},
 {'type':'faq','alt':True,'label':'Bảo hiểm & Chi phí','h2':'Bảo Hiểm & Chi Phí',
  'faqs':[
   ('Bảo hiểm y tế Hàn Quốc (건강보험/NHIS) dùng được những gì?','Lấy cao răng (1 lần/năm, chỉ ~15.000–20.000₩), nhổ răng, điều trị tủy, điều trị nướu, X-quang... được hỗ trợ giống hệt người Hàn. Implant, niềng răng, dán sứ, tẩy trắng là điều trị không bảo hiểm.'),
   ('Tôi làm E-9 / du học sinh, có được tính giá như người Hàn không?','Có. Giá niêm yết áp dụng cho tất cả mọi người, không phân biệt quốc tịch hay loại visa. Không có "giá người nước ngoài".'),
   ('Implant giá bao nhiêu? Có rẻ hơn Việt Nam không?','800.000₩–1,6 triệu₩/răng (Osstem CA 800.000₩ ≈ 15 triệu VND; Straumann BLX 1,6 triệu₩ ≈ 30 triệu VND). So với giá trụ ngoại chính hãng tại các phòng khám lớn ở Việt Nam là rất cạnh tranh — và bạn không mất công về nước điều trị nhiều lần.'),
   ('Trả góp được không?','Thẻ tín dụng Hàn Quốc trả góp 2–12 tháng được với hầu hết các thẻ.'),
   ('Có phí khám ban đầu không?','Phí khám cơ bản vài nghìn won nếu có NHIS (cao hơn nếu không bảo hiểm) — được trừ vào chi phí điều trị nếu bạn tiến hành.'),
  ]},
 {'type':'faq','label':'Đặt lịch & Khám','h2':'Đặt Lịch & Quy Trình Khám',
  'faqs':[
   ('Đặt lịch thế nào?','3 cách: ① Gọi +82-41-415-2892 ② Form online bdbddc.com/reservation ③ Instagram DM @seoul_bddc. Đến trực tiếp không hẹn cũng được — mở cửa 365 ngày.'),
   ('Cần mang gì khi đến khám?','Thẻ ARC (hoặc hộ chiếu). Có bảo hiểm NHIS thì hệ thống tự tra bằng số ARC. Có phim X-quang cũ thì mang theo càng tốt.'),
   ('Ngày thường tôi làm đến 18h, có kịp khám không?','Kịp — ngày thường mở đến 20:00, và thứ 7/CN/ngày lễ mở 9h–13h. Rất nhiều bệnh nhân là công nhân khám sau giờ làm.'),
   ('Đau răng gấp, đến ngay được không?','Được — ca cấp cứu được ưu tiên xử lý ngay. Gọi trước khi đến để chúng tôi chuẩn bị.'),
   ('Trẻ em có khám được không?','Có — chúng tôi khám trẻ em với quy trình nhi khoa riêng (trám răng trẻ em 30.000–100.000₩).'),
  ]},
 {'type':'banner','alt':True,'center':True,'html':'<b>Chưa tìm thấy câu trả lời?</b> Gọi <a href="tel:+82-41-415-2892" style="color:inherit"><b>+82-41-415-2892</b></a> hoặc nhắn Instagram <b>@seoul_bddc</b> — nhắn bằng tiếng Việt cũng được, chúng tôi sẽ trả lời trong giờ làm việc.'},
 CTA_VI,
]})
