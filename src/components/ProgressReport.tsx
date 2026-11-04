import type { WeekData } from '../types'
import { DAY_NAMES_FULL, WORKOUT_TYPE_COLORS, WORKOUT_TYPE_LABELS, hasDistance } from '../types'
import { formatWeekRange } from '../weekUtils'

interface ProgressReportProps {
  week: WeekData;
  weekId: string;
  onClose: () => void;
}

export function ProgressReport({ week, weekId, onClose }: ProgressReportProps) {
  const total = week.workouts.length
  const completed = week.workouts.filter(w => w.completed).length
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0

  const distanceByType = (['running', 'indoor-bike'] as const).map(type => {
    const typeWorkouts = week.workouts.filter(w => w.type === type && hasDistance(w.type))
    const totalKm = typeWorkouts.reduce((sum, w) => sum + (w.distance ?? 0), 0)
    const completedKm = typeWorkouts
      .filter(w => w.completed)
      .reduce((sum, w) => sum + (w.distance ?? 0), 0)
    return { type, totalKm, completedKm, count: typeWorkouts.length }
  }).filter(d => d.count > 0)

  const byDay = DAY_NAMES_FULL.map((name, i) => {
    const dayWorkouts = week.workouts.filter(w => w.day === i)
    return {
      name,
      total: dayWorkouts.length,
      completed: dayWorkouts.filter(w => w.completed).length,
    }
  }).filter(d => d.total > 0)

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal report-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Weekly Report</h2>
          <button className="icon-btn" onClick={onClose} aria-label="Close">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
          </button>
        </div>

        <div className="report-subtitle">{weekId} &middot; {formatWeekRange(weekId)}</div>

        {total === 0 ? (
          <p className="report-empty">No workouts planned this week.</p>
        ) : (
          <>
            <div className="report-hero">
              <div className="progress-ring-container">
                <svg viewBox="0 0 120 120" className="progress-ring">
                  <circle cx="60" cy="60" r="52" fill="none" stroke="var(--surface-2)" strokeWidth="10" />
                  <circle
                    cx="60" cy="60" r="52"
                    fill="none"
                    stroke="var(--accent)"
                    strokeWidth="10"
                    strokeLinecap="round"
                    strokeDasharray={`${(pct / 100) * 327} 327`}
                    transform="rotate(-90 60 60)"
                  />
                </svg>
                <div className="progress-ring-label">
                  <span className="pct">{pct}%</span>
                </div>
              </div>
              <div className="report-hero-stats">
                <div className="stat">
                  <span className="stat-value">{completed}/{total}</span>
                  <span className="stat-label">Workouts completed</span>
                </div>
              </div>
            </div>

            {distanceByType.length > 0 && (
              <div className="report-distance">
                <h3>Distance</h3>
                <div className="distance-cards">
                  {distanceByType.map(d => (
                    <div key={d.type} className="distance-card" style={{ borderColor: WORKOUT_TYPE_COLORS[d.type] }}>
                      <span className="distance-type">{WORKOUT_TYPE_LABELS[d.type]}</span>
                      <span className="distance-value">{d.completedKm.toFixed(1)} / {d.totalKm.toFixed(1)} km</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="report-days">
              <h3>By day</h3>
              {byDay.map(d => (
                <div key={d.name} className="report-day-row">
                  <span className="report-day-name">{d.name}</span>
                  <div className="report-day-bar-container">
                    <div
                      className="report-day-bar"
                      style={{ width: `${d.total > 0 ? (d.completed / d.total) * 100 : 0}%` }}
                    />
                  </div>
                  <span className="report-day-count">{d.completed}/{d.total}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
