import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { GoalTarget, WeekData } from '../types';
import { countGoalOccurrences, DAY_NAMES_FULL, WORKOUT_TYPE_COLORS, WORKOUT_TYPE_LABELS, hasDistance } from '../types';
import { formatWeekRange } from '../weekUtils';
import { colors, radius } from '../theme';
import Svg, { Circle } from 'react-native-svg';

interface ProgressReportProps {
  visible: boolean;
  week: WeekData;
  weekId: string;
  goalTargets: GoalTarget[];
  onClose: () => void;
}

export function ProgressReport({ visible, week, weekId, goalTargets, onClose }: ProgressReportProps) {
  const total = week.workouts.length;
  const completed = week.workouts.filter(w => w.completed).length;
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

  const distanceByType = (['running', 'indoor-bike'] as const).map(type => {
    const typeWorkouts = week.workouts.filter(w => w.type === type && hasDistance(w.type));
    const totalKm = typeWorkouts.reduce((sum, w) => sum + (w.actualDistance ?? w.distance ?? 0), 0);
    const completedKm = typeWorkouts
      .filter(w => w.completed)
      .reduce((sum, w) => sum + (w.distance ?? 0), 0);
    const actualKm = typeWorkouts
      .filter(w => w.completed)
      .reduce((sum, w) => sum + (w.actualDistance ?? w.distance ?? 0), 0);
    const target = week.targets?.[type];
    return { type, totalKm, completedKm, actualKm, target, count: typeWorkouts.length };
  }).filter(d => d.count > 0 || d.target != null);

  const byDay = DAY_NAMES_FULL.map((name, i) => {
    const dayWorkouts = week.workouts.filter(w => w.day === i);
    return {
      name,
      total: dayWorkouts.length,
      completed: dayWorkouts.filter(w => w.completed).length,
    };
  }).filter(d => d.total > 0);

  const circumference = 2 * Math.PI * 42;
  const strokeDashoffset = circumference - (pct / 100) * circumference;

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.header}>
            <Text style={styles.title}>Weekly Report</Text>
            <TouchableOpacity onPress={onClose} hitSlop={8}>
              <Ionicons name="close" size={24} color={colors.textMuted} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.body}>
            <Text style={styles.subtitle}>{weekId} · {formatWeekRange(weekId)}</Text>

            {total === 0 ? (
              <Text style={styles.emptyText}>No workouts planned this week.</Text>
            ) : (
              <>
                <View style={styles.hero}>
                  <View style={styles.ringContainer}>
                    <Svg width={100} height={100} viewBox="0 0 100 100">
                      <Circle
                        cx={50} cy={50} r={42}
                        fill="none"
                        stroke={colors.surface2}
                        strokeWidth={8}
                      />
                      <Circle
                        cx={50} cy={50} r={42}
                        fill="none"
                        stroke={colors.accent}
                        strokeWidth={8}
                        strokeLinecap="round"
                        strokeDasharray={`${circumference}`}
                        strokeDashoffset={strokeDashoffset}
                        rotation={-90}
                        origin="50,50"
                      />
                    </Svg>
                    <View style={styles.ringLabel}>
                      <Text style={styles.pct}>{pct}%</Text>
                    </View>
                  </View>
                  <View style={styles.heroStats}>
                    <Text style={styles.statValue}>{completed}/{total}</Text>
                    <Text style={styles.statLabel}>Workouts completed</Text>
                  </View>
                </View>

                {distanceByType.length > 0 && (
                  <View style={styles.distanceSection}>
                    <Text style={styles.sectionTitle}>Distance</Text>
                    <View style={styles.distanceCards}>
                      {distanceByType.map(d => (
                        <View key={d.type} style={[styles.distanceCard, { borderLeftColor: WORKOUT_TYPE_COLORS[d.type] }]}>
                          <Text style={styles.distanceType}>{WORKOUT_TYPE_LABELS[d.type]}</Text>
                          <Text style={styles.distanceValue}>
                            {d.actualKm.toFixed(1)} / {d.totalKm.toFixed(1)} km
                          </Text>
                          {d.target != null && d.target > 0 && (
                            <Text style={styles.distanceTarget}>Target: {d.target} km</Text>
                          )}
                        </View>
                      ))}
                    </View>
                  </View>
                )}

                <View style={styles.daysSection}>
                  <Text style={styles.sectionTitle}>By day</Text>
                  {byDay.map(d => (
                    <View key={d.name} style={styles.dayRow}>
                      <Text style={styles.dayName}>{d.name}</Text>
                      <View style={styles.barContainer}>
                        <View
                          style={[styles.bar, { width: d.total > 0 ? `${(d.completed / d.total) * 100}%` : '0%' }]}
                        />
                      </View>
                      <Text style={styles.dayCount}>{d.completed}/{d.total}</Text>
                    </View>
                  ))}
                </View>
              </>
            )}

            {goalTargets.length > 0 && (
              <View style={styles.goalsSection}>
                <Text style={styles.sectionTitle}>Weekly goal targets</Text>
                {goalTargets.map(goal => {
                  const count = countGoalOccurrences(week.workouts, goal.name);
                  const reached = count >= goal.target;
                  return (
                    <View key={goal.name} style={styles.goalRow}>
                      <Text style={styles.goalName}>{goal.name}</Text>
                      <Text style={[styles.goalProgress, reached && styles.goalReached]}>
                        {count}/{goal.target}
                      </Text>
                    </View>
                  );
                })}
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    padding: 20,
  },
  modal: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    maxHeight: '85%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  body: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 14,
    marginBottom: 20,
  },
  emptyText: {
    color: colors.textMuted,
    textAlign: 'center',
    padding: 32,
  },
  hero: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
    marginBottom: 24,
  },
  ringContainer: {
    width: 100,
    height: 100,
  },
  ringLabel: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pct: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
  },
  heroStats: {
    gap: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  statLabel: {
    fontSize: 13,
    color: colors.textMuted,
  },
  distanceSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textMuted,
    marginBottom: 10,
  },
  distanceCards: {
    flexDirection: 'row',
    gap: 12,
  },
  distanceCard: {
    flex: 1,
    backgroundColor: colors.bg,
    borderRadius: radius.sm,
    padding: 12,
    borderLeftWidth: 3,
    gap: 4,
  },
  distanceType: {
    fontSize: 12,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  distanceValue: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
  },
  distanceTarget: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: '500',
  },
  daysSection: {
    marginBottom: 20,
  },
  goalsSection: {
    marginBottom: 20,
  },
  goalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.bg,
    borderRadius: radius.sm,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 6,
  },
  goalName: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
  },
  goalProgress: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textMuted,
  },
  goalReached: {
    color: colors.success,
  },
  dayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 10,
  },
  dayName: {
    width: 90,
    fontSize: 14,
    color: colors.text,
  },
  barContainer: {
    flex: 1,
    height: 8,
    backgroundColor: colors.surface2,
    borderRadius: 4,
    overflow: 'hidden',
  },
  bar: {
    height: '100%',
    backgroundColor: colors.accent,
    borderRadius: 4,
  },
  dayCount: {
    fontSize: 13,
    color: colors.textMuted,
    width: 35,
    textAlign: 'right',
  },
});
