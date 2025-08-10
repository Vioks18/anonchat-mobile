import React, { useState } from 'react';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { THEMES } from '../constants/themes';
import { useMessageStore } from '../hooks/useMessageStore';
import ChatListWithReactions from './ChatListWithReactions';

interface ChatWithReactionsProps {
  onSendMessage?: (text: string) => void;
  onError?: (error: Error) => void;
  isBotEnabled?: boolean;
  onToggleBot?: () => void;
}

const ChatWithReactions: React.FC<ChatWithReactionsProps> = ({
  onSendMessage,
  onError,
  isBotEnabled = false,
  onToggleBot
}) => {
  const messages = useMessageStore((s) => s.messages);
  const addMessage = useMessageStore((s) => s.addMessage);
  const currentTheme = useMessageStore((s: any) => s.currentTheme || 'dark') as keyof typeof THEMES;
  const [inputText, setInputText] = useState('');

  const handleSendMessage = (text: string) => {
    if (text.trim()) {
      addMessage(text.trim());
      setInputText('');
      onSendMessage?.(text.trim());
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: THEMES[currentTheme].bg }]}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerText}>
            <Text style={styles.title}>AnonChat</Text>
            <Text style={styles.subtitle}>Анонимный чат</Text>
          </View>
          <TouchableOpacity 
            style={styles.botButton}
            onPress={onToggleBot}
          >
            <Text style={styles.botButtonText}>
              {isBotEnabled ? 'Бот ВКЛ' : 'Бот ВЫКЛ'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.chatContainer}>
        <ChatListWithReactions 
          messages={messages}
          onScrollBeginDrag={() => {
            // Закрытие панели реакций при скролле
          }}
        />
      </View>
      
             {/* Строка ввода обрабатывается в ChatCore */}
     </SafeAreaView>
   );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    height: 60,
    backgroundColor: '#23234d',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  subtitle: {
    fontSize: 12,
    color: '#aaa',
  },
  botButton: {
    backgroundColor: '#6c5ce7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  botButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  chatContainer: {
    flex: 1,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#23234d',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: '#181825',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: '#fff',
    marginRight: 8,
    fontSize: 16,
  },
  sendButton: {
    backgroundColor: '#6c5ce7',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default ChatWithReactions;
