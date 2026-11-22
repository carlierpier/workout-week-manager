import { StyleSheet, View, type ViewInstance } from 'react-native';
import type { Workout } from '../types';
import { DAY_NAMES_FULL } from '../types';
import { DayColumn } from './DayColumn';

interface CalendarViewProps {
  workouts: Workout[];
  onAdd: (day: number) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onToggleComplete: (id: string) => void;
  onDropWorkout: (id: string, x: number, y: number) => void;
  onDragMove: (x: number, y: number) => void;
  activeDropDay?: number;
  registerDropTarget: (day: number, target: ViewInstance | null) => void;
  isDragging: boolean;
  onDragStateChange: (dragging: boolean) => void;
}

export function CalendarView({ workouts, onAdd, onEdit, onDelete, onToggleComplete, onDropWorkout, onDragMove, activeDropDay, registerDropTarget, isDragging, onDragStateChange }: CalendarViewProps) {
  return (
    <View style={styles.grid}>
      {DAY_NAMES_FULL.map((dayName, i) => (
        <DayColumn
          key={i}
          day={i}
          dayName={dayName}
          workouts={workouts.filter(w => w.day === i)}
          onAdd={() => onAdd(i)}
          onEdit={onEdit}
          onDelete={onDelete}
          onToggleComplete={onToggleComplete}
          onDropWorkout={onDropWorkout}
          onDragMove={onDragMove}
          activeDropDay={activeDropDay}
          registerDropTarget={registerDropTarget}
          isDragging={isDragging}
          onDragStateChange={onDragStateChange}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flex: 1,
    flexDirection: 'row',
    gap: 8,
    padding: 12,
  },
});
