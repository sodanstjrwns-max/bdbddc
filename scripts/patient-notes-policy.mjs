// User approved four daily notes on 2026-09-23. Keep earlier audits historical.
export const FOUR_NOTES_START = '2026-09-23'
export const FOUR_NOTES_REVIEW = '2026-10-07'

export function dailyNoteLimit(kstDate) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(kstDate)) throw new Error('Expected KST YYYY-MM-DD')
  return kstDate < FOUR_NOTES_START ? 2 : 4
}
