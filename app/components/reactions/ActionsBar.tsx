import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Message } from '../../types/message';

export type ActionItem = {
  key: 'reply' | 'copy' | 'delete' | 'share' | 'pin';
  icon: React.ReactNode;
  onPress: () => void;
  visible?: boolean;
};

export type GetActions = (message: Message) => ActionItem[];

interface ActionsBarProps {
  message: Message;
  getActions?: GetActions;
  currentThemeData?: any;
  visible?: boolean;
}

const ActionsBar: React.FC<ActionsBarProps> = ({
  message,
  getActions,
  currentThemeData,
  visible = false,
}) => {
  // Если getActions не передан или visible = false, не рендерим
  if (!getActions || !visible) {
    return null;
  }

  const actions = getActions(message).filter(action => action.visible !== false);

  if (actions.length === 0) {
    return null;
  }

  return (
    <View style={[
      styles.container,
      {
        backgroundColor: currentThemeData?.inputBg 
          ? `${currentThemeData.inputBg}CC`
          : 'rgba(35, 35, 60, 0.95)',
        borderColor: currentThemeData?.border || 'rgba(255, 255, 255, 0.12)',
      }
    ]}>
      <View style={styles.actionsContainer}>
        {actions.map((action) => (
          <View key={action.key} style={styles.actionItem}>
            {/* Заглушка для иконки */}
            <View style={styles.actionIcon} />
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    borderRadius: 12,
    borderWidth: 1,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
    minHeight: 48, // Высота для ActionsBar
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  actionItem: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: 40,
    alignItems: 'center',
  },
  actionIcon: {
    width: 20,
    height: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 4,
  },
});

export default ActionsBar;
