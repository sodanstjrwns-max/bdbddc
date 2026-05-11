/**
 * 다국어 SEO 페이지 일괄 생성 스크립트
 * EN / VI / JP확장 / CN확장 / TH / RU
 * 
 * 페이지 유형:
 *   - dental.html   = 종합 치과 (천안 치과 검색용)
 *   - implant.html   = 임플란트 전문
 *   - invisalign.html = 인비절라인/교정 전문
 *   - laminate.html   = 라미네이트/글로우네이트
 */

const fs = require('fs');
const path = require('path');

const CSS_HASH = '24d559d1';
const SITE_URL = 'https://bdbddc.com';
const PHONE = '+82-41-415-2892';
const PHONE_DISPLAY = '041-415-2892';
const ADDRESS_KO = '충남 천안시 서북구 불당34길 14';

// ═══ 언어별 콘텐츠 데이터 ═══

const LANGS = {
  en: {
    code: 'en', dir: 'en', htmlLang: 'en', ogLocale: 'en_US',
    fontImport: '',
    fontFamily: "'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif",
    clinicName: 'Seoul BD Dental',
    addressLocal: '14, Buldang 34-gil, Seobuk-gu, Cheonan-si, Chungnam, South Korea',
    koreaTxt: 'South Korea',
    pages: {
      dental: {
        title: 'Cheonan Dental Clinic | Foreigner-Friendly · 15 SNU Dentists · 400㎡ — Seoul BD Dental',
        desc: 'Best dental clinic in Cheonan for foreigners. 400㎡ facility, 6 surgery rooms, 15 Seoul National University dentists. Implant, Invisalign, laminate veneer, Glownate. Google 4.9★ (2,847 reviews). Same price as Korean patients — NO broker fees. 10 min from KTX Cheonan-Asan Station. ☎+82-41-415-2892',
        h1: 'Cheonan Dental Clinic',
        subtitle: 'Foreigner-Friendly · No Broker · Same Price as Koreans',
        badge: '🇰🇷 Cheonan\'s Largest Dental Clinic',
        sections: {
          why: { title: 'Why Seoul BD Dental?', items: [
            { icon: 'fa-hospital', t: '400㎡ Premium Facility', d: 'Cheonan\'s largest dental clinic with 6 independent surgery rooms, air shower infection control, and floor-by-floor specialty centers.' },
            { icon: 'fa-user-doctor', t: '15 SNU-Trained Dentists', d: 'All 15 dentists graduated from Seoul National University — Korea\'s #1 medical school. Specialist consultation available for every treatment.' },
            { icon: 'fa-won-sign', t: 'Same Price, No Broker', d: 'You pay exactly the same as Korean patients. No middleman, no markup. Direct booking only.' },
            { icon: 'fa-star', t: 'Google 4.9★ (2,847 Reviews)', d: 'One of the highest-rated dental clinics in Chungnam province. Real patient reviews, not paid promotions.' }
          ]},
          treatments: { title: 'Our Treatments', items: [
            { icon: 'fa-tooth', t: 'Dental Implant', d: '6 dedicated surgery rooms · Navigation-guided · Same-day loading available', link: '/en/implant' },
            { icon: 'fa-teeth', t: 'Invisalign', d: 'Diamond Provider · SNU orthodontic specialist · 3D ClinCheck simulation', link: '/en/invisalign' },
            { icon: 'fa-sparkles', t: 'Laminate Veneer / Glownate', d: 'Minimal-prep premium veneer · 10-year warranty · From ₩500,000/tooth', link: '/en/laminate' },
            { icon: 'fa-teeth-open', t: 'General Dentistry', d: 'Cavity treatment, wisdom tooth extraction, scaling, gum treatment, crown/bridge' }
          ]},
          access: { title: 'How to Get Here', items: [
            '🚄 KTX Cheonan-Asan Station → 10 min by taxi',
            '🚌 Bus stop "Buldang Jugong 5-danji" → 1 min walk',
            '🅿️ Free underground parking available',
            '📍 14, Buldang 34-gil, Seobuk-gu, Cheonan-si'
          ]},
          contact: { title: 'Contact & Reservation', items: [
            { icon: 'fa-phone', t: 'Phone', d: PHONE },
            { icon: 'fa-comment', t: 'KakaoTalk', d: 'Search "서울비디치과" on KakaoTalk' },
            { icon: 'fa-globe', t: 'Online', d: 'bdbddc.com/reservation' }
          ]}
        },
        faq: [
          { q: 'Do you have English-speaking staff?', a: 'Our dentists can communicate in basic English. For complex consultations, we provide translation support. You can also use translation apps during your visit.' },
          { q: 'How much does a dental implant cost?', a: 'Dental implant costs vary by case (₩800,000~₩1,500,000 per tooth). Foreigners pay the same price as Korean patients — no broker fees or markup.' },
          { q: 'Do I need an appointment?', a: 'Walk-ins are welcome, but we recommend booking in advance for shorter wait times. Call +82-41-415-2892 or visit bdbddc.com/reservation.' },
          { q: 'Can I get treatment in one visit?', a: 'Simple treatments (cleaning, fillings) can be done in one visit. Implants typically require 2-3 visits over 3-6 months. Laminate veneers can be completed in 2-3 days.' }
        ]
      },
      implant: {
        title: 'Cheonan Dental Implant | 6 Surgery Rooms · SNU Specialists · Navigation-Guided — Seoul BD Dental',
        desc: 'Best dental implant clinic in Cheonan. 6 dedicated surgery rooms, navigation-guided surgery, same-day loading, bone grafting specialists. All 15 dentists from Seoul National University. Same price for foreigners — no broker. Google 4.9★. ☎+82-41-415-2892',
        h1: 'Dental Implant in Cheonan',
        subtitle: '6 Dedicated Surgery Rooms · Navigation-Guided Precision',
        badge: '🦷 Implant Specialty Center',
        sections: {
          why: { title: 'Why Choose Us for Implants?', items: [
            { icon: 'fa-microscope', t: 'Navigation-Guided Surgery', d: 'Computer-guided implant placement for maximum precision. Minimally invasive, less pain, faster recovery.' },
            { icon: 'fa-hospital', t: '6 Independent Surgery Rooms', d: 'Hospital-grade sterile operating rooms with HEPA air filtration and dedicated surgical suites.' },
            { icon: 'fa-flask', t: 'In-House Dental Lab', d: 'On-site lab for same-day prosthetics. Premium fixtures from Straumann (Switzerland) and Osstem.' },
            { icon: 'fa-bed', t: 'Sedation Available', d: 'IV sedation for anxious patients. Board-certified anesthesiologist on staff.' }
          ]},
          types: { title: 'Implant Options', items: [
            { icon: 'fa-bolt', t: 'Same-Day Implant', d: 'Extraction and implant placement in a single visit. Ideal for eligible cases.' },
            { icon: 'fa-bone', t: 'Bone Graft Implant', d: 'Specialized in sinus lift and bone grafting for patients with insufficient bone.' },
            { icon: 'fa-teeth', t: 'Full-Mouth Implant', d: 'All-on-4 / All-on-6 solutions for patients needing full-arch restoration.' },
            { icon: 'fa-moon', t: 'Sleep Implant', d: 'Implant surgery under IV sedation. You sleep through the entire procedure.' }
          ]},
          access: { title: 'Location', items: [
            '🚄 KTX Cheonan-Asan Station → 10 min by taxi',
            '📍 4F Implant Center, Seoul BD Dental',
            '🅿️ Free underground parking',
            '☎ +82-41-415-2892'
          ]}
        },
        faq: [
          { q: 'How much does a dental implant cost at Seoul BD Dental?', a: 'Implant costs range from ₩800,000 to ₩1,500,000 per tooth depending on the fixture brand and bone condition. Foreigners pay the same price as Korean patients.' },
          { q: 'How long does implant treatment take?', a: 'Standard implants take 3-6 months total (2-3 visits). Same-day implants are available for eligible cases.' },
          { q: 'Is the surgery painful?', a: 'Modern implant surgery is minimally invasive. Local anesthesia is standard, and IV sedation is available for anxious patients.' }
        ]
      },
      invisalign: {
        title: 'Cheonan Invisalign | Diamond Provider · SNU Orthodontist · Clear Aligners — Seoul BD Dental',
        desc: 'Invisalign Diamond Provider in Cheonan. SNU-trained orthodontic specialists, 3D ClinCheck simulation, dedicated 1F orthodontic center. Same price for foreigners. Google 4.9★. ☎+82-41-415-2892',
        h1: 'Invisalign in Cheonan',
        subtitle: 'Diamond Provider · SNU Orthodontic Specialist',
        badge: '✨ Invisalign Diamond Provider',
        sections: {
          why: { title: 'Why Choose Us for Invisalign?', items: [
            { icon: 'fa-award', t: 'Diamond Provider', d: 'Top 1% Invisalign provider worldwide. Thousands of successful cases completed.' },
            { icon: 'fa-user-doctor', t: 'SNU Orthodontic Specialist', d: 'Board-certified orthodontist from Seoul National University dedicated to your treatment.' },
            { icon: 'fa-cube', t: '3D ClinCheck Simulation', d: 'See your treatment results before you start. AI-powered digital treatment planning.' },
            { icon: 'fa-building', t: 'Dedicated 1F Center', d: 'Exclusive orthodontic center on the 1st floor with specialized equipment.' }
          ]},
          access: { title: 'Location', items: [
            '🚄 KTX Cheonan-Asan Station → 10 min by taxi',
            '📍 1F Orthodontic Center, Seoul BD Dental',
            '🅿️ Free underground parking',
            '☎ +82-41-415-2892'
          ]}
        },
        faq: [
          { q: 'How much does Invisalign cost?', a: 'Invisalign treatment at Seoul BD Dental ranges from ₩3,000,000 to ₩6,000,000 depending on complexity. Foreigners pay the same price as Korean patients.' },
          { q: 'How long does Invisalign treatment take?', a: 'Typical treatment takes 12-18 months. Simple cases may be completed in 6 months.' },
          { q: 'Can I visit from another city?', a: 'Yes! Many patients visit from Seoul, Daejeon, and other cities. Follow-up visits are typically once every 6-8 weeks.' }
        ]
      },
      laminate: {
        title: 'Cheonan Laminate Veneer & Glownate | Minimal-Prep · 10-Year Warranty — Seoul BD Dental',
        desc: 'Premium laminate veneer and Glownate (exclusive brand) at Seoul BD Dental, Cheonan. Minimal tooth preparation, 10-year warranty, from ₩500,000/tooth. No broker fees for foreigners. SNU cosmetic dentist. ☎+82-41-415-2892',
        h1: 'Laminate Veneer & Glownate',
        subtitle: 'Korea\'s Premium Veneer Brand · Minimal Prep · 10-Year Warranty',
        badge: '💎 Glownate — Seoul BD Exclusive',
        sections: {
          why: { title: 'Why Glownate?', items: [
            { icon: 'fa-gem', t: 'Exclusive Premium Brand', d: 'Glownate is Seoul BD Dental\'s proprietary veneer technique — available ONLY here worldwide.' },
            { icon: 'fa-shield-halved', t: 'Minimal Tooth Preparation', d: 'Preserves maximum natural tooth structure. Ultra-thin porcelain for natural aesthetics.' },
            { icon: 'fa-certificate', t: '10-Year Warranty', d: 'Industry-leading warranty backed by our in-house dental lab.' },
            { icon: 'fa-won-sign', t: 'From ₩500,000/Tooth', d: 'Premium quality at fair price. No broker markup for international patients.' }
          ]},
          access: { title: 'Location', items: [
            '🚄 KTX Cheonan-Asan Station → 10 min by taxi',
            '📍 Seoul BD Dental, Cheonan',
            '🅿️ Free underground parking',
            '☎ +82-41-415-2892'
          ]}
        },
        faq: [
          { q: 'What is Glownate?', a: 'Glownate is Seoul BD Dental\'s exclusive premium laminate veneer brand, developed by Dr. Hyun Jeong-min. It uses minimal tooth preparation for natural, beautiful results.' },
          { q: 'How much do laminate veneers cost?', a: 'Laminate veneers start from ₩500,000 per tooth. Glownate premium veneers are ₩800,000 per tooth. Same price for all patients — no broker fees.' },
          { q: 'How long does the procedure take?', a: 'Laminate veneers can be completed in 2-3 visits over 5-7 days. For international patients, we offer a condensed schedule.' }
        ]
      }
    }
  },

  vi: {
    code: 'vi', dir: 'vi', htmlLang: 'vi', ogLocale: 'vi_VN',
    fontImport: '',
    fontFamily: "'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif",
    clinicName: 'Nha khoa Seoul BD',
    addressLocal: '14, Buldang 34-gil, Seobuk-gu, Cheonan-si, Chungnam, Hàn Quốc',
    koreaTxt: 'Hàn Quốc',
    pages: {
      dental: {
        title: 'Nha Khoa Cheonan | Thân Thiện Với Người Nước Ngoài · 15 Bác Sĩ ĐH Quốc Gia Seoul — Nha Khoa Seoul BD',
        desc: 'Nha khoa tốt nhất Cheonan cho người nước ngoài. Cơ sở 400m², 6 phòng phẫu thuật, 15 bác sĩ Đại học Quốc gia Seoul. Cấy ghép implant, niềng răng Invisalign, dán sứ laminate, Glownate. Google 4.9★ (2.847 đánh giá). Giá như người Hàn — KHÔNG phí môi giới. Cách ga KTX Cheonan-Asan 10 phút. ☎+82-41-415-2892',
        h1: 'Nha Khoa Cheonan',
        subtitle: 'Thân Thiện Với Người Nước Ngoài · Không Môi Giới · Giá Như Người Hàn',
        badge: '🇰🇷 Nha Khoa Lớn Nhất Cheonan',
        sections: {
          why: { title: 'Tại Sao Chọn Nha Khoa Seoul BD?', items: [
            { icon: 'fa-hospital', t: 'Cơ Sở 400m² Cao Cấp', d: 'Nha khoa lớn nhất Cheonan với 6 phòng phẫu thuật độc lập, hệ thống kiểm soát nhiễm trùng tiêu chuẩn bệnh viện.' },
            { icon: 'fa-user-doctor', t: '15 Bác Sĩ ĐH Quốc Gia Seoul', d: 'Tất cả 15 bác sĩ tốt nghiệp Đại học Quốc gia Seoul — trường y khoa hàng đầu Hàn Quốc.' },
            { icon: 'fa-won-sign', t: 'Cùng Giá, Không Môi Giới', d: 'Bạn trả đúng giá như bệnh nhân Hàn Quốc. Không trung gian, không phụ phí.' },
            { icon: 'fa-star', t: 'Google 4.9★ (2.847 Đánh Giá)', d: 'Một trong những nha khoa được đánh giá cao nhất tỉnh Chungnam.' }
          ]},
          treatments: { title: 'Dịch Vụ Điều Trị', items: [
            { icon: 'fa-tooth', t: 'Cấy Ghép Implant', d: '6 phòng phẫu thuật chuyên dụng · Phẫu thuật dẫn đường · Có thể gắn răng ngay', link: '/vi/implant' },
            { icon: 'fa-teeth', t: 'Invisalign', d: 'Diamond Provider · Bác sĩ chỉnh nha chuyên khoa · Mô phỏng 3D ClinCheck', link: '/vi/invisalign' },
            { icon: 'fa-sparkles', t: 'Dán Sứ Laminate / Glownate', d: 'Mài răng tối thiểu · Bảo hành 10 năm · Từ 500.000₩/răng', link: '/vi/laminate' },
            { icon: 'fa-teeth-open', t: 'Nha Khoa Tổng Quát', d: 'Trám răng, nhổ răng khôn, lấy cao răng, điều trị nướu, bọc răng sứ' }
          ]},
          access: { title: 'Cách Đến', items: [
            '🚄 Ga KTX Cheonan-Asan → 10 phút taxi',
            '🚌 Trạm xe buýt "Buldang Jugong 5-danji" → 1 phút đi bộ',
            '🅿️ Bãi đỗ xe ngầm miễn phí',
            '📍 14, Buldang 34-gil, Seobuk-gu, Cheonan-si'
          ]},
          contact: { title: 'Liên Hệ & Đặt Lịch', items: [
            { icon: 'fa-phone', t: 'Điện thoại', d: PHONE },
            { icon: 'fa-comment', t: 'Zalo', d: 'Tìm "Seoul BD Dental" trên Zalo' },
            { icon: 'fa-globe', t: 'Trực tuyến', d: 'bdbddc.com/reservation' }
          ]}
        },
        faq: [
          { q: 'Nha khoa có nhân viên nói tiếng Việt không?', a: 'Hiện tại chúng tôi hỗ trợ giao tiếp bằng tiếng Anh cơ bản và ứng dụng dịch thuật. Bạn có thể sử dụng app dịch trong quá trình khám.' },
          { q: 'Chi phí cấy ghép implant là bao nhiêu?', a: 'Chi phí implant từ 800.000₩ đến 1.500.000₩/răng tùy loại. Người nước ngoài trả cùng giá với người Hàn Quốc.' },
          { q: 'Tôi có cần đặt lịch hẹn không?', a: 'Khuyến nghị đặt lịch trước để giảm thời gian chờ. Gọi +82-41-415-2892 hoặc đặt online tại bdbddc.com/reservation.' }
        ]
      },
      implant: {
        title: 'Cấy Ghép Implant Cheonan | 6 Phòng Phẫu Thuật · Bác Sĩ ĐH Quốc Gia Seoul — Nha Khoa Seoul BD',
        desc: 'Cấy ghép implant tốt nhất Cheonan. 6 phòng phẫu thuật chuyên dụng, phẫu thuật dẫn đường, gắn răng ngay trong ngày. 15 bác sĩ ĐH Quốc gia Seoul. Giá như người Hàn — không môi giới. Google 4.9★. ☎+82-41-415-2892',
        h1: 'Cấy Ghép Implant tại Cheonan',
        subtitle: '6 Phòng Phẫu Thuật Chuyên Dụng · Độ Chính Xác Dẫn Đường',
        badge: '🦷 Trung Tâm Implant Chuyên Khoa',
        sections: {
          why: { title: 'Tại Sao Chọn Chúng Tôi?', items: [
            { icon: 'fa-microscope', t: 'Phẫu Thuật Dẫn Đường', d: 'Cấy ghép implant được dẫn đường bằng máy tính để đạt độ chính xác tối đa.' },
            { icon: 'fa-hospital', t: '6 Phòng Phẫu Thuật Độc Lập', d: 'Phòng mổ vô trùng tiêu chuẩn bệnh viện với hệ thống lọc không khí HEPA.' },
            { icon: 'fa-flask', t: 'Phòng Lab Nha Khoa Tại Chỗ', d: 'Làm răng giả ngay trong ngày. Trụ implant cao cấp Straumann (Thụy Sĩ) và Osstem.' },
            { icon: 'fa-bed', t: 'Gây Mê Có Sẵn', d: 'Gây mê tĩnh mạch cho bệnh nhân lo lắng. Bác sĩ gây mê chuyên khoa.' }
          ]},
          access: { title: 'Địa Điểm', items: [
            '🚄 Ga KTX Cheonan-Asan → 10 phút taxi',
            '📍 Tầng 4 Trung tâm Implant, Nha khoa Seoul BD',
            '🅿️ Bãi đỗ xe ngầm miễn phí',
            '☎ +82-41-415-2892'
          ]}
        },
        faq: [
          { q: 'Chi phí cấy ghép implant là bao nhiêu?', a: 'Chi phí từ 800.000₩ đến 1.500.000₩/răng tùy loại trụ và tình trạng xương. Người nước ngoài trả cùng giá với người Hàn Quốc.' },
          { q: 'Thời gian điều trị implant mất bao lâu?', a: 'Implant tiêu chuẩn mất 3-6 tháng (2-3 lần khám). Implant ngay trong ngày có sẵn cho các trường hợp phù hợp.' },
          { q: 'Phẫu thuật có đau không?', a: 'Phẫu thuật implant hiện đại xâm lấn tối thiểu. Gây tê tại chỗ là tiêu chuẩn, gây mê tĩnh mạch có sẵn.' }
        ]
      },
      invisalign: {
        title: 'Invisalign Cheonan | Diamond Provider · Bác Sĩ Chỉnh Nha ĐH Quốc Gia Seoul — Nha Khoa Seoul BD',
        desc: 'Invisalign Diamond Provider tại Cheonan. Bác sĩ chỉnh nha chuyên khoa ĐH Quốc gia Seoul, mô phỏng 3D ClinCheck, trung tâm chỉnh nha chuyên dụng tầng 1. Giá như người Hàn. Google 4.9★. ☎+82-41-415-2892',
        h1: 'Invisalign tại Cheonan',
        subtitle: 'Diamond Provider · Bác Sĩ Chỉnh Nha ĐH Quốc Gia Seoul',
        badge: '✨ Invisalign Diamond Provider',
        sections: {
          why: { title: 'Tại Sao Chọn Chúng Tôi?', items: [
            { icon: 'fa-award', t: 'Diamond Provider', d: 'Top 1% nhà cung cấp Invisalign trên toàn thế giới.' },
            { icon: 'fa-user-doctor', t: 'Bác Sĩ Chỉnh Nha Chuyên Khoa', d: 'Bác sĩ chuyên khoa chỉnh nha tốt nghiệp ĐH Quốc gia Seoul.' },
            { icon: 'fa-cube', t: 'Mô Phỏng 3D ClinCheck', d: 'Xem kết quả điều trị trước khi bắt đầu.' },
            { icon: 'fa-building', t: 'Trung Tâm Chuyên Dụng Tầng 1', d: 'Trung tâm chỉnh nha riêng biệt với thiết bị chuyên dụng.' }
          ]},
          access: { title: 'Địa Điểm', items: [
            '🚄 Ga KTX Cheonan-Asan → 10 phút taxi',
            '📍 Tầng 1 Trung tâm Chỉnh nha, Nha khoa Seoul BD',
            '🅿️ Bãi đỗ xe ngầm miễn phí',
            '☎ +82-41-415-2892'
          ]}
        },
        faq: [
          { q: 'Chi phí Invisalign là bao nhiêu?', a: 'Invisalign tại Nha khoa Seoul BD từ 3.000.000₩ đến 6.000.000₩ tùy độ phức tạp. Người nước ngoài trả cùng giá.' },
          { q: 'Thời gian niềng răng mất bao lâu?', a: 'Trung bình 12-18 tháng. Trường hợp đơn giản có thể hoàn thành trong 6 tháng.' }
        ]
      },
      laminate: {
        title: 'Dán Sứ Laminate & Glownate Cheonan | Mài Răng Tối Thiểu · Bảo Hành 10 Năm — Nha Khoa Seoul BD',
        desc: 'Dán sứ laminate cao cấp và Glownate (thương hiệu độc quyền) tại Nha khoa Seoul BD, Cheonan. Mài răng tối thiểu, bảo hành 10 năm, từ 500.000₩/răng. Không phí môi giới. ☎+82-41-415-2892',
        h1: 'Dán Sứ Laminate & Glownate',
        subtitle: 'Thương Hiệu Veneer Cao Cấp Hàn Quốc · Mài Tối Thiểu · Bảo Hành 10 Năm',
        badge: '💎 Glownate — Độc Quyền Seoul BD',
        sections: {
          why: { title: 'Tại Sao Chọn Glownate?', items: [
            { icon: 'fa-gem', t: 'Thương Hiệu Cao Cấp Độc Quyền', d: 'Glownate là kỹ thuật veneer độc quyền của Nha khoa Seoul BD — CHỈ có ở đây trên toàn thế giới.' },
            { icon: 'fa-shield-halved', t: 'Mài Răng Tối Thiểu', d: 'Bảo tồn tối đa cấu trúc răng tự nhiên. Sứ siêu mỏng cho vẻ đẹp tự nhiên.' },
            { icon: 'fa-certificate', t: 'Bảo Hành 10 Năm', d: 'Bảo hành hàng đầu ngành được hỗ trợ bởi phòng lab nha khoa tại chỗ.' },
            { icon: 'fa-won-sign', t: 'Từ 500.000₩/Răng', d: 'Chất lượng cao cấp với giá hợp lý. Không phụ phí cho bệnh nhân quốc tế.' }
          ]},
          access: { title: 'Địa Điểm', items: [
            '🚄 Ga KTX Cheonan-Asan → 10 phút taxi',
            '📍 Nha khoa Seoul BD, Cheonan',
            '🅿️ Bãi đỗ xe ngầm miễn phí',
            '☎ +82-41-415-2892'
          ]}
        },
        faq: [
          { q: 'Glownate là gì?', a: 'Glownate là thương hiệu dán sứ veneer cao cấp độc quyền của Nha khoa Seoul BD, được phát triển bởi BS. Hyun Jeong-min.' },
          { q: 'Chi phí dán sứ laminate là bao nhiêu?', a: 'Laminate từ 500.000₩/răng. Glownate cao cấp 800.000₩/răng. Cùng giá cho tất cả bệnh nhân.' }
        ]
      }
    }
  },

  ja: {
    code: 'ja', dir: 'jp', htmlLang: 'ja', ogLocale: 'ja_JP',
    fontImport: '<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@300;400;500;700;900&display=swap" rel="stylesheet">',
    fontFamily: "'Noto Sans JP', 'Pretendard', sans-serif",
    clinicName: 'ソウルBD歯科',
    addressLocal: '忠南天安市西北区プルダン34ギル14',
    koreaTxt: '韓国',
    pages: {
      dental: {
        title: '天安歯科 | 外国人対応 · ソウル大15人の歯科医師 · 400㎡ — ソウルBD歯科',
        desc: '天安で最高の歯科医院。400㎡の施設、6つの手術室、ソウル国立大学卒の歯科医師15名。インプラント、インビザライン、ラミネートベニア、グロウネイト。Google 4.9★（2,847件）。韓国人と同じ料金 — 仲介業者なし。KTX天安牙山駅10分。☎+82-41-415-2892',
        h1: '天安歯科',
        subtitle: '外国人対応 · 仲介業者なし · 韓国人と同じ料金',
        badge: '🇰🇷 天安最大規模の歯科医院',
        sections: {
          why: { title: 'ソウルBD歯科が選ばれる理由', items: [
            { icon: 'fa-hospital', t: '400㎡ プレミアム施設', d: '天安最大の歯科。6つの独立手術室、エアシャワー感染管理、フロア別専門センター。' },
            { icon: 'fa-user-doctor', t: 'ソウル大卒 歯科医師15名', d: '全員がソウル国立大学卒。各治療分野の専門医が在籍。' },
            { icon: 'fa-won-sign', t: '同じ料金・仲介業者なし', d: '韓国人患者と完全に同じ料金。中間マージンなし。' },
            { icon: 'fa-star', t: 'Google 4.9★（2,847件）', d: '忠清南道で最高評価の歯科医院の一つ。' }
          ]},
          treatments: { title: '診療内容', items: [
            { icon: 'fa-tooth', t: 'インプラント', d: '6つの専用手術室 · ナビゲーション手術 · 即日荷重可能', link: '/jp/implant' },
            { icon: 'fa-teeth', t: 'インビザライン', d: 'ダイヤモンドプロバイダー · ソウル大矯正専門医 · 3Dシミュレーション', link: '/jp/invisalign' },
            { icon: 'fa-sparkles', t: 'ラミネートベニア / グロウネイト', d: '最小限の削り · 10年保証 · 1本50万ウォン～', link: '/jp/' },
            { icon: 'fa-teeth-open', t: '一般歯科', d: '虫歯治療、親知らず抜歯、スケーリング、歯周治療、クラウン' }
          ]},
          access: { title: 'アクセス', items: [
            '🚄 KTX天安牙山駅 → タクシー10分',
            '🚌 バス停「プルダン住公5団地」→ 徒歩1分',
            '🅿️ 地下駐車場無料',
            '📍 忠南天安市西北区プルダン34ギル14'
          ]},
          contact: { title: 'お問い合わせ・ご予約', items: [
            { icon: 'fa-phone', t: '電話', d: PHONE },
            { icon: 'fa-line', t: 'LINE', d: 'LINE ID: seoulbddental' },
            { icon: 'fa-globe', t: 'オンライン', d: 'bdbddc.com/reservation' }
          ]}
        },
        faq: [
          { q: '日本語対応のスタッフはいますか？', a: '基本的な英語でのコミュニケーションが可能です。翻訳アプリのサポートもご利用いただけます。' },
          { q: 'インプラントの費用はいくらですか？', a: 'インプラントは1本80万～150万ウォン（約87,000～163,000円）です。外国人も韓国人と同じ料金です。' },
          { q: '予約は必要ですか？', a: '予約なしでも対応可能ですが、事前予約をおすすめします。☎+82-41-415-2892' }
        ]
      },
      implant: {
        title: '天安インプラント | 6つの専用手術室 · ソウル大専門医 · ナビゲーション手術 — ソウルBD歯科',
        desc: '天安最高のインプラント専門歯科。6つの独立手術室、ナビゲーション手術、即日インプラント、骨移植専門。ソウル国立大学卒15名。外国人同一料金。Google 4.9★。☎+82-41-415-2892',
        h1: '天安インプラント',
        subtitle: '6つの専用手術室 · ナビゲーションガイド精密手術',
        badge: '🦷 インプラント専門センター',
        sections: {
          why: { title: '選ばれる理由', items: [
            { icon: 'fa-microscope', t: 'ナビゲーション手術', d: 'コンピュータガイドによるインプラント埋入。最小限の切開、少ない痛み、早い回復。' },
            { icon: 'fa-hospital', t: '6つの独立手術室', d: '病院レベルの無菌手術室。HEPAフィルター空気清浄。' },
            { icon: 'fa-flask', t: '院内歯科技工所', d: '当日の補綴物製作可能。Straumann（スイス）・Osstemプレミアムフィクスチャー。' },
            { icon: 'fa-bed', t: '静脈鎮静法対応', d: '歯科恐怖症の方も安心。認定麻酔科医在籍。' }
          ]},
          access: { title: 'アクセス', items: [
            '🚄 KTX天安牙山駅 → タクシー10分',
            '📍 4Fインプラントセンター、ソウルBD歯科',
            '🅿️ 地下駐車場無料',
            '☎ +82-41-415-2892'
          ]}
        },
        faq: [
          { q: 'インプラントの費用は？', a: '1本80万～150万ウォン（約87,000～163,000円）。フィクスチャーの種類と骨の状態により異なります。外国人も韓国人と同一料金。' },
          { q: '治療期間はどのくらい？', a: '通常3～6ヶ月（2～3回の通院）。即日インプラントも対応可能。' }
        ]
      },
      invisalign: {
        title: '天安インビザライン | ダイヤモンドプロバイダー · ソウル大矯正専門医 — ソウルBD歯科',
        desc: '天安のインビザライン ダイヤモンドプロバイダー。ソウル国立大学矯正専門医、3D ClinCheckシミュレーション、1F専用矯正センター。外国人同一料金。Google 4.9★。☎+82-41-415-2892',
        h1: '天安インビザライン',
        subtitle: 'ダイヤモンドプロバイダー · ソウル大矯正専門医',
        badge: '✨ インビザライン ダイヤモンドプロバイダー',
        sections: {
          why: { title: '選ばれる理由', items: [
            { icon: 'fa-award', t: 'ダイヤモンドプロバイダー', d: '世界上位1%のインビザラインプロバイダー。数千件の実績。' },
            { icon: 'fa-user-doctor', t: 'ソウル大矯正専門医', d: 'ソウル国立大学卒の矯正専門医が担当。' },
            { icon: 'fa-cube', t: '3D ClinCheckシミュレーション', d: '治療開始前に結果を確認。AIデジタル治療計画。' },
            { icon: 'fa-building', t: '1F専用矯正センター', d: '矯正専用フロアに専門機器を完備。' }
          ]},
          access: { title: 'アクセス', items: [
            '🚄 KTX天安牙山駅 → タクシー10分',
            '📍 1F矯正センター、ソウルBD歯科',
            '🅿️ 地下駐車場無料',
            '☎ +82-41-415-2892'
          ]}
        },
        faq: [
          { q: 'インビザラインの費用は？', a: '300万～600万ウォン（約33万～65万円）。症例により異なります。外国人も韓国人と同一料金。' },
          { q: '矯正期間はどのくらい？', a: '通常12～18ヶ月。簡単な症例は6ヶ月で完了。' }
        ]
      }
    }
  },

  'zh-CN': {
    code: 'zh-CN', dir: 'cn', htmlLang: 'zh-CN', ogLocale: 'zh_CN',
    fontImport: '<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@300;400;500;700;900&display=swap" rel="stylesheet">',
    fontFamily: "'Noto Sans SC', 'Pretendard', sans-serif",
    clinicName: '首尔BD牙科',
    addressLocal: '忠南天安市西北区不堂34街14号',
    koreaTxt: '韩国',
    pages: {
      dental: {
        title: '天安牙科 | 外国人友好 · 首尔大学15名牙医 · 400㎡ — 首尔BD牙科',
        desc: '天安最好的牙科诊所。400㎡设施、6间手术室、15名首尔国立大学牙医。种植牙、隐适美、瓷贴面、格洛内特。Google 4.9★（2,847条评价）。与韩国患者相同价格——无中介费。距KTX天安牙山站10分钟。☎+82-41-415-2892',
        h1: '天安牙科',
        subtitle: '外国人友好 · 无中介 · 与韩国人同价',
        badge: '🇰🇷 天安最大规模牙科',
        sections: {
          why: { title: '为什么选择首尔BD牙科？', items: [
            { icon: 'fa-hospital', t: '400㎡高端设施', d: '天安最大牙科诊所，6间独立手术室，空气淋浴感染控制，分层专科中心。' },
            { icon: 'fa-user-doctor', t: '15名首尔大学牙医', d: '全部15名牙医毕业于首尔国立大学——韩国排名第一的医学院。' },
            { icon: 'fa-won-sign', t: '同价·无中介', d: '您支付与韩国患者完全相同的价格。无中间商，无加价。' },
            { icon: 'fa-star', t: 'Google 4.9★（2,847条）', d: '忠清南道评价最高的牙科诊所之一。' }
          ]},
          treatments: { title: '诊疗项目', items: [
            { icon: 'fa-tooth', t: '种植牙', d: '6间专用手术室 · 导航手术 · 即刻负重', link: '/cn/implant' },
            { icon: 'fa-teeth', t: '隐适美', d: '钻石供应商 · 首尔大学正畸专家 · 3D ClinCheck模拟', link: '/cn/invisalign' },
            { icon: 'fa-sparkles', t: '瓷贴面 / 格洛内特', d: '微创备牙 · 10年质保 · 每颗50万韩元起', link: '/cn/' },
            { icon: 'fa-teeth-open', t: '综合牙科', d: '龋齿治疗、智齿拔除、洁牙、牙周治疗、牙冠' }
          ]},
          access: { title: '交通指南', items: [
            '🚄 KTX天安牙山站 → 出租车10分钟',
            '🚌 公交站"不堂住公5团地" → 步行1分钟',
            '🅿️ 免费地下停车场',
            '📍 忠南天安市西北区不堂34街14号'
          ]},
          contact: { title: '联系与预约', items: [
            { icon: 'fa-phone', t: '电话', d: PHONE },
            { icon: 'fa-weixin', t: '微信', d: '微信搜索 "SeoulBDDental"' },
            { icon: 'fa-globe', t: '在线预约', d: 'bdbddc.com/reservation' }
          ]}
        },
        faq: [
          { q: '有会说中文的工作人员吗？', a: '我们提供基本英语沟通，也支持翻译应用。您可以在就诊时使用翻译APP。' },
          { q: '种植牙费用是多少？', a: '种植牙每颗80万～150万韩元（约4,200～7,900元人民币）。外国人与韩国患者同价。' },
          { q: '需要预约吗？', a: '建议提前预约以减少等待时间。☎+82-41-415-2892 或访问 bdbddc.com/reservation' }
        ]
      },
      implant: {
        title: '天安种植牙 | 6间专用手术室 · 首尔大学专家 · 导航手术 — 首尔BD牙科',
        desc: '天安最好的种植牙诊所。6间独立手术室、导航引导手术、即刻种植、骨移植专家。15名首尔大学牙医。外国人同价——无中介。Google 4.9★。☎+82-41-415-2892',
        h1: '天安种植牙',
        subtitle: '6间专用手术室 · 导航引导精准手术',
        badge: '🦷 种植牙专科中心',
        sections: {
          why: { title: '选择我们的理由', items: [
            { icon: 'fa-microscope', t: '导航引导手术', d: '计算机引导种植体植入，最大精度，微创手术，恢复更快。' },
            { icon: 'fa-hospital', t: '6间独立手术室', d: '医院级无菌手术室，配备HEPA空气过滤系统。' },
            { icon: 'fa-flask', t: '院内技工室', d: '当天制作义齿。Straumann（瑞士）及Osstem高端种植体。' },
            { icon: 'fa-bed', t: '可选镇静治疗', d: '静脉镇静适合紧张患者。持证麻醉医师在岗。' }
          ]},
          access: { title: '地址', items: [
            '🚄 KTX天安牙山站 → 出租车10分钟',
            '📍 4楼种植牙中心，首尔BD牙科',
            '🅿️ 免费地下停车场',
            '☎ +82-41-415-2892'
          ]}
        },
        faq: [
          { q: '种植牙费用是多少？', a: '每颗80万～150万韩元（约4,200～7,900元人民币），视种植体品牌和骨骼状况而定。外国人与韩国患者同价。' },
          { q: '治疗需要多长时间？', a: '标准种植牙需3-6个月（2-3次就诊）。即刻种植适用于符合条件的病例。' }
        ]
      },
      invisalign: {
        title: '天安隐适美 | 钻石供应商 · 首尔大学正畸专家 — 首尔BD牙科',
        desc: '天安隐适美钻石供应商。首尔大学正畸专家、3D ClinCheck模拟、1楼专用正畸中心。外国人同价。Google 4.9★。☎+82-41-415-2892',
        h1: '天安隐适美',
        subtitle: '钻石供应商 · 首尔大学正畸专家',
        badge: '✨ 隐适美钻石供应商',
        sections: {
          why: { title: '选择我们的理由', items: [
            { icon: 'fa-award', t: '钻石供应商', d: '全球排名前1%的隐适美供应商。数千成功案例。' },
            { icon: 'fa-user-doctor', t: '首尔大学正畸专家', d: '首尔国立大学毕业的正畸专家亲自诊治。' },
            { icon: 'fa-cube', t: '3D ClinCheck模拟', d: '开始治疗前即可预览效果。AI数字化治疗方案。' },
            { icon: 'fa-building', t: '1楼专用正畸中心', d: '独立正畸楼层，配备专业设备。' }
          ]},
          access: { title: '地址', items: [
            '🚄 KTX天安牙山站 → 出租车10分钟',
            '📍 1楼正畸中心，首尔BD牙科',
            '🅿️ 免费地下停车场',
            '☎ +82-41-415-2892'
          ]}
        },
        faq: [
          { q: '隐适美费用是多少？', a: '300万～600万韩元（约15,800～31,600元人民币）。视复杂程度而定。外国人与韩国患者同价。' },
          { q: '矫正需要多长时间？', a: '通常12-18个月。简单病例可在6个月内完成。' }
        ]
      }
    }
  },

  th: {
    code: 'th', dir: 'th', htmlLang: 'th', ogLocale: 'th_TH',
    fontImport: '<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Thai:wght@300;400;500;700;900&display=swap" rel="stylesheet">',
    fontFamily: "'Noto Sans Thai', 'Pretendard', sans-serif",
    clinicName: 'โซล บีดี เดนทัล',
    addressLocal: '14, Buldang 34-gil, Seobuk-gu, Cheonan-si, Chungnam, เกาหลีใต้',
    koreaTxt: 'เกาหลีใต้',
    pages: {
      dental: {
        title: 'คลินิกทันตกรรมชอนัน | รองรับชาวต่างชาติ · ทันตแพทย์ SNU 15 คน · 400㎡ — โซล บีดี เดนทัล',
        desc: 'คลินิกทันตกรรมที่ดีที่สุดในชอนันสำหรับชาวต่างชาติ 400㎡ ห้องผ่าตัด 6 ห้อง ทันตแพทย์จาก Seoul National University 15 คน รากฟันเทียม Invisalign วีเนียร์ลามิเนต Glownate Google 4.9★ (2,847 รีวิว) ราคาเดียวกับคนเกาหลี ไม่มีค่านายหน้า ☎+82-41-415-2892',
        h1: 'คลินิกทันตกรรมชอนัน',
        subtitle: 'รองรับชาวต่างชาติ · ไม่มีนายหน้า · ราคาเดียวกับคนเกาหลี',
        badge: '🇰🇷 คลินิกทันตกรรมที่ใหญ่ที่สุดในชอนัน',
        sections: {
          why: { title: 'ทำไมต้องเลือก Seoul BD Dental?', items: [
            { icon: 'fa-hospital', t: 'สถานที่ระดับพรีเมียม 400㎡', d: 'คลินิกทันตกรรมที่ใหญ่ที่สุดในชอนัน ห้องผ่าตัดอิสระ 6 ห้อง ระบบควบคุมการติดเชื้อมาตรฐานโรงพยาบาล' },
            { icon: 'fa-user-doctor', t: 'ทันตแพทย์จาก SNU 15 คน', d: 'ทันตแพทย์ทั้ง 15 คนจบจาก Seoul National University — มหาวิทยาลัยแพทย์อันดับ 1 ของเกาหลี' },
            { icon: 'fa-won-sign', t: 'ราคาเดียวกัน ไม่มีนายหน้า', d: 'คุณจ่ายราคาเดียวกับผู้ป่วยชาวเกาหลี ไม่มีตัวกลาง ไม่บวกเพิ่ม' },
            { icon: 'fa-star', t: 'Google 4.9★ (2,847 รีวิว)', d: 'หนึ่งในคลินิกทันตกรรมที่ได้รับคะแนนสูงสุดในจังหวัดชุงนัม' }
          ]},
          treatments: { title: 'การรักษาของเรา', items: [
            { icon: 'fa-tooth', t: 'รากฟันเทียม', d: 'ห้องผ่าตัดเฉพาะทาง 6 ห้อง · การผ่าตัดนำทาง · สามารถใส่ฟันได้ทันที' },
            { icon: 'fa-teeth', t: 'Invisalign', d: 'Diamond Provider · ทันตแพทย์จัดฟันเฉพาะทาง · จำลอง 3D ClinCheck' },
            { icon: 'fa-sparkles', t: 'วีเนียร์ลามิเนต / Glownate', d: 'เตรียมฟันน้อยที่สุด · รับประกัน 10 ปี · เริ่มต้น ₩500,000/ซี่' },
            { icon: 'fa-teeth-open', t: 'ทันตกรรมทั่วไป', d: 'อุดฟัน ถอนฟันคุด ขูดหินปูน รักษาเหงือก ครอบฟัน' }
          ]},
          access: { title: 'วิธีเดินทาง', items: [
            '🚄 สถานี KTX Cheonan-Asan → แท็กซี่ 10 นาที',
            '🅿️ ที่จอดรถใต้ดินฟรี',
            '📍 14, Buldang 34-gil, Seobuk-gu, Cheonan-si',
            '☎ +82-41-415-2892'
          ]}
        },
        faq: [
          { q: 'มีพนักงานพูดภาษาไทยไหม?', a: 'เราสื่อสารภาษาอังกฤษพื้นฐานได้ และสนับสนุนแอปแปลภาษา คุณสามารถใช้แอปแปลภาษาได้ระหว่างการรักษา' },
          { q: 'ค่ารากฟันเทียมเท่าไหร่?', a: 'รากฟันเทียมราคา 800,000₩ ถึง 1,500,000₩ ต่อซี่ ชาวต่างชาติจ่ายราคาเดียวกับคนเกาหลี' }
        ]
      }
    }
  },

  ru: {
    code: 'ru', dir: 'ru', htmlLang: 'ru', ogLocale: 'ru_RU',
    fontImport: '',
    fontFamily: "'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif",
    clinicName: 'Seoul BD Dental',
    addressLocal: '14, Buldang 34-gil, Seobuk-gu, Cheonan-si, Chungnam, Южная Корея',
    koreaTxt: 'Южная Корея',
    pages: {
      dental: {
        title: 'Стоматология Чхонан | Для иностранцев · 15 врачей SNU · 400㎡ — Seoul BD Dental',
        desc: 'Лучшая стоматология в Чхонане для иностранцев. 400㎡, 6 операционных, 15 стоматологов из Сеульского национального университета. Имплантация, Invisalign, виниры, Glownate. Google 4.9★ (2 847 отзывов). Те же цены, что и для корейцев — без посредников. 10 мин от станции KTX. ☎+82-41-415-2892',
        h1: 'Стоматология в Чхонане',
        subtitle: 'Для иностранцев · Без посредников · Цены как для корейцев',
        badge: '🇰🇷 Крупнейшая стоматология Чхонана',
        sections: {
          why: { title: 'Почему Seoul BD Dental?', items: [
            { icon: 'fa-hospital', t: 'Клиника 400㎡', d: 'Крупнейшая стоматология Чхонана: 6 независимых операционных, система контроля инфекций.' },
            { icon: 'fa-user-doctor', t: '15 врачей из SNU', d: 'Все 15 стоматологов — выпускники Сеульского национального университета, медицинского вуза №1 в Корее.' },
            { icon: 'fa-won-sign', t: 'Одинаковые цены', d: 'Вы платите ровно столько же, сколько корейские пациенты. Никаких наценок.' },
            { icon: 'fa-star', t: 'Google 4.9★ (2 847 отзывов)', d: 'Одна из самых высоко оценённых стоматологий провинции Чхуннам.' }
          ]},
          treatments: { title: 'Наши услуги', items: [
            { icon: 'fa-tooth', t: 'Имплантация', d: '6 операционных · Навигационная хирургия · Возможна немедленная нагрузка' },
            { icon: 'fa-teeth', t: 'Invisalign', d: 'Diamond Provider · Ортодонт из SNU · 3D-моделирование ClinCheck' },
            { icon: 'fa-sparkles', t: 'Виниры / Glownate', d: 'Минимальная обточка · Гарантия 10 лет · От ₩500 000/зуб' },
            { icon: 'fa-teeth-open', t: 'Общая стоматология', d: 'Лечение кариеса, удаление зубов мудрости, чистка, лечение дёсен' }
          ]},
          access: { title: 'Как добраться', items: [
            '🚄 Станция KTX Чхонан-Асан → 10 мин на такси',
            '🅿️ Бесплатная подземная парковка',
            '📍 14, Buldang 34-gil, Seobuk-gu, Cheonan-si',
            '☎ +82-41-415-2892'
          ]}
        },
        faq: [
          { q: 'Есть русскоговорящий персонал?', a: 'Мы общаемся на базовом английском и поддерживаем приложения-переводчики. Вы можете использовать переводчик во время визита.' },
          { q: 'Сколько стоит имплантация?', a: 'Имплантация — от 800 000₩ до 1 500 000₩ за зуб. Иностранцы платят так же, как корейские пациенты.' }
        ]
      }
    }
  }
};


// ═══ HTML 생성 함수 ═══

function generatePage(langData, pageKey) {
  const pg = langData.pages[pageKey];
  if (!pg) return null;

  const langDir = langData.dir;
  const cssPath = langDir === 'en' || langDir === 'vi' || langDir === 'th' || langDir === 'ru' ? '../css/site-v5.css' : '../css/site-v5.css';

  // hreflang links
  const hreflangMap = {
    dental: { ko: '/', en: '/en/', vi: '/vi/', ja: '/jp/dental', 'zh-CN': '/cn/dental', th: '/th/', ru: '/ru/' },
    implant: { ko: '/treatments/implant', en: '/en/implant', vi: '/vi/implant', ja: '/jp/implant', 'zh-CN': '/cn/implant' },
    invisalign: { ko: '/treatments/invisalign', en: '/en/invisalign', vi: '/vi/invisalign', ja: '/jp/invisalign', 'zh-CN': '/cn/invisalign' },
    laminate: { ko: '/treatments/glownate', en: '/en/laminate', vi: '/vi/laminate', ja: '/jp/', 'zh-CN': '/cn/' }
  };
  const hrMap = hreflangMap[pageKey] || hreflangMap.dental;
  const hreflangTags = Object.entries(hrMap)
    .map(([l, u]) => `  <link rel="alternate" hreflang="${l}" href="${SITE_URL}${u}">`)
    .join('\n') + `\n  <link rel="alternate" hreflang="x-default" href="${SITE_URL}/en/">`;

  // FAQ JSON-LD
  const faqLD = pg.faq && pg.faq.length > 0 ? `
  <script type="application/ld+json">
  {"@context":"https://schema.org","@type":"FAQPage","mainEntity":[${pg.faq.map(f => `{"@type":"Question","name":"${f.q.replace(/"/g, '\\"')}","acceptedAnswer":{"@type":"Answer","text":"${f.a.replace(/"/g, '\\"')}"}}`).join(',')}]}
  </script>` : '';

  // Sections HTML
  let sectionsHTML = '';
  for (const [key, sec] of Object.entries(pg.sections || {})) {
    if (key === 'contact') {
      sectionsHTML += `
    <section class="intl-section intl-contact">
      <div class="intl-container">
        <h2><i class="fas fa-envelope"></i> ${sec.title}</h2>
        <div class="intl-grid intl-grid-3">
          ${sec.items.map(it => `
          <div class="intl-card intl-card-contact">
            <i class="fas ${it.icon}"></i>
            <h3>${it.t}</h3>
            <p>${it.d}</p>
          </div>`).join('')}
        </div>
      </div>
    </section>`;
    } else if (Array.isArray(sec.items) && typeof sec.items[0] === 'string') {
      // Access section (string array)
      sectionsHTML += `
    <section class="intl-section intl-access">
      <div class="intl-container">
        <h2><i class="fas fa-map-marker-alt"></i> ${sec.title}</h2>
        <div class="intl-access-list">
          ${sec.items.map(it => `<p>${it}</p>`).join('')}
        </div>
      </div>
    </section>`;
    } else {
      // Card sections
      const hasLinks = sec.items.some(it => it.link);
      sectionsHTML += `
    <section class="intl-section">
      <div class="intl-container">
        <h2>${sec.title}</h2>
        <div class="intl-grid${sec.items.length <= 3 ? ' intl-grid-3' : ''}">
          ${sec.items.map(it => {
            const inner = `
            <div class="intl-card-icon"><i class="fas ${it.icon}"></i></div>
            <h3>${it.t}</h3>
            <p>${it.d}</p>`;
            return it.link ? `<a href="${it.link}" class="intl-card intl-card-link">${inner}</a>` : `<div class="intl-card">${inner}</div>`;
          }).join('')}
        </div>
      </div>
    </section>`;
    }
  }

  // FAQ HTML
  let faqHTML = '';
  if (pg.faq && pg.faq.length > 0) {
    faqHTML = `
    <section class="intl-section intl-faq">
      <div class="intl-container">
        <h2>FAQ</h2>
        ${pg.faq.map(f => `
        <details class="intl-faq-item">
          <summary>${f.q}</summary>
          <p>${f.a}</p>
        </details>`).join('')}
      </div>
    </section>`;
  }

  const canonicalPath = `/${langDir}/${pageKey === 'dental' ? '' : pageKey}`;

  return `<!DOCTYPE html>
<html lang="${langData.htmlLang}" prefix="og: https://ogp.me/ns#">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0">
<title>${pg.title}</title>
<meta name="description" content="${pg.desc}">
<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1">
<link rel="canonical" href="${SITE_URL}${canonicalPath}">
<meta name="geo.region" content="KR-44">
<meta name="geo.placename" content="Cheonan-si, Chungcheongnam-do">
<meta name="geo.position" content="36.8151;127.1139">
<meta property="og:title" content="${pg.h1} — ${langData.clinicName}">
<meta property="og:description" content="${pg.desc.substring(0, 200)}">
<meta property="og:type" content="website">
<meta property="og:url" content="${SITE_URL}${canonicalPath}">
<meta property="og:locale" content="${langData.ogLocale}">
<meta property="og:site_name" content="${langData.clinicName}">
<meta property="og:image" content="${SITE_URL}/images/og-glownate.jpg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${pg.h1} — ${langData.clinicName}">
<meta name="twitter:description" content="${pg.desc.substring(0, 200)}">
${hreflangTags}
<link rel="icon" type="image/svg+xml" href="/images/icons/favicon.svg">
<link rel="apple-touch-icon" sizes="180x180" href="/images/icons/apple-touch-icon.svg">
<meta name="theme-color" content="#C9A042">
<link rel="preconnect" href="https://cdn.jsdelivr.net" crossorigin>
<link rel="preload" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css" as="style" onload="this.onload=null;this.rel='stylesheet'">
<noscript><link href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css" rel="stylesheet"></noscript>
<link rel="preload" href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" as="style" onload="this.onload=null;this.rel='stylesheet'">
<noscript><link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css"></noscript>
${langData.fontImport}

<script type="application/ld+json">
{"@context":"https://schema.org","@type":"Dentist","name":"${langData.clinicName}","url":"${SITE_URL}${canonicalPath}","telephone":"${PHONE}","address":{"@type":"PostalAddress","streetAddress":"${langData.addressLocal}","addressLocality":"Cheonan","addressRegion":"Chungcheongnam-do","addressCountry":"KR"},"geo":{"@type":"GeoCoordinates","latitude":36.8151,"longitude":127.1139},"aggregateRating":{"@type":"AggregateRating","ratingValue":"4.9","reviewCount":"2847"},"availableLanguage":["ko","en","ja","zh","vi","th","ru"],"areaServed":{"@type":"City","name":"Cheonan"}}
</script>
${faqLD}

<style>
:root{--gold:#C9A042;--gold-light:#E8C252;--gold-dark:#8B6914;--brown:#6B4226;--bg:#FAFAF7;--white:#fff;--text:#2D2A26;--text-light:#6B6560;--radius:16px}
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:${langData.fontFamily};background:var(--bg);color:var(--text);line-height:1.7}
.intl-hero{background:linear-gradient(135deg,#1a1a2e 0%,#16213e 40%,#0f3460 100%);color:#fff;padding:80px 20px 60px;text-align:center}
.intl-hero__badge{display:inline-block;padding:6px 18px;background:rgba(201,160,66,.15);border:1px solid rgba(201,160,66,.3);border-radius:30px;font-size:.82rem;color:var(--gold-light);margin-bottom:20px}
.intl-hero h1{font-size:2.4rem;font-weight:900;margin-bottom:12px;background:linear-gradient(135deg,#fff,var(--gold-light));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
.intl-hero__sub{font-size:1.05rem;color:rgba(255,255,255,.7);max-width:600px;margin:0 auto 28px}
.intl-hero__cta{display:inline-flex;align-items:center;gap:8px;padding:14px 32px;background:linear-gradient(135deg,var(--gold),var(--gold-dark));color:#fff;text-decoration:none;border-radius:30px;font-weight:700;font-size:1rem;transition:transform .2s}
.intl-hero__cta:hover{transform:translateY(-2px)}
.intl-container{max-width:960px;margin:0 auto;padding:0 20px}
.intl-section{padding:56px 0}
.intl-section:nth-child(even){background:var(--white)}
.intl-section h2{font-size:1.6rem;font-weight:800;color:var(--text);margin-bottom:32px;text-align:center}
.intl-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:20px}
.intl-grid-3{grid-template-columns:repeat(auto-fit,minmax(260px,1fr))}
.intl-card{background:var(--bg);border-radius:var(--radius);padding:28px 24px;border:1px solid rgba(107,66,38,.08);transition:transform .2s,box-shadow .2s}
.intl-card:hover{transform:translateY(-3px);box-shadow:0 8px 32px rgba(107,66,38,.1)}
.intl-card-link{text-decoration:none;color:inherit;display:block}
.intl-card-icon{width:48px;height:48px;border-radius:12px;background:linear-gradient(135deg,rgba(201,160,66,.1),rgba(201,160,66,.2));display:flex;align-items:center;justify-content:center;margin-bottom:14px;font-size:1.2rem;color:var(--gold-dark)}
.intl-card h3{font-size:1.05rem;font-weight:700;margin-bottom:8px;color:var(--text)}
.intl-card p{font-size:.88rem;color:var(--text-light);line-height:1.6}
.intl-card-contact{text-align:center}
.intl-card-contact i{font-size:1.8rem;color:var(--gold);margin-bottom:12px}
.intl-access-list{max-width:500px;margin:0 auto}
.intl-access-list p{padding:10px 0;font-size:1rem;border-bottom:1px solid rgba(0,0,0,.06)}
.intl-faq{background:var(--white)}
.intl-faq-item{border:1px solid rgba(107,66,38,.1);border-radius:var(--radius);margin-bottom:12px;overflow:hidden}
.intl-faq-item summary{padding:18px 24px;font-weight:700;font-size:.95rem;cursor:pointer;list-style:none;background:var(--bg)}
.intl-faq-item summary::-webkit-details-marker{display:none}
.intl-faq-item summary::after{content:'+';float:right;font-size:1.2rem;color:var(--gold)}
.intl-faq-item[open] summary::after{content:'−'}
.intl-faq-item p{padding:16px 24px;font-size:.9rem;color:var(--text-light);line-height:1.7}
.intl-footer{background:#1a1a2e;color:rgba(255,255,255,.6);padding:40px 20px;text-align:center;font-size:.82rem}
.intl-footer a{color:var(--gold-light);text-decoration:none}
.intl-lang-bar{display:flex;justify-content:center;gap:12px;flex-wrap:wrap;margin-bottom:16px}
.intl-lang-bar a{color:rgba(255,255,255,.5);text-decoration:none;font-size:.8rem;padding:4px 10px;border-radius:20px;border:1px solid rgba(255,255,255,.1);transition:all .2s}
.intl-lang-bar a:hover,.intl-lang-bar a.active{color:var(--gold-light);border-color:var(--gold)}
@media(max-width:600px){.intl-hero h1{font-size:1.8rem}.intl-hero{padding:60px 16px 40px}.intl-section{padding:40px 0}.intl-grid{grid-template-columns:1fr}}
</style>
</head>
<body>
  <header class="intl-hero">
    <span class="intl-hero__badge">${pg.badge}</span>
    <h1>${pg.h1}</h1>
    <p class="intl-hero__sub">${pg.subtitle}</p>
    <a href="tel:${PHONE}" class="intl-hero__cta"><i class="fas fa-phone"></i> ${PHONE_DISPLAY}</a>
  </header>

  <main>
    ${sectionsHTML}
    ${faqHTML}
  </main>

  <footer class="intl-footer">
    <nav class="intl-lang-bar">
      <a href="/en/">English</a>
      <a href="/vi/">Tiếng Việt</a>
      <a href="/jp/">日本語</a>
      <a href="/cn/">中文</a>
      <a href="/th/">ไทย</a>
      <a href="/ru/">Русский</a>
      <a href="/">한국어</a>
    </nav>
    <p>${langData.clinicName} · ${langData.addressLocal}</p>
    <p>☎ <a href="tel:${PHONE}">${PHONE}</a> · <a href="${SITE_URL}">${SITE_URL.replace('https://', '')}</a></p>
    <p style="margin-top:8px">© 2026 Seoul BD Dental. All rights reserved.</p>
  </footer>
</body>
</html>`;
}


// ═══ 실행: 모든 페이지 생성 ═══

let created = 0;
for (const [langCode, langData] of Object.entries(LANGS)) {
  const dir = path.join(__dirname, '..', langData.dir);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  for (const pageKey of Object.keys(langData.pages)) {
    // Skip existing glownate pages (JP/CN index.html)
    const filename = pageKey === 'dental' ? 'index.html' : `${pageKey}.html`;
    const filepath = path.join(dir, filename);

    // For JP and CN, DON'T overwrite existing index.html (glownate page)
    if ((langCode === 'ja' || langCode === 'zh-CN') && pageKey === 'dental') {
      // Instead, create dental.html as a separate "종합 치과" page
      const dentalPath = path.join(dir, 'dental.html');
      const html = generatePage(langData, pageKey);
      if (html) {
        fs.writeFileSync(dentalPath, html, 'utf-8');
        console.log(`✅ ${langData.dir}/dental.html`);
        created++;
      }
      continue;
    }

    const html = generatePage(langData, pageKey);
    if (html) {
      fs.writeFileSync(filepath, html, 'utf-8');
      console.log(`✅ ${langData.dir}/${filename}`);
      created++;
    }
  }
}

console.log(`\n🎉 Total: ${created} pages created`);
