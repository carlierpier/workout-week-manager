import { useState } from 'react'
import type { WorkoutType } from '../types'
import { WORKOUT_TYPES, WORKOUT_TYPE_LABELS, hasDistance, hasGoals } from '../types'

interface WorkoutModalProps {
  day: string;
  initialName?: string;
  initialType?: WorkoutType;
  initialDistance?: number;
  initialGoals?: string[];
  onSave: (name: string, type: WorkoutType, distance?: number, goals?: string[]) => void;
  onClose: () => void;
}

export function WorkoutModal({ day, initialName, initialType, initialDistance, initialGoals, onSave, onClose }: WorkoutModalProps) {
  const [name, setName] = useState(initialName ?? '')
  const [type, setType] = useState<WorkoutType>(initialType ?? 'strength')
  const [distance, setDistance] = useState(initialDistance != null ? String(initialDistance) : '')
  const [goals, setGoals] = useState<string[]>(initialGoals ?? [''])

  const updateGoal = (index: number, value: string) => {
    setGoals(prev => prev.map((g, i) => i === index ? value : g))
  }

  const removeGoal = (index: number) => {
    setGoals(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    const dist = hasDistance(type) && distance ? parseFloat(distance) : undefined
    const parsedGoals = hasGoals(type) ? goals.filter(g => g.trim()).map(g => g.trim()) : undefined
    onSave(name.trim(), type, dist, parsedGoals)
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{initialName ? 'Edit' : 'Add'} Workout — {day}</h2>
          <button className="icon-btn" onClick={onClose} aria-label="Close">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Type</label>
            <div className="type-selector">
              {WORKOUT_TYPES.map(t => (
                <button
                  key={t}
                  type="button"
                  className={`type-chip ${type === t ? 'active' : ''}`}
                  data-type={t}
                  onClick={() => setType(t)}
                >
                  {WORKOUT_TYPE_LABELS[t]}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="workout-name">Workout name</label>
            <input
              id="workout-name"
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. PULL at Work, Muscle-Up Workout, 5K Run..."
              autoFocus
            />
          </div>

          {hasDistance(type) && (
            <div className="form-group">
              <label htmlFor="workout-distance">Distance (km)</label>
              <input
                id="workout-distance"
                type="number"
                min="0"
                step="0.1"
                value={distance}
                onChange={e => setDistance(e.target.value)}
                placeholder="e.g. 5.0"
              />
            </div>
          )}

          {hasGoals(type) && (
            <div className="goals-section">
              <h3>Goals</h3>
              {goals.map((goal, i) => (
                <div key={i} className="goal-row">
                  <input
                    type="text"
                    value={goal}
                    onChange={e => updateGoal(i, e.target.value)}
                    placeholder="e.g. Pull-up, Muscle-up, Dips..."
                  />
                  {goals.length > 1 && (
                    <button
                      type="button"
                      className="icon-btn delete-btn"
                      onClick={() => removeGoal(i)}
                      aria-label="Remove goal"
                    >
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 4h10M5.5 4V3a1 1 0 011-1h3a1 1 0 011 1v1M6.5 7v4M9.5 7v4M4.5 4l.5 8a1 1 0 001 1h4a1 1 0 001-1l.5-8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                className="btn btn-ghost add-goal-btn"
                onClick={() => setGoals(prev => [...prev, ''])}
              >
                + Add goal
              </button>
            </div>
          )}

          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={!name.trim()}>
              {initialName ? 'Save changes' : 'Add workout'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
