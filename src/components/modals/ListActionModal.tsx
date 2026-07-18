import React from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, StyleSheet } from 'react-native';
import { useColors } from '@/hooks/useColors';

export type ListActionModalMode = 'create' | 'rename' | 'delete' | null;

interface ListActionModalProps {
  visible: boolean;
  mode: ListActionModalMode;
  targetName?: string;
  inputValue: string;
  onInputChange: (text: string) => void;
  onClose: () => void;
  onSubmit: () => void;
  onDelete: () => void;
}

export function ListActionModal({
  visible,
  mode,
  targetName,
  inputValue,
  onInputChange,
  onClose,
  onSubmit,
  onDelete,
}: ListActionModalProps) {
  const { colors } = useColors();

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback>
            <View style={[styles.modalCard, { backgroundColor: colors.card }]}>
              {mode === 'delete' ? (
                <>
                  <Text style={[styles.modalTitle, { color: colors.text }]}>
                    Tem certeza que deseja excluir a lista "{targetName}"?
                  </Text>
                  <View style={styles.modalActions}>
                    <TouchableOpacity style={[styles.modalBtn, { borderColor: colors.border }]} onPress={onClose}>
                      <Text style={{ color: colors.sub }}>Cancelar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.modalBtn, { backgroundColor: colors.danger, borderColor: colors.danger }]} onPress={onDelete}>
                      <Text style={{ color: '#fff', fontWeight: '600' }}>Excluir</Text>
                    </TouchableOpacity>
                  </View>
                </>
              ) : (
                <>
                  <Text style={[styles.modalTitle, { color: colors.text }]}>
                    {mode === 'create' ? 'Nova lista' : 'Renomear lista'}
                  </Text>
                  <TextInput
                    style={[styles.modalInput, { color: colors.text, borderColor: colors.border, backgroundColor: colors.bg }]}
                    placeholder={mode === 'create' ? 'Nome da lista' : targetName}
                    placeholderTextColor={colors.sub}
                    value={inputValue}
                    onChangeText={onInputChange}
                    autoFocus
                    onSubmitEditing={onSubmit}
                    returnKeyType="done"
                  />
                  <View style={styles.modalActions}>
                    <TouchableOpacity style={[styles.modalBtn, { borderColor: colors.border }]} onPress={onClose}>
                      <Text style={{ color: colors.sub }}>Cancelar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.modalBtn, { backgroundColor: colors.accent, borderColor: colors.accent }]} onPress={onSubmit}>
                      <Text style={{ color: '#fff', fontWeight: '600' }}>{mode === 'create' ? 'Criar' : 'Salvar'}</Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: { 
    flex: 1, 
    backgroundColor: 'rgba(0,0,0,0.4)', 
    justifyContent: 'center', 
    padding: 32 
  },
  modalCard: { 
    borderRadius: 16, 
    padding: 20, 
    gap: 16 
  },
  modalTitle: { 
    fontSize: 17, 
    fontWeight: '600' 
  },
  modalInput: { 
    borderWidth: 0.5, 
    borderRadius: 10, 
    paddingHorizontal: 12, 
    paddingVertical: 10, 
    fontSize: 16
  },
  modalActions: { 
    flexDirection: 'row', 
    gap: 10 
  },
  modalBtn: { 
    flex: 1, 
    borderWidth: 0.5, 
    borderRadius: 10, 
    paddingVertical: 11, 
    alignItems: 'center' 
  },
});
