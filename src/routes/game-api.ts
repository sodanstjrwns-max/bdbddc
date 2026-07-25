// ============================================================
// 게임/인터랙션 통계 API — v5.36 라우트 분할 (순수 이동, 동작 변경 없음)
// 치BTI · 치아비행 · 러닝 · 충치디펜스 리더보드
// ============================================================
import type { Hono } from 'hono'
import type { Bindings } from '../types'

export function registerGameApis(app: Hono<{ Bindings: Bindings }>) {
// ============================================
// 치BTI 참여 통계 API
// ============================================

// POST /api/chbti/result - 결과 저장
app.post('/api/chbti/result', async (c) => {
  try {
    const { type_code } = await c.req.json<{ type_code: string }>()
    
    if (!type_code || !/^[PECNSHAF]{4}$/.test(type_code)) {
      return c.json({ error: 'Invalid type_code' }, 400)
    }
    
    const db = c.env.DB
    if (!db) {
      return c.json({ error: 'DB not available' }, 500)
    }
    
    await db.prepare('INSERT INTO chbti_results (type_code) VALUES (?)').bind(type_code).run()
    
    // 바로 통계 반환
    const totalResult = await db.prepare('SELECT COUNT(*) as total FROM chbti_results').first<{ total: number }>()
    const typeResult = await db.prepare('SELECT COUNT(*) as cnt FROM chbti_results WHERE type_code = ?').bind(type_code).first<{ cnt: number }>()
    
    const total = totalResult?.total || 0
    const typeCount = typeResult?.cnt || 0
    const percentage = total > 0 ? Math.round((typeCount / total) * 1000) / 10 : 0
    
    return c.json({ 
      success: true, 
      total_participants: total,
      type_code,
      type_count: typeCount,
      type_percentage: percentage
    })
  } catch (e: any) {
    return c.json({ error: e.message }, 500)
  }
})

// GET /api/chbti/stats - 전체 통계 조회
app.get('/api/chbti/stats', async (c) => {
  try {
    const db = c.env.DB
    if (!db) {
      return c.json({ error: 'DB not available' }, 500)
    }
    
    const totalResult = await db.prepare('SELECT COUNT(*) as total FROM chbti_results').first<{ total: number }>()
    const typeStats = await db.prepare(
      'SELECT type_code, COUNT(*) as cnt FROM chbti_results GROUP BY type_code ORDER BY cnt DESC'
    ).all<{ type_code: string; cnt: number }>()
    
    const total = totalResult?.total || 0
    const types = (typeStats?.results || []).map(r => ({
      type_code: r.type_code,
      count: r.cnt,
      percentage: total > 0 ? Math.round((r.cnt / total) * 1000) / 10 : 0
    }))
    
    return c.json({ total_participants: total, types })
  } catch (e: any) {
    return c.json({ error: e.message }, 500)
  }
})

// ============================================
// 치석 플라이트 API
// ============================================

// POST /api/flight/result - 점수 저장
app.post('/api/flight/result', async (c) => {
  try {
    const { score, grade } = await c.req.json<{ score: number; grade: string }>()
    
    if (typeof score !== 'number' || !grade) {
      return c.json({ error: 'Invalid data' }, 400)
    }
    
    const db = c.env.DB
    if (!db) return c.json({ error: 'DB not available' }, 500)
    
    await db.prepare('INSERT INTO flight_scores (score, grade) VALUES (?, ?)').bind(score, grade).run()
    
    const totalResult = await db.prepare('SELECT COUNT(*) as total FROM flight_scores').first<{ total: number }>()
    const avgResult = await db.prepare('SELECT AVG(score) as avg FROM flight_scores').first<{ avg: number }>()
    const rankResult = await db.prepare('SELECT COUNT(*) as better FROM flight_scores WHERE score > ?').bind(score).first<{ better: number }>()
    
    const total = totalResult?.total || 0
    const avg = avgResult?.avg || 0
    const rank = (rankResult?.better || 0) + 1
    const topPercent = total > 0 ? Math.round((rank / total) * 100) : 100
    
    return c.json({
      success: true,
      total_players: total,
      avg_score: Math.round(avg),
      rank,
      top_percent: topPercent
    })
  } catch (e: any) {
    return c.json({ error: e.message }, 500)
  }
})

// GET /api/flight/stats - 통계 조회
app.get('/api/flight/stats', async (c) => {
  try {
    const db = c.env.DB
    if (!db) return c.json({ error: 'DB not available' }, 500)
    
    const totalResult = await db.prepare('SELECT COUNT(*) as total FROM flight_scores').first<{ total: number }>()
    const avgResult = await db.prepare('SELECT AVG(score) as avg FROM flight_scores').first<{ avg: number }>()
    const topScores = await db.prepare(
      'SELECT score, grade, created_at FROM flight_scores ORDER BY score DESC LIMIT 10'
    ).all<{ score: number; grade: string; created_at: string }>()
    
    return c.json({
      total_players: totalResult?.total || 0,
      avg_score: Math.round(avgResult?.avg || 0),
      top_scores: topScores?.results || []
    })
  } catch (e: any) {
    return c.json({ error: e.message }, 500)
  }
})

// ===== TOOTH RUN API =====

// POST /api/run/result - 생존시간 저장
app.post('/api/run/result', async (c) => {
  try {
    const db = c.env.DB
    if (!db) return c.json({ error: 'DB not available' }, 500)
    
    const { time, grade } = await c.req.json<{ time: number; grade: string }>()
    if (typeof time !== 'number' || !grade) {
      return c.json({ error: 'time and grade required' }, 400)
    }
    
    await db.prepare('INSERT INTO run_scores (survival_time, grade) VALUES (?, ?)').bind(time, grade).run()
    
    const totalResult = await db.prepare('SELECT COUNT(*) as total FROM run_scores').first<{ total: number }>()
    const avgResult = await db.prepare('SELECT AVG(survival_time) as avg FROM run_scores').first<{ avg: number }>()
    const rankResult = await db.prepare('SELECT COUNT(*) as better FROM run_scores WHERE survival_time > ?').bind(time).first<{ better: number }>()
    
    const total = totalResult?.total || 1
    const rank = (rankResult?.better || 0) + 1
    const topPercent = Math.max(1, Math.round((rank / total) * 100))
    
    return c.json({
      success: true,
      rank: rank,
      total_players: total,
      top_percent: topPercent,
      avg_time: avgResult?.avg || 0
    })
  } catch (e: any) {
    return c.json({ error: e.message }, 500)
  }
})

// GET /api/run/stats - 통계 조회
app.get('/api/run/stats', async (c) => {
  try {
    const db = c.env.DB
    if (!db) return c.json({ error: 'DB not available' }, 500)
    
    const totalResult = await db.prepare('SELECT COUNT(*) as total FROM run_scores').first<{ total: number }>()
    const avgResult = await db.prepare('SELECT AVG(survival_time) as avg FROM run_scores').first<{ avg: number }>()
    const topScores = await db.prepare(
      'SELECT survival_time, grade, created_at FROM run_scores ORDER BY survival_time DESC LIMIT 10'
    ).all<{ survival_time: number; grade: string; created_at: string }>()
    
    return c.json({
      total_players: totalResult?.total || 0,
      avg_time: avgResult?.avg || 0,
      top_scores: topScores?.results || []
    })
  } catch (e: any) {
    return c.json({ error: e.message }, 500)
  }
})

// ============================================
// CAVITY DEFENSE — 충치 디펜스 리더보드 API
// ============================================
function cdWeekKey(): string {
  // ISO 주간 키 (월요일 리셋): YYYY-WW
  const d = new Date()
  const target = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()))
  const dayNum = (target.getUTCDay() + 6) % 7
  target.setUTCDate(target.getUTCDate() - dayNum + 3)
  const firstThursday = new Date(Date.UTC(target.getUTCFullYear(), 0, 4))
  const week = 1 + Math.round(((target.getTime() - firstThursday.getTime()) / 86400000 - 3 + ((firstThursday.getUTCDay() + 6) % 7)) / 7)
  return `${target.getUTCFullYear()}-${String(week).padStart(2, '0')}`
}

// POST /api/cavity-defense/score — 점수 등록 + 상위 % 반환
app.post('/api/cavity-defense/score', async (c) => {
  try {
    const db = c.env.DB
    if (!db) return c.json({ error: 'DB not available' }, 500)

    const body = await c.req.json<{ nickname: string; score: number; stage: number; wave: number; cleared: boolean; rank_name: string }>()
    const nickname = String(body.nickname || '익명의 수호자').slice(0, 10).replace(/[<>"'&]/g, '')
    const score = Math.max(0, Math.min(999999, Math.floor(Number(body.score) || 0)))
    const stage = Math.max(1, Math.min(3, Math.floor(Number(body.stage) || 1)))
    const wave = Math.max(0, Math.min(20, Math.floor(Number(body.wave) || 0)))
    const cleared = body.cleared ? 1 : 0
    const rankName = String(body.rank_name || '').slice(0, 20)
    const weekKey = cdWeekKey()

    const result = await db.prepare(
      'INSERT INTO cavity_defense_scores (nickname, score, stage, wave, cleared, rank_name, week_key) VALUES (?, ?, ?, ?, ?, ?, ?)'
    ).bind(nickname, score, stage, wave, cleared, rankName, weekKey).run()

    const totalResult = await db.prepare('SELECT COUNT(*) as total FROM cavity_defense_scores').first<{ total: number }>()
    const betterResult = await db.prepare('SELECT COUNT(*) as better FROM cavity_defense_scores WHERE score > ?').bind(score).first<{ better: number }>()
    const total = totalResult?.total || 1
    const rank = (betterResult?.better || 0) + 1
    const topPercent = Math.min(100, Math.max(1, Math.ceil(((rank - 1) / total) * 100) || 1))

    return c.json({
      success: true,
      id: result.meta.last_row_id,
      rank, total_players: total, top_percent: topPercent, week: weekKey
    })
  } catch (e: any) {
    return c.json({ error: e.message }, 500)
  }
})

// GET /api/cavity-defense/leaderboard — 주간 TOP 100
app.get('/api/cavity-defense/leaderboard', async (c) => {
  try {
    const db = c.env.DB
    if (!db) return c.json({ error: 'DB not available' }, 500)
    const weekKey = cdWeekKey()
    const scores = await db.prepare(
      'SELECT id, nickname, score, stage, wave, cleared, rank_name, created_at FROM cavity_defense_scores WHERE week_key = ? ORDER BY score DESC LIMIT 100'
    ).bind(weekKey).all<{ id: number; nickname: string; score: number; stage: number; wave: number; cleared: number; rank_name: string; created_at: string }>()
    const totalResult = await db.prepare('SELECT COUNT(*) as total FROM cavity_defense_scores WHERE week_key = ?').bind(weekKey).first<{ total: number }>()
    return c.json({
      week: weekKey,
      total_players: totalResult?.total || 0,
      scores: scores?.results || []
    })
  } catch (e: any) {
    return c.json({ error: e.message }, 500)
  }
})
}
