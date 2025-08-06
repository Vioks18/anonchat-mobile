import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { InputValidator } from '../utils/validation';

interface ChatSearchProps {
  isSearching: boolean;
  searchQuery: string;
  onSearchToggle: () => void;
  onSearchClose: () => void;
  onSearchChange: (text: string) => void;
  themedStyles: {
    header: any;
    headerText: any;
    input: any;
  };
}

const ChatSearchInner: React.FC<ChatSearchProps> = React.memo(({
  isSearching,
  searchQuery,
  onSearchToggle,
  onSearchClose,
  onSearchChange,
  themedStyles
}) => {
  const handleSearchToggle = useCallback(() => {
    try {
      onSearchToggle();
    } catch (error) {
      console.error('ChatSearch: Ошибка переключения поиска', error);
    }
  }, [onSearchToggle]);

  const handleSearchClose = useCallback(() => {
    try {
      onSearchClose();
    } catch (error) {
      console.error('ChatSearch: Ошибка закрытия поиска', error);
    }
  }, [onSearchClose]);

  const [searchError, setSearchError] = useState<string | null>(null);

  const handleSearchChange = useCallback((text: string) => {
    try {
      // Валидация поискового запроса
      const validationResult = InputValidator.validateSearchQuery(text);
      
      if (!validationResult.isValid) {
        setSearchError(InputValidator.getUserFriendlyError(validationResult));
        return;
      }

      // Санитизируем текст
      const sanitizedText = InputValidator.sanitizeText(text);
      setSearchError(null);
      onSearchChange(sanitizedText);
    } catch (error) {
      console.error('ChatSearch: Ошибка изменения поиска', error);
      setSearchError('Ошибка обработки поиска');
    }
  }, [onSearchChange]);

  if (!isSearching) {
    return null;
  }

  return (
    <View style={[styles.header, themedStyles.header]}>
              <View style={styles.searchContainer}>
          <TextInput
            style={[styles.searchInput, searchError && styles.searchInputError]}
            value={searchQuery}
            onChangeText={handleSearchChange}
            placeholder="Поиск сообщений..."
            placeholderTextColor="#888"
            autoFocus
            returnKeyType="search"
          />
          <TouchableOpacity
            style={styles.searchCloseButton}
            onPress={handleSearchClose}
            activeOpacity={0.7}
          >
            <Ionicons name="close" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
        {searchError && (
          <Text style={styles.errorText}>{searchError}</Text>
        )}
    </View>
  );
});

ChatSearchInner.displayName = 'ChatSearch';

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowOffset: { width: 0, height: 2 },
    zIndex: 100,
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
  searchInputError: {
    borderColor: '#ff4444',
    borderWidth: 1,
  },
  errorText: {
    color: '#ff4444',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 16,
  },
});

// Экспортируем как default для Expo Router
export default ChatSearchInner;

// Также экспортируем как named export для обратной совместимости
export const ChatSearch = ChatSearchInner;
