import { useMemo, useRef, useState } from 'react';
import { Animated, PanResponder, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { Workout } from '../types';
import { WORKOUT_TYPE_COLORS, WORKOUT_TYPE_LABELS, hasDistance, hasGoals } from '../types';
import { colors, radius } from '../theme';

interface WorkoutCardProps {
  workout: Workout;
  onEdit: () => void;
  onDelete: () => void;
  onToggleComplete: () => void;
  onDrop: (x: number, y: number) => void;
  onDragMove: (x: number, y: number) => void;
  onDragStateChange: (dragging: boolean) => void;
}

export function WorkoutCard({ workout, onEdit, onDelete, onToggleComplete, onDrop, onDragMove, onDragStateChange }: WorkoutCardProps) {
  const typeColor = WORKOUT_TYPE_COLORS[workout.type];
  const [dragging, setDragging] = useState(false);
  const dragPosition = useRef(new Animated.ValueXY()).current;
  const onDropRef = useRef(onDrop);
  const onDragMoveRef = useRef(onDragMove);
  const onDragStateChangeRef = useRef(onDragStateChange);
  onDropRef.current = onDrop;
  onDragMoveRef.current = onDragMove;
  onDragStateChangeRef.current = onDragStateChange;
  const panResponder = useMemo(() => PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderGrant: () => {
      dragPosition.setValue({ x: 0, y: 0 });
      setDragging(true);
      onDragStateChangeRef.current(true);
    },
    onPanResponderMove: (_, gesture) => {
      dragPosition.setValue({ x: gesture.dx, y: gesture.dy });
      onDragMoveRef.current(gesture.moveX, gesture.moveY);
    },
    onPanResponderRelease: (_, gesture) => {
      onDropRef.current(gesture.moveX, gesture.moveY);
      setDragging(false);
      onDragStateChangeRef.current(false);
      Animated.spring(dragPosition, {
        toValue: { x: 0, y: 0 },
        useNativeDriver: true,
      }).start();
    },
    onPanResponderTerminate: () => {
      setDragging(false);
      onDragStateChangeRef.current(false);
      Animated.spring(dragPosition, {
        toValue: { x: 0, y: 0 },
        useNativeDriver: true,
      }).start();
    },
    onPanResponderTerminationRequest: () => false,
  }), [dragPosition]);

  return (
    <Animated.View
      style={[
        styles.card,
        { borderLeftColor: typeColor },
        workout.unplanned && styles.unplanned,
        workout.completed && styles.completed,
        dragging && styles.dragging,
        { transform: [...dragPosition.getTranslateTransform(), { scale: dragging ? 1.03 : 1 }] },
      ]}
    >
      <View style={styles.header}>
        <View
          {...panResponder.panHandlers}
          style={styles.dragHandle}
          accessible
          accessibilityLabel="Drag to move workout to another day"
        >
          <Ionicons name="reorder-three" size={18} color={colors.textMuted} />
        </View>

        <TouchableOpacity onPress={onToggleComplete} style={[styles.checkBtn, workout.completed && styles.checked]}>
          {workout.completed && <Ionicons name="checkmark" size={14} color="#fff" />}
        </TouchableOpacity>

        <Text style={styles.name} numberOfLines={1}>{workout.name}</Text>

        {workout.unplanned && (
          <View style={styles.unplannedBadge}>
            <Text style={styles.unplannedText}>Unplanned</Text>
          </View>
        )}

        <View style={[styles.badge, { backgroundColor: typeColor }]}>
          <Text style={styles.badgeText}>{WORKOUT_TYPE_LABELS[workout.type]}</Text>
        </View>

        <TouchableOpacity onPress={onEdit} style={styles.iconBtn} hitSlop={8}>
          <Ionicons name="pencil" size={16} color={colors.textMuted} />
        </TouchableOpacity>

        <TouchableOpacity onPress={onDelete} style={styles.iconBtn} hitSlop={8}>
          <Ionicons name="trash-outline" size={16} color={colors.danger} />
        </TouchableOpacity>
      </View>

      {hasDistance(workout.type) && (workout.distance != null && workout.distance > 0 ? (
        <Text style={styles.meta}>
          {workout.actualDistance != null && workout.actualDistance > 0
            ? `${workout.actualDistance} / ${workout.distance} km`
            : `${workout.distance} km`}
        </Text>
      ) : workout.actualDistance != null && workout.actualDistance > 0 ? (
        <Text style={styles.meta}>{workout.actualDistance} km</Text>
      ) : null)}

      {hasGoals(workout.type) && workout.goals && workout.goals.length > 0 && (
        <View style={styles.goals}>
          {workout.goals.map((goal, i) => (
            <View key={i} style={styles.goalTag}>
              <Text style={styles.goalText}>{goal}</Text>
            </View>
          ))}
        </View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.sm,
    padding: 12,
    borderLeftWidth: 3,
    marginBottom: 8,
  },
  completed: {
    opacity: 0.6,
  },
  dragging: {
    opacity: 0.95,
    zIndex: 1,
    elevation: 8,
  },
  unplanned: {
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: colors.surface2,
    borderLeftWidth: 3,
  },
  unplannedBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: colors.surface2,
  },
  unplannedText: {
    fontSize: 9,
    fontWeight: '600',
    color: colors.textMuted,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dragHandle: {
    paddingVertical: 4,
    paddingRight: 2,
  },
  checkBtn: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.surface2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checked: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  name: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#fff',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  iconBtn: {
    padding: 4,
  },
  meta: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 6,
    marginLeft: 32,
  },
  goals: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 8,
    marginLeft: 32,
  },
  goalTag: {
    backgroundColor: colors.surface2,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  goalText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.text,
  },
});
