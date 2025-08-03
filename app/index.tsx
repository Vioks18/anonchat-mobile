import React, { useRef, useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface Message {
  id: string;
  text: string;
  sender: "me" | "other";
}

export default function Index() {
  const [messages, setMessages] = useState<Message[]>([
    { id: "1", text: "Привет!", sender: "other" },
    { id: "2", text: "Привет! Как дела?", sender: "me" },
  ]);
  const [input, setInput] = useState("");
  const flatListRef = useRef<FlatList>(null);
  const insets = useSafeAreaInsets();

  const sendMessage = () => {
    if (input.trim() === "") return;
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        text: input,
        sender: "me",
      },
    ]);
    setInput("");
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const renderItem = ({ item }: { item: Message }) => (
    <View
      style={[
        styles.bubble,
        item.sender === "me" ? styles.bubbleMe : styles.bubbleOther,
      ]}
    >
      <Text style={styles.bubbleText}>{item.text}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerText}>AnonChat</Text>
      </View>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "android" ? 56 : 0} // 56 = header height
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messagesContainer}
          style={styles.flex}
          keyboardShouldPersistTaps="handled"
        />
        <View style={[styles.inputContainer, { paddingBottom: insets.bottom }]}>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder="Введите сообщение..."
            onSubmitEditing={sendMessage}
            returnKeyType="send"
          />
          <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
            <Text style={styles.sendIcon}>✉️</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  flex: {
    flex: 1,
  },
  header: {
    height: 56,
    backgroundColor: "#eee",
    justifyContent: "center",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  headerText: {
    fontSize: 20,
    fontWeight: "bold",
  },
  messagesContainer: {
    flexGrow: 1,
    padding: 12,
    justifyContent: "flex-end",
  },
  bubble: {
    maxWidth: "75%",
    padding: 10,
    borderRadius: 16,
    marginVertical: 4,
  },
  bubbleMe: {
    backgroundColor: "#d1f5d3",
    alignSelf: "flex-end",
  },
  bubbleOther: {
    backgroundColor: "#f0f0f0",
    alignSelf: "flex-start",
  },
  bubbleText: {
    fontSize: 16,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    borderTopWidth: 1,
    borderTopColor: "#ddd",
    backgroundColor: "#fff",
  },
  input: {
    flex: 1,
    fontSize: 16,
    padding: 8,
    backgroundColor: "#f7f7f7",
    borderRadius: 20,
    marginRight: 8,
  },
  sendButton: {
    padding: 8,
  },
  sendIcon: {
    fontSize: 22,
  },
});