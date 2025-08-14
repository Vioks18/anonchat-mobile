import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import CustomAlert from './CustomAlert';
import { useToast } from './Toast';

export default function ModalDemo() {
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  
  const toast = useToast();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Демо модальных окон</Text>
      
      <Pressable style={[styles.button, styles.successButton]} onPress={() => setShowSuccess(true)}>
        <Text style={styles.buttonText}>✅ Успех</Text>
      </Pressable>
      
      <Pressable style={[styles.button, styles.errorButton]} onPress={() => setShowError(true)}>
        <Text style={styles.buttonText}>❌ Ошибка</Text>
      </Pressable>
      
      <Pressable style={[styles.button, styles.warningButton]} onPress={() => setShowWarning(true)}>
        <Text style={styles.buttonText}>⚠️ Предупреждение</Text>
      </Pressable>
      
      <Pressable style={[styles.button, styles.infoButton]} onPress={() => setShowInfo(true)}>
        <Text style={styles.buttonText}>ℹ️ Информация</Text>
      </Pressable>
      
      <Pressable style={[styles.button, styles.confirmButton]} onPress={() => setShowConfirm(true)}>
        <Text style={styles.buttonText}>❓ Подтверждение</Text>
      </Pressable>
      
      <Pressable style={[styles.button, styles.toastButton]} onPress={() => toast.show({ message: 'Это toast уведомление!' })}>
        <Text style={styles.buttonText}>🍞 Toast</Text>
      </Pressable>

      {/* Success Modal */}
      <CustomAlert
        visible={showSuccess}
        title="Успешно!"
        message="Операция выполнена успешно. Все данные сохранены."
        type="success"
        confirmText="Отлично"
        onConfirm={() => setShowSuccess(false)}
      />

      {/* Error Modal */}
      <CustomAlert
        visible={showError}
        title="Ошибка"
        message="Произошла ошибка при выполнении операции. Попробуйте еще раз."
        type="error"
        confirmText="Понятно"
        onConfirm={() => setShowError(false)}
      />

      {/* Warning Modal */}
      <CustomAlert
        visible={showWarning}
        title="Внимание"
        message="Это действие нельзя будет отменить. Вы уверены?"
        type="warning"
        confirmText="Продолжить"
        onConfirm={() => setShowWarning(false)}
      />

      {/* Info Modal */}
      <CustomAlert
        visible={showInfo}
        title="Информация"
        message="Это информационное сообщение с полезными сведениями."
        type="info"
        confirmText="Понятно"
        onConfirm={() => setShowInfo(false)}
      />

      {/* Confirm Modal */}
      <CustomAlert
        visible={showConfirm}
        title="Подтверждение"
        message="Вы действительно хотите удалить этот элемент?"
        type="warning"
        confirmText="Удалить"
        cancelText="Отмена"
        showCancel={true}
        onConfirm={() => {
          setShowConfirm(false);
          toast.show({ message: 'Элемент удален!' });
        }}
        onCancel={() => setShowConfirm(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#0b0d10',
    gap: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#e7e9ee',
    marginBottom: 32,
    textAlign: 'center',
  },
  button: {
    width: '100%',
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  successButton: {
    backgroundColor: '#22C55E',
  },
  errorButton: {
    backgroundColor: '#EF4444',
  },
  warningButton: {
    backgroundColor: '#F59E0B',
  },
  infoButton: {
    backgroundColor: '#3B82F6',
  },
  confirmButton: {
    backgroundColor: '#8B5CF6',
  },
  toastButton: {
    backgroundColor: '#10B981',
  },
});
