import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface DevHUDProps {
  status: {
    scrollToEndWorking: boolean;
    keyboardHeight: number;
    inputFocused: boolean;
    messageCount: number;
    lastScrollY: number;
    scrollStuck: boolean;
    keyboardIssue: boolean;
  };
}

export const DevHUD: React.FC<DevHUDProps> = React.memo(({ status }) => {
  // Безопасная проверка статуса
  const safeStatus = React.useMemo(() => {
    try {
      if (!status) {
        console.warn('DevHUD: Статус отсутствует');
        return {
          scrollToEndWorking: false,
          keyboardHeight: 0,
          inputFocused: false,
          messageCount: 0,
          lastScrollY: 0,
          scrollStuck: false,
          keyboardIssue: false,
        };
      }

      return {
        scrollToEndWorking: Boolean(status.scrollToEndWorking),
        keyboardHeight: Number(status.keyboardHeight) || 0,
        inputFocused: Boolean(status.inputFocused),
        messageCount: Number(status.messageCount) || 0,
        lastScrollY: Number(status.lastScrollY) || 0,
        scrollStuck: Boolean(status.scrollStuck),
        keyboardIssue: Boolean(status.keyboardIssue),
      };
    } catch (error) {
      console.error('DevHUD: Ошибка обработки статуса', error);
      return {
        scrollToEndWorking: false,
        keyboardHeight: 0,
        inputFocused: false,
        messageCount: 0,
        lastScrollY: 0,
        scrollStuck: false,
        keyboardIssue: false,
      };
    }
  }, [status]);

  const hasIssues = React.useMemo(() => {
    try {
      return safeStatus.scrollStuck || safeStatus.keyboardIssue || !safeStatus.scrollToEndWorking;
    } catch (error) {
      console.error('DevHUD: Ошибка определения проблем', error);
      return false;
    }
  }, [safeStatus]);

  try {
    return (
      <View style={[styles.container, hasIssues && styles.containerWarning]}>
        <Text style={[styles.title, hasIssues && styles.titleWarning]}>
          🔍 WatchDog
        </Text>
        
        <View style={styles.row}>
          <Text style={styles.label}>📱 Сообщения:</Text>
          <Text style={styles.value}>{safeStatus.messageCount}</Text>
        </View>
        
        <View style={styles.row}>
          <Text style={styles.label}>⌨️ Клавиатура:</Text>
          <Text style={[styles.value, safeStatus.keyboardIssue && styles.error]}>
            {safeStatus.keyboardHeight}px
          </Text>
        </View>
        
        <View style={styles.row}>
          <Text style={styles.label}>📜 Скролл:</Text>
          <Text style={[styles.value, !safeStatus.scrollToEndWorking && styles.error]}>
            {safeStatus.scrollToEndWorking ? '✅' : '❌'}
          </Text>
        </View>
        
        <View style={styles.row}>
          <Text style={styles.label}>🎯 Фокус:</Text>
          <Text style={styles.value}>
            {safeStatus.inputFocused ? '✅' : '❌'}
          </Text>
        </View>
        
        {hasIssues && (
          <View style={styles.issues}>
            <Text style={styles.issuesTitle}>⚠️ Проблемы:</Text>
            {safeStatus.scrollStuck && <Text style={styles.issue}>• Скролл застрял</Text>}
            {safeStatus.keyboardIssue && <Text style={styles.issue}>• Проблема с клавиатурой</Text>}
            {!safeStatus.scrollToEndWorking && <Text style={styles.issue}>• scrollToEnd не работает</Text>}
          </View>
        )}
      </View>
    );
  } catch (error) {
    console.error('DevHUD: Ошибка рендеринга', error);
    return null;
  }
});

DevHUD.displayName = 'DevHUD';

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.8)',
    borderRadius: 8,
    padding: 8,
    minWidth: 150,
    zIndex: 1000,
  },
  containerWarning: {
    backgroundColor: 'rgba(255,0,0,0.2)',
    borderWidth: 1,
    borderColor: '#ff0000',
  },
  title: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  titleWarning: {
    color: '#ff0000',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 1,
  },
  label: {
    color: '#ccc',
    fontSize: 10,
  },
  value: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  error: {
    color: '#ff0000',
  },
  issues: {
    marginTop: 4,
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  issuesTitle: {
    color: '#ff0000',
    fontSize: 10,
    fontWeight: 'bold',
  },
  issue: {
    color: '#ff6666',
    fontSize: 9,
    marginLeft: 4,
  },
}); 