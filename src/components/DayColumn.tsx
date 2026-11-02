import type { Workout } from '../types'
import { WorkoutCard } from './WorkoutCard'

interface DayColumnProps {
  dayIndex: number;
  dayName: string;
  workouts: Workout[];
  onAdd: () => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onToggleComplete: (id: string) => void;
}

export function DayColumn({ dayName, workouts, onAdd, onEdit, onDelete, onToggleComplete }: DayColumnProps) {
  const allDone = workouts.length > 0 && workouts.every(w => w.completed)

  return (
    <div className={`day-column ${allDone ? 'day-done' : ''}`}>
      <div className="day-header">
        <h2 className="day-name">{dayName}</h2>
        {workouts.length > 0 && (
          <span className="day-count">
            {workouts.filter(w => w.completed).length}/{workouts.length}
          </span>
        )}
      </div>
      <div className="day-workouts">
        {workouts.map(w => (
          <WorkoutCard
            key={w.id}
            workout={w}
            onEdit={() => onEdit(w.id)}
            onDelete={() => onDelete(w.id)}
            onToggleComplete={() => onToggleComplete(w.id)}
          />
        ))}
      </div>
      <button className="add-workout-btn" onClick={onAdd}>+ Add workout</button>
    </div>
  )
}
