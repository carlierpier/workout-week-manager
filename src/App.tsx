import { useState } from 'react'
import { DayColumn } from './components/DayColumn'
import { ProgressReport } from './components/ProgressReport'
import { WorkoutModal } from './components/WorkoutModal'
import type { Exercise } from './types'
import { DAY_NAMES_FULL } from './types'
import { useWeek } from './useWeek'
import { formatWeekRange, isCurrentWeek } from './weekUtils'

type ModalState =
  | { open: false }
  | { open: true; day: number; editId?: string; editName?: string; editExercises?: Exercise[] }

export function App() {
  const {
    weekId, week,
    navigateWeek, goToCurrentWeek,
    addWorkout, updateWorkout, deleteWorkout,
    toggleComplete, copyToNextWeek,
  } = useWeek()

  const [modal, setModal] = useState<ModalState>({ open: false })
  const [showReport, setShowReport] = useState(false)

  const handleAdd = (day: number) => {
    setModal({ open: true, day })
  }

  const handleEdit = (workoutId: string) => {
    const w = week.workouts.find(x => x.id === workoutId)
    if (!w) return
    setModal({ open: true, day: w.day, editId: w.id, editName: w.name, editExercises: w.exercises })
  }

  const handleSave = (name: string, exercises: Exercise[]) => {
    if (modal.open && modal.editId) {
      updateWorkout(modal.editId, name, exercises)
    } else if (modal.open) {
      addWorkout(modal.day, name, exercises)
    }
    setModal({ open: false })
  }

  const current = isCurrentWeek(weekId)

  return (
    <div className="app">
      <header className="header">
        <h1 className="logo">Workout Week</h1>
        <div className="week-nav">
          <button className="nav-btn" onClick={() => navigateWeek(-1)} aria-label="Previous week">&larr;</button>
          <div className="week-label">
            <span className="week-id">{weekId}</span>
            <span className="week-range">{formatWeekRange(weekId)}</span>
          </div>
          <button className="nav-btn" onClick={() => navigateWeek(1)} aria-label="Next week">&rarr;</button>
        </div>
        <div className="header-actions">
          {!current && (
            <button className="btn btn-ghost" onClick={goToCurrentWeek}>Today</button>
          )}
          <button className="btn btn-ghost" onClick={() => setShowReport(true)}>Report</button>
          <button className="btn btn-primary" onClick={copyToNextWeek}>Copy to next week</button>
        </div>
      </header>

      <main className="week-grid">
        {DAY_NAMES_FULL.map((dayName, i) => (
          <DayColumn
            key={i}
            dayIndex={i}
            dayName={dayName}
            workouts={week.workouts.filter(w => w.day === i)}
            onAdd={() => handleAdd(i)}
            onEdit={handleEdit}
            onDelete={deleteWorkout}
            onToggleComplete={toggleComplete}
          />
        ))}
      </main>

      {modal.open && (
        <WorkoutModal
          day={DAY_NAMES_FULL[modal.day]}
          initialName={modal.editName}
          initialExercises={modal.editExercises}
          onSave={handleSave}
          onClose={() => setModal({ open: false })}
        />
      )}

      {showReport && (
        <ProgressReport
          week={week}
          weekId={weekId}
          onClose={() => setShowReport(false)}
        />
      )}
    </div>
  )
}
