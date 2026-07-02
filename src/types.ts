// ============================================
// 공통 타입 정의 (index.tsx에서 모듈 분리 — 2026-07-02)
// ============================================
export type Bindings = {
  DB?: D1Database
  R2?: R2Bucket
  ASSETS?: { fetch: (req: Request) => Promise<Response> }
  OPENAI_API_KEY?: string
  ADMIN_PASSWORD?: string
  ADMIN_SESSION_SECRET?: string
  GOOGLE_CLIENT_ID?: string
  GOOGLE_CLIENT_SECRET?: string
  GMAIL_APP_PASSWORD?: string
  NOTIFICATION_EMAIL?: string
  TURNSTILE_SECRET_KEY?: string
  RESEND_API_KEY?: string
}
