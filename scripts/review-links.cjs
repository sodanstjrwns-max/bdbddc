// User policy (2026-09-21): show external destinations only; never copy ratings or testimonials.
const NAVER_REVIEWS = 'https://map.naver.com/p/entry/place/1541238930?c=15,0,0,0,dh,nil,nil,nil,review';
const GOOGLE_REVIEWS = 'https://www.google.com/maps/search/불당본점서울비디치과의원';
const labels = {
  ko: ['리뷰 확인', '리뷰는 네이버·구글에서 확인해 주세요', '네이버 리뷰 확인하기', '구글 리뷰 확인하기'],
  en: ['Read reviews', 'Read reviews directly on Naver and Google', 'Read reviews on Naver', 'Read reviews on Google'],
  jp: ['口コミを確認', '口コミはネイバー・Googleでご確認ください', 'ネイバーで口コミを確認', 'Googleで口コミを確認'],
};
function reviewLinks(lang = 'ko') {
  const [label, title, naver, google] = labels[lang] || labels.ko;
  return `<section class="reviews-section section" aria-label="${label}">
  <div class="reviews-container">
    <div class="reviews-header reveal"><h2>${title}</h2></div>
    <div class="reviews-external-links reveal" style="display:flex;flex-wrap:wrap;justify-content:center;gap:16px;margin-top:32px;margin-bottom:24px;">
      <a href="${NAVER_REVIEWS}" target="_blank" rel="noopener noreferrer" style="display:inline-flex;align-items:center;gap:10px;padding:16px 32px;background:#03C75A;color:white;border-radius:12px;text-decoration:none;font-size:1rem;font-weight:700;"><i class="fas fa-external-link-alt" aria-hidden="true"></i> ${naver}</a>
      <a href="${GOOGLE_REVIEWS}" target="_blank" rel="noopener noreferrer" style="display:inline-flex;align-items:center;gap:10px;padding:16px 32px;background:#4285F4;color:white;border-radius:12px;text-decoration:none;font-size:1rem;font-weight:700;"><i class="fab fa-google" aria-hidden="true"></i> ${google}</a>
    </div>
  </div>
</section>`;
}
module.exports = { reviewLinks, NAVER_REVIEWS, GOOGLE_REVIEWS };
