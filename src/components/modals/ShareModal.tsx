import React from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, StyleSheet } from 'react-native';
import { useColors } from '@/hooks/useColors';

interface ShareModalProps {
  visible: boolean;
  email: string;
  onEmailChange: (text: string) => void;
  onClose: () => void;
  onShare: () => void;
}

export function ShareModal({
  visible,
  email,
  onEmailChange,
  onClose,
  onShare,
}: ShareModalProps) {
  const { colors } = useColors();

  if (!visible) return null;

  return (
    <Modal 
      visible={visible} 
      transparent 
      animationType="fade" 
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback>
            <View style={[styles.modalCard, { backgroundColor: colors.card }]}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                Compartilhar lista
              </Text>
              <TextInput
                placeholder="Email do usuário"
                value={email}
                onChangeText={onEmailChange}
                style={[styles.modalInput, { color: colors.text, borderColor: colors.border, backgroundColor: colors.bg }]}
                placeholderTextColor={colors.sub}
                autoCapitalize="none"
                keyboardType="email-address"
              />
              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={[styles.modalBtn, { borderColor: colors.border }]}
                  onPress={onClose}
                >
                  <Text style={{ color: colors.sub }}>
                    Cancelar
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalBtn, { backgroundColor: colors.accent, borderColor: colors.accent }]}
                  onPress={onShare}
                >
                  <Text style={{ color: '#fff', fontWeight: '600' }}>
                    Compartilhar
                  </Text>
                </TouchableOpacity>
              </View>
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
    padding: 32,
  },
  modalCard: {
    borderRadius: 16,
    padding: 20,
    gap: 16,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '600',
  },
  modalInput: {
    borderWidth: 0.5,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 10,
  },
  modalBtn: {
    flex: 1,
    borderWidth: 0.5,
    borderRadius: 10,
    paddingVertical: 11,
    alignItems: 'center',
  },
});
