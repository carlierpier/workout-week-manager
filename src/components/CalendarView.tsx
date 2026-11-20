import { StyleSheet, View } from 'react-native';
import type { Workout } from '../types';
import { DAY_NAMES_FULL } from '../types';
import { DayColumn } from './DayColumn';

interface CalendarViewProps {
  workouts: Workout[];
  onAdd: (day: number) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onToggleComplete: (id: string) => void;
}

export function CalendarView({ workouts, onAdd, onEdit, onDelete, onToggleComplete }: CalendarViewProps) {
  return (
    <View style={styles.grid}>
      {DAY_NAMES_FULL.map((dayName, i) => (
        <DayColumn
          key={i}
          dayName={dayName}
          workouts={workouts.filter(w => w.day === i)}
          onAdd={() => onAdd(i)}
          onEdit={onEdit}
          onDelete={onDelete}
          onToggleComplete={onToggleComplete}
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
