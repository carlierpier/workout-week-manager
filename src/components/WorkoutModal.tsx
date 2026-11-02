import { useState } from 'react'
import type { Exercise } from '../types'

interface WorkoutModalProps {
  day: string;
  initialName?: string;
  initialExercises?: Exercise[];
  onSave: (name: string, exercises: Exercise[]) => void;
  onClose: () => void;
}

interface ExerciseForm {
  id: string;
  name: string;
  sets: string;
  reps: string;
  weight: string;
  notes: string;
}

function newExerciseForm(): ExerciseForm {
  return { id: crypto.randomUUID(), name: '', sets: '3', reps: '10', weight: '', notes: '' }
}

function toExerciseForm(ex: Exercise): ExerciseForm {
  return {
    id: ex.id,
    name: ex.name,
    sets: String(ex.sets),
    reps: String(ex.reps),
    weight: ex.weight != null ? String(ex.weight) : '',
    notes: ex.notes ?? '',
  }
}

export function WorkoutModal({ day, initialName, initialExercises, onSave, onClose }: WorkoutModalProps) {
  const [name, setName] = useState(initialName ?? '')
  const [exercises, setExercises] = useState<ExerciseForm[]>(
    initialExercises?.map(toExerciseForm) ?? [newExerciseForm()]
  )

  const updateExercise = (index: number, field: keyof ExerciseForm, value: string) => {
    setExercises(prev => prev.map((ex, i) =>
      i === index ? { ...ex, [field]: value } : ex
    ))
  }

  const removeExercise = (index: number) => {
    setExercises(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    const parsed: Exercise[] = exercises
      .filter(ex => ex.name.trim())
      .map(ex => ({
        id: ex.id,
        name: ex.name.trim(),
        sets: parseInt(ex.sets) || 1,
        reps: parseInt(ex.reps) || 1,
        weight: ex.weight ? parseFloat(ex.weight) : undefined,
        notes: ex.notes.trim() || undefined,
      }))
    onSave(name.trim(), parsed)
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
            <label htmlFor="workout-name">Workout name</label>
            <input
              id="workout-name"
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Upper Body, Legs, Cardio..."
              autoFocus
            />
          </div>

          <div className="exercises-section">
            <h3>Exercises</h3>
            {exercises.map((ex, i) => (
              <div key={ex.id} className="exercise-form">
                <div className="exercise-form-row">
                  <input
                    type="text"
                    value={ex.name}
                    onChange={e => updateExercise(i, 'name', e.target.value)}
                    placeholder="Exercise name"
                    className="exercise-name-input"
                  />
                  {exercises.length > 1 && (
                    <button
                      type="button"
                      className="icon-btn delete-btn"
                      onClick={() => removeExercise(i)}
                      aria-label="Remove exercise"
                    >
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 4h10M5.5 4V3a1 1 0 011-1h3a1 1 0 011 1v1M6.5 7v4M9.5 7v4M4.5 4l.5 8a1 1 0 001 1h4a1 1 0 001-1l.5-8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </button>
                  )}
                </div>
                <div className="exercise-form-details">
                  <div className="form-group compact">
                    <label>Sets</label>
                    <input
                      type="number"
                      min="1"
                      value={ex.sets}
                      onChange={e => updateExercise(i, 'sets', e.target.value)}
                    />
                  </div>
                  <div className="form-group compact">
                    <label>Reps</label>
                    <input
                      type="number"
                      min="1"
                      value={ex.reps}
                      onChange={e => updateExercise(i, 'reps', e.target.value)}
                    />
                  </div>
                  <div className="form-group compact">
                    <label>Weight (kg)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.5"
                      value={ex.weight}
                      onChange={e => updateExercise(i, 'weight', e.target.value)}
                      placeholder="—"
                    />
                  </div>
                </div>
                <div className="form-group">
                  <input
                    type="text"
                    value={ex.notes}
                    onChange={e => updateExercise(i, 'notes', e.target.value)}
                    placeholder="Notes (optional)"
                    className="notes-input"
                  />
                </div>
              </div>
            ))}
            <button
              type="button"
              className="btn btn-ghost add-exercise-btn"
              onClick={() => setExercises(prev => [...prev, newExerciseForm()])}
            >
              + Add exercise
            </button>
          </div>

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
