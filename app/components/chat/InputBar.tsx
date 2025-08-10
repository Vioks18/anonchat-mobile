// Extracted verbatim from ChatCore.tsx on 2025-08-11 (lines 687-735)
import { Ionicons } from '@expo/vector-icons';
import React, { useRef } from 'react';
import {
    Animated,
    StyleSheet,
    TextInput,
    TouchableOpacity,
} from 'react-native';

interface InputBarProps {
  inputText: string;
  setInputText: (text: string) => void;
  handleSendMessage: () => void;
  keyboardHeight: number;
  currentThemeData: any;
  setInputFocused: (focused: boolean) => void;
}

const InputBar: React.FC<InputBarProps> = ({
  inputText,
  setInputText,
  handleSendMessage,
  keyboardHeight,
  currentThemeData,
  setInputFocused,
}) => {
  const textInputRef = useRef<TextInput>(null);

  return (
    <Animated.View style={[
      styles.inputContainer, 
      { 
        marginBottom: keyboardHeight, // Простое значение без интерполяции
        backgroundColor: currentThemeData.inputBg,
        borderTopColor: currentThemeData.border
      }
    ]}>
      <TextInput
        ref={textInputRef}
        style={[
          styles.textInput,
          { 
            backgroundColor: currentThemeData.inputBg,
            color: currentThemeData.text,
            borderColor: currentThemeData.border
          }
        ]}
        value={inputText}
        onChangeText={setInputText}
        placeholder="Введите сообщение..."
        placeholderTextColor="#aaa"
        onSubmitEditing={handleSendMessage}
        returnKeyType="send"
        multiline={true}
        blurOnSubmit={false}
        keyboardType="default"
        autoCorrect={true}
        autoCapitalize="sentences"
        onFocus={() => setInputFocused(true)}
        onBlur={() => setInputFocused(false)}
        textAlignVertical="top" // Выравнивание текста сверху
      />
      <TouchableOpacity
        style={[
          styles.sendButton, 
          { backgroundColor: currentThemeData.accent },
          !inputText.trim() && styles.sendButtonDisabled
        ]}
        onPress={handleSendMessage}
        disabled={!inputText.trim()}
        activeOpacity={0.7}
      >
        <Ionicons name="send-outline" size={22} color="#fff" />
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    paddingBottom: 8,
    borderTopWidth: 1,
    borderTopColor: "#282850",
    backgroundColor: "rgba(34,30,60,0.98)",
    shadowColor: "#6c5ce7",
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 8,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#23234d",
    borderRadius: 16,
    marginRight: 10,
    color: "#fff",
    borderWidth: 1,
    borderColor: "#444",
    fontFamily: "Poppins-Regular",
    maxHeight: 120, // Ограничиваем высоту чтобы не доходила до верхней панели
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#6c5ce7",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#6c5ce7",
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  sendButtonDisabled: {
    opacity: 0.7,
  },
});

export default InputBar;
