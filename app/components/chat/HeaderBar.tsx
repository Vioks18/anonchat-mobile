// Extracted verbatim from ChatCore.tsx on 2025-08-11 (lines 454-552)
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

interface HeaderBarProps {
  isSearching: boolean;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  setIsSearching: (searching: boolean) => void;
  selectedMessageId: string | null;
  handleReply: () => void;
  handleCopy: () => void;
  handleForward: () => void;
  handleDelete: () => void;
  showMenu: boolean;
  setShowMenu: (show: boolean) => void;
  currentThemeData: any;
}

const HeaderBar: React.FC<HeaderBarProps> = ({
  isSearching,
  searchQuery,
  setSearchQuery,
  setIsSearching,
  selectedMessageId,
  handleReply,
  handleCopy,
  handleForward,
  handleDelete,
  showMenu,
  setShowMenu,
  currentThemeData,
}) => {

  return (
    <View style={[styles.header, { backgroundColor: currentThemeData.headerBg }]}>
      {!isSearching ? (
        <>
          <Text style={styles.headerText}>Axora</Text>
          <TouchableOpacity 
            style={styles.menuButton}
            onPress={() => setShowMenu(!showMenu)}
            activeOpacity={0.7}
          >
            <Ionicons name="ellipsis-vertical" size={20} color="#fff" />
          </TouchableOpacity>
        </>
      ) : (
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Поиск сообщений..."
            placeholderTextColor="#888"
            autoFocus
            returnKeyType="search"
          />
          <TouchableOpacity 
            style={styles.searchCloseButton}
            onPress={() => {
              setIsSearching(false);
              setSearchQuery("");
            }}
            activeOpacity={0.7}
          >
            <Ionicons name="close" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      )}
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
  headerText: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    letterSpacing: 2,
    fontFamily: "SpaceMono",
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
  menuButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  searchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 16,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#fff",
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 16,
    marginRight: 8,
  },
  searchCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
});

export default HeaderBar;
