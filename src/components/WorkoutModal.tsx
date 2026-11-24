import { useEffect, useRef, useState } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  type ScrollViewInstance,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { WorkoutType } from '../types';
import { WORKOUT_TYPES, WORKOUT_TYPE_LABELS, WORKOUT_TYPE_COLORS, WORKOUT_TYPE_DEFAULT_NAMES, hasDistance, hasGoals } from '../types';
import { colors, radius } from '../theme';

interface WorkoutModalProps {
  visible: boolean;
  day: string;
  initialName?: string;
  initialType?: WorkoutType;
  initialDistance?: number;
  initialActualDistance?: number;
  initialGoals?: string[];
  initialCompleted?: boolean;
  initialUnplanned?: boolean;
  initialFixedDistance?: boolean;
  initialAdjustOthers?: boolean;
  goalTags: string[];
  onSave: (name: string, type: WorkoutType, distance?: number, goals?: string[], actualDistance?: number, unplanned?: boolean, fixedDistance?: boolean, adjustOthers?: boolean) => void;
  onSaveAndComplete: (name: string, type: WorkoutType, distance?: number, goals?: string[], actualDistance?: number, unplanned?: boolean, fixedDistance?: boolean, adjustOthers?: boolean) => void;
  onClose: () => void;
}

export function WorkoutModal({ visible, day, initialName, initialType, initialDistance, initialActualDistance, initialGoals, initialCompleted, initialUnplanned, initialFixedDistance, initialAdjustOthers, goalTags, onSave, onSaveAndComplete, onClose }: WorkoutModalProps) {
  const [name, setName] = useState(initialName ?? '');
  const [type, setType] = useState<WorkoutType>(initialType ?? 'strength');
  const [distance, setDistance] = useState(initialDistance != null ? String(initialDistance) : '');
  const [actualDistance, setActualDistance] = useState(initialActualDistance != null ? String(initialActualDistance) : '');
  const [goals, setGoals] = useState<string[]>(initialGoals ?? []);
  const [unplanned, setUnplanned] = useState(initialUnplanned ?? false);
  const [fixedDistance, setFixedDistance] = useState(initialFixedDistance ?? false);
  const [adjustOthers, setAdjustOthers] = useState(initialAdjustOthers ?? false);
  const formScrollView = useRef<ScrollViewInstance>(null);
  const scrollTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isEditing = initialName != null;
  const defaultName = WORKOUT_TYPE_DEFAULT_NAMES[type];
  const availableGoalTags = [...new Set([...goalTags, ...goals])];

  const scheduleScrollToBottom = (delay: number) => {
    if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
    scrollTimeout.current = setTimeout(() => {
      scrollTimeout.current = null;
      requestAnimationFrame(() => formScrollView.current?.scrollToEnd({ animated: true }));
    }, delay);
  };

  useEffect(() => {
    if (!visible) {
      return () => {
        if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
      };
    }

    const subscription = Keyboard.addListener('keyboardDidShow', () => scheduleScrollToBottom(100));
    return () => {
      subscription.remove();
      if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
    };
  }, [visible]);

  const toggleGoal = (goal: string) => {
    setGoals(prev => prev.includes(goal) ? prev.filter(item => item !== goal) : [...prev, goal]);
  };

  const buildPayload = () => {
    const finalName = name.trim() || defaultName;
    if (!finalName) return null;
    const dist = hasDistance(type) && distance ? parseFloat(distance) : undefined;
    const actDist = hasDistance(type) && actualDistance ? parseFloat(actualDistance) : undefined;
    const parsedGoals = hasGoals(type) ? goals : undefined;
    return { finalName, dist, parsedGoals, actDist } as const;
  };

  const handleSubmit = () => {
    const p = buildPayload();
    if (p) onSave(p.finalName, type, p.dist, p.parsedGoals, p.actDist, unplanned || undefined, fixedDistance, adjustOthers);
  };

  const handleSubmitAndComplete = () => {
    const p = buildPayload();
    if (p) onSaveAndComplete(p.finalName, type, p.dist, p.parsedGoals, p.actDist, unplanned || undefined, fixedDistance, adjustOthers);
  };

  const canSave = !!(name.trim() || defaultName);

  return (
    <Modal visible={visible} animationType="slide" transparent nativeID="workout-modal">
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.modal}>
          <View style={styles.header}>
            <Text style={styles.title}>{initialName ? 'Edit' : 'Add'} Workout — {day}</Text>
            <TouchableOpacity onPress={onClose} hitSlop={8}>
              <Ionicons name="close" size={24} color={colors.textMuted} />
            </TouchableOpacity>
          </View>

          <ScrollView
            ref={formScrollView}
            style={styles.body}
            keyboardShouldPersistTaps="handled"
            automaticallyAdjustKeyboardInsets={Platform.OS === 'ios'}
          >
            <Text style={styles.label}>Type</Text>
            <View style={styles.typeSelector}>
              {WORKOUT_TYPES.map(t => (
                <TouchableOpacity
                  key={t}
                  style={[
                    styles.typeChip,
                    type === t && { backgroundColor: WORKOUT_TYPE_COLORS[t], borderColor: WORKOUT_TYPE_COLORS[t] },
                  ]}
                  onPress={() => setType(t)}
                >
                  <Text style={[styles.typeChipText, type === t && styles.typeChipActive]}>
                    {WORKOUT_TYPE_LABELS[t]}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={styles.checkboxRow}
              onPress={() => setUnplanned(v => !v)}
            >
              <View style={[styles.checkbox, unplanned && styles.checkboxChecked]}>
                {unplanned && <Ionicons name="checkmark" size={14} color="#fff" />}
              </View>
              <Text style={styles.checkboxLabel}>Unplanned workout</Text>
            </TouchableOpacity>

            <Text style={styles.label}>Workout name</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder={defaultName ?? 'e.g. PULL at Work, 5K Run...'}
              placeholderTextColor={colors.textMuted}
              autoComplete="off"
              textContentType="none"
              onFocus={() => scheduleScrollToBottom(400)}
            />

            {hasDistance(type) && (
              <>
                <Text style={styles.label}>Planned distance (km)</Text>
                <TextInput
                  style={styles.input}
                  value={distance}
                  onChangeText={setDistance}
                  placeholder="e.g. 5.0"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="decimal-pad"
                  autoComplete="off"
                  textContentType="none"
                  onFocus={() => scheduleScrollToBottom(400)}
                />
                {isEditing && (
                  <>
                    <Text style={styles.label}>Actual distance (km)</Text>
                    <TextInput
                      style={styles.input}
                      value={actualDistance}
                      onChangeText={setActualDistance}
                      placeholder="Leave empty if same as planned"
                      placeholderTextColor={colors.textMuted}
                      keyboardType="decimal-pad"
                      autoComplete="off"
                      textContentType="none"
                      onFocus={() => scheduleScrollToBottom(400)}
                    />
                  </>
                )}
                <TouchableOpacity
                  style={styles.checkboxRow}
                  onPress={() => setFixedDistance(v => !v)}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: fixedDistance }}
                >
                  <View style={[styles.checkbox, fixedDistance && styles.checkboxChecked]}>
                    {fixedDistance && <Ionicons name="checkmark" size={14} color="#fff" />}
                  </View>
                  <Text style={styles.checkboxLabel}>Fix this workout distance</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.checkboxRow}
                  onPress={() => setAdjustOthers(v => !v)}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: adjustOthers }}
                >
                  <View style={[styles.checkbox, adjustOthers && styles.checkboxChecked]}>
                    {adjustOthers && <Ionicons name="checkmark" size={14} color="#fff" />}
                  </View>
                  <Text style={styles.checkboxLabel}>Change other workouts when needed</Text>
                </TouchableOpacity>
              </>
            )}

            {hasGoals(type) && (
              <View style={styles.goalsSection}>
                <Text style={styles.goalsTitle}>Goal tags</Text>
                {availableGoalTags.length > 0 ? (
                  <View style={styles.goalTags}>
                    {availableGoalTags.map(goal => (
                      <TouchableOpacity
                        key={goal}
                        style={[styles.goalChip, goals.includes(goal) && styles.goalChipSelected]}
                        onPress={() => toggleGoal(goal)}
                        accessibilityRole="checkbox"
                        accessibilityState={{ checked: goals.includes(goal) }}
                      >
                        <Text style={[styles.goalChipText, goals.includes(goal) && styles.goalChipTextSelected]}>
                          {goal}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                ) : (
                  <Text style={styles.noGoalTags}>Configure reusable tags in Settings.</Text>
                )}
              </View>
            )}
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            {!initialCompleted && (
              <TouchableOpacity
                style={[styles.completeBtn, !canSave && styles.saveBtnDisabled]}
                onPress={handleSubmitAndComplete}
                disabled={!canSave}
              >
                <Ionicons name="checkmark-circle" size={16} color={colors.success} />
                <Text style={styles.completeBtnText}>{isEditing ? 'Save & complete' : 'Add & complete'}</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[styles.saveBtn, !canSave && styles.saveBtnDisabled]}
              onPress={handleSubmit}
              disabled={!canSave}
            >
              <Text style={styles.saveText}>{isEditing ? 'Save changes' : 'Add workout'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modal: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    flexShrink: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.surface2,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  body: {
    padding: 20,
    flexShrink: 1,
    minHeight: 0,
  },
  label: {
    fontSize: 13,
    color: colors.textMuted,
    fontWeight: '500',
    marginBottom: 6,
    marginTop: 12,
  },
  typeSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.surface2,
  },
  typeChipText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textMuted,
  },
  typeChipActive: {
    color: '#fff',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 16,
    marginBottom: 4,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: colors.surface2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  checkboxLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
  },
  input: {
    backgroundColor: colors.bg,
    borderWidth: 1,
    borderColor: colors.surface2,
    borderRadius: radius.sm,
    padding: 12,
    color: colors.text,
    fontSize: 15,
  },
  goalsSection: {
    marginTop: 16,
  },
  goalsTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textMuted,
    marginBottom: 12,
  },
  goalTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  goalChip: {
    borderWidth: 1,
    borderColor: colors.surface2,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  goalChipSelected: {
    borderColor: colors.accent,
    backgroundColor: colors.accent,
  },
  goalChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textMuted,
  },
  goalChipTextSelected: {
    color: '#fff',
  },
  noGoalTags: {
    fontSize: 13,
    color: colors.textMuted,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: colors.surface2,
  },
  cancelBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.surface2,
  },
  cancelText: {
    color: colors.textMuted,
    fontWeight: '600',
    fontSize: 15,
  },
  completeBtn: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.success,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  completeBtnText: {
    color: colors.success,
    fontWeight: '600',
    fontSize: 14,
  },
  saveBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: radius.sm,
    backgroundColor: colors.accent,
  },
  saveBtnDisabled: {
    opacity: 0.5,
  },
  saveText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
});
