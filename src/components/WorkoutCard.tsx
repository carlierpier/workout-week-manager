import type { Workout } from '../types'
import { WORKOUT_TYPE_COLORS, WORKOUT_TYPE_LABELS, hasDistance, hasGoals } from '../types'

interface WorkoutCardProps {
  workout: Workout;
  onEdit: () => void;
  onDelete: () => void;
  onToggleComplete: () => void;
}

export function WorkoutCard({ workout, onEdit, onDelete, onToggleComplete }: WorkoutCardProps) {
  const typeColor = WORKOUT_TYPE_COLORS[workout.type]

  return (
    <div className={`workout-card ${workout.completed ? 'completed' : ''}`} style={{ borderLeftColor: typeColor }}>
      <div className="workout-card-header">
        <button
          className={`check-btn ${workout.completed ? 'checked' : ''}`}
          onClick={onToggleComplete}
          aria-label={workout.completed ? 'Mark incomplete' : 'Mark complete'}
        >
          {workout.completed ? '✓' : ''}
        </button>
        <span className="workout-name">
          {workout.name}
        </span>
        <span className="type-badge" style={{ background: typeColor }}>
          {WORKOUT_TYPE_LABELS[workout.type]}
        </span>
        <div className="workout-actions">
          <button className="icon-btn" onClick={onEdit} aria-label="Edit">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M11.5 1.5l3 3-9 9H2.5v-3l9-9z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/></svg>
          </button>
          <button className="icon-btn delete-btn" onClick={onDelete} aria-label="Delete">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 4h10M5.5 4V3a1 1 0 011-1h3a1 1 0 011 1v1M6.5 7v4M9.5 7v4M4.5 4l.5 8a1 1 0 001 1h4a1 1 0 001-1l.5-8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
        </div>
      </div>
      {hasDistance(workout.type) && workout.distance != null && workout.distance > 0 && (
        <div className="workout-meta">
          {workout.distance} km
        </div>
      )}
      {hasGoals(workout.type) && workout.goals && workout.goals.length > 0 && (
        <div className="workout-goals">
          {workout.goals.map((goal, i) => (
            <span key={i} className="goal-tag">{goal}</span>
          ))}
        </div>
      )}
    </div>
  )
}
