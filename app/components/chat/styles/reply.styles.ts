import { StyleSheet } from 'react-native';

export const replyStyles = StyleSheet.create({
  replyPreviewContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  replyPreviewContent: {
    flex: 1,
    marginRight: 8,
  },
  replyPreviewLabel: {
    fontSize: 12,
    color: '#aaa',
    marginBottom: 2,
    fontFamily: 'Poppins-Regular',
  },
  replyPreviewText: {
    fontSize: 14,
    color: '#fff',
    fontFamily: 'Poppins-Regular',
  },
  replyPreviewClose: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
