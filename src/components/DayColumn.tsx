import { ScrollView, StyleSheet, Text, TouchableOpacity, View, type ViewInstance } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { Workout } from '../types';
import { colors } from '../theme';
import { WorkoutCard } from './WorkoutCard';

interface DayColumnProps {
  dayName: string;
  workouts: Workout[];
  onAdd: () => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onToggleComplete: (id: string) => void;
  onDropWorkout: (id: string, x: number, y: number) => void;
  onDragMove: (x: number, y: number) => void;
  activeDropDay?: number;
  registerDropTarget: (day: number, target: ViewInstance | null) => void;
  isDragging: boolean;
  onDragStateChange: (dragging: boolean) => void;
  day: number;
}

export function DayColumn({ day, dayName, workouts, onAdd, onEdit, onDelete, onToggleComplete, onDropWorkout, onDragMove, activeDropDay, registerDropTarget, isDragging, onDragStateChange }: DayColumnProps) {
  const allDone = workouts.length > 0 && workouts.every(w => w.completed);
  const completedCount = workouts.filter(w => w.completed).length;
  const isDropTarget = activeDropDay === day;

  return (
    <View ref={target => registerDropTarget(day, target)} style={[styles.column, allDone && styles.columnDone]}>
      <View style={styles.header}>
        <Text style={styles.dayName}>{dayName}</Text>
        {workouts.length > 0 && (
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{completedCount}/{workouts.length}</Text>
          </View>
        )}
      </View>

      <ScrollView style={styles.workouts} contentContainerStyle={styles.workoutsContent} scrollEnabled={!isDragging}>
        {workouts.map(w => (
          <WorkoutCard
            key={w.id}
            workout={w}
            onEdit={() => onEdit(w.id)}
            onDelete={() => onDelete(w.id)}
            onToggleComplete={() => onToggleComplete(w.id)}
            onDrop={(x, y) => onDropWorkout(w.id, x, y)}
            onDragMove={onDragMove}
            onDragStateChange={onDragStateChange}
          />
        ))}
        {isDropTarget && <View pointerEvents="none" style={styles.dropIndicator} />}
      </ScrollView>

      <TouchableOpacity style={styles.addBtn} onPress={onAdd}>
        <Ionicons name="add" size={16} color={colors.textMuted} />
        <Text style={styles.addBtnText}>Add workout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  column: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 10,
    padding: 10,
    minWidth: 0,
    gap: 8,
  },
  columnDone: {
    borderWidth: 1,
    borderColor: colors.success + '40',
    backgroundColor: colors.success + '0a',
  },
  dropIndicator: {
    height: 2,
    backgroundColor: colors.accent,
    marginHorizontal: 2,
    marginTop: 2,
    marginBottom: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.surface2,
  },
  dayName: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    color: colors.textMuted,
  },
  countBadge: {
    backgroundColor: colors.bg,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  countText: {
    fontSize: 11,
    color: colors.textMuted,
  },
  workouts: {
    flex: 1,
  },
  workoutsContent: {
    gap: 6,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: colors.surface2,
    borderRadius: 8,
    borderStyle: 'dashed',
  },
  addBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textMuted,
  },
});
