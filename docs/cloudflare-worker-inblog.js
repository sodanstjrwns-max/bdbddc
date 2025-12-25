/**
 * Cloudflare Worker - Inblog 프록시
 * 
 * 사용 방법:
 * 1. Cloudflare 대시보드 → Workers → Create a Service
 * 2. 이 코드를 붙여넣기
 * 3. Routes 설정: bdbddc.com/blog/*
 */

const INBLOG_PROXY = 'https://proxy.inblog.dev/bdbddc';

export default {
  async fetch(request) {
    const url = new URL(request.url);
    
    // /blog 또는 /blog/* 경로인 경우 Inblog로 프록시
    if (url.pathname === '/blog' || url.pathname.startsWith('/blog/')) {
      const inblogPath = url.pathname.replace('/blog', '') || '/';
      const inblogUrl = INBLOG_PROXY + inblogPath + url.search;
      
      // Inblog에서 콘텐츠 가져오기
      const response = await fetch(inblogUrl, {
        method: request.method,
        headers: {
          'Host': 'proxy.inblog.dev',
          'User-Agent': request.headers.get('User-Agent'),
          'Accept': request.headers.get('Accept'),
          'Accept-Language': request.headers.get('Accept-Language'),
        }
      });
      
      // 응답 헤더 수정
      const newResponse = new Response(response.body, response);
      newResponse.headers.set('X-Proxied-By', 'Cloudflare-Worker');
      
      return newResponse;
    }
    
    // 다른 경로는 원래 사이트로
    return fetch(request);
  }
};
