import useColorPalette from '@/hooks/useColorPalette';
import { Colors } from '@/theme/theme';
import React, { useEffect, useRef, useState } from 'react';
import {
    Animated,
    Keyboard,
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    TouchableWithoutFeedback,
    View,
} from 'react-native';

type InputModalProps = {
  visible: boolean;
  title: string;
  placeholder?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: (value: string) => void;
  onCancel: () => void;
};

export default function InputModal({
  visible,
  title,
  placeholder = 'Enter value...',
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
}: InputModalProps) {
  const colors = useColorPalette();
  const [value, setValue] = useState('');
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const styles = getStyles(colors);

  useEffect(() => {
    if (visible) {
      setValue('');
      Animated.parallel([
        Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, damping: 18, stiffness: 250 }),
        Animated.timing(opacityAnim, { toValue: 1, duration: 150, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(scaleAnim, { toValue: 0.9, duration: 120, useNativeDriver: true }),
        Animated.timing(opacityAnim, { toValue: 0, duration: 120, useNativeDriver: true }),
      ]).start();
    }
  }, [visible]);

  const handleConfirm = () => {
    if (!value.trim()) return;
    onConfirm(value.trim());
    setValue('');
  };


  const [focused, setFocused] = useState(false);

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onCancel}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <TouchableWithoutFeedback onPress={() => { Keyboard.dismiss(); onCancel(); }}>
          <Animated.View style={[styles.overlay, { opacity: opacityAnim }]}>
            <TouchableWithoutFeedback onPress={e => e.stopPropagation()}>
              <Animated.View style={[styles.card, { transform: [{ scale: scaleAnim }] }]}>
                <Text style={styles.title}>{title}</Text>
                <TextInput
                  style={[styles.input, focused && styles.inputFocused]}
                  placeholder={placeholder}
                  placeholderTextColor={colors.textDisabled}
                  value={value}
                  onChangeText={setValue}
                  onFocus={() => setFocused(true)}
                  onBlur={() => setFocused(false)}
                  autoFocus
                  returnKeyType="done"
                  onSubmitEditing={handleConfirm}
                />
                <View style={styles.actions}>
                  <Pressable style={styles.cancelBtn} onPress={onCancel}>
                    <Text style={styles.cancelText}>{cancelLabel}</Text>
                  </Pressable>
                  <Pressable
                    style={[styles.confirmBtn, !value.trim() && styles.confirmBtnDisabled]}
                    onPress={handleConfirm}
                    disabled={!value.trim()}
                  >
                    <Text style={styles.confirmText}>{confirmLabel}</Text>
                  </Pressable>
                </View>
              </Animated.View>
            </TouchableWithoutFeedback>
          </Animated.View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const getStyles = (colors: Colors) => StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    card: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 24,
      width: '85%',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.2,
      shadowRadius: 16,
      elevation: 10,
    },
    title: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.textPrimary,
      marginBottom: 16,
    },
    input: {
      borderWidth: 1.5,
      borderColor: colors.border,
      borderRadius: 10,
      paddingHorizontal: 14,
      paddingVertical: 12,
      fontSize: 15,
      color: colors.textPrimary,
      backgroundColor: colors.background,
      marginBottom: 20,
    },
    inputFocused: {
      borderColor: colors.primary,
    },
    actions: {
      flexDirection: 'row',
      gap: 10,
    },
    cancelBtn: {
      flex: 1,
      paddingVertical: 12,
      borderRadius: 10,
      borderWidth: 1.5,
      borderColor: colors.border,
      alignItems: 'center',
    },
    cancelText: {
      color: colors.textSecondary,
      fontWeight: '600',
      fontSize: 15,
    },
    confirmBtn: {
      flex: 1,
      paddingVertical: 12,
      borderRadius: 10,
      backgroundColor: colors.primary,
      alignItems: 'center',
    },
    confirmBtnDisabled: {
      backgroundColor: colors.primaryLight,
      opacity: 0.5,
    },
    confirmText: {
      color: colors.textOnPrimary,
      fontWeight: '600',
      fontSize: 15,
    },
  });