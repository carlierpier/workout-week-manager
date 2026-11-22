import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TextInput, TouchableOpacity, View, type ViewInstance } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { CalendarView } from './src/components/CalendarView';
import { ListView } from './src/components/ListView';
import { WorkoutModal } from './src/components/WorkoutModal';
import { ProgressReport } from './src/components/ProgressReport';
import { GoalSettingsModal } from './src/components/GoalSettingsModal';
import { useResponsive } from './src/hooks/useResponsive';
import type { DistanceType, GoalTarget, WorkoutType } from './src/types';
import { countGoalOccurrences, DAY_NAMES_FULL, WORKOUT_TYPE_COLORS, WORKOUT_TYPE_LABELS } from './src/types';
import { useWeek } from './src/useWeek';
import { formatWeekRange, isCurrentWeek } from './src/weekUtils';
import { colors } from './src/theme';
import { loadGoalTargets, saveGoalTargets } from './src/storage';

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
      editActualDistance?: number;
      editGoals?: string[];
      editCompleted?: boolean;
      editUnplanned?: boolean;
    };

function TargetRow({ type, target, totalKm, onSetTarget }: {
  type: DistanceType;
  target: number | undefined;
  totalKm: number;
  onSetTarget: (type: DistanceType, km: number | undefined) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(target != null ? String(target) : '');
  const color = WORKOUT_TYPE_COLORS[type];
  const label = WORKOUT_TYPE_LABELS[type];
  const pct = target && target > 0 ? Math.min(100, Math.round((totalKm / target) * 100)) : 0;
  const over = target != null && target > 0 && totalKm > target;
  const reached = target != null && target > 0 && totalKm == target;

  const handleSave = () => {
    const parsed = parseFloat(value);
    onSetTarget(type, parsed > 0 ? parsed : undefined);
    setEditing(false);
  };

  return (
    <View style={targetStyles.row}>
      <View style={[targetStyles.dot, { backgroundColor: color }]} />
      <Text style={targetStyles.label}>{label}</Text>
      {editing ? (
        <View style={targetStyles.editRow}>
          <TextInput
            style={targetStyles.input}
            value={value}
            onChangeText={setValue}
            keyboardType="decimal-pad"
            placeholder="km"
            placeholderTextColor={colors.textMuted}
            autoFocus
            onSubmitEditing={handleSave}
          />
          <TouchableOpacity onPress={handleSave} style={targetStyles.saveBtn}>
            <Ionicons name="checkmark" size={16} color={colors.success} />
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity onPress={() => { setValue(target != null ? String(target) : ''); setEditing(true); }} style={targetStyles.targetBtn}>
          <Text style={targetStyles.targetText}>
            {target != null ? `${target} km` : 'Set target'}
          </Text>
          <Ionicons name="pencil" size={12} color={colors.textMuted} />
        </TouchableOpacity>
      )}
      {target != null && target > 0 && (
        <View style={targetStyles.progressArea}>
          <View style={targetStyles.barBg}>
            <View style={[targetStyles.bar, { width: `${pct}%`, backgroundColor: over ? colors.danger : reached ? colors.success : color }]} />
          </View>
          <Text style={[targetStyles.km, over && { color: colors.danger }, reached && { color: colors.success }]}>
            {totalKm.toFixed(1)}/{target} km
          </Text>
        </View>
      )}
    </View>
  );
}

function WeeklyTargetsBar({ workouts, targets, goalTargets, onSetTarget }: {
  workouts: import('./src/types').Workout[];
  targets: import('./src/types').WeekTargets | undefined;
  goalTargets: GoalTarget[];
  onSetTarget: (type: DistanceType, km: number | undefined) => void;
}) {
  const types: DistanceType[] = ['running', 'indoor-bike'];
  const totals = Object.fromEntries(types.map(t => [
    t,
    workouts.filter(w => w.type === t).reduce((sum, w) => sum + (w.actualDistance ?? w.distance ?? 0), 0),
  ])) as Record<DistanceType, number>;

  return (
    <View style={targetStyles.container}>
      {types.map(t => (
        <TargetRow
          key={t}
          type={t}
          target={targets?.[t]}
          totalKm={totals[t]}
          onSetTarget={onSetTarget}
        />
      ))}
      {goalTargets.map(goal => {
        const count = countGoalOccurrences(workouts, goal.name);
        const pct = Math.min(100, Math.round((count / goal.target) * 100));
        const reached = count >= goal.target;
        return (
          <View key={goal.name} style={targetStyles.row}>
            <View style={[targetStyles.dot, { backgroundColor: WORKOUT_TYPE_COLORS.strength }]} />
            <Text style={targetStyles.goalLabel} numberOfLines={1}>{goal.name}</Text>
            <View style={targetStyles.progressArea}>
              <View style={targetStyles.barBg}>
                <View style={[targetStyles.bar, { width: `${pct}%`, backgroundColor: reached ? colors.success : WORKOUT_TYPE_COLORS.strength }]} />
              </View>
              <Text style={[targetStyles.goalCount, reached && { color: colors.success }]}>
                {count}/{goal.target}
              </Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}

const targetStyles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 6,
    borderBottomWidth: 1,
    borderBottomColor: colors.surface2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
    width: 85,
  },
  goalLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
    width: 85,
  },
  targetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.surface2,
  },
  targetText: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: '500',
  },
  editRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  input: {
    backgroundColor: colors.bg,
    borderWidth: 1,
    borderColor: colors.surface2,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    color: colors.text,
    fontSize: 13,
    width: 60,
  },
  saveBtn: {
    padding: 4,
  },
  progressArea: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  barBg: {
    flex: 1,
    height: 6,
    backgroundColor: colors.surface2,
    borderRadius: 3,
    overflow: 'hidden',
  },
  bar: {
    height: '100%',
    borderRadius: 3,
  },
  km: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: '500',
    minWidth: 70,
    textAlign: 'right',
  },
  goalCount: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: '500',
    minWidth: 42,
    textAlign: 'right',
  },
});

export default function App() {
  const {
    weekId, week, loading,
    navigateWeek, goToCurrentWeek,
    addWorkout, updateWorkout, deleteWorkout,
    moveWorkout, toggleComplete, setTarget, copyToNextWeek,
  } = useWeek();

  const { isWide } = useResponsive();
  const [view, setView] = useState<ViewMode>('calendar');
  const [modal, setModal] = useState<ModalState>({ open: false });
  const [showReport, setShowReport] = useState(false);
  const [showGoalSettings, setShowGoalSettings] = useState(false);
  const [goalTargets, setGoalTargets] = useState<GoalTarget[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [activeDropDay, setActiveDropDay] = useState<number>();
  const dropTargets = useRef(new Map<number, ViewInstance>());
  const hoverCheckId = useRef(0);

  useEffect(() => {
    loadGoalTargets()
      .then(setGoalTargets)
      .catch(error => console.error('Failed to load goal settings:', error));
  }, []);

  const registerDropTarget = (day: number, target: ViewInstance | null) => {
    if (target) {
      dropTargets.current.set(day, target);
    } else {
      dropTargets.current.delete(day);
    }
  };

  const findDropTargetAtPoint = useCallback((x: number, y: number) => {
    const targets = Array.from(dropTargets.current.entries());
    return Promise.all(targets.map(([day, target]) => new Promise<{ day: number; left: number; top: number; width: number; height: number }>(resolve => {
      target.measureInWindow((left, top, width, height) => resolve({ day, left, top, width, height }));
    }))).then(bounds => {
      const target = bounds.find(({ left, top, width, height }) =>
        x >= left && x <= left + width && y >= top && y <= top + height
      );
      return target?.day;
    });
  }, []);

  const handleDragMove = (x: number, y: number) => {
    const checkId = ++hoverCheckId.current;
    findDropTargetAtPoint(x, y).then(target => {
      if (checkId === hoverCheckId.current) setActiveDropDay(target);
    });
  };

  const handleDragStateChange = (dragging: boolean) => {
    setIsDragging(dragging);
    if (!dragging) {
      hoverCheckId.current += 1;
      setActiveDropDay(undefined);
    }
  };

  const handleDropWorkout = (workoutId: string, x: number, y: number) => {
    findDropTargetAtPoint(x, y).then(target => {
      setActiveDropDay(undefined);
      if (target != null) moveWorkout(workoutId, target);
    });
  };

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
      editActualDistance: w.actualDistance,
      editGoals: w.goals,
      editCompleted: w.completed,
      editUnplanned: w.unplanned,
    });
  };

  const handleSave = (name: string, type: WorkoutType, distance?: number, goals?: string[], actualDistance?: number, unplanned?: boolean) => {
    if (modal.open && modal.editId) {
      updateWorkout(modal.editId, name, type, distance, goals, actualDistance, unplanned);
    } else if (modal.open) {
      addWorkout(modal.day, name, type, distance, goals, actualDistance, false, unplanned);
    }
    setModal({ open: false });
  };

  const handleSaveAndComplete = (name: string, type: WorkoutType, distance?: number, goals?: string[], actualDistance?: number, unplanned?: boolean) => {
    if (modal.open && modal.editId) {
      updateWorkout(modal.editId, name, type, distance, goals, actualDistance, unplanned);
      toggleComplete(modal.editId);
    } else if (modal.open) {
      addWorkout(modal.day, name, type, distance, goals, actualDistance, true, unplanned);
    }
    setModal({ open: false });
  };

  const handleSaveGoalTargets = (nextGoalTargets: GoalTarget[]) => {
    saveGoalTargets(nextGoalTargets)
      .then(() => {
        setGoalTargets(nextGoalTargets);
        setShowGoalSettings(false);
      })
      .catch(error => console.error('Failed to save goal settings:', error));
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
            <TouchableOpacity
              style={styles.ghostBtn}
              onPress={() => setShowGoalSettings(true)}
              accessibilityLabel="Configure goal tags and weekly targets"
            >
              <Ionicons name="settings-outline" size={16} color={colors.textMuted} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.primaryBtn} onPress={copyToNextWeek}>
              <Ionicons name="copy-outline" size={14} color="#fff" />
              <Text style={styles.primaryBtnText}>Copy week</Text>
            </TouchableOpacity>
          </View>
        </View>

        <WeeklyTargetsBar
          workouts={week.workouts}
          targets={week.targets}
          goalTargets={goalTargets}
          onSetTarget={setTarget}
        />

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
            onDropWorkout={handleDropWorkout}
            onDragMove={handleDragMove}
            activeDropDay={activeDropDay}
            registerDropTarget={registerDropTarget}
            isDragging={isDragging}
            onDragStateChange={handleDragStateChange}
          />
        ) : (
          <ListView
            workouts={week.workouts}
            onAdd={handleAdd}
            onEdit={handleEdit}
            onDelete={deleteWorkout}
            onToggleComplete={toggleComplete}
            onDropWorkout={handleDropWorkout}
            onDragMove={handleDragMove}
            activeDropDay={activeDropDay}
            registerDropTarget={registerDropTarget}
            isDragging={isDragging}
            onDragStateChange={handleDragStateChange}
          />
        )}

        {modal.open && (
          <WorkoutModal
            visible={modal.open}
            day={DAY_NAMES_FULL[modal.day]}
            initialName={modal.editName}
            initialType={modal.editType}
            initialDistance={modal.editDistance}
            initialActualDistance={modal.editActualDistance}
            initialGoals={modal.editGoals}
            goalTags={goalTargets.map(goal => goal.name)}
            initialCompleted={modal.editCompleted}
            initialUnplanned={modal.editUnplanned}
            onSave={handleSave}
            onSaveAndComplete={handleSaveAndComplete}
            onClose={() => setModal({ open: false })}
          />
        )}

        <ProgressReport
          visible={showReport}
          week={week}
          weekId={weekId}
          goalTargets={goalTargets}
          onClose={() => setShowReport(false)}
        />

        <GoalSettingsModal
          visible={showGoalSettings}
          goalTargets={goalTargets}
          onSave={handleSaveGoalTargets}
          onClose={() => setShowGoalSettings(false)}
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
