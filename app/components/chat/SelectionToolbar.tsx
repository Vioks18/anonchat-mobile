// Extracted verbatim from ChatCore.tsx on 2025-01-16 (lines 409–461)

import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useMessageStore } from '../../hooks/useMessageStore';

interface SelectionToolbarProps {
  selectedMessagesCount: number;
  setSelectedMessageId: (id: string | null) => void;
  setSelectedMessagesCount: (count: number) => void;
  setSelectedMessages: (messages: Set<string>) => void;
  handleReply: () => void;
  handleCopySelected: () => void;
  handleForward: () => void;
  handleDeleteSelected: () => void;
  currentThemeData: any;
}

const SelectionToolbar: React.FC<SelectionToolbarProps> = ({
  selectedMessagesCount,
  setSelectedMessageId,
  setSelectedMessagesCount,
  setSelectedMessages,
  handleReply,
  handleCopySelected,
  handleForward,
  handleDeleteSelected,
  currentThemeData,
}) => {
  return (
    <View style={[styles.header, { backgroundColor: currentThemeData.headerBg }]}>
      <View style={styles.selectionHeader}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => {
            // Очищаем выбор через store
            const clearSelection = useMessageStore.getState().clearSelection;
            clearSelection();
            setSelectedMessageId(null);
            setSelectedMessagesCount(0);
            setSelectedMessages(new Set());
          }}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={20} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.selectionCount}>{selectedMessagesCount} выбрано</Text>
      </View>
      <View style={styles.headerActions}>
        {selectedMessagesCount === 1 && (
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={handleReply}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-undo" size={18} color="#fff" />
          </TouchableOpacity>
        )}
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={handleCopySelected}
          activeOpacity={0.7}
        >
          <Ionicons name="copy" size={18} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={handleForward}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-forward" size={18} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={handleDeleteSelected}
          activeOpacity={0.7}
        >
          <Ionicons name="trash" size={18} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    height: 56,
    backgroundColor: "#23234d",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    borderBottomWidth: 0,
    shadowColor: "#6c5ce7",
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 8,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  selectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  selectionCount: {
    fontSize: 18,
    color: "#fff",
    fontWeight: "600",
  },
});

export default SelectionToolbar;