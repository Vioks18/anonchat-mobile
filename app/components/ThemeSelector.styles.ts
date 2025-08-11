import { StyleSheet } from 'react-native';

/**
 * Стили для ThemeSelector
 */
export const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  themeModalContent: {
    backgroundColor: '#23234d',
    borderRadius: 16,
    padding: 20,
    width: '80%',
    maxHeight: '70%',
  },
  themeModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
    textAlign: 'center',
    fontFamily: "Poppins-Regular",
  },
  themeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#2a2a5a',
  },
  themeOptionSelected: {
    backgroundColor: '#3a3a6a',
    borderWidth: 2,
    borderColor: '#6c5ce7',
  },
  themeOptionDisabled: {
    opacity: 0.5,
  },
  themePreview: {
    width: 40,
    height: 40,
    borderRadius: 8,
    marginRight: 12,
    overflow: 'hidden',
  },
  themePreviewHeader: {
    height: 8,
    width: '100%',
  },
  themePreviewBubble: {
    flex: 1,
    margin: 4,
    borderRadius: 4,
  },
  themeOptionText: {
    flex: 1,
    fontSize: 16,
    color: '#fff',
    fontFamily: "Poppins-Regular",
  },
});
