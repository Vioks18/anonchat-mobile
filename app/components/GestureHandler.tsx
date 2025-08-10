import React, { useCallback, useState } from 'react';
import { View } from 'react-native';

interface GestureHandlerProps {
  children: React.ReactNode;
  onSingleSelect?: (id: string) => void;
  onMultiSelect?: (ids: string[]) => void;
  onReactionOpen?: (id: string) => void;
}

const GestureHandler: React.FC<GestureHandlerProps> = ({
  children,
  onSingleSelect,
  onMultiSelect,
  onReactionOpen,
}) => {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const handleLongPress = useCallback((id: string) => {
    // Если уже есть выбранные, добавляем к ним
    if (selectedIds.size > 0) {
      const newSelected = new Set(selectedIds);
      if (newSelected.has(id)) {
        newSelected.delete(id);
      } else {
        newSelected.add(id);
      }
      setSelectedIds(newSelected);
      
      if (newSelected.size > 1) {
        onMultiSelect?.(Array.from(newSelected));
      } else if (newSelected.size === 1) {
        const singleId = Array.from(newSelected)[0];
        onSingleSelect?.(singleId);
      }
    } else {
      // Обычное удержание - открываем реакции
      onReactionOpen?.(id);
    }
  }, [selectedIds, onSingleSelect, onMultiSelect, onReactionOpen]);

  const handlePress = useCallback((id: string) => {
    // Если есть выбранные, добавляем/убираем из выбора
    if (selectedIds.size > 0) {
      const newSelected = new Set(selectedIds);
      if (newSelected.has(id)) {
        newSelected.delete(id);
      } else {
        newSelected.add(id);
      }
      setSelectedIds(newSelected);
      
      if (newSelected.size > 1) {
        onMultiSelect?.(Array.from(newSelected));
      } else if (newSelected.size === 1) {
        const singleId = Array.from(newSelected)[0];
        onSingleSelect?.(singleId);
      }
    } else {
      // Обычный тап - выделяем одно сообщение
      onSingleSelect?.(id);
    }
  }, [selectedIds, onSingleSelect, onMultiSelect]);

  return (
    <View style={{ flex: 1 }}>
      {children}
    </View>
  );
};

export default GestureHandler;
