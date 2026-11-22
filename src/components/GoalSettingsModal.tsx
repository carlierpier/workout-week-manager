import { useEffect, useState } from 'react';
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
import type { GoalTarget } from '../types';
import { colors, radius } from '../theme';

interface GoalSettingsModalProps {
  visible: boolean;
  goalTargets: GoalTarget[];
  onSave: (goalTargets: GoalTarget[]) => void;
  onClose: () => void;
}

interface EditableGoalTarget {
  name: string;
  target: string;
}

export function GoalSettingsModal({ visible, goalTargets, onSave, onClose }: GoalSettingsModalProps) {
  const [goals, setGoals] = useState<EditableGoalTarget[]>([]);
  const [newName, setNewName] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (visible) {
      setGoals(goalTargets.map(goal => ({ name: goal.name, target: String(goal.target) })));
      setNewName('');
      setError('');
    }
  }, [visible, goalTargets]);

  const updateGoal = (index: number, field: keyof EditableGoalTarget, value: string) => {
    setGoals(previous => previous.map((goal, i) => i === index ? { ...goal, [field]: value } : goal));
    setError('');
  };

  const addGoal = () => {
    const name = newName.trim();
    if (!name) return;
    if (goals.some(goal => goal.name.trim().toLocaleLowerCase() === name.toLocaleLowerCase())) {
      setError('Each goal tag must have a unique name.');
      return;
    }
    setGoals(previous => [...previous, { name, target: '1' }]);
    setNewName('');
    setError('');
  };

  const handleSave = () => {
    const normalizedNames = goals.map(goal => goal.name.trim().toLocaleLowerCase());
    if (goals.some(goal => !goal.name.trim())) {
      setError('Goal tag names cannot be empty.');
      return;
    }
    if (new Set(normalizedNames).size !== normalizedNames.length) {
      setError('Each goal tag must have a unique name.');
      return;
    }

    const parsedGoals = goals.map(goal => ({
      name: goal.name.trim(),
      target: Number(goal.target),
    }));
    if (parsedGoals.some(goal => !Number.isInteger(goal.target) || goal.target < 1)) {
      setError('Weekly targets must be whole numbers greater than zero.');
      return;
    }

    onSave(parsedGoals);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.modal}>
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Goal tags & weekly targets</Text>
              <Text style={styles.subtitle}>Reusable tags for Strength and Street Workout</Text>
            </View>
            <TouchableOpacity onPress={onClose} hitSlop={8} accessibilityLabel="Close goal settings">
              <Ionicons name="close" size={24} color={colors.textMuted} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.body} keyboardShouldPersistTaps="handled">
            {goals.map((goal, index) => (
              <View key={`${goal.name}-${index}`} style={styles.goalRow}>
                <TextInput
                  style={[styles.input, styles.nameInput]}
                  value={goal.name}
                  onChangeText={value => updateGoal(index, 'name', value)}
                  placeholder="Goal tag"
                  placeholderTextColor={colors.textMuted}
                  accessibilityLabel="Goal tag name"
                />
                <TextInput
                  style={[styles.input, styles.targetInput]}
                  value={goal.target}
                  onChangeText={value => updateGoal(index, 'target', value)}
                  placeholder="Per week"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="number-pad"
                  accessibilityLabel={`Weekly target for ${goal.name || 'goal'}`}
                />
                <TouchableOpacity
                  onPress={() => setGoals(previous => previous.filter((_, i) => i !== index))}
                  style={styles.removeBtn}
                  hitSlop={8}
                  accessibilityLabel={`Remove ${goal.name || 'goal tag'}`}
                >
                  <Ionicons name="trash-outline" size={18} color={colors.danger} />
                </TouchableOpacity>
              </View>
            ))}

            <View style={styles.addRow}>
              <TextInput
                style={[styles.input, styles.nameInput]}
                value={newName}
                onChangeText={value => { setNewName(value); setError(''); }}
                placeholder="New reusable tag"
                placeholderTextColor={colors.textMuted}
                onSubmitEditing={addGoal}
                accessibilityLabel="New goal tag name"
              />
              <TouchableOpacity style={styles.addBtn} onPress={addGoal} accessibilityLabel="Add goal tag">
                <Ionicons name="add" size={20} color={colors.text} />
              </TouchableOpacity>
            </View>

            {goals.length === 0 && (
              <Text style={styles.emptyText}>Add a goal tag to start tracking weekly occurrences.</Text>
            )}
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
              <Text style={styles.saveText}>Save settings</Text>
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
    maxHeight: '85%',
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
  subtitle: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 4,
  },
  body: {
    padding: 20,
    flexShrink: 1,
    minHeight: 0,
  },
  goalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  input: {
    backgroundColor: colors.bg,
    borderWidth: 1,
    borderColor: colors.surface2,
    borderRadius: radius.sm,
    paddingHorizontal: 10,
    paddingVertical: 9,
    color: colors.text,
    fontSize: 14,
  },
  nameInput: {
    flex: 1,
  },
  targetInput: {
    width: 82,
    textAlign: 'center',
  },
  removeBtn: {
    padding: 8,
  },
  addRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  addBtn: {
    width: 40,
    height: 40,
    borderRadius: radius.sm,
    backgroundColor: colors.surface2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: 13,
    marginTop: 16,
  },
  errorText: {
    color: colors.danger,
    fontSize: 13,
    marginTop: 12,
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
  saveText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
});
