import { StyleSheet } from 'react-native';

export const themeStyles = StyleSheet.create({
  themeModal: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2000,
  },
  themeModalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  themeModalContent: {
    backgroundColor: "#23234d",
    borderRadius: 16,
    padding: 20,
    margin: 20,
    maxWidth: 300,
    width: '100%',
  },
  themeModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 20,
  },
  themeOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  themeOptionSelected: {
    backgroundColor: "rgba(255,255,255,0.12)",
    borderWidth: 1,
    borderColor: "#6c5ce7",
  },
  themePreview: {
    width: 40,
    height: 30,
    borderRadius: 6,
    marginRight: 12,
    overflow: 'hidden',
  },
  themePreviewHeader: {
    height: 8,
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
  },
  themePreviewBubble: {
    width: 20,
    height: 12,
    borderRadius: 6,
    marginTop: 4,
    marginLeft: 4,
  },
  themeOptionText: {
    flex: 1,
    fontSize: 16,
    color: "#fff",
    fontFamily: "Poppins-Regular",
  },
});
