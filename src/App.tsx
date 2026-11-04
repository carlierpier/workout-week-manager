import { useState } from 'react'
import { DayColumn } from './components/DayColumn'
import { ListView } from './components/ListView'
import { ProgressReport } from './components/ProgressReport'
import { WorkoutModal } from './components/WorkoutModal'
import type { WorkoutType } from './types'
import { DAY_NAMES_FULL } from './types'
import { useWeek } from './useWeek'
import { formatWeekRange, isCurrentWeek } from './weekUtils'

type ViewMode = 'calendar' | 'list'

type ModalState =
  | { open: false }
  | {
      open: true;
      day: number;
      editId?: string;
      editName?: string;
      editType?: WorkoutType;
      editDistance?: number;
      editGoals?: string[];
    }

export function App() {
  const {
    weekId, week,
    navigateWeek, goToCurrentWeek,
    addWorkout, updateWorkout, deleteWorkout,
    toggleComplete, copyToNextWeek,
  } = useWeek()

  const [modal, setModal] = useState<ModalState>({ open: false })
  const [showReport, setShowReport] = useState(false)
  const [view, setView] = useState<ViewMode>('calendar')

  const handleAdd = (day: number) => {
    setModal({ open: true, day })
  }

  const handleEdit = (workoutId: string) => {
    const w = week.workouts.find(x => x.id === workoutId)
    if (!w) return
    setModal({
      open: true,
      day: w.day,
      editId: w.id,
      editName: w.name,
      editType: w.type,
      editDistance: w.distance,
      editGoals: w.goals,
    })
  }

  const handleSave = (name: string, type: WorkoutType, distance?: number, goals?: string[]) => {
    if (modal.open && modal.editId) {
      updateWorkout(modal.editId, name, type, distance, goals)
    } else if (modal.open) {
      addWorkout(modal.day, name, type, distance, goals)
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
          <div className="view-toggle">
            <button
              className={`toggle-btn ${view === 'calendar' ? 'active' : ''}`}
              onClick={() => setView('calendar')}
              aria-label="Calendar view"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="1" y="2" width="14" height="12" rx="2" stroke="currentColor" strokeWidth="1.5"/><path d="M1 6h14" stroke="currentColor" strokeWidth="1.5"/><path d="M5 0.5v3M11 0.5v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
            </button>
            <button
              className={`toggle-btn ${view === 'list' ? 'active' : ''}`}
              onClick={() => setView('list')}
              aria-label="List view"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 4h10M3 8h10M3 12h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
            </button>
          </div>
          {!current && (
            <button className="btn btn-ghost" onClick={goToCurrentWeek}>Today</button>
          )}
          <button className="btn btn-ghost" onClick={() => setShowReport(true)}>Report</button>
          <button className="btn btn-primary" onClick={copyToNextWeek}>Copy to next week</button>
        </div>
      </header>

      {view === 'calendar' ? (
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
      ) : (
        <main>
          <ListView
            workouts={week.workouts}
            onAdd={handleAdd}
            onEdit={handleEdit}
            onDelete={deleteWorkout}
            onToggleComplete={toggleComplete}
          />
        </main>
      )}

      {modal.open && (
        <WorkoutModal
          day={DAY_NAMES_FULL[modal.day]}
          initialName={modal.editName}
          initialType={modal.editType}
          initialDistance={modal.editDistance}
          initialGoals={modal.editGoals}
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
