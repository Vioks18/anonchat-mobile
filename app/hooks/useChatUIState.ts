import { useState } from 'react';

/**
 * Хук для состояний UI чата (темы, меню, поиск)
 */
export const useChatUIState = () => {
  // Состояния для тем с защитой
  const [currentTheme, setCurrentTheme] = useState("dark");
  const [showThemeSelector, setShowThemeSelector] = useState(false);
  
  // Состояния для меню
  const [showMenu, setShowMenu] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  return {
    // Темы
    currentTheme,
    setCurrentTheme,
    showThemeSelector,
    setShowThemeSelector,
    
    // Меню
    showMenu,
    setShowMenu,
    isSearching,
    setIsSearching,
    searchQuery,
    setSearchQuery,
  };
};
