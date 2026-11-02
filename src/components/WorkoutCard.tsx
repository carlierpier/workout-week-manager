import { useState } from 'react'
import type { Workout } from '../types'

interface WorkoutCardProps {
  workout: Workout;
  onEdit: () => void;
  onDelete: () => void;
  onToggleComplete: () => void;
}

export function WorkoutCard({ workout, onEdit, onDelete, onToggleComplete }: WorkoutCardProps) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className={`workout-card ${workout.completed ? 'completed' : ''}`}>
      <div className="workout-card-header">
        <button
          className={`check-btn ${workout.completed ? 'checked' : ''}`}
          onClick={onToggleComplete}
          aria-label={workout.completed ? 'Mark incomplete' : 'Mark complete'}
        >
          {workout.completed ? '✓' : ''}
        </button>
        <span
          className="workout-name"
          onClick={() => setExpanded(!expanded)}
        >
          {workout.name}
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
      {expanded && workout.exercises.length > 0 && (
        <ul className="exercise-list">
          {workout.exercises.map(ex => (
            <li key={ex.id} className="exercise-item">
              <span className="exercise-name">{ex.name}</span>
              <span className="exercise-detail">
                {ex.sets} &times; {ex.reps}
                {ex.weight != null && ex.weight > 0 ? ` @ ${ex.weight}kg` : ''}
              </span>
              {ex.notes && <span className="exercise-notes">{ex.notes}</span>}
            </li>
          ))}
        </ul>
      )}
      {!expanded && workout.exercises.length > 0 && (
        <button className="expand-hint" onClick={() => setExpanded(true)}>
          {workout.exercises.length} exercise{workout.exercises.length !== 1 ? 's' : ''}
        </button>
      )}
    </div>
  )
}
