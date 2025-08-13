import { StyleSheet } from 'react-native';
import { headerStyles } from './styles/header.styles';
import { inputStyles } from './styles/input.styles';
import { menuStyles } from './styles/menu.styles';
import { messagesStyles } from './styles/messages.styles';
import { replyStyles } from './styles/reply.styles';
import { themeStyles } from './styles/theme.styles';

// Изолированные стили - не зависят от внешних тем
export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#181825',
  },
  flex: {
    flex: 1,
  },
  ...headerStyles,
  ...menuStyles,
  ...messagesStyles,
  ...inputStyles,
  ...themeStyles,
  ...replyStyles,
});
