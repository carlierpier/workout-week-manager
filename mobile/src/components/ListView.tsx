import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { Workout } from '../types';
import { DAY_NAMES_FULL } from '../types';
import { colors } from '../theme';
import { WorkoutCard } from './WorkoutCard';

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
  });

  const grouped = DAY_NAMES_FULL.map((name, i) => ({
    dayIndex: i,
    dayName: name,
    workouts: sorted.filter(w => w.day === i),
  }));

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {workouts.length === 0 && (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No workouts planned this week.</Text>
          <Text style={styles.emptySubtext}>Tap a day below to add one.</Text>
        </View>
      )}

      {grouped.map(group => {
        const completedCount = group.workouts.filter(w => w.completed).length;
        return (
          <View key={group.dayIndex} style={styles.dayGroup}>
            <View style={styles.dayHeader}>
              <Text style={styles.dayName}>{group.dayName}</Text>
              <View style={styles.dayCount}>
                <Text style={styles.dayCountText}>{completedCount}/{group.workouts.length}</Text>
              </View>
              <TouchableOpacity style={styles.addBtn} onPress={() => onAdd(group.dayIndex)}>
                <Ionicons name="add" size={16} color={colors.textMuted} />
                <Text style={styles.addBtnText}>Add</Text>
              </TouchableOpacity>
            </View>

            {group.workouts.length > 0 ? (
              group.workouts.map(w => (
                <WorkoutCard
                  key={w.id}
                  workout={w}
                  onEdit={() => onEdit(w.id)}
                  onDelete={() => onDelete(w.id)}
                  onToggleComplete={() => onToggleComplete(w.id)}
                />
              ))
            ) : (
              <Text style={styles.restDay}>Rest day</Text>
            )}
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  empty: {
    alignItems: 'center',
    padding: 48,
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: 16,
  },
  emptySubtext: {
    color: colors.textMuted,
    fontSize: 14,
    marginTop: 8,
  },
  dayGroup: {
    marginBottom: 20,
  },
  dayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.surface2,
    marginBottom: 8,
  },
  dayName: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    color: colors.textMuted,
  },
  dayCount: {
    backgroundColor: colors.surface,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  dayCountText: {
    fontSize: 12,
    color: colors.textMuted,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: colors.surface2,
    borderRadius: 8,
  },
  addBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textMuted,
  },
  restDay: {
    color: colors.textMuted,
    fontSize: 13,
    fontStyle: 'italic',
    paddingVertical: 4,
  },
});
