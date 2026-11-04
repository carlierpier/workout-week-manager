import type { Workout } from '../types'
import { DAY_NAMES_FULL } from '../types'
import { WorkoutCard } from './WorkoutCard'

interface ListViewProps {
  workouts: Workout[];
  onAdd: (day: number) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onToggleComplete: (id: string) => void;
}

export function ListView({ workouts, onAdd, onEdit, onDelete, onToggleComplete }: ListViewProps) {
  const sorted = [...workouts].sort((a, b) => {
    if (a.day !== b.day) return a.day - b.day;
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    return a.name.localeCompare(b.name);
  })

  const grouped = DAY_NAMES_FULL.map((name, i) => ({
    dayIndex: i,
    dayName: name,
    workouts: sorted.filter(w => w.day === i),
  }))

  const hasAny = workouts.length > 0

  return (
    <div className="list-view">
      {!hasAny && (
        <div className="list-empty">
          <p>No workouts planned this week.</p>
          <p>Switch to calendar view or tap a day below to add one.</p>
        </div>
      )}
      {grouped.map(group => (
        <div key={group.dayIndex} className="list-day-group">
          <div className="list-day-header">
            <h2 className="list-day-name">{group.dayName}</h2>
            <span className="day-count">
              {group.workouts.filter(w => w.completed).length}/{group.workouts.length}
            </span>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => onAdd(group.dayIndex)}
            >
              + Add
            </button>
          </div>
          {group.workouts.length > 0 ? (
            <div className="list-day-workouts">
              {group.workouts.map(w => (
                <WorkoutCard
                  key={w.id}
                  workout={w}
                  onEdit={() => onEdit(w.id)}
                  onDelete={() => onDelete(w.id)}
                  onToggleComplete={() => onToggleComplete(w.id)}
                />
              ))}
            </div>
          ) : (
            <div className="list-day-empty">Rest day</div>
          )}
        </div>
      ))}
    </div>
  )
}
