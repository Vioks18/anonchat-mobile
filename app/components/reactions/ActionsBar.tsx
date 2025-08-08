import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

export type ActionItem = {
  key: 'reply' | 'copy' | 'delete' | 'share' | 'pin';
  icon: React.ReactNode;
  onPress: () => void;
  visible?: boolean;
};

interface ActionsBarProps {
  actions: ActionItem[];
  themedStyles: any;
}

const ActionsBar: React.FC<ActionsBarProps> = ({ actions, themedStyles }) => {
  const visibleActions = Array.isArray(actions)
    ? actions.filter((a) => a && a.visible !== false)
    : [];

  if (visibleActions.length === 0) return null;

  return (
    <View
      pointerEvents="auto"
      style={[
        styles.container,
        {
          backgroundColor: themedStyles.inputBg + 'CC',
          borderColor: themedStyles.border,
        },
      ]}
    >
      {visibleActions.map((action) => (
        <TouchableOpacity
          key={action.key}
          style={[
            styles.actionButton,
            {
              borderColor: themedStyles.border,
            },
          ]}
          onPress={action.onPress}
          activeOpacity={0.7}
        >
          {action.icon}
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 24,
    paddingHorizontal: 6,
    paddingVertical: 4,
    marginTop: 8,
    borderWidth: 0,
  },
  actionButton: {
    minWidth: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    marginHorizontal: 2,
    borderWidth: 0,
  },
});

export default ActionsBar;
