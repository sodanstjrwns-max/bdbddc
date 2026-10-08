(() => {
  const marker = 'data-bd-related-treatment';
  function restoreLink() {
    let path;
    try { path = decodeURIComponent(location.pathname).replace(/\/$/, ''); } catch { return; }
    if (path !== '/blog/천안임플란트' || document.querySelector('[' + marker + ']')) return;
    const heading = document.querySelector('main h1') || document.querySelector('h1');
    if (!heading) return;
    const box = document.createElement('aside');
    box.setAttribute(marker, '');
    box.style.cssText = 'max-width:768px;margin:32px auto;padding:24px;background:#faf7f3;border:1px solid #e8d9c1;border-radius:16px;';
    const intro = document.createElement('p');
    intro.textContent = '비용을 비교하기 전, 치료 과정과 상담에서 확인할 사항도 함께 살펴보세요.';
    intro.style.cssText = 'font-size:0.9rem;color:#736354;margin:0 0 12px;line-height:1.7;word-break:keep-all;';
    const link = document.createElement('a');
    link.href = '/treatments/implant';
    link.textContent = '천안 임플란트 진료 보기';
    link.style.cssText = 'display:inline-flex;align-items:center;padding:10px 18px;background:#fff;border:1px solid #c9a96e;border-radius:50px;text-decoration:none;color:#6B4226;font-weight:600;font-size:0.9rem;';
    box.append(intro, link);
    heading.after(box);
  }
  restoreLink();
  const observer = new MutationObserver(restoreLink);
  observer.observe(document.body, { childList: true, subtree: true });
  window.addEventListener('pagehide', () => observer.disconnect(), { once: true });
})();
