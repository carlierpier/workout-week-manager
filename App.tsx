import { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { CalendarView } from './src/components/CalendarView';
import { ListView } from './src/components/ListView';
import { WorkoutModal } from './src/components/WorkoutModal';
import { ProgressReport } from './src/components/ProgressReport';
import { useResponsive } from './src/hooks/useResponsive';
import type { WorkoutType } from './src/types';
import { DAY_NAMES_FULL } from './src/types';
import { useWeek } from './src/useWeek';
import { formatWeekRange, isCurrentWeek } from './src/weekUtils';
import { colors } from './src/theme';

type ViewMode = 'calendar' | 'list';

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
    };

export default function App() {
  const {
    weekId, week, loading,
    navigateWeek, goToCurrentWeek,
    addWorkout, updateWorkout, deleteWorkout,
    toggleComplete, copyToNextWeek,
  } = useWeek();

  const { isWide } = useResponsive();
  const [view, setView] = useState<ViewMode>('calendar');
  const [modal, setModal] = useState<ModalState>({ open: false });
  const [showReport, setShowReport] = useState(false);

  const handleAdd = (day: number) => {
    setModal({ open: true, day });
  };

  const handleEdit = (workoutId: string) => {
    const w = week.workouts.find(x => x.id === workoutId);
    if (!w) return;
    setModal({
      open: true,
      day: w.day,
      editId: w.id,
      editName: w.name,
      editType: w.type,
      editDistance: w.distance,
      editGoals: w.goals,
    });
  };

  const handleSave = (name: string, type: WorkoutType, distance?: number, goals?: string[]) => {
    if (modal.open && modal.editId) {
      updateWorkout(modal.editId, name, type, distance, goals);
    } else if (modal.open) {
      addWorkout(modal.day, name, type, distance, goals);
    }
    setModal({ open: false });
  };

  const current = isCurrentWeek(weekId);

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container} edges={['top']}>
        <StatusBar style="light" />

        <View style={styles.header}>
          <Text style={styles.logo}>Workout Week</Text>

          <View style={styles.weekNav}>
            <TouchableOpacity style={styles.navBtn} onPress={() => navigateWeek(-1)}>
              <Ionicons name="chevron-back" size={20} color={colors.text} />
            </TouchableOpacity>
            <View style={styles.weekLabel}>
              <Text style={styles.weekId}>{weekId}</Text>
              <Text style={styles.weekRange}>{formatWeekRange(weekId)}</Text>
            </View>
            <TouchableOpacity style={styles.navBtn} onPress={() => navigateWeek(1)}>
              <Ionicons name="chevron-forward" size={20} color={colors.text} />
            </TouchableOpacity>
          </View>

          <View style={styles.actions}>
            {isWide && (
              <View style={styles.viewToggle}>
                <TouchableOpacity
                  style={[styles.toggleBtn, view === 'calendar' && styles.toggleBtnActive]}
                  onPress={() => setView('calendar')}
                >
                  <Ionicons name="grid-outline" size={16} color={view === 'calendar' ? colors.text : colors.textMuted} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.toggleBtn, view === 'list' && styles.toggleBtnActive]}
                  onPress={() => setView('list')}
                >
                  <Ionicons name="list-outline" size={16} color={view === 'list' ? colors.text : colors.textMuted} />
                </TouchableOpacity>
              </View>
            )}
            {!current && (
              <TouchableOpacity style={styles.ghostBtn} onPress={goToCurrentWeek}>
                <Text style={styles.ghostBtnText}>Today</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.ghostBtn} onPress={() => setShowReport(true)}>
              <Ionicons name="stats-chart" size={16} color={colors.textMuted} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.primaryBtn} onPress={copyToNextWeek}>
              <Ionicons name="copy-outline" size={14} color="#fff" />
              <Text style={styles.primaryBtnText}>Copy week</Text>
            </TouchableOpacity>
          </View>
        </View>

        {loading ? (
          <View style={styles.loading}>
            <ActivityIndicator color={colors.accent} size="large" />
          </View>
        ) : isWide && view === 'calendar' ? (
          <CalendarView
            workouts={week.workouts}
            onAdd={handleAdd}
            onEdit={handleEdit}
            onDelete={deleteWorkout}
            onToggleComplete={toggleComplete}
          />
        ) : (
          <ListView
            workouts={week.workouts}
            onAdd={handleAdd}
            onEdit={handleEdit}
            onDelete={deleteWorkout}
            onToggleComplete={toggleComplete}
          />
        )}

        {modal.open && (
          <WorkoutModal
            visible={modal.open}
            day={DAY_NAMES_FULL[modal.day]}
            initialName={modal.editName}
            initialType={modal.editType}
            initialDistance={modal.editDistance}
            initialGoals={modal.editGoals}
            onSave={handleSave}
            onClose={() => setModal({ open: false })}
          />
        )}

        <ProgressReport
          visible={showReport}
          week={week}
          weekId={weekId}
          onClose={() => setShowReport(false)}
        />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  header: {
    backgroundColor: colors.bg,
    borderBottomWidth: 1,
    borderBottomColor: colors.surface2,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
  },
  logo: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.accent,
    textAlign: 'center',
  },
  weekNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  navBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.surface2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekLabel: {
    alignItems: 'center',
    minWidth: 140,
  },
  weekId: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  weekRange: {
    fontSize: 12,
    color: colors.textMuted,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  ghostBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.surface2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  ghostBtnText: {
    color: colors.textMuted,
    fontWeight: '600',
    fontSize: 14,
  },
  primaryBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: colors.accent,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  primaryBtnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  viewToggle: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.surface2,
    overflow: 'hidden',
  },
  toggleBtn: {
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  toggleBtnActive: {
    backgroundColor: colors.surface2,
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
