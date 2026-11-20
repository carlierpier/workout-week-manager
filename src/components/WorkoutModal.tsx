import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
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
  onSave: (name: string, type: WorkoutType, distance?: number, goals?: string[], actualDistance?: number) => void;
  onClose: () => void;
}

export function WorkoutModal({ visible, day, initialName, initialType, initialDistance, initialActualDistance, initialGoals, onSave, onClose }: WorkoutModalProps) {
  const [name, setName] = useState(initialName ?? '');
  const [type, setType] = useState<WorkoutType>(initialType ?? 'strength');
  const [distance, setDistance] = useState(initialDistance != null ? String(initialDistance) : '');
  const [actualDistance, setActualDistance] = useState(initialActualDistance != null ? String(initialActualDistance) : '');
  const [goals, setGoals] = useState<string[]>(initialGoals ?? ['']);
  const isEditing = initialName != null;
  const defaultName = WORKOUT_TYPE_DEFAULT_NAMES[type];

  const updateGoal = (index: number, value: string) => {
    setGoals(prev => prev.map((g, i) => i === index ? value : g));
  };

  const removeGoal = (index: number) => {
    setGoals(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    const finalName = name.trim() || defaultName;
    if (!finalName) return;
    const dist = hasDistance(type) && distance ? parseFloat(distance) : undefined;
    const actDist = hasDistance(type) && actualDistance ? parseFloat(actualDistance) : undefined;
    const parsedGoals = hasGoals(type) ? goals.filter(g => g.trim()).map(g => g.trim()) : undefined;
    onSave(finalName, type, dist, parsedGoals, actDist);
  };
  const canSave = !!(name.trim() || defaultName);

  return (
    <Modal visible={visible} animationType="slide" transparent>
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

          <ScrollView style={styles.body} keyboardShouldPersistTaps="handled">
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

            <Text style={styles.label}>Workout name</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder={defaultName ?? 'e.g. PULL at Work, 5K Run...'}
              placeholderTextColor={colors.textMuted}
              autoFocus
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
                    />
                  </>
                )}
              </>
            )}

            {hasGoals(type) && (
              <View style={styles.goalsSection}>
                <Text style={styles.goalsTitle}>Goals</Text>
                {goals.map((goal, i) => (
                  <View key={i} style={styles.goalRow}>
                    <TextInput
                      style={[styles.input, { flex: 1 }]}
                      value={goal}
                      onChangeText={v => updateGoal(i, v)}
                      placeholder="e.g. Pull-up, Dips..."
                      placeholderTextColor={colors.textMuted}
                    />
                    {goals.length > 1 && (
                      <TouchableOpacity onPress={() => removeGoal(i)} style={styles.removeGoalBtn}>
                        <Ionicons name="trash-outline" size={18} color={colors.danger} />
                      </TouchableOpacity>
                    )}
                  </View>
                ))}
                <TouchableOpacity
                  style={styles.addGoalBtn}
                  onPress={() => setGoals(prev => [...prev, ''])}
                >
                  <Ionicons name="add" size={16} color={colors.textMuted} />
                  <Text style={styles.addGoalText}>Add goal</Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.saveBtn, !canSave && styles.saveBtnDisabled]}
              onPress={handleSubmit}
              disabled={!canSave}
            >
              <Text style={styles.saveText}>{initialName ? 'Save changes' : 'Add workout'}</Text>
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
  goalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  removeGoalBtn: {
    padding: 8,
  },
  addGoalBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: colors.surface2,
    borderRadius: radius.sm,
    marginTop: 4,
  },
  addGoalText: {
    fontSize: 14,
    fontWeight: '600',
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
